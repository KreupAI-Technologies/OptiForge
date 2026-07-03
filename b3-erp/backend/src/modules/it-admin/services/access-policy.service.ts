import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccessPolicyDef } from '../entities/access-policy.entity';

@Injectable()
export class AccessPolicyService {
  constructor(
    @InjectRepository(AccessPolicyDef)
    private readonly repository: Repository<AccessPolicyDef>,
  ) {}

  async findAll(filters?: {
    companyId?: string;
    type?: string;
  }): Promise<AccessPolicyDef[]> {
    const where: Record<string, any> = {};
    if (filters?.companyId) where.companyId = filters.companyId;
    if (filters?.type && filters.type !== 'all') where.type = filters.type;
    return this.repository.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<AccessPolicyDef> {
    const policy = await this.repository.findOne({ where: { id } });
    if (!policy) throw new NotFoundException(`Policy ${id} not found`);
    return policy;
  }

  async create(data: Partial<AccessPolicyDef>): Promise<AccessPolicyDef> {
    const policy = this.repository.create(data);
    return this.repository.save(policy);
  }

  async update(
    id: string,
    data: Partial<AccessPolicyDef>,
  ): Promise<AccessPolicyDef> {
    const policy = await this.findOne(id);
    Object.assign(policy, data);
    return this.repository.save(policy);
  }

  async remove(id: string): Promise<void> {
    const policy = await this.findOne(id);
    await this.repository.remove(policy);
  }
}
