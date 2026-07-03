import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssetReturn } from '../entities/asset-return.entity';

@Injectable()
export class AssetReturnService {
  constructor(
    @InjectRepository(AssetReturn)
    private readonly repo: Repository<AssetReturn>,
  ) {}

  async findAll(companyId: string): Promise<AssetReturn[]> {
    return this.repo.find({
      where: { companyId },
      order: { returnDate: 'DESC' },
    });
  }

  async findOne(id: string): Promise<AssetReturn> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`Asset return ${id} not found`);
    return entity;
  }

  async create(
    data: Partial<AssetReturn> & { companyId: string },
  ): Promise<AssetReturn> {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: string, data: Partial<AssetReturn>): Promise<AssetReturn> {
    const entity = await this.findOne(id);
    Object.assign(entity, data);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
