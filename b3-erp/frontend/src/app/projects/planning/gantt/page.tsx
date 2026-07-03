'use client';

import { useMemo, useState } from 'react';
import { BarChart3, Search, Filter, Download, ZoomIn, Calendar, AlertTriangle, Link2, Clock } from 'lucide-react';
import { exportToCsv } from '@/lib/export';

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

const GANTT_TASKS: GanttTask[] = [
  {
    id: '1',
    taskCode: 'TSK-101',
    taskName: 'Design Approval',
    projectCode: 'KF-A',
    projectName: 'Kitchen Fitout - Tower A',
    phase: 'Planning',
    startDate: '2025-10-15',
    endDate: '2025-10-18',
    duration: 3,
    progress: 100,
    status: 'completed',
    priority: 'critical',
    assignee: 'Priya Patel',
    dependencies: [],
    isMilestone: true
  },
  {
    id: '2',
    taskCode: 'TSK-102',
    taskName: 'Material Procurement',
    projectCode: 'KF-A',
    projectName: 'Kitchen Fitout - Tower A',
    phase: 'Procurement',
    startDate: '2025-10-19',
    endDate: '2025-10-25',
    duration: 6,
    progress: 80,
    status: 'in-progress',
    priority: 'high',
    assignee: 'Neha Gupta',
    dependencies: ['TSK-101'],
    isMilestone: false
  },
  {
    id: '3',
    taskCode: 'TSK-103',
    taskName: 'Cabinet Manufacturing',
    projectCode: 'KF-A',
    projectName: 'Kitchen Fitout - Tower A',
    phase: 'Production',
    startDate: '2025-10-26',
    endDate: '2025-11-05',
    duration: 10,
    progress: 40,
    status: 'in-progress',
    priority: 'high',
    assignee: 'Vikram Reddy',
    dependencies: ['TSK-102'],
    isMilestone: false
  },
  {
    id: '4',
    taskCode: 'TSK-104',
    taskName: 'Site Preparation',
    projectCode: 'KF-A',
    projectName: 'Kitchen Fitout - Tower A',
    phase: 'Installation',
    startDate: '2025-10-28',
    endDate: '2025-11-01',
    duration: 4,
    progress: 25,
    status: 'in-progress',
    priority: 'medium',
    assignee: 'Arjun Nair',
    dependencies: ['TSK-102'],
    isMilestone: false
  },
  {
    id: '5',
    taskCode: 'TSK-105',
    taskName: 'Cabinet Installation',
    projectCode: 'KF-A',
    projectName: 'Kitchen Fitout - Tower A',
    phase: 'Installation',
    startDate: '2025-11-06',
    endDate: '2025-11-12',
    duration: 6,
    progress: 0,
    status: 'not-started',
    priority: 'high',
    assignee: 'Sara Ali',
    dependencies: ['TSK-103', 'TSK-104'],
    isMilestone: false
  },
  {
    id: '6',
    taskCode: 'TSK-201',
    taskName: 'Design Finalization',
    projectCode: 'LVW-09',
    projectName: 'Luxury Villa Wardrobes',
    phase: 'Planning',
    startDate: '2025-10-20',
    endDate: '2025-10-24',
    duration: 4,
    progress: 90,
    status: 'in-progress',
    priority: 'high',
    assignee: 'Priya Patel',
    dependencies: [],
    isMilestone: false
  },
  {
    id: '7',
    taskCode: 'TSK-202',
    taskName: 'Hardware Selection',
    projectCode: 'LVW-09',
    projectName: 'Luxury Villa Wardrobes',
    phase: 'Procurement',
    startDate: '2025-10-25',
    endDate: '2025-10-28',
    duration: 3,
    progress: 60,
    status: 'in-progress',
    priority: 'medium',
    assignee: 'Neha Gupta',
    dependencies: ['TSK-201'],
    isMilestone: false
  },
  {
    id: '8',
    taskCode: 'TSK-203',
    taskName: 'Wardrobe Assembly',
    projectCode: 'LVW-09',
    projectName: 'Luxury Villa Wardrobes',
    phase: 'Production',
    startDate: '2025-10-29',
    endDate: '2025-11-08',
    duration: 10,
    progress: 20,
    status: 'in-progress',
    priority: 'high',
    assignee: 'Vikram Reddy',
    dependencies: ['TSK-202'],
    isMilestone: false
  },
  {
    id: '9',
    taskCode: 'TSK-301',
    taskName: 'Site Survey',
    projectCode: 'CPR-12',
    projectName: 'Corporate Pantry Rollout',
    phase: 'Planning',
    startDate: '2025-10-16',
    endDate: '2025-10-18',
    duration: 2,
    progress: 100,
    status: 'completed',
    priority: 'high',
    assignee: 'Arjun Nair',
    dependencies: [],
    isMilestone: true
  },
  {
    id: '10',
    taskCode: 'TSK-302',
    taskName: 'Counter Fabrication',
    projectCode: 'CPR-12',
    projectName: 'Corporate Pantry Rollout',
    phase: 'Production',
    startDate: '2025-10-21',
    endDate: '2025-10-30',
    duration: 9,
    progress: 70,
    status: 'in-progress',
    priority: 'high',
    assignee: 'Deepak Singh',
    dependencies: ['TSK-301'],
    isMilestone: false
  },
  {
    id: '11',
    taskCode: 'TSK-303',
    taskName: 'Electrical Installation',
    projectCode: 'CPR-12',
    projectName: 'Corporate Pantry Rollout',
    phase: 'Installation',
    startDate: '2025-10-31',
    endDate: '2025-11-05',
    duration: 5,
    progress: 0,
    status: 'not-started',
    priority: 'medium',
    assignee: 'Karthik Iyer',
    dependencies: ['TSK-302'],
    isMilestone: false
  },
  {
    id: '12',
    taskCode: 'TSK-401',
    taskName: 'Initial Assessment',
    projectCode: 'SR-08',
    projectName: 'Showroom Refurbishment',
    phase: 'Planning',
    startDate: '2025-10-22',
    endDate: '2025-10-25',
    duration: 3,
    progress: 100,
    status: 'completed',
    priority: 'medium',
    assignee: 'Amit Singh',
    dependencies: [],
    isMilestone: false
  },
  {
    id: '13',
    taskCode: 'TSK-402',
    taskName: 'Display Unit Design',
    projectCode: 'SR-08',
    projectName: 'Showroom Refurbishment',
    phase: 'Planning',
    startDate: '2025-10-26',
    endDate: '2025-10-31',
    duration: 5,
    progress: 50,
    status: 'in-progress',
    priority: 'high',
    assignee: 'Priya Patel',
    dependencies: ['TSK-401'],
    isMilestone: false
  },
  {
    id: '14',
    taskCode: 'TSK-403',
    taskName: 'Material Order',
    projectCode: 'SR-08',
    projectName: 'Showroom Refurbishment',
    phase: 'Procurement',
    startDate: '2025-11-01',
    endDate: '2025-11-06',
    duration: 5,
    progress: 0,
    status: 'not-started',
    priority: 'high',
    assignee: 'Neha Gupta',
    dependencies: ['TSK-402'],
    isMilestone: false
  },
  {
    id: '15',
    taskCode: 'TSK-404',
    taskName: 'Showroom Completion',
    projectCode: 'SR-08',
    projectName: 'Showroom Refurbishment',
    phase: 'Installation',
    startDate: '2025-11-15',
    endDate: '2025-11-15',
    duration: 1,
    progress: 0,
    status: 'not-started',
    priority: 'critical',
    assignee: 'Amit Singh',
    dependencies: ['TSK-403'],
    isMilestone: true
  }
];

