import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProcurementBudget } from '../entities/procurement-budget.entity';

export interface UpsertBudgetDto {
  companyId: string;
  fiscalYear?: string;
  name: string;
  budgetType?: string;
  budget?: number;
  spent?: number;
  committed?: number;
  available?: number;
}

export interface BudgetSummary {
  overview: {
    totalBudget: number;
    allocated: number;
    spent: number;
    committed: number;
    available: number;
    utilizationRate: number;
    savingsAchieved: number;
  };
  departmentBudgets: {
    name: string;
    budget: number;
    spent: number;
    committed: number;
    available: number;
  }[];
  categoryBudgets: {
    category: string;
    budget: number;
    spent: number;
    variance: number;
  }[];
}

@Injectable()
export class ProcurementBudgetService {
  constructor(
    @InjectRepository(ProcurementBudget)
    private readonly repo: Repository<ProcurementBudget>,
  ) {}

  async findAll(
    companyId: string,
    budgetType?: string,
    fiscalYear?: string,
  ): Promise<ProcurementBudget[]> {
    const where: Record<string, any> = { companyId };
    if (budgetType) where.budgetType = budgetType;
    if (fiscalYear) where.fiscalYear = fiscalYear;
    return this.repo.find({ where, order: { name: 'ASC' } });
  }

  async create(dto: UpsertBudgetDto): Promise<ProcurementBudget> {
    const entity = this.repo.create(dto);
    return this.repo.save(entity);
  }

  async update(
    id: string,
    dto: Partial<UpsertBudgetDto>,
  ): Promise<ProcurementBudget | null> {
    await this.repo.update(id, dto);
    return this.repo.findOne({ where: { id } });
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    const res = await this.repo.delete(id);
    return { deleted: (res.affected ?? 0) > 0 };
  }

  /**
   * Aggregates budget rows for a company into the overview + department +
   * category breakdown shape the budget dashboard renders. Pure aggregation
   * over the existing procurement_budgets table (no new storage).
   */
  async getSummary(
    companyId: string,
    fiscalYear?: string,
  ): Promise<BudgetSummary> {
    const rows = await this.findAll(companyId, undefined, fiscalYear);

    const num = (v: unknown): number => Number(v) || 0;

    let totalBudget = 0;
    let totalSpent = 0;
    let totalCommitted = 0;
    let totalAvailable = 0;

    const departmentBudgets: BudgetSummary['departmentBudgets'] = [];
    const categoryBudgets: BudgetSummary['categoryBudgets'] = [];

    for (const r of rows) {
      const budget = num(r.budget);
      const spent = num(r.spent);
      const committed = num(r.committed);
      const available = num(r.available) || budget - spent - committed;

      totalBudget += budget;
      totalSpent += spent;
      totalCommitted += committed;
      totalAvailable += available;

      if ((r.budgetType || 'department') === 'category') {
        categoryBudgets.push({
          category: r.name,
          budget,
          spent,
          variance: budget - spent,
        });
      } else {
        departmentBudgets.push({
          name: r.name,
          budget,
          spent,
          committed,
          available,
        });
      }
    }

    const utilizationRate =
      totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
    const savingsAchieved = Math.max(
      totalBudget - totalSpent - totalCommitted - totalAvailable,
      0,
    );

    return {
      overview: {
        totalBudget,
        allocated: totalBudget,
        spent: totalSpent,
        committed: totalCommitted,
        available: totalAvailable,
        utilizationRate,
        savingsAchieved,
      },
      departmentBudgets,
      categoryBudgets,
    };
  }
}
