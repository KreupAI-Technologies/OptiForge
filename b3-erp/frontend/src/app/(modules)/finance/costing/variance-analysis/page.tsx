'use client'

import { useState, useEffect } from 'react'
import { FinanceService } from '@/services/finance.service'
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Package,
  Users,
  Settings,
  Calendar,
  FileText
} from 'lucide-react'

interface VarianceData {
  id: string
  productCode: string
  productName: string
  period: string
  quantityProduced: number
  standardCost: {
    material: number
    labor: number
    overhead: number
    total: number
  }
  actualCost: {
    material: number
    labor: number
    overhead: number
    total: number
  }
  variance: {
    material: number
    labor: number
    overhead: number
    total: number
  }
  variancePercent: {
    material: number
    labor: number
    overhead: number
    total: number
  }
}

const num = (v: any) => Number(v ?? 0)

const mapVariance = (r: any): VarianceData => {
  const totalMaterial = num(r?.totalMaterialVariance ?? num(r?.materialPriceVariance) + num(r?.materialQuantityVariance))
  const totalLabor = num(r?.totalLaborVariance ?? num(r?.laborRateVariance) + num(r?.laborEfficiencyVariance))
  const totalOverhead = num(r?.totalOverheadVariance ?? r?.overheadSpendingVariance)
  const totalVariance = num(r?.totalVariance ?? totalMaterial + totalLabor + totalOverhead)
  const standardTotal = num(r?.standardCost)
  const actualTotal = num(r?.actualCost)
  // Per-component standard/actual are not provided by the API; derive actual = standard + variance
  // and split standard total across components using variance shares only when available.
  const stdMaterial = standardTotal ? standardTotal - totalLabor - totalOverhead : 0
  const pct = (variance: number, base: number) => (base ? (variance / base) * 100 : 0)
  return {
    id: String(r?.id ?? ''),
    productCode: r?.varianceNumber ?? r?.productCode ?? '',
    productName: r?.productName ?? '',
    period: r?.analysisDate ?? '',
    quantityProduced: num(r?.quantityProduced),
    standardCost: {
      material: stdMaterial,
      labor: 0,
      overhead: 0,
      total: standardTotal
    },
    actualCost: {
      material: stdMaterial + totalMaterial,
      labor: totalLabor,
      overhead: totalOverhead,
      total: actualTotal || standardTotal + totalVariance
    },
    variance: {
      material: totalMaterial,
      labor: totalLabor,
      overhead: totalOverhead,
      total: totalVariance
    },
    variancePercent: {
      material: pct(totalMaterial, standardTotal),
      labor: pct(totalLabor, standardTotal),
      overhead: pct(totalOverhead, standardTotal),
      total: num(r?.variancePercentage ?? pct(totalVariance, standardTotal))
    }
  }
}

