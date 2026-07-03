import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkflowConfigTemplate } from '../entities/workflow-config-template.entity';

@Injectable()
export class WorkflowConfigTemplateService {
  constructor(
    @InjectRepository(WorkflowConfigTemplate)
    private readonly configTemplateRepository: Repository<WorkflowConfigTemplate>,
  ) {}

  async create(
    companyId: string,
    data: Partial<WorkflowConfigTemplate>,
  ): Promise<WorkflowConfigTemplate> {
    const template = this.configTemplateRepository.create({
      ...data,
      companyId,
    });
    return this.configTemplateRepository.save(template);
  }

  async findAll(
    companyId: string,
    filters?: { status?: string; category?: string },
  ): Promise<WorkflowConfigTemplate[]> {
    const query = this.configTemplateRepository
      .createQueryBuilder('template')
      .where('template.companyId = :companyId', { companyId })
      .orderBy('template.name', 'ASC');

    if (filters?.status) {
      query.andWhere('template.status = :status', { status: filters.status });
    }
    if (filters?.category) {
      query.andWhere('template.category = :category', {
        category: filters.category,
      });
    }

    return query.getMany();
  }

  async findOne(
    companyId: string,
    id: string,
  ): Promise<WorkflowConfigTemplate> {
    const template = await this.configTemplateRepository.findOne({
      where: { id, companyId },
    });
    if (!template) {
      throw new NotFoundException(
        `Workflow config template with ID ${id} not found`,
      );
    }
    return template;
  }

  async update(
    companyId: string,
    id: string,
    data: Partial<WorkflowConfigTemplate>,
  ): Promise<WorkflowConfigTemplate> {
    const template = await this.findOne(companyId, id);
    Object.assign(template, data);
    return this.configTemplateRepository.save(template);
  }

  async delete(companyId: string, id: string): Promise<void> {
    const template = await this.findOne(companyId, id);
    await this.configTemplateRepository.remove(template);
  }
}
