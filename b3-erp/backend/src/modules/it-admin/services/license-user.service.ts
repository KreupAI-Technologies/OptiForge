import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LicenseUser } from '../entities/license-user.entity';

@Injectable()
export class LicenseUserService {
  constructor(
    @InjectRepository(LicenseUser)
    private readonly repository: Repository<LicenseUser>,
  ) {}

  async findAll(filters?: {
    companyId?: string;
    status?: string;
    licenseType?: string;
  }): Promise<LicenseUser[]> {
    const where: Record<string, any> = {};
    if (filters?.companyId) where.companyId = filters.companyId;
    if (filters?.status && filters.status !== 'all') where.status = filters.status;
    if (filters?.licenseType && filters.licenseType !== 'all')
      where.licenseType = filters.licenseType;
    return this.repository.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<LicenseUser> {
    const item = await this.repository.findOne({ where: { id } });
    if (!item) throw new NotFoundException(`License user ${id} not found`);
    return item;
  }

  async create(data: Partial<LicenseUser>): Promise<LicenseUser> {
    return this.repository.save(this.repository.create(data));
  }

  async update(id: string, data: Partial<LicenseUser>): Promise<LicenseUser> {
    const item = await this.findOne(id);
    Object.assign(item, data);
    return this.repository.save(item);
  }

  async remove(id: string): Promise<void> {
    const item = await this.findOne(id);
    await this.repository.remove(item);
  }
}
