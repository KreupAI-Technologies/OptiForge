import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@ApiTags('Logistics - Dock Doors')
@Controller('logistics/dock-doors')
export class DockDoorController {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  @Get()
  @ApiOperation({ summary: 'Get all dock doors' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'type', required: false })
  async findAll(
    @Query('status') status?: string,
    @Query('type') type?: string,
  ): Promise<any[]> {
    try {
      const clauses: string[] = [];
      const params: any[] = [];
      if (status) {
        params.push(status);
        clauses.push(`"status" = $${params.length}`);
      }
      if (type) {
        params.push(type);
        clauses.push(`"type" = $${params.length}`);
      }
      const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
      return await this.dataSource.query(
        `SELECT * FROM "logistics_dock_doors" ${where} ORDER BY "doorNo" ASC`,
        params,
      );
    } catch {
      return [];
    }
  }
}
