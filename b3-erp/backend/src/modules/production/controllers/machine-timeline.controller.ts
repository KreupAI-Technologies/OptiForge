import {
  Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { MachineTimelineService } from '../services/machine-timeline.service';
import { MachineTimeline } from '../entities/machine-timeline.entity';

@ApiTags('Production - Machine Timelines')
@Controller('production/machine-timelines')
export class MachineTimelineController {
  constructor(private readonly service: MachineTimelineService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new machine timeline' })
  @ApiResponse({ status: HttpStatus.CREATED })
  async create(@Body() createDto: Partial<MachineTimeline>): Promise<MachineTimeline> {
    return this.service.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all machine timelines' })
  @ApiQuery({ name: 'status', required: false })
  async findAll(@Query('status') status?: string): Promise<MachineTimeline[]> {
    return this.service.findAll({ status });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get machine timeline by ID' })
  @ApiParam({ name: 'id' })
  async findOne(@Param('id') id: string): Promise<MachineTimeline> {
    return this.service.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update machine timeline' })
  @ApiParam({ name: 'id' })
  async update(@Param('id') id: string, @Body() updateDto: Partial<MachineTimeline>): Promise<MachineTimeline> {
    return this.service.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete machine timeline' })
  @ApiParam({ name: 'id' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }
}
