import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SavingsInitiative } from '../entities/savings-initiative.entity';

@Injectable()
export class SavingsInitiativeService {
  constructor(
    @InjectRepository(SavingsInitiative)
    private savingsRepository: Repository<SavingsInitiative>,
  ) {}

  async create(
    companyId: string,
    data: Partial<SavingsInitiative>,
  ): Promise<SavingsInitiative> {
    const entity = this.savingsRepository.create({ ...data, companyId });
    return this.savingsRepository.save(entity);
  }

  async findAll(
    companyId: string,
    filters?: { category?: string; type?: string; status?: string },
  ): Promise<SavingsInitiative[]> {
    const query = this.savingsRepository
      .createQueryBuilder('initiative')
      .where('initiative.companyId = :companyId', { companyId })
      .orderBy('initiative.startDate', 'DESC');

    if (filters?.category) {
      query.andWhere('initiative.category = :category', {
        category: filters.category,
      });
    }
    if (filters?.type) {
      query.andWhere('initiative.type = :type', { type: filters.type });
    }
    if (filters?.status) {
      query.andWhere('initiative.status = :status', { status: filters.status });
    }
    return query.getMany();
  }

  async findOne(companyId: string, id: string): Promise<SavingsInitiative> {
    const entity = await this.savingsRepository.findOne({
      where: { id, companyId },
    });
    if (!entity) {
      throw new NotFoundException(`Savings Initiative with ID ${id} not found`);
    }
    return entity;
  }

  async update(
    companyId: string,
    id: string,
    data: Partial<SavingsInitiative>,
  ): Promise<SavingsInitiative> {
    const entity = await this.findOne(companyId, id);
    Object.assign(entity, data);
    return this.savingsRepository.save(entity);
  }

  async delete(companyId: string, id: string): Promise<void> {
    const entity = await this.findOne(companyId, id);
    await this.savingsRepository.remove(entity);
  }

  /**
   * Compute realized and projected savings for an initiative from its own
   * fields and persist the result. Realized savings derive from
   * baselineCost - currentCost when both are set; otherwise fall back to the
   * recorded actualSavings. Projected savings extrapolate the realized run-rate
   * across the full initiative period (startDate..endDate); if no period is
   * defined it defaults to the greater of realized savings or targetSavings.
   */
  async calculate(companyId: string, id: string): Promise<SavingsInitiative> {
    const entity = await this.findOne(companyId, id);

    const baseline = Number(entity.baselineCost) || 0;
    const current = Number(entity.currentCost) || 0;
    const target = Number(entity.targetSavings) || 0;

    // Realized savings: prefer explicit baseline/current delta.
    let realized: number;
    if (baseline > 0 || current > 0) {
      realized = Math.max(baseline - current, 0);
    } else {
      realized = Number(entity.actualSavings) || 0;
    }

    // Projected (full-period) savings: extrapolate realized by elapsed fraction.
    let projected = realized;
    const start = entity.startDate ? new Date(entity.startDate).getTime() : null;
    const end = entity.endDate ? new Date(entity.endDate).getTime() : null;
    if (start !== null && end !== null && end > start) {
      const now = Date.now();
      const elapsed = Math.min(Math.max(now - start, 0), end - start);
      const fraction = elapsed / (end - start);
      if (fraction > 0) {
        projected = Math.round((realized / fraction) * 100) / 100;
      } else {
        projected = Math.max(realized, target);
      }
    } else {
      projected = Math.max(realized, target);
    }

    entity.realizedSavings = Math.round(realized * 100) / 100;
    entity.projectedSavings = Math.round(projected * 100) / 100;
    // Keep actualSavings in sync with the freshly computed realized figure.
    entity.actualSavings = entity.realizedSavings;

    return this.savingsRepository.save(entity);
  }
}
