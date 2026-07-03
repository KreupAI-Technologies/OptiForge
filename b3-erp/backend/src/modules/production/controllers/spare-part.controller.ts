import {
  Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { SparePartService } from '../services/spare-part.service';
import { SparePart } from '../entities/spare-part.entity';

@ApiTags('Production - Spare Parts')
@Controller('production/spare-parts')
export class SparePartController {
  constructor(private readonly service: SparePartService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new spare part' })
  @ApiResponse({ status: HttpStatus.CREATED })
  async create(@Body() createDto: Partial<SparePart>): Promise<SparePart> {
    return this.service.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all spare parts' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'category', required: false })
  async findAll(
    @Query('status') status?: string,
    @Query('category') category?: string,
  ): Promise<SparePart[]> {
    return this.service.findAll({ status, category });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get spare part by ID' })
  @ApiParam({ name: 'id' })
  async findOne(@Param('id') id: string): Promise<SparePart> {
    return this.service.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update spare part' })
  @ApiParam({ name: 'id' })
  async update(@Param('id') id: string, @Body() updateDto: Partial<SparePart>): Promise<SparePart> {
    return this.service.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete spare part' })
  @ApiParam({ name: 'id' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }
}
