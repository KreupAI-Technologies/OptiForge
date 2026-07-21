import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrainingFeedback } from '../entities/training-feedback.entity';

@Injectable()
export class TrainingFeedbackService {
  constructor(
    @InjectRepository(TrainingFeedback)
    private readonly repo: Repository<TrainingFeedback>,
  ) {}

  async findAll(
    companyId: string,
    filters?: { scheduleId?: string; programId?: string; employeeId?: string },
  ): Promise<TrainingFeedback[]> {
    const where: Record<string, any> = { companyId };
    if (filters?.scheduleId) where.scheduleId = filters.scheduleId;
    if (filters?.programId) where.programId = filters.programId;
    if (filters?.employeeId) where.employeeId = filters.employeeId;
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<TrainingFeedback> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity)
      throw new NotFoundException(`Training feedback ${id} not found`);
    return entity;
  }

  async create(
    data: Partial<TrainingFeedback> & { companyId: string },
  ): Promise<TrainingFeedback> {
    return this.repo.save(this.repo.create(data));
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
