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

@ApiTags('Logistics - Packaging Types')
@Controller('logistics/packaging-types')
export class PackagingTypeController {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  @Get()
  @ApiOperation({ summary: 'Get all packaging types' })
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
        `SELECT * FROM "logistics_packaging_types" ${where} ORDER BY "code" ASC`,
        params,
      );
    } catch {
      return [];
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a packaging type by id' })
  async findOne(@Param('id') id: string): Promise<any> {
    try {
      const rows = await this.dataSource.query(
        `SELECT * FROM "logistics_packaging_types" WHERE "id" = $1 LIMIT 1`,
        [id],
      );
      return rows[0] || null;
    } catch {
      return null;
    }
  }

  @Post()
  @ApiOperation({ summary: 'Create a packaging type' })
  async create(@Body() data: any): Promise<any> {
    const rows = await this.dataSource.query(
      `INSERT INTO "logistics_packaging_types"
        ("code","name","type","material","dimensions","maxWeight","cost","reusable","recyclable","status")
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
      [
        data.code,
        data.name,
        data.type ?? 'Box',
        data.material ?? null,
        data.dimensions ?? null,
        data.maxWeight ?? 0,
        data.cost ?? 0,
        data.reusable ?? false,
        data.recyclable ?? false,
        data.status ?? 'Active',
      ],
    );
    return rows[0];
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a packaging type' })
  async update(@Param('id') id: string, @Body() data: any): Promise<any> {
    const rows = await this.dataSource.query(
      `UPDATE "logistics_packaging_types" SET
        "code" = COALESCE($2,"code"),
        "name" = COALESCE($3,"name"),
        "type" = COALESCE($4,"type"),
        "material" = COALESCE($5,"material"),
        "dimensions" = COALESCE($6,"dimensions"),
        "maxWeight" = COALESCE($7,"maxWeight"),
        "cost" = COALESCE($8,"cost"),
        "reusable" = COALESCE($9,"reusable"),
        "recyclable" = COALESCE($10,"recyclable"),
        "status" = COALESCE($11,"status"),
        "updatedAt" = now()
       WHERE "id" = $1
       RETURNING *`,
      [
        id,
        data.code ?? null,
        data.name ?? null,
        data.type ?? null,
        data.material ?? null,
        data.dimensions ?? null,
        data.maxWeight ?? null,
        data.cost ?? null,
        data.reusable ?? null,
        data.recyclable ?? null,
        data.status ?? null,
      ],
    );
    return rows[0] || null;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a packaging type' })
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.dataSource.query(
      `DELETE FROM "logistics_packaging_types" WHERE "id" = $1`,
      [id],
    );
    return { success: true };
  }
}
