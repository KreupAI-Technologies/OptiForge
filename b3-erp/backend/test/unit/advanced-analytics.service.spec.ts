import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdvancedAnalyticsService } from '../../src/modules/finance/services/advanced-analytics.service';
import { ChartOfAccounts } from '../../src/modules/finance/entities/chart-of-accounts.entity';
import { JournalEntry } from '../../src/modules/finance/entities/journal-entry.entity';
import { Invoice, InvoiceType } from '../../src/modules/finance/entities/invoice.entity';
import { Payment } from '../../src/modules/finance/entities/payment.entity';
import { createMockRepository } from '../utils/test-setup';

describe('AdvancedAnalyticsService', () => {
  let service: AdvancedAnalyticsService;
  let coaRepo: jest.Mocked<Repository<ChartOfAccounts>>;
  let journalRepo: jest.Mocked<Repository<JournalEntry>>;
  let invoiceRepo: jest.Mocked<Repository<Invoice>>;
  let paymentRepo: jest.Mocked<Repository<Payment>>;

  beforeEach(async () => {
    coaRepo = createMockRepository<ChartOfAccounts>();
    journalRepo = createMockRepository<JournalEntry>();
    invoiceRepo = createMockRepository<Invoice>();
    paymentRepo = createMockRepository<Payment>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdvancedAnalyticsService,
        { provide: getRepositoryToken(ChartOfAccounts), useValue: coaRepo },
        { provide: getRepositoryToken(JournalEntry), useValue: journalRepo },
        { provide: getRepositoryToken(Invoice), useValue: invoiceRepo },
        { provide: getRepositoryToken(Payment), useValue: paymentRepo },
      ],
    }).compile();
    service = module.get(AdvancedAnalyticsService);
  });

  it('aggregates GL, treasury and cash forecast from finance entities', async () => {
    coaRepo.find.mockResolvedValue([
      { id: 'a1', accountCode: '1000', accountName: 'HDFC Bank', accountType: 'Asset', currency: 'INR', currentBalance: 5000, openingBalance: 1000 },
      { id: 'a2', accountCode: '1010', accountName: 'Petty Cash', accountType: 'Asset', currency: 'INR', currentBalance: 500, openingBalance: 0 },
      { id: 'a3', accountCode: '4000', accountName: 'Sales', accountType: 'Income', currency: 'USD', currentBalance: 2000, openingBalance: 0 },
    ] as any);
    journalRepo.find.mockResolvedValue([
      { id: 'j1', totalDebit: 1000, totalCredit: 1000, status: 'Posted' },
      { id: 'j2', totalDebit: 500, totalCredit: 500, status: 'Draft' },
    ] as any);
    invoiceRepo.find.mockResolvedValue([
      { id: 'i1', invoiceType: InvoiceType.SALES_INVOICE, balanceAmount: 3000 },
      { id: 'i2', invoiceType: InvoiceType.PURCHASE_INVOICE, balanceAmount: 1200 },
    ] as any);

    const result = await service.getDashboard();

    // General ledger
    expect(result.generalLedger.accountCount).toBe(3);
    expect(result.generalLedger.totalDebit).toBe(1500);
    expect(result.generalLedger.totalCredit).toBe(1500);
    expect(result.generalLedger.postedJournalCount).toBe(1);
    expect(result.generalLedger.isBalanced).toBe(true);

    // Treasury: only asset accounts named cash/bank => 5000 + 500
    expect(result.treasury.cashPosition).toBe(5500);
    expect(result.treasury.cashAccounts).toHaveLength(2);

    // Consolidation groups by currency (INR: 5500, USD: 2000)
    expect(result.consolidation.entityCount).toBe(2);

    // Cash forecast from open invoices
    expect(result.cashForecast.expectedInflow).toBe(3000);
    expect(result.cashForecast.expectedOutflow).toBe(1200);
    expect(result.cashForecast.netProjected).toBe(1800);

    // Audit trail split
    expect(result.auditTrail.posted).toBe(1);
    expect(result.auditTrail.draft).toBe(1);
  });

  it('reports imbalance when debits and credits diverge', async () => {
    coaRepo.find.mockResolvedValue([]);
    journalRepo.find.mockResolvedValue([
      { id: 'j1', totalDebit: 100, totalCredit: 90, status: 'Posted' },
    ] as any);
    invoiceRepo.find.mockResolvedValue([]);

    const result = await service.getDashboard();
    expect(result.generalLedger.isBalanced).toBe(false);
    expect(result.treasury.cashPosition).toBe(0);
  });
});
