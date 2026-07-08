'use client';

import { useEffect, useMemo, useState } from 'react';
import { TrendingUp, AlertCircle, Loader2, Target, Search } from 'lucide-react';
import { HrPagesService } from '@/services/hr-pages.service';

interface TrackedGoal {
  id: string;
  title: string;
  owner: string;
  department: string;
  goalType: string;
  category: string;
  priority: string;
  status: string;
  progress: number;
  startDate: string;
  dueDate: string;
}

const num = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const statusColor = (s: string): string => {
  const v = s.toLowerCase();
  if (v === 'completed') return 'bg-green-100 text-green-700';
  if (v === 'in_progress' || v === 'in-progress' || v === 'active') return 'bg-blue-100 text-blue-700';
  if (v === 'cancelled' || v === 'deferred') return 'bg-gray-100 text-gray-600';
  if (v === 'draft' || v === 'pending_approval') return 'bg-amber-100 text-amber-700';
  return 'bg-gray-100 text-gray-600';
};

const progressColor = (p: number): string => {
  if (p >= 75) return 'bg-green-500';
  if (p >= 40) return 'bg-blue-500';
  if (p > 0) return 'bg-amber-500';
  return 'bg-gray-300';
};

export default function GoalTrackingPage() {
  const [goals, setGoals] = useState<TrackedGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = (await HrPagesService.performanceGoals<any[]>()) as any[];
        const mapped: TrackedGoal[] = (raw ?? []).map((r, i) => {
          const d = (r?.data && typeof r.data === 'object') ? r.data : {};
          return {
            id: String(r?.id ?? `${i}`),
            title: r?.title ?? d?.title ?? 'Untitled Goal',
            owner: d?.employeeName ?? d?.owner ?? d?.ownerName ?? '—',
            department: d?.department ?? d?.departmentName ?? '—',
            goalType: String(d?.goalType ?? d?.type ?? 'individual'),
            category: String(d?.category ?? 'performance'),
            priority: String(d?.priority ?? 'medium'),
            status: String(r?.status ?? d?.status ?? 'active'),
            progress: num(d?.progress ?? r?.progress),
            startDate: d?.startDate ?? '',
            dueDate: d?.dueDate ?? '',
          };
        });
        if (!cancelled) setGoals(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load goals');
          setGoals([]);
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

  const stats = useMemo(() => {
    const total = goals.length;
    const completed = goals.filter((g) => g.status.toLowerCase() === 'completed').length;
    const avg = total > 0 ? Math.round(goals.reduce((s, g) => s + g.progress, 0) / total) : 0;
    const overdue = goals.filter((g) => {
      if (!g.dueDate || g.status.toLowerCase() === 'completed') return false;
      const due = new Date(g.dueDate);
      return !Number.isNaN(due.getTime()) && due.getTime() < Date.now();
    }).length;
    return { total, completed, avg, overdue };
  }, [goals]);

  const filtered = useMemo(() => {
    return goals.filter((g) => {
      const matchesSearch =
        g.title.toLowerCase().includes(search.toLowerCase()) ||
        g.owner.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || g.status.toLowerCase() === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [goals, search, statusFilter]);

  return (
    <div className="p-6 space-y-4">
      <div className="mb-1">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <TrendingUp className="h-8 w-8 text-purple-600" />
          Goal Tracking
        </h1>
        <p className="text-gray-600 mt-2">Track goal progress and status across the organization</p>
      </div>

      {!isLoading && !loadError && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-xs text-gray-500">Total Goals</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-xs text-gray-500">Completed</p>
            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-xs text-gray-500">Avg. Progress</p>
            <p className="text-2xl font-bold text-blue-600">{stats.avg}%</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-xs text-gray-500">Overdue</p>
            <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-3 border-b border-gray-100 flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search goals or owners…"
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-gray-500">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            Loading goals…
          </div>
        ) : loadError ? (
          <div className="flex items-center gap-2 py-12 justify-center text-red-600">
            <AlertCircle className="w-5 h-5" />
            <span>{loadError}</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <Target className="w-10 h-10 mb-2 text-gray-300" />
            <p>No goals match your filters.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map((g) => (
              <div key={g.id} className="p-4">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <p className="font-medium text-gray-900">{g.title}</p>
                    <p className="text-xs text-gray-500">
                      {g.owner} · {g.department} · {g.goalType}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full capitalize whitespace-nowrap ${statusColor(g.status)}`}>
                    {g.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${progressColor(g.progress)}`} style={{ width: `${Math.min(100, Math.max(0, g.progress))}%` }} />
                  </div>
                  <span className="text-sm font-semibold text-gray-700 w-10 text-right">{g.progress}%</span>
                </div>
                {(g.startDate || g.dueDate) && (
                  <p className="text-xs text-gray-400 mt-1">
                    {g.startDate || '—'} → {g.dueDate || '—'}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
