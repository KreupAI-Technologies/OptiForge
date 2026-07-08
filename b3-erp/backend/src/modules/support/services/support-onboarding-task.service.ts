import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupportOnboardingTask } from '../entities/support-onboarding-task.entity';

@Injectable()
export class SupportOnboardingTaskService {
  constructor(
    @InjectRepository(SupportOnboardingTask)
    private readonly repo: Repository<SupportOnboardingTask>,
  ) {}

  async findAll(
    companyId: string,
    filters?: { status?: string; category?: string },
  ): Promise<SupportOnboardingTask[]> {
    try {
      const query = this.repo
        .createQueryBuilder('task')
        .where('task.companyId = :companyId', { companyId })
        .orderBy('task.sortOrder', 'ASC')
        .addOrderBy('task.createdAt', 'ASC');

      if (filters?.status) {
        query.andWhere('task.status = :status', { status: filters.status });
      }
      if (filters?.category) {
        query.andWhere('task.category = :category', {
          category: filters.category,
        });
      }
      return await query.getMany();
    } catch {
      // Table not yet created / empty — degrade gracefully.
      return [];
    }
  }

  async findOne(companyId: string, id: string): Promise<SupportOnboardingTask> {
    const entity = await this.repo.findOne({ where: { id, companyId } });
    if (!entity) {
      throw new NotFoundException(`Onboarding task with ID ${id} not found`);
    }
    return entity;
  }

  async create(
    companyId: string,
    data: Partial<SupportOnboardingTask>,
  ): Promise<SupportOnboardingTask> {
    const entity = this.repo.create({ ...data, companyId });
    return this.repo.save(entity);
  }

  async update(
    companyId: string,
    id: string,
    data: Partial<SupportOnboardingTask>,
  ): Promise<SupportOnboardingTask> {
    const entity = await this.findOne(companyId, id);
    Object.assign(entity, data);
    return this.repo.save(entity);
  }
}
