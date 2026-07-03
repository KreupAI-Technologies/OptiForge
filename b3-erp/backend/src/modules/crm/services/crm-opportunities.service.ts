import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lead, LeadStatus } from '../entities/lead.entity';

const num = (v: any): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

/**
 * Opportunity views derived from crm_leads. No new table:
 * a lead is treated as an opportunity once it carries an estimatedValue.
 */
@Injectable()
export class CrmOpportunitiesService {
  constructor(
    @InjectRepository(Lead)
    private readonly leadRepo: Repository<Lead>,
  ) {}

  private toOpportunity(l: Lead): any {
    return {
      id: l.id,
      name: l.company
        ? `${l.company} — ${l.firstName} ${l.lastName}`.trim()
        : `${l.firstName} ${l.lastName}`.trim(),
      account: l.company,
      contact: `${l.firstName} ${l.lastName}`.trim(),
      stage: l.status,
      value: num(l.estimatedValue),
      probability: num(l.probability),
      weightedValue: Math.round(
        (num(l.estimatedValue) * num(l.probability)) / 100,
      ),
      owner: l.assignedTo,
      source: l.leadSource,
      expectedCloseDate: l.estimatedCloseDate,
      lastContactDate: l.lastContactDate,
      rating: l.rating,
      tags: l.tags || [],
    };
  }

  /** Kanban-style pipeline grouped by open stages. */
  async getPipeline(): Promise<any> {
    const leads = await this.leadRepo.find();
    const openStages = [
      LeadStatus.NEW,
      LeadStatus.CONTACTED,
      LeadStatus.QUALIFIED,
      LeadStatus.PROPOSAL,
      LeadStatus.NEGOTIATION,
    ];

    const stages = openStages.map((stage) => {
      const items = leads
        .filter((l) => l.status === stage)
        .map((l) => this.toOpportunity(l));
      return {
        stage,
        count: items.length,
        totalValue: items.reduce((s, o) => s + o.value, 0),
        weightedValue: items.reduce((s, o) => s + o.weightedValue, 0),
        opportunities: items,
      };
    });

    return {
      stages,
      totalOpportunities: stages.reduce((s, st) => s + st.count, 0),
      totalPipeline: stages.reduce((s, st) => s + st.totalValue, 0),
      weightedPipeline: stages.reduce((s, st) => s + st.weightedValue, 0),
    };
  }

  /** Won opportunities. */
  async getWon(): Promise<any> {
    const leads = await this.leadRepo.find({
      where: { status: LeadStatus.WON },
    });
    const opportunities = leads.map((l) => this.toOpportunity(l));
    return {
      count: opportunities.length,
      totalValue: opportunities.reduce((s, o) => s + o.value, 0),
      opportunities,
    };
  }

  /** Lost opportunities. */
  async getLost(): Promise<any> {
    const leads = await this.leadRepo.find({
      where: { status: LeadStatus.LOST },
    });
    const opportunities = leads.map((l) => this.toOpportunity(l));
    return {
      count: opportunities.length,
      totalValue: opportunities.reduce((s, o) => s + o.value, 0),
      opportunities,
    };
  }
}
