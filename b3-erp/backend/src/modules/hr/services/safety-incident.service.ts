import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SafetyIncident } from '../entities/safety-incident.entity';

@Injectable()
export class SafetyIncidentService {
  constructor(
    @InjectRepository(SafetyIncident)
    private readonly repo: Repository<SafetyIncident>,
  ) {}

  async findAll(companyId: string, status?: string): Promise<SafetyIncident[]> {
    const where: Record<string, any> = { companyId };
    if (status) where.status = status;
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<SafetyIncident> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`Safety incident ${id} not found`);
    return entity;
  }

  /**
   * Time-series safety analytics computed from the flat incident rows.
   * Groups incidents by calendar month and derives statutory safety ratios
   * (TRIR = total recordable incident rate, LTIR = lost-time injury rate)
   * using the OSHA 200,000-hour base. Empty-safe: returns [] when no rows.
   *
   * TRIR  = (recordable incidents * 200000) / hoursWorked
   * LTIR  = (lost-time incidents  * 200000) / hoursWorked
   *   recordable  => medicalAttention === true OR daysLost > 0
   *   lost-time   => daysLost > 0
   * hoursWorked is approximated per active period when not tracked, so ratios
   * scale with incident volume and remain comparable across months.
   */
  async getTrends(
    companyId: string,
    monthsBack = 6,
    hoursPerMonth?: number,
  ): Promise<{
    monthlyTrends: Array<{
      month: string;
      monthKey: string;
      incidents: number;
      nearMisses: number;
      lostDays: number;
      recordable: number;
      lostTime: number;
      trir: number;
      ltir: number;
      target: number;
    }>;
    summary: {
      totalIncidents: number;
      totalNearMisses: number;
      totalLostDays: number;
      trir: number;
      ltir: number;
    };
  }> {
    const rows = await this.repo.find({ where: { companyId } });

    // Build an ordered window of the last `monthsBack` months (inclusive of
    // current month) so charts render a stable axis even with sparse data.
    const now = new Date();
    const buckets = new Map<
      string,
      {
        month: string;
        monthKey: string;
        incidents: number;
        nearMisses: number;
        lostDays: number;
        recordable: number;
        lostTime: number;
      }
    >();
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
    for (let i = monthsBack - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      buckets.set(key, {
        month: monthNames[d.getMonth()],
        monthKey: key,
        incidents: 0,
        nearMisses: 0,
        lostDays: 0,
        recordable: 0,
        lostTime: 0,
      });
    }

    const parseMonthKey = (raw?: string | null): string | null => {
      if (!raw) return null;
      const d = new Date(raw);
      if (isNaN(d.getTime())) return null;
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    };

    let totalIncidents = 0;
    let totalNearMisses = 0;
    let totalLostDays = 0;
    let totalRecordable = 0;
    let totalLostTime = 0;

    for (const r of rows) {
      const key =
        parseMonthKey(r.incidentDate) ??
        parseMonthKey(r.reportedDate) ??
        parseMonthKey(r.createdAt ? r.createdAt.toISOString() : null);
      const bucket = key ? buckets.get(key) : undefined;

      const days = Number(r.daysLost) || 0;
      const isNearMiss =
        (r.type || '').toLowerCase().includes('near') ||
        (r.severity || '').toLowerCase() === 'low';
      const isLostTime = days > 0;
      const isRecordable = isLostTime || r.medicalAttention === true;

      totalIncidents += 1;
      if (isNearMiss) totalNearMisses += 1;
      totalLostDays += days;
      if (isRecordable) totalRecordable += 1;
      if (isLostTime) totalLostTime += 1;

      if (bucket) {
        bucket.incidents += 1;
        if (isNearMiss) bucket.nearMisses += 1;
        bucket.lostDays += days;
        if (isRecordable) bucket.recordable += 1;
        if (isLostTime) bucket.lostTime += 1;
      }
    }

    // OSHA base. Default assumed exposure hours per month when not supplied.
    const BASE = 200000;
    const hours = hoursPerMonth && hoursPerMonth > 0 ? hoursPerMonth : 20000;
    const round2 = (n: number) => Math.round(n * 100) / 100;
    const rate = (count: number, months = 1) =>
      hours > 0 ? round2((count * BASE) / (hours * months)) : 0;

    const monthlyTrends = Array.from(buckets.values()).map((b) => ({
      ...b,
      trir: rate(b.recordable),
      ltir: rate(b.lostTime),
      target: 2.0,
    }));

    return {
      monthlyTrends,
      summary: {
        totalIncidents,
        totalNearMisses,
        totalLostDays,
        trir: rate(totalRecordable, monthsBack),
        ltir: rate(totalLostTime, monthsBack),
      },
    };
  }

  async create(
    data: Partial<SafetyIncident> & { companyId: string },
  ): Promise<SafetyIncident> {
    return this.repo.save(this.repo.create(data));
  }

  async update(
    id: string,
    data: Partial<SafetyIncident>,
  ): Promise<SafetyIncident> {
    const entity = await this.findOne(id);
    Object.assign(entity, data);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
