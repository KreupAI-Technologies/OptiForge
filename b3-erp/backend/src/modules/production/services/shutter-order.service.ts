import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShutterOrder } from '../entities/shutter-order.entity';

@Injectable()
export class ShutterOrderService {
  constructor(
    @InjectRepository(ShutterOrder)
    private readonly repo: Repository<ShutterOrder>,
  ) {}

  async create(createDto: Partial<ShutterOrder>): Promise<ShutterOrder> {
    const entity = this.repo.create(createDto);
    return this.repo.save(entity);
  }

  async findAll(filters?: { status?: string; shutterType?: string }): Promise<ShutterOrder[]> {
    const query = this.repo.createQueryBuilder('s');
    if (filters?.status) {
      query.andWhere('s.status = :status', { status: filters.status });
    }
    if (filters?.shutterType) {
      query.andWhere('s.shutterType = :shutterType', { shutterType: filters.shutterType });
    }
    query.orderBy('s.createdAt', 'DESC');
    return query.getMany();
  }

  async findOne(id: string): Promise<ShutterOrder> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`Shutter order with ID ${id} not found`);
    }
    return entity;
  }

  async update(id: string, updateDto: Partial<ShutterOrder>): Promise<ShutterOrder> {
    const entity = await this.findOne(id);
    Object.assign(entity, updateDto);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
