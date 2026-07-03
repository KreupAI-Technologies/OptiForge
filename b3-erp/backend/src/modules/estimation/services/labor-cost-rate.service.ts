import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LaborCostRate } from '../entities/labor-cost-rate.entity';

@Injectable()
export class LaborCostRateService {
  constructor(
    @InjectRepository(LaborCostRate)
    private laborCostRateRepository: Repository<LaborCostRate>,
  ) {}

  async create(
    companyId: string,
    data: Partial<LaborCostRate>,
  ): Promise<LaborCostRate> {
    const entity = this.laborCostRateRepository.create({ ...data, companyId });
    return this.laborCostRateRepository.save(entity);
  }

  async findAll(
    companyId: string,
    filters?: { department?: string; status?: string },
  ): Promise<LaborCostRate[]> {
    const query = this.laborCostRateRepository
      .createQueryBuilder('rate')
      .where('rate.companyId = :companyId', { companyId })
      .orderBy('rate.department', 'ASC')
      .addOrderBy('rate.skill', 'ASC');

    if (filters?.department) {
      query.andWhere('rate.department = :department', {
        department: filters.department,
      });
    }
    if (filters?.status) {
      query.andWhere('rate.status = :status', { status: filters.status });
    }
    return query.getMany();
  }

  async findOne(companyId: string, id: string): Promise<LaborCostRate> {
    const entity = await this.laborCostRateRepository.findOne({
      where: { id, companyId },
    });
    if (!entity) {
      throw new NotFoundException(`Labor Cost Rate with ID ${id} not found`);
    }
    return entity;
  }

  async update(
    companyId: string,
    id: string,
    data: Partial<LaborCostRate>,
  ): Promise<LaborCostRate> {
    const entity = await this.findOne(companyId, id);
    Object.assign(entity, data);
    return this.laborCostRateRepository.save(entity);
  }

  async delete(companyId: string, id: string): Promise<void> {
    const entity = await this.findOne(companyId, id);
    await this.laborCostRateRepository.remove(entity);
  }
}
