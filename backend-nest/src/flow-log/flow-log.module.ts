import { Module } from '@nestjs/common';
import { FlowLogService } from './flow-log.service';
import { FlowLogController } from './flow-log.controller';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [CommonModule],
  controllers: [FlowLogController],
  providers: [FlowLogService],
})
export class FlowLogModule {}
