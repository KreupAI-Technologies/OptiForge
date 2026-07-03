import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupportResponseTemplate } from '../entities/support-response-template.entity';

@Injectable()
export class SupportResponseTemplateService {
  constructor(
    @InjectRepository(SupportResponseTemplate)
    private readonly repo: Repository<SupportResponseTemplate>,
  ) {}

  async findAll(
    companyId: string,
    options?: { category?: string; active?: boolean },
  ): Promise<SupportResponseTemplate[]> {
    const where: Record<string, unknown> = { companyId };
    if (options?.category && options.category !== 'All') {
      where.category = options.category;
    }
    if (options?.active !== undefined) where.active = options.active;
    return this.repo.find({
      where,
      order: { usageCount: 'DESC', createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<SupportResponseTemplate> {
    const template = await this.repo.findOne({ where: { id } });
    if (!template) throw new NotFoundException(`Template ${id} not found`);
    return template;
  }

  async create(
    data: Partial<SupportResponseTemplate> & { companyId: string },
  ): Promise<SupportResponseTemplate> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async update(
    id: string,
    data: Partial<SupportResponseTemplate>,
  ): Promise<SupportResponseTemplate> {
    const template = await this.findOne(id);
    Object.assign(template, data);
    return this.repo.save(template);
  }

  async remove(id: string): Promise<void> {
    const template = await this.findOne(id);
    await this.repo.remove(template);
  }
}
