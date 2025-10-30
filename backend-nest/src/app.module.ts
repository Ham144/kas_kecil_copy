import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { UserModule } from './user/user.module';
import { WarehouseModule } from './warehouse/warehouse.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [CommonModule, UserModule, WarehouseModule, RedisModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
