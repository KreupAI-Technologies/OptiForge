'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Package,
  ArrowLeft,
  Download,
  RefreshCw,
  Target
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import {
  productionVarianceService,
  type ProductionVariance,
} from '@/services/production/production-variance.service'

const COMPANY_ID = process.env.NEXT_PUBLIC_COMPANY_ID || 'default-company-id'

interface VarianceSummary {
  totalVariances: number
  favorableVariances: number
  unfavorableVariances: number
  totalVarianceAmount: number
  costVariance: number
  scheduleVariance: number
  quantityVariance: number
  qualityVariance: number
}

interface CostVariance {
  id: string
  category: string
  workOrder: string
  product: string
  standardCost: number
  actualCost: number
  variance: number
  variancePercent: number
  status: 'favorable' | 'unfavorable' | 'critical'
  reason: string
  action: string
}

interface ScheduleVariance {
  id: string
  workOrder: string
  product: string
  plannedStartDate: string
  actualStartDate: string
  plannedEndDate: string
  actualEndDate: string
  plannedDuration: number
  actualDuration: number
  varianceDays: number
  status: 'on-time' | 'delayed' | 'early' | 'critical'
  impactCost: number
}

interface QuantityVariance {
  id: string
  workOrder: string
  product: string
  plannedQuantity: number
  actualQuantity: number
  variance: number
  variancePercent: number
  yieldRate: number
  scrapRate: number
  status: 'favorable' | 'unfavorable'
  reason: string
}

interface QualityVariance {
  id: string
  product: string
  inspectionDate: string
  plannedQualityRate: number
  actualQualityRate: number
  variance: number
  defectCount: number
  rejectionRate: number
  reworkCost: number
  status: 'acceptable' | 'warning' | 'critical'
}

