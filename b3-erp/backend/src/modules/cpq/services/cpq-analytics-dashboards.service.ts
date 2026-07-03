import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quote, QuoteStatus } from '../entities/quote.entity';

/**
 * Aggregation-only service that computes page-shaped analytics payloads from the
 * EXISTING cpq_quotes table. No new tables are introduced here — every method
 * groups/sums/counts over Quote rows for the given companyId.
 *
 * The Quote status enum only exposes a coarse lifecycle, so "won" is treated as
 * ACCEPTED or CONVERTED and "lost" as REJECTED, DECLINED or EXPIRED.
 */
const WON_STATUSES: QuoteStatus[] = [
  QuoteStatus.ACCEPTED,
  QuoteStatus.CONVERTED,
];
const LOST_STATUSES: QuoteStatus[] = [
  QuoteStatus.REJECTED,
  QuoteStatus.DECLINED,
  QuoteStatus.EXPIRED,
];

const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

@Injectable()
export class CPQAnalyticsDashboardsService {
  constructor(
    @InjectRepository(Quote)
    private readonly quoteRepository: Repository<Quote>,
  ) {}

  private async loadQuotes(companyId: string): Promise<Quote[]> {
    if (!companyId) return [];
    return this.quoteRepository.find({ where: { companyId } });
  }

  private isWon(q: Quote): boolean {
    return WON_STATUSES.includes(q.status);
  }

  private isLost(q: Quote): boolean {
    return LOST_STATUSES.includes(q.status);
  }

  private num(v: unknown): number {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }

  private monthKey(d: Date | string | null | undefined): string {
    if (!d) return 'Unknown';
    const date = new Date(d);
    if (Number.isNaN(date.getTime())) return 'Unknown';
    return MONTH_LABELS[date.getMonth()];
  }

  private round(v: number, dp = 1): number {
    const f = Math.pow(10, dp);
    return Math.round(v * f) / f;
  }

