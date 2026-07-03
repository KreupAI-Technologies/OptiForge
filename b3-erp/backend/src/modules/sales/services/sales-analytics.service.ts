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

export interface ProductAnalyticsRow {
  code: string;
  name: string;
  category: string;
  unitsSold: number;
  revenue: number;
  avgPrice: number;
  stockLevel: number;
  reorderPoint: number;
  margin: number;
  rating: number;
  reviews: number;
  returns: number;
  returnRate: number;
  trend: number;
  topRegion: string;
  topCustomerType: string;
}

export interface CustomerAnalyticsRow {
  code: string;
  name: string;
  type: string;
  region: string;
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  lastOrderDate: string;
  status: string;
  trend: number;
}

export interface ForecastRow {
  period: string;
  predicted: number;
  actual: number;
  orders: number;
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

  private num(v: unknown): number {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }

  // Product analytics aggregated from quotation items on won quotations.
  async getProducts(): Promise<ProductAnalyticsRow[]> {
    const quotations = await this.quotationRepo.find();
    const won = quotations.filter(
      (q) =>
        q.status === QuotationStatus.ACCEPTED ||
        q.status === QuotationStatus.CONVERTED,
    );
    const wonIds = new Set(won.map((q) => q.id));
    const items = await this.itemRepo.find();

    const map = new Map<
      string,
      { name: string; code: string; revenue: number; units: number }
    >();
    for (const it of items) {
      if (!wonIds.has(it.quotationId)) continue;
      const key = it.productCode || it.productId || it.productName;
      if (!key) continue;
      const cur =
        map.get(key) || {
          name: it.productName || key,
          code: it.productCode || key,
          revenue: 0,
          units: 0,
        };
      cur.revenue += this.num(it.totalAmount);
      cur.units += this.num(it.quantity);
      map.set(key, cur);
    }

    return Array.from(map.values())
      .sort((a, b) => b.revenue - a.revenue)
      .map((p) => ({
        code: p.code,
        name: p.name,
        category: 'General',
        unitsSold: Math.round(p.units),
        revenue: Math.round(p.revenue),
        avgPrice: p.units > 0 ? Math.round(p.revenue / p.units) : 0,
        stockLevel: 0,
        reorderPoint: 0,
        margin: 0,
        rating: 0,
        reviews: 0,
        returns: 0,
        returnRate: 0,
        trend: 0,
        topRegion: '',
        topCustomerType: '',
      }));
  }

  // Customer analytics aggregated from won quotations grouped by customer.
  async getCustomers(): Promise<CustomerAnalyticsRow[]> {
    const quotations = await this.quotationRepo.find();
    const won = quotations.filter(
      (q) =>
        q.status === QuotationStatus.ACCEPTED ||
        q.status === QuotationStatus.CONVERTED,
    );

    const map = new Map<
      string,
      {
        code: string;
        name: string;
        revenue: number;
        orders: number;
        lastOrderDate: number;
      }
    >();
    for (const q of won) {
      const key = q.customerId || q.customerName;
      if (!key) continue;
      const cur =
        map.get(key) || {
          code: q.customerId || key,
          name: q.customerName || key,
          revenue: 0,
          orders: 0,
          lastOrderDate: 0,
        };
      cur.revenue += this.num(q.totalAmount);
      cur.orders += 1;
      const d = q.quotationDate ? new Date(q.quotationDate).getTime() : 0;
      if (d > cur.lastOrderDate) cur.lastOrderDate = d;
      map.set(key, cur);
    }

    return Array.from(map.values())
      .sort((a, b) => b.revenue - a.revenue)
      .map((c) => ({
        code: c.code,
        name: c.name,
        type: 'retail',
        region: '',
        totalRevenue: Math.round(c.revenue),
        totalOrders: c.orders,
        avgOrderValue: c.orders > 0 ? Math.round(c.revenue / c.orders) : 0,
        lastOrderDate: c.lastOrderDate
          ? new Date(c.lastOrderDate).toISOString().slice(0, 10)
          : '',
        status: 'active',
        trend: 0,
      }));
  }

  // Monthly forecast built from won quotation revenue (actuals; predicted = actual as baseline).
  async getForecast(): Promise<ForecastRow[]> {
    const quotations = await this.quotationRepo.find();
    const won = quotations.filter(
      (q) =>
        q.status === QuotationStatus.ACCEPTED ||
        q.status === QuotationStatus.CONVERTED,
    );

    const monthlyMap = new Map<string, { revenue: number; orders: number }>();
    for (const q of won) {
      const d = q.quotationDate ? new Date(q.quotationDate) : null;
      if (!d || Number.isNaN(d.getTime())) continue;
      const key = MONTH_LABELS[d.getMonth()];
      const cur = monthlyMap.get(key) || { revenue: 0, orders: 0 };
      cur.revenue += this.num(q.totalAmount);
      cur.orders += 1;
      monthlyMap.set(key, cur);
    }

    return MONTH_LABELS.filter((m) => monthlyMap.has(m)).map((m) => {
      const v = monthlyMap.get(m)!;
      return {
        period: m,
        predicted: Math.round(v.revenue),
        actual: Math.round(v.revenue),
        orders: v.orders,
      };
    });
  }
}
