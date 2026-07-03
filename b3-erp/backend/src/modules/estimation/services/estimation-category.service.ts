import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EstimationCategory } from '../entities/estimation-category.entity';

@Injectable()
export class EstimationCategoryService {
  constructor(
    @InjectRepository(EstimationCategory)
    private categoryRepository: Repository<EstimationCategory>,
  ) {}

  async create(
    companyId: string,
    data: Partial<EstimationCategory>,
  ): Promise<EstimationCategory> {
    const entity = this.categoryRepository.create({ ...data, companyId });
    return this.categoryRepository.save(entity);
  }

  async findAll(
    companyId: string,
    filters?: { type?: string; status?: string },
  ): Promise<EstimationCategory[]> {
    const query = this.categoryRepository
      .createQueryBuilder('category')
      .where('category.companyId = :companyId', { companyId })
      .orderBy('category.sortOrder', 'ASC')
      .addOrderBy('category.name', 'ASC');

    if (filters?.type) {
      query.andWhere('category.type = :type', { type: filters.type });
    }
    if (filters?.status) {
      query.andWhere('category.status = :status', { status: filters.status });
    }
    return query.getMany();
  }

  async findOne(companyId: string, id: string): Promise<EstimationCategory> {
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
    data: Partial<EstimationCategory>,
  ): Promise<EstimationCategory> {
    const entity = await this.findOne(companyId, id);
    Object.assign(entity, data);
    return this.categoryRepository.save(entity);
  }

  async delete(companyId: string, id: string): Promise<void> {
    const entity = await this.findOne(companyId, id);
    await this.categoryRepository.remove(entity);
  }
}
