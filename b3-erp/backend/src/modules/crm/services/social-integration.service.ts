import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SocialIntegration } from '../entities/social-integration.entity';

@Injectable()
export class SocialIntegrationService {
  constructor(
    @InjectRepository(SocialIntegration)
    private readonly integrationRepository: Repository<SocialIntegration>,
  ) {}

  async findAll(companyId?: string): Promise<SocialIntegration[]> {
    const where = companyId ? { companyId } : {};
    return this.integrationRepository.find({
      where,
      order: { platform: 'ASC' },
    });
  }

  async findOne(id: string): Promise<SocialIntegration> {
    const integration = await this.integrationRepository.findOne({ where: { id } });
    if (!integration) {
      throw new NotFoundException(`Social integration with ID ${id} not found`);
    }
    return integration;
  }

  async create(data: Partial<SocialIntegration>): Promise<SocialIntegration> {
    const integration = this.integrationRepository.create(data);
    return this.integrationRepository.save(integration);
  }

  async update(id: string, data: Partial<SocialIntegration>): Promise<SocialIntegration> {
    const integration = await this.findOne(id);
    Object.assign(integration, data);
    return this.integrationRepository.save(integration);
  }

  async remove(id: string): Promise<void> {
    const integration = await this.findOne(id);
    await this.integrationRepository.remove(integration);
  }
}
