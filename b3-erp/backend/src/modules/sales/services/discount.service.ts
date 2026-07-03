import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Discount } from '../entities/discount.entity';

@Injectable()
export class DiscountService {
  constructor(
    @InjectRepository(Discount)
    private readonly repo: Repository<Discount>,
  ) {}

  async findAll(companyId?: string): Promise<Discount[]> {
    const where = companyId ? { companyId } : {};
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<Discount> {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException(`Discount ${id} not found`);
    return row;
  }

  async create(data: Partial<Discount>): Promise<Discount> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async update(id: string, data: Partial<Discount>): Promise<Discount> {
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
