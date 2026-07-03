import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { PmCharterService } from '../services/pm-charter.service';
import { PmCharterEntity } from '../entities/pm-charter.entity';

@Controller('project-management/charter')
export class PmCharterController {
  constructor(private readonly service: PmCharterService) {}

  @Get()
  findAll(@Query('companyId') companyId?: string, @Query('status') status?: string) {
    return this.service.findAll(companyId || 'default', status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() body: Partial<PmCharterEntity>) {
    return this.service.create(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: Partial<PmCharterEntity>) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
