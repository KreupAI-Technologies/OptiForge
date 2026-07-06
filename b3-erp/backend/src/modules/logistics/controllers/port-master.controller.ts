import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@ApiTags('Logistics - Port Master')
@Controller('logistics/ports')
export class PortMasterController {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  @Get()
  @ApiOperation({ summary: 'Get all ports' })
  async findAll(
    @Query('type') type?: string,
    @Query('status') status?: string,
  ): Promise<any[]> {
    try {
      const clauses: string[] = [];
      const params: any[] = [];
      if (type) {
        params.push(type);
        clauses.push(`"type" = $${params.length}`);
      }
      if (status) {
        params.push(status);
        clauses.push(`"status" = $${params.length}`);
      }
      const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
      return await this.dataSource.query(
        `SELECT * FROM "logistics_ports" ${where} ORDER BY "code" ASC`,
        params,
      );
    } catch {
      return [];
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a port by id' })
  async findOne(@Param('id') id: string): Promise<any> {
    try {
      const rows = await this.dataSource.query(
        `SELECT * FROM "logistics_ports" WHERE "id" = $1 LIMIT 1`,
        [id],
      );
      return rows[0] || null;
    } catch {
      return null;
    }
  }

  @Post()
  @ApiOperation({ summary: 'Create a port' })
  async create(@Body() data: any): Promise<any> {
    const rows = await this.dataSource.query(
      `INSERT INTO "logistics_ports"
        ("code","name","portCode","type","country","state","city","facilities","customsAvailable","status")
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
      [
        data.code,
        data.name,
        data.portCode ?? null,
        data.type ?? 'Seaport',
        data.country ?? null,
        data.state ?? null,
        data.city ?? null,
        JSON.stringify(data.facilities ?? []),
        data.customsAvailable ?? false,
        data.status ?? 'Active',
      ],
    );
    return rows[0];
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a port' })
  async update(@Param('id') id: string, @Body() data: any): Promise<any> {
    const rows = await this.dataSource.query(
      `UPDATE "logistics_ports" SET
        "code" = COALESCE($2,"code"),
        "name" = COALESCE($3,"name"),
        "portCode" = COALESCE($4,"portCode"),
        "type" = COALESCE($5,"type"),
        "country" = COALESCE($6,"country"),
        "state" = COALESCE($7,"state"),
        "city" = COALESCE($8,"city"),
        "facilities" = COALESCE($9,"facilities"),
        "customsAvailable" = COALESCE($10,"customsAvailable"),
        "status" = COALESCE($11,"status"),
        "updatedAt" = now()
       WHERE "id" = $1
       RETURNING *`,
      [
        id,
        data.code ?? null,
        data.name ?? null,
        data.portCode ?? null,
        data.type ?? null,
        data.country ?? null,
        data.state ?? null,
        data.city ?? null,
        data.facilities !== undefined ? JSON.stringify(data.facilities) : null,
        data.customsAvailable ?? null,
        data.status ?? null,
      ],
    );
    return rows[0] || null;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a port' })
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.dataSource.query(`DELETE FROM "logistics_ports" WHERE "id" = $1`, [
      id,
    ]);
    return { success: true };
  }
}
