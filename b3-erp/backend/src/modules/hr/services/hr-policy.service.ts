import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { HrPolicy } from '../entities/hr-policy.entity';

@Injectable()
export class HrPolicyService {
  constructor(
    @InjectRepository(HrPolicy)
    private readonly repo: Repository<HrPolicy>,
  ) {}

  async findAll(
    companyId: string,
    filters?: { category?: string; status?: string },
  ): Promise<HrPolicy[]> {
    const where: FindOptionsWhere<HrPolicy> = { companyId };
    if (filters?.category) where.category = filters.category;
    if (filters?.status) where.status = filters.status;
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<HrPolicy> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`Policy ${id} not found`);
    return entity;
  }

  async create(
    data: Partial<HrPolicy> & { companyId: string },
  ): Promise<HrPolicy> {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: string, data: Partial<HrPolicy>): Promise<HrPolicy> {
    const entity = await this.findOne(id);
    Object.assign(entity, data);
    return this.repo.save(entity);
  }

  async publish(id: string, publishedBy?: string): Promise<HrPolicy> {
    const entity = await this.findOne(id);
    entity.status = 'published';
    entity.publishedAt = new Date();
    if (publishedBy) entity.publishedBy = publishedBy;
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
