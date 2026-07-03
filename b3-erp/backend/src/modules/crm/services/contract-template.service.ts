import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContractTemplate } from '../entities/contract-template.entity';

@Injectable()
export class ContractTemplateService {
  constructor(
    @InjectRepository(ContractTemplate)
    private readonly repo: Repository<ContractTemplate>,
  ) {}

  async findAll(companyId?: string): Promise<ContractTemplate[]> {
    const where = companyId ? { companyId } : {};
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<ContractTemplate> {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) {
      throw new NotFoundException(`Contract template with ID ${id} not found`);
    }
    return row;
  }

  async create(data: Partial<ContractTemplate>): Promise<ContractTemplate> {
    return this.repo.save(this.repo.create(data));
  }

  async update(
    id: string,
    data: Partial<ContractTemplate>,
  ): Promise<ContractTemplate> {
    const row = await this.findOne(id);
    Object.assign(row, data);
    return this.repo.save(row);
  }

  async remove(id: string): Promise<void> {
    const row = await this.findOne(id);
    await this.repo.remove(row);
  }
}
