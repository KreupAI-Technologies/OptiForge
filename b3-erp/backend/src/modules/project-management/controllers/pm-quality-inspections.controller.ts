import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { PmQualityInspectionsService } from '../services/pm-quality-inspections.service';
import { PmQualityInspectionEntity } from '../entities/pm-quality-inspection.entity';

@Controller('project-management/quality-inspection')
export class PmQualityInspectionsController {
  constructor(private readonly service: PmQualityInspectionsService) {}

  @Get()
  findAll(@Query('companyId') companyId?: string, @Query('status') status?: string) {
    return this.service.findAll(companyId || 'default', status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() body: Partial<PmQualityInspectionEntity>) {
    return this.service.create(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: Partial<PmQualityInspectionEntity>) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
