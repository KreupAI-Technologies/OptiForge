import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SecurityPolicy } from '../entities/security-policy.entity';

@Injectable()
export class SecurityPolicyService {
  constructor(
    @InjectRepository(SecurityPolicy)
    private readonly repository: Repository<SecurityPolicy>,
  ) {}

  async findAll(filters?: {
    companyId?: string;
    type?: string;
  }): Promise<SecurityPolicy[]> {
    const where: Record<string, any> = {};
    if (filters?.companyId) where.companyId = filters.companyId;
    if (filters?.type && filters.type !== 'all') where.type = filters.type;
    return this.repository.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<SecurityPolicy> {
    const item = await this.repository.findOne({ where: { id } });
    if (!item) throw new NotFoundException(`Security policy ${id} not found`);
    return item;
  }

  async create(data: Partial<SecurityPolicy>): Promise<SecurityPolicy> {
    return this.repository.save(this.repository.create(data));
  }

  async update(id: string, data: Partial<SecurityPolicy>): Promise<SecurityPolicy> {
    const item = await this.findOne(id);
    Object.assign(item, data);
    return this.repository.save(item);
  }

  async remove(id: string): Promise<void> {
    const item = await this.findOne(id);
    await this.repository.remove(item);
  }
}
