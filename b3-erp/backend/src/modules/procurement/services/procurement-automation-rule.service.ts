import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProcurementAutomationRule } from '../entities/procurement-automation-rule.entity';

@Injectable()
export class ProcurementAutomationRuleService {
  constructor(
    @InjectRepository(ProcurementAutomationRule)
    private readonly repository: Repository<ProcurementAutomationRule>,
  ) {}

  async create(
    companyId: string,
    data: Partial<ProcurementAutomationRule>,
  ): Promise<ProcurementAutomationRule> {
    const entity = this.repository.create({ ...data, companyId });
    return this.repository.save(entity);
  }

  async findAll(
    companyId: string,
    filters?: { trigger?: string; isActive?: boolean },
  ): Promise<ProcurementAutomationRule[]> {
    const query = this.repository
      .createQueryBuilder('rule')
      .where('rule.companyId = :companyId', { companyId })
      .orderBy('rule.createdAt', 'DESC');

    if (filters?.trigger) {
      query.andWhere('rule.trigger = :trigger', { trigger: filters.trigger });
    }
    if (filters?.isActive !== undefined) {
      query.andWhere('rule.isActive = :isActive', {
        isActive: filters.isActive,
      });
    }
    return query.getMany();
  }

  async findOne(
    companyId: string,
    id: string,
  ): Promise<ProcurementAutomationRule> {
    const entity = await this.repository.findOne({ where: { id, companyId } });
    if (!entity) {
      throw new NotFoundException(`Automation Rule with ID ${id} not found`);
    }
    return entity;
  }

  async update(
    companyId: string,
    id: string,
    data: Partial<ProcurementAutomationRule>,
  ): Promise<ProcurementAutomationRule> {
    const entity = await this.findOne(companyId, id);
    Object.assign(entity, data);
    return this.repository.save(entity);
  }

  async toggle(
    companyId: string,
    id: string,
  ): Promise<ProcurementAutomationRule> {
    const entity = await this.findOne(companyId, id);
    entity.isActive = !entity.isActive;
    return this.repository.save(entity);
  }

  async delete(companyId: string, id: string): Promise<void> {
    const entity = await this.findOne(companyId, id);
    await this.repository.remove(entity);
  }
}
