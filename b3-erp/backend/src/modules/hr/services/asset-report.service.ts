import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssetItem } from '../entities/asset-item.entity';
import { AssetInventory } from '../entities/asset-inventory.entity';

/** HR Asset Reports (orphan-endpoint build) — read-only aggregations over hr_asset_items / hr_asset_inventory. */
@Injectable()
export class AssetReportService {
  constructor(
    @InjectRepository(AssetItem) private readonly items: Repository<AssetItem>,
    @InjectRepository(AssetInventory) private readonly inventory: Repository<AssetInventory>,
  ) {}

  private num(v: unknown): number {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }

  async register(companyId: string) {
    const rows = await this.items.find({ where: { companyId }, order: { assetTag: 'ASC' } });
    return rows.map((a) => ({
      assetTag: a.assetTag ?? '',
      assetName: a.item ?? a.model ?? a.brand ?? a.assetClass ?? '',
      category: a.category ?? a.assetClass ?? '',
      brand: a.brand ?? '',
      serialNumber: a.serialNumber ?? '',
      purchaseDate: a.purchaseDate ?? '',
      purchaseCost: this.num(a.cost),
      assignedTo: a.assignedTo ?? undefined,
      department: a.department ?? undefined,
      location: a.location ?? '',
      warranty: a.warranty ?? '',
      status: a.status === 'retired' || a.status === 'maintenance' ? a.status : 'active',
      condition: a.condition ?? 'good',
    }));
  }

  async byEmployee(companyId: string) {
    const rows = await this.items.find({ where: { companyId } });
    const map = new Map<string, any>();
    for (const a of rows) {
      if (!a.assignedTo && !a.employeeCode) continue;
      const key = a.employeeCode || a.assignedTo || 'unknown';
      if (!map.has(key)) {
        map.set(key, { employeeName: a.assignedTo ?? '', employeeCode: a.employeeCode ?? '', department: a.department ?? '', designation: '', furniture: [] as string[], totalAssets: 0, totalValue: 0, location: a.location ?? '' });
      }
      const rec = map.get(key);
      const cls = (a.assetClass || a.category || '').toLowerCase();
      const label = a.assetTag || a.model || a.item || '';
      if (cls.includes('laptop')) rec.laptop = label;
      else if (cls.includes('desktop')) rec.desktop = label;
      else if (cls.includes('mobile')) rec.mobile = label;
      else if (cls.includes('monitor')) rec.monitor = label;
      else if (cls.includes('furniture')) rec.furniture.push(label);
      rec.totalAssets += 1;
      rec.totalValue += this.num(a.cost);
      if (!rec.location && a.location) rec.location = a.location;
    }
    return Array.from(map.values());
  }

  async byDepartment(companyId: string) {
    const rows = await this.items.find({ where: { companyId } });
    const map = new Map<string, any>();
    for (const a of rows) {
      const dep = a.department || 'Unassigned';
      if (!map.has(dep)) {
        map.set(dep, { department: dep, employees: new Set<string>(), laptops: 0, desktops: 0, mobiles: 0, monitors: 0, furniture: 0, totalValue: 0 });
      }
      const rec = map.get(dep);
      if (a.employeeCode || a.assignedTo) rec.employees.add(a.employeeCode || a.assignedTo);
      const cls = (a.assetClass || a.category || '').toLowerCase();
      if (cls.includes('laptop')) rec.laptops += 1;
      else if (cls.includes('desktop')) rec.desktops += 1;
      else if (cls.includes('mobile')) rec.mobiles += 1;
      else if (cls.includes('monitor')) rec.monitors += 1;
      else if (cls.includes('furniture')) rec.furniture += 1;
      rec.totalValue += this.num(a.cost);
    }
    return Array.from(map.values()).map((r) => {
      const employees = r.employees.size;
      const totalAssets = r.laptops + r.desktops + r.mobiles + r.monitors + r.furniture;
      return { department: r.department, employees, laptops: r.laptops, desktops: r.desktops, mobiles: r.mobiles, monitors: r.monitors, furniture: r.furniture, totalValue: r.totalValue, assetsPerEmployee: employees ? Math.round((totalAssets / employees) * 100) / 100 : 0 };
    });
  }

  async costs(companyId: string) {
    const rows = await this.items.find({ where: { companyId } });
    const map = new Map<string, any>();
    for (const a of rows) {
      const cat = a.category || a.assetClass || 'Other';
      if (!map.has(cat)) map.set(cat, { category: cat, purchaseCost: 0, maintenanceCost: 0 });
      map.get(cat).purchaseCost += this.num(a.cost);
    }
    return Array.from(map.values()).map((r) => {
      const totalCost = r.purchaseCost + r.maintenanceCost;
      return { category: r.category, purchaseCost: r.purchaseCost, maintenanceCost: r.maintenanceCost, totalCost, monthlyAvg: Math.round((totalCost / 12) * 100) / 100, trend: 'up' as const };
    });
  }

  async allocation(companyId: string) {
    const inv = await this.inventory.find({ where: { companyId } });
    if (inv.length) {
      return inv.map((i) => {
        const total = this.num(i.totalQuantity);
        const allocated = this.num(i.allocated);
        const available = this.num(i.available);
        return { category: i.category ?? i.assetName ?? '', total, allocated, available, maintenance: Math.max(0, total - allocated - available), utilization: total ? Math.round((allocated / total) * 100) : 0 };
      });
    }
    const rows = await this.items.find({ where: { companyId } });
    const map = new Map<string, any>();
    for (const a of rows) {
      const cat = a.category || a.assetClass || 'Other';
      if (!map.has(cat)) map.set(cat, { category: cat, total: 0, allocated: 0, available: 0, maintenance: 0 });
      const rec = map.get(cat);
      rec.total += 1;
      if (a.status === 'maintenance') rec.maintenance += 1;
      else if (a.assignedTo || a.status === 'allocated') rec.allocated += 1;
      else rec.available += 1;
    }
    return Array.from(map.values()).map((r) => ({ ...r, utilization: r.total ? Math.round((r.allocated / r.total) * 100) : 0 }));
  }
}
