import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OnboardingTask } from '../entities/onboarding-task.entity';

@Injectable()
export class OnboardingTaskService {
  constructor(
    @InjectRepository(OnboardingTask)
    private readonly repo: Repository<OnboardingTask>,
  ) {}

  async findAll(filters?: {
    companyId?: string;
    feature?: string;
    status?: string;
    department?: string;
    search?: string;
  }): Promise<OnboardingTask[]> {
    const qb = this.repo
      .createQueryBuilder('task')
      .orderBy('task.createdAt', 'DESC');

    qb.where('task.companyId = :companyId', {
      companyId: filters?.companyId || 'company-1',
    });

    if (filters?.feature) {
      qb.andWhere('task.feature = :feature', { feature: filters.feature });
    }
    if (filters?.status) {
      qb.andWhere('task.status = :status', { status: filters.status });
    }
    if (filters?.department) {
      qb.andWhere('task.department = :department', {
        department: filters.department,
      });
    }
    if (filters?.search) {
      qb.andWhere(
        '(LOWER(task.employeeName) LIKE :search OR LOWER(task.employeeCode) LIKE :search OR LOWER(task.designation) LIKE :search)',
        { search: `%${filters.search.toLowerCase()}%` },
      );
    }

    return qb.getMany();
  }

  async findOne(id: string): Promise<OnboardingTask> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`Onboarding task ${id} not found`);
    return entity;
  }

  async create(
    data: Partial<OnboardingTask> & { companyId?: string },
  ): Promise<OnboardingTask> {
    const entity = this.repo.create({
      ...data,
      companyId: data.companyId || 'company-1',
    });
    return this.repo.save(entity);
  }

  async update(
    id: string,
    data: Partial<OnboardingTask>,
  ): Promise<OnboardingTask> {
    const entity = await this.findOne(id);
    Object.assign(entity, data);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
