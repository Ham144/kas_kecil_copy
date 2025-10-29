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

  describe('CREATE WAREHOUSE /api/warehouse/create', () => {
    it('should create new warehouse include user', async () => {
      //create existing user
      await prisma.user.createMany({
        data: [
          {
            username: 'yafizham',
            description: 'yaf',
            isActive: true,
            displayName: 'ham',
          },
          {
            username: 'hoo',
            description: 'ho2',
            isActive: true,
            displayName: 'ho',
          },
        ],
      });

      const response = await request(app.getHttpServer())
        .post('/api/warehouse/create')
        .send({
          name: 'Warehouse mg2',
          members: ['yafizham', 'hoo'],
        });

      const justCreatedWh = await prisma.warehouse.findUnique({
        where: {
          name: 'Warehouse mg2',
        },
        include: {
          members: true,
        },
      });

      expect(response.status).toBe(201);
      expect(response.body).toBeDefined();

      expect(justCreatedWh).toBeDefined();
      expect(justCreatedWh.members.length).toBe(2);
      expect(justCreatedWh.members[0].username).toBe('yafizham');
      expect(justCreatedWh.members[1].username).toBe('hoo');
    });
  });

  describe('UPDATE /api/warehouse/update', () => {
    it('should update new warehouseto change its members', async () => {
      //create existing user
      const oldMember = await prisma.user.create({
        data: {
          username: 'yafizham',
          description: 'yaf',
          isActive: true,
          displayName: 'ham',
          warehouse: {
            create: {
              name: 'Warehouse mg2',
            },
          },
        },
      });

      const newMember = await prisma.user.create({
        data: {
          username: 'newMember',
          description: 'ho2',
          isActive: true,
          displayName: 'ho',
        },
      });

      const response = await request(app.getHttpServer())
        .patch('/api/warehouse/update')
        .send({
          id: oldMember.warehouseId,
          members: ['newMember'],
          name: 'Warehouse mg2',
        });

      const warehouse = await prisma.warehouse.findUnique({
        where: {
          id: oldMember.warehouseId,
        },
        include: {
          members: true,
        },
      });

      expect(response.status).toBe(200);
      expect(warehouse.members.length).toBe(1);
      expect(warehouse.members[0].username).toBe('newMember');
    });
  });
});
