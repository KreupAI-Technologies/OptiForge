'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { exportToCsv } from '@/lib/export'
import { costEstimateService, CostEstimate } from '@/services/estimation-cost-estimate.service'
import {
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  MessageSquare,
  ArrowLeft,
  Search,
  Filter,
  Download,
  User,
  DollarSign,
  Calendar,
  AlertCircle
} from 'lucide-react'

interface PendingEstimate {
  id: string
  estimateNumber: string
  projectName: string
  customerName: string
  category: string
  estimatedValue: number
  items: number
  submittedBy: string
  submittedDate: string
  submittedTime: string
  pendingWith: string
  pendingDays: number
  priority: 'high' | 'medium' | 'low'
  approvalLevel: string
  comments: number
  documents: number
}

const COMPANY_ID = 'default-company-id'

function daysBetween(dateStr?: string): number {
  if (!dateStr) return 0
  const then = new Date(dateStr).getTime()
  if (Number.isNaN(then)) return 0
  return Math.max(0, Math.floor((Date.now() - then) / (1000 * 60 * 60 * 24)))
}

function mapEstimateToPending(est: CostEstimate): PendingEstimate {
  const submittedAt = est.submittedAt || est.createdAt
  return {
    id: est.id,
    estimateNumber: est.estimateNumber || '',
    projectName: est.title || '',
    customerName: est.customerName || '',
    category: est.estimateType || '',
    estimatedValue: est.totalCost || 0,
    items: 0,
    submittedBy: est.submittedBy || '',
    submittedDate: submittedAt ? new Date(submittedAt).toLocaleDateString() : '',
    submittedTime: submittedAt ? new Date(submittedAt).toLocaleTimeString() : '',
    pendingWith: '',
    pendingDays: daysBetween(submittedAt),
    priority: 'medium',
    approvalLevel: '',
    comments: 0,
    documents: 0,
  }
}

export default function EstimateWorkflowPendingPage() {
  const router = useRouter()

  const [pendingEstimates, setPendingEstimates] = useState<PendingEstimate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadPending = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await costEstimateService.findAll(COMPANY_ID, { status: 'Pending Approval' })
      setPendingEstimates(Array.isArray(data) ? data.map(mapEstimateToPending) : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load pending estimates.')
      setPendingEstimates([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPending()
  }, [loadPending])

  const handleViewEstimate = (estimateId: string) => {
    router.push(`/estimation/workflow/pending/view/${estimateId}`)
  }

  const handleViewComments = (estimateId: string) => {
    router.push(`/estimation/workflow/pending/comments/${estimateId}`)
  }

  const handleApprove = async (estimateId: string, projectName: string) => {
    if (!confirm(`Are you sure you want to approve "${projectName}"?`)) return
    try {
      await costEstimateService.approve(COMPANY_ID, estimateId, 'Current User')
      setPendingEstimates(prev => prev.filter(e => e.id !== estimateId))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to approve estimate.')
    }
  }

  const handleReject = async (estimateId: string, projectName: string) => {
    if (!confirm(`Are you sure you want to reject "${projectName}"? Please provide a reason in comments.`)) return
    try {
      await costEstimateService.reject(COMPANY_ID, estimateId, 'Current User')
      setPendingEstimates(prev => prev.filter(e => e.id !== estimateId))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to reject estimate.')
    }
  }

  const handleExport = () => {
    exportToCsv('pending-estimates', pendingEstimates)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'low':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getPendingDaysColor = (days: number) => {
    if (days >= 7) return 'text-red-600'
    if (days >= 4) return 'text-orange-600'
    if (days >= 2) return 'text-yellow-600'
    return 'text-green-600'
  }

  const totalPending = pendingEstimates.length
  const totalValue = pendingEstimates.reduce((sum, e) => sum + e.estimatedValue, 0)
  const highPriority = pendingEstimates.filter(e => e.priority === 'high').length
  const overdue = pendingEstimates.filter(e => e.pendingDays >= 5).length

  return (
    <div className="w-full h-full px-4 py-2">
      {/* Action Buttons */}
      <div className="mb-3 flex justify-end">
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-5 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Pending Approval</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{totalPending}</p>
              <p className="text-xs text-blue-700 mt-1">Total estimates</p>
            </div>
            <Clock className="h-10 w-10 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-5 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Total Value</p>
              <p className="text-2xl font-bold text-green-900 mt-1">₹{(totalValue / 10000000).toFixed(2)}Cr</p>
              <p className="text-xs text-green-700 mt-1">Pending pipeline</p>
            </div>
            <DollarSign className="h-10 w-10 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-5 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">High Priority</p>
              <p className="text-2xl font-bold text-red-900 mt-1">{highPriority}</p>
              <p className="text-xs text-red-700 mt-1">Need urgent review</p>
            </div>
            <AlertCircle className="h-10 w-10 text-red-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-5 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Overdue (≥5 days)</p>
              <p className="text-2xl font-bold text-orange-900 mt-1">{overdue}</p>
              <p className="text-xs text-orange-700 mt-1">Delayed approvals</p>
            </div>
            <Clock className="h-10 w-10 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Pending Estimates Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Pending Estimates</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search estimates..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Estimate</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Pending Days</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Pending With</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading && (
                <tr>
                  <td colSpan={8} className="px-3 py-8 text-center text-sm text-gray-500">Loading pending estimates...</td>
                </tr>
              )}
              {!loading && error && (
                <tr>
                  <td colSpan={8} className="px-3 py-8 text-center text-sm text-red-600">{error}</td>
                </tr>
              )}
              {!loading && !error && pendingEstimates.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-3 py-8 text-center text-sm text-gray-500">No pending estimates found.</td>
                </tr>
              )}
              {!loading && !error && pendingEstimates.map((estimate) => (
                <tr key={estimate.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{estimate.estimateNumber}</p>
                      <p className="text-sm text-gray-900 mt-1">{estimate.projectName}</p>
                      <p className="text-xs text-gray-600 mt-1">{estimate.category} • {estimate.items} items</p>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <p className="text-sm text-gray-900">{estimate.customerName}</p>
                  </td>
                  <td className="px-3 py-2">
                    <p className="text-sm font-bold text-green-600">₹{(estimate.estimatedValue / 100000).toFixed(2)}L</p>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1 text-sm text-gray-900">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>{estimate.submittedDate}</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{estimate.submittedTime}</p>
                    <p className="text-xs text-gray-600">by {estimate.submittedBy}</p>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1">
                      <Clock className={`h-4 w-4 ${getPendingDaysColor(estimate.pendingDays)}`} />
                      <span className={`text-sm font-bold ${getPendingDaysColor(estimate.pendingDays)}`}>
                        {estimate.pendingDays} days
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div>
                      <p className="text-sm text-gray-900 font-medium">{estimate.pendingWith}</p>
                      <p className="text-xs text-gray-600 mt-1">{estimate.approvalLevel}</p>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(estimate.priority)}`}>
                      {estimate.priority.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewEstimate(estimate.id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleViewComments(estimate.id)}
                        className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg relative"
                        title="View Comments"
                      >
                        <MessageSquare className="h-4 w-4" />
                        {estimate.comments > 0 && (
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                            {estimate.comments}
                          </span>
                        )}
                      </button>
                      <button
                        onClick={() => handleApprove(estimate.id, estimate.projectName)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                        title="Approve"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleReject(estimate.id, estimate.projectName)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Reject"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
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
