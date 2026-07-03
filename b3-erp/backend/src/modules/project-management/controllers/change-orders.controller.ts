import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ChangeOrdersService } from '../services/change-orders.service';
import { ChangeOrderEntity } from '../entities/change-order.entity';

@Controller('project-management/change-orders')
export class ChangeOrdersController {
  constructor(private readonly service: ChangeOrdersService) {}

  @Get()
  findAll(@Query('companyId') companyId?: string, @Query('status') status?: string) {
    return this.service.findAll(companyId || 'default', status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() body: Partial<ChangeOrderEntity>) {
    return this.service.create(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: Partial<ChangeOrderEntity>) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
