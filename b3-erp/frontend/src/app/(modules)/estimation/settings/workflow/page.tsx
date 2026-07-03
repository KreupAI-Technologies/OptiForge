'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  GitBranch,
  Edit2,
  Save,
  ArrowLeft,
  Search,
  Filter,
  Download,
  Plus,
  Users,
  CheckCircle
} from 'lucide-react'
import { estimationWorkflowStageService } from '@/services/estimation-workflow-stage.service'

const COMPANY_ID = 'company-001'

interface WorkflowStage {
  id: string
  stageCode: string
  stageName: string
  stageOrder: number
  description: string
  approverRole: string
  approvalRequired: boolean
  autoAdvance: boolean
  notifyOnEntry: boolean
  notifyOnApproval: boolean
  maxDaysInStage: number
  escalationEnabled: boolean
  escalationDays: number
  escalateTo: string
  allowReject: boolean
  allowRevision: boolean
  status: 'active' | 'inactive'
}

export default function EstimationSettingsWorkflowPage() {
  const router = useRouter()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [workflowStages, setWorkflowStages] = useState<WorkflowStage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setIsLoading(true)
      setLoadError(null)
      try {
        const raw = await estimationWorkflowStageService.findAll(COMPANY_ID)
        const mapped: WorkflowStage[] = raw.map((r) => ({
          id: r.id,
          stageCode: r.stageCode,
          stageName: r.stageName,
          stageOrder: Number(r.stageOrder ?? 0),
          description: r.description ?? '',
          approverRole: r.approverRole ?? 'None',
          approvalRequired: !!r.approvalRequired,
          autoAdvance: !!r.autoAdvance,
          notifyOnEntry: !!r.notifyOnEntry,
          notifyOnApproval: !!r.notifyOnApproval,
          maxDaysInStage: Number(r.maxDaysInStage ?? 0),
          escalationEnabled: !!r.escalationEnabled,
          escalationDays: Number(r.escalationDays ?? 0),
          escalateTo: r.escalateTo ?? 'None',
          allowReject: !!r.allowReject,
          allowRevision: !!r.allowRevision,
          status: r.status
        }))
        if (!cancelled) setWorkflowStages(mapped)
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load workflow stages')
          setWorkflowStages([])
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'inactive':
        return 'bg-gray-100 text-gray-700 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const totalStages = workflowStages.length
  const approvalStages = workflowStages.filter(s => s.approvalRequired).length
  const activeStages = workflowStages.filter(s => s.status === 'active').length
  const escalationEnabled = workflowStages.filter(s => s.escalationEnabled).length

  return (
    <div className="w-full h-full px-4 py-2">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Workflow Settings</h1>
            <p className="text-sm text-gray-600 mt-1">Configure estimation approval workflow stages</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </button>
          <button className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </button>
          <button className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Stage
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-5 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Stages</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{totalStages}</p>
              <p className="text-xs text-blue-700 mt-1">Workflow stages</p>
            </div>
            <GitBranch className="h-10 w-10 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-5 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Active</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{activeStages}</p>
              <p className="text-xs text-green-700 mt-1">In use</p>
            </div>
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-5 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Approval Stages</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">{approvalStages}</p>
              <p className="text-xs text-purple-700 mt-1">Require approval</p>
            </div>
            <Users className="h-10 w-10 text-purple-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-5 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Escalation Enabled</p>
              <p className="text-2xl font-bold text-orange-900 mt-1">{escalationEnabled}</p>
              <p className="text-xs text-orange-700 mt-1">With escalation</p>
            </div>
            <GitBranch className="h-10 w-10 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Workflow Stages Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Workflow Stages Configuration</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search stages..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
        {isLoading && (
          <div className="px-6 py-6 text-sm text-gray-500">Loading workflow stages...</div>
        )}
        {loadError && !isLoading && (
          <div className="px-6 py-6 text-sm text-red-600">{loadError}</div>
        )}
        {!isLoading && !loadError && workflowStages.length === 0 && (
          <div className="px-6 py-6 text-sm text-gray-500">No workflow stages found.</div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Stage</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Approver Role</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Approval Required</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Max Days</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Escalation</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions Allowed</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Edit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {[...workflowStages].sort((a, b) => a.stageOrder - b.stageOrder).map((stage) => (
                <tr key={stage.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-bold">
                      {stage.stageOrder}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{stage.stageName}</p>
                      <p className="text-xs text-gray-600 mt-1">{stage.stageCode}</p>
                      <p className="text-xs text-gray-600 mt-1">{stage.description}</p>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <p className="text-sm text-gray-900">{stage.approverRole}</p>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                      stage.approvalRequired
                        ? 'bg-orange-100 text-orange-700 border-orange-200'
                        : 'bg-gray-100 text-gray-700 border-gray-200'
                    }`}>
                      {stage.approvalRequired ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <p className="text-sm font-medium text-gray-900">{stage.maxDaysInStage || '-'}</p>
                    {stage.maxDaysInStage > 0 && (
                      <p className="text-xs text-gray-600 mt-1">days</p>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {stage.escalationEnabled ? (
                      <div>
                        <p className="text-sm text-orange-600 font-medium">After {stage.escalationDays} days</p>
                        <p className="text-xs text-gray-600 mt-1">to {stage.escalateTo}</p>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-600">-</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-1">
                      {stage.allowReject && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs">Reject</span>
                      )}
                      {stage.allowRevision && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">Revise</span>
                      )}
                      {stage.autoAdvance && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">Auto</span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(stage.status)}`}>
                      {stage.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      {editingId === stage.id ? (
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                        >
                          <Save className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => setEditingId(stage.id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
