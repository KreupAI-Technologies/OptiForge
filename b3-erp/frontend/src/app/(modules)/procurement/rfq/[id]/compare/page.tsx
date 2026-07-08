'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { exportToCsv } from '@/lib/export'
import { procurementRFQService, QuoteComparisonResult } from '@/services/procurement-rfq.service'
import {
  ArrowLeft,
  Download,
  TrendingDown,
  DollarSign,
  Truck,
  Award,
  AlertCircle,
  Loader2,
  Shield,
  Star,
  MessageSquare,
  Eye,
  Mail,
  Printer,
  Zap
} from 'lucide-react'

export default function QuotationComparisonPage() {
  const params = useParams()
  const router = useRouter()
  const rfqId = params.id as string

  const [comparison, setComparison] = useState<QuoteComparisonResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const loadComparison = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const result = await procurementRFQService.compareQuotes(rfqId)
      setComparison(result)
    } catch (err) {
      console.error('Error loading quote comparison:', err)
      setError(err instanceof Error ? err.message : 'Failed to load quote comparison.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadComparison()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rfqId])

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 80) return 'text-blue-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const handleExport = () => {
    if (!comparison) return
    exportToCsv('rfq-comparison', comparison.vendorSummary as unknown as Record<string, unknown>[])
  }

  const handleAwardContract = async (vendorId: string) => {
    if (!confirm('Award this RFQ to the selected vendor?')) return
    try {
      setSubmitting(true)
      await procurementRFQService.awardRFQ(rfqId, vendorId)
      alert('RFQ awarded to vendor successfully.')
      router.push('/procurement/rfq')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to award RFQ')
      setSubmitting(false)
    }
  }

  const handleNegotiate = (vendorId: string) => {
    router.push(`/procurement/vendor-management?vendorId=${encodeURIComponent(vendorId)}`)
  }

  if (isLoading) {
    return (
      <div className="p-6 w-full flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading quotation comparison...</p>
        </div>
      </div>
    )
  }

  if (error || !comparison) {
    return (
      <div className="p-6 w-full space-y-3">
        <Link
          href="/procurement/rfq"
          className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
          <span className="text-gray-700">Back</span>
        </Link>
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          <AlertCircle className="h-5 w-5" />
          <span>{error || 'No comparison data available.'}</span>
          <button
            onClick={loadComparison}
            className="ml-auto px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // Rank vendors by overall score (highest first)
  const rankedVendors = [...comparison.vendorSummary].sort(
    (a, b) => (b.overallScore ?? 0) - (a.overallScore ?? 0)
  )
  const rankOf = (vendorId: string) => rankedVendors.findIndex(v => v.vendorId === vendorId) + 1

  const getRankingColor = (ranking: number) => {
    switch (ranking) {
      case 1: return 'bg-green-100 text-green-800 border-green-300'
      case 2: return 'bg-blue-100 text-blue-800 border-blue-300'
      case 3: return 'bg-orange-100 text-orange-800 border-orange-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  return (
    <div className="p-6 w-full space-y-3">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link
              href="/procurement/rfq"
              className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
              <span className="text-gray-700">Back</span>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Quotation Comparison</h1>
          </div>
          <div className="ml-11 space-y-1">
            <p className="text-gray-600">RFQ: {comparison.rfqNumber}</p>
            <p className="text-sm text-gray-500">Comparing {comparison.vendorSummary.length} vendor quotations</p>
            {comparison.recommendedVendorName && (
              <p className="text-sm text-green-700 font-medium">
                Recommended: {comparison.recommendedVendorName}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Printer className="h-4 w-4" />
            Print
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Vendor Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
        {comparison.vendorSummary.map((vendor) => {
          const ranking = rankOf(vendor.vendorId)
          const isRecommended = comparison.recommendedVendorId === vendor.vendorId
          return (
            <div
              key={vendor.vendorId}
              className={`bg-white rounded-lg border-2 ${ranking === 1 ? 'border-green-500' : 'border-gray-200'} overflow-hidden`}
            >
              {ranking === 1 && (
                <div className="bg-green-500 text-white px-4 py-2 text-center font-semibold">
                  BEST OVERALL QUOTATION
                </div>
              )}

              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">{vendor.vendorName}</h3>
                    {isRecommended && (
                      <div className="flex items-center gap-1 mt-1 text-green-600">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="text-sm font-medium">Recommended</span>
                      </div>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getRankingColor(ranking)}`}>
                    Rank #{ranking}
                  </span>
                </div>

                {/* Financial Summary */}
                <div className="space-y-2 pb-3 border-b">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Discount:</span>
                    <span className="font-medium text-green-600">{vendor.discountPercentage}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Avg Lead Time:</span>
                    <span className="font-medium">{vendor.averageLeadTime.toFixed(0)} days</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold pt-2 border-t">
                    <span>Total:</span>
                    <span className="text-blue-600">${vendor.totalAmount.toLocaleString()}</span>
                  </div>
                </div>

                {/* Score */}
                <div className="py-3 border-b text-center">
                  <p className="text-xs text-gray-500">Overall Score</p>
                  <p className={`text-2xl font-bold ${getScoreColor(vendor.overallScore ?? 0)}`}>
                    {vendor.overallScore != null ? `${vendor.overallScore}%` : '—'}
                  </p>
                  {vendor.recommendation && (
                    <p className="text-xs text-green-600 mt-1">{vendor.recommendation}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-3">
                  {ranking === 1 ? (
                    <button
                      onClick={() => handleAwardContract(vendor.vendorId)}
                      disabled={submitting}
                      className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium flex items-center justify-center gap-1 disabled:opacity-50"
                    >
                      <Award className="h-4 w-4" />
                      Award Contract
                    </button>
                  ) : (
                    <button
                      onClick={() => handleNegotiate(vendor.vendorId)}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center justify-center gap-1"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Negotiate
                    </button>
                  )}
                  <button
                    onClick={() => handleAwardContract(vendor.vendorId)}
                    disabled={submitting}
                    className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    title="Award this vendor"
                  >
                    <Award className="h-4 w-4 text-gray-600" />
                  </button>
                  <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <Mail className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Detailed Item Comparison Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-3 py-2 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Detailed Item Comparison</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item Details
                </th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Qty
                </th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lowest
                </th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Average
                </th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Highest
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-l">
                  Vendor Quotes
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {comparison.items.map((item) => (
                <tr key={item.itemId} className="hover:bg-gray-50 align-top">
                  <td className="px-3 py-3">
                    <div className="text-sm font-medium text-gray-900">{item.itemName}</div>
                    <div className="text-xs text-gray-500">{item.itemCode}</div>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <div className="text-sm font-medium text-gray-900">{item.quantity}</div>
                    <div className="text-xs text-gray-500">{item.unit}</div>
                  </td>
                  <td className="px-3 py-3 text-center text-sm font-medium text-green-600">
                    ${item.lowestPrice.toLocaleString()}
                  </td>
                  <td className="px-3 py-3 text-center text-sm text-gray-900">
                    ${item.averagePrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-3 py-3 text-center text-sm text-gray-900">
                    ${item.highestPrice.toLocaleString()}
                  </td>
                  <td className="px-3 py-3 border-l">
                    <div className="space-y-1">
                      {item.vendorQuotes.map((vq) => (
                        <div key={vq.vendorId} className="flex items-center justify-between gap-4 text-sm">
                          <span className="text-gray-700">{vq.vendorName}</span>
                          <span className="flex items-center gap-2">
                            <span className={vq.isLowest ? 'text-green-600 font-medium' : 'text-gray-900'}>
                              ${vq.unitPrice.toLocaleString()}
                              {vq.isLowest && <TrendingDown className="h-3 w-3 inline ml-1" />}
                            </span>
                            <span className={vq.isFastest ? 'text-blue-600 font-medium' : 'text-gray-500'}>
                              {vq.leadTimeDays}d
                              {vq.isFastest && <Zap className="h-3 w-3 inline ml-1" />}
                            </span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Evaluation Criteria */}
      <div className="bg-white rounded-lg border border-gray-200 p-3">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Evaluation Criteria</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
          <div className="flex items-center gap-3">
            <DollarSign className="h-8 w-8 text-blue-500 bg-blue-100 rounded-lg p-1.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">Price (40%)</p>
              <p className="text-xs text-gray-500">Total cost comparison</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Truck className="h-8 w-8 text-green-500 bg-green-100 rounded-lg p-1.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">Delivery (20%)</p>
              <p className="text-xs text-gray-500">Lead time and terms</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-purple-500 bg-purple-100 rounded-lg p-1.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">Quality (25%)</p>
              <p className="text-xs text-gray-500">Warranty and specs</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Star className="h-8 w-8 text-yellow-500 bg-yellow-100 rounded-lg p-1.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">Vendor Rating (15%)</p>
              <p className="text-xs text-gray-500">Past performance</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
