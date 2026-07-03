import {
  Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { BomVerificationService } from '../services/bom-verification.service';
import { BomVerification } from '../entities/bom-verification.entity';

@ApiTags('Production - BOM Verifications')
@Controller('production/bom-verifications')
export class BomVerificationController {
  constructor(private readonly service: BomVerificationService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new BOM verification' })
  @ApiResponse({ status: HttpStatus.CREATED })
  async create(@Body() createDto: Partial<BomVerification>): Promise<BomVerification> {
    return this.service.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all BOM verifications' })
  @ApiQuery({ name: 'status', required: false })
  async findAll(@Query('status') status?: string): Promise<BomVerification[]> {
    return this.service.findAll({ status });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get BOM verification by ID' })
  @ApiParam({ name: 'id' })
  async findOne(@Param('id') id: string): Promise<BomVerification> {
    return this.service.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update BOM verification' })
  @ApiParam({ name: 'id' })
  async update(@Param('id') id: string, @Body() updateDto: Partial<BomVerification>): Promise<BomVerification> {
    return this.service.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete BOM verification' })
  @ApiParam({ name: 'id' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }
}
