import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SavingsInitiative } from '../entities/savings-initiative.entity';

@Injectable()
export class SavingsInitiativeService {
  constructor(
    @InjectRepository(SavingsInitiative)
    private savingsRepository: Repository<SavingsInitiative>,
  ) {}

  async create(
    companyId: string,
    data: Partial<SavingsInitiative>,
  ): Promise<SavingsInitiative> {
    const entity = this.savingsRepository.create({ ...data, companyId });
    return this.savingsRepository.save(entity);
  }

  async findAll(
    companyId: string,
    filters?: { category?: string; type?: string; status?: string },
  ): Promise<SavingsInitiative[]> {
    const query = this.savingsRepository
      .createQueryBuilder('initiative')
      .where('initiative.companyId = :companyId', { companyId })
      .orderBy('initiative.startDate', 'DESC');

    if (filters?.category) {
      query.andWhere('initiative.category = :category', {
        category: filters.category,
      });
    }
    if (filters?.type) {
      query.andWhere('initiative.type = :type', { type: filters.type });
    }
    if (filters?.status) {
      query.andWhere('initiative.status = :status', { status: filters.status });
    }
    return query.getMany();
  }

  async findOne(companyId: string, id: string): Promise<SavingsInitiative> {
    const entity = await this.savingsRepository.findOne({
      where: { id, companyId },
    });
    if (!entity) {
      throw new NotFoundException(`Savings Initiative with ID ${id} not found`);
    }
    return entity;
  }

  async update(
    companyId: string,
    id: string,
    data: Partial<SavingsInitiative>,
  ): Promise<SavingsInitiative> {
    const entity = await this.findOne(companyId, id);
    Object.assign(entity, data);
    return this.savingsRepository.save(entity);
  }

  async delete(companyId: string, id: string): Promise<void> {
    const entity = await this.findOne(companyId, id);
    await this.savingsRepository.remove(entity);
  }
}
