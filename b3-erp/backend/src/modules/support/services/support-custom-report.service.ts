import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupportCustomReport } from '../entities/support-custom-report.entity';

@Injectable()
export class SupportCustomReportService {
  constructor(
    @InjectRepository(SupportCustomReport)
    private readonly repo: Repository<SupportCustomReport>,
  ) {}

  async create(
    companyId: string,
    data: Partial<SupportCustomReport>,
  ): Promise<SupportCustomReport> {
    const entity = this.repo.create({ ...data, companyId });
    return this.repo.save(entity);
  }

  async findAll(
    companyId: string,
    filters?: { dataSource?: string; isShared?: boolean },
  ): Promise<SupportCustomReport[]> {
    try {
      const query = this.repo
        .createQueryBuilder('report')
        .where('report.companyId = :companyId', { companyId })
        .orderBy('report.createdAt', 'DESC');

      if (filters?.dataSource) {
        query.andWhere('report.dataSource = :dataSource', {
          dataSource: filters.dataSource,
        });
      }
      if (filters?.isShared !== undefined) {
        query.andWhere('report.isShared = :isShared', {
          isShared: filters.isShared,
        });
      }
      return await query.getMany();
    } catch {
      // Table not yet created / empty — degrade gracefully.
      return [];
    }
  }

  async findOne(companyId: string, id: string): Promise<SupportCustomReport> {
    const entity = await this.repo.findOne({ where: { id, companyId } });
    if (!entity) {
      throw new NotFoundException(`Custom report with ID ${id} not found`);
    }
    return entity;
  }

  async update(
    companyId: string,
    id: string,
    data: Partial<SupportCustomReport>,
  ): Promise<SupportCustomReport> {
    const entity = await this.findOne(companyId, id);
    Object.assign(entity, data);
    return this.repo.save(entity);
  }

  async delete(companyId: string, id: string): Promise<void> {
    const entity = await this.findOne(companyId, id);
    await this.repo.remove(entity);
  }
}
