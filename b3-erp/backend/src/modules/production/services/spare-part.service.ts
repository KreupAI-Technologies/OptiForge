import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SparePart } from '../entities/spare-part.entity';

@Injectable()
export class SparePartService {
  constructor(
    @InjectRepository(SparePart)
    private readonly repo: Repository<SparePart>,
  ) {}

  async create(createDto: Partial<SparePart>): Promise<SparePart> {
    const entity = this.repo.create(createDto);
    return this.repo.save(entity);
  }

  async findAll(filters?: { status?: string; category?: string }): Promise<SparePart[]> {
    const query = this.repo.createQueryBuilder('s');
    if (filters?.status) {
      query.andWhere('s.status = :status', { status: filters.status });
    }
    if (filters?.category) {
      query.andWhere('s.category = :category', { category: filters.category });
    }
    query.orderBy('s.createdAt', 'DESC');
    return query.getMany();
  }

  async findOne(id: string): Promise<SparePart> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`Spare part with ID ${id} not found`);
    }
    return entity;
  }

  async update(id: string, updateDto: Partial<SparePart>): Promise<SparePart> {
    const entity = await this.findOne(id);
    Object.assign(entity, updateDto);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
