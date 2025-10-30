import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from 'src/common/prisma.service';
import { ValidationService } from 'src/common/validation.service';
import { Logger } from 'winston';
import { LoginRequestLdapDto, LoginResponseDto } from 'src/models/user.model';
import { UserValidation } from './user.validation';
import * as LdapClient from 'ldapjs-client';
import { ErrorResponse } from 'src/models/error.model';
import * as jwt from 'jsonwebtoken';
import { TokenPayload } from 'src/models/tokenPayload.model';
import { RedisService } from 'src/redis/redis.service';
import { randomUUID } from 'crypto';

@Injectable()
export class UserService {
  constructor(
    private validationService: ValidationService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService,
    private redis: RedisService,
  ) {}

  async loginUser(
    body: LoginRequestLdapDto,
    req: any,
  ): Promise<LoginResponseDto | ErrorResponse> {
    this.validationService.validate(UserValidation.LOGIN, body);

    const globalSetting = await this.prismaService.globalsetting.findFirst({
      where: { inUse: true },
    });

    // Cek apakah globalSetting ada
    if (!globalSetting) {
      return {
        statusCode: 500,
        message:
          'Global setting tidak ditemukan. Silakan setup konfigurasi LDAP terlebih dahulu.',
        error: 'GLOBAL_SETTING_NOT_FOUND',
      };
    }

    //LDAP/ AD
    const client = new LdapClient({
      url: `ldap://${globalSetting.AD_HOST}:${globalSetting.AD_PORT}`,
    });

    const bindDn = `${globalSetting.AD_DOMAIN}\\${body.username}`;
    // const baseDN = "dc=catur,dc=co,dc=id";
    const baseDN = globalSetting.AD_BASE_DN;

    let userLDAP: any;
    try {
      // Langkah 1: Bind dulu
      await client.bind(bindDn, body.password);
      // Langkah 2: Search
      const result = await client.search(baseDN, {
        scope: 'sub',
        filter: `(sAMAccountName=${body.username})`, // ganti dengan user yang kamu tahu
        attributes: [
          'description',
          'displayName',
          'mail',
          'telephoneNumber',
          'physicalDeliveryOfficeName',
        ],
        // attributes: ['*'],
      });
      userLDAP = result[0];
    } catch (error) {
      return {
        statusCode: 400,
        message: 'error saat bind LDAP',
        error: error.message,
      };
    }

    if (
      !userLDAP.description.startsWith('SALES') &&
      userLDAP.description !== 'OVERDUE' &&
      userLDAP.description !== 'IT' &&
      userLDAP.description !== 'PROCUREMENT'
    ) {
      return {
        statusCode: 400,
        message: 'User tidak diizinkan, description belum didaftarkan',
      };
    }
    let user = await this.prismaService.user.findFirst({
      where: {
        username: body.username,
      },
      include: {
        warehouse: true, //populate
      },
    });

    //jika user sebelumnya memiliki description yg berbeda dengan ldap :ganti
    if (user) {
      //bagian pemeriksaan field yg berubah
      let warehouseId = user.warehouseId;

      if (
        String(userLDAP['physicalDeliveryOfficeName']).toUpperCase() !==
        user.warehouse.name
      ) {
        //rumah baru - upsert warehouse dulu
        const newWarehouse = await this.prismaService.warehouse.upsert({
          where: {
            name: String(userLDAP['physicalDeliveryOfficeName']).toUpperCase(),
          },
          update: {},
          create: {
            name: String(userLDAP['physicalDeliveryOfficeName']).toUpperCase(),
          },
        });

        warehouseId = newWarehouse.id;
      }

      user = await this.prismaService.user.update({
        where: {
          username: body.username,
        },
        data: {
          description: userLDAP['description'],
          displayName: userLDAP['displayName'],
          warehouseId: warehouseId,
        },
        include: {
          warehouse: true,
        },
      });
    } else {
      const transactionResult = await this.prismaService.$transaction(
        async (tx) => {
          const warehouse = await tx.warehouse.upsert({
            where: { name: userLDAP['physicalDeliveryOfficeName'] },
            update: {},
            create: {
              name: String(
                userLDAP['physicalDeliveryOfficeName'],
              ).toUpperCase(),
            },
          });

          const createdUser = await tx.user.upsert({
            where: { username: body.username },
            update: {},
            create: {
              username: body.username,
              description: userLDAP['description'],
              warehouseId: warehouse.id,
              displayName:
                userLDAP['displayName'] || userLDAP['name'] || body.username,
            },
            include: {
              warehouse: true,
            },
          });

          return createdUser;
        },
      );
      //tambah kan user baru itu sbg first member
      await this.prismaService.warehouse.update({
        where: { id: transactionResult.warehouseId },
        data: {
          members: {
            connect: {
              username: transactionResult.username,
            },
          },
        },
        include: { members: true },
      });
      user = transactionResult;
    }

    const payload: TokenPayload = {
      username: user.username,
      description: user.description,
      warehouseId: user.warehouseId,
      jti: randomUUID(),
    };

    // Generate JWT tokens using reusable method
    const access_token = this.generateToken(payload, 'access');
    const refresh_token = this.generateToken(payload, 'refresh');

    //simpan refresh_token ke redis
    await this.redis.set(
      payload.jti,
      JSON.stringify({
        username: payload.username,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
      }),
      604800, // 1 minggu
    );

    return {
      username: user.username,
      displayName: user.displayName,
      description: user.description,
      warehouse: user.warehouse,
      two_faIsVerified: user.two_faIsVerified,
      refresh_token: refresh_token,
      access_token: access_token,
    };
  }

