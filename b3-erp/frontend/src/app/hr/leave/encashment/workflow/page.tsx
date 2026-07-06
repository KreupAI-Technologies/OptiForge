'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Plus, Edit, Trash2, Copy, CheckCircle, AlertCircle, BarChart3, Clock, Users, ArrowRight, GitBranch, Save, X } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { defaultEncashmentWorkflows, workflowTemplates, approverRoles, mockWorkflowStats, ApprovalWorkflow, ApprovalStep, WorkflowStats } from '@/data/hr/approval-workflows';
import { LeaveService } from '@/services/leave.service';

/**
 * Defensively derive workflow statistics from real leave-encashment records.
 * Backend records (hr_leave_encashments) expose a `status` string plus
 * approval fields; the workflow-config UI shape is unrelated, so we guard every
 * field and only attach real numbers to the default workflow.
 */
function deriveStatsFromEncashments(
  records: any[],
  defaultWorkflowId: string,
): WorkflowStats[] {
  const list = Array.isArray(records) ? records : [];
  const norm = (s: unknown) => String(s ?? '').toLowerCase();
  const total = list.length;
  const pending = list.filter((r) => norm(r?.status) === 'pending').length;
  const approved = list.filter((r) => ['approved', 'processed', 'paid'].includes(norm(r?.status))).length;
  const rejected = list.filter((r) => norm(r?.status) === 'rejected').length;

  return mockWorkflowStats.map((s) =>
    s.workflowId === defaultWorkflowId
      ? {
          ...s,
          totalRequests: total,
          pendingRequests: pending,
          approvedRequests: approved,
          rejectedRequests: rejected,
        }
      : s,
  );
}

