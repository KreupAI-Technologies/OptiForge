import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MaintenanceRequest } from '../entities/maintenance-request.entity';

@Injectable()
export class MaintenanceRequestService {
  constructor(
    @InjectRepository(MaintenanceRequest)
    private readonly repo: Repository<MaintenanceRequest>,
  ) {}

  async create(createDto: Partial<MaintenanceRequest>): Promise<MaintenanceRequest> {
    const entity = this.repo.create(createDto);
    return this.repo.save(entity);
  }

  async findAll(filters?: { status?: string; priority?: string }): Promise<MaintenanceRequest[]> {
    const query = this.repo.createQueryBuilder('m');
    if (filters?.status) {
      query.andWhere('m.status = :status', { status: filters.status });
    }
    if (filters?.priority) {
      query.andWhere('m.priority = :priority', { priority: filters.priority });
    }
    query.orderBy('m.createdAt', 'DESC');
    return query.getMany();
  }

  async findOne(id: string): Promise<MaintenanceRequest> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`Maintenance request with ID ${id} not found`);
    }
    return entity;
  }

  async update(id: string, updateDto: Partial<MaintenanceRequest>): Promise<MaintenanceRequest> {
    const entity = await this.findOne(id);
    Object.assign(entity, updateDto);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
