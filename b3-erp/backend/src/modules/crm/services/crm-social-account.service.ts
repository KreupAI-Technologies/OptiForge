import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrmSocialAccount } from '../entities/crm-social-account.entity';

@Injectable()
export class CrmSocialAccountService {
  constructor(
    @InjectRepository(CrmSocialAccount)
    private readonly repo: Repository<CrmSocialAccount>,
  ) {}

  async findAll(companyId?: string): Promise<CrmSocialAccount[]> {
    const where = companyId ? { companyId } : {};
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<CrmSocialAccount> {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException(`Social account ${id} not found`);
    return row;
  }

  async create(data: Partial<CrmSocialAccount>): Promise<CrmSocialAccount> {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: string, data: Partial<CrmSocialAccount>): Promise<CrmSocialAccount> {
    const row = await this.findOne(id);
    Object.assign(row, data);
    return this.repo.save(row);
  }

  async remove(id: string): Promise<void> {
    const row = await this.findOne(id);
    await this.repo.remove(row);
  }
}
