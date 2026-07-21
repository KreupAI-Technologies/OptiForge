import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PmMrpMaterialEntity } from '../entities/pm-mrp-material.entity';

@Injectable()
export class PmMrpService {
  constructor(
    @InjectRepository(PmMrpMaterialEntity)
    private readonly repo: Repository<PmMrpMaterialEntity>,
  ) {}

  async findAll(companyId = 'default', status?: string): Promise<PmMrpMaterialEntity[]> {
    const where: any = { companyId };
    if (status) where.status = status;
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<PmMrpMaterialEntity> {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException(`MRP material ${id} not found`);
    return row;
  }

  async create(data: Partial<PmMrpMaterialEntity>): Promise<PmMrpMaterialEntity> {
    const row = this.repo.create({ companyId: 'default', ...data });
    return this.repo.save(row);
  }

  async update(id: string, data: Partial<PmMrpMaterialEntity>): Promise<PmMrpMaterialEntity> {
    const row = await this.findOne(id);
    const { id: _id, createdAt, updatedAt, ...rest } = data as any;
    Object.assign(row, rest);
    return this.repo.save(row);
  }

  async remove(id: string): Promise<void> {
    const result = await this.repo.delete(id);
    if (result.affected === 0) throw new NotFoundException(`MRP material ${id} not found`);
  }

  // Aggregated MRP report across all materials for a company.
  async report(companyId = 'default') {
    const rows = await this.repo.find({ where: { companyId } });
    const num = (v: any) => Number(v ?? 0);
    const byStatus: Record<string, number> = {};
    const byCategory: Record<string, { items: number; totalCost: number; shortfallQty: number }> = {};
    let totalRequired = 0;
    let totalAvailable = 0;
    let totalCost = 0;
    let shortfallItems = 0;
    let shortfallValue = 0;

    for (const r of rows) {
      const required = num(r.requiredQuantity);
      const available = num(r.availableStock);
      const unitCost = num(r.unitCost);
      const lineCost = num(r.totalCost) || required * unitCost;
      const status = r.status || 'Unknown';
      const category = r.category || 'Uncategorized';

      byStatus[status] = (byStatus[status] || 0) + 1;
      if (!byCategory[category]) byCategory[category] = { items: 0, totalCost: 0, shortfallQty: 0 };
      byCategory[category].items += 1;
      byCategory[category].totalCost += lineCost;

      totalRequired += required;
      totalAvailable += available;
      totalCost += lineCost;

      const shortfall = Math.max(0, required - available);
      if (shortfall > 0) {
        shortfallItems += 1;
        shortfallValue += shortfall * unitCost;
        byCategory[category].shortfallQty += shortfall;
      }
    }

    return {
      companyId,
      generatedAt: new Date().toISOString(),
      summary: {
        totalItems: rows.length,
        totalRequired,
        totalAvailable,
        totalCost,
        shortfallItems,
        shortfallValue,
      },
      byStatus,
      byCategory: Object.entries(byCategory).map(([category, v]) => ({ category, ...v })),
    };
  }

  // Simple demand forecast for a single material using its lead time and
  // required quantity as a naive per-period baseline.
  async forecast(id: string, periods = 6) {
    const row = await this.findOne(id);
    const num = (v: any) => Number(v ?? 0);
    const baseline = num(row.requiredQuantity);
    const leadTime = num(row.leadTime);
    const safetyStock = Math.ceil(baseline * 0.1);
    const projections = Array.from({ length: Math.max(1, periods) }, (_, i) => {
      // Naive linear growth of 5% per period to give a non-flat, empty-safe curve.
      const projectedDemand = Math.round(baseline * (1 + 0.05 * i));
      return {
        period: i + 1,
        projectedDemand,
        reorderPoint: projectedDemand + safetyStock,
      };
    });

    return {
      materialId: row.id,
      itemCode: row.itemCode,
      itemName: row.itemName,
      unit: row.unit,
      baselineDemand: baseline,
      leadTimeDays: leadTime,
      safetyStock,
      periods: Math.max(1, periods),
      projections,
    };
  }

  // Build a purchase-order shell from an MRP material's shortfall.
  // Computed only — not persisted (no PR/PO relationship is assumed here).
  async generatePo(id: string, opts: { supplier?: string; requestedBy?: string }) {
    const row = await this.findOne(id);
    const num = (v: any) => Number(v ?? 0);
    const required = num(row.requiredQuantity);
    const available = num(row.availableStock);
    const shortfall = Math.max(0, required - available);
    const unitCost = num(row.unitCost);

    return {
      draft: true,
      materialId: row.id,
      supplier: opts.supplier || row.supplier || 'TBD',
      requestedBy: opts.requestedBy || 'system',
      requiredDate: row.requiredDate,
      lines: shortfall > 0
        ? [{
            itemCode: row.itemCode,
            itemName: row.itemName,
            unit: row.unit,
            quantity: shortfall,
            unitCost,
            lineTotal: shortfall * unitCost,
          }]
        : [],
      totalQuantity: shortfall,
      estimatedTotal: shortfall * unitCost,
      note: shortfall > 0
        ? 'PO shell generated from MRP shortfall. Persist via the procurement module to create an actual PR/PO.'
        : 'No shortfall for this material; nothing to order.',
    };
  }
}
