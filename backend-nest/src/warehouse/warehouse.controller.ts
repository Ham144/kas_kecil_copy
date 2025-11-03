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
import { WarehouseService } from './warehouse.service';
import {
  WarehouseCreateDto,
  WarehouseUpdateDto,
} from 'src/models/warehouse.model';

@Controller('/api/warehouse')
export class WarehouseController {
  constructor(private readonly warehouseService: WarehouseService) {}

  @Post()
  createWarehouse(@Body() body: WarehouseCreateDto) {
    return this.warehouseService.createWarehouse(body);
  }

  @Post('/create')
  createWarehouseLegacy(@Body() body: WarehouseCreateDto) {
    return this.warehouseService.createWarehouse(body);
  }

  @Get()
  list(@Query('searchKey') searchKey?: string) {
    return this.warehouseService.getWarehouses(searchKey);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.warehouseService.getWarehouse(id);
  }

  @Patch(':id')
  updateWarehouse(@Param('id') id: string, @Body() body: WarehouseUpdateDto) {
    return this.warehouseService.updateWarehouse(id, body);
  }

  @Delete(':id')
  deleteWarehouse(@Param('id') id: string) {
    return this.warehouseService.deleteWarehouse(id);
  }
}
