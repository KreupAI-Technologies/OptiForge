import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrainingWaitlist } from '../entities/training-waitlist.entity';

@Injectable()
export class TrainingWaitlistService {
  constructor(
    @InjectRepository(TrainingWaitlist)
    private readonly repo: Repository<TrainingWaitlist>,
  ) {}

  async findAll(
    companyId: string,
    filters?: { programId?: string; scheduleId?: string; status?: string },
  ): Promise<TrainingWaitlist[]> {
    const where: Record<string, any> = { companyId };
    if (filters?.programId) where.programId = filters.programId;
    if (filters?.scheduleId) where.scheduleId = filters.scheduleId;
    if (filters?.status) where.status = filters.status;
    return this.repo.find({ where, order: { position: 'ASC', createdAt: 'ASC' } });
  }

  async findOne(id: string): Promise<TrainingWaitlist> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity)
      throw new NotFoundException(`Training waitlist entry ${id} not found`);
    return entity;
  }

  async create(
    data: Partial<TrainingWaitlist> & { companyId: string },
  ): Promise<TrainingWaitlist> {
    return this.repo.save(this.repo.create(data));
  }

  async update(
    id: string,
    data: Partial<TrainingWaitlist>,
  ): Promise<TrainingWaitlist> {
    const entity = await this.findOne(id);
    Object.assign(entity, data);
    return this.repo.save(entity);
  }

  /** Mark a waitlist entry as notified (FE notifyWaitlist). */
  async notify(id: string): Promise<TrainingWaitlist> {
    const entity = await this.findOne(id);
    entity.status = 'notified';
    entity.notifiedAt = new Date();
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
