import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from 'src/common/prisma.service';
import { FlowLogType } from '@prisma/client';

describe('user spec test', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let access_token: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = app.get(PrismaService);
    //login tiap test
    const res = await request(app.getHttpServer())
      .post('/api/user/login/ldap')
      .send({
        username: 'yafizham',
        password: 'Catur2025!',
      });
    access_token = res.headers['set-cookie'][0].split(';')[0].split('=')[1];

    console.log('Access token:', access_token);
  });

  afterEach(async () => {
    // logout tiap test
    const res = await request(app.getHttpServer()).delete('/api/user/logout');
    expect(res.status).toBe(200);
  });

  describe('CREATE EXPENSE /api/api/flow-log', () => {
    const randomString = Math.random().toString(36).slice(2);
    const numberRand = Math.floor(Math.random() * 1000);

    it('should create new expense', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/flow-log')
        .send({
          title: 'expenxe-' + randomString,
          amount: numberRand,
          note: 'TEst test',
          attachments: [], //todo
          type: FlowLogType.OUT,
          createdByUsername: 'yafizham',
          warehouse: 'aa0a4d4d-078a-4ab3-86e0-3f6aa5778d10',
          category: '578c7665-d433-41cc-adf4-e9264342f22b',
        });

      expect(response.status).toBe(200 | 201);
      const createdExpense = await prisma.flowLog.findUnique({
        where: {
          id: response.body.id,
        },
      });
      expect(createdExpense).toBeDefined();
    });
  });
});
