import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiParam } from '@nestjs/swagger';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

interface DockDoorPayload {
  doorNo?: string;
  doorName?: string;
  type?: string;
  status?: string;
  currentVehicle?: string;
  carrier?: string;
  waitTime?: number;
  assignedTo?: string;
  location?: string;
  notes?: string;
}

// Whitelist of writable columns (quoted camelCase to match the table).
const WRITABLE_COLUMNS = [
  'doorNo',
  'doorName',
  'type',
  'status',
  'currentVehicle',
  'carrier',
  'waitTime',
  'assignedTo',
  'location',
  'notes',
] as const;

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

  @Post()
  @ApiOperation({ summary: 'Create a dock door' })
  async create(@Body() payload: DockDoorPayload): Promise<any> {
    const cols: string[] = [];
    const placeholders: string[] = [];
    const params: any[] = [];

    for (const col of WRITABLE_COLUMNS) {
      const value = (payload as Record<string, unknown>)[col];
      if (value !== undefined) {
        params.push(value);
        cols.push(`"${col}"`);
        placeholders.push(`$${params.length}`);
      }
    }

    // Ensure a doorNo is always present (NOT NULL column).
    if (!cols.includes('"doorNo"')) {
      params.push(`DOCK-${Date.now()}`);
      cols.push('"doorNo"');
      placeholders.push(`$${params.length}`);
    }

    const rows = await this.dataSource.query(
      `INSERT INTO "logistics_dock_doors" (${cols.join(', ')})
       VALUES (${placeholders.join(', ')})
       RETURNING *`,
      params,
    );
    return rows[0];
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a dock door (assignment / status)' })
  @ApiParam({ name: 'id', description: 'Dock door ID' })
  async update(
    @Param('id') id: string,
    @Body() payload: DockDoorPayload,
  ): Promise<any> {
    const sets: string[] = [];
    const params: any[] = [];

    for (const col of WRITABLE_COLUMNS) {
      const value = (payload as Record<string, unknown>)[col];
      if (value !== undefined) {
        params.push(value);
        sets.push(`"${col}" = $${params.length}`);
      }
    }

    // Always bump updatedAt.
    sets.push(`"updatedAt" = now()`);

    params.push(id);
    const rows = await this.dataSource.query(
      `UPDATE "logistics_dock_doors"
       SET ${sets.join(', ')}
       WHERE "id" = $${params.length}
       RETURNING *`,
      params,
    );

    if (!rows.length) {
      throw new NotFoundException(`Dock door with ID ${id} not found`);
    }
    return rows[0];
  }
}
