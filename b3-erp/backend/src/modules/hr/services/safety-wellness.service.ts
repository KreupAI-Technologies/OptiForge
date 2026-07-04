import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SafetyWellness } from '../entities/safety-wellness.entity';

@Injectable()
export class SafetyWellnessService {
  constructor(
    @InjectRepository(SafetyWellness)
    private readonly repo: Repository<SafetyWellness>,
  ) {}

  async findAll(companyId: string, recordType?: string): Promise<SafetyWellness[]> {
    const where: Record<string, any> = { companyId };
    if (recordType) where.recordType = recordType;
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<SafetyWellness> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`SafetyWellness ${id} not found`);
    return entity;
  }

  async create(data: Partial<SafetyWellness> & { companyId: string }): Promise<SafetyWellness> {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: string, data: Partial<SafetyWellness>): Promise<SafetyWellness> {
    const entity = await this.findOne(id);
    Object.assign(entity, data);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
