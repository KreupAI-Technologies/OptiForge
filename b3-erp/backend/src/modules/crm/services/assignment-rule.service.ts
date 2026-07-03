import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssignmentRule } from '../entities/assignment-rule.entity';

@Injectable()
export class AssignmentRuleService {
  constructor(
    @InjectRepository(AssignmentRule)
    private readonly repo: Repository<AssignmentRule>,
  ) {}

  async findAll(companyId?: string): Promise<AssignmentRule[]> {
    const where = companyId ? { companyId } : {};
    return this.repo.find({ where, order: { priority: 'ASC' } });
  }

  async findOne(id: string): Promise<AssignmentRule> {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) {
      throw new NotFoundException(`Assignment rule with ID ${id} not found`);
    }
    return row;
  }

  async create(data: Partial<AssignmentRule>): Promise<AssignmentRule> {
    return this.repo.save(this.repo.create(data));
  }

  async update(
    id: string,
    data: Partial<AssignmentRule>,
  ): Promise<AssignmentRule> {
    const row = await this.findOne(id);
    Object.assign(row, data);
    return this.repo.save(row);
  }

  async remove(id: string): Promise<void> {
    const row = await this.findOne(id);
    await this.repo.remove(row);
  }
}
