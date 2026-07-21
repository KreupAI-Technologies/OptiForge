'use client';

import { useState, useEffect, useCallback } from 'react';
import { Shield, Plus, Trash2, CheckCircle2, XCircle, Globe, MapPin, Building, User, Clock, Download, Save } from 'lucide-react';
import { exportToCsv } from '@/lib/export';
import { ItAdminService } from '@/services/it-admin.service';

interface IPWhitelistEntry {
  id: string;
  ipAddress: string;
  type: string;
  description: string;
  category: string;
  addedBy: string;
  addedDate: string;
  lastAccess: string;
  accessCount: number;
  status: string;
  expiresAt?: string;
}

interface IPAccessLog {
  id: string;
  ipAddress: string;
  userName: string;
  email: string;
  action: string;
  timestamp: string;
  location: string;
  device: string;
  status: string;
}

const IPWhitelistPage = () => {
  const [activeTab, setActiveTab] = useState('whitelist');
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [entries, setEntries] = useState<IPWhitelistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Add-entry form state
  const [formIp, setFormIp] = useState('');
  const [formType, setFormType] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formExpiresAt, setFormExpiresAt] = useState('');

  const loadEntries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ItAdminService.getIpWhitelist();
      setEntries(
        (Array.isArray(data) ? data : []).map((e) => ({
          id: String(e.id),
          ipAddress: e.ipAddress ?? '',
          type: e.type ?? 'Single',
          description: e.description ?? '',
          category: e.category ?? '',
          addedBy: e.addedBy ?? '',
          addedDate: e.addedDate ?? e.createdAt ?? '',
          lastAccess: e.lastAccess ?? '',
          accessCount: e.accessCount ?? 0,
          status: e.status ?? 'Active',
          expiresAt: e.expiresAt,
        })),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load IP whitelist');
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const [accessLogs, setAccessLogs] = useState<IPAccessLog[]>([]);

  // Load access/IP-related audit events. The audit log is the source of truth
  // for IP access; we surface entries that carry an IP address or an
  // authentication/access-flavoured action.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await ItAdminService.getAuditLogs({ limit: '100' });
        const logs = Array.isArray(res?.data) ? res.data : [];
        const mapped: IPAccessLog[] = logs
          .filter((log) => {
            const action = (log.action || '').toLowerCase();
            return (
              !!log.ipAddress ||
              action.includes('login') ||
              action.includes('access') ||
              action.includes('auth')
            );
          })
          .map((log) => ({
            id: log.id,
            ipAddress: log.ipAddress || '-',
            userName: log.userName || 'Unknown',
            email: '-',
            action: log.action || log.module || 'Access',
            timestamp: log.createdAt || '',
            location: '-',
            device: '-',
            status: log.status || 'Allowed',
          }));
        if (active) setAccessLogs(mapped);
      } catch {
        if (active) setAccessLogs([]);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const stats = {
    totalEntries: entries.length,
    activeEntries: entries.filter(e => e.status === 'Active').length,
    expiringEntries: entries.filter(e => e.status === 'Expiring').length,
    totalAccessToday: accessLogs.filter(l => l.timestamp.includes('2025-10-21')).length,
    allowedToday: accessLogs.filter(l => l.timestamp.includes('2025-10-21') && l.status === 'Allowed').length,
    blockedToday: accessLogs.filter(l => l.timestamp.includes('2025-10-21') && l.status === 'Blocked').length,
  };

  const categories = ['All', 'Office', 'VIP', 'Remote', 'Infrastructure', 'Partner', 'Temporary'];

  const filteredEntries = entries.filter(entry => {
    const matchesCategory = filterCategory === 'all' || entry.category.toLowerCase() === filterCategory.toLowerCase();
    const matchesStatus = filterStatus === 'all' || entry.status.toLowerCase() === filterStatus.toLowerCase();
    const matchesSearch = entry.ipAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         entry.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'expiring':
        return 'bg-yellow-100 text-yellow-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'allowed':
        return 'bg-green-100 text-green-800';
      case 'blocked':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'office':
        return <Building className="w-4 h-4" />;
      case 'vip':
        return <User className="w-4 h-4" />;
      case 'remote':
        return <Globe className="w-4 h-4" />;
      case 'infrastructure':
        return <Shield className="w-4 h-4" />;
      case 'partner':
        return <MapPin className="w-4 h-4" />;
      case 'temporary':
        return <Clock className="w-4 h-4" />;
      default:
        return <Shield className="w-4 h-4" />;
    }
  };

  const handleAddEntry = () => {
    setFormIp('');
    setFormType('');
    setFormDescription('');
    setFormCategory('');
    setFormExpiresAt('');
    setShowAddModal(true);
  };

  const handleDeleteEntry = async (id: string) => {
    if (!confirm('Are you sure you want to remove this IP from the whitelist?')) return;
    setDeletingId(id);
    setBanner(null);
    try {
      await ItAdminService.deleteIpWhitelistEntry(id);
      setEntries((prev) => prev.filter((e) => e.id !== id));
      setBanner({ type: 'success', text: 'IP entry removed successfully.' });
    } catch (err) {
      setBanner({ type: 'error', text: err instanceof Error ? err.message : 'Failed to remove IP entry' });
    } finally {
      setDeletingId(null);
    }
  };

  const handleExport = () => {
    exportToCsv('ip-whitelist', filteredEntries as unknown as Record<string, unknown>[]);
  };

  const handleSaveEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setBanner(null);
    try {
      await ItAdminService.createIpWhitelistEntry({
        ipAddress: formIp,
        type: formType || undefined,
        description: formDescription || undefined,
        category: formCategory || undefined,
        expiresAt: formExpiresAt || undefined,
        status: 'Active',
      });
      setShowAddModal(false);
      setBanner({ type: 'success', text: 'IP entry added successfully.' });
      await loadEntries();
    } catch (err) {
      setBanner({ type: 'error', text: err instanceof Error ? err.message : 'Failed to add IP entry' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-[1600px]">
      {loading && (
        <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">Loading IP whitelist...</div>
      )}
      {error && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>
      )}
      {banner && (
        <div
          className={`mb-3 rounded-lg border px-4 py-2 text-sm ${
            banner.type === 'success'
              ? 'border-green-200 bg-green-50 text-green-700'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {banner.text}
        </div>
      )}
      {/* Header */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">IP Whitelist</h1>
              <p className="text-gray-600">Manage allowed IP addresses and access control</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={handleAddEntry}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add IP Entry
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-2 mb-3">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Total Entries</span>
            <Shield className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.totalEntries}</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Active</span>
            <CheckCircle2 className="w-4 h-4 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-600">{stats.activeEntries}</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Expiring Soon</span>
            <Clock className="w-4 h-4 text-yellow-600" />
          </div>
          <div className="text-2xl font-bold text-yellow-600">{stats.expiringEntries}</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Access Today</span>
            <Globe className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-600">{stats.totalAccessToday}</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Allowed Today</span>
            <CheckCircle2 className="w-4 h-4 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-600">{stats.allowedToday}</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Blocked Today</span>
            <XCircle className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl font-bold text-red-600">{stats.blockedToday}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-3">
        <div className="border-b border-gray-200">
          <div className="flex gap-2 px-6">
            <button
              onClick={() => setActiveTab('whitelist')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'whitelist'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              IP Whitelist
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'logs'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Access Logs
            </button>
          </div>
        </div>

        {/* Whitelist Tab */}
        {activeTab === 'whitelist' && (
          <div className="p-6">
            {/* Filters */}
            <div className="flex flex-wrap gap-2 mb-3">
              <div className="flex-1 min-w-[300px]">
                <input
                  type="text"
                  placeholder="Search by IP or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat.toLowerCase()}>{cat}</option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="expiring">Expiring</option>
                <option value="expired">Expired</option>
              </select>
            </div>

            {/* Entries Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">IP Address</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Type</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Description</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Category</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Added By</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Added Date</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Last Access</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Access Count</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Status</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEntries.map((entry) => (
                    <tr key={entry.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">{entry.ipAddress}</code>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-600">{entry.type}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-900">{entry.description}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(entry.category)}
                          <span className="text-sm text-gray-600">{entry.category}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{entry.addedBy}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{entry.addedDate}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{entry.lastAccess}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{entry.accessCount.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <div>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(entry.status)}`}>
                            {entry.status}
                          </span>
                          {entry.expiresAt && (
                            <div className="text-xs text-gray-500 mt-1">
                              Expires: {entry.expiresAt}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDeleteEntry(entry.id)}
                          disabled={deletingId === entry.id}
                          title="Remove"
                          className="text-red-600 hover:text-red-700 p-1 disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredEntries.length === 0 && (
              <div className="text-center py-12">
                <Shield className="w-12 h-12 text-gray-400 mb-3" />
                <p className="text-gray-600">No IP entries found matching your criteria</p>
              </div>
            )}
          </div>
        )}

        {/* Access Logs Tab */}
        {activeTab === 'logs' && (
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">IP Address</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">User</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Action</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Timestamp</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Location</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Device</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {accessLogs.map((log) => (
                    <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">{log.ipAddress}</code>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{log.userName}</div>
                          {log.email !== '-' && (
                            <div className="text-xs text-gray-500">{log.email}</div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{log.action}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{log.timestamp}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          {log.location}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{log.device}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {accessLogs.length === 0 && (
              <div className="text-center py-12">
                <Globe className="w-12 h-12 text-gray-400 mb-3" />
                <p className="text-gray-600">No access logs found</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Entry Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4">
            <div className="flex items-center justify-between p-3 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Add IP Whitelist Entry</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSaveEntry} className="p-6">
              <div className="space-y-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    IP Address or Range *
                  </label>
                  <input
                    type="text"
                    required
                    value={formIp}
                    onChange={(e) => setFormIp(e.target.value)}
                    placeholder="e.g., 192.168.1.100 or 192.168.1.0/24"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter a single IP address or CIDR notation for range
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type *
                  </label>
                  <select
                    required
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Select type</option>
                    <option value="single">Single IP</option>
                    <option value="range">IP Range</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <input
                    type="text"
                    required
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="e.g., Corporate Office Network"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    required
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Select category</option>
                    <option value="office">Office</option>
                    <option value="vip">VIP</option>
                    <option value="remote">Remote</option>
                    <option value="infrastructure">Infrastructure</option>
                    <option value="partner">Partner</option>
                    <option value="temporary">Temporary</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiration Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={formExpiresAt}
                    onChange={(e) => setFormExpiresAt(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty for permanent access
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-60"
                >
                  <Save className="w-4 h-4" />
                  {submitting ? 'Adding...' : 'Add Entry'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default IPWhitelistPage;
