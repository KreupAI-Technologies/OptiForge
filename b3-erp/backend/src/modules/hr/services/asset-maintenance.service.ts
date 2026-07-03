import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssetMaintenance } from '../entities/asset-maintenance.entity';

@Injectable()
export class AssetMaintenanceService {
  constructor(
    @InjectRepository(AssetMaintenance)
    private readonly repo: Repository<AssetMaintenance>,
  ) {}

  async findAll(
    companyId: string,
    recordType?: string,
  ): Promise<AssetMaintenance[]> {
    const where: Record<string, string> = { companyId };
    if (recordType) where.recordType = recordType;
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<AssetMaintenance> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity)
      throw new NotFoundException(`Maintenance record ${id} not found`);
    return entity;
  }

  async create(
    data: Partial<AssetMaintenance> & { companyId: string },
  ): Promise<AssetMaintenance> {
    return this.repo.save(this.repo.create(data));
  }

  async update(
    id: string,
    data: Partial<AssetMaintenance>,
  ): Promise<AssetMaintenance> {
    const entity = await this.findOne(id);
    Object.assign(entity, data);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
