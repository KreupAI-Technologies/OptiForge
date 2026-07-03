import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { MilestoneTemplatesService } from '../services/milestone-templates.service';
import { MilestoneTemplateEntity } from '../entities/milestone-template.entity';

@Controller('project-management/milestone-templates')
export class MilestoneTemplatesController {
  constructor(private readonly templatesService: MilestoneTemplatesService) {}

  @Get()
  findAll(@Query('companyId') companyId?: string) {
    return this.templatesService.findAll(companyId || 'default');
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.templatesService.findOne(id);
  }

  @Post()
  create(@Body() body: Partial<MilestoneTemplateEntity>) {
    return this.templatesService.create(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: Partial<MilestoneTemplateEntity>) {
    return this.templatesService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.templatesService.remove(id);
  }
}
