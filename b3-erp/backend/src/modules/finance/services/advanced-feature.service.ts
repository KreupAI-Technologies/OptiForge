import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdvancedFeature } from '../entities/advanced-feature.entity';

@Injectable()
export class AdvancedFeatureService {
  constructor(
    @InjectRepository(AdvancedFeature)
    private readonly repo: Repository<AdvancedFeature>,
  ) {}

  async findAll(companyId = 'default'): Promise<AdvancedFeature[]> {
    return this.repo.find({
      where: { companyId },
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    });
  }

  async findOne(id: string): Promise<AdvancedFeature> {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException(`Advanced feature ${id} not found`);
    return row;
  }

  async create(data: Partial<AdvancedFeature>): Promise<AdvancedFeature> {
    const row = this.repo.create({ companyId: 'default', ...data });
    return this.repo.save(row);
  }

  async update(id: string, data: Partial<AdvancedFeature>): Promise<AdvancedFeature> {
    const row = await this.findOne(id);
    const { id: _id, createdAt, updatedAt, ...rest } = data as any;
    Object.assign(row, rest);
    return this.repo.save(row);
  }

  async remove(id: string): Promise<void> {
    const result = await this.repo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Advanced feature ${id} not found`);
    }
  }
}
