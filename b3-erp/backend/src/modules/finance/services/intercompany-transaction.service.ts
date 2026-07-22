import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IntercompanyTransaction } from '../entities/intercompany-transaction.entity';

@Injectable()
export class IntercompanyTransactionService {
  constructor(
    @InjectRepository(IntercompanyTransaction)
    private readonly repo: Repository<IntercompanyTransaction>,
  ) {}

  async findAll(): Promise<IntercompanyTransaction[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<IntercompanyTransaction> {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) {
      throw new NotFoundException(`Intercompany transaction ${id} not found`);
    }
    return row;
  }

  async create(
    dto: Partial<IntercompanyTransaction>,
  ): Promise<IntercompanyTransaction> {
    const row = this.repo.create(dto);
    return this.repo.save(row);
  }

  async update(
    id: string,
    dto: Partial<IntercompanyTransaction>,
  ): Promise<IntercompanyTransaction> {
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
