'use client';

import { useState, useEffect, useCallback } from 'react';
import { Bell, AlertTriangle, Shield, Lock, Users, Activity, XCircle, CheckCircle2, Clock, Settings, Mail, Smartphone, Download, Eye, Trash2 } from 'lucide-react';
import { exportToCsv } from '@/lib/export';
import { ItAdminService, SecurityAlertDto, AlertRuleDto } from '@/services/it-admin.service';

interface SecurityAlert {
  id: string;
  type: string;
  severity: string;
  title: string;
  description: string;
  timestamp: string;
  source: string;
  ipAddress: string;
  userId?: string;
  userName?: string;
  status: string;
  actionTaken?: string;
  assignedTo?: string;
}

interface AlertRule {
  id: string;
  name: string;
  description: string;
  category: string;
  severity: string;
  enabled: boolean;
  conditions: string[];
  actions: string[];
  notifyVia: string[];
  recipients: string[];
}

const SecurityAlertsPage = () => {
  const [activeTab, setActiveTab] = useState('alerts');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const mapAlert = (a: SecurityAlertDto): SecurityAlert => ({
    id: a.id,
    type: a.type,
    severity: a.severity,
    title: a.title,
    description: a.description ?? '',
    timestamp: a.timestamp ?? a.createdAt ?? '',
    source: a.source ?? '',
    ipAddress: a.ipAddress ?? '',
    userId: a.userId,
    userName: a.userName,
    status: a.status,
    actionTaken: a.actionTaken,
    assignedTo: a.assignedTo,
  });

  const loadAlerts = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await ItAdminService.getSecurityAlerts();
      setAlerts((data ?? []).map(mapAlert));
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'Failed to load security alerts');
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [rulesLoading, setRulesLoading] = useState(true);
  const [rulesError, setRulesError] = useState<string | null>(null);

  const mapRule = (r: AlertRuleDto): AlertRule => ({
    id: r.id,
    name: r.name,
    description: r.description ?? '',
    category: r.category,
    severity: r.severity,
    enabled: r.enabled,
    conditions: r.conditions ?? [],
    actions: r.actions ?? [],
    notifyVia: r.notifyVia ?? [],
    recipients: r.recipients ?? [],
  });

  const loadRules = useCallback(async () => {
    setRulesLoading(true);
    setRulesError(null);
    try {
      const data = await ItAdminService.getAlertRules();
      setAlertRules((data ?? []).map(mapRule));
    } catch (e) {
      setRulesError(e instanceof Error ? e.message : 'Failed to load alert rules');
      setAlertRules([]);
    } finally {
      setRulesLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRules();
  }, [loadRules]);

  const stats = {
    totalAlerts: alerts.length,
    criticalAlerts: alerts.filter(a => a.severity === 'Critical').length,
    openAlerts: alerts.filter(a => a.status === 'Open').length,
    resolvedToday: alerts.filter(a => a.status === 'Resolved' && a.timestamp.includes('2025-10-21')).length,
    activeRules: alertRules.filter(r => r.enabled).length,
    failedLogins: alerts.filter(a => a.type === 'Failed Login').length,
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesSeverity = filterSeverity === 'all' || alert.severity.toLowerCase() === filterSeverity.toLowerCase();
    const matchesStatus = filterStatus === 'all' || alert.status.toLowerCase() === filterStatus.toLowerCase();
    const matchesType = filterType === 'all' || alert.type.toLowerCase() === filterType.toLowerCase();
    const matchesSearch = alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         alert.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (alert.userName && alert.userName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSeverity && matchesStatus && matchesType && matchesSearch;
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
      case 'open':
        return 'bg-red-100 text-red-800';
      case 'investigating':
        return 'bg-yellow-100 text-yellow-800';
      case 'reviewing':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'noted':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'failed login':
        return <Lock className="w-4 h-4" />;
      case 'suspicious activity':
        return <AlertTriangle className="w-4 h-4" />;
      case 'unauthorized access':
        return <XCircle className="w-4 h-4" />;
      case 'password policy':
        return <Shield className="w-4 h-4" />;
      case 'privilege escalation':
        return <Users className="w-4 h-4" />;
      case 'data access':
        return <Activity className="w-4 h-4" />;
      case '2fa':
        return <Smartphone className="w-4 h-4" />;
      case 'session':
        return <Clock className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const handleAcknowledgeAlert = async (alertId: string) => {
    setActionId(alertId);
    setBanner(null);
    try {
      const updated = await ItAdminService.updateSecurityAlert(alertId, {
        status: 'investigating',
      });
      setAlerts((prev) => prev.map((a) => (a.id === alertId ? mapAlert(updated) : a)));
      setBanner({ type: 'success', text: 'Alert acknowledged.' });
    } catch (e) {
      setBanner({ type: 'error', text: e instanceof Error ? e.message : 'Failed to acknowledge alert' });
    } finally {
      setActionId(null);
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    if (!confirm('Mark this alert as resolved?')) return;
    setActionId(alertId);
    setBanner(null);
    try {
      const updated = await ItAdminService.updateSecurityAlert(alertId, {
        status: 'resolved',
      });
      setAlerts((prev) => prev.map((a) => (a.id === alertId ? mapAlert(updated) : a)));
      setBanner({ type: 'success', text: 'Alert resolved.' });
    } catch (e) {
      setBanner({ type: 'error', text: e instanceof Error ? e.message : 'Failed to resolve alert' });
    } finally {
      setActionId(null);
    }
  };

  const handleDeleteAlert = async (alertId: string) => {
    if (!confirm('Delete this alert permanently?')) return;
    setActionId(alertId);
    setBanner(null);
    try {
      await ItAdminService.deleteSecurityAlert(alertId);
      setAlerts((prev) => prev.filter((a) => a.id !== alertId));
      setBanner({ type: 'success', text: 'Alert deleted.' });
    } catch (e) {
      setBanner({ type: 'error', text: e instanceof Error ? e.message : 'Failed to delete alert' });
    } finally {
      setActionId(null);
    }
  };

  const handleExport = () => {
    exportToCsv('security-alerts', filteredAlerts as unknown as Record<string, unknown>[]);
  };

  const handleToggleRule = async (ruleId: string) => {
    const current = alertRules.find((r) => r.id === ruleId);
    if (!current) return;
    const nextEnabled = !current.enabled;
    // Optimistic update, reverting on failure.
    setAlertRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, enabled: nextEnabled } : r)),
    );
    setBanner(null);
    try {
      const updated = await ItAdminService.updateAlertRule(ruleId, { enabled: nextEnabled });
      setAlertRules((prev) => prev.map((r) => (r.id === ruleId ? mapRule(updated) : r)));
      setBanner({ type: 'success', text: `Rule ${nextEnabled ? 'enabled' : 'disabled'}.` });
    } catch (e) {
      setAlertRules((prev) =>
        prev.map((r) => (r.id === ruleId ? { ...r, enabled: current.enabled } : r)),
      );
      setBanner({ type: 'error', text: e instanceof Error ? e.message : 'Failed to update rule' });
    }
  };

  return (
    <div className="p-6 max-w-[1600px]">
      {/* Header */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Bell className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Security Alerts</h1>
              <p className="text-gray-600">Monitor and manage security incidents and alerts</p>
            </div>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

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
      {loading && (
        <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">Loading security alerts...</div>
      )}
      {loadError && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{loadError}</div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-2 mb-3">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Total Alerts</span>
            <Bell className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.totalAlerts}</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Critical</span>
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl font-bold text-red-600">{stats.criticalAlerts}</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Open</span>
            <XCircle className="w-4 h-4 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-orange-600">{stats.openAlerts}</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Resolved Today</span>
            <CheckCircle2 className="w-4 h-4 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-600">{stats.resolvedToday}</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Active Rules</span>
            <Settings className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-600">{stats.activeRules}</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Failed Logins</span>
            <Lock className="w-4 h-4 text-yellow-600" />
          </div>
          <div className="text-2xl font-bold text-yellow-600">{stats.failedLogins}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-3">
        <div className="border-b border-gray-200">
          <div className="flex gap-2 px-6">
            <button
              onClick={() => setActiveTab('alerts')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'alerts'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Active Alerts
            </button>
            <button
              onClick={() => setActiveTab('rules')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'rules'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Alert Rules
            </button>
          </div>
        </div>

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <div className="p-6">
            {/* Filters */}
            <div className="flex flex-wrap gap-2 mb-3">
              <div className="flex-1 min-w-[300px]">
                <input
                  type="text"
                  placeholder="Search alerts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="all">All Severity</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="investigating">Investigating</option>
                <option value="reviewing">Reviewing</option>
                <option value="resolved">Resolved</option>
              </select>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="failed login">Failed Login</option>
                <option value="suspicious activity">Suspicious Activity</option>
                <option value="unauthorized access">Unauthorized Access</option>
                <option value="password policy">Password Policy</option>
                <option value="privilege escalation">Privilege Escalation</option>
              </select>
            </div>

            {/* Alerts List */}
            <div className="space-y-2">
              {filteredAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`border-2 rounded-lg p-3 ${getSeverityColor(alert.severity)}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`p-2 rounded-lg ${getSeverityColor(alert.severity)}`}>
                        {getTypeIcon(alert.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{alert.title}</h3>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(alert.status)}`}>
                            {alert.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{alert.description}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                          <div>
                            <span className="text-gray-600">Type:</span>
                            <span className="ml-1 font-medium text-gray-900">{alert.type}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Severity:</span>
                            <span className="ml-1 font-medium text-gray-900">{alert.severity}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Source:</span>
                            <span className="ml-1 font-medium text-gray-900">{alert.source}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Time:</span>
                            <span className="ml-1 font-medium text-gray-900">{alert.timestamp}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">IP:</span>
                            <code className="ml-1 text-xs bg-white px-1 py-0.5 rounded">{alert.ipAddress}</code>
                          </div>
                          {alert.userName && (
                            <div>
                              <span className="text-gray-600">User:</span>
                              <span className="ml-1 font-medium text-gray-900">{alert.userName}</span>
                            </div>
                          )}
                          {alert.assignedTo && (
                            <div>
                              <span className="text-gray-600">Assigned:</span>
                              <span className="ml-1 font-medium text-gray-900">{alert.assignedTo}</span>
                            </div>
                          )}
                          {alert.actionTaken && (
                            <div className="col-span-2">
                              <span className="text-gray-600">Action:</span>
                              <span className="ml-1 font-medium text-gray-900">{alert.actionTaken}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      {alert.status.toLowerCase() !== 'resolved' && alert.status.toLowerCase() !== 'investigating' && (
                        <button
                          onClick={() => handleAcknowledgeAlert(alert.id)}
                          disabled={actionId === alert.id}
                          title="Acknowledge"
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                      {alert.status.toLowerCase() !== 'resolved' && (
                        <button
                          onClick={() => handleResolveAlert(alert.id)}
                          disabled={actionId === alert.id}
                          title="Resolve"
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteAlert(alert.id)}
                        disabled={actionId === alert.id}
                        title="Delete"
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredAlerts.length === 0 && (
              <div className="text-center py-12">
                <Bell className="w-12 h-12 text-gray-400 mb-3" />
                <p className="text-gray-600">No security alerts found matching your criteria</p>
              </div>
            )}
          </div>
        )}

        {/* Alert Rules Tab */}
        {activeTab === 'rules' && (
          <div className="p-6">
            {rulesLoading && (
              <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">Loading alert rules...</div>
            )}
            {rulesError && (
              <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{rulesError}</div>
            )}
            {!rulesLoading && !rulesError && alertRules.length === 0 && (
              <div className="text-center py-12">
                <Settings className="w-12 h-12 text-gray-400 mb-3 mx-auto" />
                <p className="text-gray-600">No alert rules configured</p>
              </div>
            )}
            <div className="space-y-2">
              {alertRules.map((rule) => (
                <div key={rule.id} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{rule.name}</h3>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(rule.severity)}`}>
                          {rule.severity}
                        </span>
                        <span className="text-sm text-gray-600">{rule.category}</span>
                      </div>
                      <p className="text-sm text-gray-700 mb-3">{rule.description}</p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Conditions:</h4>
                          <ul className="space-y-1">
                            {rule.conditions.map((condition, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-gray-700">
                                <span className="text-blue-600 mt-0.5">•</span>
                                <span>{condition}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Actions:</h4>
                          <ul className="space-y-1">
                            {rule.actions.map((action, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-gray-700">
                                <span className="text-green-600 mt-0.5">•</span>
                                <span>{action}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Notify Via:</h4>
                          <div className="flex flex-wrap gap-2">
                            {rule.notifyVia.map((method, idx) => (
                              <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                                {method === 'Email' && <Mail className="w-3 h-3" />}
                                {method === 'SMS' && <Smartphone className="w-3 h-3" />}
                                {method}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Recipients:</h4>
                          <div className="flex flex-wrap gap-2">
                            {rule.recipients.map((recipient, idx) => (
                              <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                {recipient}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 ml-4">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={rule.enabled}
                          onChange={() => handleToggleRule(rule.id)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        <span className="ml-3 text-sm font-medium text-gray-700">
                          {rule.enabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SecurityAlertsPage;
