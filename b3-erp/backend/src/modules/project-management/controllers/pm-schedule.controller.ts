import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { PmScheduleService } from '../services/pm-schedule.service';
import { PmScheduleTaskEntity } from '../entities/pm-schedule-task.entity';

@Controller('project-management/schedule')
export class PmScheduleController {
  constructor(private readonly service: PmScheduleService) {}

  @Get()
  findAll(@Query('companyId') companyId?: string, @Query('status') status?: string) {
    return this.service.findAll(companyId || 'default', status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() body: Partial<PmScheduleTaskEntity>) {
    return this.service.create(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: Partial<PmScheduleTaskEntity>) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
