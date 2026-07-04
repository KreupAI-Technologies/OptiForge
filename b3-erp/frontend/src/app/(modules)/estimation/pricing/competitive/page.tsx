'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Target,
  AlertCircle,
  ArrowLeft,
  Search,
  Filter,
  Download,
  ExternalLink,
  Award
} from 'lucide-react'
import {
  estimationPricingLiveService,
  PricingRecord,
} from '@/services/estimation-pricing-live.service'

interface CompetitivePrice {
  id: string
  productCode: string
  productName: string
  category: string
  ourPrice: number
  ourCost: number
  ourMargin: number
  competitor1: string
  competitor1Price: number
  competitor1Position: 'lower' | 'higher' | 'same'
  competitor2: string
  competitor2Price: number
  competitor2Position: 'lower' | 'higher' | 'same'
  competitor3: string
  competitor3Price: number
  competitor3Position: 'lower' | 'higher' | 'same'
  marketAvg: number
  priceIndex: number
  recommendation: 'increase' | 'decrease' | 'maintain' | 'monitor'
  priceDifferential: number
  status: 'competitive' | 'overpriced' | 'underpriced'
}

interface CompetitorProfile {
  name: string
  marketShare: number
  avgPriceIndex: number
  productsTracked: number
  positioning: 'premium' | 'mid-range' | 'value'
}

