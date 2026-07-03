'use client';

import { useEffect, useState, useMemo } from 'react';
import { Calendar, Search, Filter, Download, Clock, AlertTriangle, CheckCircle, Circle, AlertCircle } from 'lucide-react';
import { exportToCsv } from '@/lib/export';
import { projectManagementService } from '@/services/ProjectManagementService';

interface ScheduleActivity {
  id: string;
  activityCode: string;
  activityName: string;
  projectCode: string;
  projectName: string;
  phase: string;
  wbsCode: string;
  duration: number; // in days
  startDate: string;
  endDate: string;
  actualStart?: string;
  actualEnd?: string;
  progressPercent: number;
  status: 'not-started' | 'in-progress' | 'completed' | 'delayed' | 'on-hold';
  isCriticalPath: boolean;
  totalFloat: number; // in days
  predecessors: string[];
  successors: string[];
  responsiblePerson: string;
  plannedHours: number;
  actualHours: number;
  resourcesRequired: string[];
}

const mockScheduleData: ScheduleActivity[] = [
  {
    id: '1',
    activityCode: 'ACT-1001',
    activityName: 'Design Finalization',
    projectCode: 'PRJ-2025-001',
    projectName: 'Kitchen Fitout - Tower A',
    phase: 'Planning',
    wbsCode: 'WBS-1.1',
    duration: 5,
    startDate: '2025-10-01',
    endDate: '2025-10-05',
    actualStart: '2025-10-01',
    actualEnd: '2025-10-06',
    progressPercent: 100,
    status: 'completed',
    isCriticalPath: true,
    totalFloat: 0,
    predecessors: [],
    successors: ['ACT-1002'],
    responsiblePerson: 'Priya Patel',
    plannedHours: 40,
    actualHours: 48,
    resourcesRequired: ['Designer', 'CAD Operator']
  },
  {
    id: '2',
    activityCode: 'ACT-1002',
    activityName: 'Material Procurement',
    projectCode: 'PRJ-2025-001',
    projectName: 'Kitchen Fitout - Tower A',
    phase: 'Procurement',
    wbsCode: 'WBS-1.2',
    duration: 10,
    startDate: '2025-10-06',
    endDate: '2025-10-15',
    actualStart: '2025-10-07',
    progressPercent: 100,
    status: 'completed',
    isCriticalPath: true,
    totalFloat: 0,
    predecessors: ['ACT-1001'],
    successors: ['ACT-1003'],
    responsiblePerson: 'Procurement Team',
    plannedHours: 60,
    actualHours: 65,
    resourcesRequired: ['Procurement Officer', 'QC Inspector']
  },
  {
    id: '3',
    activityCode: 'ACT-1003',
    activityName: 'Cabinet Fabrication',
    projectCode: 'PRJ-2025-001',
    projectName: 'Kitchen Fitout - Tower A',
    phase: 'Manufacturing',
    wbsCode: 'WBS-1.3',
    duration: 15,
    startDate: '2025-10-16',
    endDate: '2025-10-30',
    actualStart: '2025-10-16',
    progressPercent: 70,
    status: 'in-progress',
    isCriticalPath: true,
    totalFloat: 0,
    predecessors: ['ACT-1002'],
    successors: ['ACT-1004'],
    responsiblePerson: 'Production Manager',
    plannedHours: 240,
    actualHours: 168,
    resourcesRequired: ['Carpenter', 'Machine Operator', 'Helper']
  },
  {
    id: '4',
    activityCode: 'ACT-1004',
    activityName: 'Site Installation',
    projectCode: 'PRJ-2025-001',
    projectName: 'Kitchen Fitout - Tower A',
    phase: 'Installation',
    wbsCode: 'WBS-1.4',
    duration: 8,
    startDate: '2025-10-31',
    endDate: '2025-11-07',
    progressPercent: 0,
    status: 'not-started',
    isCriticalPath: true,
    totalFloat: 0,
    predecessors: ['ACT-1003'],
    successors: ['ACT-1005'],
    responsiblePerson: 'Installation Team',
    plannedHours: 128,
    actualHours: 0,
    resourcesRequired: ['Installer', 'Electrician', 'Helper']
  },
  {
    id: '5',
    activityCode: 'ACT-1005',
    activityName: 'Final Inspection & Handover',
    projectCode: 'PRJ-2025-001',
    projectName: 'Kitchen Fitout - Tower A',
    phase: 'Closeout',
    wbsCode: 'WBS-1.5',
    duration: 2,
    startDate: '2025-11-08',
    endDate: '2025-11-09',
    progressPercent: 0,
    status: 'not-started',
    isCriticalPath: true,
    totalFloat: 0,
    predecessors: ['ACT-1004'],
    successors: [],
    responsiblePerson: 'Project Manager',
    plannedHours: 16,
    actualHours: 0,
    resourcesRequired: ['PM', 'QC Team']
  },
  {
    id: '6',
    activityCode: 'ACT-2001',
    activityName: 'Wardrobe Design Approval',
    projectCode: 'PRJ-2025-002',
    projectName: 'Luxury Villa Wardrobes',
    phase: 'Planning',
    wbsCode: 'WBS-2.1',
    duration: 7,
    startDate: '2025-10-05',
    endDate: '2025-10-11',
    actualStart: '2025-10-05',
    actualEnd: '2025-10-12',
    progressPercent: 100,
    status: 'completed',
    isCriticalPath: false,
    totalFloat: 2,
    predecessors: [],
    successors: ['ACT-2002'],
    responsiblePerson: 'Design Lead',
    plannedHours: 56,
    actualHours: 60,
    resourcesRequired: ['Designer', '3D Visualizer']
  },
  {
    id: '7',
    activityCode: 'ACT-2002',
    activityName: 'Hardware Ordering',
    projectCode: 'PRJ-2025-002',
    projectName: 'Luxury Villa Wardrobes',
    phase: 'Procurement',
    wbsCode: 'WBS-2.2',
    duration: 12,
    startDate: '2025-10-12',
    endDate: '2025-10-23',
    actualStart: '2025-10-13',
    progressPercent: 85,
    status: 'in-progress',
    isCriticalPath: false,
    totalFloat: 2,
    predecessors: ['ACT-2001'],
    successors: ['ACT-2003'],
    responsiblePerson: 'Supply Chain',
    plannedHours: 48,
    actualHours: 42,
    resourcesRequired: ['Procurement Officer']
  },
  {
    id: '8',
    activityCode: 'ACT-2003',
    activityName: 'Wardrobe Assembly',
    projectCode: 'PRJ-2025-002',
    projectName: 'Luxury Villa Wardrobes',
    phase: 'Manufacturing',
    wbsCode: 'WBS-2.3',
    duration: 18,
    startDate: '2025-10-24',
    endDate: '2025-11-10',
    progressPercent: 0,
    status: 'not-started',
    isCriticalPath: false,
    totalFloat: 2,
    predecessors: ['ACT-2002'],
    successors: [],
    responsiblePerson: 'Workshop Supervisor',
    plannedHours: 288,
    actualHours: 0,
    resourcesRequired: ['Carpenter', 'Finisher', 'Helper']
  },
  {
    id: '9',
    activityCode: 'ACT-3001',
    activityName: 'Site Survey',
    projectCode: 'PRJ-2025-003',
    projectName: 'Corporate Pantry Rollout',
    phase: 'Planning',
    wbsCode: 'WBS-3.1',
    duration: 3,
    startDate: '2025-10-10',
    endDate: '2025-10-12',
    actualStart: '2025-10-10',
    actualEnd: '2025-10-12',
    progressPercent: 100,
    status: 'completed',
    isCriticalPath: true,
    totalFloat: 0,
    predecessors: [],
    successors: ['ACT-3002'],
    responsiblePerson: 'Site Engineer',
    plannedHours: 24,
    actualHours: 24,
    resourcesRequired: ['Engineer', 'Surveyor']
  },
  {
    id: '10',
    activityCode: 'ACT-3002',
    activityName: 'Pantry Modules Fabrication',
    projectCode: 'PRJ-2025-003',
    projectName: 'Corporate Pantry Rollout',
    phase: 'Manufacturing',
    wbsCode: 'WBS-3.2',
    duration: 12,
    startDate: '2025-10-13',
    endDate: '2025-10-24',
    actualStart: '2025-10-13',
    progressPercent: 90,
    status: 'in-progress',
    isCriticalPath: true,
    totalFloat: 0,
    predecessors: ['ACT-3001'],
    successors: ['ACT-3003'],
    responsiblePerson: 'Production Head',
    plannedHours: 192,
    actualHours: 180,
    resourcesRequired: ['Carpenter', 'Painter', 'Helper']
  },
  {
    id: '11',
    activityCode: 'ACT-3003',
    activityName: 'Installation & Commissioning',
    projectCode: 'PRJ-2025-003',
    projectName: 'Corporate Pantry Rollout',
    phase: 'Installation',
    wbsCode: 'WBS-3.3',
    duration: 5,
    startDate: '2025-10-25',
    endDate: '2025-10-29',
    progressPercent: 0,
    status: 'not-started',
    isCriticalPath: true,
    totalFloat: 0,
    predecessors: ['ACT-3002'],
    successors: [],
    responsiblePerson: 'Installation Manager',
    plannedHours: 80,
    actualHours: 0,
    resourcesRequired: ['Installer', 'Electrician', 'Plumber']
  },
  {
    id: '12',
    activityCode: 'ACT-4001',
    activityName: 'Demolition of Existing',
    projectCode: 'PRJ-2025-004',
    projectName: 'Showroom Refurbishment',
    phase: 'Pre-Construction',
    wbsCode: 'WBS-4.1',
    duration: 4,
    startDate: '2025-10-15',
    endDate: '2025-10-18',
    actualStart: '2025-10-15',
    actualEnd: '2025-10-19',
    progressPercent: 100,
    status: 'completed',
    isCriticalPath: true,
    totalFloat: 0,
    predecessors: [],
    successors: ['ACT-4002'],
    responsiblePerson: 'Demolition Contractor',
    plannedHours: 64,
    actualHours: 72,
    resourcesRequired: ['Demolition Crew', 'Safety Officer']
  },
  {
    id: '13',
    activityCode: 'ACT-4002',
    activityName: 'False Ceiling & Partitions',
    projectCode: 'PRJ-2025-004',
    projectName: 'Showroom Refurbishment',
    phase: 'Construction',
    wbsCode: 'WBS-4.2',
    duration: 8,
    startDate: '2025-10-20',
    endDate: '2025-10-27',
    actualStart: '2025-10-20',
    progressPercent: 60,
    status: 'in-progress',
    isCriticalPath: true,
    totalFloat: 0,
    predecessors: ['ACT-4001'],
    successors: ['ACT-4003'],
    responsiblePerson: 'Civil Contractor',
    plannedHours: 128,
    actualHours: 80,
    resourcesRequired: ['Mason', 'Carpenter', 'Helper']
  },
  {
    id: '14',
    activityCode: 'ACT-4003',
    activityName: 'Display Units Installation',
    projectCode: 'PRJ-2025-004',
    projectName: 'Showroom Refurbishment',
    phase: 'Installation',
    wbsCode: 'WBS-4.3',
    duration: 10,
    startDate: '2025-10-28',
    endDate: '2025-11-06',
    progressPercent: 0,
    status: 'not-started',
    isCriticalPath: true,
    totalFloat: 0,
    predecessors: ['ACT-4002'],
    successors: ['ACT-4004'],
    responsiblePerson: 'Installation Team',
    plannedHours: 160,
    actualHours: 0,
    resourcesRequired: ['Installer', 'Electrician', 'Helper']
  },
  {
    id: '15',
    activityCode: 'ACT-4004',
    activityName: 'Lighting & Finishing',
    projectCode: 'PRJ-2025-004',
    projectName: 'Showroom Refurbishment',
    phase: 'Finishing',
    wbsCode: 'WBS-4.4',
    duration: 5,
    startDate: '2025-11-07',
    endDate: '2025-11-11',
    progressPercent: 0,
    status: 'not-started',
    isCriticalPath: true,
    totalFloat: 0,
    predecessors: ['ACT-4003'],
    successors: [],
    responsiblePerson: 'MEP Contractor',
    plannedHours: 80,
    actualHours: 0,
    resourcesRequired: ['Electrician', 'Painter', 'Helper']
  }
];

