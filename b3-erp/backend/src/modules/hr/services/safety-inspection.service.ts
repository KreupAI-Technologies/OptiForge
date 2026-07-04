import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SafetyInspection } from '../entities/safety-inspection.entity';

@Injectable()
export class SafetyInspectionService {
  constructor(
    @InjectRepository(SafetyInspection)
    private readonly repo: Repository<SafetyInspection>,
  ) {}

  async findAll(companyId: string, recordType?: string): Promise<SafetyInspection[]> {
    const where: Record<string, any> = { companyId };
    if (recordType) where.recordType = recordType;
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<SafetyInspection> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`SafetyInspection ${id} not found`);
    return entity;
  }

  async create(data: Partial<SafetyInspection> & { companyId: string }): Promise<SafetyInspection> {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: string, data: Partial<SafetyInspection>): Promise<SafetyInspection> {
    const entity = await this.findOne(id);
    Object.assign(entity, data);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
