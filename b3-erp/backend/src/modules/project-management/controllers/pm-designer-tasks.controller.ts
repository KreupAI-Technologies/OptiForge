import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { PmDesignerTasksService } from '../services/pm-designer-tasks.service';
import { PmDesignerTaskEntity } from '../entities/pm-designer-task.entity';

@Controller('project-management/designer-tasks')
export class PmDesignerTasksController {
  constructor(private readonly service: PmDesignerTasksService) {}

  @Get()
  findAll(@Query('companyId') companyId?: string, @Query('status') status?: string) {
    return this.service.findAll(companyId || 'default', status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() body: Partial<PmDesignerTaskEntity>) {
    return this.service.create(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: Partial<PmDesignerTaskEntity>) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
