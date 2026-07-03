import {
  Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { DieToolAssetService } from '../services/die-tool-asset.service';
import { DieToolAsset } from '../entities/die-tool-asset.entity';

@ApiTags('Production - Dies & Tools')
@Controller('production/die-tool-assets')
export class DieToolAssetController {
  constructor(private readonly service: DieToolAssetService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new die/tool asset' })
  @ApiResponse({ status: HttpStatus.CREATED })
  async create(@Body() createDto: Partial<DieToolAsset>): Promise<DieToolAsset> {
    return this.service.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all die/tool assets' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'type', required: false })
  async findAll(
    @Query('status') status?: string,
    @Query('type') type?: string,
  ): Promise<DieToolAsset[]> {
    return this.service.findAll({ status, type });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get die/tool asset by ID' })
  @ApiParam({ name: 'id' })
  async findOne(@Param('id') id: string): Promise<DieToolAsset> {
    return this.service.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update die/tool asset' })
  @ApiParam({ name: 'id' })
  async update(@Param('id') id: string, @Body() updateDto: Partial<DieToolAsset>): Promise<DieToolAsset> {
    return this.service.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete die/tool asset' })
  @ApiParam({ name: 'id' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }
}
