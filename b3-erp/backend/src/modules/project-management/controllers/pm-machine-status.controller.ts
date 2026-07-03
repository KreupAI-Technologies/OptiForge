import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { PmMachineStatusService } from '../services/pm-machine-status.service';
import { PmMachineStatusEntity } from '../entities/pm-machine-status.entity';

@Controller('project-management/machine-status')
export class PmMachineStatusController {
  constructor(private readonly service: PmMachineStatusService) {}

  @Get()
  findAll(@Query('companyId') companyId?: string, @Query('status') status?: string) {
    return this.service.findAll(companyId || 'default', status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() body: Partial<PmMachineStatusEntity>) {
    return this.service.create(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: Partial<PmMachineStatusEntity>) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
