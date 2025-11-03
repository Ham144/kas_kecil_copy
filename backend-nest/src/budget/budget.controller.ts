import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { BudgetService } from './budget.service';
import { BudgetCreateDto, BudgetUpdateDto } from 'src/models/budget.model';

@Controller('/api/budget')
export class BudgetController {
  constructor(private readonly budgetService: BudgetService) {}

  @Post()
  createBudget(@Body() body: BudgetCreateDto) {
    return this.budgetService.createBudget(body);
  }

  @Get('/warehouse/:warehouseId')
  getBudgetsByWarehouse(@Param('warehouseId') warehouseId: string) {
    return this.budgetService.getBudgetsByWarehouse(warehouseId);
  }

  @Get(':id')
  getBudget(@Param('id') id: string) {
    return this.budgetService.getBudget(id);
  }

  @Patch(':id')
  updateBudget(@Param('id') id: string, @Body() body: BudgetUpdateDto) {
    return this.budgetService.updateBudget(id, body);
  }

  @Delete(':id')
  deleteBudget(@Param('id') id: string) {
    return this.budgetService.deleteBudget(id);
  }
}

