import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SalesReport } from '../entities/sales-report.entity';

@Injectable()
export class SalesReportService {
  constructor(
    @InjectRepository(SalesReport)
    private readonly repo: Repository<SalesReport>,
  ) {}

  async findAll(companyId?: string): Promise<SalesReport[]> {
    const where = companyId ? { companyId } : {};
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<SalesReport> {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException(`Sales report ${id} not found`);
    return row;
  }

  async create(data: Partial<SalesReport>): Promise<SalesReport> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async update(id: string, data: Partial<SalesReport>): Promise<SalesReport> {
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
