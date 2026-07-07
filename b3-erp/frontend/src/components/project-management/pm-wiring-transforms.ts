'use client';

/**
 * Shared, defensive transforms that map NestJS project-management read
 * endpoints into the exact prop shapes the project-management visualization
 * components expect. Used by the critical-path, phase-progress, workflow and
 * resource-conflicts pages. All transforms are empty-safe.
 */
import type React from 'react';
import {
  FileText,
  Ruler,
  Cog,
  ShoppingCart,
  Factory,
  PackageCheck,
  Truck,
  Home,
} from 'lucide-react';

// ---- Component-facing types (kept in sync with the components) ----
export interface CriticalPathTask {
  id: string;
  name: string;
  workOrderNumber?: string;
  startDate: Date;
  endDate: Date;
  duration: number;
  progress: number;
  dependencies: string[];
  assignee?: string;
  workCenter?: string;
  status: 'not-started' | 'in-progress' | 'completed' | 'delayed';
  slack: number;
  isCritical?: boolean;
}

export interface PhaseTaskShape {
  id: string;
  name: string;
  status: 'completed' | 'in-progress' | 'pending' | 'blocked';
  progress: number;
  assignee?: string;
}

export interface PhaseShape {
  id: string;
  number: number;
  name: string;
  shortName: string;
  description: string;
  icon: React.ElementType;
  status: 'completed' | 'in-progress' | 'pending' | 'blocked';
  progress: number;
  startDate?: Date;
  endDate?: Date;
  tasks: PhaseTaskShape[];
  color: string;
}

export interface ConflictShape {
  id: string;
  resourceId: string;
  resourceName: string;
  resourceType: 'human' | 'equipment' | 'workstation';
  severity: 'critical' | 'warning' | 'info';
  conflictType: 'overallocation' | 'double-booking' | 'skill-mismatch' | 'unavailable';
  period: { start: Date; end: Date };
  currentAllocation: number;
  maxCapacity: number;
  affectedTasks: { id: string; name: string; project: string; allocation: number }[];
  suggestedResolutions: string[];
}

// ---- Helpers ----
const toNum = (v: unknown, fallback = 0): number => {
  const n = typeof v === 'number' ? v : parseFloat(String(v ?? ''));
  return Number.isFinite(n) ? n : fallback;
};

const toDate = (v: unknown, fallback: Date): Date => {
  if (!v) return fallback;
  const d = new Date(String(v));
  return Number.isNaN(d.getTime()) ? fallback : d;
};

const daysBetween = (a: Date, b: Date): number =>
  Math.max(0, Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24)));

const normStatus = (s: unknown): string => String(s ?? '').toLowerCase();

// ---- Critical path ----
export function toCriticalPathTasks(rows: any[]): CriticalPathTask[] {
  if (!Array.isArray(rows)) return [];
  const base = new Date();
  return rows.map((r, idx) => {
    const start = toDate(r?.startDate ?? r?.start_date, base);
    const end = toDate(r?.endDate ?? r?.end_date, start);
    const progress = toNum(r?.progress);
    const s = normStatus(r?.status);
    let status: CriticalPathTask['status'] = 'not-started';
    if (progress >= 100 || s.includes('complete')) status = 'completed';
    else if (s.includes('delay') || s.includes('block')) status = 'delayed';
    else if (progress > 0 || s.includes('progress')) status = 'in-progress';

    let deps: string[] = [];
    const rawDeps = r?.dependencies;
    if (Array.isArray(rawDeps)) deps = rawDeps.map((d: any) => String(d));
    else if (typeof rawDeps === 'string') {
      try {
        const parsed = JSON.parse(rawDeps);
        if (Array.isArray(parsed)) deps = parsed.map((d: any) => String(d));
      } catch {
        deps = rawDeps ? rawDeps.split(',').map((d) => d.trim()).filter(Boolean) : [];
      }
    }

    // On a linear dependency chain, tasks that are not yet completed and have
    // predecessors sit on the critical path; completed tasks with deps were
    // also on it. Tasks with no deps and slack are treated as non-critical.
    const isCritical = deps.length > 0 || idx === 0;
    const slack = isCritical ? 0 : 2;

    return {
      id: String(r?.id ?? `task-${idx}`),
      name: String(r?.name ?? `Task ${idx + 1}`),
      startDate: start,
      endDate: end,
      duration: daysBetween(start, end) || 1,
      progress,
      dependencies: deps,
      assignee: r?.assignee ?? undefined,
      workCenter: r?.phase ?? undefined,
      status,
      slack,
      isCritical,
    };
  });
}

