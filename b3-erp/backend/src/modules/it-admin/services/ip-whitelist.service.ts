import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IpWhitelistEntry } from '../entities/ip-whitelist-entry.entity';

@Injectable()
export class IpWhitelistService {
  constructor(
    @InjectRepository(IpWhitelistEntry)
    private readonly repository: Repository<IpWhitelistEntry>,
  ) {}

  async findAll(filters?: {
    companyId?: string;
    category?: string;
    status?: string;
  }): Promise<IpWhitelistEntry[]> {
    const where: Record<string, any> = {};
    if (filters?.companyId) where.companyId = filters.companyId;
    if (filters?.category && filters.category !== 'all')
      where.category = filters.category;
    if (filters?.status && filters.status !== 'all')
      where.status = filters.status;
    return this.repository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<IpWhitelistEntry> {
    const entry = await this.repository.findOne({ where: { id } });
    if (!entry) throw new NotFoundException(`IP whitelist entry ${id} not found`);
    return entry;
  }

  async create(data: Partial<IpWhitelistEntry>): Promise<IpWhitelistEntry> {
    const entry = this.repository.create(data);
    return this.repository.save(entry);
  }

  async update(
    id: string,
    data: Partial<IpWhitelistEntry>,
  ): Promise<IpWhitelistEntry> {
    const entry = await this.findOne(id);
    Object.assign(entry, data);
    return this.repository.save(entry);
  }

  async remove(id: string): Promise<void> {
    const entry = await this.findOne(id);
    await this.repository.remove(entry);
  }
}
