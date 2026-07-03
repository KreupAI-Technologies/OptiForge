import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AndonLine } from '../entities/andon-line.entity';

@Injectable()
export class AndonLineService {
  constructor(
    @InjectRepository(AndonLine)
    private readonly repo: Repository<AndonLine>,
  ) {}

  async create(createDto: Partial<AndonLine>): Promise<AndonLine> {
    const entity = this.repo.create(createDto);
    return this.repo.save(entity);
  }

  async findAll(filters?: { status?: string }): Promise<AndonLine[]> {
    const query = this.repo.createQueryBuilder('a');
    if (filters?.status) {
      query.andWhere('a.status = :status', { status: filters.status });
    }
    query.orderBy('a.lineName', 'ASC');
    return query.getMany();
  }

  async findOne(id: string): Promise<AndonLine> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`Andon line with ID ${id} not found`);
    }
    return entity;
  }

  async update(id: string, updateDto: Partial<AndonLine>): Promise<AndonLine> {
    const entity = await this.findOne(id);
    Object.assign(entity, updateDto);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
