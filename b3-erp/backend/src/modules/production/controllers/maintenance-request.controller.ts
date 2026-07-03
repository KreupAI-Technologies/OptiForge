import {
  Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { MaintenanceRequestService } from '../services/maintenance-request.service';
import { MaintenanceRequest } from '../entities/maintenance-request.entity';

@ApiTags('Production - Maintenance Requests')
@Controller('production/maintenance-requests')
export class MaintenanceRequestController {
  constructor(private readonly service: MaintenanceRequestService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new maintenance request' })
  @ApiResponse({ status: HttpStatus.CREATED })
  async create(@Body() createDto: Partial<MaintenanceRequest>): Promise<MaintenanceRequest> {
    return this.service.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all maintenance requests' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'priority', required: false })
  async findAll(
    @Query('status') status?: string,
    @Query('priority') priority?: string,
  ): Promise<MaintenanceRequest[]> {
    return this.service.findAll({ status, priority });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get maintenance request by ID' })
  @ApiParam({ name: 'id' })
  async findOne(@Param('id') id: string): Promise<MaintenanceRequest> {
    return this.service.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update maintenance request' })
  @ApiParam({ name: 'id' })
  async update(@Param('id') id: string, @Body() updateDto: Partial<MaintenanceRequest>): Promise<MaintenanceRequest> {
    return this.service.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete maintenance request' })
  @ApiParam({ name: 'id' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }
}
