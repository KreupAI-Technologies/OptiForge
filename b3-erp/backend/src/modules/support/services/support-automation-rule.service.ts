import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupportAutomationRule } from '../entities/support-automation-rule.entity';

@Injectable()
export class SupportAutomationRuleService {
  constructor(
    @InjectRepository(SupportAutomationRule)
    private readonly repo: Repository<SupportAutomationRule>,
  ) {}

  async findAll(
    companyId: string,
    options?: { category?: string; active?: boolean },
  ): Promise<SupportAutomationRule[]> {
    const where: Record<string, unknown> = { companyId };
    if (options?.category) where.category = options.category;
    if (options?.active !== undefined) where.active = options.active;
    return this.repo.find({
      where,
      order: { priority: 'ASC', createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<SupportAutomationRule> {
    const rule = await this.repo.findOne({ where: { id } });
    if (!rule) throw new NotFoundException(`Automation rule ${id} not found`);
    return rule;
  }

  async create(
    data: Partial<SupportAutomationRule> & { companyId: string },
  ): Promise<SupportAutomationRule> {
    if (!data.ruleId) {
      const count = await this.repo.count({
        where: { companyId: data.companyId },
      });
      data.ruleId = `AUT-${String(count + 1).padStart(3, '0')}`;
    }
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async update(
    id: string,
    data: Partial<SupportAutomationRule>,
  ): Promise<SupportAutomationRule> {
    const rule = await this.findOne(id);
    Object.assign(rule, data);
    return this.repo.save(rule);
  }

  async remove(id: string): Promise<void> {
    const rule = await this.findOne(id);
    await this.repo.remove(rule);
  }
}
