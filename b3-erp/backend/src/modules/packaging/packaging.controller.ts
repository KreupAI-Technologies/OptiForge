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

@ApiTags('Packaging')
@Controller('packaging')
export class PackagingController {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  private async safeQuery(sql: string, params: any[] = []): Promise<any[]> {
    try {
      return await this.dataSource.query(sql, params);
    } catch {
      return [];
    }
  }

  // -------------------------------------------------------------------------
  // Packing Materials
  // -------------------------------------------------------------------------
  @Get('materials')
  @ApiOperation({ summary: 'List packing materials for a project' })
  async listMaterials(@Query('projectId') projectId?: string): Promise<any[]> {
    if (projectId) {
      return this.safeQuery(
        `SELECT * FROM "packaging_materials" WHERE "projectId" = $1 ORDER BY "name" ASC`,
        [projectId],
      );
    }
    return this.safeQuery(
      `SELECT * FROM "packaging_materials" ORDER BY "name" ASC`,
    );
  }

  @Post('materials')
  @ApiOperation({ summary: 'Create a packing material' })
  async createMaterial(@Body() data: any): Promise<any> {
    const rows = await this.dataSource.query(
      `INSERT INTO "packaging_materials"
        ("projectId","name","category","currentStock","required","unit","status")
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [
        data.projectId ?? null,
        data.name,
        data.category ?? 'Protection',
        data.currentStock ?? 0,
        data.required ?? 0,
        data.unit ?? 'pcs',
        data.status ?? 'Available',
      ],
    );
    return rows[0];
  }

  @Put('materials/:id')
  async updateMaterial(@Param('id') id: string, @Body() data: any): Promise<any> {
    const rows = await this.dataSource.query(
      `UPDATE "packaging_materials" SET
        "name" = COALESCE($2,"name"),
        "category" = COALESCE($3,"category"),
        "currentStock" = COALESCE($4,"currentStock"),
        "required" = COALESCE($5,"required"),
        "unit" = COALESCE($6,"unit"),
        "status" = COALESCE($7,"status"),
        "updatedAt" = now()
       WHERE "id" = $1 RETURNING *`,
      [
        id,
        data.name ?? null,
        data.category ?? null,
        data.currentStock ?? null,
        data.required ?? null,
        data.unit ?? null,
        data.status ?? null,
      ],
    );
    return rows[0] || null;
  }

  @Delete('materials/:id')
  async deleteMaterial(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.dataSource.query(
      `DELETE FROM "packaging_materials" WHERE "id" = $1`,
      [id],
    );
    return { success: true };
  }

  // -------------------------------------------------------------------------
  // Packing Jobs (operations)
  // -------------------------------------------------------------------------
  @Get('jobs')
  @ApiOperation({ summary: 'List packing jobs for a project' })
  async listJobs(@Query('projectId') projectId?: string): Promise<any[]> {
    if (projectId) {
      return this.safeQuery(
        `SELECT * FROM "packaging_jobs" WHERE "projectId" = $1 ORDER BY "createdAt" DESC`,
        [projectId],
      );
    }
    return this.safeQuery(
      `SELECT * FROM "packaging_jobs" ORDER BY "createdAt" DESC`,
    );
  }

  @Post('jobs')
  async createJob(@Body() data: any): Promise<any> {
    const rows = await this.dataSource.query(
      `INSERT INTO "packaging_jobs"
        ("projectId","woNumber","productName","quantity","status","packingTeam","startDate","completionDate","materialsUsed")
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [
        data.projectId ?? null,
        data.woNumber ?? null,
        data.productName ?? null,
        data.quantity ?? 0,
        data.status ?? 'In Queue',
        data.packingTeam ?? null,
        data.startDate ?? null,
        data.completionDate ?? null,
        JSON.stringify(data.materialsUsed ?? {}),
      ],
    );
    return rows[0];
  }

  @Put('jobs/:id')
  async updateJob(@Param('id') id: string, @Body() data: any): Promise<any> {
    const rows = await this.dataSource.query(
      `UPDATE "packaging_jobs" SET
        "status" = COALESCE($2,"status"),
        "packingTeam" = COALESCE($3,"packingTeam"),
        "startDate" = COALESCE($4,"startDate"),
        "completionDate" = COALESCE($5,"completionDate"),
        "materialsUsed" = COALESCE($6,"materialsUsed"),
        "updatedAt" = now()
       WHERE "id" = $1 RETURNING *`,
      [
        id,
        data.status ?? null,
        data.packingTeam ?? null,
        data.startDate ?? null,
        data.completionDate ?? null,
        data.materialsUsed !== undefined
          ? JSON.stringify(data.materialsUsed)
          : null,
      ],
    );
    return rows[0] || null;
  }

