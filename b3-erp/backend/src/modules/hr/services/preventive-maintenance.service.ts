import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { PreventiveMaintenance } from '../entities/preventive-maintenance.entity';

@Injectable()
export class PreventiveMaintenanceService {
  constructor(
    @InjectRepository(PreventiveMaintenance)
    private readonly repo: Repository<PreventiveMaintenance>,
  ) {}

  async findAll(companyId: string, filter?: string): Promise<PreventiveMaintenance[]> {
    const where: FindOptionsWhere<PreventiveMaintenance> = { companyId } as FindOptionsWhere<PreventiveMaintenance>;
    if (filter) (where as Record<string, string>).assetCategory = filter;
    return this.repo.find({ where, order: { nextMaintenanceDate: 'DESC' } as any });
  }

  async findOne(id: string): Promise<PreventiveMaintenance> {
    const entity = await this.repo.findOne({ where: { id } as FindOptionsWhere<PreventiveMaintenance> });
    if (!entity) throw new NotFoundException(`Preventive maintenance ${id} not found`);
    return entity;
  }

  async create(data: Partial<PreventiveMaintenance> & { companyId: string }): Promise<PreventiveMaintenance> {
    return this.repo.save(this.repo.create(data as PreventiveMaintenance));
  }

  async update(id: string, data: Partial<PreventiveMaintenance>): Promise<PreventiveMaintenance> {
    const entity = await this.findOne(id);
    Object.assign(entity, data);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