export default function WorkflowConfigurationPage() {
  const [workflows, setWorkflows] = useState<ApprovalWorkflow[]>(defaultEncashmentWorkflows);
  const [stats, setStats] = useState<WorkflowStats[]>(mockWorkflowStats);
  const [selectedWorkflow, setSelectedWorkflow] = useState<ApprovalWorkflow | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recordCount, setRecordCount] = useState(0);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const records = await LeaveService.getEncashments();
        if (!active) return;
        const safe = Array.isArray(records) ? records : [];
        const defaultWorkflowId =
          defaultEncashmentWorkflows.find((w) => w.isDefault)?.id ?? mockWorkflowStats[0]?.workflowId ?? '';
        setStats(deriveStatsFromEncashments(safe, defaultWorkflowId));
        setRecordCount(safe.length);
        setError(null);
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : 'Failed to load leave-encashment records');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const getWorkflowStats = (workflowId: string) => {
    return stats.find(s => s.workflowId === workflowId);
  };

  const handleActivateWorkflow = (workflowId: string) => {
    setWorkflows(workflows.map(w =>
      w.id === workflowId ? { ...w, isActive: !w.isActive } : w
    ));
  };

  const handleSetDefault = (workflowId: string) => {
    setWorkflows(workflows.map(w => ({
      ...w,
      isDefault: w.id === workflowId
    })));
  };

  const handleDuplicateWorkflow = (workflow: ApprovalWorkflow) => {
    const newWorkflow: ApprovalWorkflow = {
      ...workflow,
      id: `WF${String(workflows.length + 1).padStart(3, '0')}`,
      name: `${workflow.name} (Copy)`,
      isDefault: false,
      createdBy: 'Current User',
      createdOn: new Date().toISOString().split('T')[0]
    };
    setWorkflows([...workflows, newWorkflow]);
  };

  const handleDeleteWorkflow = (workflowId: string) => {
    if (confirm('Are you sure you want to delete this workflow?')) {
      setWorkflows(workflows.filter(w => w.id !== workflowId));
    }
  };

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="w-7 h-7 text-blue-600" />
            Approval Workflow Configuration
          </h1>
          <p className="text-gray-600 mt-1">Manage and customize leave encashment approval workflows</p>
        </div>
        <button
          onClick={() => {
            setShowTemplateSelector(true);
            setIsEditing(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Workflow
        </button>
      </div>

      {/* Loading / Error / Empty states (real leave-encashment data) */}
      {loading && (
        <div className="bg-white rounded-lg border p-6 flex items-center gap-3 text-gray-600">
          <Clock className="w-5 h-5 animate-spin text-blue-600" />
          <span>Loading leave-encashment records…</span>
        </div>
      )}

      {!loading && error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 text-red-700">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div>
            <div className="font-medium">Failed to load leave-encashment records</div>
            <div className="text-sm text-red-600 mt-0.5">{error}</div>
          </div>
        </div>
      )}

      {!loading && !error && recordCount === 0 && (
        <div className="bg-white rounded-lg border p-6 flex items-center gap-3 text-gray-500">
          <BarChart3 className="w-5 h-5 text-gray-400" />
          <span>No leave-encashment records yet. Workflow statistics will populate once requests are submitted.</span>
        </div>
      )}

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
        <div className="bg-white rounded-lg border p-3">
          <div className="text-sm text-gray-600 mb-1">Total Workflows</div>
          <div className="text-2xl font-bold text-gray-900">{workflows.length}</div>
          <div className="text-xs text-gray-500 mt-1">
            {workflows.filter(w => w.isActive).length} active
          </div>
        </div>
        <div className="bg-white rounded-lg border p-3">
          <div className="text-sm text-gray-600 mb-1">Total Requests Processed</div>
          <div className="text-2xl font-bold text-blue-600">
            {stats.reduce((sum, s) => sum + s.totalRequests, 0)}
          </div>
          <div className="text-xs text-green-600 mt-1 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            {stats.reduce((sum, s) => sum + s.approvedRequests, 0)} approved
          </div>
        </div>
        <div className="bg-white rounded-lg border p-3">
          <div className="text-sm text-gray-600 mb-1">Avg Approval Time</div>
          <div className="text-2xl font-bold text-orange-600">
            {Math.round(stats.reduce((sum, s) => sum + s.avgApprovalTime, 0) / stats.length)}h
          </div>
          <div className="text-xs text-gray-500 mt-1">Across all workflows</div>
        </div>
        <div className="bg-white rounded-lg border p-3">
          <div className="text-sm text-gray-600 mb-1">Escalations</div>
          <div className="text-2xl font-bold text-red-600">
            {stats.reduce((sum, s) => sum + s.escalatedCount, 0)}
          </div>
          <div className="text-xs text-gray-500 mt-1">This month</div>
        </div>
      </div>

      {/* Workflow List */}
      <div className="space-y-2">
        {workflows.map((workflow) => {
          const workflowStats = getWorkflowStats(workflow.id);

          return (
            <div
              key={workflow.id}
              className={`bg-white rounded-lg border-2 transition-all ${
                workflow.isDefault
                  ? 'border-blue-500 shadow-md'
                  : workflow.isActive
                  ? 'border-gray-200 hover:border-gray-300'
                  : 'border-gray-100 opacity-60'
              }`}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{workflow.name}</h3>
                      {workflow.isDefault && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                          Default
                        </span>
                      )}
                      <StatusBadge status={workflow.isActive ? 'active' : 'inactive'} />
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{workflow.description}</p>

                    {/* Workflow Steps Visualization */}
                    <div className="flex items-center gap-2 mb-3">
                      {workflow.steps.map((step, index) => (
                        <React.Fragment key={step.id}>
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg">
                            <Users className="w-4 h-4 text-blue-600" />
                            <span className="text-xs font-medium text-blue-900">
                              {step.stepName}
                              {step.isParallel && <span className="ml-1 text-blue-500">⚡</span>}
                            </span>
                          </div>
                          {index < workflow.steps.length - 1 && (
                            <ArrowRight className="w-4 h-4 text-gray-400" />
                          )}
                        </React.Fragment>
                      ))}
                    </div>

                    {/* Workflow Rules */}
                    {workflow.rules.length > 0 && (
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <GitBranch className="w-3 h-3" />
                        <span>{workflow.rules.length} conditional rule{workflow.rules.length !== 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedWorkflow(workflow);
                        setIsEditing(true);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Workflow"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDuplicateWorkflow(workflow)}
                      className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                      title="Duplicate Workflow"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    {!workflow.isDefault && (
                      <button
                        onClick={() => handleDeleteWorkflow(workflow.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Workflow"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Stats */}
                {workflowStats && (
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-2 pt-4 border-t border-gray-200">
                    <div>
                      <div className="text-xs text-gray-500">Total Requests</div>
                      <div className="text-lg font-bold text-gray-900">{workflowStats.totalRequests}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Pending</div>
                      <div className="text-lg font-bold text-orange-600">{workflowStats.pendingRequests}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Approved</div>
                      <div className="text-lg font-bold text-green-600">{workflowStats.approvedRequests}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Rejected</div>
                      <div className="text-lg font-bold text-red-600">{workflowStats.rejectedRequests}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Avg Time</div>
                      <div className="text-lg font-bold text-blue-600">{workflowStats.avgApprovalTime}h</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Auto-Approved</div>
                      <div className="text-lg font-bold text-purple-600">{workflowStats.autoApprovedCount}</div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-200">
                  {!workflow.isDefault && (
                    <button
                      onClick={() => handleSetDefault(workflow.id)}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Set as Default
                    </button>
                  )}
                  <button
                    onClick={() => handleActivateWorkflow(workflow.id)}
                    className={`text-sm font-medium ${
                      workflow.isActive
                        ? 'text-orange-600 hover:text-orange-700'
                        : 'text-green-600 hover:text-green-700'
                    }`}
                  >
                    {workflow.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => setSelectedWorkflow(workflow)}
                    className="text-sm text-gray-600 hover:text-gray-700 font-medium"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Workflow Configuration Info */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3">
        <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Workflow Configuration Tips
        </h3>
        <div className="grid md:grid-cols-2 gap-2 text-sm text-blue-800">
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <span><strong>Default Workflow:</strong> Automatically applies to new requests unless conditions met</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <span><strong>Conditional Rules:</strong> Create rules to automatically select workflows based on amount, department, etc.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <span><strong>Parallel Approval:</strong> Multiple approvers can review simultaneously at same step</span>
            </li>
          </ul>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <span><strong>Escalation:</strong> Auto-escalate requests if not actioned within specified days</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <span><strong>Auto-Approval:</strong> Set conditions for automatic approval to speed up process</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <span><strong>Testing:</strong> Test workflows before activating to ensure proper configuration</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Template Selector Modal */}
      {showTemplateSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Choose a Workflow Template</h2>
                <button
                  onClick={() => setShowTemplateSelector(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-2">
              {workflowTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => {
                    // In real app, create workflow from template
                    alert(`Creating workflow from template: ${template.name}`);
                    setShowTemplateSelector(false);
                  }}
                  className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
                >
                  <div className="font-semibold text-gray-900 mb-1">{template.name}</div>
                  <div className="text-sm text-gray-600 mb-2">{template.description}</div>
                  <div className="text-xs text-blue-600 font-medium">
                    {template.steps} approval step{template.steps !== 1 ? 's' : ''}
                  </div>
                </button>
              ))}
            </div>

            <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
              <p className="text-sm text-gray-600">
                You can customize the template after creation by adding steps, rules, and conditions.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
