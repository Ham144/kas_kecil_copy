import { Body, Controller, Get, Patch, Post, Query } from '@nestjs/common';
import { WarehouseService } from './warehouse.service';
import { WarehouseCreateDto, WarehouseUpdateDto } from 'src/models/warehouse.model';


@Controller('/api/warehouse')
export class WarehouseController {
  constructor(private readonly warehouseService: WarehouseService) {}

  @Post('/create')
  createWarehouse(@Body() body: WarehouseCreateDto) {
    return this.warehouseService.createWarehouse(body);
  }

  @Get("/list")
  list(@Query('searchKey') searchKey?: string) {
    return this.warehouseService.getWarehouses(searchKey);
  }

  @Patch('/update')
  updateWarehouse(@Body() body: WarehouseUpdateDto) {
    return this.warehouseService.updateWarehouse(body);
  }
  
}
