import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssetInventory } from '../entities/asset-inventory.entity';

@Injectable()
export class AssetInventoryService {
  constructor(
    @InjectRepository(AssetInventory)
    private readonly repo: Repository<AssetInventory>,
  ) {}

  async findAll(companyId: string): Promise<AssetInventory[]> {
    return this.repo.find({
      where: { companyId },
      order: { assetName: 'ASC' },
    });
  }

  async findOne(id: string): Promise<AssetInventory> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`Inventory item ${id} not found`);
    return entity;
  }

  async create(
    data: Partial<AssetInventory> & { companyId: string },
  ): Promise<AssetInventory> {
    return this.repo.save(this.repo.create(data));
  }

  async update(
    id: string,
    data: Partial<AssetInventory>,
  ): Promise<AssetInventory> {
    const entity = await this.findOne(id);
    Object.assign(entity, data);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
