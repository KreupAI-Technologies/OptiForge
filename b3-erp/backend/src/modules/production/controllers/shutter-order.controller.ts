import {
  Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ShutterOrderService } from '../services/shutter-order.service';
import { ShutterOrder } from '../entities/shutter-order.entity';

@ApiTags('Production - Shutters')
@Controller('production/shutter-orders')
export class ShutterOrderController {
  constructor(private readonly service: ShutterOrderService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new shutter order' })
  @ApiResponse({ status: HttpStatus.CREATED })
  async create(@Body() createDto: Partial<ShutterOrder>): Promise<ShutterOrder> {
    return this.service.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all shutter orders' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'shutterType', required: false })
  async findAll(
    @Query('status') status?: string,
    @Query('shutterType') shutterType?: string,
  ): Promise<ShutterOrder[]> {
    return this.service.findAll({ status, shutterType });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get shutter order by ID' })
  @ApiParam({ name: 'id' })
  async findOne(@Param('id') id: string): Promise<ShutterOrder> {
    return this.service.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update shutter order' })
  @ApiParam({ name: 'id' })
  async update(@Param('id') id: string, @Body() updateDto: Partial<ShutterOrder>): Promise<ShutterOrder> {
    return this.service.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete shutter order' })
  @ApiParam({ name: 'id' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }
}
