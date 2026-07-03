import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrmCampaign } from '../entities/crm-campaign.entity';

@Injectable()
export class CrmCampaignService {
  constructor(
    @InjectRepository(CrmCampaign)
    private readonly repo: Repository<CrmCampaign>,
  ) {}

  async findAll(companyId?: string): Promise<CrmCampaign[]> {
    const where = companyId ? { companyId } : {};
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<CrmCampaign> {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException(`Campaign ${id} not found`);
    return row;
  }

  async create(data: Partial<CrmCampaign>): Promise<CrmCampaign> {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: string, data: Partial<CrmCampaign>): Promise<CrmCampaign> {
    const row = await this.findOne(id);
    Object.assign(row, data);
    return this.repo.save(row);
  }

  async remove(id: string): Promise<void> {
    const row = await this.findOne(id);
    await this.repo.remove(row);
  }
}
