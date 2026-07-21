import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { PmMrpService } from '../services/pm-mrp.service';
import { PmMrpMaterialEntity } from '../entities/pm-mrp-material.entity';

@Controller('project-management/mrp')
export class PmMrpController {
  constructor(private readonly service: PmMrpService) {}

  @Get()
  findAll(@Query('companyId') companyId?: string, @Query('status') status?: string) {
    return this.service.findAll(companyId || 'default', status);
  }

  // Aggregated MRP report across all materials for a company.
  @Get('report')
  report(@Query('companyId') companyId?: string) {
    return this.service.report(companyId || 'default');
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  // Simple demand forecast derived from an MRP material's history / lead time.
  @Get(':id/forecast')
  forecast(@Param('id') id: string, @Query('periods') periods?: string) {
    return this.service.forecast(id, periods ? parseInt(periods, 10) : 6);
  }

  // Build a PO shell from an MRP material's shortfall (computed, not persisted).
  @Post(':id/generate-po')
  generatePo(@Param('id') id: string, @Body() body?: { supplier?: string; requestedBy?: string }) {
    return this.service.generatePo(id, body || {});
  }

  @Post()
  create(@Body() body: Partial<PmMrpMaterialEntity>) {
    return this.service.create(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: Partial<PmMrpMaterialEntity>) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
