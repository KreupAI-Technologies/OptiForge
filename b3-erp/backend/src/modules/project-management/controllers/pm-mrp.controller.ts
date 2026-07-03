import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { PmMrpService } from '../services/pm-mrp.service';
import { PmMrpMaterialEntity } from '../entities/pm-mrp-material.entity';

@Controller('project-management/mrp')
export class PmMrpController {
  constructor(private readonly service: PmMrpService) {}

  @Get()
  findAll(@Query('companyId') companyId?: string, @Query('status') status?: string) {
    return this.service.findAll(companyId || 'default', status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() body: Partial<PmMrpMaterialEntity>) {
    return this.service.create(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: Partial<PmMrpMaterialEntity>) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
