'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  TrendingUp,
  TrendingDown,
  Download,
  Filter,
  Target,
  Award,
  XCircle,
  DollarSign,
  Calendar,
  Users,
  Percent,
  BarChart3
} from 'lucide-react'
import { estimationAnalyticsService, WinLossAnalysis } from '@/services/estimation-analytics.service'

interface WinLossData {
  category: string
  totalEstimates: number
  won: number
  lost: number
  pending: number
  winRate: number
  avgWinValue: number
  avgLossValue: number
  totalWonValue: number
  totalLostValue: number
}

interface LossReason {
  reason: string
  count: number
  percentage: number
  avgValue: number
}

const companyId = 'default-company-id'

export default function EstimationAnalyticsWinLossPage() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [analysis, setAnalysis] = useState<WinLossAnalysis | null>(null)

  const loadAnalysis = async () => {
    setLoading(true)
    try {
      const now = new Date()
      const toDate = now.toISOString().split('T')[0]
      const from = new Date(now)
      from.setFullYear(from.getFullYear() - 1)
      const fromDate = from.toISOString().split('T')[0]
      const data = await estimationAnalyticsService.getWinLossAnalysis(companyId, fromDate, toDate)
      setAnalysis(data ?? null)
    } catch (e) {
      console.error('Failed to load win/loss analysis', e)
      setAnalysis(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAnalysis()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Derive per-category rows from byCustomer (fallback byEstimator); guard empties.
  const byCustomer = Array.isArray(analysis?.byCustomer) ? analysis!.byCustomer : []
  const byEstimator = Array.isArray(analysis?.byEstimator) ? analysis!.byEstimator : []
  const categorySource = byCustomer.length > 0 ? byCustomer : byEstimator
  const winLossData: WinLossData[] = categorySource.map((c: any) => {
    const won = c.won ?? 0
    const lost = c.lost ?? 0
    return {
      category: c.customerName ?? c.estimatorName ?? 'Unknown',
      totalEstimates: won + lost,
      won,
      lost,
      pending: 0,
      winRate: c.winRate ?? 0,
      avgWinValue: 0,
      avgLossValue: 0,
      totalWonValue: 0,
      totalLostValue: 0
    }
  })

  // Top loss reasons from analysis.byReason; compute percentage from counts.
  const byReason = Array.isArray(analysis?.byReason) ? analysis!.byReason : []
  const totalReasonCount = byReason.reduce((sum, r) => sum + (r.count ?? 0), 0)
  const lossReasons: LossReason[] = byReason.map((r) => ({
    reason: r.reason,
    count: r.count ?? 0,
    percentage: totalReasonCount > 0 ? ((r.count ?? 0) / totalReasonCount) * 100 : 0,
    avgValue: 0
  }))

  // Win rate trends from analysis.trend.
  const trend = Array.isArray(analysis?.trend) ? analysis!.trend : []

  const getWinRateColor = (rate: number) => {
    if (rate >= 75) return 'text-green-600'
    if (rate >= 65) return 'text-blue-600'
    if (rate >= 55) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getWinRateBgColor = (rate: number) => {
    if (rate >= 75) return 'bg-green-100 border-green-200'
    if (rate >= 65) return 'bg-blue-100 border-blue-200'
    if (rate >= 55) return 'bg-yellow-100 border-yellow-200'
    return 'bg-red-100 border-red-200'
  }

  const totalEstimates = analysis?.totalEstimates ?? 0
  const totalWon = analysis?.won ?? 0
  const totalLost = analysis?.lost ?? 0
  const totalPending = analysis?.pending ?? 0
  const overallWinRate = (analysis?.winRate ?? 0).toFixed(1)
  const totalWonValue = analysis?.totalWonValue ?? 0
  const totalLostValue = Math.max((analysis?.totalEstimatedValue ?? 0) - (analysis?.totalWonValue ?? 0), 0)

  const handleExport = () => {
    const headers = ['Category', 'Total', 'Won', 'Lost', 'Pending', 'Win Rate %']
    const rows = winLossData.map((d) => [
      d.category,
      d.totalEstimates,
      d.won,
      d.lost,
      d.pending,
      d.winRate.toFixed(1),
    ])
    const csv = [headers, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `win-loss-analysis-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="w-full h-full px-4 py-2 flex items-center justify-center">
        <p className="text-sm text-gray-500">Loading win/loss analysis...</p>
      </div>
    )
  }

  return (
    <div className="w-full h-full px-4 py-2">
      {/* Action Buttons */}
      <div className="mb-3 flex justify-end">
        <div className="flex items-center gap-3">
          <button
            onClick={loadAnalysis}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filter
          </button>
          <button
            onClick={loadAnalysis}
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
              <p className="text-xs text-blue-700 mt-1">All categories</p>
            </div>
            <BarChart3 className="h-10 w-10 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-5 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Won</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{totalWon}</p>
              <p className="text-xs text-green-700 mt-1">₹{(totalWonValue / 10000000).toFixed(1)}Cr value</p>
            </div>
            <Award className="h-10 w-10 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-5 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Lost</p>
              <p className="text-2xl font-bold text-red-900 mt-1">{totalLost}</p>
              <p className="text-xs text-red-700 mt-1">₹{(totalLostValue / 10000000).toFixed(1)}Cr value</p>
            </div>
            <XCircle className="h-10 w-10 text-red-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-5 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Win Rate</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">{overallWinRate}%</p>
              <p className="text-xs text-purple-700 mt-1">Overall success</p>
            </div>
            <Target className="h-10 w-10 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Win/Loss by Category */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-3">
        <div className="px-3 py-2 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Win/Loss Analysis by Category</h2>
          <p className="text-sm text-gray-600 mt-1">Performance metrics across kitchen categories</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Won
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lost
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pending
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Win Rate
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Won Value
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lost Value
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {winLossData.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-sm text-gray-500">
                    No category data available
                  </td>
                </tr>
              )}
              {winLossData.map((data) => (
                <tr key={data.category} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{data.category}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <span className="text-sm font-semibold text-gray-900">{data.totalEstimates}</span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <div className="flex flex-col items-center">
                      <span className="text-sm font-semibold text-green-600">{data.won}</span>
                      <span className="text-xs text-gray-500">₹{(data.totalWonValue / 10000000).toFixed(1)}Cr</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <div className="flex flex-col items-center">
                      <span className="text-sm font-semibold text-red-600">{data.lost}</span>
                      <span className="text-xs text-gray-500">₹{(data.totalLostValue / 10000000).toFixed(1)}Cr</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <span className="text-sm text-yellow-600">{data.pending}</span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span className={`text-sm font-bold ${getWinRateColor(data.winRate)}`}>
                        {data.winRate.toFixed(1)}%
                      </span>
                      {data.winRate >= 70 ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-semibold text-gray-900">
                      ₹{(data.totalWonValue / 10000000).toFixed(2)}Cr
                    </div>
                    <div className="text-xs text-gray-500">Avg: ₹{(data.avgWinValue / 100000).toFixed(1)}L</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-semibold text-gray-900">
                      ₹{(data.totalLostValue / 10000000).toFixed(2)}Cr
                    </div>
                    <div className="text-xs text-gray-500">Avg: ₹{(data.avgLossValue / 100000).toFixed(1)}L</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Loss Reasons Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-3 py-2 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Top Loss Reasons</h2>
            <p className="text-sm text-gray-600 mt-1">Why estimates were not converted</p>
          </div>
          <div className="p-6">
            <div className="space-y-2">
              {lossReasons.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No loss reasons recorded</p>
              )}
              {lossReasons.map((reason, index) => (
                <div key={reason.reason} className="flex items-center gap-2">
                  <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-red-600">{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">{reason.reason}</span>
                      <span className="text-sm font-semibold text-red-600">{reason.count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-600 h-2 rounded-full"
                        style={{ width: `${reason.percentage}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-500">{reason.percentage.toFixed(1)}% of losses</span>
                      {reason.avgValue > 0 && (
                        <span className="text-xs text-gray-500">Avg: ₹{(reason.avgValue / 100000).toFixed(1)}L</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-3 py-2 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Win Rate Trends</h2>
            <p className="text-sm text-gray-600 mt-1">Monthly performance over time</p>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {trend.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No trend data available</p>
              )}
              {trend.map((point) => {
                const rate = point.winRate ?? 0
                return (
                  <div key={point.month} className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700 w-32">{point.month}</span>
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full ${
                            rate >= 70 ? 'bg-green-600' : rate >= 60 ? 'bg-blue-600' : 'bg-yellow-600'
                          }`}
                          style={{ width: `${rate}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className={`text-sm font-bold w-16 text-right ${getWinRateColor(rate)}`}>
                      {rate.toFixed(1)}%
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
