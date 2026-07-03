import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrmCustomField } from '../entities/crm-custom-field.entity';

// validation / usage are stored as JSON strings; (de)serialize at the boundary.
const serialize = (data: any): any => {
  const out = { ...data };
  for (const key of ['validation', 'usage']) {
    if (out[key] !== undefined && typeof out[key] !== 'string') {
      out[key] = JSON.stringify(out[key]);
    }
  }
  return out;
};

const deserialize = (row: CrmCustomField): any => {
  if (!row) return row;
  const parse = (v: any) => {
    if (typeof v !== 'string') return v;
    try {
      return JSON.parse(v);
    } catch {
      return v;
    }
  };
  return { ...row, validation: parse(row.validation), usage: parse(row.usage) };
};

@Injectable()
export class CrmCustomFieldService {
  constructor(
    @InjectRepository(CrmCustomField)
    private readonly repo: Repository<CrmCustomField>,
  ) {}

  async findAll(filters?: { companyId?: string; module?: string }): Promise<any[]> {
    const where: any = {};
    if (filters?.companyId) where.companyId = filters.companyId;
    if (filters?.module) where.module = filters.module;
    const rows = await this.repo.find({ where, order: { createdAt: 'DESC' } });
    return rows.map(deserialize);
  }

  async findOne(id: string): Promise<any> {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException(`Custom field ${id} not found`);
    return deserialize(row);
  }

  async create(data: Partial<CrmCustomField>): Promise<any> {
    const saved = await this.repo.save(this.repo.create(serialize(data) as Partial<CrmCustomField>));
    return deserialize(saved);
  }

  async update(id: string, data: Partial<CrmCustomField>): Promise<any> {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException(`Custom field ${id} not found`);
    Object.assign(row, serialize(data));
    const saved = await this.repo.save(row);
    return deserialize(saved);
  }

  async remove(id: string): Promise<void> {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException(`Custom field ${id} not found`);
    await this.repo.remove(row);
  }
}
