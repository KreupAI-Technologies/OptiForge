import {
  Controller, Get, Post, Put, Body, Param, Query, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ShopFloorMaterialRequestService } from '../services/shop-floor-material-request.service';
import { ShopFloorMaterialRequest } from '../entities/shop-floor-material-request.entity';

@ApiTags('Production - Shop Floor Material Requests')
@Controller('production/shopfloor/material-requests')
export class ShopFloorMaterialRequestController {
  constructor(private readonly service: ShopFloorMaterialRequestService) {}

  @Post()
  @ApiOperation({ summary: 'Raise a material pull request from the shop floor' })
  @ApiResponse({ status: HttpStatus.CREATED })
  async create(@Body() createDto: Partial<ShopFloorMaterialRequest>): Promise<ShopFloorMaterialRequest> {
    return this.service.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'List shop-floor material requests' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'workOrderId', required: false })
  @ApiQuery({ name: 'workCenterId', required: false })
  async findAll(
    @Query('status') status?: string,
    @Query('workOrderId') workOrderId?: string,
    @Query('workCenterId') workCenterId?: string,
  ): Promise<ShopFloorMaterialRequest[]> {
    return this.service.findAll({ status, workOrderId, workCenterId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a material request by ID' })
  @ApiParam({ name: 'id' })
  async findOne(@Param('id') id: string): Promise<ShopFloorMaterialRequest> {
    return this.service.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a material request (e.g. fulfil / cancel)' })
  @ApiParam({ name: 'id' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: Partial<ShopFloorMaterialRequest>,
  ): Promise<ShopFloorMaterialRequest> {
    return this.service.update(id, updateDto);
  }
}
