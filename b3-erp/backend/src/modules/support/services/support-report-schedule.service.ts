import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupportReportSchedule } from '../entities/support-report-schedule.entity';

@Injectable()
export class SupportReportScheduleService {
  constructor(
    @InjectRepository(SupportReportSchedule)
    private readonly repo: Repository<SupportReportSchedule>,
  ) {}

  async create(
    companyId: string,
    data: Partial<SupportReportSchedule>,
  ): Promise<SupportReportSchedule> {
    const entity = this.repo.create({ ...data, companyId });
    return this.repo.save(entity);
  }

  async findAll(
    companyId: string,
    filters?: { isActive?: boolean; reportType?: string },
  ): Promise<SupportReportSchedule[]> {
    try {
      const query = this.repo
        .createQueryBuilder('schedule')
        .where('schedule.companyId = :companyId', { companyId })
        .orderBy('schedule.createdAt', 'DESC');

      if (filters?.isActive !== undefined) {
        query.andWhere('schedule.isActive = :isActive', {
          isActive: filters.isActive,
        });
      }
      if (filters?.reportType) {
        query.andWhere('schedule.reportType = :reportType', {
          reportType: filters.reportType,
        });
      }
      return await query.getMany();
    } catch {
      // Table not yet created / empty — degrade gracefully.
      return [];
    }
  }

  async findOne(companyId: string, id: string): Promise<SupportReportSchedule> {
    const entity = await this.repo.findOne({ where: { id, companyId } });
    if (!entity) {
      throw new NotFoundException(`Report schedule with ID ${id} not found`);
    }
    return entity;
  }

  async update(
    companyId: string,
    id: string,
    data: Partial<SupportReportSchedule>,
  ): Promise<SupportReportSchedule> {
    const entity = await this.findOne(companyId, id);
    Object.assign(entity, data);
    return this.repo.save(entity);
  }

  async delete(companyId: string, id: string): Promise<void> {
    const entity = await this.findOne(companyId, id);
    await this.repo.remove(entity);
  }
}
