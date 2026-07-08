'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, RefreshCw, ToggleLeft, ToggleRight, Clock, CheckCircle, Settings, AlertTriangle, Calendar, Package, TrendingUp, Zap } from 'lucide-react';
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

  // NEEDS BACKEND: there is no auto-replenishment CONFIG endpoint. Configs are not
  // fetched or persisted anywhere, so we render an empty state rather than fabricated
  // rows. Once a config CRUD API exists, load it here.
  const configs: AutoReplenishmentConfig[] = [];

  // Activity logs derived from GET /inventory/reorder/suggestions.
  const [logs, setLogs] = useState<AutoReplenishmentLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
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

  // NEEDS BACKEND: no auto-replenishment config CRUD endpoint. Toggle/Edit are
  // intentionally disabled no-ops until that API exists.
  const handleToggleConfig = (_id: string) => {};
  const handleEditConfig = (_id: string) => {};

  return (
    <div className="min-h-screen bg-gray-50 px-3 py-2">
      {loadError && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {loadError}
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
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          <span>New Configuration</span>
        </button>
      </div>

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
                Creating and managing auto-replenishment configurations requires a backend
                config API, which is not yet available. Activity logs below reflect real
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
                        disabled
                        className="p-2 rounded-lg opacity-50 cursor-not-allowed"
                        title="Config toggle not supported (no backend endpoint)"
                      >
                        {config.enabled ? (
                          <ToggleRight className="w-5 h-5 text-green-600" />
                        ) : (
                          <ToggleLeft className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                      <button
                        onClick={() => handleEditConfig(config.id)}
                        disabled
                        className="p-2 rounded-lg opacity-50 cursor-not-allowed"
                        title="Config edit not supported (no backend endpoint)"
                      >
                        <Settings className="w-5 h-5 text-blue-600" />
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
