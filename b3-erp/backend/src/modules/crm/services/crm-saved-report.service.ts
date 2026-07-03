import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrmSavedReport } from '../entities/crm-saved-report.entity';

// definition is stored as a JSON string; (de)serialize at the boundary.
const serialize = (data: any): any => {
  const out = { ...data };
  if (out.definition !== undefined && out.definition !== null && typeof out.definition !== 'string') {
    out.definition = JSON.stringify(out.definition);
  }
  return out;
};

const deserialize = (row: CrmSavedReport): any => {
  if (!row) return row;
  let definition: any = row.definition;
  if (typeof definition === 'string') {
    try {
      definition = JSON.parse(definition);
    } catch {
      /* leave as-is */
    }
  }
  return { ...row, definition };
};

@Injectable()
export class CrmSavedReportService {
  constructor(
    @InjectRepository(CrmSavedReport)
    private readonly repo: Repository<CrmSavedReport>,
  ) {}

  async findAll(companyId?: string): Promise<any[]> {
    const where = companyId ? { companyId } : {};
    const rows = await this.repo.find({ where, order: { createdAt: 'DESC' } });
    return rows.map(deserialize);
  }

  async findOne(id: string): Promise<any> {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException(`Saved report ${id} not found`);
    return deserialize(row);
  }

  async create(data: Partial<CrmSavedReport>): Promise<any> {
    const saved = await this.repo.save(this.repo.create(serialize(data) as Partial<CrmSavedReport>));
    return deserialize(saved);
  }

  async update(id: string, data: Partial<CrmSavedReport>): Promise<any> {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException(`Saved report ${id} not found`);
    Object.assign(row, serialize(data));
    const saved = await this.repo.save(row);
    return deserialize(saved);
  }

  async remove(id: string): Promise<void> {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException(`Saved report ${id} not found`);
    await this.repo.remove(row);
  }
}
