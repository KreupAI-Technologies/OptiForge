import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CardTransaction } from '../entities/card-transaction.entity';

@Injectable()
export class CardTransactionService {
  constructor(
    @InjectRepository(CardTransaction)
    private readonly repo: Repository<CardTransaction>,
  ) {}

  async findAll(companyId: string, status?: string): Promise<CardTransaction[]> {
    const where: Record<string, any> = { companyId };
    if (status) where.status = status;
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<CardTransaction> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`Card transaction ${id} not found`);
    return entity;
  }

  async create(
    data: Partial<CardTransaction> & { companyId: string },
  ): Promise<CardTransaction> {
    return this.repo.save(this.repo.create(data));
  }

  async update(
    id: string,
    data: Partial<CardTransaction>,
  ): Promise<CardTransaction> {
    const entity = await this.findOne(id);
    Object.assign(entity, data);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
