import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { FlowLogCategoryService } from './flow-log-category.service';
import { flowCategoryCreateDto } from 'src/models/flow-category.model';

@Controller('flow-log-category')
export class FlowLogCategoryController {
  constructor(
    private readonly flowLogCategoryService: FlowLogCategoryService,
  ) {}

  @Post()
  create(@Body() createFlowLogCategoryDto: flowCategoryCreateDto) {
    return this.flowLogCategoryService.create(createFlowLogCategoryDto);
  }

  @Get()
  findAll() {
    return this.flowLogCategoryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.flowLogCategoryService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateFlowLogCategoryDto: flowCategoryCreateDto,
  ) {
    return this.flowLogCategoryService.update(id, updateFlowLogCategoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.flowLogCategoryService.remove(id);
  }
}
