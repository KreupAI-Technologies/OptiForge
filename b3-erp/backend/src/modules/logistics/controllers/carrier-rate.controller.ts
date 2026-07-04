import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@ApiTags('Logistics - Carrier Rates')
@Controller('logistics/carrier-rates')
export class CarrierRateController {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  @Get()
  @ApiOperation({ summary: 'Get all carrier rates' })
  @ApiQuery({ name: 'carrier', required: false })
  @ApiQuery({ name: 'serviceType', required: false })
  async findAll(
    @Query('carrier') carrier?: string,
    @Query('serviceType') serviceType?: string,
  ): Promise<any[]> {
    try {
      const clauses: string[] = [];
      const params: any[] = [];
      if (carrier) {
        params.push(carrier);
        clauses.push(`"carrier" = $${params.length}`);
      }
      if (serviceType) {
        params.push(serviceType);
        clauses.push(`"serviceType" = $${params.length}`);
      }
      const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
      return await this.dataSource.query(
        `SELECT * FROM "logistics_carrier_rates" ${where} ORDER BY "carrier" ASC`,
        params,
      );
    } catch {
      return [];
    }
  }
}
