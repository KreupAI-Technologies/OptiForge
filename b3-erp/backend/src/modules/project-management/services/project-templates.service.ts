import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectTemplateEntity } from '../entities/project-template.entity';

@Injectable()
export class ProjectTemplatesService {
  constructor(
    @InjectRepository(ProjectTemplateEntity)
    private readonly templateRepository: Repository<ProjectTemplateEntity>,
  ) {}

  async findAll(companyId = 'default'): Promise<ProjectTemplateEntity[]> {
    return this.templateRepository.find({
      where: { companyId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<ProjectTemplateEntity> {
    const template = await this.templateRepository.findOne({ where: { id } });
    if (!template) {
      throw new NotFoundException(`Project template ${id} not found`);
    }
    return template;
  }

  async create(data: Partial<ProjectTemplateEntity>): Promise<ProjectTemplateEntity> {
    const template = this.templateRepository.create({
      companyId: 'default',
      ...data,
    });
    return this.templateRepository.save(template);
  }

  async update(id: string, data: Partial<ProjectTemplateEntity>): Promise<ProjectTemplateEntity> {
    const template = await this.findOne(id);
    const { id: _id, createdAt, updatedAt, ...rest } = data as any;
    Object.assign(template, rest);
    return this.templateRepository.save(template);
  }

  async remove(id: string): Promise<void> {
    const result = await this.templateRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Project template ${id} not found`);
    }
  }
}
