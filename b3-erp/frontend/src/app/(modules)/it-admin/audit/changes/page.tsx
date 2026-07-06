'use client';

import { useState, useEffect } from 'react';
import { History, Database, User, Settings, FileText, Shield, Edit, Trash2, Filter, Download, Eye, Search, XCircle, CheckCircle2, AlertTriangle, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import { exportToCsv } from '@/lib/export';
import { ItAdminService } from '@/services/it-admin.service';

interface SystemChangeLog {
  id: string;
  changeId: string;
  timestamp: string;
  userId: string;
  userName: string;
  email: string;
  department: string;
  role: string;
  category: string;
  changeType: string;
  targetModule: string;
  targetEntity: string;
  action: string;
  fieldChanged: string;
  oldValue: string;
  newValue: string;
  ipAddress: string;
  location: string;
  device: string;
  approvalStatus: string;
  approvedBy?: string;
  approvalDate?: string;
  reason?: string;
  impact: string;
}

interface ChangeStats {
  totalChanges: number;
  userChanges: number;
  settingsChanges: number;
  dataChanges: number;
  pendingApproval: number;
  criticalChanges: number;
}

const SystemChangesAuditPage = () => {
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterImpact, setFilterImpact] = useState('all');
  const [filterApproval, setFilterApproval] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState('today');
  const [selectedChange, setSelectedChange] = useState<SystemChangeLog | null>(null);
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

  const [changes, setChanges] = useState<SystemChangeLog[]>([]);

  useEffect(() => {
    const loadChanges = async () => {
      try {
        const res = await ItAdminService.getAuditLogs({ limit: '100' });
        const logs = Array.isArray(res?.data) ? res.data : [];
        const mapped: SystemChangeLog[] = logs.map((log) => ({
          id: log.id,
          changeId: log.entityId || log.id,
          timestamp: log.createdAt || '',
          userId: log.userId || '',
          userName: log.userName || 'Unknown',
          email: '',
          department: '',
          role: '',
          category: log.module || 'General',
          changeType: log.action || 'Change',
          targetModule: log.module || '',
          targetEntity: log.entityType || log.entityId || '',
          action: log.action || 'Modified',
          fieldChanged: log.entityType || '',
          oldValue: '-',
          newValue: '-',
          ipAddress: log.ipAddress || '',
          location: '',
          device: '',
          approvalStatus: log.status || 'Pending',
          reason: log.description || '',
          impact: log.severity || 'Low',
        }));
        setChanges(mapped);
      } catch {
        setChanges([]);
      }
    };
    loadChanges();
  }, []);

  const stats: ChangeStats = {
    totalChanges: changes.length,
    userChanges: changes.filter(c => c.category === 'User Management').length,
    settingsChanges: changes.filter(c => c.category === 'System Settings').length,
    dataChanges: changes.filter(c => c.category === 'Master Data').length,
    pendingApproval: changes.filter(c => c.approvalStatus === 'Pending').length,
    criticalChanges: changes.filter(c => c.impact === 'Critical').length,
  };

  const filteredChanges = changes.filter(change => {
    const matchesCategory = filterCategory === 'all' || change.category === filterCategory;
    const matchesType = filterType === 'all' || change.changeType === filterType;
    const matchesImpact = filterImpact === 'all' || change.impact === filterImpact;
    const matchesApproval = filterApproval === 'all' || change.approvalStatus === filterApproval;
    const matchesSearch = change.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         change.targetEntity.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         change.changeId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesType && matchesImpact && matchesApproval && matchesSearch;
  });

  const getImpactColor = (impact: string) => {
    switch (impact.toLowerCase()) {
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

  const getApprovalColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
      case 'auto-approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'user management':
        return <User className="w-4 h-4" />;
      case 'system settings':
        return <Settings className="w-4 h-4" />;
      case 'master data':
        return <Database className="w-4 h-4" />;
      case 'security':
        return <Shield className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'created':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'modified':
        return <Edit className="w-4 h-4 text-blue-600" />;
      case 'deleted':
        return <Trash2 className="w-4 h-4 text-red-600" />;
      default:
        return <History className="w-4 h-4 text-gray-600" />;
    }
  };

  const handleViewDetails = (change: SystemChangeLog) => {
    setSelectedChange(change);
    showToast(`Viewing change details: ${change.changeId}`, 'info');
  };

  const handleExport = () => {
    exportToCsv('system-changes', filteredChanges as unknown as Record<string, unknown>[]);
  };

  const handleCloseDetails = () => {
    setSelectedChange(null);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-gray-50 via-cyan-50 to-blue-50">
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
            <div className="p-2 bg-cyan-100 rounded-lg">
              <History className="w-6 h-6 text-cyan-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">System Changes Audit</h1>
              <p className="text-gray-600">Track all system configuration and data changes</p>
            </div>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-cyan-300 text-cyan-700 rounded-lg hover:bg-cyan-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export Logs
          </button>
        </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-2">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Total Changes</span>
            <History className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.totalChanges}</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">User Changes</span>
            <User className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-600">{stats.userChanges}</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Settings</span>
            <Settings className="w-4 h-4 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-600">{stats.settingsChanges}</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Data Changes</span>
            <Database className="w-4 h-4 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-orange-600">{stats.dataChanges}</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Pending</span>
            <AlertTriangle className="w-4 h-4 text-yellow-600" />
          </div>
          <div className="text-2xl font-bold text-yellow-600">{stats.pendingApproval}</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Critical</span>
            <Shield className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl font-bold text-red-600">{stats.criticalChanges}</div>
        </div>
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
          <div className="flex-1 min-w-[250px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by user, entity, or change ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          >
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="custom">Custom Range</option>
          </select>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            <option value="User Management">User Management</option>
            <option value="System Settings">System Settings</option>
            <option value="Master Data">Master Data</option>
            <option value="Security">Security</option>
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="Role Assignment">Role Assignment</option>
            <option value="Configuration Change">Configuration</option>
            <option value="Data Update">Data Update</option>
            <option value="Security Policy">Security Policy</option>
            <option value="User Creation">User Creation</option>
            <option value="User Deactivation">Deactivation</option>
          </select>
          <select
            value={filterImpact}
            onChange={(e) => setFilterImpact(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          >
            <option value="all">All Impact</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          <select
            value={filterApproval}
            onChange={(e) => setFilterApproval(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="Approved">Approved</option>
            <option value="Pending">Pending</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="flex-1 overflow-auto">
          <table className="w-full">
            <thead className="sticky top-0 bg-gray-50 z-10">
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Change ID</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Timestamp</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">User</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Category</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Change</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Impact</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Approval</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredChanges.map((change) => (
                <tr key={change.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <code className="text-sm bg-purple-50 text-purple-800 px-2 py-1 rounded font-medium">
                      {change.changeId}
                    </code>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2 text-sm text-gray-900">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {change.timestamp}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <div className="font-medium text-gray-900">{change.userName}</div>
                      <div className="text-xs text-gray-500">{change.department} - {change.role}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      {getCategoryIcon(change.category)}
                      <span>{change.category}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {getActionIcon(change.action)}
                        <span className="text-sm font-medium text-gray-900">{change.action}</span>
                      </div>
                      <div className="text-sm text-gray-600">{change.targetEntity}</div>
                      <div className="text-xs text-gray-500">{change.fieldChanged}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getImpactColor(change.impact)}`}>
                      {change.impact}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getApprovalColor(change.approvalStatus)}`}>
                      {change.approvalStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleViewDetails(change)}
                      className="text-cyan-600 hover:text-cyan-700 p-1"
                     
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

        {filteredChanges.length === 0 && (
          <div className="text-center py-12">
            <History className="w-12 h-12 text-gray-400 mb-3" />
            <p className="text-gray-600">No change logs found matching your criteria</p>
          </div>
        )}
      </div>
        </div>
      </div>

      {/* Details Modal */}
      {selectedChange && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-xl shadow-xl  w-full max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between p-3 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Change Details</h3>
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
                  <label className="block text-sm font-medium text-gray-600 mb-1">Change ID</label>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <code className="text-sm font-medium text-purple-800">{selectedChange.changeId}</code>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Timestamp</label>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-gray-900">{selectedChange.timestamp}</div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Changed By</label>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="font-medium text-gray-900">{selectedChange.userName}</div>
                    <div className="text-sm text-gray-600">{selectedChange.email}</div>
                    <div className="text-sm text-gray-500">{selectedChange.department} - {selectedChange.role}</div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Category & Type</label>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      {getCategoryIcon(selectedChange.category)}
                      <span className="text-gray-900">{selectedChange.category}</span>
                    </div>
                    <div className="text-sm text-gray-600">{selectedChange.changeType}</div>
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Target Entity</label>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="font-medium text-gray-900">{selectedChange.targetEntity}</div>
                    <div className="text-sm text-gray-600">Module: {selectedChange.targetModule}</div>
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Change Details</label>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Action</div>
                        <div className="flex items-center gap-2">
                          {getActionIcon(selectedChange.action)}
                          <span className="font-medium text-gray-900">{selectedChange.action}</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Field</div>
                        <div className="font-medium text-gray-900">{selectedChange.fieldChanged}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Impact</div>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getImpactColor(selectedChange.impact)}`}>
                          {selectedChange.impact}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Old Value</label>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <code className="text-sm text-red-800">{selectedChange.oldValue}</code>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">New Value</label>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <code className="text-sm text-green-800">{selectedChange.newValue}</code>
                  </div>
                </div>

                {selectedChange.reason && (
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-600 mb-1">Reason</label>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-800">{selectedChange.reason}</p>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Approval Status</label>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getApprovalColor(selectedChange.approvalStatus)}`}>
                      {selectedChange.approvalStatus}
                    </span>
                    {selectedChange.approvedBy && (
                      <div className="mt-2 text-sm text-gray-600">
                        Approved by: {selectedChange.approvedBy}
                        <div className="text-xs text-gray-500">{selectedChange.approvalDate}</div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Location</label>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <code className="text-sm bg-white px-2 py-1 rounded border border-gray-200">{selectedChange.ipAddress}</code>
                    <div className="text-sm text-gray-600 mt-2">{selectedChange.location}</div>
                    <div className="text-sm text-gray-500">{selectedChange.device}</div>
                  </div>
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemChangesAuditPage;
