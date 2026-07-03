import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReportSavedItem } from '../entities/report-saved-item.entity';

@Injectable()
export class ReportSavedItemService {
  constructor(
    @InjectRepository(ReportSavedItem)
    private readonly repo: Repository<ReportSavedItem>,
  ) {}

  /** List saved reports for a company, optionally filtered by category. */
  async list(
    companyId: string,
    category?: string,
  ): Promise<ReportSavedItem[]> {
    return this.repo.find({
      where: {
        companyId,
        isActive: true,
        ...(category ? { category } : {}),
      },
      order: { updatedAt: 'DESC' },
    });
  }

  async findOne(id: string, companyId: string): Promise<ReportSavedItem> {
    const item = await this.repo.findOne({ where: { id, companyId } });
    if (!item) throw new NotFoundException('Saved report not found');
    return item;
  }

  async create(data: Partial<ReportSavedItem>): Promise<ReportSavedItem> {
    const created = this.repo.create({ isActive: true, ...data });
    return this.repo.save(created);
  }

  async update(
    id: string,
    companyId: string,
    data: Partial<ReportSavedItem>,
  ): Promise<ReportSavedItem> {
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
