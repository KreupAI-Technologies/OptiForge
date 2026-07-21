'use client';

import { useState, useEffect } from 'react';
import { Clock, Play, Pause, Calendar, AlertCircle, CheckCircle2, XCircle, RefreshCw, Plus, Edit, Trash2, Eye, Filter, Download, X, BarChart3, TrendingUp } from 'lucide-react';
import { exportToCsv } from '@/lib/export';
import { ItAdminService } from '@/services/it-admin.service';

interface ScheduledJob {
  id: string;
  name: string;
  description: string;
  type: string;
  schedule: string;
  cronExpression: string;
  status: string;
  lastRun?: string;
  lastRunStatus?: string;
  nextRun: string;
  duration?: string;
  successRate: number;
  totalRuns: number;
  failedRuns: number;
  enabled: boolean;
  priority: string;
  createdBy: string;
  createdAt: string;
}

interface JobStats {
  totalJobs: number;
  activeJobs: number;
  pausedJobs: number;
  completedToday: number;
  failedToday: number;
  scheduledNext: number;
}

const SchedulerJobsPage = () => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJob, setSelectedJob] = useState<ScheduledJob | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const [jobs, setJobs] = useState<ScheduledJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadJobs = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const raw = await ItAdminService.getScheduledJobs();
      const mapped: ScheduledJob[] = (Array.isArray(raw) ? raw : []).map((j) => ({
        id: String(j.id),
        name: j.name ?? '',
        description: j.description ?? '',
        type: j.type ?? 'Custom',
        schedule: j.schedule ?? '',
        cronExpression: j.cronExpression ?? '',
        status: j.status ?? 'Active',
        lastRun: j.lastRun ?? undefined,
        lastRunStatus: j.lastRunStatus ?? undefined,
        nextRun: j.nextRun ?? '',
        duration: j.duration ?? undefined,
        successRate: Number(j.successRate ?? 0),
        totalRuns: Number(j.totalRuns ?? 0),
        failedRuns: Number(j.failedRuns ?? 0),
        enabled: j.enabled ?? true,
        priority: j.priority ?? 'Medium',
        createdBy: j.createdBy ?? '',
        createdAt: j.createdAt ?? '',
      }));
      setJobs(mapped);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load scheduled jobs');
      setJobs([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const emptyForm = {
    name: '',
    description: '',
    type: 'Custom',
    schedule: '',
    cronExpression: '',
    priority: 'Medium',
    enabled: true,
  };
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);


  const stats: JobStats = {
    totalJobs: jobs.length,
    activeJobs: jobs.filter(j => j.enabled && j.status === 'Active').length,
    pausedJobs: jobs.filter(j => !j.enabled || j.status === 'Paused').length,
    completedToday: jobs.filter(j => j.lastRunStatus === 'Success').length,
    failedToday: jobs.filter(j => j.lastRunStatus === 'Failed').length,
    scheduledNext: jobs.filter(j => j.enabled).length,
  };

  const filteredJobs = jobs.filter(job => {
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && job.enabled) ||
                         (filterStatus === 'paused' && !job.enabled);
    const matchesType = filterType === 'all' || job.type === filterType;
    const matchesSearch = job.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesType && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    return status === 'Active' 
      ? 'bg-green-100 text-green-800'
      : 'bg-gray-100 text-gray-800';
  };

  const getLastRunStatusColor = (status?: string) => {
    switch (status) {
      case 'Success':
        return 'bg-green-100 text-green-800';
      case 'Failed':
        return 'bg-red-100 text-red-800';
      case 'Warning':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getLastRunStatusIcon = (status?: string) => {
    switch (status) {
      case 'Success':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'Failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'Warning':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return 'text-red-600';
      case 'High':
        return 'text-orange-600';
      case 'Medium':
        return 'text-yellow-600';
      case 'Low':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const handleRunNow = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    setToast({ message: `Running "${job?.name}" immediately...`, type: 'info' });
    void (async () => {
      try {
        const updated = await ItAdminService.runScheduledJob(jobId);
        setJobs(prev =>
          prev.map(j =>
            j.id === jobId
              ? {
                  ...j,
                  lastRun: updated.lastRun ?? j.lastRun,
                  lastRunStatus: updated.lastRunStatus ?? j.lastRunStatus,
                  status: updated.status ?? j.status,
                  totalRuns: updated.totalRuns ?? j.totalRuns,
                  successRate: updated.successRate ?? j.successRate,
                }
              : j,
          ),
        );
        setToast({ message: `Job "${job?.name}" ran successfully`, type: 'success' });
      } catch {
        setToast({ message: `Failed to run "${job?.name}"`, type: 'error' });
      }
    })();
  };

  const handleToggleStatus = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    const nextEnabled = !job?.enabled;
    const nextStatus = nextEnabled ? 'Active' : 'Paused';
    setJobs(jobs.map(j =>
      j.id === jobId ? { ...j, enabled: nextEnabled, status: nextStatus } : j
    ));
    setToast({
      message: `Job "${job?.name}" ${job?.enabled ? 'paused' : 'activated'} successfully`,
      type: 'success'
    });
    void (async () => {
      try {
        await ItAdminService.updateScheduledJob(jobId, { enabled: nextEnabled, status: nextStatus });
      } catch {
        // best-effort persistence; keep optimistic UI state
      }
    })();
  };

  const handleViewDetails = (job: ScheduledJob) => {
    setSelectedJob(job);
  };

  const handleCloseDetails = () => {
    setSelectedJob(null);
  };

  const handleExport = () => {
    exportToCsv('scheduled-jobs', filteredJobs as unknown as Record<string, unknown>[]);
  };

  const handleStatsCardClick = (type: string) => {
    switch (type) {
      case 'total':
        setFilterStatus('all');
        setFilterType('all');
        setToast({ message: 'Showing all jobs', type: 'info' });
        break;
      case 'active':
        setFilterStatus('active');
        setToast({ message: 'Showing active jobs', type: 'success' });
        break;
      case 'paused':
        setFilterStatus('paused');
        setToast({ message: 'Showing paused jobs', type: 'info' });
        break;
      case 'completed':
        setToast({ message: 'Showing completed jobs today', type: 'success' });
        break;
      case 'failed':
        setToast({ message: 'Showing failed jobs today', type: 'error' });
        break;
      case 'analytics':
        setShowAnalyticsModal(true);
        break;
    }
  };

  const handleCreateJob = () => {
    setEditingId(null);
    setForm(emptyForm);
    setIsModalOpen(true);
  };

  const handleEdit = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;
    setEditingId(job.id);
    setForm({
      name: job.name,
      description: job.description,
      type: job.type,
      schedule: job.schedule,
      cronExpression: job.cronExpression,
      priority: job.priority,
      enabled: job.enabled,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setToast({ message: 'Job name is required', type: 'error' });
      return;
    }
    setIsSaving(true);
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      type: form.type,
      schedule: form.schedule.trim(),
      cronExpression: form.cronExpression.trim(),
      priority: form.priority,
      enabled: form.enabled,
      status: form.enabled ? 'Active' : 'Paused',
    };
    try {
      if (editingId) {
        await ItAdminService.updateScheduledJob(editingId, payload);
        setToast({ message: 'Job updated', type: 'success' });
      } else {
        await ItAdminService.createScheduledJob(payload);
        setToast({ message: 'Job created', type: 'success' });
      }
      setIsModalOpen(false);
      await loadJobs();
    } catch (err) {
      setToast({ message: err instanceof Error ? err.message : 'Failed to save job', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;
    if (!confirm(`Delete scheduled job "${job.name}"?`)) return;
    try {
      await ItAdminService.deleteScheduledJob(jobId);
      setToast({ message: `Job "${job.name}" deleted`, type: 'success' });
      await loadJobs();
    } catch (err) {
      setToast({ message: err instanceof Error ? err.message : 'Failed to delete job', type: 'error' });
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-gray-50 via-indigo-50 to-blue-50">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg ${
          toast.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
          toast.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
          'bg-blue-50 text-blue-800 border border-blue-200'
        }`}>
          {toast.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
          {toast.type === 'error' && <XCircle className="w-5 h-5" />}
          {toast.type === 'info' && <AlertCircle className="w-5 h-5" />}
          <span className="font-medium">{toast.message}</span>
        </div>
      )}

      {/* Header Section */}
      <div className="flex-none p-3 pb-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Clock className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Scheduled Jobs</h1>
              <p className="text-gray-600">Manage automated tasks and schedules</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleCreateJob}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-indigo-300 text-indigo-700 rounded-lg hover:bg-indigo-50 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Job
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-2">
        <button
          onClick={() => handleStatsCardClick('total')}
          className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-3 hover:border-blue-500 hover:shadow-lg transition-all text-left"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Total Jobs</span>
            <Clock className="w-4 h-4 text-gray-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.totalJobs}</div>
          <p className="text-xs text-blue-600 mt-1">Click to view all</p>
        </button>

        <button
          onClick={() => handleStatsCardClick('active')}
          className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-3 hover:border-green-500 hover:shadow-lg transition-all text-left"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Active</span>
            <CheckCircle2 className="w-4 h-4 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-600">{stats.activeJobs}</div>
          <p className="text-xs text-green-600 mt-1">Click to filter</p>
        </button>

        <button
          onClick={() => handleStatsCardClick('paused')}
          className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-3 hover:border-gray-500 hover:shadow-lg transition-all text-left"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Paused</span>
            <Pause className="w-4 h-4 text-gray-600" />
          </div>
          <div className="text-2xl font-bold text-gray-600">{stats.pausedJobs}</div>
          <p className="text-xs text-gray-600 mt-1">Click to filter</p>
        </button>

        <button
          onClick={() => handleStatsCardClick('completed')}
          className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-3 hover:border-green-500 hover:shadow-lg transition-all text-left"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-600">{stats.completedToday}</div>
          <p className="text-xs text-green-600 mt-1">Today</p>
        </button>

        <button
          onClick={() => handleStatsCardClick('failed')}
          className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-3 hover:border-red-500 hover:shadow-lg transition-all text-left"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Failed</span>
            <XCircle className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl font-bold text-red-600">{stats.failedToday}</div>
          <p className="text-xs text-red-600 mt-1">Today</p>
        </button>

        <button
          onClick={() => handleStatsCardClick('analytics')}
          className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl shadow-sm border-2 border-purple-200 p-3 hover:border-purple-500 hover:shadow-lg transition-all text-left"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-purple-600 font-medium">Analytics</span>
            <BarChart3 className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-sm font-semibold text-purple-900">View Insights</div>
          <p className="text-xs text-purple-600 mt-1">Click for details</p>
        </button>
      </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-hidden px-6">
        <div className="h-full flex flex-col bg-white rounded-lg border border-gray-200">
          {/* Filters */}
          <div className="flex-none p-3 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-2">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Filters</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex-1 min-w-[300px]">
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="Backup">Backup</option>
            <option value="Report">Report</option>
            <option value="Cleanup">Cleanup</option>
            <option value="Data Sync">Data Sync</option>
            <option value="Email Campaign">Email Campaign</option>
            <option value="Archive">Archive</option>
            <option value="Monitoring">Monitoring</option>
          </select>
        </div>
      </div>

      {/* Jobs Table */}
      <div className="flex-1 overflow-auto">
          <table className="w-full">
            <thead className="sticky top-0 bg-gray-50 z-10">
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Job Name</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Type</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Schedule</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Last Run</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Next Run</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Success Rate</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Status</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.map((job) => (
                <tr
                  key={job.id}
                  onClick={() => handleViewDetails(job)}
                  className="border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`font-medium text-gray-900 ${getPriorityColor(job.priority)}`}>
                          {job.name}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">{job.description}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {job.type}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <div className="text-sm text-gray-900">{job.schedule}</div>
                      <code className="text-xs text-gray-500">{job.cronExpression}</code>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {job.lastRun ? (
                      <div>
                        <div className="text-sm text-gray-900">{job.lastRun}</div>
                        <div className="flex items-center gap-1 mt-1">
                          {getLastRunStatusIcon(job.lastRunStatus)}
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getLastRunStatusColor(job.lastRunStatus)}`}>
                            {job.lastRunStatus}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">Never run</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2 text-sm text-gray-900">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {job.nextRun}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              job.successRate >= 95 ? 'bg-green-500' :
                              job.successRate >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${job.successRate}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{job.successRate}%</span>
                      </div>
                      <div className="text-xs text-gray-500">{job.totalRuns} runs, {job.failedRuns} failed</div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRunNow(job.id);
                        }}
                        className="text-indigo-600 hover:text-indigo-700 p-1 hover:bg-indigo-100 rounded transition-colors"
                        title="Run Now"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleStatus(job.id);
                        }}
                        className="text-gray-600 hover:text-gray-700 p-1 hover:bg-gray-100 rounded transition-colors"
                        title={job.enabled ? "Pause" : "Resume"}
                      >
                        {job.enabled ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(job);
                        }}
                        className="text-gray-600 hover:text-gray-700 p-1 hover:bg-gray-100 rounded transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(job.id);
                        }}
                        className="text-indigo-600 hover:text-indigo-700 p-1 hover:bg-indigo-100 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(job.id);
                        }}
                        className="text-red-600 hover:text-red-700 p-1 hover:bg-red-100 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

        {isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading scheduled jobs...</p>
          </div>
        )}
        {!isLoading && loadError && (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-red-400 mb-3 mx-auto" />
            <p className="text-red-600">{loadError}</p>
          </div>
        )}
        {!isLoading && !loadError && filteredJobs.length === 0 && (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 text-gray-400 mb-3 mx-auto" />
            <p className="text-gray-600">No scheduled jobs found</p>
          </div>
        )}
      </div>
        </div>
      </div>

      {/* Details Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-xl shadow-xl  w-full max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between p-3 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Job Details</h3>
              <button
                onClick={handleCloseDetails}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Job Name</label>
                  <div className="bg-gray-50 rounded-lg p-3 font-semibold text-gray-900">{selectedJob.name}</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Type</label>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {selectedJob.type}
                  </span>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
                  <div className="bg-gray-50 rounded-lg p-3 text-gray-900">{selectedJob.description}</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Schedule</label>
                  <div className="bg-gray-50 rounded-lg p-3 text-gray-900">{selectedJob.schedule}</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Cron Expression</label>
                  <code className="block bg-gray-50 rounded-lg p-3 text-gray-900">{selectedJob.cronExpression}</code>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Priority</label>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    selectedJob.priority === 'Critical' ? 'bg-red-100 text-red-800' :
                    selectedJob.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                    selectedJob.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {selectedJob.priority}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedJob.status)}`}>
                    {selectedJob.status}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Last Run</label>
                  <div className="bg-gray-50 rounded-lg p-3 text-gray-900">{selectedJob.lastRun || 'Never'}</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Last Run Status</label>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getLastRunStatusColor(selectedJob.lastRunStatus)}`}>
                    {selectedJob.lastRunStatus || 'N/A'}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Next Run</label>
                  <div className="bg-blue-50 rounded-lg p-3 text-gray-900">{selectedJob.nextRun}</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Average Duration</label>
                  <div className="bg-gray-50 rounded-lg p-3 text-gray-900">{selectedJob.duration || 'N/A'}</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Success Rate</label>
                  <div className="bg-green-50 rounded-lg p-3 font-bold text-green-800">{selectedJob.successRate}%</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Total Runs</label>
                  <div className="bg-gray-50 rounded-lg p-3 text-gray-900">{selectedJob.totalRuns}</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Failed Runs</label>
                  <div className="bg-red-50 rounded-lg p-3 font-bold text-red-800">{selectedJob.failedRuns}</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Created By</label>
                  <div className="bg-gray-50 rounded-lg p-3 text-gray-900">{selectedJob.createdBy}</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Created At</label>
                  <div className="bg-gray-50 rounded-lg p-3 text-gray-900">{selectedJob.createdAt}</div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-3 border-t border-gray-200">
              <button
                onClick={handleCloseDetails}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => handleRunNow(selectedJob.id)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Run Now
              </button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-5 shadow-xl">
            <h2 className="mb-4 text-lg font-bold text-gray-900">
              {editingId ? 'Edit Scheduled Job' : 'Create Scheduled Job'}
            </h2>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-600">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-600">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-600">Type</label>
                  <input
                    type="text"
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-600">Priority</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-600">Schedule</label>
                  <input
                    type="text"
                    placeholder="Every day at 2:00 AM"
                    value={form.schedule}
                    onChange={(e) => setForm({ ...form, schedule: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-600">Cron Expression</label>
                  <input
                    type="text"
                    placeholder="0 2 * * *"
                    value={form.cronExpression}
                    onChange={(e) => setForm({ ...form, cronExpression: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={form.enabled}
                  onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
                />
                Enabled
              </label>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={isSaving}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSaving}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {isSaving ? 'Saving...' : editingId ? 'Save Changes' : 'Create Job'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchedulerJobsPage;
