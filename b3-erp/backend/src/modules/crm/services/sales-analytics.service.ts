import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lead, LeadStatus } from '../entities/lead.entity';

export interface SalesSummary {
  totalLeads: number;
  totalPipelineValue: number;
  wonValue: number;
  wonCount: number;
  lostCount: number;
  openCount: number;
  winRate: number;
  avgDealSize: number;
  byStatus: Array<{ status: string; count: number; value: number }>;
  bySource: Array<{ source: string; count: number; value: number }>;
  byOwner: Array<{ owner: string; count: number; value: number; wonCount: number }>;
}

@Injectable()
export class SalesAnalyticsService {
  constructor(
    @InjectRepository(Lead)
    private readonly leadRepository: Repository<Lead>,
  ) {}

  async getSummary(): Promise<SalesSummary> {
    const leads = await this.leadRepository.find();

    const num = (v: any): number => {
      const n = Number(v);
      return Number.isFinite(n) ? n : 0;
    };

    const totalPipelineValue = leads.reduce((s, l) => s + num(l.estimatedValue), 0);
    const wonLeads = leads.filter((l) => l.status === LeadStatus.WON);
    const lostLeads = leads.filter((l) => l.status === LeadStatus.LOST);
    const openLeads = leads.filter(
      (l) => l.status !== LeadStatus.WON && l.status !== LeadStatus.LOST,
    );
    const wonValue = wonLeads.reduce((s, l) => s + num(l.estimatedValue), 0);
    const closedCount = wonLeads.length + lostLeads.length;
    const winRate = closedCount > 0 ? (wonLeads.length / closedCount) * 100 : 0;

    const statusMap = new Map<string, { count: number; value: number }>();
    const sourceMap = new Map<string, { count: number; value: number }>();
    const ownerMap = new Map<
      string,
      { count: number; value: number; wonCount: number }
    >();

    for (const l of leads) {
      const status = l.status || 'unknown';
      const st = statusMap.get(status) || { count: 0, value: 0 };
      st.count += 1;
      st.value += num(l.estimatedValue);
      statusMap.set(status, st);

      const source = l.leadSource || 'Unknown';
      const src = sourceMap.get(source) || { count: 0, value: 0 };
      src.count += 1;
      src.value += num(l.estimatedValue);
      sourceMap.set(source, src);

      const owner = l.assignedTo || 'Unassigned';
      const ow = ownerMap.get(owner) || { count: 0, value: 0, wonCount: 0 };
      ow.count += 1;
      ow.value += num(l.estimatedValue);
      if (l.status === LeadStatus.WON) ow.wonCount += 1;
      ownerMap.set(owner, ow);
    }

    return {
      totalLeads: leads.length,
      totalPipelineValue,
      wonValue,
      wonCount: wonLeads.length,
      lostCount: lostLeads.length,
      openCount: openLeads.length,
      winRate: Math.round(winRate * 10) / 10,
      avgDealSize: wonLeads.length > 0 ? Math.round(wonValue / wonLeads.length) : 0,
      byStatus: Array.from(statusMap.entries()).map(([status, v]) => ({
        status,
        count: v.count,
        value: v.value,
      })),
      bySource: Array.from(sourceMap.entries()).map(([source, v]) => ({
        source,
        count: v.count,
        value: v.value,
      })),
      byOwner: Array.from(ownerMap.entries()).map(([owner, v]) => ({
        owner,
        count: v.count,
        value: v.value,
        wonCount: v.wonCount,
      })),
    };
  }
}
