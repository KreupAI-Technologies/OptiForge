import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import {
  ReportColumn,
  ReportDefinition,
} from '../../../common/utils/report-render.util';
import { CostEstimate } from '../entities/cost-estimate.entity';
import {
  EstimateAccuracyRecord,
  WinLossRecord,
} from '../entities/estimate-analytics.entity';

/** Supported built-in estimation report types. */
export type EstimationReportType =
  | 'estimates'
  | 'win-loss'
  | 'accuracy';

export interface CustomEstimationReportRequest {
  reportName: string;
  description?: string;
  metrics: string[];
  filters?: string[];
  groupBy?: string[];
  dateRange?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Sources report rows from real estimation data (cost estimates + analytics)
 * and shapes them into the generic ReportDefinition consumed by the shared
 * PDF/Excel renderer.
 */
@Injectable()
export class EstimationReportService {
  constructor(
    @InjectRepository(CostEstimate)
    private readonly costEstimateRepository: Repository<CostEstimate>,
    @InjectRepository(WinLossRecord)
    private readonly winLossRepository: Repository<WinLossRecord>,
    @InjectRepository(EstimateAccuracyRecord)
    private readonly accuracyRepository: Repository<EstimateAccuracyRecord>,
  ) {}

  private dateWindow(
    fromDate?: string,
    toDate?: string,
  ): { from: Date; to: Date } {
    const to = toDate ? new Date(toDate) : new Date();
    const from = fromDate
      ? new Date(fromDate)
      : new Date(to.getFullYear() - 1, to.getMonth(), to.getDate());
    return { from, to };
  }

  /** Build a ReportDefinition for one of the built-in estimation report types. */
  async buildReport(
    companyId: string,
    type: EstimationReportType,
    fromDate?: string,
    toDate?: string,
  ): Promise<ReportDefinition> {
    switch (type) {
      case 'estimates':
        return this.buildEstimatesReport(companyId, fromDate, toDate);
      case 'win-loss':
        return this.buildWinLossReport(companyId, fromDate, toDate);
      case 'accuracy':
        return this.buildAccuracyReport(companyId, fromDate, toDate);
      default:
        throw new BadRequestException(`Unknown report type "${type}"`);
    }
  }

  /** The set of report types available for bulk download. */
  bulkTypes(): EstimationReportType[] {
    return ['estimates', 'win-loss', 'accuracy'];
  }

  async buildEstimatesReport(
    companyId: string,
    fromDate?: string,
    toDate?: string,
  ): Promise<ReportDefinition> {
    const estimates = await this.costEstimateRepository.find({
      where: { companyId },
      order: { createdAt: 'DESC' },
    });

    const columns: ReportColumn[] = [
      { key: 'estimateNumber', header: 'Estimate #', width: 2 },
      { key: 'title', header: 'Title', width: 3 },
      { key: 'customerName', header: 'Customer', width: 2.5 },
      { key: 'status', header: 'Status', width: 1.6 },
      { key: 'estimateType', header: 'Type', width: 1.4 },
      { key: 'currency', header: 'Cur', width: 0.8 },
      { key: 'materialCost', header: 'Material', width: 1.4, numeric: true },
      { key: 'laborCost', header: 'Labor', width: 1.4, numeric: true },
      { key: 'overheadCost', header: 'Overhead', width: 1.4, numeric: true },
      { key: 'totalCost', header: 'Total', width: 1.6, numeric: true },
      { key: 'estimateDate', header: 'Date', width: 1.4 },
    ];

    const rows = estimates.map((e) => ({
      estimateNumber: e.estimateNumber,
      title: e.title,
      customerName: e.customerName ?? '',
      status: e.status,
      estimateType: e.estimateType,
      currency: e.currency,
      materialCost: Number(e.materialCost) || 0,
      laborCost: Number(e.laborCost) || 0,
      overheadCost: Number(e.overheadCost) || 0,
      totalCost: Number(e.totalCost) || 0,
      estimateDate: e.estimateDate,
    }));

    const grandTotal = rows.reduce((s, r) => s + r.totalCost, 0);

    return {
      title: 'Cost Estimates Report',
      subtitle: 'All cost estimates',
      columns,
      rows,
      companyLabel: companyId,
      generatedAt: new Date(),
      summary: {
        'Total Estimates': rows.length,
        'Total Estimated Value': grandTotal.toFixed(2),
        Draft: rows.filter((r) => r.status === 'Draft').length,
        Approved: rows.filter((r) => r.status === 'Approved').length,
      },
    };
  }

