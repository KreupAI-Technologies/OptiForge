import {
  Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { RoutingTemplateService } from '../services/routing-template.service';
import { RoutingTemplate } from '../entities/routing-template.entity';

@ApiTags('Production - Settings')
@Controller('production/routing-templates')
export class RoutingTemplateController {
  constructor(private readonly service: RoutingTemplateService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new routing template' })
  @ApiResponse({ status: HttpStatus.CREATED })
  async create(@Body() createDto: Partial<RoutingTemplate>): Promise<RoutingTemplate> {
    return this.service.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all routing templates' })
  @ApiQuery({ name: 'status', required: false })
  async findAll(@Query('status') status?: string): Promise<RoutingTemplate[]> {
    return this.service.findAll({ status });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get routing template by ID' })
  @ApiParam({ name: 'id' })
  async findOne(@Param('id') id: string): Promise<RoutingTemplate> {
    return this.service.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update routing template' })
  @ApiParam({ name: 'id' })
  async update(@Param('id') id: string, @Body() updateDto: Partial<RoutingTemplate>): Promise<RoutingTemplate> {
    return this.service.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete routing template' })
  @ApiParam({ name: 'id' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }
}
