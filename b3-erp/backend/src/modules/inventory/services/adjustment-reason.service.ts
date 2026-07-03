import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  AdjustmentReason,
  AdjustmentReasonStatus,
} from '../entities/adjustment-reason.entity';

@Injectable()
export class AdjustmentReasonService {
  constructor(
    @InjectRepository(AdjustmentReason)
    private readonly adjustmentReasonRepository: Repository<AdjustmentReason>,
  ) {}

  async findAll(filters?: {
    status?: string;
    reasonType?: string;
    search?: string;
  }): Promise<AdjustmentReason[]> {
    const qb = this.adjustmentReasonRepository
      .createQueryBuilder('reason')
      .orderBy('reason.sortOrder', 'ASC')
      .addOrderBy('reason.code', 'ASC');

    if (filters?.status) {
      qb.andWhere('reason.status = :status', { status: filters.status });
    }
    if (filters?.reasonType) {
      qb.andWhere('reason.reasonType = :reasonType', {
        reasonType: filters.reasonType,
      });
    }
    if (filters?.search) {
      qb.andWhere(
        '(LOWER(reason.code) LIKE :search OR LOWER(reason.name) LIKE :search)',
        { search: `%${filters.search.toLowerCase()}%` },
      );
    }

    return qb.getMany();
  }

  async findOne(id: string): Promise<AdjustmentReason | null> {
    return this.adjustmentReasonRepository.findOne({ where: { id } });
  }

  async getStatistics(): Promise<{
    total: number;
    active: number;
    inactive: number;
  }> {
    const [total, active] = await Promise.all([
      this.adjustmentReasonRepository.count(),
      this.adjustmentReasonRepository.count({
        where: { status: AdjustmentReasonStatus.ACTIVE },
      }),
    ]);
    return { total, active, inactive: total - active };
  }
}
