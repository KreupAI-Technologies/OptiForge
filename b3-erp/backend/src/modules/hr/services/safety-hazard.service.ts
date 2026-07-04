import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SafetyHazard } from '../entities/safety-hazard.entity';

@Injectable()
export class SafetyHazardService {
  constructor(
    @InjectRepository(SafetyHazard)
    private readonly repo: Repository<SafetyHazard>,
  ) {}

  async findAll(companyId: string, recordType?: string): Promise<SafetyHazard[]> {
    const where: Record<string, any> = { companyId };
    if (recordType) where.recordType = recordType;
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<SafetyHazard> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`SafetyHazard ${id} not found`);
    return entity;
  }

  async create(data: Partial<SafetyHazard> & { companyId: string }): Promise<SafetyHazard> {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: string, data: Partial<SafetyHazard>): Promise<SafetyHazard> {
    const entity = await this.findOne(id);
    Object.assign(entity, data);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
