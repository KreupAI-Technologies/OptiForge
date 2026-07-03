import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MaterialCostRate } from '../entities/material-cost-rate.entity';

@Injectable()
export class MaterialCostRateService {
  constructor(
    @InjectRepository(MaterialCostRate)
    private materialCostRateRepository: Repository<MaterialCostRate>,
  ) {}

  async create(
    companyId: string,
    data: Partial<MaterialCostRate>,
  ): Promise<MaterialCostRate> {
    const entity = this.materialCostRateRepository.create({
      ...data,
      companyId,
    });
    return this.materialCostRateRepository.save(entity);
  }

  async findAll(
    companyId: string,
    filters?: { category?: string; status?: string },
  ): Promise<MaterialCostRate[]> {
    const query = this.materialCostRateRepository
      .createQueryBuilder('rate')
      .where('rate.companyId = :companyId', { companyId })
      .orderBy('rate.category', 'ASC')
      .addOrderBy('rate.materialName', 'ASC');

    if (filters?.category) {
      query.andWhere('rate.category = :category', {
        category: filters.category,
      });
    }
    if (filters?.status) {
      query.andWhere('rate.status = :status', { status: filters.status });
    }
    return query.getMany();
  }

  async findOne(companyId: string, id: string): Promise<MaterialCostRate> {
    const entity = await this.materialCostRateRepository.findOne({
      where: { id, companyId },
    });
    if (!entity) {
      throw new NotFoundException(`Material Cost Rate with ID ${id} not found`);
    }
    return entity;
  }

  async update(
    companyId: string,
    id: string,
    data: Partial<MaterialCostRate>,
  ): Promise<MaterialCostRate> {
    const entity = await this.findOne(companyId, id);
    Object.assign(entity, data);
    return this.materialCostRateRepository.save(entity);
  }

  async delete(companyId: string, id: string): Promise<void> {
    const entity = await this.findOne(companyId, id);
    await this.materialCostRateRepository.remove(entity);
  }
}
