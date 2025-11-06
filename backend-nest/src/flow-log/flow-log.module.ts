import { Module } from '@nestjs/common';
import { FlowLogService } from './flow-log.service';
import { FlowLogController } from './flow-log.controller';
import { CommonModule } from 'src/common/common.module';
import { GenerateCsvService } from 'src/common/generateCsv.service';
import { RedisService } from 'src/redis/redis.service';

@Module({
  imports: [CommonModule],
  controllers: [FlowLogController],
  providers: [FlowLogService, GenerateCsvService, RedisService],
})
export class FlowLogModule {}
