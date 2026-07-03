import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrmCampaignAutomation } from '../entities/crm-campaign-automation.entity';

@Injectable()
export class CrmCampaignAutomationService {
  constructor(
    @InjectRepository(CrmCampaignAutomation)
    private readonly repo: Repository<CrmCampaignAutomation>,
  ) {}

  async findAll(companyId?: string): Promise<CrmCampaignAutomation[]> {
    const where = companyId ? { companyId } : {};
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<CrmCampaignAutomation> {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException(`Campaign automation ${id} not found`);
    return row;
  }

  async create(data: Partial<CrmCampaignAutomation>): Promise<CrmCampaignAutomation> {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: string, data: Partial<CrmCampaignAutomation>): Promise<CrmCampaignAutomation> {
    const row = await this.findOne(id);
    Object.assign(row, data);
    return this.repo.save(row);
  }

  async remove(id: string): Promise<void> {
    const row = await this.findOne(id);
    await this.repo.remove(row);
  }
}
