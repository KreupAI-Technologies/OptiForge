import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GanttTask } from '../entities/gantt-task.entity';

@Injectable()
export class GanttTaskService {
  constructor(
    @InjectRepository(GanttTask)
    private readonly repo: Repository<GanttTask>,
  ) {}

  async create(createDto: Partial<GanttTask>): Promise<GanttTask> {
    const entity = this.repo.create(createDto);
    return this.repo.save(entity);
  }

  async findAll(filters?: { status?: string; groupId?: string }): Promise<GanttTask[]> {
    const query = this.repo.createQueryBuilder('g');
    if (filters?.status) {
      query.andWhere('g.status = :status', { status: filters.status });
    }
    if (filters?.groupId) {
      query.andWhere('g.groupId = :groupId', { groupId: filters.groupId });
    }
    query.orderBy('g.startDate', 'ASC');
    return query.getMany();
  }

  async findOne(id: string): Promise<GanttTask> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`Gantt task with ID ${id} not found`);
    }
    return entity;
  }

  async update(id: string, updateDto: Partial<GanttTask>): Promise<GanttTask> {
    const entity = await this.findOne(id);
    Object.assign(entity, updateDto);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
