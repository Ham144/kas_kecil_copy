import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { FlowLogService } from './flow-log.service';
import { FlowLogCreateDto } from 'src/models/flow-log.model';
import { Auth } from 'src/common/auth.decorator';

@Controller('/api/flow-log')
export class FlowLogController {
  constructor(private readonly flowLogService: FlowLogService) {}

  @Post()
  create(@Body() createFlowLogDto: FlowLogCreateDto, @Auth() userInfo: any) {
    return this.flowLogService.createExpense(createFlowLogDto, userInfo);
  }

  @Get()
  findAll() {
    return this.flowLogService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.flowLogService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.flowLogService.remove(+id);
  }
}
