'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { cpqContractService } from '@/services/cpq/cpq-contract.service'
import {
  Clock,
  Search,
  Filter,
  Download,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  MessageSquare,
  TrendingUp,
  FileText,
  Send
} from 'lucide-react'

interface ApprovalRequest {
  id: string
  contractNumber: string
  contractType: string
  customerName: string
  contractValue: number
  requestedBy: string
  requestDate: string
  currentApprover: string
  status: 'pending' | 'approved' | 'rejected' | 'escalated'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  reason: string
  approvalChain: ApprovalStep[]
  comments: Comment[]
  dueDate: string
}

interface ApprovalStep {
  level: number
  approver: string
  role: string
  status: 'pending' | 'approved' | 'rejected' | 'skipped'
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

export default function CPQContractsApprovalsPage() {
  const router = useRouter()

  const [approvals, setApprovals] = useState<ApprovalRequest[]>([])

  const loadApprovals = async () => {
    const data = await cpqContractService.findAllContracts({ status: 'pending_approval' as any })
    const list = Array.isArray(data) ? data : []
    const mapped: ApprovalRequest[] = list.map((c: any) => ({
      id: c?.id ?? '',
      contractNumber: c?.contractNumber ?? '',
      contractType: c?.title ?? c?.contractType ?? '',
      customerName: c?.customerName ?? '',
      contractValue: c?.totalValue ?? c?.value ?? 0,
      requestedBy: c?.createdBy ?? '',
      requestDate: c?.createdAt ?? '',
      currentApprover: '',
      status: (c?.status === 'pending_approval' ? 'pending' : (c?.status ?? 'pending')) as any,
      priority: 'medium' as any,
      reason: c?.notes ?? '',
      dueDate: c?.endDate ?? c?.createdAt ?? '',
      approvalChain: Array.isArray(c?.approvalChain) ? c.approvalChain : [],
      comments: Array.isArray(c?.comments) ? c.comments : [],
    }))
    setApprovals(mapped)
  }

  useEffect(() => {
    loadApprovals()
  }, [])

  const handleApprove = async (id: string) => {
    await cpqContractService.approveContract(id, 'current-user')
    await loadApprovals()
  }

  const _mockApprovals: ApprovalRequest[] = [
    {
      id: 'APR-001',
      contractNumber: 'CONT-2024-1234',
      contractType: 'Premium Service Agreement',
      customerName: 'Prestige Properties Ltd',
      contractValue: 4500000,
      requestedBy: 'Rahul Kumar',
      requestDate: '2024-10-18 10:30 AM',
      currentApprover: 'Sales Manager',
      status: 'pending',
      priority: 'high',
      reason: 'High value contract requires VP approval',
      dueDate: '2024-10-20',
      approvalChain: [
        {
          level: 1,
          approver: 'Priya Sharma',
          role: 'Sales Manager',
          status: 'approved',
          actionDate: '2024-10-18 11:15 AM',
          comments: 'Verified customer credentials and project scope'
        },
        {
          level: 2,
          approver: 'Amit Patel',
          role: 'Finance Head',
          status: 'pending'
        },
        {
          level: 3,
          approver: 'Sunita Reddy',
          role: 'VP Sales',
          status: 'pending'
        }
      ],
      comments: [
        {
          id: 'CMT-001',
          author: 'Rahul Kumar',
          role: 'Sales Executive',
          message: 'Customer is existing client with good payment history. Requesting expedited approval.',
          timestamp: '2024-10-18 10:35 AM'
        },
        {
          id: 'CMT-002',
          author: 'Priya Sharma',
          role: 'Sales Manager',
          message: 'Approved. Customer has completed 3 projects worth ₹12Cr total.',
          timestamp: '2024-10-18 11:15 AM'
        }
      ]
    },
    {
      id: 'APR-002',
      contractNumber: 'CONT-2024-1235',
      contractType: 'Standard Sales Contract',
      customerName: 'Urban Homes Pvt Ltd',
      contractValue: 2850000,
      requestedBy: 'Neha Singh',
      requestDate: '2024-10-18 09:45 AM',
      currentApprover: 'Finance Head',
      status: 'pending',
      priority: 'medium',
      reason: 'Custom payment terms require finance approval',
      dueDate: '2024-10-19',
      approvalChain: [
        {
          level: 1,
          approver: 'Priya Sharma',
          role: 'Sales Manager',
          status: 'approved',
          actionDate: '2024-10-18 10:20 AM',
          comments: 'Standard contract, payment terms modified as per customer request'
        },
        {
          level: 2,
          approver: 'Amit Patel',
          role: 'Finance Head',
          status: 'pending'
        }
      ],
      comments: [
        {
          id: 'CMT-003',
          author: 'Neha Singh',
          role: 'Sales Executive',
          message: 'Customer requested 60-day payment terms instead of standard 30 days.',
          timestamp: '2024-10-18 09:50 AM'
        }
      ]
    },
    {
      id: 'APR-003',
      contractNumber: 'CONT-2024-1230',
      contractType: 'Bulk Order Contract',
      customerName: 'Metro Builders Ltd',
      contractValue: 8200000,
      requestedBy: 'Vikram Desai',
      requestDate: '2024-10-17 02:15 PM',
      currentApprover: 'Legal Department',
      status: 'escalated',
      priority: 'urgent',
      reason: 'Custom clauses added, legal review required',
      dueDate: '2024-10-18',
      approvalChain: [
        {
          level: 1,
          approver: 'Priya Sharma',
          role: 'Sales Manager',
          status: 'approved',
          actionDate: '2024-10-17 03:00 PM',
          comments: 'High value deal, custom terms negotiated'
        },
        {
          level: 2,
          approver: 'Amit Patel',
          role: 'Finance Head',
          status: 'approved',
          actionDate: '2024-10-17 04:30 PM',
          comments: 'Payment terms acceptable. 40% advance, 60% on delivery.'
        },
        {
          level: 3,
          approver: 'Rajesh Khanna',
          role: 'Legal Department',
          status: 'pending'
        },
        {
          level: 4,
          approver: 'Sunita Reddy',
          role: 'VP Sales',
          status: 'pending'
        }
      ],
      comments: [
        {
          id: 'CMT-004',
          author: 'Vikram Desai',
          role: 'Sales Executive',
          message: 'Large order for 50+ kitchens. Customer added custom liability clause. Legal review needed.',
          timestamp: '2024-10-17 02:20 PM'
        },
        {
          id: 'CMT-005',
          author: 'Amit Patel',
          role: 'Finance Head',
          message: 'Payment structure is acceptable. Advance covers our material costs.',
          timestamp: '2024-10-17 04:30 PM'
        }
      ]
    },
    {
      id: 'APR-004',
      contractNumber: 'CONT-2024-1228',
      contractType: 'Service Agreement',
      customerName: 'Royal Residences',
      contractValue: 1250000,
      requestedBy: 'Anjali Mehta',
      requestDate: '2024-10-16 11:20 AM',
      currentApprover: 'None',
      status: 'approved',
      priority: 'low',
      reason: 'Standard contract within approval limits',
      dueDate: '2024-10-17',
      approvalChain: [
        {
          level: 1,
          approver: 'Priya Sharma',
          role: 'Sales Manager',
          status: 'approved',
          actionDate: '2024-10-16 02:45 PM',
          comments: 'Standard service contract, all terms as per template'
        }
      ],
      comments: []
    },
    {
      id: 'APR-005',
      contractNumber: 'CONT-2024-1225',
      contractType: 'Premium Service Agreement',
      customerName: 'Luxury Apartments Ltd',
      contractValue: 3800000,
      requestedBy: 'Karan Malhotra',
      requestDate: '2024-10-15 03:30 PM',
      currentApprover: 'None',
      status: 'rejected',
      priority: 'medium',
      reason: 'Pricing below minimum threshold',
      dueDate: '2024-10-16',
      approvalChain: [
        {
          level: 1,
          approver: 'Priya Sharma',
          role: 'Sales Manager',
          status: 'rejected',
          actionDate: '2024-10-15 05:15 PM',
          comments: 'Pricing is 15% below cost. Cannot approve at this rate.'
        }
      ],
      comments: [
        {
          id: 'CMT-006',
          author: 'Karan Malhotra',
          role: 'Sales Executive',
          message: 'Customer is price sensitive. Requesting approval for discounted rate.',
          timestamp: '2024-10-15 03:35 PM'
        },
        {
          id: 'CMT-007',
          author: 'Priya Sharma',
          role: 'Sales Manager',
          message: 'Rejected. Pricing does not cover our costs. Please revise quote.',
          timestamp: '2024-10-15 05:15 PM'
        }
      ]
    }
  ]
  void _mockApprovals

  const getStatusColor = (status: string) => {
    const colors: any = {
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      approved: 'bg-green-100 text-green-700 border-green-200',
      rejected: 'bg-red-100 text-red-700 border-red-200',
      escalated: 'bg-orange-100 text-orange-700 border-orange-200'
    }
    return colors[status] || colors.pending
  }

  const getPriorityColor = (priority: string) => {
    const colors: any = {
      low: 'bg-blue-100 text-blue-700 border-blue-200',
      medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      high: 'bg-orange-100 text-orange-700 border-orange-200',
      urgent: 'bg-red-100 text-red-700 border-red-200'
    }
    return colors[priority] || colors.medium
  }

  const getStepStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'skipped':
        return <AlertCircle className="h-4 w-4 text-gray-400" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const totalRequests = approvals.length
  const pendingRequests = approvals.filter(a => a.status === 'pending').length
  const approvedRequests = approvals.filter(a => a.status === 'approved').length
  const rejectedRequests = approvals.filter(a => a.status === 'rejected').length
  const approvalRate = totalRequests > 0 ? ((approvedRequests / totalRequests) * 100).toFixed(1) : '0.0'

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
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-5 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Requests</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{totalRequests}</p>
            </div>
            <FileText className="h-10 w-10 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-5 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-900 mt-1">{pendingRequests}</p>
            </div>
            <Clock className="h-10 w-10 text-yellow-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-5 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Approved</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{approvedRequests}</p>
            </div>
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-5 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Rejected</p>
              <p className="text-2xl font-bold text-red-900 mt-1">{rejectedRequests}</p>
            </div>
            <XCircle className="h-10 w-10 text-red-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-5 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Approval Rate</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">{approvalRate}%</p>
            </div>
            <TrendingUp className="h-10 w-10 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Status Filters */}
      <div className="mb-3 flex gap-3 overflow-x-auto pb-2">
        <button className="px-4 py-2 bg-blue-100 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-200 text-sm font-medium whitespace-nowrap">
          All Requests ({totalRequests})
        </button>
        <button className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm whitespace-nowrap">
          Pending ({pendingRequests})
        </button>
        <button className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm whitespace-nowrap">
          Approved ({approvedRequests})
        </button>
        <button className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm whitespace-nowrap">
          Rejected ({rejectedRequests})
        </button>
        <button className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm whitespace-nowrap">
          Escalated ({approvals.filter(a => a.status === 'escalated').length})
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by contract number, customer, or approver..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Approval Requests */}
      <div className="space-y-2">
        {approvals.map((approval) => (
          <div
            key={approval.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-5"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base font-semibold text-gray-900">{approval.contractType}</h3>
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${getStatusColor(approval.status)}`}>
                    {approval.status}
                  </span>
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${getPriorityColor(approval.priority)}`}>
                    {approval.priority}
                  </span>
                </div>
                <p className="text-xs text-gray-500">{approval.contractNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-blue-600">₹{(approval.contractValue / 100000).toFixed(2)}L</p>
                <p className="text-xs text-gray-500">Contract Value</p>
              </div>
            </div>

            {/* Customer & Request Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2 text-xs">
              <div>
                <p className="text-gray-500">Customer</p>
                <p className="font-semibold text-gray-900">{approval.customerName}</p>
              </div>
              <div>
                <p className="text-gray-500">Requested By</p>
                <p className="font-semibold text-gray-900">{approval.requestedBy}</p>
              </div>
              <div>
                <p className="text-gray-500">Request Date</p>
                <p className="font-semibold text-gray-900">{approval.requestDate}</p>
              </div>
              <div>
                <p className="text-gray-500">Due Date</p>
                <p className="font-semibold text-gray-900">{new Date(approval.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</p>
              </div>
            </div>

            {/* Reason */}
            <div className="mb-2">
              <p className="text-xs text-gray-500 mb-1">Approval Reason:</p>
              <p className="text-sm text-gray-700">{approval.reason}</p>
            </div>

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
                          step.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                          'bg-gray-50 text-gray-500 border-gray-200'
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
                <p className="text-xs font-semibold text-gray-700 mb-2">Comments:</p>
                <div className="space-y-2">
                  {approval.comments.map((comment) => (
                    <div key={comment.id} className="bg-gray-50 rounded p-3 text-xs">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="h-3 w-3 text-gray-500" />
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
                  <button onClick={() => handleApprove(approval.id)} className="px-3 py-2 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700 flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" />
                    Approve
                  </button>
                  <button className="px-3 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700 flex items-center gap-1">
                    <XCircle className="h-4 w-4" />
                    Reject
                  </button>
                  <button className="px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    Add Comment
                  </button>
                </>
              )}
              <button className="px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                View Contract
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Approval Info */}
      <div className="mt-6 bg-orange-50 border border-orange-200 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-orange-900 mb-2">Contract Approval Workflow:</h3>
        <ul className="text-xs text-orange-700 space-y-1">
          <li><strong>Multi-Level Approvals:</strong> High-value contracts require multiple approvals (Sales → Finance → Legal → VP)</li>
          <li><strong>Automatic Routing:</strong> System routes to appropriate approvers based on contract value and type</li>
          <li><strong>Priority Handling:</strong> Urgent requests flagged for faster processing</li>
          <li><strong>Audit Trail:</strong> Complete history of all approvals, rejections, and comments</li>
          <li><strong>Escalation:</strong> Overdue approvals automatically escalated to next level</li>
        </ul>
      </div>
    </div>
  )
}
