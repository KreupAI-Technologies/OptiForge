import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { HrDocument } from '../entities/hr-document.entity';

@Injectable()
export class HrDocumentService {
  constructor(
    @InjectRepository(HrDocument)
    private readonly repo: Repository<HrDocument>,
  ) {}

  async findAll(
    companyId: string,
    docCategory?: string,
  ): Promise<HrDocument[]> {
    const where: FindOptionsWhere<HrDocument> = { companyId };
    if (docCategory) where.docCategory = docCategory;
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async summary(companyId: string, docCategory?: string) {
    const rows = await this.findAll(companyId, docCategory);
    const byStatus: Record<string, number> = {};
    for (const r of rows) {
      const key = r.status || 'unknown';
      byStatus[key] = (byStatus[key] || 0) + 1;
    }
    return { total: rows.length, byStatus };
  }

  async findOne(id: string): Promise<HrDocument> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`Document ${id} not found`);
    return entity;
  }

  async create(
    data: Partial<HrDocument> & { companyId: string },
  ): Promise<HrDocument> {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: string, data: Partial<HrDocument>): Promise<HrDocument> {
    const entity = await this.findOne(id);
    Object.assign(entity, data);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
