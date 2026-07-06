'use client'

import { useState, useEffect } from 'react'
import { FinanceService } from '@/services/finance.service'
import {
  Calculator,
  Package,
  TrendingUp,
  AlertCircle,
  FileText,
  Edit,
  Eye,
  CheckCircle,
  Clock,
  ArrowUpRight,
  Layers
} from 'lucide-react'

interface BreakdownItem {
  description: string
  quantity: number
  rate: number
  amount: number
  uom: string
}

interface StandardCost {
  id: string
  productCode: string
  productName: string
  category: string
  version: string
  effectiveDate: string
  expiryDate: string | null
  status: 'active' | 'draft' | 'expired' | 'superseded'
  materialCost: number
  laborCost: number
  overheadCost: number
  totalCost: number
  uom: string
  lastUpdated: string
  updatedBy: string
  materialItems: BreakdownItem[]
  laborItems: BreakdownItem[]
  overheadItems: BreakdownItem[]
}

interface CostBreakdown {
  category: string
  items: BreakdownItem[]
}

const mapBreakdown = (arr: any[]): BreakdownItem[] =>
  (Array.isArray(arr) ? arr : []).map((c: any) => ({
    description: c?.description ?? c?.name ?? c?.componentName ?? '',
    quantity: Number(c?.quantity ?? c?.qty ?? 0),
    rate: Number(c?.rate ?? c?.unitRate ?? c?.unitCost ?? 0),
    amount: Number(c?.amount ?? c?.cost ?? c?.totalCost ?? 0),
    uom: c?.uom ?? c?.unit ?? ''
  }))

const mapStandardCost = (r: any): StandardCost => {
  const materialCost = Number(r?.materialCost ?? 0)
  const laborCost = Number(r?.laborCost ?? 0)
  const overheadCost = Number(r?.overheadCost ?? 0)
  const otherCost = Number(r?.otherCost ?? 0)
  const totalCost = Number(r?.totalStandardCost ?? materialCost + laborCost + overheadCost + otherCost)
  return {
    id: String(r?.id ?? ''),
    productCode: r?.productCode ?? '',
    productName: r?.productName ?? '',
    category: r?.category ?? 'Finished Goods',
    version: r?.version ?? '',
    effectiveDate: r?.effectiveFromDate ?? r?.effectiveDate ?? '',
    expiryDate: r?.expiryDate ?? null,
    status: r?.isActive === false ? 'expired' : (r?.status ?? 'active'),
    materialCost,
    laborCost,
    overheadCost,
    totalCost,
    uom: r?.uom ?? 'Each',
    lastUpdated: r?.updatedAt ?? r?.effectiveFromDate ?? '',
    updatedBy: r?.updatedBy ?? '',
    materialItems: mapBreakdown(r?.materialComponents),
    laborItems: mapBreakdown(r?.laborComponents),
    overheadItems: mapBreakdown(r?.overheadComponents)
  }
}

