import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PerformanceGoal } from '../entities/performance-goal.entity';

@Injectable()
export class PerformanceGoalService {
  constructor(
    @InjectRepository(PerformanceGoal)
    private readonly repo: Repository<PerformanceGoal>,
  ) {}

  async findAll(
    companyId: string,
    recordType?: string,
  ): Promise<PerformanceGoal[]> {
    const where: Record<string, any> = { companyId };
    if (recordType) where.recordType = recordType;
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<PerformanceGoal> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity)
      throw new NotFoundException(`Performance goal ${id} not found`);
    return entity;
  }

  async create(
    data: Partial<PerformanceGoal> & { companyId: string; recordType: string },
  ): Promise<PerformanceGoal> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async update(
    id: string,
    data: Partial<PerformanceGoal>,
  ): Promise<PerformanceGoal> {
    const entity = await this.findOne(id);
    Object.assign(entity, data);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
