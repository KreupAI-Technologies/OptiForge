'use client';

import { useState, useEffect, useCallback } from 'react';
import { FileText, Download, AlertCircle } from 'lucide-react';
import { HrComplianceDocsService } from '@/services/hr-compliance-docs.service';

interface StatutoryReport {
  id: string;
  title: string;
  type: string;
  dueDate: string;
  status: string;
}

export default function Page() {
  const [reports, setReports] = useState<StatutoryReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const rows = await HrComplianceDocsService.getReturns();
      const mapped: StatutoryReport[] = rows.map((row) => {
        const meta = ((row as any).meta || {}) as any;
        return {
          id: String(row.id),
          title: meta.title ?? [row.returnType, row.returnMonth].filter(Boolean).join(' - ') ?? '',
          type: row.returnType ?? meta.type ?? '',
          dueDate: row.dueDate ?? '',
          status: row.status ?? meta.status ?? 'pending',
        };
      });
      setReports(mapped);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load statutory reports');
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSubmit = async (id: string) => {
    try {
      setSubmittingId(id);
      await HrComplianceDocsService.submitReturn(id);
      await load();
      setLoadError(null);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to submit report');
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <div className="w-full h-full px-3 py-2">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-3">
        <FileText className="h-6 w-6 text-blue-600" />
        Statutory Reports
      </h1>
      {loading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading statutory reports…
        </div>
      )}
      {loadError && !loading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}
      <div className="space-y-2">
        {reports.map(r => (
          <div key={r.id} className="bg-white p-3 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900 mb-1">{r.title}</h3>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-gray-600">Type: {r.type}</span>
                  <span className="text-gray-600">Due: {new Date(r.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  <span className={`px-2 py-1 text-xs rounded ${r.status === 'submitted' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {r.status.toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {r.status !== 'submitted' && r.status !== 'filed' && (
                  <button
                    onClick={() => handleSubmit(r.id)}
                    disabled={submittingId === r.id}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium disabled:opacity-50"
                  >
                    {submittingId === r.id ? 'Submitting…' : 'Submit'}
                  </button>
                )}
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Download
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
