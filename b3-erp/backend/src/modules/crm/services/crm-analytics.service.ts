import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lead, LeadStatus } from '../entities/lead.entity';
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
}
