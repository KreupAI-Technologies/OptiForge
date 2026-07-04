import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupportReportTemplate } from '../entities/support-report-template.entity';

@Injectable()
export class SupportReportTemplateService {
  constructor(
    @InjectRepository(SupportReportTemplate)
    private readonly repo: Repository<SupportReportTemplate>,
  ) {}

  async findAll(
    companyId: string,
    options?: { category?: string; scheduled?: boolean },
  ): Promise<SupportReportTemplate[]> {
    try {
      const where: Record<string, unknown> = { companyId };
      if (options?.category && options.category !== 'All') {
        where.category = options.category;
      }
      if (options?.scheduled !== undefined) where.scheduled = options.scheduled;
      return await this.repo.find({
        where,
        order: { popularity: 'DESC', createdAt: 'DESC' },
      });
    } catch {
      // Table not yet created / empty — degrade gracefully.
      return [];
    }
  }

  async findOne(id: string): Promise<SupportReportTemplate> {
    const template = await this.repo.findOne({ where: { id } });
    if (!template) throw new NotFoundException(`Report template ${id} not found`);
    return template;
  }

  async create(
    data: Partial<SupportReportTemplate> & { companyId: string },
  ): Promise<SupportReportTemplate> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async update(
    id: string,
    data: Partial<SupportReportTemplate>,
  ): Promise<SupportReportTemplate> {
    const template = await this.findOne(id);
    Object.assign(template, data);
    return this.repo.save(template);
  }

  async remove(id: string): Promise<void> {
    const template = await this.findOne(id);
    await this.repo.remove(template);
  }
}
