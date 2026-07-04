'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Layers,
  TrendingUp,
  DollarSign,
  ArrowLeft,
  Search,
  Filter,
  Download,
  Package,
  Users,
  Building,
  PieChart,
  BarChart3
} from 'lucide-react'
import {
  estimationCostEstimateLiveService,
  CostEstimateRecord,
} from '@/services/estimation-cost-estimate-live.service'

interface CostBreakdown {
  id: string
  productCode: string
  productName: string
  category: string
  totalCost: number
  materialCost: number
  laborCost: number
  overheadCost: number
  materialPercent: number
  laborPercent: number
  overheadPercent: number
  unitsProduced: number
  costPerUnit: number
  sellingPrice: number
  profitMargin: number
  profitPercent: number
}

interface CostComponent {
  component: string
  amount: number
  percent: number
  items: number
}

export default function CostBreakdownPage() {
  const router = useRouter()

  const [costBreakdowns, setCostBreakdowns] = useState<CostBreakdown[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<CostBreakdown | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setIsLoading(true)
      setLoadError(null)
      try {
        // Map cost-estimate records to the page's per-product cost-breakdown shape.
        const raw = await estimationCostEstimateLiveService.getEstimates()
        const mapped: CostBreakdown[] = raw.map((e: CostEstimateRecord) => {
          const materialCost = Number(e.materialCost ?? 0)
          const laborCost = Number(e.laborCost ?? 0)
          const overheadCost = Number(e.overheadCost ?? 0)
          const totalCost = Number(
            e.totalCost ?? materialCost + laborCost + overheadCost,
          )
          const denom = materialCost + laborCost + overheadCost || 1
          const sellingPrice = Math.round(totalCost * 1.3)
          const profitMargin = sellingPrice - totalCost
          return {
            id: e.id,
            productCode: e.estimateNumber ?? e.id,
            productName: e.title ?? 'Untitled Estimate',
            category: e.estimateType ?? 'General',
            totalCost,
            materialCost,
            laborCost,
            overheadCost,
            materialPercent: (materialCost / denom) * 100,
            laborPercent: (laborCost / denom) * 100,
            overheadPercent: (overheadCost / denom) * 100,
            unitsProduced: Number(e.version ?? 1),
            costPerUnit: totalCost,
            sellingPrice,
            profitMargin,
            profitPercent: totalCost > 0 ? (profitMargin / totalCost) * 100 : 0,
          }
        })
        if (!cancelled) {
          setCostBreakdowns(mapped)
          setSelectedProduct(mapped[0] ?? null)
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(
            err instanceof Error ? err.message : 'Failed to load cost breakdowns',
          )
          setCostBreakdowns([])
          setSelectedProduct(null)
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

  const totalMaterialCost = costBreakdowns.reduce((sum, c) => sum + (c.materialCost * c.unitsProduced), 0)
  const totalLaborCost = costBreakdowns.reduce((sum, c) => sum + (c.laborCost * c.unitsProduced), 0)
  const totalOverheadCost = costBreakdowns.reduce((sum, c) => sum + (c.overheadCost * c.unitsProduced), 0)
  const grandTotalCost = totalMaterialCost + totalLaborCost + totalOverheadCost

  const avgMaterialPercent = (totalMaterialCost / grandTotalCost) * 100
  const avgLaborPercent = (totalLaborCost / grandTotalCost) * 100
  const avgOverheadPercent = (totalOverheadCost / grandTotalCost) * 100

  const costComponents: CostComponent[] = [
    { component: 'Material Costs', amount: totalMaterialCost, percent: avgMaterialPercent, items: costBreakdowns.length },
    { component: 'Labor Costs', amount: totalLaborCost, percent: avgLaborPercent, items: costBreakdowns.length },
    { component: 'Overhead Costs', amount: totalOverheadCost, percent: avgOverheadPercent, items: costBreakdowns.length }
  ]

  const avgProfitMargin = costBreakdowns.reduce((sum, c) => sum + c.profitPercent, 0) / costBreakdowns.length

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
            <h1 className="text-2xl font-bold text-gray-900">Cost Breakdown Analysis</h1>
            <p className="text-sm text-gray-600 mt-1">Detailed cost structure for kitchen products</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </button>
          <button className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {loadError && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {loadError}
        </div>
      )}
      {isLoading && (
        <div className="mb-3 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600">
          Loading cost breakdowns...
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-5 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Material Costs</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">₹{(totalMaterialCost / 10000000).toFixed(2)}Cr</p>
              <p className="text-xs text-blue-700 mt-1">{avgMaterialPercent.toFixed(1)}% of total</p>
            </div>
            <Package className="h-10 w-10 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-5 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Labor Costs</p>
              <p className="text-2xl font-bold text-green-900 mt-1">₹{(totalLaborCost / 10000000).toFixed(2)}Cr</p>
              <p className="text-xs text-green-700 mt-1">{avgLaborPercent.toFixed(1)}% of total</p>
            </div>
            <Users className="h-10 w-10 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-5 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Overhead Costs</p>
              <p className="text-2xl font-bold text-orange-900 mt-1">₹{(totalOverheadCost / 10000000).toFixed(2)}Cr</p>
              <p className="text-xs text-orange-700 mt-1">{avgOverheadPercent.toFixed(1)}% of total</p>
            </div>
            <Building className="h-10 w-10 text-orange-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-5 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Avg Profit Margin</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">{avgProfitMargin.toFixed(1)}%</p>
              <p className="text-xs text-purple-700 mt-1">Across all products</p>
            </div>
            <TrendingUp className="h-10 w-10 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-3">
        {/* Cost Component Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Cost Distribution</h2>
          </div>
          <div className="p-6">
            <div className="space-y-2">
              {costComponents.map((comp) => (
                <div key={comp.component} className="p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900 text-sm">{comp.component}</span>
                    <span className="text-sm font-bold text-gray-900">{comp.percent.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                    <div
                      className={`h-2.5 rounded-full ${
                        comp.component.includes('Material')
                          ? 'bg-blue-600'
                          : comp.component.includes('Labor')
                          ? 'bg-green-600'
                          : 'bg-orange-600'
                      }`}
                      style={{ width: `${comp.percent}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-600">₹{(comp.amount / 10000000).toFixed(2)} Cr total</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Selected Product Details */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Product Cost Details</h2>
            <p className="text-sm text-gray-600 mt-1">Click any product from the table below to view details</p>
          </div>
          <div className="p-6">
            {!selectedProduct ? (
              <div className="text-center py-10 text-sm text-gray-500">
                No product selected.
              </div>
            ) : (
            <>
            <div className="mb-2">
              <h3 className="font-semibold text-gray-900 text-lg">{selectedProduct.productName}</h3>
              <p className="text-sm text-gray-600 mt-1">{selectedProduct.productCode} - {selectedProduct.category}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-2">
              <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                <p className="text-xs text-gray-600 mb-1">Total Cost per Unit</p>
                <p className="text-2xl font-bold text-gray-900">₹{selectedProduct.costPerUnit.toLocaleString()}</p>
              </div>
              <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                <p className="text-xs text-green-600 mb-1">Selling Price</p>
                <p className="text-2xl font-bold text-green-900">₹{selectedProduct.sellingPrice.toLocaleString()}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-lg border border-blue-200 bg-blue-50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-blue-600" />
                    <span className="font-semibold text-blue-900 text-sm">Material Cost</span>
                  </div>
                  <span className="font-bold text-blue-900">₹{selectedProduct.materialCost.toLocaleString()}</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${selectedProduct.materialPercent}%` }} />
                </div>
                <p className="text-xs text-blue-700 mt-1">{selectedProduct.materialPercent.toFixed(1)}% of total cost</p>
              </div>

              <div className="p-4 rounded-lg border border-green-200 bg-green-50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-green-600" />
                    <span className="font-semibold text-green-900 text-sm">Labor Cost</span>
                  </div>
                  <span className="font-bold text-green-900">₹{selectedProduct.laborCost.toLocaleString()}</span>
                </div>
                <div className="w-full bg-green-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: `${selectedProduct.laborPercent}%` }} />
                </div>
                <p className="text-xs text-green-700 mt-1">{selectedProduct.laborPercent.toFixed(1)}% of total cost</p>
              </div>

              <div className="p-4 rounded-lg border border-orange-200 bg-orange-50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-orange-600" />
                    <span className="font-semibold text-orange-900 text-sm">Overhead Cost</span>
                  </div>
                  <span className="font-bold text-orange-900">₹{selectedProduct.overheadCost.toLocaleString()}</span>
                </div>
                <div className="w-full bg-orange-200 rounded-full h-2">
                  <div className="bg-orange-600 h-2 rounded-full" style={{ width: `${selectedProduct.overheadPercent}%` }} />
                </div>
                <p className="text-xs text-orange-700 mt-1">{selectedProduct.overheadPercent.toFixed(1)}% of total cost</p>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-lg border-2 border-purple-300 bg-purple-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Profit Margin</p>
                  <p className="text-xs text-purple-600 mt-1">{selectedProduct.unitsProduced} units produced</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-purple-900">₹{selectedProduct.profitMargin.toLocaleString()}</p>
                  <p className="text-sm font-semibold text-purple-700">{selectedProduct.profitPercent.toFixed(1)}%</p>
                </div>
              </div>
            </div>
            </>
            )}
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">All Products Cost Breakdown</h2>
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
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total Cost</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Material</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Labor</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Overhead</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Units</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Selling Price</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Profit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {costBreakdowns.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-3 py-8 text-center text-sm text-gray-500">
                    {isLoading ? 'Loading...' : 'No cost breakdowns found.'}
                  </td>
                </tr>
              )}
              {costBreakdowns.map((product) => (
                <tr
                  key={product.id}
                  onClick={() => setSelectedProduct(product)}
                  className={`hover:bg-gray-50 cursor-pointer ${
                    selectedProduct?.id === product.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <td className="px-3 py-2">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{product.productName}</p>
                      <p className="text-xs text-gray-600 mt-1">{product.productCode}</p>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <p className="text-sm font-bold text-gray-900">₹{product.totalCost.toLocaleString()}</p>
                  </td>
                  <td className="px-3 py-2">
                    <p className="text-sm font-medium text-blue-600">₹{product.materialCost.toLocaleString()}</p>
                    <p className="text-xs text-blue-600">{product.materialPercent.toFixed(1)}%</p>
                  </td>
                  <td className="px-3 py-2">
                    <p className="text-sm font-medium text-green-600">₹{product.laborCost.toLocaleString()}</p>
                    <p className="text-xs text-green-600">{product.laborPercent.toFixed(1)}%</p>
                  </td>
                  <td className="px-3 py-2">
                    <p className="text-sm font-medium text-orange-600">₹{product.overheadCost.toLocaleString()}</p>
                    <p className="text-xs text-orange-600">{product.overheadPercent.toFixed(1)}%</p>
                  </td>
                  <td className="px-3 py-2">
                    <p className="text-sm text-gray-900">{product.unitsProduced}</p>
                  </td>
                  <td className="px-3 py-2">
                    <p className="text-sm font-semibold text-gray-900">₹{product.sellingPrice.toLocaleString()}</p>
                  </td>
                  <td className="px-3 py-2">
                    <p className="text-sm font-semibold text-purple-600">₹{product.profitMargin.toLocaleString()}</p>
                    <p className="text-xs text-purple-600">{product.profitPercent.toFixed(1)}%</p>
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
