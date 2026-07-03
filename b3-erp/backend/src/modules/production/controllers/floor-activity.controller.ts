import {
  Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { FloorActivityService } from '../services/floor-activity.service';
import { FloorActivity } from '../entities/floor-activity.entity';

@ApiTags('Production - Floor Activities')
@Controller('production/floor-activities')
export class FloorActivityController {
  constructor(private readonly service: FloorActivityService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new floor activity' })
  @ApiResponse({ status: HttpStatus.CREATED })
  async create(@Body() createDto: Partial<FloorActivity>): Promise<FloorActivity> {
    return this.service.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all floor activities' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'shift', required: false })
  async findAll(
    @Query('status') status?: string,
    @Query('shift') shift?: string,
  ): Promise<FloorActivity[]> {
    return this.service.findAll({ status, shift });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get floor activity by ID' })
  @ApiParam({ name: 'id' })
  async findOne(@Param('id') id: string): Promise<FloorActivity> {
    return this.service.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update floor activity' })
  @ApiParam({ name: 'id' })
  async update(@Param('id') id: string, @Body() updateDto: Partial<FloorActivity>): Promise<FloorActivity> {
    return this.service.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete floor activity' })
  @ApiParam({ name: 'id' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }
}
