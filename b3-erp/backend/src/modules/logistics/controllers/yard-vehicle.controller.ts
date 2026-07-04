import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@ApiTags('Logistics - Yard Vehicles')
@Controller('logistics/yard-vehicles')
export class YardVehicleController {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  @Get()
  @ApiOperation({ summary: 'Get all yard vehicles' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'vehicleType', required: false })
  async findAll(
    @Query('status') status?: string,
    @Query('vehicleType') vehicleType?: string,
  ): Promise<any[]> {
    try {
      const clauses: string[] = [];
      const params: any[] = [];
      if (status) {
        params.push(status);
        clauses.push(`"status" = $${params.length}`);
      }
      if (vehicleType) {
        params.push(vehicleType);
        clauses.push(`"vehicleType" = $${params.length}`);
      }
      const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
      return await this.dataSource.query(
        `SELECT * FROM "logistics_yard_vehicles" ${where} ORDER BY "checkInTime" DESC`,
        params,
      );
    } catch {
      return [];
    }
  }
}
