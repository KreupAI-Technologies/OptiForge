import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { CommissioningService } from '../services/commissioning.service';
import { CommissioningActivityEntity } from '../entities/commissioning-activity.entity';

@Controller('project-management/commissioning')
export class CommissioningController {
  constructor(private readonly service: CommissioningService) {}

  @Get()
  findAll(@Query('companyId') companyId?: string, @Query('status') status?: string) {
    return this.service.findAll(companyId || 'default', status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() body: Partial<CommissioningActivityEntity>) {
    return this.service.create(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: Partial<CommissioningActivityEntity>) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
