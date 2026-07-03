import {
  Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { GanttTaskService } from '../services/gantt-task.service';
import { GanttTask } from '../entities/gantt-task.entity';

@ApiTags('Production - Gantt Tasks')
@Controller('production/gantt-tasks')
export class GanttTaskController {
  constructor(private readonly service: GanttTaskService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new gantt task' })
  @ApiResponse({ status: HttpStatus.CREATED })
  async create(@Body() createDto: Partial<GanttTask>): Promise<GanttTask> {
    return this.service.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all gantt tasks' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'groupId', required: false })
  async findAll(
    @Query('status') status?: string,
    @Query('groupId') groupId?: string,
  ): Promise<GanttTask[]> {
    return this.service.findAll({ status, groupId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get gantt task by ID' })
  @ApiParam({ name: 'id' })
  async findOne(@Param('id') id: string): Promise<GanttTask> {
    return this.service.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update gantt task' })
  @ApiParam({ name: 'id' })
  async update(@Param('id') id: string, @Body() updateDto: Partial<GanttTask>): Promise<GanttTask> {
    return this.service.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete gantt task' })
  @ApiParam({ name: 'id' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }
}
