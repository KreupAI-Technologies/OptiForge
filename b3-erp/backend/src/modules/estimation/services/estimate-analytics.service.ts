import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import {
  EstimateAccuracyRecord,
  EstimatorPerformance,
  HistoricalBenchmark,
  RiskAnalysis,
  WinLossRecord,
  WinLossStatus,
} from '../entities/estimate-analytics.entity';
import {
  CostEstimate,
  CostEstimateStatus,
} from '../entities/cost-estimate.entity';

@Injectable()
export class EstimateAnalyticsService {
  constructor(
    @InjectRepository(WinLossRecord)
    private winLossRepository: Repository<WinLossRecord>,
    @InjectRepository(EstimateAccuracyRecord)
    private accuracyRepository: Repository<EstimateAccuracyRecord>,
    @InjectRepository(RiskAnalysis)
    private riskAnalysisRepository: Repository<RiskAnalysis>,
    @InjectRepository(EstimatorPerformance)
    private performanceRepository: Repository<EstimatorPerformance>,
    @InjectRepository(HistoricalBenchmark)
    private benchmarkRepository: Repository<HistoricalBenchmark>,
    @InjectRepository(CostEstimate)
    private costEstimateRepository: Repository<CostEstimate>,
  ) {}

  // Win/Loss Analysis
  async createWinLossRecord(
    companyId: string,
    data: Partial<WinLossRecord>,
  ): Promise<WinLossRecord> {
    const record = this.winLossRepository.create({
      ...data,
      companyId,
    });
    return this.winLossRepository.save(record);
  }

  async updateWinLossRecord(
    companyId: string,
    id: string,
    data: Partial<WinLossRecord>,
  ): Promise<WinLossRecord> {
    const record = await this.winLossRepository.findOne({
      where: { id, companyId },
    });
    if (!record) {
      throw new NotFoundException(`Win/Loss Record with ID ${id} not found`);
    }
    Object.assign(record, data);
    return this.winLossRepository.save(record);
  }

