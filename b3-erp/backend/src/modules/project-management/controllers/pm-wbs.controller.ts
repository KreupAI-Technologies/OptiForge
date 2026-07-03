import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { PmWbsService } from '../services/pm-wbs.service';
import { PmWbsNodeEntity } from '../entities/pm-wbs-node.entity';

@Controller('project-management/wbs')
export class PmWbsController {
  constructor(private readonly service: PmWbsService) {}

  @Get()
  findAll(@Query('companyId') companyId?: string, @Query('status') status?: string) {
    return this.service.findAll(companyId || 'default', status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() body: Partial<PmWbsNodeEntity>) {
    return this.service.create(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: Partial<PmWbsNodeEntity>) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