export default function StandardCostingPage() {
  const [standardCosts, setStandardCosts] = useState<StandardCost[]>([])
  const [selectedCost, setSelectedCost] = useState<StandardCost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadStandardCosts = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await FinanceService.getStandardCosts()
      const mapped = (Array.isArray(res) ? res : []).map(mapStandardCost)
      setStandardCosts(mapped)
      setSelectedCost((prev) =>
        prev ? mapped.find((c) => c.id === prev.id) ?? mapped[0] ?? null : mapped[0] ?? null
      )
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load standard costs')
      setStandardCosts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStandardCosts()
  }, [])

  const materialBreakdown: CostBreakdown = {
    category: 'Materials',
    items: selectedCost?.materialItems ?? []
  }

  const laborBreakdown: CostBreakdown = {
    category: 'Labor',
    items: selectedCost?.laborItems ?? []
  }

  const overheadBreakdown: CostBreakdown = {
    category: 'Overheads',
    items: selectedCost?.overheadItems ?? []
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const handleCreate = async () => {
    try {
      await FinanceService.createStandardCost({ companyId: 'default-company-id' })
      await loadStandardCosts()
    } catch (e: any) {
      setError(e?.message ?? 'Failed to create standard cost')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await FinanceService.deleteStandardCost(id)
      await loadStandardCosts()
    } catch (e: any) {
      setError(e?.message ?? 'Failed to delete standard cost')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'draft':
        return 'bg-gray-100 text-gray-700 border-gray-200'
      case 'expired':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'superseded':
        return 'bg-orange-100 text-orange-700 border-orange-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const totalMaterial =
    materialBreakdown.items.reduce((sum, item) => sum + item.amount, 0) ||
    (selectedCost?.materialCost ?? 0)
  const totalLabor =
    laborBreakdown.items.reduce((sum, item) => sum + item.amount, 0) ||
    (selectedCost?.laborCost ?? 0)
  const totalOverhead =
    overheadBreakdown.items.reduce((sum, item) => sum + item.amount, 0) ||
    (selectedCost?.overheadCost ?? 0)
  const grandTotal = selectedCost?.totalCost ?? totalMaterial + totalLabor + totalOverhead

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 px-3 py-2">
      <div className="w-full space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Standard Costing</h1>
            <p className="text-gray-600 mt-1">Define and manage standard costs for products</p>
          </div>
          <button onClick={handleCreate} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-md">
            <Calculator className="h-5 w-5" />
            New Standard Cost
          </button>
        </div>

        {loading && (
          <div className="text-sm text-gray-500">Loading standard costs...</div>
        )}
        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{error}</div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-5 border border-blue-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Active Standards</p>
                <p className="text-2xl font-bold text-blue-900 mt-1">{standardCosts.filter(c => c.status === 'active').length}</p>
                <p className="text-xs text-blue-700 mt-1">Products</p>
              </div>
              <CheckCircle className="h-10 w-10 text-blue-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-5 border border-green-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Avg Material Cost</p>
                <p className="text-2xl font-bold text-green-900 mt-1">
                  {formatCurrency(
                    standardCosts.filter(c => c.status === 'active').length > 0
                      ? standardCosts.filter(c => c.status === 'active').reduce((sum, c) => sum + c.materialCost, 0) / standardCosts.filter(c => c.status === 'active').length
                      : 0
                  )}
                </p>
                <p className="text-xs text-green-700 mt-1">Per unit</p>
              </div>
              <Package className="h-10 w-10 text-green-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-5 border border-purple-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Draft Standards</p>
                <p className="text-2xl font-bold text-purple-900 mt-1">{standardCosts.filter(c => c.status === 'draft').length}</p>
                <p className="text-xs text-purple-700 mt-1">Pending approval</p>
              </div>
              <Clock className="h-10 w-10 text-purple-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-5 border border-orange-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Expired</p>
                <p className="text-2xl font-bold text-orange-900 mt-1">{standardCosts.filter(c => c.status === 'expired').length}</p>
                <p className="text-xs text-orange-700 mt-1">Need update</p>
              </div>
              <AlertCircle className="h-10 w-10 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Standard Costs List */}
          <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Standard Costs</h2>
            </div>
            <div className="p-4 max-h-[600px] overflow-y-auto">
              <div className="space-y-3">
                {standardCosts.map((cost) => (
                  <div
                    key={cost.id}
                    onClick={() => setSelectedCost(cost)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedCost?.id === cost.id
                        ? 'border-purple-500 bg-purple-50 shadow-md'
                        : 'border-gray-200 hover:border-purple-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">{cost.productName}</p>
                        <p className="text-sm text-gray-600 mt-1">{cost.productCode}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(cost.status)}`}>
                        {cost.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Cost:</span>
                        <span className="font-semibold text-gray-900">{formatCurrency(cost.totalCost)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Version: {cost.version}</span>
                        <span className="text-gray-500">{cost.effectiveDate}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Cost Breakdown Details */}
          <div className="lg:col-span-2 space-y-3">
            {selectedCost && (
              <>
                {/* Header Card */}
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-3 text-white shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h2 className="text-2xl font-bold">{selectedCost.productName}</h2>
                      <p className="text-purple-100 mt-1">{selectedCost.productCode} • Version {selectedCost.version}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="inline-flex items-center gap-1.5 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm">
                        <Eye className="h-5 w-5" />
                        <span>View</span>
                      </button>
                      <button className="inline-flex items-center gap-1.5 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm">
                        <Edit className="h-5 w-5" />
                        <span>Edit</span>
                      </button>
                      <button onClick={() => handleDelete(selectedCost.id)} className="inline-flex items-center gap-1.5 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm">
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <p className="text-purple-200 text-sm">Material Cost</p>
                      <p className="text-2xl font-bold mt-1">{formatCurrency(selectedCost.materialCost)}</p>
                    </div>
                    <div>
                      <p className="text-purple-200 text-sm">Labor Cost</p>
                      <p className="text-2xl font-bold mt-1">{formatCurrency(selectedCost.laborCost)}</p>
                    </div>
                    <div>
                      <p className="text-purple-200 text-sm">Overhead Cost</p>
                      <p className="text-2xl font-bold mt-1">{formatCurrency(selectedCost.overheadCost)}</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-purple-400/30">
                    <div className="flex items-center justify-between">
                      <span className="text-purple-100">Total Standard Cost</span>
                      <span className="text-3xl font-bold">{formatCurrency(selectedCost.totalCost)}</span>
                    </div>
                  </div>
                </div>

                {/* Detailed Breakdown */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Cost Breakdown</h3>
                  </div>
                  <div className="p-6 space-y-3">
                    {/* Material Breakdown */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                          <Package className="h-5 w-5 text-green-600" />
                          Materials
                        </h4>
                        <span className="font-bold text-green-600">{formatCurrency(totalMaterial)}</span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                              <th className="px-4 py-2 text-left font-medium text-gray-600">Description</th>
                              <th className="px-4 py-2 text-right font-medium text-gray-600">Qty</th>
                              <th className="px-4 py-2 text-right font-medium text-gray-600">Rate</th>
                              <th className="px-4 py-2 text-right font-medium text-gray-600">Amount</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {materialBreakdown.items.map((item, index) => (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="px-4 py-2 text-gray-900">{item.description}</td>
                                <td className="px-4 py-2 text-right text-gray-600">{item.quantity} {item.uom}</td>
                                <td className="px-4 py-2 text-right text-gray-600">{formatCurrency(item.rate)}</td>
                                <td className="px-4 py-2 text-right font-medium text-gray-900">{formatCurrency(item.amount)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Labor Breakdown */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                          <Layers className="h-5 w-5 text-blue-600" />
                          Labor
                        </h4>
                        <span className="font-bold text-blue-600">{formatCurrency(totalLabor)}</span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                              <th className="px-4 py-2 text-left font-medium text-gray-600">Description</th>
                              <th className="px-4 py-2 text-right font-medium text-gray-600">Hours</th>
                              <th className="px-4 py-2 text-right font-medium text-gray-600">Rate</th>
                              <th className="px-4 py-2 text-right font-medium text-gray-600">Amount</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {laborBreakdown.items.map((item, index) => (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="px-4 py-2 text-gray-900">{item.description}</td>
                                <td className="px-4 py-2 text-right text-gray-600">{item.quantity} {item.uom}</td>
                                <td className="px-4 py-2 text-right text-gray-600">{formatCurrency(item.rate)}</td>
                                <td className="px-4 py-2 text-right font-medium text-gray-900">{formatCurrency(item.amount)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Overhead Breakdown */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 text-purple-600" />
                          Overheads
                        </h4>
                        <span className="font-bold text-purple-600">{formatCurrency(totalOverhead)}</span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                              <th className="px-4 py-2 text-left font-medium text-gray-600">Description</th>
                              <th className="px-4 py-2 text-right font-medium text-gray-600">Amount</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {overheadBreakdown.items.map((item, index) => (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="px-4 py-2 text-gray-900">{item.description}</td>
                                <td className="px-4 py-2 text-right font-medium text-gray-900">{formatCurrency(item.amount)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Grand Total */}
                    <div className="pt-4 border-t-2 border-gray-300">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-gray-900">Total Standard Cost</span>
                        <span className="text-2xl font-bold text-purple-600">{formatCurrency(grandTotal)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
