import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ProjectTemplatesService } from '../services/project-templates.service';
import { ProjectTemplateEntity } from '../entities/project-template.entity';

@Controller('project-management/templates')
export class ProjectTemplatesController {
  constructor(private readonly templatesService: ProjectTemplatesService) {}

  @Get()
  findAll(@Query('companyId') companyId?: string) {
    return this.templatesService.findAll(companyId || 'default');
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.templatesService.findOne(id);
  }

  @Post()
  create(@Body() body: Partial<ProjectTemplateEntity>) {
    return this.templatesService.create(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: Partial<ProjectTemplateEntity>) {
    return this.templatesService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.templatesService.remove(id);
  }
}
