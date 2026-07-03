import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CampaignTemplate } from '../entities/campaign-template.entity';

@Injectable()
export class CampaignTemplateService {
  constructor(
    @InjectRepository(CampaignTemplate)
    private readonly repo: Repository<CampaignTemplate>,
  ) {}

  async findAll(companyId?: string): Promise<CampaignTemplate[]> {
    const where = companyId ? { companyId } : {};
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<CampaignTemplate> {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) {
      throw new NotFoundException(`Campaign template with ID ${id} not found`);
    }
    return row;
  }

  async create(data: Partial<CampaignTemplate>): Promise<CampaignTemplate> {
    return this.repo.save(this.repo.create(data));
  }

  async update(
    id: string,
    data: Partial<CampaignTemplate>,
  ): Promise<CampaignTemplate> {
    const row = await this.findOne(id);
    Object.assign(row, data);
    return this.repo.save(row);
  }

  async remove(id: string): Promise<void> {
    const row = await this.findOne(id);
    await this.repo.remove(row);
  }
}
