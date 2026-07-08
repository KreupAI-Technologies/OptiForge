'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, CheckCircle, XCircle, Clock, User, DollarSign, Calendar, FileText, MessageSquare, Download } from 'lucide-react'
import { costEstimateService, CostEstimate, CostEstimateItem } from '@/services/estimation-cost-estimate.service'

interface EstimateItem {
  id: string
  itemCode: string
  description: string
  category: string
  quantity: number
  unit: string
  rate: number
  amount: number
}

interface EstimateView {
  id: string
  estimateNumber: string
  projectName: string
  customerName: string
  contactPerson: string
  contactEmail: string
  contactPhone: string
  category: string
  estimatedValue: number
  submittedBy: string
  submittedDate: string
  submittedTime: string
  pendingWith: string
  pendingDays: number
  priority: 'high' | 'medium' | 'low'
  approvalLevel: string
  comments: number
  status: string
  validityDays: number
  paymentTerms: string
  deliveryTime: string
  items: EstimateItem[]
}

const COMPANY_ID = 'default-company-id'

const EMPTY_ESTIMATE: EstimateView = {
  id: '',
  estimateNumber: '',
  projectName: '',
  customerName: '',
  contactPerson: '',
  contactEmail: '',
  contactPhone: '',
  category: '',
  estimatedValue: 0,
  submittedBy: '',
  submittedDate: '',
  submittedTime: '',
  pendingWith: '',
  pendingDays: 0,
  priority: 'medium',
  approvalLevel: '',
  comments: 0,
  status: '',
  validityDays: 0,
  paymentTerms: '',
  deliveryTime: '',
  items: [],
}

function mapItem(it: CostEstimateItem): EstimateItem {
  return {
    id: it.id,
    itemCode: it.itemNumber || '',
    description: it.description || '',
    category: it.category || 'Uncategorized',
    quantity: it.quantity || 0,
    unit: it.unit || '',
    rate: it.unitCost || 0,
    amount: it.totalCost || 0,
  }
}

