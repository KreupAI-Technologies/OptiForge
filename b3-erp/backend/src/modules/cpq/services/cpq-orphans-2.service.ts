import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import {
  CPQConfigStep,
  CPQIntegrationEndpoint,
  CPQNotificationSettingRow,
  CPQPermissionRole,
  CPQQuoteVersionRow,
  CPQWorkflowRequest,
} from '../entities/cpq-orphans-2.entity';

function requireCompany(companyId: string): void {
  if (!companyId) {
    throw new BadRequestException('x-company-id header is required');
  }
}

@Injectable()
export class CPQWorkflowRequestService {
  constructor(
    @InjectRepository(CPQWorkflowRequest)
    private readonly repo: Repository<CPQWorkflowRequest>,
  ) {}

  async findAll(
    companyId: string,
    filters?: { requestType?: string; status?: string },
  ): Promise<CPQWorkflowRequest[]> {
    requireCompany(companyId);
    const where: FindOptionsWhere<CPQWorkflowRequest> = { companyId };
    if (filters?.requestType)
      where.requestType = filters.requestType as CPQWorkflowRequest['requestType'];
    if (filters?.status) where.status = filters.status;
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async create(
    companyId: string,
    data: Partial<CPQWorkflowRequest>,
  ): Promise<CPQWorkflowRequest> {
    requireCompany(companyId);
    return this.repo.save(this.repo.create({ ...data, companyId }));
  }

  async update(
    companyId: string,
    id: string,
    data: Partial<CPQWorkflowRequest>,
  ): Promise<CPQWorkflowRequest> {
    const item = await this.repo.findOne({ where: { id, companyId } });
    if (!item) throw new NotFoundException(`Workflow request ${id} not found`);
    Object.assign(item, data);
    return this.repo.save(item);
  }

  async remove(companyId: string, id: string): Promise<void> {
    const item = await this.repo.findOne({ where: { id, companyId } });
    if (!item) throw new NotFoundException(`Workflow request ${id} not found`);
    await this.repo.remove(item);
  }
}

@Injectable()
export class CPQQuoteVersionRowService {
  constructor(
    @InjectRepository(CPQQuoteVersionRow)
    private readonly repo: Repository<CPQQuoteVersionRow>,
  ) {}

  async findAll(
    companyId: string,
    filters?: { quoteNumber?: string; status?: string },
  ): Promise<CPQQuoteVersionRow[]> {
    requireCompany(companyId);
    const where: FindOptionsWhere<CPQQuoteVersionRow> = { companyId };
    if (filters?.quoteNumber) where.quoteNumber = filters.quoteNumber;
    if (filters?.status)
      where.status = filters.status as CPQQuoteVersionRow['status'];
    return this.repo.find({
      where,
      order: { quoteNumber: 'ASC', createdDate: 'DESC' },
    });
  }

  async create(
    companyId: string,
    data: Partial<CPQQuoteVersionRow>,
  ): Promise<CPQQuoteVersionRow> {
    requireCompany(companyId);
    return this.repo.save(this.repo.create({ ...data, companyId }));
  }

  async remove(companyId: string, id: string): Promise<void> {
    const item = await this.repo.findOne({ where: { id, companyId } });
    if (!item) throw new NotFoundException(`Quote version ${id} not found`);
    await this.repo.remove(item);
  }
}

@Injectable()
export class CPQNotificationSettingRowService {
  constructor(
    @InjectRepository(CPQNotificationSettingRow)
    private readonly repo: Repository<CPQNotificationSettingRow>,
  ) {}

  async findAll(
    companyId: string,
    filters?: { settingType?: string },
  ): Promise<CPQNotificationSettingRow[]> {
    requireCompany(companyId);
    const where: FindOptionsWhere<CPQNotificationSettingRow> = { companyId };
    if (filters?.settingType)
      where.settingType =
        filters.settingType as CPQNotificationSettingRow['settingType'];
    return this.repo.find({ where, order: { createdAt: 'ASC' } });
  }

  async create(
    companyId: string,
    data: Partial<CPQNotificationSettingRow>,
  ): Promise<CPQNotificationSettingRow> {
    requireCompany(companyId);
    return this.repo.save(this.repo.create({ ...data, companyId }));
  }

