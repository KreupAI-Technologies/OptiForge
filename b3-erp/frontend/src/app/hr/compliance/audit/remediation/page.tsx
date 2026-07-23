'use client';

import { useState, useEffect, useCallback } from 'react';
import { Wrench, CheckCircle, Clock, AlertCircle, Plus, Eye, X } from 'lucide-react';
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

type Toast = { message: string; type: 'success' | 'error' };

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

  // View modal
  const [viewPlan, setViewPlan] = useState<RemediationPlan | null>(null);

  // Status action state
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);

  // Toast
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const rows = await HrComplianceDocsService.getAudits();
      const mapped: RemediationPlan[] = rows.map((row) => {
        const rawRow = row as unknown as Record<string, unknown>;
        const meta = (rawRow.meta || {}) as Record<string, unknown>;
        return {
          id: String(row.id),
          finding: (meta.finding as string) ?? row.title ?? '',
          action: (meta.action as string) ?? '',
          owner: (meta.owner as string) ?? row.auditor ?? '',
          due: (meta.due as string) ?? row.nextAuditDue ?? '',
          status: (meta.status as string) ?? row.status ?? 'in_progress',
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

  const handleStatusUpdate = async (plan: RemediationPlan, newStatus: string) => {
    setStatusUpdating(plan.id);
    try {
      await HRComplianceService.updateRemediationPlanStatus(plan.id, newStatus);
      showToast(`Plan status updated to "${newStatus.replace('_', ' ')}"`, 'success');
      await load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update status', 'error');
    } finally {
      setStatusUpdating(null);
    }
  };

  const stats = { total: plans.length, completed: plans.filter(p => p.status === 'completed').length };

  return (
    <div className="w-full h-full px-3 py-2">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[60] flex items-center gap-2 rounded-lg border px-4 py-3 text-sm shadow-lg ${toast.type === 'success' ? 'border-green-200 bg-green-50 text-green-800' : 'border-red-200 bg-red-50 text-red-800'}`}>
          {toast.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {toast.message}
        </div>
      )}

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
              <h3 className="font-bold text-gray-900 flex-1">{p.finding}</h3>
              <span className={`px-2 py-1 text-xs rounded ${p.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{p.status.replace('_', ' ').toUpperCase()}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm mb-3">
              <div><span className="text-gray-600">Action:</span> <span className="font-medium">{p.action}</span></div>
              <div><span className="text-gray-600">Owner:</span> <span className="font-medium">{p.owner}</span></div>
              <div><span className="text-gray-600">Due:</span> <span className="font-medium">{p.due ? new Date(p.due).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</span></div>
            </div>
            {/* Per-card actions */}
            <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => setViewPlan(p)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Eye className="h-3.5 w-3.5" />
                View
              </button>
              {p.status !== 'in_progress' && (
                <button
                  onClick={() => handleStatusUpdate(p, 'in_progress')}
                  disabled={statusUpdating === p.id}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors disabled:opacity-50"
                >
                  <Clock className="h-3.5 w-3.5" />
                  {statusUpdating === p.id ? 'Updating…' : 'Mark In-Progress'}
                </button>
              )}
              {p.status !== 'completed' && (
                <button
                  onClick={() => handleStatusUpdate(p, 'completed')}
                  disabled={statusUpdating === p.id}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
                >
                  <CheckCircle className="h-3.5 w-3.5" />
                  {statusUpdating === p.id ? 'Updating…' : 'Mark Complete'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* View Modal */}
      {viewPlan && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-5">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Remediation Plan Detail</h2>
              <button onClick={() => setViewPlan(null)} className="p-1 text-gray-400 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-xs font-semibold text-gray-500 uppercase">Finding</dt>
                <dd className="mt-1 font-medium text-gray-900">{viewPlan.finding || '—'}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-gray-500 uppercase">Action</dt>
                <dd className="mt-1 text-gray-700">{viewPlan.action || '—'}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-gray-500 uppercase">Owner</dt>
                <dd className="mt-1 text-gray-700">{viewPlan.owner || '—'}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-gray-500 uppercase">Due Date</dt>
                <dd className="mt-1 text-gray-700">{viewPlan.due ? new Date(viewPlan.due).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-gray-500 uppercase">Status</dt>
                <dd className="mt-1">
                  <span className={`px-2 py-1 text-xs rounded font-medium ${viewPlan.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {viewPlan.status.replace('_', ' ').toUpperCase()}
                  </span>
                </dd>
              </div>
            </dl>
            <div className="flex justify-end mt-5">
              <button onClick={() => setViewPlan(null)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
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