export default function VarianceAnalysisPage() {
  const [variances, setVariances] = useState<VarianceData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadVariances = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await FinanceService.getVarianceAnalysis()
      setVariances((Array.isArray(res) ? res : []).map(mapVariance))
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load variance analysis')
      setVariances([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadVariances()
  }, [])

  const handleDelete = async (id: string) => {
    try {
      await FinanceService.deleteVariance(id)
      await loadVariances()
    } catch (e: any) {
      setError(e?.message ?? 'Failed to delete variance')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(Math.abs(amount))
  }

  const getVarianceColor = (variance: number) => {
    if (variance > 0) return 'text-red-600' // Unfavorable
    if (variance < 0) return 'text-green-600' // Favorable
    return 'text-gray-600' // No variance
  }

  const getVarianceBgColor = (variance: number) => {
    if (variance > 0) return 'bg-red-50 border-red-200'
    if (variance < 0) return 'bg-green-50 border-green-200'
    return 'bg-gray-50 border-gray-200'
  }

  const getVarianceIcon = (variance: number) => {
    if (variance > 0) return <TrendingUp className="h-5 w-5 text-red-600" />
    if (variance < 0) return <TrendingDown className="h-5 w-5 text-green-600" />
    return <CheckCircle className="h-5 w-5 text-gray-600" />
  }

  // Calculate totals (fall back to per-record totals when quantity is unavailable)
  const totalStandard = variances.reduce((sum, v) => sum + (v.standardCost.total * (v.quantityProduced || 1)), 0)
  const totalActual = variances.reduce((sum, v) => sum + (v.actualCost.total * (v.quantityProduced || 1)), 0)
  const totalVariance = totalActual - totalStandard
  const totalVariancePercent = totalStandard ? ((totalVariance / totalStandard) * 100) : 0

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-orange-50 px-3 py-2">
      <div className="w-full space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Variance Analysis</h1>
            <p className="text-gray-600 mt-1">Standard vs Actual cost analysis and variance reporting</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all">
              <Calendar className="h-5 w-5" />
              October 2025
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg hover:from-red-700 hover:to-orange-700 transition-all shadow-md">
              <FileText className="h-5 w-5" />
              Generate Report
            </button>
          </div>
        </div>

        {loading && (
          <div className="text-sm text-gray-500">Loading variance analysis...</div>
        )}
        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{error}</div>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-5 border border-blue-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Standard Cost</p>
                <p className="text-2xl font-bold text-blue-900 mt-1">{formatCurrency(totalStandard)}</p>
                <p className="text-xs text-blue-700 mt-1">Budgeted</p>
              </div>
              <BarChart3 className="h-10 w-10 text-blue-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-5 border border-purple-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Total Actual Cost</p>
                <p className="text-2xl font-bold text-purple-900 mt-1">{formatCurrency(totalActual)}</p>
                <p className="text-xs text-purple-700 mt-1">Incurred</p>
              </div>
              <Settings className="h-10 w-10 text-purple-600" />
            </div>
          </div>

          <div className={`bg-gradient-to-br rounded-lg p-5 border shadow-sm ${
            totalVariance > 0 ? 'from-red-50 to-red-100 border-red-200' : 'from-green-50 to-green-100 border-green-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${totalVariance > 0 ? 'text-red-600' : 'text-green-600'}`}>Total Variance</p>
                <p className={`text-2xl font-bold mt-1 ${totalVariance > 0 ? 'text-red-900' : 'text-green-900'}`}>
                  {totalVariance > 0 ? '+' : ''}{formatCurrency(totalVariance)}
                </p>
                <p className={`text-xs mt-1 ${totalVariance > 0 ? 'text-red-700' : 'text-green-700'}`}>
                  {totalVariance > 0 ? 'Unfavorable' : 'Favorable'}
                </p>
              </div>
              {totalVariance > 0 ? (
                <AlertTriangle className="h-10 w-10 text-red-600" />
              ) : (
                <CheckCircle className="h-10 w-10 text-green-600" />
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-5 border border-orange-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Variance %</p>
                <p className="text-2xl font-bold text-orange-900 mt-1">{Math.abs(totalVariancePercent).toFixed(1)}%</p>
                <p className="text-xs text-orange-700 mt-1">Of standard cost</p>
              </div>
              <TrendingUp className="h-10 w-10 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Detailed Variance Analysis */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Product-wise Variance Analysis</h2>
          </div>
          <div className="p-6 space-y-3">
            {variances.map((variance) => (
              <div key={variance.id} className="border-2 border-gray-200 rounded-xl p-3 hover:shadow-lg transition-shadow">
                {/* Product Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                      <Package className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{variance.productName}</h3>
                      <p className="text-sm text-gray-600">{variance.productCode} • {variance.period}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Quantity Produced</p>
                    <p className="text-2xl font-bold text-gray-900">{variance.quantityProduced} units</p>
                    <button onClick={() => handleDelete(variance.id)} className="mt-1 text-xs text-red-600 hover:underline">
                      Delete
                    </button>
                  </div>
                </div>

                {/* Cost Comparison Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b-2 border-gray-200">
                      <tr>
                        <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">Cost Component</th>
                        <th className="px-3 py-2 text-right text-sm font-semibold text-gray-700">Standard (Per Unit)</th>
                        <th className="px-3 py-2 text-right text-sm font-semibold text-gray-700">Actual (Per Unit)</th>
                        <th className="px-3 py-2 text-right text-sm font-semibold text-gray-700">Variance</th>
                        <th className="px-3 py-2 text-right text-sm font-semibold text-gray-700">Variance %</th>
                        <th className="px-3 py-2 text-center text-sm font-semibold text-gray-700">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {/* Material Variance */}
                      <tr className="hover:bg-gray-50">
                        <td className="px-3 py-2 font-medium text-gray-900">Material Cost</td>
                        <td className="px-3 py-2 text-right text-gray-700">{formatCurrency(variance.standardCost.material)}</td>
                        <td className="px-3 py-2 text-right text-gray-700">{formatCurrency(variance.actualCost.material)}</td>
                        <td className={`px-3 py-2 text-right font-semibold ${getVarianceColor(variance.variance.material)}`}>
                          {variance.variance.material > 0 ? '+' : ''}{formatCurrency(variance.variance.material)}
                        </td>
                        <td className={`px-3 py-2 text-right font-semibold ${getVarianceColor(variance.variance.material)}`}>
                          {variance.variancePercent.material > 0 ? '+' : ''}{variance.variancePercent.material.toFixed(1)}%
                        </td>
                        <td className="px-3 py-2 text-center">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getVarianceBgColor(variance.variance.material)}`}>
                            {getVarianceIcon(variance.variance.material)}
                            {variance.variance.material > 0 ? 'Unfavorable' : variance.variance.material < 0 ? 'Favorable' : 'On Track'}
                          </span>
                        </td>
                      </tr>

                      {/* Labor Variance */}
                      <tr className="hover:bg-gray-50">
                        <td className="px-3 py-2 font-medium text-gray-900">Labor Cost</td>
                        <td className="px-3 py-2 text-right text-gray-700">{formatCurrency(variance.standardCost.labor)}</td>
                        <td className="px-3 py-2 text-right text-gray-700">{formatCurrency(variance.actualCost.labor)}</td>
                        <td className={`px-3 py-2 text-right font-semibold ${getVarianceColor(variance.variance.labor)}`}>
                          {variance.variance.labor > 0 ? '+' : ''}{formatCurrency(variance.variance.labor)}
                        </td>
                        <td className={`px-3 py-2 text-right font-semibold ${getVarianceColor(variance.variance.labor)}`}>
                          {variance.variancePercent.labor > 0 ? '+' : ''}{variance.variancePercent.labor.toFixed(1)}%
                        </td>
                        <td className="px-3 py-2 text-center">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getVarianceBgColor(variance.variance.labor)}`}>
                            {getVarianceIcon(variance.variance.labor)}
                            {variance.variance.labor > 0 ? 'Unfavorable' : variance.variance.labor < 0 ? 'Favorable' : 'On Track'}
                          </span>
                        </td>
                      </tr>

                      {/* Overhead Variance */}
                      <tr className="hover:bg-gray-50">
                        <td className="px-3 py-2 font-medium text-gray-900">Overhead Cost</td>
                        <td className="px-3 py-2 text-right text-gray-700">{formatCurrency(variance.standardCost.overhead)}</td>
                        <td className="px-3 py-2 text-right text-gray-700">{formatCurrency(variance.actualCost.overhead)}</td>
                        <td className={`px-3 py-2 text-right font-semibold ${getVarianceColor(variance.variance.overhead)}`}>
                          {variance.variance.overhead > 0 ? '+' : ''}{formatCurrency(variance.variance.overhead)}
                        </td>
                        <td className={`px-3 py-2 text-right font-semibold ${getVarianceColor(variance.variance.overhead)}`}>
                          {variance.variancePercent.overhead > 0 ? '+' : ''}{variance.variancePercent.overhead.toFixed(1)}%
                        </td>
                        <td className="px-3 py-2 text-center">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getVarianceBgColor(variance.variance.overhead)}`}>
                            {getVarianceIcon(variance.variance.overhead)}
                            {variance.variance.overhead > 0 ? 'Unfavorable' : variance.variance.overhead < 0 ? 'Favorable' : 'On Track'}
                          </span>
                        </td>
                      </tr>

                      {/* Total Variance */}
                      <tr className="bg-gray-100 font-semibold border-t-2 border-gray-300">
                        <td className="px-3 py-2 text-gray-900">Total Cost</td>
                        <td className="px-3 py-2 text-right text-gray-900">{formatCurrency(variance.standardCost.total)}</td>
                        <td className="px-3 py-2 text-right text-gray-900">{formatCurrency(variance.actualCost.total)}</td>
                        <td className={`px-3 py-2 text-right text-lg ${getVarianceColor(variance.variance.total)}`}>
                          {variance.variance.total > 0 ? '+' : ''}{formatCurrency(variance.variance.total)}
                        </td>
                        <td className={`px-3 py-2 text-right text-lg ${getVarianceColor(variance.variance.total)}`}>
                          {variance.variancePercent.total > 0 ? '+' : ''}{variance.variancePercent.total.toFixed(1)}%
                        </td>
                        <td className="px-3 py-2 text-center">
                          <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-semibold border ${getVarianceBgColor(variance.variance.total)}`}>
                            {getVarianceIcon(variance.variance.total)}
                            {variance.variance.total > 0 ? 'Unfavorable' : variance.variance.total < 0 ? 'Favorable' : 'On Track'}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
