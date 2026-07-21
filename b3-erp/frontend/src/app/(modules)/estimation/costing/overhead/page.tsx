'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Building,
  Zap,
  Wrench,
  TrendingUp,
  DollarSign,
  ArrowLeft,
  Search,
  Filter,
  Download,
  PieChart,
  Factory,
  Truck,
  AlertCircle
} from 'lucide-react'
import { estimationOverheadCostService } from '@/services/estimation-overhead-cost.service'

interface OverheadCost {
  id: string
  costCode: string
  costName: string
  category: string
  subcategory: string
  allocationBasis: string
  budgetedAmount: number
  actualAmount: number
  variance: number
  variancePercent: number
  allocationRate: number
  applicableTo: string[]
  status: 'within-budget' | 'over-budget' | 'under-budget'
}

interface CategoryTotal {
  category: string
  budgeted: number
  actual: number
  variance: number
  variancePercent: number
  items: number
}

export default function OverheadCostingPage() {
  const router = useRouter()

  const [overheadCosts, setOverheadCosts] = useState<OverheadCost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const load = async () => {
    setIsLoading(true)
    setLoadError(null)
    try {
      // Backend returns raw ORM shape (decimals as strings). Map onto the
      // page's OverheadCost; page-only fields are defaulted. The annual
      // amount is treated as the budgeted/actual figure the table displays.
      const raw = (await estimationOverheadCostService.getCosts()) as any[]
      const statusMap: Record<string, OverheadCost['status']> = {
        'within-budget': 'within-budget',
        'over-budget': 'over-budget',
        'under-budget': 'under-budget',
      }
      const mapped: OverheadCost[] = raw.map((c) => {
        const amount = Number(c.annualAmount ?? 0)
        return {
          id: String(c.id),
          costCode: '',
          costName: c.name ?? '',
          category: c.category ?? '',
          subcategory: c.costType ?? '',
          allocationBasis: c.allocationMethod ?? '',
          budgetedAmount: amount,
          actualAmount: amount,
          variance: 0,
          variancePercent: 0,
          allocationRate: Number(c.allocationRate ?? 0),
          applicableTo: [],
          status: statusMap[String(c.status ?? '').toLowerCase()] ?? 'within-budget',
        }
      })
      setOverheadCosts(mapped)
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load overhead costs')
      setOverheadCosts([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filteredOverheadCosts = overheadCosts.filter((c) => {
    const q = searchTerm.trim().toLowerCase()
    if (!q) return true
    return (
      c.costName.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q) ||
      c.subcategory.toLowerCase().includes(q) ||
      c.allocationBasis.toLowerCase().includes(q)
    )
  })

  const handleExport = () => {
    const headers = ['Cost Name', 'Category', 'Subcategory', 'Allocation Basis', 'Budgeted', 'Actual', 'Variance', 'Allocation Rate', 'Status']
    const rows = filteredOverheadCosts.map((c) => [
      c.costName,
      c.category,
      c.subcategory,
      c.allocationBasis,
      c.budgetedAmount,
      c.actualAmount,
      c.variance,
      c.allocationRate,
      c.status,
    ])
    const csv = [headers, ...rows]
      .map((r) => r.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'overhead-costs.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  // Aggregate category totals from the fetched overhead costs.
  const categoryTotals: CategoryTotal[] = (() => {
    const byCat = new Map<string, OverheadCost[]>()
    overheadCosts.forEach((c) => {
      const key = c.category || 'Uncategorized'
      if (!byCat.has(key)) byCat.set(key, [])
      byCat.get(key)!.push(c)
    })
    return Array.from(byCat.entries()).map(([category, rows]) => {
      const budgeted = rows.reduce((s, r) => s + r.budgetedAmount, 0)
      const actual = rows.reduce((s, r) => s + r.actualAmount, 0)
      const variance = actual - budgeted
      const variancePercent = budgeted ? (variance / budgeted) * 100 : 0
      return { category, budgeted, actual, variance, variancePercent, items: rows.length }
    })
  })()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'within-budget':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'over-budget':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'under-budget':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getVarianceColor = (variance: number) => {
    if (variance > 0) return 'text-red-600'
    if (variance < 0) return 'text-green-600'
    return 'text-gray-600'
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Utilities':
        return <Zap className="h-5 w-5 text-yellow-600" />
      case 'Facility':
        return <Building className="h-5 w-5 text-blue-600" />
      case 'Maintenance':
        return <Wrench className="h-5 w-5 text-orange-600" />
      case 'Warehousing':
        return <Truck className="h-5 w-5 text-purple-600" />
      default:
        return <Factory className="h-5 w-5 text-gray-600" />
    }
  }

  const totalBudgeted = overheadCosts.reduce((sum, c) => sum + c.budgetedAmount, 0)
  const totalActual = overheadCosts.reduce((sum, c) => sum + c.actualAmount, 0)
  const totalVariance = totalActual - totalBudgeted
  const totalVariancePercent = totalBudgeted ? (totalVariance / totalBudgeted) * 100 : 0

  const overBudgetCount = overheadCosts.filter(c => c.status === 'over-budget').length
  const withinBudgetCount = overheadCosts.filter(c => c.status === 'within-budget').length

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
            <h1 className="text-2xl font-bold text-gray-900">Overhead Costing</h1>
            <p className="text-sm text-gray-600 mt-1">Track and allocate manufacturing overhead costs</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => document.getElementById('overhead-search')?.focus()}
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
          Loading overhead costs…
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
              <p className="text-sm font-medium text-blue-600">Budgeted Overhead</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">₹{(totalBudgeted / 10000000).toFixed(2)}Cr</p>
              <p className="text-xs text-blue-700 mt-1">Annual budget</p>
            </div>
            <PieChart className="h-10 w-10 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-5 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Actual Overhead</p>
              <p className="text-2xl font-bold text-green-900 mt-1">₹{(totalActual / 10000000).toFixed(2)}Cr</p>
              <p className="text-xs text-green-700 mt-1">Current period</p>
            </div>
            <DollarSign className="h-10 w-10 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-5 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Variance</p>
              <p className={`text-2xl font-bold mt-1 ${getVarianceColor(totalVariance)}`}>
                {totalVariance > 0 ? '+' : ''}₹{(Math.abs(totalVariance) / 100000).toFixed(1)}L
              </p>
              <p className="text-xs text-orange-700 mt-1">{totalVariancePercent > 0 ? '+' : ''}{totalVariancePercent.toFixed(1)}%</p>
            </div>
            <TrendingUp className="h-10 w-10 text-orange-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-5 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Over Budget Items</p>
              <p className="text-2xl font-bold text-red-900 mt-1">{overBudgetCount}</p>
              <p className="text-xs text-red-700 mt-1">{withinBudgetCount} within budget</p>
            </div>
            <Building className="h-10 w-10 text-red-600" />
          </div>
        </div>
      </div>

      {/* Category Totals */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-3">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Overhead by Category</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {categoryTotals.map((cat) => (
              <div key={cat.category} className="p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2 flex-1">
                    {getCategoryIcon(cat.category)}
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{cat.category}</p>
                      <p className="text-xs text-gray-600 mt-1">{cat.items} cost {cat.items === 1 ? 'item' : 'items'}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Budgeted:</span>
                    <span className="font-semibold text-gray-900">₹{(cat.budgeted / 100000).toFixed(1)}L</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Actual:</span>
                    <span className="font-semibold text-gray-900">₹{(cat.actual / 100000).toFixed(1)}L</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Variance:</span>
                    <span className={`font-semibold ${getVarianceColor(cat.variance)}`}>
                      {cat.variance > 0 ? '+' : ''}₹{(Math.abs(cat.variance) / 1000).toFixed(0)}K ({cat.variancePercent > 0 ? '+' : ''}{cat.variancePercent.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Overhead Details Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Overhead Cost Details</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                id="overhead-search"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search overhead costs..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cost Item</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Allocation Basis</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Budgeted</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actual</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Variance</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Rate</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOverheadCosts.map((cost) => (
                <tr key={cost.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{cost.costName}</p>
                      <p className="text-xs text-gray-600 mt-1">{cost.costCode} - {cost.subcategory}</p>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <p className="text-sm text-gray-900">{cost.category}</p>
                  </td>
                  <td className="px-3 py-2">
                    <p className="text-sm text-gray-900">{cost.allocationBasis}</p>
                  </td>
                  <td className="px-3 py-2">
                    <p className="text-sm font-medium text-gray-900">₹{(cost.budgetedAmount / 1000).toFixed(0)}K</p>
                  </td>
                  <td className="px-3 py-2">
                    <p className="text-sm font-medium text-gray-900">₹{(cost.actualAmount / 1000).toFixed(0)}K</p>
                  </td>
                  <td className="px-3 py-2">
                    <div>
                      <p className={`text-sm font-semibold ${getVarianceColor(cost.variance)}`}>
                        {cost.variance > 0 ? '+' : ''}₹{(Math.abs(cost.variance) / 1000).toFixed(0)}K
                      </p>
                      <p className={`text-xs ${getVarianceColor(cost.variance)}`}>
                        {cost.variancePercent > 0 ? '+' : ''}{cost.variancePercent.toFixed(1)}%
                      </p>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <p className="text-sm font-medium text-gray-900">₹{cost.allocationRate}</p>
                    <p className="text-xs text-gray-600">per unit</p>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(cost.status)}`}>
                      {cost.status.toUpperCase().replace('-', ' ')}
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
