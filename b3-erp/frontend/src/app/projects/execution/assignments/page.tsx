'use client';

import { useEffect, useMemo, useState } from 'react';
import { UserPlus, Search, Filter, PlusCircle, Users, Calendar, Clock, AlertTriangle, CheckCircle2, User } from 'lucide-react';
import { projectManagementService } from '@/services/ProjectManagementService';

type Assignment = {
  id: string;
  assignmentNumber: string;
  taskCode: string;
  taskName: string;
  projectCode: string;
  projectName: string;
  resourceName: string;
  resourceRole: string;
  department: string;
  assignedBy: string;
  assignedDate: string;
  startDate: string;
  endDate: string;
  estimatedHours: number;
  actualHours: number;
  status: 'assigned' | 'in-progress' | 'completed' | 'on-hold' | 'reassigned';
  priority: 'critical' | 'high' | 'medium' | 'low';
  utilizationPercent: number;
  notes: string;
};

const ALLOWED_STATUSES: Assignment['status'][] = ['assigned', 'in-progress', 'completed', 'on-hold', 'reassigned'];
const ALLOWED_PRIORITIES: Assignment['priority'][] = ['critical', 'high', 'medium', 'low'];

function mapAssignment(a: any, index: number): Assignment {
  const rawStatus = String(a?.status ?? '').toLowerCase();
  const status = (ALLOWED_STATUSES.includes(rawStatus as Assignment['status'])
    ? rawStatus
    : 'assigned') as Assignment['status'];
  const rawPriority = String(a?.priority ?? '').toLowerCase();
  const priority = (ALLOWED_PRIORITIES.includes(rawPriority as Assignment['priority'])
    ? rawPriority
    : 'medium') as Assignment['priority'];

  return {
    id: String(a?.id ?? a?.resourceId ?? a?.userId ?? index),
    assignmentNumber: String(a?.assignmentNumber ?? a?.code ?? a?.id ?? `ASG-${index + 1}`),
    taskCode: String(a?.taskCode ?? a?.taskId ?? ''),
    taskName: String(a?.taskName ?? a?.task ?? ''),
    projectCode: String(a?.projectCode ?? a?.projectId ?? ''),
    projectName: String(a?.projectName ?? a?.project ?? ''),
    resourceName: String(a?.resourceName ?? a?.assignee ?? a?.userName ?? ''),
    resourceRole: String(a?.resourceRole ?? a?.role ?? ''),
    department: String(a?.department ?? ''),
    assignedBy: String(a?.assignedBy ?? ''),
    assignedDate: String(a?.assignedDate ?? ''),
    startDate: String(a?.startDate ?? ''),
    endDate: String(a?.endDate ?? ''),
    estimatedHours: Number(a?.estimatedHours ?? 0) || 0,
    actualHours: Number(a?.actualHours ?? 0) || 0,
    status,
    priority,
    utilizationPercent: Number(a?.utilizationPercent ?? a?.allocationPercentage ?? 0) || 0,
    notes: String(a?.notes ?? '')
  };
}

