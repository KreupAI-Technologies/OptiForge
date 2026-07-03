import {
  Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { OperationTaskService } from '../services/operation-task.service';
import { OperationTask } from '../entities/operation-task.entity';

@ApiTags('Production - Operations')
@Controller('production/operation-tasks')
export class OperationTaskController {
  constructor(private readonly service: OperationTaskService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new operation task' })
  @ApiResponse({ status: HttpStatus.CREATED })
  async create(@Body() createDto: Partial<OperationTask>): Promise<OperationTask> {
    return this.service.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all operation tasks' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'operationType', required: false })
  async findAll(
    @Query('status') status?: string,
    @Query('operationType') operationType?: string,
  ): Promise<OperationTask[]> {
    return this.service.findAll({ status, operationType });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get operation task by ID' })
  @ApiParam({ name: 'id' })
  async findOne(@Param('id') id: string): Promise<OperationTask> {
    return this.service.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update operation task' })
  @ApiParam({ name: 'id' })
  async update(@Param('id') id: string, @Body() updateDto: Partial<OperationTask>): Promise<OperationTask> {
    return this.service.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete operation task' })
  @ApiParam({ name: 'id' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }
}
