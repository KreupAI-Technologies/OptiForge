import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FloorActivity } from '../entities/floor-activity.entity';

@Injectable()
export class FloorActivityService {
  constructor(
    @InjectRepository(FloorActivity)
    private readonly repo: Repository<FloorActivity>,
  ) {}

  async create(createDto: Partial<FloorActivity>): Promise<FloorActivity> {
    const entity = this.repo.create(createDto);
    return this.repo.save(entity);
  }

  async findAll(filters?: { status?: string; shift?: string }): Promise<FloorActivity[]> {
    const query = this.repo.createQueryBuilder('f');
    if (filters?.status) {
      query.andWhere('f.status = :status', { status: filters.status });
    }
    if (filters?.shift) {
      query.andWhere('f.shift = :shift', { shift: filters.shift });
    }
    query.orderBy('f.createdAt', 'DESC');
    return query.getMany();
  }

  async findOne(id: string): Promise<FloorActivity> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`Floor activity with ID ${id} not found`);
    }
    return entity;
  }

  async update(id: string, updateDto: Partial<FloorActivity>): Promise<FloorActivity> {
    const entity = await this.findOne(id);
    Object.assign(entity, updateDto);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
