'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { BarChart3, FileText, TrendingUp, Wallet, BookOpen, ArrowRight, RefreshCw } from 'lucide-react';
import { FinanceService } from '@/services/finance.service';

export default function FinancialReportsPage() {
  const [summary, setSummary] = useState<{
    receivable: number;
    payable: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const [ar, ap] = await Promise.all([
          FinanceService.getReceivablesAging().catch(() => ({ data: [], summary: null })),
          FinanceService.getPayablesAging().catch(() => ({ data: [], summary: null })),
        ]);
        const sumBalances = (rows: any[]) =>
          (rows || []).reduce(
            (s, r) =>
              s +
              Number(
                r?.totalOutstanding ??
                  r?.total ??
                  r?.balance ??
                  r?.outstandingAmount ??
                  r?.amount ??
                  0,
              ),
            0,
          );
        const receivable = Number(
          (ar as any)?.summary?.totalOutstanding ??
            (ar as any)?.summary?.total ??
            sumBalances((ar as any)?.data),
        );
        const payable = Number(
          (ap as any)?.summary?.totalOutstanding ??
            (ap as any)?.summary?.total ??
            sumBalances((ap as any)?.data),
        );
        if (!cancelled) setSummary({ receivable, payable });
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load report summary');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Number.isFinite(n) ? n : 0);

  const reportCategories = [
    {
      title: 'Primary Financial Statements',
      icon: FileText,
      color: 'blue',
      reports: [
        { name: 'Profit & Loss Statement', href: '/finance/reports/profit-loss', description: 'Income statement showing revenue and expenses' },
        { name: 'Balance Sheet', href: '/finance/reports/balance-sheet', description: 'Statement of financial position' },
        { name: 'Cash Flow Statement', href: '/finance/reports/cash-flow', description: 'Analysis of cash inflows and outflows' },
        { name: 'Trial Balance', href: '/finance/reports/trial-balance', description: 'Verify accounting accuracy' },
      ],
    },
    {
      title: 'Analytics & Insights',
      icon: TrendingUp,
      color: 'purple',
      reports: [
        { name: 'Financial Ratios', href: '/finance/analytics/financial-ratios', description: 'Key financial ratios and metrics' },
        { name: 'Profitability Analysis', href: '/finance/analytics/profitability-analysis', description: 'Detailed profitability breakdown' },
        { name: 'KPI Dashboard', href: '/finance/analytics/kpi-dashboard', description: 'Key performance indicators' },
      ],
    },
    {
      title: 'Cash & Banking',
      icon: Wallet,
      color: 'green',
      reports: [
        { name: 'Cash Flow Forecast', href: '/finance/cash/cash-flow-forecast', description: 'Future cash flow projections' },
        { name: 'Bank Accounts', href: '/finance/cash/bank-accounts', description: 'Bank account balances and transactions' },
        { name: 'Bank Reconciliation', href: '/finance/cash/bank-reconciliation', description: 'Reconcile bank statements' },
      ],
    },
    {
      title: 'General Ledger',
      icon: BookOpen,
      color: 'orange',
      reports: [
        { name: 'General Ledger', href: '/finance/accounting/general-ledger', description: 'Complete general ledger report' },
        { name: 'Ledger Report', href: '/finance/accounting/ledger-report', description: 'Account-wise ledger details' },
        { name: 'Chart of Accounts', href: '/finance/accounting/chart-of-accounts', description: 'View account structure' },
      ],
    },
  ];

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="w-full px-3 py-2 ">
          <div className="w-full space-y-3">
            {/* Live outstanding summary */}
            {loading && (
              <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                <RefreshCw className="h-4 w-4 animate-spin" /> Loading live report summary…
              </div>
            )}
            {error && !loading && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                Failed to load live summary: {error}
              </div>
            )}
            {summary && !loading && !error && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
                  <p className="text-xs text-gray-500">Total Outstanding Receivable</p>
                  <p className="text-2xl font-bold text-green-600">{fmt(summary.receivable)}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
                  <p className="text-xs text-gray-500">Total Outstanding Payable</p>
                  <p className="text-2xl font-bold text-red-600">{fmt(summary.payable)}</p>
                </div>
              </div>
            )}
            {/* Report Categories */}
            {reportCategories.map((category) => (
              <div key={category.title} className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-10 h-10 bg-${category.color}-100 rounded-lg flex items-center justify-center`}>
                    <category.icon className={`w-6 h-6 text-${category.color}-600`} />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">{category.title}</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {category.reports.map((report) => (
                    <Link
                      key={report.name}
                      href={report.href}
                      className="group p-3 rounded-lg border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 mb-1">
                            {report.name}
                          </h3>
                          <p className="text-sm text-gray-600">{report.description}</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
