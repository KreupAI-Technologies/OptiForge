import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SourcingStrategy } from '../entities/sourcing-strategy.entity';

@Injectable()
export class SourcingStrategyService {
  constructor(
    @InjectRepository(SourcingStrategy)
    private readonly strategyRepository: Repository<SourcingStrategy>,
  ) {}

  async create(
    companyId: string,
    data: Partial<SourcingStrategy>,
  ): Promise<SourcingStrategy> {
    const entity = this.strategyRepository.create({
      ...data,
      companyId,
      strategyCode: data.strategyCode || (await this.generateCode(companyId)),
    });
    return this.strategyRepository.save(entity);
  }

  async findAll(
    companyId: string,
    filters?: { status?: string; strategyType?: string; category?: string },
  ): Promise<SourcingStrategy[]> {
    const query = this.strategyRepository
      .createQueryBuilder('strategy')
      .where('strategy.companyId = :companyId', { companyId })
      .orderBy('strategy.createdAt', 'DESC');

    if (filters?.status) {
      query.andWhere('strategy.status = :status', { status: filters.status });
    }
    if (filters?.strategyType) {
      query.andWhere('strategy.strategyType = :strategyType', {
        strategyType: filters.strategyType,
      });
    }
    if (filters?.category) {
      query.andWhere('strategy.category = :category', {
        category: filters.category,
      });
    }

    return query.getMany();
  }

  async findOne(companyId: string, id: string): Promise<SourcingStrategy> {
    const entity = await this.strategyRepository.findOne({
      where: { id, companyId },
    });
    if (!entity) {
      throw new NotFoundException(`Sourcing strategy with ID ${id} not found`);
    }
    return entity;
  }

  async update(
    companyId: string,
    id: string,
    data: Partial<SourcingStrategy>,
  ): Promise<SourcingStrategy> {
    const entity = await this.findOne(companyId, id);
    Object.assign(entity, data);
    return this.strategyRepository.save(entity);
  }

  async delete(companyId: string, id: string): Promise<void> {
    const entity = await this.findOne(companyId, id);
    await this.strategyRepository.remove(entity);
  }

  private async generateCode(companyId: string): Promise<string> {
    const count = await this.strategyRepository.count({ where: { companyId } });
    const seq = String(count + 1).padStart(4, '0');
    return `SS-${seq}`;
  }
}
