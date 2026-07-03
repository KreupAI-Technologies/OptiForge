'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { cpqWorkflowRequestService } from '@/services/cpq/cpq-orphans.service'
import {
  Crown,
  Search,
  Filter,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Shield,
  DollarSign,
  AlertTriangle,
  Eye,
  MessageSquare
} from 'lucide-react'
import {
  ApproveExecutiveDealModal,
  RejectExecutiveDealModal,
  PutOnHoldModal,
  AddExecutiveCommentModal,
  ViewExecutiveDetailsModal,
  ExecutiveApproval as ImportedExecutiveApproval
} from '@/components/cpq/ExecutiveWorkflowModals'

interface ExecutiveApproval {
  id: string
  type: 'strategic-deal' | 'major-discount' | 'high-value' | 'partnership' | 'international' | 'custom-terms'
  documentNumber: string
  customerName: string
  dealValue: number
  requestedBy: string
  salesManager: string
  requestDate: string
  priority: 'high' | 'urgent' | 'critical'
  status: 'pending' | 'approved' | 'rejected' | 'on-hold'
  assignedTo: string
  dueDate: string
  businessJustification: string
  strategicImportance: 'low' | 'medium' | 'high' | 'critical'
  keyHighlights: string[]
  risks: Risk[]
  financialImpact: FinancialImpact
  competitiveAnalysis?: CompetitiveAnalysis
  approvalChain: ApprovalStep[]
  comments: Comment[]
}

interface Risk {
  category: string
  level: 'low' | 'medium' | 'high'
  description: string
  mitigation: string
}

interface FinancialImpact {
  revenue: number
  margin: number
  marginPercentage: number
  projectedLifetimeValue: number
  paybackPeriod: string
}

interface CompetitiveAnalysis {
  competitors: string[]
  ourPosition: string
  differentiators: string[]
}

interface ApprovalStep {
  level: number
  approver: string
  role: string
  status: 'pending' | 'approved' | 'rejected'
  actionDate?: string
  comments?: string
}

interface Comment {
  id: string
  author: string
  role: string
  message: string
  timestamp: string
}

