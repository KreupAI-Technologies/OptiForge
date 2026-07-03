import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OperationTask } from '../entities/operation-task.entity';

@Injectable()
export class OperationTaskService {
  constructor(
    @InjectRepository(OperationTask)
    private readonly repo: Repository<OperationTask>,
  ) {}

  async create(createDto: Partial<OperationTask>): Promise<OperationTask> {
    const entity = this.repo.create(createDto);
    return this.repo.save(entity);
  }

  async findAll(filters?: { status?: string; operationType?: string }): Promise<OperationTask[]> {
    const query = this.repo.createQueryBuilder('o');
    if (filters?.status) {
      query.andWhere('o.status = :status', { status: filters.status });
    }
    if (filters?.operationType) {
      query.andWhere('o.operationType = :operationType', {
        operationType: filters.operationType,
      });
    }
    query.orderBy('o.createdAt', 'DESC');
    return query.getMany();
  }

  async findOne(id: string): Promise<OperationTask> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`Operation task with ID ${id} not found`);
    }
    return entity;
  }

  async update(id: string, updateDto: Partial<OperationTask>): Promise<OperationTask> {
    const entity = await this.findOne(id);
    Object.assign(entity, updateDto);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
