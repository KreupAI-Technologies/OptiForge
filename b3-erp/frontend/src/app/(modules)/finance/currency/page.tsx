'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { DollarSign, TrendingUp, RefreshCw, ArrowRight } from 'lucide-react';
import { FinanceService } from '@/services/finance.service';

export default function CurrencyPage() {
  const [rateCount, setRateCount] = useState<number>(0);
  const [currencyCount, setCurrencyCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const rates = await FinanceService.getExchangeRates().catch(() => []);
        const rows = rates || [];
        const currencies = new Set<string>();
        for (const row of rows) {
          if (!row || typeof row !== 'object') continue;
          const r = row as Record<string, unknown>;
          for (const key of ['fromCurrency', 'toCurrency', 'currency', 'baseCurrency', 'quoteCurrency']) {
            const val = r[key];
            if (typeof val === 'string' && val.trim()) currencies.add(val.trim());
          }
        }
        if (!cancelled) {
          setRateCount(rows.length);
          setCurrencyCount(currencies.size > 0 ? currencies.size : rows.length);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load currency data');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const modules = [
    {
      title: 'Currency Management',
      description: 'Manage multiple currencies and their configurations',
      href: '/finance/currency/management',
      icon: DollarSign,
      color: 'blue',
      count: currencyCount,
    },
    {
      title: 'Exchange Rates',
      description: 'Configure and update currency exchange rates',
      href: '/finance/currency/exchange-rates',
      icon: TrendingUp,
      color: 'green',
      count: rateCount,
    },
  ];

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-gray-50 to-green-50">
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="w-full px-3 py-2 ">
          <div className="w-full space-y-3">
            {loading && (
              <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                <RefreshCw className="h-4 w-4 animate-spin" /> Loading currency configuration…
              </div>
            )}
            {error && !loading && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                Failed to load live counts: {error}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {modules.map((module) => (
                <Link key={module.title} href={module.href}
                  className="group bg-white rounded-xl shadow-sm border border-gray-200 p-3 hover:shadow-lg hover:border-green-300 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`w-12 h-12 bg-${module.color}-100 rounded-lg flex items-center justify-center`}>
                      <module.icon className={`w-6 h-6 text-${module.color}-600`} />
                    </div>
                    {!loading && !error && (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
                        {module.count}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">{module.title}</h3>
                  <p className="text-gray-600 text-sm mb-2">{module.description}</p>
                  <div className="flex items-center text-green-600 font-medium text-sm">
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
