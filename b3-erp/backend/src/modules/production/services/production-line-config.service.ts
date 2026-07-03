import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductionLineConfig } from '../entities/production-line-config.entity';

@Injectable()
export class ProductionLineConfigService {
  constructor(
    @InjectRepository(ProductionLineConfig)
    private readonly repo: Repository<ProductionLineConfig>,
  ) {}

  async create(createDto: Partial<ProductionLineConfig>): Promise<ProductionLineConfig> {
    if (createDto.code) {
      const existing = await this.repo.findOne({ where: { code: createDto.code } });
      if (existing) {
        throw new BadRequestException(`Line config ${createDto.code} already exists`);
      }
    }
    const entity = this.repo.create(createDto);
    return this.repo.save(entity);
  }

  async findAll(filters?: { status?: string }): Promise<ProductionLineConfig[]> {
    const query = this.repo.createQueryBuilder('lc');
    if (filters?.status) {
      query.andWhere('lc.status = :status', { status: filters.status });
    }
    query.orderBy('lc.name', 'ASC');
    return query.getMany();
  }

  async findOne(id: string): Promise<ProductionLineConfig> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`Line config with ID ${id} not found`);
    }
    return entity;
  }

  async update(id: string, updateDto: Partial<ProductionLineConfig>): Promise<ProductionLineConfig> {
    const entity = await this.findOne(id);
    Object.assign(entity, updateDto);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
