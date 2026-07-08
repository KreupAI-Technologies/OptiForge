'use client';

import { useEffect, useState } from 'react';
import { Database, Loader2, AlertCircle, HardDrive } from 'lucide-react';
import { ItAdminService, type BackupRecordDto } from '@/services/it-admin.service';

function statusColor(status: string): string {
  const s = (status || '').toLowerCase();
  if (s.includes('complet') || s.includes('success')) return 'bg-green-100 text-green-700 border-green-200';
  if (s.includes('progress') || s.includes('running')) return 'bg-blue-100 text-blue-700 border-blue-200';
  if (s.includes('fail') || s.includes('error')) return 'bg-red-100 text-red-700 border-red-200';
  return 'bg-gray-100 text-gray-700 border-gray-200';
}

export default function ITAdminBackupPage() {
  const [records, setRecords] = useState<BackupRecordDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await ItAdminService.getBackupRecords();
        if (!cancelled) setRecords(Array.isArray(res) ? res : []);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load backup records');
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
        <Database className="w-7 h-7 text-orange-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Backup & Restore</h1>
          <p className="text-sm text-gray-500 mt-1">Database and system backup jobs</p>
        </div>
      </div>

      {error && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center gap-2 text-gray-500 p-6">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Loading backup records…</span>
          </div>
        ) : records.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <HardDrive className="w-10 h-10 text-gray-300 mb-2" />
            <p className="text-gray-500 text-sm">No backup records found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Size</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Started</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Completed</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Trigger</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {records.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{r.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 capitalize">{r.type}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${statusColor(r.status)}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{r.size || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {r.startedAt ? new Date(r.startedAt).toLocaleString() : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {r.completedAt ? new Date(r.completedAt).toLocaleString() : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{r.automated ? 'Automated' : 'Manual'}</td>
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
