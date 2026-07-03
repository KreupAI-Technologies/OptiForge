import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PayrollTaxRecord } from '../entities/payroll-tax-record.entity';

@Injectable()
export class PayrollTaxRecordService {
  constructor(
    @InjectRepository(PayrollTaxRecord)
    private readonly repo: Repository<PayrollTaxRecord>,
  ) {}

  async findAll(filters?: {
    companyId?: string;
    category?: string;
    status?: string;
    financialYear?: string;
    search?: string;
  }): Promise<PayrollTaxRecord[]> {
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
    if (filters?.financialYear) {
      qb.andWhere('row.financialYear = :fy', { fy: filters.financialYear });
    }
    if (filters?.search) {
      qb.andWhere(
        '(LOWER(row.employeeName) LIKE :search OR LOWER(row.employeeCode) LIKE :search)',
        { search: `%${filters.search.toLowerCase()}%` },
      );
    }
    return qb.getMany();
  }

  async findOne(id: string): Promise<PayrollTaxRecord> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`Tax record ${id} not found`);
    return entity;
  }

  async create(
    data: Partial<PayrollTaxRecord> & { companyId?: string },
  ): Promise<PayrollTaxRecord> {
    const entity = this.repo.create({
      ...data,
      companyId: data.companyId || 'company-1',
    });
    return this.repo.save(entity);
  }

  async update(
    id: string,
    data: Partial<PayrollTaxRecord>,
  ): Promise<PayrollTaxRecord> {
    const entity = await this.findOne(id);
    Object.assign(entity, data);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
