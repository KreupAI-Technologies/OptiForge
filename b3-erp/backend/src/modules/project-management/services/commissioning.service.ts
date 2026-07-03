import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommissioningActivityEntity } from '../entities/commissioning-activity.entity';

@Injectable()
export class CommissioningService {
  constructor(
    @InjectRepository(CommissioningActivityEntity)
    private readonly repo: Repository<CommissioningActivityEntity>,
  ) {}

  async findAll(companyId = 'default', status?: string): Promise<CommissioningActivityEntity[]> {
    const where: any = { companyId };
    if (status) where.status = status;
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<CommissioningActivityEntity> {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException(`Commissioning activity ${id} not found`);
    return row;
  }

  async create(data: Partial<CommissioningActivityEntity>): Promise<CommissioningActivityEntity> {
    const testParameters = Array.isArray(data.testParameters) ? data.testParameters : [];
    const checklistItems = Array.isArray(data.checklistItems) ? data.checklistItems : [];
    const dependencies = Array.isArray(data.dependencies) ? data.dependencies : [];
    const row = this.repo.create({
      companyId: 'default',
      ...data,
      testParameters,
      checklistItems,
      dependencies,
    });
    return this.repo.save(row);
  }

  async update(id: string, data: Partial<CommissioningActivityEntity>): Promise<CommissioningActivityEntity> {
    const row = await this.findOne(id);
    const { id: _id, createdAt, updatedAt, ...rest } = data as any;
    Object.assign(row, rest);
    return this.repo.save(row);
  }

  async remove(id: string): Promise<void> {
    const result = await this.repo.delete(id);
    if (result.affected === 0) throw new NotFoundException(`Commissioning activity ${id} not found`);
  }
}
