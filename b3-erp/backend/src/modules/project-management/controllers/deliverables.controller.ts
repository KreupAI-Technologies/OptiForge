import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { DeliverablesService } from '../services/deliverables.service';
import { DeliverableEntity } from '../entities/deliverable.entity';

@Controller('project-management/deliverables')
export class DeliverablesController {
  constructor(private readonly service: DeliverablesService) {}

  @Get()
  findAll(@Query('companyId') companyId?: string, @Query('status') status?: string) {
    return this.service.findAll(companyId || 'default', status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() body: Partial<DeliverableEntity>) {
    return this.service.create(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: Partial<DeliverableEntity>) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
