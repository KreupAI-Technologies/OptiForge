'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  XCircle,
  Eye,
  RotateCcw,
  MessageSquare,
  ArrowLeft,
  Search,
  Filter,
  Download,
  User,
  DollarSign,
  Calendar,
  AlertTriangle
} from 'lucide-react'
import {
  estimationCostEstimateLiveService,
  CostEstimateRecord,
} from '@/services/estimation-cost-estimate-live.service'
import { costEstimateService } from '@/services/estimation-cost-estimate.service'
import { exportToCsv } from '@/lib/export'

const COMPANY_ID = 'default-company-id'

interface RejectedEstimate {
  id: string
  estimateNumber: string
  projectName: string
  customerName: string
  category: string
  estimatedValue: number
  items: number
  submittedBy: string
  submittedDate: string
  rejectedBy: string
  rejectedDate: string
  rejectionReason: string
  rejectionCategory: 'pricing' | 'scope' | 'compliance' | 'margin' | 'other'
  canRevise: boolean
  revisedEstimate?: string
}

export default function EstimateWorkflowRejectedPage() {
  const router = useRouter()

  const [rejectedEstimates, setRejectedEstimates] = useState<RejectedEstimate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setIsLoading(true)
      setLoadError(null)
      try {
        // Rejected estimates are cost-estimate records with status = Rejected.
        const raw = await estimationCostEstimateLiveService.getEstimates({
          status: 'Rejected',
        })
        const inferCategory = (
          reason?: string,
        ): RejectedEstimate['rejectionCategory'] => {
          const r = (reason ?? '').toLowerCase()
          if (r.includes('margin')) return 'margin'
          if (r.includes('pric')) return 'pricing'
          if (r.includes('scope')) return 'scope'
          if (r.includes('complian')) return 'compliance'
          return 'other'
        }
        const mapped: RejectedEstimate[] = raw.map((e: CostEstimateRecord) => ({
          id: e.id,
          estimateNumber: e.estimateNumber ?? e.id,
          projectName: e.title ?? 'Untitled Estimate',
          customerName: e.customerName ?? '—',
          category: e.estimateType ?? 'General',
          estimatedValue: Number(e.totalCost ?? 0),
          items: Number(e.itemCount ?? (Array.isArray(e.items) ? e.items.length : 0)),
          submittedBy: e.submittedBy ?? '—',
          submittedDate: e.submittedAt ?? e.estimateDate ?? '',
          rejectedBy: e.rejectedBy ?? e.approvedBy ?? '—',
          rejectedDate: e.rejectedAt ?? e.updatedAt ?? '',
          rejectionReason: e.rejectionReason ?? e.approvalNotes ?? '',
          rejectionCategory: inferCategory(e.rejectionReason ?? e.approvalNotes),
          canRevise: true,
        }))
        if (!cancelled) setRejectedEstimates(mapped)
      } catch (err) {
        if (!cancelled) {
          setLoadError(
            err instanceof Error ? err.message : 'Failed to load rejected estimates',
          )
          setRejectedEstimates([])
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

  const handleView = (estimateId: string) => {
    router.push(`/estimation/pricing/view/${estimateId}`)
  }

  const handleViewComments = (estimateId: string) => {
    router.push(`/estimation/workflow/pending/comments/${estimateId}`)
  }

  const handleRevise = async (estimateId: string, projectName: string) => {
    if (!confirm(`Create a new revision of "${projectName}"?`)) return
    try {
      const version = await costEstimateService.createVersion(COMPANY_ID, estimateId, 'Current User')
      router.push(`/estimation/workflow/drafts/edit/${version.id}`)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create revision.')
    }
  }

  const filteredEstimates =
    categoryFilter === 'all'
      ? rejectedEstimates
      : rejectedEstimates.filter((e) => e.rejectionCategory === categoryFilter)

  const handleExport = () => {
    exportToCsv('rejected-estimates', filteredEstimates)
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'margin':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'pricing':
        return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'scope':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'compliance':
        return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'other':
        return 'bg-gray-100 text-gray-700 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const totalRejected = rejectedEstimates.length
  const totalValue = rejectedEstimates.reduce((sum, e) => sum + e.estimatedValue, 0)
  const canRevise = rejectedEstimates.filter(e => e.canRevise).length
  const alreadyRevised = rejectedEstimates.filter(e => e.revisedEstimate).length

  const rejectionStats = [
    { category: 'margin', count: rejectedEstimates.filter(e => e.rejectionCategory === 'margin').length },
    { category: 'pricing', count: rejectedEstimates.filter(e => e.rejectionCategory === 'pricing').length },
    { category: 'scope', count: rejectedEstimates.filter(e => e.rejectionCategory === 'scope').length },
    { category: 'compliance', count: rejectedEstimates.filter(e => e.rejectionCategory === 'compliance').length },
    { category: 'other', count: rejectedEstimates.filter(e => e.rejectionCategory === 'other').length }
  ]

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
          <label className="text-sm font-medium text-gray-700">Reason Category</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All</option>
            <option value="margin">Margin</option>
            <option value="pricing">Pricing</option>
            <option value="scope">Scope</option>
            <option value="compliance">Compliance</option>
            <option value="other">Other</option>
          </select>
        </div>
      )}

      {loadError && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {loadError}
        </div>
      )}
      {isLoading && (
        <div className="mb-3 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600">
          Loading rejected estimates...
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-5 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Total Rejected</p>
              <p className="text-2xl font-bold text-red-900 mt-1">{totalRejected}</p>
              <p className="text-xs text-red-700 mt-1">This month</p>
            </div>
            <XCircle className="h-10 w-10 text-red-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-5 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Lost Value</p>
              <p className="text-2xl font-bold text-orange-900 mt-1">₹{(totalValue / 10000000).toFixed(2)}Cr</p>
              <p className="text-xs text-orange-700 mt-1">Rejected pipeline</p>
            </div>
            <DollarSign className="h-10 w-10 text-orange-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-5 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">Can Revise</p>
              <p className="text-2xl font-bold text-yellow-900 mt-1">{canRevise}</p>
              <p className="text-xs text-yellow-700 mt-1">Opportunity to fix</p>
            </div>
            <RotateCcw className="h-10 w-10 text-yellow-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-5 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Already Revised</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{alreadyRevised}</p>
              <p className="text-xs text-green-700 mt-1">Re-submitted</p>
            </div>
            <RotateCcw className="h-10 w-10 text-green-600" />
          </div>
        </div>
      </div>

      {/* Rejection Reasons Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-3">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Rejection Reasons Breakdown</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
            {rejectionStats.map((stat) => (
              <div key={stat.category} className="p-4 rounded-lg border border-gray-200 text-center">
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(stat.category)}`}>
                  {stat.category.toUpperCase()}
                </span>
                <p className="text-3xl font-bold text-gray-900 mt-3">{stat.count}</p>
                <p className="text-xs text-gray-600 mt-1">estimates</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Rejected Estimates Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Rejected Estimates</h2>
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
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Rejected</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Reason Category</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Rejection Reason</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredEstimates.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-sm text-gray-500">
                    {isLoading ? 'Loading...' : 'No rejected estimates found.'}
                  </td>
                </tr>
              )}
              {filteredEstimates.map((estimate) => (
                <tr key={estimate.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{estimate.estimateNumber}</p>
                      <p className="text-sm text-gray-900 mt-1">{estimate.projectName}</p>
                      <p className="text-xs text-gray-600 mt-1">{estimate.category} • {estimate.items} items</p>
                      {estimate.revisedEstimate && (
                        <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                          <RotateCcw className="h-3 w-3" />
                          Revised: {estimate.revisedEstimate}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <p className="text-sm text-gray-900">{estimate.customerName}</p>
                  </td>
                  <td className="px-3 py-2">
                    <p className="text-sm font-bold text-gray-600">₹{(estimate.estimatedValue / 100000).toFixed(2)}L</p>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1 text-sm text-gray-900">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span>{estimate.rejectedDate}</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">by {estimate.rejectedBy}</p>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(estimate.rejectionCategory)}`}>
                      {estimate.rejectionCategory.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-3 py-2 max-w-xs">
                    <p className="text-sm text-gray-700 line-clamp-2">{estimate.rejectionReason}</p>
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
                        onClick={() => handleViewComments(estimate.id)}
                        className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                        title="View Comments"
                      >
                        <MessageSquare className="h-4 w-4" />
                      </button>
                      {estimate.canRevise && !estimate.revisedEstimate && (
                        <button
                          onClick={() => handleRevise(estimate.id, estimate.projectName)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                          title="Create Revision"
                        >
                          <RotateCcw className="h-4 w-4" />
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
