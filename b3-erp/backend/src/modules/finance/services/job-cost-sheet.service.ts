import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  JobCostSheet,
  JobCostSheetStatus,
} from '../entities/job-cost-sheet.entity';

export interface CreateJobCostSheetDto {
  costSheetNumber: string;
  jobNumber: string;
  jobName: string;
  projectType?: string;
  customer?: string;
  costingDate?: string;
  status?: JobCostSheetStatus;
  materialCost?: number;
  laborCost?: number;
  overheadCost?: number;
  totalEstimatedCost?: number;
  totalActualCost?: number;
  profitMargin?: number;
  costEngineer?: string;
  notes?: string;
  createdBy?: string;
}

export type UpdateJobCostSheetDto = Partial<CreateJobCostSheetDto>;

@Injectable()
export class JobCostSheetService {
  constructor(
    @InjectRepository(JobCostSheet)
    private readonly repo: Repository<JobCostSheet>,
  ) {}

  private decorate(sheet: JobCostSheet) {
    const estimated = Number(sheet.totalEstimatedCost) || 0;
    const actual = Number(sheet.totalActualCost) || 0;
    const variance = estimated - actual;
    const variancePercent = estimated !== 0 ? (variance / estimated) * 100 : 0;
    return {
      ...sheet,
      materialCost: Number(sheet.materialCost) || 0,
      laborCost: Number(sheet.laborCost) || 0,
      overheadCost: Number(sheet.overheadCost) || 0,
      totalEstimatedCost: estimated,
      totalActualCost: actual,
      profitMargin: Number(sheet.profitMargin) || 0,
      variance,
      variancePercent: Number(variancePercent.toFixed(2)),
    };
  }

  async findAll(filters?: {
    status?: string;
    projectType?: string;
    search?: string;
  }): Promise<any[]> {
    const qb = this.repo.createQueryBuilder('cs');

    if (filters?.status && filters.status !== 'All') {
      qb.andWhere('cs.status = :status', { status: filters.status });
    }
    if (filters?.projectType && filters.projectType !== 'All') {
      qb.andWhere('cs.projectType = :projectType', {
        projectType: filters.projectType,
      });
    }
    if (filters?.search) {
      qb.andWhere(
        '(cs.jobName ILIKE :s OR cs.costSheetNumber ILIKE :s OR cs.customer ILIKE :s)',
        { s: `%${filters.search}%` },
      );
    }

    qb.orderBy('cs.costingDate', 'DESC');
    const rows = await qb.getMany();
    return rows.map((r) => this.decorate(r));
  }

  async findOne(id: string): Promise<any> {
    const sheet = await this.repo.findOne({ where: { id } });
    if (!sheet) {
      throw new NotFoundException(`Job cost sheet ${id} not found`);
    }
    return this.decorate(sheet);
  }

  async create(dto: CreateJobCostSheetDto): Promise<any> {
    const entity = this.repo.create({
      ...dto,
      costingDate: dto.costingDate ? new Date(dto.costingDate) : new Date(),
      status: dto.status ?? JobCostSheetStatus.DRAFT,
    });
    const saved = await this.repo.save(entity);
    return this.decorate(saved);
  }

  async update(id: string, dto: UpdateJobCostSheetDto): Promise<any> {
    const sheet = await this.repo.findOne({ where: { id } });
    if (!sheet) {
      throw new NotFoundException(`Job cost sheet ${id} not found`);
    }
    Object.assign(sheet, {
      ...dto,
      costingDate: dto.costingDate ? new Date(dto.costingDate) : sheet.costingDate,
    });
    const saved = await this.repo.save(sheet);
    return this.decorate(saved);
  }

  async remove(id: string): Promise<void> {
    const result = await this.repo.delete(id);
    if (!result.affected) {
      throw new NotFoundException(`Job cost sheet ${id} not found`);
    }
  }
}
