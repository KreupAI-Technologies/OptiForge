import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectPlanEntity } from '../entities/project-plan.entity';

@Injectable()
export class ProjectPlansService {
  constructor(
    @InjectRepository(ProjectPlanEntity)
    private planRepository: Repository<ProjectPlanEntity>,
  ) {}

  async create(
    companyId: string,
    data: Partial<ProjectPlanEntity>,
  ): Promise<ProjectPlanEntity> {
    const entity = this.planRepository.create({ ...data, companyId });
    return this.planRepository.save(entity);
  }

  async findAll(
    companyId: string,
    filters?: { status?: string; priority?: string; search?: string },
  ): Promise<ProjectPlanEntity[]> {
    const query = this.planRepository
      .createQueryBuilder('plan')
      .where('plan.companyId = :companyId', { companyId })
      .orderBy('plan.startDate', 'DESC');

    if (filters?.status) {
      query.andWhere('plan.status = :status', { status: filters.status });
    }
    if (filters?.priority) {
      query.andWhere('plan.priority = :priority', {
        priority: filters.priority,
      });
    }
    if (filters?.search) {
      query.andWhere(
        '(plan.projectName ILIKE :search OR plan.projectCode ILIKE :search OR plan.client ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }
    return query.getMany();
  }

  async findOne(companyId: string, id: string): Promise<ProjectPlanEntity> {
    const entity = await this.planRepository.findOne({
      where: { id, companyId },
    });
    if (!entity) {
      throw new NotFoundException(`Project plan with ID ${id} not found`);
    }
    return entity;
  }

  async update(
    companyId: string,
    id: string,
    data: Partial<ProjectPlanEntity>,
  ): Promise<ProjectPlanEntity> {
    const entity = await this.findOne(companyId, id);
    Object.assign(entity, data);
    return this.planRepository.save(entity);
  }

  async delete(companyId: string, id: string): Promise<void> {
    const entity = await this.findOne(companyId, id);
    await this.planRepository.remove(entity);
  }
}
