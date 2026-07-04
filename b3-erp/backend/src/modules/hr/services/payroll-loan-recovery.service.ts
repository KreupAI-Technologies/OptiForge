import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PayrollLoanRecovery } from '../entities/payroll-loan-recovery.entity';

@Injectable()
export class PayrollLoanRecoveryService {
  constructor(
    @InjectRepository(PayrollLoanRecovery)
    private readonly repo: Repository<PayrollLoanRecovery>,
  ) {}

  async findAll(filters?: {
    companyId?: string;
    status?: string;
    method?: string;
    search?: string;
  }): Promise<PayrollLoanRecovery[]> {
    const qb = this.repo
      .createQueryBuilder('row')
      .where('row.companyId = :companyId', {
        companyId: filters?.companyId || 'company-1',
      })
      .orderBy('row.createdAt', 'DESC');

    if (filters?.status) {
      qb.andWhere('row.status = :status', { status: filters.status });
    }
    if (filters?.method) {
      qb.andWhere('row.method = :method', { method: filters.method });
    }
    if (filters?.search) {
      qb.andWhere(
        '(LOWER(row.employeeName) LIKE :search OR LOWER(row.loanId) LIKE :search)',
        { search: `%${filters.search.toLowerCase()}%` },
      );
    }
    return qb.getMany();
  }

  async findOne(id: string): Promise<PayrollLoanRecovery> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`Loan recovery ${id} not found`);
    return entity;
  }

  async create(
    data: Partial<PayrollLoanRecovery> & { companyId?: string },
  ): Promise<PayrollLoanRecovery> {
    const entity = this.repo.create({
      ...data,
      companyId: data.companyId || 'company-1',
    });
    return this.repo.save(entity);
  }

  async update(
    id: string,
    data: Partial<PayrollLoanRecovery>,
  ): Promise<PayrollLoanRecovery> {
    const entity = await this.findOne(id);
    Object.assign(entity, data);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
