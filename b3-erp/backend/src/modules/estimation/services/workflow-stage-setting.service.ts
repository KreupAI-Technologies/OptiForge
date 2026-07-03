import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkflowStageSetting } from '../entities/workflow-stage-setting.entity';

@Injectable()
export class WorkflowStageSettingService {
  constructor(
    @InjectRepository(WorkflowStageSetting)
    private workflowStageRepository: Repository<WorkflowStageSetting>,
  ) {}

  async create(
    companyId: string,
    data: Partial<WorkflowStageSetting>,
  ): Promise<WorkflowStageSetting> {
    const stage = this.workflowStageRepository.create({
      ...data,
      companyId,
    });
    return this.workflowStageRepository.save(stage);
  }

  async findAll(
    companyId: string,
    filters?: { status?: string },
  ): Promise<WorkflowStageSetting[]> {
    const query = this.workflowStageRepository
      .createQueryBuilder('stage')
      .where('stage.companyId = :companyId', { companyId })
      .orderBy('stage.stageOrder', 'ASC');

    if (filters?.status) {
      query.andWhere('stage.status = :status', { status: filters.status });
    }

    return query.getMany();
  }

  async findOne(companyId: string, id: string): Promise<WorkflowStageSetting> {
    const stage = await this.workflowStageRepository.findOne({
      where: { id, companyId },
    });
    if (!stage) {
      throw new NotFoundException(`Workflow Stage with ID ${id} not found`);
    }
    return stage;
  }

  async update(
    companyId: string,
    id: string,
    data: Partial<WorkflowStageSetting>,
  ): Promise<WorkflowStageSetting> {
    const stage = await this.findOne(companyId, id);
    Object.assign(stage, data);
    return this.workflowStageRepository.save(stage);
  }

  async delete(companyId: string, id: string): Promise<void> {
    const stage = await this.findOne(companyId, id);
    await this.workflowStageRepository.remove(stage);
  }
}
