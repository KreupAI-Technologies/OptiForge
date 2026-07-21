import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PerformanceImprovementPlan } from '../entities/performance-improvement-plan.entity';

@Injectable()
export class PerformanceImprovementPlanService {
  constructor(
    @InjectRepository(PerformanceImprovementPlan)
    private readonly repo: Repository<PerformanceImprovementPlan>,
  ) {}

  async findAll(
    companyId: string,
    filters?: { employeeId?: string; managerId?: string; status?: string },
  ): Promise<PerformanceImprovementPlan[]> {
    const where: Record<string, any> = { companyId };
    if (filters?.employeeId) where.employeeId = filters.employeeId;
    if (filters?.managerId) where.managerId = filters.managerId;
    if (filters?.status) where.status = filters.status;
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<PerformanceImprovementPlan> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`PIP ${id} not found`);
    return entity;
  }

  async create(
    data: Partial<PerformanceImprovementPlan> & { companyId: string },
  ): Promise<PerformanceImprovementPlan> {
    const entity = this.repo.create({ status: 'active', progress: 0, ...data });
    return this.repo.save(entity);
  }

  async update(
    id: string,
    data: Partial<PerformanceImprovementPlan>,
  ): Promise<PerformanceImprovementPlan> {
    const entity = await this.findOne(id);
    Object.assign(entity, data);
    return this.repo.save(entity);
  }

  /**
   * Status transition — review outcome. Accepts one of:
   * active | extended | passed | failed | terminated.
   */
  async transition(
    id: string,
    status: string,
    reviewNotes?: string,
  ): Promise<PerformanceImprovementPlan> {
    const entity = await this.findOne(id);
    entity.status = status;
    if (reviewNotes !== undefined) {
      entity.reviewNotes = reviewNotes;
      entity.outcome = reviewNotes;
    }
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
