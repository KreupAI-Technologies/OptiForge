'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, TrendingUp, Calendar, Package, DollarSign, BarChart3, AlertTriangle, CheckCircle, Activity } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { salesConfigService } from '@/services/sales-config.service'

interface ForecastData {
  month: string
  actualRevenue?: number
  forecastRevenue: number
  actualOrders?: number
  forecastOrders: number
  confidence: number
  trend: 'up' | 'down' | 'stable'
}

interface CategoryForecast {
  category: string
  currentSales: number
  forecastSales: number
  growth: number
  confidence: number
  risk: 'low' | 'medium' | 'high'
  keyDrivers: string[]
}

export default function ForecastPage() {
  const router = useRouter()
  const [forecastPeriod, setForecastPeriod] = useState('3months')

  const [monthlyForecast, setMonthlyForecast] = useState<ForecastData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setIsLoading(true)
      setLoadError(null)
      try {
        const rows = await salesConfigService.getForecast()
        const mapped: ForecastData[] = (rows || []).map((r) => ({
          month: r.period,
          actualRevenue: Number(r.actual) || undefined,
          forecastRevenue: Number(r.predicted) || 0,
          actualOrders: Number(r.orders) || undefined,
          forecastOrders: Number(r.orders) || 0,
          confidence: 80,
          trend: 'stable',
        }))
        if (!cancelled) setMonthlyForecast(mapped)
      } catch (err) {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : 'Failed to load forecast')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const [categoryForecasts] = useState<CategoryForecast[]>([])

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'down':
        return <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />
      case 'stable':
        return <Activity className="h-4 w-4 text-blue-600" />
      default:
        return null
    }
  }

  const totalForecastRevenue = categoryForecasts.reduce((sum, cat) => sum + cat.forecastSales, 0)
  const totalCurrentRevenue = categoryForecasts.reduce((sum, cat) => sum + cat.currentSales, 0)
  const overallGrowth = ((totalForecastRevenue - totalCurrentRevenue) / totalCurrentRevenue) * 100

  const nextMonthForecast = monthlyForecast.find(m => !m.actualRevenue)
  const avgConfidence = categoryForecasts.length > 0 ? categoryForecasts.reduce((sum, cat) => sum + cat.confidence, 0) / categoryForecasts.length : 0

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
            <h1 className="text-2xl font-bold text-gray-900">Sales Forecast</h1>
            <p className="text-sm text-gray-600 mt-1">AI-powered sales predictions for kitchen products</p>
          </div>
        </div>
        <select
          value={forecastPeriod}
          onChange={(e) => setForecastPeriod(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
        >
          <option value="1month">Next Month</option>
          <option value="3months">Next 3 Months</option>
          <option value="6months">Next 6 Months</option>
          <option value="12months">Next 12 Months</option>
        </select>
      </div>

      {/* Key Forecast Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-5 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-blue-100">Next Month Forecast</p>
            <Calendar className="h-5 w-5 text-blue-200" />
          </div>
          <p className="text-3xl font-bold">₹{nextMonthForecast ? (nextMonthForecast.forecastRevenue / 100000).toFixed(1) : '0'}L</p>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-1">
              {getTrendIcon(nextMonthForecast?.trend || 'stable')}
              <span className="text-sm">{nextMonthForecast?.forecastOrders} orders</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-5 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-green-100">Q4 2025 Forecast</p>
            <DollarSign className="h-5 w-5 text-green-200" />
          </div>
          <p className="text-3xl font-bold">₹{(totalForecastRevenue / 10000000).toFixed(2)}Cr</p>
          <div className="flex items-center gap-1 mt-2">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm">{overallGrowth.toFixed(1)}% growth</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-5 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-purple-100">Avg Confidence</p>
            <BarChart3 className="h-5 w-5 text-purple-200" />
          </div>
          <p className="text-3xl font-bold">{avgConfidence.toFixed(0)}%</p>
          <div className="flex items-center gap-1 mt-2">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">High accuracy</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-5 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-orange-100">Risk Alert</p>
            <AlertTriangle className="h-5 w-5 text-orange-200" />
          </div>
          <p className="text-3xl font-bold">{categoryForecasts.filter(c => c.risk === 'high').length}</p>
          <p className="text-xs text-orange-100 mt-2">Categories need attention</p>
        </div>
      </div>

      {/* Monthly Forecast Trend */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Monthly Revenue Forecast (₹ Lakhs)</h2>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-sm text-gray-600">Actual</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <span className="text-sm text-gray-600">Forecast</span>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          {monthlyForecast.map((data) => (
            <div key={data.month} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 w-32">
                  <span className="font-medium text-gray-700">{data.month}</span>
                  {getTrendIcon(data.trend)}
                </div>
                <div className="flex-1 flex items-center gap-2">
                  {data.actualRevenue && (
                    <div className="text-blue-600 font-medium w-24 text-right">
                      ₹{(data.actualRevenue / 1000).toFixed(0)}L
                    </div>
                  )}
                  <div className="text-purple-600 font-semibold w-24 text-right">
                    ₹{(data.forecastRevenue / 1000).toFixed(0)}L
                  </div>
                  <div className="text-gray-600 w-20 text-right">
                    {data.forecastOrders} orders
                  </div>
                  <div className="w-24">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      data.confidence >= 85 ? 'bg-green-100 text-green-700' :
                      data.confidence >= 75 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {data.confidence}% confidence
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                {data.actualRevenue && (
                  <div className="relative flex-1 bg-gray-200 rounded-full h-3">
                    <div
                      className="absolute top-0 left-0 h-3 rounded-full bg-blue-500"
                      style={{ width: `${(data.actualRevenue / 67800) * 100}%` }}
                    />
                  </div>
                )}
                <div className="relative flex-1 bg-gray-200 rounded-full h-3">
                  <div
                    className="absolute top-0 left-0 h-3 rounded-full bg-purple-500"
                    style={{ width: `${(data.forecastRevenue / 67800) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Forecasts */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Category-wise Forecast Analysis</h2>
          <Package className="h-5 w-5 text-gray-600" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {categoryForecasts.map((forecast) => (
            <div key={forecast.category} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-gray-900">{forecast.category}</h3>
                  <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium border ${getRiskColor(forecast.risk)}`}>
                    {forecast.risk.toUpperCase()} RISK
                  </span>
                </div>
                <div className="text-right">
                  <div className={`flex items-center gap-1 justify-end ${forecast.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {forecast.growth >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingUp className="h-5 w-5 rotate-180" />}
                    <span className="font-bold text-lg">{Math.abs(forecast.growth)}%</span>
                  </div>
                  <span className="text-xs text-gray-600">Growth</span>
                </div>
              </div>

              {/* Current vs Forecast */}
              <div className="grid grid-cols-2 gap-3 mb-2">
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <p className="text-xs text-blue-700 mb-1">Current Sales</p>
                  <p className="font-semibold text-blue-900">₹{(forecast.currentSales / 100000).toFixed(2)}L</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                  <p className="text-xs text-green-700 mb-1">Forecast Sales</p>
                  <p className="font-semibold text-green-900">₹{(forecast.forecastSales / 100000).toFixed(2)}L</p>
                </div>
              </div>

              {/* Confidence Bar */}
              <div className="mb-2">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600">Confidence Level</span>
                  <span className="font-semibold text-gray-900">{forecast.confidence}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${
                      forecast.confidence >= 85 ? 'bg-green-500' :
                      forecast.confidence >= 75 ? 'bg-yellow-500' :
                      'bg-orange-500'
                    }`}
                    style={{ width: `${forecast.confidence}%` }}
                  />
                </div>
              </div>

              {/* Key Drivers */}
              <div>
                <p className="text-xs text-gray-600 mb-2 font-medium">Key Growth Drivers:</p>
                <ul className="space-y-1">
                  {forecast.keyDrivers.map((driver, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-gray-700">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                      {driver}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Forecast Accuracy */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border border-indigo-200 p-3">
        <div className="flex items-start gap-2">
          <div className="p-3 bg-indigo-100 rounded-lg">
            <BarChart3 className="h-8 w-8 text-indigo-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-indigo-900 mb-2">Forecast Model Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
              <div>
                <p className="text-indigo-700 mb-1">Model Type</p>
                <p className="font-semibold text-indigo-900">Time Series + ML Hybrid</p>
              </div>
              <div>
                <p className="text-indigo-700 mb-1">Historical Data Period</p>
                <p className="font-semibold text-indigo-900">24 Months</p>
              </div>
              <div>
                <p className="text-indigo-700 mb-1">Last Updated</p>
                <p className="font-semibold text-indigo-900">Oct 20, 2025</p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-white rounded-lg border border-indigo-200">
              <p className="text-sm text-indigo-700">
                <strong>Note:</strong> Forecasts are based on historical sales patterns, seasonal trends, market conditions, and economic indicators.
                Actual results may vary based on external factors such as competition, market dynamics, and unforeseen events.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
