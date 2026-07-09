'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { projectManagementService, PmDeliverable } from '@/services/ProjectManagementService';
import {
  ChevronLeft,
  Loader2,
  AlertCircle,
  Package,
  Calendar,
  User,
  TrendingUp,
  FileText,
} from 'lucide-react';

function statusColor(status?: string): string {
  switch ((status ?? '').toLowerCase()) {
    case 'completed':
    case 'complete':
      return 'bg-green-100 text-green-700';
    case 'in_progress':
    case 'in progress':
      return 'bg-blue-100 text-blue-700';
    case 'delayed':
    case 'overdue':
      return 'bg-red-100 text-red-700';
    case 'pending':
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

function titleCase(value: string) {
  return value
    .split('_')
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(' ');
}

export default function ViewDeliverablePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [deliverable, setDeliverable] = useState<PmDeliverable | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const row = await projectManagementService.getDeliverable(params.id);
        if (!cancelled) setDeliverable(row);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load deliverable');
          setDeliverable(null);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [params.id]);

  const progress = Number(deliverable?.progress ?? 0);
  const dependencies = Array.isArray(deliverable?.dependencies) ? deliverable!.dependencies : [];

  return (
    <div className="w-full min-h-screen px-4 py-4 max-w-5xl mx-auto">
      <div className="mb-4 flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.push('/project-management/deliverables')}
          className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{deliverable?.deliverableName || 'Deliverable'}</h1>
          <p className="text-sm text-gray-600">{deliverable?.deliverableNumber || params.id}</p>
        </div>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading deliverable...
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" /> {loadError}
        </div>
      )}
      {!isLoading && !loadError && !deliverable && (
        <div className="mb-3 rounded-lg border border-yellow-200 bg-yellow-50 px-3 py-2 text-sm text-yellow-700">
          Deliverable not found.
        </div>
      )}

      {deliverable && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {deliverable.status && (
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColor(deliverable.status)}`}>
                {titleCase(String(deliverable.status))}
              </span>
            )}
            {deliverable.type && (
              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-200 text-gray-700">
                {deliverable.type}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Progress</p>
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{progress}%</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div className="h-2 rounded-full bg-blue-500" style={{ width: `${Math.min(progress, 100)}%` }} />
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Quantity</p>
                <Package className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {deliverable.quantity != null ? deliverable.quantity : '—'}
                {deliverable.unit ? <span className="text-sm text-gray-500 ml-1">{deliverable.unit}</span> : null}
              </p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Assigned To</p>
                <User className="w-5 h-5 text-orange-600" />
              </div>
              <p className="text-lg font-semibold text-gray-900">{deliverable.assignedTo || '—'}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-500" /> Deliverable Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Project Number" value={deliverable.projectNumber} />
              <Field label="Project Name" value={deliverable.projectName} />
              <div>
                <p className="text-sm text-gray-500">Planned Date</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <p className="text-sm font-medium text-gray-900">{deliverable.plannedDate ? String(deliverable.plannedDate).slice(0, 10) : '—'}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Actual Date</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <p className="text-sm font-medium text-gray-900">{deliverable.actualDate ? String(deliverable.actualDate).slice(0, 10) : '—'}</p>
                </div>
              </div>
              <Field label="Type" value={deliverable.type} />
              <Field label="Unit" value={deliverable.unit} />
            </div>

            {deliverable.description && (
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-1">Description</p>
                <p className="text-sm text-gray-700 leading-relaxed">{deliverable.description}</p>
              </div>
            )}

            {deliverable.notes && (
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-1">Notes</p>
                <p className="text-sm text-gray-700 leading-relaxed">{deliverable.notes}</p>
              </div>
            )}

            {dependencies.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-1">Dependencies</p>
                <div className="flex flex-wrap gap-2">
                  {dependencies.map((dep, i) => (
                    <span key={i} className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                      {dep}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-sm font-medium text-gray-900 mt-1">{value || '—'}</p>
    </div>
  );
}
