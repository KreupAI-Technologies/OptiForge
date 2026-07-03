import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { PmKanbanService } from '../services/pm-kanban.service';
import { PmKanbanCardEntity } from '../entities/pm-kanban-card.entity';

@Controller('project-management/kanban')
export class PmKanbanController {
  constructor(private readonly service: PmKanbanService) {}

  @Get()
  findAll(@Query('companyId') companyId?: string, @Query('column') column?: string) {
    return this.service.findAll(companyId || 'default', column);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() body: Partial<PmKanbanCardEntity>) {
    return this.service.create(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: Partial<PmKanbanCardEntity>) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
