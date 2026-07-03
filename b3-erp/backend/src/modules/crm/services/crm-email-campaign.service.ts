import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrmEmailCampaign } from '../entities/crm-email-campaign.entity';
import { CrmCampaign } from '../entities/crm-campaign.entity';

const num = (v: any): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

@Injectable()
export class CrmEmailCampaignService {
  constructor(
    @InjectRepository(CrmEmailCampaign)
    private readonly repo: Repository<CrmEmailCampaign>,
    @InjectRepository(CrmCampaign)
    private readonly campaignRepo: Repository<CrmCampaign>,
  ) {}

  async findAll(companyId?: string): Promise<CrmEmailCampaign[]> {
    const where = companyId ? { companyId } : {};
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<CrmEmailCampaign> {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException(`Email campaign ${id} not found`);
    return row;
  }

  async create(data: Partial<CrmEmailCampaign>): Promise<CrmEmailCampaign> {
    return this.repo.save(this.repo.create(data));
  }

  async update(
    id: string,
    data: Partial<CrmEmailCampaign>,
  ): Promise<CrmEmailCampaign> {
    const row = await this.findOne(id);
    Object.assign(row, data);
    return this.repo.save(row);
  }

  async remove(id: string): Promise<void> {
    const row = await this.findOne(id);
    await this.repo.remove(row);
  }

  /**
   * Campaign performance analytics aggregated over crm_campaigns and
   * crm_email_campaigns. No new table.
   */
  async getPerformance(companyId?: string): Promise<any> {
    const where = companyId ? { companyId } : {};
    const [campaigns, emails] = await Promise.all([
      this.campaignRepo.find({ where }),
      this.repo.find({ where }),
    ]);

    // Per-campaign rows from crm_campaigns (metrics json)
    const campaignRows = campaigns.map((c) => {
      const m = (c.metrics || {}) as Record<string, any>;
      const revenue = num(m.revenue);
      const spent = num(c.spent);
      const conversions = num(m.conversions);
      const clicked = num(m.clicked);
      const delivered = num(m.delivered) || num(m.reach);
      return {
        id: c.id,
        name: c.name,
        type: c.type,
        status: c.status,
        budget: num(c.budget),
        spent,
        revenue,
        roi: spent > 0 ? Math.round(((revenue - spent) / spent) * 100) : 0,
        conversions,
        conversionRate:
          delivered > 0
            ? Math.round((conversions / delivered) * 1000) / 10
            : 0,
        clickRate:
          delivered > 0 ? Math.round((clicked / delivered) * 1000) / 10 : 0,
      };
    });

    // Per-email-campaign rows
    const emailRows = emails.map((e) => {
      const delivered = num(e.delivered);
      return {
        id: e.id,
        name: e.name,
        type: 'email',
        status: e.status,
        sent: num(e.sent),
        delivered,
        opened: num(e.opened),
        clicked: num(e.clicked),
        openRate:
          delivered > 0
            ? Math.round((num(e.opened) / delivered) * 1000) / 10
            : 0,
        clickRate:
          delivered > 0
            ? Math.round((num(e.clicked) / delivered) * 1000) / 10
            : 0,
      };
    });

    const totalBudget = campaignRows.reduce((s, r) => s + r.budget, 0);
    const totalSpent = campaignRows.reduce((s, r) => s + r.spent, 0);
    const totalRevenue = campaignRows.reduce((s, r) => s + r.revenue, 0);
    const totalConversions = campaignRows.reduce(
      (s, r) => s + r.conversions,
      0,
    );

    return {
      summary: {
        totalCampaigns: campaigns.length,
        totalEmailCampaigns: emails.length,
        totalBudget,
        totalSpent,
        totalRevenue,
        totalConversions,
        overallRoi:
          totalSpent > 0
            ? Math.round(((totalRevenue - totalSpent) / totalSpent) * 100)
            : 0,
      },
      campaigns: campaignRows,
      emailCampaigns: emailRows,
    };
  }
}
