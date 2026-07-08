'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, RefreshCw, ToggleLeft, ToggleRight, Clock, CheckCircle, Settings, AlertTriangle, Calendar, Package, TrendingUp, Zap, Trash2 } from 'lucide-react';
import { inventoryService } from '@/services/InventoryService';

interface AutoReplenishmentConfig {
  id: string;
  configName: string;
  description: string;
  category: string;
  itemPattern: string;
  enabled: boolean;
  schedule: 'realtime' | 'hourly' | 'daily' | 'weekly';
  autoApprove: boolean;
  maxOrderValue: number;
  notifyUsers: string[];
  lastRun: string;
  nextRun: string;
  totalRequests: number;
  successRate: number;
}

interface AutoReplenishmentLog {
  id: string;
  timestamp: string;
  itemCode: string;
  itemName: string;
  action: 'created' | 'approved' | 'skipped' | 'failed';
  quantity: number;
  uom: string;
  reason: string;
  config: string;
}

export default function AutoReplenishmentPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'configs' | 'logs'>('configs');

  // Configs loaded from GET /inventory/replenishment/configs.
  const [configs, setConfigs] = useState<AutoReplenishmentConfig[]>([]);

  // Activity logs derived from GET /inventory/reorder/suggestions.
  const [logs, setLogs] = useState<AutoReplenishmentLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [busyConfigId, setBusyConfigId] = useState<string | null>(null);
  const [showNewConfig, setShowNewConfig] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newConfig, setNewConfig] = useState({
    configName: '',
    description: '',
    category: '',
    itemPattern: '',
    schedule: 'daily' as AutoReplenishmentConfig['schedule'],
    autoApprove: false,
    maxOrderValue: 0,
  });

  const mapConfig = (c: any, i: number): AutoReplenishmentConfig => ({
    id: String(c.id ?? i),
    configName: c.configName ?? '',
    description: c.description ?? '',
    category: c.category ?? '',
    itemPattern: c.itemPattern ?? '',
    enabled: c.enabled !== false,
    schedule: (c.schedule ?? 'daily') as AutoReplenishmentConfig['schedule'],
    autoApprove: Boolean(c.autoApprove),
    maxOrderValue: Number(c.maxOrderValue ?? 0),
    notifyUsers: Array.isArray(c.notifyUsers) ? c.notifyUsers : [],
    lastRun: c.lastRun ?? '—',
    nextRun: c.nextRun ?? '—',
    totalRequests: Number(c.totalRequests ?? 0),
    successRate: Number(c.successRate ?? 0),
  });

  const loadConfigs = async (): Promise<AutoReplenishmentConfig[]> => {
    const raw = (await inventoryService.getReplenishmentConfigs()) as any[];
    return (raw || []).map(mapConfig);
  };

  useEffect(() => {
    let cancelled = false;
    const loadCfgs = async () => {
      try {
        const mapped = await loadConfigs();
        if (!cancelled) setConfigs(mapped);
      } catch (err) {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : 'Failed to load configurations');
      }
    };
    loadCfgs();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      try {
        const raw = (await inventoryService.getReorderSuggestions()) as any[];
        const actionMap: Record<string, AutoReplenishmentLog['action']> = {
          suggested: 'created', pending: 'created', created: 'created',
          approved: 'approved', ordered: 'approved',
          skipped: 'skipped', ignored: 'skipped',
          failed: 'failed', rejected: 'failed',
        };
        const mapped: AutoReplenishmentLog[] = (raw || []).map((s: any, i: number) => ({
          id: String(s.id ?? i),
          timestamp: s.createdAt ?? s.timestamp ?? '',
          itemCode: s.itemCode ?? '',
          itemName: s.itemName ?? '',
          action: actionMap[s.status] ?? 'created',
          quantity: Number(s.suggestedQuantity ?? s.eoqQuantity ?? 0),
          uom: s.uom ?? '',
          reason: s.reason ?? '',
          config: s.vendorName ?? s.config ?? 'Reorder suggestion',
        }));
        if (!cancelled) setLogs(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load replenishment logs');
          setLogs([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const getScheduleLabel = (schedule: string) => {
    switch (schedule) {
      case 'realtime': return 'Real-time';
      case 'hourly': return 'Hourly';
      case 'daily': return 'Daily';
      case 'weekly': return 'Weekly';
      default: return schedule;
    }
  };

  const getScheduleColor = (schedule: string) => {
    switch (schedule) {
      case 'realtime': return 'bg-red-100 text-red-700';
      case 'hourly': return 'bg-orange-100 text-orange-700';
      case 'daily': return 'bg-blue-100 text-blue-700';
      case 'weekly': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'created': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'approved': return 'bg-green-100 text-green-700 border-green-200';
      case 'skipped': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'failed': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created': return <Package className="w-3 h-3" />;
      case 'approved': return <CheckCircle className="w-3 h-3" />;
      case 'skipped': return <Clock className="w-3 h-3" />;
      case 'failed': return <AlertTriangle className="w-3 h-3" />;
      default: return null;
    }
  };

  // Real toggle via PATCH /inventory/replenishment/configs/:id/toggle.
  const handleToggleConfig = async (id: string) => {
    const config = configs.find((c) => c.id === id);
    if (!config) return;
    const nextEnabled = !config.enabled;
    setBusyConfigId(id);
    setActionError(null);
    setActionSuccess(null);
    try {
      await inventoryService.toggleReplenishmentConfig(id, nextEnabled);
      setConfigs((prev) => prev.map((c) => (c.id === id ? { ...c, enabled: nextEnabled } : c)));
      setActionSuccess(`Configuration ${nextEnabled ? 'enabled' : 'disabled'}.`);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to toggle configuration.');
    } finally {
      setBusyConfigId(null);
    }
  };

  // Real delete via DELETE /inventory/replenishment/configs/:id.
  const handleEditConfig = async (id: string) => {
    setBusyConfigId(id);
    setActionError(null);
    setActionSuccess(null);
    try {
      await inventoryService.deleteReplenishmentConfig(id);
      setConfigs((prev) => prev.filter((c) => c.id !== id));
      setActionSuccess('Configuration deleted.');
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to delete configuration.');
    } finally {
      setBusyConfigId(null);
    }
  };

  const handleCreateConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newConfig.configName.trim()) {
      setActionError('Configuration name is required.');
      return;
    }
    setCreating(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      await inventoryService.createReplenishmentConfig({
        ...newConfig,
        maxOrderValue: Number(newConfig.maxOrderValue) || 0,
      });
      const mapped = await loadConfigs();
      setConfigs(mapped);
      setActionSuccess('Configuration created.');
      setShowNewConfig(false);
      setNewConfig({ configName: '', description: '', category: '', itemPattern: '', schedule: 'daily', autoApprove: false, maxOrderValue: 0 });
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to create configuration.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-3 py-2">
      {loadError && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {loadError}
        </div>
      )}
      {actionError && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {actionError}
        </div>
      )}
      {actionSuccess && (
        <div className="mb-3 rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700">
          {actionSuccess}
        </div>
      )}
      {isLoading && (
        <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">
          Loading replenishment logs…
        </div>
      )}
      <div className="mb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-2">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Auto Replenishment</h1>
            <p className="text-sm text-gray-500 mt-1">Automated inventory replenishment system</p>
          </div>
        </div>
        <button
          onClick={() => { setShowNewConfig((s) => !s); setActionError(null); setActionSuccess(null); }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>New Configuration</span>
        </button>
      </div>

      {showNewConfig && (
        <form onSubmit={handleCreateConfig} className="bg-white rounded-xl border border-gray-200 p-4 mb-3 space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">New Auto-Replenishment Configuration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Config Name <span className="text-red-500">*</span></label>
              <input type="text" value={newConfig.configName} onChange={(e) => setNewConfig({ ...newConfig, configName: e.target.value })} required className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Item Pattern</label>
              <input type="text" value={newConfig.itemPattern} onChange={(e) => setNewConfig({ ...newConfig, itemPattern: e.target.value })} placeholder="e.g. RM-*" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input type="text" value={newConfig.description} onChange={(e) => setNewConfig({ ...newConfig, description: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <input type="text" value={newConfig.category} onChange={(e) => setNewConfig({ ...newConfig, category: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Schedule</label>
              <select value={newConfig.schedule} onChange={(e) => setNewConfig({ ...newConfig, schedule: e.target.value as AutoReplenishmentConfig['schedule'] })} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option value="realtime">Real-time</option>
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Order Value</label>
              <input type="number" min="0" value={newConfig.maxOrderValue} onChange={(e) => setNewConfig({ ...newConfig, maxOrderValue: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div className="flex items-center gap-2">
              <input id="cfgAutoApprove" type="checkbox" checked={newConfig.autoApprove} onChange={(e) => setNewConfig({ ...newConfig, autoApprove: e.target.checked })} />
              <label htmlFor="cfgAutoApprove" className="text-sm font-medium text-gray-700">Auto-Approve</label>
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={creating} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {creating ? 'Creating…' : 'Create Configuration'}
            </button>
            <button type="button" onClick={() => setShowNewConfig(false)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Active Configs</p>
              <p className="text-3xl font-bold text-green-900 mt-1">
                {configs.filter(c => c.enabled).length}
              </p>
            </div>
            <CheckCircle className="w-6 h-6 text-green-700" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Requests</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">
                {configs.reduce((sum, c) => sum + c.totalRequests, 0)}
              </p>
            </div>
            <Package className="w-6 h-6 text-blue-700" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-3 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Success Rate</p>
              <p className="text-3xl font-bold text-purple-900 mt-1">
                {(configs.length ? configs.reduce((sum, c) => sum + c.successRate, 0) / configs.length : 0).toFixed(1)}%
              </p>
            </div>
            <TrendingUp className="w-6 h-6 text-purple-700" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-3 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Real-time</p>
              <p className="text-3xl font-bold text-orange-900 mt-1">
                {configs.filter(c => c.schedule === 'realtime' && c.enabled).length}
              </p>
            </div>
            <Zap className="w-6 h-6 text-orange-700" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 mb-3">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('configs')}
              className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'configs'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Configurations
              </div>
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'logs'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Activity Logs
              </div>
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'configs' && configs.length === 0 && (
            <div className="text-center py-12">
              <Settings className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">No auto-replenishment configurations</p>
              <p className="text-sm text-gray-400 mt-1 max-w-md mx-auto">
                Use “New Configuration” to create one. Activity logs below reflect real
                reorder suggestions.
              </p>
            </div>
          )}

          {activeTab === 'configs' && configs.length > 0 && (
            <div className="space-y-2">
              {configs.map((config) => (
                <div key={config.id} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{config.configName}</h3>
                        {config.enabled ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                            <CheckCircle className="w-3 h-3" />
                            Enabled
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                            <ToggleLeft className="w-3 h-3" />
                            Disabled
                          </span>
                        )}
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getScheduleColor(config.schedule)}`}>
                          {getScheduleLabel(config.schedule)}
                        </span>
                        {config.autoApprove && (
                          <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-medium">
                            Auto-Approve
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{config.description}</p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <div>
                          <p className="text-xs text-gray-500">Category</p>
                          <p className="text-sm font-semibold text-gray-900">{config.category}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Item Pattern</p>
                          <p className="text-sm font-mono font-semibold text-blue-600">{config.itemPattern}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Max Order Value</p>
                          <p className="text-sm font-semibold text-gray-900">${config.maxOrderValue.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Last Run</p>
                          <p className="text-sm text-gray-700">{config.lastRun}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Next Run</p>
                          <p className="text-sm font-semibold text-blue-600">{config.nextRun}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Total Requests</p>
                          <p className="text-sm font-bold text-gray-900">{config.totalRequests}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Success Rate</p>
                          <p className="text-sm font-bold text-green-600">{config.successRate}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Notifications</p>
                          <p className="text-sm text-gray-700">{config.notifyUsers.length} user(s)</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleToggleConfig(config.id)}
                        disabled={busyConfigId === config.id}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                        title={config.enabled ? 'Disable' : 'Enable'}
                      >
                        {config.enabled ? (
                          <ToggleRight className="w-5 h-5 text-green-600" />
                        ) : (
                          <ToggleLeft className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                      <button
                        onClick={() => handleEditConfig(config.id)}
                        disabled={busyConfigId === config.id}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                        title="Delete configuration"
                      >
                        <Trash2 className="w-5 h-5 text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Quantity</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Configuration</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          {log.timestamp}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-semibold text-gray-900">{log.itemCode}</div>
                        <div className="text-xs text-gray-500">{log.itemName}</div>
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                        {log.quantity > 0 ? `${log.quantity} ${log.uom}` : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{log.reason}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{log.config}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getActionColor(log.action)}`}>
                          {getActionIcon(log.action)}
                          {log.action}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Auto Replenishment Features:</h3>
        <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
          <li><strong>Real-time Monitoring:</strong> Continuous monitoring of inventory levels with instant replenishment triggers</li>
          <li><strong>Scheduled Processing:</strong> Run automated checks hourly, daily, or weekly based on item criticality</li>
          <li><strong>Auto-Approval:</strong> Automatically approve and process requests within configured value limits</li>
          <li><strong>Smart Logic:</strong> Prevents duplicate orders and considers pending requisitions</li>
          <li><strong>Configurable Rules:</strong> Set item patterns, thresholds, and approval workflows per category</li>
          <li><strong>Audit Trail:</strong> Complete activity logging for compliance and troubleshooting</li>
        </ul>
      </div>
    </div>
  );
}
