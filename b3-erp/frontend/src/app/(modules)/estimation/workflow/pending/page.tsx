'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { exportToCsv } from '@/lib/export'
import { estimationWorkflowStageService } from '@/services/estimation-workflow-stage.service'
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

export default function EstimateWorkflowPendingPage() {
  const router = useRouter()

  const handleViewEstimate = (estimateId: string) => {
    router.push(`/estimation/workflow/pending/view/${estimateId}`)
  }

  const handleViewComments = (estimateId: string) => {
    router.push(`/estimation/workflow/pending/comments/${estimateId}`)
  }

  const COMPANY_ID = 'company-001'

  const handleApprove = async (estimateId: string, projectName: string) => {
    if (!confirm(`Are you sure you want to approve "${projectName}"?`)) return
    try {
      await estimationWorkflowStageService.update(COMPANY_ID, estimateId, { status: 'active' })
      setPendingEstimates(prev => prev.filter(e => e.id !== estimateId))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to approve estimate.')
    }
  }

  const handleReject = async (estimateId: string, projectName: string) => {
    if (!confirm(`Are you sure you want to reject "${projectName}"? Please provide a reason in comments.`)) return
    try {
      await estimationWorkflowStageService.update(COMPANY_ID, estimateId, { status: 'inactive' })
      setPendingEstimates(prev => prev.filter(e => e.id !== estimateId))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to reject estimate.')
    }
  }

  const handleExport = () => {
    exportToCsv('pending-estimates', pendingEstimates)
  }

  const [pendingEstimates, setPendingEstimates] = useState<PendingEstimate[]>([
    {
      id: 'PEND-001',
      estimateNumber: 'EST-2025-0142',
      projectName: 'Luxury Penthouse - Ultra Premium Kitchen',
      customerName: 'DLF Limited',
      category: 'Premium Modular Kitchen',
      estimatedValue: 8500000,
      items: 68,
      submittedBy: 'Amit Sharma',
      submittedDate: '2025-10-18',
      submittedTime: '14:30',
      pendingWith: 'Mr. Suresh Iyer (Senior Manager)',
      pendingDays: 2,
      priority: 'high',
      approvalLevel: 'Level 2',
      comments: 3,
      documents: 5
    },
    {
      id: 'PEND-002',
      estimateNumber: 'EST-2025-0143',
      projectName: 'Restaurant Chain - 5 Outlet Kitchens',
      customerName: 'Barbeque Nation Hospitality',
      category: 'Commercial Kitchen',
      estimatedValue: 15000000,
      items: 95,
      submittedBy: 'Neha Patel',
      submittedDate: '2025-10-17',
      submittedTime: '11:15',
      pendingWith: 'Mr. Rajesh Gupta (Director)',
      pendingDays: 3,
      priority: 'high',
      approvalLevel: 'Level 3',
      comments: 5,
      documents: 8
    },
    {
      id: 'PEND-003',
      estimateNumber: 'EST-2025-0144',
      projectName: '4BHK Duplex - L-Shaped Kitchen',
      customerName: 'Mrs. Meera Krishnan',
      category: 'L-Shaped Kitchen',
      estimatedValue: 3250000,
      items: 42,
      submittedBy: 'Vikram Singh',
      submittedDate: '2025-10-19',
      submittedTime: '16:45',
      pendingWith: 'Ms. Priya Kapoor (Manager)',
      pendingDays: 1,
      priority: 'medium',
      approvalLevel: 'Level 1',
      comments: 1,
      documents: 3
    },
    {
      id: 'PEND-004',
      estimateNumber: 'EST-2025-0140',
      projectName: 'Builder Bulk Order - 100 Standard Kitchens',
      customerName: 'Oberoi Realty',
      category: 'Builder Package',
      estimatedValue: 28000000,
      items: 25,
      submittedBy: 'Ravi Kumar',
      submittedDate: '2025-10-15',
      submittedTime: '10:20',
      pendingWith: 'Mr. Anil Sharma (CEO)',
      pendingDays: 5,
      priority: 'high',
      approvalLevel: 'Level 4',
      comments: 8,
      documents: 12
    },
    {
      id: 'PEND-005',
      estimateNumber: 'EST-2025-0141',
      projectName: 'Island Kitchen with Wine Cellar',
      customerName: 'Mr. Karan Malhotra',
      category: 'Island Kitchen',
      estimatedValue: 5500000,
      items: 58,
      submittedBy: 'Amit Sharma',
      submittedDate: '2025-10-16',
      submittedTime: '09:30',
      pendingWith: 'Mr. Suresh Iyer (Senior Manager)',
      pendingDays: 4,
      priority: 'medium',
      approvalLevel: 'Level 2',
      comments: 4,
      documents: 6
    },
    {
      id: 'PEND-006',
      estimateNumber: 'EST-2025-0138',
      projectName: 'Hotel Kitchen Renovation',
      customerName: 'Taj Hotels Pvt Ltd',
      category: 'Institutional Kitchen',
      estimatedValue: 12500000,
      items: 72,
      submittedBy: 'Neha Patel',
      submittedDate: '2025-10-14',
      submittedTime: '15:00',
      pendingWith: 'Mr. Rajesh Gupta (Director)',
      pendingDays: 6,
      priority: 'high',
      approvalLevel: 'Level 3',
      comments: 6,
      documents: 9
    },
    {
      id: 'PEND-007',
      estimateNumber: 'EST-2025-0139',
      projectName: 'Compact Kitchen for Studio Apartment',
      customerName: 'Ms. Ananya Reddy',
      category: 'Compact Kitchen',
      estimatedValue: 750000,
      items: 18,
      submittedBy: 'Vikram Singh',
      submittedDate: '2025-10-15',
      submittedTime: '11:45',
      pendingWith: 'Ms. Priya Kapoor (Manager)',
      pendingDays: 5,
      priority: 'low',
      approvalLevel: 'Level 1',
      comments: 2,
      documents: 2
    },
    {
      id: 'PEND-008',
      estimateNumber: 'EST-2025-0137',
      projectName: 'Parallel Kitchen with Breakfast Counter',
      customerName: 'Dr. Arvind Patel',
      category: 'Parallel Kitchen',
      estimatedValue: 2850000,
      items: 38,
      submittedBy: 'Ravi Kumar',
      submittedDate: '2025-10-13',
      submittedTime: '14:20',
      pendingWith: 'Mr. Suresh Iyer (Senior Manager)',
      pendingDays: 7,
      priority: 'medium',
      approvalLevel: 'Level 2',
      comments: 5,
      documents: 4
    }
  ])

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
              {pendingEstimates.map((estimate) => (
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
