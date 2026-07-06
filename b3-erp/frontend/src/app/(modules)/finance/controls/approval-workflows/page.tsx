'use client'

import { useState, useEffect } from 'react'
import { GitBranch, CheckCircle, Clock, XCircle, User, ArrowRight } from 'lucide-react'
import { FinanceService } from '@/services/finance.service'

interface WorkflowRow {
  id: string
  name: string
  levels: number
  type: string
  active: boolean
  pendingApprovals: number
}

export default function ApprovalWorkflowsPage() {
  const [workflows, setWorkflows] = useState<WorkflowRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadWorkflows = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await FinanceService.getApprovalWorkflows()
      const mapped: WorkflowRow[] = (data || []).map((w: any) => {
        const steps = Array.isArray(w.steps) ? w.steps : []
        return {
          id: String(w.id),
          name: w.name ?? 'Workflow',
          levels: steps.length,
          type: w.documentType ?? 'Sequential',
          active: w.isActive ?? String(w.status ?? '').toLowerCase() === 'active',
          pendingApprovals: 0,
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

  const [pendingItems] = useState([
    { id: 'JE-123', type: 'Journal Entry', amount: 500000, submittedBy: 'John Doe', currentLevel: 1, totalLevels: 3, approver: 'Jane Smith' },
    { id: 'PAY-456', type: 'Payment', amount: 250000, submittedBy: 'Robert Brown', currentLevel: 2, totalLevels: 2, approver: 'CFO' },
    { id: 'BUD-789', type: 'Budget', amount: 10000000, submittedBy: 'Sarah Wilson', currentLevel: 1, totalLevels: 4, approver: 'Department Head' }
  ])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50 px-3 py-2">
      <div className="w-full space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Approval Workflows</h1>
            <p className="text-gray-600 mt-1">Multi-level approval configuration and management</p>
          </div>
          <button
            onClick={() => handleCreate({ companyId: 'default-company-id', name: 'New Workflow', documentType: 'invoice', isActive: true, steps: [] })}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
          >
            New Workflow
          </button>
        </div>

        {loading && <p className="text-sm text-gray-500">Loading workflows…</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
        {!loading && workflows.length === 0 && (
          <p className="text-sm text-gray-500">No workflows found.</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
          {workflows.map((workflow) => (
            <div key={workflow.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-start justify-between mb-3">
                <GitBranch className="h-6 w-6 text-green-600" />
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${workflow.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                  {workflow.active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{workflow.name}</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p>Type: {workflow.type}</p>
                <p>Levels: {workflow.levels}</p>
                <p className="font-semibold text-orange-600">Pending: {workflow.pendingApprovals}</p>
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleUpdate(workflow.id, { isActive: !workflow.active })}
                  className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
                >
                  {workflow.active ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => handleDelete(workflow.id)}
                  className="px-3 py-1 text-xs border border-red-300 text-red-600 rounded hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Pending Approvals</h2>
          </div>
          <div className="p-6 space-y-2">
            {pendingItems.map((item) => (
              <div key={item.id} className="border-2 border-gray-200 rounded-xl p-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900">{item.type} - {item.id}</h3>
                    <p className="text-sm text-gray-600">Submitted by: {item.submittedBy}</p>
                    <p className="text-lg font-bold text-blue-600 mt-1">{formatCurrency(item.amount)}</p>
                  </div>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                    Level {item.currentLevel}/{item.totalLevels}
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Awaiting approval from: <span className="font-semibold">{item.approver}</span></span>
                </div>

                <div className="flex items-center gap-2">
                  {Array.from({ length: item.totalLevels }).map((_, idx) => (
                    <div key={idx} className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        idx < item.currentLevel - 1 ? 'bg-green-500' :
                        idx === item.currentLevel - 1 ? 'bg-yellow-500' :
                        'bg-gray-300'
                      }`}>
                        {idx < item.currentLevel - 1 ? (
                          <CheckCircle className="h-5 w-5 text-white" />
                        ) : idx === item.currentLevel - 1 ? (
                          <Clock className="h-5 w-5 text-white" />
                        ) : (
                          <User className="h-5 w-5 text-white" />
                        )}
                      </div>
                      {idx < item.totalLevels - 1 && <ArrowRight className="h-4 w-4 mx-2 text-gray-400" />}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
