import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StandardCost, VarianceAnalysis, WIPAccounting, CostCenter } from '../entities/cost-accounting.entity';
import { AnticipatedReceipt, AnticipatedPayment } from '../entities/cash-flow.entity';
import { FinancialYear, FinancialPeriod } from '../entities/financial-period.entity';
import { ChartOfAccounts } from '../entities/chart-of-accounts.entity';
import { JournalEntry } from '../entities/journal-entry.entity';
import { Invoice, InvoiceType } from '../entities/invoice.entity';

function stripMeta(data: any): any {
  const { id, createdAt, updatedAt, ...rest } = data || {};
  return rest;
}

/**
 * FinanceOperationsService — CRUD + aggregation over EXISTING finance entities
 * (standard costs, variance, WIP, profit centers, financial periods,
 * anticipated cash) that previously had no controller. Read-side only; no new
 * tables.
 */
@Injectable()
export class FinanceOperationsService {
  constructor(
    @InjectRepository(StandardCost) private readonly standardCostRepo: Repository<StandardCost>,
    @InjectRepository(VarianceAnalysis) private readonly varianceRepo: Repository<VarianceAnalysis>,
    @InjectRepository(WIPAccounting) private readonly wipRepo: Repository<WIPAccounting>,
    @InjectRepository(CostCenter) private readonly costCenterRepo: Repository<CostCenter>,
    @InjectRepository(AnticipatedReceipt) private readonly receiptRepo: Repository<AnticipatedReceipt>,
    @InjectRepository(AnticipatedPayment) private readonly paymentRepo: Repository<AnticipatedPayment>,
    @InjectRepository(FinancialYear) private readonly yearRepo: Repository<FinancialYear>,
    @InjectRepository(FinancialPeriod) private readonly periodRepo: Repository<FinancialPeriod>,
    @InjectRepository(ChartOfAccounts) private readonly coaRepo: Repository<ChartOfAccounts>,
    @InjectRepository(JournalEntry) private readonly journalRepo: Repository<JournalEntry>,
    @InjectRepository(Invoice) private readonly invoiceRepo: Repository<Invoice>,
  ) {}

  // ---- Standard costs ----
  listStandardCosts() { return this.standardCostRepo.find({ order: { createdAt: 'DESC' } }); }
  async getStandardCost(id: string) {
    const r = await this.standardCostRepo.findOne({ where: { id } });
    if (!r) throw new NotFoundException(`Standard cost ${id} not found`);
    return r;
  }
  createStandardCost(d: any) { return this.standardCostRepo.save(this.standardCostRepo.create(stripMeta(d))); }
  async updateStandardCost(id: string, d: any) {
    const r = await this.getStandardCost(id); Object.assign(r, stripMeta(d)); return this.standardCostRepo.save(r);
  }
  async deleteStandardCost(id: string) {
    const res = await this.standardCostRepo.delete(id);
    if (!res.affected) throw new NotFoundException(`Standard cost ${id} not found`);
  }

  // ---- Variance analysis ----
  listVariances() { return this.varianceRepo.find({ order: { createdAt: 'DESC' } }); }
  async getVariance(id: string) {
    const r = await this.varianceRepo.findOne({ where: { id } });
    if (!r) throw new NotFoundException(`Variance ${id} not found`);
    return r;
  }
  createVariance(d: any) { return this.varianceRepo.save(this.varianceRepo.create(stripMeta(d))); }
  async updateVariance(id: string, d: any) {
    const r = await this.getVariance(id); Object.assign(r, stripMeta(d)); return this.varianceRepo.save(r);
  }
  async deleteVariance(id: string) {
    const res = await this.varianceRepo.delete(id);
    if (!res.affected) throw new NotFoundException(`Variance ${id} not found`);
  }

  // ---- WIP accounting ----
  listWip() { return this.wipRepo.find({ order: { createdAt: 'DESC' } }); }
  async getWip(id: string) {
    const r = await this.wipRepo.findOne({ where: { id } });
    if (!r) throw new NotFoundException(`WIP ${id} not found`);
    return r;
  }
  createWip(d: any) { return this.wipRepo.save(this.wipRepo.create(stripMeta(d))); }
  async updateWip(id: string, d: any) {
    const r = await this.getWip(id); Object.assign(r, stripMeta(d)); return this.wipRepo.save(r);
  }
  async deleteWip(id: string) {
    const res = await this.wipRepo.delete(id);
    if (!res.affected) throw new NotFoundException(`WIP ${id} not found`);
  }

  // ---- Profit centers (cost centers flagged isProfitCenter) ----
  listProfitCenters() {
    return this.costCenterRepo.find({ where: { isProfitCenter: true }, order: { createdAt: 'DESC' } });
  }

  // ---- Anticipated receipts / payments ----
  listAnticipatedReceipts() { return this.receiptRepo.find({ order: { expectedDate: 'ASC' } }); }
  async getAnticipatedReceipt(id: string) {
    const r = await this.receiptRepo.findOne({ where: { id } });
    if (!r) throw new NotFoundException(`Anticipated receipt ${id} not found`);
    return r;
  }
  createAnticipatedReceipt(d: any) { return this.receiptRepo.save(this.receiptRepo.create(stripMeta(d))); }
  async updateAnticipatedReceipt(id: string, d: any) {
    const r = await this.getAnticipatedReceipt(id); Object.assign(r, stripMeta(d)); return this.receiptRepo.save(r);
  }
  async deleteAnticipatedReceipt(id: string) {
    const res = await this.receiptRepo.delete(id);
    if (!res.affected) throw new NotFoundException(`Anticipated receipt ${id} not found`);
  }