const VALID_SCHEDULE_STATUSES: ScheduleActivity['status'][] = ['not-started', 'in-progress', 'completed', 'delayed', 'on-hold'];

function normalizeScheduleStatus(raw: unknown): ScheduleActivity['status'] {
  const s = String(raw ?? '').toLowerCase().replace(/\s+/g, '-');
  return (VALID_SCHEDULE_STATUSES as string[]).includes(s) ? (s as ScheduleActivity['status']) : 'not-started';
}

export default function ProjectSchedulePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [projectFilter, setProjectFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [phaseFilter, setPhaseFilter] = useState('all');
  const [criticalPathFilter, setCriticalPathFilter] = useState('all');
  const [rows, setRows] = useState<ScheduleActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await projectManagementService.listSchedule();
        const list = Array.isArray(data) ? data : [];
        const mapped: ScheduleActivity[] = list.map((r: any) => ({
          id: String(r.id ?? ''),
          activityCode: r.activityCode ?? r.code ?? '',
          activityName: r.name ?? '',
          projectCode: r.projectCode ?? '',
          projectName: r.projectName ?? '',
          phase: r.phase ?? '',
          wbsCode: r.wbsCode ?? '',
          duration: Number(r.duration ?? 0),
          startDate: r.startDate ?? '',
          endDate: r.endDate ?? '',
          actualStart: r.actualStart ?? undefined,
          actualEnd: r.actualEnd ?? undefined,
          progressPercent: Number(r.progress ?? 0),
          status: normalizeScheduleStatus(r.status),
          isCriticalPath: Boolean(r.isCriticalPath ?? false),
          totalFloat: Number(r.totalFloat ?? 0),
          predecessors: Array.isArray(r.dependencies) ? r.dependencies.map((d: any) => String(d)) : [],
          successors: Array.isArray(r.successors) ? r.successors.map((s: any) => String(s)) : [],
          responsiblePerson: r.assignee ?? '',
          plannedHours: Number(r.plannedHours ?? 0),
          actualHours: Number(r.actualHours ?? 0),
          resourcesRequired: Array.isArray(r.resourcesRequired) ? r.resourcesRequired.map((x: any) => String(x)) : [],
        }));
        if (!cancelled) {
          setRows(mapped);
          setLoadError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load schedule');
          setRows([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Get unique values for filters
  const projects = useMemo(() =>
    ['all', ...Array.from(new Set(rows.map(a => a.projectName)))],
    [rows]
  );

  const phases = useMemo(() =>
    ['all', ...Array.from(new Set(rows.map(a => a.phase)))],
    [rows]
  );

  // Filter activities
  const filteredActivities = useMemo(() => {
    return rows.filter(activity => {
      const matchesSearch = searchTerm === '' ||
        activity.activityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.activityCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.wbsCode.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesProject = projectFilter === 'all' || activity.projectName === projectFilter;
      const matchesStatus = statusFilter === 'all' || activity.status === statusFilter;
      const matchesPhase = phaseFilter === 'all' || activity.phase === phaseFilter;
      const matchesCriticalPath = criticalPathFilter === 'all' ||
        (criticalPathFilter === 'critical' && activity.isCriticalPath) ||
        (criticalPathFilter === 'non-critical' && !activity.isCriticalPath);

      return matchesSearch && matchesProject && matchesStatus && matchesPhase && matchesCriticalPath;
    });
  }, [rows, searchTerm, projectFilter, statusFilter, phaseFilter, criticalPathFilter]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalActivities = rows.length;
    const completedActivities = rows.filter(a => a.status === 'completed').length;
    const inProgressActivities = rows.filter(a => a.status === 'in-progress').length;
    const criticalPathActivities = rows.filter(a => a.isCriticalPath).length;
    const delayedActivities = rows.filter(a => {
      if (a.status === 'completed' && a.actualEnd) {
        return new Date(a.actualEnd) > new Date(a.endDate);
      }
      if (a.status === 'in-progress') {
        return new Date() > new Date(a.endDate);
      }
      return false;
    }).length;

    const totalDuration = rows
      .filter(a => a.isCriticalPath)
      .reduce((sum, a) => sum + a.duration, 0);

    return {
      totalActivities,
      completedActivities,
      inProgressActivities,
      criticalPathActivities,
      delayedActivities,
      totalDuration
    };
  }, [rows]);

  const getStatusColor = (status: ScheduleActivity['status']) => {
    switch (status) {
      case 'not-started': return 'bg-gray-50 text-gray-700 border-gray-200';
      case 'in-progress': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'completed': return 'bg-green-50 text-green-700 border-green-200';
      case 'delayed': return 'bg-red-50 text-red-700 border-red-200';
      case 'on-hold': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const isDelayed = (activity: ScheduleActivity) => {
    if (activity.status === 'completed' && activity.actualEnd) {
      return new Date(activity.actualEnd) > new Date(activity.endDate);
    }
    if (activity.status === 'in-progress') {
      return new Date() > new Date(activity.endDate);
    }
    return false;
  };

  const getScheduleVariance = (activity: ScheduleActivity) => {
    if (activity.status === 'completed' && activity.actualEnd) {
      const planned = new Date(activity.endDate);
      const actual = new Date(activity.actualEnd);
      const diffDays = Math.round((actual.getTime() - planned.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays;
    }
    return 0;
  };

  return (
    <div className="p-6">
      <div className="mb-3">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <Calendar className="h-8 w-8 text-teal-600" />
          Project Schedule
        </h1>
        <p className="text-gray-600 mt-2">Timeline planning, scheduling, and critical path management</p>
      </div>

      {isLoading && (
        <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">
          Loading schedule…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
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
              placeholder="Search activities by name, code, or WBS..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={() => exportToCsv('project-schedule', filteredActivities as unknown as Record<string, unknown>[])} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-2 mb-3">
        <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg p-3 border border-teal-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-teal-600 text-sm font-medium">Total Activities</p>
              <p className="text-3xl font-bold text-teal-900 mt-1">{stats.totalActivities}</p>
            </div>
            <Calendar className="h-12 w-12 text-teal-600 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">In Progress</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">{stats.inProgressActivities}</p>
            </div>
            <Circle className="h-12 w-12 text-blue-600 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Completed</p>
              <p className="text-3xl font-bold text-green-900 mt-1">{stats.completedActivities}</p>
            </div>
            <CheckCircle className="h-12 w-12 text-green-600 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">Critical Path</p>
              <p className="text-3xl font-bold text-purple-900 mt-1">{stats.criticalPathActivities}</p>
            </div>
            <AlertTriangle className="h-12 w-12 text-purple-600 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-600 text-sm font-medium">Delayed</p>
              <p className="text-3xl font-bold text-red-900 mt-1">{stats.delayedActivities}</p>
            </div>
            <AlertTriangle className="h-12 w-12 text-red-600 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 text-sm font-medium">Total Duration</p>
              <p className="text-3xl font-bold text-orange-900 mt-1">{stats.totalDuration}d</p>
            </div>
            <Clock className="h-12 w-12 text-orange-600 opacity-50" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex items-center gap-3 flex-wrap">
          <Filter className="h-4 w-4 text-gray-500" />

          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            {projects.map(project => (
              <option key={project} value={project}>
                {project === 'all' ? 'All Projects' : project}
              </option>
            ))}
          </select>

          <select
            value={phaseFilter}
            onChange={(e) => setPhaseFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            {phases.map(phase => (
              <option key={phase} value={phase}>
                {phase === 'all' ? 'All Phases' : phase}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="not-started">Not Started</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="delayed">Delayed</option>
            <option value="on-hold">On Hold</option>
          </select>

          <select
            value={criticalPathFilter}
            onChange={(e) => setCriticalPathFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value="all">All Activities</option>
            <option value="critical">Critical Path Only</option>
            <option value="non-critical">Non-Critical Only</option>
          </select>

          <div className="ml-auto text-sm text-gray-600">
            Showing {filteredActivities.length} of {rows.length} activities
          </div>
        </div>
      </div>

      {/* Schedule Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-3">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Activity</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Project</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Phase</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Duration</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Start - End</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Progress</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Float</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Dependencies</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredActivities.map((activity) => (
                <tr key={activity.id} className={`hover:bg-gray-50 ${activity.isCriticalPath ? 'bg-purple-50/30' : ''}`}>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{activity.activityName}</span>
                        {activity.isCriticalPath && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded border border-purple-300">
                            CRITICAL
                          </span>
                        )}
                        {isDelayed(activity) && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded border border-red-300 flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            DELAYED
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">{activity.activityCode} • {activity.wbsCode}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{activity.projectName}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{activity.phase}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{activity.duration} days</td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-700">
                      <div>{new Date(activity.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                      <div className="text-xs text-gray-500">
                        to {new Date(activity.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </div>
                      {activity.actualEnd && (
                        <div className={`text-xs mt-1 ${getScheduleVariance(activity) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          Actual: {new Date(activity.actualEnd).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          {getScheduleVariance(activity) !== 0 && (
                            <span className="ml-1">({getScheduleVariance(activity) > 0 ? '+' : ''}{getScheduleVariance(activity)}d)</span>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="w-32">
                      <div className="h-2 w-full bg-gray-100 rounded">
                        <div
                          className={`h-2 rounded ${
                            activity.progressPercent >= 100 ? 'bg-green-600' :
                            activity.progressPercent >= 50 ? 'bg-blue-600' :
                            'bg-yellow-500'
                          }`}
                          style={{ width: `${activity.progressPercent}%` }}
                        />
                      </div>
                      <div className="mt-1 text-xs text-gray-600">{activity.progressPercent}%</div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded border ${getStatusColor(activity.status)}`}>
                      {activity.status.replace('-', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-sm ${activity.totalFloat === 0 ? 'text-purple-700 font-semibold' : 'text-gray-700'}`}>
                      {activity.totalFloat}d
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-xs text-gray-600">
                      {activity.predecessors.length > 0 && (
                        <div className="mb-1">
                          <span className="font-medium">Pred:</span> {activity.predecessors.join(', ')}
                        </div>
                      )}
                      {activity.successors.length > 0 && (
                        <div>
                          <span className="font-medium">Succ:</span> {activity.successors.join(', ')}
                        </div>
                      )}
                      {activity.predecessors.length === 0 && activity.successors.length === 0 && (
                        <span className="text-gray-400">—</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredActivities.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                    No activities found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Guidelines Section */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Schedule Management Guidelines</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Critical Path Method (CPM)</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><span className="font-medium">Critical Path:</span> Activities with zero total float that determine project duration</li>
              <li><span className="font-medium">Total Float:</span> Amount of time an activity can be delayed without delaying project</li>
              <li><span className="font-medium">Free Float:</span> Time an activity can be delayed without delaying any successor</li>
              <li><span className="font-medium">Lag:</span> Delay between predecessor and successor activities</li>
              <li><span className="font-medium">Lead:</span> Overlap between predecessor and successor activities</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-gray-700 mb-2">Dependency Types</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><span className="font-medium">Finish-to-Start (FS):</span> Successor starts after predecessor finishes</li>
              <li><span className="font-medium">Start-to-Start (SS):</span> Successor starts when predecessor starts</li>
              <li><span className="font-medium">Finish-to-Finish (FF):</span> Successor finishes when predecessor finishes</li>
              <li><span className="font-medium">Start-to-Finish (SF):</span> Successor finishes when predecessor starts (rare)</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-gray-700 mb-2">Schedule Baseline</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Approved version of schedule used for comparison</li>
              <li>• Track variance between baseline and actual dates</li>
              <li>• Update baseline only for approved changes</li>
              <li>• Maintain schedule performance index (SPI)</li>
              <li>• Document all baseline changes with justification</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-gray-700 mb-2">Best Practices</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Update progress weekly with actual dates</li>
              <li>• Monitor critical path activities daily</li>
              <li>• Perform schedule compression when needed</li>
              <li>• Use resource leveling to optimize allocation</li>
              <li>• Conduct what-if analysis for risks</li>
              <li>• Maintain schedule buffer for uncertainties</li>
              <li>• Review float trends to identify emerging issues</li>
              <li>• Integrate schedule with cost and resource plans</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 p-3 bg-purple-50 border border-purple-200 rounded-lg">
          <h3 className="font-medium text-purple-800 mb-2">Critical Path Analysis</h3>
          <p className="text-sm text-purple-700">
            Activities on the critical path have zero float and directly impact project completion date. Any delay in critical path
            activities will delay the entire project. Focus monitoring and resources on critical activities to ensure on-time delivery.
            Non-critical activities have positive float and can be delayed without impacting project end date.
          </p>
        </div>
      </div>
    </div>
  );
}
