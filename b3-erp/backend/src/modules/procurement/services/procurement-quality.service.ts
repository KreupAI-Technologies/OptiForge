import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProcurementInspection } from '../entities/procurement-inspection.entity';
import { ProcurementInspectionTemplate } from '../entities/procurement-inspection-template.entity';
import { ProcurementNcr } from '../entities/procurement-ncr.entity';

const DEFAULT_COMPANY = 'company-001';

// Quality Assurance domain service backing the procurement QualityAssurance UI:
//  - inspections (queue) : list / create / record-results / reject
//  - templates           : list / create / update / mark-used
//  - NCRs                : list / create
@Injectable()
export class ProcurementQualityService {
  constructor(
    @InjectRepository(ProcurementInspection)
    private readonly inspectionRepo: Repository<ProcurementInspection>,
    @InjectRepository(ProcurementInspectionTemplate)
    private readonly templateRepo: Repository<ProcurementInspectionTemplate>,
    @InjectRepository(ProcurementNcr)
    private readonly ncrRepo: Repository<ProcurementNcr>,
  ) {}

  // ---- inspections ----
  async findInspections(
    companyId: string,
    filters?: { status?: string },
  ): Promise<ProcurementInspection[]> {
    const where: Record<string, any> = { companyId: companyId || DEFAULT_COMPANY };
    if (filters?.status) where.status = filters.status;
    return this.inspectionRepo.find({ where, order: { createdAt: 'DESC' } });
  }

  async createInspection(
    companyId: string,
    data: Partial<ProcurementInspection>,
  ): Promise<ProcurementInspection> {
    const entity = this.inspectionRepo.create({
      ...data,
      companyId: companyId || DEFAULT_COMPANY,
      status: data.status ?? 'pending',
    });
    return this.inspectionRepo.save(entity);
  }

  private async getInspection(
    companyId: string,
    id: string,
  ): Promise<ProcurementInspection> {
    const entity = await this.inspectionRepo.findOne({
      where: { id, companyId: companyId || DEFAULT_COMPANY },
    });
    if (!entity) {
      throw new NotFoundException(`Inspection with ID ${id} not found`);
    }
    return entity;
  }

  async recordResults(
    companyId: string,
    id: string,
    data: Partial<ProcurementInspection>,
  ): Promise<ProcurementInspection> {
    const entity = await this.getInspection(companyId, id);
    Object.assign(entity, {
      result: data.result ?? entity.result,
      defectsFound: data.defectsFound ?? entity.defectsFound,
      resultNotes: data.resultNotes ?? entity.resultNotes,
      inspector: data.inspector ?? entity.inspector,
      status: data.status ?? 'completed',
    });
    return this.inspectionRepo.save(entity);
  }

  async rejectInspection(
    companyId: string,
    id: string,
    data: Partial<ProcurementInspection>,
  ): Promise<ProcurementInspection> {
    const entity = await this.getInspection(companyId, id);
    Object.assign(entity, {
      status: 'rejected',
      result: 'fail',
      rejectionReason: data.rejectionReason ?? entity.rejectionReason,
    });
    return this.inspectionRepo.save(entity);
  }

  // ---- templates ----
  async findTemplates(
    companyId: string,
    filters?: { category?: string },
  ): Promise<ProcurementInspectionTemplate[]> {
    const where: Record<string, any> = { companyId: companyId || DEFAULT_COMPANY };
    if (filters?.category) where.category = filters.category;
    return this.templateRepo.find({ where, order: { createdAt: 'DESC' } });
  }

  async createTemplate(
    companyId: string,
    data: Partial<ProcurementInspectionTemplate>,
  ): Promise<ProcurementInspectionTemplate> {
    const entity = this.templateRepo.create({
      ...data,
      companyId: companyId || DEFAULT_COMPANY,
    });
    return this.templateRepo.save(entity);
  }

  private async getTemplate(
    companyId: string,
    id: string,
  ): Promise<ProcurementInspectionTemplate> {
    const entity = await this.templateRepo.findOne({
      where: { id, companyId: companyId || DEFAULT_COMPANY },
    });
    if (!entity) {
      throw new NotFoundException(`Inspection template with ID ${id} not found`);
    }
    return entity;
  }

  async updateTemplate(
    companyId: string,
    id: string,
    data: Partial<ProcurementInspectionTemplate>,
  ): Promise<ProcurementInspectionTemplate> {
    const entity = await this.getTemplate(companyId, id);
    Object.assign(entity, data);
    return this.templateRepo.save(entity);
  }

  // "Use template" bumps the usage counter and stamps lastUsed.
  async markTemplateUsed(
    companyId: string,
    id: string,
  ): Promise<ProcurementInspectionTemplate> {
    const entity = await this.getTemplate(companyId, id);
    entity.usage = (Number(entity.usage) || 0) + 1;
    entity.lastUsed = new Date();
    return this.templateRepo.save(entity);
  }

  // ---- NCRs ----
  async findNcrs(
    companyId: string,
    filters?: { status?: string },
  ): Promise<ProcurementNcr[]> {
    const where: Record<string, any> = { companyId: companyId || DEFAULT_COMPANY };
    if (filters?.status) where.status = filters.status;
    return this.ncrRepo.find({ where, order: { createdAt: 'DESC' } });
  }

  async createNcr(
    companyId: string,
    data: Partial<ProcurementNcr>,
  ): Promise<ProcurementNcr> {
    const ncrNumber =
      data.ncrNumber ??
      `NCR-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
    const entity = this.ncrRepo.create({
      ...data,
      ncrNumber,
      companyId: companyId || DEFAULT_COMPANY,
      status: data.status ?? 'open',
    });
    return this.ncrRepo.save(entity);
  }
}
