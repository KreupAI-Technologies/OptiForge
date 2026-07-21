import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemMonitor } from '../entities/system-monitor.entity';

@Injectable()
export class SystemMonitorService {
  constructor(
    @InjectRepository(SystemMonitor)
    private readonly repository: Repository<SystemMonitor>,
  ) {}

  async findAll(filters?: {
    companyId?: string;
    kind?: string;
    status?: string;
    severity?: string;
    category?: string;
  }): Promise<SystemMonitor[]> {
    const where: Record<string, any> = {};
    if (filters?.companyId) where.companyId = filters.companyId;
    if (filters?.kind && filters.kind !== 'all') where.kind = filters.kind;
    if (filters?.status && filters.status !== 'all')
      where.status = filters.status;
    if (filters?.severity && filters.severity !== 'all')
      where.severity = filters.severity;
    if (filters?.category && filters.category !== 'all')
      where.category = filters.category;
    return this.repository.find({ where, order: { createdAt: 'DESC' } });
  }

  async summary(
    kind: string,
    companyId?: string,
  ): Promise<{
    total: number;
    byStatus: Record<string, number>;
    bySeverity: Record<string, number>;
  }> {
    const rows = await this.findAll({ kind, companyId });
    const byStatus: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};
    for (const r of rows) {
      byStatus[r.status] = (byStatus[r.status] || 0) + 1;
      if (r.severity) bySeverity[r.severity] = (bySeverity[r.severity] || 0) + 1;
    }
    return { total: rows.length, byStatus, bySeverity };
  }

  /**
   * Returns a recent time-series for a monitoring kind (default 'performance').
   * Buckets stored rows by their `lastOccurred` timestamp (falling back to
   * createdAt), producing one point per named metric per timestamp. Empty-safe:
   * if no rows are stored the `series` array is empty — no fabricated data.
   */
  async history(
    kind = 'performance',
    companyId?: string,
    limit = 30,
  ): Promise<{
    kind: string;
    metrics: string[];
    series: Array<{ timestamp: string; values: Record<string, number> }>;
  }> {
    const rows = await this.findAll({ kind, companyId });
    const buckets = new Map<string, Record<string, number>>();
    const metricSet = new Set<string>();
    for (const r of rows) {
      const ts =
        r.lastOccurred ||
        (r.createdAt instanceof Date
          ? r.createdAt.toISOString()
          : String(r.createdAt ?? ''));
      if (!ts) continue;
      metricSet.add(r.name);
      const bucket = buckets.get(ts) ?? {};
      if (typeof r.value === 'number') bucket[r.name] = r.value;
      buckets.set(ts, bucket);
    }
    const series = Array.from(buckets.entries())
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
      .slice(-limit)
      .map(([timestamp, values]) => ({ timestamp, values }));
    return { kind, metrics: Array.from(metricSet), series };
  }

  async findOne(id: string): Promise<SystemMonitor> {
    const record = await this.repository.findOne({ where: { id } });
    if (!record) throw new NotFoundException(`Monitor record ${id} not found`);
    return record;
  }

  async create(data: Partial<SystemMonitor>): Promise<SystemMonitor> {
    return this.repository.save(this.repository.create(data));
  }

  async update(
    id: string,
    data: Partial<SystemMonitor>,
  ): Promise<SystemMonitor> {
    const record = await this.findOne(id);
    Object.assign(record, data);
    return this.repository.save(record);
  }

  async remove(id: string): Promise<void> {
    const record = await this.findOne(id);
    await this.repository.remove(record);
  }
}
