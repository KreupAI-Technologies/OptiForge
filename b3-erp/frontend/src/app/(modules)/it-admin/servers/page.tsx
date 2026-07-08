'use client';

import { useEffect, useState } from 'react';
import { Server, Loader2, AlertCircle } from 'lucide-react';
import { ItAdminService, type SystemMonitorDto } from '@/services/it-admin.service';

function statusColor(status: string): string {
  const s = (status || '').toLowerCase();
  if (s.includes('health') || s.includes('ok') || s.includes('up') || s.includes('online'))
    return 'bg-green-100 text-green-700 border-green-200';
  if (s.includes('warn') || s.includes('degrad')) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
  if (s.includes('critical') || s.includes('down') || s.includes('error') || s.includes('offline'))
    return 'bg-red-100 text-red-700 border-red-200';
  return 'bg-gray-100 text-gray-700 border-gray-200';
}

export default function ITAdminServersPage() {
  const [servers, setServers] = useState<SystemMonitorDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await ItAdminService.getMonitoring({ kind: 'health' });
        if (!cancelled) setServers(Array.isArray(res) ? res : []);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load server status');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 px-3 py-2">
      <div className="mb-3 flex items-center gap-2">
        <Server className="w-7 h-7 text-cyan-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Server Status</h1>
          <p className="text-sm text-gray-500 mt-1">Health and availability of system instances</p>
        </div>
      </div>

      {error && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-6 flex items-center gap-2 text-gray-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Loading server status…</span>
        </div>
      ) : servers.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 flex flex-col items-center justify-center py-16 text-center">
          <Server className="w-10 h-10 text-gray-300 mb-2" />
          <p className="text-gray-500 text-sm">No server health data available.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {servers.map((s) => (
            <div key={s.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Server className="w-5 h-5 text-cyan-600" />
                  <h3 className="font-semibold text-gray-900">{s.name}</h3>
                </div>
                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${statusColor(s.status)}`}>
                  {s.status}
                </span>
              </div>
              {s.category && <p className="text-xs text-gray-500 mb-1">Category: {s.category}</p>}
              {s.message && <p className="text-sm text-gray-600 mb-1">{s.message}</p>}
              {s.value !== undefined && s.value !== null && (
                <p className="text-sm text-gray-700">
                  {s.value}
                  {s.unit ? ` ${s.unit}` : ''}
                </p>
              )}
              {s.lastOccurred && (
                <p className="text-xs text-gray-400 mt-2">Last check: {new Date(s.lastOccurred).toLocaleString()}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
