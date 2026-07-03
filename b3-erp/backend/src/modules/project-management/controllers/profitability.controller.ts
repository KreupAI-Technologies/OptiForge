import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ProfitabilityService } from '../services/profitability.service';
import { ProjectProfitabilityEntity } from '../entities/project-profitability.entity';

@Controller('project-management/profitability')
export class ProfitabilityController {
  constructor(private readonly service: ProfitabilityService) {}

  @Get()
  findAll(@Query('companyId') companyId?: string, @Query('status') status?: string) {
    return this.service.findAll(companyId || 'default', status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() body: Partial<ProjectProfitabilityEntity>) {
    return this.service.create(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: Partial<ProjectProfitabilityEntity>) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
