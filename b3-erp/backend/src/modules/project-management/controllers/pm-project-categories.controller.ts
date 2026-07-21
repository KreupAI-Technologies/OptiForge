import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { PmProjectCategoriesService } from '../services/pm-project-categories.service';
import { PmProjectCategoryEntity } from '../entities/pm-project-category.entity';

@Controller('project-management/project-categories')
export class PmProjectCategoriesController {
  constructor(private readonly service: PmProjectCategoriesService) {}

  @Get()
  findAll(@Query('companyId') companyId?: string) {
    return this.service.findAll(companyId || 'default');
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() body: Partial<PmProjectCategoryEntity>) {
    return this.service.create(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: Partial<PmProjectCategoryEntity>) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
