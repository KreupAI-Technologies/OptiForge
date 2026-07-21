'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { estimationPricingService } from '@/services/estimation-pricing.service'
import {
  Percent,
  TrendingUp,
  Target,
  DollarSign,
  ArrowLeft,
  Search,
  Filter,
  Download,
  Calculator,
  Edit2,
  Save,
  Trash2
} from 'lucide-react'

const companyId = 'default-company-id'

interface MarkupRule {
  id: string
  ruleCode: string
  ruleName: string
  category: string
  subcategory: string
  costBasis: 'direct-cost' | 'full-cost' | 'variable-cost'
  markupPercent: number
  minimumPrice?: number
  maximumPrice?: number
  applicableRange: string
  priority: number
  status: 'active' | 'inactive'
  products: number
  avgSellingPrice: number
  avgMargin: number
}

interface CategoryMarkup {
  category: string
  defaultMarkup: number
  minMarkup: number
  maxMarkup: number
  products: number
  avgActualMarkup: number
}

export default function PricingMarkupPage() {
  const router = useRouter()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState<number>(0)
  const [markupRules, setMarkupRules] = useState<MarkupRule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const loadRules = async () => {
    setIsLoading(true)
    setLoadError(null)
    try {
      // Backend returns raw MarkupRule[]; map to the page's MarkupRule view model.
      const res = await estimationPricingService.findAllMarkupRules(companyId)
      const raw = (Array.isArray(res) ? res : []) as any[]
      const mapped: MarkupRule[] = raw.map((r, i) => ({
        id: r.id,
        ruleCode: r.code ?? `MU-${i + 1}`,
        ruleName: r.name ?? '',
        category: r.applyTo ?? '',
        subcategory: '',
        costBasis: 'full-cost',
        markupPercent: Number(r.markupPercentage ?? 0),
        minimumPrice: r.minAmount != null ? Number(r.minAmount) : undefined,
        maximumPrice: r.maxAmount != null ? Number(r.maxAmount) : undefined,
        applicableRange: r.description ?? '',
        priority: Number(r.priority ?? 0),
        status: r.isActive === false ? 'inactive' : 'active',
        products: 0,
        avgSellingPrice: 0,
        avgMargin: 0,
      }))
      setMarkupRules(mapped)
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load markup rules')
      setMarkupRules([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadRules()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const startEdit = (rule: MarkupRule) => {
    setEditingId(rule.id)
    setEditValue(rule.markupPercent)
  }

  const saveEdit = async (id: string) => {
    try {
      await estimationPricingService.updateMarkupRule(companyId, id, {
        markupPercentage: editValue,
      } as any)
      setMarkupRules((prev) =>
        prev.map((r) => (r.id === id ? { ...r, markupPercent: editValue } : r)),
      )
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to update markup rule')
    } finally {
      setEditingId(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this markup rule?')) return
    try {
      await estimationPricingService.deleteMarkupRule(companyId, id)
      setMarkupRules((prev) => prev.filter((r) => r.id !== id))
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to delete markup rule')
    }
  }

  // Client-side filter over the loaded rows driven by the search box.
  const filteredRules = useMemo(() => {
    const q = searchTerm.trim().toLowerCase()
    if (!q) return markupRules
    return markupRules.filter(
      (r) =>
        r.ruleName.toLowerCase().includes(q) ||
        r.ruleCode.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q),
    )
  }, [markupRules, searchTerm])

  const handleExport = () => {
    const headers = ['Rule Code', 'Rule Name', 'Category', 'Markup %', 'Priority', 'Status']
    const rows = filteredRules.map((r) => [
      r.ruleCode,
      r.ruleName,
      r.category,
      r.markupPercent.toFixed(1),
      r.priority,
      r.status,
    ])
    const csv = [headers, ...rows]
      .map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `markup-rules-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }


  const categoryMarkups: CategoryMarkup[] = [
    { category: 'Kitchen Sinks', defaultMarkup: 50.0, minMarkup: 45.0, maxMarkup: 55.0, products: 13, avgActualMarkup: 49.8 },
    { category: 'Kitchen Faucets', defaultMarkup: 52.5, minMarkup: 48.0, maxMarkup: 58.0, products: 18, avgActualMarkup: 52.3 },
    { category: 'Cookware', defaultMarkup: 55.5, minMarkup: 50.0, maxMarkup: 60.0, products: 25, avgActualMarkup: 55.7 },
    { category: 'Kitchen Appliances', defaultMarkup: 54.0, minMarkup: 50.0, maxMarkup: 60.0, products: 13, avgActualMarkup: 54.2 },
    { category: 'Kitchen Cabinets', defaultMarkup: 45.0, minMarkup: 40.0, maxMarkup: 50.0, products: 22, avgActualMarkup: 44.9 },
    { category: 'Countertops', defaultMarkup: 47.5, minMarkup: 45.0, maxMarkup: 52.0, products: 14, avgActualMarkup: 47.4 },
    { category: 'Kitchen Accessories', defaultMarkup: 51.5, minMarkup: 45.0, maxMarkup: 60.0, products: 18, avgActualMarkup: 50.8 }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'inactive':
        return 'bg-gray-100 text-gray-700 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getCostBasisColor = (basis: string) => {
    switch (basis) {
      case 'full-cost':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'direct-cost':
        return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'variable-cost':
        return 'bg-orange-100 text-orange-700 border-orange-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const totalProducts = markupRules.reduce((sum, r) => sum + r.products, 0)
  const avgMarkup = markupRules.length > 0 ? markupRules.reduce((sum, r) => sum + r.markupPercent, 0) / markupRules.length : 0
  const activeRules = markupRules.filter(r => r.status === 'active').length

  return (
    <div className="w-full h-full px-4 py-2">
      {/* Header */}
      <div className="mb-3 flex items-center justify-end gap-3">
        <button
          onClick={() => router.push('/estimation/pricing/add')}
          className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
        >
          <Calculator className="h-4 w-4" />
          Calculator
        </button>
        <button
          onClick={loadRules}
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

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading markup rules…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {loadError}
        </div>
      )}
      {!isLoading && !loadError && markupRules.length === 0 && (
        <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          No markup rules found.
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-5 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Active Rules</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{activeRules}</p>
              <p className="text-xs text-blue-700 mt-1">Total {markupRules.length} rules</p>
            </div>
            <Target className="h-10 w-10 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-5 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Avg Markup</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{avgMarkup.toFixed(1)}%</p>
              <p className="text-xs text-green-700 mt-1">Across all rules</p>
            </div>
            <Percent className="h-10 w-10 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-5 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Products Covered</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">{totalProducts}</p>
              <p className="text-xs text-purple-700 mt-1">Unique products</p>
            </div>
            <DollarSign className="h-10 w-10 text-purple-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-5 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Categories</p>
              <p className="text-2xl font-bold text-orange-900 mt-1">{categoryMarkups.length}</p>
              <p className="text-xs text-orange-700 mt-1">Product categories</p>
            </div>
            <TrendingUp className="h-10 w-10 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Category Markup Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-3">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Category Markup Guidelines</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {categoryMarkups.map((cat) => (
              <div key={cat.category} className="p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 text-sm">{cat.category}</p>
                    <p className="text-xs text-gray-600 mt-1">{cat.products} products</p>
                  </div>
                  <Calculator className="h-5 w-5 text-gray-400" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Default:</span>
                    <span className="font-semibold text-gray-900">{cat.defaultMarkup.toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Range:</span>
                    <span className="font-medium text-gray-900">{cat.minMarkup}% - {cat.maxMarkup}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${(cat.avgActualMarkup / cat.maxMarkup) * 100}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Actual Avg:</span>
                    <span className="font-semibold text-green-600">{cat.avgActualMarkup.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Markup Rules Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Markup Rules</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search rules..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Rule</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cost Basis</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Markup %</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price Range</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Products</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Avg Results</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRules.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-3 py-8 text-center text-sm text-gray-500">
                    {isLoading ? 'Loading...' : 'No markup rules found.'}
                  </td>
                </tr>
              )}
              {filteredRules.map((rule) => (
                <tr key={rule.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{rule.ruleName}</p>
                      <p className="text-xs text-gray-600 mt-1">{rule.ruleCode} - {rule.subcategory}</p>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <p className="text-sm text-gray-900">{rule.category}</p>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getCostBasisColor(rule.costBasis)}`}>
                      {rule.costBasis.toUpperCase().replace('-', ' ')}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    {editingId === rule.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(Number(e.target.value))}
                          className="w-20 px-2 py-1 border border-blue-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          step="0.1"
                        />
                        <span className="text-sm text-gray-600">%</span>
                      </div>
                    ) : (
                      <p className="text-sm font-bold text-green-600">{rule.markupPercent.toFixed(1)}%</p>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <p className="text-sm text-gray-900">
                      ₹{(rule.minimumPrice! / 1000).toFixed(0)}K - ₹{(rule.maximumPrice! / 1000).toFixed(0)}K
                    </p>
                  </td>
                  <td className="px-3 py-2">
                    <p className="text-sm font-medium text-gray-900">{rule.products}</p>
                    <p className="text-xs text-gray-600">products</p>
                  </td>
                  <td className="px-3 py-2">
                    <p className="text-sm text-gray-900">₹{(rule.avgSellingPrice / 1000).toFixed(1)}K</p>
                    <p className="text-xs text-green-600">{rule.avgMargin.toFixed(1)}% margin</p>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(rule.status)}`}>
                      {rule.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1">
                      {editingId === rule.id ? (
                        <button
                          onClick={() => saveEdit(rule.id)}
                          className="p-1 text-green-600 hover:bg-green-50 rounded"
                        >
                          <Save className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => startEdit(rule)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(rule.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
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
