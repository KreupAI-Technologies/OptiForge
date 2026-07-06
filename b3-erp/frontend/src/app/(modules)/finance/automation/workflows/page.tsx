'use client'

import { useState, useEffect } from 'react'
import { Zap, Play, Pause, CheckCircle, Settings, GitBranch, Clock, TrendingUp } from 'lucide-react'
import { FinanceService } from '@/services/finance.service'

interface Workflow {
  id: string
  name: string
  description: string
  trigger: string
  triggerType: 'scheduled' | 'event' | 'manual' | 'conditional'
  actions: string[]
  frequency: string
  lastRun: string
  nextRun: string
  executionCount: number
  successRate: number
  status: 'active' | 'paused' | 'draft'
  category: 'accounting' | 'reconciliation' | 'reporting' | 'compliance'
}

export default function AutomatedWorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadWorkflows = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await FinanceService.getApprovalWorkflows()
      const mapped: Workflow[] = (data || []).map((w: any) => {
        const steps = Array.isArray(w.steps) ? w.steps : []
        const actions = steps.map((s: any) =>
          typeof s === 'string' ? s : (s?.name ?? s?.approverRole ?? s?.role ?? 'Approval step'),
        )
        const range =
          w.minAmount != null || w.maxAmount != null
            ? `Amount ${w.minAmount ?? 0} - ${w.maxAmount ?? '∞'}`
            : 'On document submission'
        return {
          id: String(w.id),
          name: w.name ?? 'Workflow',
          description: w.description ?? '',
          trigger: range,
          triggerType: 'event',
          actions: actions.length ? actions : ['Route for approval'],
          frequency: 'Real-time',
          lastRun: '-',
          nextRun: 'On document submission',
          executionCount: steps.length,
          successRate: 0,
          status: (w.isActive ?? String(w.status).toLowerCase() === 'active') ? 'active' : 'paused',
          category: 'accounting',
        }
      })
      setWorkflows(mapped)
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load workflows')
      setWorkflows([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadWorkflows()
  }, [])

  const handleCreate = async (data: any) => {
    try {
      await FinanceService.createApprovalWorkflow(data)
      await loadWorkflows()
    } catch (e) {
      console.error('Failed to create workflow', e)
    }
  }

  const handleUpdate = async (id: string, data: any) => {
    try {
      await FinanceService.updateApprovalWorkflow(id, data)
      await loadWorkflows()
    } catch (e) {
      console.error('Failed to update workflow', e)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await FinanceService.deleteApprovalWorkflow(id)
      await loadWorkflows()
    } catch (e) {
      console.error('Failed to delete workflow', e)
    }
  }

  const stats = {
    totalWorkflows: workflows.length,
    activeWorkflows: workflows.filter((w) => w.status === 'active').length,
    pausedWorkflows: workflows.filter((w) => w.status === 'paused').length,
    totalExecutions: workflows.reduce((sum, w) => sum + w.executionCount, 0),
    averageSuccessRate: 0,
  }

  const getTriggerIcon = (type: string) => {
    switch (type) {
      case 'scheduled': return <Clock className="h-4 w-4" />
      case 'event': return <Zap className="h-4 w-4" />
      case 'conditional': return <GitBranch className="h-4 w-4" />
      default: return <Play className="h-4 w-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'accounting': return 'bg-blue-100 text-blue-700'
      case 'reconciliation': return 'bg-green-100 text-green-700'
      case 'reporting': return 'bg-purple-100 text-purple-700'
      case 'compliance': return 'bg-orange-100 text-orange-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-violet-50 to-purple-50 px-3 py-2">
      <div className="w-full space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Automated Workflows</h1>
            <p className="text-gray-600 mt-1">Rule-based automation engine for financial processes</p>
          </div>
          <button
            onClick={() => handleCreate({ companyId: 'default-company-id', name: 'New Workflow', documentType: 'invoice', isActive: true, steps: [] })}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg hover:from-violet-700 hover:to-purple-700"
          >
            <Zap className="h-5 w-5" />
            Create Workflow
          </button>
        </div>

        {loading && <p className="text-sm text-gray-500">Loading workflows…</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-2">
              <GitBranch className="h-6 w-6 text-violet-600" />
              <span className="text-sm text-gray-600">Total Workflows</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.totalWorkflows}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-2">
              <Play className="h-6 w-6 text-green-600" />
              <span className="text-sm text-gray-600">Active</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{stats.activeWorkflows}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-2">
              <Pause className="h-6 w-6 text-yellow-600" />
              <span className="text-sm text-gray-600">Paused</span>
            </div>
            <p className="text-2xl font-bold text-yellow-600">{stats.pausedWorkflows}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="h-6 w-6 text-blue-600" />
              <span className="text-sm text-gray-600">Executions</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">{stats.totalExecutions.toLocaleString('en-IN')}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="h-6 w-6 text-purple-600" />
              <span className="text-sm text-gray-600">Success Rate</span>
            </div>
            <p className="text-2xl font-bold text-purple-600">{stats.averageSuccessRate}%</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {!loading && workflows.length === 0 && (
            <p className="text-sm text-gray-500">No workflows found.</p>
          )}
          {workflows.map((workflow) => (
            <div key={workflow.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{workflow.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(workflow.category)}`}>
                      {workflow.category}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{workflow.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    workflow.status === 'active' ? 'bg-green-100 text-green-700' :
                    workflow.status === 'paused' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {workflow.status.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="space-y-3 mb-2">
                <div className="flex items-center gap-2 text-sm">
                  {getTriggerIcon(workflow.triggerType)}
                  <span className="text-gray-600">Trigger:</span>
                  <span className="font-medium text-gray-900">{workflow.trigger}</span>
                </div>

                <div className="text-sm">
                  <span className="text-gray-600">Actions:</span>
                  <ul className="mt-1 space-y-1">
                    {workflow.actions.map((action, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-gray-700">
                        <span className="text-violet-600">•</span>
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-4 border-t border-gray-200">
                <div>
                  <p className="text-xs text-gray-600">Last Run</p>
                  <p className="text-sm font-medium text-gray-900">{workflow.lastRun}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Next Run</p>
                  <p className="text-sm font-medium text-gray-900">{workflow.nextRun}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Executions</p>
                  <p className="text-sm font-medium text-gray-900">{workflow.executionCount}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Success Rate</p>
                  <p className="text-sm font-medium text-green-600">{workflow.successRate}%</p>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleUpdate(workflow.id, { isActive: workflow.status !== 'active' })}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                >
                  <Settings className="h-4 w-4" />
                  Configure
                </button>
                <button
                  onClick={() => handleDelete(workflow.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 text-sm"
                >
                  <Play className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl shadow-sm p-3 text-white">
          <h3 className="text-lg font-semibold mb-2">Workflow Capabilities</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <h4 className="font-semibold mb-2">Triggers</h4>
              <ul className="space-y-1 text-sm">
                <li>• Time-based scheduling (cron expressions)</li>
                <li>• Event-based (document creation, status changes)</li>
                <li>• Conditional logic (amount thresholds, approvals)</li>
                <li>• Manual execution on-demand</li>
              </ul>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <h4 className="font-semibold mb-2">Actions</h4>
              <ul className="space-y-1 text-sm">
                <li>• Create journal entries and post to GL</li>
                <li>• Send email/SMS notifications</li>
                <li>• Generate and export reports</li>
                <li>• Update records and trigger approvals</li>
              </ul>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <h4 className="font-semibold mb-2">Monitoring</h4>
              <ul className="space-y-1 text-sm">
                <li>• Execution history and audit logs</li>
                <li>• Success/failure tracking</li>
                <li>• Error notifications and retry logic</li>
                <li>• Performance metrics and analytics</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