export default function GanttChartPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'not-started' | 'in-progress' | 'completed' | 'delayed' | 'on-hold'>('all');
  const [phaseFilter, setPhaseFilter] = useState<string>('all');

  const projects = useMemo(() => ['all', ...Array.from(new Set(GANTT_TASKS.map(t => t.projectCode)))], []);
  const phases = useMemo(() => ['all', ...Array.from(new Set(GANTT_TASKS.map(t => t.phase)))], []);

  const filtered = useMemo(() => {
    return GANTT_TASKS.filter(t => {
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
  }, [searchTerm, projectFilter, statusFilter, phaseFilter]);

  // Calculate date range for Gantt view (showing ~30 days)
  const minDate = useMemo(() => {
    const dates = GANTT_TASKS.map(t => new Date(t.startDate));
    return new Date(Math.min(...dates.map(d => d.getTime())));
  }, []);

  const maxDate = useMemo(() => {
    const dates = GANTT_TASKS.map(t => new Date(t.endDate));
    return new Date(Math.max(...dates.map(d => d.getTime())));
  }, []);

  // Generate date columns (showing dates in the range)
  const dateColumns = useMemo(() => {
    const cols: Date[] = [];
    const current = new Date(minDate);
    while (current <= maxDate) {
      cols.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
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

  // Calculate stats
  const totalTasks = GANTT_TASKS.length;
  const completedTasks = GANTT_TASKS.filter(t => t.status === 'completed').length;
  const inProgressTasks = GANTT_TASKS.filter(t => t.status === 'in-progress').length;
  const milestones = GANTT_TASKS.filter(t => t.isMilestone).length;

  return (
    <div className="p-6">
      <div className="mb-3">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <BarChart3 className="h-8 w-8 text-teal-600" />
          Gantt Chart
        </h1>
        <p className="text-gray-600 mt-2">Visual timeline with task dependencies and progress</p>
      </div>

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
                    No tasks found
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