  async buildWinLossReport(
    companyId: string,
    fromDate?: string,
    toDate?: string,
  ): Promise<ReportDefinition> {
    const { from, to } = this.dateWindow(fromDate, toDate);
    const records = await this.winLossRepository.find({
      where: { companyId, submissionDate: Between(from, to) },
      order: { submissionDate: 'DESC' },
    });

    const columns: ReportColumn[] = [
      { key: 'estimateNumber', header: 'Estimate #', width: 2 },
      { key: 'customerName', header: 'Customer', width: 3 },
      { key: 'estimatorName', header: 'Estimator', width: 2.5 },
      { key: 'status', header: 'Status', width: 1.4 },
      { key: 'estimatedAmount', header: 'Estimated', width: 1.6, numeric: true },
      { key: 'actualAmount', header: 'Actual', width: 1.6, numeric: true },
      { key: 'winLossReason', header: 'Reason', width: 2.5 },
      { key: 'submissionDate', header: 'Submitted', width: 1.6 },
    ];

    const rows = records.map((r) => ({
      estimateNumber: r.estimateNumber ?? '',
      customerName: r.customerName ?? '',
      estimatorName: r.estimatorName ?? '',
      status: r.status,
      estimatedAmount: Number(r.estimatedAmount) || 0,
      actualAmount: Number(r.actualAmount) || 0,
      winLossReason: r.winLossReason ?? '',
      submissionDate: r.submissionDate,
    }));

    const won = rows.filter((r) => r.status === 'Won').length;
    const lost = rows.filter((r) => r.status === 'Lost').length;

    return {
      title: 'Win / Loss Report',
      subtitle: `${from.toISOString().split('T')[0]} → ${
        to.toISOString().split('T')[0]
      }`,
      columns,
      rows,
      companyLabel: companyId,
      generatedAt: new Date(),
      summary: {
        Total: rows.length,
        Won: won,
        Lost: lost,
        'Win Rate %':
          won + lost > 0 ? ((won / (won + lost)) * 100).toFixed(1) : '0.0',
      },
    };
  }

  async buildAccuracyReport(
    companyId: string,
    fromDate?: string,
    toDate?: string,
  ): Promise<ReportDefinition> {
    const { from, to } = this.dateWindow(fromDate, toDate);
    const records = await this.accuracyRepository.find({
      where: { companyId, estimateDate: Between(from, to) },
      order: { estimateDate: 'DESC' },
    });

    const columns: ReportColumn[] = [
      { key: 'estimateNumber', header: 'Estimate #', width: 2 },
      { key: 'estimatorName', header: 'Estimator', width: 2.5 },
      {
        key: 'estimatedTotalCost',
        header: 'Estimated',
        width: 1.6,
        numeric: true,
      },
      { key: 'actualTotalCost', header: 'Actual', width: 1.6, numeric: true },
      {
        key: 'totalVariancePercentage',
        header: 'Variance %',
        width: 1.4,
        numeric: true,
      },
      { key: 'accuracyScore', header: 'Accuracy', width: 1.4, numeric: true },
      { key: 'estimateDate', header: 'Date', width: 1.6 },
    ];

    const rows = records.map((r) => ({
      estimateNumber: r.estimateNumber ?? '',
      estimatorName: r.estimatorName ?? '',
      estimatedTotalCost: Number(r.estimatedTotalCost) || 0,
      actualTotalCost: Number(r.actualTotalCost) || 0,
      totalVariancePercentage: Number(r.totalVariancePercentage) || 0,
      accuracyScore: Number(r.accuracyScore) || 0,
      estimateDate: r.estimateDate,
    }));

    const avgAccuracy =
      rows.length > 0
        ? rows.reduce((s, r) => s + r.accuracyScore, 0) / rows.length
        : 0;

    return {
      title: 'Estimate Accuracy Report',
      subtitle: `${from.toISOString().split('T')[0]} → ${
        to.toISOString().split('T')[0]
      }`,
      columns,
      rows,
      companyLabel: companyId,
      generatedAt: new Date(),
      summary: {
        Records: rows.length,
        'Average Accuracy %': avgAccuracy.toFixed(1),
      },
    };
  }

