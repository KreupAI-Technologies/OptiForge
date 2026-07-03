import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssetAllocation } from '../entities/asset-allocation.entity';

@Injectable()
export class AssetAllocationService {
  constructor(
    @InjectRepository(AssetAllocation)
    private readonly repo: Repository<AssetAllocation>,
  ) {}

  async findAll(companyId: string): Promise<AssetAllocation[]> {
    return this.repo.find({
      where: { companyId },
      order: { allocationDate: 'DESC' },
    });
  }

  async findOne(id: string): Promise<AssetAllocation> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`Asset allocation ${id} not found`);
    return entity;
  }

  async create(
    data: Partial<AssetAllocation> & { companyId: string },
  ): Promise<AssetAllocation> {
    return this.repo.save(this.repo.create(data));
  }

  async update(
    id: string,
    data: Partial<AssetAllocation>,
  ): Promise<AssetAllocation> {
    const entity = await this.findOne(id);
    Object.assign(entity, data);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
