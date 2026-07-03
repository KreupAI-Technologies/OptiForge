import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { LaborTrackingService } from '../services/labor-tracking.service';
import { LaborEntryEntity } from '../entities/labor-entry.entity';

@Controller('project-management/labor-tracking')
export class LaborTrackingController {
  constructor(private readonly service: LaborTrackingService) {}

  @Get()
  findAll(@Query('companyId') companyId?: string, @Query('laborCategory') laborCategory?: string) {
    return this.service.findAll(companyId || 'default', laborCategory);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() body: Partial<LaborEntryEntity>) {
    return this.service.create(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: Partial<LaborEntryEntity>) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
