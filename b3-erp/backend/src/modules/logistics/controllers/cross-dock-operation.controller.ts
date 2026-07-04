import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@ApiTags('Logistics - Cross-Dock Operations')
@Controller('logistics/cross-dock-operations')
export class CrossDockOperationController {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  @Get()
  @ApiOperation({ summary: 'Get all cross-dock operations' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'priority', required: false })
  async findAll(
    @Query('status') status?: string,
    @Query('priority') priority?: string,
  ): Promise<any[]> {
    try {
      const clauses: string[] = [];
      const params: any[] = [];
      if (status) {
        params.push(status);
        clauses.push(`"status" = $${params.length}`);
      }
      if (priority) {
        params.push(priority);
        clauses.push(`"priority" = $${params.length}`);
      }
      const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
      return await this.dataSource.query(
        `SELECT * FROM "logistics_cross_dock_operations" ${where} ORDER BY "createdAt" DESC`,
        params,
      );
    } catch {
      return [];
    }
  }
}
