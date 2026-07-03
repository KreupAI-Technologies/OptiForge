import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailTemplate } from '../entities/email-template.entity';

@Injectable()
export class EmailTemplateService {
  constructor(
    @InjectRepository(EmailTemplate)
    private readonly templateRepository: Repository<EmailTemplate>,
  ) {}

  async findAll(companyId?: string): Promise<EmailTemplate[]> {
    const where = companyId ? { companyId } : {};
    return this.templateRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<EmailTemplate> {
    const template = await this.templateRepository.findOne({ where: { id } });
    if (!template) {
      throw new NotFoundException(`Email template with ID ${id} not found`);
    }
    return template;
  }

  async create(data: Partial<EmailTemplate>): Promise<EmailTemplate> {
    const template = this.templateRepository.create(data);
    return this.templateRepository.save(template);
  }

  async update(id: string, data: Partial<EmailTemplate>): Promise<EmailTemplate> {
    const template = await this.findOne(id);
    Object.assign(template, data);
    return this.templateRepository.save(template);
  }

  async remove(id: string): Promise<void> {
    const template = await this.findOne(id);
    await this.templateRepository.remove(template);
  }
}
