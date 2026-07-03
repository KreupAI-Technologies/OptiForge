import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ncr } from '../entities/ncr.entity';

@Injectable()
export class NcrService {
  constructor(
    @InjectRepository(Ncr)
    private readonly repo: Repository<Ncr>,
  ) {}

  async create(createDto: Partial<Ncr>): Promise<Ncr> {
    const entity = this.repo.create(createDto);
    return this.repo.save(entity);
  }

  async findAll(filters?: { status?: string; severity?: string; nonconformanceType?: string }): Promise<Ncr[]> {
    const query = this.repo.createQueryBuilder('n');
    if (filters?.status) {
      query.andWhere('n.status = :status', { status: filters.status });
    }
    if (filters?.severity) {
      query.andWhere('n.severity = :severity', { severity: filters.severity });
    }
    if (filters?.nonconformanceType) {
      query.andWhere('n.nonconformanceType = :nonconformanceType', { nonconformanceType: filters.nonconformanceType });
    }
    query.orderBy('n.createdAt', 'DESC');
    return query.getMany();
  }

  async findOne(id: string): Promise<Ncr> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`NCR with ID ${id} not found`);
    }
    return entity;
  }

  async update(id: string, updateDto: Partial<Ncr>): Promise<Ncr> {
    const entity = await this.findOne(id);
    Object.assign(entity, updateDto);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
