import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CashFlowTransaction,
  CashFlowType,
  TransactionSource,
} from '../entities/cash-flow.entity';

/**
 * Cash management analytics — aggregates the existing cash_flow_transactions
 * table (no new table) to back the finance cash dashboard which previously
 * rendered a hardcoded mock array.
 */
@Injectable()
export class CashAnalyticsService {
  constructor(
    @InjectRepository(CashFlowTransaction)
    private readonly repo: Repository<CashFlowTransaction>,
  ) {}

  async getDashboard(): Promise<any> {
    const rows = await this.repo.find({ order: { transactionDate: 'DESC' } });

    let totalInflow = 0;
    let totalOutflow = 0;
    let forecastInflow = 0;
    let forecastOutflow = 0;

    for (const t of rows) {
      const amt = Number(t.amount) || 0;
      const isForecast = t.source === TransactionSource.FORECAST;
      if (t.flowType === CashFlowType.INFLOW) {
        if (isForecast) forecastInflow += amt;
        else totalInflow += amt;
      } else {
        if (isForecast) forecastOutflow += amt;
        else totalOutflow += amt;
      }
    }

    const netCashFlow = totalInflow - totalOutflow;

    // Recent actual transactions (mapped to page shape).
    let running = netCashFlow;
    const recentTransactions = rows
      .filter((t) => t.source === TransactionSource.ACTUAL)
      .slice(0, 10)
      .map((t) => {
        const amt = Number(t.amount) || 0;
        const type = t.flowType === CashFlowType.INFLOW ? 'receipt' : 'payment';
        const row = {
          id: t.id,
          transactionNumber: t.transactionNumber,
          date: t.transactionDate,
          type,
          category: t.category,
          description: t.description,
          amount: amt,
          balance: running,
          account: t.bankAccountId || '',
          party: t.partyName || '',
          status: 'Cleared',
        };
        running -= t.flowType === CashFlowType.INFLOW ? amt : -amt;
        return row;
      });

    // Forecast grouped by month.
    const forecastMap = new Map<
      string,
      { period: string; expectedReceipts: number; expectedPayments: number }
    >();
    for (const t of rows.filter((r) => r.source === TransactionSource.FORECAST)) {
      const d = new Date(t.transactionDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const entry =
        forecastMap.get(key) ??
        { period: key, expectedReceipts: 0, expectedPayments: 0 };
      const amt = Number(t.amount) || 0;
      if (t.flowType === CashFlowType.INFLOW) entry.expectedReceipts += amt;
      else entry.expectedPayments += amt;
      forecastMap.set(key, entry);
    }
    let projected = netCashFlow;
    const forecast = Array.from(forecastMap.values())
      .sort((a, b) => a.period.localeCompare(b.period))
      .map((f) => {
        const netFlow = f.expectedReceipts - f.expectedPayments;
        projected += netFlow;
        return { ...f, netFlow, projectedBalance: projected };
      });

    return {
      stats: {
        currentBalance: netCashFlow,
        totalInflow,
        totalOutflow,
        netCashFlow,
        forecastInflow,
        forecastOutflow,
        projectedBalance: netCashFlow + forecastInflow - forecastOutflow,
      },
      transactions: recentTransactions,
      forecast,
    };
  }
}
