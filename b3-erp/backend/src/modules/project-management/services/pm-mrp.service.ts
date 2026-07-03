import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PmMrpMaterialEntity } from '../entities/pm-mrp-material.entity';

@Injectable()
export class PmMrpService {
  constructor(
    @InjectRepository(PmMrpMaterialEntity)
    private readonly repo: Repository<PmMrpMaterialEntity>,
  ) {}

  async findAll(companyId = 'default', status?: string): Promise<PmMrpMaterialEntity[]> {
    const where: any = { companyId };
    if (status) where.status = status;
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<PmMrpMaterialEntity> {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException(`MRP material ${id} not found`);
    return row;
  }

  async create(data: Partial<PmMrpMaterialEntity>): Promise<PmMrpMaterialEntity> {
    const row = this.repo.create({ companyId: 'default', ...data });
    return this.repo.save(row);
  }

  async update(id: string, data: Partial<PmMrpMaterialEntity>): Promise<PmMrpMaterialEntity> {
    const row = await this.findOne(id);
    const { id: _id, createdAt, updatedAt, ...rest } = data as any;
    Object.assign(row, rest);
    return this.repo.save(row);
  }

  async remove(id: string): Promise<void> {
    const result = await this.repo.delete(id);
    if (result.affected === 0) throw new NotFoundException(`MRP material ${id} not found`);
  }
}
