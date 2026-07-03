import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { PmBomItemsService } from '../services/pm-bom-items.service';
import { PmBomItemEntity } from '../entities/pm-bom-item.entity';

@Controller('project-management/bom-items')
export class PmBomItemsController {
  constructor(private readonly service: PmBomItemsService) {}

  @Get()
  findAll(@Query('companyId') companyId?: string, @Query('status') status?: string) {
    return this.service.findAll(companyId || 'default', status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() body: Partial<PmBomItemEntity>) {
    return this.service.create(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: Partial<PmBomItemEntity>) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
