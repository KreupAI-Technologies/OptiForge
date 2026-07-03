import {
  Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ShiftDefinitionService } from '../services/shift-definition.service';
import { ShiftDefinition } from '../entities/shift-definition.entity';

@ApiTags('Production - Settings')
@Controller('production/shift-definitions')
export class ShiftDefinitionController {
  constructor(private readonly service: ShiftDefinitionService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new shift definition' })
  @ApiResponse({ status: HttpStatus.CREATED })
  async create(@Body() createDto: Partial<ShiftDefinition>): Promise<ShiftDefinition> {
    return this.service.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all shift definitions' })
  @ApiQuery({ name: 'shiftType', required: false })
  @ApiQuery({ name: 'status', required: false })
  async findAll(
    @Query('shiftType') shiftType?: string,
    @Query('status') status?: string,
  ): Promise<ShiftDefinition[]> {
    return this.service.findAll({ shiftType, status });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get shift definition by ID' })
  @ApiParam({ name: 'id' })
  async findOne(@Param('id') id: string): Promise<ShiftDefinition> {
    return this.service.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update shift definition' })
  @ApiParam({ name: 'id' })
  async update(@Param('id') id: string, @Body() updateDto: Partial<ShiftDefinition>): Promise<ShiftDefinition> {
    return this.service.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete shift definition' })
  @ApiParam({ name: 'id' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }
}
