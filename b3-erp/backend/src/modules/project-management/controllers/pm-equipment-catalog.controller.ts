import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { PmEquipmentCatalogService } from '../services/pm-equipment-catalog.service';
import { PmEquipmentCatalogEntity } from '../entities/pm-equipment-catalog.entity';

@Controller('project-management/equipment-catalog')
export class PmEquipmentCatalogController {
  constructor(private readonly service: PmEquipmentCatalogService) {}

  @Get()
  findAll(@Query('companyId') companyId?: string, @Query('status') status?: string) {
    return this.service.findAll(companyId || 'default', status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() body: Partial<PmEquipmentCatalogEntity>) {
    return this.service.create(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: Partial<PmEquipmentCatalogEntity>) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
