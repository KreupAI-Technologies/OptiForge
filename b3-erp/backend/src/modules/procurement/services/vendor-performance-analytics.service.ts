import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VendorEvaluation } from '../entities/vendor-evaluation.entity';
import { PurchaseOrder } from '../entities/purchase-order.entity';

export interface VendorPerformanceMetric {
  vendorId: string;
  vendorName: string;
  vendorCode: string;
  category: string;
  overallScore: number;
  qualityScore: number;
  deliveryScore: number;
  priceScore: number;
  serviceScore: number;
  complianceScore: number;
  onTimeDeliveryRate: number;
  defectRate: number;
  orderVolume: number;
  totalSpend: number;
  riskLevel: 'low' | 'medium' | 'high';
  trend: 'improving' | 'stable' | 'declining';
}

@Injectable()
export class VendorPerformanceAnalyticsService {
  constructor(
    @InjectRepository(VendorEvaluation)
    private readonly evaluationRepo: Repository<VendorEvaluation>,
    @InjectRepository(PurchaseOrder)
    private readonly poRepo: Repository<PurchaseOrder>,
  ) {}

  private riskFromScore(score: number): 'low' | 'medium' | 'high' {
    if (score >= 80) return 'low';
    if (score >= 65) return 'medium';
    return 'high';
  }

  async getVendorMetrics(
    category?: string,
  ): Promise<VendorPerformanceMetric[]> {
    const evaluations = await this.evaluationRepo.find({
      order: { evaluationDate: 'DESC' },
    });

    // Aggregate PO order volume + spend per vendor
    const poRows = await this.poRepo
      .createQueryBuilder('po')
      .select('po.vendorId', 'vendorId')
      .addSelect('COUNT(po.id)', 'orderVolume')
      .addSelect('COALESCE(SUM(po.totalAmount), 0)', 'totalSpend')
      .groupBy('po.vendorId')
      .getRawMany();

    const poMap = new Map<string, { orderVolume: number; totalSpend: number }>();
    for (const r of poRows) {
      poMap.set(String(r.vendorId), {
        orderVolume: Number(r.orderVolume) || 0,
        totalSpend: Number(r.totalSpend) || 0,
      });
    }

    // Keep latest evaluation per vendor (evaluations already sorted DESC)
    const seen = new Set<string>();
    const metrics: VendorPerformanceMetric[] = [];

    for (const e of evaluations) {
      if (seen.has(e.vendorId)) continue;
      if (category && category !== 'all' && e.vendorCategory !== category) {
        continue;
      }
      seen.add(e.vendorId);

      const po = poMap.get(e.vendorId) || { orderVolume: 0, totalSpend: 0 };
      const overall = Number(e.overallScore) || 0;

      metrics.push({
        vendorId: e.vendorId,
        vendorName: e.vendorName,
        vendorCode: e.vendorCode,
        category: e.vendorCategory || 'General',
        overallScore: overall,
        qualityScore: Number(e.qualityScore) || 0,
        deliveryScore: Number(e.deliveryScore) || 0,
        priceScore: Number(e.priceScore) || 0,
        serviceScore: Number(e.serviceScore) || 0,
        complianceScore: Number(e.complianceScore) || 0,
        onTimeDeliveryRate: Number(e.onTimeDeliveryPercentage) || 0,
        defectRate: Number(e.defectRate) || 0,
        orderVolume: po.orderVolume,
        totalSpend: po.totalSpend,
        riskLevel: this.riskFromScore(overall),
        trend: 'stable',
      });
    }

    return metrics;
  }
}
