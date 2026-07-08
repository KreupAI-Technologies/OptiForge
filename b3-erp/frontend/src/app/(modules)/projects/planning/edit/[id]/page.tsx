'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { projectManagementService, PmProjectPlan } from '@/services/ProjectManagementService';
import { ChevronLeft, Save, Loader2, AlertCircle } from 'lucide-react';

interface FormState {
  projectCode: string;
  projectName: string;
  client: string;
  projectManager: string;
  startDate: string;
  endDate: string;
  estimatedBudget: string;
  actualBudget: string;
  status: string;
  priority: string;
  phase: string;
  progressPercentage: string;
  milestones: string;
  completedMilestones: string;
  teamSize: string;
  location: string;
  projectType: string;
  riskLevel: string;
  plannedHours: string;
  actualHours: string;
}

const emptyForm: FormState = {
  projectCode: '',
  projectName: '',
  client: '',
  projectManager: '',
  startDate: '',
  endDate: '',
  estimatedBudget: '',
  actualBudget: '',
  status: 'planning',
  priority: 'medium',
  phase: '',
  progressPercentage: '',
  milestones: '',
  completedMilestones: '',
  teamSize: '',
  location: '',
  projectType: 'Commercial Kitchen',
  riskLevel: 'low',
  plannedHours: '',
  actualHours: '',
};

function toStr(v: unknown): string {
  return v == null ? '' : String(v);
}

export default function EditProjectPlanPage({ params }: { params: { id: string } }) {
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
        const p = await projectManagementService.getProjectPlan(params.id);
        if (cancelled) return;
        if (!p) {
          setLoadError('Project plan not found.');
          return;
        }
        setForm({
          projectCode: toStr(p.projectCode),
          projectName: toStr(p.projectName),
          client: toStr(p.client),
          projectManager: toStr(p.projectManager),
          startDate: p.startDate ? String(p.startDate).slice(0, 10) : '',
          endDate: p.endDate ? String(p.endDate).slice(0, 10) : '',
          estimatedBudget: toStr(p.estimatedBudget),
          actualBudget: toStr(p.actualBudget),
          status: toStr(p.status) || 'planning',
          priority: toStr(p.priority) || 'medium',
          phase: toStr(p.phase),
          progressPercentage: toStr(p.progressPercentage),
          milestones: toStr(p.milestones),
          completedMilestones: toStr(p.completedMilestones),
          teamSize: toStr(p.teamSize),
          location: toStr(p.location),
          projectType: toStr(p.projectType) || 'Commercial Kitchen',
          riskLevel: toStr(p.riskLevel) || 'low',
          plannedHours: toStr(p.plannedHours),
          actualHours: toStr(p.actualHours),
        });
      } catch (err) {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : 'Failed to load project plan');
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
    if (form.startDate && form.endDate && form.endDate < form.startDate) {
      errs.endDate = 'End date must be on or after the start date';
    }
    if (form.estimatedBudget && Number(form.estimatedBudget) < 0) {
      errs.estimatedBudget = 'Budget cannot be negative';
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
      const payload: Partial<PmProjectPlan> = {
        projectCode: form.projectCode.trim() || undefined,
        projectName: form.projectName.trim(),
        client: form.client.trim() || undefined,
        projectManager: form.projectManager.trim() || undefined,
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
        estimatedBudget: numOrUndef(form.estimatedBudget),
        actualBudget: numOrUndef(form.actualBudget),
        status: form.status,
        priority: form.priority,
        phase: form.phase.trim() || undefined,
        progressPercentage: numOrUndef(form.progressPercentage),
        milestones: numOrUndef(form.milestones),
        completedMilestones: numOrUndef(form.completedMilestones),
        teamSize: numOrUndef(form.teamSize),
        location: form.location.trim() || undefined,
        projectType: form.projectType,
        riskLevel: form.riskLevel,
        plannedHours: numOrUndef(form.plannedHours),
        actualHours: numOrUndef(form.actualHours),
      };
      const updated = await projectManagementService.updateProjectPlan(params.id, payload);
      if (!updated) throw new Error('Server did not return the updated project plan');
      setSuccess('Project plan updated successfully. Redirecting...');
      setTimeout(() => router.push('/projects/planning'), 900);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update project plan');
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
          onClick={() => router.push('/projects/planning')}
          className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Project Plan</h1>
          <p className="text-sm text-gray-600">Update project plan details and save.</p>
        </div>
      </div>

      {isLoading && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading project plan...
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
              <input className={inputClass} value={form.client} onChange={(e) => update('client', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project Manager</label>
              <input className={inputClass} value={form.projectManager} onChange={(e) => update('projectManager', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input type="date" className={inputClass} value={form.startDate} onChange={(e) => update('startDate', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input type="date" className={inputClass} value={form.endDate} onChange={(e) => update('endDate', e.target.value)} />
              {fieldErrors.endDate && <p className="mt-1 text-xs text-red-600">{fieldErrors.endDate}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Budget (₹)</label>
              <input type="number" min="0" className={inputClass} value={form.estimatedBudget} onChange={(e) => update('estimatedBudget', e.target.value)} />
              {fieldErrors.estimatedBudget && <p className="mt-1 text-xs text-red-600">{fieldErrors.estimatedBudget}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Actual Budget (₹)</label>
              <input type="number" min="0" className={inputClass} value={form.actualBudget} onChange={(e) => update('actualBudget', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input className={inputClass} value={form.location} onChange={(e) => update('location', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project Type</label>
              <select className={inputClass} value={form.projectType} onChange={(e) => update('projectType', e.target.value)}>
                <option value="Commercial Kitchen">Commercial Kitchen</option>
                <option value="Industrial Setup">Industrial Setup</option>
                <option value="Hospital Equipment">Hospital Equipment</option>
                <option value="Institutional">Institutional</option>
                <option value="Residential">Residential</option>
                <option value="Custom">Custom</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phase</label>
              <input className={inputClass} value={form.phase} onChange={(e) => update('phase', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Progress (%)</label>
              <input type="number" min="0" max="100" className={inputClass} value={form.progressPercentage} onChange={(e) => update('progressPercentage', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select className={inputClass} value={form.status} onChange={(e) => update('status', e.target.value)}>
                <option value="planning">Planning</option>
                <option value="approved">Approved</option>
                <option value="in_execution">In Execution</option>
                <option value="on_hold">On Hold</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select className={inputClass} value={form.priority} onChange={(e) => update('priority', e.target.value)}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Risk Level</label>
              <select className={inputClass} value={form.riskLevel} onChange={(e) => update('riskLevel', e.target.value)}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Milestones</label>
              <input type="number" min="0" className={inputClass} value={form.milestones} onChange={(e) => update('milestones', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Completed Milestones</label>
              <input type="number" min="0" className={inputClass} value={form.completedMilestones} onChange={(e) => update('completedMilestones', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Team Size</label>
              <input type="number" min="0" className={inputClass} value={form.teamSize} onChange={(e) => update('teamSize', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Planned Hours</label>
              <input type="number" min="0" className={inputClass} value={form.plannedHours} onChange={(e) => update('plannedHours', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Actual Hours</label>
              <input type="number" min="0" className={inputClass} value={form.actualHours} onChange={(e) => update('actualHours', e.target.value)} />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={() => router.push('/projects/planning')}
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
