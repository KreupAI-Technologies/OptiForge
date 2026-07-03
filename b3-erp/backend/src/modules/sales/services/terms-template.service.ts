import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TermsTemplate } from '../entities/terms-template.entity';

@Injectable()
export class TermsTemplateService {
  constructor(
    @InjectRepository(TermsTemplate)
    private readonly repo: Repository<TermsTemplate>,
  ) {}

  async findAll(companyId?: string): Promise<TermsTemplate[]> {
    const where = companyId ? { companyId } : {};
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<TermsTemplate> {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException(`Terms template ${id} not found`);
    return row;
  }

  async create(data: Partial<TermsTemplate>): Promise<TermsTemplate> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async update(id: string, data: Partial<TermsTemplate>): Promise<TermsTemplate> {
    const row = await this.findOne(id);
    Object.assign(row, data);
    return this.repo.save(row);
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    const row = await this.findOne(id);
    await this.repo.remove(row);
    return { deleted: true };
  }
}
