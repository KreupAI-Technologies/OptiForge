import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiEndpoint } from '../entities/api-endpoint.entity';

@Injectable()
export class ApiEndpointService {
  constructor(
    @InjectRepository(ApiEndpoint)
    private readonly repository: Repository<ApiEndpoint>,
  ) {}

  async findAll(filters?: {
    companyId?: string;
    category?: string;
  }): Promise<ApiEndpoint[]> {
    const where: Record<string, any> = {};
    if (filters?.companyId) where.companyId = filters.companyId;
    if (filters?.category && filters.category !== 'all')
      where.category = filters.category;
    return this.repository.find({ where, order: { category: 'ASC', name: 'ASC' } });
  }

  async findOne(id: string): Promise<ApiEndpoint> {
    const item = await this.repository.findOne({ where: { id } });
    if (!item) throw new NotFoundException(`API endpoint ${id} not found`);
    return item;
  }

  async create(data: Partial<ApiEndpoint>): Promise<ApiEndpoint> {
    return this.repository.save(this.repository.create(data));
  }

  async update(id: string, data: Partial<ApiEndpoint>): Promise<ApiEndpoint> {
    const item = await this.findOne(id);
    Object.assign(item, data);
    return this.repository.save(item);
  }

  async remove(id: string): Promise<void> {
    const item = await this.findOne(id);
    await this.repository.remove(item);
  }
}
