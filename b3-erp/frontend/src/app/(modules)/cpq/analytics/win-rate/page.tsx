'use client'

import { useEffect, useState } from 'react'
import {
  TrendingUp,
  TrendingDown,
  Target,
  XCircle,
  CheckCircle,
  AlertTriangle,
  Users,
  Package,
  MapPin,
  Download,
  Filter,
  Loader2
} from 'lucide-react'
import { cpqAnalyticsService, type WinRateDashboard } from '@/services/cpq/cpq-analytics.service'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts'
import { useRouter } from 'next/navigation'
import { ClickableTableRow } from '@/components/reports/ClickableTableRow'

const LOSS_COLORS = ['#ef4444', '#f59e0b', '#6b7280', '#8b5cf6', '#3b82f6', '#10b981']

export default function CPQAnalyticsWinRatePage() {
  const router = useRouter()
  const [timeRange, setTimeRange] = useState('last-6-months')

  const [data, setData] = useState<WinRateDashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)
    cpqAnalyticsService
      .getWinRateDashboard()
      .then((res) => {
        if (active) setData(res)
      })
      .catch((err) => {
        if (active) setError(err?.message || 'Failed to load win rate analytics')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [timeRange])

  // Defensive transforms — always fall back to empty arrays / zeros.
  const metrics = data?.metrics ?? {
    overallWinRate: 0,
    dealsWon: 0,
    dealsLost: 0,
    avgWonDealSize: 0,
    avgLostDealSize: 0,
  }
  const winLossTrend = Array.isArray(data?.winLossTrend) ? data!.winLossTrend : []
  const lossReasons = (Array.isArray(data?.lossReasons) ? data!.lossReasons : []).map(
    (r, idx) => ({ ...r, color: LOSS_COLORS[idx % LOSS_COLORS.length] })
  )
  const dealSizeWinRate = Array.isArray(data?.dealSizeWinRate)
    ? data!.dealSizeWinRate
    : []
  const regionWinRate = Array.isArray(data?.regionWinRate) ? data!.regionWinRate : []

  const fmtMoney = (v: number) =>
    new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(v || 0)

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600">Loading win rate analytics…</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full h-full px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      </div>
    )
  }

  const hasData =
    winLossTrend.length > 0 ||
    lossReasons.length > 0 ||
    dealSizeWinRate.length > 0 ||
    regionWinRate.length > 0 ||
    metrics.dealsWon > 0 ||
    metrics.dealsLost > 0

  return (
    <div className="w-full h-full px-4 py-2">
      {/* Header Actions */}
      <div className="mb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Win Rate Analytics</h2>
          <p className="text-sm text-gray-600 mt-1">Comprehensive win/loss analysis and competitive insights</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="last-30-days">Last 30 Days</option>
            <option value="last-90-days">Last 90 Days</option>
            <option value="last-6-months">Last 6 Months</option>
            <option value="last-year">Last Year</option>
          </select>
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

      {!hasData && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center mb-3">
          <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
          <p className="text-yellow-800 font-medium">No quote data available yet.</p>
          <p className="text-yellow-700 text-sm mt-1">
            Win rate analytics will populate as quotes are created and closed.
          </p>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-5 border border-green-200">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-green-600">Overall Win Rate</p>
            <Target className="h-8 w-8 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-green-900">{metrics.overallWinRate}%</p>
          <p className="text-xs text-green-700 mt-2">
            {metrics.dealsWon} won / {metrics.dealsWon + metrics.dealsLost} total deals
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-5 border border-blue-200">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-blue-600">Deals Won</p>
            <CheckCircle className="h-8 w-8 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-blue-900">{metrics.dealsWon}</p>
          <p className="text-xs text-blue-700 mt-2">Closed-won quotes</p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-5 border border-red-200">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-red-600">Deals Lost</p>
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          <p className="text-3xl font-bold text-red-900">{metrics.dealsLost}</p>
          <p className="text-xs text-red-700 mt-2">Closed-lost quotes</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-5 border border-purple-200">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-purple-600">Avg Won Deal Size</p>
            <TrendingUp className="h-8 w-8 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-purple-900">{fmtMoney(metrics.avgWonDealSize)}</p>
          <p className="text-xs text-purple-700 mt-2">
            vs {fmtMoney(metrics.avgLostDealSize)} for lost deals
          </p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
        {/* Win/Loss Trend */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Win/Loss Trend</h3>
              <p className="text-sm text-gray-600">Monthly win rate progression</p>
            </div>
            <TrendingUp className="h-6 w-6 text-green-600" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={winLossTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="won" stroke="#10b981" strokeWidth={2} name="Won" />
              <Line yAxisId="left" type="monotone" dataKey="lost" stroke="#ef4444" strokeWidth={2} name="Lost" />
              <Line yAxisId="right" type="monotone" dataKey="winRate" stroke="#8b5cf6" strokeWidth={2} name="Win Rate %" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Loss Reasons */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Top Loss Reasons</h3>
              <p className="text-sm text-gray-600">Why deals were lost</p>
            </div>
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <div className="space-y-3">
            {lossReasons.map((reason, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{reason.reason}</span>
                    <span className="text-sm font-bold text-gray-900">{reason.count} deals</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full"
                      style={{ width: `${reason.percentage}%`, backgroundColor: reason.color }}
                    ></div>
                  </div>
                </div>
                <span className="text-sm font-semibold w-12 text-right" style={{ color: reason.color }}>
                  {reason.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Win Rate by Region */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-3 mb-3">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Win Rate by Region</h3>
            <p className="text-sm text-gray-600">Win/loss record by shipping region</p>
          </div>
          <MapPin className="h-6 w-6 text-orange-600" />
        </div>
        {regionWinRate.length === 0 ? (
          <p className="text-sm text-gray-500 py-6 text-center">No regional data available.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Region</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Deals Won</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Deals Lost</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Total Deals</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Win Rate</th>
                </tr>
              </thead>
              <tbody>
                {regionWinRate.map((r, idx) => (
                  <ClickableTableRow
                    key={idx}
                    onClick={() => router.push(`/cpq/quotes?region=${encodeURIComponent(r.region)}`)}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4">
                      <p className="font-medium text-gray-900">{r.region}</p>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-green-600 font-medium">{r.won}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-red-600 font-medium">{r.lost}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-gray-900 font-medium">{r.deals}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${r.winRate >= 50 ? 'bg-green-100 text-green-700' :
                        r.winRate >= 35 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                        {r.winRate}%
                      </span>
                    </td>
                  </ClickableTableRow>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Win Rate by Deal Size */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-3">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Win Rate by Deal Size</h3>
            <p className="text-sm text-gray-600">Conversion across deal-value bands</p>
          </div>
          <Package className="h-6 w-6 text-blue-600" />
        </div>
        {dealSizeWinRate.length === 0 ? (
          <p className="text-sm text-gray-500 py-6 text-center">No deal size data available.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dealSizeWinRate}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="won" fill="#10b981" name="Won" />
              <Bar dataKey="lost" fill="#ef4444" name="Lost" />
              <Bar dataKey="winRate" fill="#8b5cf6" name="Win Rate %" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
