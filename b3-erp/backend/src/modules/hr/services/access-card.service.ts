import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { AccessCard } from '../entities/access-card.entity';

@Injectable()
export class AccessCardService {
  constructor(
    @InjectRepository(AccessCard)
    private readonly repo: Repository<AccessCard>,
  ) {}

  async findAll(companyId: string, filter?: string): Promise<AccessCard[]> {
    const where: FindOptionsWhere<AccessCard> = { companyId } as FindOptionsWhere<AccessCard>;
    if (filter) (where as Record<string, string>).cardType = filter;
    return this.repo.find({ where, order: { createdAt: 'DESC' } as any });
  }

  async findOne(id: string): Promise<AccessCard> {
    const entity = await this.repo.findOne({ where: { id } as FindOptionsWhere<AccessCard> });
    if (!entity) throw new NotFoundException(`Access card ${id} not found`);
    return entity;
  }

  async create(data: Partial<AccessCard> & { companyId: string }): Promise<AccessCard> {
    return this.repo.save(this.repo.create(data as AccessCard));
  }

  async update(id: string, data: Partial<AccessCard>): Promise<AccessCard> {
    const entity = await this.findOne(id);
    Object.assign(entity, data);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
