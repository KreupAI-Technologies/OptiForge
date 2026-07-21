'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, GitBranch, Play, Pause, Edit, Trash2, CheckCircle, ArrowRight, Mail, Bell, Database, AlertTriangle } from 'lucide-react';
import { ItAdminService, AutomationRuleDto } from '@/services/it-admin.service';

interface WorkflowAction {
  type: 'email' | 'notification' | 'update_field' | 'create_record' | 'approval' | 'webhook';
  config: {
    [key: string]: any;
  };
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  module: string;
  trigger: 'onCreate' | 'onUpdate' | 'onDelete' | 'onStatusChange' | 'scheduled';
  triggerConfig?: string;
  conditions: string[];
  actions: WorkflowAction[];
  active: boolean;
  executionCount: number;
  lastExecuted?: string;
  createdAt: string;
  priority: 'low' | 'medium' | 'high';
}

export default function WorkflowsPage() {
  const router = useRouter();
  const [selectedModule, setSelectedModule] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const [workflows, setWorkflows] = useState<Workflow[]>([]);

  const emptyForm = {
    name: '',
    description: '',
    module: 'all',
    trigger: 'onCreate' as Workflow['trigger'],
    priority: 'low' as Workflow['priority'],
    active: true,
  };
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const loadWorkflows = async () => {
    const allowedTriggers: Workflow['trigger'][] = ['onCreate', 'onUpdate', 'onDelete', 'onStatusChange', 'scheduled'];
    const allowedActionTypes: WorkflowAction['type'][] = ['email', 'notification', 'update_field', 'create_record', 'approval', 'webhook'];
    const allowedPriorities: Workflow['priority'][] = ['low', 'medium', 'high'];

    const mapRule = (rule: AutomationRuleDto): Workflow => {
      const rawTrigger = rule.triggerType || rule.trigger || 'onCreate';
      const trigger = allowedTriggers.includes(rawTrigger as Workflow['trigger'])
        ? (rawTrigger as Workflow['trigger'])
        : 'onCreate';
      const priority = allowedPriorities.includes(rule.priority as Workflow['priority'])
        ? (rule.priority as Workflow['priority'])
        : 'low';
      const actions: WorkflowAction[] = (rule.actions ?? []).map((a) => ({
        type: allowedActionTypes.includes(a as WorkflowAction['type'])
          ? (a as WorkflowAction['type'])
          : 'notification',
        config: {},
      }));
      return {
        id: rule.id,
        name: rule.name,
        description: rule.description ?? '',
        module: rule.category ?? 'all',
        trigger,
        triggerConfig: rule.trigger,
        conditions: rule.conditions ?? [],
        actions,
        active: rule.enabled,
        executionCount: rule.executionCount ?? 0,
        lastExecuted: rule.lastTriggered,
        createdAt: rule.createdAt,
        priority,
      };
    };

    try {
      const rules = await ItAdminService.getAutomationRules({ category: 'workflow' });
      setWorkflows(Array.isArray(rules) ? rules.map(mapRule) : []);
    } catch {
      setWorkflows([]);
    }
  };

  useEffect(() => {
    loadWorkflows();
  }, []);

  const modules = [
    'all',
    'Sales Orders',
    'Inventory',
    'Work Orders',
    'Customers',
    'Invoices',
    'Quality Checks',
    'Shipments',
    'Employees'
  ];

  const triggers = [
    { id: 'onCreate', name: 'On Create', icon: Plus, description: 'When a new record is created' },
    { id: 'onUpdate', name: 'On Update', icon: Edit, description: 'When a record is updated' },
    { id: 'onDelete', name: 'On Delete', icon: Trash2, description: 'When a record is deleted' },
    { id: 'onStatusChange', name: 'On Status Change', icon: GitBranch, description: 'When status field changes' },
    { id: 'scheduled', name: 'Scheduled', icon: Play, description: 'Run on a schedule' }
  ];

  const actionTypes = [
    { id: 'email', name: 'Send Email', icon: Mail, color: 'blue' },
    { id: 'notification', name: 'Send Notification', icon: Bell, color: 'purple' },
    { id: 'update_field', name: 'Update Field', icon: Edit, color: 'green' },
    { id: 'create_record', name: 'Create Record', icon: Plus, color: 'orange' },
    { id: 'approval', name: 'Request Approval', icon: CheckCircle, color: 'yellow' },
    { id: 'webhook', name: 'Call Webhook', icon: ArrowRight, color: 'indigo' }
  ];

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-blue-100 text-blue-700 border-blue-300',
      medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      high: 'bg-red-100 text-red-700 border-red-300'
    };
    return colors[priority as keyof typeof colors] || colors.low;
  };

  const getActionIcon = (type: string) => {
    const action = actionTypes.find(a => a.id === type);
    return action?.icon || ArrowRight;
  };

  const getActionColor = (type: string) => {
    const action = actionTypes.find(a => a.id === type);
    const colorMap: { [key: string]: string } = {
      blue: 'text-blue-600',
      purple: 'text-purple-600',
      green: 'text-green-600',
      orange: 'text-orange-600',
      yellow: 'text-yellow-600',
      indigo: 'text-indigo-600'
    };
    return colorMap[action?.color || 'blue'];
  };

  const filteredWorkflows = selectedModule === 'all'
    ? workflows
    : workflows.filter(w => w.module === selectedModule);

  const handleToggleActive = (workflowId: string) => {
    let nextEnabled = false;
    setWorkflows(prev =>
      prev.map(w => {
        if (w.id === workflowId) {
          nextEnabled = !w.active;
          return { ...w, active: nextEnabled };
        }
        return w;
      })
    );
    void (async () => {
      try {
        await ItAdminService.updateAutomationRule(workflowId, { enabled: nextEnabled });
      } catch {
        // best-effort persistence; keep optimistic UI state
      }
    })();
  };

  const handleDelete = async (workflowId: string) => {
    const wf = workflows.find(w => w.id === workflowId);
    if (!confirm(`Delete workflow "${wf?.name ?? ''}"?`)) return;
    try {
      await ItAdminService.deleteAutomationRule(workflowId);
      await loadWorkflows();
    } catch {
      // reload to resync on failure
      await loadWorkflows();
    }
  };

  const openCreateModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setSaveError(null);
    setShowAddModal(true);
  };

  const openEditModal = (workflow: Workflow) => {
    setEditingId(workflow.id);
    setForm({
      name: workflow.name,
      description: workflow.description,
      module: workflow.module,
      trigger: workflow.trigger,
      priority: workflow.priority,
      active: workflow.active,
    });
    setSaveError(null);
    setShowAddModal(true);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setSaveError('Workflow name is required.');
      return;
    }
    setIsSaving(true);
    setSaveError(null);
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      category: 'workflow',
      triggerType: form.trigger,
      priority: form.priority,
      enabled: form.active,
      status: form.active ? 'Active' : 'Paused',
    };
    try {
      if (editingId) {
        await ItAdminService.updateAutomationRule(editingId, payload);
      } else {
        await ItAdminService.createAutomationRule(payload);
      }
      setShowAddModal(false);
      await loadWorkflows();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save workflow');
    } finally {
      setIsSaving(false);
    }
  };

  const stats = {
    totalWorkflows: workflows.length,
    activeWorkflows: workflows.filter(w => w.active).length,
    totalExecutions: workflows.reduce((acc, w) => acc + w.executionCount, 0),
    highPriority: workflows.filter(w => w.priority === 'high').length
  };

  return (
    <div className="min-h-screen bg-gray-50 px-3 py-2">
      <div className="mb-3 flex items-center gap-2">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Workflow Automation</h1>
          <p className="text-sm text-gray-500 mt-1">Automate business processes with custom workflows</p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Workflow
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <GitBranch className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Workflows</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalWorkflows}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold text-green-600">{stats.activeWorkflows}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-50 rounded-lg">
              <Play className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Executions</p>
              <p className="text-2xl font-bold text-purple-600">{stats.totalExecutions.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-50 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">High Priority</p>
              <p className="text-2xl font-bold text-red-600">{stats.highPriority}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
        {/* Module Filter & Info */}
        <div className="space-y-3">
          <div className="bg-white rounded-xl border border-gray-200 p-3">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Filter by Module</h2>

            <div className="space-y-2">
              {modules.map((module) => {
                const count = module === 'all'
                  ? workflows.length
                  : workflows.filter(w => w.module === module).length;

                return (
                  <button
                    key={module}
                    onClick={() => setSelectedModule(module)}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                      selectedModule === module
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900 text-sm">
                        {module === 'all' ? 'All Modules' : module}
                      </p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        selectedModule === module
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {count}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-3">
            <h3 className="text-sm font-bold text-purple-900 mb-3">Available Actions</h3>
            <div className="space-y-2">
              {actionTypes.map((action) => {
                const IconComponent = action.icon;
                return (
                  <div key={action.id} className="flex items-center gap-2 text-xs">
                    <IconComponent className={`w-4 h-4 ${getActionColor(action.id)}`} />
                    <span className="text-purple-900">{action.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Workflows List */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-gray-200 p-3">
          <div className="mb-2">
            <h2 className="text-lg font-bold text-gray-900">
              {selectedModule === 'all' ? 'All Workflows' : `${selectedModule} Workflows`}
            </h2>
            <p className="text-sm text-gray-600">
              {filteredWorkflows.length} workflow{filteredWorkflows.length !== 1 ? 's' : ''} found
            </p>
          </div>

          <div className="space-y-2">
            {filteredWorkflows.map((workflow) => (
              <div key={workflow.id} className={`border-2 rounded-lg p-5 ${workflow.active ? 'border-gray-200' : 'border-gray-200 bg-gray-50 opacity-70'}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <GitBranch className={workflow.active ? 'w-5 h-5 text-blue-600' : 'w-5 h-5 text-gray-400'} />
                      <div>
                        <h3 className="font-bold text-gray-900">{workflow.name}</h3>
                        <p className="text-sm text-gray-600">{workflow.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs px-2 py-1 bg-purple-50 text-purple-700 rounded border border-purple-200">
                        {workflow.module}
                      </span>
                      <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded border border-blue-200">
                        {workflow.trigger.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded border ${getPriorityColor(workflow.priority)}`}>
                        {workflow.priority.charAt(0).toUpperCase() + workflow.priority.slice(1)} Priority
                      </span>
                      {!workflow.active && (
                        <span className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded">
                          Inactive
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                      <div>
                        <p className="text-xs font-semibold text-gray-600 mb-2">Conditions:</p>
                        {workflow.conditions.length > 0 ? (
                          <div className="space-y-1">
                            {workflow.conditions.slice(0, 2).map((condition, i) => (
                              <p key={i} className="text-xs text-gray-700 bg-gray-50 p-2 rounded font-mono">
                                {condition}
                              </p>
                            ))}
                            {workflow.conditions.length > 2 && (
                              <p className="text-xs text-gray-600">+{workflow.conditions.length - 2} more</p>
                            )}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-500">No conditions</p>
                        )}
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-gray-600 mb-2">Actions ({workflow.actions.length}):</p>
                        <div className="flex flex-wrap gap-2">
                          {workflow.actions.map((action, i) => {
                            const IconComponent = getActionIcon(action.type);
                            return (
                              <div key={i} className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded text-xs border border-green-200">
                                <IconComponent className="w-3 h-3" />
                                <span>{action.type.replace('_', ' ')}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-600 pt-3 border-t border-gray-200">
                      <div>
                        <span className="font-semibold">Executions:</span> {workflow.executionCount.toLocaleString()}
                      </div>
                      {workflow.lastExecuted && (
                        <div>
                          <span className="font-semibold">Last Run:</span> {workflow.lastExecuted}
                        </div>
                      )}
                      <div>
                        <span className="font-semibold">Created:</span> {workflow.createdAt}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleToggleActive(workflow.id)}
                      className={`p-2 rounded-lg ${workflow.active ? 'hover:bg-yellow-50 text-yellow-600' : 'hover:bg-green-50 text-green-600'}`}
                      title={workflow.active ? 'Pause workflow' : 'Activate workflow'}
                    >
                      {workflow.active ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={() => openEditModal(workflow)}
                      className="p-2 hover:bg-blue-50 rounded-lg text-blue-600"
                      title="Edit workflow"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(workflow.id)}
                      className="p-2 hover:bg-red-50 rounded-lg text-red-600"
                     
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredWorkflows.length === 0 && (
            <div className="text-center py-12">
              <GitBranch className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-gray-600 font-medium">No workflows found</p>
              <p className="text-sm text-gray-500">Create a new workflow to automate your processes</p>
            </div>
          )}

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">Workflow Best Practices:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Test workflows thoroughly before activating in production</li>
              <li>• Use conditions to prevent unnecessary workflow executions</li>
              <li>• Monitor execution counts to identify issues</li>
              <li>• High-priority workflows execute first when multiple are triggered</li>
              <li>• Inactive workflows are preserved but won't execute</li>
              <li>• Consider performance impact of scheduled workflows</li>
            </ul>
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-5 shadow-xl">
            <h2 className="mb-4 text-lg font-bold text-gray-900">
              {editingId ? 'Edit Workflow' : 'New Workflow'}
            </h2>
            {saveError && (
              <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {saveError}
              </div>
            )}
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600">Trigger</label>
                  <select
                    value={form.trigger}
                    onChange={(e) => setForm({ ...form, trigger: e.target.value as Workflow['trigger'] })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    {triggers.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600">Priority</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value as Workflow['priority'] })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm({ ...form, active: e.target.checked })}
                />
                Active
              </label>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowAddModal(false)}
                disabled={isSaving}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSaving}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {isSaving ? 'Saving...' : editingId ? 'Save Changes' : 'Create Workflow'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
