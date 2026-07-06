'use client';

import { useState, useEffect } from 'react';
import { LogIn, LogOut, Shield, AlertTriangle, CheckCircle2, XCircle, Globe, MapPin, Monitor, Smartphone, Calendar, Filter, Download, Eye, Search, CheckCircle, AlertCircle } from 'lucide-react';
import { exportToCsv } from '@/lib/export';
import { ItAdminService } from '@/services/it-admin.service';

interface LoginAuditLog {
  id: string;
  userId: string;
  userName: string;
  email: string;
  department: string;
  role: string;
  action: string;
  status: string;
  timestamp: string;
  ipAddress: string;
  location: string;
  device: string;
  browser: string;
  os: string;
  sessionId: string;
  duration?: string;
  failureReason?: string;
  mfaUsed: boolean;
}

interface LoginStats {
  totalLogins: number;
  successfulLogins: number;
  failedLogins: number;
  uniqueUsers: number;
  suspiciousAttempts: number;
  mfaLogins: number;
}

const LoginAuditLogsPage = () => {
  const [filterAction, setFilterAction] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDevice, setFilterDevice] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState('today');
  const [selectedLog, setSelectedLog] = useState<LoginAuditLog | null>(null);
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

  const [logs, setLogs] = useState<LoginAuditLog[]>([]);

  useEffect(() => {
    const loadLogs = async () => {
      try {
        const res = await ItAdminService.getAuditLogs({ action: 'login', limit: '100' });
        const data = Array.isArray(res?.data) ? res.data : [];
        const mapped: LoginAuditLog[] = data.map((log) => ({
          id: log.id,
          userId: log.userId || '-',
          userName: log.userName || 'Unknown',
          email: '-',
          department: '-',
          role: '-',
          action: log.action || 'Login',
          status: log.status || 'Success',
          timestamp: log.createdAt || '',
          ipAddress: log.ipAddress || '-',
          location: 'Unknown',
          device: 'Unknown',
          browser: 'Unknown',
          os: 'Unknown',
          sessionId: log.entityId || '-',
          mfaUsed: false,
        }));
        setLogs(mapped);
      } catch {
        setLogs([]);
      }
    };
    loadLogs();
  }, []);

  const stats: LoginStats = {
    totalLogins: logs.length,
    successfulLogins: logs.filter(l => l.status === 'Success').length,
    failedLogins: logs.filter(l => l.status === 'Failed').length,
    uniqueUsers: new Set(logs.filter(l => l.userId !== '-').map(l => l.userId)).size,
    suspiciousAttempts: logs.filter(l => l.status === 'Suspicious' || l.status === 'Blocked').length,
    mfaLogins: logs.filter(l => l.mfaUsed && l.status === 'Success').length,
  };

  const filteredLogs = logs.filter(log => {
    const matchesAction = filterAction === 'all' || log.action.toLowerCase().includes(filterAction.toLowerCase());
    const matchesStatus = filterStatus === 'all' || log.status.toLowerCase() === filterStatus.toLowerCase();
    const matchesDevice = filterDevice === 'all' || log.device.toLowerCase() === filterDevice.toLowerCase();
    const matchesSearch = log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.ipAddress.includes(searchQuery);
    return matchesAction && matchesStatus && matchesDevice && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'blocked':
        return 'bg-orange-100 text-orange-800';
      case 'suspicious':
        return 'bg-purple-100 text-purple-800';
      case 'auto logout':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'login':
        return <LogIn className="w-4 h-4 text-green-600" />;
      case 'logout':
        return <LogOut className="w-4 h-4 text-blue-600" />;
      case 'login attempt':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'session timeout':
        return <XCircle className="w-4 h-4 text-yellow-600" />;
      default:
        return <Shield className="w-4 h-4 text-gray-600" />;
    }
  };

  const getDeviceIcon = (device: string) => {
    switch (device.toLowerCase()) {
      case 'mobile':
      case 'tablet':
        return <Smartphone className="w-4 h-4" />;
      case 'desktop':
      case 'laptop':
        return <Monitor className="w-4 h-4" />;
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  const handleViewDetails = (log: LoginAuditLog) => {
    setSelectedLog(log);
    showToast(`Viewing details for ${log.userName}`, 'info');
  };

  const handleExport = () => {
    exportToCsv('login-audit-logs', filteredLogs as unknown as Record<string, unknown>[]);
  };

  const handleCloseDetails = () => {
    setSelectedLog(null);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-gray-50 via-violet-50 to-purple-50">
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
            <div className="p-2 bg-violet-100 rounded-lg">
              <LogIn className="w-6 h-6 text-violet-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Login Audit Logs</h1>
              <p className="text-gray-600">Track and monitor all user login activities</p>
            </div>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-violet-300 text-violet-700 rounded-lg hover:bg-violet-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export Logs
          </button>
        </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-2">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Total Events</span>
            <Shield className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.totalLogins}</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Successful</span>
            <CheckCircle2 className="w-4 h-4 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-600">{stats.successfulLogins}</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Failed</span>
            <XCircle className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl font-bold text-red-600">{stats.failedLogins}</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Unique Users</span>
            <Globe className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-600">{stats.uniqueUsers}</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Suspicious</span>
            <AlertTriangle className="w-4 h-4 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-orange-600">{stats.suspiciousAttempts}</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">MFA Used</span>
            <Shield className="w-4 h-4 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-600">{stats.mfaLogins}</div>
        </div>
      </div>
    </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-hidden px-6">
        <div className="h-full flex flex-col bg-white rounded-lg border border-gray-200">
      {/* Filters */}
      <div className="flex-none p-3 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-2">
          <Filter className="w-5 h-5 text-violet-600" />
          <h3 className="font-semibold text-gray-900">Filters</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex-1 min-w-[250px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by user, email, or IP..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          >
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="custom">Custom Range</option>
          </select>
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          >
            <option value="all">All Actions</option>
            <option value="login">Login</option>
            <option value="logout">Logout</option>
            <option value="login attempt">Failed Attempts</option>
            <option value="session timeout">Timeouts</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
            <option value="blocked">Blocked</option>
            <option value="suspicious">Suspicious</option>
          </select>
          <select
            value={filterDevice}
            onChange={(e) => setFilterDevice(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          >
            <option value="all">All Devices</option>
            <option value="desktop">Desktop</option>
            <option value="laptop">Laptop</option>
            <option value="mobile">Mobile</option>
            <option value="tablet">Tablet</option>
          </select>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-gray-50 z-10">
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Timestamp</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">User</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Action</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">IP Address</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Location</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Device</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">MFA</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2 text-sm text-gray-900">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {log.timestamp}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <div className="font-medium text-gray-900">{log.userName}</div>
                      {log.email !== '-' && (
                        <div className="text-sm text-gray-500">{log.email}</div>
                      )}
                      {log.department !== '-' && (
                        <div className="text-xs text-gray-400">{log.department} - {log.role}</div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {getActionIcon(log.action)}
                      <span className="text-sm text-gray-700">{log.action}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">{log.ipAddress}</code>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      {log.location}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      {getDeviceIcon(log.device)}
                      <div>
                        <div>{log.device}</div>
                        {log.browser !== 'Unknown' && (
                          <div className="text-xs text-gray-400">{log.browser}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {log.mfaUsed ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-gray-400" />
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleViewDetails(log)}
                      className="text-violet-600 hover:text-violet-700 p-1"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLogs.length === 0 && (
          <div className="text-center py-12">
            <LogIn className="w-12 h-12 text-gray-400 mb-3" />
            <p className="text-gray-600">No login logs found matching your criteria</p>
          </div>
        )}
      </div>
      </div>

      {/* Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between p-3 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Login Event Details</h3>
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
                  <label className="block text-sm font-medium text-gray-600 mb-1">User Information</label>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="font-medium text-gray-900">{selectedLog.userName}</div>
                    <div className="text-sm text-gray-600">{selectedLog.email}</div>
                    <div className="text-sm text-gray-500">{selectedLog.department} - {selectedLog.role}</div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Action & Status</label>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      {getActionIcon(selectedLog.action)}
                      <span className="font-medium text-gray-900">{selectedLog.action}</span>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedLog.status)}`}>
                      {selectedLog.status}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Timestamp</label>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-gray-900">{selectedLog.timestamp}</div>
                    {selectedLog.duration && (
                      <div className="text-sm text-gray-600 mt-1">Duration: {selectedLog.duration}</div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Session ID</label>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <code className="text-sm text-gray-900">{selectedLog.sessionId}</code>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">IP Address & Location</label>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <code className="text-sm bg-white px-2 py-1 rounded border border-gray-200">{selectedLog.ipAddress}</code>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                      <MapPin className="w-4 h-4" />
                      {selectedLog.location}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Device Information</label>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-gray-900 mb-1">
                      {getDeviceIcon(selectedLog.device)}
                      <span>{selectedLog.device}</span>
                    </div>
                    <div className="text-sm text-gray-600">{selectedLog.browser}</div>
                    <div className="text-sm text-gray-600">{selectedLog.os}</div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Security</label>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Multi-Factor Authentication:</span>
                      {selectedLog.mfaUsed ? (
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircle2 className="w-4 h-4" />
                          <span className="text-sm font-medium">Yes</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-red-600">
                          <XCircle className="w-4 h-4" />
                          <span className="text-sm font-medium">No</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {selectedLog.failureReason && (
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-600 mb-1">Failure Reason</label>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                        <span className="text-sm text-red-800">{selectedLog.failureReason}</span>
                      </div>
                    </div>
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

export default LoginAuditLogsPage;
