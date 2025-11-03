import { Module } from '@nestjs/common';
import { FlowLogCategoryService } from './flow-log-category.service';
import { FlowLogCategoryController } from './flow-log-category.controller';

@Module({
  controllers: [FlowLogCategoryController],
  providers: [FlowLogCategoryService],
})
export class FlowLogCategoryModule {}
