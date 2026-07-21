import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CleanupTask } from '../entities/cleanup-task.entity';

@Injectable()
export class CleanupTaskService {
  constructor(
    @InjectRepository(CleanupTask)
    private readonly repository: Repository<CleanupTask>,
  ) {}

  private defaults(): Partial<CleanupTask>[] {
    return [
      { name: 'Old Application Logs', description: 'Delete application logs older than 90 days', category: 'logs', impact: 'low', estimatedSpace: '2.4 GB', recordCount: 1245678, automated: true, enabled: true },
      { name: 'System Error Logs', description: 'Delete system error logs older than 60 days', category: 'logs', impact: 'low', estimatedSpace: '856 MB', recordCount: 345789, automated: true, enabled: true },
      { name: 'Temporary Files', description: 'Remove temporary upload files and cache', category: 'temp', impact: 'low', estimatedSpace: '1.2 GB', recordCount: 8934, automated: true, enabled: true },
      { name: 'Session Data', description: 'Clean expired user sessions older than 7 days', category: 'temp', impact: 'low', estimatedSpace: '145 MB', recordCount: 45678, automated: true, enabled: true },
      { name: 'Orphaned Records', description: 'Delete records with missing foreign key references', category: 'orphaned', impact: 'medium', estimatedSpace: '345 MB', recordCount: 2345, automated: false, enabled: false },
      { name: 'Orphaned Attachments', description: 'Remove files without database references', category: 'orphaned', impact: 'low', estimatedSpace: '678 MB', recordCount: 1234, automated: false, enabled: false },
      { name: 'Duplicate Customers', description: 'Find and merge duplicate customer records', category: 'duplicates', impact: 'high', estimatedSpace: '12 MB', recordCount: 156, automated: false, enabled: false },
      { name: 'Duplicate Products', description: 'Identify duplicate product SKUs and consolidate', category: 'duplicates', impact: 'high', estimatedSpace: '8 MB', recordCount: 89, automated: false, enabled: false },
      { name: 'Archived Orders', description: 'Move completed orders older than 1 year to archive', category: 'archived', impact: 'low', estimatedSpace: '3.4 GB', recordCount: 12456, automated: true, enabled: true },
      { name: 'Archived Transactions', description: 'Archive financial transactions older than 2 years', category: 'archived', impact: 'low', estimatedSpace: '2.8 GB', recordCount: 45678, automated: true, enabled: true },
      { name: 'Old Email Queue', description: 'Delete sent emails older than 30 days', category: 'logs', impact: 'low', estimatedSpace: '456 MB', recordCount: 234567, automated: true, enabled: true },
      { name: 'Audit Trail', description: 'Archive audit logs older than 3 years', category: 'archived', impact: 'low', estimatedSpace: '5.6 GB', recordCount: 2345678, automated: true, enabled: true },
    ];
  }

  // Seed the default catalog on first read when empty (installation-checklist pattern).
  private async ensureSeeded(companyId?: string): Promise<void> {
    const count = await this.repository.count(
      companyId ? { where: { companyId } } : {},
    );
    if (count > 0) return;
    await this.repository.save(
      this.defaults().map((d) => this.repository.create({ ...d, companyId })),
    );
  }

  async findAll(filters?: {
    companyId?: string;
    category?: string;
  }): Promise<CleanupTask[]> {
    await this.ensureSeeded(filters?.companyId);
    const where: Record<string, any> = {};
    if (filters?.companyId) where.companyId = filters.companyId;
    if (filters?.category && filters.category !== 'all')
      where.category = filters.category;
    return this.repository.find({ where, order: { category: 'ASC', name: 'ASC' } });
  }

  async findOne(id: string): Promise<CleanupTask> {
    const item = await this.repository.findOne({ where: { id } });
    if (!item) throw new NotFoundException(`Cleanup task ${id} not found`);
    return item;
  }

  async create(data: Partial<CleanupTask>): Promise<CleanupTask> {
    return this.repository.save(this.repository.create(data));
  }

  async update(id: string, data: Partial<CleanupTask>): Promise<CleanupTask> {
    const item = await this.findOne(id);
    Object.assign(item, data);
    return this.repository.save(item);
  }

  // Records a run: stamps lastRunAt and returns a summary. No real deletion is
  // performed — this backs the operational console's "Run" action.
  async run(id: string): Promise<{
    task: CleanupTask;
    ranAt: string;
    recordsAffected: number;
    estimatedSpace: string;
  }> {
    const item = await this.findOne(id);
    item.lastRunAt = new Date();
    item.recordsAffected = Number(item.recordCount ?? 0);
    const saved = await this.repository.save(item);
    return {
      task: saved,
      ranAt: saved.lastRunAt.toISOString(),
      recordsAffected: Number(saved.recordsAffected ?? 0),
      estimatedSpace: saved.estimatedSpace ?? '',
    };
  }

  async remove(id: string): Promise<void> {
    const item = await this.findOne(id);
    await this.repository.remove(item);
  }
}
