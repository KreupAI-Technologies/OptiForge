import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrmContractRenewal } from '../entities/crm-contract-renewal.entity';

@Injectable()
export class CrmContractRenewalService {
  constructor(
    @InjectRepository(CrmContractRenewal)
    private readonly repo: Repository<CrmContractRenewal>,
  ) {}

  async findAll(companyId?: string): Promise<CrmContractRenewal[]> {
    const where = companyId ? { companyId } : {};
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<CrmContractRenewal> {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException(`Contract renewal ${id} not found`);
    return row;
  }

  async create(data: Partial<CrmContractRenewal>): Promise<CrmContractRenewal> {
    return this.repo.save(this.repo.create(data));
  }

  async update(
    id: string,
    data: Partial<CrmContractRenewal>,
  ): Promise<CrmContractRenewal> {
    const row = await this.findOne(id);
    Object.assign(row, data);
    return this.repo.save(row);
  }

  async remove(id: string): Promise<void> {
    const row = await this.findOne(id);
    await this.repo.remove(row);
  }
}