export default function CPQWorkflowExecutivePage() {
  const router = useRouter()

  // Modal states
  const [isApproveOpen, setIsApproveOpen] = useState(false)
  const [isRejectOpen, setIsRejectOpen] = useState(false)
  const [isHoldOpen, setIsHoldOpen] = useState(false)
  const [isCommentOpen, setIsCommentOpen] = useState(false)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [selectedApproval, setSelectedApproval] = useState<ExecutiveApproval | null>(null)

  const [approvals, setApprovals] = useState<ExecutiveApproval[]>([])

  useEffect(() => {
    let active = true
    cpqWorkflowRequestService
      .findAll({ requestType: 'executive' })
      .then((rows) => {
        if (!active) return
        const mapped: ExecutiveApproval[] = (Array.isArray(rows) ? rows : []).map((r) => {
          const p = (r.payload || {}) as any
          return {
            ...p,
            id: r.id,
            documentNumber: r.documentNumber ?? p.documentNumber ?? '',
            customerName: r.customerName ?? p.customerName ?? '',
            dealValue: Number(r.value) || p.dealValue || 0,
            requestedBy: r.requestedBy ?? p.requestedBy ?? '',
            requestDate: r.requestDate ?? p.requestDate ?? '',
            assignedTo: r.assignedTo ?? p.assignedTo ?? '',
            dueDate: r.dueDate ?? p.dueDate ?? '',
            priority: (r.priority ?? p.priority ?? 'high') as ExecutiveApproval['priority'],
            status: (r.status ?? p.status ?? 'pending') as ExecutiveApproval['status'],
            type: (p.type ?? 'high-value') as ExecutiveApproval['type'],
            salesManager: p.salesManager ?? '',
            businessJustification: p.businessJustification ?? '',
            strategicImportance: (p.strategicImportance ?? 'medium') as ExecutiveApproval['strategicImportance'],
            keyHighlights: Array.isArray(p.keyHighlights) ? p.keyHighlights : [],
            risks: Array.isArray(p.risks) ? p.risks : [],
            financialImpact: p.financialImpact ?? {
              revenue: 0,
              margin: 0,
              marginPercentage: 0,
              projectedLifetimeValue: 0,
              paybackPeriod: ''
            },
            competitiveAnalysis: p.competitiveAnalysis,
            approvalChain: Array.isArray(p.approvalChain) ? p.approvalChain : [],
            comments: Array.isArray(p.comments) ? p.comments : []
          } as ExecutiveApproval
        })
        setApprovals(mapped)
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [])

  const getTypeColor = (type: string) => {
    const colors: any = {
      'strategic-deal': 'bg-purple-100 text-purple-700 border-purple-200',
      'major-discount': 'bg-orange-100 text-orange-700 border-orange-200',
      'high-value': 'bg-blue-100 text-blue-700 border-blue-200',
      'partnership': 'bg-green-100 text-green-700 border-green-200',
      'international': 'bg-pink-100 text-pink-700 border-pink-200',
      'custom-terms': 'bg-yellow-100 text-yellow-700 border-yellow-200'
    }
    return colors[type] || colors['strategic-deal']
  }

  const getStatusColor = (status: string) => {
    const colors: any = {
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      approved: 'bg-green-100 text-green-700 border-green-200',
      rejected: 'bg-red-100 text-red-700 border-red-200',
      'on-hold': 'bg-gray-100 text-gray-700 border-gray-200'
    }
    return colors[status] || colors.pending
  }

  const getImportanceColor = (importance: string) => {
    const colors: any = {
      low: 'bg-blue-100 text-blue-700 border-blue-200',
      medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      high: 'bg-orange-100 text-orange-700 border-orange-200',
      critical: 'bg-red-100 text-red-700 border-red-200'
    }
    return colors[importance] || colors.medium
  }

  const getRiskColor = (level: string) => {
    const colors: any = {
      low: 'bg-green-100 text-green-700 border-green-200',
      medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      high: 'bg-red-100 text-red-700 border-red-200'
    }
    return colors[level] || colors.medium
  }

  const getStepStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  // Modal handlers
  const handleApprove = (approval: ExecutiveApproval) => {
    setSelectedApproval(approval)
    setIsApproveOpen(true)
  }

  const handleReject = (approval: ExecutiveApproval) => {
    setSelectedApproval(approval)
    setIsRejectOpen(true)
  }

  const handleHold = (approval: ExecutiveApproval) => {
    setSelectedApproval(approval)
    setIsHoldOpen(true)
  }

  const handleAddComment = (approval: ExecutiveApproval) => {
    setSelectedApproval(approval)
    setIsCommentOpen(true)
  }

  const handleView = (approval: ExecutiveApproval) => {
    setSelectedApproval(approval)
    setIsViewOpen(true)
  }

  const handleApproveSubmit = (data: { comments: string; conditions?: string }) => {
    console.log('Approved:', selectedApproval?.documentNumber, data)
    // TODO: API call to approve the executive deal
    setIsApproveOpen(false)
  }

  const handleRejectSubmit = (data: { reason: string; comments: string }) => {
    console.log('Rejected:', selectedApproval?.documentNumber, data)
    // TODO: API call to reject the executive deal
    setIsRejectOpen(false)
  }

  const handleHoldSubmit = (data: { reason: string; reviewDate: string }) => {
    console.log('Put on Hold:', selectedApproval?.documentNumber, data)
    // TODO: API call to put deal on hold
    setIsHoldOpen(false)
  }

  const handleCommentSubmit = (comment: string) => {
    console.log('Comment added:', selectedApproval?.documentNumber, comment)
    // TODO: API call to add executive comment
    setIsCommentOpen(false)
  }

  const totalApprovals = approvals.length
  const pendingApprovals = approvals.filter(a => a.status === 'pending').length
  const approvedApprovals = approvals.filter(a => a.status === 'approved').length
  const totalValue = approvals.reduce((sum, a) => sum + a.dealValue, 0)
  const avgMargin = (approvals.reduce((sum, a) => sum + a.financialImpact.marginPercentage, 0) / approvals.length).toFixed(1)

  return (
    <div className="w-full h-full px-4 py-2">
      {/* Action Buttons */}
      <div className="mb-3 flex justify-end">
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </button>
          <button className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-3">
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-5 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Total Approvals</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">{totalApprovals}</p>
            </div>
            <Crown className="h-10 w-10 text-purple-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-5 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-900 mt-1">{pendingApprovals}</p>
            </div>
            <Clock className="h-10 w-10 text-yellow-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-5 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Approved</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{approvedApprovals}</p>
            </div>
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-5 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Value</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">₹{(totalValue / 10000000).toFixed(1)}Cr</p>
            </div>
            <DollarSign className="h-10 w-10 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-5 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Avg Margin</p>
              <p className="text-2xl font-bold text-orange-900 mt-1">{avgMargin}%</p>
            </div>
            <TrendingUp className="h-10 w-10 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Type Filters */}
      <div className="mb-3 flex gap-3 overflow-x-auto pb-2">
        <button className="px-4 py-2 bg-purple-100 text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-200 text-sm font-medium whitespace-nowrap">
          All Approvals ({totalApprovals})
        </button>
        <button className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm whitespace-nowrap">
          Strategic Deals ({approvals.filter(a => a.type === 'strategic-deal').length})
        </button>
        <button className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm whitespace-nowrap">
          International ({approvals.filter(a => a.type === 'international').length})
        </button>
        <button className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm whitespace-nowrap">
          High Value ({approvals.filter(a => a.type === 'high-value').length})
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by document number, customer, or sales manager..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Executive Approvals */}
      <div className="space-y-3">
        {approvals.map((approval) => (
          <div
            key={approval.id}
            className="bg-white rounded-lg shadow-md border-2 border-purple-200 p-3"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="h-5 w-5 text-purple-600" />
                  <h3 className="text-lg font-bold text-gray-900">{approval.documentNumber}</h3>
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${getTypeColor(approval.type)}`}>
                    {approval.type.replace('-', ' ')}
                  </span>
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${getStatusColor(approval.status)}`}>
                    {approval.status}
                  </span>
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${getImportanceColor(approval.strategicImportance)}`}>
                    {approval.strategicImportance} importance
                  </span>
                </div>
                <p className="text-sm text-gray-600">{approval.customerName}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-purple-600">₹{(approval.dealValue / 10000000).toFixed(2)}Cr</p>
                <p className="text-xs text-gray-500">Deal Value</p>
              </div>
            </div>

            {/* Business Justification */}
            <div className="mb-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs font-semibold text-blue-900 mb-2">Business Justification:</p>
              <p className="text-sm text-blue-800">{approval.businessJustification}</p>
            </div>

            {/* Key Highlights */}
            <div className="mb-2">
              <p className="text-xs font-semibold text-gray-700 mb-2">Key Highlights:</p>
              <ul className="space-y-1">
                {approval.keyHighlights.map((highlight, idx) => (
                  <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    {highlight}
                  </li>
                ))}
              </ul>
            </div>

            {/* Financial Impact */}
            <div className="mb-2 bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-xs font-semibold text-green-900 mb-2">Financial Impact:</p>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                <div>
                  <p className="text-green-700">Revenue</p>
                  <p className="font-bold text-green-900">₹{(approval.financialImpact.revenue / 10000000).toFixed(2)}Cr</p>
                </div>
                <div>
                  <p className="text-green-700">Margin</p>
                  <p className="font-bold text-green-900">₹{(approval.financialImpact.margin / 100000).toFixed(2)}L</p>
                </div>
                <div>
                  <p className="text-green-700">Margin %</p>
                  <p className="font-bold text-green-900">{approval.financialImpact.marginPercentage}%</p>
                </div>
                <div>
                  <p className="text-green-700">Lifetime Value</p>
                  <p className="font-bold text-green-900">₹{(approval.financialImpact.projectedLifetimeValue / 10000000).toFixed(2)}Cr</p>
                </div>
                <div>
                  <p className="text-green-700">Payback</p>
                  <p className="font-bold text-green-900">{approval.financialImpact.paybackPeriod}</p>
                </div>
              </div>
            </div>

            {/* Risks */}
            <div className="mb-2">
              <p className="text-xs font-semibold text-gray-700 mb-2">Risk Assessment:</p>
              <div className="space-y-2">
                {approval.risks.map((risk, idx) => (
                  <div key={idx} className="bg-yellow-50 border border-yellow-200 rounded p-3 text-xs">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900">{risk.category}</span>
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded border ${getRiskColor(risk.level)}`}>
                        {risk.level} risk
                      </span>
                    </div>
                    <p className="text-gray-700 mb-1">{risk.description}</p>
                    <p className="text-gray-600 italic">🛡️ Mitigation: {risk.mitigation}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Competitive Analysis */}
            {approval.competitiveAnalysis && (
              <div className="mb-2 bg-purple-50 border border-purple-200 rounded-lg p-3">
                <p className="text-xs font-semibold text-purple-900 mb-2">Competitive Analysis:</p>
                <div className="text-xs space-y-2">
                  <div>
                    <p className="text-purple-700">Competitors: <span className="font-semibold">{approval.competitiveAnalysis.competitors.join(', ')}</span></p>
                  </div>
                  <div>
                    <p className="text-purple-700">Our Position: <span className="font-semibold">{approval.competitiveAnalysis.ourPosition}</span></p>
                  </div>
                  <div>
                    <p className="text-purple-700 mb-1">Differentiators:</p>
                    <ul className="ml-4 space-y-0.5">
                      {approval.competitiveAnalysis.differentiators.map((diff, idx) => (
                        <li key={idx} className="text-purple-800">• {diff}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Approval Chain */}
            <div className="mb-2">
              <p className="text-xs font-semibold text-gray-700 mb-2">Approval Chain:</p>
              <div className="space-y-2">
                {approval.approvalChain.map((step) => (
                  <div key={step.level} className="flex items-start gap-3 text-xs">
                    <div className="flex-shrink-0 mt-0.5">
                      {getStepStatusIcon(step.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900">Level {step.level}: {step.approver}</p>
                        <span className="text-gray-500">({step.role})</span>
                        <span className={`px-2 py-0.5 text-xs rounded border ${
                          step.status === 'approved' ? 'bg-green-50 text-green-700 border-green-200' :
                          step.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                          'bg-yellow-50 text-yellow-700 border-yellow-200'
                        }`}>
                          {step.status}
                        </span>
                      </div>
                      {step.actionDate && (
                        <p className="text-gray-500 mt-0.5">{step.actionDate}</p>
                      )}
                      {step.comments && (
                        <p className="text-gray-600 mt-1 italic">&ldquo;{step.comments}&rdquo;</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Comments */}
            {approval.comments.length > 0 && (
              <div className="mb-2">
                <p className="text-xs font-semibold text-gray-700 mb-2">Executive Comments:</p>
                <div className="space-y-2">
                  {approval.comments.map((comment) => (
                    <div key={comment.id} className="bg-gray-50 rounded p-3 text-xs">
                      <div className="flex items-center gap-2 mb-1">
                        <Crown className="h-3 w-3 text-purple-500" />
                        <span className="font-semibold text-gray-900">{comment.author}</span>
                        <span className="text-gray-500">({comment.role})</span>
                        <span className="text-gray-400 ml-auto">{comment.timestamp}</span>
                      </div>
                      <p className="text-gray-700">{comment.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2">
              {approval.status === 'pending' && (
                <>
                  <button
                    onClick={() => handleApprove(approval)}
                    className="px-4 py-2 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700 flex items-center gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Approve Deal
                  </button>
                  <button
                    onClick={() => handleReject(approval)}
                    className="px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700 flex items-center gap-2"
                  >
                    <XCircle className="h-4 w-4" />
                    Reject
                  </button>
                  <button
                    onClick={() => handleHold(approval)}
                    className="px-4 py-2 text-sm text-white bg-gray-600 rounded-lg hover:bg-gray-700 flex items-center gap-2"
                  >
                    <Clock className="h-4 w-4" />
                    Put on Hold
                  </button>
                  <button
                    onClick={() => handleAddComment(approval)}
                    className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Add Comment
                  </button>
                </>
              )}
              <button
                onClick={() => handleView(approval)}
                className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                View Full Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Executive Approval Info */}
      <div className="mt-6 bg-purple-50 border border-purple-200 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-purple-900 mb-2">Executive Approval Criteria:</h3>
        <ul className="text-xs text-purple-700 space-y-1">
          <li><strong>Strategic Deals:</strong> Partnerships, exclusivity agreements, market entry opportunities</li>
          <li><strong>High Value:</strong> Deals above ₹1Cr requiring CEO/CFO approval</li>
          <li><strong>Major Discounts:</strong> Discounts exceeding 20% with significant margin impact</li>
          <li><strong>International:</strong> Cross-border deals requiring expansion decision</li>
          <li><strong>Custom Terms:</strong> Non-standard contract terms with legal/financial implications</li>
          <li><strong>Review Focus:</strong> Strategic importance, financial impact, risk assessment, competitive positioning, long-term value</li>
        </ul>
      </div>

      {/* Modals */}
      <ApproveExecutiveDealModal
        isOpen={isApproveOpen}
        onClose={() => setIsApproveOpen(false)}
        onApprove={handleApproveSubmit}
        approval={selectedApproval}
      />

      <RejectExecutiveDealModal
        isOpen={isRejectOpen}
        onClose={() => setIsRejectOpen(false)}
        onReject={handleRejectSubmit}
        approval={selectedApproval}
      />

      <PutOnHoldModal
        isOpen={isHoldOpen}
        onClose={() => setIsHoldOpen(false)}
        onHold={handleHoldSubmit}
        approval={selectedApproval}
      />

      <AddExecutiveCommentModal
        isOpen={isCommentOpen}
        onClose={() => setIsCommentOpen(false)}
        onAddComment={handleCommentSubmit}
        approval={selectedApproval}
      />

      <ViewExecutiveDetailsModal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        approval={selectedApproval}
      />
    </div>
  )
}
