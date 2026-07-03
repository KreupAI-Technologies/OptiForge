import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrmTask } from '../entities/crm-task.entity';

// relatedTo is stored as a JSON string; (de)serialize at the boundary.
const serialize = (data: any): any => {
  const out = { ...data };
  if (out.relatedTo !== undefined && out.relatedTo !== null && typeof out.relatedTo !== 'string') {
    out.relatedTo = JSON.stringify(out.relatedTo);
  }
  return out;
};

const deserialize = (row: CrmTask): any => {
  if (!row) return row;
  let relatedTo: any = row.relatedTo;
  if (typeof relatedTo === 'string') {
    try {
      relatedTo = JSON.parse(relatedTo);
    } catch {
      /* leave as-is */
    }
  }
  return { ...row, relatedTo };
};

@Injectable()
export class CrmTaskService {
  constructor(
    @InjectRepository(CrmTask)
    private readonly repo: Repository<CrmTask>,
  ) {}

  async findAll(filters?: { companyId?: string; status?: string; assignedToId?: string }): Promise<any[]> {
    const where: any = {};
    if (filters?.companyId) where.companyId = filters.companyId;
    if (filters?.status) where.status = filters.status;
    if (filters?.assignedToId) where.assignedToId = filters.assignedToId;
    const rows = await this.repo.find({ where, order: { createdAt: 'DESC' } });
    return rows.map(deserialize);
  }

  async findOne(id: string): Promise<any> {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException(`Task ${id} not found`);
    return deserialize(row);
  }

  async create(data: Partial<CrmTask>): Promise<any> {
    const saved = await this.repo.save(this.repo.create(serialize(data) as Partial<CrmTask>));
    return deserialize(saved);
  }

  async update(id: string, data: Partial<CrmTask>): Promise<any> {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException(`Task ${id} not found`);
    Object.assign(row, serialize(data));
    const saved = await this.repo.save(row);
    return deserialize(saved);
  }

  async remove(id: string): Promise<void> {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException(`Task ${id} not found`);
    await this.repo.remove(row);
  }
}
