import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { AmcContract } from '../entities/amc-contract.entity';

@Injectable()
export class AmcContractService {
  constructor(
    @InjectRepository(AmcContract)
    private readonly repo: Repository<AmcContract>,
  ) {}

  async findAll(companyId: string, filter?: string): Promise<AmcContract[]> {
    const where: FindOptionsWhere<AmcContract> = { companyId } as FindOptionsWhere<AmcContract>;
    if (filter) (where as Record<string, string>).assetCategory = filter;
    return this.repo.find({ where, order: { endDate: 'DESC' } as any });
  }

  async findOne(id: string): Promise<AmcContract> {
    const entity = await this.repo.findOne({ where: { id } as FindOptionsWhere<AmcContract> });
    if (!entity) throw new NotFoundException(`AMC contract ${id} not found`);
    return entity;
  }

  async create(data: Partial<AmcContract> & { companyId: string }): Promise<AmcContract> {
    return this.repo.save(this.repo.create(data as AmcContract));
  }

  async update(id: string, data: Partial<AmcContract>): Promise<AmcContract> {
    const entity = await this.findOne(id);
    Object.assign(entity, data);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
