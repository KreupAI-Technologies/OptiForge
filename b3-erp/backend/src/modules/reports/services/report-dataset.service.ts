import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReportDataset } from '../entities/report-dataset.entity';

@Injectable()
export class ReportDatasetService {
  constructor(
    @InjectRepository(ReportDataset)
    private readonly repo: Repository<ReportDataset>,
  ) {}

  /** List all datasets for a company (optionally filtered by category). */
  async list(companyId: string, category?: string): Promise<ReportDataset[]> {
    return this.repo.find({
      where: {
        companyId,
        isActive: true,
        ...(category ? { category } : {}),
      },
      order: { reportKey: 'ASC' },
    });
  }

  /** Fetch a single dataset by reportKey. Returns null if none stored yet. */
  async getByKey(
    companyId: string,
    reportKey: string,
  ): Promise<ReportDataset | null> {
    return this.repo.findOne({
      where: { companyId, reportKey, isActive: true },
    });
  }

  /**
   * Return the tabular rows for a report page, keyed by (companyId, reportKey).
   *
   * Report detail pages (e.g. "sales.orders.status", "finance.ar-aging.bucket")
   * render a list. This reads `payload.rows` from the stored dataset and returns
   * a stable envelope. When no dataset row exists yet, it safely returns an empty
   * list so the page shows an empty state rather than breaking.
   */
  async getRows(
    companyId: string,
    reportKey: string,
  ): Promise<{
    reportKey: string;
    title: string | null;
    rows: Record<string, unknown>[];
    summary: Record<string, unknown>;
  }> {
    const ds = await this.repo.findOne({
      where: { companyId, reportKey, isActive: true },
    });

    const payload = (ds?.payload ?? {}) as Record<string, unknown>;
    const rawRows = payload.rows;
    const rows = Array.isArray(rawRows)
      ? (rawRows as Record<string, unknown>[])
      : [];
    const summary =
      payload.summary && typeof payload.summary === 'object'
        ? (payload.summary as Record<string, unknown>)
        : {};

    return {
      reportKey,
      title: ds?.title ?? null,
      rows,
      summary,
    };
  }

  /** Upsert a dataset for (companyId, reportKey). */
  async upsert(
    companyId: string,
    reportKey: string,
    data: {
      title?: string;
      category?: string;
      payload?: Record<string, unknown>;
    },
  ): Promise<ReportDataset> {
    const existing = await this.repo.findOne({
      where: { companyId, reportKey },
    });

    if (existing) {
      existing.title = data.title ?? existing.title;
      existing.category = data.category ?? existing.category;
      existing.payload = data.payload ?? existing.payload;
      existing.isActive = true;
      return this.repo.save(existing);
    }

    const created = this.repo.create({
      companyId,
      reportKey,
      title: data.title,
      category: data.category,
      payload: data.payload ?? {},
      isActive: true,
    } as Partial<ReportDataset>);
    return this.repo.save(created);
  }
}
