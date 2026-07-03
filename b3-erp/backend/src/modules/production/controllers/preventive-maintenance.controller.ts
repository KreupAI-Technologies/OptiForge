import {
  Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { PreventiveMaintenanceService } from '../services/preventive-maintenance.service';
import { PreventiveMaintenance } from '../entities/preventive-maintenance.entity';

@ApiTags('Production - Preventive Maintenance')
@Controller('production/preventive-maintenance')
export class PreventiveMaintenanceController {
  constructor(private readonly service: PreventiveMaintenanceService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new preventive maintenance task' })
  @ApiResponse({ status: HttpStatus.CREATED })
  async create(@Body() createDto: Partial<PreventiveMaintenance>): Promise<PreventiveMaintenance> {
    return this.service.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all preventive maintenance tasks' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'frequency', required: false })
  async findAll(
    @Query('status') status?: string,
    @Query('frequency') frequency?: string,
  ): Promise<PreventiveMaintenance[]> {
    return this.service.findAll({ status, frequency });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get preventive maintenance task by ID' })
  @ApiParam({ name: 'id' })
  async findOne(@Param('id') id: string): Promise<PreventiveMaintenance> {
    return this.service.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update preventive maintenance task' })
  @ApiParam({ name: 'id' })
  async update(@Param('id') id: string, @Body() updateDto: Partial<PreventiveMaintenance>): Promise<PreventiveMaintenance> {
    return this.service.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete preventive maintenance task' })
  @ApiParam({ name: 'id' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }
}
