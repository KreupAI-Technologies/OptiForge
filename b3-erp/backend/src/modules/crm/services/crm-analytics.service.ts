import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lead, LeadStatus } from '../entities/lead.entity';
import { CrmCustomer } from '../entities/crm-customer.entity';
import { InteractionsService } from '../interactions.service';

const num = (v: any): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

@Injectable()
export class CrmAnalyticsService {
  constructor(
    @InjectRepository(Lead)
    private readonly leadRepo: Repository<Lead>,
    @InjectRepository(CrmCustomer)
    private readonly customerRepo: Repository<CrmCustomer>,
    private readonly interactionsService: InteractionsService,
  ) {}

  /** Lead scoring analytics aggregated over crm_leads. */
  async getLeadScoring(): Promise<any> {
    const leads = await this.leadRepo.find();
    const total = leads.length;

    const bucket = (score: number): string => {
      if (score >= 80) return 'hot';
      if (score >= 50) return 'warm';
      return 'cold';
    };

    const bandMap = new Map<string, { count: number; value: number }>();
    const sourceMap = new Map<string, { count: number; totalScore: number }>();
    const ratingMap = new Map<string, number>();

    let scoreSum = 0;
    for (const l of leads) {
      const score = num(l.leadScore);
      scoreSum += score;

      const band = bucket(score);
      const b = bandMap.get(band) || { count: 0, value: 0 };
      b.count += 1;
      b.value += num(l.estimatedValue);
      bandMap.set(band, b);

      const src = l.leadSource || 'Unknown';
      const s = sourceMap.get(src) || { count: 0, totalScore: 0 };
      s.count += 1;
      s.totalScore += score;
      sourceMap.set(src, s);

      const rating = l.rating || 'unrated';
      ratingMap.set(rating, (ratingMap.get(rating) || 0) + 1);
    }

    return {
      totalLeads: total,
      avgScore: total ? Math.round((scoreSum / total) * 10) / 10 : 0,
      hotLeads: bandMap.get('hot')?.count ?? 0,
      warmLeads: bandMap.get('warm')?.count ?? 0,
      coldLeads: bandMap.get('cold')?.count ?? 0,
      byBand: Array.from(bandMap.entries()).map(([band, v]) => ({
        band,
        count: v.count,
        value: v.value,
      })),
      bySource: Array.from(sourceMap.entries()).map(([source, v]) => ({
        source,
        count: v.count,
        avgScore: v.count ? Math.round((v.totalScore / v.count) * 10) / 10 : 0,
      })),
      byRating: Array.from(ratingMap.entries()).map(([rating, count]) => ({
        rating,
        count,
      })),
      topLeads: leads
        .slice()
        .sort((a, b) => num(b.leadScore) - num(a.leadScore))
        .slice(0, 10)
        .map((l) => ({
          id: l.id,
          name: `${l.firstName} ${l.lastName}`.trim(),
          company: l.company,
          score: num(l.leadScore),
          rating: l.rating,
          status: l.status,
          estimatedValue: num(l.estimatedValue),
        })),
    };
  }

