import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OverheadCost } from '../entities/overhead-cost.entity';

@Injectable()
export class OverheadCostService {
  constructor(
    @InjectRepository(OverheadCost)
    private overheadCostRepository: Repository<OverheadCost>,
  ) {}

  async create(
    companyId: string,
    data: Partial<OverheadCost>,
  ): Promise<OverheadCost> {
    const entity = this.overheadCostRepository.create({ ...data, companyId });
    return this.overheadCostRepository.save(entity);
  }

  async findAll(
    companyId: string,
    filters?: { category?: string; status?: string },
  ): Promise<OverheadCost[]> {
    const query = this.overheadCostRepository
      .createQueryBuilder('overhead')
      .where('overhead.companyId = :companyId', { companyId })
      .orderBy('overhead.category', 'ASC')
      .addOrderBy('overhead.name', 'ASC');

    if (filters?.category) {
      query.andWhere('overhead.category = :category', {
        category: filters.category,
      });
    }
    if (filters?.status) {
      query.andWhere('overhead.status = :status', { status: filters.status });
    }
    return query.getMany();
  }

  async findOne(companyId: string, id: string): Promise<OverheadCost> {
    const entity = await this.overheadCostRepository.findOne({
      where: { id, companyId },
    });
    if (!entity) {
      throw new NotFoundException(`Overhead Cost with ID ${id} not found`);
    }
    return entity;
  }

  async update(
    companyId: string,
    id: string,
    data: Partial<OverheadCost>,
  ): Promise<OverheadCost> {
    const entity = await this.findOne(companyId, id);
    Object.assign(entity, data);
    return this.overheadCostRepository.save(entity);
  }

  async delete(companyId: string, id: string): Promise<void> {
    const entity = await this.findOne(companyId, id);
    await this.overheadCostRepository.remove(entity);
  }
}
