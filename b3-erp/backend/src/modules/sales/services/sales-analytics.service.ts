import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quotation, QuotationStatus } from '../entities/quotation.entity';
import { QuotationItem } from '../entities/quotation.entity';

export interface SalesAnalyticsDashboard {
  currentStats: {
    revenue: number;
    revenueGrowth: number;
    orders: number;
    ordersGrowth: number;
    avgOrderValue: number;
    avgOrderGrowth: number;
    customers: number;
    customersGrowth: number;
    conversionRate: number;
    conversionGrowth: number;
  };
  monthlySales: { month: string; revenue: number; orders: number; avgOrder: number }[];
  categoryData: {
    category: string;
    revenue: number;
    orders: number;
    growth: number;
    color: string;
  }[];
  topProducts: {
    name: string;
    code: string;
    revenue: number;
    units: number;
    avgPrice: number;
  }[];
  regionalData: { region: string; revenue: number; growth: number; orders: number; color: string }[];
}

const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

@Injectable()
export class SalesAnalyticsService {
  constructor(
    @InjectRepository(Quotation)
    private readonly quotationRepo: Repository<Quotation>,
    @InjectRepository(QuotationItem)
    private readonly itemRepo: Repository<QuotationItem>,
  ) {}

  async getDashboard(): Promise<SalesAnalyticsDashboard> {
    const quotations = await this.quotationRepo.find();

    const num = (v: unknown): number => {
      const n = Number(v);
      return Number.isFinite(n) ? n : 0;
    };

    // Consider accepted/converted quotations as "won" revenue.
    const won = quotations.filter(
      (q) =>
        q.status === QuotationStatus.ACCEPTED ||
        q.status === QuotationStatus.CONVERTED,
    );

    const revenue = won.reduce((sum, q) => sum + num(q.totalAmount), 0);
    const orders = won.length;
    const avgOrderValue = orders > 0 ? revenue / orders : 0;
    const customers = new Set(
      won.map((q) => q.customerId || q.customerName).filter(Boolean),
    ).size;
    const conversionRate =
      quotations.length > 0 ? (won.length / quotations.length) * 100 : 0;

    // Monthly aggregation over the won quotations by quotationDate.
    const monthlyMap = new Map<string, { revenue: number; orders: number }>();
    for (const q of won) {
      const d = q.quotationDate ? new Date(q.quotationDate) : null;
      if (!d || Number.isNaN(d.getTime())) continue;
      const key = MONTH_LABELS[d.getMonth()];
      const cur = monthlyMap.get(key) || { revenue: 0, orders: 0 };
      cur.revenue += num(q.totalAmount);
      cur.orders += 1;
      monthlyMap.set(key, cur);
    }
    const monthlySales = MONTH_LABELS.filter((m) => monthlyMap.has(m)).map(
      (m) => {
        const v = monthlyMap.get(m)!;
        return {
          month: m,
          revenue: Math.round(v.revenue),
          orders: v.orders,
          avgOrder: v.orders > 0 ? Math.round(v.revenue / v.orders) : 0,
        };
      },
    );

    // Top products aggregated from quotation items linked to won quotations.
    const wonIds = new Set(won.map((q) => q.id));
    const items = await this.itemRepo.find();
    const productMap = new Map<
      string,
      { name: string; code: string; revenue: number; units: number }
    >();
    for (const it of items) {
      if (!wonIds.has(it.quotationId)) continue;
      const key = it.productCode || it.productId || it.productName;
      if (!key) continue;
      const cur =
        productMap.get(key) || {
          name: it.productName || key,
          code: it.productCode || key,
          revenue: 0,
          units: 0,
        };
      cur.revenue += num(it.totalAmount);
      cur.units += num(it.quantity);
      productMap.set(key, cur);
    }
    const topProducts = Array.from(productMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
      .map((p) => ({
        name: p.name,
        code: p.code,
        revenue: Math.round(p.revenue),
        units: Math.round(p.units),
        avgPrice: p.units > 0 ? Math.round(p.revenue / p.units) : 0,
      }));

    return {
      currentStats: {
        revenue: Math.round(revenue),
        revenueGrowth: 0,
        orders,
        ordersGrowth: 0,
        avgOrderValue: Math.round(avgOrderValue),
        avgOrderGrowth: 0,
        customers,
        customersGrowth: 0,
        conversionRate: Math.round(conversionRate * 10) / 10,
        conversionGrowth: 0,
      },
      monthlySales,
      categoryData: [],
      topProducts,
      regionalData: [],
    };
  }
}
