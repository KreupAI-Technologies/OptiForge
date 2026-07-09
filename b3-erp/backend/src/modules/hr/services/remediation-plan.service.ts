import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RemediationPlan } from '../entities/remediation-plan.entity';

@Injectable()
export class RemediationPlanService {
  constructor(
    @InjectRepository(RemediationPlan)
    private readonly repo: Repository<RemediationPlan>,
  ) {}

  async findAll(companyId: string, status?: string): Promise<RemediationPlan[]> {
    const where: Record<string, any> = { companyId };
    if (status) where.status = status;
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<RemediationPlan> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`RemediationPlan ${id} not found`);
    return entity;
  }

  async create(
    data: Partial<RemediationPlan> & { companyId: string },
  ): Promise<RemediationPlan> {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: string, data: Partial<RemediationPlan>): Promise<RemediationPlan> {
    const entity = await this.findOne(id);
    Object.assign(entity, data);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
