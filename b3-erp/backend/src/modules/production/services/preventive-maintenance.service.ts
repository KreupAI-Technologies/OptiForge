import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PreventiveMaintenance } from '../entities/preventive-maintenance.entity';

@Injectable()
export class PreventiveMaintenanceService {
  constructor(
    @InjectRepository(PreventiveMaintenance)
    private readonly repo: Repository<PreventiveMaintenance>,
  ) {}

  async create(createDto: Partial<PreventiveMaintenance>): Promise<PreventiveMaintenance> {
    const entity = this.repo.create(createDto);
    return this.repo.save(entity);
  }

  async findAll(filters?: { status?: string; frequency?: string }): Promise<PreventiveMaintenance[]> {
    const query = this.repo.createQueryBuilder('p');
    if (filters?.status) {
      query.andWhere('p.status = :status', { status: filters.status });
    }
    if (filters?.frequency) {
      query.andWhere('p.frequency = :frequency', { frequency: filters.frequency });
    }
    query.orderBy('p.createdAt', 'DESC');
    return query.getMany();
  }

  async findOne(id: string): Promise<PreventiveMaintenance> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`Preventive maintenance task with ID ${id} not found`);
    }
    return entity;
  }

  async update(id: string, updateDto: Partial<PreventiveMaintenance>): Promise<PreventiveMaintenance> {
    const entity = await this.findOne(id);
    Object.assign(entity, updateDto);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
