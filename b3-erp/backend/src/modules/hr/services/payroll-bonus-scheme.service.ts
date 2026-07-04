import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PayrollBonusScheme } from '../entities/payroll-bonus-scheme.entity';

@Injectable()
export class PayrollBonusSchemeService {
  constructor(
    @InjectRepository(PayrollBonusScheme)
    private readonly repo: Repository<PayrollBonusScheme>,
  ) {}

  async findAll(filters?: {
    companyId?: string;
    status?: string;
    schemeType?: string;
    search?: string;
  }): Promise<PayrollBonusScheme[]> {
    const qb = this.repo
      .createQueryBuilder('row')
      .where('row.companyId = :companyId', {
        companyId: filters?.companyId || 'company-1',
      })
      .orderBy('row.createdAt', 'DESC');

    if (filters?.status) {
      qb.andWhere('row.status = :status', { status: filters.status });
    }
    if (filters?.schemeType) {
      qb.andWhere('row.schemeType = :schemeType', {
        schemeType: filters.schemeType,
      });
    }
    if (filters?.search) {
      qb.andWhere('LOWER(row.schemeName) LIKE :search', {
        search: `%${filters.search.toLowerCase()}%`,
      });
    }
    return qb.getMany();
  }

  async findOne(id: string): Promise<PayrollBonusScheme> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`Bonus scheme ${id} not found`);
    return entity;
  }

  async create(
    data: Partial<PayrollBonusScheme> & { companyId?: string },
  ): Promise<PayrollBonusScheme> {
    const entity = this.repo.create({
      ...data,
      companyId: data.companyId || 'company-1',
    });
    return this.repo.save(entity);
  }

  async update(
    id: string,
    data: Partial<PayrollBonusScheme>,
  ): Promise<PayrollBonusScheme> {
    const entity = await this.findOne(id);
    Object.assign(entity, data);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
