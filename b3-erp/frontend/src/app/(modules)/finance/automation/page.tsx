'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Zap, Bell, RefreshCw, ArrowRight } from 'lucide-react';
import { FinanceService } from '@/services/finance.service';

export default function AutomationPage() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const [workflows, recurring, alerts] = await Promise.all([
          FinanceService.getApprovalWorkflows().catch(() => []),
          FinanceService.getRecurringTransactions().catch(() => []),
          FinanceService.getAlerts().catch(() => []),
        ]);
        if (!cancelled) {
          setCounts({
            Workflows: (workflows || []).length,
            'Recurring Transactions': (recurring || []).length,
            'Alerts & Notifications': (alerts || []).length,
          });
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load automation data');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const automationModules = [
    {
      title: 'Workflows',
      description: 'Configure automated workflows for financial processes and approvals',
      href: '/finance/automation/workflows',
      icon: Zap,
      color: 'purple',
    },
    {
      title: 'Recurring Transactions',
      description: 'Set up and manage recurring journal entries and transactions',
      href: '/finance/automation/recurring-transactions',
      icon: RefreshCw,
      color: 'blue',
    },
    {
      title: 'Alerts & Notifications',
      description: 'Configure alerts for financial thresholds and important events',
      href: '/finance/automation/alerts',
      icon: Bell,
      color: 'orange',
    },
  ];

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-gray-50 to-purple-50">
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="w-full px-3 py-2 ">
          <div className="w-full space-y-3">
            {loading && (
              <div className="flex items-center gap-2 rounded-lg border border-purple-200 bg-purple-50 px-4 py-3 text-sm text-purple-700">
                <RefreshCw className="h-4 w-4 animate-spin" /> Loading automation configuration…
              </div>
            )}
            {error && !loading && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                Failed to load live counts: {error}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {automationModules.map((module) => (
                <Link
                  key={module.title}
                  href={module.href}
                  className="group bg-white rounded-xl shadow-sm border border-gray-200 p-3 hover:shadow-lg hover:border-purple-300 transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={`w-12 h-12 bg-${module.color}-100 rounded-lg flex items-center justify-center`}>
                      <module.icon className={`w-6 h-6 text-${module.color}-600`} />
                    </div>
                    {!loading && !error && (
                      <span className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-sm font-semibold text-purple-700">
                        {counts[module.title] ?? 0}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                    {module.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-2">{module.description}</p>
                  <div className="flex items-center text-purple-600 font-medium text-sm">
                    <span>Configure</span>
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
