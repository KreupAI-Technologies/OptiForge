'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Smartphone,
  MapPin,
  Clock,
  Wrench,
  User,
  Phone,
  CheckCircle,
  Loader2,
  AlertCircle,
  RefreshCw,
  ClipboardList,
  Calendar,
} from 'lucide-react';
import { AfterSalesPagesService } from '@/services/after-sales-pages.service';

// Shape returned by GET /after-sales/field-service/jobs (FieldServiceJob).
// Kept intentionally loose — the API shape can drift from the FE model, so we
// normalise defensively before rendering.
interface FieldJob {
  id?: string;
  jobNumber?: string;
  status?: string;
  priority?: string;
  jobType?: string;
  customerName?: string;
  contactPerson?: string;
  contactPhone?: string;
  siteContactPerson?: string;
  siteContactPhone?: string;
  serviceAddress?: string;
  equipmentModel?: string;
  scheduledDate?: string;
  scheduledTimeSlot?: string;
  estimatedDuration?: number;
  assignedEngineerId?: string;
  assignedEngineerName?: string;
  problemDescription?: string;
}

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  scheduled: { label: 'Scheduled', className: 'bg-blue-100 text-blue-700' },
  dispatched: { label: 'Dispatched', className: 'bg-indigo-100 text-indigo-700' },
  en_route: { label: 'En Route', className: 'bg-cyan-100 text-cyan-700' },
  on_site: { label: 'On Site', className: 'bg-amber-100 text-amber-700' },
  in_progress: { label: 'In Progress', className: 'bg-orange-100 text-orange-700' },
  awaiting_parts: { label: 'Awaiting Parts', className: 'bg-yellow-100 text-yellow-700' },
  completed: { label: 'Completed', className: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Cancelled', className: 'bg-gray-100 text-gray-600' },
};

function statusBadge(status?: string) {
  const key = String(status ?? '').toLowerCase();
  const s = STATUS_STYLES[key] ?? { label: status || 'Unknown', className: 'bg-gray-100 text-gray-600' };
  return <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${s.className}`}>{s.label}</span>;
}

function formatDate(value?: string): string {
  if (!value) return '—';
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

const ACTIVE_STATUSES = ['scheduled', 'dispatched', 'en_route', 'on_site', 'in_progress', 'awaiting_parts'];

export default function MobileFieldServicePage() {
  const [jobs, setJobs] = useState<FieldJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'active' | 'all' | 'completed'>('active');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await AfterSalesPagesService.fieldJobs<FieldJob[] | { data?: FieldJob[] }>();
      const arr = Array.isArray(data) ? data : Array.isArray((data as any)?.data) ? (data as any).data : [];
      setJobs(arr as FieldJob[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load field service jobs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const visibleJobs = jobs.filter((j) => {
    const s = String(j.status ?? '').toLowerCase();
    if (filter === 'active') return ACTIVE_STATUSES.includes(s);
    if (filter === 'completed') return s === 'completed';
    return true;
  });

  const activeCount = jobs.filter((j) => ACTIVE_STATUSES.includes(String(j.status ?? '').toLowerCase())).length;
  const completedCount = jobs.filter((j) => String(j.status ?? '').toLowerCase() === 'completed').length;

  return (
    <div className="min-h-screen bg-gray-50 p-3">
      {/* Header */}
      <div className="mb-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Smartphone className="h-7 w-7 text-emerald-600" />
            Field Service — Mobile
          </h1>
          <p className="text-gray-600 mt-1 text-sm">Your assigned field jobs and visits, on the go.</p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="self-start inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-3 mb-3">
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <p className="text-xs text-gray-500">Total Jobs</p>
          <p className="text-2xl font-bold text-gray-900">{loading ? '…' : jobs.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <p className="text-xs text-gray-500">Active</p>
          <p className="text-2xl font-bold text-orange-600">{loading ? '…' : activeCount}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <p className="text-xs text-gray-500">Completed</p>
          <p className="text-2xl font-bold text-green-600">{loading ? '…' : completedCount}</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-3">
        {([
          { id: 'active', label: 'Active' },
          { id: 'all', label: 'All' },
          { id: 'completed', label: 'Completed' },
        ] as const).map((t) => (
          <button
            key={t.id}
            onClick={() => setFilter(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === t.id ? 'bg-emerald-600 text-white' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* States */}
      {loading ? (
        <div className="flex items-center justify-center gap-2 text-gray-500 bg-white rounded-lg border border-gray-200 p-10">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading your field jobs…
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
          <div>
            <p className="font-medium text-red-800">Could not load field jobs</p>
            <p className="text-sm text-red-600 mt-1">{error}</p>
            <button onClick={load} className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700">
              <RefreshCw className="h-4 w-4" /> Retry
            </button>
          </div>
        </div>
      ) : visibleJobs.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-10 text-center">
          <ClipboardList className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-700 font-medium">No field jobs to show</p>
          <p className="text-sm text-gray-500 mt-1">
            {filter === 'active'
              ? 'You have no active assignments right now.'
              : filter === 'completed'
              ? 'No completed jobs yet.'
              : 'No field service jobs have been assigned.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {visibleJobs.map((job, idx) => (
            <div key={job.id ?? job.jobNumber ?? idx} className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">{job.jobNumber ?? `Job ${idx + 1}`}</span>
                    {statusBadge(job.status)}
                  </div>
                  <p className="text-sm text-gray-600 mt-0.5">{job.customerName ?? 'Unknown customer'}</p>
                </div>
                {job.priority && (
                  <span className="text-xs font-medium text-gray-500 whitespace-nowrap">Priority {job.priority}</span>
                )}
              </div>

              {job.problemDescription && (
                <p className="text-sm text-gray-700 mb-2 line-clamp-2">{job.problemDescription}</p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-sm text-gray-600">
                {job.equipmentModel && (
                  <div className="flex items-center gap-2"><Wrench className="h-4 w-4 text-gray-400" />{job.equipmentModel}</div>
                )}
                {(job.serviceAddress) && (
                  <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-gray-400" /><span className="truncate">{job.serviceAddress}</span></div>
                )}
                <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-gray-400" />{formatDate(job.scheduledDate)}{job.scheduledTimeSlot ? ` · ${job.scheduledTimeSlot}` : ''}</div>
                {typeof job.estimatedDuration === 'number' && (
                  <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-gray-400" />{job.estimatedDuration}h est.</div>
                )}
                {job.assignedEngineerName && (
                  <div className="flex items-center gap-2"><User className="h-4 w-4 text-gray-400" />{job.assignedEngineerName}</div>
                )}
                {(job.siteContactPhone || job.contactPhone) && (
                  <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-gray-400" />{job.siteContactPhone || job.contactPhone}</div>
                )}
              </div>

              {String(job.status ?? '').toLowerCase() === 'completed' && (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-green-600 font-medium">
                  <CheckCircle className="h-4 w-4" /> Completed
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
