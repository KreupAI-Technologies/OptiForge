'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Search, Settings, Plus, Edit, Trash2, ToggleLeft, ToggleRight, CheckCircle, AlertTriangle } from 'lucide-react';
import { inventoryService } from '@/services/InventoryService';

interface ReplenishmentRule {
  id: string;
  ruleName: string;
  description: string;
  category: string;
  itemFilter: string;
  method: 'reorder-point' | 'min-max' | 'consumption-based' | 'economic-order-qty';
  autoApprove: boolean;
  priority: 'critical' | 'high' | 'medium' | 'low';
  supplier: string;
  leadTimeDays: number;
  safetyStockDays: number;
  isActive: boolean;
  createdDate: string;
  lastModified: string;
}

export default function ReplenishmentRulesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Derived from GET /inventory/reorder/analysis (one rule row per analysed item).
  const [rules, setRules] = useState<ReplenishmentRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busyRuleId, setBusyRuleId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [showNewRule, setShowNewRule] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newRule, setNewRule] = useState({
    ruleName: '',
    description: '',
    category: 'Raw Materials',
    itemFilter: '',
    method: 'reorder-point' as ReplenishmentRule['method'],
    priority: 'medium' as ReplenishmentRule['priority'],
    supplier: '',
    leadTimeDays: 0,
    safetyStockDays: 0,
    autoApprove: false,
  });

  const mapRule = (r: any, i: number): ReplenishmentRule => ({
    id: String(r.id ?? i),
    ruleName: r.ruleName ?? '',
    description: r.description ?? '',
    category: r.category ?? '',
    itemFilter: r.itemFilter ?? '',
    method: (r.method ?? 'reorder-point') as ReplenishmentRule['method'],
    autoApprove: Boolean(r.autoApprove),
    priority: (r.priority ?? 'medium') as ReplenishmentRule['priority'],
    supplier: r.supplier ?? 'Any Available',
    leadTimeDays: Number(r.leadTimeDays ?? 0),
    safetyStockDays: Number(r.safetyStockDays ?? 0),
    isActive: r.isActive !== false,
    createdDate: r.createdAt ?? '',
    lastModified: r.updatedAt ?? r.createdAt ?? '',
  });

  const loadRules = async (): Promise<ReplenishmentRule[]> => {
    const raw = (await inventoryService.getReorderRules()) as any[];
    return (raw || []).map(mapRule);
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const mapped = await loadRules();
        if (!cancelled) setRules(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load replenishment rules');
          setRules([]);
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

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRule.ruleName.trim()) {
      setActionError('Rule name is required.');
      return;
    }
    setCreating(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      await inventoryService.createReorderRule({
        ...newRule,
        leadTimeDays: Number(newRule.leadTimeDays) || 0,
        safetyStockDays: Number(newRule.safetyStockDays) || 0,
      });
      const mapped = await loadRules();
      setRules(mapped);
      setActionSuccess('Rule created.');
      setShowNewRule(false);
      setNewRule({
        ruleName: '', description: '', category: 'Raw Materials', itemFilter: '',
        method: 'reorder-point', priority: 'medium', supplier: '',
        leadTimeDays: 0, safetyStockDays: 0, autoApprove: false,
      });
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to create rule.');
    } finally {
      setCreating(false);
    }
  };

  const filteredRules = rules.filter(rule => {
    const matchesSearch = rule.ruleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         rule.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         rule.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || rule.category === filterCategory;
    const matchesStatus = filterStatus === 'all' ||
                         (filterStatus === 'active' && rule.isActive) ||
                         (filterStatus === 'inactive' && !rule.isActive);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getMethodLabel = (method: string) => {
    switch (method) {
      case 'reorder-point': return 'Reorder Point';
      case 'min-max': return 'Min-Max';
      case 'consumption-based': return 'Consumption Based';
      case 'economic-order-qty': return 'EOQ';
      default: return method;
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'reorder-point': return 'bg-blue-100 text-blue-700';
      case 'min-max': return 'bg-purple-100 text-purple-700';
      case 'consumption-based': return 'bg-green-100 text-green-700';
      case 'economic-order-qty': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // NEEDS BACKEND: the reorder_rules table has no update/toggle endpoint yet
  // (only create + delete are exposed). Toggle/Edit stay disabled no-ops.
  const handleToggleActive = (_ruleId: string) => {
    setActionSuccess(null);
    setActionError('Editing a rule is not yet supported — only create and delete endpoints exist.');
  };
  const handleEditRule = (_ruleId: string) => {
    setActionSuccess(null);
    setActionError('Editing a rule is not yet supported — only create and delete endpoints exist.');
  };

  // Real DELETE via DELETE /inventory/replenishment/rules/:id.
  const handleDeleteRule = async (ruleId: string) => {
    setBusyRuleId(ruleId);
    setActionError(null);
    setActionSuccess(null);
    try {
      await inventoryService.deleteReorderRule(ruleId);
      setRules((prev) => prev.filter((r) => r.id !== ruleId));
      setActionSuccess('Rule deleted.');
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to delete rule.');
    } finally {
      setBusyRuleId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-3 py-2">
      {loadError && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {loadError}
        </div>
      )}
      {isLoading && (
        <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">
          Loading rules…
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
      <div className="mb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-2">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Replenishment Rules</h1>
            <p className="text-sm text-gray-500 mt-1">Configure automated replenishment rules and policies</p>
          </div>
        </div>
        <button
          onClick={() => { setShowNewRule((s) => !s); setActionError(null); setActionSuccess(null); }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Rule</span>
        </button>
      </div>

      {showNewRule && (
        <form onSubmit={handleCreateRule} className="bg-white rounded-xl border border-gray-200 p-4 mb-3 space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">New Replenishment Rule</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rule Name <span className="text-red-500">*</span></label>
              <input type="text" value={newRule.ruleName} onChange={(e) => setNewRule({ ...newRule, ruleName: e.target.value })} required className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Item Filter</label>
              <input type="text" value={newRule.itemFilter} onChange={(e) => setNewRule({ ...newRule, itemFilter: e.target.value })} placeholder="e.g. RM-*" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input type="text" value={newRule.description} onChange={(e) => setNewRule({ ...newRule, description: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select value={newRule.category} onChange={(e) => setNewRule({ ...newRule, category: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option>Raw Materials</option>
                <option>Components</option>
                <option>Consumables</option>
                <option>High-Value Parts</option>
                <option>Fast-Moving</option>
                <option>Seasonal</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Method</label>
              <select value={newRule.method} onChange={(e) => setNewRule({ ...newRule, method: e.target.value as ReplenishmentRule['method'] })} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option value="reorder-point">Reorder Point</option>
                <option value="min-max">Min-Max</option>
                <option value="consumption-based">Consumption Based</option>
                <option value="economic-order-qty">EOQ</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select value={newRule.priority} onChange={(e) => setNewRule({ ...newRule, priority: e.target.value as ReplenishmentRule['priority'] })} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
              <input type="text" value={newRule.supplier} onChange={(e) => setNewRule({ ...newRule, supplier: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lead Time (days)</label>
              <input type="number" min="0" value={newRule.leadTimeDays} onChange={(e) => setNewRule({ ...newRule, leadTimeDays: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Safety Stock (days)</label>
              <input type="number" min="0" value={newRule.safetyStockDays} onChange={(e) => setNewRule({ ...newRule, safetyStockDays: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div className="flex items-center gap-2">
              <input id="autoApprove" type="checkbox" checked={newRule.autoApprove} onChange={(e) => setNewRule({ ...newRule, autoApprove: e.target.checked })} />
              <label htmlFor="autoApprove" className="text-sm font-medium text-gray-700">Auto-Approve</label>
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={creating} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {creating ? 'Creating…' : 'Create Rule'}
            </button>
            <button type="button" onClick={() => setShowNewRule(false)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Rules</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">{rules.length}</p>
            </div>
            <Settings className="w-6 h-6 text-blue-700" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Active</p>
              <p className="text-3xl font-bold text-green-900 mt-1">
                {rules.filter(r => r.isActive).length}
              </p>
            </div>
            <CheckCircle className="w-6 h-6 text-green-700" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-3 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Auto-Approve</p>
              <p className="text-3xl font-bold text-orange-900 mt-1">
                {rules.filter(r => r.autoApprove).length}
              </p>
            </div>
            <AlertTriangle className="w-6 h-6 text-orange-700" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-3 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Inactive</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {rules.filter(r => !r.isActive).length}
              </p>
            </div>
            <ToggleLeft className="w-6 h-6 text-gray-700" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-3 mb-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search rules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            <option value="Raw Materials">Raw Materials</option>
            <option value="Components">Components</option>
            <option value="Consumables">Consumables</option>
            <option value="High-Value Parts">High-Value Parts</option>
            <option value="Fast-Moving">Fast-Moving</option>
            <option value="Seasonal">Seasonal</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        {filteredRules.map((rule) => (
          <div key={rule.id} className="bg-white rounded-xl border border-gray-200 p-3 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{rule.ruleName}</h3>
                  {rule.isActive ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      <CheckCircle className="w-3 h-3" />
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                      <ToggleLeft className="w-3 h-3" />
                      Inactive
                    </span>
                  )}
                  {rule.autoApprove && (
                    <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                      Auto-Approve
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-3">{rule.description}</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div>
                    <p className="text-xs text-gray-500">Category</p>
                    <p className="text-sm font-semibold text-gray-900">{rule.category}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Item Filter</p>
                    <p className="text-sm font-mono font-semibold text-blue-600">{rule.itemFilter}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Method</p>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getMethodColor(rule.method)}`}>
                      {getMethodLabel(rule.method)}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Priority</p>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(rule.priority)}`}>
                      {rule.priority}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Supplier</p>
                    <p className="text-sm font-semibold text-gray-900">{rule.supplier}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Lead Time</p>
                    <p className="text-sm font-semibold text-gray-900">{rule.leadTimeDays} days</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Safety Stock</p>
                    <p className="text-sm font-semibold text-gray-900">{rule.safetyStockDays} days</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Last Modified</p>
                    <p className="text-sm text-gray-600">{rule.lastModified}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => handleToggleActive(rule.id)}
                  className="p-2 rounded-lg opacity-50 cursor-not-allowed"
                  title="Edit not supported yet (no update endpoint)"
                >
                  {rule.isActive ? (
                    <ToggleRight className="w-5 h-5 text-green-600" />
                  ) : (
                    <ToggleLeft className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                <button
                  onClick={() => handleEditRule(rule.id)}
                  className="p-2 rounded-lg opacity-50 cursor-not-allowed"
                  title="Edit not supported yet (no update endpoint)"
                >
                  <Edit className="w-5 h-5 text-blue-600" />
                </button>
                <button
                  onClick={() => handleDeleteRule(rule.id)}
                  disabled={busyRuleId === rule.id}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                  title="Delete rule"
                >
                  <Trash2 className="w-5 h-5 text-red-600" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredRules.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Settings className="w-12 h-12 text-gray-400 mb-3" />
          <p className="text-gray-500">No replenishment rules found</p>
          <p className="text-sm text-gray-400 mt-1">Create a new rule to get started</p>
        </div>
      )}

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-3">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Replenishment Methods:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-blue-700">
          <div>
            <strong>Reorder Point:</strong> Creates request when stock falls below reorder point
          </div>
          <div>
            <strong>Min-Max:</strong> Maintains stock between minimum and maximum levels
          </div>
          <div>
            <strong>Consumption Based:</strong> Replenishes based on historical usage patterns
          </div>
          <div>
            <strong>Economic Order Qty (EOQ):</strong> Optimizes order quantity to minimize total costs
          </div>
        </div>
      </div>
    </div>
  );
}
