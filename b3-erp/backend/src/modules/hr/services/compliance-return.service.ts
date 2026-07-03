import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { ComplianceReturn } from '../entities/compliance-return.entity';

@Injectable()
export class ComplianceReturnService {
  constructor(
    @InjectRepository(ComplianceReturn)
    private readonly repo: Repository<ComplianceReturn>,
  ) {}

  async findAll(
    companyId: string,
    returnType?: string,
  ): Promise<ComplianceReturn[]> {
    const where: FindOptionsWhere<ComplianceReturn> = { companyId };
    if (returnType) where.returnType = returnType;
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async summary(companyId: string, returnType?: string) {
    const rows = await this.findAll(companyId, returnType);
    const byStatus: Record<string, number> = {};
    for (const r of rows) {
      const key = r.status || 'unknown';
      byStatus[key] = (byStatus[key] || 0) + 1;
    }
    return { total: rows.length, byStatus };
  }

  async findOne(id: string): Promise<ComplianceReturn> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`Return ${id} not found`);
    return entity;
  }

  async create(
    data: Partial<ComplianceReturn> & { companyId: string },
  ): Promise<ComplianceReturn> {
    return this.repo.save(this.repo.create(data));
  }

  async update(
    id: string,
    data: Partial<ComplianceReturn>,
  ): Promise<ComplianceReturn> {
    const entity = await this.findOne(id);
    Object.assign(entity, data);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
