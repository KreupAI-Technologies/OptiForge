import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SafetyDrill } from '../entities/safety-drill.entity';

@Injectable()
export class SafetyDrillService {
  constructor(
    @InjectRepository(SafetyDrill)
    private readonly repo: Repository<SafetyDrill>,
  ) {}

  async findAll(companyId: string, recordType?: string): Promise<SafetyDrill[]> {
    const where: Record<string, any> = { companyId };
    if (recordType) where.recordType = recordType;
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<SafetyDrill> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`SafetyDrill ${id} not found`);
    return entity;
  }

  async create(data: Partial<SafetyDrill> & { companyId: string }): Promise<SafetyDrill> {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: string, data: Partial<SafetyDrill>): Promise<SafetyDrill> {
    const entity = await this.findOne(id);
    Object.assign(entity, data);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
