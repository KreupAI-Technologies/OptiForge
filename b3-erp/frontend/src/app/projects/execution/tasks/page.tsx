'use client';

import { useState, useMemo, useEffect } from 'react';
import { ListTodo, Search, Filter, PlusCircle, Download, Users, Calendar, AlertCircle, CheckCircle2, Clock, Flag, TrendingUp } from 'lucide-react';
import { projectManagementService } from '@/services/ProjectManagementService';

interface Task {
  id: string;
  taskNumber: string;
  taskName: string;
  projectCode: string;
  projectName: string;
  phase: string;
  workPackage: string;
  assignedTo: string;
  assignedBy: string;
  department: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'not-started' | 'in-progress' | 'on-hold' | 'completed' | 'cancelled' | 'blocked';
  progressPercent: number;
  startDate: string;
  dueDate: string;
  completedDate?: string;
  estimatedHours: number;
  actualHours: number;
  remainingHours: number;
  dependencies: string[];
  tags: string[];
  description: string;
  blockers?: string;
  createdBy: string;
  createdDate: string;
  lastUpdated: string;
}

// Mock data for tasks
const mockTasksData: Task[] = [
  {
    id: 'TASK-001',
    taskNumber: 'TSK-2025-001',
    taskName: 'Site Survey and Soil Testing',
    projectCode: 'PROJ-2025-001',
    projectName: 'Manufacturing Plant Expansion',
    phase: 'Phase 1 - Foundation',
    workPackage: 'WP-101 Site Preparation',
    assignedTo: 'Ramesh Iyer',
    assignedBy: 'Rajesh Kumar',
    department: 'Civil Engineering',
    priority: 'critical',
    status: 'completed',
    progressPercent: 100,
    startDate: '2025-04-01',
    dueDate: '2025-04-15',
    completedDate: '2025-04-14',
    estimatedHours: 80,
    actualHours: 75,
    remainingHours: 0,
    dependencies: [],
    tags: ['foundation', 'site-work', 'testing'],
    description: 'Conduct comprehensive site survey and soil testing for foundation design',
    createdBy: 'Rajesh Kumar',
    createdDate: '2025-03-20',
    lastUpdated: '2025-04-14'
  },
  {
    id: 'TASK-002',
    taskNumber: 'TSK-2025-002',
    taskName: 'Foundation Design and Approval',
    projectCode: 'PROJ-2025-001',
    projectName: 'Manufacturing Plant Expansion',
    phase: 'Phase 1 - Foundation',
    workPackage: 'WP-101 Site Preparation',
    assignedTo: 'Priya Menon',
    assignedBy: 'Rajesh Kumar',
    department: 'Structural Engineering',
    priority: 'critical',
    status: 'in-progress',
    progressPercent: 65,
    startDate: '2025-04-15',
    dueDate: '2025-05-05',
    estimatedHours: 120,
    actualHours: 78,
    remainingHours: 42,
    dependencies: ['TSK-2025-001'],
    tags: ['foundation', 'design', 'approval'],
    description: 'Prepare foundation design drawings and obtain regulatory approvals',
    createdBy: 'Rajesh Kumar',
    createdDate: '2025-03-20',
    lastUpdated: '2025-10-20'
  },
  {
    id: 'TASK-003',
    taskNumber: 'TSK-2025-003',
    taskName: 'Excavation and Earth Work',
    projectCode: 'PROJ-2025-001',
    projectName: 'Manufacturing Plant Expansion',
    phase: 'Phase 1 - Foundation',
    workPackage: 'WP-101 Site Preparation',
    assignedTo: 'Vikram Patel',
    assignedBy: 'Rajesh Kumar',
    department: 'Civil Engineering',
    priority: 'high',
    status: 'not-started',
    progressPercent: 0,
    startDate: '2025-05-06',
    dueDate: '2025-05-25',
    estimatedHours: 200,
    actualHours: 0,
    remainingHours: 200,
    dependencies: ['TSK-2025-002'],
    tags: ['foundation', 'excavation', 'site-work'],
    description: 'Excavation work for foundation and site leveling',
    createdBy: 'Rajesh Kumar',
    createdDate: '2025-03-20',
    lastUpdated: '2025-04-20'
  },
  {
    id: 'TASK-004',
    taskNumber: 'TSK-2025-010',
    taskName: 'ERP Requirements Gathering',
    projectCode: 'PROJ-2025-002',
    projectName: 'ERP System Implementation',
    phase: 'Phase 1 - Analysis',
    workPackage: 'WP-301 Requirements Gathering',
    assignedTo: 'Sneha Desai',
    assignedBy: 'Amit Patel',
    department: 'IT',
    priority: 'high',
    status: 'completed',
    progressPercent: 100,
    startDate: '2025-05-01',
    dueDate: '2025-05-31',
    completedDate: '2025-05-28',
    estimatedHours: 160,
    actualHours: 168,
    remainingHours: 0,
    dependencies: [],
    tags: ['erp', 'requirements', 'analysis'],
    description: 'Gather business requirements from all departments for ERP implementation',
    createdBy: 'Amit Patel',
    createdDate: '2025-04-15',
    lastUpdated: '2025-05-28'
  },
  {
    id: 'TASK-005',
    taskNumber: 'TSK-2025-011',
    taskName: 'ERP System Configuration',
    projectCode: 'PROJ-2025-002',
    projectName: 'ERP System Implementation',
    phase: 'Phase 2 - Development',
    workPackage: 'WP-302 Custom Module Development',
    assignedTo: 'Karthik Reddy',
    assignedBy: 'Amit Patel',
    department: 'IT',
    priority: 'critical',
    status: 'in-progress',
    progressPercent: 45,
    startDate: '2025-06-01',
    dueDate: '2025-08-31',
    estimatedHours: 400,
    actualHours: 180,
    remainingHours: 220,
    dependencies: ['TSK-2025-010'],
    tags: ['erp', 'configuration', 'development'],
    description: 'Configure ERP modules and develop custom functionality',
    createdBy: 'Amit Patel',
    createdDate: '2025-05-15',
    lastUpdated: '2025-10-20'
  },
  {
    id: 'TASK-006',
    taskNumber: 'TSK-2025-012',
    taskName: 'Data Migration Planning',
    projectCode: 'PROJ-2025-002',
    projectName: 'ERP System Implementation',
    phase: 'Phase 2 - Development',
    workPackage: 'WP-302 Custom Module Development',
    assignedTo: 'Anjali Sharma',
    assignedBy: 'Amit Patel',
    department: 'IT',
    priority: 'high',
    status: 'blocked',
    progressPercent: 30,
    startDate: '2025-07-01',
    dueDate: '2025-08-15',
    estimatedHours: 200,
    actualHours: 60,
    remainingHours: 140,
    dependencies: ['TSK-2025-010'],
    tags: ['erp', 'data-migration', 'planning'],
    description: 'Plan and prepare data migration strategy from legacy systems',
    blockers: 'Waiting for legacy system access credentials from IT security team',
    createdBy: 'Amit Patel',
    createdDate: '2025-06-15',
    lastUpdated: '2025-10-18'
  },
  {
    id: 'TASK-007',
    taskNumber: 'TSK-2025-020',
    taskName: 'Solar Panel Procurement',
    projectCode: 'PROJ-2025-003',
    projectName: 'Solar Power Installation',
    phase: 'Phase 1 - Procurement',
    workPackage: 'WP-401 Solar Panels',
    assignedTo: 'Suresh Kumar',
    assignedBy: 'Sunita Reddy',
    department: 'Procurement',
    priority: 'critical',
    status: 'completed',
    progressPercent: 100,
    startDate: '2025-06-01',
    dueDate: '2025-07-15',
    completedDate: '2025-07-10',
    estimatedHours: 60,
    actualHours: 55,
    remainingHours: 0,
    dependencies: [],
    tags: ['solar', 'procurement', 'equipment'],
    description: 'Procure 1 MW solar panels from approved vendors',
    createdBy: 'Sunita Reddy',
    createdDate: '2025-05-20',
    lastUpdated: '2025-07-10'
  },
  {
    id: 'TASK-008',
    taskNumber: 'TSK-2025-021',
    taskName: 'Roof Structural Assessment',
    projectCode: 'PROJ-2025-003',
    projectName: 'Solar Power Installation',
    phase: 'Phase 1 - Procurement',
    workPackage: 'WP-401 Solar Panels',
    assignedTo: 'Mahesh Bhatt',
    assignedBy: 'Sunita Reddy',
    department: 'Civil Engineering',
    priority: 'high',
    status: 'completed',
    progressPercent: 100,
    startDate: '2025-06-15',
    dueDate: '2025-07-05',
    completedDate: '2025-07-03',
    estimatedHours: 40,
    actualHours: 38,
    remainingHours: 0,
    dependencies: [],
    tags: ['solar', 'structural', 'assessment'],
    description: 'Assess roof load-bearing capacity for solar panel installation',
    createdBy: 'Sunita Reddy',
    createdDate: '2025-06-01',
    lastUpdated: '2025-07-03'
  },
  {
    id: 'TASK-009',
    taskNumber: 'TSK-2025-022',
    taskName: 'Solar Panel Installation',
    projectCode: 'PROJ-2025-003',
    projectName: 'Solar Power Installation',
    phase: 'Phase 2 - Installation',
    workPackage: 'WP-402 Panel Mounting',
    assignedTo: 'Ravi Verma',
    assignedBy: 'Sunita Reddy',
    department: 'Facilities',
    priority: 'critical',
    status: 'in-progress',
    progressPercent: 70,
    startDate: '2025-09-01',
    dueDate: '2025-10-31',
    estimatedHours: 300,
    actualHours: 210,
    remainingHours: 90,
    dependencies: ['TSK-2025-020', 'TSK-2025-021'],
    tags: ['solar', 'installation', 'construction'],
    description: 'Install solar panels on rooftop and connect to electrical systems',
    createdBy: 'Sunita Reddy',
    createdDate: '2025-08-15',
    lastUpdated: '2025-10-20'
  },
  {
    id: 'TASK-010',
    taskNumber: 'TSK-2025-030',
    taskName: 'AGV System Specification',
    projectCode: 'PROJ-2025-004',
    projectName: 'Warehouse Automation',
    phase: 'Phase 1 - Equipment',
    workPackage: 'WP-501 AGV Systems',
    assignedTo: 'Deepak Singh',
    assignedBy: 'Vikram Singh',
    department: 'Operations',
    priority: 'critical',
    status: 'in-progress',
    progressPercent: 55,
    startDate: '2025-08-01',
    dueDate: '2025-09-15',
    estimatedHours: 100,
    actualHours: 55,
    remainingHours: 45,
    dependencies: [],
    tags: ['automation', 'agv', 'specification'],
    description: 'Define technical specifications for AGV systems',
    createdBy: 'Vikram Singh',
    createdDate: '2025-07-15',
    lastUpdated: '2025-10-20'
  },
  {
    id: 'TASK-011',
    taskNumber: 'TSK-2025-031',
    taskName: 'Warehouse Layout Design',
    projectCode: 'PROJ-2025-004',
    projectName: 'Warehouse Automation',
    phase: 'Phase 1 - Equipment',
    workPackage: 'WP-501 AGV Systems',
    assignedTo: 'Neha Kapoor',
    assignedBy: 'Vikram Singh',
    department: 'Operations',
    priority: 'high',
    status: 'on-hold',
    progressPercent: 40,
    startDate: '2025-08-15',
    dueDate: '2025-10-01',
    estimatedHours: 120,
    actualHours: 48,
    remainingHours: 72,
    dependencies: [],
    tags: ['automation', 'layout', 'design'],
    description: 'Design warehouse layout for AGV operations and material flow',
    createdBy: 'Vikram Singh',
    createdDate: '2025-07-20',
    lastUpdated: '2025-09-25'
  },
  {
    id: 'TASK-012',
    taskNumber: 'TSK-2025-040',
    taskName: 'Lab Equipment Procurement',
    projectCode: 'PROJ-2025-005',
    projectName: 'Quality Lab Setup',
    phase: 'Phase 2 - Equipment',
    workPackage: 'WP-602 Testing Instruments',
    assignedTo: 'Meera Iyer',
    assignedBy: 'Meera Iyer',
    department: 'Quality',
    priority: 'high',
    status: 'in-progress',
    progressPercent: 80,
    startDate: '2025-09-01',
    dueDate: '2025-10-31',
    estimatedHours: 80,
    actualHours: 64,
    remainingHours: 16,
    dependencies: [],
    tags: ['quality', 'procurement', 'equipment'],
    description: 'Procure testing equipment and instruments for quality lab',
    createdBy: 'Meera Iyer',
    createdDate: '2025-08-15',
    lastUpdated: '2025-10-20'
  },
  {
    id: 'TASK-013',
    taskNumber: 'TSK-2025-041',
    taskName: 'Lab Calibration and Certification',
    projectCode: 'PROJ-2025-005',
    projectName: 'Quality Lab Setup',
    phase: 'Phase 2 - Equipment',
    workPackage: 'WP-602 Testing Instruments',
    assignedTo: 'Arun Menon',
    assignedBy: 'Meera Iyer',
    department: 'Quality',
    priority: 'medium',
    status: 'not-started',
    progressPercent: 0,
    startDate: '2025-11-01',
    dueDate: '2025-11-30',
    estimatedHours: 60,
    actualHours: 0,
    remainingHours: 60,
    dependencies: ['TSK-2025-040'],
    tags: ['quality', 'calibration', 'certification'],
    description: 'Calibrate all lab equipment and obtain NABL certification',
    createdBy: 'Meera Iyer',
    createdDate: '2025-09-01',
    lastUpdated: '2025-09-01'
  },
  {
    id: 'TASK-014',
    taskNumber: 'TSK-2025-050',
    taskName: 'Product Prototype Development',
    projectCode: 'PROJ-2024-018',
    projectName: 'Product Development - Series X',
    phase: 'Phase 3 - Prototyping',
    workPackage: 'WP-303 Prototype Build',
    assignedTo: 'Arjun Krishnan',
    assignedBy: 'Priya Sharma',
    department: 'R&D',
    priority: 'critical',
    status: 'in-progress',
    progressPercent: 85,
    startDate: '2025-08-01',
    dueDate: '2025-10-31',
    estimatedHours: 320,
    actualHours: 272,
    remainingHours: 48,
    dependencies: [],
    tags: ['r&d', 'prototype', 'product-development'],
    description: 'Build and test Series X product prototype',
    createdBy: 'Priya Sharma',
    createdDate: '2025-07-15',
    lastUpdated: '2025-10-20'
  },
  {
    id: 'TASK-015',
    taskNumber: 'TSK-2025-051',
    taskName: 'Field Testing and Validation',
    projectCode: 'PROJ-2024-018',
    projectName: 'Product Development - Series X',
    phase: 'Phase 4 - Testing',
    workPackage: 'WP-304 Field Trials',
    assignedTo: 'Lakshmi Nair',
    assignedBy: 'Priya Sharma',
    department: 'R&D',
    priority: 'high',
    status: 'not-started',
    progressPercent: 0,
    startDate: '2025-11-01',
    dueDate: '2025-12-15',
    estimatedHours: 180,
    actualHours: 0,
    remainingHours: 180,
    dependencies: ['TSK-2025-050'],
    tags: ['r&d', 'testing', 'validation'],
    description: 'Conduct field testing and validate product performance',
    createdBy: 'Priya Sharma',
    createdDate: '2025-09-01',
    lastUpdated: '2025-09-01'
  }
];

