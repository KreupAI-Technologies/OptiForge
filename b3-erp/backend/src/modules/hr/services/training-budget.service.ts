import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { TrainingBudget } from '../entities/training-budget.entity';

@Injectable()
export class TrainingBudgetService {
  constructor(
    @InjectRepository(TrainingBudget)
    private readonly repo: Repository<TrainingBudget>,
  ) {}

  async findAll(
    companyId: string,
    filters?: { fiscalYear?: string; departmentId?: string; status?: string },
  ): Promise<TrainingBudget[]> {
    const where: FindOptionsWhere<TrainingBudget> = { companyId };
    if (filters?.fiscalYear) where.fiscalYear = filters.fiscalYear;
    if (filters?.departmentId) where.departmentId = filters.departmentId;
    if (filters?.status) where.status = filters.status;
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<TrainingBudget> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`Training budget ${id} not found`);
    return entity;
  }

  async create(
    data: Partial<TrainingBudget> & { companyId: string },
  ): Promise<TrainingBudget> {
    const entity = this.repo.create(data);
    if (!entity.budgetCode) {
      entity.budgetCode = `BUD-${Date.now().toString(36).toUpperCase()}`;
    }
    if (!entity.budgetType) entity.budgetType = 'company';
    if (entity.periodStart == null) entity.periodStart = new Date();
    if (entity.periodEnd == null) entity.periodEnd = new Date();
    const allocated = Number(entity.allocatedAmount ?? 0);
    const utilized = Number(entity.utilizedAmount ?? 0);
    if (entity.remainingAmount == null) {
      entity.remainingAmount = allocated - utilized;
    }
    return this.repo.save(entity);
  }

  async update(
    id: string,
    data: Partial<TrainingBudget>,
  ): Promise<TrainingBudget> {
    const entity = await this.findOne(id);
    Object.assign(entity, data);
    // Keep remaining consistent when allocation/utilization changes.
    if (data.allocatedAmount != null || data.utilizedAmount != null) {
      entity.remainingAmount =
        Number(entity.allocatedAmount ?? 0) - Number(entity.utilizedAmount ?? 0);
    }
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
