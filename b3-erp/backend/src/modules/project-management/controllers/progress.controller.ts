import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ProgressService } from '../services/progress.service';
import { ProgressEntryEntity } from '../entities/progress-entry.entity';

@Controller('project-management/progress')
export class ProgressController {
  constructor(private readonly service: ProgressService) {}

  @Get()
  findAll(@Query('companyId') companyId?: string, @Query('status') status?: string) {
    return this.service.findAll(companyId || 'default', status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() body: Partial<ProgressEntryEntity>) {
    return this.service.create(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: Partial<ProgressEntryEntity>) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
