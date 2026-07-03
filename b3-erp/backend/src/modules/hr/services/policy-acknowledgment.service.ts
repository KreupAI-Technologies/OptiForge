import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PolicyAcknowledgment } from '../entities/policy-acknowledgment.entity';

@Injectable()
export class PolicyAcknowledgmentService {
  constructor(
    @InjectRepository(PolicyAcknowledgment)
    private readonly repo: Repository<PolicyAcknowledgment>,
  ) {}

  async findAll(companyId: string, status?: string): Promise<PolicyAcknowledgment[]> {
    const where: Record<string, any> = { companyId };
    if (status) where.status = status;
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<PolicyAcknowledgment> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`PolicyAcknowledgment ${id} not found`);
    return entity;
  }

  async create(
    data: Partial<PolicyAcknowledgment> & { companyId: string },
  ): Promise<PolicyAcknowledgment> {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: string, data: Partial<PolicyAcknowledgment>): Promise<PolicyAcknowledgment> {
    const entity = await this.findOne(id);
    Object.assign(entity, data);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
