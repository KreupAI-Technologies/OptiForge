import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CostEstimate,
  CostEstimateItem,
  CostEstimateStatus,
} from '../entities/cost-estimate.entity';
import { EstimateVersion } from '../entities/estimate-template.entity';

@Injectable()
export class CostEstimateService {
  constructor(
    @InjectRepository(CostEstimate)
    private costEstimateRepository: Repository<CostEstimate>,
    @InjectRepository(CostEstimateItem)
    private costEstimateItemRepository: Repository<CostEstimateItem>,
    @InjectRepository(EstimateVersion)
    private estimateVersionRepository: Repository<EstimateVersion>,
  ) {}

  async create(
    companyId: string,
    data: Partial<CostEstimate>,
    items?: Partial<CostEstimateItem>[],
  ): Promise<CostEstimate> {
    const estimateNumber = await this.generateEstimateNumber(companyId);

    const estimate = this.costEstimateRepository.create({
      ...data,
      companyId,
      estimateNumber,
    });

    const savedEstimate = await this.costEstimateRepository.save(estimate);

    if (items && items.length > 0) {
      const estimateItems = items.map((item) =>
        this.costEstimateItemRepository.create({
          ...item,
          costEstimateId: savedEstimate.id,
        }),
      );
      await this.costEstimateItemRepository.save(estimateItems);
      await this.recalculateTotals(savedEstimate.id);
    }

    return this.findOne(companyId, savedEstimate.id);
  }

  async findAll(
    companyId: string,
    filters?: {
      status?: CostEstimateStatus;
      customerId?: string;
      fromDate?: string;
      toDate?: string;
    },
  ): Promise<CostEstimate[]> {
    const query = this.costEstimateRepository
      .createQueryBuilder('estimate')
      .where('estimate.companyId = :companyId', { companyId })
      .orderBy('estimate.createdAt', 'DESC');

    if (filters?.status) {
      query.andWhere('estimate.status = :status', { status: filters.status });
    }
    if (filters?.customerId) {
      query.andWhere('estimate.customerId = :customerId', {
        customerId: filters.customerId,
      });
    }
    if (filters?.fromDate) {
      query.andWhere('estimate.createdAt >= :fromDate', {
        fromDate: filters.fromDate,
      });
    }
    if (filters?.toDate) {
      query.andWhere('estimate.createdAt <= :toDate', {
        toDate: filters.toDate,
      });
    }

    return query.getMany();
  }

  async findOne(companyId: string, id: string): Promise<CostEstimate> {
    const estimate = await this.costEstimateRepository.findOne({
      where: { id, companyId },
      relations: ['boq'],
    });
    if (!estimate) {
      throw new NotFoundException(`Cost Estimate with ID ${id} not found`);
    }
    return estimate;
  }

  async findItems(costEstimateId: string): Promise<CostEstimateItem[]> {
    return this.costEstimateItemRepository.find({
      where: { costEstimateId },
      order: { itemNumber: 'ASC' },
    });
  }

  async update(
    companyId: string,
    id: string,
    data: Partial<CostEstimate>,
  ): Promise<CostEstimate> {
    const estimate = await this.findOne(companyId, id);
    Object.assign(estimate, data);
    await this.costEstimateRepository.save(estimate);
    return this.findOne(companyId, id);
  }

  async updateItems(
    costEstimateId: string,
    items: Partial<CostEstimateItem>[],
  ): Promise<CostEstimateItem[]> {
    await this.costEstimateItemRepository.delete({ costEstimateId });

    const newItems = items.map((item) =>
      this.costEstimateItemRepository.create({
        ...item,
        costEstimateId,
      }),
    );

    const savedItems = await this.costEstimateItemRepository.save(newItems);
    await this.recalculateTotals(costEstimateId);
    return savedItems;
  }

  async delete(companyId: string, id: string): Promise<void> {
    const estimate = await this.findOne(companyId, id);
    await this.costEstimateRepository.remove(estimate);
  }

  async submitForApproval(
    companyId: string,
    id: string,
    submittedBy: string,
  ): Promise<CostEstimate> {
    const estimate = await this.findOne(companyId, id);
    estimate.status = CostEstimateStatus.PENDING_APPROVAL;
    estimate.submittedBy = submittedBy;
    estimate.submittedAt = new Date();
    return this.costEstimateRepository.save(estimate);
  }

