'use client';

import { useEffect, useMemo, useState } from 'react';
import { BarChart3, Search, Filter, Download, ZoomIn, Calendar, AlertTriangle, Link2, Clock } from 'lucide-react';
import { exportToCsv } from '@/lib/export';
import { projectManagementService } from '@/services/ProjectManagementService';

type GanttTask = {
  id: string;
  taskCode: string;
  taskName: string;
  projectCode: string;
  projectName: string;
  phase: string;
  startDate: string;
  endDate: string;
  duration: number; // in days
  progress: number; // 0-100
  status: 'not-started' | 'in-progress' | 'completed' | 'delayed' | 'on-hold';
  priority: 'critical' | 'high' | 'medium' | 'low';
  assignee: string;
  dependencies: string[];
  isMilestone: boolean;
};

function toGanttTask(t: any, idx: number): GanttTask {
  const startDate: string = String(
    t?.startDate ?? t?.start_date ?? t?.plannedStart ?? t?.start ?? ''
  );
  const endDate: string = String(
    t?.endDate ?? t?.end_date ?? t?.plannedEnd ?? t?.finish ?? t?.end ?? ''
  );

  // Derive duration in days from dates when not supplied.
  let duration = Number(t?.duration ?? t?.durationDays ?? NaN);
  if (!Number.isFinite(duration) || duration <= 0) {
    const s = startDate ? new Date(startDate).getTime() : NaN;
    const e = endDate ? new Date(endDate).getTime() : NaN;
    duration =
      Number.isFinite(s) && Number.isFinite(e)
        ? Math.max(1, Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1)
        : 0;
  }

  const depsRaw = t?.dependencies ?? t?.predecessors ?? [];
  const dependencies: string[] = Array.isArray(depsRaw)
    ? depsRaw.map((d: any) => String(d?.taskCode ?? d?.code ?? d?.id ?? d))
    : [];

  return {
    id: String(t?.id ?? t?.taskId ?? t?.taskCode ?? idx),
    taskCode: String(t?.taskCode ?? t?.code ?? t?.id ?? ''),
    taskName: String(t?.taskName ?? t?.name ?? t?.title ?? 'Untitled Task'),
    projectCode: String(t?.projectCode ?? t?.project?.code ?? ''),
    projectName: String(t?.projectName ?? t?.project?.name ?? ''),
    phase: String(t?.phase ?? t?.stage ?? 'General'),
    startDate,
    endDate,
    duration,
    progress: Number(t?.progress ?? t?.completionPercent ?? t?.percentComplete ?? 0),
    status: (t?.status ?? 'not-started') as GanttTask['status'],
    priority: (t?.priority ?? 'medium') as GanttTask['priority'],
    assignee: String(t?.assignee ?? t?.assignedTo ?? t?.owner ?? 'Unassigned'),
    dependencies,
    isMilestone: Boolean(t?.isMilestone ?? t?.milestone ?? false),
  };
}

