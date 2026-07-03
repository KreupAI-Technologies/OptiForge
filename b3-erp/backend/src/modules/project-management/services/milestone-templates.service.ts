import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MilestoneTemplateEntity } from '../entities/milestone-template.entity';

@Injectable()
export class MilestoneTemplatesService {
  constructor(
    @InjectRepository(MilestoneTemplateEntity)
    private readonly templateRepository: Repository<MilestoneTemplateEntity>,
  ) {}

  async findAll(companyId = 'default'): Promise<MilestoneTemplateEntity[]> {
    return this.templateRepository.find({
      where: { companyId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<MilestoneTemplateEntity> {
    const template = await this.templateRepository.findOne({ where: { id } });
    if (!template) {
      throw new NotFoundException(`Milestone template ${id} not found`);
    }
    return template;
  }

  async create(data: Partial<MilestoneTemplateEntity>): Promise<MilestoneTemplateEntity> {
    const milestones = Array.isArray(data.milestones) ? data.milestones : [];
    const template = this.templateRepository.create({
      companyId: 'default',
      ...data,
      totalMilestones: data.totalMilestones ?? milestones.length,
    });
    return this.templateRepository.save(template);
  }

  async update(id: string, data: Partial<MilestoneTemplateEntity>): Promise<MilestoneTemplateEntity> {
    const template = await this.findOne(id);
    const { id: _id, createdAt, updatedAt, ...rest } = data as any;
    Object.assign(template, rest);
    if (Array.isArray(rest.milestones)) {
      template.totalMilestones = rest.totalMilestones ?? rest.milestones.length;
    }
    return this.templateRepository.save(template);
  }

  async remove(id: string): Promise<void> {
    const result = await this.templateRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Milestone template ${id} not found`);
    }
  }
}
