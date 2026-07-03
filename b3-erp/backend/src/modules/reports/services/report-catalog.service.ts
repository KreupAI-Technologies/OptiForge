import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReportCatalogItem } from '../entities/report-catalog-item.entity';

@Injectable()
export class ReportCatalogService {
  constructor(
    @InjectRepository(ReportCatalogItem)
    private readonly repo: Repository<ReportCatalogItem>,
  ) {}

  /** List catalog items for a company, optionally filtered by module. */
  async list(companyId: string, module?: string): Promise<ReportCatalogItem[]> {
    return this.repo.find({
      where: {
        companyId,
        isActive: true,
        ...(module ? { module } : {}),
      },
      order: { module: 'ASC', sortOrder: 'ASC', name: 'ASC' },
    });
  }

  async findOne(id: string, companyId: string): Promise<ReportCatalogItem> {
    const item = await this.repo.findOne({ where: { id, companyId } });
    if (!item) throw new NotFoundException('Catalog item not found');
    return item;
  }

  async create(data: Partial<ReportCatalogItem>): Promise<ReportCatalogItem> {
    const created = this.repo.create({ isActive: true, ...data });
    return this.repo.save(created);
  }

  async update(
    id: string,
    companyId: string,
    data: Partial<ReportCatalogItem>,
  ): Promise<ReportCatalogItem> {
    const item = await this.findOne(id, companyId);
    Object.assign(item, data);
    return this.repo.save(item);
  }

  async remove(id: string, companyId: string): Promise<{ success: boolean }> {
    const item = await this.findOne(id, companyId);
    item.isActive = false;
    await this.repo.save(item);
    return { success: true };
  }
}
