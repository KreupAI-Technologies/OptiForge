import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SiteIssueEntity } from '../entities/site-issue.entity';

@Injectable()
export class SiteIssuesService {
  constructor(
    @InjectRepository(SiteIssueEntity)
    private readonly repo: Repository<SiteIssueEntity>,
  ) {}

  async findAll(companyId = 'default', status?: string): Promise<SiteIssueEntity[]> {
    const where: any = { companyId };
    if (status) where.status = status;
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<SiteIssueEntity> {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException(`Site issue ${id} not found`);
    return row;
  }

  async create(data: Partial<SiteIssueEntity>): Promise<SiteIssueEntity> {
    const relatedIssues = Array.isArray(data.relatedIssues) ? data.relatedIssues : [];
    const row = this.repo.create({ companyId: 'default', ...data, relatedIssues });
    return this.repo.save(row);
  }

  async update(id: string, data: Partial<SiteIssueEntity>): Promise<SiteIssueEntity> {
    const row = await this.findOne(id);
    const { id: _id, createdAt, updatedAt, ...rest } = data as any;
    Object.assign(row, rest);
    return this.repo.save(row);
  }

  async remove(id: string): Promise<void> {
    const result = await this.repo.delete(id);
    if (result.affected === 0) throw new NotFoundException(`Site issue ${id} not found`);
  }
}
