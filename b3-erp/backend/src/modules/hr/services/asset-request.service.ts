import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssetRequest } from '../entities/asset-request.entity';

@Injectable()
export class AssetRequestService {
  constructor(
    @InjectRepository(AssetRequest)
    private readonly repo: Repository<AssetRequest>,
  ) {}

  async findAll(companyId: string): Promise<AssetRequest[]> {
    return this.repo.find({
      where: { companyId },
      order: { requestDate: 'DESC' },
    });
  }

  async findOne(id: string): Promise<AssetRequest> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`Asset request ${id} not found`);
    return entity;
  }

  async create(
    data: Partial<AssetRequest> & { companyId: string },
  ): Promise<AssetRequest> {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: string, data: Partial<AssetRequest>): Promise<AssetRequest> {
    const entity = await this.findOne(id);
    Object.assign(entity, data);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
