'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Building2, GitMerge, ArrowRight, RefreshCw } from 'lucide-react';
import { FinanceService } from '@/services/finance.service';

interface ConsolidationStats {
  accountCount: number;
  intercompanyTxnCount: number;
  totalReceivable: number;
  totalPayable: number;
}

const numberFormat = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

export default function ConsolidationPage() {
  const [stats, setStats] = useState<ConsolidationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const [consolidation, intercompany] = await Promise.all([
          FinanceService.getConsolidation().catch(() => null),
          FinanceService.getIntercompany().catch(() => null),
        ]);
        if (!cancelled) {
          setStats({
            accountCount: Number(consolidation?.accountCount ?? 0),
            intercompanyTxnCount:
              (intercompany?.receivables?.length ?? 0) + (intercompany?.payables?.length ?? 0),
            totalReceivable: Number(
              intercompany?.totalReceivable ?? consolidation?.intercompany?.openReceivable ?? 0
            ),
            totalPayable: Number(
              intercompany?.totalPayable ?? consolidation?.intercompany?.openPayable ?? 0
            ),
          });
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load consolidation data');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const badgeByTitle: Record<string, number> = {
    'Financial Consolidation': stats?.accountCount ?? 0,
    'Intercompany Transactions': stats?.intercompanyTxnCount ?? 0,
  };

  const modules = [
    {
      title: 'Financial Consolidation',
      description: 'Consolidate financial statements across multiple entities and subsidiaries',
      href: '/finance/consolidation/financial-consolidation',
      icon: Building2,
      color: 'blue',
    },
    {
      title: 'Intercompany Transactions',
      description: 'Manage and eliminate intercompany transactions and balances',
      href: '/finance/consolidation/intercompany',
      icon: GitMerge,
      color: 'purple',
    },
  ];

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="w-full px-3 py-2 ">
          <div className="w-full space-y-3">
            {loading && (
              <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                <RefreshCw className="h-4 w-4 animate-spin" /> Loading consolidation data…
              </div>
            )}
            {error && !loading && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                Failed to load live numbers: {error}
              </div>
            )}
            {stats && !loading && !error && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 rounded-xl border border-blue-200 bg-white p-3 shadow-sm">
                <div>
                  <p className="text-xs font-medium text-gray-500">GL Accounts</p>
                  <p className="text-2xl font-bold text-blue-700">{numberFormat.format(stats.accountCount)}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">Intercompany Txns</p>
                  <p className="text-2xl font-bold text-blue-700">{numberFormat.format(stats.intercompanyTxnCount)}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">Open Receivable</p>
                  <p className="text-2xl font-bold text-blue-700">{numberFormat.format(stats.totalReceivable)}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">Open Payable</p>
                  <p className="text-2xl font-bold text-blue-700">{numberFormat.format(stats.totalPayable)}</p>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {modules.map((module) => (
                <Link key={module.title} href={module.href}
                  className="group bg-white rounded-xl shadow-sm border border-gray-200 p-3 hover:shadow-lg hover:border-blue-300 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`w-12 h-12 bg-${module.color}-100 rounded-lg flex items-center justify-center`}>
                      <module.icon className={`w-6 h-6 text-${module.color}-600`} />
                    </div>
                    {!loading && !error && (
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
                        {badgeByTitle[module.title] ?? 0}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{module.title}</h3>
                  <p className="text-gray-600 text-sm mb-2">{module.description}</p>
                  <div className="flex items-center text-blue-600 font-medium text-sm">
                    <span>Manage</span>
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
