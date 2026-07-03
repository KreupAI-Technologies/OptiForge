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
import { FuelRecordService } from '../services/fuel-record.service';
import { FuelRecord } from '../entities/fuel-record.entity';

@ApiTags('Logistics - Fuel Records')
@Controller('logistics/fuel-records')
export class FuelRecordController {
  constructor(private readonly service: FuelRecordService) {}

  @Post()
  @ApiOperation({ summary: 'Create a fuel record' })
  async create(@Body() data: Partial<FuelRecord>): Promise<FuelRecord> {
    return this.service.create(data);
  }

  @Get()
  @ApiOperation({ summary: 'Get all fuel records' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'fuelType', required: false })
  @ApiQuery({ name: 'vehicleNumber', required: false })
  async findAll(
    @Query('status') status?: string,
    @Query('fuelType') fuelType?: string,
    @Query('vehicleNumber') vehicleNumber?: string,
  ): Promise<FuelRecord[]> {
    return this.service.findAll({ status, fuelType, vehicleNumber });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get fuel record by ID' })
  async findOne(@Param('id') id: string): Promise<FuelRecord> {
    return this.service.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update fuel record' })
  async update(
    @Param('id') id: string,
    @Body() data: Partial<FuelRecord>,
  ): Promise<FuelRecord> {
    return this.service.update(id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete fuel record' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }
}
