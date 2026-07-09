'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Search,
  Filter,
  Download,
  Eye,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  User,
  History
} from 'lucide-react'
import { ViewApprovalModal, ApproveRejectModal, ApprovalHistoryModal, FilterModal } from '@/components/cpq/QuoteApprovalModals'
import { cpqApprovalService, type CPQApprovalItem } from '@/services/cpq/cpq-approval.service'

interface QuoteApproval {
  id: string
  quoteNumber: string
  customerName: string
  value: number
  discount: number
  requester: string
  approvers: {
    name: string
    role: string
    status: 'pending' | 'approved' | 'rejected'
    comments?: string
    date?: string
  }[]
  reason: string
  submittedDate: string
  status: 'pending' | 'approved' | 'rejected' | 'escalated'
  priority: 'low' | 'medium' | 'high' | 'urgent'
}

export default function CPQQuotesApprovalsPage() {
  const router = useRouter()

  // State management
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string | null>(null)

  // Modal states
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isApproveRejectModalOpen, setIsApproveRejectModalOpen] = useState(false)
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)

  // Selected items
  const [selectedApproval, setSelectedApproval] = useState<QuoteApproval | null>(null)
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>('approve')

  // Advanced filters
  const [appliedFilters, setAppliedFilters] = useState<any>(null)

  const [approvals, setApprovals] = useState<QuoteApproval[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setIsLoading(true)
      setLoadError(null)
      try {
        const rows = await cpqApprovalService.findAll({ category: 'quote' })
        const mapped: QuoteApproval[] = (Array.isArray(rows) ? rows : []).map(
          (r: CPQApprovalItem) => {
            const payload = (r.payload ?? {}) as Record<string, any>
            return {
              id: r.id,
              quoteNumber: r.reference ?? r.title ?? '—',
              customerName: r.customerName ?? '—',
              value: Number(r.value ?? 0),
              discount: Number(payload.discount ?? 0),
              requester: r.requestedBy ?? '—',
              approvers: Array.isArray(payload.approvers) ? payload.approvers : [],
              reason: r.reason ?? '',
              submittedDate: (r.createdAt ?? '').slice(0, 10),
              status: r.status,
              priority: r.priority,
            }
          },
        )
        if (!cancelled) setApprovals(mapped)
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load approvals')
          setApprovals([])
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

  // Handler functions
  const handleViewApproval = (approval: QuoteApproval) => {
    setSelectedApproval(approval)
    setIsViewModalOpen(true)
  }

  const handleApprove = (approval: QuoteApproval) => {
    setSelectedApproval(approval)
    setApprovalAction('approve')
    setIsApproveRejectModalOpen(true)
  }

  const handleReject = (approval: QuoteApproval) => {
    setSelectedApproval(approval)
    setApprovalAction('reject')
    setIsApproveRejectModalOpen(true)
  }

  const handleSubmitApprovalDecision = async (comments: string, conditions?: string) => {
    if (!selectedApproval) return

    const targetId = selectedApproval.id
    const newStatus = approvalAction === 'approve' ? 'approved' : 'rejected'
    const commentText = conditions ? `${comments}\nConditions: ${conditions}` : comments

    setIsSubmitting(true)
    setActionError(null)
    setActionSuccess(null)
    try {
      // Record the reviewer's comment first (best-effort), then the decision.
      if (commentText.trim()) {
        await cpqApprovalService.addComment(targetId, commentText)
      }
      const updated = await cpqApprovalService.decide(targetId, newStatus)
      if (!updated) {
        throw new Error('Approval decision could not be saved. Please try again.')
      }

      // Reflect the persisted status locally without a full reload.
      setApprovals((prev) =>
        prev.map((a) =>
          a.id === targetId
            ? {
                ...a,
                status: updated.status ?? newStatus,
                approvers: a.approvers.map((approver) =>
                  approver.status === 'pending'
                    ? {
                        ...approver,
                        status: newStatus,
                        comments: commentText || approver.comments,
                        date: new Date().toISOString(),
                      }
                    : approver,
                ),
              }
            : a,
        ),
      )

      setActionSuccess(
        `Quote ${selectedApproval.quoteNumber} ${newStatus} successfully.`,
      )
      setIsApproveRejectModalOpen(false)
      setSelectedApproval(null)
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : 'Failed to submit approval decision',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleViewHistory = (approval: QuoteApproval) => {
    setSelectedApproval(approval)
    setIsHistoryModalOpen(true)
  }

  const handleExport = () => {
    const csvContent = [
      ['ID', 'Quote Number', 'Customer', 'Value', 'Discount %', 'Requester', 'Status', 'Priority', 'Reason', 'Submitted Date'].join(','),
      ...filteredApprovals.map(a => [
        a.id,
        a.quoteNumber,
        `"${a.customerName}"`,
        a.value,
        a.discount,
        `"${a.requester}"`,
        a.status,
        a.priority,
        `"${a.reason}"`,
        a.submittedDate
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `quote-approvals-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleApplyFilters = (filters: any) => {
    setAppliedFilters(filters)
    setIsFilterModalOpen(false)
  }

  const handleStatusFilter = (status: string | null) => {
    setSelectedStatusFilter(status)
  }

  // Filtering logic
  const filteredApprovals = approvals.filter(approval => {
    // Search filter
    const matchesSearch = searchQuery === '' ||
      approval.quoteNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      approval.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      approval.requester.toLowerCase().includes(searchQuery.toLowerCase()) ||
      approval.reason.toLowerCase().includes(searchQuery.toLowerCase())

    // Status filter
    const matchesStatus = selectedStatusFilter === null || approval.status === selectedStatusFilter

    // Advanced filters
    let matchesAdvancedFilters = true
    if (appliedFilters) {
      if (appliedFilters.statuses.length > 0 && !appliedFilters.statuses.includes(approval.status)) {
        matchesAdvancedFilters = false
      }
      if (appliedFilters.priorities.length > 0 && !appliedFilters.priorities.includes(approval.priority)) {
        matchesAdvancedFilters = false
      }
      if (appliedFilters.discountRange.min > 0 && approval.discount < appliedFilters.discountRange.min) {
        matchesAdvancedFilters = false
      }
      if (appliedFilters.discountRange.max < 100 && approval.discount > appliedFilters.discountRange.max) {
        matchesAdvancedFilters = false
      }
      if (appliedFilters.valueRange.min > 0 && approval.value < appliedFilters.valueRange.min * 100000) {
        matchesAdvancedFilters = false
      }
      if (appliedFilters.valueRange.max > 0 && approval.value > appliedFilters.valueRange.max * 100000) {
        matchesAdvancedFilters = false
      }
      if (appliedFilters.dateRange.start && new Date(approval.submittedDate) < new Date(appliedFilters.dateRange.start)) {
        matchesAdvancedFilters = false
      }
      if (appliedFilters.dateRange.end && new Date(approval.submittedDate) > new Date(appliedFilters.dateRange.end)) {
        matchesAdvancedFilters = false
      }
    }

    return matchesSearch && matchesStatus && matchesAdvancedFilters
  })

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'approved': return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'rejected': return <XCircle className="h-5 w-5 text-red-600" />
      case 'escalated': return <AlertCircle className="h-5 w-5 text-orange-600" />
      default: return <Clock className="h-5 w-5 text-blue-600" />
    }
  }

  const getStatusColor = (status: string) => {
    const colors: any = {
      pending: 'bg-blue-100 text-blue-700 border-blue-200',
      approved: 'bg-green-100 text-green-700 border-green-200',
      rejected: 'bg-red-100 text-red-700 border-red-200',
      escalated: 'bg-orange-100 text-orange-700 border-orange-200'
    }
    return colors[status] || colors.pending
  }

  const getPriorityColor = (priority: string) => {
    const colors: any = {
      low: 'bg-gray-100 text-gray-700 border-gray-200',
      medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      high: 'bg-orange-100 text-orange-700 border-orange-200',
      urgent: 'bg-red-100 text-red-700 border-red-200'
    }
    return colors[priority] || colors.medium
  }

  const getApproverStatusColor = (status: string) => {
    const colors: any = {
      pending: 'bg-blue-50 text-blue-700',
      approved: 'bg-green-50 text-green-700',
      rejected: 'bg-red-50 text-red-700'
    }
    return colors[status] || colors.pending
  }

  const totalApprovals = filteredApprovals.length
  const pending = filteredApprovals.filter(a => a.status === 'pending').length
  const approved = filteredApprovals.filter(a => a.status === 'approved').length
  const rejected = filteredApprovals.filter(a => a.status === 'rejected').length
  const avgApprovalTime = 2.3 // days

  return (
    <div className="w-full h-full px-4 py-2">
      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading approvals…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}
      {!isLoading && !loadError && approvals.length === 0 && (
        <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          No approval requests found.
        </div>
      )}
      {actionSuccess && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          <CheckCircle className="h-4 w-4" />
          {actionSuccess}
        </div>
      )}
      {actionError && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {actionError}
        </div>
      )}
      {isSubmitting && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Submitting decision…
        </div>
      )}
      {/* Action Buttons */}
      <div className="mb-3 flex justify-end">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsFilterModalOpen(true)}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filter
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-5 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Requests</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{totalApprovals}</p>
              <p className="text-xs text-blue-700 mt-1">All time</p>
            </div>
            <AlertCircle className="h-10 w-10 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-5 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Pending</p>
              <p className="text-2xl font-bold text-orange-900 mt-1">{pending}</p>
              <p className="text-xs text-orange-700 mt-1">Awaiting review</p>
            </div>
            <Clock className="h-10 w-10 text-orange-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-5 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Approved</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{approved}</p>
              <p className="text-xs text-green-700 mt-1">{((approved/totalApprovals)*100).toFixed(0)}% approval rate</p>
            </div>
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-5 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Rejected</p>
              <p className="text-2xl font-bold text-red-900 mt-1">{rejected}</p>
              <p className="text-xs text-red-700 mt-1">Needs revision</p>
            </div>
            <XCircle className="h-10 w-10 text-red-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-5 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Avg Time</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">{avgApprovalTime}d</p>
              <p className="text-xs text-purple-700 mt-1">To approval</p>
            </div>
            <Clock className="h-10 w-10 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Status Filter */}
      <div className="mb-3 flex gap-3">
        <button
          onClick={() => handleStatusFilter(null)}
          className={`px-4 py-2 ${
            selectedStatusFilter === null
              ? 'bg-blue-100 text-blue-700 border-blue-200'
              : 'bg-white text-gray-700 border-gray-300'
          } border rounded-lg hover:bg-blue-50 text-sm font-medium transition-colors`}
        >
          All Requests ({approvals.length})
        </button>
        <button
          onClick={() => handleStatusFilter('pending')}
          className={`px-4 py-2 ${
            selectedStatusFilter === 'pending'
              ? 'bg-orange-100 text-orange-700 border-orange-200'
              : 'bg-white text-gray-700 border-gray-300'
          } border rounded-lg hover:bg-orange-50 text-sm transition-colors`}
        >
          Pending ({approvals.filter(a => a.status === 'pending').length})
        </button>
        <button
          onClick={() => handleStatusFilter('approved')}
          className={`px-4 py-2 ${
            selectedStatusFilter === 'approved'
              ? 'bg-green-100 text-green-700 border-green-200'
              : 'bg-white text-gray-700 border-gray-300'
          } border rounded-lg hover:bg-green-50 text-sm transition-colors`}
        >
          Approved ({approvals.filter(a => a.status === 'approved').length})
        </button>
        <button
          onClick={() => handleStatusFilter('rejected')}
          className={`px-4 py-2 ${
            selectedStatusFilter === 'rejected'
              ? 'bg-red-100 text-red-700 border-red-200'
              : 'bg-white text-gray-700 border-gray-300'
          } border rounded-lg hover:bg-red-50 text-sm transition-colors`}
        >
          Rejected ({approvals.filter(a => a.status === 'rejected').length})
        </button>
        <button
          onClick={() => handleStatusFilter('escalated')}
          className={`px-4 py-2 ${
            selectedStatusFilter === 'escalated'
              ? 'bg-purple-100 text-purple-700 border-purple-200'
              : 'bg-white text-gray-700 border-gray-300'
          } border rounded-lg hover:bg-purple-50 text-sm transition-colors`}
        >
          Escalated ({approvals.filter(a => a.status === 'escalated').length})
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by quote number, customer, requester, or reason..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Approvals List */}
      <div className="space-y-2">
        {filteredApprovals.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mb-3" />
            <p className="text-gray-600">No approval requests found matching your filters</p>
          </div>
        ) : (
          filteredApprovals.map((approval) => (
            <div
              key={approval.id}
              onClick={() => handleViewApproval(approval)}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow cursor-pointer"
            >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                {getStatusIcon(approval.status)}
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-gray-900">{approval.quoteNumber}</h3>
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${getPriorityColor(approval.priority)}`}>
                      {approval.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{approval.customerName}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(approval.status)}`}>
                  {approval.status}
                </span>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(approval.submittedDate).toLocaleDateString('en-IN', { 
                    day: '2-digit', 
                    month: 'short',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                <p className="text-xs text-blue-600 font-medium">Quote Value</p>
                <p className="text-lg font-bold text-blue-900 mt-1">₹{(approval.value / 100000).toFixed(2)}L</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-3 border border-orange-100">
                <p className="text-xs text-orange-600 font-medium">Discount %</p>
                <p className="text-lg font-bold text-orange-900 mt-1">{approval.discount}%</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
                <p className="text-xs text-purple-600 font-medium">Requested By</p>
                <p className="text-sm font-semibold text-purple-900 mt-1">{approval.requester}</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3 mb-2 border border-gray-100">
              <p className="text-xs font-medium text-gray-700 mb-1">Reason for Approval:</p>
              <p className="text-sm text-gray-900">{approval.reason}</p>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-medium text-gray-700">Approval Chain:</p>
              {approval.approvers.map((approver, idx) => (
                <div
                  key={idx}
                  className={`flex items-start justify-between p-3 rounded-lg border ${getApproverStatusColor(approver.status)}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-white rounded-full">
                      <User className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-900">{approver.name}</p>
                        <span className="text-xs text-gray-500">• {approver.role}</span>
                      </div>
                      {approver.comments && (
                        <div className="flex items-start gap-1 mt-1">
                          <MessageSquare className="h-3 w-3 text-gray-500 mt-0.5" />
                          <p className="text-xs text-gray-700">{approver.comments}</p>
                        </div>
                      )}
                      {approver.date && (
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(approver.date).toLocaleDateString('en-IN', { 
                            day: '2-digit', 
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {approver.status === 'approved' && <ThumbsUp className="h-4 w-4 text-green-600" />}
                    {approver.status === 'rejected' && <ThumbsDown className="h-4 w-4 text-red-600" />}
                    {approver.status === 'pending' && <Clock className="h-4 w-4 text-blue-600" />}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleViewHistory(approval)
                }}
                className="flex-1 px-4 py-2 text-sm text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 flex items-center justify-center gap-2 transition-colors"
              >
                <History className="h-4 w-4" />
                History
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  router.push(`/cpq/quotes/create?id=${approval.quoteNumber}`)
                }}
                className="flex-1 px-4 py-2 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 flex items-center justify-center gap-2 transition-colors"
              >
                <Eye className="h-4 w-4" />
                View Quote
              </button>
              {approval.status === 'pending' && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleApprove(approval)
                    }}
                    className="flex-1 px-4 py-2 text-sm text-white bg-green-600 hover:bg-green-700 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Approve
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleReject(approval)
                    }}
                    className="flex-1 px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-700 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors"
                  >
                    <XCircle className="h-4 w-4" />
                    Reject
                  </button>
                </>
              )}
            </div>
          </div>
          ))
        )}
      </div>

      {/* Approval Info */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Approval Workflow Rules:</h3>
        <ul className="text-xs text-blue-700 space-y-1">
          <li><strong>Standard Discount (up to 10%):</strong> Auto-approved, no manager review needed</li>
          <li><strong>Elevated Discount (10-15%):</strong> Requires Sales Manager approval</li>
          <li><strong>High Discount (15-20%):</strong> Requires Regional Director approval</li>
          <li><strong>Premium Discount (20%+):</strong> Requires VP Sales and CFO approval</li>
          <li><strong>Payment Terms Extension:</strong> Requires Finance Manager approval</li>
        </ul>
      </div>

      {/* Modals */}
      <ViewApprovalModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false)
          setSelectedApproval(null)
        }}
        approval={selectedApproval}
        onApprove={handleApprove}
        onReject={handleReject}
      />

      <ApproveRejectModal
        isOpen={isApproveRejectModalOpen}
        onClose={() => {
          setIsApproveRejectModalOpen(false)
          setSelectedApproval(null)
        }}
        approval={selectedApproval}
        action={approvalAction}
        onSubmit={handleSubmitApprovalDecision}
      />

      <ApprovalHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => {
          setIsHistoryModalOpen(false)
          setSelectedApproval(null)
        }}
        approval={selectedApproval}
      />

      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={handleApplyFilters}
      />
    </div>
  )
}
