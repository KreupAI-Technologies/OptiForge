import {
  Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { NcrService } from '../services/ncr.service';
import { Ncr } from '../entities/ncr.entity';

@ApiTags('Production - NCRs')
@Controller('production/ncrs')
export class NcrController {
  constructor(private readonly service: NcrService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new non-conformance report' })
  @ApiResponse({ status: HttpStatus.CREATED })
  async create(@Body() createDto: Partial<Ncr>): Promise<Ncr> {
    return this.service.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all NCRs' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'severity', required: false })
  @ApiQuery({ name: 'nonconformanceType', required: false })
  async findAll(
    @Query('status') status?: string,
    @Query('severity') severity?: string,
    @Query('nonconformanceType') nonconformanceType?: string,
  ): Promise<Ncr[]> {
    return this.service.findAll({ status, severity, nonconformanceType });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get NCR by ID' })
  @ApiParam({ name: 'id' })
  async findOne(@Param('id') id: string): Promise<Ncr> {
    return this.service.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update NCR' })
  @ApiParam({ name: 'id' })
  async update(@Param('id') id: string, @Body() updateDto: Partial<Ncr>): Promise<Ncr> {
    return this.service.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete NCR' })
  @ApiParam({ name: 'id' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }
}
