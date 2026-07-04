import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VendorPerformanceAnalyticsService } from '../../src/modules/procurement/services/vendor-performance-analytics.service';
import { VendorEvaluation } from '../../src/modules/procurement/entities/vendor-evaluation.entity';
import { PurchaseOrder } from '../../src/modules/procurement/entities/purchase-order.entity';
import { createMockRepository } from '../utils/test-setup';

function makePoQb(rawRows: any[]) {
  return {
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    getRawMany: jest.fn().mockResolvedValue(rawRows),
  } as any;
}

describe('VendorPerformanceAnalyticsService', () => {
  let service: VendorPerformanceAnalyticsService;
  let evalRepo: jest.Mocked<Repository<VendorEvaluation>>;
  let poRepo: jest.Mocked<Repository<PurchaseOrder>>;

  beforeEach(async () => {
    evalRepo = createMockRepository<VendorEvaluation>();
    poRepo = createMockRepository<PurchaseOrder>();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VendorPerformanceAnalyticsService,
        { provide: getRepositoryToken(VendorEvaluation), useValue: evalRepo },
        { provide: getRepositoryToken(PurchaseOrder), useValue: poRepo },
      ],
    }).compile();
    service = module.get(VendorPerformanceAnalyticsService);
  });

  it('joins latest evaluation with PO spend and maps risk level from score', async () => {
    evalRepo.find.mockResolvedValue([
      {
        vendorId: 'v1',
        vendorName: 'Alpha',
        vendorCode: 'A1',
        vendorCategory: 'Raw',
        overallScore: 90, // >= 80 => low risk
        qualityScore: 88,
        deliveryScore: 92,
      },
      // duplicate vendor should be ignored (only latest kept)
      { vendorId: 'v1', vendorName: 'Alpha old', vendorCode: 'A1', overallScore: 50 },
      {
        vendorId: 'v2',
        vendorName: 'Beta',
        vendorCode: 'B1',
        vendorCategory: 'Raw',
        overallScore: 60, // < 65 => high risk
      },
    ] as any);

    poRepo.createQueryBuilder.mockReturnValue(
      makePoQb([
        { vendorId: 'v1', orderVolume: '5', totalSpend: '10000' },
        { vendorId: 'v2', orderVolume: '2', totalSpend: '4000' },
      ]),
    );

    const metrics = await service.getVendorMetrics();

    expect(metrics).toHaveLength(2);
    const alpha = metrics.find((m) => m.vendorId === 'v1')!;
    expect(alpha.orderVolume).toBe(5);
    expect(alpha.totalSpend).toBe(10000);
    expect(alpha.riskLevel).toBe('low');

    const beta = metrics.find((m) => m.vendorId === 'v2')!;
    expect(beta.riskLevel).toBe('high');
  });

  it('filters by category and defaults spend to 0 when no POs exist', async () => {
    evalRepo.find.mockResolvedValue([
      { vendorId: 'v1', vendorName: 'Alpha', vendorCode: 'A1', vendorCategory: 'Raw', overallScore: 70 },
      { vendorId: 'v2', vendorName: 'Beta', vendorCode: 'B1', vendorCategory: 'Services', overallScore: 85 },
    ] as any);
    poRepo.createQueryBuilder.mockReturnValue(makePoQb([]));

    const metrics = await service.getVendorMetrics('Raw');

    expect(metrics).toHaveLength(1);
    expect(metrics[0].vendorId).toBe('v1');
    expect(metrics[0].totalSpend).toBe(0);
    expect(metrics[0].orderVolume).toBe(0);
    expect(metrics[0].riskLevel).toBe('medium'); // 70 => medium
  });
});
