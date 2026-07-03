import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrainingProgram } from '../entities/training-program.entity';

@Injectable()
export class TrainingProgramService {
  constructor(
    @InjectRepository(TrainingProgram)
    private readonly repo: Repository<TrainingProgram>,
  ) {}

  async findAll(
    companyId: string,
    filters?: { category?: string; status?: string },
  ): Promise<TrainingProgram[]> {
    const where: Record<string, any> = { companyId };
    if (filters?.category) where.category = filters.category;
    if (filters?.status) where.status = filters.status;
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<TrainingProgram> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`Training program ${id} not found`);
    return entity;
  }

  async create(
    data: Partial<TrainingProgram> & { companyId: string },
  ): Promise<TrainingProgram> {
    return this.repo.save(this.repo.create(data));
  }

  async update(
    id: string,
    data: Partial<TrainingProgram>,
  ): Promise<TrainingProgram> {
    const entity = await this.findOne(id);
    Object.assign(entity, data);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
