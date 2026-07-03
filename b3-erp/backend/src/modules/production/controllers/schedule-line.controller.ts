import {
  Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ScheduleLineService } from '../services/schedule-line.service';
import { ScheduleLine } from '../entities/schedule-line.entity';

@ApiTags('Production - Schedule Lines')
@Controller('production/schedule-lines')
export class ScheduleLineController {
  constructor(private readonly service: ScheduleLineService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new schedule line' })
  @ApiResponse({ status: HttpStatus.CREATED })
  async create(@Body() createDto: Partial<ScheduleLine>): Promise<ScheduleLine> {
    return this.service.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all schedule lines' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'workCenter', required: false })
  async findAll(
    @Query('status') status?: string,
    @Query('workCenter') workCenter?: string,
  ): Promise<ScheduleLine[]> {
    return this.service.findAll({ status, workCenter });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get schedule line by ID' })
  @ApiParam({ name: 'id' })
  async findOne(@Param('id') id: string): Promise<ScheduleLine> {
    return this.service.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update schedule line' })
  @ApiParam({ name: 'id' })
  async update(@Param('id') id: string, @Body() updateDto: Partial<ScheduleLine>): Promise<ScheduleLine> {
    return this.service.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete schedule line' })
  @ApiParam({ name: 'id' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }
}
