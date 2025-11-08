import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { UserModule } from './user/user.module';
import { WarehouseModule } from './warehouse/warehouse.module';
import { RedisModule } from './redis/redis.module';
import { FlowLogCategoryModule } from './flow-log-category/flow-log-category.module';
import { BudgetModule } from './budget/budget.module';
import { FlowLogModule } from './flow-log/flow-log.module';
import { HttpExceptionFilter } from './common/http-exception-filter';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as path from 'path';

@Module({
  imports: [
    CommonModule,
    UserModule,
    WarehouseModule,
    RedisModule,
    FlowLogCategoryModule,
    BudgetModule,
    FlowLogModule,
    ServeStaticModule.forRoot({
      rootPath: path.join(process.cwd(), 'uploads'), // Konsisten menggunakan process.cwd()
      serveRoot: '/uploads', // prefix URL
      serveStaticOptions: {
        index: false,
      },
    }),
  ],
  controllers: [],
  providers: [HttpExceptionFilter],
})
export class AppModule {}
