import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PmResourceUtilizationEntity } from '../entities/pm-resource-utilization.entity';

@Injectable()
export class PmResourceUtilizationService {
  constructor(
    @InjectRepository(PmResourceUtilizationEntity)
    private readonly repo: Repository<PmResourceUtilizationEntity>,
  ) {}

  async findAll(companyId = 'default', status?: string): Promise<PmResourceUtilizationEntity[]> {
    const where: any = { companyId };
    if (status) where.status = status;
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<PmResourceUtilizationEntity> {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException(`Resource utilization record ${id} not found`);
    return row;
  }

  async create(data: Partial<PmResourceUtilizationEntity>): Promise<PmResourceUtilizationEntity> {
    const row = this.repo.create({ companyId: 'default', ...data });
    return this.repo.save(row);
  }

  async update(id: string, data: Partial<PmResourceUtilizationEntity>): Promise<PmResourceUtilizationEntity> {
    const row = await this.findOne(id);
    const { id: _id, createdAt, updatedAt, ...rest } = data as any;
    Object.assign(row, rest);
    return this.repo.save(row);
  }

  async remove(id: string): Promise<void> {
    const result = await this.repo.delete(id);
    if (result.affected === 0) throw new NotFoundException(`Resource utilization record ${id} not found`);
  }
}