export default function VarianceAnalytics() {
  const router = useRouter()

  const DEFAULT_SUMMARY: VarianceSummary = {
    totalVariances: 42,
    favorableVariances: 18,
    unfavorableVariances: 24,
    totalVarianceAmount: -3450000,
    costVariance: -1850000,
    scheduleVariance: -980000,
    quantityVariance: -420000,
    qualityVariance: -200000
  }

  const [summary, setSummary] = useState<VarianceSummary>(DEFAULT_SUMMARY)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const DEFAULT_COST_VARIANCES: CostVariance[] = [
    {
      id: 'CV-001',
      category: 'Material Cost',
      workOrder: 'WO-2025-1234',
      product: 'Premium Kitchen Sink - Double Bowl',
      standardCost: 8500,
      actualCost: 9200,
      variance: -700,
      variancePercent: -8.2,
      status: 'unfavorable',
      reason: 'Stainless steel price increase',
      action: 'Negotiate with alternate suppliers'
    },
    {
      id: 'CV-002',
      category: 'Labor Cost',
      workOrder: 'WO-2025-1235',
      product: 'Kitchen Faucet - Touchless',
      standardCost: 2400,
      actualCost: 2100,
      variance: 300,
      variancePercent: 12.5,
      status: 'favorable',
      reason: 'Efficient assembly process',
      action: 'Document best practices'
    },
    {
      id: 'CV-003',
      category: 'Overhead Cost',
      workOrder: 'WO-2025-1236',
      product: 'Non-Stick Cookware Set',
      standardCost: 5200,
      actualCost: 6100,
      variance: -900,
      variancePercent: -17.3,
      status: 'critical',
      reason: 'Excessive energy consumption',
      action: 'Equipment maintenance required'
    },
    {
      id: 'CV-004',
      category: 'Material Cost',
      workOrder: 'WO-2025-1237',
      product: 'Modular Kitchen Cabinet',
      standardCost: 32000,
      actualCost: 30800,
      variance: 1200,
      variancePercent: 3.8,
      status: 'favorable',
      reason: 'Bulk purchase discount',
      action: 'Continue bulk ordering strategy'
    },
    {
      id: 'CV-005',
      category: 'Labor Cost',
      workOrder: 'WO-2025-1238',
      product: 'Smart Dishwasher',
      standardCost: 8900,
      actualCost: 10200,
      variance: -1300,
      variancePercent: -14.6,
      status: 'critical',
      reason: 'Overtime due to delays',
      action: 'Review production schedule'
    },
    {
      id: 'CV-006',
      category: 'Material Cost',
      workOrder: 'WO-2025-1239',
      product: 'Kitchen Storage Rack',
      standardCost: 1800,
      actualCost: 1650,
      variance: 150,
      variancePercent: 8.3,
      status: 'favorable',
      reason: 'Alternative material used',
      action: 'Update standard cost'
    }
  ]

  const [costVariances, setCostVariances] = useState<CostVariance[]>(DEFAULT_COST_VARIANCES)

  const mapToCostVariance = useCallback((v: ProductionVariance): CostVariance => ({
    id: v.id,
    category: v.subCategory || 'Cost',
    workOrder: v.workOrder || '—',
    product: v.product || '—',
    standardCost: Number(v.plannedValue) || 0,
    actualCost: Number(v.actualValue) || 0,
    variance: Number(v.variance) || 0,
    variancePercent: Number(v.variancePercent) || 0,
    status:
      v.status === 'favorable' || v.status === 'unfavorable' || v.status === 'critical'
        ? v.status
        : (Number(v.variance) || 0) >= 0
          ? 'favorable'
          : 'unfavorable',
    reason: v.reason || '',
    action: v.action || '',
  }), [])

  const loadVariances = useCallback(async () => {
    setIsLoading(true)
    setLoadError(null)
    try {
      const [summaryData, costRows] = await Promise.all([
        productionVarianceService.getSummary(COMPANY_ID),
        productionVarianceService.getVariances({ companyId: COMPANY_ID, category: 'cost' }),
      ])
      if (summaryData && typeof summaryData.totalVariances === 'number') {
        setSummary(summaryData)
      }
      const rows = Array.isArray(costRows) ? costRows : []
      if (rows.length > 0) {
        setCostVariances(rows.map(mapToCostVariance))
      }
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load variance data')
      // Keep default (seed-like) data visible on failure.
    } finally {
      setIsLoading(false)
    }
  }, [mapToCostVariance])

  useEffect(() => {
    loadVariances()
  }, [loadVariances])

  const [scheduleVariances] = useState<ScheduleVariance[]>([
    {
      id: 'SV-001',
      workOrder: 'WO-2025-1234',
      product: 'Premium Kitchen Sink - Double Bowl',
      plannedStartDate: '2025-10-01',
      actualStartDate: '2025-10-03',
      plannedEndDate: '2025-10-15',
      actualEndDate: '2025-10-18',
      plannedDuration: 14,
      actualDuration: 15,
      varianceDays: -3,
      status: 'delayed',
      impactCost: -285000
    },
    {
      id: 'SV-002',
      workOrder: 'WO-2025-1235',
      product: 'Kitchen Faucet - Touchless',
      plannedStartDate: '2025-10-05',
      actualStartDate: '2025-10-05',
      plannedEndDate: '2025-10-12',
      actualEndDate: '2025-10-11',
      plannedDuration: 7,
      actualDuration: 6,
      varianceDays: 1,
      status: 'early',
      impactCost: 95000
    },
    {
      id: 'SV-003',
      workOrder: 'WO-2025-1236',
      product: 'Non-Stick Cookware Set',
      plannedStartDate: '2025-10-08',
      actualStartDate: '2025-10-12',
      plannedEndDate: '2025-10-20',
      actualEndDate: '2025-10-28',
      plannedDuration: 12,
      actualDuration: 16,
      varianceDays: -8,
      status: 'critical',
      impactCost: -640000
    },
    {
      id: 'SV-004',
      workOrder: 'WO-2025-1237',
      product: 'Modular Kitchen Cabinet',
      plannedStartDate: '2025-10-10',
      actualStartDate: '2025-10-10',
      plannedEndDate: '2025-10-25',
      actualEndDate: '2025-10-25',
      plannedDuration: 15,
      actualDuration: 15,
      varianceDays: 0,
      status: 'on-time',
      impactCost: 0
    },
    {
      id: 'SV-005',
      workOrder: 'WO-2025-1238',
      product: 'Smart Dishwasher',
      plannedStartDate: '2025-10-12',
      actualStartDate: '2025-10-14',
      plannedEndDate: '2025-10-26',
      actualEndDate: '2025-10-30',
      plannedDuration: 14,
      actualDuration: 16,
      varianceDays: -4,
      status: 'delayed',
      impactCost: -420000
    }
  ])

  const [quantityVariances] = useState<QuantityVariance[]>([
    {
      id: 'QV-001',
      workOrder: 'WO-2025-1234',
      product: 'Premium Kitchen Sink - Double Bowl',
      plannedQuantity: 500,
      actualQuantity: 485,
      variance: -15,
      variancePercent: -3.0,
      yieldRate: 97.0,
      scrapRate: 3.0,
      status: 'unfavorable',
      reason: 'Material defects in batch'
    },
    {
      id: 'QV-002',
      workOrder: 'WO-2025-1235',
      product: 'Kitchen Faucet - Touchless',
      plannedQuantity: 800,
      actualQuantity: 815,
      variance: 15,
      variancePercent: 1.9,
      yieldRate: 101.9,
      scrapRate: 1.2,
      status: 'favorable',
      reason: 'Process improvement'
    },
    {
      id: 'QV-003',
      workOrder: 'WO-2025-1236',
      product: 'Non-Stick Cookware Set',
      plannedQuantity: 600,
      actualQuantity: 568,
      variance: -32,
      variancePercent: -5.3,
      yieldRate: 94.7,
      scrapRate: 5.3,
      status: 'unfavorable',
      reason: 'Coating quality issues'
    },
    {
      id: 'QV-004',
      workOrder: 'WO-2025-1237',
      product: 'Modular Kitchen Cabinet',
      plannedQuantity: 200,
      actualQuantity: 198,
      variance: -2,
      variancePercent: -1.0,
      yieldRate: 99.0,
      scrapRate: 1.0,
      status: 'unfavorable',
      reason: 'Minor finishing issues'
    },
    {
      id: 'QV-005',
      workOrder: 'WO-2025-1238',
      product: 'Smart Dishwasher',
      plannedQuantity: 300,
      actualQuantity: 295,
      variance: -5,
      variancePercent: -1.7,
      yieldRate: 98.3,
      scrapRate: 1.7,
      status: 'unfavorable',
      reason: 'Electronic component failures'
    }
  ])

  const [qualityVariances] = useState<QualityVariance[]>([
    {
      id: 'QTV-001',
      product: 'Premium Kitchen Sink - Double Bowl',
      inspectionDate: '2025-10-18',
      plannedQualityRate: 98.5,
      actualQualityRate: 96.2,
      variance: -2.3,
      defectCount: 19,
      rejectionRate: 3.8,
      reworkCost: 47500,
      status: 'warning'
    },
    {
      id: 'QTV-002',
      product: 'Kitchen Faucet - Touchless',
      inspectionDate: '2025-10-16',
      plannedQualityRate: 99.0,
      actualQualityRate: 99.2,
      variance: 0.2,
      defectCount: 7,
      rejectionRate: 0.8,
      reworkCost: 8400,
      status: 'acceptable'
    },
    {
      id: 'QTV-003',
      product: 'Non-Stick Cookware Set',
      inspectionDate: '2025-10-19',
      plannedQualityRate: 97.5,
      actualQualityRate: 92.8,
      variance: -4.7,
      defectCount: 41,
      rejectionRate: 7.2,
      reworkCost: 123000,
      status: 'critical'
    },
    {
      id: 'QTV-004',
      product: 'Modular Kitchen Cabinet',
      inspectionDate: '2025-10-17',
      plannedQualityRate: 98.0,
      actualQualityRate: 97.5,
      variance: -0.5,
      defectCount: 5,
      rejectionRate: 2.5,
      reworkCost: 62500,
      status: 'acceptable'
    },
    {
      id: 'QTV-005',
      product: 'Smart Dishwasher',
      inspectionDate: '2025-10-20',
      plannedQualityRate: 99.5,
      actualQualityRate: 96.8,
      variance: -2.7,
      defectCount: 10,
      rejectionRate: 3.2,
      reworkCost: 96000,
      status: 'warning'
    }
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'favorable':
      case 'early':
      case 'on-time':
      case 'acceptable':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'unfavorable':
      case 'delayed':
      case 'warning':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'critical':
        return 'bg-red-100 text-red-700 border-red-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getVarianceColor = (variance: number) => {
    if (variance > 0) return 'text-green-600'
    if (variance < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  return (
    <div className="w-full h-full px-4 py-2">
      {/* Inline Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Variance Analysis</h1>
            <p className="text-sm text-gray-600 mt-1">Track planned vs actual performance</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadVariances}
            disabled={isLoading}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export Report</span>
          </button>
        </div>
      </div>

      {loadError && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800">
          <AlertCircle className="h-4 w-4" />
          <span>Live variance data unavailable ({loadError}). Showing reference figures.</span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-5 border border-blue-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Variances</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{summary.totalVariances}</p>
              <p className="text-xs text-blue-700 mt-1">
                {summary.favorableVariances} favorable | {summary.unfavorableVariances} unfavorable
              </p>
            </div>
            <Target className="h-10 w-10 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-5 border border-red-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Cost Variance</p>
              <p className="text-2xl font-bold text-red-900 mt-1">
                ₹{(Math.abs(summary.costVariance) / 100000).toFixed(1)}L
              </p>
              <p className="text-xs text-red-700 mt-1 flex items-center gap-1">
                <TrendingDown className="h-3 w-3" />
                Unfavorable
              </p>
            </div>
            <DollarSign className="h-10 w-10 text-red-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-5 border border-orange-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Schedule Variance</p>
              <p className="text-2xl font-bold text-orange-900 mt-1">
                ₹{(Math.abs(summary.scheduleVariance) / 100000).toFixed(1)}L
              </p>
              <p className="text-xs text-orange-700 mt-1">Time-related costs</p>
            </div>
            <Clock className="h-10 w-10 text-orange-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-5 border border-purple-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Quantity Variance</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">
                ₹{(Math.abs(summary.quantityVariance) / 100000).toFixed(1)}L
              </p>
              <p className="text-xs text-purple-700 mt-1">Output differences</p>
            </div>
            <Package className="h-10 w-10 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Cost Variance Analysis */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-3">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Cost Variance Analysis</h2>
          <p className="text-sm text-gray-600 mt-1">Standard vs actual cost comparison</p>
        </div>
        <div className="p-6">
          <div className="space-y-2">
            {costVariances.map((variance) => (
              <div key={variance.id} className="p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{variance.product}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(variance.status)}`}>
                        {variance.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">{variance.workOrder} | {variance.category}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-xl font-bold ${getVarianceColor(variance.variance)}`}>
                      {variance.variance >= 0 ? '+' : ''}₹{variance.variance.toLocaleString()}
                    </p>
                    <p className={`text-xs font-semibold ${getVarianceColor(variance.variance)}`}>
                      {variance.variancePercent >= 0 ? '+' : ''}{variance.variancePercent}%
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                  <div>
                    <p className="text-xs text-gray-600">Standard Cost</p>
                    <p className="font-semibold text-gray-900">₹{variance.standardCost.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Actual Cost</p>
                    <p className="font-semibold text-gray-900">₹{variance.actualCost.toLocaleString()}</p>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-3 space-y-2">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-600 font-medium">Reason</p>
                      <p className="text-xs text-gray-900">{variance.reason}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-600 font-medium">Action</p>
                      <p className="text-xs text-gray-900">{variance.action}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Schedule Variance Analysis */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-3">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Schedule Variance Analysis</h2>
          <p className="text-sm text-gray-600 mt-1">Planned vs actual timeline comparison</p>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Work Order</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Product</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Planned (days)</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Actual (days)</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Variance</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Impact</th>
                </tr>
              </thead>
              <tbody>
                {scheduleVariances.map((variance) => (
                  <tr key={variance.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4 text-sm font-medium text-gray-900">{variance.workOrder}</td>
                    <td className="py-4 px-4 text-sm text-gray-900">{variance.product}</td>
                    <td className="py-4 px-4 text-sm text-gray-900 text-right">{variance.plannedDuration}</td>
                    <td className="py-4 px-4 text-sm text-gray-900 text-right">{variance.actualDuration}</td>
                    <td className="py-4 px-4 text-right">
                      <span className={`font-semibold ${getVarianceColor(variance.varianceDays)}`}>
                        {variance.varianceDays >= 0 ? '+' : ''}{variance.varianceDays}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(variance.status)}`}>
                        {variance.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className={`font-semibold ${getVarianceColor(variance.impactCost)}`}>
                        {variance.impactCost >= 0 ? '+' : ''}₹{(Math.abs(variance.impactCost) / 1000).toFixed(0)}K
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Quantity & Quality Variances */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Quantity Variance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Quantity Variance</h2>
            <p className="text-sm text-gray-600 mt-1">Yield analysis</p>
          </div>
          <div className="p-6">
            <div className="space-y-2">
              {quantityVariances.map((variance) => (
                <div key={variance.id} className="p-4 rounded-lg border border-gray-200">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm text-gray-900">{variance.product}</h4>
                      <p className="text-xs text-gray-600">{variance.workOrder}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(variance.status)}`}>
                      {variance.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs mb-2">
                    <div>
                      <p className="text-gray-600">Planned</p>
                      <p className="font-semibold text-gray-900">{variance.plannedQuantity}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Actual</p>
                      <p className="font-semibold text-gray-900">{variance.actualQuantity}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className={`font-semibold ${getVarianceColor(variance.variance)}`}>
                      {variance.variance >= 0 ? '+' : ''}{variance.variance} units ({variance.variancePercent}%)
                    </span>
                    <span className="text-gray-600">Yield: {variance.yieldRate}%</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-2 italic">{variance.reason}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quality Variance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Quality Variance</h2>
            <p className="text-sm text-gray-600 mt-1">Quality rate analysis</p>
          </div>
          <div className="p-6">
            <div className="space-y-2">
              {qualityVariances.map((variance) => (
                <div key={variance.id} className="p-4 rounded-lg border border-gray-200">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm text-gray-900">{variance.product}</h4>
                      <p className="text-xs text-gray-600">{variance.inspectionDate}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(variance.status)}`}>
                      {variance.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs mb-2">
                    <div>
                      <p className="text-gray-600">Target Quality</p>
                      <p className="font-semibold text-gray-900">{variance.plannedQualityRate}%</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Actual Quality</p>
                      <p className="font-semibold text-gray-900">{variance.actualQualityRate}%</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs border-t border-gray-200 pt-2">
                    <div>
                      <p className="text-gray-600">Defects</p>
                      <p className="font-semibold text-red-600">{variance.defectCount}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Rejection</p>
                      <p className="font-semibold text-gray-900">{variance.rejectionRate}%</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Rework Cost</p>
                      <p className="font-semibold text-gray-900">₹{(variance.reworkCost / 1000).toFixed(0)}K</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
