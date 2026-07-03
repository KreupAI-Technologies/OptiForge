import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerSegment } from '../entities/customer-segment.entity';

@Injectable()
export class CustomerSegmentService {
  constructor(
    @InjectRepository(CustomerSegment)
    private readonly repo: Repository<CustomerSegment>,
  ) {}

  async findAll(companyId?: string): Promise<CustomerSegment[]> {
    const where = companyId ? { companyId } : {};
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<CustomerSegment> {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException(`Customer segment ${id} not found`);
    return row;
  }

  async create(data: Partial<CustomerSegment>): Promise<CustomerSegment> {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: string, data: Partial<CustomerSegment>): Promise<CustomerSegment> {
    const row = await this.findOne(id);
    Object.assign(row, data);
    return this.repo.save(row);
  }

  async remove(id: string): Promise<void> {
    const row = await this.findOne(id);
    await this.repo.remove(row);
  }
}
