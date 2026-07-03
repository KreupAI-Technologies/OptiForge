import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PerDiemRate } from '../entities/per-diem-rate.entity';

@Injectable()
export class PerDiemRateService {
  constructor(
    @InjectRepository(PerDiemRate)
    private readonly repo: Repository<PerDiemRate>,
  ) {}

  async findAll(companyId: string, status?: string): Promise<PerDiemRate[]> {
    const where: Record<string, any> = { companyId };
    if (status) where.status = status;
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<PerDiemRate> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`PerDiemRate ${id} not found`);
    return entity;
  }

  async create(data: Partial<PerDiemRate> & { companyId: string }): Promise<PerDiemRate> {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: string, data: Partial<PerDiemRate>): Promise<PerDiemRate> {
    const entity = await this.findOne(id);
    Object.assign(entity, data);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
