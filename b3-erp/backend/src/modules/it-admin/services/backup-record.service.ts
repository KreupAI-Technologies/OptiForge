import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BackupRecord } from '../entities/backup-record.entity';

@Injectable()
export class BackupRecordService {
  constructor(
    @InjectRepository(BackupRecord)
    private readonly repository: Repository<BackupRecord>,
  ) {}

  async findAll(filters?: {
    companyId?: string;
    type?: string;
    status?: string;
  }): Promise<BackupRecord[]> {
    const where: Record<string, any> = {};
    if (filters?.companyId) where.companyId = filters.companyId;
    if (filters?.type && filters.type !== 'all') where.type = filters.type;
    if (filters?.status && filters.status !== 'all') where.status = filters.status;
    return this.repository.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<BackupRecord> {
    const item = await this.repository.findOne({ where: { id } });
    if (!item) throw new NotFoundException(`Backup record ${id} not found`);
    return item;
  }

  async create(data: Partial<BackupRecord>): Promise<BackupRecord> {
    return this.repository.save(this.repository.create(data));
  }

  async update(id: string, data: Partial<BackupRecord>): Promise<BackupRecord> {
    const item = await this.findOne(id);
    Object.assign(item, data);
    return this.repository.save(item);
  }

  async remove(id: string): Promise<void> {
    const item = await this.findOne(id);
    await this.repository.remove(item);
  }

  /**
   * Records a restore of a backup. Realistic no-op: marks the record as
   * restored and stamps the completion time, then returns the updated record.
   * Actual data-plane restore is out of scope for this control-plane API.
   */
  async restore(id: string): Promise<BackupRecord> {
    const item = await this.findOne(id);
    item.status = 'restored';
    item.completedAt = new Date().toISOString();
    return this.repository.save(item);
  }
}
