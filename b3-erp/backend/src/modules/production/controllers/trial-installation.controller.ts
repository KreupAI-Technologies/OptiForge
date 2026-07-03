import {
  Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { TrialInstallationService } from '../services/trial-installation.service';
import { TrialInstallation } from '../entities/trial-installation.entity';

@ApiTags('Production - Trial Installations')
@Controller('production/trial-installations')
export class TrialInstallationController {
  constructor(private readonly service: TrialInstallationService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new trial installation' })
  @ApiResponse({ status: HttpStatus.CREATED })
  async create(@Body() createDto: Partial<TrialInstallation>): Promise<TrialInstallation> {
    return this.service.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all trial installations' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'installationType', required: false })
  async findAll(
    @Query('status') status?: string,
    @Query('installationType') installationType?: string,
  ): Promise<TrialInstallation[]> {
    return this.service.findAll({ status, installationType });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get trial installation by ID' })
  @ApiParam({ name: 'id' })
  async findOne(@Param('id') id: string): Promise<TrialInstallation> {
    return this.service.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update trial installation' })
  @ApiParam({ name: 'id' })
  async update(@Param('id') id: string, @Body() updateDto: Partial<TrialInstallation>): Promise<TrialInstallation> {
    return this.service.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete trial installation' })
  @ApiParam({ name: 'id' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }
}
