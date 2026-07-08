import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BomTemplate } from '../entities/bom-template.entity';

@Injectable()
export class BomTemplateService {
  constructor(
    @InjectRepository(BomTemplate)
    private readonly repo: Repository<BomTemplate>,
  ) {}

  async create(createDto: Partial<BomTemplate>): Promise<BomTemplate> {
    const entity = this.repo.create({
      ...createDto,
      componentCount: Array.isArray(createDto.components)
        ? createDto.components.length
        : createDto.componentCount ?? 0,
    });
    return this.repo.save(entity);
  }

  async findAll(filters?: { category?: string; status?: string }): Promise<BomTemplate[]> {
    const query = this.repo.createQueryBuilder('t');
    if (filters?.category) {
      query.andWhere('t.category = :category', { category: filters.category });
    }
    if (filters?.status) {
      query.andWhere('t.status = :status', { status: filters.status });
    }
    query.orderBy('t.createdAt', 'DESC');
    return query.getMany();
  }

  async findOne(id: string): Promise<BomTemplate> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`BOM template with ID ${id} not found`);
    }
    return entity;
  }

  async update(id: string, updateDto: Partial<BomTemplate>): Promise<BomTemplate> {
    const entity = await this.findOne(id);
    Object.assign(entity, updateDto);
    if (Array.isArray(updateDto.components)) {
      entity.componentCount = updateDto.components.length;
    }
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
