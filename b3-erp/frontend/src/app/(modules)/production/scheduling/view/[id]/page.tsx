'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProductionOrphanService } from '@/services/production/production-orphan.service';
import {
  Calendar,
  Clock,
  Users,
  TrendingUp,
  Settings,
  Edit,
  CheckCircle,
  RotateCw,
  Download,
  Printer,
  ArrowLeft,
  Activity,
  AlertTriangle,
  Zap,
  Layers,
  BarChart3,
  Target,
  Play,
  CheckCircle2,
  Circle,
  Factory,
  Wrench,
  UserCheck,
  Sunrise,
  Sun,
  Moon,
  AlertCircle,
  TrendingDown,
  Flag,
  GitBranch,
  Maximize2,
  ChevronRight,
  Gauge,
  Box,
  FileText,
  Filter,
} from 'lucide-react';

// TypeScript Interfaces
interface ScheduledWorkOrder {
  id: string;
  woNumber: string;
  productCode: string;
  productName: string;
  quantity: number;
  plannedStartDate: string;
  plannedEndDate: string;
  actualStartDate: string | null;
  actualEndDate: string | null;
  status: 'scheduled' | 'in_progress' | 'completed' | 'delayed';
  workCenter: string;
  estimatedHours: number;
  actualHours: number | null;
  priority: number;
  dependencies: string[];
  isCriticalPath: boolean;
  slackTime: number;
}

interface ResourceAllocation {
  workCenter: string;
  workCenterCode: string;
  allocatedHours: number;
  availableHours: number;
  utilization: number;
  machineAssignments: MachineAssignment[];
  laborAssignments: LaborAssignment[];
  shiftAllocation: ShiftAllocation;
  conflicts: string[];
  overloaded: boolean;
}

interface MachineAssignment {
  machineId: string;
  machineName: string;
  workOrders: string[];
  utilizationPercent: number;
  status: 'available' | 'allocated' | 'overloaded';
}

interface LaborAssignment {
  employeeId: string;
  employeeName: string;
  role: string;
  assignedHours: number;
  workOrders: string[];
  shift: string;
}

interface ShiftAllocation {
  morning: { hours: number; workOrders: number };
  afternoon: { hours: number; workOrders: number };
  night: { hours: number; workOrders: number };
}

interface GanttBar {
  id: string;
  woNumber: string;
  productName: string;
  startDate: Date;
  endDate: Date;
  progress: number;
  color: string;
  workCenter: string;
  isCriticalPath: boolean;
  dependencies: string[];
  status: string;
}

interface Constraint {
  type: string;
  description: string;
  applied: boolean;
}

interface Schedule {
  id: string;
  scheduleNumber: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'draft' | 'confirmed' | 'in_progress' | 'completed';
  createdBy: string;
  createdDate: string;
  planningHorizon: number;
  schedulingMethod: string;
  capacityType: string;
  optimizationCriteria: string[];
  totalWorkOrders: number;
  scheduledHours: number;
  resourceUtilization: number;
  criticalPathDuration: number;
  workOrders: ScheduledWorkOrder[];
  constraints: Constraint[];
  completionDate: string;
  feasibilityScore: number;
}

