'use client';

import { useState, useEffect } from 'react';
import { Wrench, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { HrComplianceDocsService } from '@/services/hr-compliance-docs.service';

interface RemediationPlan {
  id: string;
  finding: string;
  action: string;
  owner: string;
  due: string;
  status: string;
}

export default function Page() {
  const [plans, setPlans] = useState<RemediationPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const rows = await HrComplianceDocsService.getAudits();
        const mapped: RemediationPlan[] = rows.map((row) => {
          const meta = ((row as any).meta || {}) as any;
          return {
            id: String(row.id),
            finding: meta.finding ?? row.title ?? '',
            action: meta.action ?? '',
            owner: meta.owner ?? row.auditor ?? '',
            due: meta.due ?? row.nextAuditDue ?? '',
            status: meta.status ?? row.status ?? 'in_progress',
          };
        });
        if (!cancelled) setPlans(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load remediation plans');
          setPlans([]);
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

  const stats = { total: plans.length, completed: plans.filter(p => p.status === 'completed').length };

  return (
    <div className="w-full h-full px-3 py-2">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-3">
        <Wrench className="h-6 w-6 text-green-600" />
        Remediation Plans
      </h1>
      {loading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading remediation plans…
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
          <p className="text-xs font-semibold text-blue-600 uppercase">Total Plans</p>
          <p className="text-3xl font-bold text-blue-900">{stats.total}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-lg border border-green-200">
          <p className="text-xs font-semibold text-green-600 uppercase">Completed</p>
          <p className="text-3xl font-bold text-green-900">{stats.completed}</p>
        </div>
      </div>
      <div className="space-y-2">
        {plans.map(p => (
          <div key={p.id} className="bg-white p-3 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <h3 className="font-bold text-gray-900">{p.finding}</h3>
              <span className={`px-2 py-1 text-xs rounded ${p.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{p.status.replace('_', ' ').toUpperCase()}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div><span className="text-gray-600">Action:</span> <span className="font-medium">{p.action}</span></div>
              <div><span className="text-gray-600">Owner:</span> <span className="font-medium">{p.owner}</span></div>
              <div><span className="text-gray-600">Due:</span> <span className="font-medium">{new Date(p.due).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
