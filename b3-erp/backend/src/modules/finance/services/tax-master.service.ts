import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaxMaster, TaxType, TaxCategory } from '../entities/tax.entity';

export interface CreateTaxMasterDto {
  taxCode: string;
  taxName: string;
  taxType: TaxType;
  taxCategory: TaxCategory;
  taxRate: number;
  effectiveFrom?: string;
  effectiveTo?: string;
  description?: string;
  taxPayableAccountId?: string;
  taxReceivableAccountId?: string;
  taxExpenseAccountId?: string;
  isActive?: boolean;
  createdBy?: string;
}

export type UpdateTaxMasterDto = Partial<CreateTaxMasterDto>;

@Injectable()
export class TaxMasterService {
  constructor(
    @InjectRepository(TaxMaster)
    private readonly repo: Repository<TaxMaster>,
  ) {}

  private decorate(t: TaxMaster) {
    return { ...t, taxRate: Number(t.taxRate) || 0 };
  }

  async findAll(filters?: {
    taxType?: string;
    taxCategory?: string;
    isActive?: string;
    search?: string;
  }): Promise<any[]> {
    const qb = this.repo.createQueryBuilder('t');
    if (filters?.taxType && filters.taxType !== 'all') {
      qb.andWhere('t.taxType = :tt', { tt: filters.taxType });
    }
    if (filters?.taxCategory && filters.taxCategory !== 'all') {
      qb.andWhere('t.taxCategory = :tc', { tc: filters.taxCategory });
    }
    if (filters?.isActive === 'true' || filters?.isActive === 'false') {
      qb.andWhere('t.isActive = :active', {
        active: filters.isActive === 'true',
      });
    }
    if (filters?.search) {
      qb.andWhere('(t.taxName ILIKE :s OR t.taxCode ILIKE :s)', {
        s: `%${filters.search}%`,
      });
    }
    qb.orderBy('t.taxCode', 'ASC');
    const rows = await qb.getMany();
    return rows.map((r) => this.decorate(r));
  }

  async findOne(id: string): Promise<any> {
    const t = await this.repo.findOne({ where: { id } });
    if (!t) throw new NotFoundException(`Tax ${id} not found`);
    return this.decorate(t);
  }

  async create(dto: CreateTaxMasterDto): Promise<any> {
    const entity = this.repo.create({
      ...dto,
      effectiveFrom: dto.effectiveFrom
        ? new Date(dto.effectiveFrom)
        : new Date(),
      effectiveTo: dto.effectiveTo ? new Date(dto.effectiveTo) : undefined,
      isActive: dto.isActive ?? true,
    });
    const saved = await this.repo.save(entity);
    return this.decorate(saved);
  }

  async update(id: string, dto: UpdateTaxMasterDto): Promise<any> {
    const t = await this.repo.findOne({ where: { id } });
    if (!t) throw new NotFoundException(`Tax ${id} not found`);
    Object.assign(t, {
      ...dto,
      effectiveFrom: dto.effectiveFrom
        ? new Date(dto.effectiveFrom)
        : t.effectiveFrom,
      effectiveTo: dto.effectiveTo ? new Date(dto.effectiveTo) : t.effectiveTo,
    });
    const saved = await this.repo.save(t);
    return this.decorate(saved);
  }

  async remove(id: string): Promise<void> {
    const result = await this.repo.delete(id);
    if (!result.affected) throw new NotFoundException(`Tax ${id} not found`);
  }
}
