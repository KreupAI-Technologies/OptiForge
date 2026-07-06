'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Calendar, Download, Printer, Search, Filter, FileText, BarChart3,
  ArrowUpCircle, ArrowDownCircle, Eye, TrendingUp, DollarSign,
  ChevronLeft, ChevronRight, RefreshCw, Info, Hash, BookOpen, CheckCircle
} from 'lucide-react';
import { exportToCsv, printCurrentView } from '@/lib/export';
import { FinanceService } from '@/services/finance.service';

// TypeScript Interfaces
interface LedgerTransaction {
  id: string;
  date: string;
  entryNumber: string;
  description: string;
  referenceNumber: string;
  transactionType: 'Manual' | 'System' | 'Adjustment' | 'Closing' | 'Opening' | 'Reversal';
  debitAmount: number;
  creditAmount: number;
  balance: number;
  balanceType: 'Dr' | 'Cr';
}

interface Account {
  id: string;
  code: string;
  name: string;
  type: 'Asset' | 'Liability' | 'Equity' | 'Income' | 'Expense';
  openingBalance: number;
  openingBalanceType: 'Dr' | 'Cr';
}

interface MonthBreakdown {
  month: string;
  openingBalance: number;
  totalDebit: number;
  totalCredit: number;
  closingBalance: number;
  balanceType: 'Dr' | 'Cr';
  transactionCount: number;
}

const EMPTY_ACCOUNT: Account = {
  id: '',
  code: '',
  name: '',
  type: 'Asset',
  openingBalance: 0,
  openingBalanceType: 'Dr',
};

// Map a finance.service AccountType to this page's narrow type union
const mapAccountType = (t: string): Account['type'] => {
  switch (String(t).toUpperCase()) {
    case 'ASSET': return 'Asset';
    case 'LIABILITY': return 'Liability';
    case 'EQUITY': return 'Equity';
    case 'REVENUE': return 'Income';
    case 'EXPENSE': return 'Expense';
    default: return 'Asset';
  }
};

const mapTransactionType = (raw: any): LedgerTransaction['transactionType'] => {
  const v = String(raw || '').toLowerCase();
  if (v.includes('system') || v.includes('auto')) return 'System';
  if (v.includes('adjust')) return 'Adjustment';
  if (v.includes('closing')) return 'Closing';
  if (v.includes('opening')) return 'Opening';
  if (v.includes('reversal') || v.includes('reversing')) return 'Reversal';
  return 'Manual';
};

