import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { PmInstallationTrackingService } from '../services/pm-installation-tracking.service';
import { PmInstallationActivityEntity } from '../entities/pm-installation-activity.entity';

@Controller('project-management/installation-tracking')
export class PmInstallationTrackingController {
  constructor(private readonly service: PmInstallationTrackingService) {}

  @Get()
  findAll(@Query('companyId') companyId?: string, @Query('status') status?: string) {
    return this.service.findAll(companyId || 'default', status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() body: Partial<PmInstallationActivityEntity>) {
    return this.service.create(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: Partial<PmInstallationActivityEntity>) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
