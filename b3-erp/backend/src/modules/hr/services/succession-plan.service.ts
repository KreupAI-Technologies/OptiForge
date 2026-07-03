import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SuccessionPlan } from '../entities/succession-plan.entity';

@Injectable()
export class SuccessionPlanService {
  constructor(
    @InjectRepository(SuccessionPlan)
    private readonly repo: Repository<SuccessionPlan>,
  ) {}

  async findAll(
    companyId: string,
    recordType?: string,
  ): Promise<SuccessionPlan[]> {
    const where: Record<string, any> = { companyId };
    if (recordType) where.recordType = recordType;
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<SuccessionPlan> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`Succession plan ${id} not found`);
    return entity;
  }

  async create(
    data: Partial<SuccessionPlan> & { companyId: string; recordType: string },
  ): Promise<SuccessionPlan> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async update(
    id: string,
    data: Partial<SuccessionPlan>,
  ): Promise<SuccessionPlan> {
    const entity = await this.findOne(id);
    Object.assign(entity, data);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
