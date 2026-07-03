import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SalesTarget } from '../entities/sales-target.entity';

@Injectable()
export class SalesTargetService {
  constructor(
    @InjectRepository(SalesTarget)
    private readonly repo: Repository<SalesTarget>,
  ) {}

  async findAll(companyId?: string): Promise<SalesTarget[]> {
    const where = companyId ? { companyId } : {};
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<SalesTarget> {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException(`Sales target ${id} not found`);
    return row;
  }

  async create(data: Partial<SalesTarget>): Promise<SalesTarget> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async update(id: string, data: Partial<SalesTarget>): Promise<SalesTarget> {
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
