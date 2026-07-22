import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CurrencyMaster } from '../entities/currency-master.entity';

@Injectable()
export class CurrencyMasterService {
  constructor(
    @InjectRepository(CurrencyMaster)
    private readonly repo: Repository<CurrencyMaster>,
  ) {}

  async findAll(): Promise<CurrencyMaster[]> {
    return this.repo.find({ order: { code: 'ASC' } });
  }

  async findOne(id: string): Promise<CurrencyMaster> {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) {
      throw new NotFoundException(`Currency ${id} not found`);
    }
    return row;
  }

  async create(dto: Partial<CurrencyMaster>): Promise<CurrencyMaster> {
    const row = this.repo.create(dto);
    return this.repo.save(row);
  }

  async update(id: string, dto: Partial<CurrencyMaster>): Promise<CurrencyMaster> {
    const row = await this.findOne(id);
    Object.assign(row, dto);
    return this.repo.save(row);
  }

  async remove(id: string): Promise<{ success: boolean }> {
    const row = await this.findOne(id);
    await this.repo.remove(row);
    return { success: true };
  }
}
