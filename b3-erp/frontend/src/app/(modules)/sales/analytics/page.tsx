'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, Package, Users, ShoppingCart, BarChart3, PieChart, Target, Calendar, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { salesConfigService, SalesAnalyticsDashboardDto } from '@/services/sales-config.service'

const EMPTY_STATS: SalesAnalyticsDashboardDto['currentStats'] = {
  revenue: 0,
  revenueGrowth: 0,
  orders: 0,
  ordersGrowth: 0,
  avgOrderValue: 0,
  avgOrderGrowth: 0,
  customers: 0,
  customersGrowth: 0,
  conversionRate: 0,
  conversionGrowth: 0,
}

export default function SalesAnalyticsPage() {
  const router = useRouter()
  const [timeframe, setTimeframe] = useState('month')

  const [monthlySales, setMonthlySales] = useState<SalesAnalyticsDashboardDto['monthlySales']>([])
  const [categoryData, setCategoryData] = useState<SalesAnalyticsDashboardDto['categoryData']>([])
  const [topProducts, setTopProducts] = useState<SalesAnalyticsDashboardDto['topProducts']>([])
  const [regionalData, setRegionalData] = useState<SalesAnalyticsDashboardDto['regionalData']>([])
  const [currentStats, setCurrentStats] = useState(EMPTY_STATS)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setIsLoading(true)
      setLoadError(null)
      try {
        const data = await salesConfigService.getAnalyticsDashboard()
        if (cancelled) return
        setCurrentStats(data.currentStats ?? EMPTY_STATS)
        setMonthlySales(Array.isArray(data.monthlySales) ? data.monthlySales : [])
        setCategoryData(Array.isArray(data.categoryData) ? data.categoryData : [])
        setTopProducts(Array.isArray(data.topProducts) ? data.topProducts : [])
        setRegionalData(Array.isArray(data.regionalData) ? data.regionalData : [])
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load analytics')
          setCurrentStats(EMPTY_STATS)
          setMonthlySales([])
          setCategoryData([])
          setTopProducts([])
          setRegionalData([])
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

  const maxMonthlyRevenue = Math.max(1, ...monthlySales.map((m) => m.revenue))
  const maxCategoryRevenue = Math.max(1, ...categoryData.map((c) => c.revenue))
  const maxRegionalRevenue = Math.max(1, ...regionalData.map((r) => r.revenue))

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
            <h1 className="text-2xl font-bold text-gray-900">Sales Analytics Dashboard</h1>
            <p className="text-sm text-gray-600 mt-1">Comprehensive sales performance insights</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading sales analytics…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-5 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-blue-100">Total Revenue</p>
            <DollarSign className="h-5 w-5 text-blue-200" />
          </div>
          <p className="text-3xl font-bold">₹{(currentStats.revenue / 10000000).toFixed(2)}Cr</p>
          <div className="flex items-center gap-1 mt-2">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm">{currentStats.revenueGrowth}% vs last month</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-5 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-green-100">Total Orders</p>
            <ShoppingCart className="h-5 w-5 text-green-200" />
          </div>
          <p className="text-3xl font-bold">{currentStats.orders}</p>
          <div className="flex items-center gap-1 mt-2">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm">{currentStats.ordersGrowth}% vs last month</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-5 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-purple-100">Avg Order Value</p>
            <BarChart3 className="h-5 w-5 text-purple-200" />
          </div>
          <p className="text-3xl font-bold">₹{(currentStats.avgOrderValue / 1000).toFixed(0)}K</p>
          <div className="flex items-center gap-1 mt-2">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm">{currentStats.avgOrderGrowth}% vs last month</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-5 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-orange-100">Active Customers</p>
            <Users className="h-5 w-5 text-orange-200" />
          </div>
          <p className="text-3xl font-bold">{currentStats.customers}</p>
          <div className="flex items-center gap-1 mt-2">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm">{currentStats.customersGrowth}% vs last month</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg p-5 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-pink-100">Conversion Rate</p>
            <Target className="h-5 w-5 text-pink-200" />
          </div>
          <p className="text-3xl font-bold">{currentStats.conversionRate}%</p>
          <div className="flex items-center gap-1 mt-2">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm">{currentStats.conversionGrowth}% vs last month</span>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2 mb-3">
        <Link href="/sales/analytics/reports" className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Reports</h3>
              <p className="text-xs text-gray-600">Sales reports</p>
            </div>
          </div>
        </Link>

        <Link href="/sales/analytics/products" className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Package className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Products</h3>
              <p className="text-xs text-gray-600">Product analytics</p>
            </div>
          </div>
        </Link>

        <Link href="/sales/analytics/customers" className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Customers</h3>
              <p className="text-xs text-gray-600">Customer insights</p>
            </div>
          </div>
        </Link>

        <Link href="/sales/analytics/forecast" className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Forecast</h3>
              <p className="text-xs text-gray-600">Sales predictions</p>
            </div>
          </div>
        </Link>

        <Link href="/sales/analytics/targets" className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-pink-100 rounded-lg">
              <Target className="h-6 w-6 text-pink-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Targets</h3>
              <p className="text-xs text-gray-600">Goals & targets</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Monthly Trend Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Revenue Trend (₹ Lakhs)</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Jan - Oct 2025</span>
          </div>
        </div>
        <div className="space-y-2">
          {monthlySales.map((data, index) => (
            <div key={data.month} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700 w-12">{data.month}</span>
                <span className="text-gray-600 w-20 text-right">{data.orders} orders</span>
                <span className="font-semibold text-gray-900 w-24 text-right">₹{data.revenue}L</span>
              </div>
              <div className="relative w-full bg-gray-200 rounded-full h-3">
                <div
                  className="absolute top-0 left-0 h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"
                  style={{ width: `${(data.revenue / maxMonthlyRevenue) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Performance & Regional Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
        {/* Category Performance */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">Category Performance</h2>
            <PieChart className="h-5 w-5 text-gray-600" />
          </div>
          <div className="space-y-2">
            {categoryData.map((cat) => (
              <div key={cat.category} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700">{cat.category}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">{cat.orders} orders</span>
                    <span className={`flex items-center gap-1 ${cat.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {cat.growth >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {Math.abs(cat.growth)}%
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full bg-${cat.color}-500`}
                      style={{ width: `${(cat.revenue / maxCategoryRevenue) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-gray-900 w-20 text-right">₹{(cat.revenue / 100000).toFixed(1)}L</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Regional Performance */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">Regional Performance</h2>
            <BarChart3 className="h-5 w-5 text-gray-600" />
          </div>
          <div className="space-y-3">
            {regionalData.map((region) => (
              <div key={region.region} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">{region.region}</span>
                  <span className={`flex items-center gap-1 text-sm font-semibold ${region.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {region.growth >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    {Math.abs(region.growth)}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full bg-${region.color}-500`}
                      style={{ width: `${(region.revenue / maxRegionalRevenue) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{region.orders} orders</span>
                  <span className="font-semibold text-gray-900">₹{(region.revenue / 100000).toFixed(1)}L</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Performing Products */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Top Performing Kitchen Products</h2>
          <Package className="h-5 w-5 text-gray-600" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Rank</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Product Name</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Product Code</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Units Sold</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Avg Price</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((product, index) => (
                <tr key={product.code} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-sm">
                      {index + 1}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-medium text-gray-900">{product.name}</p>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-600 font-mono">{product.code}</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="font-medium text-gray-900">{product.units.toLocaleString('en-IN')}</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-gray-700">₹{product.avgPrice.toLocaleString('en-IN')}</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="font-semibold text-green-600">₹{(product.revenue / 100000).toFixed(2)}L</span>
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
