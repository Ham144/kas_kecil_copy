import { Module } from '@nestjs/common';
import { FlowLogService } from './flow-log.service';
import { FlowLogController } from './flow-log.controller';

@Module({
  controllers: [FlowLogController],
  providers: [FlowLogService],
})
export class FlowLogModule {}
