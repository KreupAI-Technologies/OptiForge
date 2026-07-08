'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { projectManagementService, PmCommissioningRecord } from '@/services/ProjectManagementService';
import {
  ChevronLeft,
  Edit,
  FileText,
  Loader2,
  AlertCircle,
  Calendar,
  MapPin,
  Wrench,
  CheckCircle,
} from 'lucide-react';

const statusColors: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  completed: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  rescheduled: 'bg-orange-100 text-orange-700',
};

const statusMap: Record<string, string> = {
  Scheduled: 'scheduled', 'In Progress': 'in_progress', InProgress: 'in_progress',
  Completed: 'completed', Failed: 'failed', Rescheduled: 'rescheduled',
};

function titleCase(value: string) {
  return value
    .split('_')
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(' ');
}

export default function ViewCommissioningPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [record, setRecord] = useState<PmCommissioningRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const row = await projectManagementService.getCommissioning(params.id);
        if (!cancelled) setRecord(row);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load commissioning record');
          setRecord(null);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [params.id]);

  const projectCode = record?.projectCode ?? record?.systemCode ?? record?.activityNumber ?? '';
  const projectName = record?.projectName ?? record?.equipmentSystem ?? '';
  const siteLocation = record?.siteLocation ?? record?.location ?? '';
  const commissioningDate = record?.commissioningDate ?? record?.scheduledDate ?? '';
  const engineer = record?.commissioningEngineer ?? record?.engineer ?? '';
  const clientRep = record?.clientRepresentative ?? record?.clientRep ?? '';
  const rawStatus = record?.status ?? '';
  const status = statusMap[rawStatus] ?? rawStatus;
  const totalTests = Number(record?.totalTests ?? record?.totalChecks ?? 0);
  const testsPassed = Number(record?.testsPassed ?? record?.passedChecks ?? 0);
  const equipmentCount = Number(record?.equipmentCount ?? 0);
  const commissionedEquipment = Number(record?.commissionedEquipment ?? 0);
  const issuesFound = Number(record?.issuesFound ?? record?.failedChecks ?? 0);
  const resolvedIssues = Number(record?.resolvedIssues ?? 0);
  const handoverDate = record?.handoverDate ?? record?.actualDate ?? '';

  return (
    <div className="w-full min-h-screen px-4 py-4 max-w-5xl mx-auto">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/projects/commissioning')}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{projectName || 'Commissioning Record'}</h1>
            <p className="text-sm text-gray-600">{projectCode || params.id}</p>
          </div>
        </div>
        {record && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push(`/projects/commissioning/docs/${params.id}`)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              <FileText className="h-4 w-4" />
              <span>Documents</span>
            </button>
            <button
              onClick={() => router.push(`/projects/commissioning/edit/${params.id}`)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Edit className="h-4 w-4" />
              <span>Edit</span>
            </button>
          </div>
        )}
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading commissioning record...
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" /> {loadError}
        </div>
      )}
      {!isLoading && !loadError && !record && (
        <div className="mb-3 rounded-lg border border-yellow-200 bg-yellow-50 px-3 py-2 text-sm text-yellow-700">
          Commissioning record not found.
        </div>
      )}

      {record && (
        <div className="space-y-4">
          {status && (
            <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${statusColors[status] ?? 'bg-gray-100 text-gray-700'}`}>
              {titleCase(status)}
            </span>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Tests Passed</p>
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{testsPassed}/{totalTests}</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div className="h-2 rounded-full bg-green-500" style={{ width: `${totalTests ? Math.min((testsPassed / totalTests) * 100, 100) : 0}%` }} />
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Equipment</p>
                <Wrench className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{commissionedEquipment}/{equipmentCount}</p>
              <p className="text-xs text-gray-500 mt-1">commissioned</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Issues</p>
                <AlertCircle className="w-5 h-5 text-orange-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{resolvedIssues}/{issuesFound}</p>
              <p className="text-xs text-gray-500 mt-1">{Math.max(issuesFound - resolvedIssues, 0)} pending</p>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Commissioning Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Site Location</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <p className="text-sm font-medium text-gray-900">{siteLocation || '—'}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Commissioning Date</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <p className="text-sm font-medium text-gray-900">{commissioningDate ? String(commissioningDate).slice(0, 10) : '—'}</p>
                </div>
              </div>
              <Field label="Commissioning Engineer" value={engineer} />
              <Field label="Client Representative" value={clientRep} />
              <Field label="Handover Date" value={handoverDate ? String(handoverDate).slice(0, 10) : ''} />
              <Field label="Document Status" value={record.documentStatus ? titleCase(String(record.documentStatus)) : ''} />
            </div>
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
