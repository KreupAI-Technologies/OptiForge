import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { PmEarnedValueService } from '../services/pm-earned-value.service';
import { PmEarnedValueEntity } from '../entities/pm-earned-value.entity';

@Controller('project-management/earned-value')
export class PmEarnedValueController {
  constructor(private readonly service: PmEarnedValueService) {}

  @Get()
  findAll(@Query('companyId') companyId?: string, @Query('status') status?: string) {
    return this.service.findAll(companyId || 'default', status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() body: Partial<PmEarnedValueEntity>) {
    return this.service.create(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: Partial<PmEarnedValueEntity>) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
