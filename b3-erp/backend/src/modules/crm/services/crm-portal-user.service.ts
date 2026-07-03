import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrmPortalUser } from '../entities/crm-portal-user.entity';

@Injectable()
export class CrmPortalUserService {
  constructor(
    @InjectRepository(CrmPortalUser)
    private readonly repo: Repository<CrmPortalUser>,
  ) {}

  async findAll(companyId?: string): Promise<CrmPortalUser[]> {
    const where = companyId ? { companyId } : {};
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<CrmPortalUser> {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException(`Portal user ${id} not found`);
    return row;
  }

  async create(data: Partial<CrmPortalUser>): Promise<CrmPortalUser> {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: string, data: Partial<CrmPortalUser>): Promise<CrmPortalUser> {
    const row = await this.findOne(id);
    Object.assign(row, data);
    return this.repo.save(row);
  }

  async remove(id: string): Promise<void> {
    const row = await this.findOne(id);
    await this.repo.remove(row);
  }
}
