import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PolicyViolation } from '../entities/policy-violation.entity';

@Injectable()
export class PolicyViolationService {
  constructor(
    @InjectRepository(PolicyViolation)
    private readonly repo: Repository<PolicyViolation>,
  ) {}

  async findAll(companyId: string): Promise<PolicyViolation[]> {
    return this.repo.find({ where: { companyId }, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<PolicyViolation> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`Policy violation ${id} not found`);
    return entity;
  }

  async create(
    data: Partial<PolicyViolation> & { companyId: string },
  ): Promise<PolicyViolation> {
    return this.repo.save(this.repo.create(data));
  }

  async update(
    id: string,
    data: Partial<PolicyViolation>,
  ): Promise<PolicyViolation> {
    const entity = await this.findOne(id);
    Object.assign(entity, data);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
