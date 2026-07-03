import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IntegrationConfig } from '../entities/integration-config.entity';

@Injectable()
export class IntegrationConfigService {
  constructor(
    @InjectRepository(IntegrationConfig)
    private readonly repository: Repository<IntegrationConfig>,
  ) {}

  async findAll(filters?: {
    companyId?: string;
    category?: string;
  }): Promise<IntegrationConfig[]> {
    const where: Record<string, any> = {};
    if (filters?.companyId) where.companyId = filters.companyId;
    if (filters?.category && filters.category !== 'all')
      where.category = filters.category;
    return this.repository.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<IntegrationConfig> {
    const integration = await this.repository.findOne({ where: { id } });
    if (!integration)
      throw new NotFoundException(`Integration ${id} not found`);
    return integration;
  }

  async create(data: Partial<IntegrationConfig>): Promise<IntegrationConfig> {
    const integration = this.repository.create(data);
    return this.repository.save(integration);
  }

  async update(
    id: string,
    data: Partial<IntegrationConfig>,
  ): Promise<IntegrationConfig> {
    const integration = await this.findOne(id);
    Object.assign(integration, data);
    return this.repository.save(integration);
  }

  async remove(id: string): Promise<void> {
    const integration = await this.findOne(id);
    await this.repository.remove(integration);
  }
}
