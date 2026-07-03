import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  DeliveryCoordination,
  DeliveryCoordinationStatus,
} from '../entities/delivery-coordination.entity';

@Injectable()
export class DeliveryCoordinationService {
  constructor(
    @InjectRepository(DeliveryCoordination)
    private readonly repo: Repository<DeliveryCoordination>,
  ) {}

  async create(data: Partial<DeliveryCoordination>): Promise<DeliveryCoordination> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async findAll(filters?: {
    status?: string;
    transportMethod?: string;
  }): Promise<DeliveryCoordination[]> {
    const query = this.repo.createQueryBuilder('coord');

    if (filters?.status) {
      query.andWhere('coord.status = :status', { status: filters.status });
    }
    if (filters?.transportMethod) {
      query.andWhere('coord.transportMethod = :tm', {
        tm: filters.transportMethod,
      });
    }

    query.orderBy('coord.createdAt', 'DESC');
    return query.getMany();
  }

  async findOne(id: string): Promise<DeliveryCoordination> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(
        `Delivery coordination with ID ${id} not found`,
      );
    }
    return entity;
  }

  async update(
    id: string,
    data: Partial<DeliveryCoordination>,
  ): Promise<DeliveryCoordination> {
    const entity = await this.findOne(id);
    Object.assign(entity, data);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
