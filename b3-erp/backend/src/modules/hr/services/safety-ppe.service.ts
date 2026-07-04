import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SafetyPpe } from '../entities/safety-ppe.entity';

@Injectable()
export class SafetyPpeService {
  constructor(
    @InjectRepository(SafetyPpe)
    private readonly repo: Repository<SafetyPpe>,
  ) {}

  async findAll(companyId: string, recordType?: string): Promise<SafetyPpe[]> {
    const where: Record<string, any> = { companyId };
    if (recordType) where.recordType = recordType;
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<SafetyPpe> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`SafetyPpe ${id} not found`);
    return entity;
  }

  async create(data: Partial<SafetyPpe> & { companyId: string }): Promise<SafetyPpe> {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: string, data: Partial<SafetyPpe>): Promise<SafetyPpe> {
    const entity = await this.findOne(id);
    Object.assign(entity, data);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