  async getWinLossAnalysis(
    companyId: string,
    fromDate: string,
    toDate: string,
  ): Promise<{
    totalEstimates: number;
    won: number;
    lost: number;
    pending: number;
    winRate: number;
    totalEstimatedValue: number;
    totalWonValue: number;
    averageWinAmount: number;
    averageLossAmount: number;
    byReason: { reason: string; count: number }[];
    byCustomer: { customerName: string; won: number; lost: number; winRate: number }[];
    byEstimator: { estimatorName: string; won: number; lost: number; winRate: number }[];
    trend: { month: string; won: number; lost: number; winRate: number }[];
  }> {
    const records = await this.winLossRepository.find({
      where: {
        companyId,
        submissionDate: Between(new Date(fromDate), new Date(toDate)),
      },
    });

    const won = records.filter((r) => r.status === WinLossStatus.WON);
    const lost = records.filter((r) => r.status === WinLossStatus.LOST);
    const pending = records.filter((r) => r.status === WinLossStatus.PENDING);

    const winRate =
      won.length + lost.length > 0
        ? (won.length / (won.length + lost.length)) * 100
        : 0;

    const totalEstimatedValue = records.reduce(
      (sum, r) => sum + Number(r.estimatedAmount),
      0,
    );
    const totalWonValue = won.reduce(
      (sum, r) => sum + Number(r.actualAmount || r.estimatedAmount),
      0,
    );
    const averageWinAmount =
      won.length > 0
        ? won.reduce((sum, r) => sum + Number(r.estimatedAmount), 0) / won.length
        : 0;
    const averageLossAmount =
      lost.length > 0
        ? lost.reduce((sum, r) => sum + Number(r.estimatedAmount), 0) / lost.length
        : 0;

    // Aggregate by reason
    const reasonCounts = new Map<string, number>();
    lost.forEach((r) => {
      if (r.winLossReason) {
        reasonCounts.set(
          r.winLossReason,
          (reasonCounts.get(r.winLossReason) || 0) + 1,
        );
      }
    });
    const byReason = Array.from(reasonCounts.entries()).map(
      ([reason, count]) => ({ reason, count }),
    );

    // Aggregate by customer
    const customerStats = new Map<
      string,
      { won: number; lost: number }
    >();
    records.forEach((r) => {
      if (r.customerName) {
        const stats = customerStats.get(r.customerName) || { won: 0, lost: 0 };
        if (r.status === WinLossStatus.WON) stats.won++;
        if (r.status === WinLossStatus.LOST) stats.lost++;
        customerStats.set(r.customerName, stats);
      }
    });
    const byCustomer = Array.from(customerStats.entries()).map(
      ([customerName, stats]) => ({
        customerName,
        ...stats,
        winRate:
          stats.won + stats.lost > 0
            ? (stats.won / (stats.won + stats.lost)) * 100
            : 0,
      }),
    );

    // Aggregate by estimator
    const estimatorStats = new Map<
      string,
      { won: number; lost: number }
    >();
    records.forEach((r) => {
      if (r.estimatorName) {
        const stats = estimatorStats.get(r.estimatorName) || { won: 0, lost: 0 };
        if (r.status === WinLossStatus.WON) stats.won++;
        if (r.status === WinLossStatus.LOST) stats.lost++;
        estimatorStats.set(r.estimatorName, stats);
      }
    });
    const byEstimator = Array.from(estimatorStats.entries()).map(
      ([estimatorName, stats]) => ({
        estimatorName,
        ...stats,
        winRate:
          stats.won + stats.lost > 0
            ? (stats.won / (stats.won + stats.lost)) * 100
            : 0,
      }),
    );

    // Monthly trend
    const monthlyStats = new Map<
      string,
      { won: number; lost: number }
    >();
    records.forEach((r) => {
      const month = new Date(r.submissionDate).toISOString().slice(0, 7);
      const stats = monthlyStats.get(month) || { won: 0, lost: 0 };
      if (r.status === WinLossStatus.WON) stats.won++;
      if (r.status === WinLossStatus.LOST) stats.lost++;
      monthlyStats.set(month, stats);
    });
    const trend = Array.from(monthlyStats.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, stats]) => ({
        month,
        ...stats,
        winRate:
          stats.won + stats.lost > 0
            ? (stats.won / (stats.won + stats.lost)) * 100
            : 0,
      }));

    return {
      totalEstimates: records.length,
      won: won.length,
      lost: lost.length,
      pending: pending.length,
      winRate,
      totalEstimatedValue,
      totalWonValue,
      averageWinAmount,
      averageLossAmount,
      byReason,
      byCustomer,
      byEstimator,
      trend,
    };
  }

  // Accuracy Analysis
  async createAccuracyRecord(
    companyId: string,
    data: Partial<EstimateAccuracyRecord>,
  ): Promise<EstimateAccuracyRecord> {
    const record = this.accuracyRepository.create({
      ...data,
      companyId,
    });
    this.calculateVariances(record);
    return this.accuracyRepository.save(record);
  }

  async updateAccuracyRecord(
    companyId: string,
    id: string,
    data: Partial<EstimateAccuracyRecord>,
  ): Promise<EstimateAccuracyRecord> {
    const record = await this.accuracyRepository.findOne({
      where: { id, companyId },
    });
    if (!record) {
      throw new NotFoundException(`Accuracy Record with ID ${id} not found`);
    }
    Object.assign(record, data);
    this.calculateVariances(record);
    return this.accuracyRepository.save(record);
  }

  async getAccuracyAnalysis(
    companyId: string,
    fromDate: string,
    toDate: string,
  ): Promise<{
    averageAccuracy: number;
    averageMaterialVariance: number;
    averageLaborVariance: number;
    averageOverheadVariance: number;
    averageTotalVariance: number;
    byCategory: { category: string; averageVariance: number; count: number }[];
    byEstimator: { estimatorName: string; averageAccuracy: number; count: number }[];
    trend: { month: string; averageAccuracy: number; count: number }[];
  }> {
    const records = await this.accuracyRepository.find({
      where: {
        companyId,
        estimateDate: Between(new Date(fromDate), new Date(toDate)),
      },
    });

    if (records.length === 0) {
      return {
        averageAccuracy: 0,
        averageMaterialVariance: 0,
        averageLaborVariance: 0,
        averageOverheadVariance: 0,
        averageTotalVariance: 0,
        byCategory: [],
        byEstimator: [],
        trend: [],
      };
    }

    const sum = (arr: number[]) =>
      arr.reduce((s, v) => s + v, 0) / (arr.length || 1);

    const averageAccuracy = sum(
      records.map((r) => Number(r.accuracyScore) || 0),
    );
    const averageMaterialVariance = sum(
      records.map((r) => Number(r.materialVariancePercentage) || 0),
    );
    const averageLaborVariance = sum(
      records.map((r) => Number(r.laborVariancePercentage) || 0),
    );
    const averageOverheadVariance = sum(
      records.map((r) => Number(r.overheadVariancePercentage) || 0),
    );
    const averageTotalVariance = sum(
      records.map((r) => Number(r.totalVariancePercentage) || 0),
    );

    // By estimator
    const estimatorStats = new Map<
      string,
      { totalAccuracy: number; count: number }
    >();
    records.forEach((r) => {
      if (r.estimatorName) {
        const stats = estimatorStats.get(r.estimatorName) || {
          totalAccuracy: 0,
          count: 0,
        };
        stats.totalAccuracy += Number(r.accuracyScore) || 0;
        stats.count++;
        estimatorStats.set(r.estimatorName, stats);
      }
    });
    const byEstimator = Array.from(estimatorStats.entries()).map(
      ([estimatorName, stats]) => ({
        estimatorName,
        averageAccuracy: stats.totalAccuracy / stats.count,
        count: stats.count,
      }),
    );

    // Monthly trend
    const monthlyStats = new Map<
      string,
      { totalAccuracy: number; count: number }
    >();
    records.forEach((r) => {
      const month = new Date(r.estimateDate).toISOString().slice(0, 7);
      const stats = monthlyStats.get(month) || { totalAccuracy: 0, count: 0 };
      stats.totalAccuracy += Number(r.accuracyScore) || 0;
      stats.count++;
      monthlyStats.set(month, stats);
    });
    const trend = Array.from(monthlyStats.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, stats]) => ({
        month,
        averageAccuracy: stats.totalAccuracy / stats.count,
        count: stats.count,
      }));

    return {
      averageAccuracy,
      averageMaterialVariance,
      averageLaborVariance,
      averageOverheadVariance,
      averageTotalVariance,
      byCategory: [],
      byEstimator,
      trend,
    };
  }

  private calculateVariances(record: EstimateAccuracyRecord): void {
    const estMat = Number(record.estimatedMaterialCost) || 0;
    const estLab = Number(record.estimatedLaborCost) || 0;
    const estOh = Number(record.estimatedOverheadCost) || 0;
    const estTotal = Number(record.estimatedTotalCost) || 0;

    const actMat = Number(record.actualMaterialCost) || 0;
    const actLab = Number(record.actualLaborCost) || 0;
    const actOh = Number(record.actualOverheadCost) || 0;
    const actTotal = Number(record.actualTotalCost) || 0;

    record.materialVariance = actMat - estMat;
    record.materialVariancePercentage =
      estMat > 0 ? (record.materialVariance / estMat) * 100 : 0;

    record.laborVariance = actLab - estLab;
    record.laborVariancePercentage =
      estLab > 0 ? (record.laborVariance / estLab) * 100 : 0;

    record.overheadVariance = actOh - estOh;
    record.overheadVariancePercentage =
      estOh > 0 ? (record.overheadVariance / estOh) * 100 : 0;

    record.totalVariance = actTotal - estTotal;
    record.totalVariancePercentage =
      estTotal > 0 ? (record.totalVariance / estTotal) * 100 : 0;

    record.accuracyScore = Math.max(
      0,
      100 - Math.abs(Number(record.totalVariancePercentage)),
    );
  }

  // Risk Analysis
  async createRiskAnalysis(
    companyId: string,
    data: Partial<RiskAnalysis>,
  ): Promise<RiskAnalysis> {
    const analysis = this.riskAnalysisRepository.create({
      ...data,
      companyId,
    });
    this.calculateRiskMetrics(analysis);
    return this.riskAnalysisRepository.save(analysis);
  }

  async findRiskAnalysisByEstimate(
    companyId: string,
    estimateId: string,
  ): Promise<RiskAnalysis | null> {
    return this.riskAnalysisRepository.findOne({
      where: { companyId, estimateId },
    });
  }

  async updateRiskAnalysis(
    companyId: string,
    id: string,
    data: Partial<RiskAnalysis>,
  ): Promise<RiskAnalysis> {
    const analysis = await this.riskAnalysisRepository.findOne({
      where: { id, companyId },
    });
    if (!analysis) {
      throw new NotFoundException(`Risk Analysis with ID ${id} not found`);
    }
    Object.assign(analysis, data);
    this.calculateRiskMetrics(analysis);
    return this.riskAnalysisRepository.save(analysis);
  }

  private calculateRiskMetrics(analysis: RiskAnalysis): void {
    if (!analysis.risks || analysis.risks.length === 0) {
      analysis.overallRiskScore = 0;
      analysis.totalMitigationCost = 0;
      return;
    }

    const probabilityWeights = { Low: 1, Medium: 2, High: 3 };
    const impactWeights = { Low: 1, Medium: 2, High: 3 };

    let totalScore = 0;
    let totalMitigation = 0;

    for (const risk of analysis.risks) {
      const probWeight = probabilityWeights[risk.probability] || 1;
      const impactWeight = impactWeights[risk.impact] || 1;
      risk.riskScore = probWeight * impactWeight;
      totalScore += risk.riskScore;
      totalMitigation += risk.mitigationCost || 0;
    }

    analysis.overallRiskScore = totalScore / analysis.risks.length;
    analysis.totalMitigationCost = totalMitigation;

    if (analysis.overallRiskScore <= 2) {
      analysis.overallRiskLevel = 'Low' as any;
    } else if (analysis.overallRiskScore <= 4) {
      analysis.overallRiskLevel = 'Medium' as any;
    } else if (analysis.overallRiskScore <= 6) {
      analysis.overallRiskLevel = 'High' as any;
    } else {
      analysis.overallRiskLevel = 'Critical' as any;
    }
  }

  // Estimator Performance
  async updateEstimatorPerformance(
    companyId: string,
    estimatorId: string,
    estimatorName: string,
    year: number,
    month: number,
  ): Promise<EstimatorPerformance> {
    let performance = await this.performanceRepository.findOne({
      where: { companyId, estimatorId, year, month },
    });

    if (!performance) {
      performance = this.performanceRepository.create({
        companyId,
        estimatorId,
        estimatorName,
        year,
        month,
      });
    }

    const winLossRecords = await this.winLossRepository.find({
      where: { companyId, estimatorId },
    });

    const accuracyRecords = await this.accuracyRepository.find({
      where: { companyId, estimatorId },
    });

    performance.totalEstimates = winLossRecords.length;
    performance.wonEstimates = winLossRecords.filter(
      (r) => r.status === WinLossStatus.WON,
    ).length;
    performance.lostEstimates = winLossRecords.filter(
      (r) => r.status === WinLossStatus.LOST,
    ).length;

    performance.winRate =
      performance.wonEstimates + performance.lostEstimates > 0
        ? (performance.wonEstimates /
            (performance.wonEstimates + performance.lostEstimates)) *
          100
        : 0;

    performance.totalEstimatedValue = winLossRecords.reduce(
      (sum, r) => sum + Number(r.estimatedAmount),
      0,
    );

    performance.totalWonValue = winLossRecords
      .filter((r) => r.status === WinLossStatus.WON)
      .reduce((sum, r) => sum + Number(r.actualAmount || r.estimatedAmount), 0);

    if (accuracyRecords.length > 0) {
      performance.averageAccuracy =
        accuracyRecords.reduce(
          (sum, r) => sum + (Number(r.accuracyScore) || 0),
          0,
        ) / accuracyRecords.length;
    }

    return this.performanceRepository.save(performance);
  }

  async getEstimatorPerformance(
    companyId: string,
    estimatorId: string,
    year: number,
  ): Promise<EstimatorPerformance[]> {
    return this.performanceRepository.find({
      where: { companyId, estimatorId, year },
      order: { month: 'ASC' },
    });
  }

  async getAllEstimatorsPerformance(
    companyId: string,
    year: number,
    month: number,
  ): Promise<EstimatorPerformance[]> {
    return this.performanceRepository.find({
      where: { companyId, year, month },
      order: { winRate: 'DESC' },
    });
  }

  // Historical Benchmarks
  async createBenchmark(
    companyId: string,
    data: Partial<HistoricalBenchmark>,
  ): Promise<HistoricalBenchmark> {
    const benchmark = this.benchmarkRepository.create({
      ...data,
      companyId,
    });
    return this.benchmarkRepository.save(benchmark);
  }

  async findBenchmarks(
    companyId: string,
    filters?: { category?: string; subCategory?: string },
  ): Promise<HistoricalBenchmark[]> {
    const query = this.benchmarkRepository
      .createQueryBuilder('benchmark')
      .where('benchmark.companyId = :companyId', { companyId })
      .orderBy('benchmark.category', 'ASC')
      .addOrderBy('benchmark.metricName', 'ASC');

    if (filters?.category) {
      query.andWhere('benchmark.category = :category', {
        category: filters.category,
      });
    }
    if (filters?.subCategory) {
      query.andWhere('benchmark.subCategory = :subCategory', {
        subCategory: filters.subCategory,
      });
    }

    return query.getMany();
  }

  async updateBenchmark(
    companyId: string,
    id: string,
    data: Partial<HistoricalBenchmark>,
  ): Promise<HistoricalBenchmark> {
    const benchmark = await this.benchmarkRepository.findOne({
      where: { id, companyId },
    });
    if (!benchmark) {
      throw new NotFoundException(`Benchmark with ID ${id} not found`);
    }
    Object.assign(benchmark, data);
    return this.benchmarkRepository.save(benchmark);
  }

  async calculateBenchmarksFromHistory(
    companyId: string,
    category: string,
    metricName: string,
  ): Promise<HistoricalBenchmark> {
    const estimates = await this.costEstimateRepository.find({
      where: { companyId },
    });

    const values: number[] = [];
    estimates.forEach((e) => {
      const breakdown = e.materialCostBreakdown || [];
      breakdown.forEach((b) => {
        if (b.categoryName === category) {
          values.push(b.amount);
        }
      });
    });

    if (values.length === 0) {
      throw new NotFoundException(`No data found for category ${category}`);
    }

    values.sort((a, b) => a - b);

    const sum = values.reduce((s, v) => s + v, 0);
    const avg = sum / values.length;
    const median =
      values.length % 2 === 0
        ? (values[values.length / 2 - 1] + values[values.length / 2]) / 2
        : values[Math.floor(values.length / 2)];

    const variance =
      values.reduce((s, v) => s + Math.pow(v - avg, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    return this.createBenchmark(companyId, {
      category,
      metricName,
      unit: 'USD',
      averageValue: avg,
      minValue: values[0],
      maxValue: values[values.length - 1],
      medianValue: median,
      standardDeviation: stdDev,
      sampleSize: values.length,
      periodStart: new Date(new Date().getFullYear(), 0, 1),
      periodEnd: new Date(),
    });
  }

  // Category-performance breakdown — aggregates real cost-estimate rows by their
  // material-cost-breakdown category. For each category returns count of estimates
  // touching it, win rate (won = Approved/Converted over all decided estimates),
  // average estimated value contributed by that category, and a variance-based
  // accuracy proxy (100 − avg contingency%). Pure aggregation, no new table.
  async getCategoryPerformance(companyId: string): Promise<
    {
      category: string;
      totalEstimates: number;
      winRate: number;
      avgValue: number;
      accuracy: number;
    }[]
  > {
    const estimates = await this.costEstimateRepository.find({
      where: { companyId },
    });

    const WON = new Set<CostEstimateStatus>([
      CostEstimateStatus.APPROVED,
      CostEstimateStatus.CONVERTED,
    ]);
    const DECIDED = new Set<CostEstimateStatus>([
      CostEstimateStatus.APPROVED,
      CostEstimateStatus.CONVERTED,
      CostEstimateStatus.REJECTED,
    ]);

    const stats = new Map<
      string,
      {
        count: number;
        won: number;
        decided: number;
        totalValue: number;
        contingencySum: number;
        contingencyCount: number;
      }
    >();

    for (const e of estimates) {
      const breakdown = e.materialCostBreakdown || [];
      const isWon = WON.has(e.status);
      const isDecided = DECIDED.has(e.status);
      const contingencyPct = Number(e.contingencyPercentage) || 0;

      // Deduplicate categories within a single estimate so count reflects the
      // number of estimates touching the category, not line items.
      const seen = new Set<string>();
      for (const b of breakdown) {
        const category = b.categoryName;
        if (!category || seen.has(category)) continue;
        seen.add(category);

        const s =
          stats.get(category) || {
            count: 0,
            won: 0,
            decided: 0,
            totalValue: 0,
            contingencySum: 0,
            contingencyCount: 0,
          };
        s.count += 1;
        if (isWon) s.won += 1;
        if (isDecided) s.decided += 1;
        s.totalValue += Number(b.amount) || 0;
        s.contingencySum += contingencyPct;
        s.contingencyCount += 1;
        stats.set(category, s);
      }
    }

    return Array.from(stats.entries())
      .map(([category, s]) => ({
        category,
        totalEstimates: s.count,
        winRate: s.decided > 0 ? (s.won / s.decided) * 100 : 0,
        avgValue: s.count > 0 ? s.totalValue / s.count : 0,
        accuracy:
          s.contingencyCount > 0
            ? Math.max(0, 100 - s.contingencySum / s.contingencyCount)
            : 0,
      }))
      .sort((a, b) => b.totalEstimates - a.totalEstimates);
  }
}
