import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PeriodCloseStep } from '../entities/period-close-step.entity';
import { FinancialPeriod } from '../entities/financial-period.entity';

interface StandardStep {
  stepKey: string;
  stepName: string;
  description: string;
  sortOrder: number;
  defaultStatus: string;
}

/**
 * The standard period-end close checklist. Seeded (idempotently) per financial
 * period the first time its checklist is requested.
 */
const STANDARD_STEPS: StandardStep[] = [
  {
    stepKey: 'inventory_valuation',
    stepName: 'Inventory Valuation',
    description: 'Value closing stock and post inventory adjustments.',
    sortOrder: 1,
    defaultStatus: 'pending',
  },
  {
    stepKey: 'accruals_provisions',
    stepName: 'Accruals & Provisions',
    description: 'Book accrued expenses, prepaid amortisation and provisions.',
    sortOrder: 2,
    defaultStatus: 'not-started',
  },
  {
    stepKey: 'bank_reconciliation',
    stepName: 'Bank Reconciliation',
    description: 'Reconcile all bank accounts for the period.',
    sortOrder: 3,
    defaultStatus: 'not-started',
  },
  {
    stepKey: 'depreciation',
    stepName: 'Depreciation Run',
    description: 'Run fixed-asset depreciation for the period.',
    sortOrder: 4,
    defaultStatus: 'not-started',
  },
  {
    stepKey: 'management_review',
    stepName: 'Management Review',
    description: 'Management review and sign-off of the period figures.',
    sortOrder: 5,
    defaultStatus: 'pending',
  },
];

@Injectable()
export class PeriodCloseService {
  constructor(
    @InjectRepository(PeriodCloseStep)
    private readonly stepRepo: Repository<PeriodCloseStep>,
    @InjectRepository(FinancialPeriod)
    private readonly periodRepo: Repository<FinancialPeriod>,
  ) {}

  /**
   * Read model: the checklist for a financial period. Seeds standard steps the
   * first time the period is requested (idempotent).
   */
  async getChecklist(financialPeriodId: string): Promise<{
    financialPeriodId: string;
    periodCode: string | null;
    periodName: string | null;
    status: string | null;
    steps: PeriodCloseStep[];
    completed: number;
    total: number;
    percentComplete: number;
  }> {
    const period = await this.periodRepo.findOne({
      where: { id: financialPeriodId },
    });
    if (!period) {
      throw new NotFoundException(
        `Financial period ${financialPeriodId} not found`,
      );
    }

    await this.ensureSeeded(financialPeriodId);

    const steps = await this.stepRepo.find({
      where: { financialPeriodId },
      order: { sortOrder: 'ASC' },
    });

    const completed = steps.filter((s) => s.status === 'completed').length;
    const total = steps.length;

    return {
      financialPeriodId,
      periodCode: period.periodCode ?? null,
      periodName: period.periodName ?? null,
      status: period.status ?? null,
      steps,
      completed,
      total,
      percentComplete: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }

  /** Update a single checklist step (status / notes / completedBy). */
  async updateStep(
    financialPeriodId: string,
    stepKey: string,
    body: { status?: string; completedBy?: string; notes?: string },
  ): Promise<PeriodCloseStep> {
    await this.ensureSeeded(financialPeriodId);

    const step = await this.stepRepo.findOne({
      where: { financialPeriodId, stepKey },
    });
    if (!step) {
      throw new NotFoundException(
        `Checklist step ${stepKey} not found for period ${financialPeriodId}`,
      );
    }

    if (body.status !== undefined) {
      const allowed = ['not-started', 'pending', 'in-progress', 'completed'];
      if (!allowed.includes(body.status)) {
        throw new BadRequestException(
          `status must be one of: ${allowed.join(', ')}`,
        );
      }
      step.status = body.status;
      if (body.status === 'completed') {
        step.completedAt = new Date();
        if (body.completedBy) step.completedBy = body.completedBy;
      } else {
        step.completedAt = undefined;
      }
    }
    if (body.completedBy !== undefined) step.completedBy = body.completedBy;
    if (body.notes !== undefined) step.notes = body.notes;

    return this.stepRepo.save(step);
  }

  private async ensureSeeded(financialPeriodId: string): Promise<void> {
    const existing = await this.stepRepo.count({
      where: { financialPeriodId },
    });
    if (existing > 0) return;

    for (const s of STANDARD_STEPS) {
      // Guard against races / re-entry with an existence check per step.
      const already = await this.stepRepo.findOne({
        where: { financialPeriodId, stepKey: s.stepKey },
      });
      if (already) continue;
      const row = this.stepRepo.create({
        financialPeriodId,
        stepKey: s.stepKey,
        stepName: s.stepName,
        description: s.description,
        sortOrder: s.sortOrder,
        status: s.defaultStatus,
      });
      await this.stepRepo.save(row);
    }
  }
}
