import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReworkItem } from '../entities/rework-item.entity';

@Injectable()
export class ReworkItemService {
  constructor(
    @InjectRepository(ReworkItem)
    private readonly repo: Repository<ReworkItem>,
  ) {}

  async create(data: Partial<ReworkItem>): Promise<ReworkItem> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async findAll(filters?: {
    status?: string;
    priority?: string;
    projectId?: string;
  }): Promise<ReworkItem[]> {
    const query = this.repo.createQueryBuilder('rework');

    if (filters?.status) {
      query.andWhere('rework.status = :status', { status: filters.status });
    }
    if (filters?.priority) {
      query.andWhere('rework.priority = :priority', {
        priority: filters.priority,
      });
    }
    if (filters?.projectId) {
      query.andWhere('rework.projectId = :projectId', {
        projectId: filters.projectId,
      });
    }

    query.orderBy('rework.createdAt', 'DESC');
    return query.getMany();
  }

  async findOne(id: string): Promise<ReworkItem> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`Rework item with ID ${id} not found`);
    }
    return entity;
  }

  async update(id: string, data: Partial<ReworkItem>): Promise<ReworkItem> {
    const entity = await this.findOne(id);
    Object.assign(entity, data);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
