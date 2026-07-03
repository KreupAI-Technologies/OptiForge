import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SpecialPrice } from '../entities/special-price.entity';

@Injectable()
export class SpecialPriceService {
  constructor(
    @InjectRepository(SpecialPrice)
    private readonly repo: Repository<SpecialPrice>,
  ) {}

  async findAll(companyId?: string): Promise<SpecialPrice[]> {
    const where = companyId ? { companyId } : {};
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<SpecialPrice> {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException(`Special price ${id} not found`);
    return row;
  }

  async create(data: Partial<SpecialPrice>): Promise<SpecialPrice> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async update(id: string, data: Partial<SpecialPrice>): Promise<SpecialPrice> {
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
