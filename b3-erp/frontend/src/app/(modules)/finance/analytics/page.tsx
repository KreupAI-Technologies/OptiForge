'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { TrendingUp, BarChart3, PieChart, Target, ArrowRight, RefreshCw } from 'lucide-react';
import { FinanceService } from '@/services/finance.service';

export default function FinancialAnalyticsPage() {
  const [stats, setStats] = useState<{
    accountCount: number;
    journalCount: number;
    openReceivable: number;
    openPayable: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const d = (await FinanceService.getAdvancedDashboard()) as any;
        if (!cancelled) {
          setStats({
            accountCount: Number(d?.generalLedger?.accountCount ?? 0),
            journalCount: Number(d?.generalLedger?.journalCount ?? 0),
            openReceivable: Number(d?.compliance?.openReceivable ?? 0),
            openPayable: Number(d?.compliance?.openPayable ?? 0),
          });
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load analytics');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n);

  const analyticsModules = [
    {
      title: 'Financial Ratios',
      description: 'Analyze key financial ratios including liquidity, profitability, and efficiency metrics',
      href: '/finance/analytics/financial-ratios',
      icon: BarChart3,
      color: 'blue',
    },
    {
      title: 'Profitability Analysis',
      description: 'Deep dive into profit margins, cost analysis, and revenue breakdowns',
      href: '/finance/analytics/profitability-analysis',
      icon: TrendingUp,
      color: 'green',
    },
    {
      title: 'KPI Dashboard',
      description: 'Monitor key performance indicators and financial health metrics in real-time',
      href: '/finance/analytics/kpi-dashboard',
      icon: Target,
      color: 'purple',
    },
  ];

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-gray-50 to-purple-50">
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="w-full px-3 py-2 ">
          <div className="w-full space-y-3">
            {/* Live KPI banner */}
            {loading && (
              <div className="flex items-center gap-2 rounded-lg border border-purple-200 bg-purple-50 px-4 py-3 text-sm text-purple-700">
                <RefreshCw className="h-4 w-4 animate-spin" /> Loading live financial metrics…
              </div>
            )}
            {error && !loading && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                Failed to load live metrics: {error}
              </div>
            )}
            {stats && !loading && !error && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
                  <p className="text-xs text-gray-500">GL Accounts</p>
                  <p className="text-2xl font-bold text-gray-900">{fmt(stats.accountCount)}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
                  <p className="text-xs text-gray-500">Journal Entries</p>
                  <p className="text-2xl font-bold text-gray-900">{fmt(stats.journalCount)}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
                  <p className="text-xs text-gray-500">Open Receivable</p>
                  <p className="text-2xl font-bold text-green-600">{fmt(stats.openReceivable)}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
                  <p className="text-xs text-gray-500">Open Payable</p>
                  <p className="text-2xl font-bold text-red-600">{fmt(stats.openPayable)}</p>
                </div>
              </div>
            )}
            {/* Analytics Modules Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {analyticsModules.map((module) => (
                <Link
                  key={module.title}
                  href={module.href}
                  className="group bg-white rounded-xl shadow-sm border border-gray-200 p-3 hover:shadow-lg hover:border-purple-300 transition-all"
                >
                  <div className={`w-12 h-12 bg-${module.color}-100 rounded-lg flex items-center justify-center mb-2`}>
                    <module.icon className={`w-6 h-6 text-${module.color}-600`} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                    {module.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-2">{module.description}</p>
                  <div className="flex items-center text-purple-600 font-medium text-sm">
                    <span>View Analytics</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
