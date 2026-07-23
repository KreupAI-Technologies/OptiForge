'use client';

import { useState, useEffect, useCallback } from 'react';
import { CheckSquare, AlertCircle, CheckCircle, Clock, FileText, Calendar, Users, Plus, Eye, X } from 'lucide-react';
import { HrComplianceDocsService, ComplianceRegister } from '@/services/hr-compliance-docs.service';

interface ComplianceItem {
  id: string;
  act: string;
  requirement: string;
  frequency: 'monthly' | 'quarterly' | 'half_yearly' | 'annual' | 'as_needed';
  applicability: string;
  responsibility: string;
  lastCompleted?: string;
  nextDue: string;
  status: 'compliant' | 'overdue' | 'due_soon' | 'not_applicable';
  documents: string[];
  penalties?: string;
}

type Toast = { message: string; type: 'success' | 'error' };

export default function Page() {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedFrequency, setSelectedFrequency] = useState('all');
  const [items, setItems] = useState<ComplianceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    registerName: '',
    act: '',
    frequency: 'monthly',
    responsibility: '',
    nextDue: '',
    status: 'compliant',
  });

  // View modal
  const [viewItem, setViewItem] = useState<ComplianceItem | null>(null);

  // Edit / Mark Complete state
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);

  // Toast
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const rows = await HrComplianceDocsService.getRegisters('tracker');
      const mapped: ComplianceItem[] = rows.map((r: ComplianceRegister) => ({
        id: r.id,
        act: r.act || '',
        requirement: r.requirement || '',
        frequency: (r.frequency as ComplianceItem['frequency']) || 'monthly',
        applicability: r.applicability || '',
        responsibility: r.responsibility || '',
        lastCompleted: r.lastCompleted,
        nextDue: r.nextDue || '',
        status: (r.status as ComplianceItem['status']) || 'compliant',
        documents: r.documents || [],
        penalties: r.penalties,
      }));
      setItems(mapped);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load compliance tracker');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    try {
      setSaving(true);
      await HrComplianceDocsService.createRegister({
        entryType: 'tracker',
        registerName: form.registerName || undefined,
        act: form.act || undefined,
        frequency: form.frequency || undefined,
        responsibility: form.responsibility || undefined,
        nextDue: form.nextDue || undefined,
        status: form.status || undefined,
      });
      setShowAdd(false);
      setForm({ registerName: '', act: '', frequency: 'monthly', responsibility: '', nextDue: '', status: 'compliant' });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create compliance item');
    } finally {
      setSaving(false);
    }
  };

  const handleMarkComplete = async (item: ComplianceItem) => {
    setStatusUpdating(item.id);
    try {
      await HrComplianceDocsService.updateRegister(item.id, {
        status: 'compliant',
        lastCompleted: new Date().toISOString().slice(0, 10),
      });
      showToast(`"${item.act || 'Item'}" marked as Compliant`, 'success');
      await load();
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Failed to update status', 'error');
    } finally {
      setStatusUpdating(null);
    }
  };

  const sourceCompliance = items;

  const filteredCompliance = sourceCompliance.filter(item => {
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
    const matchesFrequency = selectedFrequency === 'all' || item.frequency === selectedFrequency;
    return matchesStatus && matchesFrequency;
  });

  const stats = {
    total: sourceCompliance.length,
    compliant: sourceCompliance.filter(i => i.status === 'compliant').length,
    dueSoon: sourceCompliance.filter(i => i.status === 'due_soon').length,
    overdue: sourceCompliance.filter(i => i.status === 'overdue').length
  };

  const statusColors = {
    compliant: 'bg-green-100 text-green-700 border-green-300',
    due_soon: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    overdue: 'bg-red-100 text-red-700 border-red-300',
    not_applicable: 'bg-gray-100 text-gray-700 border-gray-300'
  };

  const statusIcons = {
    compliant: CheckCircle,
    due_soon: Clock,
    overdue: AlertCircle,
    not_applicable: CheckSquare
  };

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
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CheckSquare className="h-6 w-6 text-red-600" />
            Labor Law Compliance Tracker
          </h1>
          <p className="text-sm text-gray-600 mt-1">Track Indian labor law compliance requirements and deadlines</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
        >
          <Plus className="h-4 w-4" />
          Add Compliance
        </button>
      </div>

      {loading && (
        <div className="mb-3 text-sm text-gray-500">Loading compliance tracker…</div>
      )}
      {error && (
        <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error} — showing sample data.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-sm border border-blue-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Total Requirements</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">{stats.total}</p>
            </div>
            <FileText className="h-10 w-10 text-blue-600 opacity-60" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-sm border border-green-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-green-600 uppercase tracking-wide">Compliant</p>
              <p className="text-3xl font-bold text-green-900 mt-1">{stats.compliant}</p>
            </div>
            <CheckCircle className="h-10 w-10 text-green-600 opacity-60" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg shadow-sm border border-yellow-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-yellow-600 uppercase tracking-wide">Due Soon</p>
              <p className="text-3xl font-bold text-yellow-900 mt-1">{stats.dueSoon}</p>
            </div>
            <Clock className="h-10 w-10 text-yellow-600 opacity-60" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg shadow-sm border border-red-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-red-600 uppercase tracking-wide">Overdue</p>
              <p className="text-3xl font-bold text-red-900 mt-1">{stats.overdue}</p>
            </div>
            <AlertCircle className="h-10 w-10 text-red-600 opacity-60" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500">
              <option value="all">All Statuses</option>
              <option value="compliant">Compliant</option>
              <option value="due_soon">Due Soon</option>
              <option value="overdue">Overdue</option>
              <option value="not_applicable">Not Applicable</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Frequency</label>
            <select value={selectedFrequency} onChange={(e) => setSelectedFrequency(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500">
              <option value="all">All Frequencies</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="half_yearly">Half-Yearly</option>
              <option value="annual">Annual</option>
              <option value="as_needed">As Needed</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {filteredCompliance.map((item) => {
          const StatusIcon = statusIcons[item.status];
          return (
            <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{item.act}</h3>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full border-2 ${statusColors[item.status]}`}>
                      <StatusIcon className="h-3 w-3 inline mr-1" />
                      {item.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 font-medium mb-2">{item.requirement}</p>
                  <p className="text-sm text-gray-600">{item.applicability}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600 uppercase font-medium mb-1">Frequency</p>
                  <p className="text-sm font-bold text-gray-900">{item.frequency.replace('_', ' ')}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600 uppercase font-medium mb-1">Next Due</p>
                  <p className="text-sm font-bold text-gray-900">{item.nextDue}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600 uppercase font-medium mb-1">Responsibility</p>
                  <p className="text-sm font-bold text-gray-900">{item.responsibility}</p>
                </div>
              </div>

              <div className="mb-2">
                <p className="text-xs text-gray-600 uppercase font-medium mb-2">Required Documents</p>
                <div className="flex flex-wrap gap-2">
                  {item.documents.map((doc, idx) => (
                    <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-200">
                      {doc}
                    </span>
                  ))}
                </div>
              </div>

              {item.penalties && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-2">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                    <div>
                      <p className="text-xs text-red-600 uppercase font-medium mb-1">Non-Compliance Penalty</p>
                      <p className="text-sm text-red-800">{item.penalties}</p>
                    </div>
                  </div>
                </div>
              )}

              {item.lastCompleted && (
                <div className="mb-2 text-xs text-gray-600">
                  Last Completed: {new Date(item.lastCompleted).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              )}

              {/* Per-card actions */}
              <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                <button
                  onClick={() => setViewItem(item)}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Eye className="h-3.5 w-3.5" />
                  View
                </button>
                {item.status !== 'compliant' && (
                  <button
                    onClick={() => handleMarkComplete(item)}
                    disabled={statusUpdating === item.id}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
                  >
                    <CheckCircle className="h-3.5 w-3.5" />
                    {statusUpdating === item.id ? 'Updating…' : 'Mark Compliant'}
                  </button>
                )}
                <button
                  onClick={() => handleMarkComplete(item)}
                  disabled={statusUpdating === item.id}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  <Calendar className="h-3.5 w-3.5" />
                  {statusUpdating === item.id ? 'Updating…' : 'Log Completion'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* View Detail Modal */}
      {viewItem && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto p-5">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Compliance Item Detail</h2>
              <button onClick={() => setViewItem(null)} className="p-1 text-gray-400 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-xs font-semibold text-gray-500 uppercase">Act / Law</dt>
                <dd className="mt-1 font-medium text-gray-900">{viewItem.act || '—'}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-gray-500 uppercase">Requirement</dt>
                <dd className="mt-1 text-gray-700">{viewItem.requirement || '—'}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-gray-500 uppercase">Applicability</dt>
                <dd className="mt-1 text-gray-700">{viewItem.applicability || '—'}</dd>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <dt className="text-xs font-semibold text-gray-500 uppercase">Frequency</dt>
                  <dd className="mt-1 text-gray-700 capitalize">{viewItem.frequency.replace('_', ' ')}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-gray-500 uppercase">Responsibility</dt>
                  <dd className="mt-1 text-gray-700">{viewItem.responsibility || '—'}</dd>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <dt className="text-xs font-semibold text-gray-500 uppercase">Next Due</dt>
                  <dd className="mt-1 text-gray-700">{viewItem.nextDue || '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-gray-500 uppercase">Last Completed</dt>
                  <dd className="mt-1 text-gray-700">{viewItem.lastCompleted ? new Date(viewItem.lastCompleted).toLocaleDateString('en-IN') : '—'}</dd>
                </div>
              </div>
              <div>
                <dt className="text-xs font-semibold text-gray-500 uppercase">Status</dt>
                <dd className="mt-1">
                  <span className={`px-2 py-1 text-xs rounded font-medium ${statusColors[viewItem.status]}`}>
                    {viewItem.status.replace('_', ' ').toUpperCase()}
                  </span>
                </dd>
              </div>
              {viewItem.documents.length > 0 && (
                <div>
                  <dt className="text-xs font-semibold text-gray-500 uppercase">Required Documents</dt>
                  <dd className="mt-1 flex flex-wrap gap-1">
                    {viewItem.documents.map((d, i) => (
                      <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded border border-blue-200">{d}</span>
                    ))}
                  </dd>
                </div>
              )}
              {viewItem.penalties && (
                <div>
                  <dt className="text-xs font-semibold text-gray-500 uppercase">Non-Compliance Penalty</dt>
                  <dd className="mt-1 text-red-700 text-sm">{viewItem.penalties}</dd>
                </div>
              )}
            </dl>
            <div className="flex justify-end mt-5">
              <button onClick={() => setViewItem(null)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-5">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Add Compliance</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Register Name</label>
                <input value={form.registerName} onChange={(e) => setForm({ ...form, registerName: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Act</label>
                <input value={form.act} onChange={(e) => setForm({ ...form, act: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                <select value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500">
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="half_yearly">Half-Yearly</option>
                  <option value="annual">Annual</option>
                  <option value="as_needed">As Needed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Responsibility</label>
                <input value={form.responsibility} onChange={(e) => setForm({ ...form, responsibility: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Next Due</label>
                <input type="date" value={form.nextDue} onChange={(e) => setForm({ ...form, nextDue: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500">
                  <option value="compliant">Compliant</option>
                  <option value="due_soon">Due Soon</option>
                  <option value="overdue">Overdue</option>
                  <option value="not_applicable">Not Applicable</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowAdd(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium disabled:opacity-50">{saving ? 'Saving…' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
