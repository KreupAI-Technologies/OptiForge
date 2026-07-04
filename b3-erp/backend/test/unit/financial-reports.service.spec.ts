import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FinancialReportsService } from '../../src/modules/finance/services/financial-reports.service';
import { GeneralLedger } from '../../src/modules/finance/entities/general-ledger.entity';
import { ChartOfAccounts } from '../../src/modules/finance/entities/chart-of-accounts.entity';
import { Budget } from '../../src/modules/finance/entities/budget.entity';
import { Invoice } from '../../src/modules/finance/entities/invoice.entity';
import { createMockRepository } from '../utils/test-setup';

function makeQb(rows: any[]) {
  return {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue(rows),
  } as any;
}

describe('FinancialReportsService', () => {
  let service: FinancialReportsService;
  let glRepo: jest.Mocked<Repository<GeneralLedger>>;
  let coaRepo: jest.Mocked<Repository<ChartOfAccounts>>;
  let budgetRepo: jest.Mocked<Repository<Budget>>;
  let invoiceRepo: jest.Mocked<Repository<Invoice>>;

  beforeEach(async () => {
    glRepo = createMockRepository<GeneralLedger>();
    coaRepo = createMockRepository<ChartOfAccounts>();
    budgetRepo = createMockRepository<Budget>();
    invoiceRepo = createMockRepository<Invoice>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FinancialReportsService,
        { provide: getRepositoryToken(GeneralLedger), useValue: glRepo },
        { provide: getRepositoryToken(ChartOfAccounts), useValue: coaRepo },
        { provide: getRepositoryToken(Budget), useValue: budgetRepo },
        { provide: getRepositoryToken(Invoice), useValue: invoiceRepo },
      ],
    }).compile();
    service = module.get(FinancialReportsService);
  });

  describe('getProfitLossStatement', () => {
    it('computes revenue, COGS, opex, gross and net profit', async () => {
      const rows = [
        // Income: credit 1000 revenue
        { account: { accountType: 'Income', accountCode: '4000' }, creditAmount: 1000, debitAmount: 0 },
        // COGS (Expense, code starts with 5): debit 400
        { account: { accountType: 'Expense', accountCode: '5000' }, debitAmount: 400, creditAmount: 0 },
        // Opex (Expense, not code 5): debit 100
        { account: { accountType: 'Expense', accountCode: '6000' }, debitAmount: 100, creditAmount: 0 },
      ];
      glRepo.createQueryBuilder.mockReturnValue(makeQb(rows));

      const result = await service.getProfitLossStatement({});

      expect(result.totalRevenue).toBe(1000);
      expect(result.totalCOGS).toBe(400);
      expect(result.grossProfit).toBe(600);
      expect(result.totalExpenses).toBe(100);
      expect(result.netProfitLoss).toBe(500);
    });
  });

  describe('getBalanceSheet', () => {
    it('computes assets, liabilities, equity and balance check', async () => {
      const rows = [
        { account: { accountType: 'Asset' }, debitAmount: 1000, creditAmount: 0 },
        { account: { accountType: 'Liability' }, creditAmount: 600, debitAmount: 0 },
        { account: { accountType: 'Equity' }, creditAmount: 400, debitAmount: 0 },
      ];
      glRepo.createQueryBuilder.mockReturnValue(makeQb(rows));

      const result = await service.getBalanceSheet({});
      expect(result.totalAssets).toBe(1000);
      expect(result.totalLiabilities).toBe(600);
      expect(result.totalEquity).toBe(400);
      expect(result.isBalanced).toBe(true); // 1000 == 600 + 400
    });

    it('flags imbalance when assets != liabilities + equity', async () => {
      const rows = [
        { account: { accountType: 'Asset' }, debitAmount: 1000, creditAmount: 0 },
        { account: { accountType: 'Liability' }, creditAmount: 300, debitAmount: 0 },
      ];
      glRepo.createQueryBuilder.mockReturnValue(makeQb(rows));
      const result = await service.getBalanceSheet({});
      expect(result.isBalanced).toBe(false);
    });
  });

  describe('getReceivablesAging (aging buckets)', () => {
    it('buckets an open invoice by days overdue and totals the summary', async () => {
      const asOf = '2026-06-30';
      // dueDate 45 days before asOf => bucket days30to60
      const dueDate = new Date('2026-05-16');
      const invoices = [
        {
          partyId: 'p1',
          partyName: 'Cust One',
          partyType: 'Customer',
          balanceAmount: 1000,
          dueDate,
          invoiceNumber: 'INV-1',
          invoiceDate: new Date('2026-04-16'),
          creditDays: 30,
          currency: 'INR',
        },
      ];
      invoiceRepo.createQueryBuilder.mockReturnValue(makeQb(invoices));

      const result = await service.getReceivablesAging({ asOfDate: asOf });

      expect(result.reportType).toBe('Receivables Aging');
      expect(result.data).toHaveLength(1);
      const bucket = result.data[0];
      expect(bucket.days30to60).toBe(1000);
      expect(bucket.current).toBe(0);
      expect(bucket.totalOutstanding).toBe(1000);
      expect(result.summary.total).toBe(1000);
      expect(result.summary.overdue).toBe(1000);
      expect(result.summary.overduePercentage).toBe(100);
      expect(result.summary.partyCount).toBe(1);
    });

    it('places a not-yet-overdue invoice in the current bucket', async () => {
      const asOf = '2026-06-30';
      const invoices = [
        {
          partyId: 'p2',
          partyName: 'Cust Two',
          partyType: 'Customer',
          balanceAmount: 500,
          dueDate: new Date('2026-06-20'), // 10 days => current
          invoiceNumber: 'INV-2',
          invoiceDate: new Date('2026-06-01'),
          creditDays: 30,
          currency: 'INR',
        },
      ];
      invoiceRepo.createQueryBuilder.mockReturnValue(makeQb(invoices));
      const result = await service.getReceivablesAging({ asOfDate: asOf });
      expect(result.data[0].current).toBe(500);
      expect(result.summary.overdue).toBe(0);
      expect(result.summary.overduePercentage).toBe(0);
    });
  });

  describe('getStatutoryComplianceReport', () => {
    it('sums GST liability from credit minus debit', async () => {
      const rows = [
        { creditAmount: 180, debitAmount: 0 },
        { creditAmount: 20, debitAmount: 0 },
      ];
      glRepo.createQueryBuilder.mockReturnValue(makeQb(rows));
      const result = await service.getStatutoryComplianceReport({
        companyId: 'c1',
        reportType: 'GST',
        startDate: '2026-01-01',
        endDate: '2026-03-31',
      });
      expect(result.totalLiability).toBe(200);
      expect(result.transactions).toBe(2);
      expect(result.reportType).toBe('GST Liability Report');
    });
  });
});
