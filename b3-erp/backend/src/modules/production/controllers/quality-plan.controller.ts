import {
  Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { QualityPlanService } from '../services/quality-plan.service';
import { QualityPlan } from '../entities/quality-plan.entity';

@ApiTags('Production - Quality Plans')
@Controller('production/quality-plans')
export class QualityPlanController {
  constructor(private readonly service: QualityPlanService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new quality plan' })
  @ApiResponse({ status: HttpStatus.CREATED })
  async create(@Body() createDto: Partial<QualityPlan>): Promise<QualityPlan> {
    return this.service.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all quality plans' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'category', required: false })
  async findAll(
    @Query('status') status?: string,
    @Query('category') category?: string,
  ): Promise<QualityPlan[]> {
    return this.service.findAll({ status, category });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get quality plan by ID' })
  @ApiParam({ name: 'id' })
  async findOne(@Param('id') id: string): Promise<QualityPlan> {
    return this.service.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update quality plan' })
  @ApiParam({ name: 'id' })
  async update(@Param('id') id: string, @Body() updateDto: Partial<QualityPlan>): Promise<QualityPlan> {
    return this.service.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete quality plan' })
  @ApiParam({ name: 'id' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }
}
