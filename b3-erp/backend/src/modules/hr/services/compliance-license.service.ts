import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { ComplianceLicense } from '../entities/compliance-license.entity';

@Injectable()
export class ComplianceLicenseService {
  constructor(
    @InjectRepository(ComplianceLicense)
    private readonly repo: Repository<ComplianceLicense>,
  ) {}

  async findAll(
    companyId: string,
    recordType?: string,
  ): Promise<ComplianceLicense[]> {
    const where: FindOptionsWhere<ComplianceLicense> = { companyId };
    if (recordType) where.recordType = recordType;
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async summary(companyId: string, recordType?: string) {
    const rows = await this.findAll(companyId, recordType);
    const byStatus: Record<string, number> = {};
    for (const r of rows) {
      const key = r.status || 'unknown';
      byStatus[key] = (byStatus[key] || 0) + 1;
    }
    return { total: rows.length, byStatus };
  }

  async findOne(id: string): Promise<ComplianceLicense> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`License ${id} not found`);
    return entity;
  }

  async create(
    data: Partial<ComplianceLicense> & { companyId: string },
  ): Promise<ComplianceLicense> {
    return this.repo.save(this.repo.create(data));
  }

  async update(
    id: string,
    data: Partial<ComplianceLicense>,
  ): Promise<ComplianceLicense> {
    const entity = await this.findOne(id);
    Object.assign(entity, data);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
