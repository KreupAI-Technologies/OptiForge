'use client';

import { useState, useEffect } from 'react';
import { History, CheckCircle2, XCircle, AlertTriangle, Clock, Calendar, Filter, Download, Eye, Search, TrendingUp, BarChart3, X, PieChart } from 'lucide-react';
import { exportToCsv } from '@/lib/export';

interface ExecutionHistory {
  id: string;
  jobId: string;
  jobName: string;
  jobType: string;
  executionTime: string;
  startTime: string;
  endTime: string;
  duration: string;
  status: string;
  result?: string;
  errorMessage?: string;
  triggeredBy: string;
  recordsProcessed?: number;
  outputFile?: string;
}

interface HistoryStats {
  totalExecutions: number;
  successful: number;
  failed: number;
  warnings: number;
  averageDuration: string;
  longestDuration: string;
}

const SchedulerHistoryPage = () => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [dateRange, setDateRange] = useState('today');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExecution, setSelectedExecution] = useState<ExecutionHistory | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const [history] = useState<ExecutionHistory[]>([
    {
      id: '1',
      jobId: 'JOB-001',
      jobName: 'Database Backup',
      jobType: 'Backup',
      executionTime: '2025-10-21 02:00:00',
      startTime: '2025-10-21 02:00:00',
      endTime: '2025-10-21 02:45:23',
      duration: '45m 23s',
      status: 'Success',
      result: 'Backup completed successfully. All tables backed up.',
      triggeredBy: 'Scheduler',
      recordsProcessed: 1250000,
      outputFile: '/backups/db_backup_20251021_020000.sql.gz',
    },
    {
      id: '2',
      jobId: 'JOB-002',
      jobName: 'Daily Sales Report',
      jobType: 'Report',
      executionTime: '2025-10-21 08:00:00',
      startTime: '2025-10-21 08:00:00',
      endTime: '2025-10-21 08:12:45',
      duration: '12m 45s',
      status: 'Success',
      result: 'Report generated and emailed to 15 recipients.',
      triggeredBy: 'Scheduler',
      recordsProcessed: 8450,
      outputFile: '/reports/sales_daily_20251021.pdf',
    },
    {
      id: '3',
      jobId: 'JOB-004',
      jobName: 'Inventory Sync',
      jobType: 'Data Sync',
      executionTime: '2025-10-21 16:00:00',
      startTime: '2025-10-21 16:00:00',
      endTime: '2025-10-21 16:23:12',
      duration: '23m 12s',
      status: 'Failed',
      result: 'Sync failed due to API timeout.',
      errorMessage: 'Connection timeout: External API did not respond within 30 seconds. Retry count exceeded (3/3).',
      triggeredBy: 'Scheduler',
      recordsProcessed: 0,
    },
    {
      id: '4',
      jobId: 'JOB-007',
      jobName: 'System Health Check',
      jobType: 'Monitoring',
      executionTime: '2025-10-21 18:15:00',
      startTime: '2025-10-21 18:15:00',
      endTime: '2025-10-21 18:17:08',
      duration: '2m 8s',
      status: 'Success',
      result: 'All systems healthy. No alerts triggered.',
      triggeredBy: 'Scheduler',
      recordsProcessed: 156,
    },
    {
      id: '5',
      jobId: 'JOB-008',
      jobName: 'Customer Feedback Digest',
      jobType: 'Report',
      executionTime: '2025-10-21 09:00:00',
      startTime: '2025-10-21 09:00:00',
      endTime: '2025-10-21 09:18:34',
      duration: '18m 34s',
      status: 'Success',
      result: 'Feedback digest compiled from 234 responses.',
      triggeredBy: 'Scheduler',
      recordsProcessed: 234,
      outputFile: '/reports/feedback_digest_20251021.pdf',
    },
    {
      id: '6',
      jobId: 'JOB-003',
      jobName: 'Cleanup Temp Files',
      jobType: 'Cleanup',
      executionTime: '2025-10-20 03:00:00',
      startTime: '2025-10-20 03:00:00',
      endTime: '2025-10-20 03:08:15',
      duration: '8m 15s',
      status: 'Success',
      result: 'Cleaned up 4.2 GB of temporary files older than 7 days.',
      triggeredBy: 'Scheduler',
      recordsProcessed: 8456,
    },
    {
      id: '7',
      jobId: 'JOB-001',
      jobName: 'Database Backup',
      jobType: 'Backup',
      executionTime: '2025-10-20 02:00:00',
      startTime: '2025-10-20 02:00:00',
      endTime: '2025-10-20 02:43:56',
      duration: '43m 56s',
      status: 'Success',
      result: 'Backup completed successfully. All tables backed up.',
      triggeredBy: 'Scheduler',
      recordsProcessed: 1248000,
      outputFile: '/backups/db_backup_20251020_020000.sql.gz',
    },
    {
      id: '8',
      jobId: 'JOB-002',
      jobName: 'Daily Sales Report',
      jobType: 'Report',
      executionTime: '2025-10-20 08:00:00',
      startTime: '2025-10-20 08:00:00',
      endTime: '2025-10-20 08:11:23',
      duration: '11m 23s',
      status: 'Warning',
      result: 'Report generated but email delivery failed for 2 recipients.',
      triggeredBy: 'Scheduler',
      recordsProcessed: 7890,
      outputFile: '/reports/sales_daily_20251020.pdf',
    },
    {
      id: '9',
      jobId: 'JOB-004',
      jobName: 'Inventory Sync',
      jobType: 'Data Sync',
      executionTime: '2025-10-21 12:00:00',
      startTime: '2025-10-21 12:00:00',
      endTime: '2025-10-21 12:22:45',
      duration: '22m 45s',
      status: 'Success',
      result: 'Synchronized 5,678 inventory records successfully.',
      triggeredBy: 'Scheduler',
      recordsProcessed: 5678,
    },
    {
      id: '10',
      jobId: 'JOB-007',
      jobName: 'System Health Check',
      jobType: 'Monitoring',
      executionTime: '2025-10-21 18:00:00',
      startTime: '2025-10-21 18:00:00',
      endTime: '2025-10-21 18:02:15',
      duration: '2m 15s',
      status: 'Success',
      result: 'All systems healthy. No alerts triggered.',
      triggeredBy: 'Scheduler',
      recordsProcessed: 156,
    },
    {
      id: '11',
      jobId: 'JOB-006',
      jobName: 'Data Archive',
      jobType: 'Archive',
      executionTime: '2025-10-01 01:00:00',
      startTime: '2025-10-01 01:00:00',
      endTime: '2025-10-01 03:15:42',
      duration: '2h 15m 42s',
      status: 'Success',
      result: 'Archived 340,000 old transaction records to cold storage.',
      triggeredBy: 'Scheduler',
      recordsProcessed: 340000,
      outputFile: '/archives/transactions_202409.tar.gz',
    },
    {
      id: '12',
      jobId: 'JOB-004',
      jobName: 'Inventory Sync',
      jobType: 'Data Sync',
      executionTime: '2025-10-21 08:00:00',
      startTime: '2025-10-21 08:00:00',
      endTime: '2025-10-21 08:21:34',
      duration: '21m 34s',
      status: 'Success',
      result: 'Synchronized 5,234 inventory records successfully.',
      triggeredBy: 'Scheduler',
      recordsProcessed: 5234,
    },
  ]);

  const stats: HistoryStats = {
    totalExecutions: history.length,
    successful: history.filter(h => h.status === 'Success').length,
    failed: history.filter(h => h.status === 'Failed').length,
    warnings: history.filter(h => h.status === 'Warning').length,
    averageDuration: '18m 32s',
    longestDuration: '2h 15m 42s',
  };

  const filteredHistory = history.filter(item => {
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    const matchesType = filterType === 'all' || item.jobType === filterType;
    const matchesSearch = item.jobName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.jobId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesType && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Success':
        return 'bg-green-100 text-green-800';
      case 'Failed':
        return 'bg-red-100 text-red-800';
      case 'Warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'Running':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Success':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'Failed':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'Warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'Running':
        return <Clock className="w-5 h-5 text-blue-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const handleViewDetails = (execution: ExecutionHistory) => {
    setSelectedExecution(execution);
  };

  const handleCloseDetails = () => {
    setSelectedExecution(null);
  };

  const handleExport = () => {
    exportToCsv('execution-history', filteredHistory as unknown as Record<string, unknown>[]);
  };

  const handleStatsCardClick = (type: string) => {
    switch (type) {
      case 'total':
        setFilterStatus('all');
        setFilterType('all');
        setToast({ message: 'Showing all executions', type: 'info' });
        break;
      case 'success':
        setFilterStatus('Success');
        setToast({ message: 'Showing successful executions', type: 'success' });
        break;
      case 'failed':
        setFilterStatus('Failed');
        setToast({ message: 'Showing failed executions', type: 'error' });
        break;
      case 'warning':
        setFilterStatus('Warning');
        setToast({ message: 'Showing executions with warnings', type: 'info' });
        break;
      case 'analytics':
        setShowAnalyticsModal(true);
        break;
    }
  };

  return (
    <div className="p-6 max-w-[1600px]">
      {/* Header */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <History className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Execution History</h1>
              <p className="text-gray-600">View past job executions and performance metrics</p>
            </div>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export History
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in">
          <div className={`rounded-lg shadow-lg p-3 flex items-center gap-3 ${
            toast.type === 'success' ? 'bg-green-50 border-2 border-green-500' :
            toast.type === 'error' ? 'bg-red-50 border-2 border-red-500' :
            'bg-blue-50 border-2 border-blue-500'
          }`}>
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-green-600" />}
            {toast.type === 'error' && <XCircle className="w-5 h-5 text-red-600" />}
            {toast.type === 'info' && <AlertTriangle className="w-5 h-5 text-blue-600" />}
            <p className={`font-medium ${
              toast.type === 'success' ? 'text-green-900' :
              toast.type === 'error' ? 'text-red-900' :
              'text-blue-900'
            }`}>{toast.message}</p>
            <button onClick={() => setToast(null)} className="ml-2">
              <X className="w-4 h-4 text-gray-500 hover:text-gray-700" />
            </button>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-2 mb-3">
        <button
          onClick={() => handleStatsCardClick('total')}
          className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-3 hover:border-indigo-500 hover:shadow-lg transition-all text-left"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Total</span>
            <History className="w-4 h-4 text-gray-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.totalExecutions}</div>
          <p className="text-xs text-indigo-600 mt-1">Click to view all</p>
        </button>

        <button
          onClick={() => handleStatsCardClick('success')}
          className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-3 hover:border-green-500 hover:shadow-lg transition-all text-left"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Successful</span>
            <CheckCircle2 className="w-4 h-4 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-600">{stats.successful}</div>
          <p className="text-xs text-green-600 mt-1">Click to filter</p>
        </button>

        <button
          onClick={() => handleStatsCardClick('failed')}
          className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-3 hover:border-red-500 hover:shadow-lg transition-all text-left"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Failed</span>
            <XCircle className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
          <p className="text-xs text-red-600 mt-1">Click to filter</p>
        </button>

        <button
          onClick={() => handleStatsCardClick('warning')}
          className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-3 hover:border-yellow-500 hover:shadow-lg transition-all text-left"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Warnings</span>
            <AlertTriangle className="w-4 h-4 text-yellow-600" />
          </div>
          <div className="text-2xl font-bold text-yellow-600">{stats.warnings}</div>
          <p className="text-xs text-yellow-600 mt-1">Click to filter</p>
        </button>

        <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Avg Duration</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-600">{stats.averageDuration}</div>
        </div>

        <button
          onClick={() => handleStatsCardClick('analytics')}
          className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl shadow-sm border-2 border-purple-200 p-3 hover:border-purple-500 hover:shadow-lg transition-all text-left"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-purple-600 font-medium">Analytics</span>
            <PieChart className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-sm font-semibold text-purple-900">View Insights</div>
          <p className="text-xs text-purple-600 mt-1">Click for details</p>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex items-center gap-3 mb-2">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Filters</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex-1 min-w-[250px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by job name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="custom">Custom Range</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="Success">Success</option>
            <option value="Failed">Failed</option>
            <option value="Warning">Warning</option>
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
            <option value="Archive">Archive</option>
            <option value="Monitoring">Monitoring</option>
          </select>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Job</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Type</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Execution Time</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Duration</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Records</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Triggered By</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => handleViewDetails(item)}
                  className="border-b border-gray-100 hover:bg-indigo-50 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-4">
                    <div>
                      <div className="font-medium text-gray-900">{item.jobName}</div>
                      <code className="text-xs text-gray-500">{item.jobId}</code>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {item.jobType}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2 text-sm text-gray-900">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {item.executionTime}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900">{item.duration}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(item.status)}
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm text-gray-900">
                      {item.recordsProcessed !== undefined ? item.recordsProcessed.toLocaleString() : 'N/A'}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-700">{item.triggeredBy}</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewDetails(item);
                      }}
                      className="text-indigo-600 hover:text-indigo-700 p-1 hover:bg-indigo-100 rounded transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredHistory.length === 0 && (
          <div className="text-center py-12">
            <History className="w-12 h-12 text-gray-400 mb-3" />
            <p className="text-gray-600">No execution history found</p>
          </div>
        )}
      </div>

      {/* Analytics Modal */}
      {showAnalyticsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-xl shadow-xl  w-full max-h-[90vh] overflow-auto">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-3 sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Execution Analytics</h3>
                    <p className="text-sm text-purple-100">Comprehensive performance insights</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAnalyticsModal(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Performance Metrics */}
              <div className="mb-3">
                <h4 className="text-lg font-bold text-gray-900 mb-2">Performance Overview</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <p className="text-sm font-medium text-green-900">Success Rate</p>
                    </div>
                    <p className="text-2xl font-bold text-green-700">
                      {((stats.successful / stats.totalExecutions) * 100).toFixed(1)}%
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3 border border-red-200">
                    <div className="flex items-center gap-2 mb-2">
                      <XCircle className="w-5 h-5 text-red-600" />
                      <p className="text-sm font-medium text-red-900">Failure Rate</p>
                    </div>
                    <p className="text-2xl font-bold text-red-700">
                      {((stats.failed / stats.totalExecutions) * 100).toFixed(1)}%
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-5 h-5 text-yellow-600" />
                      <p className="text-sm font-medium text-yellow-900">Warning Rate</p>
                    </div>
                    <p className="text-2xl font-bold text-yellow-700">
                      {((stats.warnings / stats.totalExecutions) * 100).toFixed(1)}%
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <p className="text-sm font-medium text-blue-900">Avg Duration</p>
                    </div>
                    <p className="text-2xl font-bold text-blue-700">{stats.averageDuration}</p>
                  </div>
                </div>
              </div>

              {/* Job Type Analysis */}
              <div className="mb-3">
                <h4 className="text-lg font-bold text-gray-900 mb-2">Job Type Breakdown</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {['Backup', 'Report', 'Data Sync', 'Monitoring', 'Cleanup', 'Archive'].map((type) => {
                    const typeCount = history.filter(h => h.jobType === type).length;
                    const typeSuccess = history.filter(h => h.jobType === type && h.status === 'Success').length;
                    return typeCount > 0 ? (
                      <div key={type} className="bg-white border border-gray-200 rounded-lg p-3">
                        <p className="text-sm font-medium text-gray-700 mb-2">{type}</p>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-2xl font-bold text-gray-900">{typeCount}</span>
                          <span className="text-sm text-green-600 font-medium">
                            {typeCount > 0 ? ((typeSuccess / typeCount) * 100).toFixed(0) : 0}% success
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${typeCount > 0 ? (typeSuccess / typeCount) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>

              {/* Recent Trends */}
              <div className="mb-3">
                <h4 className="text-lg font-bold text-gray-900 mb-2">Recent Executions Timeline</h4>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="space-y-3">
                    {history.slice(0, 5).map((exec) => (
                      <div key={exec.id} className="flex items-center gap-2 bg-white p-3 rounded-lg border border-gray-200">
                        <div className="flex-shrink-0">
                          {getStatusIcon(exec.status)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{exec.jobName}</p>
                          <p className="text-xs text-gray-500">{exec.executionTime}</p>
                        </div>
                        <div className="flex-shrink-0">
                          <span className="text-xs font-medium text-gray-600">{exec.duration}</span>
                        </div>
                        <div className="flex-shrink-0">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(exec.status)}`}>
                            {exec.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Key Insights */}
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">Key Insights</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <h5 className="font-semibold text-blue-900 mb-2">Most Reliable Job</h5>
                    <p className="text-sm text-blue-700">System Health Check - 100% success rate</p>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <h5 className="font-semibold text-purple-900 mb-2">Longest Running Job</h5>
                    <p className="text-sm text-purple-700">Data Archive - {stats.longestDuration}</p>
                  </div>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <h5 className="font-semibold text-orange-900 mb-2">Total Records Processed</h5>
                    <p className="text-sm text-orange-700">
                      {history.reduce((sum, h) => sum + (h.recordsProcessed || 0), 0).toLocaleString()} records
                    </p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <h5 className="font-semibold text-green-900 mb-2">System Reliability</h5>
                    <p className="text-sm text-green-700">
                      {stats.successful} of {stats.totalExecutions} jobs completed successfully
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-3 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowAnalyticsModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Close
              </button>
              <button
                onClick={() => {
                  exportToCsv('execution-history-analytics', history as unknown as Record<string, unknown>[]);
                  setShowAnalyticsModal(false);
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedExecution && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-xl shadow-xl  w-full max-h-[90vh] overflow-auto">
            <div className={`p-6 sticky top-0 z-10 bg-gradient-to-r ${
              selectedExecution.status === 'Success' ? 'from-green-600 to-emerald-600' :
              selectedExecution.status === 'Failed' ? 'from-red-600 to-rose-600' :
              'from-yellow-600 to-orange-600'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white">Execution Details</h3>
                  <p className="text-sm text-white text-opacity-90">{selectedExecution.jobName}</p>
                </div>
                <button
                  onClick={handleCloseDetails}
                  className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Job Name</label>
                  <div className="bg-gray-50 rounded-lg p-3 font-semibold text-gray-900">{selectedExecution.jobName}</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Job ID</label>
                  <code className="block bg-gray-50 rounded-lg p-3 text-sm text-gray-900">{selectedExecution.jobId}</code>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Job Type</label>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {selectedExecution.jobType}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(selectedExecution.status)}
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedExecution.status)}`}>
                      {selectedExecution.status}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Execution Time</label>
                  <div className="bg-gray-50 rounded-lg p-3 text-gray-900">{selectedExecution.executionTime}</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Duration</label>
                  <div className="bg-blue-50 rounded-lg p-3 font-bold text-blue-800">{selectedExecution.duration}</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Start Time</label>
                  <div className="bg-gray-50 rounded-lg p-3 text-gray-900">{selectedExecution.startTime}</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">End Time</label>
                  <div className="bg-gray-50 rounded-lg p-3 text-gray-900">{selectedExecution.endTime}</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Triggered By</label>
                  <div className="bg-gray-50 rounded-lg p-3 text-gray-900">{selectedExecution.triggeredBy}</div>
                </div>

                {selectedExecution.recordsProcessed !== undefined && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Records Processed</label>
                    <div className="bg-green-50 rounded-lg p-3 font-bold text-green-800">
                      {selectedExecution.recordsProcessed.toLocaleString()}
                    </div>
                  </div>
                )}

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Result</label>
                  <div className={`rounded-lg p-3 ${
                    selectedExecution.status === 'Success' ? 'bg-green-50 border border-green-200 text-gray-900' :
                    selectedExecution.status === 'Failed' ? 'bg-red-50 border border-red-200 text-gray-900' :
                    'bg-yellow-50 border border-yellow-200 text-gray-900'
                  }`}>
                    {selectedExecution.result}
                  </div>
                </div>

                {selectedExecution.errorMessage && (
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-600 mb-1">Error Message</label>
                    <pre className="bg-red-900 text-red-100 rounded-lg p-3 text-xs overflow-x-auto whitespace-pre-wrap font-mono">
                      {selectedExecution.errorMessage}
                    </pre>
                  </div>
                )}

                {selectedExecution.outputFile && (
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-600 mb-1">Output File</label>
                    <code className="block bg-gray-900 text-green-400 rounded-lg p-3 text-sm break-all">
                      {selectedExecution.outputFile}
                    </code>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 p-3 border-t border-gray-200">
              <button
                onClick={handleCloseDetails}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchedulerHistoryPage;
