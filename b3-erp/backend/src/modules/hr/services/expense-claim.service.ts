import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExpenseClaim } from '../entities/expense-claim.entity';

@Injectable()
export class ExpenseClaimService {
  constructor(
    @InjectRepository(ExpenseClaim)
    private readonly repo: Repository<ExpenseClaim>,
  ) {}

  async findAll(
    companyId: string,
    filters?: { kind?: string; status?: string },
  ): Promise<ExpenseClaim[]> {
    const where: Record<string, any> = { companyId };
    if (filters?.kind) where.kind = filters.kind;
    if (filters?.status) where.status = filters.status;
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<ExpenseClaim> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`Expense claim ${id} not found`);
    return entity;
  }

  async create(
    data: Partial<ExpenseClaim> & { companyId: string },
  ): Promise<ExpenseClaim> {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: string, data: Partial<ExpenseClaim>): Promise<ExpenseClaim> {
    const entity = await this.findOne(id);
    Object.assign(entity, data);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
