'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Calendar,
  DollarSign,
  FileText,
  MessageSquare,
  ChevronRight,
  Filter,
  Search,
  Download,
  Eye,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  Send,
  UserCheck,
  Users,
  ArrowRight,
  AlertTriangle,
  Timer,
  TrendingUp,
  Package,
  Building2,
  Hash,
  Zap
} from 'lucide-react'
import { io } from 'socket.io-client'

import {
  ApproveModal,
  RejectModal,
  DelegateModalFixed as DelegateModal,
  ReturnModalFixed as ReturnModal,
  ViewHistoryModal,
  ViewDetailsModal,
  BulkActionsModal,
  ExportApprovalsModal
} from '@/components/procurement/ApprovalModalsFixed'

import { approvalService, ApprovalRequest } from '@/services/ApprovalService'

interface ApprovalStats {
  pending: number
  approved: number
  rejected: number
  avgApprovalTime: number
  overdueCount: number
  escalatedCount: number
}



export default function ApprovalsPage() {
  const [selectedTab, setSelectedTab] = useState<'my_approvals' | 'my_requests' | 'delegated' | 'all'>('my_approvals')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPriority, setSelectedPriority] = useState('all')
  const [showDetails, setShowDetails] = useState<string | null>(null)

  // Data state
  const [approvalRequests, setApprovalRequests] = useState<ApprovalRequest[]>([])
  const [loading, setLoading] = useState(true)

  // Modal state management
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false)
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false)
  const [isDelegateModalOpen, setIsDelegateModalOpen] = useState(false)
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false)
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isBulkActionsModalOpen, setIsBulkActionsModalOpen] = useState(false)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [selectedApproval, setSelectedApproval] = useState<ApprovalRequest | null>(null)
  const [selectedApprovals, setSelectedApprovals] = useState<string[]>([])

  useEffect(() => {
    fetchApprovals()

    // Real-time updates. Socket.IO binds at the server origin, not the /api/v1
    // REST prefix, so strip any path from the configured API URL.
    const wsOrigin = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1').replace(/\/api\/v1\/?$/, '')
    const socket = io(wsOrigin)

    socket.on('connect', () => {
      console.log('Connected to WebSocket for approvals')
    })

    socket.on('approval.created', (newApproval: ApprovalRequest) => {
      setApprovalRequests(prev => [newApproval, ...prev])
    })

    socket.on('approval.updated', (updatedApproval: ApprovalRequest) => {
      setApprovalRequests(prev => prev.map(req => req.id === updatedApproval.id ? updatedApproval : req))
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  const fetchApprovals = async () => {
    try {
      setLoading(true)
      const data = await approvalService.getApprovals()
      setApprovalRequests(data)
    } catch (error) {
      console.error('Failed to fetch approvals:', error)
    } finally {
      setLoading(false)
    }
  }

  const stats: ApprovalStats = {
    pending: approvalRequests.filter(a => a.status === 'pending').length,
    approved: approvalRequests.filter(a => a.status === 'approved').length,
    rejected: approvalRequests.filter(a => a.status === 'rejected').length,
    avgApprovalTime: 2.5, // This would ideally come from backend analytics
    overdueCount: approvalRequests.filter(a => a.slaStatus === 'overdue').length,
    escalatedCount: approvalRequests.filter(a => a.status === 'escalated').length
  }

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      approved: 'bg-green-100 text-green-800 border-green-300',
      rejected: 'bg-red-100 text-red-800 border-red-300',
      escalated: 'bg-purple-100 text-purple-800 border-purple-300',
      expired: 'bg-gray-100 text-gray-800 border-gray-300'
    }
    return colors[status as keyof typeof colors] || colors.pending
  }

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'text-gray-600 bg-gray-100',
      medium: 'text-blue-600 bg-blue-100',
      high: 'text-orange-600 bg-orange-100',
      urgent: 'text-red-600 bg-red-100'
    }
    return colors[priority as keyof typeof colors] || colors.medium
  }

  const getSLAColor = (sla: string) => {
    const colors = {
      on_time: 'text-green-600',
      due_soon: 'text-yellow-600',
      overdue: 'text-red-600'
    }
    return colors[sla as keyof typeof colors] || colors.on_time
  }

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'purchase_order':
        return <Package className="h-4 w-4" />
      case 'requisition':
        return <FileText className="h-4 w-4" />
      case 'rfq':
        return <MessageSquare className="h-4 w-4" />
      case 'contract':
        return <FileText className="h-4 w-4" />
      case 'vendor':
        return <Building2 className="h-4 w-4" />
      case 'payment':
        return <DollarSign className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const filteredRequests = approvalRequests.filter(request => {
    // Mock logic for "My Approvals" vs "My Requests" since we don't have auth context yet
    // In a real app, we'd compare request.currentApprover with currentUser.id
    const matchesTab = selectedTab === 'all' ||
      (selectedTab === 'my_approvals' && request.status === 'pending') ||
      (selectedTab === 'my_requests' && request.requestedBy === 'John Smith') || // Mock user
      (selectedTab === 'delegated' && request.delegatedFrom)

    const matchesStatus = selectedStatus === 'all' || request.status === selectedStatus
    const matchesType = selectedType === 'all' || request.documentType === selectedType
    const matchesPriority = selectedPriority === 'all' || request.priority === selectedPriority
    const matchesSearch = request.documentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.requestedBy.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesTab && matchesStatus && matchesType && matchesPriority && matchesSearch
  })

  // Modal handlers
  const handleApprove = (request: ApprovalRequest) => {
    setSelectedApproval(request)
    setIsApproveModalOpen(true)
  }

  const handleReject = (request: ApprovalRequest) => {
    setSelectedApproval(request)
    setIsRejectModalOpen(true)
  }

  const handleReturn = (request: ApprovalRequest) => {
    setSelectedApproval(request)
    setIsReturnModalOpen(true)
  }

  const handleViewDetails = (request: ApprovalRequest) => {
    setSelectedApproval(request)
    setIsDetailsModalOpen(true)
  }

  const handleViewHistory = (request: ApprovalRequest) => {
    setSelectedApproval(request)
    setIsHistoryModalOpen(true)
  }

  const handleDelegate = () => {
    setIsDelegateModalOpen(true)
  }

  const handleBulkActions = () => {
    setIsBulkActionsModalOpen(true)
  }

  const handleExport = () => {
    setIsExportModalOpen(true)
  }

  const toggleSelectApproval = (id: string) => {
    setSelectedApprovals(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selectedApprovals.length === filteredRequests.length) {
      setSelectedApprovals([])
    } else {
      setSelectedApprovals(filteredRequests.map(r => r.id))
    }
  }

  const handleActionComplete = async () => {
    // Refresh list after action
    await fetchApprovals()
    setIsApproveModalOpen(false)
    setIsRejectModalOpen(false)
    setIsReturnModalOpen(false)
    setIsDelegateModalOpen(false)
    setIsBulkActionsModalOpen(false)
    setSelectedApproval(null)
    setSelectedApprovals([])
  }

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  }

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Approval Workflow</h1>
          <p className="text-gray-500 mt-1">Manage and track approval requests across procurement</p>
        </div>
        <div className="flex gap-3">
          {selectedApprovals.length > 0 && (
            <button
              onClick={handleBulkActions}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
            >
              <Zap className="h-4 w-4" />
              Bulk Actions ({selectedApprovals.length})
            </button>
          )}
          <button
            onClick={handleDelegate}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <UserCheck className="h-4 w-4" />
            Delegate
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <Clock className="h-8 w-8 text-yellow-500" />
            <span className={`text-xs font-medium ${stats.pending > 0 ? 'text-yellow-600' : 'text-gray-400'}`}>
              Action Required
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
          <p className="text-sm text-gray-500 mt-1">Pending</p>
        </div>

        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
          <p className="text-sm text-gray-500 mt-1">Approved</p>
        </div>

        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <XCircle className="h-8 w-8 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
          <p className="text-sm text-gray-500 mt-1">Rejected</p>
        </div>

        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <Timer className="h-8 w-8 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.avgApprovalTime}d</p>
          <p className="text-sm text-gray-500 mt-1">Avg Time</p>
        </div>

        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="h-8 w-8 text-orange-500" />
            {stats.overdueCount > 0 && (
              <Zap className="h-4 w-4 text-orange-600 animate-pulse" />
            )}
          </div>
          <p className="text-2xl font-bold text-orange-600">{stats.overdueCount}</p>
          <p className="text-sm text-gray-500 mt-1">Overdue</p>
        </div>

        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="h-8 w-8 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-purple-600">{stats.escalatedCount}</p>
          <p className="text-sm text-gray-500 mt-1">Escalated</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b">
          <div className="flex">
            <button
              onClick={() => setSelectedTab('my_approvals')}
              className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${selectedTab === 'my_approvals'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              My Approvals
              {stats.pending > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                  {stats.pending}
                </span>
              )}
            </button>
            <button
              onClick={() => setSelectedTab('my_requests')}
              className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${selectedTab === 'my_requests'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              My Requests
            </button>
            <button
              onClick={() => setSelectedTab('delegated')}
              className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${selectedTab === 'delegated'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              Delegated
            </button>
            <button
              onClick={() => setSelectedTab('all')}
              className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${selectedTab === 'all'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              All Approvals
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex flex-col lg:flex-row gap-2">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedApprovals.length === filteredRequests.length && filteredRequests.length > 0}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Select All</span>
              </label>
            </div>
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by document number, title, or requester..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="escalated">Escalated</option>
                <option value="expired">Expired</option>
              </select>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="requisition">Requisition</option>
                <option value="purchase_order">Purchase Order</option>
                <option value="rfq">RFQ</option>
                <option value="contract">Contract</option>
                <option value="vendor">Vendor</option>
                <option value="payment">Payment</option>
              </select>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
        </div>

        {/* Approval Requests List */}
        <div className="divide-y divide-gray-200">
          {filteredRequests.map((request) => (
            <div key={request.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-start gap-2">
                {/* Checkbox */}
                <div className="pt-2">
                  <input
                    type="checkbox"
                    checked={selectedApprovals.includes(request.id)}
                    onChange={() => toggleSelectApproval(request.id)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                </div>

                <div className="flex-1">
                  {/* Document Header */}
                  <div className="flex items-start gap-2 mb-3">
                    <div className={`p-2 rounded-lg ${getPriorityColor(request.priority)}`}>
                      {getDocumentIcon(request.documentType)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-gray-900">{request.title}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                          {request.status}
                        </span>
                        {request.delegatedFrom && (
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs">
                            Delegated
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Hash className="h-3 w-3" />
                          {request.documentNumber}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {request.requestedBy}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {request.requestedDate}
                        </span>
                        {request.amount > 0 && (
                          <span className="flex items-center gap-1 font-medium text-gray-700">
                            <DollarSign className="h-3 w-3" />
                            {request.currency} {request.amount.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Approval Progress */}
                  <div className="ml-14 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                          <span>Approval Progress</span>
                          <span>Level {request.approvalLevel} of {request.totalLevels}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${(request.approvalLevel / request.totalLevels) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Approval Chain */}
                  <div className="ml-14">
                    <div className="flex items-center gap-2">
                      {request.approvalHistory.map((history, index) => (
                        <div key={index} className="flex items-center">
                          <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded-full ${history.action === 'approved' ? 'bg-green-100' :
                              history.action === 'rejected' ? 'bg-red-100' : 'bg-yellow-100'
                              }`}>
                              {history.action === 'approved' ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : history.action === 'rejected' ? (
                                <XCircle className="h-4 w-4 text-red-600" />
                              ) : (
                                <RotateCcw className="h-4 w-4 text-yellow-600" />
                              )}
                            </div>
                            <div className="text-xs">
                              <p className="font-medium text-gray-900">{history.approver}</p>
                              <p className="text-gray-500">{history.date}</p>
                            </div>
                          </div>
                          {index < request.approvalHistory.length - 1 && (
                            <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />
                          )}
                        </div>
                      ))}
                      {request.status === 'pending' && (
                        <>
                          {request.approvalHistory.length > 0 && (
                            <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />
                          )}
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-full bg-yellow-100 animate-pulse">
                              <Clock className="h-4 w-4 text-yellow-600" />
                            </div>
                            <div className="text-xs">
                              <p className="font-medium text-gray-900">{request.currentApprover}</p>
                              <p className={`${getSLAColor(request.slaStatus)}`}>
                                Due: {request.dueDate}
                              </p>
                            </div>
                          </div>
                        </>
                      )}
                      {request.nextApprovers.length > 0 && (
                        <>
                          <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />
                          <div className="flex items-center gap-1">
                            {request.nextApprovers.map((approver, index) => (
                              <div key={index} className="flex items-center">
                                <div className="p-1.5 rounded-full bg-gray-100">
                                  <User className="h-4 w-4 text-gray-400" />
                                </div>
                                {index < request.nextApprovers.length - 1 && (
                                  <ChevronRight className="h-3 w-3 text-gray-400 mx-1" />
                                )}
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="ml-14 mt-3 flex items-center gap-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      {request.department}
                    </span>
                    {request.vendor && (
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {request.vendor}
                      </span>
                    )}
                    {request.attachments > 0 && (
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {request.attachments} files
                      </span>
                    )}
                    {request.comments > 0 && (
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {request.comments} comments
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="ml-4">
                  {request.status === 'pending' ? (
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleApprove(request)}
                        className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm flex items-center gap-1"
                      >
                        <ThumbsUp className="h-4 w-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(request)}
                        className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm flex items-center gap-1"
                      >
                        <ThumbsDown className="h-4 w-4" />
                        Reject
                      </button>
                      <button
                        onClick={() => handleViewDetails(request)}
                        className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg text-sm flex items-center gap-1"
                      >
                        <Eye className="h-4 w-4" />
                        Details
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleViewHistory(request)}
                      className="px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg text-sm flex items-center gap-1"
                    >
                      <Clock className="h-4 w-4" />
                      History
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      {selectedApproval && (
        <>
          <ApproveModal
            isOpen={isApproveModalOpen}
            onClose={() => setIsApproveModalOpen(false)}
            onApprove={async (comments) => {
              await approvalService.processAction(selectedApproval.id, 'user-id', 'approve', comments)
              handleActionComplete()
            }}
            request={selectedApproval}
          />
          <RejectModal
            isOpen={isRejectModalOpen}
            onClose={() => setIsRejectModalOpen(false)}
            onReject={async (comments) => {
              await approvalService.processAction(selectedApproval.id, 'user-id', 'reject', comments)
              handleActionComplete()
            }}
            request={selectedApproval}
          />
          {/*
          <DelegateModal
            isOpen={isDelegateModalOpen}
            onClose={() => setIsDelegateModalOpen(false)}
            onDelegate={() => handleActionComplete()}
            request={selectedApproval}
          />
          */}
          <DelegateModal
            isOpen={isDelegateModalOpen}
            onClose={() => setIsDelegateModalOpen(false)}
            onDelegate={() => handleActionComplete()}
            request={selectedApproval}
          />
          <ReturnModal
            isOpen={isReturnModalOpen}
            onClose={() => setIsReturnModalOpen(false)}
            onReturn={() => handleActionComplete()}
            request={selectedApproval}
          />
          <ViewHistoryModal
            isOpen={isHistoryModalOpen}
            onClose={() => setIsHistoryModalOpen(false)}
            request={selectedApproval}
          />
          <ViewDetailsModal
            isOpen={isDetailsModalOpen}
            onClose={() => setIsDetailsModalOpen(false)}
            request={selectedApproval}
          />
        </>
      )}

      <BulkActionsModal
        isOpen={isBulkActionsModalOpen}
        onClose={() => setIsBulkActionsModalOpen(false)}
        selectedCount={selectedApprovals.length}
        onComplete={handleActionComplete}
      />

      <ExportApprovalsModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
    </div>
  )
}