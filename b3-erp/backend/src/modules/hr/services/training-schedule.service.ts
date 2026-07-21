import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrainingSchedule } from '../entities/training-schedule.entity';

@Injectable()
export class TrainingScheduleService {
  constructor(
    @InjectRepository(TrainingSchedule)
    private readonly repo: Repository<TrainingSchedule>,
  ) {}

  async findAll(
    companyId: string,
    filters?: { programId?: string; status?: string },
  ): Promise<TrainingSchedule[]> {
    const where: Record<string, any> = { companyId };
    if (filters?.programId) where.programId = filters.programId;
    if (filters?.status) where.status = filters.status;
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<TrainingSchedule> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`Training schedule ${id} not found`);
    return entity;
  }

  async create(
    data: Partial<TrainingSchedule> & { companyId: string },
  ): Promise<TrainingSchedule> {
    return this.repo.save(this.repo.create(data));
  }

  async update(
    id: string,
    data: Partial<TrainingSchedule>,
  ): Promise<TrainingSchedule> {
    const entity = await this.findOne(id);
    Object.assign(entity, data);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
