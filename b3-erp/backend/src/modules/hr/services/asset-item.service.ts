import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssetItem } from '../entities/asset-item.entity';

@Injectable()
export class AssetItemService {
  constructor(
    @InjectRepository(AssetItem)
    private readonly repo: Repository<AssetItem>,
  ) {}

  async findAll(companyId: string, assetClass?: string): Promise<AssetItem[]> {
    const where: Record<string, string> = { companyId };
    if (assetClass) where.assetClass = assetClass;
    return this.repo.find({ where, order: { assetTag: 'ASC' } });
  }

  async findOne(id: string): Promise<AssetItem> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`Asset item ${id} not found`);
    return entity;
  }

  async create(
    data: Partial<AssetItem> & { companyId: string },
  ): Promise<AssetItem> {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: string, data: Partial<AssetItem>): Promise<AssetItem> {
    const entity = await this.findOne(id);
    Object.assign(entity, data);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
