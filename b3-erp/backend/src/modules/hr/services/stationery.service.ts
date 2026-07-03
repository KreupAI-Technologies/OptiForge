import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Stationery } from '../entities/stationery.entity';

@Injectable()
export class StationeryService {
  constructor(
    @InjectRepository(Stationery)
    private readonly repo: Repository<Stationery>,
  ) {}

  async findAll(companyId: string, filter?: string): Promise<Stationery[]> {
    const where: FindOptionsWhere<Stationery> = { companyId } as FindOptionsWhere<Stationery>;
    if (filter) (where as Record<string, string>).category = filter;
    return this.repo.find({ where, order: { itemName: 'DESC' } as any });
  }

  async findOne(id: string): Promise<Stationery> {
    const entity = await this.repo.findOne({ where: { id } as FindOptionsWhere<Stationery> });
    if (!entity) throw new NotFoundException(`Stationery item ${id} not found`);
    return entity;
  }

  async create(data: Partial<Stationery> & { companyId: string }): Promise<Stationery> {
    return this.repo.save(this.repo.create(data as Stationery));
  }

  async update(id: string, data: Partial<Stationery>): Promise<Stationery> {
    const entity = await this.findOne(id);
    Object.assign(entity, data);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
