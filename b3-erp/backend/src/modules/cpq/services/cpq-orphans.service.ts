import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import {
  CPQCodeListItem,
  CPQCompatibilityEntry,
  CPQConfigRuleItem,
  CPQCrossSellRule,
  CPQIntegrationSyncLog,
  CPQRecommendation,
} from '../entities/cpq-orphans.entity';

function requireCompany(companyId: string): void {
  if (!companyId) {
    throw new BadRequestException('x-company-id header is required');
  }
}

@Injectable()
export class CPQConfigRuleItemService {
  constructor(
    @InjectRepository(CPQConfigRuleItem)
    private readonly repo: Repository<CPQConfigRuleItem>,
  ) {}

  async findAll(
    companyId: string,
    filters?: { type?: string; status?: string },
  ): Promise<CPQConfigRuleItem[]> {
    requireCompany(companyId);
    const where: FindOptionsWhere<CPQConfigRuleItem> = { companyId };
    if (filters?.type) where.type = filters.type as CPQConfigRuleItem['type'];
    if (filters?.status)
      where.status = filters.status as CPQConfigRuleItem['status'];
    return this.repo.find({ where, order: { priority: 'ASC', createdAt: 'DESC' } });
  }

  async create(
    companyId: string,
    data: Partial<CPQConfigRuleItem>,
  ): Promise<CPQConfigRuleItem> {
    requireCompany(companyId);
    return this.repo.save(this.repo.create({ ...data, companyId }));
  }

  async update(
    companyId: string,
    id: string,
    data: Partial<CPQConfigRuleItem>,
  ): Promise<CPQConfigRuleItem> {
    const item = await this.repo.findOne({ where: { id, companyId } });
    if (!item) throw new NotFoundException(`Config rule ${id} not found`);
    Object.assign(item, data);
    return this.repo.save(item);
  }

  async remove(companyId: string, id: string): Promise<void> {
    const item = await this.repo.findOne({ where: { id, companyId } });
    if (!item) throw new NotFoundException(`Config rule ${id} not found`);
    await this.repo.remove(item);
  }
}

@Injectable()
export class CPQCompatibilityEntryService {
  constructor(
    @InjectRepository(CPQCompatibilityEntry)
    private readonly repo: Repository<CPQCompatibilityEntry>,
  ) {}

  async findAll(companyId: string): Promise<CPQCompatibilityEntry[]> {
    requireCompany(companyId);
    return this.repo.find({ where: { companyId }, order: { createdAt: 'DESC' } });
  }

  async create(
    companyId: string,
    data: Partial<CPQCompatibilityEntry>,
  ): Promise<CPQCompatibilityEntry> {
    requireCompany(companyId);
    return this.repo.save(this.repo.create({ ...data, companyId }));
  }

  async remove(companyId: string, id: string): Promise<void> {
    const item = await this.repo.findOne({ where: { id, companyId } });
    if (!item) throw new NotFoundException(`Compatibility entry ${id} not found`);
    await this.repo.remove(item);
  }
}

@Injectable()
export class CPQCrossSellRuleService {
  constructor(
    @InjectRepository(CPQCrossSellRule)
    private readonly repo: Repository<CPQCrossSellRule>,
  ) {}

  async findAll(companyId: string): Promise<CPQCrossSellRule[]> {
    requireCompany(companyId);
    return this.repo.find({
      where: { companyId },
      order: { totalOpportunityValue: 'DESC' },
    });
  }

  async create(
    companyId: string,
    data: Partial<CPQCrossSellRule>,
  ): Promise<CPQCrossSellRule> {
    requireCompany(companyId);
    return this.repo.save(this.repo.create({ ...data, companyId }));
  }

  async remove(companyId: string, id: string): Promise<void> {
    const item = await this.repo.findOne({ where: { id, companyId } });
    if (!item) throw new NotFoundException(`Cross-sell rule ${id} not found`);
    await this.repo.remove(item);
  }
}

@Injectable()
export class CPQRecommendationService {
  constructor(
    @InjectRepository(CPQRecommendation)
    private readonly repo: Repository<CPQRecommendation>,
  ) {}

  async findAll(
    companyId: string,
    filters?: { customerId?: string; priority?: string },
  ): Promise<CPQRecommendation[]> {
    requireCompany(companyId);
    const where: FindOptionsWhere<CPQRecommendation> = { companyId };
    if (filters?.customerId) where.customerId = filters.customerId;
    if (filters?.priority)
      where.priority = filters.priority as CPQRecommendation['priority'];
    return this.repo.find({
      where,
      order: { confidenceScore: 'DESC', createdAt: 'DESC' },
    });
  }

  async create(
    companyId: string,
    data: Partial<CPQRecommendation>,
  ): Promise<CPQRecommendation> {
    requireCompany(companyId);
    return this.repo.save(this.repo.create({ ...data, companyId }));
  }

  async remove(companyId: string, id: string): Promise<void> {
    const item = await this.repo.findOne({ where: { id, companyId } });
    if (!item) throw new NotFoundException(`Recommendation ${id} not found`);
    await this.repo.remove(item);
  }
}

@Injectable()
export class CPQCodeListItemService {
  constructor(
    @InjectRepository(CPQCodeListItem)
    private readonly repo: Repository<CPQCodeListItem>,
  ) {}

  async findAll(
    companyId: string,
    filters?: { listType?: string },
  ): Promise<CPQCodeListItem[]> {
    requireCompany(companyId);
    const where: FindOptionsWhere<CPQCodeListItem> = { companyId };
    if (filters?.listType)
      where.listType = filters.listType as CPQCodeListItem['listType'];
    return this.repo.find({ where, order: { name: 'ASC' } });
  }

  async create(
    companyId: string,
    data: Partial<CPQCodeListItem>,
  ): Promise<CPQCodeListItem> {
    requireCompany(companyId);
    return this.repo.save(this.repo.create({ ...data, companyId }));
  }

  async update(
    companyId: string,
    id: string,
    data: Partial<CPQCodeListItem>,
  ): Promise<CPQCodeListItem> {
    const item = await this.repo.findOne({ where: { id, companyId } });
    if (!item) throw new NotFoundException(`Code list item ${id} not found`);
    Object.assign(item, data);
    return this.repo.save(item);
  }

  async remove(companyId: string, id: string): Promise<void> {
    const item = await this.repo.findOne({ where: { id, companyId } });
    if (!item) throw new NotFoundException(`Code list item ${id} not found`);
    await this.repo.remove(item);
  }
}

@Injectable()
export class CPQIntegrationSyncLogService {
  constructor(
    @InjectRepository(CPQIntegrationSyncLog)
    private readonly repo: Repository<CPQIntegrationSyncLog>,
  ) {}

  async findAll(
    companyId: string,
    filters?: { system?: string; status?: string },
  ): Promise<CPQIntegrationSyncLog[]> {
    requireCompany(companyId);
    const where: FindOptionsWhere<CPQIntegrationSyncLog> = { companyId };
    if (filters?.system) where.system = filters.system;
    if (filters?.status)
      where.status = filters.status as CPQIntegrationSyncLog['status'];
    return this.repo.find({
      where,
      order: { createdAt: 'DESC' },
      take: 200,
    });
  }

  async create(
    companyId: string,
    data: Partial<CPQIntegrationSyncLog>,
  ): Promise<CPQIntegrationSyncLog> {
    requireCompany(companyId);
    return this.repo.save(this.repo.create({ ...data, companyId }));
  }
}
