import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ComplianceViolation } from '../entities/compliance-violation.entity';

@Injectable()
export class ComplianceViolationService {
  constructor(
    @InjectRepository(ComplianceViolation)
    private readonly repository: Repository<ComplianceViolation>,
  ) {}

  async findAll(filters?: {
    companyId?: string;
    category?: string;
    severity?: string;
    status?: string;
    requirementId?: string;
  }): Promise<ComplianceViolation[]> {
    const where: Record<string, any> = {};
    if (filters?.companyId) where.companyId = filters.companyId;
    if (filters?.category && filters.category !== 'all')
      where.category = filters.category;
    if (filters?.severity && filters.severity !== 'all')
      where.severity = filters.severity;
    if (filters?.status && filters.status !== 'all')
      where.status = filters.status;
    if (filters?.requirementId) where.requirementId = filters.requirementId;
    return this.repository.find({ where, order: { detectedAt: 'DESC', createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<ComplianceViolation> {
    const item = await this.repository.findOne({ where: { id } });
    if (!item)
      throw new NotFoundException(`Compliance violation ${id} not found`);
    return item;
  }

  async create(
    data: Partial<ComplianceViolation>,
  ): Promise<ComplianceViolation> {
    const item = this.repository.create({
      ...data,
      detectedAt: data.detectedAt ?? new Date(),
    });
    return this.repository.save(item);
  }

  async update(
    id: string,
    data: Partial<ComplianceViolation>,
  ): Promise<ComplianceViolation> {
    const item = await this.findOne(id);
    Object.assign(item, data);
    // Auto-stamp resolvedAt when transitioning to Resolved without an explicit date.
    if (data.status === 'Resolved' && !item.resolvedAt) {
      item.resolvedAt = new Date();
    }
    return this.repository.save(item);
  }

  async resolve(
    id: string,
    resolvedBy?: string,
  ): Promise<ComplianceViolation> {
    const item = await this.findOne(id);
    item.status = 'Resolved';
    item.resolvedAt = new Date();
    if (resolvedBy) item.assignedTo = resolvedBy;
    return this.repository.save(item);
  }

  async remove(id: string): Promise<void> {
    const item = await this.findOne(id);
    await this.repository.remove(item);
  }
}
