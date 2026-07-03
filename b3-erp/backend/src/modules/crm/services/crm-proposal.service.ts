import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrmProposal } from '../entities/crm-proposal.entity';

@Injectable()
export class CrmProposalService {
  constructor(
    @InjectRepository(CrmProposal)
    private readonly repo: Repository<CrmProposal>,
  ) {}

  async findAll(companyId?: string): Promise<CrmProposal[]> {
    const where = companyId ? { companyId } : {};
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<CrmProposal> {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException(`Proposal ${id} not found`);
    return row;
  }

  async create(data: Partial<CrmProposal>): Promise<CrmProposal> {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: string, data: Partial<CrmProposal>): Promise<CrmProposal> {
    const row = await this.findOne(id);
    Object.assign(row, data);
    return this.repo.save(row);
  }

  async remove(id: string): Promise<void> {
    const row = await this.findOne(id);
    await this.repo.remove(row);
  }
}
