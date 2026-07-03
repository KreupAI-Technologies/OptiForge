import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TravelAdvance } from '../entities/travel-advance.entity';

@Injectable()
export class TravelAdvanceService {
  constructor(
    @InjectRepository(TravelAdvance)
    private readonly repo: Repository<TravelAdvance>,
  ) {}

  async findAll(companyId: string, status?: string): Promise<TravelAdvance[]> {
    const where: Record<string, any> = { companyId };
    if (status) where.status = status;
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<TravelAdvance> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`Travel advance ${id} not found`);
    return entity;
  }

  async create(
    data: Partial<TravelAdvance> & { companyId: string },
  ): Promise<TravelAdvance> {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: string, data: Partial<TravelAdvance>): Promise<TravelAdvance> {
    const entity = await this.findOne(id);
    Object.assign(entity, data);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
