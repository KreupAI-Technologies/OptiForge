'use client';

import { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, XCircle, Bug, Code, Server, Database, Globe, Filter, Download, Eye, Search, Calendar, TrendingUp, CheckCircle2, CheckCircle, AlertCircle } from 'lucide-react';
import { exportToCsv } from '@/lib/export';
import { ItAdminService } from '@/services/it-admin.service';

interface ErrorLog {
  id: string;
  errorId: string;
  timestamp: string;
  severity: string;
  errorType: string;
  source: string;
  message: string;
  stackTrace: string;
  affectedUsers: number;
  occurrences: number;
  firstSeen: string;
  lastSeen: string;
  status: string;
  assignedTo?: string;
  resolution?: string;
  user?: string;
  ipAddress?: string;
  url?: string;
  userAgent?: string;
}

interface ErrorStats {
  totalErrors: number;
  criticalErrors: number;
  highErrors: number;
  mediumErrors: number;
  lowErrors: number;
  resolvedToday: number;
}

const ErrorMonitoringPage = () => {
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState('today');
  const [selectedError, setSelectedError] = useState<ErrorLog | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
  };

  const handleExport = () => {
    exportToCsv('error-logs', filteredErrors as unknown as Record<string, unknown>[]);
  };

  const [errors, setErrors] = useState<ErrorLog[]>([]);

  const loadErrors = useCallback(async () => {
    try {
      const data = await ItAdminService.getMonitoring({ kind: 'error' });
      const mapped: ErrorLog[] = (data ?? []).map((dto) => ({
        id: dto.id,
        errorId: dto.id,
        timestamp: dto.lastOccurred ?? dto.createdAt ?? '',
        severity: dto.severity ?? 'Low',
        errorType: (dto.metadata?.errorType as string) ?? dto.category ?? 'Error',
        source: dto.source ?? '',
        message: dto.message ?? dto.name,
        stackTrace: (dto.metadata?.stackTrace as string) ?? '',
        affectedUsers: (dto.metadata?.affectedUsers as number) ?? 0,
        occurrences: dto.occurrences ?? 0,
        firstSeen: (dto.metadata?.firstSeen as string) ?? dto.createdAt ?? '',
        lastSeen: dto.lastOccurred ?? dto.updatedAt ?? '',
        status: dto.status,
        assignedTo: dto.metadata?.assignedTo as string | undefined,
        resolution: dto.metadata?.resolution as string | undefined,
        user: dto.metadata?.user as string | undefined,
        ipAddress: dto.metadata?.ipAddress as string | undefined,
        url: dto.metadata?.url as string | undefined,
        userAgent: dto.metadata?.userAgent as string | undefined,
      }));
      setErrors(mapped);
    } catch {
      setErrors([]);
    }
  }, []);

  useEffect(() => {
    loadErrors();
  }, [loadErrors]);

  // Open the details modal for the selected error (mirrors the row Eye action).
  const handleViewDetails = (error: ErrorLog) => {
    setSelectedError(error);
  };

  const handleResolve = async (error: ErrorLog) => {
    try {
      await ItAdminService.updateMonitoring(error.id, { status: 'Resolved' });
      showToast(`Error ${error.errorId} marked as resolved`, 'success');
      setSelectedError(null);
      await loadErrors();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : `Failed to resolve error ${error.errorId}`,
        'error',
      );
    }
  };

  const stats: ErrorStats = {
    totalErrors: errors.length,
    criticalErrors: errors.filter(e => e.severity === 'Critical').length,
    highErrors: errors.filter(e => e.severity === 'High').length,
    mediumErrors: errors.filter(e => e.severity === 'Medium').length,
    lowErrors: errors.filter(e => e.severity === 'Low').length,
    resolvedToday: errors.filter(e => e.status === 'Resolved').length,
  };

  const filteredErrors = errors.filter(error => {
    const matchesSeverity = filterSeverity === 'all' || error.severity === filterSeverity;
    const matchesType = filterType === 'all' || error.errorType === filterType;
    const matchesStatus = filterStatus === 'all' || error.status === filterStatus;
    const matchesSearch = error.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         error.errorId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         error.source.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSeverity && matchesType && matchesStatus && matchesSearch;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'in progress':
        return 'bg-blue-100 text-blue-800';
      case 'open':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSourceIcon = (source: string) => {
    if (source.toLowerCase().includes('database')) return <Database className="w-4 h-4" />;
    if (source.toLowerCase().includes('service') || source.toLowerCase().includes('controller')) return <Server className="w-4 h-4" />;
    if (source.toLowerCase().includes('api') || source.toLowerCase().includes('gateway')) return <Globe className="w-4 h-4" />;
    return <Code className="w-4 h-4" />;
  };

  const handleCloseDetails = () => {
    setSelectedError(null);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-gray-50 via-emerald-50 to-green-50">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg ${
          toast.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
          toast.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
          'bg-blue-50 text-blue-800 border border-blue-200'
        }`}>
          {toast.type === 'success' && <CheckCircle className="w-5 h-5" />}
          {toast.type === 'error' && <XCircle className="w-5 h-5" />}
          {toast.type === 'info' && <AlertCircle className="w-5 h-5" />}
          <span className="font-medium">{toast.message}</span>
        </div>
      )}

      {/* Header Section */}
      <div className="flex-none p-3 pb-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Bug className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Error Monitoring</h1>
              <p className="text-gray-600">Track and resolve application errors and exceptions</p>
            </div>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-emerald-300 text-emerald-700 rounded-lg hover:bg-emerald-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-2">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Total Errors</span>
            <Bug className="w-4 h-4 text-gray-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.totalErrors}</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Critical</span>
            <XCircle className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl font-bold text-red-600">{stats.criticalErrors}</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">High</span>
            <AlertTriangle className="w-4 h-4 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-orange-600">{stats.highErrors}</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Medium</span>
            <AlertTriangle className="w-4 h-4 text-yellow-600" />
          </div>
          <div className="text-2xl font-bold text-yellow-600">{stats.mediumErrors}</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Low</span>
            <AlertTriangle className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-600">{stats.lowErrors}</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-600">{stats.resolvedToday}</div>
        </div>
      </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-hidden px-6">
        <div className="h-full flex flex-col bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Filters Section */}
          <div className="flex-none p-3 border-b border-gray-200">
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
                    placeholder="Search by error ID, message, or source..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              </div>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="custom">Custom Range</option>
          </select>
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="all">All Severity</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="NullPointerException">NullPointerException</option>
                <option value="SQLException">SQLException</option>
                <option value="ValidationException">ValidationException</option>
                <option value="OutOfMemoryError">OutOfMemoryError</option>
                <option value="FileNotFoundException">FileNotFoundException</option>
                <option value="AuthenticationException">AuthenticationException</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
          </div>

          {/* DataTable - Scrollable */}
          <div className="flex-1 overflow-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Error ID
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Severity
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Source
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Message
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Occurrences
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredErrors.map((error) => (
                <tr key={error.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <code className="text-sm bg-red-50 text-red-800 px-2 py-1 rounded font-medium">
                      {error.errorId}
                    </code>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2 text-sm text-gray-900">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {error.timestamp}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(error.severity)}`}>
                      {error.severity}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Bug className="w-4 h-4 text-red-500" />
                      <span>{error.errorType}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      {getSourceIcon(error.source)}
                      <span>{error.source}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate" title={error.message}>
                      {error.message}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <TrendingUp className="w-4 h-4 text-orange-500" />
                        <span>{error.occurrences} times</span>
                      </div>
                      <div className="text-xs text-gray-500">{error.affectedUsers} users</div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(error.status)}`}>
                      {error.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleViewDetails(error)}
                      className="text-emerald-600 hover:text-emerald-700 p-1"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredErrors.length === 0 && (
            <div className="text-center py-12">
              <Bug className="w-12 h-12 text-gray-400 mb-3" />
              <p className="text-gray-600">No errors found matching your criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>

      {/* Details Modal */}
      {selectedError && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-xl shadow-xl  w-full max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between p-3 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Error Details</h3>
              <button
                onClick={handleCloseDetails}
                className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
              >
                <XCircle className="w-6 h-6 text-gray-600" />
                <span className="text-gray-700">Close</span>
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Error ID</label>
                  <code className="block bg-red-50 rounded-lg p-3 text-sm font-medium text-red-800">{selectedError.errorId}</code>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Timestamp</label>
                  <div className="bg-gray-50 rounded-lg p-3 text-gray-900">{selectedError.timestamp}</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Severity</label>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getSeverityColor(selectedError.severity)}`}>
                    {selectedError.severity}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedError.status)}`}>
                    {selectedError.status}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Error Type</label>
                  <div className="bg-gray-50 rounded-lg p-3 text-gray-900">{selectedError.errorType}</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Source</label>
                  <div className="bg-gray-50 rounded-lg p-3 text-gray-900">{selectedError.source}</div>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Error Message</label>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-gray-900">{selectedError.message}</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Occurrences</label>
                  <div className="bg-orange-50 rounded-lg p-3 font-bold text-orange-800">{selectedError.occurrences} times</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Affected Users</label>
                  <div className="bg-orange-50 rounded-lg p-3 font-bold text-orange-800">{selectedError.affectedUsers} users</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">First Seen</label>
                  <div className="bg-gray-50 rounded-lg p-3 text-gray-900">{selectedError.firstSeen}</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Last Seen</label>
                  <div className="bg-gray-50 rounded-lg p-3 text-gray-900">{selectedError.lastSeen}</div>
                </div>

                {selectedError.assignedTo && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Assigned To</label>
                    <div className="bg-blue-50 rounded-lg p-3 text-gray-900">{selectedError.assignedTo}</div>
                  </div>
                )}

                {selectedError.resolution && (
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-600 mb-1">Resolution</label>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-gray-900">{selectedError.resolution}</div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">User</label>
                  <div className="bg-gray-50 rounded-lg p-3 text-gray-900">{selectedError.user || 'Unknown'}</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">IP Address</label>
                  <code className="block bg-gray-50 rounded-lg p-3 text-sm text-gray-900">{selectedError.ipAddress || 'N/A'}</code>
                </div>

                {selectedError.url && (
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-600 mb-1">Request URL</label>
                    <code className="block bg-gray-50 rounded-lg p-3 text-sm text-gray-900 break-all">{selectedError.url}</code>
                  </div>
                )}

                {selectedError.userAgent && (
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-600 mb-1">User Agent</label>
                    <code className="block bg-gray-50 rounded-lg p-3 text-xs text-gray-900">{selectedError.userAgent}</code>
                  </div>
                )}

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Stack Trace</label>
                  <pre className="bg-gray-900 text-green-400 rounded-lg p-3 text-xs overflow-x-auto whitespace-pre-wrap font-mono">
                    {selectedError.stackTrace}
                  </pre>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-3 border-t border-gray-200">
              {selectedError.status !== 'Resolved' && (
                <button
                  onClick={() => handleResolve(selectedError)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Mark as Resolved
                </button>
              )}
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

export default ErrorMonitoringPage;
