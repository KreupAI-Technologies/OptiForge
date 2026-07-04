'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  TrendingUp,
  TrendingDown,
  Target,
  DollarSign,
  ArrowLeft,
  Search,
  Filter,
  Download,
  AlertCircle,
  CheckCircle,
  BarChart3
} from 'lucide-react'
import {
  estimationMarkupSettingLiveService,
  MarkupSettingRecord,
} from '@/services/estimation-markup-setting-live.service'

interface PricingMargin {
  id: string
  productCode: string
  productName: string
  category: string
  costPrice: number
  sellingPrice: number
  marginAmount: number
  marginPercent: number
  targetMargin: number
  varianceFromTarget: number
  competitorPrice: number
  pricePosition: 'premium' | 'competitive' | 'value'
  status: 'healthy' | 'below-target' | 'at-risk'
  volumeSold: number
  revenue: number
}

interface CategoryMargin {
  category: string
  products: number
  avgMargin: number
  targetMargin: number
  totalRevenue: number
  status: 'healthy' | 'below-target' | 'at-risk'
}

export default function PricingMarginsPage() {
  const router = useRouter()

  const [pricingMargins, setPricingMargins] = useState<PricingMargin[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setIsLoading(true)
      setLoadError(null)
      try {
        // Map markup-setting records (per category/subcategory) to the page's
        // margin-row shape. defaultMarkup drives margin%, minMarkup is the target.
        const raw = await estimationMarkupSettingLiveService.getSettings()
        const mapped: PricingMargin[] = raw.map((m: MarkupSettingRecord) => {
          const marginPercent = Number(m.defaultMarkup ?? 0)
          const targetMargin = Number(m.minMarkup ?? m.defaultMarkup ?? 0)
          const variance = marginPercent - targetMargin
          const status: PricingMargin['status'] =
            variance >= 0 ? 'healthy' : variance >= -2 ? 'below-target' : 'at-risk'
          return {
            id: m.id,
            productCode: m.category ?? m.id,
            productName: m.subcategory
              ? `${m.category} — ${m.subcategory}`
              : m.category ?? 'Category',
            category: m.category ?? 'General',
            costPrice: 0,
            sellingPrice: 0,
            marginAmount: 0,
            marginPercent,
            targetMargin,
            varianceFromTarget: variance,
            competitorPrice: 0,
            pricePosition: 'competitive',
            status,
            volumeSold: 0,
            revenue: 0,
          }
        })
        if (!cancelled) setPricingMargins(mapped)
      } catch (err) {
        if (!cancelled) {
          setLoadError(
            err instanceof Error ? err.message : 'Failed to load pricing margins',
          )
          setPricingMargins([])
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

  // Category performance is derived from the fetched per-product margin rows.
  const categoryMargins: CategoryMargin[] = useMemo(() => {
    const groups = new Map<string, PricingMargin[]>()
    pricingMargins.forEach((p) => {
      const list = groups.get(p.category) ?? []
      list.push(p)
      groups.set(p.category, list)
    })
    return Array.from(groups.entries()).map(([category, items]) => {
      const avgMargin =
        items.reduce((s, i) => s + i.marginPercent, 0) / items.length
      const targetMargin =
        items.reduce((s, i) => s + i.targetMargin, 0) / items.length
      const totalRevenue = items.reduce((s, i) => s + i.revenue, 0)
      return {
        category,
        products: items.length,
        avgMargin,
        targetMargin,
        totalRevenue,
        status: avgMargin >= targetMargin ? 'healthy' : 'below-target',
      }
    })
  }, [pricingMargins])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'below-target':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'at-risk':
        return 'bg-red-100 text-red-700 border-red-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getPricePositionColor = (position: string) => {
    switch (position) {
      case 'premium':
        return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'competitive':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'value':
        return 'bg-green-100 text-green-700 border-green-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getVarianceColor = (variance: number) => {
    if (variance >= 0) return 'text-green-600'
    return 'text-red-600'
  }

  const totalRevenue = pricingMargins.reduce((sum, p) => sum + p.revenue, 0)
  const avgMargin = pricingMargins.length
    ? pricingMargins.reduce((sum, p) => sum + p.marginPercent, 0) / pricingMargins.length
    : 0
  const healthyCount = pricingMargins.filter(p => p.status === 'healthy').length
  const belowTargetCount = pricingMargins.filter(p => p.status === 'below-target').length

  return (
    <div className="w-full h-full px-4 py-2">
      {loadError && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {loadError}
        </div>
      )}
      {isLoading && (
        <div className="mb-3 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600">
          Loading pricing margins...
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
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-5 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Total Revenue</p>
              <p className="text-2xl font-bold text-green-900 mt-1">₹{(totalRevenue / 10000000).toFixed(2)}Cr</p>
              <p className="text-xs text-green-700 mt-1">From all products</p>
            </div>
            <DollarSign className="h-10 w-10 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-5 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Avg Margin</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{avgMargin.toFixed(1)}%</p>
              <p className="text-xs text-blue-700 mt-1">Across portfolio</p>
            </div>
            <Target className="h-10 w-10 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-5 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Healthy Products</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">{healthyCount}</p>
              <p className="text-xs text-purple-700 mt-1">Meeting targets</p>
            </div>
            <CheckCircle className="h-10 w-10 text-purple-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-5 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Below Target</p>
              <p className="text-2xl font-bold text-orange-900 mt-1">{belowTargetCount}</p>
              <p className="text-xs text-orange-700 mt-1">Need attention</p>
            </div>
            <AlertCircle className="h-10 w-10 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Category Margins */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-3">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Category Performance</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {categoryMargins.map((cat) => (
              <div key={cat.category} className="p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 text-sm">{cat.category}</p>
                    <p className="text-xs text-gray-600 mt-1">{cat.products} products</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(cat.status)}`}>
                    {cat.status.toUpperCase().replace('-', ' ')}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Avg Margin:</span>
                    <span className="font-semibold text-gray-900">{cat.avgMargin.toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Target:</span>
                    <span className="font-semibold text-gray-900">{cat.targetMargin.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        cat.avgMargin >= cat.targetMargin ? 'bg-green-500' : 'bg-yellow-500'
                      }`}
                      style={{ width: `${(cat.avgMargin / 40) * 100}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Revenue:</span>
                    <span className="font-semibold text-green-600">₹{(cat.totalRevenue / 100000).toFixed(1)}L</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing Margins Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Product Margin Details</h2>
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
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cost Price</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Selling Price</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Margin</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Target</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Variance</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Volume</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {pricingMargins.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-3 py-8 text-center text-sm text-gray-500">
                    {isLoading ? 'Loading...' : 'No pricing margins found.'}
                  </td>
                </tr>
              )}
              {pricingMargins.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{product.productName}</p>
                      <p className="text-xs text-gray-600 mt-1">{product.productCode}</p>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <p className="text-sm font-medium text-gray-900">₹{product.costPrice.toLocaleString()}</p>
                  </td>
                  <td className="px-3 py-2">
                    <p className="text-sm font-medium text-gray-900">₹{product.sellingPrice.toLocaleString()}</p>
                    <p className="text-xs text-gray-600">vs ₹{product.competitorPrice.toLocaleString()}</p>
                  </td>
                  <td className="px-3 py-2">
                    <p className="text-sm font-bold text-green-600">{product.marginPercent.toFixed(1)}%</p>
                    <p className="text-xs text-gray-600">₹{product.marginAmount.toLocaleString()}</p>
                  </td>
                  <td className="px-3 py-2">
                    <p className="text-sm font-medium text-gray-900">{product.targetMargin.toFixed(1)}%</p>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1">
                      {product.varianceFromTarget >= 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      )}
                      <span className={`text-sm font-semibold ${getVarianceColor(product.varianceFromTarget)}`}>
                        {product.varianceFromTarget > 0 ? '+' : ''}{product.varianceFromTarget.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPricePositionColor(product.pricePosition)}`}>
                      {product.pricePosition.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <p className="text-sm text-gray-900">{product.volumeSold} units</p>
                    <p className="text-xs text-green-600">₹{(product.revenue / 100000).toFixed(1)}L</p>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(product.status)}`}>
                      {product.status.toUpperCase().replace('-', ' ')}
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
