'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Package,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ShoppingCart,
  Layers,
  DollarSign,
  ArrowLeft,
  Search,
  Filter,
  Download,
  RefreshCw,
  AlertCircle
} from 'lucide-react'
import { estimationMaterialCostService } from '@/services/estimation-material-cost.service'

interface MaterialCost {
  id: string
  materialCode: string
  materialName: string
  category: string
  unit: string
  standardCost: number
  currentCost: number
  variance: number
  variancePercent: number
  supplier: string
  lastPurchasePrice: number
  lastPurchaseDate: string
  avgLeadTime: number
  minimumOrderQty: number
  usagePerMonth: number
  status: 'stable' | 'increasing' | 'decreasing' | 'volatile'
}

interface CategoryStats {
  category: string
  totalMaterials: number
  avgCost: number
  totalVariance: number
  status: 'stable' | 'increasing' | 'decreasing'
}

export default function MaterialsCostingPage() {
  const router = useRouter()

  const [materialCosts, setMaterialCosts] = useState<MaterialCost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const load = async () => {
    setIsLoading(true)
    setLoadError(null)
    try {
      // Backend returns raw ORM shape (decimals as strings). Map onto the
      // page's MaterialCost; page-only fields are defaulted.
      const raw = (await estimationMaterialCostService.getRates()) as any[]
      const statusMap: Record<string, MaterialCost['status']> = {
        stable: 'stable',
        increasing: 'increasing',
        decreasing: 'decreasing',
        volatile: 'volatile',
      }
      const mapped: MaterialCost[] = raw.map((m) => {
        const currentCost = Number(m.currentPrice ?? 0)
        const previousCost = Number(m.previousPrice ?? 0)
        return {
          id: String(m.id),
          materialCode: m.materialCode ?? '',
          materialName: m.materialName ?? '',
          category: m.category ?? '',
          unit: m.unit ?? '',
          standardCost: previousCost,
          currentCost,
          variance: currentCost - previousCost,
          variancePercent: Number(m.variancePercent ?? 0),
          supplier: m.supplier ?? '',
          lastPurchasePrice: currentCost,
          lastPurchaseDate: m.lastUpdated ?? '',
          avgLeadTime: 0,
          minimumOrderQty: 0,
          usagePerMonth: 0,
          status: statusMap[String(m.status ?? '').toLowerCase()] ?? 'stable',
        }
      })
      setMaterialCosts(mapped)
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load material costs')
      setMaterialCosts([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filteredMaterials = materialCosts.filter((m) => {
    const q = searchTerm.trim().toLowerCase()
    if (!q) return true
    return (
      m.materialName.toLowerCase().includes(q) ||
      m.materialCode.toLowerCase().includes(q) ||
      m.category.toLowerCase().includes(q) ||
      m.supplier.toLowerCase().includes(q)
    )
  })

  const handleExport = () => {
    const headers = ['Material Code', 'Material Name', 'Category', 'Unit', 'Standard Cost', 'Current Cost', 'Variance %', 'Supplier', 'Status']
    const rows = filteredMaterials.map((m) => [
      m.materialCode,
      m.materialName,
      m.category,
      m.unit,
      m.standardCost,
      m.currentCost,
      m.variancePercent,
      m.supplier,
      m.status,
    ])
    const csv = [headers, ...rows]
      .map((r) => r.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'material-costs.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  // Aggregate category stats from the fetched material costs.
  const categoryStats: CategoryStats[] = (() => {
    const byCat = new Map<string, MaterialCost[]>()
    materialCosts.forEach((m) => {
      const key = m.category || 'Uncategorized'
      if (!byCat.has(key)) byCat.set(key, [])
      byCat.get(key)!.push(m)
    })
    return Array.from(byCat.entries()).map(([category, rows]) => {
      const avgCost = rows.length
        ? Math.round(rows.reduce((s, r) => s + r.currentCost, 0) / rows.length)
        : 0
      const totalVariance = rows.length
        ? rows.reduce((s, r) => s + r.variancePercent, 0) / rows.length
        : 0
      const status: CategoryStats['status'] =
        totalVariance > 0.5 ? 'increasing' : totalVariance < -0.5 ? 'decreasing' : 'stable'
      return { category, totalMaterials: rows.length, avgCost, totalVariance, status }
    })
  })()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'stable':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'increasing':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'decreasing':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'volatile':
        return 'bg-orange-100 text-orange-700 border-orange-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getVarianceColor = (variance: number) => {
    if (variance > 5) return 'text-red-600'
    if (variance > 0) return 'text-orange-600'
    if (variance < -5) return 'text-blue-600'
    if (variance < 0) return 'text-green-600'
    return 'text-gray-600'
  }

  const totalMaterials = materialCosts.length
  const avgVariance = totalMaterials ? materialCosts.reduce((sum, m) => sum + m.variancePercent, 0) / totalMaterials : 0
  const increasingCount = materialCosts.filter(m => m.status === 'increasing').length
  const volatileCount = materialCosts.filter(m => m.status === 'volatile').length

  return (
    <div className="w-full h-full px-4 py-2">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Materials Costing</h1>
            <p className="text-sm text-gray-600 mt-1">Track and analyze material cost variations</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => load()}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Update Costs
          </button>
          <button
            onClick={() => document.getElementById('material-search')?.focus()}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
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

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading material costs…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-5 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Materials</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{totalMaterials}</p>
              <p className="text-xs text-blue-700 mt-1">Tracked items</p>
            </div>
            <Package className="h-10 w-10 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-5 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Avg Variance</p>
              <p className="text-2xl font-bold text-orange-900 mt-1">{avgVariance.toFixed(1)}%</p>
              <p className="text-xs text-orange-700 mt-1">From standard cost</p>
            </div>
            <TrendingUp className="h-10 w-10 text-orange-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-5 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Cost Increasing</p>
              <p className="text-2xl font-bold text-red-900 mt-1">{increasingCount}</p>
              <p className="text-xs text-red-700 mt-1">Materials trending up</p>
            </div>
            <TrendingUp className="h-10 w-10 text-red-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-5 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">Volatile Materials</p>
              <p className="text-2xl font-bold text-yellow-900 mt-1">{volatileCount}</p>
              <p className="text-xs text-yellow-700 mt-1">High fluctuation</p>
            </div>
            <AlertTriangle className="h-10 w-10 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Category Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-3">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Category Summary</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {categoryStats.map((cat) => (
              <div key={cat.category} className="p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 text-sm">{cat.category}</p>
                    <p className="text-xs text-gray-600 mt-1">{cat.totalMaterials} materials</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(cat.status)}`}>
                    {cat.status.toUpperCase()}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Avg Cost:</span>
                    <span className="font-semibold text-gray-900">₹{cat.avgCost.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Variance:</span>
                    <span className={`font-semibold ${getVarianceColor(cat.totalVariance)}`}>
                      {cat.totalVariance > 0 ? '+' : ''}{cat.totalVariance.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Materials Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Material Cost Details</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                id="material-search"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search materials..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Material</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Standard Cost</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Current Cost</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Variance</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Usage/Month</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredMaterials.map((material) => (
                <tr key={material.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{material.materialName}</p>
                      <p className="text-xs text-gray-600 mt-1">{material.materialCode}</p>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <p className="text-sm text-gray-900">{material.category}</p>
                  </td>
                  <td className="px-3 py-2">
                    <p className="text-sm font-medium text-gray-900">₹{material.standardCost.toLocaleString()}</p>
                    <p className="text-xs text-gray-600">per {material.unit}</p>
                  </td>
                  <td className="px-3 py-2">
                    <p className="text-sm font-medium text-gray-900">₹{material.currentCost.toLocaleString()}</p>
                    <p className="text-xs text-gray-600">{material.lastPurchaseDate}</p>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      {material.variancePercent > 0 ? (
                        <TrendingUp className="h-4 w-4 text-red-600" />
                      ) : material.variancePercent < 0 ? (
                        <TrendingDown className="h-4 w-4 text-green-600" />
                      ) : (
                        <div className="h-4 w-4" />
                      )}
                      <div>
                        <p className={`text-sm font-semibold ${getVarianceColor(material.variancePercent)}`}>
                          {material.variancePercent > 0 ? '+' : ''}{material.variancePercent.toFixed(1)}%
                        </p>
                        <p className="text-xs text-gray-600">₹{material.variance > 0 ? '+' : ''}{material.variance}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <p className="text-sm text-gray-900">{material.supplier}</p>
                    <p className="text-xs text-gray-600">{material.avgLeadTime} days lead</p>
                  </td>
                  <td className="px-3 py-2">
                    <p className="text-sm font-medium text-gray-900">{material.usagePerMonth} {material.unit}</p>
                    <p className="text-xs text-gray-600">MOQ: {material.minimumOrderQty}</p>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(material.status)}`}>
                      {material.status.toUpperCase()}
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
