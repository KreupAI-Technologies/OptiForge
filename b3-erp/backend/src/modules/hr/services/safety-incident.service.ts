import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SafetyIncident } from '../entities/safety-incident.entity';

@Injectable()
export class SafetyIncidentService {
  constructor(
    @InjectRepository(SafetyIncident)
    private readonly repo: Repository<SafetyIncident>,
  ) {}

  async findAll(companyId: string, status?: string): Promise<SafetyIncident[]> {
    const where: Record<string, any> = { companyId };
    if (status) where.status = status;
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<SafetyIncident> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`Safety incident ${id} not found`);
    return entity;
  }

  async create(
    data: Partial<SafetyIncident> & { companyId: string },
  ): Promise<SafetyIncident> {
    return this.repo.save(this.repo.create(data));
  }

  async update(
    id: string,
    data: Partial<SafetyIncident>,
  ): Promise<SafetyIncident> {
    const entity = await this.findOne(id);
    Object.assign(entity, data);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
