import {
  Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { BomTemplateService } from '../services/bom-template.service';
import { BomTemplate } from '../entities/bom-template.entity';

@ApiTags('Production - BOM Templates')
@Controller('production/bom-templates')
export class BomTemplateController {
  constructor(private readonly service: BomTemplateService) {}

  @Post()
  @ApiOperation({ summary: 'Create an assembly / BOM template' })
  @ApiResponse({ status: HttpStatus.CREATED })
  async create(@Body() createDto: Partial<BomTemplate>): Promise<BomTemplate> {
    return this.service.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all BOM templates' })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'status', required: false })
  async findAll(
    @Query('category') category?: string,
    @Query('status') status?: string,
  ): Promise<BomTemplate[]> {
    return this.service.findAll({ category, status });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get BOM template by ID' })
  @ApiParam({ name: 'id' })
  async findOne(@Param('id') id: string): Promise<BomTemplate> {
    return this.service.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update BOM template' })
  @ApiParam({ name: 'id' })
  async update(@Param('id') id: string, @Body() updateDto: Partial<BomTemplate>): Promise<BomTemplate> {
    return this.service.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete BOM template' })
  @ApiParam({ name: 'id' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }
}
