import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ComplianceAudit } from '../entities/compliance-audit.entity';

@Injectable()
export class ComplianceAuditService {
  constructor(
    @InjectRepository(ComplianceAudit)
    private readonly repo: Repository<ComplianceAudit>,
  ) {}

  async findAll(companyId: string): Promise<ComplianceAudit[]> {
    return this.repo.find({ where: { companyId }, order: { createdAt: 'DESC' } });
  }

  async summary(companyId: string) {
    const rows = await this.findAll(companyId);
    return {
      total: rows.length,
      completed: rows.filter((r) => r.status === 'completed').length,
      inProgress: rows.filter((r) => r.status === 'in_progress').length,
      scheduled: rows.filter((r) => r.status === 'scheduled').length,
      totalFindings: rows.reduce((s, r) => s + (r.findings || 0), 0),
      criticalFindings: rows.reduce((s, r) => s + (r.criticalFindings || 0), 0),
    };
  }

  async findOne(id: string): Promise<ComplianceAudit> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`Audit ${id} not found`);
    return entity;
  }

  async create(
    data: Partial<ComplianceAudit> & { companyId: string },
  ): Promise<ComplianceAudit> {
    return this.repo.save(this.repo.create(data));
  }

  async update(
    id: string,
    data: Partial<ComplianceAudit>,
  ): Promise<ComplianceAudit> {
    const entity = await this.findOne(id);
    Object.assign(entity, data);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
