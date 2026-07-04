'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Minus, BarChart3, Calendar, Download, Filter, AlertCircle } from 'lucide-react'
import { supportPagesService } from '@/services/support-pages.service'

interface TicketTrend {
  period: string
  total: number
  open: number
  resolved: number
  closed: number
  change: number
}

interface CategoryData {
  category: string
  count: number
  percentage: number
  avgResolutionTime: string
  trend: 'up' | 'down' | 'stable'
}

interface PriorityDistribution {
  priority: string
  count: number
  percentage: number
  avgResponseTime: string
  slaCompliance: number
}

export default function TicketAnalytics() {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month')
  const [ticketTrends, setTicketTrends] = useState<TicketTrend[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setIsLoading(true)
      setLoadError(null)
      try {
        const raw = await supportPagesService.getOmnichannel()
        // Omnichannel conversations; only period-bearing records map to trend rows.
        const mapped: TicketTrend[] = raw
          .filter((r: any) => r?.period || r?.month)
          .map((r: any) => ({
            period: r.period ?? r.month ?? '',
            total: r.total ?? 0,
            open: r.open ?? 0,
            resolved: r.resolved ?? 0,
            closed: r.closed ?? 0,
            change: r.change ?? 0,
          }))
        if (!cancelled) setTicketTrends(mapped)
      } catch (e) {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : 'Failed to load')
          setTicketTrends([])
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  const categoryData: CategoryData[] = [
    { category: 'Network Issues', count: 145, percentage: 27.7, avgResolutionTime: '4.2 hours', trend: 'up' },
    { category: 'Application Support', count: 132, percentage: 25.2, avgResolutionTime: '6.5 hours', trend: 'down' },
    { category: 'Hardware Problems', count: 98, percentage: 18.7, avgResolutionTime: '8.3 hours', trend: 'stable' },
    { category: 'Access & Permissions', count: 67, percentage: 12.8, avgResolutionTime: '2.1 hours', trend: 'down' },
    { category: 'Email Issues', count: 45, percentage: 8.6, avgResolutionTime: '3.4 hours', trend: 'up' },
    { category: 'Security Incidents', count: 23, percentage: 4.4, avgResolutionTime: '1.8 hours', trend: 'stable' },
    { category: 'Database Issues', count: 13, percentage: 2.5, avgResolutionTime: '5.7 hours', trend: 'down' }
  ]

  const priorityData: PriorityDistribution[] = [
    { priority: 'P0 - Critical', count: 34, percentage: 6.5, avgResponseTime: '8 min', slaCompliance: 97.1 },
    { priority: 'P1 - High', count: 127, percentage: 24.3, avgResponseTime: '24 min', slaCompliance: 94.5 },
    { priority: 'P2 - Medium', count: 245, percentage: 46.8, avgResponseTime: '2.3 hours', slaCompliance: 92.8 },
    { priority: 'P3 - Low', count: 117, percentage: 22.4, avgResponseTime: '8.7 hours', slaCompliance: 95.7 }
  ]

  const emptyTrend: TicketTrend = { period: '', total: 0, open: 0, resolved: 0, closed: 0, change: 0 }
  const currentMonth = ticketTrends.length > 0 ? ticketTrends[ticketTrends.length - 1] : emptyTrend
  const previousMonth = ticketTrends.length > 1 ? ticketTrends[ticketTrends.length - 2] : emptyTrend

  const stats = [
    {
      label: 'Total Tickets',
      value: currentMonth.total,
      change: `${currentMonth.change > 0 ? '+' : ''}${currentMonth.change}%`,
      trend: currentMonth.change > 0 ? 'up' : currentMonth.change < 0 ? 'down' : 'stable',
      icon: BarChart3,
      color: 'blue'
    },
    {
      label: 'Open Tickets',
      value: currentMonth.open,
      change: `${((currentMonth.open - previousMonth.open) / previousMonth.open * 100).toFixed(1)}%`,
      trend: currentMonth.open > previousMonth.open ? 'up' : 'down',
      icon: TrendingUp,
      color: 'orange'
    },
    {
      label: 'Resolved',
      value: currentMonth.resolved,
      change: `${((currentMonth.resolved - previousMonth.resolved) / previousMonth.resolved * 100).toFixed(1)}%`,
      trend: currentMonth.resolved > previousMonth.resolved ? 'up' : 'down',
      icon: TrendingUp,
      color: 'green'
    },
    {
      label: 'Closed',
      value: currentMonth.closed,
      change: `${((currentMonth.closed - previousMonth.closed) / previousMonth.closed * 100).toFixed(1)}%`,
      trend: currentMonth.closed > previousMonth.closed ? 'up' : 'down',
      icon: TrendingUp,
      color: 'purple'
    },
    {
      label: 'Resolution Rate',
      value: `${((currentMonth.resolved / currentMonth.total) * 100).toFixed(1)}%`,
      change: 'This month',
      trend: 'stable',
      icon: BarChart3,
      color: 'green'
    },
    {
      label: 'Avg Resolution Time',
      value: '5.2 hrs',
      change: '-12% vs last month',
      trend: 'down',
      icon: TrendingDown,
      color: 'green'
    }
  ]

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return <TrendingUp className="h-3 w-3" />
    if (trend === 'down') return <TrendingDown className="h-3 w-3" />
    return <Minus className="h-3 w-3" />
  }

  const getTrendColor = (trend: 'up' | 'down' | 'stable', isGoodUp: boolean = true) => {
    if (trend === 'stable') return 'text-gray-500'
    if (isGoodUp) {
      return trend === 'up' ? 'text-green-600' : 'text-red-600'
    } else {
      return trend === 'up' ? 'text-red-600' : 'text-green-600'
    }
  }

  const getPriorityColor = (priority: string) => {
    if (priority.includes('P0')) return 'bg-red-500'
    if (priority.includes('P1')) return 'bg-orange-500'
    if (priority.includes('P2')) return 'bg-yellow-500'
    return 'bg-blue-500'
  }

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ticket Analytics</h1>
          <p className="text-gray-600 mt-1">Comprehensive ticket trends and insights</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading ticket analytics…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          const colorClasses = {
            blue: 'bg-blue-500',
            orange: 'bg-orange-500',
            green: 'bg-green-500',
            purple: 'bg-purple-500'
          }
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm border p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 text-sm">{stat.label}</span>
                <div className={`${colorClasses[stat.color as keyof typeof colorClasses]} p-2 rounded-lg`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className={`text-xs mt-1 flex items-center gap-1 ${getTrendColor(stat.trend as 'up' | 'down' | 'stable', stat.label !== 'Open Tickets')}`}>
                {getTrendIcon(stat.trend as 'up' | 'down' | 'stable')}
                {stat.change}
              </div>
            </div>
          )
        })}
      </div>

      {/* Period Selector */}
      <div className="bg-white rounded-lg shadow-sm border p-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Ticket Volume Trends</h2>
          <div className="flex gap-2">
            {(['week', 'month', 'quarter', 'year'] as const).map(period => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  selectedPeriod === period
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Trend Chart Visualization */}
      <div className="bg-white rounded-lg shadow-sm border p-3">
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span className="text-gray-600">Total</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded"></div>
              <span className="text-gray-600">Open</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-gray-600">Resolved</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded"></div>
              <span className="text-gray-600">Closed</span>
            </div>
          </div>

          {/* Simple Bar Chart */}
          <div className="space-y-2">
            {ticketTrends.slice(-6).map((trend, index) => {
              const maxValue = Math.max(...ticketTrends.map(t => t.total))
              return (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span className="font-medium w-20">{trend.period}</span>
                    <span className="text-gray-500">{trend.total} tickets</span>
                  </div>
                  <div className="flex gap-1 h-8">
                    <div
                      className="bg-blue-500 rounded relative group"
                      style={{ width: `${(trend.total / maxValue) * 100}%` }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-medium opacity-0 group-hover:opacity-100">
                        {trend.total}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1 h-2">
                    <div className="bg-orange-500 rounded" style={{ width: `${(trend.open / maxValue) * 100}%` }}></div>
                    <div className="bg-green-500 rounded" style={{ width: `${(trend.resolved / maxValue) * 100}%` }}></div>
                    <div className="bg-purple-500 rounded" style={{ width: `${(trend.closed / maxValue) * 100}%` }}></div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Category Breakdown and Priority Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Category Breakdown */}
        <div className="bg-white rounded-lg shadow-sm border p-3">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Tickets by Category</h2>
          <div className="space-y-3">
            {categoryData.map((category, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{category.category}</span>
                    <span className={getTrendColor(category.trend)}>
                      {getTrendIcon(category.trend)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-gray-900">{category.count}</span>
                    <span className="text-gray-500 ml-1">({category.percentage}%)</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${category.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500 w-16 text-right">{category.avgResolutionTime}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="bg-white rounded-lg shadow-sm border p-3">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Priority Distribution</h2>
          <div className="space-y-2">
            {priorityData.map((priority, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 ${getPriorityColor(priority.priority)} rounded`}></div>
                    <span className="font-semibold text-gray-900">{priority.priority}</span>
                  </div>
                  <span className="text-xl font-bold text-gray-900">{priority.count}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <div className="text-gray-500 text-xs">Share</div>
                    <div className="font-semibold text-gray-900">{priority.percentage}%</div>
                  </div>
                  <div>
                    <div className="text-gray-500 text-xs">Avg Response</div>
                    <div className="font-semibold text-blue-600">{priority.avgResponseTime}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 text-xs">SLA Compliance</div>
                    <div className={`font-semibold ${priority.slaCompliance >= 95 ? 'text-green-600' : priority.slaCompliance >= 90 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {priority.slaCompliance}%
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Key Insights */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Key Insights
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <TrendingUp className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span><strong>Volume Growth:</strong> Ticket volume increased by {currentMonth.change}% this month, primarily driven by network issues and application support requests.</span>
          </li>
          <li className="flex items-start gap-2">
            <TrendingDown className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span><strong>Resolution Improvement:</strong> Average resolution time decreased by 12% to 5.2 hours, indicating improved team efficiency.</span>
          </li>
          <li className="flex items-start gap-2">
            <BarChart3 className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span><strong>Category Focus:</strong> Network Issues and Application Support account for 52.9% of all tickets. Consider dedicated team resources.</span>
          </li>
          <li className="flex items-start gap-2">
            <TrendingUp className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span><strong>SLA Performance:</strong> P0 Critical tickets maintain 97.1% SLA compliance with 8-minute average response time.</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
