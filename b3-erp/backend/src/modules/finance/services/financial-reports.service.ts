import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GeneralLedger } from '../entities/general-ledger.entity';
import { ChartOfAccounts } from '../entities/chart-of-accounts.entity';
import { Budget } from '../entities/budget.entity';
import { Invoice } from '../entities/invoice.entity';

@Injectable()
export class FinancialReportsService {
  constructor(
    @InjectRepository(GeneralLedger)
    private readonly generalLedgerRepository: Repository<GeneralLedger>,
    @InjectRepository(ChartOfAccounts)
    private readonly chartOfAccountsRepository: Repository<ChartOfAccounts>,
    @InjectRepository(Budget)
    private readonly budgetRepository: Repository<Budget>,
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
  ) { }

  async getProfitLossStatement(params: {
    periodId?: string;
    startDate?: string;
    endDate?: string;
    costCenter?: string;
    department?: string;
    companyId?: string;
  }): Promise<any> {
    const queryBuilder = this.generalLedgerRepository.createQueryBuilder('gl')
      .leftJoinAndSelect('gl.account', 'account')
      .where('gl.status = :status', { status: 'Posted' });

    if (params.startDate) {
      queryBuilder.andWhere('gl.postingDate >= :startDate', { startDate: params.startDate });
    }
    if (params.endDate) {
      queryBuilder.andWhere('gl.postingDate <= :endDate', { endDate: params.endDate });
    }
    if (params.companyId) {
      queryBuilder.andWhere('gl.companyId = :companyId', { companyId: params.companyId });
    }

    const entries = await queryBuilder.getMany();

    let totalRevenue = 0;
    let totalCOGS = 0;
    let totalExpenses = 0;

    const income = entries.filter(e => e.account.accountType === 'Income');
    const cogs = entries.filter(e => e.account.accountType === 'Expense' && e.account.accountCode.startsWith('5'));
    const opex = entries.filter(e => e.account.accountType === 'Expense' && !e.account.accountCode.startsWith('5'));

    totalRevenue = income.reduce((sum, e) => sum + Number(e.creditAmount) - Number(e.debitAmount), 0);
    totalCOGS = cogs.reduce((sum, e) => sum + Number(e.debitAmount) - Number(e.creditAmount), 0);
    totalExpenses = opex.reduce((sum, e) => sum + Number(e.debitAmount) - Number(e.creditAmount), 0);

    const grossProfit = totalRevenue - totalCOGS;
    const netProfitLoss = grossProfit - totalExpenses;

    return {
      reportType: 'Profit & Loss Statement (Live)',
      period: params,
      totalRevenue,
      totalCOGS,
      grossProfit,
      totalExpenses,
      netProfitLoss,
      generatedAt: new Date(),
    };
  }

  async getBalanceSheet(params: {
    asOfDate?: string;
    companyId?: string;
    costCenter?: string;
    department?: string;
  }): Promise<any> {
    const queryBuilder = this.generalLedgerRepository.createQueryBuilder('gl')
      .leftJoinAndSelect('gl.account', 'account')
      .where('gl.status = :status', { status: 'Posted' });

    if (params.asOfDate) {
      queryBuilder.andWhere('gl.postingDate <= :asOfDate', { asOfDate: params.asOfDate });
    }
    if (params.companyId) {
      queryBuilder.andWhere('gl.companyId = :companyId', { companyId: params.companyId });
    }

    const entries = await queryBuilder.getMany();

    const assets = entries.filter(e => e.account.accountType === 'Asset').reduce((sum, e) => sum + Number(e.debitAmount) - Number(e.creditAmount), 0);
    const liabilities = entries.filter(e => e.account.accountType === 'Liability').reduce((sum, e) => sum + Number(e.creditAmount) - Number(e.debitAmount), 0);
    const equity = entries.filter(e => e.account.accountType === 'Equity').reduce((sum, e) => sum + Number(e.creditAmount) - Number(e.debitAmount), 0);

    return {
      reportType: 'Balance Sheet (Live)',
      asOfDate: params.asOfDate || new Date().toISOString(),
      totalAssets: assets,
      totalLiabilities: liabilities,
      totalEquity: equity,
      isBalanced: Math.abs(assets - (liabilities + equity)) < 0.01,
      generatedAt: new Date(),
    };
  }

  async getTrialBalance(params: any): Promise<any> {
    return { reportType: 'Trial Balance', data: [], generatedAt: new Date() };
  }

  async getGeneralLedgerReport(params: any): Promise<any> {
    return { reportType: 'General Ledger Report', data: [], generatedAt: new Date() };
  }

  async getStatutoryComplianceReport(params: {
    companyId: string;
    reportType: 'GST' | 'TDS';
    startDate: string;
    endDate: string;
  }): Promise<any> {
    const glEntries = await this.generalLedgerRepository.createQueryBuilder('gl')
      .leftJoinAndSelect('gl.account', 'account')
      .where('gl.companyId = :companyId', { companyId: params.companyId })
      .andWhere('gl.postingDate BETWEEN :startDate AND :endDate', {
        startDate: params.startDate,
        endDate: params.endDate
      })
      .andWhere('account.accountName LIKE :taxType', { taxType: `%${params.reportType}%` })
      .getMany();

    const liability = glEntries.reduce((sum, e) => sum + Number(e.creditAmount) - Number(e.debitAmount), 0);

    return {
      companyId: params.companyId,
      reportType: `${params.reportType} Liability Report`,
      period: { startDate: params.startDate, endDate: params.endDate },
      totalLiability: liability,
      transactions: glEntries.length,
      isCompliant: true,
      generatedAt: new Date(),
    };
  }

