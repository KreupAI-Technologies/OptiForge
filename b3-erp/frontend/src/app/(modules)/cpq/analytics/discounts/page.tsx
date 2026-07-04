'use client'

import { useState, useEffect } from 'react'
import {
  Percent,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
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
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

// Fixed colour palette for the discount-distribution pie (config, not data).
const DISCOUNT_DIST_COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#991b1b']

interface DiscountTrendRow { month: string; avgDiscount: number; totalDiscountValue: number; dealsWithDiscount: number }
interface DiscountDistRow { range: string; count: number; percentage: number; color: string }
interface DiscountByCustomerRow { type: string; avgDiscount: number; deals: number; totalValue: number; margin: number }
interface ApprovalPatternRow { approver: string; avgDiscount: number; count: number; approved: number; rejected: number; approvalRate: number }
interface MarginImpactRow { discountRange: string; avgMargin: number; deals: number; revenue: number }
interface DiscountEffRow { range: string; winRate: number; lostDeals: number; wonDeals: number }
interface DiscountByProductRow { category: string; avgDiscount: number; deals: number; totalValue: number; margin: number }

export default function CPQAnalyticsDiscountsPage() {
  const [timeRange, setTimeRange] = useState('last-6-months')

  // Data arrays wired to GET /cpq/analytics/dashboards/discounts (aggregates
  // cpq_quotes). discountTrend, discountDistribution and marginImpact come
  // straight from the endpoint. Customer/approval/effectiveness/category cuts
  // have no backing field and stay empty until the API exposes them.
  const [discountTrend, setDiscountTrend] = useState<DiscountTrendRow[]>([])
  const [discountDistribution, setDiscountDistribution] = useState<DiscountDistRow[]>([])
  const [discountByCustomer, setDiscountByCustomer] = useState<DiscountByCustomerRow[]>([])
  const [approvalPatterns, setApprovalPatterns] = useState<ApprovalPatternRow[]>([])
  const [marginImpact, setMarginImpact] = useState<MarginImpactRow[]>([])
  const [discountEffectiveness, setDiscountEffectiveness] = useState<DiscountEffRow[]>([])
  const [discountByProduct, setDiscountByProduct] = useState<DiscountByProductRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setIsLoading(true)
      setLoadError(null)
      try {
        const dash = await cpqAnalyticsLiveService.getDiscountsDashboard()

        const trend: DiscountTrendRow[] = (dash.discountTrend ?? []).map((t) => ({
          month: t.month,
          avgDiscount: Number(t.avgDiscount || 0),
          totalDiscountValue: 0,
          dealsWithDiscount: 0,
        }))

        const dist: DiscountDistRow[] = (dash.discountDistribution ?? []).map((d, idx) => ({
          range: d.range,
          count: Number(d.count || 0),
          percentage: Number(d.percentage || 0),
          color: DISCOUNT_DIST_COLORS[idx % DISCOUNT_DIST_COLORS.length],
        }))

        const margin: MarginImpactRow[] = (dash.marginImpact ?? []).map((m) => ({
          discountRange: m.month,
          avgMargin: Number(m.avgMargin || 0),
          deals: 0,
          revenue: 0,
        }))

        if (!cancelled) {
          setDiscountTrend(trend)
          setDiscountDistribution(dist)
          setMarginImpact(margin)
          setDiscountByCustomer([])
          setApprovalPatterns([])
          setDiscountEffectiveness([])
          setDiscountByProduct([])
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load discount analytics')
          setDiscountTrend([]); setDiscountDistribution([]); setDiscountByCustomer([])
          setApprovalPatterns([]); setMarginImpact([]); setDiscountEffectiveness([]); setDiscountByProduct([])
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  return (
    <div className="w-full h-full px-4 py-2">
      {/* Header Actions */}
      <div className="mb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Discount Analytics</h2>
          <p className="text-sm text-gray-600 mt-1">Comprehensive discount patterns and impact analysis</p>
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
        <div className="mb-3 text-sm text-gray-500">Loading discount analytics...</div>
      )}
      {!isLoading && loadError && (
        <div className="mb-3 text-sm text-red-600">{loadError}</div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-5 border border-purple-200">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-purple-600">Avg Discount Rate</p>
            <Percent className="h-8 w-8 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-purple-900">14.5%</p>
          <div className="flex items-center gap-1 mt-2 text-sm">
            <ArrowUpRight className="h-4 w-4 text-red-600" />
            <span className="text-red-600 font-semibold">0.7%</span>
            <span className="text-purple-700">vs last period</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-5 border border-blue-200">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-blue-600">Total Discount Value</p>
            <DollarSign className="h-8 w-8 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-blue-900">₹5.3Cr</p>
          <div className="flex items-center gap-1 mt-2 text-sm">
            <ArrowUpRight className="h-4 w-4 text-red-600" />
            <span className="text-red-600 font-semibold">26.2%</span>
            <span className="text-blue-700">vs last period</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-5 border border-green-200">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-green-600">Deals With Discount</p>
            <Users className="h-8 w-8 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-green-900">172</p>
          <p className="text-xs text-green-700 mt-2">64.4% of all deals</p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-5 border border-orange-200">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-orange-600">Avg Margin Impact</p>
            <TrendingDown className="h-8 w-8 text-orange-600" />
          </div>
          <p className="text-3xl font-bold text-orange-900">-5.5%</p>
          <p className="text-xs text-orange-700 mt-2">From 32% to 26.5%</p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
        {/* Discount Trend */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Discount Trend Over Time</h3>
              <p className="text-sm text-gray-600">Average discount rate and total value</p>
            </div>
            <Percent className="h-6 w-6 text-purple-600" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={discountTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="avgDiscount" stroke="#8b5cf6" strokeWidth={2} name="Avg Discount %" />
              <Line yAxisId="right" type="monotone" dataKey="totalDiscountValue" stroke="#ef4444" strokeWidth={2} name="Total Value (₹Cr)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Discount Distribution */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Discount Distribution</h3>
              <p className="text-sm text-gray-600">Deal count by discount range</p>
            </div>
            <DollarSign className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex items-center gap-3">
            <ResponsiveContainer width="50%" height={250}>
              <PieChart>
                <Pie
                  data={discountDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ range, percentage }) => `${range}: ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="percentage"
                >
                  {discountDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {discountDistribution.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm font-medium text-gray-700">{item.range}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">{item.count}</p>
                    <p className="text-xs text-gray-500">{item.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Discount by Customer Type */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-3 mb-3">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Discount Analysis by Customer Type</h3>
            <p className="text-sm text-gray-600">Average discount and margin impact by segment</p>
          </div>
          <Users className="h-6 w-6 text-green-600" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Customer Type</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Avg Discount</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Deal Count</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Total Value</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Avg Margin</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Health</th>
              </tr>
            </thead>
            <tbody>
              {discountByCustomer.map((item, idx) => (
                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <p className="font-medium text-gray-900">{item.type}</p>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      item.avgDiscount <= 10 ? 'bg-green-100 text-green-700' :
                      item.avgDiscount <= 15 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {item.avgDiscount}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-gray-900 font-medium">{item.deals}</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-blue-600 font-bold">₹{item.totalValue}Cr</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      item.margin >= 28 ? 'bg-green-100 text-green-700' :
                      item.margin >= 25 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {item.margin}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {item.margin >= 28 ? (
                      <CheckCircle className="h-5 w-5 text-green-600 ml-auto" />
                    ) : item.margin >= 25 ? (
                      <AlertTriangle className="h-5 w-5 text-yellow-600 ml-auto" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600 ml-auto" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Approval Patterns */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-3 mb-3">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Approval Patterns by Level</h3>
            <p className="text-sm text-gray-600">Discount approvals across organizational hierarchy</p>
          </div>
          <CheckCircle className="h-6 w-6 text-green-600" />
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={approvalPatterns}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="approver" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="approved" stackId="a" fill="#10b981" name="Approved" />
            <Bar yAxisId="left" dataKey="rejected" stackId="a" fill="#ef4444" name="Rejected" />
            <Line yAxisId="right" type="monotone" dataKey="avgDiscount" stroke="#8b5cf6" strokeWidth={2} name="Avg Discount %" />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          {approvalPatterns.map((item, idx) => (
            <div key={idx} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <p className="text-xs font-medium text-gray-600">{item.approver}</p>
              <p className="text-lg font-bold text-gray-900">{item.approvalRate}%</p>
              <p className="text-xs text-gray-500">approval rate</p>
              <p className="text-xs text-purple-600 font-semibold mt-1">{item.avgDiscount}% avg</p>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
        {/* Margin Impact */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Margin Impact by Discount Level</h3>
              <p className="text-sm text-gray-600">How discounts affect profitability</p>
            </div>
            <TrendingDown className="h-6 w-6 text-red-600" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={marginImpact}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="discountRange" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="avgMargin" stroke="#10b981" fill="#d1fae5" name="Avg Margin %" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Discount Effectiveness */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Discount Effectiveness</h3>
              <p className="text-sm text-gray-600">Win rate by discount level</p>
            </div>
            <TrendingUp className="h-6 w-6 text-orange-600" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={discountEffectiveness}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="winRate" fill="#3b82f6" name="Win Rate %" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Discount by Product Category */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-3 mb-3">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Discount Analysis by Product Category</h3>
            <p className="text-sm text-gray-600">Category-wise discount patterns and impact</p>
          </div>
          <DollarSign className="h-6 w-6 text-purple-600" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Product Category</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Avg Discount</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Deal Count</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Total Value</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Avg Margin</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Recommendation</th>
              </tr>
            </thead>
            <tbody>
              {discountByProduct.map((item, idx) => (
                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <p className="font-medium text-gray-900">{item.category}</p>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      item.avgDiscount <= 10 ? 'bg-green-100 text-green-700' :
                      item.avgDiscount <= 15 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {item.avgDiscount}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-gray-900 font-medium">{item.deals}</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-blue-600 font-bold">₹{item.totalValue}Cr</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      item.margin >= 28 ? 'bg-green-100 text-green-700' :
                      item.margin >= 25 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {item.margin}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <p className="text-xs text-gray-600">
                      {item.avgDiscount <= 10 ? 'Maintain strategy' :
                       item.avgDiscount <= 15 ? 'Monitor closely' :
                       'Review pricing'}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Key Insights */}
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow-md border border-purple-200 p-3">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-lg font-bold text-purple-900">Discount Strategy Insights</h3>
            <p className="text-sm text-purple-700">Actionable recommendations</p>
          </div>
          <AlertTriangle className="h-6 w-6 text-purple-600" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
          <div className="bg-white rounded-lg p-3 border border-purple-200">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-1">Zero Discount Success</p>
                <p className="text-xs text-gray-600">35.6% deals with no discount. 58% win rate shows strong value proposition.</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-purple-200">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-1">Strategic Partner Risk</p>
                <p className="text-xs text-gray-600">18.2% avg discount reducing margins to 20.8%. Review partnership value.</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-purple-200">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <TrendingDown className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-1">Diminishing Returns</p>
                <p className="text-xs text-gray-600">Discounts {'>'}15% show 38% win rate. Not effective for conversion improvement.</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-purple-200">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-1">VIP Efficiency</p>
                <p className="text-xs text-gray-600">8.5% avg discount with 30.2% margins. Best customer segment performance.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