export default function TaskAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'assigned' | 'in-progress' | 'completed' | 'on-hold' | 'reassigned'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');
  const [deptFilter, setDeptFilter] = useState<string>('all');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = await projectManagementService.getProjectsResourcesList();
        const mapped = Array.isArray(raw) ? raw.map((a: any, i: number) => mapAssignment(a, i)) : [];
        if (!cancelled) setAssignments(mapped);
      } catch (e) {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : 'Failed to load');
          setAssignments([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const departments = useMemo(
    () => ['all', ...Array.from(new Set(assignments.map(a => a.department).filter(Boolean)))],
    [assignments]
  );

  const filtered = useMemo(() => {
    return assignments.filter(a => {
      const matchesSearch = [
        a.assignmentNumber,
        a.taskCode,
        a.taskName,
        a.resourceName,
        a.resourceRole,
        a.projectName,
        a.projectCode,
        a.department
      ].some(v => v.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = statusFilter === 'all' ? true : a.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' ? true : a.priority === priorityFilter;
      const matchesDept = deptFilter === 'all' ? true : a.department === deptFilter;
      return matchesSearch && matchesStatus && matchesPriority && matchesDept;
    });
  }, [assignments, searchTerm, statusFilter, priorityFilter, deptFilter]);

  // Calculate stats (derived from fetched state, guarded for empty)
  const totalAssignments = assignments.length;
  const activeAssignments = assignments.filter(a => a.status === 'in-progress' || a.status === 'assigned').length;
  const completedAssignments = assignments.filter(a => a.status === 'completed').length;
  const totalEstimated = assignments.reduce((sum, a) => sum + a.estimatedHours, 0);
  const totalActual = assignments.reduce((sum, a) => sum + a.actualHours, 0);
  const avgUtilization = assignments.length
    ? Math.round(assignments.reduce((sum, a) => sum + a.utilizationPercent, 0) / assignments.length)
    : 0;

  return (
    <div className="p-6">
      <div className="mb-3">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <UserPlus className="h-8 w-8 text-teal-600" />
          Task Assignments
        </h1>
        <p className="text-gray-600 mt-2">Assign and manage resource allocation to project tasks</p>
      </div>

      {/* Action Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex flex-col md:flex-row gap-2 justify-between">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search assignments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter className="h-4 w-4" />
              Filter
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
              <PlusCircle className="h-4 w-4" />
              New Assignment
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-2 mb-3">
        <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg p-3 border border-teal-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-teal-600 text-sm font-medium">Total Assignments</p>
              <p className="text-3xl font-bold text-teal-900 mt-1">{totalAssignments}</p>
            </div>
            <UserPlus className="h-12 w-12 text-teal-600 opacity-50" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Active</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">{activeAssignments}</p>
            </div>
            <Users className="h-12 w-12 text-blue-600 opacity-50" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Completed</p>
              <p className="text-3xl font-bold text-green-900 mt-1">{completedAssignments}</p>
            </div>
            <CheckCircle2 className="h-12 w-12 text-green-600 opacity-50" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">Estimated Hours</p>
              <p className="text-3xl font-bold text-purple-900 mt-1">{totalEstimated}</p>
            </div>
            <Clock className="h-12 w-12 text-purple-600 opacity-50" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 text-sm font-medium">Actual Hours</p>
              <p className="text-3xl font-bold text-orange-900 mt-1">{totalActual}</p>
            </div>
            <Clock className="h-12 w-12 text-orange-600 opacity-50" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-3 border border-indigo-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-600 text-sm font-medium">Avg Utilization</p>
              <p className="text-3xl font-bold text-indigo-900 mt-1">{avgUtilization}%</p>
            </div>
            <Users className="h-12 w-12 text-indigo-600 opacity-50" />
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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="all">All Status</option>
            <option value="assigned">Assigned</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="on-hold">On Hold</option>
            <option value="reassigned">Reassigned</option>
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            {departments.map(d => (
              <option key={d} value={d}>{d === 'all' ? 'All Departments' : d}</option>
            ))}
          </select>
          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setPriorityFilter('all');
              setDeptFilter('all');
            }}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Assignments table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Assignment</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Task</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Resource</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Project</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Duration</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Effort</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Utilization</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Priority</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filtered.map(a => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">{a.assignmentNumber}</span>
                      <span className="text-xs text-gray-500">by {a.assignedBy}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-800">{a.taskName}</span>
                      <span className="text-xs text-gray-500">{a.taskCode}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">{a.resourceName}</span>
                        <span className="text-xs text-gray-500">{a.resourceRole} • {a.department}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    <div className="flex flex-col">
                      <span className="font-medium">{a.projectName}</span>
                      <span className="text-xs text-gray-500">{a.projectCode}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <div className="flex flex-col">
                        <span className="text-xs">{a.startDate}</span>
                        <span className="text-xs text-gray-500">to {a.endDate}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col text-sm">
                      <span className="text-gray-900">{a.actualHours}h / {a.estimatedHours}h</span>
                      <span className="text-xs text-gray-500">
                        {a.estimatedHours > 0 ? Math.round((a.actualHours / a.estimatedHours) * 100) : 0}% complete
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="w-32">
                      <div className="h-2 w-full bg-gray-100 rounded">
                        <div
                          className={`h-2 rounded ${
                            a.utilizationPercent >= 85
                              ? 'bg-green-600'
                              : a.utilizationPercent >= 50
                              ? 'bg-blue-600'
                              : 'bg-yellow-500'
                          }`}
                          style={{ width: `${Math.min(a.utilizationPercent, 100)}%` }}
                        />
                      </div>
                      <div className="mt-1 text-xs text-gray-600">{a.utilizationPercent}%</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        a.priority === 'critical'
                          ? 'bg-red-50 text-red-700'
                          : a.priority === 'high'
                          ? 'bg-orange-50 text-orange-700'
                          : a.priority === 'medium'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {a.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        a.status === 'completed'
                          ? 'bg-green-50 text-green-700'
                          : a.status === 'in-progress'
                          ? 'bg-blue-50 text-blue-700'
                          : a.status === 'on-hold'
                          ? 'bg-yellow-50 text-yellow-700'
                          : a.status === 'reassigned'
                          ? 'bg-purple-50 text-purple-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {a.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                    {isLoading
                      ? 'Loading assignments...'
                      : loadError
                      ? `Failed to load assignments: ${loadError}`
                      : 'No assignments found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Guidelines */}
      <div className="mt-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-blue-600" />
          Resource Assignment Guidelines
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-700">
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Assignment Best Practices:</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>Match resource skills to task requirements</li>
              <li>Consider current workload before assignment</li>
              <li>Set realistic effort estimates</li>
              <li>Communicate clearly with resources</li>
              <li>Monitor utilization levels (target 70-85%)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Utilization Guidelines:</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>0-50%: Under-utilized, can take more work</li>
              <li>50-70%: Good utilization, room for flexibility</li>
              <li>70-85%: Optimal utilization range</li>
              <li>85-100%: High utilization, monitor for burnout</li>
              <li>&gt;100%: Over-allocated, reassign or reschedule</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
