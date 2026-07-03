import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SkillAssessment } from '../entities/skill-assessment.entity';

@Injectable()
export class SkillAssessmentService {
  constructor(
    @InjectRepository(SkillAssessment)
    private readonly repo: Repository<SkillAssessment>,
  ) {}

  async findAll(companyId: string, status?: string): Promise<SkillAssessment[]> {
    const where: Record<string, any> = { companyId };
    if (status) where.status = status;
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<SkillAssessment> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`SkillAssessment ${id} not found`);
    return entity;
  }

  async create(data: Partial<SkillAssessment> & { companyId: string }): Promise<SkillAssessment> {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: string, data: Partial<SkillAssessment>): Promise<SkillAssessment> {
    const entity = await this.findOne(id);
    Object.assign(entity, data);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
