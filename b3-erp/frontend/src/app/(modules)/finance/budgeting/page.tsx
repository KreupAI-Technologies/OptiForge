'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Target, BarChart3, TrendingUp, RefreshCw, ArrowRight } from 'lucide-react';
import { FinanceService } from '@/services/finance.service';

export default function BudgetingPage() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const [budgets, costCenters] = await Promise.all([
          FinanceService.getBudgets().catch(() => []),
          FinanceService.getCostCenters().catch(() => []),
        ]);
        if (!cancelled) {
          const budgetCount = (budgets || []).length;
          setCounts({
            Budgets: budgetCount,
            'Budget vs Actual': budgetCount,
            'Multi-Year Planning': (costCenters || []).length,
          });
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load budgeting data');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const budgetingModules = [
    {
      title: 'Budgets',
      description: 'Create and manage annual budgets for all departments and cost centers',
      href: '/finance/budgeting/budgets',
      icon: Target,
      color: 'blue',
    },
    {
      title: 'Budget vs Actual',
      description: 'Compare actual performance against budgeted figures and analyze variances',
      href: '/finance/budgeting/budget-vs-actual',
      icon: BarChart3,
      color: 'green',
    },
    {
      title: 'Multi-Year Planning',
      description: 'Long-term financial planning and multi-year budget forecasting',
      href: '/finance/budgeting/multi-year-planning',
      icon: TrendingUp,
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
                <RefreshCw className="h-4 w-4 animate-spin" /> Loading budgeting data…
              </div>
            )}
            {error && !loading && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                Failed to load live counts: {error}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {budgetingModules.map((module) => (
                <Link
                  key={module.title}
                  href={module.href}
                  className="group bg-white rounded-xl shadow-sm border border-gray-200 p-3 hover:shadow-lg hover:border-blue-300 transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={`w-12 h-12 bg-${module.color}-100 rounded-lg flex items-center justify-center`}>
                      <module.icon className={`w-6 h-6 text-${module.color}-600`} />
                    </div>
                    {!loading && !error && (
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
                        {counts[module.title] ?? 0}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {module.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-2">{module.description}</p>
                  <div className="flex items-center text-blue-600 font-medium text-sm">
                    <span>View Details</span>
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