  /**
   * Build an ad-hoc custom report from selected metrics/filters over the cost
   * estimate data. Each selected metric maps to one column; filters narrow the
   * estimate set. Falls back to core financial columns when no metric maps.
   */
  async buildCustomReport(
    companyId: string,
    req: CustomEstimationReportRequest,
  ): Promise<ReportDefinition> {
    if (!req.reportName || !req.reportName.trim()) {
      throw new BadRequestException('reportName is required');
    }
    if (!req.metrics || req.metrics.length === 0) {
      throw new BadRequestException('At least one metric is required');
    }

    const { from, to } = this.resolveDateRange(req);
    const estimates = await this.costEstimateRepository.find({
      where: {
        companyId,
        ...(from && to ? { createdAt: Between(from, to) } : {}),
      },
      order: { createdAt: 'DESC' },
    });

    // Metric id -> column definition + row accessor.
    const metricMap: Record<
      string,
      { col: ReportColumn; get: (e: CostEstimate) => unknown }
    > = {
      'total-estimates': {
        col: { key: 'estimateNumber', header: 'Estimate #', width: 2 },
        get: (e) => e.estimateNumber,
      },
      'total-value': {
        col: { key: 'totalCost', header: 'Total Value', width: 1.6, numeric: true },
        get: (e) => Number(e.totalCost) || 0,
      },
      'avg-value': {
        col: { key: 'totalCost', header: 'Estimate Value', width: 1.6, numeric: true },
        get: (e) => Number(e.totalCost) || 0,
      },
      accuracy: {
        col: { key: 'status', header: 'Status', width: 1.4 },
        get: (e) => e.status,
      },
      'category-distribution': {
        col: { key: 'estimateType', header: 'Type', width: 1.4 },
        get: (e) => e.estimateType,
      },
      'pricing-trends': {
        col: { key: 'materialCost', header: 'Material', width: 1.4, numeric: true },
        get: (e) => Number(e.materialCost) || 0,
      },
    };

    // Always include a leading identity column, then selected metrics.
    const columns: ReportColumn[] = [
      { key: '__title', header: 'Estimate', width: 3 },
      { key: 'customerName', header: 'Customer', width: 2.5 },
    ];
    const accessors: { key: string; get: (e: CostEstimate) => unknown }[] = [];
    const seen = new Set<string>();
    for (const m of req.metrics) {
      const mapped = metricMap[m];
      if (mapped && !seen.has(mapped.col.key)) {
        seen.add(mapped.col.key);
        columns.push(mapped.col);
        accessors.push({ key: mapped.col.key, get: mapped.get });
      }
    }
    // Guarantee at least one data column.
    if (accessors.length === 0) {
      columns.push({
        key: 'totalCost',
        header: 'Total Value',
        width: 1.6,
        numeric: true,
      });
      accessors.push({ key: 'totalCost', get: (e) => Number(e.totalCost) || 0 });
    }

    const rows = estimates.map((e) => {
      const row: Record<string, unknown> = {
        __title: e.title,
        customerName: e.customerName ?? '',
      };
      for (const a of accessors) row[a.key] = a.get(e);
      return row;
    });

    const totalValue = estimates.reduce(
      (s, e) => s + (Number(e.totalCost) || 0),
      0,
    );

    return {
      title: req.reportName,
      subtitle:
        req.description ||
        `Custom estimation report · ${req.metrics.length} metric(s)`,
      columns,
      rows,
      companyLabel: companyId,
      generatedAt: new Date(),
      summary: {
        'Estimates Included': rows.length,
        'Total Estimated Value': totalValue.toFixed(2),
        Metrics: req.metrics.join(', '),
        ...(req.groupBy && req.groupBy.length
          ? { 'Grouped By': req.groupBy.join(', ') }
          : {}),
      },
    };
  }

  private resolveDateRange(
    req: CustomEstimationReportRequest,
  ): { from?: Date; to?: Date } {
    const now = new Date();
    const daysAgo = (n: number) =>
      new Date(now.getFullYear(), now.getMonth(), now.getDate() - n);

    switch (req.dateRange) {
      case 'last-7-days':
        return { from: daysAgo(7), to: now };
      case 'last-30-days':
        return { from: daysAgo(30), to: now };
      case 'last-90-days':
        return { from: daysAgo(90), to: now };
      case 'this-month':
        return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: now };
      case 'this-year':
        return { from: new Date(now.getFullYear(), 0, 1), to: now };
      case 'custom':
        return {
          from: req.startDate ? new Date(req.startDate) : undefined,
          to: req.endDate ? new Date(req.endDate) : undefined,
        };
      default:
        return {};
    }
  }
}
