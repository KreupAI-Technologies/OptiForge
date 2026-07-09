'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { projectManagementService, PmCommissioningRecord } from '@/services/ProjectManagementService';
import { ChevronLeft, Save, Loader2, AlertCircle } from 'lucide-react';

interface FormState {
  projectCode: string;
  projectName: string;
  siteLocation: string;
  commissioningDate: string;
  commissioningEngineer: string;
  clientRepresentative: string;
  status: string;
  testsPassed: string;
  totalTests: string;
  equipmentCount: string;
  commissionedEquipment: string;
  issuesFound: string;
  resolvedIssues: string;
  documentStatus: string;
  handoverDate: string;
}

const emptyForm: FormState = {
  projectCode: '',
  projectName: '',
  siteLocation: '',
  commissioningDate: '',
  commissioningEngineer: '',
  clientRepresentative: '',
  status: 'scheduled',
  testsPassed: '',
  totalTests: '',
  equipmentCount: '',
  commissionedEquipment: '',
  issuesFound: '',
  resolvedIssues: '',
  documentStatus: 'pending',
  handoverDate: '',
};

const statusMap: Record<string, string> = {
  Scheduled: 'scheduled', 'In Progress': 'in_progress', InProgress: 'in_progress',
  Completed: 'completed', Failed: 'failed', Rescheduled: 'rescheduled',
};

function toStr(v: unknown): string {
  return v == null ? '' : String(v);
}

export default function EditCommissioningPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const c = await projectManagementService.getCommissioning(params.id);
        if (cancelled) return;
        if (!c) {
          setLoadError('Commissioning record not found.');
          return;
        }
        const rawStatus = toStr(c.status);
        setForm({
          projectCode: toStr(c.projectCode ?? c.systemCode ?? c.activityNumber),
          projectName: toStr(c.projectName ?? c.equipmentSystem),
          siteLocation: toStr(c.siteLocation ?? c.location),
          commissioningDate: (c.commissioningDate ?? c.scheduledDate) ? String(c.commissioningDate ?? c.scheduledDate).slice(0, 10) : '',
          commissioningEngineer: toStr(c.commissioningEngineer ?? c.engineer),
          clientRepresentative: toStr(c.clientRepresentative ?? c.clientRep),
          status: statusMap[rawStatus] ?? rawStatus ?? 'scheduled',
          testsPassed: toStr(c.testsPassed ?? c.passedChecks),
          totalTests: toStr(c.totalTests ?? c.totalChecks),
          equipmentCount: toStr(c.equipmentCount),
          commissionedEquipment: toStr(c.commissionedEquipment),
          issuesFound: toStr(c.issuesFound ?? c.failedChecks),
          resolvedIssues: toStr(c.resolvedIssues),
          documentStatus: toStr(c.documentStatus) || 'pending',
          handoverDate: (c.handoverDate ?? c.actualDate) ? String(c.handoverDate ?? c.actualDate).slice(0, 10) : '',
        });
      } catch (err) {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : 'Failed to load commissioning record');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [params.id]);

  const update = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.projectName.trim()) errs.projectName = 'Project name is required';
    if (form.testsPassed && form.totalTests && Number(form.testsPassed) > Number(form.totalTests)) {
      errs.testsPassed = 'Tests passed cannot exceed total tests';
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const numOrUndef = (v: string) => (v === '' ? undefined : Number(v));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload: Partial<PmCommissioningRecord> = {
        projectCode: form.projectCode.trim() || undefined,
        projectName: form.projectName.trim(),
        siteLocation: form.siteLocation.trim() || undefined,
        commissioningDate: form.commissioningDate || undefined,
        commissioningEngineer: form.commissioningEngineer.trim() || undefined,
        clientRepresentative: form.clientRepresentative.trim() || undefined,
        status: form.status,
        testsPassed: numOrUndef(form.testsPassed),
        totalTests: numOrUndef(form.totalTests),
        equipmentCount: numOrUndef(form.equipmentCount),
        commissionedEquipment: numOrUndef(form.commissionedEquipment),
        issuesFound: numOrUndef(form.issuesFound),
        resolvedIssues: numOrUndef(form.resolvedIssues),
        documentStatus: form.documentStatus,
        handoverDate: form.handoverDate || undefined,
      };
      const updated = await projectManagementService.updateCommissioning(params.id, payload);
      if (!updated) throw new Error('Server did not return the updated commissioning record');
      setSuccess('Commissioning record updated successfully. Redirecting...');
      setTimeout(() => router.push('/projects/commissioning'), 900);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update commissioning record');
      setSubmitting(false);
    }
  };

  const inputClass =
    'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <div className="w-full min-h-screen px-4 py-4 max-w-4xl mx-auto">
      <div className="mb-4 flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.push('/projects/commissioning')}
          className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Commissioning Record</h1>
          <p className="text-sm text-gray-600">Update commissioning details and save.</p>
        </div>
      </div>

      {isLoading && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading commissioning record...
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" /> {loadError}
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      )}
      {success && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">{success}</div>
      )}

      {!isLoading && !loadError && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project Code</label>
              <input className={inputClass} value={form.projectCode} onChange={(e) => update('projectCode', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Name <span className="text-red-500">*</span>
              </label>
              <input className={inputClass} value={form.projectName} onChange={(e) => update('projectName', e.target.value)} />
              {fieldErrors.projectName && <p className="mt-1 text-xs text-red-600">{fieldErrors.projectName}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Site Location</label>
              <input className={inputClass} value={form.siteLocation} onChange={(e) => update('siteLocation', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Commissioning Date</label>
              <input type="date" className={inputClass} value={form.commissioningDate} onChange={(e) => update('commissioningDate', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Commissioning Engineer</label>
              <input className={inputClass} value={form.commissioningEngineer} onChange={(e) => update('commissioningEngineer', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client Representative</label>
              <input className={inputClass} value={form.clientRepresentative} onChange={(e) => update('clientRepresentative', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select className={inputClass} value={form.status} onChange={(e) => update('status', e.target.value)}>
                <option value="scheduled">Scheduled</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="rescheduled">Rescheduled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Document Status</label>
              <select className={inputClass} value={form.documentStatus} onChange={(e) => update('documentStatus', e.target.value)}>
                <option value="pending">Pending</option>
                <option value="partial">Partial</option>
                <option value="complete">Complete</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tests Passed</label>
              <input type="number" min="0" className={inputClass} value={form.testsPassed} onChange={(e) => update('testsPassed', e.target.value)} />
              {fieldErrors.testsPassed && <p className="mt-1 text-xs text-red-600">{fieldErrors.testsPassed}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Tests</label>
              <input type="number" min="0" className={inputClass} value={form.totalTests} onChange={(e) => update('totalTests', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Commissioned Equipment</label>
              <input type="number" min="0" className={inputClass} value={form.commissionedEquipment} onChange={(e) => update('commissionedEquipment', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Equipment Count</label>
              <input type="number" min="0" className={inputClass} value={form.equipmentCount} onChange={(e) => update('equipmentCount', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Resolved Issues</label>
              <input type="number" min="0" className={inputClass} value={form.resolvedIssues} onChange={(e) => update('resolvedIssues', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Issues Found</label>
              <input type="number" min="0" className={inputClass} value={form.issuesFound} onChange={(e) => update('issuesFound', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Handover Date</label>
              <input type="date" className={inputClass} value={form.handoverDate} onChange={(e) => update('handoverDate', e.target.value)} />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={() => router.push('/projects/commissioning')}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
