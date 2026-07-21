'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Activity,
  TrendingUp,
  Clock,
  Download,
  Filter,
  Target,
  Award,
  Calendar,
  Users,
  DollarSign,
  CheckCircle,
  Percent,
  BarChart3
} from 'lucide-react'
import { ClickableTableRow } from '@/components/reports/ClickableTableRow'
import {
  estimationAnalyticsService,
  EstimatorPerformance as EstimatorPerformanceApi
} from '@/services/estimation-analytics.service'

interface EstimatorPerformance {
  name: string
  totalEstimates: number
  won: number
  pending: number
  winRate: number
  avgTurnaround: number
  totalValue: number
  avgValue: number
  accuracy: number
  productivity: number
}

interface CategoryMetrics {
  category: string
  count: number
  value: number
  avgTime: number
  winRate: number
}

const companyId = 'default-company-id'

export default function EstimationAnalyticsPerformancePage() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [apiPerformance, setApiPerformance] = useState<EstimatorPerformanceApi[]>([])

  const loadPerformance = async () => {
    setLoading(true)
    try {
      const now = new Date()
      const data = await estimationAnalyticsService.getAllEstimatorsPerformance(
        companyId,
        now.getFullYear(),
        now.getMonth() + 1
      )
      setApiPerformance(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error('Failed to load estimator performance', e)
      setApiPerformance([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPerformance()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const estimatorPerformance: EstimatorPerformance[] = apiPerformance.map((p) => {
    const won = p.wonEstimates ?? 0
    const lost = p.lostEstimates ?? 0
    const total = p.totalEstimates ?? 0
    return {
      name: p.estimatorName,
      totalEstimates: total,
      won,
      pending: Math.max(total - won - lost, 0),
      winRate: p.winRate ?? 0,
      avgTurnaround: p.averageTurnaroundDays ?? 0,
      totalValue: p.totalEstimatedValue ?? 0,
      avgValue: total > 0 ? (p.totalEstimatedValue ?? 0) / total : 0,
      accuracy: p.averageAccuracy ?? 0,
      productivity: Math.round(p.averageAccuracy ?? 0)
    }
  })

  // No category breakdown from this endpoint; render empty-state.
  const categoryMetrics: CategoryMetrics[] = []

  const getPerformanceColor = (value: number, type: 'winRate' | 'accuracy' | 'productivity') => {
    if (type === 'winRate') {
      if (value >= 75) return 'text-green-600'
      if (value >= 65) return 'text-blue-600'
      if (value >= 55) return 'text-yellow-600'
      return 'text-red-600'
    }
    if (type === 'accuracy' || type === 'productivity') {
      if (value >= 90) return 'text-green-600'
      if (value >= 80) return 'text-blue-600'
      if (value >= 70) return 'text-yellow-600'
      return 'text-red-600'
    }
    return 'text-gray-600'
  }

  const estimatorCount = estimatorPerformance.length
  const totalEstimates = estimatorPerformance.reduce((sum, e) => sum + e.totalEstimates, 0)
  const totalValue = estimatorPerformance.reduce((sum, e) => sum + e.totalValue, 0)
  const avgWinRate = (
    estimatorCount > 0
      ? estimatorPerformance.reduce((sum, e) => sum + e.winRate, 0) / estimatorCount
      : 0
  ).toFixed(1)
  const avgAccuracy = (
    estimatorCount > 0
      ? estimatorPerformance.reduce((sum, e) => sum + e.accuracy, 0) / estimatorCount
      : 0
  ).toFixed(1)

  const handleExport = () => {
    const headers = [
      'Estimator',
      'Total Estimates',
      'Won',
      'Pending',
      'Win Rate %',
      'Avg Turnaround (days)',
      'Total Value',
      'Accuracy %',
    ]
    const rows = estimatorPerformance.map((e) => [
      e.name,
      e.totalEstimates,
      e.won,
      e.pending,
      e.winRate.toFixed(1),
      e.avgTurnaround.toFixed(1),
      e.totalValue,
      e.accuracy.toFixed(1),
    ])
    const csv = [headers, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `estimator-performance-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="w-full h-full px-4 py-2 flex items-center justify-center">
        <p className="text-sm text-gray-500">Loading estimator performance...</p>
      </div>
    )
  }

  return (
    <div className="w-full h-full px-4 py-2">
      {/* Action Buttons */}
      <div className="mb-3 flex justify-end">
        <div className="flex items-center gap-3">
          <button
            onClick={loadPerformance}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filter
          </button>
          <button
            onClick={loadPerformance}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            Date Range
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

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-5 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Estimates</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{totalEstimates}</p>
              <p className="text-xs text-blue-700 mt-1">All estimators</p>
            </div>
            <BarChart3 className="h-10 w-10 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-5 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Total Value</p>
              <p className="text-2xl font-bold text-green-900 mt-1">₹{(totalValue / 10000000).toFixed(1)}Cr</p>
              <p className="text-xs text-green-700 mt-1">Pipeline created</p>
            </div>
            <DollarSign className="h-10 w-10 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-5 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Avg Win Rate</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">{avgWinRate}%</p>
              <p className="text-xs text-purple-700 mt-1">Team average</p>
            </div>
            <Target className="h-10 w-10 text-purple-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-5 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Avg Accuracy</p>
              <p className="text-2xl font-bold text-orange-900 mt-1">{avgAccuracy}%</p>
              <p className="text-xs text-orange-700 mt-1">Team average</p>
            </div>
            <CheckCircle className="h-10 w-10 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Estimator Performance Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-3 overflow-hidden">
        <div className="px-3 py-2 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Estimator Performance</h2>
          <p className="text-sm text-gray-600 mt-1">Individual performance metrics and KPIs</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estimator
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Estimates
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Won
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pending
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Win Rate
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Turnaround
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Value
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Accuracy
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Productivity
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {estimatorPerformance.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-6 text-center text-sm text-gray-500">
                    No estimator performance data available
                  </td>
                </tr>
              )}
              {estimatorPerformance.map((estimator) => (
                <ClickableTableRow
                  key={estimator.name}
                  onClick={() => router.push(`/estimation?estimator=${encodeURIComponent(estimator.name)}`)}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{estimator.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <span className="text-sm font-semibold text-gray-900">{estimator.totalEstimates}</span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <span className="text-sm font-semibold text-green-600">{estimator.won}</span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <span className="text-sm text-yellow-600">{estimator.pending}</span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span className={`text-sm font-bold ${getPerformanceColor(estimator.winRate, 'winRate')}`}>
                        {estimator.winRate.toFixed(1)}%
                      </span>
                      {estimator.winRate >= 75 && <TrendingUp className="h-4 w-4 text-green-600" />}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-900">{estimator.avgTurnaround.toFixed(1)} days</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-semibold text-gray-900">
                      ₹{(estimator.totalValue / 10000000).toFixed(2)}Cr
                    </div>
                    <div className="text-xs text-gray-500">Avg: ₹{(estimator.avgValue / 100000).toFixed(1)}L</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <span className={`text-sm font-bold ${getPerformanceColor(estimator.accuracy, 'accuracy')}`}>
                      {estimator.accuracy.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center">
                      <div className="w-20">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${estimator.productivity >= 90
                              ? 'bg-green-600'
                              : estimator.productivity >= 80
                                ? 'bg-blue-600'
                                : 'bg-yellow-600'
                              }`}
                            style={{ width: `${estimator.productivity}%` }}
                          ></div>
                        </div>
                      </div>
                      <span className={`ml-2 text-sm font-semibold ${getPerformanceColor(estimator.productivity, 'productivity')}`}>
                        {estimator.productivity}%
                      </span>
                    </div>
                  </td>
                </ClickableTableRow>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Category Performance */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-3 py-2 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Category Performance</h2>
          <p className="text-sm text-gray-600 mt-1">Performance metrics by kitchen category</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Count
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Value
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Value
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Time
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Win Rate
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categoryMetrics.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-sm text-gray-500">
                    No category performance data available
                  </td>
                </tr>
              )}
              {categoryMetrics.map((category) => (
                <ClickableTableRow
                  key={category.category}
                  onClick={() => router.push(`/estimation?category=${encodeURIComponent(category.category)}`)}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{category.category}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <span className="text-sm font-semibold text-gray-900">{category.count}</span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-semibold text-gray-900">
                      ₹{(category.value / 10000000).toFixed(2)}Cr
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right">
                    <div className="text-sm text-gray-900">₹{(category.value / category.count / 100000).toFixed(1)}L</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-900">{category.avgTime.toFixed(1)} days</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <span className={`text-sm font-bold ${getPerformanceColor(category.winRate, 'winRate')}`}>
                      {category.winRate.toFixed(1)}%
                    </span>
                  </td>
                </ClickableTableRow>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
