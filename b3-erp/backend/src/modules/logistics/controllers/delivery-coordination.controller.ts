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
import { DeliveryCoordinationService } from '../services/delivery-coordination.service';
import { DeliveryCoordination } from '../entities/delivery-coordination.entity';

@ApiTags('Logistics - Delivery Coordination')
@Controller('logistics/delivery-coordinations')
export class DeliveryCoordinationController {
  constructor(private readonly service: DeliveryCoordinationService) {}

  @Post()
  @ApiOperation({ summary: 'Create a delivery coordination' })
  async create(
    @Body() data: Partial<DeliveryCoordination>,
  ): Promise<DeliveryCoordination> {
    return this.service.create(data);
  }

  @Get()
  @ApiOperation({ summary: 'Get all delivery coordinations' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'transportMethod', required: false })
  async findAll(
    @Query('status') status?: string,
    @Query('transportMethod') transportMethod?: string,
  ): Promise<DeliveryCoordination[]> {
    return this.service.findAll({ status, transportMethod });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get delivery coordination by ID' })
  async findOne(@Param('id') id: string): Promise<DeliveryCoordination> {
    return this.service.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update delivery coordination' })
  async update(
    @Param('id') id: string,
    @Body() data: Partial<DeliveryCoordination>,
  ): Promise<DeliveryCoordination> {
    return this.service.update(id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete delivery coordination' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }
}
