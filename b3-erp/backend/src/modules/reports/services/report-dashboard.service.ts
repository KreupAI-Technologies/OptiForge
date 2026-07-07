import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReportDashboard } from '../entities/report-dashboard.entity';

@Injectable()
export class ReportDashboardService {
  constructor(
    @InjectRepository(ReportDashboard)
    private readonly repo: Repository<ReportDashboard>,
  ) {}

  /** List saved dashboards for a company, optionally filtered by category. */
  async list(companyId: string, category?: string): Promise<ReportDashboard[]> {
    return this.repo.find({
      where: {
        companyId,
        isActive: true,
        ...(category ? { category } : {}),
      },
      order: { isDefault: 'DESC', updatedAt: 'DESC' },
    });
  }

  async findOne(id: string, companyId: string): Promise<ReportDashboard> {
    const item = await this.repo.findOne({ where: { id, companyId } });
    if (!item) throw new NotFoundException('Dashboard not found');
    return item;
  }

  async create(data: Partial<ReportDashboard>): Promise<ReportDashboard> {
    const created = this.repo.create({ isActive: true, ...data });
    return this.repo.save(created);
  }

  async update(
    id: string,
    companyId: string,
    data: Partial<ReportDashboard>,
  ): Promise<ReportDashboard> {
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
