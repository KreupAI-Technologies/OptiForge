import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { PmMaterialStatusService } from '../services/pm-material-status.service';
import { PmMaterialStatusEntity } from '../entities/pm-material-status.entity';

@Controller('project-management/material-status')
export class PmMaterialStatusController {
  constructor(private readonly service: PmMaterialStatusService) {}

  @Get()
  findAll(@Query('companyId') companyId?: string, @Query('status') status?: string) {
    return this.service.findAll(companyId || 'default', status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() body: Partial<PmMaterialStatusEntity>) {
    return this.service.create(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: Partial<PmMaterialStatusEntity>) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
