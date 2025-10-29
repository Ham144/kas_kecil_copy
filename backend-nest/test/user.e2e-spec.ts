import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from 'src/common/prisma.service';

describe('user spec test', () => {
  let app: INestApplication;
  let logger: Logger;
  let prisma: PrismaService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    logger = app.get(WINSTON_MODULE_PROVIDER);
    prisma = app.get(PrismaService);
    await prisma.user.deleteMany();
  });

  afterEach(async () => {
    await prisma.user.deleteMany();
    await prisma.warehouse.deleteMany();
  });

  describe('LOGIN /api/user/login/ldap', () => {
    it('should create new user and new warehouse', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/user/login/ldap')
        .send({
          username: 'yafizham',
          password: 'Catur2025!',
        });
      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(response.body.refresh_token).toBeDefined();
      expect(response.body.access_token).toBeDefined();
    });

    it('should change user.description && user.displayName && user.warehouse because its different', async () => {
      // First, create a user with one description
      await prisma.user.create({
        data: {
          username: 'yafizham',
          description: 'wrong',
          isActive: true,
          displayName: 'ham',
          warehouse: {
            create: {
              name: 'wrong warehouse',
            },
          },
        },
      });

      await request(app.getHttpServer()).post('/api/user/login/ldap').send({
        username: 'yafizham',
        password: 'Catur2025!',
      });

      // Login again to test description update
      const response = await request(app.getHttpServer())
        .post('/api/user/login/ldap')
        .send({
          username: 'yafizham',
          password: 'Catur2025!',
        });
      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();

      expect(response.body.warehouse.name).not.toBe('wrong warehouse');
      expect(response.body.description).not.toBe('wrong');
      expect(response.body.displayName).not.toBe('ham');
    });
  });
});