  // -------------------------------------------------------------------------
  // Staging items
  // -------------------------------------------------------------------------
  @Get('staging')
  @ApiOperation({ summary: 'List staged items for a project' })
  async listStaging(@Query('projectId') projectId?: string): Promise<any[]> {
    if (projectId) {
      return this.safeQuery(
        `SELECT * FROM "packaging_staging" WHERE "projectId" = $1 ORDER BY "stagedDate" DESC`,
        [projectId],
      );
    }
    return this.safeQuery(
      `SELECT * FROM "packaging_staging" ORDER BY "stagedDate" DESC`,
    );
  }

  @Post('staging')
  async createStaging(@Body() data: any): Promise<any> {
    const rows = await this.dataSource.query(
      `INSERT INTO "packaging_staging"
        ("projectId","woNumber","productName","quantity","packingComplete","shippingBillNumber","status","stagedDate","customerName","deliveryAddress","transportMethod")
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [
        data.projectId ?? null,
        data.woNumber ?? null,
        data.productName ?? null,
        data.quantity ?? 0,
        data.packingComplete ?? false,
        data.shippingBillNumber ?? null,
        data.status ?? 'Staging',
        data.stagedDate ?? null,
        data.customerName ?? null,
        data.deliveryAddress ?? null,
        data.transportMethod ?? 'Own Vehicle',
      ],
    );
    return rows[0];
  }

  @Put('staging/:id')
  async updateStaging(@Param('id') id: string, @Body() data: any): Promise<any> {
    const rows = await this.dataSource.query(
      `UPDATE "packaging_staging" SET
        "status" = COALESCE($2,"status"),
        "packingComplete" = COALESCE($3,"packingComplete"),
        "shippingBillNumber" = COALESCE($4,"shippingBillNumber"),
        "transportMethod" = COALESCE($5,"transportMethod"),
        "updatedAt" = now()
       WHERE "id" = $1 RETURNING *`,
      [
        id,
        data.status ?? null,
        data.packingComplete ?? null,
        data.shippingBillNumber ?? null,
        data.transportMethod ?? null,
      ],
    );
    return rows[0] || null;
  }

  // -------------------------------------------------------------------------
  // Shipping bills
  // -------------------------------------------------------------------------
  @Get('shipping-bills')
  @ApiOperation({ summary: 'List shipping bills for a project' })
  async listBills(@Query('projectId') projectId?: string): Promise<any[]> {
    if (projectId) {
      return this.safeQuery(
        `SELECT * FROM "packaging_shipping_bills" WHERE "projectId" = $1 ORDER BY "createdAt" DESC`,
        [projectId],
      );
    }
    return this.safeQuery(
      `SELECT * FROM "packaging_shipping_bills" ORDER BY "createdAt" DESC`,
    );
  }

  @Post('shipping-bills')
  async createBill(@Body() data: any): Promise<any> {
    const rows = await this.dataSource.query(
      `INSERT INTO "packaging_shipping_bills"
        ("projectId","billNumber","orderNumber","customerName","destination","items","totalPackages","totalWeight","status")
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [
        data.projectId ?? null,
        data.billNumber ?? null,
        data.orderNumber ?? null,
        data.customerName ?? null,
        data.destination ?? null,
        JSON.stringify(data.items ?? []),
        data.totalPackages ?? 0,
        data.totalWeight ?? null,
        data.status ?? 'Draft',
      ],
    );
    return rows[0];
  }

  @Put('shipping-bills/:id')
  async updateBill(@Param('id') id: string, @Body() data: any): Promise<any> {
    const rows = await this.dataSource.query(
      `UPDATE "packaging_shipping_bills" SET
        "status" = COALESCE($2,"status"),
        "items" = COALESCE($3,"items"),
        "totalPackages" = COALESCE($4,"totalPackages"),
        "totalWeight" = COALESCE($5,"totalWeight"),
        "updatedAt" = now()
       WHERE "id" = $1 RETURNING *`,
      [
        id,
        data.status ?? null,
        data.items !== undefined ? JSON.stringify(data.items) : null,
        data.totalPackages ?? null,
        data.totalWeight ?? null,
      ],
    );
    return rows[0] || null;
  }
}
