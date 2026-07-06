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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ShipmentService } from '../services/shipment.service';
import {
  CreateShipmentDto,
  UpdateShipmentDto,
  ShipmentResponseDto,
} from '../dto';

@ApiTags('Logistics - Shipment')
@Controller('logistics/shipments')
export class ShipmentController {
  constructor(private readonly shipmentService: ShipmentService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new shipment' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Shipment created successfully',
    type: ShipmentResponseDto,
  })
  async create(
    @Body() createDto: CreateShipmentDto,
  ): Promise<ShipmentResponseDto> {
    return this.shipmentService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all shipments' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'shipmentType', required: false })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of shipments',
    type: [ShipmentResponseDto],
  })
  async findAll(
    @Query('status') status?: string,
    @Query('shipmentType') shipmentType?: string,
    @Query('originCity') originCity?: string,
    @Query('destinationCity') destinationCity?: string,
  ): Promise<ShipmentResponseDto[]> {
    return this.shipmentService.findAll({ status, shipmentType, originCity, destinationCity });
  }

  @Get('loading-jobs')
  @ApiOperation({ summary: 'Get loading jobs (aggregated over shipments)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'List of loading jobs' })
  async getLoadingJobs() {
    return this.shipmentService.getLoadingJobs();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get shipment by ID' })
  @ApiParam({ name: 'id', description: 'Shipment ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Shipment details',
    type: ShipmentResponseDto,
  })
  async findOne(@Param('id') id: string): Promise<ShipmentResponseDto> {
    return this.shipmentService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update shipment' })
  @ApiParam({ name: 'id', description: 'Shipment ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Shipment updated successfully',
    type: ShipmentResponseDto,
  })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateShipmentDto,
  ): Promise<ShipmentResponseDto> {
    return this.shipmentService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete shipment' })
  @ApiParam({ name: 'id', description: 'Shipment ID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Shipment deleted successfully',
  })
  async remove(@Param('id') id: string): Promise<void> {
    return this.shipmentService.remove(id);
  }

  @Post(':id/dispatch')
  @ApiOperation({ summary: 'Dispatch shipment' })
  @ApiParam({ name: 'id', description: 'Shipment ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Shipment dispatched successfully',
    type: ShipmentResponseDto,
  })
  async dispatch(@Param('id') id: string): Promise<ShipmentResponseDto> {
    return this.shipmentService.dispatch(id);
  }

  @Post(':id/in-transit')
  @ApiOperation({ summary: 'Mark shipment as in transit' })
  @ApiParam({ name: 'id', description: 'Shipment ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Shipment marked in transit',
    type: ShipmentResponseDto,
  })
  async markInTransit(@Param('id') id: string): Promise<ShipmentResponseDto> {
    return this.shipmentService.markInTransit(id);
  }

  @Post(':id/deliver')
  @ApiOperation({ summary: 'Mark shipment as delivered' })
  @ApiParam({ name: 'id', description: 'Shipment ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Shipment marked delivered',
    type: ShipmentResponseDto,
  })
  async markDelivered(
    @Param('id') id: string,
    @Body() deliveryDetails: any,
  ): Promise<ShipmentResponseDto> {
    return this.shipmentService.markDelivered(id, deliveryDetails);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel shipment' })
  @ApiParam({ name: 'id', description: 'Shipment ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Shipment cancelled',
    type: ShipmentResponseDto,
  })
  async cancel(
    @Param('id') id: string,
    @Body('reason') reason: string,
  ): Promise<ShipmentResponseDto> {
    return this.shipmentService.cancel(id, reason);
  }

  @Get(':id/tracking')
  @ApiOperation({ summary: 'Get shipment tracking details' })
  @ApiParam({ name: 'id', description: 'Shipment ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Shipment tracking details',
  })
  async getTracking(@Param('id') id: string): Promise<any> {
    return this.shipmentService.getShipmentTracking(id);
  }
}
