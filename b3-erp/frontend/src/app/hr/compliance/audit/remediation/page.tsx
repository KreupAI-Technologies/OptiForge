'use client';

import { useState, useEffect, useCallback } from 'react';
import { Wrench, CheckCircle, Clock, AlertCircle, Plus } from 'lucide-react';
import { HrComplianceDocsService } from '@/services/hr-compliance-docs.service';
import { HRComplianceService } from '@/services/hr-compliance.service';

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
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    planTitle: '',
    description: '',
    priority: 'medium',
    responsiblePersonName: '',
    targetCompletionDate: '',
    status: 'in_progress',
  });

  const load = useCallback(async () => {
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
      setPlans(mapped);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load remediation plans');
      setPlans([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    try {
      setSaving(true);
      await HRComplianceService.createRemediationPlan({
        planTitle: form.planTitle || undefined,
        description: form.description || undefined,
        priority: form.priority || undefined,
        responsiblePersonName: form.responsiblePersonName || undefined,
        targetCompletionDate: form.targetCompletionDate || undefined,
        status: form.status || undefined,
      });
      setShowAdd(false);
      setForm({ planTitle: '', description: '', priority: 'medium', responsiblePersonName: '', targetCompletionDate: '', status: 'in_progress' });
      await load();
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to create remediation plan');
    } finally {
      setSaving(false);
    }
  };

  const stats = { total: plans.length, completed: plans.filter(p => p.status === 'completed').length };

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3 flex items-start justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Wrench className="h-6 w-6 text-green-600" />
          Remediation Plans
        </h1>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
        >
          <Plus className="h-4 w-4" />
          Add Remediation Plan
        </button>
      </div>
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

      {showAdd && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-5">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Add Remediation Plan</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Plan Title</label>
                <input value={form.planTitle} onChange={(e) => setForm({ ...form, planTitle: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Responsible Person</label>
                <input value={form.responsiblePersonName} onChange={(e) => setForm({ ...form, responsiblePersonName: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Completion Date</label>
                <input type="date" value={form.targetCompletionDate} onChange={(e) => setForm({ ...form, targetCompletionDate: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowAdd(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium disabled:opacity-50">{saving ? 'Saving…' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