  async approve(
    companyId: string,
    id: string,
    approvedBy: string,
    notes?: string,
  ): Promise<CostEstimate> {
    const estimate = await this.findOne(companyId, id);
    estimate.status = CostEstimateStatus.APPROVED;
    estimate.approvedBy = approvedBy;
    estimate.approvedAt = new Date();
    if (notes !== undefined) estimate.approvalNotes = notes;
    return this.costEstimateRepository.save(estimate);
  }

  async reject(
    companyId: string,
    id: string,
    rejectedBy: string,
    notes?: string,
  ): Promise<CostEstimate> {
    const estimate = await this.findOne(companyId, id);
    estimate.status = CostEstimateStatus.REJECTED;
    if (notes !== undefined) estimate.approvalNotes = notes;
    return this.costEstimateRepository.save(estimate);
  }

  async createVersion(
    companyId: string,
    id: string,
    createdBy: string,
  ): Promise<CostEstimate> {
    const original = await this.findOne(companyId, id);
    const items = await this.findItems(id);

    const { id: _, estimateNumber, version, ...estimateData } = original;
    const newVersion = await this.create(
      companyId,
      {
        ...estimateData,
        version: version + 1,
        parentEstimateId: id,
        status: CostEstimateStatus.DRAFT,
        createdBy,
      },
      items.map(({ id: __, costEstimateId, ...itemData }) => itemData),
    );

    return newVersion;
  }

  async getCostBreakdown(companyId: string, id: string): Promise<{
    materialCost: number;
    laborCost: number;
    equipmentCost: number;
    overheadCost: number;
    subcontractorCost: number;
    directCost: number;
    indirectCost: number;
    contingency: number;
    totalCost: number;
    breakdown: { category: string; amount: number; percentage: number }[];
  }> {
    const estimate = await this.findOne(companyId, id);

    const breakdown = [
      { category: 'Material', amount: Number(estimate.materialCost) },
      { category: 'Labor', amount: Number(estimate.laborCost) },
      { category: 'Equipment', amount: Number(estimate.equipmentCost) },
      { category: 'Overhead', amount: Number(estimate.overheadCost) },
      { category: 'Subcontractor', amount: Number(estimate.subcontractorCost) },
      { category: 'Contingency', amount: Number(estimate.contingency) },
    ];

    const totalCost = Number(estimate.totalCost) || 1;

    return {
      materialCost: Number(estimate.materialCost),
      laborCost: Number(estimate.laborCost),
      equipmentCost: Number(estimate.equipmentCost),
      overheadCost: Number(estimate.overheadCost),
      subcontractorCost: Number(estimate.subcontractorCost),
      directCost: Number(estimate.directCost),
      indirectCost: Number(estimate.indirectCost),
      contingency: Number(estimate.contingency),
      totalCost: Number(estimate.totalCost),
      breakdown: breakdown.map((b) => ({
        ...b,
        percentage: (b.amount / totalCost) * 100,
      })),
    };
  }

  async findVersions(
    companyId: string,
    estimateId: string,
  ): Promise<EstimateVersion[]> {
    return this.estimateVersionRepository.find({
      where: { companyId, estimateId },
      order: { versionNumber: 'DESC', createdAt: 'DESC' },
    });
  }

  private async resolveComparable(
    companyId: string,
    id: string,
  ): Promise<{
    id: string;
    label: string;
    total: number;
    items: { key: string; description: string; total: number }[];
  }> {
    // Prefer a version snapshot; fall back to a CostEstimate row.
    const version = await this.estimateVersionRepository.findOne({
      where: { id, companyId },
    });
    if (version) {
      const snapshot = (version.snapshot || {}) as Record<string, unknown>;
      const total =
        version.newTotal != null
          ? Number(version.newTotal)
          : Number((snapshot as { totalCost?: number }).totalCost) || 0;
      const rawItems = Array.isArray(
        (snapshot as { items?: unknown[] }).items,
      )
        ? ((snapshot as { items: Record<string, unknown>[] }).items)
        : [];
      const items = rawItems.map((it, idx) => ({
        key: String(
          (it as { itemNumber?: string }).itemNumber ??
            (it as { id?: string }).id ??
            idx,
        ),
        description: String((it as { description?: string }).description ?? ''),
        total: Number((it as { totalCost?: number }).totalCost) || 0,
      }));
      return {
        id: version.id,
        label: `v${version.versionNumber}`,
        total,
        items,
      };
    }

    const estimate = await this.costEstimateRepository.findOne({
      where: { id, companyId },
    });
    if (!estimate) {
      throw new NotFoundException(
        `Estimate or version with ID ${id} not found`,
      );
    }
    const estimateItems = await this.findItems(id);
    return {
      id: estimate.id,
      label: `${estimate.estimateNumber} v${estimate.version}`,
      total: Number(estimate.totalCost) || 0,
      items: estimateItems.map((it) => ({
        key: it.itemNumber,
        description: it.description,
        total: Number(it.totalCost) || 0,
      })),
    };
  }

