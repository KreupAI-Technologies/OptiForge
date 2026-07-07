import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ProductionVariance,
  VarianceCategory,
} from '../entities/production-variance.entity';

@Injectable()
export class ProductionVarianceService {
  constructor(
    @InjectRepository(ProductionVariance)
    private readonly varianceRepository: Repository<ProductionVariance>,
  ) {}

  async create(dto: Partial<ProductionVariance>): Promise<ProductionVariance> {
    const record = this.varianceRepository.create(dto);
    return this.varianceRepository.save(record);
  }

  async findAll(filters?: {
    companyId?: string;
    category?: VarianceCategory;
    status?: string;
  }): Promise<ProductionVariance[]> {
    const query = this.varianceRepository.createQueryBuilder('v');

    if (filters?.companyId) {
      query.andWhere('v.companyId = :companyId', { companyId: filters.companyId });
    }
    if (filters?.category) {
      query.andWhere('v.category = :category', { category: filters.category });
    }
    if (filters?.status) {
      query.andWhere('v.status = :status', { status: filters.status });
    }
    query.andWhere('v.isActive = :isActive', { isActive: true });
    query.orderBy('v.createdAt', 'DESC');
    return query.getMany();
  }

  async findOne(id: string): Promise<ProductionVariance> {
    const record = await this.varianceRepository.findOne({ where: { id } });
    if (!record) {
      throw new NotFoundException(`Production variance ${id} not found`);
    }
    return record;
  }

  async update(id: string, dto: Partial<ProductionVariance>): Promise<ProductionVariance> {
    const record = await this.findOne(id);
    Object.assign(record, dto);
    return this.varianceRepository.save(record);
  }

  async remove(id: string): Promise<void> {
    const record = await this.findOne(id);
    record.isActive = false;
    await this.varianceRepository.save(record);
  }

  /**
   * Aggregate variance summary across all categories for the KPI header.
   * Favorable = variance improves outcome (cost lower / early / higher yield /
   * higher quality). Amounts are signed impact costs (negative = adverse).
   */
  async getSummary(companyId: string): Promise<any> {
    const records = await this.findAll({ companyId });

    const favorableStatuses = new Set(['favorable', 'on-time', 'early', 'acceptable']);

    let favorableVariances = 0;
    let unfavorableVariances = 0;
    const byCategoryAmount: Record<VarianceCategory, number> = {
      cost: 0,
      schedule: 0,
      quantity: 0,
      quality: 0,
    };

    records.forEach((r) => {
      if (favorableStatuses.has(r.status)) favorableVariances++;
      else unfavorableVariances++;

      const impact = Number(r.impactCost) || 0;
      // Favorable impact is a saving (positive), adverse is a loss (negative).
      const signed = favorableStatuses.has(r.status) ? Math.abs(impact) : -Math.abs(impact);
      if (byCategoryAmount[r.category] !== undefined) {
        byCategoryAmount[r.category] += signed;
      }
    });

    const totalVarianceAmount =
      byCategoryAmount.cost +
      byCategoryAmount.schedule +
      byCategoryAmount.quantity +
      byCategoryAmount.quality;

    return {
      totalVariances: records.length,
      favorableVariances,
      unfavorableVariances,
      totalVarianceAmount,
      costVariance: byCategoryAmount.cost,
      scheduleVariance: byCategoryAmount.schedule,
      quantityVariance: byCategoryAmount.quantity,
      qualityVariance: byCategoryAmount.quality,
    };
  }
}
