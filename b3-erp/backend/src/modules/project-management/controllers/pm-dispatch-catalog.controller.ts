import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { PmDispatchCatalogService } from '../services/pm-dispatch-catalog.service';
import { PmDispatchCatalogEntity } from '../entities/pm-dispatch-catalog.entity';

@Controller('project-management/dispatch-catalog')
export class PmDispatchCatalogController {
  constructor(private readonly service: PmDispatchCatalogService) {}

  @Get()
  findAll(@Query('companyId') companyId?: string, @Query('status') status?: string) {
    return this.service.findAll(companyId || 'default', status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() body: Partial<PmDispatchCatalogEntity>) {
    return this.service.create(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: Partial<PmDispatchCatalogEntity>) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
