import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProcurementCategory } from '../entities/procurement-category.entity';

@Injectable()
export class ProcurementCategoryService {
  constructor(
    @InjectRepository(ProcurementCategory)
    private categoryRepository: Repository<ProcurementCategory>,
  ) {}

  async create(
    companyId: string,
    data: Partial<ProcurementCategory>,
  ): Promise<ProcurementCategory> {
    const entity = this.categoryRepository.create({ ...data, companyId });
    return this.categoryRepository.save(entity);
  }

  async findAll(
    companyId: string,
    filters?: { priority?: string; status?: string },
  ): Promise<ProcurementCategory[]> {
    const query = this.categoryRepository
      .createQueryBuilder('category')
      .where('category.companyId = :companyId', { companyId })
      .orderBy('category.name', 'ASC');

    if (filters?.priority) {
      query.andWhere('category.priority = :priority', {
        priority: filters.priority,
      });
    }
    if (filters?.status) {
      query.andWhere('category.status = :status', { status: filters.status });
    }
    return query.getMany();
  }

  async findOne(companyId: string, id: string): Promise<ProcurementCategory> {
    const entity = await this.categoryRepository.findOne({
      where: { id, companyId },
    });
    if (!entity) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return entity;
  }

  async update(
    companyId: string,
    id: string,
    data: Partial<ProcurementCategory>,
  ): Promise<ProcurementCategory> {
    const entity = await this.findOne(companyId, id);
    Object.assign(entity, data);
    return this.categoryRepository.save(entity);
  }

  async delete(companyId: string, id: string): Promise<void> {
    const entity = await this.findOne(companyId, id);
    await this.categoryRepository.remove(entity);
  }
}