// ---- Phases ----
const PHASE_ICONS: React.ElementType[] = [
  FileText,
  Ruler,
  Cog,
  ShoppingCart,
  Factory,
  PackageCheck,
  Truck,
  Home,
];
const PHASE_COLORS = ['blue', 'indigo', 'purple', 'orange', 'red', 'green', 'cyan', 'emerald'];

const shortName = (name: string): string => {
  const parts = name.split(/\s*&\s*|\s+/).filter(Boolean);
  return parts.length > 2 ? parts.slice(-2).join(' ') : name;
};

const mapPhaseStatus = (s: unknown): PhaseShape['status'] => {
  const v = normStatus(s);
  if (v.includes('complete')) return 'completed';
  if (v.includes('block')) return 'blocked';
  if (v.includes('progress')) return 'in-progress';
  return 'pending';
};

export function toPhases(rows: any[]): PhaseShape[] {
  if (!Array.isArray(rows)) return [];
  return rows.map((r, idx) => {
    const name = String(r?.phase ?? r?.name ?? `Phase ${idx + 1}`);
    const tasks: PhaseTaskShape[] = Array.isArray(r?.tasks)
      ? r.tasks.map((t: any, ti: number) => ({
          id: String(t?.id ?? `${idx}-${ti}`),
          name: String(t?.name ?? `Task ${ti + 1}`),
          status: mapPhaseStatus(t?.status ?? (toNum(t?.progress) >= 100 ? 'completed' : 'pending')),
          progress: toNum(t?.progress),
          assignee: t?.assignee ?? undefined,
        }))
      : [];
    return {
      id: `phase-${idx + 1}`,
      number: idx + 1,
      name,
      shortName: shortName(name),
      description: `${toNum(r?.taskCount, tasks.length)} task(s) in ${name}`,
      icon: PHASE_ICONS[idx % PHASE_ICONS.length],
      status: mapPhaseStatus(r?.status),
      progress: toNum(r?.progress),
      startDate: r?.startDate ? toDate(r.startDate, new Date()) : undefined,
      endDate: r?.endDate ? toDate(r.endDate, new Date()) : undefined,
      tasks,
      color: PHASE_COLORS[idx % PHASE_COLORS.length],
    };
  });
}

/** Index (1-based) of the first non-completed phase, for currentPhase prop. */
export function deriveCurrentPhase(phases: PhaseShape[]): number {
  if (!phases.length) return 1;
  const active = phases.find((p) => p.status !== 'completed');
  return active ? active.number : phases[phases.length - 1].number;
}

// ---- Resource conflicts ----
export function toConflicts(rows: any[]): ConflictShape[] {
  if (!Array.isArray(rows)) return [];
  const today = new Date();
  return rows
    .map((r, idx) => {
      const allocation = toNum(r?.allocation);
      const type = normStatus(r?.role) === 'equipment' ? 'equipment' : 'human';
      const resourceType: ConflictShape['resourceType'] =
        normStatus(r?.role).includes('equip') || normStatus(r?.resourceName).match(/machine|cnc|laser/i)
          ? 'equipment'
          : 'human';
      const severity: ConflictShape['severity'] =
        allocation >= 150 ? 'critical' : allocation > 100 ? 'warning' : 'info';
      const conflictType: ConflictShape['conflictType'] =
        allocation >= 200 ? 'double-booking' : 'overallocation';
      return {
        id: String(r?.id ?? `conflict-${idx}`),
        resourceId: String(r?.resourceId ?? r?.resource_id ?? `res-${idx}`),
        resourceName: String(r?.resourceName ?? r?.resource_name ?? 'Unknown Resource'),
        resourceType: type === 'equipment' ? 'equipment' : resourceType,
        severity,
        conflictType,
        period: {
          start: toDate(r?.startDate ?? r?.start_date, today),
          end: toDate(r?.endDate ?? r?.end_date, today),
        },
        currentAllocation: allocation,
        maxCapacity: 100,
        affectedTasks: [
          {
            id: `${r?.id ?? idx}-t1`,
            name: `${r?.role ?? 'Assignment'} — ${r?.projectPhase ?? r?.project_phase ?? 'Project'}`,
            project: String(r?.projectPhase ?? r?.project_phase ?? 'PRJ'),
            allocation,
          },
        ],
        suggestedResolutions: [
          'Reassign part of the workload to an available resource',
          'Shift the task window to reduce overlap',
          'Split the allocation across shifts',
        ],
        _over: allocation > 100,
      } as ConflictShape & { _over: boolean };
    })
    // Only over-allocated rows are genuine conflicts.
    .filter((c) => (c as any)._over)
    .map(({ _over, ...c }: any) => c as ConflictShape);
}
