'use client';

import { useState, useEffect } from 'react';
import { Bell, AlertCircle, Clock } from 'lucide-react';
import { HrComplianceDocsService } from '@/services/hr-compliance-docs.service';

interface ComplianceAlert {
  id: string;
  title: string;
  description: string;
  priority: string;
  date: string;
}

export default function Page() {
  const [alerts, setAlerts] = useState<ComplianceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const rows = await HrComplianceDocsService.getAudits();
        const mapped: ComplianceAlert[] = rows.map((row) => {
          const meta = ((row as any).meta || {}) as any;
          return {
            id: String(row.id),
            title: meta.title ?? row.title ?? '',
            description: meta.description ?? '',
            priority: meta.priority ?? ((row.criticalFindings ?? 0) > 0 ? 'high' : 'low'),
            date: meta.date ?? row.scheduledDate ?? '',
          };
        });
        if (!cancelled) setAlerts(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load compliance alerts');
          setAlerts([]);
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

  return (
    <div className="w-full h-full px-3 py-2">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-3">
        <Bell className="h-6 w-6 text-red-600" />
        Compliance Alerts
      </h1>
      {loading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading compliance alerts…
        </div>
      )}
      {loadError && !loading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}
      <div className="space-y-2">
        {alerts.map(a => (
          <div key={a.id} className={`p-6 rounded-lg border-l-4 ${a.priority === 'high' ? 'bg-red-50 border-red-500' : a.priority === 'medium' ? 'bg-yellow-50 border-yellow-500' : 'bg-blue-50 border-blue-500'}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <AlertCircle className={`h-5 w-5 ${a.priority === 'high' ? 'text-red-600' : a.priority === 'medium' ? 'text-yellow-600' : 'text-blue-600'}`} />
                  <h3 className="font-bold text-gray-900">{a.title}</h3>
                  <span className={`px-2 py-1 text-xs rounded ${a.priority === 'high' ? 'bg-red-100 text-red-700' : a.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>
                    {a.priority.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-2">{a.description}</p>
                <p className="text-xs text-gray-600 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(a.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm">
                View
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
