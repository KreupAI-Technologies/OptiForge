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
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm">
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
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm">
                View Details
              </button>
              {audit.status === 'pending' && (
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm">
                  Start Audit
                </button>
              )}
              {audit.status === 'in_progress' && (
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm">
                  Complete Audit
                </button>
              )}
              {audit.status === 'completed' && (
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium text-sm">
                  Approve
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
