import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ReworkItemService } from '../services/rework-item.service';
import { ReworkItem } from '../entities/rework-item.entity';

@ApiTags('Quality - Rework Items')
@Controller('quality/rework-items')
export class ReworkItemController {
  constructor(private readonly service: ReworkItemService) {}

  @Post()
  @ApiOperation({ summary: 'Create a rework item' })
  async create(@Body() data: Partial<ReworkItem>): Promise<ReworkItem> {
    return this.service.create(data);
  }

  @Get()
  @ApiOperation({ summary: 'Get all rework items' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'priority', required: false })
  @ApiQuery({ name: 'projectId', required: false })
  async findAll(
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('projectId') projectId?: string,
  ): Promise<ReworkItem[]> {
    return this.service.findAll({ status, priority, projectId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get rework item by ID' })
  async findOne(@Param('id') id: string): Promise<ReworkItem> {
    return this.service.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update rework item' })
  async update(
    @Param('id') id: string,
    @Body() data: Partial<ReworkItem>,
  ): Promise<ReworkItem> {
    return this.service.update(id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete rework item' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }
}
