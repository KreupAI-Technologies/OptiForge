'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Factory, ShoppingCart, ArrowRight, RefreshCw } from 'lucide-react';
import { FinanceService } from '@/services/finance.service';

export default function IntegrationPage() {
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const list = await FinanceService.getIntegrations().catch(() => []);
        if (!cancelled) setIntegrations(list || []);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load integration data');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const totalCount = integrations.length;
  const connectedCount = integrations.filter((i) => {
    const s = String(i.status || '').toLowerCase();
    return s === 'connected' || s === 'active';
  }).length;

  const countMatching = (keywords: string[]) =>
    integrations.filter((i) => {
      const hay = `${String(i.type || '')} ${String(i.name || '')}`.toLowerCase();
      return keywords.some((k) => hay.includes(k));
    }).length;

  const modules = [
    {
      title: 'Production Integration',
      description: 'Integration with production module for cost accounting and WIP management',
      href: '/finance/integration/production',
      icon: Factory,
      color: 'blue',
      badge: countMatching(['production']),
    },
    {
      title: 'Procurement Integration',
      description: 'Seamless integration with procurement for purchase accounting',
      href: '/finance/integration/procurement',
      icon: ShoppingCart,
      color: 'purple',
      badge: countMatching(['procurement', 'purchase']),
    },
  ];

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="w-full px-3 py-2 ">
          <div className="w-full space-y-3">
            {loading && (
              <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                <RefreshCw className="h-4 w-4 animate-spin" /> Loading integration configuration…
              </div>
            )}
            {error && !loading && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                Failed to load live counts: {error}
              </div>
            )}
            {!loading && !error && (
              <div className="flex flex-wrap items-center gap-4 rounded-lg border border-blue-200 bg-white px-4 py-3 text-sm">
                <span className="text-gray-700">
                  Configured Integrations:{' '}
                  <span className="font-semibold text-blue-700">{totalCount}</span>
                </span>
                <span className="text-gray-700">
                  Active/Connected:{' '}
                  <span className="font-semibold text-green-700">{connectedCount}</span>
                </span>
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
                        {module.badge}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{module.title}</h3>
                  <p className="text-gray-600 text-sm mb-2">{module.description}</p>
                  <div className="flex items-center text-blue-600 font-medium text-sm">
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
