import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { PmProjectTypesService } from '../services/pm-project-types.service';
import { PmProjectTypeEntity } from '../entities/pm-project-type.entity';

@Controller('project-management/project-types')
export class PmProjectTypesController {
  constructor(private readonly service: PmProjectTypesService) {}

  @Get()
  findAll(@Query('companyId') companyId?: string, @Query('status') status?: string) {
    return this.service.findAll(companyId || 'default', status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() body: Partial<PmProjectTypeEntity>) {
    return this.service.create(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: Partial<PmProjectTypeEntity>) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
