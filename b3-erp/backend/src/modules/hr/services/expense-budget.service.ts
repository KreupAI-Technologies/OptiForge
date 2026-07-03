import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExpenseBudget } from '../entities/expense-budget.entity';

@Injectable()
export class ExpenseBudgetService {
  constructor(
    @InjectRepository(ExpenseBudget)
    private readonly repo: Repository<ExpenseBudget>,
  ) {}

  async findAll(companyId: string, status?: string): Promise<ExpenseBudget[]> {
    const where: Record<string, any> = { companyId };
    if (status) where.status = status;
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<ExpenseBudget> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`ExpenseBudget ${id} not found`);
    return entity;
  }

  async create(data: Partial<ExpenseBudget> & { companyId: string }): Promise<ExpenseBudget> {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: string, data: Partial<ExpenseBudget>): Promise<ExpenseBudget> {
    const entity = await this.findOne(id);
    Object.assign(entity, data);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
