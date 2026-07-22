import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProcurementReportTemplate } from '../entities/procurement-report-template.entity';

@Injectable()
export class ProcurementReportTemplateService {
  constructor(
    @InjectRepository(ProcurementReportTemplate)
    private readonly repository: Repository<ProcurementReportTemplate>,
  ) {}

  async create(
    companyId: string,
    data: Partial<ProcurementReportTemplate>,
  ): Promise<ProcurementReportTemplate> {
    const entity = this.repository.create({ ...data, companyId });
    return this.repository.save(entity);
  }

  async findAll(
    companyId: string,
    filters?: { reportType?: string },
  ): Promise<ProcurementReportTemplate[]> {
    const query = this.repository
      .createQueryBuilder('template')
      .where('template.companyId = :companyId', { companyId })
      .orderBy('template.createdAt', 'DESC');

    if (filters?.reportType) {
      query.andWhere('template.reportType = :reportType', {
        reportType: filters.reportType,
      });
    }
    return query.getMany();
  }

  async findOne(
    companyId: string,
    id: string,
  ): Promise<ProcurementReportTemplate> {
    const entity = await this.repository.findOne({ where: { id, companyId } });
    if (!entity) {
      throw new NotFoundException(`Report Template with ID ${id} not found`);
    }
    return entity;
  }

  async update(
    companyId: string,
    id: string,
    data: Partial<ProcurementReportTemplate>,
  ): Promise<ProcurementReportTemplate> {
    const entity = await this.findOne(companyId, id);
    Object.assign(entity, data);
    return this.repository.save(entity);
  }

  async delete(companyId: string, id: string): Promise<void> {
    const entity = await this.findOne(companyId, id);
    await this.repository.remove(entity);
  }
}
