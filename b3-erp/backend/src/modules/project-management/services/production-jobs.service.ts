import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PmProductionJobEntity } from '../entities/pm-production-job.entity';

@Injectable()
export class ProductionJobsService {
  constructor(
    @InjectRepository(PmProductionJobEntity)
    private readonly repo: Repository<PmProductionJobEntity>,
  ) {}

  async listJobs(
    projectId?: string,
    operationType?: string,
  ): Promise<PmProductionJobEntity[]> {
    const where: Record<string, any> = {};
    if (projectId) where.projectId = projectId;
    if (operationType) where.operationType = operationType;

    const rows = await this.repo.find({
      where,
      order: { jobCode: 'ASC', createdAt: 'ASC' },
    });

    // DEMO FALLBACK: when the requested project has no jobs for this operation,
    // fall back to the DEMO-PROJECT seed rows so the shop-floor pages still
    // render the reference dataset.
    if (rows.length === 0 && operationType) {
      return this.repo.find({
        where: { projectId: 'DEMO-PROJECT', operationType },
        order: { jobCode: 'ASC', createdAt: 'ASC' },
      });
    }

    return rows;
  }

  async create(
    data: Partial<PmProductionJobEntity>,
  ): Promise<PmProductionJobEntity> {
    const entity = this.repo.create({
      companyId: data.companyId || 'default',
      ...data,
    });
    return this.repo.save(entity);
  }

  async updateStatus(
    id: string,
    dto: Partial<PmProductionJobEntity>,
  ): Promise<PmProductionJobEntity> {
    await this.repo.update(id, dto);
    return (await this.repo.findOne({ where: { id } }))!;
  }
}
