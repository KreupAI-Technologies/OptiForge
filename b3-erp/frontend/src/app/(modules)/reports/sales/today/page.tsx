'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, TrendingUp, Loader2, AlertCircle } from 'lucide-react';
import { fetchReportRows } from '@/services/reports-management.service';

interface SalesRow {
  orderNumber?: string;
  customer?: string;
  amount?: number;
  status?: string;
  time?: string;
  [key: string]: unknown;
}

export default function TodaysSalesReport() {
  const [rows, setRows] = useState<SalesRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchReportRows<SalesRow>('sales.today');
        if (!cancelled) setRows(data);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load report');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const total = rows.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

  return (
    <div className="w-full p-3">
      <div className="flex justify-between items-center mb-3">
        <div>
          <h1 className="text-3xl font-bold mb-2">Today&apos;s Sales</h1>
          <p className="text-gray-600">Orders and revenue booked today</p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      {error && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Orders Today</p>
          <p className="text-2xl font-bold text-blue-600">{loading ? '—' : rows.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Revenue Today</p>
          <p className="text-2xl font-bold text-green-600">
            {loading ? '—' : `₹${(total / 100000).toFixed(2)}L`}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Avg Order Value</p>
          <p className="text-2xl font-bold text-purple-600">
            {loading || rows.length === 0 ? '—' : `₹${(total / rows.length / 1000).toFixed(1)}K`}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center gap-2 text-gray-500 p-6">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Loading today&apos;s sales…</span>
          </div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <TrendingUp className="h-10 w-10 text-gray-300 mb-2" />
            <p className="text-gray-500 text-sm">No sales recorded for today yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Order #</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {rows.map((r, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{r.orderNumber || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{r.customer || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {r.amount !== undefined ? `₹${Number(r.amount).toLocaleString('en-IN')}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{r.status || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{r.time || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
