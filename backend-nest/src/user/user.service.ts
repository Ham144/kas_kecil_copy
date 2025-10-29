import { Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from 'src/common/prisma.service';
import { ValidationService } from 'src/common/validation.service';
import { Logger } from 'winston';
import { LoginRequestLdapDto, LoginResponseDto } from 'src/models/user.model';
import { UserValidation } from './user.validation';
import * as LdapClient from 'ldapjs-client';
import { ErrorResponse } from 'src/models/error.model';
import jwt from 'jsonwebtoken';
import { TokenPayload } from 'src/models/tokenPayload.model';

@Injectable()
export class UserService {
  constructor(
    private validationService: ValidationService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService,
  ) {}

  async loginUser(
    body: LoginRequestLdapDto,
  ): Promise<LoginResponseDto | ErrorResponse> {
    this.validationService.validate(UserValidation.LOGIN, body);

    const globalSetting = await this.prismaService.globalsetting.findFirst({
      where: { inUse: true },
    });

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

    // 2FA pending flow: if user has 2FA enabled, do not issue cookies yet
    if (user?.two_faIsVerified) {
      const pendingToken = jwt.sign(
        {
          method: 'ldap',
          twoFA: true,
          stage: 'pending',
        },
        process.env.JWT_SECRET,
        { expiresIn: '5m' },
      );

      return {
        description: userLDAP['description'],
        displayName: userLDAP['displayName'],
        token: pendingToken,
        warehouse: user.warehouse,
        two_faIsVerified: user.two_faIsVerified,
        username: user.username,
      };
    }
    const payload: TokenPayload = {
      username: user.username,
      description: user.description,
      warehouseId: user.warehouseId,
    };

    this.logger.debug(`payload: ${JSON.stringify(payload)}`);

    const generateTokenJWT = async (payload: TokenPayload) => {
      try {
        const token = jwt.sign(payload, process.env.JWT_SECRET, {
          expiresIn: '7d',
        });
        return token;
      } catch (error) {
        return null;
      }
    };

    const access_token = await generateTokenJWT(payload);

    const refresh_token = await generateTokenJWT(payload);

    await this.prismaService.user.update({
      where: {
        username: body.username,
      },
      data: {
        refreshToken: refresh_token,
      },
    });

    return {
      username: user.username,
      displayName: user.displayName,
      description: user.description,
      token: access_token,
      warehouse: user.warehouse,
      two_faIsVerified: user.two_faIsVerified,
      refresh_token: refresh_token,
      access_token: access_token,
    };
  }
}
