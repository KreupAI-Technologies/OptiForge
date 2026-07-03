import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectIssueEntity } from '../entities/project-issue.entity';

@Injectable()
export class ProjectIssuesService {
  constructor(
    @InjectRepository(ProjectIssueEntity)
    private readonly repo: Repository<ProjectIssueEntity>,
  ) {}

  async findAll(companyId = 'default', status?: string): Promise<ProjectIssueEntity[]> {
    const where: any = { companyId };
    if (status) where.status = status;
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<ProjectIssueEntity> {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException(`Issue ${id} not found`);
    return row;
  }

  async create(data: Partial<ProjectIssueEntity>): Promise<ProjectIssueEntity> {
    const row = this.repo.create({ companyId: 'default', ...data });
    return this.repo.save(row);
  }

  async update(id: string, data: Partial<ProjectIssueEntity>): Promise<ProjectIssueEntity> {
    const row = await this.findOne(id);
    const { id: _id, createdAt, updatedAt, ...rest } = data as any;
    Object.assign(row, rest);
    return this.repo.save(row);
  }

  async remove(id: string): Promise<void> {
    const result = await this.repo.delete(id);
    if (result.affected === 0) throw new NotFoundException(`Issue ${id} not found`);
  }
}
