import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentTemplate } from '../entities/document-template.entity';

@Injectable()
export class DocumentTemplateService {
  constructor(
    @InjectRepository(DocumentTemplate)
    private readonly repository: Repository<DocumentTemplate>,
  ) {}

  async findAll(filters?: {
    companyId?: string;
    type?: string;
  }): Promise<DocumentTemplate[]> {
    const where: Record<string, any> = {};
    if (filters?.companyId) where.companyId = filters.companyId;
    if (filters?.type && filters.type !== 'all') where.type = filters.type;
    return this.repository.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<DocumentTemplate> {
    const tpl = await this.repository.findOne({ where: { id } });
    if (!tpl) throw new NotFoundException(`Template ${id} not found`);
    return tpl;
  }

  async create(data: Partial<DocumentTemplate>): Promise<DocumentTemplate> {
    const tpl = this.repository.create(data);
    return this.repository.save(tpl);
  }

  async update(
    id: string,
    data: Partial<DocumentTemplate>,
  ): Promise<DocumentTemplate> {
    const tpl = await this.findOne(id);
    Object.assign(tpl, data);
    return this.repository.save(tpl);
  }

  async remove(id: string): Promise<void> {
    const tpl = await this.findOne(id);
    await this.repository.remove(tpl);
  }
}
