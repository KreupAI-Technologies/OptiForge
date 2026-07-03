import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HrTeam } from '../entities/hr-team.entity';

@Injectable()
export class HrTeamService {
  constructor(
    @InjectRepository(HrTeam)
    private readonly repo: Repository<HrTeam>,
  ) {}

  async findAll(companyId: string, status?: string): Promise<HrTeam[]> {
    const where: Record<string, any> = { companyId };
    if (status) where.status = status;
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<HrTeam> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`HrTeam ${id} not found`);
    return entity;
  }

  async create(data: Partial<HrTeam> & { companyId: string }): Promise<HrTeam> {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: string, data: Partial<HrTeam>): Promise<HrTeam> {
    const entity = await this.findOne(id);
    Object.assign(entity, data);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
