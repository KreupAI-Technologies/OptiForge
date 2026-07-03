import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { PmBoqLineTemplatesService } from '../services/pm-boq-line-templates.service';
import { PmBoqLineTemplateEntity } from '../entities/pm-boq-line-template.entity';

@Controller('project-management/boq-line-templates')
export class PmBoqLineTemplatesController {
  constructor(private readonly service: PmBoqLineTemplatesService) {}

  @Get()
  findAll(@Query('companyId') companyId?: string, @Query('status') status?: string) {
    return this.service.findAll(companyId || 'default', status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() body: Partial<PmBoqLineTemplateEntity>) {
    return this.service.create(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: Partial<PmBoqLineTemplateEntity>) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
