import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@ApiTags('Logistics - Carrier Contracts')
@Controller('logistics/carrier-contracts')
export class CarrierContractController {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  @Get()
  @ApiOperation({ summary: 'Get all carrier contracts' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'carrier', required: false })
  async findAll(
    @Query('status') status?: string,
    @Query('carrier') carrier?: string,
  ): Promise<any[]> {
    try {
      const clauses: string[] = [];
      const params: any[] = [];
      if (status) {
        params.push(status);
        clauses.push(`"status" = $${params.length}`);
      }
      if (carrier) {
        params.push(carrier);
        clauses.push(`"carrier" = $${params.length}`);
      }
      const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
      return await this.dataSource.query(
        `SELECT * FROM "logistics_carrier_contracts" ${where} ORDER BY "startDate" DESC`,
        params,
      );
    } catch {
      return [];
    }
  }
}
