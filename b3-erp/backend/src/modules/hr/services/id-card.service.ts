import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { IdCard } from '../entities/id-card.entity';

@Injectable()
export class IdCardService {
  constructor(
    @InjectRepository(IdCard)
    private readonly repo: Repository<IdCard>,
  ) {}

  async findAll(companyId: string, filter?: string): Promise<IdCard[]> {
    const where: FindOptionsWhere<IdCard> = { companyId } as FindOptionsWhere<IdCard>;
    if (filter) (where as Record<string, string>).cardType = filter;
    return this.repo.find({ where, order: { createdAt: 'DESC' } as any });
  }

  async findOne(id: string): Promise<IdCard> {
    const entity = await this.repo.findOne({ where: { id } as FindOptionsWhere<IdCard> });
    if (!entity) throw new NotFoundException(`ID card ${id} not found`);
    return entity;
  }

  async create(data: Partial<IdCard> & { companyId: string }): Promise<IdCard> {
    return this.repo.save(this.repo.create(data as IdCard));
  }

  async update(id: string, data: Partial<IdCard>): Promise<IdCard> {
    const entity = await this.findOne(id);
    Object.assign(entity, data);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
