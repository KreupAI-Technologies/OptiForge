'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  TrendingUp,
  TrendingDown,
  Award,
  AlertCircle,
  Star,
  Package,
  Truck,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Shield,
  FileText,
  BarChart3,
  Download,
  Filter,
  Calendar,
  Building2,
  Target,
  Zap,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  Activity,
  Percent,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Eye
} from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PieChart,
  Pie,
  Cell,
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
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  RadialBarChart,
  RadialBar
} from 'recharts'
import { VendorScorecard } from '@/components/procurement/VendorScorecard'
import { ContractHealth } from '@/components/procurement/ContractHealth'
import {
  procurementOperationsService,
  VendorPerformanceMetric,
} from '@/services/procurement-operations.service'

interface VendorMetrics {
  vendorId: string
  vendorName: string
  vendorCode: string
  category: string
  overallScore: number
  qualityScore: number
  deliveryScore: number
  priceScore: number
  serviceScore: number
  complianceScore: number
  onTimeDeliveryRate: number
  defectRate: number
  responseTime: number
  orderVolume: number
  totalSpend: number
  acceptanceRate: number
  averageLeadTime: number
  priceVariance: number
  contractCompliance: number
  certificationsValid: boolean
  riskLevel: 'low' | 'medium' | 'high'
  trend: 'improving' | 'stable' | 'declining'
}

