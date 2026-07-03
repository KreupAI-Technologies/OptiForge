import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DieToolAsset } from '../entities/die-tool-asset.entity';

@Injectable()
export class DieToolAssetService {
  constructor(
    @InjectRepository(DieToolAsset)
    private readonly repo: Repository<DieToolAsset>,
  ) {}

  async create(createDto: Partial<DieToolAsset>): Promise<DieToolAsset> {
    if (createDto.assetCode) {
      const existing = await this.repo.findOne({ where: { assetCode: createDto.assetCode } });
      if (existing) {
        throw new BadRequestException(`Asset ${createDto.assetCode} already exists`);
      }
    }
    const entity = this.repo.create(createDto);
    return this.repo.save(entity);
  }

  async findAll(filters?: { status?: string; type?: string }): Promise<DieToolAsset[]> {
    const query = this.repo.createQueryBuilder('a');
    if (filters?.status) {
      query.andWhere('a.status = :status', { status: filters.status });
    }
    if (filters?.type) {
      query.andWhere('a.type = :type', { type: filters.type });
    }
    query.orderBy('a.assetCode', 'ASC');
    return query.getMany();
  }

  async findOne(id: string): Promise<DieToolAsset> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`Asset with ID ${id} not found`);
    }
    return entity;
  }

  async update(id: string, updateDto: Partial<DieToolAsset>): Promise<DieToolAsset> {
    const entity = await this.findOne(id);
    Object.assign(entity, updateDto);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
