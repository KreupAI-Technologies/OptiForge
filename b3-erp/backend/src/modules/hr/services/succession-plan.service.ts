import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SuccessionPlan } from '../entities/succession-plan.entity';

@Injectable()
export class SuccessionPlanService {
  constructor(
    @InjectRepository(SuccessionPlan)
    private readonly repo: Repository<SuccessionPlan>,
  ) {}

  async findAll(
    companyId: string,
    recordType?: string,
  ): Promise<SuccessionPlan[]> {
    const where: Record<string, any> = { companyId };
    if (recordType) where.recordType = recordType;
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<SuccessionPlan> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`Succession plan ${id} not found`);
    return entity;
  }

  async create(
    data: Partial<SuccessionPlan> & { companyId: string; recordType: string },
  ): Promise<SuccessionPlan> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async update(
    id: string,
    data: Partial<SuccessionPlan>,
  ): Promise<SuccessionPlan> {
    const entity = await this.findOne(id);
    Object.assign(entity, data);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }

  /**
   * Computed succession analytics from existing succession-plan rows.
   * Returns zeros/empty arrays when there is no source data (never mock).
   * Backs GET /hr/succession-plans/analytics for
   * app/hr/succession/reports/analytics.
   */
  async analytics(companyId: string): Promise<{
    overview: {
      totalCriticalPositions: number;
      positionsWithSuccessors: number;
      coverageRate: number;
      avgReadinessScore: number;
      highPotentialTalent: number;
      activeDevelopmentPlans: number;
    };
    byDepartment: Array<{
      department: string;
      critical: number;
      covered: number;
      coverage: number;
      avgReadiness: number;
      highPotential: number;
    }>;
    readinessDistribution: Array<{ level: string; count: number; percentage: number }>;
    riskLevels: Array<{ risk: string; count: number; percentage: number }>;
  }> {
    const rows = await this.repo.find({ where: { companyId } });

    // Treat every plan-like row as a critical position; other recordTypes
    // (talent/development) feed the high-potential / development counts.
    const positions = rows.filter(
      (r) =>
        !r.recordType ||
        r.recordType === 'plan' ||
        r.recordType === 'critical-position' ||
        r.recordType === 'position-profile',
    );

    const d = (r: (typeof rows)[number]): Record<string, any> => r.data ?? {};

    const hasSuccessor = (r: (typeof rows)[number]): boolean => {
      const data = d(r);
      return Boolean(
        (Array.isArray(data.successors) && data.successors.length > 0) ||
          data.hasSuccessor ||
          data.successorId ||
          data.successorName,
      );
    };

    const readinessOf = (r: (typeof rows)[number]): number | null => {
      const data = d(r);
      const v = Number(data.readinessScore ?? data.avgReadiness);
      return Number.isNaN(v) ? null : v;
    };

    const isHighPotential = (r: (typeof rows)[number]): boolean => {
      const data = d(r);
      return Boolean(
        data.highPotential ||
          data.isHighPotential ||
          data.talentTier === 'high' ||
          r.recordType === 'talent',
      );
    };

    const totalCriticalPositions = positions.length;
    const positionsWithSuccessors = positions.filter(hasSuccessor).length;
    const coverageRate =
      totalCriticalPositions > 0
        ? Math.round((positionsWithSuccessors / totalCriticalPositions) * 100)
        : 0;
    const readinessScores = positions
      .map(readinessOf)
      .filter((n): n is number => n !== null);
    const avgReadinessScore =
      readinessScores.length > 0
        ? Math.round(
            readinessScores.reduce((a, b) => a + b, 0) / readinessScores.length,
          )
        : 0;
    const highPotentialTalent = rows.filter(isHighPotential).length;
    const activeDevelopmentPlans = rows.filter((r) => {
      const data = d(r);
      return Boolean(
        data.developmentPlan ||
          data.hasDevelopmentPlan ||
          data.status === 'in_development' ||
          r.recordType === 'talent-development',
      );
    }).length;

    // Coverage by department.
    const deptMap = new Map<
      string,
      { critical: number; covered: number; readiness: number[]; highPotential: number }
    >();
    for (const r of positions) {
      const dept = String(d(r).department ?? d(r).departmentName ?? 'Unassigned');
      const bucket =
        deptMap.get(dept) ??
        { critical: 0, covered: 0, readiness: [] as number[], highPotential: 0 };
      bucket.critical += 1;
      if (hasSuccessor(r)) bucket.covered += 1;
      const rs = readinessOf(r);
      if (rs !== null) bucket.readiness.push(rs);
      if (isHighPotential(r)) bucket.highPotential += 1;
      deptMap.set(dept, bucket);
    }
    const byDepartment = Array.from(deptMap.entries()).map(([department, b]) => ({
      department,
      critical: b.critical,
      covered: b.covered,
      coverage: b.critical > 0 ? Math.round((b.covered / b.critical) * 100) : 0,
      avgReadiness:
        b.readiness.length > 0
          ? Math.round(b.readiness.reduce((a, c) => a + c, 0) / b.readiness.length)
          : 0,
      highPotential: b.highPotential,
    }));

    // Readiness distribution buckets.
    const readinessBuckets = [
      { level: 'Ready Now', min: 90 },
      { level: 'Ready in 6 Months', min: 75 },
      { level: 'Ready in 1 Year', min: 60 },
      { level: 'Ready in 2 Years', min: 40 },
      { level: 'Ready in 3+ Years', min: 0 },
    ];
    const readinessDistribution = readinessBuckets.map((b, i) => {
      const upper = i === 0 ? Infinity : readinessBuckets[i - 1].min;
      const count = readinessScores.filter((s) => s >= b.min && s < upper).length;
      return {
        level: b.level,
        count,
        percentage:
          readinessScores.length > 0
            ? Math.round((count / readinessScores.length) * 100)
            : 0,
      };
    });

    // Risk levels derived from readiness (lower readiness => higher risk).
    const riskBuckets = [
      { risk: 'Critical Risk', test: (s: number) => s < 40 },
      { risk: 'High Risk', test: (s: number) => s >= 40 && s < 60 },
      { risk: 'Medium Risk', test: (s: number) => s >= 60 && s < 75 },
      { risk: 'Low Risk', test: (s: number) => s >= 75 },
    ];
    const riskLevels = riskBuckets.map((b) => {
      const count = readinessScores.filter(b.test).length;
      return {
        risk: b.risk,
        count,
        percentage:
          readinessScores.length > 0
            ? Math.round((count / readinessScores.length) * 100)
            : 0,
      };
    });

    return {
      overview: {
        totalCriticalPositions,
        positionsWithSuccessors,
        coverageRate,
        avgReadinessScore,
        highPotentialTalent,
        activeDevelopmentPlans,
      },
      byDepartment,
      readinessDistribution,
      riskLevels,
    };
  }
}
