import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { KpiMaster } from '../entities/kpi-master.entity';

@Injectable()
export class KpiMasterService {
  constructor(
    @InjectRepository(KpiMaster)
    private readonly repo: Repository<KpiMaster>,
  ) {}

  async findAll(
    companyId: string,
    filters?: { category?: string; kpiType?: string },
  ): Promise<KpiMaster[]> {
    const where: FindOptionsWhere<KpiMaster> = { companyId };
    if (filters?.category) where.category = filters.category;
    if (filters?.kpiType) where.kpiType = filters.kpiType;
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<KpiMaster> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`KPI master ${id} not found`);
    return entity;
  }

  async create(
    data: Partial<KpiMaster> & { companyId: string },
  ): Promise<KpiMaster> {
    const entity = this.repo.create(data);
    if (!entity.kpiCode) {
      entity.kpiCode = `KPI-${Date.now().toString(36).toUpperCase()}`;
    }
    return this.repo.save(entity);
  }

  async update(id: string, data: Partial<KpiMaster>): Promise<KpiMaster> {
    const entity = await this.findOne(id);
    Object.assign(entity, data);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
