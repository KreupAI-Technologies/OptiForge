import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { PmReportTemplatesService } from '../services/pm-report-templates.service';
import { PmReportTemplateEntity } from '../entities/pm-report-template.entity';

@Controller('project-management/report-templates')
export class PmReportTemplatesController {
  constructor(private readonly service: PmReportTemplatesService) {}

  @Get()
  findAll(@Query('companyId') companyId?: string) {
    return this.service.findAll(companyId || 'default');
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() body: Partial<PmReportTemplateEntity>) {
    return this.service.create(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: Partial<PmReportTemplateEntity>) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
