'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  Plus,
  CheckSquare,
  Clock,
  Calendar,
  User,
  AlertCircle,
  CheckCircle,
  Filter,
  Eye,
  Edit,
  Users,
  RefreshCw,
  FolderTree,
  Link2,
  MessageSquare,
  Paperclip,
  Bell,
  Copy,
  FolderInput,
  Trash2,
  MoreHorizontal,
  LayoutGrid,
  List as ListIcon,
  ArrowUpRight,
  ChevronDown,
  GripVertical
} from 'lucide-react';
import {
  CreateTaskModal,
  EditTaskModal,
  AssignTaskModal,
  UpdateStatusModal,
  AddSubtasksModal,
  AddDependenciesModal,
  AddCommentsModal,
  UploadAttachmentsModal,
  SetReminderModal,
  CloneTaskModal,
  MoveTaskModal,
  DeleteTaskModal,
  FilterTasksModal,
  BulkUpdateModal,
  ViewDetailsModal,
} from '@/components/project-management/TasksModals';
import { projectManagementService, Project, ProjectTask } from '@/services/ProjectManagementService';

interface Task {
  id: string;
  taskNumber: string;
  taskName: string;
  projectNumber: string;
  projectName: string;
  deliverable: string;
  assignedTo: string;
  startDate: string;
  dueDate: string;
  completedDate?: string;
  status: 'To Do' | 'In Progress' | 'Review' | 'Completed' | 'Blocked';
  priority: 'High' | 'Medium' | 'Low' | 'Critical';
  progress: number;
  estimatedHours: number;
  actualHours: number;
  dependencies: string[];
  avatar?: string; // Initials
}

type ViewMode = 'list' | 'board';
type GroupBy = 'status' | 'priority' | 'assignee';

