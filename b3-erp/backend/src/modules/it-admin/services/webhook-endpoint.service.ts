import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WebhookEndpoint } from '../entities/webhook-endpoint.entity';

@Injectable()
export class WebhookEndpointService {
  constructor(
    @InjectRepository(WebhookEndpoint)
    private readonly repository: Repository<WebhookEndpoint>,
  ) {}

  async findAll(filters?: {
    companyId?: string;
    status?: string;
  }): Promise<WebhookEndpoint[]> {
    const where: Record<string, any> = {};
    if (filters?.companyId) where.companyId = filters.companyId;
    if (filters?.status && filters.status !== 'all') where.status = filters.status;
    return this.repository.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<WebhookEndpoint> {
    const item = await this.repository.findOne({ where: { id } });
    if (!item) throw new NotFoundException(`Webhook endpoint ${id} not found`);
    return item;
  }

  async create(data: Partial<WebhookEndpoint>): Promise<WebhookEndpoint> {
    return this.repository.save(this.repository.create(data));
  }

  async update(id: string, data: Partial<WebhookEndpoint>): Promise<WebhookEndpoint> {
    const item = await this.findOne(id);
    Object.assign(item, data);
    return this.repository.save(item);
  }

  async remove(id: string): Promise<void> {
    const item = await this.findOne(id);
    await this.repository.remove(item);
  }
}
