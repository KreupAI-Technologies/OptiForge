import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  EstimationWhatIfScenario,
  WhatIfResults,
  WhatIfVariable,
} from '../entities/whatif-scenario.entity';

@Injectable()
export class WhatIfScenarioService {
  constructor(
    @InjectRepository(EstimationWhatIfScenario)
    private whatIfRepository: Repository<EstimationWhatIfScenario>,
  ) {}

  private compute(
    baseValue: number,
    variables: WhatIfVariable[],
  ): WhatIfResults {
    const base = Number(baseValue) || 0;
    const vars = Array.isArray(variables) ? variables : [];

    let adjustedValue = base;
    const perVariable: { key: string; contribution: number }[] = [];

    for (const variable of vars) {
      const adjustPct = Number(variable?.adjustPct) || 0;
      const before = adjustedValue;
      adjustedValue = adjustedValue * (1 + adjustPct / 100);
      perVariable.push({
        key: variable?.key ?? '',
        contribution: adjustedValue - before,
      });
    }

    const deltaValue = adjustedValue - base;
    const deltaPct = base !== 0 ? (deltaValue / base) * 100 : 0;

    return {
      baseValue: base,
      adjustedValue,
      deltaValue,
      deltaPct,
      perVariable,
    };
  }

  async create(
    companyId: string,
    data: Partial<EstimationWhatIfScenario>,
  ): Promise<EstimationWhatIfScenario> {
    const results = this.compute(
      Number(data.baseValue) || 0,
      (data.variables as WhatIfVariable[]) || [],
    );
    const entity = this.whatIfRepository.create({
      ...data,
      companyId,
      results,
    });
    return this.whatIfRepository.save(entity);
  }

  async findAll(
    companyId: string,
    estimateId?: string,
  ): Promise<EstimationWhatIfScenario[]> {
    const query = this.whatIfRepository
      .createQueryBuilder('scenario')
      .where('scenario.companyId = :companyId', { companyId })
      .orderBy('scenario.createdAt', 'DESC');

    if (estimateId) {
      query.andWhere('scenario.estimateId = :estimateId', { estimateId });
    }
    return query.getMany();
  }

  async findOne(
    companyId: string,
    id: string,
  ): Promise<EstimationWhatIfScenario> {
    const entity = await this.whatIfRepository.findOne({
      where: { id, companyId },
    });
    if (!entity) {
      throw new NotFoundException(`What-If Scenario with ID ${id} not found`);
    }
    return entity;
  }

  async delete(companyId: string, id: string): Promise<void> {
    const entity = await this.findOne(companyId, id);
    await this.whatIfRepository.remove(entity);
  }
}
