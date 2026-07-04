import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SafetyReport } from '../entities/safety-report.entity';

@Injectable()
export class SafetyReportService {
  constructor(
    @InjectRepository(SafetyReport)
    private readonly repo: Repository<SafetyReport>,
  ) {}

  async findAll(companyId: string, recordType?: string): Promise<SafetyReport[]> {
    const where: Record<string, any> = { companyId };
    if (recordType) where.recordType = recordType;
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<SafetyReport> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`SafetyReport ${id} not found`);
    return entity;
  }

  async create(data: Partial<SafetyReport> & { companyId: string }): Promise<SafetyReport> {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: string, data: Partial<SafetyReport>): Promise<SafetyReport> {
    const entity = await this.findOne(id);
    Object.assign(entity, data);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
