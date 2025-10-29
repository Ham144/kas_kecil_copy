import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { UserModule } from './user/user.module';
import { WarehouseModule } from './warehouse/warehouse.module';

@Module({
  imports: [CommonModule, UserModule, WarehouseModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
