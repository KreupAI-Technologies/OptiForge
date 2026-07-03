import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BomVerification } from '../entities/bom-verification.entity';

@Injectable()
export class BomVerificationService {
  constructor(
    @InjectRepository(BomVerification)
    private readonly repo: Repository<BomVerification>,
  ) {}

  async create(createDto: Partial<BomVerification>): Promise<BomVerification> {
    const entity = this.repo.create(createDto);
    return this.repo.save(entity);
  }

  async findAll(filters?: { status?: string }): Promise<BomVerification[]> {
    const query = this.repo.createQueryBuilder('b');
    if (filters?.status) {
      query.andWhere('b.status = :status', { status: filters.status });
    }
    query.orderBy('b.createdAt', 'DESC');
    return query.getMany();
  }

  async findOne(id: string): Promise<BomVerification> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`BOM verification with ID ${id} not found`);
    }
    return entity;
  }

  async update(id: string, updateDto: Partial<BomVerification>): Promise<BomVerification> {
    const entity = await this.findOne(id);
    Object.assign(entity, updateDto);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
