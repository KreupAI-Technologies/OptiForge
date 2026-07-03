import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuoteTemplate } from '../entities/quote-template.entity';

@Injectable()
export class QuoteTemplateService {
  constructor(
    @InjectRepository(QuoteTemplate)
    private readonly repo: Repository<QuoteTemplate>,
  ) {}

  async findAll(companyId?: string): Promise<QuoteTemplate[]> {
    const where = companyId ? { companyId } : {};
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<QuoteTemplate> {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) {
      throw new NotFoundException(`Quote template with ID ${id} not found`);
    }
    return row;
  }

  async create(data: Partial<QuoteTemplate>): Promise<QuoteTemplate> {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: string, data: Partial<QuoteTemplate>): Promise<QuoteTemplate> {
    const row = await this.findOne(id);
    Object.assign(row, data);
    return this.repo.save(row);
  }

  async remove(id: string): Promise<void> {
    const row = await this.findOne(id);
    await this.repo.remove(row);
  }
}
