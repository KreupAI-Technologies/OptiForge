'use client'

import { useState, useEffect } from 'react'
import {
  Clock,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Zap,
  Target,
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { cpqAnalyticsLiveService } from '@/services/cpq/cpq-analytics-live.service'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  FunnelChart,
  Funnel,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  LabelList
} from 'recharts'
import { useRouter } from 'next/navigation'
import { ClickableTableRow } from '@/components/reports/ClickableTableRow'

// Fixed colour palette for the conversion funnel bars (config, not data).
const FUNNEL_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444']
const CYCLE_TARGET_DAYS = 25

interface CycleTrendRow { month: string; avgDays: number; targetDays: number; deals: number }
interface StageDurationRow { stage: string; avgDays: number; percentage: number }
interface ConversionFunnelRow { stage: string; value: number; name: string; fill: string }
interface CycleBySizeRow { range: string; avgDays: number; deals: number; velocity: string }
interface BottleneckRow { stage: string; avgDelay: number; impactedDeals: number; lostDeals: number; reason: string }
interface VelocityByProductRow { category: string; avgDays: number; deals: number; conversionRate: number }

export default function CPQAnalyticsSalesCyclePage() {
  const router = useRouter()
  const [timeRange, setTimeRange] = useState('last-6-months')

  // Data arrays wired to GET /cpq/analytics/dashboards/sales-cycle (aggregates
  // cpq_quotes). cycleTrend, conversionFunnel and cycleBySize come from the
  // endpoint. Stage/bottleneck/velocity cuts have no backing field and stay
  // empty until the API exposes them.
  const [cycleTrend, setCycleTrend] = useState<CycleTrendRow[]>([])
  const [stageDuration, setStageDuration] = useState<StageDurationRow[]>([])
  const [conversionFunnel, setConversionFunnel] = useState<ConversionFunnelRow[]>([])
  const [cycleBySize, setCycleBySize] = useState<CycleBySizeRow[]>([])
  const [bottlenecks, setBottlenecks] = useState<BottleneckRow[]>([])
  const [velocityByProduct, setVelocityByProduct] = useState<VelocityByProductRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setIsLoading(true)
      setLoadError(null)
      try {
        const dash = await cpqAnalyticsLiveService.getSalesCycleDashboard()

        const trend: CycleTrendRow[] = (dash.cycleTrend ?? []).map((t) => ({
          month: t.month,
          avgDays: Number(t.avgDays || 0),
          targetDays: CYCLE_TARGET_DAYS,
          deals: 0,
        }))

        const funnel: ConversionFunnelRow[] = (dash.conversionFunnel ?? []).map((f, idx) => ({
          stage: f.stage,
          value: Number(f.count || 0),
          name: f.stage,
          fill: FUNNEL_COLORS[idx % FUNNEL_COLORS.length],
        }))

        const bySize: CycleBySizeRow[] = (dash.cycleBySize ?? []).map((c) => {
          const days = Number(c.avgDays || 0)
          return {
            range: c.range,
            avgDays: days,
            deals: 0,
            velocity: days <= 20 ? 'Fast' : days <= 30 ? 'Medium' : 'Slow',
          }
        })

        if (!cancelled) {
          setCycleTrend(trend)
          setConversionFunnel(funnel)
          setCycleBySize(bySize)
          setStageDuration([])
          setBottlenecks([])
          setVelocityByProduct([])
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load sales cycle analytics')
          setCycleTrend([]); setStageDuration([]); setConversionFunnel([]); setCycleBySize([])
          setBottlenecks([]); setVelocityByProduct([])
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  // Time-to-close distribution (not rendered; retained for reference)
  const timeDistribution = [
    { range: '< 2 weeks', count: 145, percentage: 29.4, avgValue: 2.1 },
    { range: '2-4 weeks', count: 185, percentage: 37.4, avgValue: 3.8 },
    { range: '4-6 weeks', count: 98, percentage: 19.8, avgValue: 5.2 },
    { range: '6-8 weeks', count: 45, percentage: 9.1, avgValue: 6.8 },
    { range: '> 8 weeks', count: 21, percentage: 4.3, avgValue: 10.5 }
  ]

  // Cycle time by sales rep
  const repPerformance = [
    { rep: 'Vikram Desai', avgDays: 20, deals: 48, target: 25, performance: 'Excellent' },
    { rep: 'Priya Sharma', avgDays: 22, deals: 52, target: 25, performance: 'Good' },
    { rep: 'Suresh Rao', avgDays: 24, deals: 45, target: 25, performance: 'Good' },
    { rep: 'Neha Singh', avgDays: 26, deals: 38, target: 25, performance: 'On Target' },
    { rep: 'Amit Verma', avgDays: 32, deals: 35, target: 25, performance: 'Below Target' }
  ]

  return (
    <div className="w-full h-full px-4 py-2">
      {/* Header Actions */}
      <div className="mb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sales Cycle Analytics</h2>
          <p className="text-sm text-gray-600 mt-1">Comprehensive analysis of deal velocity and bottlenecks</p>
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

      {isLoading && (
        <div className="mb-3 text-sm text-gray-500">Loading sales cycle analytics...</div>
      )}
      {!isLoading && loadError && (
        <div className="mb-3 text-sm text-red-600">{loadError}</div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-5 border border-blue-200">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-blue-600">Avg Sales Cycle</p>
            <Clock className="h-8 w-8 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-blue-900">22 days</p>
          <div className="flex items-center gap-1 mt-2 text-sm">
            <ArrowDownRight className="h-4 w-4 text-green-600" />
            <span className="text-green-600 font-semibold">3 days faster</span>
            <span className="text-blue-700">vs target</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-5 border border-green-200">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-green-600">Fastest Deal</p>
            <Zap className="h-8 w-8 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-green-900">8 days</p>
          <p className="text-xs text-green-700 mt-2">₹4.2L modular kitchen</p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-5 border border-orange-200">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-orange-600">Avg Stage Duration</p>
            <Target className="h-8 w-8 text-orange-600" />
          </div>
          <p className="text-3xl font-bold text-orange-900">3.7 days</p>
          <p className="text-xs text-orange-700 mt-2">Per stage average</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-5 border border-purple-200">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-purple-600">Conversion Rate</p>
            <TrendingUp className="h-8 w-8 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-purple-900">17.9%</p>
          <p className="text-xs text-purple-700 mt-2">Lead to won ratio</p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
        {/* Sales Cycle Trend */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Sales Cycle Trend</h3>
              <p className="text-sm text-gray-600">Average days to close over time</p>
            </div>
            <Clock className="h-6 w-6 text-blue-600" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={cycleTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="targetDays" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" name="Target Days" />
              <Line type="monotone" dataKey="avgDays" stroke="#3b82f6" strokeWidth={2} name="Actual Days" />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-600">
              <strong className="text-green-600">12% improvement</strong> in sales cycle time over 6 months
            </p>
          </div>
        </div>

        {/* Stage Duration */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Stage Duration Breakdown</h3>
              <p className="text-sm text-gray-600">Average time spent in each stage</p>
            </div>
            <Target className="h-6 w-6 text-purple-600" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stageDuration}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="stage" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="avgDays" fill="#8b5cf6" name="Avg Days">
                <LabelList dataKey="avgDays" position="top" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Conversion Funnel */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-3 mb-3">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Deal Conversion Funnel</h3>
            <p className="text-sm text-gray-600">Stage-by-stage conversion analysis</p>
          </div>
          <TrendingUp className="h-6 w-6 text-green-600" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={conversionFunnel} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="stage" type="category" />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" name="Deals">
                <LabelList dataKey="value" position="right" />
                {conversionFunnel.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="space-y-3">
            {conversionFunnel.map((stage, idx) => {
              const prevValue = idx > 0 ? conversionFunnel[idx - 1].value : stage.value
              const dropOff = ((prevValue - stage.value) / prevValue * 100).toFixed(1)
              const conversion = (stage.value / conversionFunnel[0].value * 100).toFixed(1)
              return (
                <div key={idx} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stage.fill }}></div>
                      <p className="text-sm font-semibold text-gray-900">{stage.stage}</p>
                    </div>
                    <p className="text-lg font-bold text-gray-900">{stage.value}</p>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Conversion: {conversion}%</span>
                    {idx > 0 && (
                      <span className="text-red-600">Drop-off: {dropOff}%</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Cycle Time by Deal Size */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-3 mb-3">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Cycle Time by Deal Size</h3>
            <p className="text-sm text-gray-600">Correlation between deal value and sales cycle</p>
          </div>
          <Zap className="h-6 w-6 text-orange-600" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Deal Size Range</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Avg Cycle Time</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Deal Count</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Velocity</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Recommendation</th>
              </tr>
            </thead>
            <tbody>
              {cycleBySize.map((item, idx) => (
                <ClickableTableRow
                  key={idx}
                  onClick={() => router.push(`/cpq/quotes?dealSize=${encodeURIComponent(item.range)}`)}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-3 px-4">
                    <p className="font-medium text-gray-900">{item.range}</p>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${item.avgDays <= 20 ? 'bg-green-100 text-green-700' :
                      item.avgDays <= 30 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                      {item.avgDays} days
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-gray-900 font-medium">{item.deals}</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${item.velocity === 'Fast' ? 'bg-green-100 text-green-700' :
                      item.velocity === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                      {item.velocity}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <p className="text-xs text-gray-600">
                      {item.avgDays <= 20 ? 'Maintain pace' :
                        item.avgDays <= 30 ? 'Optimize approval' :
                          'Streamline process'}
                    </p>
                  </td>
                </ClickableTableRow>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottleneck Analysis */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-3 mb-3">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Bottleneck Analysis</h3>
            <p className="text-sm text-gray-600">Stages causing the most delays</p>
          </div>
          <AlertTriangle className="h-6 w-6 text-red-600" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Stage</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Avg Delay (days)</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Impacted Deals</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Lost Deals</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Primary Reason</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Severity</th>
              </tr>
            </thead>
            <tbody>
              {bottlenecks.map((item, idx) => (
                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <p className="font-medium text-gray-900">{item.stage}</p>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-red-600 font-bold">{item.avgDelay} days</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-gray-900 font-medium">{item.impactedDeals}</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-red-600 font-bold">{item.lostDeals}</span>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-sm text-gray-700">{item.reason}</p>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${idx === 0 ? 'bg-red-100 text-red-700' :
                      idx === 1 ? 'bg-orange-100 text-orange-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                      {idx === 0 ? 'Critical' : idx === 1 ? 'High' : 'Medium'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Velocity by Product */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Velocity by Product Category</h3>
              <p className="text-sm text-gray-600">Average cycle time per category</p>
            </div>
            <Zap className="h-6 w-6 text-blue-600" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={velocityByProduct} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="category" type="category" width={120} />
              <Tooltip />
              <Bar dataKey="avgDays" fill="#3b82f6" name="Avg Days">
                <LabelList dataKey="avgDays" position="right" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Key Insights */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-md border border-blue-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-lg font-bold text-blue-900">Optimization Insights</h3>
              <p className="text-sm text-blue-700">Actionable recommendations</p>
            </div>
            <Target className="h-6 w-6 text-blue-600" />
          </div>
          <div className="space-y-2">
            <div className="bg-white rounded-lg p-3 border border-blue-200">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-1">Strong Improvement Trend</p>
                  <p className="text-xs text-gray-600">22 days avg (12% faster than Q2). Maintain momentum with process optimization.</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-blue-200">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-1">Negotiation Bottleneck</p>
                  <p className="text-xs text-gray-600">6-day avg delay impacting 45 deals. Improve pricing clarity and approval workflows.</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-blue-200">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Clock className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-1">Office Furniture Challenge</p>
                  <p className="text-xs text-gray-600">35-day avg cycle vs 22-day overall. Complex requirements need faster response.</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-blue-200">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Zap className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-1">Small Deal Efficiency</p>
                  <p className="text-xs text-gray-600">18-day avg for deals under ₹2L. Leverage this efficiency across all tiers.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
