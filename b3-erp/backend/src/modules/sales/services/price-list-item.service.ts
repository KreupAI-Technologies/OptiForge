import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PriceListItem } from '../entities/price-list-item.entity';

@Injectable()
export class PriceListItemService {
  constructor(
    @InjectRepository(PriceListItem)
    private readonly repo: Repository<PriceListItem>,
  ) {}

  async findAll(companyId?: string): Promise<PriceListItem[]> {
    const where = companyId ? { companyId } : {};
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<PriceListItem> {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException(`Price list item ${id} not found`);
    return row;
  }

  async create(data: Partial<PriceListItem>): Promise<PriceListItem> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async update(id: string, data: Partial<PriceListItem>): Promise<PriceListItem> {
    const row = await this.findOne(id);
    Object.assign(row, data);
    return this.repo.save(row);
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    const row = await this.findOne(id);
    await this.repo.remove(row);
    return { deleted: true };
  }
}
