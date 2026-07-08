'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { cpqAnalyticsLiveService } from '@/services/cpq/cpq-analytics-live.service'
import {
  GitCompare,
  ArrowRight,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  Plus,
  Download,
  Eye,
  Package,
  X
} from 'lucide-react'
import { AddQuoteModal, ViewQuoteDetailsModal, ItemComparisonModal, ExportComparisonModal } from '@/components/cpq/QuoteComparisonModals'
import { exportToCsv } from '@/lib/export'

interface QuoteForComparison {
  id: string
  quoteNumber: string
  version: string
  value: number
  discount: number
  items: number
  deliveryDays: number
  paymentTerms: string
  warranty: string
  validityDays: number
  createdDate: string
}

export default function CPQQuotesComparisonPage() {
  const router = useRouter()

  // State management
  const [selectedQuotes, setSelectedQuotes] = useState<string[]>([])

  // Modal states
  const [isAddQuoteModalOpen, setIsAddQuoteModalOpen] = useState(false)
  const [isViewDetailsModalOpen, setIsViewDetailsModalOpen] = useState(false)
  const [isItemComparisonModalOpen, setIsItemComparisonModalOpen] = useState(false)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)

  // Selected quote for details view
  const [selectedQuoteForDetails, setSelectedQuoteForDetails] = useState<QuoteForComparison | null>(null)

  // Comparable quotes wired to GET /cpq/quote-versions-list. The endpoint
  // exposes id/quoteNumber/version/customerName/value/status; delivery/payment/
  // warranty/validity/discount/items aren't stored there, so they default.
  const [quotes, setQuotes] = useState<QuoteForComparison[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setIsLoading(true)
      setLoadError(null)
      try {
        const raw = await cpqAnalyticsLiveService.getQuoteVersions()
        const mapped: QuoteForComparison[] = raw.map((q) => ({
          id: String(q.id),
          quoteNumber: q.quoteNumber || String(q.id),
          version: q.version || 'v1.0',
          value: Number(q.value ?? 0),
          discount: 0,
          items: 0,
          deliveryDays: 0,
          paymentTerms: '-',
          warranty: '-',
          validityDays: 0,
          createdDate: (q.createdDate || '').toString().slice(0, 10),
        }))
        if (!cancelled) {
          setQuotes(mapped)
          // Pre-select the first two versions so the comparison renders.
          setSelectedQuotes(mapped.slice(0, 2).map((q) => q.id))
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load quote versions')
          setQuotes([])
          setSelectedQuotes([])
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
  const handleAddQuote = (quoteId: string) => {
    if (selectedQuotes.length < 3) {
      setSelectedQuotes([...selectedQuotes, quoteId])
    }
  }

  const handleRemoveQuote = (quoteId: string) => {
    if (selectedQuotes.length > 2) {
      setSelectedQuotes(selectedQuotes.filter(id => id !== quoteId))
    }
  }

  const handleViewDetails = (quote: QuoteForComparison) => {
    setSelectedQuoteForDetails(quote)
    setIsViewDetailsModalOpen(true)
  }

  const handleExport = (format: 'pdf' | 'excel' | 'csv') => {
    const selectedQuoteObjects = quotes.filter(q => selectedQuotes.includes(q.id))

    if (format === 'csv') {
      const csvContent = [
        ['Attribute', ...selectedQuoteObjects.map(q => `${q.quoteNumber} ${q.version}`)].join(','),
        ['Quote Value', ...selectedQuoteObjects.map(q => q.value)].join(','),
        ['Discount %', ...selectedQuoteObjects.map(q => q.discount)].join(','),
        ['Number of Items', ...selectedQuoteObjects.map(q => q.items)].join(','),
        ['Delivery Timeline (days)', ...selectedQuoteObjects.map(q => q.deliveryDays)].join(','),
        ['Payment Terms', ...selectedQuoteObjects.map(q => `"${q.paymentTerms}"`)].join(','),
        ['Warranty', ...selectedQuoteObjects.map(q => `"${q.warranty}"`)].join(','),
        ['Quote Validity (days)', ...selectedQuoteObjects.map(q => q.validityDays)].join(','),
        ['Created Date', ...selectedQuoteObjects.map(q => q.createdDate)].join(',')
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `quote-comparison-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
    } else {
      exportToCsv(`quote-comparison-${format}`, selectedQuoteObjects)
    }
  }

  const handleSelectWinner = () => {
    const winningQuote = selectedQuoteObjects[0]
    if (confirm(`Mark ${winningQuote.quoteNumber} ${winningQuote.version} as the winning quote?`)) {
      router.push(`/cpq/quotes/create?id=${winningQuote.id}`)
    }
  }

  const compareValues = (val1: any, val2: any, type: 'number' | 'string' = 'number') => {
    if (type === 'number') {
      if (val1 > val2) return { icon: <TrendingUp className="h-4 w-4 text-green-600" />, color: 'text-green-600' }
      if (val1 < val2) return { icon: <TrendingDown className="h-4 w-4 text-red-600" />, color: 'text-red-600' }
      return { icon: <Minus className="h-4 w-4 text-gray-400" />, color: 'text-gray-600' }
    }
    if (val1 !== val2) return { icon: <AlertCircle className="h-4 w-4 text-blue-600" />, color: 'text-blue-600' }
    return { icon: <Minus className="h-4 w-4 text-gray-400" />, color: 'text-gray-600' }
  }

  const getQuoteColor = (idx: number) => {
    const colors = ['text-blue-600', 'text-orange-600', 'text-purple-600']
    return colors[idx] || 'text-gray-600'
  }

  const selectedQuoteObjects = selectedQuotes.map(id => quotes.find(q => q.id === id)).filter(q => q !== undefined) as QuoteForComparison[]

  if (isLoading) {
    return (
      <div className="w-full h-full px-4 py-6 text-center text-sm text-gray-500">
        Loading quote versions...
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="w-full h-full px-4 py-6 text-center text-sm text-red-600">
        {loadError}
      </div>
    )
  }

  if (selectedQuoteObjects.length < 2) {
    return (
      <div className="w-full h-full px-4 py-6 text-center text-sm text-gray-500">
        At least two quote versions are required to compare. None available yet.
      </div>
    )
  }

  const quote1 = selectedQuoteObjects[0]
  const quote2 = selectedQuoteObjects[1]
  const quote3 = selectedQuoteObjects[2]

  const valueDiff = quote1.value - quote2.value
  const discountDiff = quote1.discount - quote2.discount
  const itemsDiff = quote1.items - quote2.items
  const deliveryDiff = quote1.deliveryDays - quote2.deliveryDays

  return (
    <div className="w-full h-full px-4 py-2">
      {/* Action Buttons */}
      <div className="mb-3 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <GitCompare className="h-6 w-6 text-blue-600" />
          Quote Comparison
          <span className="text-sm font-normal text-gray-600">({selectedQuoteObjects.length} quotes)</span>
        </h2>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsItemComparisonModalOpen(true)}
            className="px-4 py-2 text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 flex items-center gap-2 transition-colors"
          >
            <Package className="h-4 w-4" />
            Item Comparison
          </button>
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-colors"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
          <button
            onClick={handleSelectWinner}
            className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors font-medium"
          >
            <CheckCircle className="h-4 w-4" />
            Select Winner
          </button>
        </div>
      </div>

      {/* Quote Selectors */}
      <div className="mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          {selectedQuoteObjects.map((quote, idx) => (
            <div key={quote.id} className="flex-1 min-w-[280px]">
              <div className="bg-white rounded-lg p-3 border-2 border-gray-200 hover:border-blue-300 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-gray-500 uppercase">Quote {idx + 1}</label>
                  {selectedQuoteObjects.length > 2 && (
                    <button
                      onClick={() => handleRemoveQuote(quote.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <select
                  value={quote.id}
                  onChange={(e) => {
                    const newQuotes = [...selectedQuotes]
                    newQuotes[idx] = e.target.value
                    setSelectedQuotes(newQuotes)
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm mb-2"
                >
                  {quotes.map((q) => (
                    <option key={q.id} value={q.id}>
                      {q.quoteNumber} {q.version} - ₹{(q.value / 100000).toFixed(2)}L
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => handleViewDetails(quote)}
                  className="w-full px-3 py-1.5 text-xs text-blue-600 bg-blue-50 hover:bg-blue-100 rounded transition-colors flex items-center justify-center gap-1"
                >
                  <Eye className="h-3 w-3" />
                  View Details
                </button>
              </div>
            </div>
          ))}

          {selectedQuoteObjects.length < 3 && (
            <div className="flex-1 min-w-[280px]">
              <button
                onClick={() => setIsAddQuoteModalOpen(true)}
                className="w-full h-full min-h-[120px] bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-blue-600"
              >
                <Plus className="h-8 w-8" />
                <span className="text-sm font-medium">Add Quote to Compare</span>
                <span className="text-xs text-gray-400">Up to 3 quotes</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Summary */}
      <div className="mb-3 grid grid-cols-1 md:grid-cols-4 gap-2">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <p className="text-xs font-medium text-blue-600 mb-1">Value Difference</p>
          <p className={`text-xl font-bold ${valueDiff > 0 ? 'text-green-600' : valueDiff < 0 ? 'text-red-600' : 'text-gray-600'}`}>
            {valueDiff > 0 ? '+' : ''}₹{Math.abs(valueDiff / 100000).toFixed(2)}L
          </p>
          <p className="text-xs text-blue-700 mt-1">{((valueDiff / quote2.value) * 100).toFixed(1)}% change</p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
          <p className="text-xs font-medium text-orange-600 mb-1">Discount Difference</p>
          <p className={`text-xl font-bold ${discountDiff > 0 ? 'text-red-600' : discountDiff < 0 ? 'text-green-600' : 'text-gray-600'}`}>
            {discountDiff > 0 ? '+' : ''}{discountDiff}%
          </p>
          <p className="text-xs text-orange-700 mt-1">{discountDiff > 0 ? 'Higher' : discountDiff < 0 ? 'Lower' : 'Same'} discount</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <p className="text-xs font-medium text-purple-600 mb-1">Items Difference</p>
          <p className={`text-xl font-bold ${itemsDiff > 0 ? 'text-blue-600' : itemsDiff < 0 ? 'text-orange-600' : 'text-gray-600'}`}>
            {itemsDiff > 0 ? '+' : ''}{itemsDiff} items
          </p>
          <p className="text-xs text-purple-700 mt-1">{itemsDiff > 0 ? 'More' : itemsDiff < 0 ? 'Fewer' : 'Same'} items</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <p className="text-xs font-medium text-green-600 mb-1">Delivery Difference</p>
          <p className={`text-xl font-bold ${deliveryDiff < 0 ? 'text-green-600' : deliveryDiff > 0 ? 'text-red-600' : 'text-gray-600'}`}>
            {deliveryDiff > 0 ? '+' : ''}{deliveryDiff} days
          </p>
          <p className="text-xs text-green-700 mt-1">{deliveryDiff < 0 ? 'Faster' : deliveryDiff > 0 ? 'Slower' : 'Same'} delivery</p>
        </div>
      </div>

      {/* Detailed Comparison Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Attribute</th>
                {selectedQuoteObjects.map((quote, idx) => (
                  <th key={quote.id} className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                    <div className="flex flex-col items-center gap-1">
                      <span className={`font-semibold ${
                        idx === 0 ? 'text-blue-600' : idx === 1 ? 'text-orange-600' : 'text-purple-600'
                      }`}>
                        {quote.version}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(quote.createdDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {/* Quote Value */}
              <tr className="hover:bg-gray-50">
                <td className="px-3 py-2 text-sm font-medium text-gray-900">Quote Value</td>
                {selectedQuoteObjects.map((quote, idx) => (
                  <td key={quote.id} className="px-3 py-2 text-center">
                    <span className={`text-lg font-bold ${getQuoteColor(idx)}`}>
                      ₹{(quote.value / 100000).toFixed(2)}L
                    </span>
                  </td>
                ))}
              </tr>

              {/* Discount % */}
              <tr className="hover:bg-gray-50">
                <td className="px-3 py-2 text-sm font-medium text-gray-900">Discount %</td>
                {selectedQuoteObjects.map((quote, idx) => (
                  <td key={quote.id} className="px-3 py-2 text-center">
                    <span className={`text-base font-semibold ${getQuoteColor(idx)}`}>
                      {quote.discount}%
                    </span>
                  </td>
                ))}
              </tr>

              {/* Number of Items */}
              <tr className="hover:bg-gray-50">
                <td className="px-3 py-2 text-sm font-medium text-gray-900">Number of Items</td>
                {selectedQuoteObjects.map((quote, idx) => (
                  <td key={quote.id} className="px-3 py-2 text-center">
                    <span className={`text-base font-semibold ${getQuoteColor(idx)}`}>
                      {quote.items}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Delivery Timeline */}
              <tr className="hover:bg-gray-50">
                <td className="px-3 py-2 text-sm font-medium text-gray-900">Delivery Timeline</td>
                {selectedQuoteObjects.map((quote, idx) => (
                  <td key={quote.id} className="px-3 py-2 text-center">
                    <span className={`text-base font-semibold ${getQuoteColor(idx)}`}>
                      {quote.deliveryDays} days
                    </span>
                  </td>
                ))}
              </tr>

              {/* Payment Terms */}
              <tr className="hover:bg-gray-50">
                <td className="px-3 py-2 text-sm font-medium text-gray-900">Payment Terms</td>
                {selectedQuoteObjects.map((quote, idx) => (
                  <td key={quote.id} className="px-3 py-2 text-center">
                    <span className={`text-sm font-medium ${getQuoteColor(idx)}`}>
                      {quote.paymentTerms}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Warranty Period */}
              <tr className="hover:bg-gray-50">
                <td className="px-3 py-2 text-sm font-medium text-gray-900">Warranty Period</td>
                {selectedQuoteObjects.map((quote, idx) => (
                  <td key={quote.id} className="px-3 py-2 text-center">
                    <span className={`text-sm font-medium ${getQuoteColor(idx)}`}>
                      {quote.warranty}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Quote Validity */}
              <tr className="hover:bg-gray-50">
                <td className="px-3 py-2 text-sm font-medium text-gray-900">Quote Validity</td>
                {selectedQuoteObjects.map((quote, idx) => (
                  <td key={quote.id} className="px-3 py-2 text-center">
                    <span className={`text-sm font-medium ${getQuoteColor(idx)}`}>
                      {quote.validityDays} days
                    </span>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Recommendation */}
      <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-green-900 mb-2 flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          Recommendation:
        </h3>
        <p className="text-sm text-green-700">
          Based on the comparison, <strong>{quote1.version}</strong> offers better value with {quote1.discount}% discount, 
          {quote1.items} items, and {quote1.deliveryDays}-day delivery timeline at ₹{(quote1.value / 100000).toFixed(2)}L. 
          This represents a {((valueDiff / quote2.value) * 100).toFixed(1)}% increase in value with improved terms.
        </p>
      </div>

      {/* Comparison Info */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Quote Comparison Benefits:</h3>
        <ul className="text-xs text-blue-700 space-y-1">
          <li><strong>Side-by-Side Analysis:</strong> Compare all key attributes of different quote versions</li>
          <li><strong>Visual Indicators:</strong> Quickly identify increases, decreases, and unchanged values</li>
          <li><strong>Financial Impact:</strong> Understand the financial implications of each version</li>
          <li><strong>Version Tracking:</strong> See how quotes evolved through the negotiation process</li>
          <li><strong>Multi-Quote Comparison:</strong> Compare up to 3 quotes simultaneously for comprehensive analysis</li>
        </ul>
      </div>

      {/* Modals */}
      <AddQuoteModal
        isOpen={isAddQuoteModalOpen}
        onClose={() => setIsAddQuoteModalOpen(false)}
        availableQuotes={quotes}
        selectedQuotes={selectedQuotes}
        onAdd={handleAddQuote}
      />

      <ViewQuoteDetailsModal
        isOpen={isViewDetailsModalOpen}
        onClose={() => {
          setIsViewDetailsModalOpen(false)
          setSelectedQuoteForDetails(null)
        }}
        quote={selectedQuoteForDetails}
      />

      <ItemComparisonModal
        isOpen={isItemComparisonModalOpen}
        onClose={() => setIsItemComparisonModalOpen(false)}
        quotes={selectedQuoteObjects}
      />

      <ExportComparisonModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        quotes={selectedQuoteObjects}
        onExport={handleExport}
      />
    </div>
  )
}