  async update(
    companyId: string,
    id: string,
    data: Partial<CPQNotificationSettingRow>,
  ): Promise<CPQNotificationSettingRow> {
    const item = await this.repo.findOne({ where: { id, companyId } });
    if (!item) throw new NotFoundException(`Notification setting ${id} not found`);
    Object.assign(item, data);
    return this.repo.save(item);
  }

  async remove(companyId: string, id: string): Promise<void> {
    const item = await this.repo.findOne({ where: { id, companyId } });
    if (!item) throw new NotFoundException(`Notification setting ${id} not found`);
    await this.repo.remove(item);
  }
}

@Injectable()
export class CPQPermissionRoleService {
  constructor(
    @InjectRepository(CPQPermissionRole)
    private readonly repo: Repository<CPQPermissionRole>,
  ) {}

  async findAll(companyId: string): Promise<CPQPermissionRole[]> {
    requireCompany(companyId);
    return this.repo.find({ where: { companyId }, order: { name: 'ASC' } });
  }

  async create(
    companyId: string,
    data: Partial<CPQPermissionRole>,
  ): Promise<CPQPermissionRole> {
    requireCompany(companyId);
    return this.repo.save(this.repo.create({ ...data, companyId }));
  }

  async update(
    companyId: string,
    id: string,
    data: Partial<CPQPermissionRole>,
  ): Promise<CPQPermissionRole> {
    const item = await this.repo.findOne({ where: { id, companyId } });
    if (!item) throw new NotFoundException(`Permission role ${id} not found`);
    Object.assign(item, data);
    return this.repo.save(item);
  }

  async remove(companyId: string, id: string): Promise<void> {
    const item = await this.repo.findOne({ where: { id, companyId } });
    if (!item) throw new NotFoundException(`Permission role ${id} not found`);
    await this.repo.remove(item);
  }
}

@Injectable()
export class CPQIntegrationEndpointService {
  constructor(
    @InjectRepository(CPQIntegrationEndpoint)
    private readonly repo: Repository<CPQIntegrationEndpoint>,
  ) {}

  async findAll(
    companyId: string,
    filters?: { system?: string; status?: string },
  ): Promise<CPQIntegrationEndpoint[]> {
    requireCompany(companyId);
    const where: FindOptionsWhere<CPQIntegrationEndpoint> = { companyId };
    if (filters?.system) where.system = filters.system;
    if (filters?.status)
      where.status = filters.status as CPQIntegrationEndpoint['status'];
    return this.repo.find({ where, order: { name: 'ASC' } });
  }

  async create(
    companyId: string,
    data: Partial<CPQIntegrationEndpoint>,
  ): Promise<CPQIntegrationEndpoint> {
    requireCompany(companyId);
    return this.repo.save(this.repo.create({ ...data, companyId }));
  }

  async update(
    companyId: string,
    id: string,
    data: Partial<CPQIntegrationEndpoint>,
  ): Promise<CPQIntegrationEndpoint> {
    const item = await this.repo.findOne({ where: { id, companyId } });
    if (!item) throw new NotFoundException(`Integration endpoint ${id} not found`);
    Object.assign(item, data);
    return this.repo.save(item);
  }

  async remove(companyId: string, id: string): Promise<void> {
    const item = await this.repo.findOne({ where: { id, companyId } });
    if (!item) throw new NotFoundException(`Integration endpoint ${id} not found`);
    await this.repo.remove(item);
  }
}

@Injectable()
export class CPQConfigStepService {
  constructor(
    @InjectRepository(CPQConfigStep)
    private readonly repo: Repository<CPQConfigStep>,
  ) {}

  async findAll(companyId: string): Promise<CPQConfigStep[]> {
    requireCompany(companyId);
    return this.repo.find({
      where: { companyId },
      order: { stepOrder: 'ASC' },
    });
  }

  async create(
    companyId: string,
    data: Partial<CPQConfigStep>,
  ): Promise<CPQConfigStep> {
    requireCompany(companyId);
    return this.repo.save(this.repo.create({ ...data, companyId }));
  }

  async remove(companyId: string, id: string): Promise<void> {
    const item = await this.repo.findOne({ where: { id, companyId } });
    if (!item) throw new NotFoundException(`Config step ${id} not found`);
    await this.repo.remove(item);
  }
}
