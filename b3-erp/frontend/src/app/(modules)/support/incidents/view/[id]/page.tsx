'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Edit, AlertTriangle, User, Users, Calendar } from 'lucide-react';
import { ITILService, type ITILIncident } from '@/services/support.service';

const COMPANY_ID = process.env.NEXT_PUBLIC_COMPANY_ID || 'company-1';

const priorityColors: Record<string, string> = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
};

const statusColors: Record<string, string> = {
  open: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  pending: 'bg-orange-100 text-orange-700',
  resolved: 'bg-green-100 text-green-700',
  closed: 'bg-gray-100 text-gray-700',
};

const titleCase = (v: string) =>
  (v || '').split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
const fmtDate = (d: unknown) => {
  if (!d) return '—';
  const parsed = new Date(d as string);
  return isNaN(parsed.getTime()) ? String(d).slice(0, 16) : parsed.toISOString().slice(0, 16).replace('T', ' ');
};

export default function IncidentViewPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [incident, setIncident] = useState<ITILIncident | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const res = await ITILService.getIncidentById(params.id, COMPANY_ID);
        if (!cancelled) setIncident(res);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load incident');
          setIncident(null);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  return (
    <div className="w-full min-h-screen px-3 py-2 max-w-full">
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => router.push('/support/incidents')}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Incidents
        </button>
        {incident && (
          <button
            onClick={() => router.push(`/support/incidents/edit/${incident.id}`)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <Edit className="h-4 w-4" />
            Edit
          </button>
        )}
      </div>

      {isLoading && (
        <div className="space-y-3">
          <div className="h-8 w-1/2 animate-pulse rounded bg-gray-200" />
          <div className="h-40 w-full animate-pulse rounded-lg bg-gray-100" />
          <div className="h-40 w-full animate-pulse rounded-lg bg-gray-100" />
        </div>
      )}

      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4" />
          {loadError}
        </div>
      )}

      {!isLoading && !loadError && !incident && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white py-16 text-center">
          <AlertTriangle className="h-10 w-10 text-gray-300" />
          <p className="mt-3 text-sm font-medium text-gray-900">Incident not found</p>
          <p className="text-sm text-gray-500">The incident you are looking for does not exist.</p>
        </div>
      )}

      {!isLoading && !loadError && incident && (
        <div className="space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm font-medium text-red-600">{incident.incidentNumber}</div>
                <h1 className="mt-1 text-xl font-semibold text-gray-900">{incident.title}</h1>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[incident.status] || 'bg-gray-100 text-gray-700'}`}>
                  {titleCase(incident.status)}
                </span>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${priorityColors[incident.priority] || 'bg-gray-100 text-gray-700'}`}>
                  {titleCase(incident.priority)}
                </span>
              </div>
            </div>
            <p className="mt-4 whitespace-pre-wrap text-sm text-gray-700">{incident.description || '—'}</p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-gray-200 bg-white p-5">
              <h2 className="mb-3 text-sm font-semibold text-gray-900">Assessment</h2>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Impact</dt>
                  <dd className="text-gray-900">{titleCase(incident.impact)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Urgency</dt>
                  <dd className="text-gray-900">{titleCase(incident.urgency)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Category</dt>
                  <dd className="text-gray-900">{incident.category || '—'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Subcategory</dt>
                  <dd className="text-gray-900">{incident.subcategory || '—'}</dd>
                </div>
              </dl>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-5">
              <h2 className="mb-3 text-sm font-semibold text-gray-900">Assignment</h2>
              <dl className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-700">
                  <User className="h-4 w-4 text-gray-400" />
                  Reported by: {incident.reportedBy || '—'}
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Users className="h-4 w-4 text-gray-400" />
                  Team: {incident.assignedTeam || '—'}
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <User className="h-4 w-4 text-gray-400" />
                  Assignee: {incident.assignedTo || '—'}
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  Created: {fmtDate(incident.createdAt)}
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  Resolved: {fmtDate(incident.resolvedAt)}
                </div>
              </dl>
            </div>
          </div>

          {incident.resolutionNotes && (
            <div className="rounded-lg border border-gray-200 bg-white p-5">
              <h2 className="mb-2 text-sm font-semibold text-gray-900">Resolution Notes</h2>
              <p className="whitespace-pre-wrap text-sm text-gray-700">{incident.resolutionNotes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
