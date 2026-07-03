import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AutomationRule } from '../entities/automation-rule.entity';

@Injectable()
export class AutomationRuleService {
  constructor(
    @InjectRepository(AutomationRule)
    private readonly automationRuleRepository: Repository<AutomationRule>,
  ) {}

  async create(
    companyId: string,
    data: Partial<AutomationRule>,
  ): Promise<AutomationRule> {
    const rule = this.automationRuleRepository.create({ ...data, companyId });
    return this.automationRuleRepository.save(rule);
  }

  async findAll(
    companyId: string,
    filters?: { status?: string; category?: string },
  ): Promise<AutomationRule[]> {
    const query = this.automationRuleRepository
      .createQueryBuilder('rule')
      .where('rule.companyId = :companyId', { companyId })
      .orderBy('rule.createdAt', 'DESC');

    if (filters?.status) {
      query.andWhere('rule.status = :status', { status: filters.status });
    }
    if (filters?.category) {
      query.andWhere('rule.category = :category', {
        category: filters.category,
      });
    }

    return query.getMany();
  }

  async findOne(companyId: string, id: string): Promise<AutomationRule> {
    const rule = await this.automationRuleRepository.findOne({
      where: { id, companyId },
    });
    if (!rule) {
      throw new NotFoundException(`Automation rule with ID ${id} not found`);
    }
    return rule;
  }

  async update(
    companyId: string,
    id: string,
    data: Partial<AutomationRule>,
  ): Promise<AutomationRule> {
    const rule = await this.findOne(companyId, id);
    Object.assign(rule, data);
    return this.automationRuleRepository.save(rule);
  }

  async delete(companyId: string, id: string): Promise<void> {
    const rule = await this.findOne(companyId, id);
    await this.automationRuleRepository.remove(rule);
  }
}