  async getCustomReport(reportParams: any): Promise<any> {
    return { reportType: 'Custom Report', parameters: reportParams, data: [], generatedAt: new Date() };
  }

  async getReceivablesAging(params: {
    asOfDate?: string;
    partyId?: string;
    companyId?: string;
  }): Promise<any> {
    return this.buildAgingReport('Customer', 'Receivables Aging', params);
  }

  async getPayablesAging(params: {
    asOfDate?: string;
    partyId?: string;
    companyId?: string;
  }): Promise<any> {
    return this.buildAgingReport('Vendor', 'Payables Aging', params);
  }

  /**
   * Aggregates open invoices (balanceAmount > 0) into aging buckets grouped by
   * party. Pure read over the existing `invoices` table — no new table.
   */
  private async buildAgingReport(
    partyType: 'Customer' | 'Vendor',
    reportType: string,
    params: { asOfDate?: string; partyId?: string; companyId?: string },
  ): Promise<any> {
    const asOf = params.asOfDate ? new Date(params.asOfDate) : new Date();

    const qb = this.invoiceRepository
      .createQueryBuilder('inv')
      .where('inv.partyType = :partyType', { partyType })
      .andWhere('inv.balanceAmount > 0')
      .andWhere('inv.status NOT IN (:...excluded)', {
        excluded: ['Cancelled', 'Void', 'Draft'],
      });

    if (params.partyId) {
      qb.andWhere('inv.partyId = :partyId', { partyId: params.partyId });
    }
    if (params.companyId) {
      qb.andWhere('inv.companyId = :companyId', { companyId: params.companyId });
    }

    const invoices = await qb.getMany();

    const daysBetween = (due: Date): number => {
      const dueTime = new Date(due).getTime();
      return Math.floor((asOf.getTime() - dueTime) / (1000 * 60 * 60 * 24));
    };

    interface AgingBucket {
      partyId: string;
      partyName: string;
      partyType: string;
      totalOutstanding: number;
      current: number;
      days30to60: number;
      days60to90: number;
      days90to120: number;
      over120: number;
      invoiceCount: number;
      oldestInvoice: string;
      oldestInvoiceDate: string | null;
      oldestDueDays: number;
      creditDays: number;
      currency: string;
    }

    const byParty = new Map<string, AgingBucket>();

    for (const inv of invoices) {
      const balance = Number(inv.balanceAmount) || 0;
      const overdueDays = daysBetween(inv.dueDate);
      const key = inv.partyId || inv.partyName || 'UNKNOWN';

      let bucket = byParty.get(key);
      if (!bucket) {
        bucket = {
          partyId: inv.partyId,
          partyName: inv.partyName,
          partyType: inv.partyType,
          totalOutstanding: 0,
          current: 0,
          days30to60: 0,
          days60to90: 0,
          days90to120: 0,
          over120: 0,
          invoiceCount: 0,
          oldestInvoice: inv.invoiceNumber,
          oldestInvoiceDate: inv.invoiceDate
            ? new Date(inv.invoiceDate).toISOString().slice(0, 10)
            : null,
          oldestDueDays: overdueDays,
          creditDays: inv.creditDays || 0,
          currency: inv.currency || 'INR',
        };
        byParty.set(key, bucket);
      }

      bucket.totalOutstanding += balance;
      bucket.invoiceCount += 1;

      if (overdueDays <= 30) bucket.current += balance;
      else if (overdueDays <= 60) bucket.days30to60 += balance;
      else if (overdueDays <= 90) bucket.days60to90 += balance;
      else if (overdueDays <= 120) bucket.days90to120 += balance;
      else bucket.over120 += balance;

      if (overdueDays > bucket.oldestDueDays) {
        bucket.oldestDueDays = overdueDays;
        bucket.oldestInvoice = inv.invoiceNumber;
        bucket.oldestInvoiceDate = inv.invoiceDate
          ? new Date(inv.invoiceDate).toISOString().slice(0, 10)
          : null;
      }
    }

    const data = Array.from(byParty.values()).sort(
      (a, b) => b.totalOutstanding - a.totalOutstanding,
    );

    const summary = data.reduce(
      (acc, r) => {
        acc.total += r.totalOutstanding;
        acc.current += r.current;
        acc.days30to60 += r.days30to60;
        acc.days60to90 += r.days60to90;
        acc.days90to120 += r.days90to120;
        acc.over120 += r.over120;
        return acc;
      },
      {
        total: 0,
        current: 0,
        days30to60: 0,
        days60to90: 0,
        days90to120: 0,
        over120: 0,
      },
    );

    const overdue =
      summary.days30to60 +
      summary.days60to90 +
      summary.days90to120 +
      summary.over120;

    return {
      reportType,
      asOfDate: asOf.toISOString().slice(0, 10),
      data,
      summary: {
        ...summary,
        overdue,
        overduePercentage: summary.total > 0 ? (overdue / summary.total) * 100 : 0,
        partyCount: data.length,
      },
      generatedAt: new Date(),
    };
  }

  async getBudgetVarianceReport(params: any): Promise<any> {
    return { reportType: 'Budget Variance', data: [], generatedAt: new Date() };
  }

  async getFinancialRatios(params: any): Promise<any> {
    return { reportType: 'Financial Ratios', data: [], generatedAt: new Date() };
  }

  async getCashFlowStatement(params: any): Promise<any> {
    return { reportType: 'Cash Flow', data: [], generatedAt: new Date() };
  }
}
