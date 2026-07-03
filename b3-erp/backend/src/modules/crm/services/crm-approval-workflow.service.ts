import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrmApprovalWorkflow } from '../entities/crm-approval-workflow.entity';

// stages / conditions are stored as JSON strings; (de)serialize at the boundary.
const serialize = (data: any): any => {
  const out = { ...data };
  if (out.stages !== undefined && typeof out.stages !== 'string') {
    out.stages = JSON.stringify(out.stages);
  }
  if (out.conditions !== undefined && typeof out.conditions !== 'string') {
    out.conditions = JSON.stringify(out.conditions);
  }
  return out;
};

const deserialize = (row: CrmApprovalWorkflow): any => {
  if (!row) return row;
  const parse = (v: any) => {
    if (typeof v !== 'string') return v;
    try {
      return JSON.parse(v);
    } catch {
      return v;
    }
  };
  return { ...row, stages: parse(row.stages), conditions: parse(row.conditions) };
};

@Injectable()
export class CrmApprovalWorkflowService {
  constructor(
    @InjectRepository(CrmApprovalWorkflow)
    private readonly repo: Repository<CrmApprovalWorkflow>,
  ) {}

  async findAll(companyId?: string): Promise<any[]> {
    const where = companyId ? { companyId } : {};
    const rows = await this.repo.find({ where, order: { createdAt: 'DESC' } });
    return rows.map(deserialize);
  }

  async findOne(id: string): Promise<any> {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException(`Approval workflow ${id} not found`);
    return deserialize(row);
  }

  async create(data: Partial<CrmApprovalWorkflow>): Promise<any> {
    const saved = await this.repo.save(this.repo.create(serialize(data) as Partial<CrmApprovalWorkflow>));
    return deserialize(saved);
  }

  async update(id: string, data: Partial<CrmApprovalWorkflow>): Promise<any> {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException(`Approval workflow ${id} not found`);
    Object.assign(row, serialize(data));
    const saved = await this.repo.save(row);
    return deserialize(saved);
  }

  async remove(id: string): Promise<void> {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException(`Approval workflow ${id} not found`);
    await this.repo.remove(row);
  }
}
