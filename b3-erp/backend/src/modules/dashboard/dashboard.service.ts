import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Aggregate overview metrics for the landing / command-center dashboards.
 *
 * Each count is resolved independently and defensively: if a table is empty,
 * missing, or the query fails, that metric falls back to 0 so the endpoint
 * always returns a complete, render-safe payload.
 */
@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(private readonly prisma: PrismaService) {}

  private async safeCount(
    label: string,
    fn: () => Promise<number>,
  ): Promise<number> {
    try {
      const value = await fn();
      return typeof value === 'number' && Number.isFinite(value) ? value : 0;
    } catch (err) {
      this.logger.warn(
        `dashboard overview: count "${label}" failed, defaulting to 0 (${
          (err as Error)?.message ?? err
        })`,
      );
      return 0;
    }
  }

  async getOverview() {
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

    return {
      generatedAt: new Date().toISOString(),
      metrics: {
        totalOrders,
        totalInvoices,
        inventoryItems,
        production,
        employees,
        customers,
        openTickets,
      },
      // Convenience tile array consumed directly by the landing KPI tiles.
      tiles: [
        { key: 'totalOrders', label: 'Total Orders', value: totalOrders },
        { key: 'totalInvoices', label: 'Invoices', value: totalInvoices },
        { key: 'production', label: 'Production', value: production },
        {
          key: 'inventoryItems',
          label: 'Inventory Items',
          value: inventoryItems,
        },
      ],
    };
  }
}
