import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScheduledJob } from '../entities/scheduled-job.entity';

@Injectable()
export class ScheduledJobService {
  constructor(
    @InjectRepository(ScheduledJob)
    private readonly repository: Repository<ScheduledJob>,
  ) {}

  async findAll(filters?: {
    companyId?: string;
    type?: string;
    status?: string;
  }): Promise<ScheduledJob[]> {
    const where: Record<string, any> = {};
    if (filters?.companyId) where.companyId = filters.companyId;
    if (filters?.type && filters.type !== 'all') where.type = filters.type;
    if (filters?.status && filters.status !== 'all')
      where.status = filters.status;
    return this.repository.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<ScheduledJob> {
    const job = await this.repository.findOne({ where: { id } });
    if (!job) throw new NotFoundException(`Scheduled job ${id} not found`);
    return job;
  }

  async create(data: Partial<ScheduledJob>): Promise<ScheduledJob> {
    return this.repository.save(this.repository.create(data));
  }

  async update(id: string, data: Partial<ScheduledJob>): Promise<ScheduledJob> {
    const job = await this.findOne(id);
    Object.assign(job, data);
    return this.repository.save(job);
  }

  async remove(id: string): Promise<void> {
    const job = await this.findOne(id);
    await this.repository.remove(job);
  }
}
