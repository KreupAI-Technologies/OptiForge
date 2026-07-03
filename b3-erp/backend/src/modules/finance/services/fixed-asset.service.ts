import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  FixedAsset,
  AssetStatus,
  DepreciationMethod,
} from '../entities/fixed-asset.entity';

export interface CreateFixedAssetDto {
  assetCode: string;
  assetName: string;
  description?: string;
  assetCategory: string;
  assetSubCategory?: string;
  acquisitionDate?: string;
  acquisitionCost: number;
  supplier?: string;
  depreciationMethod?: DepreciationMethod;
  usefulLifeYears: number;
  salvageValue?: number;
  depreciationStartDate?: string;
  accumulatedDepreciation?: number;
  netBookValue?: number;
  lastDepreciationDate?: string;
  nextDepreciationDate?: string;
  location?: string;
  department?: string;
  costCenter?: string;
  status?: AssetStatus;
  warrantyEndDate?: string;
  insuranceExpiryDate?: string;
  createdBy?: string;
}

export type UpdateFixedAssetDto = Partial<CreateFixedAssetDto>;

@Injectable()
export class FixedAssetService {
  constructor(
    @InjectRepository(FixedAsset)
    private readonly repo: Repository<FixedAsset>,
  ) {}

  private decorate(a: FixedAsset) {
    const cost = Number(a.acquisitionCost) || 0;
    const accum = Number(a.accumulatedDepreciation) || 0;
    const nbv =
      a.netBookValue !== null && a.netBookValue !== undefined
        ? Number(a.netBookValue)
        : cost - accum;
    return {
      id: a.id,
      assetCode: a.assetCode,
      assetName: a.assetName,
      category: a.assetCategory,
      location: a.location || '',
      purchaseDate: a.acquisitionDate,
      purchaseValue: cost,
      salvageValue: Number(a.salvageValue) || 0,
      usefulLife: a.usefulLifeYears,
      depreciationMethod: a.depreciationMethod,
      accumulatedDepreciation: accum,
      netBookValue: nbv,
      status: a.status,
      lastDepreciationDate: a.lastDepreciationDate || undefined,
      nextDepreciationDate: a.nextDepreciationDate || undefined,
      warrantyExpiry: a.warrantyEndDate || undefined,
      insuranceExpiry: a.insuranceExpiryDate || undefined,
      department: a.department || '',
      description: a.description || '',
    };
  }

  async findAll(filters?: {
    status?: string;
    category?: string;
    search?: string;
  }): Promise<any[]> {
    const qb = this.repo.createQueryBuilder('a');
    if (filters?.status && filters.status !== 'all') {
      qb.andWhere('a.status = :status', { status: filters.status });
    }
    if (filters?.category && filters.category !== 'all') {
      qb.andWhere('a.assetCategory = :cat', { cat: filters.category });
    }
    if (filters?.search) {
      qb.andWhere('(a.assetName ILIKE :s OR a.assetCode ILIKE :s)', {
        s: `%${filters.search}%`,
      });
    }
    qb.orderBy('a.acquisitionDate', 'DESC');
    const rows = await qb.getMany();
    return rows.map((r) => this.decorate(r));
  }

  async findOne(id: string): Promise<any> {
    const a = await this.repo.findOne({ where: { id } });
    if (!a) throw new NotFoundException(`Fixed asset ${id} not found`);
    return this.decorate(a);
  }

  async create(dto: CreateFixedAssetDto): Promise<any> {
    const cost = Number(dto.acquisitionCost) || 0;
    const accum = Number(dto.accumulatedDepreciation) || 0;
    const entity = this.repo.create({
      ...dto,
      acquisitionDate: dto.acquisitionDate
        ? new Date(dto.acquisitionDate)
        : new Date(),
      depreciationStartDate: dto.depreciationStartDate
        ? new Date(dto.depreciationStartDate)
        : new Date(),
      lastDepreciationDate: dto.lastDepreciationDate
        ? new Date(dto.lastDepreciationDate)
        : undefined,
      nextDepreciationDate: dto.nextDepreciationDate
        ? new Date(dto.nextDepreciationDate)
        : undefined,
      warrantyEndDate: dto.warrantyEndDate
        ? new Date(dto.warrantyEndDate)
        : undefined,
      insuranceExpiryDate: dto.insuranceExpiryDate
        ? new Date(dto.insuranceExpiryDate)
        : undefined,
      depreciationMethod:
        dto.depreciationMethod ?? DepreciationMethod.STRAIGHT_LINE,
      status: dto.status ?? AssetStatus.ACTIVE,
      usefulLifeMonths: (dto.usefulLifeYears || 1) * 12,
      accumulatedDepreciation: accum,
      netBookValue: dto.netBookValue ?? cost - accum,
    });
    const saved = await this.repo.save(entity);
    return this.decorate(saved);
  }

  async update(id: string, dto: UpdateFixedAssetDto): Promise<any> {
    const a = await this.repo.findOne({ where: { id } });
    if (!a) throw new NotFoundException(`Fixed asset ${id} not found`);
    Object.assign(a, {
      ...dto,
      acquisitionDate: dto.acquisitionDate
        ? new Date(dto.acquisitionDate)
        : a.acquisitionDate,
      lastDepreciationDate: dto.lastDepreciationDate
        ? new Date(dto.lastDepreciationDate)
        : a.lastDepreciationDate,
      nextDepreciationDate: dto.nextDepreciationDate
        ? new Date(dto.nextDepreciationDate)
        : a.nextDepreciationDate,
      warrantyEndDate: dto.warrantyEndDate
        ? new Date(dto.warrantyEndDate)
        : a.warrantyEndDate,
      insuranceExpiryDate: dto.insuranceExpiryDate
        ? new Date(dto.insuranceExpiryDate)
        : a.insuranceExpiryDate,
    });
    a.netBookValue =
      Number(a.acquisitionCost) - Number(a.accumulatedDepreciation);
    const saved = await this.repo.save(a);
    return this.decorate(saved);
  }

  async remove(id: string): Promise<void> {
    const result = await this.repo.delete(id);
    if (!result.affected)
      throw new NotFoundException(`Fixed asset ${id} not found`);
  }

  // Aggregated dashboard/summary for the assets landing page.
  async getSummary(): Promise<any> {
    const rows = await this.repo.find();
    const byCategoryMap = new Map<
      string,
      { category: string; count: number; cost: number; nbv: number; depreciation: number }
    >();
    let totalCost = 0;
    let totalNbv = 0;
    let totalDep = 0;
    for (const a of rows) {
      const cost = Number(a.acquisitionCost) || 0;
      const dep = Number(a.accumulatedDepreciation) || 0;
      const nbv =
        a.netBookValue !== null && a.netBookValue !== undefined
          ? Number(a.netBookValue)
          : cost - dep;
      totalCost += cost;
      totalNbv += nbv;
      totalDep += dep;
      const key = a.assetCategory || 'Uncategorised';
      const entry =
        byCategoryMap.get(key) ??
        { category: key, count: 0, cost: 0, nbv: 0, depreciation: 0 };
      entry.count += 1;
      entry.cost += cost;
      entry.nbv += nbv;
      entry.depreciation += dep;
      byCategoryMap.set(key, entry);
    }
    return {
      summary: {
        totalAssets: rows.length,
        totalCost,
        totalNetBookValue: totalNbv,
        totalDepreciation: totalDep,
        activeAssets: rows.filter((a) => a.status === AssetStatus.ACTIVE).length,
      },
      byCategory: Array.from(byCategoryMap.values()),
    };
  }
}