const TASK_STATUSES: Task['status'][] = ['not-started', 'in-progress', 'on-hold', 'completed', 'cancelled', 'blocked'];
const TASK_PRIORITIES: Task['priority'][] = ['critical', 'high', 'medium', 'low'];

export default function TaskManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');

  const [rows, setRows] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await projectManagementService.listProjectTasks();
        if (cancelled) return;
        const list = Array.isArray(data) ? data : [];
        const mapped: Task[] = list.map((r: any) => {
          const rawStatus = String(r.status ?? '').replace(/_/g, '-');
          const status: Task['status'] = TASK_STATUSES.includes(rawStatus as Task['status'])
            ? (rawStatus as Task['status'])
            : 'not-started';
          const rawPriority = String(r.priority ?? '');
          const priority: Task['priority'] = TASK_PRIORITIES.includes(rawPriority as Task['priority'])
            ? (rawPriority as Task['priority'])
            : 'medium';
          const assigned = Array.isArray(r.assignedTo) ? r.assignedTo : [];
          const deps = Array.isArray(r.dependencies) ? r.dependencies.map((d: any) => String(d)) : [];
          const estimatedHours = Number(r.estimatedHours ?? 0);
          const actualHours = Number(r.actualHours ?? 0);
          return {
            id: String(r.id ?? ''),
            taskNumber: String(r.taskNumber ?? r.id ?? ''),
            taskName: String(r.name ?? ''),
            projectCode: String(r.projectCode ?? r.projectId ?? ''),
            projectName: String(r.projectName ?? ''),
            phase: String(r.phase ?? ''),
            workPackage: String(r.workPackage ?? ''),
            assignedTo: String(assigned[0] ?? r.assignedToName ?? ''),
            assignedBy: String(r.assignedBy ?? ''),
            department: String(r.department ?? ''),
            priority,
            status,
            progressPercent: Number(r.progress ?? 0),
            startDate: String(r.startDate ?? ''),
            dueDate: String(r.endDate ?? r.targetCompletion ?? ''),
            completedDate: r.completedDate ? String(r.completedDate) : undefined,
            estimatedHours,
            actualHours,
            remainingHours: Number(r.remainingHours ?? Math.max(estimatedHours - actualHours, 0)),
            dependencies: deps,
            tags: Array.isArray(r.tags) ? r.tags.map((t: any) => String(t)) : [],
            description: String(r.description ?? ''),
            blockers: r.blockers ? String(r.blockers) : undefined,
            createdBy: String(r.createdBy ?? ''),
            createdDate: String(r.createdAt ?? ''),
            lastUpdated: String(r.updatedAt ?? ''),
          };
        });
        setRows(mapped);
      } catch (err) {
        if (cancelled) return;
        setLoadError(err instanceof Error ? err.message : 'Failed to load tasks');
        setRows([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalTasks = rows.length;
    const notStartedTasks = rows.filter(t => t.status === 'not-started').length;
    const inProgressTasks = rows.filter(t => t.status === 'in-progress').length;
    const completedTasks = rows.filter(t => t.status === 'completed').length;
    const onHoldTasks = rows.filter(t => t.status === 'on-hold').length;
    const blockedTasks = rows.filter(t => t.status === 'blocked').length;
    const cancelledTasks = rows.filter(t => t.status === 'cancelled').length;

    const overdueTasks = rows.filter(t =>
      t.status !== 'completed' && new Date(t.dueDate) < new Date()
    ).length;

    const dueSoonTasks = rows.filter(t => {
      const dueDate = new Date(t.dueDate);
      const today = new Date();
      const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return t.status !== 'completed' && diffDays >= 0 && diffDays <= 7;
    }).length;

    const totalEstimatedHours = rows.reduce((sum, t) => sum + t.estimatedHours, 0);
    const totalActualHours = rows.reduce((sum, t) => sum + t.actualHours, 0);
    const totalRemainingHours = rows.reduce((sum, t) => sum + t.remainingHours, 0);

    const avgProgress = totalTasks > 0 ? rows.reduce((sum, t) => sum + t.progressPercent, 0) / totalTasks : 0;

    return {
      totalTasks,
      notStartedTasks,
      inProgressTasks,
      completedTasks,
      onHoldTasks,
      blockedTasks,
      cancelledTasks,
      overdueTasks,
      dueSoonTasks,
      totalEstimatedHours,
      totalActualHours,
      totalRemainingHours,
      avgProgress
    };
  }, [rows]);

  // Get unique projects
  const projects = useMemo(() => {
    const projectSet = new Set(rows.map(t => t.projectName));
    return Array.from(projectSet).sort();
  }, [rows]);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return rows.filter(task => {
      const matchesSearch =
        task.taskName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.taskNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.assignedTo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.projectName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesProject = selectedProject === 'all' || task.projectName === selectedProject;
      const matchesStatus = selectedStatus === 'all' || task.status === selectedStatus;
      const matchesPriority = selectedPriority === 'all' || task.priority === selectedPriority;

      return matchesSearch && matchesProject && matchesStatus && matchesPriority;
    });
  }, [rows, searchTerm, selectedProject, selectedStatus, selectedPriority]);

  const getStatusBadge = (status: string) => {
    const badges = {
      'not-started': 'bg-gray-100 text-gray-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      'on-hold': 'bg-yellow-100 text-yellow-800',
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800',
      'blocked': 'bg-orange-100 text-orange-800'
    };
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityBadge = (priority: string) => {
    const badges = {
      'critical': 'bg-red-100 text-red-800',
      'high': 'bg-orange-100 text-orange-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'low': 'bg-blue-100 text-blue-800'
    };
    return badges[priority as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  const getProgressColor = (progress: number, status: string) => {
    if (status === 'completed') return 'bg-green-600';
    if (status === 'blocked' || status === 'cancelled') return 'bg-red-600';
    if (status === 'on-hold') return 'bg-yellow-600';
    if (progress >= 75) return 'bg-blue-600';
    if (progress >= 50) return 'bg-teal-600';
    return 'bg-orange-600';
  };

  const isOverdue = (dueDate: string, status: string) => {
    return status !== 'completed' && new Date(dueDate) < new Date();
  };

  const getDueDaysText = (dueDate: string, status: string) => {
    if (status === 'completed') return 'Completed';

    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return `Overdue by ${Math.abs(diffDays)} days`;
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    if (diffDays <= 7) return `Due in ${diffDays} days`;
    return `Due ${new Date(dueDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}`;
  };

  return (
    <div className="p-6">
      <div className="mb-3">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <ListTodo className="h-8 w-8 text-teal-600" />
          Task Management
        </h1>
        <p className="text-gray-600 mt-2">Create, assign, and track project tasks with priorities and deadlines • FY 2025-26</p>
      </div>

      {isLoading && (
        <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">
          Loading tasks…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}

      {/* Summary Cards - 6 columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-2 mb-3">
        <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg p-3 border border-teal-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-teal-700 text-sm font-medium">Total Tasks</p>
            <ListTodo className="h-5 w-5 text-teal-600" />
          </div>
          <p className="text-2xl font-bold text-teal-900">{stats.totalTasks}</p>
          <p className="text-xs text-teal-600 mt-1">{stats.avgProgress.toFixed(0)}% avg progress</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-blue-700 text-sm font-medium">In Progress</p>
            <TrendingUp className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-900">{stats.inProgressTasks}</p>
          <p className="text-xs text-blue-600 mt-1">{stats.notStartedTasks} not started</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-green-700 text-sm font-medium">Completed</p>
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-green-900">{stats.completedTasks}</p>
          <p className="text-xs text-green-600 mt-1">{((stats.completedTasks / stats.totalTasks) * 100).toFixed(0)}% completion</p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3 border border-red-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-red-700 text-sm font-medium">Overdue</p>
            <AlertCircle className="h-5 w-5 text-red-600" />
          </div>
          <p className="text-2xl font-bold text-red-900">{stats.overdueTasks}</p>
          <p className="text-xs text-red-600 mt-1">{stats.blockedTasks} blocked</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-yellow-700 text-sm font-medium">Due Soon</p>
            <Clock className="h-5 w-5 text-yellow-600" />
          </div>
          <p className="text-2xl font-bold text-yellow-900">{stats.dueSoonTasks}</p>
          <p className="text-xs text-yellow-600 mt-1">Next 7 days</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-purple-700 text-sm font-medium">Total Hours</p>
            <Users className="h-5 w-5 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-purple-900">{stats.totalEstimatedHours}h</p>
          <p className="text-xs text-purple-600 mt-1">{stats.totalActualHours}h spent</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <div>
            <input
              type="text"
              placeholder="Search task, assignee, project..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
          <div>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="all">All Projects</option>
              {projects.map(project => (
                <option key={project} value={project}>{project}</option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="not-started">Not Started</option>
              <option value="in-progress">In Progress</option>
              <option value="on-hold">On Hold</option>
              <option value="completed">Completed</option>
              <option value="blocked">Blocked</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-2 mb-3">
        {filteredTasks.map((task) => (
          <div key={task.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-gray-900 text-lg">{task.taskName}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(task.status)}`}>
                    {task.status.replace('-', ' ').toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityBadge(task.priority)}`}>
                    {task.priority.toUpperCase()}
                  </span>
                  {isOverdue(task.dueDate, task.status) && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      OVERDUE
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="font-medium text-teal-600">{task.taskNumber}</span>
                  <span>•</span>
                  <span>{task.projectName}</span>
                  <span>•</span>
                  <span>{task.workPackage}</span>
                </div>
              </div>
              <div className="text-right ml-4">
                <div className="flex items-center gap-2 mb-1">
                  <Flag className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">
                    {getDueDaysText(task.dueDate, task.status)}
                  </span>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-700">Progress: {task.progressPercent}%</span>
                <span className="text-xs text-gray-600">
                  {task.actualHours}h / {task.estimatedHours}h • {task.remainingHours}h remaining
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${getProgressColor(task.progressPercent, task.status)}`}
                  style={{ width: `${task.progressPercent}%` }}
                ></div>
              </div>
            </div>

            {/* Task Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-2">
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                <p className="text-xs text-blue-600 font-medium mb-1 flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  Assigned To
                </p>
                <p className="text-sm font-bold text-blue-900">{task.assignedTo}</p>
                <p className="text-xs text-blue-700 mt-1">{task.department}</p>
              </div>

              <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
                <p className="text-xs text-purple-600 font-medium mb-1 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Timeline
                </p>
                <p className="text-sm font-bold text-purple-900">
                  {new Date(task.startDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} - {new Date(task.dueDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                </p>
                <p className="text-xs text-purple-700 mt-1">{task.phase}</p>
              </div>

              <div className={`rounded-lg p-3 border ${
                task.actualHours <= task.estimatedHours
                  ? 'bg-green-50 border-green-100'
                  : 'bg-red-50 border-red-100'
              }`}>
                <p className={`text-xs font-medium mb-1 ${
                  task.actualHours <= task.estimatedHours ? 'text-green-600' : 'text-red-600'
                }`}>
                  Effort Tracking
                </p>
                <p className={`text-sm font-bold ${
                  task.actualHours <= task.estimatedHours ? 'text-green-900' : 'text-red-900'
                }`}>
                  {task.actualHours}h / {task.estimatedHours}h
                </p>
                <p className={`text-xs mt-1 ${
                  task.actualHours <= task.estimatedHours ? 'text-green-700' : 'text-red-700'
                }`}>
                  {task.actualHours <= task.estimatedHours ? 'On track' : 'Over estimate'}
                </p>
              </div>

              <div className="bg-orange-50 rounded-lg p-3 border border-orange-100">
                <p className="text-xs text-orange-600 font-medium mb-1">Dependencies</p>
                <p className="text-sm font-bold text-orange-900">
                  {task.dependencies.length} task{task.dependencies.length !== 1 ? 's' : ''}
                </p>
                <p className="text-xs text-orange-700 mt-1">
                  {task.dependencies.length > 0 ? task.dependencies.join(', ') : 'No dependencies'}
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 mb-3">
              <p className="text-sm text-gray-700">{task.description}</p>
            </div>

            {/* Blocker Alert */}
            {task.blockers && (
              <div className="bg-red-50 rounded-lg p-3 border border-red-100 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-red-800">Blocker:</p>
                  <p className="text-sm text-red-700">{task.blockers}</p>
                </div>
              </div>
            )}

            {/* Tags */}
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
              <span className="text-xs text-gray-500">Tags:</span>
              {task.tags.map((tag, idx) => (
                <span key={idx} className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Guidelines Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
        <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
          <AlertCircle className="h-6 w-6 text-teal-600" />
          Task Management Guidelines
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">Task Status Types</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-gray-600 font-bold">•</span>
                <span><strong>Not Started:</strong> Task created but work not yet begun</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span><strong>In Progress:</strong> Active work underway, assignee is working on it</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 font-bold">•</span>
                <span><strong>On Hold:</strong> Temporarily paused, awaiting decisions or resources</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">•</span>
                <span><strong>Completed:</strong> All work finished and deliverables accepted</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-600 font-bold">•</span>
                <span><strong>Blocked:</strong> Cannot proceed due to external dependencies or issues</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold">•</span>
                <span><strong>Cancelled:</strong> Task no longer required or scope changed</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-800 mb-3">Priority Levels</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold">•</span>
                <span><strong>Critical:</strong> Must be completed ASAP, blocks other work, high business impact</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-600 font-bold">•</span>
                <span><strong>High:</strong> Important for project timeline, should be prioritized</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 font-bold">•</span>
                <span><strong>Medium:</strong> Standard priority, scheduled in regular workflow</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span><strong>Low:</strong> Nice-to-have, can be deferred if resources constrained</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-800 mb-3">Effort Tracking</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-teal-600 font-bold">•</span>
                <span><strong>Estimated Hours:</strong> Initial effort estimate for task completion</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-600 font-bold">•</span>
                <span><strong>Actual Hours:</strong> Time spent to date on task execution</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-600 font-bold">•</span>
                <span><strong>Remaining Hours:</strong> Estimated time still needed to complete</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-600 font-bold">•</span>
                <span><strong>Variance Tracking:</strong> Monitor actual vs estimated to improve future estimates</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-600 font-bold">•</span>
                <span><strong>Daily Updates:</strong> Team members should update hours daily for accuracy</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-800 mb-3">Best Practices</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold">•</span>
                <span><strong>Clear Descriptions:</strong> Include specific deliverables and acceptance criteria</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold">•</span>
                <span><strong>Single Owner:</strong> Assign one person responsible for task completion</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold">•</span>
                <span><strong>Dependencies:</strong> Document and track tasks that must be completed first</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold">•</span>
                <span><strong>Status Updates:</strong> Update task status and progress at least twice weekly</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold">•</span>
                <span><strong>Blockers:</strong> Escalate blocked tasks immediately to project manager</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold">•</span>
                <span><strong>Right-Sized Tasks:</strong> Keep tasks between 8-40 hours for manageable tracking</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