  // ----- Win Rate dashboard -----
  async getWinRateDashboard(companyId: string): Promise<{
    metrics: {
      overallWinRate: number;
      dealsWon: number;
      dealsLost: number;
      avgWonDealSize: number;
      avgLostDealSize: number;
    };
    winLossTrend: { month: string; won: number; lost: number; winRate: number }[];
    lossReasons: { reason: string; count: number; percentage: number }[];
    dealSizeWinRate: { range: string; won: number; lost: number; winRate: number }[];
    regionWinRate: { region: string; won: number; lost: number; winRate: number; deals: number }[];
  }> {
    const quotes = await this.loadQuotes(companyId);
    const won = quotes.filter((q) => this.isWon(q));
    const lost = quotes.filter((q) => this.isLost(q));
    const decided = won.length + lost.length;

    const avgWonDealSize = won.length
      ? won.reduce((s, q) => s + this.num(q.totalAmount), 0) / won.length
      : 0;
    const avgLostDealSize = lost.length
      ? lost.reduce((s, q) => s + this.num(q.totalAmount), 0) / lost.length
      : 0;

    // Trend by month
    const trendMap = new Map<string, { won: number; lost: number }>();
    for (const label of MONTH_LABELS) trendMap.set(label, { won: 0, lost: 0 });
    for (const q of quotes) {
      const key = this.monthKey(q.quoteDate || q.createdAt);
      if (!trendMap.has(key)) trendMap.set(key, { won: 0, lost: 0 });
      const bucket = trendMap.get(key)!;
      if (this.isWon(q)) bucket.won += 1;
      else if (this.isLost(q)) bucket.lost += 1;
    }
    const winLossTrend = MONTH_LABELS.filter((m) => {
      const b = trendMap.get(m)!;
      return b.won + b.lost > 0;
    }).map((month) => {
      const b = trendMap.get(month)!;
      const total = b.won + b.lost;
      return {
        month,
        won: b.won,
        lost: b.lost,
        winRate: total ? this.round((b.won / total) * 100) : 0,
      };
    });

    // Loss reasons from customerFeedback (fallback bucket)
    const reasonMap = new Map<string, number>();
    for (const q of lost) {
      const reason = (q.customerFeedback || 'Unspecified').trim() || 'Unspecified';
      reasonMap.set(reason, (reasonMap.get(reason) || 0) + 1);
    }
    const lossReasons = Array.from(reasonMap.entries())
      .map(([reason, count]) => ({
        reason,
        count,
        percentage: lost.length ? this.round((count / lost.length) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);

    // Deal size buckets
    const sizeBuckets: { range: string; test: (v: number) => boolean }[] = [
      { range: '< 200K', test: (v) => v < 200000 },
      { range: '200K - 500K', test: (v) => v >= 200000 && v < 500000 },
      { range: '500K - 1M', test: (v) => v >= 500000 && v < 1000000 },
      { range: '> 1M', test: (v) => v >= 1000000 },
    ];
    const dealSizeWinRate = sizeBuckets.map((bucket) => {
      const inBucket = quotes.filter((q) => bucket.test(this.num(q.totalAmount)));
      const bWon = inBucket.filter((q) => this.isWon(q)).length;
      const bLost = inBucket.filter((q) => this.isLost(q)).length;
      const t = bWon + bLost;
      return {
        range: bucket.range,
        won: bWon,
        lost: bLost,
        winRate: t ? this.round((bWon / t) * 100) : 0,
      };
    });

    // Region from shippingAddress.state
    const regionMap = new Map<string, { won: number; lost: number }>();
    for (const q of quotes) {
      const region = q.shippingAddress?.state || 'Unknown';
      if (!regionMap.has(region)) regionMap.set(region, { won: 0, lost: 0 });
      const b = regionMap.get(region)!;
      if (this.isWon(q)) b.won += 1;
      else if (this.isLost(q)) b.lost += 1;
    }
    const regionWinRate = Array.from(regionMap.entries())
      .map(([region, b]) => {
        const deals = b.won + b.lost;
        return {
          region,
          won: b.won,
          lost: b.lost,
          deals,
          winRate: deals ? this.round((b.won / deals) * 100) : 0,
        };
      })
      .sort((a, b) => b.deals - a.deals);

    return {
      metrics: {
        overallWinRate: decided ? this.round((won.length / decided) * 100) : 0,
        dealsWon: won.length,
        dealsLost: lost.length,
        avgWonDealSize: this.round(avgWonDealSize, 0),
        avgLostDealSize: this.round(avgLostDealSize, 0),
      },
      winLossTrend,
      lossReasons,
      dealSizeWinRate,
      regionWinRate,
    };
  }

  // ----- Quotes dashboard -----
  async getQuotesDashboard(companyId: string): Promise<{
    metrics: {
      totalQuotes: number;
      totalValue: number;
      avgQuoteValue: number;
      conversionRate: number;
    };
    volumeTrend: { month: string; count: number; value: number }[];
    statusDistribution: { status: string; count: number }[];
    avgQuoteValue: { month: string; value: number }[];
  }> {
    const quotes = await this.loadQuotes(companyId);
    const total = quotes.length;
    const totalValue = quotes.reduce((s, q) => s + this.num(q.totalAmount), 0);
    const won = quotes.filter((q) => this.isWon(q)).length;

    const trendMap = new Map<string, { count: number; value: number }>();
    for (const label of MONTH_LABELS) trendMap.set(label, { count: 0, value: 0 });
    for (const q of quotes) {
      const key = this.monthKey(q.quoteDate || q.createdAt);
      if (!trendMap.has(key)) trendMap.set(key, { count: 0, value: 0 });
      const b = trendMap.get(key)!;
      b.count += 1;
      b.value += this.num(q.totalAmount);
    }
    const activeMonths = MONTH_LABELS.filter((m) => trendMap.get(m)!.count > 0);
    const volumeTrend = activeMonths.map((month) => ({
      month,
      count: trendMap.get(month)!.count,
      value: this.round(trendMap.get(month)!.value, 0),
    }));
    const avgQuoteValueByMonth = activeMonths.map((month) => {
      const b = trendMap.get(month)!;
      return { month, value: b.count ? this.round(b.value / b.count, 0) : 0 };
    });

    const statusMap = new Map<string, number>();
    for (const q of quotes) {
      statusMap.set(q.status, (statusMap.get(q.status) || 0) + 1);
    }
    const statusDistribution = Array.from(statusMap.entries())
      .map(([status, count]) => ({ status, count }))
      .sort((a, b) => b.count - a.count);

    return {
      metrics: {
        totalQuotes: total,
        totalValue: this.round(totalValue, 0),
        avgQuoteValue: total ? this.round(totalValue / total, 0) : 0,
        conversionRate: total ? this.round((won / total) * 100) : 0,
      },
      volumeTrend,
      statusDistribution,
      avgQuoteValue: avgQuoteValueByMonth,
    };
  }

  // ----- Discounts dashboard -----
  async getDiscountsDashboard(companyId: string): Promise<{
    metrics: {
      avgDiscountPercentage: number;
      totalDiscountAmount: number;
      quotesWithDiscount: number;
    };
    discountTrend: { month: string; avgDiscount: number }[];
    discountDistribution: { range: string; count: number; percentage: number }[];
    marginImpact: { month: string; avgMargin: number }[];
  }> {
    const quotes = await this.loadQuotes(companyId);
    const total = quotes.length;
    const totalDiscountAmount = quotes.reduce(
      (s, q) => s + this.num(q.totalDiscount),
      0,
    );
    const withDiscount = quotes.filter((q) => this.num(q.totalDiscount) > 0).length;
    const avgDiscountPercentage = total
      ? quotes.reduce((s, q) => s + this.num(q.discountPercentage), 0) / total
      : 0;

    const trendMap = new Map<string, { sumPct: number; sumMargin: number; count: number }>();
    for (const q of quotes) {
      const key = this.monthKey(q.quoteDate || q.createdAt);
      if (!trendMap.has(key)) trendMap.set(key, { sumPct: 0, sumMargin: 0, count: 0 });
      const b = trendMap.get(key)!;
      b.sumPct += this.num(q.discountPercentage);
      b.sumMargin += this.num(q.marginPercentage);
      b.count += 1;
    }
    const activeMonths = MONTH_LABELS.filter((m) => trendMap.has(m));
    const discountTrend = activeMonths.map((month) => {
      const b = trendMap.get(month)!;
      return { month, avgDiscount: b.count ? this.round(b.sumPct / b.count) : 0 };
    });
    const marginImpact = activeMonths.map((month) => {
      const b = trendMap.get(month)!;
      return { month, avgMargin: b.count ? this.round(b.sumMargin / b.count) : 0 };
    });

    const distBuckets: { range: string; test: (v: number) => boolean }[] = [
      { range: '0-5%', test: (v) => v >= 0 && v < 5 },
      { range: '5-10%', test: (v) => v >= 5 && v < 10 },
      { range: '10-15%', test: (v) => v >= 10 && v < 15 },
      { range: '15-20%', test: (v) => v >= 15 && v < 20 },
      { range: '>20%', test: (v) => v >= 20 },
    ];
    const discountDistribution = distBuckets.map((bucket) => {
      const count = quotes.filter((q) =>
        bucket.test(this.num(q.discountPercentage)),
      ).length;
      return {
        range: bucket.range,
        count,
        percentage: total ? this.round((count / total) * 100) : 0,
      };
    });

    return {
      metrics: {
        avgDiscountPercentage: this.round(avgDiscountPercentage),
        totalDiscountAmount: this.round(totalDiscountAmount, 0),
        quotesWithDiscount: withDiscount,
      },
      discountTrend,
      discountDistribution,
      marginImpact,
    };
  }

  // ----- Sales cycle dashboard -----
  async getSalesCycleDashboard(companyId: string): Promise<{
    metrics: {
      avgCycleDays: number;
      avgApprovalDays: number;
      conversionRate: number;
      totalDeals: number;
    };
    cycleTrend: { month: string; avgDays: number }[];
    conversionFunnel: { stage: string; count: number }[];
    cycleBySize: { range: string; avgDays: number }[];
  }> {
    const quotes = await this.loadQuotes(companyId);
    const total = quotes.length;

    const daysBetween = (a?: Date | string, b?: Date | string): number | null => {
      if (!a || !b) return null;
      const d1 = new Date(a).getTime();
      const d2 = new Date(b).getTime();
      if (Number.isNaN(d1) || Number.isNaN(d2)) return null;
      return Math.max(0, (d2 - d1) / (1000 * 60 * 60 * 24));
    };

    const cycleDaysList: { month: string; days: number; amount: number }[] = [];
    let approvalSum = 0;
    let approvalCount = 0;
    for (const q of quotes) {
      const end = q.convertedAt || q.customerResponseAt;
      const cycle = daysBetween(q.quoteDate || q.createdAt, end || undefined);
      if (cycle !== null) {
        cycleDaysList.push({
          month: this.monthKey(q.quoteDate || q.createdAt),
          days: cycle,
          amount: this.num(q.totalAmount),
        });
      }
      const approval = daysBetween(q.createdAt, q.approvedAt || undefined);
      if (approval !== null) {
        approvalSum += approval;
        approvalCount += 1;
      }
    }
    const avgCycleDays = cycleDaysList.length
      ? cycleDaysList.reduce((s, c) => s + c.days, 0) / cycleDaysList.length
      : 0;

    const trendMap = new Map<string, { sum: number; count: number }>();
    for (const c of cycleDaysList) {
      if (!trendMap.has(c.month)) trendMap.set(c.month, { sum: 0, count: 0 });
      const b = trendMap.get(c.month)!;
      b.sum += c.days;
      b.count += 1;
    }
    const cycleTrend = MONTH_LABELS.filter((m) => trendMap.has(m)).map((month) => {
      const b = trendMap.get(month)!;
      return { month, avgDays: b.count ? this.round(b.sum / b.count) : 0 };
    });

    // Funnel by lifecycle
    const funnelStages: { stage: string; statuses: QuoteStatus[] }[] = [
      { stage: 'Draft', statuses: [QuoteStatus.DRAFT] },
      {
        stage: 'Pending / Approved',
        statuses: [QuoteStatus.PENDING_APPROVAL, QuoteStatus.APPROVED],
      },
      { stage: 'Sent', statuses: [QuoteStatus.SENT] },
      {
        stage: 'Won',
        statuses: [QuoteStatus.ACCEPTED, QuoteStatus.CONVERTED],
      },
    ];
    const conversionFunnel = funnelStages.map((stage) => ({
      stage: stage.stage,
      count: quotes.filter((q) => stage.statuses.includes(q.status)).length,
    }));

    const sizeBuckets: { range: string; test: (v: number) => boolean }[] = [
      { range: '< 200K', test: (v) => v < 200000 },
      { range: '200K - 500K', test: (v) => v >= 200000 && v < 500000 },
      { range: '500K - 1M', test: (v) => v >= 500000 && v < 1000000 },
      { range: '> 1M', test: (v) => v >= 1000000 },
    ];
    const cycleBySize = sizeBuckets.map((bucket) => {
      const list = cycleDaysList.filter((c) => bucket.test(c.amount));
      return {
        range: bucket.range,
        avgDays: list.length
          ? this.round(list.reduce((s, c) => s + c.days, 0) / list.length)
          : 0,
      };
    });

    const won = quotes.filter((q) => this.isWon(q)).length;

    return {
      metrics: {
        avgCycleDays: this.round(avgCycleDays),
        avgApprovalDays: approvalCount ? this.round(approvalSum / approvalCount) : 0,
        conversionRate: total ? this.round((won / total) * 100) : 0,
        totalDeals: total,
      },
      cycleTrend,
      conversionFunnel,
      cycleBySize,
    };
  }

  // ----- Pricing dashboard -----
  async getPricingDashboard(companyId: string): Promise<{
    metrics: {
      avgDiscountPercentage: number;
      avgMarginPercentage: number;
      totalRevenue: number;
      wonRevenue: number;
    };
    discountTrend: { month: string; avgDiscount: number }[];
    marginTrend: { month: string; avgMargin: number }[];
    discountVsDealSize: { range: string; avgDiscount: number; count: number }[];
  }> {
    const quotes = await this.loadQuotes(companyId);
    const total = quotes.length;
    const won = quotes.filter((q) => this.isWon(q));

    const avgDiscountPercentage = total
      ? quotes.reduce((s, q) => s + this.num(q.discountPercentage), 0) / total
      : 0;
    const avgMarginPercentage = total
      ? quotes.reduce((s, q) => s + this.num(q.marginPercentage), 0) / total
      : 0;

    const trendMap = new Map<string, { disc: number; margin: number; count: number }>();
    for (const q of quotes) {
      const key = this.monthKey(q.quoteDate || q.createdAt);
      if (!trendMap.has(key)) trendMap.set(key, { disc: 0, margin: 0, count: 0 });
      const b = trendMap.get(key)!;
      b.disc += this.num(q.discountPercentage);
      b.margin += this.num(q.marginPercentage);
      b.count += 1;
    }
    const activeMonths = MONTH_LABELS.filter((m) => trendMap.has(m));
    const discountTrend = activeMonths.map((month) => {
      const b = trendMap.get(month)!;
      return { month, avgDiscount: b.count ? this.round(b.disc / b.count) : 0 };
    });
    const marginTrend = activeMonths.map((month) => {
      const b = trendMap.get(month)!;
      return { month, avgMargin: b.count ? this.round(b.margin / b.count) : 0 };
    });

    const sizeBuckets: { range: string; test: (v: number) => boolean }[] = [
      { range: '< 200K', test: (v) => v < 200000 },
      { range: '200K - 500K', test: (v) => v >= 200000 && v < 500000 },
      { range: '500K - 1M', test: (v) => v >= 500000 && v < 1000000 },
      { range: '> 1M', test: (v) => v >= 1000000 },
    ];
    const discountVsDealSize = sizeBuckets.map((bucket) => {
      const list = quotes.filter((q) => bucket.test(this.num(q.totalAmount)));
      return {
        range: bucket.range,
        count: list.length,
        avgDiscount: list.length
          ? this.round(
              list.reduce((s, q) => s + this.num(q.discountPercentage), 0) /
                list.length,
            )
          : 0,
      };
    });

    return {
      metrics: {
        avgDiscountPercentage: this.round(avgDiscountPercentage),
        avgMarginPercentage: this.round(avgMarginPercentage),
        totalRevenue: this.round(
          quotes.reduce((s, q) => s + this.num(q.totalAmount), 0),
          0,
        ),
        wonRevenue: this.round(
          won.reduce((s, q) => s + this.num(q.totalAmount), 0),
          0,
        ),
      },
      discountTrend,
      marginTrend,
      discountVsDealSize,
    };
  }

  // ----- Products dashboard (aggregates over quote items) -----
  async getProductsDashboard(companyId: string): Promise<{
    metrics: {
      totalLineItems: number;
      distinctProducts: number;
      totalRevenue: number;
    };
    topProducts: {
      productId: string;
      name: string;
      timesQuoted: number;
      totalRevenue: number;
      avgSellingPrice: number;
    }[];
  }> {
    if (!companyId) {
      return {
        metrics: { totalLineItems: 0, distinctProducts: 0, totalRevenue: 0 },
        topProducts: [],
      };
    }
    // Join quote items to quotes of this company.
    const rows = await this.quoteRepository
      .createQueryBuilder('q')
      .innerJoin('cpq_quote_items', 'item', 'item."quoteId" = q.id')
      .where('q.companyId = :companyId', { companyId })
      .select('item."productId"', 'productId')
      .addSelect('MAX(item.name)', 'name')
      .addSelect('COUNT(*)', 'timesQuoted')
      .addSelect(
        'SUM(item.quantity * item."unitPrice")',
        'totalRevenue',
      )
      .addSelect('AVG(item."unitPrice")', 'avgSellingPrice')
      .groupBy('item."productId"')
      .orderBy('SUM(item.quantity * item."unitPrice")', 'DESC')
      .getRawMany<{
        productId: string;
        name: string;
        timesQuoted: string;
        totalRevenue: string;
        avgSellingPrice: string;
      }>();

    const topProducts = rows.slice(0, 20).map((r) => ({
      productId: r.productId || 'unknown',
      name: r.name || 'Unknown',
      timesQuoted: this.num(r.timesQuoted),
      totalRevenue: this.round(this.num(r.totalRevenue), 0),
      avgSellingPrice: this.round(this.num(r.avgSellingPrice), 0),
    }));

    return {
      metrics: {
        totalLineItems: rows.reduce((s, r) => s + this.num(r.timesQuoted), 0),
        distinctProducts: rows.length,
        totalRevenue: this.round(
          rows.reduce((s, r) => s + this.num(r.totalRevenue), 0),
          0,
        ),
      },
      topProducts,
    };
  }
}
