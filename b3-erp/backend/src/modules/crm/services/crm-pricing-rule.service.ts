import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrmPricingRule } from '../entities/crm-pricing-rule.entity';

@Injectable()
export class CrmPricingRuleService {
  constructor(
    @InjectRepository(CrmPricingRule)
    private readonly repo: Repository<CrmPricingRule>,
  ) {}

  async findAll(companyId?: string): Promise<CrmPricingRule[]> {
    const where = companyId ? { companyId } : {};
    return this.repo.find({ where, order: { priority: 'ASC', createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<CrmPricingRule> {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) {
      throw new NotFoundException(`Pricing rule with ID ${id} not found`);
    }
    return row;
  }

  async create(data: Partial<CrmPricingRule>): Promise<CrmPricingRule> {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: string, data: Partial<CrmPricingRule>): Promise<CrmPricingRule> {
    const row = await this.findOne(id);
    Object.assign(row, data);
    return this.repo.save(row);
  }

  async remove(id: string): Promise<void> {
    const row = await this.findOne(id);
    await this.repo.remove(row);
  }
}
