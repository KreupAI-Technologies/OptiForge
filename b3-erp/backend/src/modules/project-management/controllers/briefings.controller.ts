import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { BriefingsService } from '../services/briefings.service';
import { LayoutBriefingEntity } from '../entities/layout-briefing.entity';

@Controller('project-management/briefings')
export class BriefingsController {
  constructor(private readonly service: BriefingsService) {}

  @Get()
  findAll(@Query('companyId') companyId?: string, @Query('status') status?: string) {
    return this.service.findAll(companyId || 'default', status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() body: Partial<LayoutBriefingEntity>) {
    return this.service.create(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: Partial<LayoutBriefingEntity>) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