export default function LedgerReportPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [dateFrom, setDateFrom] = useState('2025-10-01');
  const [dateTo, setDateTo] = useState('2025-10-31');
  const [transactionTypeFilter, setTransactionTypeFilter] = useState<string>('all');
  const [transactions, setTransactions] = useState<LedgerTransaction[]>([]);
  const [monthBreakdown, setMonthBreakdown] = useState<MonthBreakdown[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showMonthBreakdown, setShowMonthBreakdown] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const itemsPerPage = 15;

  // Load chart of accounts for the dropdown
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const accts = await FinanceService.getChartOfAccounts();
        if (cancelled) return;
        const mapped: Account[] = (Array.isArray(accts) ? accts : []).map((a) => ({
          id: a.id,
          code: a.code,
          name: a.name,
          type: mapAccountType(a.type),
          openingBalance: Number(a.balance) || 0,
          openingBalanceType: Number(a.balance) >= 0 ? 'Dr' : 'Cr',
        }));
        setAccounts(mapped);
        // Honour URL param (by code) if present, otherwise default to first
        const accountParam = searchParams.get('account');
        const byParam = accountParam
          ? mapped.find((a) => a.code === accountParam || a.id === accountParam)
          : undefined;
        if (byParam) setSelectedAccount(byParam.id);
        else if (mapped.length > 0) setSelectedAccount((prev) => prev || mapped[0].id);
      } catch {
        if (!cancelled) setAccounts([]);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Get selected account details
  const account = accounts.find((a) => a.id === selectedAccount) || EMPTY_ACCOUNT;

  // Load ledger transactions whenever account / dates / refresh change
  useEffect(() => {
    if (!selectedAccount) {
      setTransactions([]);
      setMonthBreakdown([]);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const report = await FinanceService.getGeneralLedgerReport({
          accountId: selectedAccount,
          startDate: dateFrom,
          endDate: dateTo,
        });
        if (cancelled) return;

        const rawRows: any[] = Array.isArray(report)
          ? report
          : Array.isArray(report?.entries)
            ? report.entries
            : Array.isArray(report?.transactions)
              ? report.transactions
              : Array.isArray(report?.data)
                ? report.data
                : [];

        const rows: LedgerTransaction[] = rawRows.map((r: any, i: number) => {
          const balance = Number(r.balance ?? r.runningBalance ?? 0) || 0;
          return {
            id: String(r.id ?? r.entryId ?? `L-${i}`),
            date: String(r.date ?? r.entryDate ?? r.transactionDate ?? ''),
            entryNumber: String(r.entryNumber ?? r.voucherNumber ?? r.reference ?? ''),
            description: String(r.description ?? r.narration ?? ''),
            referenceNumber: String(r.referenceNumber ?? r.reference ?? r.voucherNumber ?? ''),
            transactionType: mapTransactionType(r.transactionType ?? r.type),
            debitAmount: Number(r.debitAmount ?? r.debit ?? 0) || 0,
            creditAmount: Number(r.creditAmount ?? r.credit ?? 0) || 0,
            balance,
            balanceType: (r.balanceType as 'Dr' | 'Cr') ?? (balance >= 0 ? 'Dr' : 'Cr'),
          };
        });
        setTransactions(rows);

        // Compute a month-wise breakdown from the loaded rows
        const byMonth = new Map<string, MonthBreakdown & { _order: number }>();
        rows.forEach((t) => {
          if (!t.date) return;
          const d = new Date(t.date);
          if (isNaN(d.getTime())) return;
          const key = d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
          const order = d.getFullYear() * 12 + d.getMonth();
          const existing = byMonth.get(key);
          if (existing) {
            existing.totalDebit += t.debitAmount;
            existing.totalCredit += t.creditAmount;
            existing.closingBalance = t.balance;
            existing.balanceType = t.balanceType;
            existing.transactionCount += 1;
          } else {
            byMonth.set(key, {
              _order: order,
              month: key,
              openingBalance: t.balance - t.debitAmount + t.creditAmount,
              totalDebit: t.debitAmount,
              totalCredit: t.creditAmount,
              closingBalance: t.balance,
              balanceType: t.balanceType,
              transactionCount: 1,
            });
          }
        });
        const breakdown = Array.from(byMonth.values())
          .sort((a, b) => a._order - b._order)
          .map(({ _order, ...rest }) => rest);
        setMonthBreakdown(breakdown);
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message || 'Failed to load ledger');
          setTransactions([]);
          setMonthBreakdown([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAccount, dateFrom, dateTo, refreshKey]);

  // Filter transactions
  const filteredTransactions = transactions.filter((transaction) => {
    const matchesType = transactionTypeFilter === 'all' || transaction.transactionType === transactionTypeFilter;
    const matchesDateFrom = !dateFrom || transaction.date >= dateFrom;
    const matchesDateTo = !dateTo || transaction.date <= dateTo;
    return matchesType && matchesDateFrom && matchesDateTo;
  });

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage);

  // Calculate totals
  const totalDebit = filteredTransactions.reduce((sum, t) => sum + t.debitAmount, 0);
  const totalCredit = filteredTransactions.reduce((sum, t) => sum + t.creditAmount, 0);
  const closingBalance = filteredTransactions.length > 0
    ? filteredTransactions[filteredTransactions.length - 1].balance
    : account.openingBalance;

  const transactionTypeConfig = {
    Manual: { color: 'bg-blue-100 text-blue-700' },
    System: { color: 'bg-purple-100 text-purple-700' },
    Adjustment: { color: 'bg-orange-100 text-orange-700' },
    Closing: { color: 'bg-red-100 text-red-700' },
    Opening: { color: 'bg-green-100 text-green-700' },
    Reversal: { color: 'bg-pink-100 text-pink-700' },
  };

  const handlePrint = () => {
    printCurrentView();
  };

  const handleExport = (_format: 'excel' | 'pdf') => {
    exportToCsv('ledger-report', filteredTransactions as unknown as Record<string, unknown>[]);
  };

  return (
    <div className="w-full h-full px-3 py-2">
      {/* Header */}
      <div className="mb-3">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <span>Ledger Report</span>
            </h1>
            <p className="text-gray-600 mt-1">Account-wise transaction details with running balance</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Printer className="h-4 w-4" />
              <span>Print</span>
            </button>
            <div className="relative group">
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                <button
                  onClick={() => handleExport('excel')}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 rounded-t-lg"
                >
                  Export as Excel
                </button>
                <button
                  onClick={() => handleExport('pdf')}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 rounded-b-lg"
                >
                  Export as PDF
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Account Selection & Info */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-100 border border-blue-200 rounded-lg p-3 mb-3">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Account</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  value={selectedAccount}
                  onChange={(e) => setSelectedAccount(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg font-semibold"
                >
                  {accounts.length === 0 && <option value="">No accounts</option>}
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.code} - {acc.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="bg-white rounded-lg p-3 border border-blue-200">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Account Information</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Account Code:</span>
                  <span className="text-sm font-semibold text-blue-600 font-mono">{account.code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Account Name:</span>
                  <span className="text-sm font-semibold text-gray-900">{account.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Account Type:</span>
                  <span className="text-sm font-semibold text-purple-700">{account.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Opening Balance:</span>
                  <span className={`text-sm font-bold ${account.openingBalanceType === 'Dr' ? 'text-orange-700' : 'text-green-700'}`}>
                    ₹{account.openingBalance.toLocaleString()} {account.openingBalanceType}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Opening Balance</p>
                <p className="text-2xl font-bold text-purple-900 mt-1">₹{(account.openingBalance / 1000).toFixed(0)}K</p>
                <p className="text-xs text-purple-600 mt-1">{account.openingBalanceType}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Total Debits</p>
                <p className="text-2xl font-bold text-orange-900 mt-1">₹{(totalDebit / 1000).toFixed(0)}K</p>
              </div>
              <ArrowUpCircle className="h-8 w-8 text-orange-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Total Credits</p>
                <p className="text-2xl font-bold text-green-900 mt-1">₹{(totalCredit / 1000).toFixed(0)}K</p>
              </div>
              <ArrowDownCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Closing Balance</p>
                <p className="text-2xl font-bold text-blue-900 mt-1">₹{(closingBalance / 1000).toFixed(0)}K</p>
                <p className="text-xs text-blue-600 mt-1">Dr</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-3 mb-3">
        <div className="flex items-center space-x-2 mb-2">
          <Filter className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Filters & Options</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Type</label>
            <select
              value={transactionTypeFilter}
              onChange={(e) => setTransactionTypeFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="Manual">Manual</option>
              <option value="System">System</option>
              <option value="Adjustment">Adjustment</option>
              <option value="Closing">Closing</option>
              <option value="Opening">Opening</option>
              <option value="Reversal">Reversal</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => setShowMonthBreakdown(!showMonthBreakdown)}
              className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-colors ${showMonthBreakdown
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'border border-gray-300 hover:bg-gray-50'
                }`}
            >
              <BarChart3 className="h-4 w-4" />
              <span>Month Breakdown</span>
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2 mt-4">
          <button
            onClick={() => setRefreshKey((k) => k + 1)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh Data</span>
          </button>
          {loading && <span className="text-sm text-gray-500">Loading…</span>}
          {error && <span className="text-sm text-red-600">{error}</span>}
        </div>
      </div>

      {/* Month Breakdown */}
      {showMonthBreakdown && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-3">
          <div className="bg-gray-50 border-b border-gray-200 px-3 py-2">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
              Month-wise Breakdown
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Opening Balance</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total Debit</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total Credit</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Closing Balance</th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">Transactions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {monthBreakdown.map((month) => (
                  <tr key={month.month} className="hover:bg-gray-50">
                    <td className="px-3 py-2 font-semibold text-gray-900">{month.month}</td>
                    <td className="px-3 py-2 text-right font-semibold text-gray-700">
                      ₹{month.openingBalance.toLocaleString()}
                    </td>
                    <td className="px-3 py-2 text-right font-semibold text-orange-700">
                      ₹{month.totalDebit.toLocaleString()}
                    </td>
                    <td className="px-3 py-2 text-right font-semibold text-green-700">
                      ₹{month.totalCredit.toLocaleString()}
                    </td>
                    <td className="px-3 py-2 text-right font-bold text-blue-700">
                      ₹{month.closingBalance.toLocaleString()} {month.balanceType}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                        {month.transactionCount}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Transactions Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-200 px-3 py-2">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-blue-600" />
            Transaction Details
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-300">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Entry No.</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Debit (₹)</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Credit (₹)</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Balance (₹)</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {/* Opening Balance Row */}
              <tr className="bg-blue-50 font-semibold">
                <td className="px-3 py-2" colSpan={4}>
                  <div className="flex items-center space-x-2">
                    <Info className="h-5 w-5 text-blue-600" />
                    <span className="text-blue-900">Opening Balance</span>
                  </div>
                </td>
                <td className="px-3 py-2 text-right text-gray-400">-</td>
                <td className="px-3 py-2 text-right text-gray-400">-</td>
                <td className="px-3 py-2 text-right">
                  <span className={`font-bold ${account.openingBalanceType === 'Dr' ? 'text-orange-700' : 'text-green-700'}`}>
                    ₹{account.openingBalance.toLocaleString()} {account.openingBalanceType}
                  </span>
                </td>
                <td className="px-3 py-2"></td>
              </tr>

              {/* Transaction Rows */}
              {paginatedTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 text-sm text-gray-900">{transaction.date}</td>
                  <td className="px-3 py-2">
                    <div className="font-mono text-sm font-semibold text-blue-600">{transaction.entryNumber}</div>
                    <div className="text-xs text-gray-500">{transaction.referenceNumber}</div>
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-900">{transaction.description}</td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-1 text-xs font-semibold rounded ${transactionTypeConfig[transaction.transactionType].color}`}>
                      {transaction.transactionType}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right">
                    {transaction.debitAmount > 0 ? (
                      <span className="font-semibold text-orange-700">
                        {transaction.debitAmount.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {transaction.creditAmount > 0 ? (
                      <span className="font-semibold text-green-700">
                        {transaction.creditAmount.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <span className={`font-bold ${transaction.balanceType === 'Dr' ? 'text-orange-700' : 'text-green-700'}`}>
                      {transaction.balance.toLocaleString()} {transaction.balanceType}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <button
                      onClick={() => router.push(`/finance/accounting/view/${transaction.entryNumber}`)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"

                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}

              {/* Closing Balance Row */}
              <tr className="bg-blue-50 font-bold border-t-2 border-gray-300">
                <td className="px-3 py-2" colSpan={4}>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                    <span className="text-blue-900">Closing Balance</span>
                  </div>
                </td>
                <td className="px-3 py-2 text-right text-orange-700">₹{totalDebit.toLocaleString()}</td>
                <td className="px-3 py-2 text-right text-green-700">₹{totalCredit.toLocaleString()}</td>
                <td className="px-3 py-2 text-right">
                  <span className="font-bold text-blue-900 text-lg">
                    ₹{closingBalance.toLocaleString()} Dr
                  </span>
                </td>
                <td className="px-3 py-2"></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-3 py-2 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredTransactions.length)} of{' '}
            {filteredTransactions.length} transactions
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((page) => {
                  return page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1);
                })
                .map((page, index, array) => (
                  <div key={page} className="flex items-center">
                    {index > 0 && array[index - 1] !== page - 1 && <span className="px-2 text-gray-400">...</span>}
                    <button
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 rounded-lg ${currentPage === page ? 'bg-blue-600 text-white' : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                      {page}
                    </button>
                  </div>
                ))}
            </div>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
