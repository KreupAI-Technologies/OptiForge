import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { ReviewCycle } from '../entities/review-cycle.entity';

@Injectable()
export class ReviewCycleService {
  constructor(
    @InjectRepository(ReviewCycle)
    private readonly repo: Repository<ReviewCycle>,
  ) {}

  async findAll(
    companyId: string,
    filters?: { status?: string; cycleType?: string },
  ): Promise<ReviewCycle[]> {
    const where: FindOptionsWhere<ReviewCycle> = { companyId };
    if (filters?.status) where.status = filters.status;
    if (filters?.cycleType) where.cycleType = filters.cycleType;
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<ReviewCycle> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`Review cycle ${id} not found`);
    return entity;
  }

  async create(
    data: Partial<ReviewCycle> & { companyId: string },
  ): Promise<ReviewCycle> {
    const entity = this.repo.create(data);
    if (!entity.cycleCode) {
      entity.cycleCode = `CYCLE-${Date.now().toString(36).toUpperCase()}`;
    }
    if (!entity.cycleType) entity.cycleType = 'annual';
    if (!entity.fiscalYear) {
      const y = new Date().getFullYear();
      entity.fiscalYear = `${y}-${y + 1}`;
    }
    if (entity.startDate == null) entity.startDate = new Date();
    if (entity.endDate == null) entity.endDate = new Date();
    return this.repo.save(entity);
  }

  async update(id: string, data: Partial<ReviewCycle>): Promise<ReviewCycle> {
    const entity = await this.findOne(id);
    Object.assign(entity, data);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
