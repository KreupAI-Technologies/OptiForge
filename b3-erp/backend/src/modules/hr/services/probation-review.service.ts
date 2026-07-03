import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProbationReview } from '../entities/probation-review.entity';

@Injectable()
export class ProbationReviewService {
  constructor(
    @InjectRepository(ProbationReview)
    private readonly repo: Repository<ProbationReview>,
  ) {}

  async findAll(
    companyId: string,
    recordType?: string,
  ): Promise<ProbationReview[]> {
    const where: Record<string, any> = { companyId };
    if (recordType) where.recordType = recordType;
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<ProbationReview> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity)
      throw new NotFoundException(`Probation review ${id} not found`);
    return entity;
  }

  async create(
    data: Partial<ProbationReview> & { companyId: string; recordType: string },
  ): Promise<ProbationReview> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async update(
    id: string,
    data: Partial<ProbationReview>,
  ): Promise<ProbationReview> {
    const entity = await this.findOne(id);
    Object.assign(entity, data);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
