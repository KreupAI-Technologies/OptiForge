import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VendorScorecard } from '../entities/vendor-scorecard.entity';

@Injectable()
export class VendorScorecardService {
  constructor(
    @InjectRepository(VendorScorecard)
    private scorecardRepository: Repository<VendorScorecard>,
  ) {}

  async create(
    companyId: string,
    data: Partial<VendorScorecard>,
  ): Promise<VendorScorecard> {
    const entity = this.scorecardRepository.create({ ...data, companyId });
    return this.scorecardRepository.save(entity);
  }

  async findAll(
    companyId: string,
    filters?: { category?: string; tier?: string; status?: string },
  ): Promise<VendorScorecard[]> {
    const query = this.scorecardRepository
      .createQueryBuilder('scorecard')
      .where('scorecard.companyId = :companyId', { companyId })
      .orderBy('scorecard.overallScore', 'DESC');

    if (filters?.category) {
      query.andWhere('scorecard.category = :category', {
        category: filters.category,
      });
    }
    if (filters?.tier) {
      query.andWhere('scorecard.tier = :tier', { tier: filters.tier });
    }
    if (filters?.status) {
      query.andWhere('scorecard.status = :status', { status: filters.status });
    }
    return query.getMany();
  }

  async findOne(companyId: string, id: string): Promise<VendorScorecard> {
    const entity = await this.scorecardRepository.findOne({
      where: { id, companyId },
    });
    if (!entity) {
      throw new NotFoundException(`Vendor Scorecard with ID ${id} not found`);
    }
    return entity;
  }

  async update(
    companyId: string,
    id: string,
    data: Partial<VendorScorecard>,
  ): Promise<VendorScorecard> {
    const entity = await this.findOne(companyId, id);
    Object.assign(entity, data);
    return this.scorecardRepository.save(entity);
  }

  async delete(companyId: string, id: string): Promise<void> {
    const entity = await this.findOne(companyId, id);
    await this.scorecardRepository.remove(entity);
  }
}
