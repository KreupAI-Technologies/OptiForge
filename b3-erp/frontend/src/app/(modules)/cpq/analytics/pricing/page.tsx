'use client'

import { useState, useEffect } from 'react'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Percent,
  Target,
  AlertTriangle,
  CheckCircle,
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
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ZAxis
} from 'recharts'

interface PricingDiscountTrendRow { month: string; avgDiscount: number; maxDiscount: number; minDiscount: number; margin: number }
interface PricingMarginTrendRow { month: string; targetMargin: number; actualMargin: number; deals: number }
interface PricingDistRow { range: string; count: number; percentage: number; avgMargin: number }
interface PriceSensitivityRow { category: string; elasticity: number; avgDiscount: number; conversionImpact: string }
interface CompetitivePricingRow { product: string; us: number; competitor1: number; competitor2: number; margin: number }
interface DiscountVsDealSizeRow { dealSize: number; discount: number; won: number }
interface PricingTierRow { tier: string; deals: number; avgDiscount: number; margin: number; conversionRate: number }

const MARGIN_TARGET = 28

export default function CPQAnalyticsPricingPage() {
  const [timeRange, setTimeRange] = useState('last-6-months')

  // Data arrays wired to GET /cpq/analytics/dashboards/pricing (aggregates
  // cpq_quotes). discountTrend, marginTrend and discountDistribution come from
  // the endpoint. Sensitivity/competitive/scatter/tier cuts have no backing
  // field and stay empty until the API exposes them.
  const [discountTrend, setDiscountTrend] = useState<PricingDiscountTrendRow[]>([])
  const [marginTrend, setMarginTrend] = useState<PricingMarginTrendRow[]>([])
  const [discountDistribution, setDiscountDistribution] = useState<PricingDistRow[]>([])
  const [priceSensitivity, setPriceSensitivity] = useState<PriceSensitivityRow[]>([])
  const [competitivePricing, setCompetitivePricing] = useState<CompetitivePricingRow[]>([])
  const [discountVsDealSize, setDiscountVsDealSize] = useState<DiscountVsDealSizeRow[]>([])
  const [pricingTiers, setPricingTiers] = useState<PricingTierRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setIsLoading(true)
      setLoadError(null)
      try {
        const dash = await cpqAnalyticsLiveService.getPricingDashboard()

        const dTrend: PricingDiscountTrendRow[] = (dash.discountTrend ?? []).map((t) => ({
          month: t.month,
          avgDiscount: Number(t.avgDiscount || 0),
          maxDiscount: 0,
          minDiscount: 0,
          margin: 0,
        }))

        const mTrend: PricingMarginTrendRow[] = (dash.marginTrend ?? []).map((t) => ({
          month: t.month,
          targetMargin: MARGIN_TARGET,
          actualMargin: Number(t.avgMargin || 0),
          deals: 0,
        }))

        // The pricing dashboard buckets discount-vs-deal-size by range; surface
        // that as the discount distribution table/chart.
        const dist: PricingDistRow[] = (dash.discountVsDealSize ?? []).map((d) => ({
          range: d.range,
          count: Number(d.count || 0),
          percentage: 0,
          avgMargin: 0,
        }))

        if (!cancelled) {
          setDiscountTrend(dTrend)
          setMarginTrend(mTrend)
          setDiscountDistribution(dist)
          setPriceSensitivity([])
          setCompetitivePricing([])
          setDiscountVsDealSize([])
          setPricingTiers([])
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load pricing analytics')
          setDiscountTrend([]); setMarginTrend([]); setDiscountDistribution([])
          setPriceSensitivity([]); setCompetitivePricing([]); setDiscountVsDealSize([]); setPricingTiers([])
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
          <h2 className="text-2xl font-bold text-gray-900">Pricing Analytics</h2>
          <p className="text-sm text-gray-600 mt-1">Comprehensive discount and margin analysis</p>
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
        <div className="mb-3 text-sm text-gray-500">Loading pricing analytics...</div>
      )}
      {!isLoading && loadError && (
        <div className="mb-3 text-sm text-red-600">{loadError}</div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-5 border border-purple-200">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-purple-600">Avg Discount</p>
            <Percent className="h-8 w-8 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-purple-900">14.5%</p>
          <div className="flex items-center gap-1 mt-2 text-sm">
            <ArrowUpRight className="h-4 w-4 text-red-600" />
            <span className="text-red-600 font-semibold">0.7%</span>
            <span className="text-purple-700">vs last period</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-5 border border-green-200">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-green-600">Avg Margin</p>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-green-900">26.5%</p>
          <div className="flex items-center gap-1 mt-2 text-sm">
            <ArrowDownRight className="h-4 w-4 text-red-600" />
            <span className="text-red-600 font-semibold">2.0%</span>
            <span className="text-green-700">vs target 28%</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-5 border border-blue-200">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-blue-600">Zero Discount Deals</p>
            <CheckCircle className="h-8 w-8 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-blue-900">35.6%</p>
          <div className="flex items-center gap-1 mt-2 text-sm">
            <span className="text-blue-700">95 of 267 deals</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-5 border border-orange-200">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-orange-600">Max Discount Given</p>
            <AlertTriangle className="h-8 w-8 text-orange-600" />
          </div>
          <p className="text-3xl font-bold text-orange-900">28%</p>
          <div className="flex items-center gap-1 mt-2 text-sm">
            <span className="text-orange-700">5 deals above 20%</span>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
        {/* Discount Trend */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Discount Trend</h3>
              <p className="text-sm text-gray-600">Average discount percentage over time</p>
            </div>
            <Percent className="h-6 w-6 text-purple-600" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={discountTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="maxDiscount" stackId="1" stroke="#ef4444" fill="#fecaca" name="Max Discount %" />
              <Area type="monotone" dataKey="avgDiscount" stackId="2" stroke="#8b5cf6" fill="#c4b5fd" name="Avg Discount %" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Margin Trend */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Margin Performance</h3>
              <p className="text-sm text-gray-600">Target vs actual margin percentage</p>
            </div>
            <TrendingUp className="h-6 w-6 text-green-600" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={marginTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="targetMargin" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" name="Target Margin %" />
              <Line type="monotone" dataKey="actualMargin" stroke="#3b82f6" strokeWidth={2} name="Actual Margin %" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Discount Distribution */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-3 mb-3">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Discount Distribution</h3>
            <p className="text-sm text-gray-600">Deal count by discount range with margin impact</p>
          </div>
          <DollarSign className="h-6 w-6 text-blue-600" />
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={discountDistribution}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="range" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="count" fill="#3b82f6" name="Deal Count" />
            <Line yAxisId="right" type="monotone" dataKey="avgMargin" stroke="#10b981" strokeWidth={2} name="Avg Margin %" />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {discountDistribution.map((item, idx) => (
            <div key={idx} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <p className="text-xs font-medium text-gray-600">{item.range}</p>
              <p className="text-lg font-bold text-gray-900">{item.count}</p>
              <p className="text-xs text-gray-500">{item.percentage}% of deals</p>
              <p className="text-xs text-green-600 font-semibold mt-1">{item.avgMargin}% margin</p>
            </div>
          ))}
        </div>
      </div>

      {/* Price Sensitivity */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-3 mb-3">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Price Sensitivity by Category</h3>
            <p className="text-sm text-gray-600">Elasticity and discount impact analysis</p>
          </div>
          <Target className="h-6 w-6 text-orange-600" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Product Category</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Price Elasticity</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Avg Discount</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Conversion Impact</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Recommendation</th>
              </tr>
            </thead>
            <tbody>
              {priceSensitivity.map((item, idx) => (
                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <p className="font-medium text-gray-900">{item.category}</p>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      Math.abs(item.elasticity) < 2 ? 'bg-green-100 text-green-700' :
                      Math.abs(item.elasticity) < 2.5 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {item.elasticity}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-purple-600 font-bold">{item.avgDiscount}%</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      item.conversionImpact === 'Low' ? 'bg-green-100 text-green-700' :
                      item.conversionImpact === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {item.conversionImpact}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <p className="text-xs text-gray-600">
                      {Math.abs(item.elasticity) < 2 ? 'Maintain pricing' :
                       Math.abs(item.elasticity) < 2.5 ? 'Limited discounts' :
                       'Value-based selling'}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
        {/* Competitive Pricing */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Competitive Pricing Comparison</h3>
              <p className="text-sm text-gray-600">Price positioning vs competitors (₹000s)</p>
            </div>
            <Target className="h-6 w-6 text-blue-600" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={competitivePricing} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="product" type="category" width={140} />
              <Tooltip />
              <Legend />
              <Bar dataKey="us" fill="#10b981" name="Us" />
              <Bar dataKey="competitor1" fill="#f59e0b" name="Competitor 1" />
              <Bar dataKey="competitor2" fill="#ef4444" name="Competitor 2" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Discount vs Deal Size */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Discount vs Deal Size</h3>
              <p className="text-sm text-gray-600">Correlation between discount and deal value</p>
            </div>
            <TrendingUp className="h-6 w-6 text-purple-600" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="dealSize" name="Deal Size (₹Cr)" />
              <YAxis dataKey="discount" name="Discount %" />
              <ZAxis dataKey="won" range={[100, 100]} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Legend />
              <Scatter name="Won Deals" data={discountVsDealSize.filter(d => d.won === 1)} fill="#10b981" />
              <Scatter name="Lost Deals" data={discountVsDealSize.filter(d => d.won === 0)} fill="#ef4444" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pricing Tiers Effectiveness */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-3 mb-3">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Pricing Tier Effectiveness</h3>
            <p className="text-sm text-gray-600">Performance metrics by price tier</p>
          </div>
          <DollarSign className="h-6 w-6 text-green-600" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Price Tier</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Deal Count</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Avg Discount</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Avg Margin</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Conversion Rate</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Health</th>
              </tr>
            </thead>
            <tbody>
              {pricingTiers.map((tier, idx) => (
                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <p className="font-medium text-gray-900">{tier.tier}</p>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-gray-900 font-medium">{tier.deals}</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-purple-600 font-bold">{tier.avgDiscount}%</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      tier.margin >= 28 ? 'bg-green-100 text-green-700' :
                      tier.margin >= 25 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {tier.margin}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-blue-600 font-bold">{tier.conversionRate}%</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {tier.margin >= 28 && tier.conversionRate >= 45 ? (
                      <CheckCircle className="h-5 w-5 text-green-600 ml-auto" />
                    ) : tier.margin >= 25 && tier.conversionRate >= 40 ? (
                      <AlertTriangle className="h-5 w-5 text-yellow-600 ml-auto" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-red-600 ml-auto" />
                    )}
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
            <h3 className="text-lg font-bold text-purple-900">Pricing Strategy Insights</h3>
            <p className="text-sm text-purple-700">Actionable recommendations</p>
          </div>
          <Target className="h-6 w-6 text-purple-600" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
          <div className="bg-white rounded-lg p-3 border border-purple-200">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-1">Strong Entry Tier</p>
                <p className="text-xs text-gray-600">58% conversion with 31.5% margin. Best performing tier.</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-purple-200">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-1">Premium Margin Pressure</p>
                <p className="text-xs text-gray-600">18.5% avg discount reducing margins to 22.5%. Review pricing strategy.</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-purple-200">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-1">Competitive Advantage</p>
                <p className="text-xs text-gray-600">15-20% lower pricing than competitors across most products.</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-purple-200">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <TrendingDown className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-1">Office Furniture Issue</p>
                <p className="text-xs text-gray-600">High elasticity (-2.8) and 18.5% discounts. Focus on value differentiation.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
