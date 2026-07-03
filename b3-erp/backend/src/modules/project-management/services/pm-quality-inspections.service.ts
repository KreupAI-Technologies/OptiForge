import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PmQualityInspectionEntity } from '../entities/pm-quality-inspection.entity';

@Injectable()
export class PmQualityInspectionsService {
  constructor(
    @InjectRepository(PmQualityInspectionEntity)
    private readonly repo: Repository<PmQualityInspectionEntity>,
  ) {}

  async findAll(companyId = 'default', status?: string): Promise<PmQualityInspectionEntity[]> {
    const where: any = { companyId };
    if (status) where.status = status;
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<PmQualityInspectionEntity> {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException(`Quality inspection ${id} not found`);
    return row;
  }

  async create(data: Partial<PmQualityInspectionEntity>): Promise<PmQualityInspectionEntity> {
    const row = this.repo.create({ companyId: 'default', ...data });
    return this.repo.save(row);
  }

  async update(id: string, data: Partial<PmQualityInspectionEntity>): Promise<PmQualityInspectionEntity> {
    const row = await this.findOne(id);
    const { id: _id, createdAt, updatedAt, ...rest } = data as any;
    Object.assign(row, rest);
    return this.repo.save(row);
  }

  async remove(id: string): Promise<void> {
    const result = await this.repo.delete(id);
    if (result.affected === 0) throw new NotFoundException(`Quality inspection ${id} not found`);
  }
}