export default function GanttChartPage() {
  const [ganttTasks, setGanttTasks] = useState<GanttTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        let raw: any[] = await projectManagementService.getProjectsSchedule();
        if (!Array.isArray(raw) || raw.length === 0) {
          // Fall back to task-based endpoint when the schedule is empty.
          const tasks = await projectManagementService.getProjectsTasks();
          raw = Array.isArray(tasks) ? tasks : [];
        }
        const mapped = raw.map((t, idx) => toGanttTask(t, idx));
        if (!cancelled) setGanttTasks(mapped);
      } catch (err: any) {
        if (!cancelled) {
          setLoadError(err?.message ?? 'Failed to load schedule');
          setGanttTasks([]);
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

  const [searchTerm, setSearchTerm] = useState('');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'not-started' | 'in-progress' | 'completed' | 'delayed' | 'on-hold'>('all');
  const [phaseFilter, setPhaseFilter] = useState<string>('all');

  const projects = useMemo(() => ['all', ...Array.from(new Set(ganttTasks.map(t => t.projectCode).filter(Boolean)))], [ganttTasks]);
  const phases = useMemo(() => ['all', ...Array.from(new Set(ganttTasks.map(t => t.phase).filter(Boolean)))], [ganttTasks]);

  const filtered = useMemo(() => {
    return ganttTasks.filter(t => {
      const matchesSearch = [
        t.taskCode,
        t.taskName,
        t.projectName,
        t.projectCode,
        t.assignee,
        t.phase
      ].some(v => v.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesProject = projectFilter === 'all' ? true : t.projectCode === projectFilter;
      const matchesStatus = statusFilter === 'all' ? true : t.status === statusFilter;
      const matchesPhase = phaseFilter === 'all' ? true : t.phase === phaseFilter;
      return matchesSearch && matchesProject && matchesStatus && matchesPhase;
    });
  }, [ganttTasks, searchTerm, projectFilter, statusFilter, phaseFilter]);

  // Calculate date range for Gantt view. Guard against an empty task list so
  // the timeline axis never produces Infinity / NaN dates and crash rendering.
  const minDate = useMemo(() => {
    const times = ganttTasks
      .map(t => new Date(t.startDate).getTime())
      .filter(n => Number.isFinite(n));
    if (times.length === 0) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      return d; // sensible default: today
    }
    return new Date(Math.min(...times));
  }, [ganttTasks]);

  const maxDate = useMemo(() => {
    const times = ganttTasks
      .map(t => new Date(t.endDate).getTime())
      .filter(n => Number.isFinite(n));
    if (times.length === 0) {
      // Default to a ~30 day window starting from minDate.
      const d = new Date(minDate);
      d.setDate(d.getDate() + 29);
      return d;
    }
    return new Date(Math.max(...times));
  }, [ganttTasks, minDate]);

  // Generate date columns (showing dates in the range)
  const dateColumns = useMemo(() => {
    const cols: Date[] = [];
    const current = new Date(minDate);
    // Cap the loop to guard against bad/inverted dates producing a huge range.
    while (current <= maxDate && cols.length < 366) {
      cols.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    if (cols.length === 0) cols.push(new Date(minDate));
    return cols;
  }, [minDate, maxDate]);

  // Calculate task bar position and width
  const getTaskBarStyle = (task: GanttTask) => {
    const taskStart = new Date(task.startDate);
    const taskEnd = new Date(task.endDate);
    const totalDays = dateColumns.length;
    const startOffset = Math.floor((taskStart.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));
    const width = Math.ceil((taskEnd.getTime() - taskStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    return {
      left: `${(startOffset / totalDays) * 100}%`,
      width: `${(width / totalDays) * 100}%`
    };
  };

  // Calculate stats from fetched state (guards empty via array methods).
  const totalTasks = ganttTasks.length;
  const completedTasks = ganttTasks.filter(t => t.status === 'completed').length;
  const inProgressTasks = ganttTasks.filter(t => t.status === 'in-progress').length;
  const milestones = ganttTasks.filter(t => t.isMilestone).length;

  return (
    <div className="p-6">
      <div className="mb-3">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <BarChart3 className="h-8 w-8 text-teal-600" />
          Gantt Chart
        </h1>
        <p className="text-gray-600 mt-2">Visual timeline with task dependencies and progress</p>
      </div>

      {/* Status banners */}
      {isLoading && (
        <div className="mb-3 rounded-lg border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-800 flex items-center gap-2">
          <Clock className="h-4 w-4 animate-pulse" />
          Loading schedule...
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          {loadError}
        </div>
      )}

      {/* Action Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex flex-col md:flex-row gap-2 justify-between">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              <ZoomIn className="h-4 w-4" />
              Zoom
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter className="h-4 w-4" />
              Filter
            </button>
            <button onClick={() => exportToCsv('gantt-chart', filtered)} className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg p-3 border border-teal-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-teal-600 text-sm font-medium">Total Tasks</p>
              <p className="text-3xl font-bold text-teal-900 mt-1">{totalTasks}</p>
            </div>
            <BarChart3 className="h-12 w-12 text-teal-600 opacity-50" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Completed</p>
              <p className="text-3xl font-bold text-green-900 mt-1">{completedTasks}</p>
            </div>
            <BarChart3 className="h-12 w-12 text-green-600 opacity-50" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">In Progress</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">{inProgressTasks}</p>
            </div>
            <BarChart3 className="h-12 w-12 text-blue-600 opacity-50" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">Milestones</p>
              <p className="text-3xl font-bold text-purple-900 mt-1">{milestones}</p>
            </div>
            <Calendar className="h-12 w-12 text-purple-600 opacity-50" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-2">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="flex items-center gap-2 mr-auto">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">Filters</span>
          </div>
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            {projects.map(p => (
              <option key={p} value={p}>{p === 'all' ? 'All Projects' : p}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="all">All Status</option>
            <option value="not-started">Not Started</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="delayed">Delayed</option>
            <option value="on-hold">On Hold</option>
          </select>
          <select
            value={phaseFilter}
            onChange={(e) => setPhaseFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            {phases.map(ph => (
              <option key={ph} value={ph}>{ph === 'all' ? 'All Phases' : ph}</option>
            ))}
          </select>
          <button
            onClick={() => {
              setSearchTerm('');
              setProjectFilter('all');
              setStatusFilter('all');
              setPhaseFilter('all');
            }}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Gantt Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[1200px]">
            {/* Task List Column + Timeline */}
            <div className="flex">
              {/* Task List (fixed width) */}
              <div className="w-80 flex-shrink-0 border-r border-gray-200">
                {/* Header */}
                <div className="bg-gray-50 border-b border-gray-200 p-3 font-semibold text-sm text-gray-700 h-16 flex items-center">
                  Task Details
                </div>
                {/* Task Rows */}
                {filtered.map(task => (
                  <div
                    key={task.id}
                    className="border-b border-gray-200 p-3 h-16 flex flex-col justify-center hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-gray-900">{task.taskName}</span>
                      {task.isMilestone && (
                        <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-xs rounded">Milestone</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {task.taskCode} • {task.assignee} • {task.duration}d
                    </div>
                  </div>
                ))}
                {filtered.length === 0 && (
                  <div className="p-8 text-center text-gray-500 text-sm">
                    {isLoading
                      ? 'Loading schedule...'
                      : loadError
                      ? 'Unable to load schedule'
                      : ganttTasks.length === 0
                      ? 'No scheduled tasks yet'
                      : 'No tasks match your filters'}
                  </div>
                )}
              </div>

              {/* Timeline */}
              <div className="flex-1 overflow-x-auto">
                {/* Date Header */}
                <div className="bg-gray-50 border-b border-gray-200 h-16 flex items-end pb-2">
                  {dateColumns.map((date, idx) => (
                    <div
                      key={idx}
                      className="flex-1 text-center text-xs text-gray-600 border-r border-gray-100 last:border-r-0"
                      style={{ minWidth: '40px' }}
                    >
                      <div className="font-semibold">{date.getDate()}</div>
                      <div className="text-[10px] text-gray-500">
                        {date.toLocaleDateString('en-US', { month: 'short' })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Task Bars */}
                <div className="relative">
                  {filtered.map(task => {
                    const barStyle = getTaskBarStyle(task);
                    const barColor = task.status === 'completed'
                      ? 'bg-green-500'
                      : task.status === 'in-progress'
                      ? 'bg-blue-500'
                      : task.status === 'delayed'
                      ? 'bg-red-500'
                      : task.status === 'on-hold'
                      ? 'bg-yellow-500'
                      : 'bg-gray-400';

                    return (
                      <div
                        key={task.id}
                        className="border-b border-gray-200 h-16 relative"
                      >
                        {/* Grid lines */}
                        <div className="absolute inset-0 flex">
                          {dateColumns.map((_, idx) => (
                            <div
                              key={idx}
                              className="flex-1 border-r border-gray-100 last:border-r-0"
                              style={{ minWidth: '40px' }}
                            />
                          ))}
                        </div>

                        {/* Task Bar */}
                        <div
                          className="absolute top-1/2 transform -translate-y-1/2 h-8"
                          style={{
                            left: barStyle.left,
                            width: barStyle.width
                          }}
                        >
                          {task.isMilestone ? (
                            // Milestone diamond
                            <div className="h-8 flex items-center justify-center">
                              <div className="w-4 h-4 bg-purple-600 transform rotate-45 shadow-md" />
                            </div>
                          ) : (
                            // Regular task bar
                            <div className={`h-full ${barColor} rounded shadow-sm flex items-center px-2 text-white text-xs font-medium overflow-hidden`}>
                              {/* Progress bar */}
                              <div className="absolute inset-0 bg-white opacity-20 rounded" style={{ width: `${100 - task.progress}%`, right: 0 }} />
                              <span className="relative z-10 truncate">{task.progress}%</span>
                            </div>
                          )}
                        </div>

                        {/* Dependencies (simplified) */}
                        {task.dependencies.length > 0 && (
                          <div className="absolute top-1 left-2">
                            <Link2 className="h-3 w-3 text-gray-400" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 bg-white rounded-lg shadow-sm border border-gray-200 p-3">
        <div className="flex items-center gap-3 flex-wrap text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-400 rounded" />
            <span className="text-gray-700">Not Started</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded" />
            <span className="text-gray-700">In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded" />
            <span className="text-gray-700">Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded" />
            <span className="text-gray-700">Delayed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded" />
            <span className="text-gray-700">On Hold</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-600 transform rotate-45" />
            <span className="text-gray-700">Milestone</span>
          </div>
          <div className="flex items-center gap-2">
            <Link2 className="h-4 w-4 text-gray-400" />
            <span className="text-gray-700">Has Dependencies</span>
          </div>
        </div>
      </div>

      {/* Guidelines */}
      <div className="mt-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-blue-600" />
          Gantt Chart Guidelines
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-700">
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Reading the Gantt Chart:</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>Task bars show duration and progress percentage</li>
              <li>Milestone diamonds mark key project deliverables</li>
              <li>Bar color indicates current task status</li>
              <li>Dependency icon shows tasks with predecessors</li>
              <li>Horizontal position shows timing relative to project</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Best Practices:</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>Update progress regularly for accurate tracking</li>
              <li>Identify critical path tasks and monitor closely</li>
              <li>Manage dependencies to prevent delays</li>
              <li>Use milestones to mark major achievements</li>
              <li>Adjust timelines based on actual progress</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
