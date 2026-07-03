import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QualityPlan } from '../entities/quality-plan.entity';

@Injectable()
export class QualityPlanService {
  constructor(
    @InjectRepository(QualityPlan)
    private readonly repo: Repository<QualityPlan>,
  ) {}

  async create(createDto: Partial<QualityPlan>): Promise<QualityPlan> {
    const entity = this.repo.create(createDto);
    return this.repo.save(entity);
  }

  async findAll(filters?: { status?: string; category?: string }): Promise<QualityPlan[]> {
    const query = this.repo.createQueryBuilder('q');
    if (filters?.status) {
      query.andWhere('q.status = :status', { status: filters.status });
    }
    if (filters?.category) {
      query.andWhere('q.category = :category', { category: filters.category });
    }
    query.orderBy('q.createdAt', 'DESC');
    return query.getMany();
  }

  async findOne(id: string): Promise<QualityPlan> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`Quality plan with ID ${id} not found`);
    }
    return entity;
  }

  async update(id: string, updateDto: Partial<QualityPlan>): Promise<QualityPlan> {
    const entity = await this.findOne(id);
    Object.assign(entity, updateDto);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
