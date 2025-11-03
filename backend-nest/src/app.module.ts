import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { UserModule } from './user/user.module';
import { WarehouseModule } from './warehouse/warehouse.module';
import { RedisModule } from './redis/redis.module';
import { FlowLogCategoryModule } from './flow-log-category/flow-log-category.module';
import { BudgetModule } from './budget/budget.module';
import { FlowLogModule } from './flow-log/flow-log.module';

@Module({
  imports: [
    CommonModule,
    UserModule,
    WarehouseModule,
    RedisModule,
    FlowLogCategoryModule,
    BudgetModule,
    FlowLogModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
