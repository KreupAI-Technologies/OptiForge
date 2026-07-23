'use client';

import { useState, useEffect } from 'react';
import { FileText, AlertCircle } from 'lucide-react';
import { HrComplianceDocsService } from '@/services/hr-compliance-docs.service';

interface Finding {
  id: string;
  audit: string;
  finding: string;
  severity: string;
  status: string;
}

export default function Page() {
  const [findings, setFindings] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [detailFinding, setDetailFinding] = useState<Finding | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const rows = await HrComplianceDocsService.getAudits();
        const mapped: Finding[] = rows.map((row) => {
          const meta = ((row as any).meta || {}) as any;
          return {
            id: String(row.id),
            audit: row.title ?? meta.audit ?? '',
            finding: meta.finding ?? '',
            severity: meta.severity ?? ((row.criticalFindings ?? 0) > 0 ? 'critical' : 'moderate'),
            status: meta.status ?? row.status ?? 'open',
          };
        });
        if (!cancelled) setFindings(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load audit findings');
          setFindings([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = { total: findings.length, critical: findings.filter(f => f.severity === 'critical').length };

  return (
    <div className="w-full h-full px-3 py-2">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-3">
        <FileText className="h-6 w-6 text-orange-600" />
        Audit Findings
      </h1>
      {loading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading audit findings…
        </div>
      )}
      {loadError && !loading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg border border-blue-200">
          <p className="text-xs font-semibold text-blue-600 uppercase">Total Findings</p>
          <p className="text-3xl font-bold text-blue-900">{stats.total}</p>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 p-3 rounded-lg border border-red-200">
          <p className="text-xs font-semibold text-red-600 uppercase">Critical</p>
          <p className="text-3xl font-bold text-red-900">{stats.critical}</p>
        </div>
      </div>
      <div className="space-y-2">
        {findings.map(f => (
          <div key={f.id} className="bg-white p-3 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-bold text-gray-900">{f.audit}</h3>
              <span className={`px-2 py-1 text-xs rounded ${f.severity === 'critical' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{f.severity.toUpperCase()}</span>
            </div>
            <p className="text-sm text-gray-700 mb-3">{f.finding}</p>
            <button onClick={() => setDetailFinding(f)} className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm">View Details</button>
          </div>
        ))}
      </div>

      {detailFinding && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-gray-900">Finding Details</h2>
              <button onClick={() => setDetailFinding(null)} className="text-gray-500 hover:text-gray-700 text-xl font-bold">&times;</button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Audit</p>
                <p className="font-medium text-gray-900">{detailFinding.audit}</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                <p className="text-xs text-orange-600 uppercase font-medium mb-1">Finding</p>
                <p className="text-orange-900">{detailFinding.finding}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className={`rounded-lg p-3 border ${detailFinding.severity === 'critical' ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'}`}>
                  <p className={`text-xs uppercase font-medium mb-1 ${detailFinding.severity === 'critical' ? 'text-red-600' : 'text-yellow-600'}`}>Severity</p>
                  <p className={`font-bold ${detailFinding.severity === 'critical' ? 'text-red-900' : 'text-yellow-900'}`}>{detailFinding.severity.toUpperCase()}</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <p className="text-xs text-blue-600 uppercase font-medium mb-1">Status</p>
                  <p className="font-bold text-blue-900">{detailFinding.status}</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <button onClick={() => setDetailFinding(null)} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
