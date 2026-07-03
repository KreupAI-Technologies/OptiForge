import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { MaterialConsumptionService } from '../services/material-consumption.service';
import { MaterialConsumptionEntity } from '../entities/material-consumption.entity';

@Controller('project-management/material-consumption')
export class MaterialConsumptionController {
  constructor(private readonly service: MaterialConsumptionService) {}

  @Get()
  findAll(@Query('companyId') companyId?: string, @Query('status') status?: string) {
    return this.service.findAll(companyId || 'default', status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() body: Partial<MaterialConsumptionEntity>) {
    return this.service.create(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: Partial<MaterialConsumptionEntity>) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
