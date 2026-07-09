'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Package, Loader2, AlertCircle } from 'lucide-react';
import { fetchReportRows } from '@/services/reports-management.service';

interface StockRow {
  sku?: string;
  name?: string;
  category?: string;
  quantity?: number;
  reorderLevel?: number;
  location?: string;
  status?: string;
  [key: string]: unknown;
}

export default function CurrentStockReport() {
  const [rows, setRows] = useState<StockRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchReportRows<StockRow>('inventory.current-stock');
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

  const lowCount = rows.filter(
    (r) => r.quantity !== undefined && r.reorderLevel !== undefined && Number(r.quantity) <= Number(r.reorderLevel),
  ).length;

  return (
    <div className="w-full p-3">
      <div className="flex justify-between items-center mb-3">
        <div>
          <h1 className="text-3xl font-bold mb-2">Current Stock</h1>
          <p className="text-gray-600">Live stock levels across warehouses</p>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Items in Stock</p>
          <p className="text-2xl font-bold text-blue-600">{loading ? '—' : rows.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Below Reorder Level</p>
          <p className="text-2xl font-bold text-orange-600">{loading ? '—' : lowCount}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center gap-2 text-gray-500 p-6">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Loading current stock…</span>
          </div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Package className="h-10 w-10 text-gray-300 mb-2" />
            <p className="text-gray-500 text-sm">No stock data available.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">SKU</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Item</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Qty</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Reorder</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {rows.map((r, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{r.sku || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{r.name || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{r.category || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{r.quantity ?? '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{r.reorderLevel ?? '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{r.location || '—'}</td>
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
