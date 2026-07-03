import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PipelineStageConfig } from '../entities/pipeline-stage-config.entity';

@Injectable()
export class PipelineStageConfigService {
  constructor(
    @InjectRepository(PipelineStageConfig)
    private readonly repo: Repository<PipelineStageConfig>,
  ) {}

  async findAll(companyId?: string, pipelineType?: string): Promise<PipelineStageConfig[]> {
    const where: Record<string, any> = {};
    if (companyId) where.companyId = companyId;
    if (pipelineType) where.pipelineType = pipelineType;
    return this.repo.find({ where, order: { orderIndex: 'ASC', createdAt: 'ASC' } });
  }

  async findOne(id: string): Promise<PipelineStageConfig> {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException(`Pipeline stage ${id} not found`);
    return row;
  }

  async create(data: Partial<PipelineStageConfig>): Promise<PipelineStageConfig> {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: string, data: Partial<PipelineStageConfig>): Promise<PipelineStageConfig> {
    const row = await this.findOne(id);
    Object.assign(row, data);
    return this.repo.save(row);
  }

  async remove(id: string): Promise<void> {
    const row = await this.findOne(id);
    await this.repo.remove(row);
  }
}
