'use client';

import { useEffect, useMemo, useState } from 'react';
import { GitBranch, AlertCircle, Target, ArrowRight, Loader2 } from 'lucide-react';
import { HrPagesService } from '@/services/hr-pages.service';

interface AlignedGoal {
  id: string;
  title: string;
  status: string;
  recordType: string;
  goalType: string;
  owner: string;
  department: string;
  progress: number;
  parentGoalId?: string;
  parentTitle?: string;
  weightage?: number;
}

const num = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const goalTypeRank = (t: string): number => {
  const s = t.toLowerCase();
  if (s === 'company') return 0;
  if (s === 'department') return 1;
  if (s === 'team') return 2;
  return 3;
};

export default function GoalAlignmentPage() {
  const [goals, setGoals] = useState<AlignedGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = (await HrPagesService.performanceGoals<any[]>()) as any[];
        const mapped: AlignedGoal[] = (raw ?? []).map((r, i) => {
          const d = (r?.data && typeof r.data === 'object') ? r.data : {};
          return {
            id: String(r?.id ?? d?.id ?? `${i}`),
            title: r?.title ?? d?.title ?? d?.goalTitle ?? 'Untitled Goal',
            status: String(r?.status ?? d?.status ?? 'active'),
            recordType: String(r?.recordType ?? 'my-goal'),
            goalType: String(d?.goalType ?? d?.type ?? (r?.recordType === 'department-goal' ? 'department' : r?.recordType === 'team-goal' ? 'team' : 'individual')),
            owner: d?.employeeName ?? d?.owner ?? d?.ownerName ?? '—',
            department: d?.department ?? d?.departmentName ?? '—',
            progress: num(d?.progress ?? r?.progress),
            parentGoalId: d?.parentGoalId ?? d?.parentId ?? undefined,
            parentTitle: d?.parentGoalTitle ?? d?.parentTitle ?? undefined,
            weightage: d?.weightage != null ? num(d.weightage) : undefined,
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

  // Build a parent -> children alignment view. Parent is resolved by explicit
  // parentGoalId, else by matching parentTitle.
  const alignment = useMemo(() => {
    const byId = new Map(goals.map((g) => [g.id, g]));
    const byTitle = new Map(goals.map((g) => [g.title.toLowerCase(), g]));

    const resolveParent = (g: AlignedGoal): AlignedGoal | undefined => {
      if (g.parentGoalId && byId.has(g.parentGoalId)) return byId.get(g.parentGoalId);
      if (g.parentTitle && byTitle.has(g.parentTitle.toLowerCase())) return byTitle.get(g.parentTitle.toLowerCase());
      return undefined;
    };

    const childrenOf = new Map<string, AlignedGoal[]>();
    const roots: AlignedGoal[] = [];
    for (const g of goals) {
      const parent = resolveParent(g);
      if (parent && parent.id !== g.id) {
        const arr = childrenOf.get(parent.id) ?? [];
        arr.push(g);
        childrenOf.set(parent.id, arr);
      } else {
        roots.push(g);
      }
    }
    roots.sort((a, b) => goalTypeRank(a.goalType) - goalTypeRank(b.goalType));
    return { roots, childrenOf };
  }, [goals]);

  const alignedCount = goals.filter((g) => g.parentGoalId || g.parentTitle).length;

  return (
    <div className="p-6 space-y-4">
      <div className="mb-1">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <GitBranch className="h-8 w-8 text-purple-600" />
          Goal Alignment
        </h1>
        <p className="text-gray-600 mt-2">Cascade organizational goals and view parent/child linkage</p>
      </div>

      {/* Summary */}
      {!isLoading && !loadError && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-xs text-gray-500">Total Goals</p>
            <p className="text-2xl font-bold text-gray-900">{goals.length}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-xs text-gray-500">Aligned (Cascaded)</p>
            <p className="text-2xl font-bold text-purple-600">{alignedCount}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-xs text-gray-500">Top-Level Goals</p>
            <p className="text-2xl font-bold text-indigo-600">{alignment.roots.length}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-gray-500">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            Loading goal alignment…
          </div>
        ) : loadError ? (
          <div className="flex items-center gap-2 py-12 justify-center text-red-600">
            <AlertCircle className="w-5 h-5" />
            <span>{loadError}</span>
          </div>
        ) : goals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <Target className="w-10 h-10 mb-2 text-gray-300" />
            <p>No goals found to align.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {alignment.roots.map((root) => {
              const children = alignment.childrenOf.get(root.id) ?? [];
              return (
                <div key={root.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between p-3 bg-purple-50 border-b border-purple-100">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-purple-600 text-white">
                        {root.goalType}
                      </span>
                      <div>
                        <p className="font-semibold text-gray-900">{root.title}</p>
                        <p className="text-xs text-gray-500">{root.owner} · {root.department}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-700">{root.progress}%</p>
                      <span className="text-xs text-gray-500 capitalize">{root.status.replace(/_/g, ' ')}</span>
                    </div>
                  </div>
                  {children.length > 0 ? (
                    <ul className="divide-y divide-gray-100">
                      {children.map((c) => (
                        <li key={c.id} className="flex items-center justify-between p-3 pl-8">
                          <div className="flex items-center gap-2">
                            <ArrowRight className="w-4 h-4 text-gray-300" />
                            <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                              {c.goalType}
                            </span>
                            <div>
                              <p className="text-sm text-gray-800">{c.title}</p>
                              <p className="text-xs text-gray-500">{c.owner} · {c.department}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-700">{c.progress}%</p>
                            {c.weightage != null && <span className="text-xs text-gray-400">wt {c.weightage}%</span>}
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="p-3 pl-8 text-xs text-gray-400 italic">No cascaded goals linked.</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
