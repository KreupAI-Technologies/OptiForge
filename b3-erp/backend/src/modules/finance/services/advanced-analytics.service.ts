import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChartOfAccounts } from '../entities/chart-of-accounts.entity';
import { JournalEntry } from '../entities/journal-entry.entity';
import { Invoice, InvoiceType } from '../entities/invoice.entity';
import { Payment } from '../entities/payment.entity';

/**
 * AdvancedAnalyticsService
 *
 * Read-only aggregation over EXISTING finance entities (chart of accounts,
 * journal entries, invoices, payments). No new tables — powers the
 * finance/advanced-features dashboard (general ledger, consolidation,
 * audit-trail, compliance, treasury and cash-forecast summaries).
 */
@Injectable()
export class AdvancedAnalyticsService {
  constructor(
    @InjectRepository(ChartOfAccounts)
    private readonly coaRepo: Repository<ChartOfAccounts>,
    @InjectRepository(JournalEntry)
    private readonly journalRepo: Repository<JournalEntry>,
    @InjectRepository(Invoice)
    private readonly invoiceRepo: Repository<Invoice>,
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
  ) {}

  async getDashboard(): Promise<any> {
    const [accounts, journals, invoices] = await Promise.all([
      this.coaRepo.find(),
      this.journalRepo.find(),
      this.invoiceRepo.find(),
    ]);

    const num = (v: any) => Number(v ?? 0);

    // ---- General Ledger summary ------------------------------------------
    const glAccounts = accounts.map((a) => ({
      id: a.id,
      code: a.accountCode,
      name: a.accountName,
      type: String(a.accountType || '').toLowerCase(),
      currency: (a as any).currency || 'INR',
      isActive: (a as any).isActive ?? true,
      balance: num((a as any).currentBalance),
      openingBalance: num((a as any).openingBalance),
    }));

    const totalDebit = journals.reduce((s, j) => s + num(j.totalDebit), 0);
    const totalCredit = journals.reduce((s, j) => s + num(j.totalCredit), 0);
    const postedJournals = journals.filter(
      (j) => String((j as any).status || '').toLowerCase() === 'posted',
    ).length;

    // ---- Consolidation summary -------------------------------------------
    const byCurrency: Record<string, number> = {};
    for (const a of glAccounts) {
      byCurrency[a.currency] = (byCurrency[a.currency] || 0) + a.balance;
    }

    // ---- Treasury / cash summary -----------------------------------------
    const cashAccounts = glAccounts.filter(
      (a) => a.type === 'asset' && /cash|bank/i.test(a.name),
    );
    const cashPosition = cashAccounts.reduce((s, a) => s + a.balance, 0);

    // ---- Cash forecast (from open invoices) ------------------------------
    const receivable = invoices
      .filter((i) => i.invoiceType === InvoiceType.SALES_INVOICE)
      .reduce((s, i) => s + num(i.balanceAmount), 0);
    const payable = invoices
      .filter((i) => i.invoiceType === InvoiceType.PURCHASE_INVOICE)
      .reduce((s, i) => s + num(i.balanceAmount), 0);

    return {
      generalLedger: {
        accountCount: glAccounts.length,
        accounts: glAccounts,
        journalCount: journals.length,
        postedJournalCount: postedJournals,
        totalDebit,
        totalCredit,
        isBalanced: Math.abs(totalDebit - totalCredit) < 0.01,
      },
      consolidation: {
        entityCount: Object.keys(byCurrency).length,
        balancesByCurrency: Object.entries(byCurrency).map(([currency, balance]) => ({
          currency,
          balance,
        })),
      },
      auditTrail: {
        totalEntries: journals.length,
        posted: postedJournals,
        draft: journals.length - postedJournals,
      },
      compliance: {
        openReceivable: receivable,
        openPayable: payable,
      },
      treasury: {
        cashPosition,
        cashAccounts,
      },
      cashForecast: {
        expectedInflow: receivable,
        expectedOutflow: payable,
        netProjected: receivable - payable,
      },
    };
  }
}
