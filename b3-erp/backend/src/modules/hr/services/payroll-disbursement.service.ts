import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PayrollDisbursement } from '../entities/payroll-disbursement.entity';

@Injectable()
export class PayrollDisbursementService {
  constructor(
    @InjectRepository(PayrollDisbursement)
    private readonly repo: Repository<PayrollDisbursement>,
  ) {}

  async findAll(filters?: {
    companyId?: string;
    category?: string;
    status?: string;
    period?: string;
    search?: string;
  }): Promise<PayrollDisbursement[]> {
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
    if (filters?.period) {
      qb.andWhere('row.period = :period', { period: filters.period });
    }
    if (filters?.search) {
      qb.andWhere(
        '(LOWER(row.employeeName) LIKE :search OR LOWER(row.employeeCode) LIKE :search)',
        { search: `%${filters.search.toLowerCase()}%` },
      );
    }
    return qb.getMany();
  }

  async findOne(id: string): Promise<PayrollDisbursement> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`Disbursement ${id} not found`);
    return entity;
  }

  async create(
    data: Partial<PayrollDisbursement> & { companyId?: string },
  ): Promise<PayrollDisbursement> {
    const entity = this.repo.create({
      ...data,
      companyId: data.companyId || 'company-1',
    });
    return this.repo.save(entity);
  }

  async update(
    id: string,
    data: Partial<PayrollDisbursement>,
  ): Promise<PayrollDisbursement> {
    const entity = await this.findOne(id);
    Object.assign(entity, data);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
