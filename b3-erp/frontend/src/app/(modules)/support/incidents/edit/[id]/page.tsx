'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, AlertTriangle, Save } from 'lucide-react';
import { ITILService, type ITILIncident } from '@/services/support.service';

const COMPANY_ID = process.env.NEXT_PUBLIC_COMPANY_ID || 'company-1';

interface FormState {
  title: string;
  description: string;
  impact: ITILIncident['impact'];
  urgency: ITILIncident['urgency'];
  priority: ITILIncident['priority'];
  status: ITILIncident['status'];
  category: string;
  subcategory: string;
  reportedBy: string;
  assignedTeam: string;
  assignedTo: string;
  resolutionNotes: string;
}

export default function IncidentEditPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState | null>(null);
  const [incidentNumber, setIncidentNumber] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const i = await ITILService.getIncidentById(params.id, COMPANY_ID);
        if (!i) throw new Error('Incident not found');
        if (!cancelled) {
          setIncidentNumber(i.incidentNumber || '');
          setForm({
            title: i.title || '',
            description: i.description || '',
            impact: i.impact || 'medium',
            urgency: i.urgency || 'medium',
            priority: i.priority || 'medium',
            status: i.status || 'open',
            category: i.category || '',
            subcategory: i.subcategory || '',
            reportedBy: i.reportedBy || '',
            assignedTeam: i.assignedTeam || '',
            assignedTo: i.assignedTo || '',
            resolutionNotes: i.resolutionNotes || '',
          });
        }
      } catch (err) {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : 'Failed to load incident');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      await ITILService.updateIncident(params.id, {
        title: form.title,
        description: form.description,
        impact: form.impact,
        urgency: form.urgency,
        priority: form.priority,
        status: form.status,
        category: form.category || undefined,
        subcategory: form.subcategory || undefined,
        reportedBy: form.reportedBy || undefined,
        assignedTeam: form.assignedTeam || undefined,
        assignedTo: form.assignedTo || undefined,
        resolutionNotes: form.resolutionNotes || undefined,
        companyId: COMPANY_ID,
      });
      router.push('/support/incidents');
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save incident');
      setIsSaving(false);
    }
  };

  const inputCls = 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500';
  const labelCls = 'block text-sm font-medium text-gray-700 mb-1';
  const levelOptions = (
    <>
      <option value="low">Low</option>
      <option value="medium">Medium</option>
      <option value="high">High</option>
      <option value="critical">Critical</option>
    </>
  );

  return (
    <div className="w-full min-h-screen px-3 py-2 max-w-3xl">
      <div className="mb-4">
        <button
          onClick={() => router.push('/support/incidents')}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Incidents
        </button>
      </div>

      <h1 className="mb-4 text-xl font-semibold text-gray-900">
        Edit Incident {incidentNumber && <span className="text-red-600">{incidentNumber}</span>}
      </h1>

      {isLoading && (
        <div className="space-y-3">
          <div className="h-10 w-full animate-pulse rounded bg-gray-100" />
          <div className="h-24 w-full animate-pulse rounded bg-gray-100" />
          <div className="h-10 w-full animate-pulse rounded bg-gray-100" />
        </div>
      )}

      {loadError && !isLoading && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white py-16 text-center">
          <AlertTriangle className="h-10 w-10 text-gray-300" />
          <p className="mt-3 flex items-center gap-2 text-sm font-medium text-red-700">
            <AlertTriangle className="h-4 w-4" /> {loadError}
          </p>
        </div>
      )}

      {!isLoading && !loadError && form && (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-gray-200 bg-white p-5">
          {saveError && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertTriangle className="h-4 w-4" />
              {saveError}
            </div>
          )}

          <div>
            <label className={labelCls}>Title</label>
            <input type="text" value={form.title} onChange={(e) => update('title', e.target.value)} className={inputCls} required />
          </div>

          <div>
            <label className={labelCls}>Description</label>
            <textarea value={form.description} onChange={(e) => update('description', e.target.value)} rows={4} className={inputCls} />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div>
              <label className={labelCls}>Impact</label>
              <select value={form.impact} onChange={(e) => update('impact', e.target.value as FormState['impact'])} className={inputCls}>{levelOptions}</select>
            </div>
            <div>
              <label className={labelCls}>Urgency</label>
              <select value={form.urgency} onChange={(e) => update('urgency', e.target.value as FormState['urgency'])} className={inputCls}>{levelOptions}</select>
            </div>
            <div>
              <label className={labelCls}>Priority</label>
              <select value={form.priority} onChange={(e) => update('priority', e.target.value as FormState['priority'])} className={inputCls}>{levelOptions}</select>
            </div>
            <div>
              <label className={labelCls}>Status</label>
              <select value={form.status} onChange={(e) => update('status', e.target.value as FormState['status'])} className={inputCls}>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="pending">Pending</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className={labelCls}>Category</label>
              <input type="text" value={form.category} onChange={(e) => update('category', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Subcategory</label>
              <input type="text" value={form.subcategory} onChange={(e) => update('subcategory', e.target.value)} className={inputCls} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className={labelCls}>Reported By</label>
              <input type="text" value={form.reportedBy} onChange={(e) => update('reportedBy', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Assigned Team</label>
              <input type="text" value={form.assignedTeam} onChange={(e) => update('assignedTeam', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Assigned To</label>
              <input type="text" value={form.assignedTo} onChange={(e) => update('assignedTo', e.target.value)} className={inputCls} />
            </div>
          </div>

          <div>
            <label className={labelCls}>Resolution Notes</label>
            <textarea value={form.resolutionNotes} onChange={(e) => update('resolutionNotes', e.target.value)} rows={3} className={inputCls} />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button type="button" onClick={() => router.push('/support/incidents')} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={isSaving} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm">
              <Save className="h-4 w-4" />
              {isSaving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
