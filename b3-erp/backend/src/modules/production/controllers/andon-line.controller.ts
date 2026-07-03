import {
  Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { AndonLineService } from '../services/andon-line.service';
import { AndonLine } from '../entities/andon-line.entity';

@ApiTags('Production - Andon Lines')
@Controller('production/andon-lines')
export class AndonLineController {
  constructor(private readonly service: AndonLineService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new andon line' })
  @ApiResponse({ status: HttpStatus.CREATED })
  async create(@Body() createDto: Partial<AndonLine>): Promise<AndonLine> {
    return this.service.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all andon lines' })
  @ApiQuery({ name: 'status', required: false })
  async findAll(@Query('status') status?: string): Promise<AndonLine[]> {
    return this.service.findAll({ status });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get andon line by ID' })
  @ApiParam({ name: 'id' })
  async findOne(@Param('id') id: string): Promise<AndonLine> {
    return this.service.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update andon line' })
  @ApiParam({ name: 'id' })
  async update(@Param('id') id: string, @Body() updateDto: Partial<AndonLine>): Promise<AndonLine> {
    return this.service.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete andon line' })
  @ApiParam({ name: 'id' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }
}