export default function CompetitivePricingPage() {
  const router = useRouter()

  const [competitivePrices, setCompetitivePrices] = useState<CompetitivePrice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setIsLoading(true)
      setLoadError(null)
      try {
        // Map pricing records to the competitive-comparison shape. The pricing
        // endpoint has no competitor feed, so competitor columns are neutral and
        // the market index is anchored at 100 (parity) using our own totalPrice.
        const raw = await estimationPricingLiveService.getPricing()
        const mapped: CompetitivePrice[] = raw.map((p: PricingRecord) => {
          const ourPrice = Number(p.totalPrice ?? 0)
          const ourCost = Number(p.baseCost ?? 0)
          const ourMargin = Number(p.actualMarginPercentage ?? p.markupPercentage ?? 0)
          return {
            id: p.id,
            productCode: p.pricingNumber ?? p.id,
            productName: p.title ?? 'Untitled Pricing',
            category: p.category ?? p.pricingStrategy ?? 'General',
            ourPrice,
            ourCost,
            ourMargin,
            competitor1: '—',
            competitor1Price: 0,
            competitor1Position: 'same',
            competitor2: '—',
            competitor2Price: 0,
            competitor2Position: 'same',
            competitor3: '—',
            competitor3Price: 0,
            competitor3Position: 'same',
            marketAvg: ourPrice,
            priceIndex: 100,
            recommendation: 'monitor',
            priceDifferential: 0,
            status: 'competitive',
          }
        })
        if (!cancelled) setCompetitivePrices(mapped)
      } catch (err) {
        if (!cancelled) {
          setLoadError(
            err instanceof Error ? err.message : 'Failed to load competitive pricing',
          )
          setCompetitivePrices([])
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

  // Competitor profiles are derived from named competitors present in the rows.
  const competitorProfiles: CompetitorProfile[] = useMemo(() => {
    const names = new Map<string, number>()
    competitivePrices.forEach((p) => {
      ;[p.competitor1, p.competitor2, p.competitor3].forEach((n) => {
        if (n && n !== '—') names.set(n, (names.get(n) ?? 0) + 1)
      })
    })
    return Array.from(names.entries()).map(([name, productsTracked]) => ({
      name,
      marketShare: 0,
      avgPriceIndex: 100,
      productsTracked,
      positioning: 'mid-range' as const,
    }))
  }, [competitivePrices])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'competitive':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'overpriced':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'underpriced':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'increase':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'decrease':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'maintain':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'monitor':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getPositioningColor = (positioning: string) => {
    switch (positioning) {
      case 'premium':
        return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'mid-range':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'value':
        return 'bg-green-100 text-green-700 border-green-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const avgPriceIndex = competitivePrices.length
    ? competitivePrices.reduce((sum, p) => sum + p.priceIndex, 0) / competitivePrices.length
    : 0
  const competitiveCount = competitivePrices.filter(p => p.status === 'competitive').length
  const underpricedCount = competitivePrices.filter(p => p.status === 'underpriced').length
  const overpricedCount = competitivePrices.filter(p => p.status === 'overpriced').length

  return (
    <div className="w-full h-full px-4 py-2">
      {loadError && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {loadError}
        </div>
      )}
      {isLoading && (
        <div className="mb-3 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600">
          Loading competitive pricing...
        </div>
      )}
      {/* Header */}
      <div className="mb-3 flex items-center justify-end gap-3">
        <button className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filter
        </button>
        <button className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-5 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Price Index</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{avgPriceIndex.toFixed(1)}</p>
              <p className="text-xs text-blue-700 mt-1">vs market avg (100)</p>
            </div>
            <Target className="h-10 w-10 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-5 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Competitive</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{competitiveCount}</p>
              <p className="text-xs text-green-700 mt-1">Well positioned</p>
            </div>
            <Award className="h-10 w-10 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-5 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">Underpriced</p>
              <p className="text-2xl font-bold text-yellow-900 mt-1">{underpricedCount}</p>
              <p className="text-xs text-yellow-700 mt-1">Opportunity to increase</p>
            </div>
            <TrendingUp className="h-10 w-10 text-yellow-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-5 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Overpriced</p>
              <p className="text-2xl font-bold text-red-900 mt-1">{overpricedCount}</p>
              <p className="text-xs text-red-700 mt-1">Risk of losing sales</p>
            </div>
            <AlertCircle className="h-10 w-10 text-red-600" />
          </div>
        </div>
      </div>

      {/* Competitor Profiles */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-3">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Key Competitor Profiles</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
            {competitorProfiles.map((comp) => (
              <div key={comp.name} className="p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 text-sm">{comp.name}</p>
                    <p className="text-xs text-gray-600 mt-1">{comp.productsTracked} products tracked</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPositioningColor(comp.positioning)}`}>
                    {comp.positioning.toUpperCase()}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Market Share:</span>
                    <span className="font-semibold text-gray-900">{comp.marketShare}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${comp.marketShare * 4}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Price Index:</span>
                    <span className={`font-semibold ${comp.avgPriceIndex > 100 ? 'text-red-600' : 'text-green-600'}`}>
                      {comp.avgPriceIndex}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Competitive Pricing Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Price Comparison by Product</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Our Price</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Competitors</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Market Avg</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Index</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Differential</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Recommendation</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {competitivePrices.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-3 py-8 text-center text-sm text-gray-500">
                    {isLoading ? 'Loading...' : 'No competitive pricing found.'}
                  </td>
                </tr>
              )}
              {competitivePrices.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{product.productName}</p>
                      <p className="text-xs text-gray-600 mt-1">{product.productCode}</p>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <p className="text-sm font-bold text-blue-600">₹{product.ourPrice.toLocaleString()}</p>
                    <p className="text-xs text-gray-600">{product.ourMargin.toFixed(1)}% margin</p>
                  </td>
                  <td className="px-3 py-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-gray-600">{product.competitor1}:</span>
                        <span className="font-medium">₹{product.competitor1Price.toLocaleString()}</span>
                        {product.competitor1Position === 'higher' ? (
                          <TrendingUp className="h-3 w-3 text-red-500" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-green-500" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-gray-600">{product.competitor2}:</span>
                        <span className="font-medium">₹{product.competitor2Price.toLocaleString()}</span>
                        {product.competitor2Position === 'higher' ? (
                          <TrendingUp className="h-3 w-3 text-red-500" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-green-500" />
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <p className="text-sm font-medium text-gray-900">₹{product.marketAvg.toLocaleString()}</p>
                  </td>
                  <td className="px-3 py-2">
                    <p className={`text-sm font-bold ${
                      product.priceIndex < 95 ? 'text-yellow-600' :
                      product.priceIndex > 105 ? 'text-red-600' :
                      'text-green-600'
                    }`}>
                      {product.priceIndex.toFixed(1)}
                    </p>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1">
                      {product.priceDifferential > 0 ? (
                        <TrendingUp className="h-4 w-4 text-red-600" />
                      ) : product.priceDifferential < 0 ? (
                        <TrendingDown className="h-4 w-4 text-green-600" />
                      ) : null}
                      <span className={`text-sm font-semibold ${
                        product.priceDifferential > 0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {product.priceDifferential > 0 ? '+' : ''}₹{product.priceDifferential.toLocaleString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRecommendationColor(product.recommendation)}`}>
                      {product.recommendation.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(product.status)}`}>
                      {product.status.toUpperCase()}
                    </span>
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
