import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserGroup } from '../entities/user-group.entity';

@Injectable()
export class UserGroupService {
  constructor(
    @InjectRepository(UserGroup)
    private readonly repository: Repository<UserGroup>,
  ) {}

  async findAll(filters?: {
    companyId?: string;
    status?: string;
  }): Promise<UserGroup[]> {
    const where: Record<string, any> = {};
    if (filters?.companyId) where.companyId = filters.companyId;
    if (filters?.status && filters.status !== 'all') where.status = filters.status;
    return this.repository.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<UserGroup> {
    const item = await this.repository.findOne({ where: { id } });
    if (!item) throw new NotFoundException(`User group ${id} not found`);
    return item;
  }

  async create(data: Partial<UserGroup>): Promise<UserGroup> {
    return this.repository.save(this.repository.create(data));
  }

  async update(id: string, data: Partial<UserGroup>): Promise<UserGroup> {
    const item = await this.findOne(id);
    Object.assign(item, data);
    return this.repository.save(item);
  }

  async remove(id: string): Promise<void> {
    const item = await this.findOne(id);
    await this.repository.remove(item);
  }
}
