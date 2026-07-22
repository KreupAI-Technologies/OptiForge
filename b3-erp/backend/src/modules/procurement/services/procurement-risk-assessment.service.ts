import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProcurementRiskAssessment } from '../entities/procurement-risk-assessment.entity';

@Injectable()
export class ProcurementRiskAssessmentService {
  constructor(
    @InjectRepository(ProcurementRiskAssessment)
    private readonly repository: Repository<ProcurementRiskAssessment>,
  ) {}

  async create(
    companyId: string,
    data: Partial<ProcurementRiskAssessment>,
  ): Promise<ProcurementRiskAssessment> {
    const entity = this.repository.create({ ...data, companyId });
    return this.repository.save(entity);
  }

  async findAll(
    companyId: string,
    filters?: { category?: string; riskLevel?: string; status?: string; supplierId?: string },
  ): Promise<ProcurementRiskAssessment[]> {
    const query = this.repository
      .createQueryBuilder('risk')
      .where('risk.companyId = :companyId', { companyId })
      .orderBy('risk.createdAt', 'DESC');

    if (filters?.category) {
      query.andWhere('risk.category = :category', { category: filters.category });
    }
    if (filters?.riskLevel) {
      query.andWhere('risk.riskLevel = :riskLevel', {
        riskLevel: filters.riskLevel,
      });
    }
    if (filters?.status) {
      query.andWhere('risk.status = :status', { status: filters.status });
    }
    if (filters?.supplierId) {
      query.andWhere('risk.supplierId = :supplierId', {
        supplierId: filters.supplierId,
      });
    }
    return query.getMany();
  }

  async findOne(
    companyId: string,
    id: string,
  ): Promise<ProcurementRiskAssessment> {
    const entity = await this.repository.findOne({ where: { id, companyId } });
    if (!entity) {
      throw new NotFoundException(`Risk Assessment with ID ${id} not found`);
    }
    return entity;
  }

  async update(
    companyId: string,
    id: string,
    data: Partial<ProcurementRiskAssessment>,
  ): Promise<ProcurementRiskAssessment> {
    const entity = await this.findOne(companyId, id);
    Object.assign(entity, data);
    return this.repository.save(entity);
  }

  async delete(companyId: string, id: string): Promise<void> {
    const entity = await this.findOne(companyId, id);
    await this.repository.remove(entity);
  }
}
