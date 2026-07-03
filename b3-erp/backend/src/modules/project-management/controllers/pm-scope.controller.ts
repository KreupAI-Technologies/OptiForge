import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { PmScopeService } from '../services/pm-scope.service';
import { PmScopeItemEntity } from '../entities/pm-scope-item.entity';

@Controller('project-management/scope')
export class PmScopeController {
  constructor(private readonly service: PmScopeService) {}

  @Get()
  findAll(@Query('companyId') companyId?: string, @Query('status') status?: string) {
    return this.service.findAll(companyId || 'default', status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() body: Partial<PmScopeItemEntity>) {
    return this.service.create(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: Partial<PmScopeItemEntity>) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