export default function ViewPendingEstimatePage() {
  const router = useRouter()
  const params = useParams()
  const estimateId = params?.id as string

  const [estimateData, setEstimateData] = useState<EstimateView>(EMPTY_ESTIMATE)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    if (!estimateId) return
    let mounted = true
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const est = await costEstimateService.findOne(COMPANY_ID, estimateId) as CostEstimate & { items?: CostEstimateItem[] }
        if (!mounted) return
        const submittedAt = est.submittedAt || est.createdAt
        setEstimateData({
          ...EMPTY_ESTIMATE,
          id: est.id,
          estimateNumber: est.estimateNumber || '',
          projectName: est.title || '',
          customerName: est.customerName || '',
          category: est.estimateType || '',
          estimatedValue: est.totalCost || 0,
          submittedBy: est.submittedBy || '',
          submittedDate: submittedAt || '',
          submittedTime: submittedAt ? new Date(submittedAt).toLocaleTimeString() : '',
          status: est.status || '',
          validityDays: est.validUntil && est.estimateDate
            ? Math.max(0, Math.round((new Date(est.validUntil).getTime() - new Date(est.estimateDate).getTime()) / (1000 * 60 * 60 * 24)))
            : 0,
          items: Array.isArray(est.items) ? est.items.map(mapItem) : [],
        })
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : 'Failed to load estimate.')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [estimateId])

  const handleApprove = async () => {
    if (processing) return
    if (!confirm(`Are you sure you want to approve "${estimateData.projectName}"?`)) return
    setProcessing(true)
    try {
      await costEstimateService.approve(COMPANY_ID, estimateId, 'Current User')
      router.push('/estimation/workflow/pending')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to approve estimate.')
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async () => {
    if (processing) return
    if (!confirm(`Are you sure you want to reject "${estimateData.projectName}"? Please provide a reason in comments.`)) return
    setProcessing(true)
    try {
      await costEstimateService.reject(COMPANY_ID, estimateId, 'Current User')
      router.push('/estimation/workflow/pending')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to reject estimate.')
    } finally {
      setProcessing(false)
    }
  }

  const handleViewComments = () => {
    router.push(`/estimation/workflow/pending/comments/${estimateId}`)
  }

  const handleBack = () => {
    router.push('/estimation/workflow/pending')
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

  // Group items by category
  const itemsByCategory = estimateData.items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = []
    }
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, typeof estimateData.items>)

  return (
    <div className="w-full h-full flex flex-col bg-gray-50">
      <div className="flex-none bg-white border-b border-gray-200 px-3 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{estimateData.projectName}</h1>
              <p className="text-sm text-gray-500 mt-1">{estimateData.estimateNumber}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleViewComments}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2 relative"
            >
              <MessageSquare className="w-4 h-4" />
              Comments
              {estimateData.comments > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {estimateData.comments}
                </span>
              )}
            </button>
            <button
              onClick={handleReject}
              disabled={processing}
              className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 flex items-center gap-2 disabled:opacity-50"
            >
              <XCircle className="w-4 h-4" />
              Reject
            </button>
            <button
              onClick={handleApprove}
              disabled={processing}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
              Approve
            </button>
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex-1 flex items-center justify-center text-sm text-gray-500">Loading estimate...</div>
      )}
      {!loading && error && (
        <div className="flex-1 flex items-center justify-center text-sm text-red-600">{error}</div>
      )}
      {!loading && !error && (
      <div className="flex-1 overflow-auto p-3">
        <div className="grid grid-cols-3 gap-3">
          {/* Main Content */}
          <div className="col-span-2 space-y-3">
            {/* Estimate Details */}
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Estimate Details
              </h2>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Customer</p>
                  <p className="font-semibold text-gray-900">{estimateData.customerName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Contact Person</p>
                  <p className="font-medium text-gray-900">{estimateData.contactPerson}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Email</p>
                  <p className="font-medium text-gray-900">{estimateData.contactEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Phone</p>
                  <p className="font-medium text-gray-900">{estimateData.contactPhone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Category</p>
                  <p className="font-medium text-gray-900">{estimateData.category}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Value</p>
                  <p className="font-bold text-xl text-green-600">
                    ₹{estimateData.estimatedValue.toLocaleString()}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500 mb-1">Payment Terms</p>
                  <p className="font-medium text-gray-900">{estimateData.paymentTerms}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Validity</p>
                  <p className="font-medium text-gray-900">{estimateData.validityDays} days</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Delivery Time</p>
                  <p className="font-medium text-gray-900">{estimateData.deliveryTime}</p>
                </div>
              </div>
            </div>

            {/* Items by Category */}
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Estimate Items</h2>

              {Object.entries(itemsByCategory).map(([category, items]) => (
                <div key={category} className="mb-3 last:mb-0">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-semibold text-gray-900">{category}</h3>
                    <span className="text-sm text-gray-600">
                      {items.length} items · ₹{items.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-y border-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item Code</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Qty</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Unit</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Rate (₹)</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount (₹)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {items.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.itemCode}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{item.description}</td>
                            <td className="px-4 py-3 text-sm text-gray-900 text-right">{item.quantity}</td>
                            <td className="px-4 py-3 text-sm text-gray-600 text-center">{item.unit}</td>
                            <td className="px-4 py-3 text-sm text-gray-900 text-right">{item.rate.toLocaleString()}</td>
                            <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">{item.amount.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                        <tr>
                          <td colSpan={5} className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">
                            {category} Subtotal:
                          </td>
                          <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right">
                            ₹{items.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              ))}

              {/* Grand Total */}
              <div className="mt-6 pt-6 border-t-2 border-gray-300">
                <div className="flex justify-between items-center">
                  <div className="text-base font-semibold text-gray-900">
                    Grand Total ({estimateData.items.length} items)
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    ₹{estimateData.estimatedValue.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="col-span-1 space-y-3">
            {/* Status Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-3 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Approval Status</h3>

              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Status</p>
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                    <Clock className="w-4 h-4" />
                    {estimateData.status}
                  </span>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Priority</p>
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(estimateData.priority)}`}>
                    {estimateData.priority.toUpperCase()}
                  </span>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500 mb-1 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Pending Days
                  </p>
                  <p className="text-2xl font-bold text-orange-600">{estimateData.pendingDays} days</p>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500 mb-1">Approval Level</p>
                  <p className="font-medium text-gray-900">{estimateData.approvalLevel}</p>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500 mb-1">Pending With</p>
                  <p className="font-semibold text-gray-900">{estimateData.pendingWith}</p>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500 mb-1 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Submitted By
                  </p>
                  <p className="font-medium text-gray-900">{estimateData.submittedBy}</p>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500 mb-1 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Submitted On
                  </p>
                  <p className="font-medium text-gray-900">
                    {new Date(estimateData.submittedDate).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </p>
                  <p className="text-sm text-gray-600">{estimateData.submittedTime}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                <button
                  onClick={handleApprove}
                  disabled={processing}
                  className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 font-medium disabled:opacity-50"
                >
                  <CheckCircle className="w-5 h-5" />
                  Approve Estimate
                </button>
                <button
                  onClick={handleReject}
                  disabled={processing}
                  className="w-full px-4 py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 flex items-center justify-center gap-2 font-medium disabled:opacity-50"
                >
                  <XCircle className="w-5 h-5" />
                  Reject Estimate
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  )
}
