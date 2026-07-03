import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScheduleLine } from '../entities/schedule-line.entity';

@Injectable()
export class ScheduleLineService {
  constructor(
    @InjectRepository(ScheduleLine)
    private readonly repo: Repository<ScheduleLine>,
  ) {}

  async create(createDto: Partial<ScheduleLine>): Promise<ScheduleLine> {
    const entity = this.repo.create(createDto);
    return this.repo.save(entity);
  }

  async findAll(filters?: { status?: string; workCenter?: string }): Promise<ScheduleLine[]> {
    const query = this.repo.createQueryBuilder('s');
    if (filters?.status) {
      query.andWhere('s.status = :status', { status: filters.status });
    }
    if (filters?.workCenter) {
      query.andWhere('s.workCenter = :workCenter', { workCenter: filters.workCenter });
    }
    query.orderBy('s.plannedStart', 'ASC');
    return query.getMany();
  }

  async findOne(id: string): Promise<ScheduleLine> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`Schedule line with ID ${id} not found`);
    }
    return entity;
  }

  async update(id: string, updateDto: Partial<ScheduleLine>): Promise<ScheduleLine> {
    const entity = await this.findOne(id);
    Object.assign(entity, updateDto);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
