import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrmContractAmendment } from '../entities/crm-contract-amendment.entity';

@Injectable()
export class CrmContractAmendmentService {
  constructor(
    @InjectRepository(CrmContractAmendment)
    private readonly repo: Repository<CrmContractAmendment>,
  ) {}

  async findAll(companyId?: string): Promise<CrmContractAmendment[]> {
    const where = companyId ? { companyId } : {};
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<CrmContractAmendment> {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException(`Contract amendment ${id} not found`);
    return row;
  }

  async create(
    data: Partial<CrmContractAmendment>,
  ): Promise<CrmContractAmendment> {
    return this.repo.save(this.repo.create(data));
  }

  async update(
    id: string,
    data: Partial<CrmContractAmendment>,
  ): Promise<CrmContractAmendment> {
    const row = await this.findOne(id);
    Object.assign(row, data);
    return this.repo.save(row);
  }

  async remove(id: string): Promise<void> {
    const row = await this.findOne(id);
    await this.repo.remove(row);
  }
}
