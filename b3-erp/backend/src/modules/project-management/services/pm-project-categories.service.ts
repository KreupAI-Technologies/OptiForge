import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PmProjectCategoryEntity } from '../entities/pm-project-category.entity';

@Injectable()
export class PmProjectCategoriesService {
  constructor(
    @InjectRepository(PmProjectCategoryEntity)
    private readonly repo: Repository<PmProjectCategoryEntity>,
  ) {}

  async findAll(companyId = 'default'): Promise<PmProjectCategoryEntity[]> {
    return this.repo.find({ where: { companyId }, order: { sortOrder: 'ASC', createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<PmProjectCategoryEntity> {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException(`Project category ${id} not found`);
    return row;
  }

  async create(data: Partial<PmProjectCategoryEntity>): Promise<PmProjectCategoryEntity> {
    const row = this.repo.create({ companyId: 'default', ...data });
    return this.repo.save(row);
  }

  async update(id: string, data: Partial<PmProjectCategoryEntity>): Promise<PmProjectCategoryEntity> {
    const row = await this.findOne(id);
    const { id: _id, createdAt, updatedAt, ...rest } = data as any;
    Object.assign(row, rest);
    return this.repo.save(row);
  }

  async remove(id: string): Promise<void> {
    const result = await this.repo.delete(id);
    if (result.affected === 0) throw new NotFoundException(`Project category ${id} not found`);
  }
}
