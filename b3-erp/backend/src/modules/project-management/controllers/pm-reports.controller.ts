import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { PmReportsService } from '../services/pm-reports.service';
import { PmReportEntity } from '../entities/pm-report.entity';

@Controller('project-management/reports')
export class PmReportsController {
  constructor(private readonly service: PmReportsService) {}

  @Get()
  findAll(@Query('companyId') companyId?: string, @Query('status') status?: string) {
    return this.service.findAll(companyId || 'default', status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() body: Partial<PmReportEntity>) {
    return this.service.create(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: Partial<PmReportEntity>) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
