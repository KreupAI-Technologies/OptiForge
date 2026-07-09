'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Factory, Loader2, AlertCircle } from 'lucide-react';
import { fetchReportRows } from '@/services/reports-management.service';

interface WorkOrderRow {
  woNumber?: string;
  product?: string;
  quantity?: number;
  progress?: number;
  status?: string;
  dueDate?: string;
  workcenter?: string;
  [key: string]: unknown;
}

export default function ActiveWorkOrdersReport() {
  const [rows, setRows] = useState<WorkOrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchReportRows<WorkOrderRow>('production.active-wo');
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

  return (
    <div className="w-full p-3">
      <div className="flex justify-between items-center mb-3">
        <div>
          <h1 className="text-3xl font-bold mb-2">Active Work Orders</h1>
          <p className="text-gray-600">Work orders currently in progress</p>
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

      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-3">
        <p className="text-sm text-gray-500">Active Work Orders</p>
        <p className="text-2xl font-bold text-red-600">{loading ? '—' : rows.length}</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center gap-2 text-gray-500 p-6">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Loading active work orders…</span>
          </div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Factory className="h-10 w-10 text-gray-300 mb-2" />
            <p className="text-gray-500 text-sm">No active work orders.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">WO #</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Qty</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Progress</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Due</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Workcenter</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {rows.map((r, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{r.woNumber || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{r.product || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{r.quantity ?? '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {r.progress !== undefined ? `${r.progress}%` : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{r.status || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {r.dueDate ? new Date(r.dueDate).toLocaleDateString('en-IN') : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{r.workcenter || '—'}</td>
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
