import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RFQTemplate } from '../entities/rfq-template.entity';

@Injectable()
export class RFQTemplateService {
  constructor(
    @InjectRepository(RFQTemplate)
    private readonly templateRepository: Repository<RFQTemplate>,
  ) {}

  async findAll(companyId: string): Promise<RFQTemplate[]> {
    return this.templateRepository.find({
      where: { companyId },
      order: { createdAt: 'DESC' },
    });
  }

  async create(
    companyId: string,
    data: Partial<RFQTemplate>,
  ): Promise<RFQTemplate> {
    const template = this.templateRepository.create({ ...data, companyId });
    return this.templateRepository.save(template);
  }

  async delete(companyId: string, id: string): Promise<void> {
    const template = await this.templateRepository.findOne({
      where: { id, companyId },
    });
    if (!template) {
      throw new NotFoundException(`RFQ template with ID ${id} not found`);
    }
    await this.templateRepository.remove(template);
  }
}
