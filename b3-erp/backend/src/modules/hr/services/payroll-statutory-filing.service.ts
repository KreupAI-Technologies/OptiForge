import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PayrollStatutoryFiling } from '../entities/payroll-statutory-filing.entity';

@Injectable()
export class PayrollStatutoryFilingService {
  constructor(
    @InjectRepository(PayrollStatutoryFiling)
    private readonly repo: Repository<PayrollStatutoryFiling>,
  ) {}

  async findAll(filters?: {
    companyId?: string;
    category?: string;
    status?: string;
    search?: string;
  }): Promise<PayrollStatutoryFiling[]> {
    const qb = this.repo
      .createQueryBuilder('row')
      .where('row.companyId = :companyId', {
        companyId: filters?.companyId || 'company-1',
      })
      .orderBy('row.createdAt', 'DESC');

    if (filters?.category) {
      qb.andWhere('row.category = :category', { category: filters.category });
    }
    if (filters?.status) {
      qb.andWhere('row.status = :status', { status: filters.status });
    }
    if (filters?.search) {
      qb.andWhere(
        '(LOWER(row.employeeName) LIKE :search OR LOWER(row.employeeCode) LIKE :search)',
        { search: `%${filters.search.toLowerCase()}%` },
      );
    }
    return qb.getMany();
  }

  /**
   * Aggregate statutory filings into a report grouped by category, backing the
   * HR Compliance > Reports > Statutory Reports section. Reads real filing rows;
   * returns empty groups when no data exists (honest empty state).
   */
  async summary(companyId?: string): Promise<{
    companyId: string;
    totalFilings: number;
    totalAmount: number;
    byCategory: Array<{
      category: string;
      count: number;
      totalAmount: number;
      pending: number;
      filed: number;
      paid: number;
    }>;
    generatedAt: string;
  }> {
    const cid = companyId || 'company-1';
    const rows = await this.repo.find({ where: { companyId: cid } });

    const groups = new Map<
      string,
      { count: number; totalAmount: number; pending: number; filed: number; paid: number }
    >();
    let totalAmount = 0;

    for (const row of rows) {
      const key = row.category || 'uncategorized';
      const amount = Number(row.amount) || 0;
      totalAmount += amount;
      const g =
        groups.get(key) || { count: 0, totalAmount: 0, pending: 0, filed: 0, paid: 0 };
      g.count += 1;
      g.totalAmount += amount;
      if (row.status === 'filed') g.filed += 1;
      else if (row.status === 'paid') g.paid += 1;
      else g.pending += 1;
      groups.set(key, g);
    }

    return {
      companyId: cid,
      totalFilings: rows.length,
      totalAmount,
      byCategory: Array.from(groups.entries()).map(([category, g]) => ({
        category,
        ...g,
      })),
      generatedAt: new Date().toISOString(),
    };
  }

  async findOne(id: string): Promise<PayrollStatutoryFiling> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`Statutory filing ${id} not found`);
    return entity;
  }

  async create(
    data: Partial<PayrollStatutoryFiling> & { companyId?: string },
  ): Promise<PayrollStatutoryFiling> {
    const entity = this.repo.create({
      ...data,
      companyId: data.companyId || 'company-1',
    });
    return this.repo.save(entity);
  }

  async update(
    id: string,
    data: Partial<PayrollStatutoryFiling>,
  ): Promise<PayrollStatutoryFiling> {
    const entity = await this.findOne(id);
    Object.assign(entity, data);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
