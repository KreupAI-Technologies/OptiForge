import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityRecord } from '../entities/activity-record.entity';

@Injectable()
export class ActivityRecordService {
  constructor(
    @InjectRepository(ActivityRecord)
    private readonly repo: Repository<ActivityRecord>,
  ) {}

  async findAll(filters?: {
    companyId?: string;
    type?: string;
    status?: string;
  }): Promise<ActivityRecord[]> {
    const where: Record<string, any> = {};
    if (filters?.companyId) where.companyId = filters.companyId;
    if (filters?.type) where.type = filters.type;
    if (filters?.status) where.status = filters.status;
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<ActivityRecord> {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException(`Activity ${id} not found`);
    return row;
  }

  async create(data: Partial<ActivityRecord>): Promise<ActivityRecord> {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: string, data: Partial<ActivityRecord>): Promise<ActivityRecord> {
    const row = await this.findOne(id);
    Object.assign(row, data);
    return this.repo.save(row);
  }

  async remove(id: string): Promise<void> {
    const row = await this.findOne(id);
    await this.repo.remove(row);
  }
}
