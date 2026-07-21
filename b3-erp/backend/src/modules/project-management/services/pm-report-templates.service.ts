import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PmReportTemplateEntity } from '../entities/pm-report-template.entity';

@Injectable()
export class PmReportTemplatesService {
  constructor(
    @InjectRepository(PmReportTemplateEntity)
    private readonly repo: Repository<PmReportTemplateEntity>,
  ) {}

  async findAll(companyId = 'default'): Promise<PmReportTemplateEntity[]> {
    return this.repo.find({ where: { companyId }, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<PmReportTemplateEntity> {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException(`Report template ${id} not found`);
    return row;
  }

  async create(data: Partial<PmReportTemplateEntity>): Promise<PmReportTemplateEntity> {
    const row = this.repo.create({ companyId: 'default', ...data });
    return this.repo.save(row);
  }

  async update(id: string, data: Partial<PmReportTemplateEntity>): Promise<PmReportTemplateEntity> {
    const row = await this.findOne(id);
    const { id: _id, createdAt, updatedAt, ...rest } = data as any;
    Object.assign(row, rest);
    return this.repo.save(row);
  }

  async remove(id: string): Promise<void> {
    const result = await this.repo.delete(id);
    if (result.affected === 0) throw new NotFoundException(`Report template ${id} not found`);
  }
}
