import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MachineTimeline } from '../entities/machine-timeline.entity';

@Injectable()
export class MachineTimelineService {
  constructor(
    @InjectRepository(MachineTimeline)
    private readonly repo: Repository<MachineTimeline>,
  ) {}

  async create(createDto: Partial<MachineTimeline>): Promise<MachineTimeline> {
    const entity = this.repo.create(createDto);
    return this.repo.save(entity);
  }

  async findAll(filters?: { status?: string }): Promise<MachineTimeline[]> {
    const query = this.repo.createQueryBuilder('m');
    if (filters?.status) {
      query.andWhere('m.status = :status', { status: filters.status });
    }
    query.orderBy('m.machineCode', 'ASC');
    return query.getMany();
  }

  async findOne(id: string): Promise<MachineTimeline> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`Machine timeline with ID ${id} not found`);
    }
    return entity;
  }

  async update(id: string, updateDto: Partial<MachineTimeline>): Promise<MachineTimeline> {
    const entity = await this.findOne(id);
    Object.assign(entity, updateDto);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
