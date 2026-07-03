import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShortageRecord, ShortageStatus, ShortageSeverity } from '../entities/shortage-record.entity';

@Injectable()
export class ShortageRecordService {
  constructor(
    @InjectRepository(ShortageRecord)
    private readonly shortageRecordRepository: Repository<ShortageRecord>,
  ) {}

  async create(createDto: Partial<ShortageRecord>): Promise<ShortageRecord> {
    const record = this.shortageRecordRepository.create(createDto);
    return this.shortageRecordRepository.save(record);
  }

  async findAll(filters?: {
    companyId?: string;
    status?: ShortageStatus;
    severity?: ShortageSeverity;
    itemId?: string;
  }): Promise<ShortageRecord[]> {
    const query = this.shortageRecordRepository.createQueryBuilder('record');

    if (filters?.companyId) {
      query.andWhere('record.companyId = :companyId', { companyId: filters.companyId });
    }

    if (filters?.status) {
      query.andWhere('record.status = :status', { status: filters.status });
    }

    if (filters?.severity) {
      query.andWhere('record.severity = :severity', { severity: filters.severity });
    }

    if (filters?.itemId) {
      query.andWhere('record.itemId = :itemId', { itemId: filters.itemId });
    }

    // Entity has no detectedAt column; order by creation time (most recent first).
    query.orderBy('record.createdAt', 'DESC');
    return query.getMany();
  }

  async findOne(id: string): Promise<ShortageRecord> {
    const record = await this.shortageRecordRepository.findOne({ where: { id } });
    if (!record) {
      throw new NotFoundException(`Shortage Record with ID ${id} not found`);
    }
    return record;
  }

  async update(id: string, updateDto: Partial<ShortageRecord>): Promise<ShortageRecord> {
    const record = await this.findOne(id);
    Object.assign(record, updateDto);
    return this.shortageRecordRepository.save(record);
  }

  async resolve(id: string, resolution: string, resolvedBy: string): Promise<ShortageRecord> {
    const record = await this.findOne(id);
    record.status = 'resolved';
    record.selectedResolution = resolution;
    record.resolvedBy = resolvedBy;
    record.resolvedAt = new Date();
    return this.shortageRecordRepository.save(record);
  }

  async escalate(id: string, escalateTo: string): Promise<ShortageRecord> {
    const record = await this.findOne(id);
    record.escalatedTo = escalateTo;
    record.escalatedAt = new Date();
    return this.shortageRecordRepository.save(record);
  }

  async getAnalytics(companyId: string): Promise<any> {
    const records = await this.findAll({ companyId });

    const totalShortages = records.length;
    const openShortages = records.filter(r => r.status === 'open').length;
    const resolvedShortages = records.filter(r => r.status === 'resolved').length;
    const criticalShortages = records.filter(r => r.severity === 'critical').length;

    return {
      totalShortages,
      openShortages,
      resolvedShortages,
      criticalShortages,
      resolutionRate: totalShortages > 0 ? (resolvedShortages / totalShortages) * 100 : 0,
    };
  }
}
