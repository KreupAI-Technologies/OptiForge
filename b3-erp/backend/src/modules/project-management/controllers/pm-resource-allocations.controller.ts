import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { PmResourceAllocationsService } from '../services/pm-resource-allocations.service';
import { PmResourceAllocationEntity } from '../entities/pm-resource-allocation.entity';

@Controller('project-management/resource-allocations')
export class PmResourceAllocationsController {
  constructor(private readonly service: PmResourceAllocationsService) {}

  @Get()
  findAll(@Query('companyId') companyId?: string, @Query('status') status?: string) {
    return this.service.findAll(companyId || 'default', status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() body: Partial<PmResourceAllocationEntity>) {
    return this.service.create(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: Partial<PmResourceAllocationEntity>) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