  /** Opportunity/pipeline forecast aggregated over crm_leads (open pipeline). */
  async getForecast(): Promise<any> {
    const leads = await this.leadRepo.find();

    const open = leads.filter(
      (l) => l.status !== LeadStatus.WON && l.status !== LeadStatus.LOST,
    );
    const won = leads.filter((l) => l.status === LeadStatus.WON);

    const weightedPipeline = open.reduce(
      (s, l) => s + (num(l.estimatedValue) * num(l.probability)) / 100,
      0,
    );
    const totalPipeline = open.reduce((s, l) => s + num(l.estimatedValue), 0);

    const stageMap = new Map<
      string,
      { count: number; value: number; weighted: number }
    >();
    const monthMap = new Map<
      string,
      { count: number; value: number; weighted: number }
    >();

    for (const l of open) {
      const stage = l.status || 'unknown';
      const st = stageMap.get(stage) || { count: 0, value: 0, weighted: 0 };
      st.count += 1;
      st.value += num(l.estimatedValue);
      st.weighted += (num(l.estimatedValue) * num(l.probability)) / 100;
      stageMap.set(stage, st);

      let monthKey = 'Unscheduled';
      if (l.estimatedCloseDate) {
        const d = new Date(l.estimatedCloseDate);
        if (!isNaN(d.getTime())) {
          monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        }
      }
      const m = monthMap.get(monthKey) || { count: 0, value: 0, weighted: 0 };
      m.count += 1;
      m.value += num(l.estimatedValue);
      m.weighted += (num(l.estimatedValue) * num(l.probability)) / 100;
      monthMap.set(monthKey, m);
    }

    return {
      totalPipeline,
      weightedPipeline: Math.round(weightedPipeline),
      openCount: open.length,
      wonCount: won.length,
      wonValue: won.reduce((s, l) => s + num(l.estimatedValue), 0),
      byStage: Array.from(stageMap.entries()).map(([stage, v]) => ({
        stage,
        count: v.count,
        value: v.value,
        weighted: Math.round(v.weighted),
      })),
      byMonth: Array.from(monthMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, v]) => ({
          month,
          count: v.count,
          value: v.value,
          weighted: Math.round(v.weighted),
        })),
    };
  }

  /** Interaction analysis aggregated over the in-memory interactions store. */
  getInteractionAnalysis(): any {
    const interactions = this.interactionsService.findAll();
    const total = interactions.length;

    const typeMap = new Map<string, number>();
    const outcomeMap = new Map<string, number>();
    const performerMap = new Map<string, number>();
    let followUps = 0;

    for (const i of interactions) {
      const type = i.type || 'other';
      typeMap.set(type, (typeMap.get(type) || 0) + 1);

      const outcome = i.outcome || 'unspecified';
      outcomeMap.set(outcome, (outcomeMap.get(outcome) || 0) + 1);

      const performer = i.performedBy || 'Unassigned';
      performerMap.set(performer, (performerMap.get(performer) || 0) + 1);

      if (i.followUpRequired) followUps += 1;
    }

    return {
      totalInteractions: total,
      followUpsRequiredCount: followUps,
      byType: Array.from(typeMap.entries()).map(([type, count]) => ({
        type,
        count,
      })),
      byOutcome: Array.from(outcomeMap.entries()).map(([outcome, count]) => ({
        outcome,
        count,
      })),
      byPerformer: Array.from(performerMap.entries()).map(([performer, count]) => ({
        performer,
        count,
      })),
    };
  }

  /** Customer analytics aggregated over crm_customers. */
  async getCustomerAnalytics(): Promise<any> {
    const customers = await this.customerRepo.find();
    const total = customers.length;

    const active = customers.filter(
      (c) => (c.status || '').toLowerCase() === 'active',
    ).length;
    const totalRevenue = customers.reduce((s, c) => s + num(c.lifetimeValue), 0);
    const totalOrders = customers.reduce((s, c) => s + num(c.totalOrders), 0);

    const segMap = new Map<string, { count: number; revenue: number }>();
    const industryMap = new Map<string, { count: number; revenue: number }>();
    const regionMap = new Map<string, { count: number; revenue: number }>();
    const lifecycleMap = new Map<string, number>();

    for (const c of customers) {
      const seg = c.segment || 'Unsegmented';
      const s = segMap.get(seg) || { count: 0, revenue: 0 };
      s.count += 1;
      s.revenue += num(c.lifetimeValue);
      segMap.set(seg, s);

      const ind = c.industry || 'Unknown';
      const i = industryMap.get(ind) || { count: 0, revenue: 0 };
      i.count += 1;
      i.revenue += num(c.lifetimeValue);
      industryMap.set(ind, i);

      const reg = c.region || c.location || 'Unknown';
      const r = regionMap.get(reg) || { count: 0, revenue: 0 };
      r.count += 1;
      r.revenue += num(c.lifetimeValue);
      regionMap.set(reg, r);

      const lc = c.customerLifecycleStage || 'new';
      lifecycleMap.set(lc, (lifecycleMap.get(lc) || 0) + 1);
    }

    return {
      totalCustomers: total,
      activeCustomers: active,
      totalRevenue,
      avgLifetimeValue: total ? Math.round(totalRevenue / total) : 0,
      totalOrders,
      bySegment: Array.from(segMap.entries()).map(([segment, v]) => ({
        segment,
        count: v.count,
        revenue: v.revenue,
      })),
      byIndustry: Array.from(industryMap.entries()).map(([industry, v]) => ({
        industry,
        count: v.count,
        revenue: v.revenue,
      })),
      byRegion: Array.from(regionMap.entries()).map(([region, v]) => ({
        region,
        count: v.count,
        revenue: v.revenue,
      })),
      byLifecycleStage: Array.from(lifecycleMap.entries()).map(([stage, count]) => ({
        stage,
        count,
      })),
      topCustomers: customers
        .slice()
        .sort((a, b) => num(b.lifetimeValue) - num(a.lifetimeValue))
        .slice(0, 10)
        .map((c) => ({
          id: c.id,
          name: c.customerName,
          segment: c.segment,
          industry: c.industry,
          lifetimeValue: num(c.lifetimeValue),
          totalOrders: num(c.totalOrders),
        })),
    };
  }

  /** Revenue analytics aggregated over crm_customers (won revenue) + crm_leads (pipeline). */
  async getRevenueAnalytics(): Promise<any> {
    const [customers, leads] = await Promise.all([
      this.customerRepo.find(),
      this.leadRepo.find(),
    ]);

    const realizedRevenue = customers.reduce(
      (s, c) => s + num(c.lifetimeValue),
      0,
    );
    const wonLeads = leads.filter((l) => l.status === LeadStatus.WON);
    const openLeads = leads.filter(
      (l) => l.status !== LeadStatus.WON && l.status !== LeadStatus.LOST,
    );
    const wonRevenue = wonLeads.reduce((s, l) => s + num(l.estimatedValue), 0);
    const pipelineValue = openLeads.reduce(
      (s, l) => s + num(l.estimatedValue),
      0,
    );
    const weightedPipeline = openLeads.reduce(
      (s, l) => s + (num(l.estimatedValue) * num(l.probability)) / 100,
      0,
    );

    // Revenue by segment (from customers).
    const segMap = new Map<string, number>();
    for (const c of customers) {
      const seg = c.segment || 'Unsegmented';
      segMap.set(seg, (segMap.get(seg) || 0) + num(c.lifetimeValue));
    }

    // Won revenue by close month (from leads).
    const monthMap = new Map<string, number>();
    for (const l of wonLeads) {
      let key = 'Unscheduled';
      const d = l.estimatedCloseDate ? new Date(l.estimatedCloseDate) : null;
      if (d && !isNaN(d.getTime())) {
        key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      }
      monthMap.set(key, (monthMap.get(key) || 0) + num(l.estimatedValue));
    }

    return {
      realizedRevenue,
      wonRevenue,
      pipelineValue,
      weightedPipeline: Math.round(weightedPipeline),
      wonCount: wonLeads.length,
      openCount: openLeads.length,
      bySegment: Array.from(segMap.entries()).map(([segment, revenue]) => ({
        segment,
        revenue,
      })),
      byMonth: Array.from(monthMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, revenue]) => ({ month, revenue })),
    };
  }

  /** Sales-team performance aggregated over crm_leads by owner/assignee. */
  async getTeamAnalytics(): Promise<any> {
    const leads = await this.leadRepo.find();

    const memberMap = new Map<
      string,
      { total: number; won: number; lost: number; open: number; pipeline: number; wonValue: number }
    >();

    for (const l of leads) {
      const owner =
        (l as any).assignedTo || (l as any).ownerName || (l as any).owner || 'Unassigned';
      const m =
        memberMap.get(owner) || {
          total: 0,
          won: 0,
          lost: 0,
          open: 0,
          pipeline: 0,
          wonValue: 0,
        };
      m.total += 1;
      if (l.status === LeadStatus.WON) {
        m.won += 1;
        m.wonValue += num(l.estimatedValue);
      } else if (l.status === LeadStatus.LOST) {
        m.lost += 1;
      } else {
        m.open += 1;
        m.pipeline += num(l.estimatedValue);
      }
      memberMap.set(owner, m);
    }

    const members = Array.from(memberMap.entries()).map(([member, v]) => {
      const closed = v.won + v.lost;
      return {
        member,
        totalLeads: v.total,
        won: v.won,
        lost: v.lost,
        open: v.open,
        winRate: closed ? Math.round((v.won / closed) * 100) : 0,
        pipelineValue: v.pipeline,
        wonValue: v.wonValue,
      };
    });

    return {
      teamSize: members.length,
      totalLeads: leads.length,
      totalWon: members.reduce((s, m) => s + m.won, 0),
      totalWonValue: members.reduce((s, m) => s + m.wonValue, 0),
      members: members.sort((a, b) => b.wonValue - a.wonValue),
    };
  }

  /** CRM dashboard overview aggregated over crm_leads + crm_customers. */
  async getOverview(): Promise<any> {
    const [leads, customers] = await Promise.all([
      this.leadRepo.find(),
      this.customerRepo.find(),
    ]);

    const wonLeads = leads.filter((l) => l.status === LeadStatus.WON);
    const lostLeads = leads.filter((l) => l.status === LeadStatus.LOST);
    const openLeads = leads.filter(
      (l) => l.status !== LeadStatus.WON && l.status !== LeadStatus.LOST,
    );
    const closed = wonLeads.length + lostLeads.length;

    const statusMap = new Map<string, number>();
    for (const l of leads) {
      const st = l.status || 'unknown';
      statusMap.set(st, (statusMap.get(st) || 0) + 1);
    }

    return {
      totalLeads: leads.length,
      openLeads: openLeads.length,
      wonLeads: wonLeads.length,
      lostLeads: lostLeads.length,
      conversionRate: closed ? Math.round((wonLeads.length / closed) * 100) : 0,
      totalCustomers: customers.length,
      activeCustomers: customers.filter(
        (c) => (c.status || '').toLowerCase() === 'active',
      ).length,
      pipelineValue: openLeads.reduce((s, l) => s + num(l.estimatedValue), 0),
      wonValue: wonLeads.reduce((s, l) => s + num(l.estimatedValue), 0),
      customerRevenue: customers.reduce((s, c) => s + num(c.lifetimeValue), 0),
      leadsByStatus: Array.from(statusMap.entries()).map(([status, count]) => ({
        status,
        count,
      })),
    };
  }

  /** Pipeline forecast (alias/extension of getForecast for the advanced-features view). */
  async getPipelineForecast(): Promise<any> {
    const base = await this.getForecast();
    const leads = await this.leadRepo.find();
    const open = leads.filter(
      (l) => l.status !== LeadStatus.WON && l.status !== LeadStatus.LOST,
    );

    // Confidence bands based on probability.
    const bands = { high: 0, medium: 0, low: 0 };
    const bandValue = { high: 0, medium: 0, low: 0 };
    for (const l of open) {
      const p = num(l.probability);
      const key = p >= 70 ? 'high' : p >= 40 ? 'medium' : 'low';
      bands[key] += 1;
      bandValue[key] += num(l.estimatedValue);
    }

    return {
      ...base,
      byConfidence: [
        { band: 'high', count: bands.high, value: bandValue.high },
        { band: 'medium', count: bands.medium, value: bandValue.medium },
        { band: 'low', count: bands.low, value: bandValue.low },
      ],
    };
  }
}
