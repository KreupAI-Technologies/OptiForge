'use client'

import { useState, useEffect } from 'react'
import {
  Package,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  GitMerge,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Filter
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

// Fixed colour palette for the product-mix pie (config, not data).
const PRODUCT_MIX_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#6b7280']

interface ProductMixRow { category: string; value: number; percentage: number; deals: number; color: string }
interface ProductTrendRow { month: string; kitchens: number; wardrobes: number; living: number; office: number; bathroom: number }
interface BundleRow { name: string; popularity: number; avgValue: number; margin: number; conversionRate: number }
interface ConfigTrendRow { feature: string; adoption: number; avgUpsell: number; deals: number }
interface CrossSellRow { product: string; successRate: number; avgValue: number; attempts: number; conversions: number }
interface ProfitabilityRow { category: string; revenue: number; cost: number; margin: number; deals: number; profitRatio: number }
interface TopProductRow { name: string; revenue: number; deals: number; avgValue: number; margin: number }

export default function CPQAnalyticsProductsPage() {
  const [timeRange, setTimeRange] = useState('last-6-months')

  // Data arrays wired to GET /cpq/analytics/dashboards/products. The dashboard
  // aggregates cpq_quote_items into topProducts; product mix and profitability
  // are derived from those same rows. Trend/bundle/config/cross-sell views have
  // no backing field on the endpoint and stay empty until the API exposes them.
  const [productMix, setProductMix] = useState<ProductMixRow[]>([])
  const [productTrend, setProductTrend] = useState<ProductTrendRow[]>([])
  const [bundles, setBundles] = useState<BundleRow[]>([])
  const [configTrends, setConfigTrends] = useState<ConfigTrendRow[]>([])
  const [crossSell, setCrossSell] = useState<CrossSellRow[]>([])
  const [profitability, setProfitability] = useState<ProfitabilityRow[]>([])
  const [topProducts, setTopProducts] = useState<TopProductRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setIsLoading(true)
      setLoadError(null)
      try {
        const dash = await cpqAnalyticsLiveService.getProductsDashboard()
        const rows = dash.topProducts ?? []
        const totalRevenue = dash.metrics?.totalRevenue || rows.reduce((s, r) => s + Number(r.totalRevenue || 0), 0)

        const top: TopProductRow[] = rows.map((r) => ({
          name: r.name || r.productId || 'Unknown',
          revenue: Number((Number(r.totalRevenue || 0) / 10000000).toFixed(2)), // ₹Cr
          deals: Number(r.timesQuoted || 0),
          avgValue: Number((Number(r.avgSellingPrice || 0) / 100000).toFixed(2)), // ₹L
          margin: 0,
        }))

        const mix: ProductMixRow[] = rows.map((r, idx) => {
          const rev = Number(r.totalRevenue || 0)
          return {
            category: r.name || r.productId || 'Unknown',
            value: Number((rev / 10000000).toFixed(2)),
            percentage: totalRevenue ? Number(((rev / totalRevenue) * 100).toFixed(1)) : 0,
            deals: Number(r.timesQuoted || 0),
            color: PRODUCT_MIX_COLORS[idx % PRODUCT_MIX_COLORS.length],
          }
        })

        const profit: ProfitabilityRow[] = rows.map((r) => {
          const rev = Number(r.totalRevenue || 0) / 10000000
          return {
            category: r.name || r.productId || 'Unknown',
            revenue: Number(rev.toFixed(2)),
            cost: 0,
            margin: 0,
            deals: Number(r.timesQuoted || 0),
            profitRatio: 0,
          }
        })

        if (!cancelled) {
          setTopProducts(top)
          setProductMix(mix)
          setProfitability(profit)
          setProductTrend([])
          setBundles([])
          setConfigTrends([])
          setCrossSell([])
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load product analytics')
          setProductMix([]); setProductTrend([]); setBundles([])
          setConfigTrends([]); setCrossSell([]); setProfitability([]); setTopProducts([])
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
          <h2 className="text-2xl font-bold text-gray-900">Product Analytics</h2>
          <p className="text-sm text-gray-600 mt-1">Comprehensive product mix, bundling, and profitability analysis</p>
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
        <div className="mb-3 text-sm text-gray-500">Loading product analytics...</div>
      )}
      {!isLoading && loadError && (
        <div className="mb-3 text-sm text-red-600">{loadError}</div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-5 border border-blue-200">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-blue-600">Total Product Revenue</p>
            <DollarSign className="h-8 w-8 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-blue-900">₹14.3Cr</p>
          <div className="flex items-center gap-1 mt-2 text-sm">
            <ArrowUpRight className="h-4 w-4 text-green-600" />
            <span className="text-green-600 font-semibold">18.5%</span>
            <span className="text-blue-700">vs last period</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-5 border border-purple-200">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-purple-600">Product Categories</p>
            <Package className="h-8 w-8 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-purple-900">6</p>
          <p className="text-xs text-purple-700 mt-2">506 total deals</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-5 border border-green-200">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-green-600">Bundle Adoption</p>
            <GitMerge className="h-8 w-8 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-green-900">58.5%</p>
          <p className="text-xs text-green-700 mt-2">468 bundled deals</p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-5 border border-orange-200">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-orange-600">Avg Product Margin</p>
            <TrendingUp className="h-8 w-8 text-orange-600" />
          </div>
          <p className="text-3xl font-bold text-orange-900">27.2%</p>
          <div className="flex items-center gap-1 mt-2 text-sm">
            <span className="text-orange-700">Across all categories</span>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
        {/* Product Mix */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Product Mix by Revenue</h3>
              <p className="text-sm text-gray-600">Revenue distribution across categories</p>
            </div>
            <Package className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex items-center gap-3">
            <ResponsiveContainer width="50%" height={250}>
              <PieChart>
                <Pie
                  data={productMix}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, percentage }) => `${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="percentage"
                >
                  {productMix.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {productMix.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm font-medium text-gray-700">{item.category}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">₹{item.value}Cr</p>
                    <p className="text-xs text-gray-500">{item.deals} deals</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Product Revenue Trend */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Product Revenue Trend</h3>
              <p className="text-sm text-gray-600">Monthly revenue by category (₹Cr)</p>
            </div>
            <TrendingUp className="h-6 w-6 text-green-600" />
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={productTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="kitchens" stackId="1" stroke="#3b82f6" fill="#93c5fd" name="Kitchens" />
              <Area type="monotone" dataKey="wardrobes" stackId="1" stroke="#8b5cf6" fill="#c4b5fd" name="Wardrobes" />
              <Area type="monotone" dataKey="living" stackId="1" stroke="#10b981" fill="#6ee7b7" name="Living Room" />
              <Area type="monotone" dataKey="office" stackId="1" stroke="#f59e0b" fill="#fcd34d" name="Office" />
              <Area type="monotone" dataKey="bathroom" stackId="1" stroke="#ef4444" fill="#fca5a5" name="Bathroom" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bundle Performance */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-3 mb-3">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Bundle Performance</h3>
            <p className="text-sm text-gray-600">Popular product bundles and their metrics</p>
          </div>
          <GitMerge className="h-6 w-6 text-purple-600" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Bundle Name</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Popularity</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Avg Value</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Margin</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Conversion Rate</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Performance</th>
              </tr>
            </thead>
            <tbody>
              {bundles.map((bundle, idx) => (
                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <p className="font-medium text-gray-900">{bundle.name}</p>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-gray-900 font-medium">{bundle.popularity}</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-blue-600 font-bold">₹{bundle.avgValue}L</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      bundle.margin >= 28 ? 'bg-green-100 text-green-700' :
                      bundle.margin >= 25 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {bundle.margin}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-purple-600 font-bold">{bundle.conversionRate}%</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      bundle.conversionRate >= 60 ? 'bg-green-100 text-green-700' :
                      bundle.conversionRate >= 50 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {bundle.conversionRate >= 60 ? 'Excellent' :
                       bundle.conversionRate >= 50 ? 'Good' : 'Average'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Configuration Trends */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-3 mb-3">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Configuration & Upsell Trends</h3>
            <p className="text-sm text-gray-600">Feature adoption and average upsell value</p>
          </div>
          <Target className="h-6 w-6 text-orange-600" />
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={configTrends}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="feature" angle={-45} textAnchor="end" height={100} />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="adoption" fill="#8b5cf6" name="Adoption %" />
            <Bar yAxisId="right" dataKey="avgUpsell" fill="#10b981" name="Avg Upsell (₹L)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Cross-Sell Performance */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-3 mb-3">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Cross-Sell Performance</h3>
            <p className="text-sm text-gray-600">Product cross-sell success rates and values</p>
          </div>
          <ShoppingCart className="h-6 w-6 text-green-600" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Product Pair</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Attempts</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Conversions</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Success Rate</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Avg Value</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Effectiveness</th>
              </tr>
            </thead>
            <tbody>
              {crossSell.map((item, idx) => (
                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <p className="font-medium text-gray-900">{item.product}</p>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-gray-700">{item.attempts}</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-green-600 font-medium">{item.conversions}</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      item.successRate >= 45 ? 'bg-green-100 text-green-700' :
                      item.successRate >= 35 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {item.successRate}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-blue-600 font-bold">₹{item.avgValue}L</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      item.successRate >= 45 ? 'bg-green-100 text-green-700' :
                      item.successRate >= 35 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {item.successRate >= 45 ? 'High' :
                       item.successRate >= 35 ? 'Medium' : 'Low'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
        {/* Product Profitability */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Product Profitability</h3>
              <p className="text-sm text-gray-600">Revenue vs cost by category (₹Cr)</p>
            </div>
            <DollarSign className="h-6 w-6 text-green-600" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={profitability}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenue" fill="#3b82f6" name="Revenue" />
              <Bar dataKey="cost" fill="#ef4444" name="Cost" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Top 5 Products by Revenue</h3>
              <p className="text-sm text-gray-600">Best performing individual products</p>
            </div>
            <Target className="h-6 w-6 text-purple-600" />
          </div>
          <div className="space-y-3">
            {topProducts.map((product, idx) => (
              <div key={idx} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 text-purple-700 font-bold text-sm">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.deals} deals</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-blue-600">₹{product.revenue}Cr</p>
                    <p className="text-xs text-gray-500">₹{product.avgValue}L avg</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className={`px-2 py-1 rounded font-semibold ${
                    product.margin >= 28 ? 'bg-green-100 text-green-700' :
                    product.margin >= 25 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {product.margin}% margin
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Key Insights */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-md border border-blue-200 p-3">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-lg font-bold text-blue-900">Product Strategy Insights</h3>
            <p className="text-sm text-blue-700">Actionable recommendations</p>
          </div>
          <Target className="h-6 w-6 text-blue-600" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
          <div className="bg-white rounded-lg p-3 border border-blue-200">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-1">Kitchen Dominance</p>
                <p className="text-xs text-gray-600">39.4% revenue share with 28.5% margins. Core strength to leverage.</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-blue-200">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <GitMerge className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-1">Bundle Success</p>
                <p className="text-xs text-gray-600">58.5% adoption rate. Complete Kitchen Package leads with 62% conversion.</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-blue-200">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <ShoppingCart className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-1">Cross-Sell Opportunity</p>
                <p className="text-xs text-gray-600">Kitchen→Wardrobe at 45% success. Focus on post-sale engagement.</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-blue-200">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Target className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-1">Feature Upsells</p>
                <p className="text-xs text-gray-600">Smart Storage has 95% avg upsell despite 42% adoption. Promote more.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
