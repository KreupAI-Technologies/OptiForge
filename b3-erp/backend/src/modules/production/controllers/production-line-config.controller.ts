import {
  Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ProductionLineConfigService } from '../services/production-line-config.service';
import { ProductionLineConfig } from '../entities/production-line-config.entity';

@ApiTags('Production - Settings')
@Controller('production/line-configs')
export class ProductionLineConfigController {
  constructor(private readonly service: ProductionLineConfigService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new production line config' })
  @ApiResponse({ status: HttpStatus.CREATED })
  async create(@Body() createDto: Partial<ProductionLineConfig>): Promise<ProductionLineConfig> {
    return this.service.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all production line configs' })
  @ApiQuery({ name: 'status', required: false })
  async findAll(@Query('status') status?: string): Promise<ProductionLineConfig[]> {
    return this.service.findAll({ status });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get production line config by ID' })
  @ApiParam({ name: 'id' })
  async findOne(@Param('id') id: string): Promise<ProductionLineConfig> {
    return this.service.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update production line config' })
  @ApiParam({ name: 'id' })
  async update(@Param('id') id: string, @Body() updateDto: Partial<ProductionLineConfig>): Promise<ProductionLineConfig> {
    return this.service.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete production line config' })
  @ApiParam({ name: 'id' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }
}
