'use client';

import React, { useState, useEffect } from 'react';
import { exportToCsv, printCurrentView } from '@/lib/export';
import { projectManagementService } from '@/services/ProjectManagementService';
import {
 ChevronLeft,
 ChevronRight,
 Calendar,
 ZoomIn,
 ZoomOut,
 Download,
 Filter,
 Plus,
 GitBranch,
 TrendingUp,
 Layers,
 Target,
 Link2,
 Clock,
 RefreshCw,
 Printer,
 FileText,
} from 'lucide-react';
import {
 AddMilestoneModal,
 EditDependenciesModal,
 ResourceLoadingModal,
 TimelineFilterModal,
 ExportGanttModal,
 BaselineComparisonModal,
 CriticalPathModal,
 AddTaskLinkModal,
 EditDurationModal,
 RescheduleModal,
 PrintSetupModal,
 TimelineTemplatesModal,
} from '@/components/project-management/GanttChartModals';

interface Task {
 id: string;
 name: string;
 startDate: string;
 endDate: string;
 progress: number;
 assignee: string;
 dependencies: string[];
 phase: string;
 status: 'Completed' | 'In Progress' | 'Not Started' | 'Delayed';
}

export default function ScheduleGanttPage() {
 const [tasks, setTasks] = useState<Task[]>([]);
 const [loading, setLoading] = useState(true);
 const [loadError, setLoadError] = useState<string | null>(null);
 const [submitting, setSubmitting] = useState(false);
 const [actionError, setActionError] = useState<string | null>(null);
 const [actionSuccess, setActionSuccess] = useState<string | null>(null);

 const refreshTasks = async () => {
  const rows = await projectManagementService.listScheduleTasks();
  setTasks(Array.isArray(rows) ? (rows as unknown as Task[]) : []);
 };

 useEffect(() => {
  let active = true;
  (async () => {
   setLoading(true);
   setLoadError(null);
   try {
    await refreshTasks();
   } catch (e) {
    if (active) setLoadError(e instanceof Error ? e.message : 'Failed to load schedule');
   } finally {
    if (active) setLoading(false);
   }
  })();
  return () => { active = false; };
 }, []);

 const runAction = async (fn: () => Promise<void>, success: string, close: () => void) => {
  setSubmitting(true);
  setActionError(null);
  setActionSuccess(null);
  try {
   await fn();
   await refreshTasks();
   setActionSuccess(success);
   close();
  } catch (err) {
   setActionError(err instanceof Error ? err.message : 'Action failed');
  } finally {
   setSubmitting(false);
  }
 };

 const [viewMode, setViewMode] = useState<'days' | 'weeks' | 'months'>('weeks');
 const [currentDate, setCurrentDate] = useState(new Date('2024-03-15'));
 const [filterPhase, setFilterPhase] = useState('All');

 // Modal states
 const [showAddMilestone, setShowAddMilestone] = useState(false);
 const [showEditDependencies, setShowEditDependencies] = useState(false);
 const [showResourceLoading, setShowResourceLoading] = useState(false);
 const [showTimelineFilter, setShowTimelineFilter] = useState(false);
 const [showExportGantt, setShowExportGantt] = useState(false);
 const [showBaselineComparison, setShowBaselineComparison] = useState(false);
 const [showCriticalPath, setShowCriticalPath] = useState(false);
 const [showAddTaskLink, setShowAddTaskLink] = useState(false);
 const [showEditDuration, setShowEditDuration] = useState(false);
 const [showReschedule, setShowReschedule] = useState(false);
 const [showPrintSetup, setShowPrintSetup] = useState(false);
 const [showTemplates, setShowTemplates] = useState(false);
 const [selectedTask, setSelectedTask] = useState<Task | null>(null);

 const projectStart = new Date('2024-01-15');
 const projectEnd = new Date('2024-04-30');

 // Generate timeline dates based on view mode
 const generateTimeline = () => {
  const timeline: Date[] = [];
  const current = new Date(projectStart);

  if (viewMode === 'days') {
   while (current <= projectEnd) {
    timeline.push(new Date(current));
    current.setDate(current.getDate() + 1);
   }
  } else if (viewMode === 'weeks') {
   while (current <= projectEnd) {
    timeline.push(new Date(current));
    current.setDate(current.getDate() + 7);
   }
  } else {
   while (current <= projectEnd) {
    timeline.push(new Date(current));
    current.setMonth(current.getMonth() + 1);
   }
  }

  return timeline;
 };

 const timeline = generateTimeline();

 const calculateBarPosition = (task: Task) => {
  const taskStart = new Date(task.startDate);
  const taskEnd = new Date(task.endDate);
  const totalDays = Math.ceil((projectEnd.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24));
  const startOffset = Math.ceil((taskStart.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24));
  const duration = Math.ceil((taskEnd.getTime() - taskStart.getTime()) / (1000 * 60 * 60 * 24));

  return {
   left: `${(startOffset / totalDays) * 100}%`,
   width: `${(duration / totalDays) * 100}%`,
  };
 };

 const formatDate = (date: Date, mode: 'days' | 'weeks' | 'months') => {
  if (mode === 'days') {
   return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  } else if (mode === 'weeks') {
   return `Week ${Math.ceil((date.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24 * 7)) + 1}`;
  } else {
   return date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
  }
 };

 const getStatusColor = (status: string) => {
  switch (status) {
   case 'Completed': return 'bg-green-500';
   case 'In Progress': return 'bg-blue-500';
   case 'Delayed': return 'bg-red-500';
   case 'Not Started': return 'bg-gray-400';
   default: return 'bg-gray-400';
  }
 };

 const phases = Array.from(new Set(tasks.map(t => t.phase)));
 const filteredTasks = filterPhase === 'All' ? tasks : tasks.filter(t => t.phase === filterPhase);

 // Calculate today's position
 const today = new Date();
 const todayOffset = Math.ceil((today.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24));
 const totalDays = Math.ceil((projectEnd.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24));
 const todayPosition = `${(todayOffset / totalDays) * 100}%`;

 // Modal handlers
 const handleAddMilestone = (milestone: any) => {
  runAction(
   () =>
    projectManagementService.createScheduleTask({
     name: String(milestone?.name ?? milestone?.title ?? 'New Milestone'),
     startDate: String(milestone?.startDate ?? milestone?.date ?? ''),
     endDate: String(milestone?.endDate ?? milestone?.date ?? ''),
     progress: Number(milestone?.progress ?? 0),
     assignee: String(milestone?.assignee ?? ''),
     dependencies: Array.isArray(milestone?.dependencies) ? milestone.dependencies : [],
     phase: String(milestone?.phase ?? 'Milestone'),
     status: String(milestone?.status ?? 'Not Started'),
    }).then(() => undefined),
   'Milestone added',
   () => setShowAddMilestone(false)
  );
 };

 const handleEditDependencies = (dependencies: any) => {
  if (!selectedTask) { setShowEditDependencies(false); return; }
  const deps = Array.isArray(dependencies)
   ? dependencies
   : Array.isArray(dependencies?.dependencies)
    ? dependencies.dependencies
    : selectedTask.dependencies;
  runAction(
   () => projectManagementService.updateScheduleTask(selectedTask.id, { dependencies: deps }).then(() => undefined),
   'Dependencies updated',
   () => { setShowEditDependencies(false); setSelectedTask(null); }
  );
 };

 const handleApplyFilters = (filters: any) => {
  // Filtering is client-side over already-fetched tasks.
  if (filters?.phase) setFilterPhase(String(filters.phase));
  setShowTimelineFilter(false);
 };

 const handleExport = (options: any) => {
  exportToCsv('schedule', filteredTasks as unknown as Record<string, unknown>[]);
  setShowExportGantt(false);
 };

 const handleAddTaskLink = (link: any) => {
  // A task link is a dependency between two schedule tasks.
  const fromId = String(link?.from ?? link?.fromTask ?? selectedTask?.id ?? '');
  const toId = String(link?.to ?? link?.toTask ?? '');
  const target = tasks.find((t) => t.id === toId);
  if (!target || !fromId) { setShowAddTaskLink(false); return; }
  runAction(
   () =>
    projectManagementService.updateScheduleTask(target.id, {
     dependencies: Array.from(new Set([...(target.dependencies ?? []), fromId])),
    }).then(() => undefined),
   'Task link added',
   () => setShowAddTaskLink(false)
  );
 };

 const handleEditDuration = (duration: any) => {
  if (!selectedTask) { setShowEditDuration(false); return; }
  runAction(
   () =>
    projectManagementService.updateScheduleTask(selectedTask.id, {
     startDate: duration?.startDate ? String(duration.startDate) : selectedTask.startDate,
     endDate: duration?.endDate ? String(duration.endDate) : selectedTask.endDate,
    }).then(() => undefined),
   'Duration updated',
   () => { setShowEditDuration(false); setSelectedTask(null); }
  );
 };

 const handleReschedule = (options: any) => {
  const target = selectedTask ?? tasks[0];
  if (!target) { setShowReschedule(false); return; }
  runAction(
   () =>
    projectManagementService.updateScheduleTask(target.id, {
     startDate: options?.startDate ? String(options.startDate) : target.startDate,
     endDate: options?.endDate ? String(options.endDate) : target.endDate,
    }).then(() => undefined),
   'Task rescheduled',
   () => { setShowReschedule(false); setSelectedTask(null); }
  );
 };

 const handlePrint = (options: any) => {
  printCurrentView();
  setShowPrintSetup(false);
 };

 const handleApplyTemplate = (template: any) => {
  // Applying a schedule template creates its tasks against the current schedule.
  const tmplTasks: any[] = Array.isArray(template?.tasks) ? template.tasks : [];
  if (tmplTasks.length === 0) { setShowTemplates(false); return; }
  runAction(
   async () => {
    for (const t of tmplTasks) {
     await projectManagementService.createScheduleTask({
      name: String(t?.name ?? 'Task'),
      startDate: String(t?.startDate ?? ''),
      endDate: String(t?.endDate ?? ''),
      progress: Number(t?.progress ?? 0),
      assignee: String(t?.assignee ?? ''),
      dependencies: Array.isArray(t?.dependencies) ? t.dependencies : [],
      phase: String(t?.phase ?? template?.name ?? 'Template'),
      status: String(t?.status ?? 'Not Started'),
     });
    }
   },
   'Template applied',
   () => setShowTemplates(false)
  );
 };

 const openEditDependencies = (task: Task) => {
  setSelectedTask(task);
  setShowEditDependencies(true);
 };

 const openEditDuration = (task: Task) => {
  setSelectedTask(task);
  setShowEditDuration(true);
 };

 return (
  <div className="w-full h-screen overflow-y-auto overflow-x-hidden">
   <div className="px-3 py-2 space-y-3">
    {loading && (
     <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">Loading schedule…</div>
    )}
    {loadError && !loading && (
     <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{loadError}</div>
    )}
    {!loading && !loadError && tasks.length === 0 && (
     <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-600">No scheduled tasks yet.</div>
    )}
    {actionError && (
     <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{actionError}</div>
    )}
    {actionSuccess && (
     <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700">{actionSuccess}</div>
    )}
    {/* Header Actions */}
    <div className="flex justify-between items-center mb-2">
     <div className="flex items-center gap-3">
      <button
       onClick={() => setShowAddMilestone(true)}
       disabled={submitting}
       className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
      >
       <Plus className="w-5 h-5" />
       {submitting ? 'Saving…' : 'Add Milestone'}
      </button>
      <button
       onClick={() => setShowTimelineFilter(true)}
       className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
       <Filter className="w-5 h-5" />
       Filter
      </button>
      <button
       onClick={() => setShowResourceLoading(true)}
       className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
       <TrendingUp className="w-5 h-5" />
       Resource Loading
      </button>
      <button
       onClick={() => setShowBaselineComparison(true)}
       className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
       <Layers className="w-5 h-5" />
       Baseline
      </button>
     </div>
     <div className="flex items-center gap-3">
      <button
       onClick={() => setShowCriticalPath(true)}
       className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
       <Target className="w-5 h-5" />
       Critical Path
      </button>
      <button
       onClick={() => setShowPrintSetup(true)}
       className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
       <Printer className="w-5 h-5" />
       Print
      </button>
      <button
       onClick={() => setShowExportGantt(true)}
       className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
       <Download className="w-5 h-5" />
       Export
      </button>
     </div>
    </div>

    {/* Controls */}
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
    <div className="flex items-center justify-between">
     <div className="flex items-center gap-2">
      {/* View Mode Toggle */}
      <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
       <button
        onClick={() => setViewMode('days')}
        className={`px-3 py-1 text-sm rounded-md transition-colors ${
         viewMode === 'days' ? 'bg-white text-blue-600 font-medium shadow-sm' : 'text-gray-600 hover:text-gray-900'
        }`}
       >
        Days
       </button>
       <button
        onClick={() => setViewMode('weeks')}
        className={`px-3 py-1 text-sm rounded-md transition-colors ${
         viewMode === 'weeks' ? 'bg-white text-blue-600 font-medium shadow-sm' : 'text-gray-600 hover:text-gray-900'
        }`}
       >
        Weeks
       </button>
       <button
        onClick={() => setViewMode('months')}
        className={`px-3 py-1 text-sm rounded-md transition-colors ${
         viewMode === 'months' ? 'bg-white text-blue-600 font-medium shadow-sm' : 'text-gray-600 hover:text-gray-900'
        }`}
       >
        Months
       </button>
      </div>

      {/* Phase Filter */}
      <select
       value={filterPhase}
       onChange={(e) => setFilterPhase(e.target.value)}
       className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
      >
       <option value="All">All Phases</option>
       {phases.map(phase => (
        <option key={phase} value={phase}>{phase}</option>
       ))}
      </select>
     </div>

     <div className="flex items-center gap-2">
      <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
       <ZoomOut className="w-4 h-4 text-gray-600" />
       <span className="text-gray-700">Zoom Out</span>
      </button>
      <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
       <ZoomIn className="w-4 h-4 text-gray-600" />
       <span className="text-gray-700">Zoom In</span>
      </button>
     </div>
    </div>
   </div>

   {/* Gantt Chart */}
   <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
    <div className="overflow-x-auto">
     <div className="min-w-[1200px]">
      {/* Timeline Header */}
      <div className="flex border-b border-gray-200 bg-gray-50">
       {/* Task Name Column */}
       <div className="w-80 p-3 border-r border-gray-200 flex-shrink-0">
        <p className="text-xs font-medium text-gray-600 uppercase tracking-wider">Task Name</p>
       </div>

       {/* Timeline Grid */}
       <div className="flex-1 relative">
        <div className="flex">
         {timeline.map((date, index) => (
          <div
           key={index}
           className="flex-1 p-2 text-center border-r border-gray-200 min-w-[60px]"
          >
           <p className="text-xs font-medium text-gray-600">
            {formatDate(date, viewMode)}
           </p>
          </div>
         ))}
        </div>
       </div>
      </div>

      {/* Task Rows */}
      <div className="relative">
       {filteredTasks.map((task, index) => (
        <div key={task.id} className="flex border-b border-gray-200 hover:bg-gray-50 transition-colors">
         {/* Task Info Column */}
         <div className="w-80 p-3 border-r border-gray-200 flex-shrink-0">
          <div>
           <p className="text-sm font-medium text-gray-900">{task.name}</p>
           <div className="flex items-center gap-2 mt-1">
            <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
             task.status === 'Completed' ? 'bg-green-100 text-green-700' :
             task.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
             task.status === 'Delayed' ? 'bg-red-100 text-red-700' :
             'bg-gray-100 text-gray-700'
            }`}>
             {task.progress}%
            </span>
            <span className="text-xs text-gray-500">{task.assignee}</span>
           </div>
          </div>
         </div>

         {/* Gantt Bar */}
         <div className="flex-1 relative p-2">
          {/* Background Grid */}
          <div className="absolute inset-0 flex">
           {timeline.map((_, idx) => (
            <div key={idx} className="flex-1 border-r border-gray-100 min-w-[60px]"></div>
           ))}
          </div>

          {/* Today Line */}
          {index === 0 && (
           <div
            className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
            style={{ left: todayPosition }}
           >
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
             <div className="bg-red-500 text-white text-xs px-2 py-0.5 rounded whitespace-nowrap">
              Today
             </div>
            </div>
           </div>
          )}

          {/* Task Bar */}
          <div className="relative h-8">
           <div
            className={`absolute h-8 rounded-lg ${getStatusColor(task.status)} transition-all shadow-sm`}
            style={calculateBarPosition(task)}
           >
            {/* Progress Indicator */}
            <div
             className="h-full bg-white bg-opacity-30 rounded-l-lg"
             style={{ width: `${task.progress}%` }}
            ></div>

            {/* Task Label */}
            <div className="absolute inset-0 flex items-center px-2">
             <span className="text-xs font-medium text-white truncate">
              {task.progress}%
             </span>
            </div>
           </div>

           {/* Dependencies */}
           {task.dependencies.length > 0 && (
            <div className="absolute -left-2 top-1/2 transform -translate-y-1/2">
             <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            </div>
           )}
          </div>
         </div>
        </div>
       ))}
      </div>
     </div>
    </div>

    {/* Legend */}
    <div className="bg-gray-50 p-3 border-t border-gray-200">
     <div className="flex items-center gap-3 text-sm">
      <div className="flex items-center gap-2">
       <div className="w-4 h-4 bg-green-500 rounded"></div>
       <span className="text-gray-700">Completed</span>
      </div>
      <div className="flex items-center gap-2">
       <div className="w-4 h-4 bg-blue-500 rounded"></div>
       <span className="text-gray-700">In Progress</span>
      </div>
      <div className="flex items-center gap-2">
       <div className="w-4 h-4 bg-red-500 rounded"></div>
       <span className="text-gray-700">Delayed</span>
      </div>
      <div className="flex items-center gap-2">
       <div className="w-4 h-4 bg-gray-400 rounded"></div>
       <span className="text-gray-700">Not Started</span>
      </div>
      <div className="flex items-center gap-2 ml-auto">
       <div className="w-0.5 h-4 bg-red-500"></div>
       <span className="text-gray-700">Today</span>
      </div>
     </div>
    </div>
   </div>

   {/* Summary Stats */}
   <div className="grid grid-cols-4 gap-2">
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
     <p className="text-sm text-gray-600">Total Tasks</p>
     <p className="text-2xl font-bold text-gray-900 mt-1">{tasks.length}</p>
    </div>
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
     <p className="text-sm text-gray-600">Completed</p>
     <p className="text-2xl font-bold text-green-900 mt-1">
      {tasks.filter(t => t.status === 'Completed').length}
     </p>
    </div>
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
     <p className="text-sm text-gray-600">In Progress</p>
     <p className="text-2xl font-bold text-blue-900 mt-1">
      {tasks.filter(t => t.status === 'In Progress').length}
     </p>
    </div>
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
     <p className="text-sm text-gray-600">Overall Progress</p>
     <p className="text-2xl font-bold text-purple-900 mt-1">
      {Math.round(tasks.reduce((sum, t) => sum + t.progress, 0) / tasks.length)}%
     </p>
    </div>
   </div>

   {/* Modals */}
   <AddMilestoneModal
    isOpen={showAddMilestone}
    onClose={() => setShowAddMilestone(false)}
    onAdd={handleAddMilestone}
   />

   {selectedTask && (
    <>
     <EditDependenciesModal
      isOpen={showEditDependencies}
      onClose={() => setShowEditDependencies(false)}
      task={selectedTask}
      onUpdate={handleEditDependencies}
     />

     <EditDurationModal
      isOpen={showEditDuration}
      onClose={() => setShowEditDuration(false)}
      task={selectedTask}
      onUpdate={handleEditDuration}
     />
    </>
   )}

   <ResourceLoadingModal
    isOpen={showResourceLoading}
    onClose={() => setShowResourceLoading(false)}
   />

   <TimelineFilterModal
    isOpen={showTimelineFilter}
    onClose={() => setShowTimelineFilter(false)}
    onApply={handleApplyFilters}
   />

   <ExportGanttModal
    isOpen={showExportGantt}
    onClose={() => setShowExportGantt(false)}
    onExport={handleExport}
   />

   <BaselineComparisonModal
    isOpen={showBaselineComparison}
    onClose={() => setShowBaselineComparison(false)}
   />

   <CriticalPathModal
    isOpen={showCriticalPath}
    onClose={() => setShowCriticalPath(false)}
   />

   <AddTaskLinkModal
    isOpen={showAddTaskLink}
    onClose={() => setShowAddTaskLink(false)}
    onAdd={handleAddTaskLink}
   />

   <RescheduleModal
    isOpen={showReschedule}
    onClose={() => setShowReschedule(false)}
    onReschedule={handleReschedule}
   />

   <PrintSetupModal
    isOpen={showPrintSetup}
    onClose={() => setShowPrintSetup(false)}
    onPrint={handlePrint}
   />

   <TimelineTemplatesModal
    isOpen={showTemplates}
    onClose={() => setShowTemplates(false)}
    onApply={handleApplyTemplate}
   />
   </div>
  </div>
 );
}
