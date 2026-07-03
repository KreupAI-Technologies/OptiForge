import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CorporateCard } from '../entities/corporate-card.entity';

@Injectable()
export class CorporateCardService {
  constructor(
    @InjectRepository(CorporateCard)
    private readonly repo: Repository<CorporateCard>,
  ) {}

  async findAll(companyId: string, status?: string): Promise<CorporateCard[]> {
    const where: Record<string, any> = { companyId };
    if (status) where.status = status;
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<CorporateCard> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`Corporate card ${id} not found`);
    return entity;
  }

  async create(
    data: Partial<CorporateCard> & { companyId: string },
  ): Promise<CorporateCard> {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: string, data: Partial<CorporateCard>): Promise<CorporateCard> {
    const entity = await this.findOne(id);
    Object.assign(entity, data);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