export default function TasksListPage() {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('list'); // Default to list view
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Initial Load — fetch projects and their tasks from the live backend, then
  // defensively map the raw ProjectTask/ORM shape onto this page's Task model.
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const rawProjects = (await projectManagementService.getProjects()) as any[];
        const projectList: Project[] = [
          { id: 'all', name: 'All Projects', clientName: '', status: '', priority: '', progress: 0, budgetAllocated: 0, budgetSpent: 0 },
          ...rawProjects.map((p) => ({
            id: p.id,
            name: p.name ?? p.projectName ?? p.id,
            clientName: p.clientName ?? '',
            status: p.status ?? '',
            priority: p.priority ?? '',
            progress: Number(p.progress ?? 0),
            budgetAllocated: Number(p.budgetAllocated ?? 0),
            budgetSpent: Number(p.budgetSpent ?? 0),
          })),
        ];

        const projName = new Map<string, string>(
          rawProjects.map((p) => [p.id, p.name ?? p.projectName ?? p.id]),
        );
        const projCode = new Map<string, string>(
          rawProjects.map((p) => [p.id, p.projectCode ?? p.id]),
        );

        const taskLists = await Promise.all(
          rawProjects.map((p) =>
            projectManagementService
              .getTasks(p.id)
              .catch(() => [] as ProjectTask[]),
          ),
        );
        const rawTasks = taskLists.flat() as any[];

        const initials = (name: string) =>
          (name || '')
            .split(' ')
            .map((w) => w[0])
            .filter(Boolean)
            .slice(0, 2)
            .join('')
            .toUpperCase();

        const mapped: Task[] = rawTasks.map((t) => {
          const assignee = Array.isArray(t.assignedTo)
            ? (t.assignedToNames?.[0] ?? t.assignedTo[0] ?? '')
            : (t.assignedTo ?? t.assignee ?? '');
          const pid = t.projectId;
          return {
            id: t.id,
            taskNumber: t.taskNumber ?? t.id,
            taskName: t.name ?? t.taskName ?? '',
            projectNumber: projCode.get(pid) ?? pid ?? '',
            projectName: projName.get(pid) ?? '',
            deliverable: t.deliverable ?? '',
            assignedTo: String(assignee),
            startDate: t.startDate ?? '',
            dueDate: t.endDate ?? t.dueDate ?? '',
            completedDate: t.completedDate,
            status: (t.status ?? 'To Do') as Task['status'],
            priority: (t.priority ?? 'Medium') as Task['priority'],
            progress: Number(t.progress ?? 0),
            estimatedHours: Number(t.estimatedHours ?? 0),
            actualHours: Number(t.actualHours ?? 0),
            dependencies: Array.isArray(t.dependencies) ? t.dependencies : [],
            avatar: initials(String(assignee)),
          };
        });

        if (!cancelled) {
          setProjects(projectList);
          setTasks(mapped);
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load tasks');
          setTasks([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesProject = selectedProjectId === 'all' || task.projectNumber === selectedProjectId;
      const matchesSearch = task.taskName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.taskNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All' || task.status === statusFilter;
      const matchesPriority = priorityFilter === 'All' || task.priority === priorityFilter;

      return matchesProject && matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tasks, selectedProjectId, searchTerm, statusFilter, priorityFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'In Progress': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Review': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'To Do': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'Blocked': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'High': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Medium': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Low': return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const renderListView = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <th className="px-3 py-2">Task</th>
              <th className="px-3 py-2">Status & Priority</th>
              <th className="px-3 py-2">Assignee</th>
              <th className="px-3 py-2">Project</th>
              <th className="px-3 py-2">Due Date</th>
              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => (
                <tr key={task.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-3 py-2">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{task.taskName}</span>
                      <span className="text-xs text-gray-500">{task.taskNumber}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold border border-blue-200">
                        {task.avatar}
                      </div>
                      <span className="text-sm text-gray-700">{task.assignedTo}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-900 truncate max-w-[150px]" title={task.projectName}>{task.projectName}</span>
                      <span className="text-xs text-gray-500">{task.projectNumber}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <span className="text-sm text-gray-600">
                      {new Date(task.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center gap-2">
                    <Search className="w-8 h-8 text-gray-300" />
                    <p>No tasks found matching your filters.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderKanbanColumn = (status: string, title: string, colorClass: string) => {
    const columnTasks = filteredTasks.filter(t => t.status === status);

    return (
      <div className="flex flex-col min-w-[320px] bg-gray-50 rounded-xl p-3 border border-gray-200 h-[calc(100vh-280px)]">
        <div className={`flex items-center justify-between mb-2 pb-3 border-b border-gray-200 ${colorClass}`}>
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            {title}
            <span className="bg-white px-2 py-0.5 rounded-md text-xs border border-gray-200 shadow-sm">
              {columnTasks.length}
            </span>
          </h3>
          <button className="text-gray-400 hover:text-gray-600">
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-hide">
          {columnTasks.map(task => (
            <div key={task.id} className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer group">
              <div className="flex justify-between items-start mb-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase border ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
                <button className="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>

              <h4 className="font-medium text-gray-900 mb-1 leading-snug">{task.taskName}</h4>
              <p className="text-xs text-gray-500 mb-3 line-clamp-2">{task.projectName}</p>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-[10px] font-bold border border-blue-100">
                    {task.avatar}
                  </div>
                  <span className="text-xs text-gray-600 truncate max-w-[80px]">{task.assignedTo.split(' ')[0]}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Calendar className="w-3 h-3" />
                  {new Date(task.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                </div>
              </div>
            </div>
          ))}

          {columnTasks.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-lg p-3">
              <p className="text-xs">No tasks</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderBoardView = () => (
    <div className="flex gap-3 overflow-x-auto pb-6">
      {renderKanbanColumn('To Do', 'To Do', 'text-gray-700')}
      {renderKanbanColumn('In Progress', 'In Progress', 'text-blue-700')}
      {renderKanbanColumn('Review', 'Review', 'text-purple-700')}
      {renderKanbanColumn('Blocked', 'Blocked', 'text-rose-700')}
      {renderKanbanColumn('Completed', 'Done', 'text-emerald-700')}
    </div>
  );

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500 font-medium">Loading Tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="w-full bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="w-full px-3 py-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Task Management</h1>
              <p className="text-sm text-gray-500 mt-1">Track, manage, and deliver deliverables across all projects.</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all font-medium shadow-sm hover:shadow"
              >
                <Plus className="w-4 h-4" />
                Create Task
              </button>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="mt-6 flex flex-col md:flex-row gap-2 items-center justify-between">
            <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              {/* View Toggle */}
              <div className="flex items-center p-1 bg-gray-100 rounded-lg border border-gray-200">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  title="List View"
                >
                  <ListIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('board')}
                  className={`p-1.5 rounded-md transition-all ${viewMode === 'board' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  title="Board View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>

              <div className="h-6 w-px bg-gray-300 mx-1" />

              {/* Project Filter */}
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[180px]"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id || 'all'}>{p.name}</option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Status</option>
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Review">Review</option>
                <option value="Blocked">Blocked</option>
                <option value="Completed">Completed</option>
              </select>

              {/* Priority Filter */}
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Priority</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full px-3 py-2 overflow-hidden">
        {loadError && (
          <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="w-4 h-4" />
            {loadError}
          </div>
        )}
        {viewMode === 'list' ? renderListView() : renderBoardView()}
      </div>

      {/* Modals Support - Keeping just the create for now as logic remains same */}
      <CreateTaskModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={(data: { taskName: string; projectId: string; assignedTo: string; startDate: string; dueDate: string; priority: string; status: string; description: string }) => {
          console.log('Create:', data);
          setShowCreateModal(false);
        }}
      />

    </div>
  );
}

