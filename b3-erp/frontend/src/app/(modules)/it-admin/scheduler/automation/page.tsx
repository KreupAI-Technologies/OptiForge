'use client';

import { useState, useEffect } from 'react';
import { Zap, Play, Pause, Plus, Edit, Trash2, Eye, Filter, Download, XCircle, CheckCircle2, AlertTriangle, ArrowRight, AlertCircle } from 'lucide-react';
import { exportToCsv } from '@/lib/export';
import { ItAdminService } from '@/services/it-admin.service';

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  category: string;
  trigger: string;
  triggerType: string;
  conditions: string[];
  actions: string[];
  status: string;
  enabled: boolean;
  priority: string;
  lastTriggered?: string;
  executionCount: number;
  successCount: number;
  failureCount: number;
  successRate: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface AutomationStats {
  totalRules: number;
  activeRules: number;
  pausedRules: number;
  triggeredToday: number;
  successToday: number;
  failedToday: number;
}

const SchedulerAutomationPage = () => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRule, setSelectedRule] = useState<AutomationRule | null>(null);
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

  const [rules, setRules] = useState<AutomationRule[]>([]);

  const emptyForm = {
    name: '',
    description: '',
    category: 'workflow',
    priority: 'Medium',
    enabled: true,
  };
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);

  const loadRules = async () => {
    try {
      const data = await ItAdminService.getAutomationRules();
      const mapped: AutomationRule[] = (data ?? []).map((dto) => ({
        id: dto.id,
        name: dto.name,
        description: dto.description ?? '',
        category: dto.category,
        trigger: dto.trigger ?? '',
        triggerType: dto.triggerType ?? '',
        conditions: dto.conditions ?? [],
        actions: dto.actions ?? [],
        status: dto.status,
        enabled: dto.enabled,
        priority: dto.priority,
        lastTriggered: dto.lastTriggered,
        executionCount: dto.executionCount ?? 0,
        successCount: dto.successCount ?? 0,
        failureCount: dto.failureCount ?? 0,
        successRate: dto.successRate ?? 0,
        createdBy: dto.createdBy ?? '',
        createdAt: dto.createdAt,
        updatedAt: dto.updatedAt,
      }));
      setRules(mapped);
    } catch {
      setRules([]);
    }
  };

  useEffect(() => {
    loadRules();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setIsModalOpen(true);
  };

  const openEditModal = (rule: AutomationRule) => {
    setEditingId(rule.id);
    setForm({
      name: rule.name,
      description: rule.description,
      category: rule.category,
      priority: rule.priority,
      enabled: rule.enabled,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      showToast('Rule name is required', 'error');
      return;
    }
    setIsSaving(true);
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      category: form.category,
      priority: form.priority,
      enabled: form.enabled,
      status: form.enabled ? 'Active' : 'Paused',
    };
    try {
      if (editingId) {
        await ItAdminService.updateAutomationRule(editingId, payload);
        showToast('Rule updated', 'success');
      } else {
        await ItAdminService.createAutomationRule(payload);
        showToast('Rule created', 'success');
      }
      setIsModalOpen(false);
      await loadRules();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to save rule', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (rule: AutomationRule) => {
    if (!confirm(`Delete automation rule "${rule.name}"?`)) return;
    try {
      await ItAdminService.deleteAutomationRule(rule.id);
      showToast('Rule deleted', 'success');
      await loadRules();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to delete rule', 'error');
    }
  };

  const stats: AutomationStats = {
    totalRules: rules.length,
    activeRules: rules.filter(r => r.enabled).length,
    pausedRules: rules.filter(r => !r.enabled).length,
    triggeredToday: rules.reduce((sum, r) => sum + (r.lastTriggered?.includes('2025-10-21') ? 1 : 0), 0),
    successToday: rules.reduce((sum, r) => sum + (r.lastTriggered?.includes('2025-10-21') ? r.successCount : 0), 0),
    failedToday: rules.reduce((sum, r) => sum + (r.lastTriggered?.includes('2025-10-21') ? r.failureCount : 0), 0),
  };

  const filteredRules = rules.filter(rule => {
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && rule.enabled) ||
                         (filterStatus === 'paused' && !rule.enabled);
    const matchesCategory = filterCategory === 'all' || rule.category === filterCategory;
    const matchesSearch = rule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         rule.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesCategory && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    return status === 'Active' 
      ? 'bg-green-100 text-green-800'
      : 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return 'bg-red-100 text-red-800';
      case 'High':
        return 'bg-orange-100 text-orange-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTriggerTypeIcon = (type: string) => {
    return type === 'Event' ? '⚡' : '⏰';
  };

  const handleToggleStatus = (ruleId: string) => {
    const rule = rules.find(r => r.id === ruleId);
    const newEnabled = !rule?.enabled;
    setRules(rules.map(r =>
      r.id === ruleId ? { ...r, enabled: newEnabled, status: newEnabled ? 'Active' : 'Paused' } : r
    ));
    showToast(`Rule "${rule?.name}" ${rule?.enabled ? 'paused' : 'activated'}`, 'success');
    (async () => {
      try {
        await ItAdminService.updateAutomationRule(ruleId, { enabled: newEnabled });
      } catch {
        // best-effort persistence; keep optimistic local state
      }
    })();
  };

  const handleViewDetails = (rule: AutomationRule) => {
    setSelectedRule(rule);
    showToast(`Viewing details for "${rule.name}"`, 'info');
  };

  const handleCloseDetails = () => {
    setSelectedRule(null);
  };

  const handleExport = () => {
    exportToCsv('automation-rules', filteredRules as unknown as Record<string, unknown>[]);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-gray-50 via-pink-50 to-rose-50">
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
            <div className="p-2 bg-pink-100 rounded-lg">
              <Zap className="w-6 h-6 text-pink-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Automation Rules</h1>
              <p className="text-gray-600">Create automated workflows and triggers</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-pink-300 text-pink-700 rounded-lg hover:bg-pink-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-rose-300 text-rose-700 rounded-lg hover:bg-rose-50 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Rule
            </button>
          </div>
        </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-2">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Total Rules</span>
            <Zap className="w-4 h-4 text-gray-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.totalRules}</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Active</span>
            <CheckCircle2 className="w-4 h-4 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-600">{stats.activeRules}</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Paused</span>
            <Pause className="w-4 h-4 text-gray-600" />
          </div>
          <div className="text-2xl font-bold text-gray-600">{stats.pausedRules}</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Triggered</span>
            <Play className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-600">{stats.triggeredToday}</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Success</span>
            <CheckCircle2 className="w-4 h-4 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-600">{stats.successToday}</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Failed</span>
            <XCircle className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl font-bold text-red-600">{stats.failedToday}</div>
        </div>
      </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-hidden px-6">
        <div className="h-full overflow-auto">
      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-3 mb-3">
        <div className="flex items-center gap-3 mb-2">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Filters</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex-1 min-w-[300px]">
            <input
              type="text"
              placeholder="Search automation rules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
          </select>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            <option value="Support">Support</option>
            <option value="Inventory">Inventory</option>
            <option value="Finance">Finance</option>
            <option value="HR">HR</option>
            <option value="Sales">Sales</option>
            <option value="CRM">CRM</option>
            <option value="Security">Security</option>
            <option value="Projects">Projects</option>
          </select>
        </div>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {filteredRules.map((rule) => (
          <div key={rule.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{rule.name}</h3>
                <p className="text-sm text-gray-600">{rule.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(rule.priority)}`}>
                  {rule.priority}
                </span>
              </div>
            </div>

            <div className="space-y-3 mb-2">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Trigger</label>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xl">{getTriggerTypeIcon(rule.triggerType)}</span>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{rule.trigger}</div>
                    <div className="text-xs text-gray-500">{rule.triggerType}</div>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Conditions</label>
                <div className="mt-1 space-y-1">
                  {rule.conditions.slice(0, 2).map((condition, idx) => (
                    <div key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{condition}</span>
                    </div>
                  ))}
                  {rule.conditions.length > 2 && (
                    <div className="text-xs text-gray-500 pl-6">+{rule.conditions.length - 2} more</div>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Actions</label>
                <div className="mt-1 space-y-1">
                  {rule.actions.slice(0, 2).map((action, idx) => (
                    <div key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>{action}</span>
                    </div>
                  ))}
                  {rule.actions.length > 2 && (
                    <div className="text-xs text-gray-500 pl-6">+{rule.actions.length - 2} more</div>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 mb-2">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600">Success Rate</span>
                <span className="font-semibold text-gray-900">{rule.successRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    rule.successRate >= 95 ? 'bg-green-500' : 
                    rule.successRate >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${rule.successRate}%` }}
                ></div>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                <span>{rule.executionCount} executions</span>
                <span>{rule.failureCount} failures</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(rule.status)}`}>
                {rule.status}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleStatus(rule.id)}
                  className="text-gray-600 hover:text-gray-700 p-1"
                  title={rule.enabled ? "Pause" : "Activate"}
                >
                  {rule.enabled ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => handleViewDetails(rule)}
                  className="text-gray-600 hover:text-gray-700 p-1"
                 
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button onClick={() => openEditModal(rule)} className="text-blue-600 hover:text-blue-700 p-1">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(rule)} className="text-red-600 hover:text-red-700 p-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredRules.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Zap className="w-12 h-12 text-gray-400 mb-3" />
          <p className="text-gray-600">No automation rules found</p>
        </div>
      )}

      {/* Details Modal */}
      {selectedRule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-xl shadow-xl  w-full max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between p-3 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Automation Rule Details</h3>
              <button
                onClick={handleCloseDetails}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Rule Name</label>
                  <div className="bg-gray-50 rounded-lg p-3 font-semibold text-gray-900">{selectedRule.name}</div>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
                  <div className="bg-gray-50 rounded-lg p-3 text-gray-900">{selectedRule.description}</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Category</label>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {selectedRule.category}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Priority</label>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(selectedRule.priority)}`}>
                    {selectedRule.priority}
                  </span>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-600 mb-2">Trigger</label>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{getTriggerTypeIcon(selectedRule.triggerType)}</span>
                      <div>
                        <div className="font-medium text-gray-900">{selectedRule.trigger}</div>
                        <div className="text-sm text-gray-600">{selectedRule.triggerType} Trigger</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-600 mb-2">Conditions ({selectedRule.conditions.length})</label>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-2">
                    {selectedRule.conditions.map((condition, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-900">{condition}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-600 mb-2">Actions ({selectedRule.actions.length})</label>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
                    {selectedRule.actions.map((action, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <ArrowRight className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-900">{action}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedRule.status)}`}>
                    {selectedRule.status}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Last Triggered</label>
                  <div className="bg-gray-50 rounded-lg p-3 text-gray-900">{selectedRule.lastTriggered || 'Never'}</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Success Rate</label>
                  <div className="bg-green-50 rounded-lg p-3 font-bold text-green-800">{selectedRule.successRate}%</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Total Executions</label>
                  <div className="bg-gray-50 rounded-lg p-3 text-gray-900">{selectedRule.executionCount}</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Successful</label>
                  <div className="bg-green-50 rounded-lg p-3 font-bold text-green-800">{selectedRule.successCount}</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Failed</label>
                  <div className="bg-red-50 rounded-lg p-3 font-bold text-red-800">{selectedRule.failureCount}</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Created By</label>
                  <div className="bg-gray-50 rounded-lg p-3 text-gray-900">{selectedRule.createdBy}</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Created At</label>
                  <div className="bg-gray-50 rounded-lg p-3 text-gray-900">{selectedRule.createdAt}</div>
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-5 shadow-xl">
            <h2 className="mb-4 text-lg font-bold text-gray-900">
              {editingId ? 'Edit Automation Rule' : 'Create Automation Rule'}
            </h2>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-600">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-600">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-600">Category</label>
                  <input
                    type="text"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-600">Priority</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
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
                className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-60"
              >
                {isSaving ? 'Saving...' : editingId ? 'Save Changes' : 'Create Rule'}
              </button>
            </div>
          </div>
        </div>
      )}
        </div>
      </div>
    </div>
  );
};

export default SchedulerAutomationPage;
