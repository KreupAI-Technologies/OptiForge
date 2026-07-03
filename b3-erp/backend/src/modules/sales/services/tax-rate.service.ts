import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaxRate } from '../entities/tax-rate.entity';

@Injectable()
export class TaxRateService {
  constructor(
    @InjectRepository(TaxRate)
    private readonly repo: Repository<TaxRate>,
  ) {}

  async findAll(companyId?: string): Promise<TaxRate[]> {
    const where = companyId ? { companyId } : {};
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<TaxRate> {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException(`Tax rate ${id} not found`);
    return row;
  }

  async create(data: Partial<TaxRate>): Promise<TaxRate> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async update(id: string, data: Partial<TaxRate>): Promise<TaxRate> {
    const row = await this.findOne(id);
    Object.assign(row, data);
    return this.repo.save(row);
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    const row = await this.findOne(id);
    await this.repo.remove(row);
    return { deleted: true };
  }
}
