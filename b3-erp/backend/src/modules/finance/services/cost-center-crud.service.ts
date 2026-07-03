import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CostCenter } from '../entities/cost-accounting.entity';

export interface CreateCostCenterDto {
  costCenterCode: string;
  costCenterName: string;
  description?: string;
  parentCostCenterId?: string;
  department?: string;
  location?: string;
  managerId?: string;
  managerName?: string;
  isActive?: boolean;
  isProfitCenter?: boolean;
  createdBy?: string;
}

export type UpdateCostCenterDto = Partial<CreateCostCenterDto>;

@Injectable()
export class CostCenterCrudService {
  constructor(
    @InjectRepository(CostCenter)
    private readonly repo: Repository<CostCenter>,
  ) {}

  async findAll(filters?: {
    department?: string;
    isActive?: string;
    search?: string;
  }): Promise<CostCenter[]> {
    const qb = this.repo.createQueryBuilder('cc');
    if (filters?.department && filters.department !== 'all') {
      qb.andWhere('cc.department = :dept', { dept: filters.department });
    }
    if (filters?.isActive === 'true' || filters?.isActive === 'false') {
      qb.andWhere('cc.isActive = :active', {
        active: filters.isActive === 'true',
      });
    }
    if (filters?.search) {
      qb.andWhere(
        '(cc.costCenterName ILIKE :s OR cc.costCenterCode ILIKE :s OR cc.department ILIKE :s)',
        { s: `%${filters.search}%` },
      );
    }
    qb.orderBy('cc.costCenterCode', 'ASC');
    return qb.getMany();
  }

  async findOne(id: string): Promise<CostCenter> {
    const cc = await this.repo.findOne({ where: { id } });
    if (!cc) throw new NotFoundException(`Cost center ${id} not found`);
    return cc;
  }

  async create(dto: CreateCostCenterDto): Promise<CostCenter> {
    const entity = this.repo.create({
      ...dto,
      isActive: dto.isActive ?? true,
      isProfitCenter: dto.isProfitCenter ?? false,
    });
    return this.repo.save(entity);
  }

  async update(id: string, dto: UpdateCostCenterDto): Promise<CostCenter> {
    const cc = await this.repo.findOne({ where: { id } });
    if (!cc) throw new NotFoundException(`Cost center ${id} not found`);
    Object.assign(cc, dto);
    return this.repo.save(cc);
  }

  async remove(id: string): Promise<void> {
    const result = await this.repo.delete(id);
    if (!result.affected)
      throw new NotFoundException(`Cost center ${id} not found`);
  }
}
