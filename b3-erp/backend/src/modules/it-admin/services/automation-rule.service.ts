import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AutomationRule } from '../entities/automation-rule.entity';

@Injectable()
export class AutomationRuleService {
  constructor(
    @InjectRepository(AutomationRule)
    private readonly repository: Repository<AutomationRule>,
  ) {}

  async findAll(filters?: {
    companyId?: string;
    category?: string;
    status?: string;
  }): Promise<AutomationRule[]> {
    const where: Record<string, any> = {};
    if (filters?.companyId) where.companyId = filters.companyId;
    if (filters?.category && filters.category !== 'all')
      where.category = filters.category;
    if (filters?.status && filters.status !== 'all')
      where.status = filters.status;
    return this.repository.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<AutomationRule> {
    const rule = await this.repository.findOne({ where: { id } });
    if (!rule) throw new NotFoundException(`Automation rule ${id} not found`);
    return rule;
  }

  async create(data: Partial<AutomationRule>): Promise<AutomationRule> {
    return this.repository.save(this.repository.create(data));
  }

  async update(
    id: string,
    data: Partial<AutomationRule>,
  ): Promise<AutomationRule> {
    const rule = await this.findOne(id);
    Object.assign(rule, data);
    return this.repository.save(rule);
  }

  async remove(id: string): Promise<void> {
    const rule = await this.findOne(id);
    await this.repository.remove(rule);
  }
}
