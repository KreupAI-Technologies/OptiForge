import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PmEarnedValueEntity } from '../entities/pm-earned-value.entity';

@Injectable()
export class PmEarnedValueService {
  constructor(
    @InjectRepository(PmEarnedValueEntity)
    private readonly repo: Repository<PmEarnedValueEntity>,
  ) {}

  async findAll(companyId = 'default', status?: string): Promise<PmEarnedValueEntity[]> {
    const where: any = { companyId };
    if (status) where.status = status;
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<PmEarnedValueEntity> {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException(`EVM record ${id} not found`);
    return row;
  }

  async create(data: Partial<PmEarnedValueEntity>): Promise<PmEarnedValueEntity> {
    const row = this.repo.create({ companyId: 'default', ...data });
    return this.repo.save(row);
  }

  async update(id: string, data: Partial<PmEarnedValueEntity>): Promise<PmEarnedValueEntity> {
    const row = await this.findOne(id);
    const { id: _id, createdAt, updatedAt, ...rest } = data as any;
    Object.assign(row, rest);
    return this.repo.save(row);
  }

  async remove(id: string): Promise<void> {
    const result = await this.repo.delete(id);
    if (result.affected === 0) throw new NotFoundException(`EVM record ${id} not found`);
  }
}
