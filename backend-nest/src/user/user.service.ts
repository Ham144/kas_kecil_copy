import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/common/prisma.service';
import { ValidationService } from 'src/common/validation.service';
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
      throw new BadRequestException({
        message: 'credential yang anda masukkan salah',
      });
    }
    if (!userLDAP['physicalDeliveryOfficeName']) {
      throw new BadRequestException({
        message:
          'User terkait tidak memiliki warehouse:physicalDeliveryOfficeName',
      });
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

    if (!access_token || !refresh_token) {
      throw new Error('Failed to generate authentication tokens');
    }

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

      // Cek Redis untuk validasi session
      // Jika Redis error, lanjutkan (fallback untuk development)
      let isJtiFound: string | null = null;
      try {
        isJtiFound = await this.redis.get(oldPayload.jti);
      } catch (redisError) {
        // Fallback: jika Redis tidak tersedia, tetap lanjutkan validasi token
        // Ini untuk development, di production sebaiknya Redis harus tersedia
      }

      // Jika JTI tidak ditemukan di Redis, session mungkin sudah expired/dicabut
      if (isJtiFound === null) {
        throw new UnauthorizedException('Session anda telah dicabut (redis)');
      }

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

      // Update JTI di Redis dengan JTI baru
      // Hapus JTI lama dan set JTI baru
      try {
        await this.redis.del(oldPayload.jti);
        // Set JTI baru dengan TTL 1 minggu (604800 detik)
        await this.redis.set(
          newJti,
          JSON.stringify({
            username: userDB.username,
            refreshedAt: new Date().toISOString(),
          }),
          604800, // 1 minggu
        );
      } catch (redisError) {
        // Jika Redis tidak tersedia, tetap generate token
      }

      return {
        access_token: accessToken,
        refresh_token: refreshToken,
      };
    } catch (err) {
      // Jika sudah UnauthorizedException, throw langsung
      if (err instanceof UnauthorizedException) {
        throw err;
      }
      // Error lainnya
      throw new UnauthorizedException('Session Anda telah habis, login ulang');
    }
  }

  async getAllAccount(page: number, searchKey: string) {
    const accounts: LoginResponseDto[] = await this.prismaService.user.findMany(
      {
        where: {
          username: {
            contains: searchKey,
          },
        },
        include: {
          warehouse: true,
        },
        skip: (page - 1) * 10,
        take: 10,
      },
    );

    return accounts;
  }

  async updateAccount(body: LoginResponseDto) {
    return this.prismaService.user.update({
      where: {
        username: body.username,
      },
      data: {
        displayName: body.displayName,
        isActive: body.isActive,
      },
    });
  }

  async getUserInfo(req: any) {
    //ubah payload sedikit agar bisa langsung dipakai
    const myWarehouse = await this.prismaService.warehouse.findUnique({
      where: { id: req.user.warehouseId },
    });
    req.user.warehouse = myWarehouse?.name || null;
    delete req.user.jti;
    return req.user;
  }

  async logout(access_token: string, req: any) {
    if (!access_token) {
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
        return null;
      }
      return jwt.sign(payload, secret, { expiresIn });
    } catch (error) {
      return null;
    }
  }
}
