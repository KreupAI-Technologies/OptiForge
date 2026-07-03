import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SalesTeam } from '../entities/sales-team.entity';

@Injectable()
export class SalesTeamService {
  constructor(
    @InjectRepository(SalesTeam)
    private readonly repo: Repository<SalesTeam>,
  ) {}

  async findAll(companyId?: string): Promise<SalesTeam[]> {
    const where = companyId ? { companyId } : {};
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<SalesTeam> {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) {
      throw new NotFoundException(`Sales team with ID ${id} not found`);
    }
    return row;
  }

  async create(data: Partial<SalesTeam>): Promise<SalesTeam> {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: string, data: Partial<SalesTeam>): Promise<SalesTeam> {
    const row = await this.findOne(id);
    Object.assign(row, data);
    return this.repo.save(row);
  }

  async remove(id: string): Promise<void> {
    const row = await this.findOne(id);
    await this.repo.remove(row);
  }
}
