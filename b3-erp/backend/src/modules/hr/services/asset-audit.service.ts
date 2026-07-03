import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { AssetAudit } from '../entities/asset-audit.entity';

@Injectable()
export class AssetAuditService {
  constructor(
    @InjectRepository(AssetAudit)
    private readonly repo: Repository<AssetAudit>,
  ) {}

  async findAll(companyId: string, filter?: string): Promise<AssetAudit[]> {
    const where: FindOptionsWhere<AssetAudit> = { companyId } as FindOptionsWhere<AssetAudit>;
    if (filter) (where as Record<string, string>).auditType = filter;
    return this.repo.find({ where, order: { auditDate: 'DESC' } as any });
  }

  async findOne(id: string): Promise<AssetAudit> {
    const entity = await this.repo.findOne({ where: { id } as FindOptionsWhere<AssetAudit> });
    if (!entity) throw new NotFoundException(`Asset audit ${id} not found`);
    return entity;
  }

  async create(data: Partial<AssetAudit> & { companyId: string }): Promise<AssetAudit> {
    return this.repo.save(this.repo.create(data as AssetAudit));
  }

  async update(id: string, data: Partial<AssetAudit>): Promise<AssetAudit> {
    const entity = await this.findOne(id);
    Object.assign(entity, data);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
