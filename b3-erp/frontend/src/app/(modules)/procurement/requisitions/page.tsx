'use client'

import { useState, useEffect } from 'react'
import {
  Search,
  Filter,
  Download,
  Eye,
  Edit2,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  FileText,
  Users,
  Clock,
  DollarSign,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { purchaseRequisitionService, PurchaseRequisition as PRServiceType, PRStatus, PRPriority } from '@/services/purchase-requisition.service'
import { exportToCsv } from '@/lib/export'

interface PurchaseRequisition {
  id: string
  prNumber: string
  requestedBy: string
  department: string
  requestDate: string
  itemsCount: number
  totalValue: number
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'converted_to_po'
  approver: string
  approvalDate?: string
  deliveryDate: string
  purpose: string
  notes?: string
}

export default function ProcurementRequisitionsPage() {
  const [requisitions, setRequisitions] = useState<PurchaseRequisition[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Map service status to local status
  const mapStatus = (status: PRStatus): PurchaseRequisition['status'] => {
    const statusMap: Record<PRStatus, PurchaseRequisition['status']> = {
      'Draft': 'draft',
      'Pending Approval': 'pending_approval',
      'Approved': 'approved',
      'Rejected': 'rejected',
      'Converted to PO': 'converted_to_po',
      'Cancelled': 'rejected'
    }
    return statusMap[status] || 'draft'
  }

  // Map service priority to local priority
  const mapPriority = (priority: PRPriority): PurchaseRequisition['priority'] => {
    const priorityMap: Record<PRPriority, PurchaseRequisition['priority']> = {
      'Low': 'low',
      'Medium': 'medium',
      'High': 'high',
      'Urgent': 'urgent'
    }
    return priorityMap[priority] || 'medium'
  }

  // Load requisitions from service
  const loadRequisitions = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await purchaseRequisitionService.getAllRequisitions()

      const mappedRequisitions: PurchaseRequisition[] = response.data.map(pr => ({
        id: pr.id,
        prNumber: pr.prNumber,
        requestedBy: pr.requestedByName,
        department: pr.department,
        requestDate: pr.requestDate,
        itemsCount: pr.items.length,
        totalValue: pr.estimatedTotal,
        priority: mapPriority(pr.priority),
        status: mapStatus(pr.status),
        approver: pr.approvedByName || '-',
        approvalDate: pr.approvedAt?.split('T')[0],
        deliveryDate: pr.requiredDate,
        purpose: pr.title,
        notes: pr.description || pr.rejectionReason
      }))

      setRequisitions(mappedRequisitions)
    } catch (err) {
      console.error('Error loading requisitions:', err)
      setError('Failed to load requisitions. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadRequisitions()
  }, [])

  const filteredRequisitions = requisitions.filter(req => {
    const matchesSearch = req.prNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.requestedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.department.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter
    const matchesDepartment = departmentFilter === 'all' || req.department === departmentFilter
    return matchesSearch && matchesStatus && matchesDepartment
  })

  const totalPages = Math.ceil(filteredRequisitions.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedRequisitions = filteredRequisitions.slice(startIndex, startIndex + itemsPerPage)

  const stats = {
    pendingApprovals: requisitions.filter(r => r.status === 'pending_approval').length,
    approved: requisitions.filter(r => r.status === 'approved').length,
    inProgress: requisitions.filter(r => r.status === 'draft' || r.status === 'pending_approval').length,
    totalValue: requisitions.reduce((sum, r) => sum + r.totalValue, 0)
  }

  const getPriorityBadge = (priority: string) => {
    const badges = {
      low: 'bg-gray-100 text-gray-800 border-gray-300',
      medium: 'bg-blue-100 text-blue-800 border-blue-300',
      high: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      urgent: 'bg-red-100 text-red-800 border-red-300'
    }
    return badges[priority as keyof typeof badges] || badges.low
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      draft: 'bg-gray-100 text-gray-800 border-gray-300',
      pending_approval: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      approved: 'bg-green-100 text-green-800 border-green-300',
      rejected: 'bg-red-100 text-red-800 border-red-300',
      converted_to_po: 'bg-purple-100 text-purple-800 border-purple-300'
    }
    return badges[status as keyof typeof badges] || badges.draft
  }

  const formatStatus = (status: string) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value)
  }

  const handleExport = () => {
    exportToCsv('procurement-requisitions', filteredRequisitions as unknown as Record<string, unknown>[])
  }

  const handleView = (id: string) => {
    console.log('Viewing requisition:', id)
  }

  const handleEdit = (id: string) => {
    console.log('Editing requisition:', id)
  }

  const handleApprove = async (id: string) => {
    try {
      await purchaseRequisitionService.approveRequisition(id)
      await loadRequisitions()
    } catch (err) {
      console.error('Error approving requisition:', err)
      setError('Failed to approve requisition. Please try again.')
    }
  }

  if (isLoading) {
    return (
      <div className="w-full min-h-screen px-3 py-2 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          <p className="mt-4 text-gray-600">Loading requisitions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen px-3 py-2">
      <div className="w-full space-y-3">
        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-red-700">{error}</span>
            <button
              onClick={loadRequisitions}
              className="ml-auto px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
            >
              Retry
            </button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Pending Approvals</p>
                <p className="text-2xl font-bold text-yellow-900 mt-1">{stats.pendingApprovals}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Approved</p>
                <p className="text-2xl font-bold text-green-900 mt-1">{stats.approved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">In Progress</p>
                <p className="text-2xl font-bold text-blue-900 mt-1">{stats.inProgress}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Total Value</p>
                <p className="text-2xl font-bold text-purple-900 mt-1">{formatCurrency(stats.totalValue)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white rounded-2xl shadow-lg p-3 border border-gray-100">
          <div className="flex flex-col lg:flex-row gap-2 items-center justify-between">
            <div className="flex-1 w-full lg:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by PR number, requestor, or department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-3 w-full lg:w-auto">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-10 pr-8 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white cursor-pointer transition-all"
                >
                  <option value="all">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="pending_approval">Pending Approval</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="converted_to_po">Converted to PO</option>
                </select>
              </div>

              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="pl-10 pr-8 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white cursor-pointer transition-all"
                >
                  <option value="all">All Departments</option>
                  <option value="Production">Production</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Quality Control">Quality Control</option>
                  <option value="R&D">R&D</option>
                  <option value="Administration">Administration</option>
                </select>
              </div>

              <button
                onClick={handleExport}
                className="px-3 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl font-medium"
              >
                <Download className="w-4 h-4" />
                Export Report
              </button>
            </div>
          </div>
        </div>

        {/* Requisitions Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-24rem)]">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    PR Number
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Requested By
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Request Date
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Items Count
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Total Value
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Approver
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedRequisitions.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-semibold text-gray-900">{req.prNumber}</div>
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{req.requestedBy}</div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{req.department}</div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{req.requestDate}</div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm text-gray-900 text-center">{req.itemsCount}</div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">{formatCurrency(req.totalValue)}</div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getPriorityBadge(req.priority)}`}>
                        {req.priority.charAt(0).toUpperCase() + req.priority.slice(1)}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusBadge(req.status)}`}>
                        {formatStatus(req.status)}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{req.approver}</div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleView(req.id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"

                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(req.id)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"

                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {req.status === 'pending_approval' && (
                          <button
                            onClick={() => handleApprove(req.id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"

                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-gray-50 px-3 py-2 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing <span className="font-semibold">{startIndex + 1}</span> to{' '}
                <span className="font-semibold">{Math.min(startIndex + itemsPerPage, filteredRequisitions.length)}</span> of{' '}
                <span className="font-semibold">{filteredRequisitions.length}</span> requisitions
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                <div className="flex items-center gap-1">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${currentPage === i + 1
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