export default function VendorPerformancePage() {
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('quarter')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedMetric, setSelectedMetric] = useState<'quality' | 'delivery' | 'price' | 'service'>('quality')
  const [compareMode, setCompareMode] = useState(false)
  const [selectedVendors, setSelectedVendors] = useState<string[]>([])

  const [vendorMetrics, setVendorMetrics] = useState<VendorMetrics[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const mapMetric = (m: VendorPerformanceMetric): VendorMetrics => ({
    vendorId: m.vendorId,
    vendorName: m.vendorName,
    vendorCode: m.vendorCode,
    category: m.category,
    overallScore: Number(m.overallScore) || 0,
    qualityScore: Number(m.qualityScore) || 0,
    deliveryScore: Number(m.deliveryScore) || 0,
    priceScore: Number(m.priceScore) || 0,
    serviceScore: Number(m.serviceScore) || 0,
    complianceScore: Number(m.complianceScore) || 0,
    onTimeDeliveryRate: Number(m.onTimeDeliveryRate) || 0,
    defectRate: Number(m.defectRate) || 0,
    // Fields not surfaced by the metrics endpoint — derive safe defaults
    responseTime: 0,
    orderVolume: Number(m.orderVolume) || 0,
    totalSpend: Number(m.totalSpend) || 0,
    acceptanceRate: Math.max(0, 100 - (Number(m.defectRate) || 0)),
    averageLeadTime: 0,
    priceVariance: 0,
    contractCompliance: Number(m.complianceScore) || 0,
    certificationsValid: (Number(m.complianceScore) || 0) >= 60,
    riskLevel: m.riskLevel || 'medium',
    trend: m.trend || 'stable',
  })

  const loadMetrics = useCallback(async (category: string) => {
    setLoading(true)
    setError(null)
    try {
      const data =
        await procurementOperationsService.getVendorPerformanceMetrics(category)
      setVendorMetrics(Array.isArray(data) ? data.map(mapMetric) : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load metrics')
      setVendorMetrics([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadMetrics(selectedCategory)
  }, [loadMetrics, selectedCategory])

  // Performance trend data
  const performanceTrend = [
    { month: 'Jan', quality: 85, delivery: 82, price: 88, service: 84 },
    { month: 'Feb', quality: 87, delivery: 84, price: 86, service: 85 },
    { month: 'Mar', quality: 88, delivery: 86, price: 87, service: 86 },
    { month: 'Apr', quality: 86, delivery: 88, price: 85, service: 87 },
    { month: 'May', quality: 89, delivery: 87, price: 86, service: 88 },
    { month: 'Jun', quality: 90, delivery: 89, price: 88, service: 89 }
  ]

  // Category performance comparison
  const categoryPerformance = [
    { category: 'IT Equipment', score: 92, vendors: 3 },
    { category: 'Manufacturing', score: 78, vendors: 5 },
    { category: 'Chemicals', score: 85, vendors: 2 },
    { category: 'Safety', score: 65, vendors: 4 },
    { category: 'Furniture', score: 88, vendors: 2 }
  ]

  // Delivery performance distribution
  const deliveryDistribution = [
    { name: 'On Time', value: 68, color: '#10B981' },
    { name: 'Early', value: 12, color: '#3B82F6' },
    { name: '1-3 Days Late', value: 15, color: '#F59E0B' },
    { name: '>3 Days Late', value: 5, color: '#EF4444' }
  ]

  // Quality metrics distribution
  const qualityMetrics = [
    { metric: 'Visual Inspection', pass: 95, fail: 5 },
    { metric: 'Dimensional', pass: 92, fail: 8 },
    { metric: 'Functional', pass: 88, fail: 12 },
    { metric: 'Documentation', pass: 96, fail: 4 },
    { metric: 'Packaging', pass: 94, fail: 6 }
  ]

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 80) return 'text-blue-600'
    if (score >= 70) return 'text-yellow-600'
    if (score >= 60) return 'text-orange-600'
    return 'text-red-600'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return 'bg-green-100'
    if (score >= 80) return 'bg-blue-100'
    if (score >= 70) return 'bg-yellow-100'
    if (score >= 60) return 'bg-orange-100'
    return 'bg-red-100'
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'high':
        return 'bg-red-100 text-red-800 border-red-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'declining':
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  const [selectedVendorForScorecard, setSelectedVendorForScorecard] = useState<string | null>(null)

  const topVendors = [...vendorMetrics].sort((a, b) => b.overallScore - a.overallScore).slice(0, 3)
  const bottomVendors = [...vendorMetrics].sort((a, b) => a.overallScore - b.overallScore).slice(0, 3)

  // Calculate overall statistics (guard against divide-by-zero)
  const count = vendorMetrics.length || 1
  const stats = {
    avgScore: Math.round(vendorMetrics.reduce((sum, v) => sum + v.overallScore, 0) / count),
    avgDelivery: Math.round(vendorMetrics.reduce((sum, v) => sum + v.onTimeDeliveryRate, 0) / count),
    avgQuality: Math.round(vendorMetrics.reduce((sum, v) => sum + v.acceptanceRate, 0) / count),
    totalSpend: vendorMetrics.reduce((sum, v) => sum + v.totalSpend, 0),
    highRiskVendors: vendorMetrics.filter(v => v.riskLevel === 'high').length,
    improvingVendors: vendorMetrics.filter(v => v.trend === 'improving').length
  }

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vendor Performance Dashboard</h1>
          <p className="text-gray-500 mt-1">Track and analyze vendor KPIs and performance metrics</p>
        </div>
        <div className="flex gap-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <button
            onClick={() => loadMetrics(selectedCategory)}
            disabled={loading}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Status banners */}
      {loading && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 rounded-lg p-3 text-sm">
          Loading vendor performance metrics...
        </div>
      )}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => loadMetrics(selectedCategory)} className="underline">Retry</button>
        </div>
      )}
      {!loading && !error && vendorMetrics.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 rounded-lg p-3 text-sm">
          No vendor evaluations found. Complete vendor evaluations to populate this dashboard.
        </div>
      )}

      {/* Contract Health Alerts Section */}
      <ContractHealth />

      {/* Real-time Vendor Scorecard (Conditional) */}
      {selectedVendorForScorecard && (
        <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-blue-900 flex items-center gap-2">
              <Star className="h-5 w-5 text-blue-600" />
              Real-time Scorecard: {vendorMetrics.find(v => v.vendorId === selectedVendorForScorecard)?.vendorName}
            </h3>
            <button
              onClick={() => setSelectedVendorForScorecard(null)}
              className="text-xs text-blue-600 hover:underline font-bold"
            >
              Close Scorecard
            </button>
          </div>
          <VendorScorecard vendorId={selectedVendorForScorecard} />
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <Award className="h-8 w-8 text-indigo-500" />
            <span className="text-xs text-green-600 font-medium flex items-center gap-1">
              <ArrowUp className="h-3 w-3" />
              5%
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.avgScore}%</p>
          <p className="text-sm text-gray-500 mt-1">Avg Performance</p>
        </div>

        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <Truck className="h-8 w-8 text-blue-500" />
            <span className="text-xs text-green-600 font-medium flex items-center gap-1">
              <ArrowUp className="h-3 w-3" />
              3%
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.avgDelivery}%</p>
          <p className="text-sm text-gray-500 mt-1">On-Time Delivery</p>
        </div>

        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <Shield className="h-8 w-8 text-green-500" />
            <span className="text-xs text-red-600 font-medium flex items-center gap-1">
              <ArrowDown className="h-3 w-3" />
              1%
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.avgQuality}%</p>
          <p className="text-sm text-gray-500 mt-1">Quality Rate</p>
        </div>

        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="h-8 w-8 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">${(stats.totalSpend / 1000000).toFixed(1)}M</p>
          <p className="text-sm text-gray-500 mt-1">Total Spend</p>
        </div>

        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-red-600">{stats.highRiskVendors}</p>
          <p className="text-sm text-gray-500 mt-1">High Risk</p>
        </div>

        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-600">{stats.improvingVendors}</p>
          <p className="text-sm text-gray-500 mt-1">Improving</p>
        </div>
      </div>

      {/* Performance Trend Chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-3">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Performance Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={performanceTrend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="quality" stroke="#10B981" strokeWidth={2} name="Quality" />
            <Line type="monotone" dataKey="delivery" stroke="#3B82F6" strokeWidth={2} name="Delivery" />
            <Line type="monotone" dataKey="price" stroke="#8B5CF6" strokeWidth={2} name="Price" />
            <Line type="monotone" dataKey="service" stroke="#F59E0B" strokeWidth={2} name="Service" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Category Performance */}
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Category Performance</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={categoryPerformance} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="category" type="category" width={100} />
              <Tooltip />
              <Bar dataKey="score" fill="#3B82F6">
                {categoryPerformance.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.score >= 80 ? '#10B981' : entry.score >= 70 ? '#F59E0B' : '#EF4444'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Delivery Distribution */}
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Delivery Performance</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={deliveryDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
              >
                {deliveryDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Vendor Scorecard Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-3 py-2 bg-gray-50 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Vendor Scorecard</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vendor
                </th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Overall Score
                </th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quality
                </th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Delivery
                </th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Compliance
                </th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Risk Level
                </th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trend
                </th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {vendorMetrics.map((vendor) => (
                <tr key={vendor.vendorId} className="hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{vendor.vendorName}</div>
                      <div className="text-xs text-gray-500">{vendor.vendorCode} • {vendor.category}</div>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${getScoreBgColor(vendor.overallScore)}`}>
                      <span className={`text-xl font-bold ${getScoreColor(vendor.overallScore)}`}>
                        {vendor.overallScore}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <span className={`text-sm font-medium ${getScoreColor(vendor.qualityScore)}`}>
                      {vendor.qualityScore}%
                    </span>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <span className={`text-sm font-medium ${getScoreColor(vendor.deliveryScore)}`}>
                      {vendor.deliveryScore}%
                    </span>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <span className={`text-sm font-medium ${getScoreColor(vendor.priceScore)}`}>
                      {vendor.priceScore}%
                    </span>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <span className={`text-sm font-medium ${getScoreColor(vendor.serviceScore)}`}>
                      {vendor.serviceScore}%
                    </span>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <div className="flex flex-col items-center">
                      <span className={`text-sm font-medium ${getScoreColor(vendor.complianceScore)}`}>
                        {vendor.complianceScore}%
                      </span>
                      {vendor.certificationsValid ? (
                        <CheckCircle className="h-4 w-4 text-green-500 mt-1" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500 mt-1" />
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getRiskColor(vendor.riskLevel)}`}>
                      {vendor.riskLevel}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {getTrendIcon(vendor.trend)}
                      <span className="text-xs text-gray-500">{vendor.trend}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <button
                      onClick={() => setSelectedVendorForScorecard(vendor.vendorId)}
                      className={`p-2 rounded-lg transition-colors ${selectedVendorForScorecard === vendor.vendorId ? 'bg-blue-600 text-white' : 'text-blue-600 hover:bg-blue-50'}`}
                      title="View Live Scorecard"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Top Performers */}
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <ThumbsUp className="h-5 w-5 text-green-500" />
            Top Performers
          </h3>
          <div className="space-y-3">
            {topVendors.map((vendor, index) => (
              <div key={vendor.vendorId} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{vendor.vendorName}</p>
                    <p className="text-xs text-gray-500">{vendor.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">{vendor.overallScore}%</p>
                  <p className="text-xs text-gray-500">Score</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Performers */}
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <ThumbsDown className="h-5 w-5 text-red-500" />
            Needs Improvement
          </h3>
          <div className="space-y-3">
            {bottomVendors.map((vendor, index) => (
              <div key={vendor.vendorId} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{vendor.vendorName}</p>
                    <p className="text-xs text-gray-500">{vendor.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-red-600">{vendor.overallScore}%</p>
                  <p className="text-xs text-gray-500">Score</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quality Metrics */}
      <div className="bg-white rounded-lg border border-gray-200 p-3">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Quality Metrics Analysis</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={qualityMetrics}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="metric" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="pass" stackId="a" fill="#10B981" name="Pass Rate" />
            <Bar dataKey="fail" stackId="a" fill="#EF4444" name="Fail Rate" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}