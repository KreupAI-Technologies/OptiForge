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
}
