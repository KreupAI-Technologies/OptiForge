import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CashTransaction } from '../entities/cash-transaction.entity';

@Injectable()
export class CashTransactionService {
  constructor(
    @InjectRepository(CashTransaction)
    private readonly repo: Repository<CashTransaction>,
  ) {}

  async findAll(): Promise<CashTransaction[]> {
    return this.repo.find({ order: { date: 'DESC', createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<CashTransaction> {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) {
      throw new NotFoundException(`Cash transaction ${id} not found`);
    }
    return row;
  }

  async create(dto: Partial<CashTransaction>): Promise<CashTransaction> {
    const row = this.repo.create(dto);
    return this.repo.save(row);
  }

  async update(
    id: string,
    dto: Partial<CashTransaction>,
  ): Promise<CashTransaction> {
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
