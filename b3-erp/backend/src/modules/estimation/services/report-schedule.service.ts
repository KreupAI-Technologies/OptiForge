import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReportSchedule } from '../entities/report-schedule.entity';

@Injectable()
export class ReportScheduleService {
  constructor(
    @InjectRepository(ReportSchedule)
    private reportScheduleRepository: Repository<ReportSchedule>,
  ) {}

  async create(
    companyId: string,
    data: Partial<ReportSchedule>,
  ): Promise<ReportSchedule> {
    const entity = this.reportScheduleRepository.create({ ...data, companyId });
    return this.reportScheduleRepository.save(entity);
  }

  async findAll(
    companyId: string,
    filters?: { isActive?: boolean; reportType?: string },
  ): Promise<ReportSchedule[]> {
    const query = this.reportScheduleRepository
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
    return query.getMany();
  }

  async findOne(companyId: string, id: string): Promise<ReportSchedule> {
    const entity = await this.reportScheduleRepository.findOne({
      where: { id, companyId },
    });
    if (!entity) {
      throw new NotFoundException(`Report Schedule with ID ${id} not found`);
    }
    return entity;
  }

  async update(
    companyId: string,
    id: string,
    data: Partial<ReportSchedule>,
  ): Promise<ReportSchedule> {
    const entity = await this.findOne(companyId, id);
    Object.assign(entity, data);
    return this.reportScheduleRepository.save(entity);
  }

  async delete(companyId: string, id: string): Promise<void> {
    const entity = await this.findOne(companyId, id);
    await this.reportScheduleRepository.remove(entity);
  }
}