  async refreshToken(refresh_token: string) {
    if (!refresh_token) throw new UnauthorizedException('No refresh token');

    try {
      const oldPayload: TokenPayload = await jwt.verify(
        refresh_token,
        process.env.JWT_SECRET_REFRESH,
      );

      const isJtiFound = await this.redis.get(oldPayload.jti);

      console.log('jti found? ', isJtiFound);

      if (!isJtiFound)
        throw new UnauthorizedException('Session anda telah dicabut (redis)');

      const userDB = await this.prismaService.user.findFirst({
        where: {
          username: oldPayload.username,
        },
        include: {
          warehouse: true,
        },
      });

      if (!userDB) throw new UnauthorizedException('Akun anda telah dihapus');

      const newJti = randomUUID();
      const newPayload: TokenPayload = {
        username: userDB.username,
        description: userDB?.description,
        warehouseId: userDB.warehouseId,
        jti: newJti as unknown as string,
      };

      const accessToken = await this.generateToken(newPayload, 'access');
      const refreshToken = await this.generateToken(newPayload, 'refresh'); //perbarui juga refresh Token (metode yang dipakai oleh: Google, AWS Cognito, Auth0, Clerk)

      return {
        access_token: accessToken,
        refresh_token: refreshToken,
      };
    } catch (err) {
      console.log(err);
      throw new UnauthorizedException('Session Anda telah habis, login ulang');
    }
  }

  async logout(access_token: string, req: any) {
    if (!access_token) {
      throw new UnauthorizedException('Error testing');
      console.log('delete refresh_token dan access_token');
    }
    const oldPayload: TokenPayload = await jwt.verify(
      access_token,
      process.env.JWT_SECRET,
    );

    await this.redis.del(oldPayload.jti);
    return {
      message: 'redis jti deleted',
    };
  }
  // Reusable token generator
  private generateToken(
    payload: TokenPayload,
    type: 'access' | 'refresh' = 'access',
  ): string | null {
    try {
      const secret =
        type === 'access'
          ? process.env.JWT_SECRET
          : process.env.JWT_SECRET_REFRESH;
      const expiresIn = type === 'access' ? '10m' : '7d';
      if (!secret) {
        this.logger.error(`JWT secret for ${type} token is not defined!`);
        return null;
      }
      return jwt.sign(payload, secret, { expiresIn });
    } catch (error) {
      this.logger.error(`Error generating ${type} token:`, error);
      return null;
    }
  }
}