export default function ProductionSchedulingViewPage() {
  const params = useParams();
  const router = useRouter();
  const scheduleId = params?.id as string;

  const [activeTab, setActiveTab] = useState<'details' | 'resources' | 'timeline'>('details');
  const [selectedWorkCenter, setSelectedWorkCenter] = useState<string>('all');
  const [ganttZoom, setGanttZoom] = useState<'day' | 'week' | 'month'>('week');
  const [showDependencies, setShowDependencies] = useState(true);
  const [showCriticalPath, setShowCriticalPath] = useState(true);

  // Mock data - in real app, fetch from API
  const schedule: Schedule = {
    id: scheduleId,
    scheduleNumber: 'SCH-2025-0847',
    name: 'Production Schedule - Week 16',
    startDate: '2025-04-14',
    endDate: '2025-04-20',
    status: 'in_progress',
    createdBy: 'Rajesh Kumar',
    createdDate: '2025-04-10T10:30:00',
    planningHorizon: 7,
    schedulingMethod: 'Backward Scheduling (Due Date Based)',
    capacityType: 'Finite Capacity',
    optimizationCriteria: ['Minimize Makespan', 'Maximize Utilization', 'Meet Due Dates'],
    totalWorkOrders: 24,
    scheduledHours: 1840,
    resourceUtilization: 87.5,
    criticalPathDuration: 156,
    completionDate: '2025-04-20T18:00:00',
    feasibilityScore: 92,
    workOrders: [
      {
        id: '1',
        woNumber: 'WO-2025-1234',
        productCode: 'MCB-32A-3P',
        productName: '32A 3-Pole MCB',
        quantity: 5000,
        plannedStartDate: '2025-04-14T08:00:00',
        plannedEndDate: '2025-04-16T17:00:00',
        actualStartDate: '2025-04-14T08:15:00',
        actualEndDate: null,
        status: 'in_progress',
        workCenter: 'Assembly Line 1',
        estimatedHours: 48,
        actualHours: 24,
        priority: 1,
        dependencies: [],
        isCriticalPath: true,
        slackTime: 0,
      },
      {
        id: '2',
        woNumber: 'WO-2025-1235',
        productCode: 'RCCB-40A-4P',
        productName: '40A 4-Pole RCCB',
        quantity: 3000,
        plannedStartDate: '2025-04-14T08:00:00',
        plannedEndDate: '2025-04-15T17:00:00',
        actualStartDate: '2025-04-14T08:00:00',
        actualEndDate: null,
        status: 'in_progress',
        workCenter: 'Assembly Line 2',
        estimatedHours: 32,
        actualHours: 16,
        priority: 2,
        dependencies: [],
        isCriticalPath: false,
        slackTime: 8,
      },
      {
        id: '3',
        woNumber: 'WO-2025-1236',
        productCode: 'MCCB-100A-3P',
        productName: '100A 3-Pole MCCB',
        quantity: 1500,
        plannedStartDate: '2025-04-15T08:00:00',
        plannedEndDate: '2025-04-17T17:00:00',
        actualStartDate: null,
        actualEndDate: null,
        status: 'scheduled',
        workCenter: 'Assembly Line 3',
        estimatedHours: 56,
        actualHours: null,
        priority: 3,
        dependencies: [],
        isCriticalPath: false,
        slackTime: 4,
      },
      {
        id: '4',
        woNumber: 'WO-2025-1237',
        productCode: 'ISO-63A-4P',
        productName: '63A 4-Pole Isolator',
        quantity: 2000,
        plannedStartDate: '2025-04-16T08:00:00',
        plannedEndDate: '2025-04-18T17:00:00',
        actualStartDate: null,
        actualEndDate: null,
        status: 'scheduled',
        workCenter: 'Assembly Line 1',
        estimatedHours: 52,
        actualHours: null,
        priority: 1,
        dependencies: ['WO-2025-1234'],
        isCriticalPath: true,
        slackTime: 0,
      },
      {
        id: '5',
        woNumber: 'WO-2025-1238',
        productCode: 'DB-8W-4M',
        productName: '8-Way 4-Module DB',
        quantity: 1000,
        plannedStartDate: '2025-04-17T08:00:00',
        plannedEndDate: '2025-04-19T17:00:00',
        actualStartDate: null,
        actualEndDate: null,
        status: 'scheduled',
        workCenter: 'Assembly Line 2',
        estimatedHours: 48,
        actualHours: null,
        priority: 2,
        dependencies: ['WO-2025-1235'],
        isCriticalPath: false,
        slackTime: 12,
      },
      {
        id: '6',
        woNumber: 'WO-2025-1239',
        productCode: 'MCB-16A-2P',
        productName: '16A 2-Pole MCB',
        quantity: 8000,
        plannedStartDate: '2025-04-18T08:00:00',
        plannedEndDate: '2025-04-20T17:00:00',
        actualStartDate: null,
        actualEndDate: null,
        status: 'scheduled',
        workCenter: 'Assembly Line 3',
        estimatedHours: 60,
        actualHours: null,
        priority: 1,
        dependencies: ['WO-2025-1236'],
        isCriticalPath: true,
        slackTime: 0,
      },
    ],
    constraints: [
      { type: 'Material Availability', description: 'Check raw material stock before scheduling', applied: true },
      { type: 'Capacity Limits', description: 'Respect work center capacity constraints', applied: true },
      { type: 'Due Dates', description: 'Meet customer due dates', applied: true },
      { type: 'Skill Requirements', description: 'Match operator skills to work orders', applied: true },
    ],
  };

  // Resource allocations — primary table, wired to production/resource-allocations
  const [resourceAllocations, setResourceAllocations] = useState<ResourceAllocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const res = await ProductionOrphanService.getResourceAllocations();
        const raw: any[] = Array.isArray(res) ? res : (res?.data ?? res?.items ?? []);
        const mapped: ResourceAllocation[] = raw.map((r) => {
          const allocatedHours = Number(r.allocatedHours ?? r.allocated ?? 0);
          const availableHours = Number(r.availableHours ?? r.available ?? r.capacityHours ?? 0);
          const utilization = Number(
            r.utilization ?? (availableHours > 0 ? (allocatedHours / availableHours) * 100 : 0),
          );
          const shift = r.shiftAllocation ?? {};
          return {
            workCenter: r.workCenter ?? r.workCenterName ?? r.resourceName ?? r.name ?? '-',
            workCenterCode: r.workCenterCode ?? r.code ?? r.resourceCode ?? '-',
            allocatedHours,
            availableHours,
            utilization,
            overloaded: Boolean(r.overloaded ?? utilization > 100),
            conflicts: Array.isArray(r.conflicts) ? r.conflicts : [],
            machineAssignments: Array.isArray(r.machineAssignments) ? r.machineAssignments : [],
            laborAssignments: Array.isArray(r.laborAssignments) ? r.laborAssignments : [],
            shiftAllocation: {
              morning: {
                hours: Number(shift.morning?.hours ?? 0),
                workOrders: Number(shift.morning?.workOrders ?? 0),
              },
              afternoon: {
                hours: Number(shift.afternoon?.hours ?? 0),
                workOrders: Number(shift.afternoon?.workOrders ?? 0),
              },
              night: {
                hours: Number(shift.night?.hours ?? 0),
                workOrders: Number(shift.night?.workOrders ?? 0),
              },
            },
          };
        });
        if (!cancelled) setResourceAllocations(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load resource allocations');
          setResourceAllocations([]);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'delayed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'confirmed':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'in_progress':
        return <Play className="w-4 h-4" />;
      case 'scheduled':
        return <Clock className="w-4 h-4" />;
      case 'delayed':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Circle className="w-4 h-4" />;
    }
  };

  const getShiftIcon = (shift: string) => {
    switch (shift) {
      case 'Morning':
        return <Sunrise className="w-4 h-4 text-yellow-600" />;
      case 'Afternoon':
        return <Sun className="w-4 h-4 text-orange-600" />;
      case 'Night':
        return <Moon className="w-4 h-4 text-indigo-600" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  // Gantt Chart Generation
  const generateGanttData = (): GanttBar[] => {
    return schedule.workOrders.map((wo) => ({
      id: wo.id,
      woNumber: wo.woNumber,
      productName: wo.productName,
      startDate: new Date(wo.plannedStartDate),
      endDate: new Date(wo.plannedEndDate),
      progress: wo.actualHours ? (wo.actualHours / wo.estimatedHours) * 100 : 0,
      color: wo.isCriticalPath
        ? 'bg-blue-500'
        : wo.status === 'completed'
        ? 'bg-green-500'
        : wo.status === 'in_progress'
        ? 'bg-yellow-500'
        : wo.status === 'delayed'
        ? 'bg-red-500'
        : 'bg-gray-400',
      workCenter: wo.workCenter,
      isCriticalPath: wo.isCriticalPath,
      dependencies: wo.dependencies,
      status: wo.status,
    }));
  };

  const ganttData = generateGanttData();

  // Calculate Gantt timeline
  const getGanttTimeline = () => {
    const startDate = new Date(schedule.startDate);
    const endDate = new Date(schedule.endDate);
    const days: Date[] = [];

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d));
    }

    return days;
  };

  const timeline = getGanttTimeline();

  const formatDate = (date: string | Date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatDateTime = (date: string | Date) => {
    const d = new Date(date);
    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateBarPosition = (startDate: Date, endDate: Date) => {
    const scheduleStart = new Date(schedule.startDate);
    const scheduleEnd = new Date(schedule.endDate);
    const totalDuration = scheduleEnd.getTime() - scheduleStart.getTime();

    const barStart = startDate.getTime() - scheduleStart.getTime();
    const barDuration = endDate.getTime() - startDate.getTime();

    const left = (barStart / totalDuration) * 100;
    const width = (barDuration / totalDuration) * 100;

    return { left: `${Math.max(0, left)}%`, width: `${Math.min(100 - left, width)}%` };
  };

  const handleConfirmSchedule = () => {
    alert('Schedule confirmed and locked for execution');
  };

  const handleReschedule = () => {
    if (confirm('This will run the scheduling algorithm again. Continue?')) {
      alert('Rescheduling in progress...');
    }
  };

  const handleExport = () => {
    alert('Exporting schedule to Excel...');
  };

  const handlePrintGantt = () => {
    window.print();
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3">
      {/* Header */}
      <div className="mb-3">
        <button
          onClick={() => router.push('/production/scheduling')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-2"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Schedules
        </button>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{schedule.scheduleNumber}</h1>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                  schedule.status
                )}`}
              >
                {schedule.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            <p className="text-gray-600 text-lg mb-1">{schedule.name}</p>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDate(schedule.startDate)} - {formatDate(schedule.endDate)}
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                Created by {schedule.createdBy}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formatDateTime(schedule.createdDate)}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => router.push(`/production/scheduling/edit/${scheduleId}`)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Edit className="w-4 h-4" />
              Edit Schedule
            </button>
            {schedule.status === 'draft' && (
              <button
                onClick={handleConfirmSchedule}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4" />
                Confirm
              </button>
            )}
            <button
              onClick={handleReschedule}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <RotateCw className="w-4 h-4" />
              Reschedule
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={handlePrintGantt}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Printer className="w-4 h-4" />
              Print Gantt
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-3 mb-3">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">Total Work Orders</span>
            <Layers className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{schedule.totalWorkOrders}</div>
          <div className="text-sm text-gray-500 mt-1">Across {resourceAllocations.length} work centers</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">Scheduled Hours</span>
            <Clock className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{schedule.scheduledHours.toLocaleString()}</div>
          <div className="text-sm text-gray-500 mt-1">Total production time</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">Resource Utilization</span>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{schedule.resourceUtilization}%</div>
          <div className="text-sm text-green-600 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Optimal range (75-90%)
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">Critical Path Duration</span>
            <Zap className="w-5 h-5 text-orange-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{schedule.criticalPathDuration} hrs</div>
          <div className="text-sm text-gray-500 mt-1">Minimum completion time</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex gap-1 p-1">
            <button
              onClick={() => setActiveTab('details')}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'details'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Settings className="w-4 h-4" />
                Schedule Details
              </div>
            </button>
            <button
              onClick={() => setActiveTab('resources')}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'resources'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Users className="w-4 h-4" />
                Resource Allocation
              </div>
            </button>
            <button
              onClick={() => setActiveTab('timeline')}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'timeline'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Timeline View
              </div>
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Schedule Details Tab */}
          {activeTab === 'details' && (
            <div className="space-y-3">
              {/* Schedule Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-blue-600" />
                  Schedule Information
                </h3>
                <div className="grid grid-cols-3 gap-3 bg-gray-50 rounded-lg p-3">
                  <div>
                    <label className="text-sm text-gray-600">Schedule ID</label>
                    <p className="text-gray-900 font-medium mt-1">{schedule.scheduleNumber}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Created By</label>
                    <p className="text-gray-900 font-medium mt-1">{schedule.createdBy}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Planning Horizon</label>
                    <p className="text-gray-900 font-medium mt-1">{schedule.planningHorizon} days</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Date Range</label>
                    <p className="text-gray-900 font-medium mt-1">
                      {formatDate(schedule.startDate)} - {formatDate(schedule.endDate)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Scheduling Method</label>
                    <p className="text-gray-900 font-medium mt-1">{schedule.schedulingMethod}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Capacity Type</label>
                    <p className="text-gray-900 font-medium mt-1">{schedule.capacityType}</p>
                  </div>
                  <div className="col-span-3">
                    <label className="text-sm text-gray-600">Optimization Criteria</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {schedule.optimizationCriteria.map((criteria, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                        >
                          {criteria}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Work Orders Included */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-purple-600" />
                  Work Orders Included ({schedule.workOrders.length})
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                          WO Number
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                          Product
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                          Quantity
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                          Work Center
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                          Planned Start
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                          Planned End
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                          Actual Start
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                          Slack
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {schedule.workOrders.map((wo) => (
                        <tr
                          key={wo.id}
                          className={`hover:bg-gray-50 ${wo.isCriticalPath ? 'bg-blue-50' : ''}`}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {wo.isCriticalPath && (
                                <Zap className="w-4 h-4 text-blue-600" />
                              )}
                              <span className="font-medium text-gray-900">{wo.woNumber}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              <div className="font-medium text-gray-900">{wo.productName}</div>
                              <div className="text-sm text-gray-500">{wo.productCode}</div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-900">{wo.quantity.toLocaleString()}</td>
                          <td className="px-4 py-3 text-gray-900">{wo.workCenter}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {formatDateTime(wo.plannedStartDate)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {formatDateTime(wo.plannedEndDate)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {wo.actualStartDate ? formatDateTime(wo.actualStartDate) : '-'}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                                wo.status
                              )}`}
                            >
                              {getStatusIcon(wo.status)}
                              {wo.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-1 rounded text-sm font-medium ${
                                wo.slackTime === 0
                                  ? 'bg-red-100 text-red-800'
                                  : wo.slackTime < 8
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-green-100 text-green-800'
                              }`}
                            >
                              {wo.slackTime}h
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Constraints Applied */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Target className="w-5 h-5 text-orange-600" />
                  Constraints Applied
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {schedule.constraints.map((constraint, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-lg border-2 ${
                        constraint.applied
                          ? 'bg-green-50 border-green-200'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {constraint.applied ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-400 mt-0.5" />
                        )}
                        <div>
                          <h4 className="font-medium text-gray-900">{constraint.type}</h4>
                          <p className="text-sm text-gray-600 mt-1">{constraint.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Resource Allocation Tab */}
          {activeTab === 'resources' && (
            <div className="space-y-3">
              {/* Resource Allocation Summary */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Factory className="w-5 h-5 text-blue-600" />
                  Work Center Allocation
                </h3>

                {isLoading && (
                  <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
                    Loading resource allocations…
                  </div>
                )}
                {loadError && !isLoading && (
                  <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <AlertCircle className="h-4 w-4" />
                    {loadError}
                  </div>
                )}
                {!isLoading && !loadError && resourceAllocations.length === 0 && (
                  <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
                    No resource allocations found.
                  </div>
                )}

                {resourceAllocations.map((resource, idx) => (
                  <div key={idx} className="mb-3 bg-white border border-gray-200 rounded-lg overflow-hidden">
                    {/* Work Center Header */}
                    <div
                      className={`p-4 ${
                        resource.overloaded ? 'bg-red-50 border-b border-red-200' : 'bg-gray-50 border-b border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            {resource.workCenter}
                            <span className="text-sm font-normal text-gray-500">({resource.workCenterCode})</span>
                          </h4>
                          {resource.overloaded && (
                            <div className="flex items-center gap-1 text-sm text-red-600 mt-1">
                              <AlertCircle className="w-4 h-4" />
                              Overloaded - Immediate action required
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">
                            {resource.utilization.toFixed(1)}%
                          </div>
                          <div className="text-sm text-gray-500">
                            {resource.allocatedHours}h / {resource.availableHours}h
                          </div>
                        </div>
                      </div>

                      {/* Utilization Bar */}
                      <div className="mt-3">
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              resource.utilization > 100
                                ? 'bg-red-600'
                                : resource.utilization >= 90
                                ? 'bg-orange-500'
                                : resource.utilization >= 75
                                ? 'bg-green-500'
                                : 'bg-blue-500'
                            }`}
                            style={{ width: `${Math.min(resource.utilization, 100)}%` }}
                          />
                        </div>
                      </div>

                      {/* Conflicts */}
                      {resource.conflicts.length > 0 && (
                        <div className="mt-3 space-y-1">
                          {resource.conflicts.map((conflict, cIdx) => (
                            <div key={cIdx} className="flex items-center gap-2 text-sm text-red-700 bg-red-100 px-3 py-2 rounded">
                              <AlertTriangle className="w-4 h-4" />
                              {conflict}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Machine Assignments */}
                    <div className="p-4 border-b border-gray-200">
                      <h5 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                        <Wrench className="w-4 h-4 text-gray-600" />
                        Machine Assignments
                      </h5>
                      <div className="space-y-3">
                        {resource.machineAssignments.map((machine, mIdx) => (
                          <div key={mIdx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">{machine.machineName}</div>
                              <div className="text-sm text-gray-600 mt-1">
                                {machine.workOrders.length} work order(s): {machine.workOrders.join(', ')}
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span
                                className={`px-3 py-1 rounded-full text-sm font-medium ${
                                  machine.status === 'overloaded'
                                    ? 'bg-red-100 text-red-800'
                                    : machine.status === 'allocated'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {machine.utilizationPercent}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Labor Assignments */}
                    <div className="p-4 border-b border-gray-200">
                      <h5 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-gray-600" />
                        Labor Assignments
                      </h5>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-200">
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase">
                                Employee
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase">
                                Role
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase">
                                Shift
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase">
                                Hours
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase">
                                Work Orders
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {resource.laborAssignments.map((labor, lIdx) => (
                              <tr key={lIdx} className="hover:bg-gray-50">
                                <td className="px-3 py-2 text-gray-900">{labor.employeeName}</td>
                                <td className="px-3 py-2 text-gray-600">{labor.role}</td>
                                <td className="px-3 py-2">
                                  <div className="flex items-center gap-1">
                                    {getShiftIcon(labor.shift)}
                                    <span className="text-gray-700">{labor.shift}</span>
                                  </div>
                                </td>
                                <td className="px-3 py-2 text-gray-900 font-medium">{labor.assignedHours}h</td>
                                <td className="px-3 py-2 text-sm text-gray-600">
                                  {labor.workOrders.join(', ')}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Shift Allocation */}
                    <div className="p-4">
                      <h5 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-600" />
                        Shift Allocation
                      </h5>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Sunrise className="w-4 h-4 text-yellow-600" />
                            <span className="font-medium text-gray-900">Morning Shift</span>
                          </div>
                          <div className="text-2xl font-bold text-gray-900">
                            {resource.shiftAllocation.morning.hours}h
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {resource.shiftAllocation.morning.workOrders} work orders
                          </div>
                        </div>

                        <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Sun className="w-4 h-4 text-orange-600" />
                            <span className="font-medium text-gray-900">Afternoon Shift</span>
                          </div>
                          <div className="text-2xl font-bold text-gray-900">
                            {resource.shiftAllocation.afternoon.hours}h
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {resource.shiftAllocation.afternoon.workOrders} work orders
                          </div>
                        </div>

                        <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Moon className="w-4 h-4 text-indigo-600" />
                            <span className="font-medium text-gray-900">Night Shift</span>
                          </div>
                          <div className="text-2xl font-bold text-gray-900">
                            {resource.shiftAllocation.night.hours}h
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {resource.shiftAllocation.night.workOrders} work orders
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timeline View Tab */}
          {activeTab === 'timeline' && (
            <div className="space-y-3">
              {/* Gantt Controls */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="showDependencies"
                      checked={showDependencies}
                      onChange={(e) => setShowDependencies(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <label htmlFor="showDependencies" className="text-sm text-gray-700">
                      Show Dependencies
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="showCriticalPath"
                      checked={showCriticalPath}
                      onChange={(e) => setShowCriticalPath(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <label htmlFor="showCriticalPath" className="text-sm text-gray-700">
                      Highlight Critical Path
                    </label>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-700">Zoom:</label>
                  <select
                    value={ganttZoom}
                    onChange={(e) => setGanttZoom(e.target.value as 'day' | 'week' | 'month')}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="day">Day</option>
                    <option value="week">Week</option>
                    <option value="month">Month</option>
                  </select>
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span className="text-sm text-gray-700">Critical Path</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                  <span className="text-sm text-gray-700">In Progress</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-sm text-gray-700">Completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-400 rounded"></div>
                  <span className="text-sm text-gray-700">Scheduled</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span className="text-sm text-gray-700">Delayed</span>
                </div>
              </div>

              {/* Gantt Chart */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  {/* Timeline Header */}
                  <div className="flex border-b border-gray-200">
                    <div className="w-64 flex-shrink-0 p-3 bg-gray-50 border-r border-gray-200">
                      <span className="text-sm font-medium text-gray-700">Work Order</span>
                    </div>
                    <div className="flex-1 flex">
                      {timeline.map((date, idx) => (
                        <div
                          key={idx}
                          className={`flex-1 p-3 text-center border-r border-gray-200 ${
                            isToday(date) ? 'bg-blue-50' : 'bg-gray-50'
                          }`}
                        >
                          <div className="text-xs font-medium text-gray-700">
                            {date.toLocaleDateString('en-IN', { weekday: 'short' })}
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            {date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Gantt Bars */}
                  <div className="divide-y divide-gray-200">
                    {ganttData.map((bar) => {
                      const position = calculateBarPosition(bar.startDate, bar.endDate);
                      return (
                        <div key={bar.id} className="flex hover:bg-gray-50">
                          <div className="w-64 flex-shrink-0 p-3 border-r border-gray-200">
                            <div className="flex items-center gap-2">
                              {bar.isCriticalPath && showCriticalPath && (
                                <Zap className="w-4 h-4 text-blue-600" />
                              )}
                              <div>
                                <div className="font-medium text-gray-900 text-sm">{bar.woNumber}</div>
                                <div className="text-xs text-gray-600">{bar.productName}</div>
                                <div className="text-xs text-gray-500 mt-1">{bar.workCenter}</div>
                              </div>
                            </div>
                          </div>
                          <div className="flex-1 relative p-3">
                            <div className="relative h-8">
                              <div
                                className={`absolute top-0 h-full ${bar.color} rounded ${
                                  bar.isCriticalPath && showCriticalPath ? 'ring-2 ring-blue-600 ring-offset-2' : ''
                                }`}
                                style={position}
                              >
                                <div className="h-full relative">
                                  {bar.progress > 0 && (
                                    <div
                                      className="h-full bg-white bg-opacity-40 rounded-l"
                                      style={{ width: `${bar.progress}%` }}
                                    ></div>
                                  )}
                                  <div className="absolute inset-0 flex items-center justify-center px-2">
                                    <span className="text-xs font-medium text-white truncate">
                                      {bar.progress > 0 ? `${Math.round(bar.progress)}%` : ''}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Today Marker */}
                  <div className="relative pointer-events-none">
                    {timeline.map((date, idx) => {
                      if (isToday(date)) {
                        const left = (idx / timeline.length) * 100;
                        return (
                          <div
                            key={idx}
                            className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
                            style={{ left: `calc(16rem + ${left}%)` }}
                          >
                            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap">
                              Today
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              </div>

              {/* Milestones & Bottlenecks */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Flag className="w-5 h-5 text-green-600" />
                    Key Milestones
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <div className="font-medium text-gray-900">Phase 1 Complete</div>
                        <div className="text-sm text-gray-600">6 work orders completed</div>
                        <div className="text-xs text-gray-500 mt-1">April 15, 2025</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <Activity className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <div className="font-medium text-gray-900">Phase 2 In Progress</div>
                        <div className="text-sm text-gray-600">12 work orders active</div>
                        <div className="text-xs text-gray-500 mt-1">Expected: April 18, 2025</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <Circle className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <div className="font-medium text-gray-900">Final Delivery</div>
                        <div className="text-sm text-gray-600">All orders shipped</div>
                        <div className="text-xs text-gray-500 mt-1">Target: April 20, 2025</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                    Bottleneck Identification
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <TrendingDown className="w-5 h-5 text-red-600 mt-0.5" />
                      <div>
                        <div className="font-medium text-gray-900">Assembly Line 3 Overloaded</div>
                        <div className="text-sm text-gray-600">104.8% capacity utilization</div>
                        <div className="text-xs text-red-600 mt-1">Action: Reschedule or add overtime</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div>
                        <div className="font-medium text-gray-900">Material Constraint</div>
                        <div className="text-sm text-gray-600">3 work orders waiting for raw material</div>
                        <div className="text-xs text-yellow-600 mt-1">Expected delivery: April 16</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <Wrench className="w-5 h-5 text-orange-600 mt-0.5" />
                      <div>
                        <div className="font-medium text-gray-900">Equipment Maintenance</div>
                        <div className="text-sm text-gray-600">Machine M-003 scheduled maintenance</div>
                        <div className="text-xs text-orange-600 mt-1">Planned: April 17, 14:00-18:00</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
