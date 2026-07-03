import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupportAssignmentRule } from '../entities/support-assignment-rule.entity';

@Injectable()
export class SupportAssignmentRuleService {
  constructor(
    @InjectRepository(SupportAssignmentRule)
    private readonly repo: Repository<SupportAssignmentRule>,
  ) {}

  findAll(companyId: string): Promise<SupportAssignmentRule[]> {
    return this.repo.find({
      where: { companyId },
      order: { priority: 'ASC', name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<SupportAssignmentRule> {
    const found = await this.repo.findOne({ where: { id } });
    if (!found) throw new NotFoundException(`Assignment rule ${id} not found`);
    return found;
  }

  create(
    data: Partial<SupportAssignmentRule> & { companyId: string },
  ): Promise<SupportAssignmentRule> {
    return this.repo.save(this.repo.create(data));
  }

  async update(
    id: string,
    data: Partial<SupportAssignmentRule>,
  ): Promise<SupportAssignmentRule> {
    const found = await this.findOne(id);
    Object.assign(found, data);
    return this.repo.save(found);
  }

  async remove(id: string): Promise<void> {
    const found = await this.findOne(id);
    await this.repo.remove(found);
  }
}
