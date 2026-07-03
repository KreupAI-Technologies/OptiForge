import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { PmResourceUtilizationService } from '../services/pm-resource-utilization.service';
import { PmResourceUtilizationEntity } from '../entities/pm-resource-utilization.entity';

@Controller('project-management/resource-utilization')
export class PmResourceUtilizationController {
  constructor(private readonly service: PmResourceUtilizationService) {}

  @Get()
  findAll(@Query('companyId') companyId?: string, @Query('status') status?: string) {
    return this.service.findAll(companyId || 'default', status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() body: Partial<PmResourceUtilizationEntity>) {
    return this.service.create(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: Partial<PmResourceUtilizationEntity>) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
