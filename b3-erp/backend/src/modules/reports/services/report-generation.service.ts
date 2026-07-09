import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ReportColumn,
  ReportDefinition,
} from '../../../common/utils/report-render.util';
import { ReportCatalogItem } from '../entities/report-catalog-item.entity';
import { ReportDataset } from '../entities/report-dataset.entity';
import { ReportSavedItem } from '../entities/report-saved-item.entity';

interface SavedItemColumnConfig {
  field?: string;
  label?: string;
  type?: string;
  aggregation?: string;
  visible?: boolean;
}

export interface RunReportResult {
  reportId: string;
  reportName: string;
  columns: { key: string; header: string }[];
  rows: Record<string, unknown>[];
  summary: Record<string, unknown>;
  rowCount: number;
  runCount: number;
  lastRunAt: string;
}

/**
 * Executes saved custom report definitions and builds module report files.
 * Rows are sourced from the additive ReportDataset store (pre-computed report
 * payloads keyed by companyId + reportKey); the saved report's column config
 * shapes/relabels them. When no dataset is stored yet the report runs cleanly
 * with an empty row set.
 */
@Injectable()
export class ReportGenerationService {
  constructor(
    @InjectRepository(ReportSavedItem)
    private readonly savedRepo: Repository<ReportSavedItem>,
    @InjectRepository(ReportDataset)
    private readonly datasetRepo: Repository<ReportDataset>,
    @InjectRepository(ReportCatalogItem)
    private readonly catalogRepo: Repository<ReportCatalogItem>,
  ) {}

  private async loadSaved(
    id: string,
    companyId: string,
  ): Promise<ReportSavedItem> {
    const item = await this.savedRepo.findOne({ where: { id, companyId } });
    if (!item) throw new NotFoundException('Saved report not found');
    return item;
  }

  /** Resolve the reportKey a saved report reads rows from. */
  private reportKeyFor(item: ReportSavedItem): string {
    const cfg = (item.config ?? {}) as Record<string, unknown>;
    const explicit =
      (typeof cfg.reportKey === 'string' && cfg.reportKey) ||
      (typeof cfg.dataset === 'string' && cfg.dataset);
    if (explicit) return explicit;
    if (item.dataSource) return item.dataSource;
    if (item.category) return item.category.toLowerCase();
    return 'custom';
  }

  /** Derive column defs from the saved config, falling back to dataset keys. */
  private columnsFor(
    item: ReportSavedItem,
    rows: Record<string, unknown>[],
  ): ReportColumn[] {
    const cfg = (item.config ?? {}) as Record<string, unknown>;
    const configured = Array.isArray(cfg.columns)
      ? (cfg.columns as SavedItemColumnConfig[])
      : [];

    const cols: ReportColumn[] = configured
      .filter((c) => c && c.field && c.visible !== false)
      .map((c) => ({
        key: String(c.field),
        header: c.label || String(c.field),
        numeric: c.type === 'number' || c.type === 'currency',
      }));

    if (cols.length > 0) return cols;

    // Fall back to the keys present in the first row.
    const first = rows[0];
    if (first) {
      return Object.keys(first).map((k) => ({ key: k, header: k }));
    }
    return [{ key: 'value', header: 'Value' }];
  }

  /** Run a saved report: source rows, shape them, bump run counters. */
  async run(id: string, companyId: string): Promise<RunReportResult> {
    const item = await this.loadSaved(id, companyId);
    const reportKey = this.reportKeyFor(item);

    const dataset = await this.datasetRepo.findOne({
      where: { companyId, reportKey, isActive: true },
    });
    const payload = (dataset?.payload ?? {}) as Record<string, unknown>;
    const rawRows = Array.isArray(payload.rows)
      ? (payload.rows as Record<string, unknown>[])
      : [];
    const summary =
      payload.summary && typeof payload.summary === 'object'
        ? (payload.summary as Record<string, unknown>)
        : {};

    const columns = this.columnsFor(item, rawRows);

    // Project rows down to the configured columns (relabelled keys stay the
    // same — we key by field name; renderer maps header separately).
    const rows = rawRows.map((r) => {
      const out: Record<string, unknown> = {};
      for (const c of columns) out[c.key] = r[c.key] ?? '';
      return out;
    });

    // Bump run counters.
    item.runCount = (item.runCount ?? 0) + 1;
    item.lastRunAt = new Date().toISOString();
    await this.savedRepo.save(item);

    return {
      reportId: item.id,
      reportName: item.name,
      columns: columns.map((c) => ({ key: c.key, header: c.header })),
      rows,
      summary,
      rowCount: rows.length,
      runCount: item.runCount,
      lastRunAt: item.lastRunAt,
    };
  }

  /** Build a ReportDefinition for a saved report (for file download). */
  async buildSavedDefinition(
    id: string,
    companyId: string,
  ): Promise<ReportDefinition> {
    const item = await this.loadSaved(id, companyId);
    const result = await this.run(id, companyId);
    const columns: ReportColumn[] = result.columns.map((c) => ({
      key: c.key,
      header: c.header,
    }));
    return {
      title: item.name,
      subtitle: item.description || `Category: ${item.category ?? 'Custom'}`,
      columns,
      rows: result.rows,
      summary: {
        'Rows': result.rowCount,
        ...result.summary,
      },
      companyLabel: companyId,
      generatedAt: new Date(),
    };
  }

  /**
   * Build a financial report file from the report catalog + any stored finance
   * datasets. Sources the list of available financial reports (catalog) and,
   * when a specific reportKey is given, its rows.
   */
  async buildFinancialDefinition(
    companyId: string,
    reportKey?: string,
  ): Promise<ReportDefinition> {
    if (reportKey) {
      const dataset = await this.datasetRepo.findOne({
        where: { companyId, reportKey, isActive: true },
      });
      const payload = (dataset?.payload ?? {}) as Record<string, unknown>;
      const rows = Array.isArray(payload.rows)
        ? (payload.rows as Record<string, unknown>[])
        : [];
      const summary =
        payload.summary && typeof payload.summary === 'object'
          ? (payload.summary as Record<string, unknown>)
          : {};
      const columns: ReportColumn[] =
        rows[0] != null
          ? Object.keys(rows[0]).map((k) => ({ key: k, header: k }))
          : [{ key: 'value', header: 'Value' }];
      return {
        title: dataset?.title || `Financial Report — ${reportKey}`,
        subtitle: 'Financial report',
        columns,
        rows,
        summary,
        companyLabel: companyId,
        generatedAt: new Date(),
      };
    }

    // No specific report: export the financial report catalog as an index.
    const items = await this.catalogRepo.find({
      where: { companyId, module: 'financial', isActive: true },
      order: { sortOrder: 'ASC', name: 'ASC' },
    });

    const columns: ReportColumn[] = [
      { key: 'name', header: 'Report', width: 3 },
      { key: 'category', header: 'Category', width: 2 },
      { key: 'frequency', header: 'Frequency', width: 1.5 },
      { key: 'description', header: 'Description', width: 4 },
      { key: 'lastGenerated', header: 'Last Generated', width: 1.6 },
    ];
    const rows = items.map((i) => ({
      name: i.name,
      category: i.category ?? '',
      frequency: i.frequency ?? '',
      description: i.description ?? '',
      lastGenerated: i.lastGenerated ?? '',
    }));

    return {
      title: 'Financial Reports',
      subtitle: 'Available financial reports',
      columns,
      rows,
      summary: { 'Total Reports': rows.length },
      companyLabel: companyId,
      generatedAt: new Date(),
    };
  }
}