  async compareDiff(
    companyId: string,
    baseId: string,
    targetId: string,
  ): Promise<{
    base: { id: string; label: string; total: number };
    target: { id: string; label: string; total: number };
    totals: {
      baseTotal: number;
      targetTotal: number;
      deltaValue: number;
      deltaPct: number;
    };
    changed: {
      key: string;
      description: string;
      changeType: 'added' | 'removed' | 'changed';
      baseTotal: number;
      targetTotal: number;
      deltaValue: number;
    }[];
  }> {
    const base = await this.resolveComparable(companyId, baseId);
    const target = await this.resolveComparable(companyId, targetId);

    const deltaValue = target.total - base.total;
    const deltaPct = base.total !== 0 ? (deltaValue / base.total) * 100 : 0;

    const baseMap = new Map(base.items.map((i) => [i.key, i]));
    const targetMap = new Map(target.items.map((i) => [i.key, i]));
    const keys = new Set([...baseMap.keys(), ...targetMap.keys()]);

    const changed: {
      key: string;
      description: string;
      changeType: 'added' | 'removed' | 'changed';
      baseTotal: number;
      targetTotal: number;
      deltaValue: number;
    }[] = [];

    for (const key of keys) {
      const b = baseMap.get(key);
      const t = targetMap.get(key);
      if (b && !t) {
        changed.push({
          key,
          description: b.description,
          changeType: 'removed',
          baseTotal: b.total,
          targetTotal: 0,
          deltaValue: -b.total,
        });
      } else if (!b && t) {
        changed.push({
          key,
          description: t.description,
          changeType: 'added',
          baseTotal: 0,
          targetTotal: t.total,
          deltaValue: t.total,
        });
      } else if (b && t && b.total !== t.total) {
        changed.push({
          key,
          description: t.description || b.description,
          changeType: 'changed',
          baseTotal: b.total,
          targetTotal: t.total,
          deltaValue: t.total - b.total,
        });
      }
    }

    return {
      base: { id: base.id, label: base.label, total: base.total },
      target: { id: target.id, label: target.label, total: target.total },
      totals: {
        baseTotal: base.total,
        targetTotal: target.total,
        deltaValue,
        deltaPct,
      },
      changed,
    };
  }

  private async recalculateTotals(costEstimateId: string): Promise<void> {
    const items = await this.costEstimateItemRepository.find({
      where: { costEstimateId },
    });

    let materialCost = 0;
    let laborCost = 0;
    let equipmentCost = 0;
    let overheadCost = 0;
    let subcontractorCost = 0;

    items.forEach((item) => {
      const cost = Number(item.totalCost);
      switch (item.costType) {
        case 'Material':
          materialCost += cost;
          break;
        case 'Labor':
          laborCost += cost;
          break;
        case 'Equipment':
          equipmentCost += cost;
          break;
        case 'Overhead':
          overheadCost += cost;
          break;
        case 'Subcontractor':
          subcontractorCost += cost;
          break;
      }
    });

    const directCost =
      materialCost + laborCost + equipmentCost + subcontractorCost;
    const indirectCost = overheadCost;
    const estimate = await this.costEstimateRepository.findOne({
      where: { id: costEstimateId },
    });

    if (estimate) {
      const contingency =
        (directCost + indirectCost) *
        (Number(estimate.contingencyPercentage) / 100);
      const totalCost = directCost + indirectCost + contingency;

      await this.costEstimateRepository.update(costEstimateId, {
        materialCost,
        laborCost,
        equipmentCost,
        overheadCost,
        subcontractorCost,
        directCost,
        indirectCost,
        contingency,
        totalCost,
      });
    }
  }

  private async generateEstimateNumber(companyId: string): Promise<string> {
    const count = await this.costEstimateRepository.count({
      where: { companyId },
    });
    const year = new Date().getFullYear();
    return `EST-${year}-${String(count + 1).padStart(5, '0')}`;
  }
}
