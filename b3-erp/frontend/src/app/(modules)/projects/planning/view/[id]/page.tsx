'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { projectManagementService, PmProjectPlan } from '@/services/ProjectManagementService';
import {
  ChevronLeft,
  Edit,
  Loader2,
  AlertCircle,
  Calendar,
  Clock,
  Users,
  DollarSign,
  MapPin,
  Target,
  FolderKanban,
  TrendingUp,
} from 'lucide-react';

const statusColors: Record<string, string> = {
  planning: 'bg-blue-100 text-blue-700',
  approved: 'bg-purple-100 text-purple-700',
  in_execution: 'bg-yellow-100 text-yellow-700',
  on_hold: 'bg-orange-100 text-orange-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const priorityColors: Record<string, string> = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-blue-100 text-blue-600',
  high: 'bg-orange-100 text-orange-600',
  critical: 'bg-red-100 text-red-600',
};

const riskLevelColors: Record<string, string> = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
};

function formatIndianCurrency(amount: number) {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
  return `₹${amount.toLocaleString('en-IN')}`;
}

function titleCase(value: string) {
  return value
    .split('_')
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(' ');
}

export default function ViewProjectPlanPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [plan, setPlan] = useState<PmProjectPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const row = await projectManagementService.getProjectPlan(params.id);
        if (!cancelled) setPlan(row);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load project plan');
          setPlan(null);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [params.id]);

  const progress = Number(plan?.progressPercentage ?? 0);
  const milestones = Number(plan?.milestones ?? 0);
  const completedMilestones = Number(plan?.completedMilestones ?? 0);
  const status = plan?.status ?? '';
  const priority = plan?.priority ?? '';
  const riskLevel = plan?.riskLevel ?? '';

  return (
    <div className="w-full min-h-screen px-4 py-4 max-w-5xl mx-auto">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/projects/planning')}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{plan?.projectName || 'Project Plan'}</h1>
            <p className="text-sm text-gray-600">{plan?.projectCode || params.id}</p>
          </div>
        </div>
        {plan && (
          <button
            onClick={() => router.push(`/projects/planning/edit/${params.id}`)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Edit className="h-4 w-4" />
            <span>Edit</span>
          </button>
        )}
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading project plan...
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" /> {loadError}
        </div>
      )}
      {!isLoading && !loadError && !plan && (
        <div className="mb-3 rounded-lg border border-yellow-200 bg-yellow-50 px-3 py-2 text-sm text-yellow-700">
          Project plan not found.
        </div>
      )}

      {plan && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {status && (
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[status] ?? 'bg-gray-100 text-gray-700'}`}>
                {titleCase(status)}
              </span>
            )}
            {priority && (
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${priorityColors[priority] ?? 'bg-gray-100 text-gray-700'}`}>
                {titleCase(priority)} Priority
              </span>
            )}
            {riskLevel && (
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${riskLevelColors[riskLevel] ?? 'bg-gray-100 text-gray-700'}`}>
                {titleCase(riskLevel)} Risk
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
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
                <p className="text-sm text-gray-600">Estimated Budget</p>
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{formatIndianCurrency(Number(plan.estimatedBudget ?? 0))}</p>
              <p className="text-xs text-gray-500 mt-1">Actual: {formatIndianCurrency(Number(plan.actualBudget ?? 0))}</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Milestones</p>
                <Target className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{completedMilestones}/{milestones}</p>
              <p className="text-xs text-gray-500 mt-1">completed</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Team Size</p>
                <Users className="w-5 h-5 text-orange-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{Number(plan.teamSize ?? 0)}</p>
              <p className="text-xs text-gray-500 mt-1">members</p>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FolderKanban className="w-5 h-5 text-gray-500" /> Project Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Client" value={plan.client} />
              <Field label="Project Manager" value={plan.projectManager} />
              <Field label="Phase" value={plan.phase} />
              <Field label="Project Type" value={plan.projectType} />
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <p className="text-sm font-medium text-gray-900">{plan.location || '—'}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Start Date</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <p className="text-sm font-medium text-gray-900">{plan.startDate ? String(plan.startDate).slice(0, 10) : '—'}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">End Date</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <p className="text-sm font-medium text-gray-900">{plan.endDate ? String(plan.endDate).slice(0, 10) : '—'}</p>
                </div>
              </div>
              <Field label="Planned Hours" value={plan.plannedHours != null ? String(plan.plannedHours) : undefined} />
              <Field label="Actual Hours" value={plan.actualHours != null ? String(plan.actualHours) : undefined} />
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
