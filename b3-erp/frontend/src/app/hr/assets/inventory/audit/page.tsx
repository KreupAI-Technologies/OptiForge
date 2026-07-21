'use client';

import { useState, useMemo, useEffect } from 'react';
import { ClipboardCheck, Calendar, CheckCircle, AlertCircle, XCircle, Package, User } from 'lucide-react';
import { HrAssetsService } from '@/services/hr-assets.service';

interface AuditRecord {
  id: string;
  auditId: string;
  auditDate: string;
  auditType: 'scheduled' | 'surprise' | 'annual' | 'spot';
  location: string;
  auditor: string;
  totalAssets: number;
  verified: number;
  missing: number;
  damaged: number;
  status: 'completed' | 'in_progress' | 'pending' | 'approved';
  completionDate?: string;
  remarks?: string;
}

export default function Page() {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [audits, setAudits] = useState<AuditRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [detailAudit, setDetailAudit] = useState<AuditRecord | null>(null);
  const [transitioningId, setTransitioningId] = useState<string | null>(null);

  const applyAuditStatus = async (
    audit: AuditRecord,
    status: AuditRecord['status'],
  ) => {
    setTransitioningId(audit.id);
    setLoadError(null);
    const completionDate = status === 'completed' ? new Date().toISOString().slice(0, 10) : undefined;
    try {
      await HrAssetsService.updateAssetAudit(audit.id, { status, ...(completionDate ? { completionDate } : {}) });
      setAudits(prev =>
        prev.map(a =>
          a.id === audit.id
            ? { ...a, status, ...(completionDate ? { completionDate } : {}) }
            : a,
        ),
      );
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to update audit');
    } finally {
      setTransitioningId(null);
    }
  };
  const [showForm, setShowForm] = useState(false);

  const emptyForm = {
    auditId: '',
    auditDate: new Date().toISOString().slice(0, 10),
    auditType: 'scheduled',
    location: '',
    auditor: '',
    totalAssets: '',
    remarks: '',
  };
  const [form, setForm] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const created = await HrAssetsService.createAssetAudit({
        auditId: form.auditId,
        auditDate: form.auditDate,
        auditType: form.auditType,
        location: form.location,
        auditor: form.auditor,
        totalAssets: Number(form.totalAssets) || 0,
        verified: 0,
        missing: 0,
        damaged: 0,
        status: 'pending',
        remarks: form.remarks || undefined,
      });
      const row: AuditRecord = {
        id: String(created.id),
        auditId: created.auditId ?? form.auditId,
        auditDate: created.auditDate ?? form.auditDate,
        auditType: (created.auditType ?? form.auditType) as AuditRecord['auditType'],
        location: created.location ?? form.location,
        auditor: created.auditor ?? form.auditor,
        totalAssets: Number(created.totalAssets ?? form.totalAssets ?? 0),
        verified: Number(created.verified ?? 0),
        missing: Number(created.missing ?? 0),
        damaged: Number(created.damaged ?? 0),
        status: (created.status ?? 'pending') as AuditRecord['status'],
        completionDate: created.completionDate ?? undefined,
        remarks: created.remarks ?? (form.remarks || undefined),
      };
      setAudits((prev) => [row, ...prev]);
      setForm(emptyForm);
      setShowForm(false);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to schedule audit');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = await HrAssetsService.getAssetAudits();
        const mapped: AuditRecord[] = raw.map((a) => ({
          id: String(a.id),
          auditId: a.auditId ?? '',
          auditDate: a.auditDate ?? '',
          auditType: (a.auditType ?? 'scheduled') as AuditRecord['auditType'],
          location: a.location ?? '',
          auditor: a.auditor ?? '',
          totalAssets: Number(a.totalAssets ?? 0),
          verified: Number(a.verified ?? 0),
          missing: Number(a.missing ?? 0),
          damaged: Number(a.damaged ?? 0),
          status: (a.status ?? 'pending') as AuditRecord['status'],
          completionDate: a.completionDate ?? undefined,
          remarks: a.remarks ?? undefined,
        }));
        if (!cancelled) setAudits(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load asset audits');
          setAudits([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredAudits = audits.filter(a => {
    const statusMatch = selectedStatus === 'all' || a.status === selectedStatus;
    const typeMatch = selectedType === 'all' || a.auditType === selectedType;
    return statusMatch && typeMatch;
  });

  const stats = useMemo(() => ({
    total: audits.length,
    completed: audits.filter(a => a.status === 'completed').length,
    inProgress: audits.filter(a => a.status === 'in_progress').length,
    pending: audits.filter(a => a.status === 'pending').length
  }), [audits]);

  const statusColors = {
    completed: 'bg-green-100 text-green-700',
    in_progress: 'bg-blue-100 text-blue-700',
    pending: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-purple-100 text-purple-700'
  };

  const typeColors = {
    scheduled: 'bg-blue-100 text-blue-700',
    surprise: 'bg-orange-100 text-orange-700',
    annual: 'bg-purple-100 text-purple-700',
    spot: 'bg-green-100 text-green-700'
  };

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900">Asset Inventory Audit</h1>
        <p className="text-sm text-gray-600 mt-1">Track and manage asset audits</p>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading asset audits…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <p className="text-sm font-medium text-blue-600">Total Audits</p>
          <p className="text-2xl font-bold text-blue-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <p className="text-sm font-medium text-green-600">Completed</p>
          <p className="text-2xl font-bold text-green-900 mt-1">{stats.completed}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <p className="text-sm font-medium text-blue-600">In Progress</p>
          <p className="text-2xl font-bold text-blue-900 mt-1">{stats.inProgress}</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
          <p className="text-sm font-medium text-yellow-600">Pending</p>
          <p className="text-2xl font-bold text-yellow-900 mt-1">{stats.pending}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="approved">Approved</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Audit Type</label>
            <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">All Types</option>
              <option value="scheduled">Scheduled</option>
              <option value="surprise">Surprise</option>
              <option value="annual">Annual</option>
              <option value="spot">Spot</option>
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={() => setShowForm(true)} className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm">
              Schedule New Audit
            </button>
          </div>
        </div>
      </div>

      {/* Audits List */}
      <div className="space-y-2">
        {filteredAudits.map(audit => (
          <div key={audit.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-12 w-12 bg-indigo-50 rounded-lg flex items-center justify-center">
                    <ClipboardCheck className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{audit.auditId}</h3>
                    <p className="text-sm text-gray-600">{audit.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 text-xs font-semibold rounded ${typeColors[audit.auditType]}`}>
                    {audit.auditType.charAt(0).toUpperCase() + audit.auditType.slice(1)}
                  </span>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColors[audit.status]}`}>
                    {audit.status === 'in_progress' ? 'In Progress' : audit.status.charAt(0).toUpperCase() + audit.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2 py-4 border-y border-gray-200">
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Auditor</p>
                <p className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {audit.auditor}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Audit Date</p>
                <p className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(audit.auditDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Total Assets</p>
                <p className="text-2xl font-bold text-gray-900">{audit.totalAssets}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Progress</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(audit.verified / audit.totalAssets) * 100}%` }}></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{Math.round((audit.verified / audit.totalAssets) * 100)}%</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-2">
              <div className="bg-green-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <p className="text-xs text-green-600 uppercase font-medium">Verified</p>
                </div>
                <p className="text-2xl font-bold text-green-900">{audit.verified}</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <p className="text-xs text-orange-600 uppercase font-medium">Missing</p>
                </div>
                <p className="text-2xl font-bold text-orange-900">{audit.missing}</p>
              </div>
              <div className="bg-red-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <p className="text-xs text-red-600 uppercase font-medium">Damaged</p>
                </div>
                <p className="text-2xl font-bold text-red-900">{audit.damaged}</p>
              </div>
            </div>

            {audit.remarks && (
              <div className="bg-gray-50 rounded-lg p-3 mb-2">
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Remarks</p>
                <p className="text-sm text-gray-700">{audit.remarks}</p>
              </div>
            )}

            <div className="flex gap-2">
              <button onClick={() => setDetailAudit(audit)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm">
                View Details
              </button>
              {audit.status === 'pending' && (
                <button onClick={() => applyAuditStatus(audit, 'in_progress')} disabled={transitioningId === audit.id} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm disabled:opacity-50">
                  Start Audit
                </button>
              )}
              {audit.status === 'in_progress' && (
                <button onClick={() => applyAuditStatus(audit, 'completed')} disabled={transitioningId === audit.id} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm disabled:opacity-50">
                  Complete Audit
                </button>
              )}
              {audit.status === 'completed' && (
                <button onClick={() => applyAuditStatus(audit, 'approved')} disabled={transitioningId === audit.id} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium text-sm disabled:opacity-50">
                  Approve
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {detailAudit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-4 py-3 flex items-center justify-between rounded-t-xl">
              <h2 className="text-lg font-bold text-white">Audit Details</h2>
              <button onClick={() => setDetailAudit(null)} className="text-white hover:text-gray-200">
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Audit ID</p>
                  <p className="font-semibold text-gray-900">{detailAudit.auditId}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Location</p>
                  <p className="font-semibold text-gray-900">{detailAudit.location}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Audit Type</p>
                  <p className="font-semibold text-gray-900">{detailAudit.auditType}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Auditor</p>
                  <p className="font-semibold text-gray-900">{detailAudit.auditor}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Audit Date</p>
                  <p className="font-semibold text-gray-900">{detailAudit.auditDate}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Status</p>
                  <p className="font-semibold text-gray-900">{detailAudit.status}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Total Assets</p>
                  <p className="font-semibold text-gray-900">{detailAudit.totalAssets}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Verified</p>
                  <p className="font-semibold text-gray-900">{detailAudit.verified}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Missing</p>
                  <p className="font-semibold text-gray-900">{detailAudit.missing}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Damaged</p>
                  <p className="font-semibold text-gray-900">{detailAudit.damaged}</p>
                </div>
                {detailAudit.completionDate && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-medium mb-1">Completion Date</p>
                    <p className="font-semibold text-gray-900">{detailAudit.completionDate}</p>
                  </div>
                )}
                {detailAudit.remarks && (
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500 uppercase font-medium mb-1">Remarks</p>
                    <p className="font-semibold text-gray-900">{detailAudit.remarks}</p>
                  </div>
                )}
              </div>
              <button onClick={() => setDetailAudit(null)} className="w-full mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium text-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 flex items-center justify-between rounded-t-xl">
              <h2 className="text-lg font-bold text-white">Schedule New Audit</h2>
              <button onClick={() => setShowForm(false)} className="text-white hover:text-gray-200">
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            <div className="p-4">
              {submitError && (
                <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  <AlertCircle className="h-4 w-4" />
                  {submitError}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Audit ID</label>
                  <input value={form.auditId} onChange={(e) => setForm({ ...form, auditId: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Audit Type</label>
                  <select value={form.auditType} onChange={(e) => setForm({ ...form, auditType: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="scheduled">Scheduled</option>
                    <option value="surprise">Surprise</option>
                    <option value="annual">Annual</option>
                    <option value="spot">Spot</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Audit Date</label>
                  <input type="date" value={form.auditDate} onChange={(e) => setForm({ ...form, auditDate: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Auditor</label>
                  <input value={form.auditor} onChange={(e) => setForm({ ...form, auditor: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Assets</label>
                  <input type="number" value={form.totalAssets} onChange={(e) => setForm({ ...form, totalAssets: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                  <textarea value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={handleSubmit} disabled={isSubmitting} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm disabled:opacity-60">
                  {isSubmitting ? 'Scheduling…' : 'Schedule Audit'}
                </button>
                <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium text-sm">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
