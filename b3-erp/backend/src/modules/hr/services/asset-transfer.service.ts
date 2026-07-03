import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssetTransfer } from '../entities/asset-transfer.entity';

@Injectable()
export class AssetTransferService {
  constructor(
    @InjectRepository(AssetTransfer)
    private readonly repo: Repository<AssetTransfer>,
  ) {}

  async findAll(companyId: string): Promise<AssetTransfer[]> {
    return this.repo.find({
      where: { companyId },
      order: { initiatedDate: 'DESC' },
    });
  }

  async findOne(id: string): Promise<AssetTransfer> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`Asset transfer ${id} not found`);
    return entity;
  }

  async create(
    data: Partial<AssetTransfer> & { companyId: string },
  ): Promise<AssetTransfer> {
    return this.repo.save(this.repo.create(data));
  }

  async update(
    id: string,
    data: Partial<AssetTransfer>,
  ): Promise<AssetTransfer> {
    const entity = await this.findOne(id);
    Object.assign(entity, data);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
