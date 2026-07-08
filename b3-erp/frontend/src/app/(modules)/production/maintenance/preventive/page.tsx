'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ProductionOrphanService } from '@/services/production/production-orphan.service';
import { exportToCsv } from '@/lib/export';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Download,
  Filter,
  Search,
  Plus,
  Edit,
  Trash2,
  PlayCircle
} from 'lucide-react';

interface PreventiveMaintenance {
  id: string;
  equipmentCode: string;
  equipmentName: string;
  taskType: 'inspection' | 'lubrication' | 'calibration' | 'replacement' | 'cleaning';
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  lastCompleted: string;
  nextDue: string;
  estimatedDuration: number; // in hours
  assignedTo: string;
  status: 'scheduled' | 'overdue' | 'in-progress' | 'completed';
  priority: 'critical' | 'high' | 'medium' | 'low';
  checklistItems: number;
  completedItems: number;
}

export default function PreventiveMaintenancePage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterFrequency, setFilterFrequency] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTask, setEditingTask] = useState<PreventiveMaintenance | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const emptyForm = {
    equipmentCode: '',
    equipmentName: '',
    taskType: 'inspection',
    frequency: 'monthly',
    nextDue: '',
    estimatedDuration: 1,
    assignedTo: '',
    priority: 'medium',
    status: 'scheduled',
  };
  const [form, setForm] = useState<Record<string, any>>(emptyForm);

  const [maintenanceTasks, setMaintenanceTasks] = useState<PreventiveMaintenance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const raw = (await ProductionOrphanService.getPreventiveMaintenance()) as any[];
      const mapped = (Array.isArray(raw) ? raw : []).map((d: any, i: number) => ({
        ...d,
        id: String(d?.id ?? i),
      })) as unknown as PreventiveMaintenance[];
      setMaintenanceTasks(mapped);
    } catch (err: any) {
      setLoadError(err?.message ?? 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filteredTasks = maintenanceTasks.filter(task => {
    const matchesSearch =
      task.equipmentCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.equipmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesFrequency = filterFrequency === 'all' || task.frequency === filterFrequency;

    return matchesSearch && matchesStatus && matchesFrequency;
  });

  const totalTasks = maintenanceTasks.length;
  const scheduled = maintenanceTasks.filter(t => t.status === 'scheduled').length;
  const overdue = maintenanceTasks.filter(t => t.status === 'overdue').length;
  const inProgress = maintenanceTasks.filter(t => t.status === 'in-progress').length;
  const completed = maintenanceTasks.filter(t => t.status === 'completed').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTaskTypeIcon = (type: string) => {
    switch (type) {
      case 'inspection': return '🔍';
      case 'lubrication': return '🛢️';
      case 'calibration': return '⚙️';
      case 'replacement': return '🔧';
      case 'cleaning': return '🧹';
      default: return '🔧';
    }
  };

  const handleStartTask = async (task: PreventiveMaintenance) => {
    if (!confirm(`Start preventive maintenance task ${task.id} for ${task.equipmentName}?`)) return;
    setSubmitting(true);
    setActionError(null);
    try {
      await ProductionOrphanService.updatePreventiveMaintenance(task.id, { status: 'in_progress' });
      await load();
    } catch (err: any) {
      setActionError(err?.message ?? 'Failed to start task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditTask = (task: PreventiveMaintenance) => {
    setEditingTask(task);
    setForm({
      equipmentCode: task.equipmentCode ?? '',
      equipmentName: task.equipmentName ?? '',
      taskType: task.taskType ?? 'inspection',
      frequency: task.frequency ?? 'monthly',
      nextDue: task.nextDue ?? '',
      estimatedDuration: task.estimatedDuration ?? 1,
      assignedTo: task.assignedTo ?? '',
      priority: task.priority ?? 'medium',
      status: task.status ?? 'scheduled',
    });
    setShowAddModal(true);
  };

  const handleDeleteTask = async (task: PreventiveMaintenance) => {
    if (!confirm(`Delete preventive maintenance task ${task.id}?`)) return;
    setSubmitting(true);
    setActionError(null);
    try {
      await ProductionOrphanService.deletePreventiveMaintenance(task.id);
      await load();
    } catch (err: any) {
      setActionError(err?.message ?? 'Failed to delete task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleExport = () => {
    exportToCsv(
      `preventive-maintenance-${new Date().toISOString().slice(0, 10)}`,
      filteredTasks,
      [
        { key: 'id', label: 'Task ID' },
        { key: 'equipmentCode', label: 'Equipment Code' },
        { key: 'equipmentName', label: 'Equipment Name' },
        { key: 'taskType', label: 'Task Type' },
        { key: 'frequency', label: 'Frequency' },
        { key: 'lastCompleted', label: 'Last Completed' },
        { key: 'nextDue', label: 'Next Due' },
        { key: 'estimatedDuration', label: 'Duration (h)' },
        { key: 'assignedTo', label: 'Assigned To' },
        { key: 'status', label: 'Status' },
        { key: 'priority', label: 'Priority' },
      ],
    );
  };

  const handleAddNew = () => {
    setEditingTask(null);
    setForm(emptyForm);
    setShowAddModal(true);
  };

  const handleSubmitForm = async () => {
    if (!form.equipmentCode?.trim() || !form.equipmentName?.trim()) {
      setActionError('Please fill equipment code and name.');
      return;
    }
    setSubmitting(true);
    setActionError(null);
    try {
      const payload = {
        ...form,
        estimatedDuration: Number(form.estimatedDuration) || 0,
      };
      if (editingTask) {
        await ProductionOrphanService.updatePreventiveMaintenance(editingTask.id, payload);
      } else {
        await ProductionOrphanService.createPreventiveMaintenance(payload);
      }
      setShowAddModal(false);
      setEditingTask(null);
      setForm(emptyForm);
      await load();
    } catch (err: any) {
      setActionError(err?.message ?? 'Failed to save schedule');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-3 py-2">
      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading preventive maintenance…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}
      {actionError && !showAddModal && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {actionError}
        </div>
      )}
      {/* Header */}
      <div className="mb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Preventive Maintenance Schedule</h1>
            <p className="text-sm text-gray-500 mt-1">Manage scheduled maintenance tasks</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add Schedule
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{totalTasks}</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Scheduled</p>
              <p className="text-2xl font-bold text-blue-600">{scheduled}</p>
            </div>
            <Clock className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-red-600">{overdue}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-yellow-600">{inProgress}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-3 mb-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by equipment or task ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="overdue">Overdue</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={filterFrequency}
              onChange={(e) => setFilterFrequency(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="all">All Frequencies</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Task ID</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Equipment</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Task Type</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Frequency</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Last Done</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Next Due</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Assigned To</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Progress</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTasks.map((task) => (
                <tr key={task.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">{task.id}</span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-sm font-medium text-gray-900">{task.equipmentCode}</div>
                    <div className="text-sm text-gray-500">{task.equipmentName}</div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {getTaskTypeIcon(task.taskType)} {task.taskType}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className="text-sm text-gray-900 capitalize">{task.frequency}</span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{task.lastCompleted}</span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{task.nextDue}</span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{task.estimatedDuration}h</span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{task.assignedTo}</span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(task.completedItems / task.checklistItems) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600">
                        {task.completedItems}/{task.checklistItems}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {task.status === 'scheduled' && (
                        <button
                          onClick={() => handleStartTask(task)}
                          className="text-green-600 hover:text-green-900"
                          title="Start Task"
                        >
                          <PlayCircle className="w-5 h-5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleEditTask(task)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit Task"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete Task"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg p-3 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {editingTask ? `Edit Schedule ${editingTask.id}` : 'Add New Preventive Maintenance Schedule'}
            </h2>
            {actionError && (
              <div className="mb-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {actionError}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Equipment Code</label>
                <input
                  type="text"
                  value={form.equipmentCode}
                  onChange={(e) => setForm({ ...form, equipmentCode: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Equipment Name</label>
                <input
                  type="text"
                  value={form.equipmentName}
                  onChange={(e) => setForm({ ...form, equipmentName: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Task Type</label>
                <select
                  value={form.taskType}
                  onChange={(e) => setForm({ ...form, taskType: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="inspection">Inspection</option>
                  <option value="lubrication">Lubrication</option>
                  <option value="calibration">Calibration</option>
                  <option value="replacement">Replacement</option>
                  <option value="cleaning">Cleaning</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Frequency</label>
                <select
                  value={form.frequency}
                  onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Next Due</label>
                <input
                  type="date"
                  value={form.nextDue}
                  onChange={(e) => setForm({ ...form, nextDue: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Est. Duration (h)</label>
                <input
                  type="number"
                  min={0}
                  value={form.estimatedDuration}
                  onChange={(e) => setForm({ ...form, estimatedDuration: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Assigned To</label>
                <input
                  type="text"
                  value={form.assignedTo}
                  onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Priority</label>
                <select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => { setShowAddModal(false); setEditingTask(null); setActionError(null); }}
                disabled={submitting}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitForm}
                disabled={submitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? 'Saving…' : editingTask ? 'Save Changes' : 'Create Schedule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
