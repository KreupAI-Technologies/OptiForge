import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PayrollBonusRecord } from '../entities/payroll-bonus-record.entity';

@Injectable()
export class PayrollBonusRecordService {
  constructor(
    @InjectRepository(PayrollBonusRecord)
    private readonly repo: Repository<PayrollBonusRecord>,
  ) {}

  async findAll(filters?: {
    companyId?: string;
    category?: string;
    status?: string;
    financialYear?: string;
    search?: string;
  }): Promise<PayrollBonusRecord[]> {
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

  async findOne(id: string): Promise<PayrollBonusRecord> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`Bonus record ${id} not found`);
    return entity;
  }

  async create(
    data: Partial<PayrollBonusRecord> & { companyId?: string },
  ): Promise<PayrollBonusRecord> {
    const entity = this.repo.create({
      ...data,
      companyId: data.companyId || 'company-1',
    });
    return this.repo.save(entity);
  }

  async update(
    id: string,
    data: Partial<PayrollBonusRecord>,
  ): Promise<PayrollBonusRecord> {
    const entity = await this.findOne(id);
    Object.assign(entity, data);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
