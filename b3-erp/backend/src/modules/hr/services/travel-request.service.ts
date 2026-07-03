import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TravelRequest } from '../entities/travel-request.entity';

@Injectable()
export class TravelRequestService {
  constructor(
    @InjectRepository(TravelRequest)
    private readonly repo: Repository<TravelRequest>,
  ) {}

  async findAll(companyId: string, status?: string): Promise<TravelRequest[]> {
    const where: Record<string, any> = { companyId };
    if (status) where.status = status;
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<TravelRequest> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`Travel request ${id} not found`);
    return entity;
  }

  async create(
    data: Partial<TravelRequest> & { companyId: string },
  ): Promise<TravelRequest> {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: string, data: Partial<TravelRequest>): Promise<TravelRequest> {
    const entity = await this.findOne(id);
    Object.assign(entity, data);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
