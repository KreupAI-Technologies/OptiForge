import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupportEscalationRule } from '../entities/support-escalation-rule.entity';

@Injectable()
export class SupportEscalationRuleService {
  constructor(
    @InjectRepository(SupportEscalationRule)
    private readonly repo: Repository<SupportEscalationRule>,
  ) {}

  findAll(companyId: string): Promise<SupportEscalationRule[]> {
    return this.repo.find({
      where: { companyId },
      order: { level: 'ASC', name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<SupportEscalationRule> {
    const found = await this.repo.findOne({ where: { id } });
    if (!found) throw new NotFoundException(`Escalation rule ${id} not found`);
    return found;
  }

  create(
    data: Partial<SupportEscalationRule> & { companyId: string },
  ): Promise<SupportEscalationRule> {
    return this.repo.save(this.repo.create(data));
  }

  async update(
    id: string,
    data: Partial<SupportEscalationRule>,
  ): Promise<SupportEscalationRule> {
    const found = await this.findOne(id);
    Object.assign(found, data);
    return this.repo.save(found);
  }

  async remove(id: string): Promise<void> {
    const found = await this.findOne(id);
    await this.repo.remove(found);
  }
}
