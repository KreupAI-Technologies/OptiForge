'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { cpqAnalyticsLiveService } from '@/services/cpq/cpq-analytics-live.service'
import {
  Package,
  Settings,
  FileText,
  TrendingUp,
  Users,
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  Target,
  Award,
  BarChart3,
  ArrowRight,
  Zap
} from 'lucide-react'

interface DashboardMetric {
  label: string
  value: string
  change: string
  trend: 'up' | 'down' | 'neutral'
  icon: any
  color: string
}

interface RecentQuote {
  id: string
  customer: string
  value: number
  products: number
  status: string
  createdDate: string
}

export default function CPQDashboardPage() {
  const router = useRouter()

  const [recentQuotes, setRecentQuotes] = useState<RecentQuote[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setIsLoading(true)
      setLoadError(null)
      try {
        const raw = await cpqAnalyticsLiveService.getQuotes()
        const statusMap: Record<string, string> = {
          pending: 'pending-approval',
          'pending-approval': 'pending-approval',
          approved: 'approved',
          sent: 'sent',
          draft: 'draft',
        }
        const mapped: RecentQuote[] = raw.slice(0, 8).map((q) => ({
          id: q.quoteNumber || String(q.id),
          customer: q.customerName || 'Unknown',
          value: Number(q.totalAmount ?? 0),
          products: Array.isArray(q.items) ? q.items.length : 0,
          status: statusMap[String(q.status ?? '').toLowerCase()] ?? String(q.status ?? 'draft'),
          createdDate: (q.quoteDate || q.createdAt || '').toString().slice(0, 10),
        }))
        if (!cancelled) setRecentQuotes(mapped)
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load recent quotes')
          setRecentQuotes([])
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

  const metrics: DashboardMetric[] = [
    {
      label: 'Active Quotes',
      value: '48',
      change: '+12%',
      trend: 'up',
      icon: FileText,
      color: 'blue'
    },
    {
      label: 'Quote Value',
      value: '₹8.5Cr',
      change: '+18%',
      trend: 'up',
      icon: DollarSign,
      color: 'green'
    },
    {
      label: 'Win Rate',
      value: '68%',
      change: '+5%',
      trend: 'up',
      icon: Target,
      color: 'purple'
    },
    {
      label: 'Avg Quote Time',
      value: '2.3 days',
      change: '-15%',
      trend: 'up',
      icon: Clock,
      color: 'orange'
    }
  ]

  const quickActions = [
    {
      title: 'New Quote',
      description: 'Create a new configured quote',
      icon: FileText,
      color: 'blue',
      path: '/cpq/quotes/create'
    },
    {
      title: 'Product Configurator',
      description: 'Configure products with options',
      icon: Settings,
      color: 'purple',
      path: '/cpq/products/configurator'
    },
    {
      title: 'Pricing Rules',
      description: 'Manage pricing and discounts',
      icon: DollarSign,
      color: 'green',
      path: '/cpq/pricing/rules'
    },
    {
      title: 'Approval Workflow',
      description: 'Review pending approvals',
      icon: CheckCircle,
      color: 'orange',
      path: '/cpq/workflow/approvals'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'pending-approval':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'sent':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'draft':
        return 'bg-gray-100 text-gray-700 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getMetricColor = (color: string) => {
    const colors: any = {
      blue: 'from-blue-50 to-blue-100 border-blue-200',
      green: 'from-green-50 to-green-100 border-green-200',
      purple: 'from-purple-50 to-purple-100 border-purple-200',
      orange: 'from-orange-50 to-orange-100 border-orange-200'
    }
    return colors[color] || colors.blue
  }

  const getMetricIconColor = (color: string) => {
    const colors: any = {
      blue: 'text-blue-600',
      green: 'text-green-600',
      purple: 'text-purple-600',
      orange: 'text-orange-600'
    }
    return colors[color] || colors.blue
  }

  const getActionColor = (color: string) => {
    const colors: any = {
      blue: 'bg-blue-100 group-hover:bg-blue-200',
      purple: 'bg-purple-100 group-hover:bg-purple-200',
      green: 'bg-green-100 group-hover:bg-green-200',
      orange: 'bg-orange-100 group-hover:bg-orange-200'
    }
    return colors[color] || colors.blue
  }

  const getActionIconColor = (color: string) => {
    const colors: any = {
      blue: 'text-blue-600',
      purple: 'text-purple-600',
      green: 'text-green-600',
      orange: 'text-orange-600'
    }
    return colors[color] || colors.blue
  }

  return (
    <div className="w-full h-full px-4 py-2">
      {/* Welcome Section */}
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900">Configure, Price, Quote</h1>
        <p className="text-sm text-gray-600 mt-1">Streamline your quote-to-order process with intelligent CPQ</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
        {metrics.map((metric, index) => {
          const Icon = metric.icon
          return (
            <div
              key={index}
              className={`bg-gradient-to-br ${getMetricColor(metric.color)} rounded-lg p-5 border`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${getMetricIconColor(metric.color)}`}>
                    {metric.label}
                  </p>
                  <p className={`text-2xl font-bold ${getMetricIconColor(metric.color).replace('600', '900')} mt-1`}>
                    {metric.value}
                  </p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className={`h-4 w-4 ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'} mr-1`} />
                    <span className={`text-xs font-medium ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                      {metric.change}
                    </span>
                    <span className="text-xs text-gray-600 ml-1">vs last month</span>
                  </div>
                </div>
                <Icon className={`h-10 w-10 ${getMetricIconColor(metric.color)}`} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="mb-3">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
          {quickActions.map((action, index) => {
            const Icon = action.icon
            return (
              <button
                key={index}
                onClick={() => router.push(action.path)}
                className="group bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-all text-left"
              >
                <div className={`w-12 h-12 ${getActionColor(action.color)} rounded-lg flex items-center justify-center mb-3 transition-colors`}>
                  <Icon className={`h-6 w-6 ${getActionIconColor(action.color)}`} />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">{action.title}</h3>
                <p className="text-xs text-gray-600">{action.description}</p>
                <div className="flex items-center mt-3 text-blue-600 text-xs font-medium">
                  <span>Get started</span>
                  <ArrowRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Recent Quotes */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-3 py-2 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Recent Quotes</h2>
              <p className="text-sm text-gray-600 mt-1">Latest quote activity</p>
            </div>
            <button
              onClick={() => router.push('/cpq/quotes')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View All
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quote ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Value</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Products</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentQuotes.map((quote) => (
                  <tr key={quote.id} className="hover:bg-gray-50 transition-colors cursor-pointer">
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-blue-600">{quote.id}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-900">{quote.customer}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-semibold text-gray-900">
                        ₹{(quote.value / 100000).toFixed(2)}L
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-sm text-gray-700">{quote.products}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(quote.status)}`}>
                        {quote.status === 'approved' && 'Approved'}
                        {quote.status === 'pending-approval' && 'Pending Approval'}
                        {quote.status === 'sent' && 'Sent'}
                        {quote.status === 'draft' && 'Draft'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-700">{quote.createdDate}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar - Performance Insights */}
        <div className="space-y-3">
          {/* Performance Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Performance Insights</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-purple-600" />
                  <span className="text-sm text-gray-700">Top Product</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">Premium Modular</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  <span className="text-sm text-gray-700">Avg Discount</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">8.5%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-600" />
                  <span className="text-sm text-gray-700">Avg Approval Time</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">1.2 days</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-green-600" />
                  <span className="text-sm text-gray-700">Conversion Rate</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">72%</span>
              </div>
            </div>
          </div>

          {/* Alerts Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Alerts & Notifications</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-900">5 Quotes Pending Approval</p>
                  <p className="text-xs text-yellow-700 mt-1">Action required</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <Zap className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900">New Pricing Rule Active</p>
                  <p className="text-xs text-blue-700 mt-1">Q4 Discount Policy</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-900">12 Quotes Won This Week</p>
                  <p className="text-xs text-green-700 mt-1">Great performance!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
