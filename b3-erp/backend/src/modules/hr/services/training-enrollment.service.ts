import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrainingEnrollment } from '../entities/training-enrollment.entity';

@Injectable()
export class TrainingEnrollmentService {
  constructor(
    @InjectRepository(TrainingEnrollment)
    private readonly repo: Repository<TrainingEnrollment>,
  ) {}

  async findAll(companyId: string, status?: string): Promise<TrainingEnrollment[]> {
    const where: Record<string, any> = { companyId };
    if (status) where.status = status;
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<TrainingEnrollment> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`TrainingEnrollment ${id} not found`);
    return entity;
  }

  async create(
    data: Partial<TrainingEnrollment> & { companyId: string },
  ): Promise<TrainingEnrollment> {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: string, data: Partial<TrainingEnrollment>): Promise<TrainingEnrollment> {
    const entity = await this.findOne(id);
    Object.assign(entity, data);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
