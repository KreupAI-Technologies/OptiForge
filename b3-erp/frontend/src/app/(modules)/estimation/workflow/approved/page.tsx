'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { exportToCsv } from '@/lib/export'
import { costEstimateService } from '@/services/estimation-cost-estimate.service'
import {
  CheckCircle,
  Eye,
  FileText,
  Send,
  Download,
  ArrowLeft,
  Search,
  Filter,
  User,
  DollarSign,
  Calendar,
  ArrowRight
} from 'lucide-react'

interface ApprovedEstimate {
  id: string
  estimateNumber: string
  projectName: string
  customerName: string
  contactPerson: string
  category: string
  estimatedValue: number
  items: number
  submittedBy: string
  submittedDate: string
  approvedBy: string
  approvedDate: string
  approvalTime: string
  validUntil: string
  daysToExpiry: number
  status: 'sent-to-customer' | 'awaiting-response' | 'under-negotiation' | 'valid'
  responseReceived: boolean
}

const companyId = 'default-company-id'

export default function EstimateWorkflowApprovedPage() {
  const router = useRouter()

  const [approvedEstimates, setApprovedEstimates] = useState<ApprovedEstimate[]>([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const fetchApproved = async (): Promise<ApprovedEstimate[]> => {
    const data = await costEstimateService.findAll(companyId, { status: 'Approved' })
    const list = Array.isArray(data) ? data : []
    return list.map((e) => {
      const validUntil = e.validUntil || ''
      let daysToExpiry = 0
      if (validUntil) {
        daysToExpiry = Math.max(
          0,
          Math.ceil((new Date(validUntil).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        )
      }
      const approvedAt = e.approvedAt ? new Date(e.approvedAt) : null
      return {
        id: e.id,
        estimateNumber: e.estimateNumber,
        projectName: e.title,
        customerName: e.customerName || '',
        contactPerson: e.customerName || '',
        category: e.estimateType || '',
        estimatedValue: e.totalCost || 0,
        items: 0,
        submittedBy: e.submittedBy || '',
        submittedDate: e.submittedAt ? e.submittedAt.slice(0, 10) : '',
        approvedBy: e.approvedBy || '',
        approvedDate: approvedAt ? approvedAt.toISOString().slice(0, 10) : '',
        approvalTime: approvedAt ? approvedAt.toISOString().slice(11, 16) : '',
        validUntil,
        daysToExpiry,
        status: 'valid',
        responseReceived: false,
      }
    })
  }

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        setLoading(true)
        const data = await costEstimateService.findAll(companyId, { status: 'Approved' })
        const list = Array.isArray(data) ? data : []
        const mapped: ApprovedEstimate[] = list.map((e) => {
          const validUntil = e.validUntil || ''
          let daysToExpiry = 0
          if (validUntil) {
            daysToExpiry = Math.max(
              0,
              Math.ceil((new Date(validUntil).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
            )
          }
          const approvedAt = e.approvedAt ? new Date(e.approvedAt) : null
          return {
            id: e.id,
            estimateNumber: e.estimateNumber,
            projectName: e.title,
            customerName: e.customerName || '',
            contactPerson: e.customerName || '',
            category: e.estimateType || '',
            estimatedValue: e.totalCost || 0,
            items: 0,
            submittedBy: e.submittedBy || '',
            submittedDate: e.submittedAt ? e.submittedAt.slice(0, 10) : '',
            approvedBy: e.approvedBy || '',
            approvedDate: approvedAt ? approvedAt.toISOString().slice(0, 10) : '',
            approvalTime: approvedAt ? approvedAt.toISOString().slice(11, 16) : '',
            validUntil,
            daysToExpiry,
            status: 'valid',
            responseReceived: false,
          }
        })
        if (mounted) setApprovedEstimates(mapped)
      } catch (err) {
        console.error('Failed to load approved estimates:', err)
        if (mounted) setApprovedEstimates([])
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  const handleView = (estimateId: string) => {
    router.push(`/estimation/pricing/view/${estimateId}`)
  }

  const handleExportRow = async (estimateId: string) => {
    try {
      const { blob, filename } = await costEstimateService.downloadExport(companyId, estimateId, 'pdf')
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to export estimate.')
    }
  }

  const handleSend = async (estimate: ApprovedEstimate) => {
    if (!confirm(`Send estimate "${estimate.estimateNumber}" to ${estimate.customerName || 'the customer'}?`)) return
    try {
      await costEstimateService.sendToCustomer(companyId, estimate.id, {
        channel: 'email',
        recipient: estimate.contactPerson || undefined,
        validityDays: estimate.daysToExpiry || undefined,
        includeTerms: true,
        sentBy: 'Current User',
      })
      // Reflect sent status without a full reload, then refetch to stay in sync.
      setApprovedEstimates((prev) =>
        prev.map((e) => (e.id === estimate.id ? { ...e, status: 'sent-to-customer' } : e))
      )
      alert('Estimate sent to customer.')
      try {
        const refreshed = await fetchApproved()
        setApprovedEstimates(refreshed)
      } catch {
        // Non-fatal: optimistic update already applied.
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to send estimate.')
    }
  }

  const handleExport = () => {
    exportToCsv('approved-estimates', filteredEstimates)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent-to-customer':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'awaiting-response':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'under-negotiation':
        return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'valid':
        return 'bg-green-100 text-green-700 border-green-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getExpiryColor = (days: number) => {
    if (days <= 7) return 'text-red-600'
    if (days <= 15) return 'text-orange-600'
    return 'text-green-600'
  }

  const filteredEstimates =
    statusFilter === 'all'
      ? approvedEstimates
      : approvedEstimates.filter((e) => e.status === statusFilter)

  const totalApproved = filteredEstimates.length
  const totalValue = filteredEstimates.reduce((sum, e) => sum + e.estimatedValue, 0)
  const sentToCustomer = filteredEstimates.filter(e => e.status === 'sent-to-customer').length
  const underNegotiation = filteredEstimates.filter(e => e.status === 'under-negotiation').length

  return (
    <div className="w-full h-full px-4 py-2">
      {/* Action Buttons */}
      <div className="mb-3 flex justify-end">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`px-4 py-2 border rounded-lg flex items-center gap-2 ${
              showFilters
                ? 'text-blue-700 bg-blue-50 border-blue-300'
                : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Filter className="h-4 w-4" />
            Filter
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="mb-3 rounded-lg border border-gray-200 bg-white px-4 py-3 flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All</option>
            <option value="valid">Valid</option>
            <option value="sent-to-customer">Sent to Customer</option>
            <option value="awaiting-response">Awaiting Response</option>
            <option value="under-negotiation">Under Negotiation</option>
          </select>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-5 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Total Approved</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{totalApproved}</p>
              <p className="text-xs text-green-700 mt-1">Active estimates</p>
            </div>
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-5 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Value</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">₹{(totalValue / 10000000).toFixed(2)}Cr</p>
              <p className="text-xs text-blue-700 mt-1">Approved pipeline</p>
            </div>
            <DollarSign className="h-10 w-10 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-5 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Sent to Customer</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">{sentToCustomer}</p>
              <p className="text-xs text-purple-700 mt-1">Awaiting response</p>
            </div>
            <Send className="h-10 w-10 text-purple-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-5 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Under Negotiation</p>
              <p className="text-2xl font-bold text-orange-900 mt-1">{underNegotiation}</p>
              <p className="text-xs text-orange-700 mt-1">In discussion</p>
            </div>
            <ArrowRight className="h-10 w-10 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Approved Estimates Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Approved Estimates</h2>
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
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Approved</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Valid Until</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-sm text-gray-500">
                    Loading approved estimates...
                  </td>
                </tr>
              ) : filteredEstimates.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-sm text-gray-500">
                    No approved estimates found.
                  </td>
                </tr>
              ) : (
                filteredEstimates.map((estimate) => (
                <tr key={estimate.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{estimate.estimateNumber}</p>
                      <p className="text-sm text-gray-900 mt-1">{estimate.projectName}</p>
                      <p className="text-xs text-gray-600 mt-1">{estimate.category} • {estimate.items} items</p>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{estimate.customerName}</p>
                      <p className="text-xs text-gray-600 mt-1">{estimate.contactPerson}</p>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <p className="text-sm font-bold text-green-600">₹{(estimate.estimatedValue / 100000).toFixed(2)}L</p>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1 text-sm text-gray-900">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>{estimate.approvedDate}</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{estimate.approvalTime}</p>
                    <p className="text-xs text-gray-600">by {estimate.approvedBy}</p>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1">
                      <Calendar className={`h-4 w-4 ${getExpiryColor(estimate.daysToExpiry)}`} />
                      <span className={`text-sm font-medium ${getExpiryColor(estimate.daysToExpiry)}`}>
                        {estimate.validUntil}
                      </span>
                    </div>
                    <p className={`text-xs mt-1 ${getExpiryColor(estimate.daysToExpiry)}`}>
                      {estimate.daysToExpiry} days remaining
                    </p>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(estimate.status)}`}>
                      {estimate.status.toUpperCase().replace('-', ' ')}
                    </span>
                    {estimate.responseReceived && (
                      <p className="text-xs text-green-600 mt-1">✓ Response received</p>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleView(estimate.id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleExportRow(estimate.id)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                        title="Export PDF"
                      >
                        <FileText className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleSend(estimate)}
                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg"
                        title="Send to Customer"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
