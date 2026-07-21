import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KpiAssignment } from '../entities/kpi-assignment.entity';

@Injectable()
export class KpiAssignmentService {
  constructor(
    @InjectRepository(KpiAssignment)
    private readonly repo: Repository<KpiAssignment>,
  ) {}

  async findAll(
    companyId: string,
    filters?: { employeeId?: string; kpiMasterId?: string; status?: string },
  ): Promise<KpiAssignment[]> {
    const where: Record<string, any> = { companyId };
    if (filters?.employeeId) where.employeeId = filters.employeeId;
    if (filters?.kpiMasterId) where.kpiMasterId = filters.kpiMasterId;
    if (filters?.status) where.status = filters.status;
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<KpiAssignment> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`KPI assignment ${id} not found`);
    return entity;
  }

  async create(
    data: Partial<KpiAssignment> & { companyId: string },
  ): Promise<KpiAssignment> {
    const entity = this.repo.create({ status: 'assigned', ...data });
    return this.repo.save(entity);
  }

  async update(id: string, data: Partial<KpiAssignment>): Promise<KpiAssignment> {
    const entity = await this.findOne(id);
    Object.assign(entity, data);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
