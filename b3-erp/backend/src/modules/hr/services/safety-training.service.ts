import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SafetyTraining } from '../entities/safety-training.entity';

@Injectable()
export class SafetyTrainingService {
  constructor(
    @InjectRepository(SafetyTraining)
    private readonly repo: Repository<SafetyTraining>,
  ) {}

  async findAll(companyId: string, recordType?: string): Promise<SafetyTraining[]> {
    const where: Record<string, any> = { companyId };
    if (recordType) where.recordType = recordType;
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<SafetyTraining> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`SafetyTraining ${id} not found`);
    return entity;
  }

  async create(data: Partial<SafetyTraining> & { companyId: string }): Promise<SafetyTraining> {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: string, data: Partial<SafetyTraining>): Promise<SafetyTraining> {
    const entity = await this.findOne(id);
    Object.assign(entity, data);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
