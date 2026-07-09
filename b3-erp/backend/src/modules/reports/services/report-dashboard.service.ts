import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReportDashboard } from '../entities/report-dashboard.entity';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReportDashboardService {
  private readonly logger = new Logger(ReportDashboardService.name);

  constructor(
    @InjectRepository(ReportDashboard)
    private readonly repo: Repository<ReportDashboard>,
    private readonly prisma: PrismaService,
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

  /**
   * Resolve one count defensively: any failure (missing table, DB error)
   * falls back to 0 so a widget payload is always render-safe.
   */
  private async safeCount(
    label: string,
    fn: () => Promise<number>,
  ): Promise<number> {
    try {
      const value = await fn();
      return typeof value === 'number' && Number.isFinite(value) ? value : 0;
    } catch (err) {
      this.logger.warn(
        `dashboard widget-data: count "${label}" failed, defaulting to 0 (${
          (err as Error)?.message ?? err
        })`,
      );
      return 0;
    }
  }

  /**
   * Live widget data for the /reports/dashboards command-center widgets.
   *
   * Returns a render-safe bundle the frontend hydrates into its metric /
   * chart / table / list widget shapes. Every metric is resolved with
   * `safeCount`, so an empty or missing table yields 0 rather than an error.
   * The dashboardId is accepted for future per-dashboard scoping but the
   * current cross-module KPI set is company-wide.
   */
  async getWidgetData(_companyId: string, _dashboardId?: string) {
    const [
      totalOrders,
      totalInvoices,
      inventoryItems,
      production,
      employees,
      customers,
      openTickets,
    ] = await Promise.all([
      this.safeCount('salesOrders', () => this.prisma.salesOrder.count()),
      this.safeCount('salesInvoices', () => this.prisma.salesInvoice.count()),
      this.safeCount('items', () => this.prisma.item.count()),
      this.safeCount('workCenters', () => this.prisma.workCenter.count()),
      this.safeCount('employees', () => this.prisma.employee.count()),
      this.safeCount('customers', () => this.prisma.customer.count()),
      this.safeCount('supportTickets', () =>
        this.prisma.supportTicket.count(),
      ),
    ]);

    const metrics = [
      { key: 'totalOrders', title: 'Total Orders', value: totalOrders, change: 0 },
      { key: 'totalInvoices', title: 'Invoices', value: totalInvoices, change: 0 },
      { key: 'customers', title: 'Customers', value: customers, change: 0 },
      { key: 'inventoryItems', title: 'Inventory Items', value: inventoryItems, change: 0 },
      { key: 'employees', title: 'Employees', value: employees, change: 0 },
      { key: 'openTickets', title: 'Open Tickets', value: openTickets, change: 0 },
    ];

    // Chart series: distribution of core entity volumes (bar/line/area safe;
    // `date` key doubles as the category label expected by the FE chart widget).
    const volumeSeries = [
      { date: 'Orders', value: totalOrders },
      { date: 'Invoices', value: totalInvoices },
      { date: 'Customers', value: customers },
      { date: 'Inventory', value: inventoryItems },
      { date: 'Production', value: production },
    ];

    // Pie distribution for pie-type chart widgets.
    const pieData = [
      { name: 'Orders', value: totalOrders, color: '#3b82f6' },
      { name: 'Invoices', value: totalInvoices, color: '#10b981' },
      { name: 'Customers', value: customers, color: '#f59e0b' },
      { name: 'Tickets', value: openTickets, color: '#ef4444' },
    ];

    // Table widget rows: one row per module KPI.
    const tableRows = metrics.map((m) => ({
      id: m.key,
      Metric: m.title,
      Value: m.value,
    }));

    return {
      generatedAt: new Date().toISOString(),
      metrics,
      chart: { series: volumeSeries, pieData },
      table: { columns: ['Metric', 'Value'], rows: tableRows },
      list: {
        items: metrics.map((m) => ({
          id: m.key,
          type: m.value > 0 ? 'success' : 'default',
          text: `${m.title}: ${m.value}`,
          time: '',
        })),
      },
    };
  }
}
