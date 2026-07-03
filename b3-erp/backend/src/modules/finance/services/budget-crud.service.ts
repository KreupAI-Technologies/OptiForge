import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Budget, BudgetStatus, BudgetType } from '../entities/budget.entity';

export interface CreateBudgetDto {
  budgetCode: string;
  budgetName: string;
  financialYearId?: string;
  budgetType?: BudgetType;
  startDate?: string;
  endDate?: string;
  status?: BudgetStatus;
  department?: string;
  costCenter?: string;
  project?: string;
  location?: string;
  totalBudgetedAmount?: number;
  totalActualAmount?: number;
  description?: string;
  approvedBy?: string;
  approvedAt?: string;
  version?: number;
  notes?: string;
  createdBy?: string;
}

export type UpdateBudgetDto = Partial<CreateBudgetDto>;

@Injectable()
export class BudgetCrudService {
  constructor(
    @InjectRepository(Budget)
    private readonly repo: Repository<Budget>,
  ) {}

  private decorate(b: Budget) {
    const total = Number(b.totalBudgetedAmount) || 0;
    const spent = Number(b.totalActualAmount) || 0;
    const remaining = total - spent;
    const variance = Number(b.totalVariance) || total - spent;
    const variancePercent = total !== 0 ? (variance / total) * 100 : 0;
    return {
      id: b.id,
      budgetCode: b.budgetCode,
      budgetName: b.budgetName,
      fiscalYear: b.startDate
        ? new Date(b.startDate).getFullYear().toString()
        : '',
      department: b.department || '',
      costCenter: b.costCenter || '',
      budgetType: b.budgetType,
      totalBudget: total,
      allocated: total,
      spent,
      remaining,
      variance,
      variancePercent: Number(variancePercent.toFixed(2)),
      status: b.status,
      startDate: b.startDate,
      endDate: b.endDate,
      approvedBy: b.approvedBy || undefined,
      approvedDate: b.approvedAt || undefined,
      revisions: (Number(b.version) || 1) - 1,
      description: b.description,
      utilizationPercentage: Number(b.utilizationPercentage) || 0,
    };
  }

  async findAll(filters?: {
    status?: string;
    budgetType?: string;
    department?: string;
    search?: string;
  }): Promise<any[]> {
    const qb = this.repo.createQueryBuilder('b');
    if (filters?.status && filters.status !== 'all') {
      qb.andWhere('b.status = :status', { status: filters.status });
    }
    if (filters?.budgetType && filters.budgetType !== 'all') {
      qb.andWhere('b.budgetType = :bt', { bt: filters.budgetType });
    }
    if (filters?.department && filters.department !== 'all') {
      qb.andWhere('b.department = :dept', { dept: filters.department });
    }
    if (filters?.search) {
      qb.andWhere(
        '(b.budgetName ILIKE :s OR b.budgetCode ILIKE :s OR b.department ILIKE :s)',
        { s: `%${filters.search}%` },
      );
    }
    qb.orderBy('b.createdAt', 'DESC');
    const rows = await qb.getMany();
    return rows.map((r) => this.decorate(r));
  }

  async findOne(id: string): Promise<any> {
    const b = await this.repo.findOne({ where: { id } });
    if (!b) throw new NotFoundException(`Budget ${id} not found`);
    return this.decorate(b);
  }

  async create(dto: CreateBudgetDto): Promise<any> {
    const entity = this.repo.create({
      ...dto,
      startDate: dto.startDate ? new Date(dto.startDate) : new Date(),
      endDate: dto.endDate ? new Date(dto.endDate) : new Date(),
      approvedAt: dto.approvedAt ? new Date(dto.approvedAt) : undefined,
      budgetType: dto.budgetType ?? BudgetType.OPERATING,
      status: dto.status ?? BudgetStatus.DRAFT,
      totalVariance:
        (Number(dto.totalBudgetedAmount) || 0) -
        (Number(dto.totalActualAmount) || 0),
    });
    const saved = await this.repo.save(entity);
    return this.decorate(saved);
  }

  async update(id: string, dto: UpdateBudgetDto): Promise<any> {
    const b = await this.repo.findOne({ where: { id } });
    if (!b) throw new NotFoundException(`Budget ${id} not found`);
    Object.assign(b, {
      ...dto,
      startDate: dto.startDate ? new Date(dto.startDate) : b.startDate,
      endDate: dto.endDate ? new Date(dto.endDate) : b.endDate,
      approvedAt: dto.approvedAt ? new Date(dto.approvedAt) : b.approvedAt,
    });
    if (
      dto.totalBudgetedAmount !== undefined ||
      dto.totalActualAmount !== undefined
    ) {
      b.totalVariance =
        Number(b.totalBudgetedAmount) - Number(b.totalActualAmount);
    }
    const saved = await this.repo.save(b);
    return this.decorate(saved);
  }

  async remove(id: string): Promise<void> {
    const result = await this.repo.delete(id);
    if (!result.affected) throw new NotFoundException(`Budget ${id} not found`);
  }
}