  listAnticipatedPayments() { return this.paymentRepo.find({ order: { expectedDate: 'ASC' } }); }
  async getAnticipatedPayment(id: string) {
    const r = await this.paymentRepo.findOne({ where: { id } });
    if (!r) throw new NotFoundException(`Anticipated payment ${id} not found`);
    return r;
  }
  createAnticipatedPayment(d: any) { return this.paymentRepo.save(this.paymentRepo.create(stripMeta(d))); }
  async updateAnticipatedPayment(id: string, d: any) {
    const r = await this.getAnticipatedPayment(id); Object.assign(r, stripMeta(d)); return this.paymentRepo.save(r);
  }
  async deleteAnticipatedPayment(id: string) {
    const res = await this.paymentRepo.delete(id);
    if (!res.affected) throw new NotFoundException(`Anticipated payment ${id} not found`);
  }

  // ---- Financial years / periods ----
  listFinancialYears() { return this.yearRepo.find({ order: { startDate: 'DESC' } }); }
  async getFinancialYear(id: string) {
    const r = await this.yearRepo.findOne({ where: { id }, relations: ['periods'] });
    if (!r) throw new NotFoundException(`Financial year ${id} not found`);
    return r;
  }
  createFinancialYear(d: any) { return this.yearRepo.save(this.yearRepo.create(stripMeta(d))); }
  async updateFinancialYear(id: string, d: any) {
    const r = await this.yearRepo.findOne({ where: { id } });
    if (!r) throw new NotFoundException(`Financial year ${id} not found`);
    Object.assign(r, stripMeta(d)); return this.yearRepo.save(r);
  }
  async deleteFinancialYear(id: string) {
    const res = await this.yearRepo.delete(id);
    if (!res.affected) throw new NotFoundException(`Financial year ${id} not found`);
  }

  listFinancialPeriods(financialYearId?: string) {
    return this.periodRepo.find({
      where: financialYearId ? { financialYearId } : {},
      order: { periodNumber: 'ASC' },
    });
  }
  async getFinancialPeriod(id: string) {
    const r = await this.periodRepo.findOne({ where: { id } });
    if (!r) throw new NotFoundException(`Financial period ${id} not found`);
    return r;
  }
  createFinancialPeriod(d: any) { return this.periodRepo.save(this.periodRepo.create(stripMeta(d))); }
  async updateFinancialPeriod(id: string, d: any) {
    const r = await this.getFinancialPeriod(id); Object.assign(r, stripMeta(d)); return this.periodRepo.save(r);
  }
  async deleteFinancialPeriod(id: string) {
    const res = await this.periodRepo.delete(id);
    if (!res.affected) throw new NotFoundException(`Financial period ${id} not found`);
  }

  // ---- Consolidation (aggregate balances across chart-of-accounts / entities) ----
  async getConsolidation(): Promise<any> {
    const [accounts, invoices] = await Promise.all([this.coaRepo.find(), this.invoiceRepo.find()]);
    const num = (v: any) => Number(v ?? 0);
    const byType: Record<string, number> = {};
    const byCurrency: Record<string, number> = {};
    for (const a of accounts) {
      const type = String(a.accountType || 'other').toLowerCase();
      const cur = (a as any).currency || 'INR';
      byType[type] = (byType[type] || 0) + num((a as any).currentBalance);
      byCurrency[cur] = (byCurrency[cur] || 0) + num((a as any).currentBalance);
    }
    const receivable = invoices
      .filter((i) => i.invoiceType === InvoiceType.SALES_INVOICE)
      .reduce((s, i) => s + num(i.balanceAmount), 0);
    const payable = invoices
      .filter((i) => i.invoiceType === InvoiceType.PURCHASE_INVOICE)
      .reduce((s, i) => s + num(i.balanceAmount), 0);
    return {
      accountCount: accounts.length,
      balancesByType: Object.entries(byType).map(([type, balance]) => ({ type, balance })),
      balancesByCurrency: Object.entries(byCurrency).map(([currency, balance]) => ({ currency, balance })),
      intercompany: { openReceivable: receivable, openPayable: payable, net: receivable - payable },
    };
  }

  // ---- Intercompany (open AR/AP treated as intercompany positions) ----
  async getIntercompany(): Promise<any> {
    const invoices = await this.invoiceRepo.find();
    const num = (v: any) => Number(v ?? 0);
    const sales = invoices.filter((i) => i.invoiceType === InvoiceType.SALES_INVOICE);
    const purchase = invoices.filter((i) => i.invoiceType === InvoiceType.PURCHASE_INVOICE);
    return {
      receivables: sales.map((i) => ({
        id: i.id,
        reference: (i as any).invoiceNumber,
        party: (i as any).partyName,
        amount: num(i.balanceAmount),
      })),
      payables: purchase.map((i) => ({
        id: i.id,
        reference: (i as any).invoiceNumber,
        party: (i as any).partyName,
        amount: num(i.balanceAmount),
      })),
      totalReceivable: sales.reduce((s, i) => s + num(i.balanceAmount), 0),
      totalPayable: purchase.reduce((s, i) => s + num(i.balanceAmount), 0),
    };
  }
}
