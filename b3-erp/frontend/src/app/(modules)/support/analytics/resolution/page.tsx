'use client'

import { useState, useEffect } from 'react'
import { Clock, TrendingUp, TrendingDown, AlertCircle, CheckCircle, BarChart3, Download, Filter } from 'lucide-react'
import { supportPagesService } from '@/services/support-pages.service'

interface ResolutionMetric {
  period: string
  avgResolution: number
  target: number
  totalResolved: number
  withinSLA: number
  breached: number
  p0: number
  p1: number
  p2: number
  p3: number
}

interface CategoryEfficiency {
  category: string
  avgResolution: string
  target: string
  efficiency: number
  resolved: number
  firstTimeFixed: number
  reopened: number
  trend: 'up' | 'down' | 'stable'
}

interface BottleneckAnalysis {
  stage: string
  avgTime: string
  percentage: number
  tickets: number
  status: 'good' | 'warning' | 'critical'
}

export default function ResolutionAnalytics() {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter'>('month')
  const [bottleneckAnalysis, setBottleneckAnalysis] = useState<BottleneckAnalysis[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setIsLoading(true)
      setLoadError(null)
      try {
        const raw = await supportPagesService.getOmnichannel()
        // Omnichannel conversations; only stage-bearing records map to bottleneck rows.
        const mapped: BottleneckAnalysis[] = raw
          .filter((r: any) => r?.stage)
          .map((r: any) => ({
            stage: r.stage ?? '',
            avgTime: r.avgTime ?? '',
            percentage: r.percentage ?? 0,
            tickets: r.tickets ?? 0,
            status: (r.status ?? 'good') as BottleneckAnalysis['status'],
          }))
        if (!cancelled) setBottleneckAnalysis(mapped)
      } catch (e) {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : 'Failed to load')
          setBottleneckAnalysis([])
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  const resolutionMetrics: ResolutionMetric[] = [
    { period: 'Week 1', avgResolution: 6.2, target: 8.0, totalResolved: 124, withinSLA: 118, breached: 6, p0: 2.1, p1: 4.5, p2: 7.8, p3: 12.5 },
    { period: 'Week 2', avgResolution: 5.8, target: 8.0, totalResolved: 138, withinSLA: 132, breached: 6, p0: 1.9, p1: 4.2, p2: 7.2, p3: 11.8 },
    { period: 'Week 3', avgResolution: 5.5, target: 8.0, totalResolved: 145, withinSLA: 141, breached: 4, p0: 1.8, p1: 4.0, p2: 6.9, p3: 11.2 },
    { period: 'Week 4', avgResolution: 5.2, target: 8.0, totalResolved: 156, withinSLA: 151, breached: 5, p0: 1.7, p1: 3.8, p2: 6.5, p3: 10.8 }
  ]

  const categoryEfficiency: CategoryEfficiency[] = [
    { category: 'Network Issues', avgResolution: '4.2 hrs', target: '6 hrs', efficiency: 95.5, resolved: 145, firstTimeFixed: 138, reopened: 7, trend: 'up' },
    { category: 'Application Support', avgResolution: '6.5 hrs', target: '8 hrs', efficiency: 91.2, resolved: 132, firstTimeFixed: 120, reopened: 12, trend: 'stable' },
    { category: 'Hardware Problems', avgResolution: '8.3 hrs', target: '12 hrs', efficiency: 87.8, resolved: 98, firstTimeFixed: 86, reopened: 12, trend: 'down' },
    { category: 'Access & Permissions', avgResolution: '2.1 hrs', target: '4 hrs', efficiency: 98.5, resolved: 67, firstTimeFixed: 66, reopened: 1, trend: 'up' },
    { category: 'Email Issues', avgResolution: '3.4 hrs', target: '6 hrs', efficiency: 93.3, resolved: 45, firstTimeFixed: 42, reopened: 3, trend: 'stable' },
    { category: 'Security Incidents', avgResolution: '1.8 hrs', target: '2 hrs', efficiency: 100, resolved: 23, firstTimeFixed: 23, reopened: 0, trend: 'up' }
  ]

  const currentWeek = resolutionMetrics[resolutionMetrics.length - 1]
  const previousWeek = resolutionMetrics[resolutionMetrics.length - 2]

  const stats = [
    {
      label: 'Avg Resolution Time',
      value: `${currentWeek.avgResolution} hrs`,
      change: `${(currentWeek.avgResolution - previousWeek.avgResolution).toFixed(1)} hrs`,
      trend: currentWeek.avgResolution < previousWeek.avgResolution ? 'down' : 'up',
      icon: Clock,
      color: 'blue'
    },
    {
      label: 'Tickets Resolved',
      value: currentWeek.totalResolved,
      change: `+${currentWeek.totalResolved - previousWeek.totalResolved}`,
      trend: 'up',
      icon: CheckCircle,
      color: 'green'
    },
    {
      label: 'Within SLA',
      value: `${((currentWeek.withinSLA / currentWeek.totalResolved) * 100).toFixed(1)}%`,
      change: `${currentWeek.withinSLA} tickets`,
      trend: 'up',
      icon: TrendingUp,
      color: 'green'
    },
    {
      label: 'SLA Breaches',
      value: currentWeek.breached,
      change: `${currentWeek.breached < previousWeek.breached ? '-' : '+'}${Math.abs(currentWeek.breached - previousWeek.breached)}`,
      trend: currentWeek.breached < previousWeek.breached ? 'down' : 'up',
      icon: AlertCircle,
      color: 'red'
    },
    {
      label: 'First Time Fix Rate',
      value: '91.3%',
      change: '+2.1%',
      trend: 'up',
      icon: CheckCircle,
      color: 'purple'
    },
    {
      label: 'Target',
      value: `${currentWeek.target} hrs`,
      change: 'Organization goal',
      trend: 'stable',
      icon: BarChart3,
      color: 'gray'
    }
  ]

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return <TrendingUp className="h-3 w-3" />
    if (trend === 'down') return <TrendingDown className="h-3 w-3" />
    return <Clock className="h-3 w-3" />
  }

  const getTrendColor = (trend: 'up' | 'down' | 'stable', metric: string) => {
    if (trend === 'stable') return 'text-gray-500'
    // For resolution time and breaches, down is good
    if (metric.includes('Resolution') || metric.includes('Breaches')) {
      return trend === 'down' ? 'text-green-600' : 'text-red-600'
    }
    // For others, up is good
    return trend === 'up' ? 'text-green-600' : 'text-red-600'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'bg-green-100 text-green-700'
      case 'warning': return 'bg-yellow-100 text-yellow-700'
      case 'critical': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Resolution Time Analytics</h1>
          <p className="text-gray-600 mt-1">Track resolution efficiency and identify bottlenecks</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading resolution analytics…
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
            green: 'bg-green-500',
            red: 'bg-red-500',
            purple: 'bg-purple-500',
            gray: 'bg-gray-500'
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
              <div className={`text-xs mt-1 flex items-center gap-1 ${getTrendColor(stat.trend as 'up' | 'down' | 'stable', stat.label)}`}>
                {getTrendIcon(stat.trend as 'up' | 'down' | 'stable')}
                {stat.change}
              </div>
            </div>
          )
        })}
      </div>

      {/* Resolution Time Trends */}
      <div className="bg-white rounded-lg shadow-sm border p-3">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-gray-900">Resolution Time Trends by Priority</h2>
          <div className="flex gap-2">
            {(['week', 'month', 'quarter'] as const).map(period => (
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

        <div className="space-y-2">
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span className="text-gray-600">P0 - Critical</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded"></div>
              <span className="text-gray-600">P1 - High</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span className="text-gray-600">P2 - Medium</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span className="text-gray-600">P3 - Low</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-400 rounded border-2 border-gray-600"></div>
              <span className="text-gray-600">Target (8 hrs)</span>
            </div>
          </div>

          <div className="space-y-3">
            {resolutionMetrics.map((metric, index) => {
              const maxValue = 15 // Max scale for visualization
              const compliance = ((metric.withinSLA / metric.totalResolved) * 100).toFixed(1)
              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium w-20">{metric.period}</span>
                    <span className="text-gray-600">
                      {metric.totalResolved} tickets • 
                      <span className={`ml-1 font-semibold ${
                        parseFloat(compliance) >= 95 ? 'text-green-600' :
                        parseFloat(compliance) >= 90 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {compliance}% within SLA
                      </span>
                    </span>
                  </div>
                  <div className="relative h-8 bg-gray-100 rounded">
                    {/* Target line */}
                    <div
                      className="absolute h-full border-l-2 border-gray-600 border-dashed"
                      style={{ left: `${(metric.target / maxValue) * 100}%` }}
                    ></div>
                    {/* Priority bars */}
                    <div className="flex h-full items-center gap-1 px-2">
                      <div className="bg-red-500 h-4 rounded relative group" style={{ width: `${(metric.p0 / maxValue) * 100}%` }}>
                        <span className="absolute inset-0 flex items-center justify-center text-white text-xs opacity-0 group-hover:opacity-100">
                          {metric.p0}h
                        </span>
                      </div>
                      <div className="bg-orange-500 h-4 rounded" style={{ width: `${(metric.p1 / maxValue) * 100}%` }}></div>
                      <div className="bg-yellow-500 h-4 rounded" style={{ width: `${(metric.p2 / maxValue) * 100}%` }}></div>
                      <div className="bg-blue-500 h-4 rounded" style={{ width: `${(metric.p3 / maxValue) * 100}%` }}></div>
                    </div>
                  </div>
                  <div className="flex gap-2 text-xs text-gray-500">
                    <span>P0: {metric.p0}h</span>
                    <span>P1: {metric.p1}h</span>
                    <span>P2: {metric.p2}h</span>
                    <span>P3: {metric.p3}h</span>
                    <span className="ml-auto font-semibold">Avg: {metric.avgResolution}h</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Category Efficiency and Bottleneck Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Category Efficiency */}
        <div className="bg-white rounded-lg shadow-sm border p-3">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Efficiency by Category</h2>
          <div className="space-y-3">
            {categoryEfficiency.map((cat, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 flex items-center gap-2">
                      {cat.category}
                      <span className={`text-xs ${
                        cat.trend === 'up' ? 'text-green-600' :
                        cat.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {getTrendIcon(cat.trend)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">Target: {cat.target}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-blue-600">{cat.avgResolution}</div>
                    <div className={`text-xs font-semibold ${
                      cat.efficiency >= 95 ? 'text-green-600' :
                      cat.efficiency >= 90 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {cat.efficiency}% efficient
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <div className="text-gray-500">Resolved</div>
                    <div className="font-semibold text-gray-900">{cat.resolved}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">First Time</div>
                    <div className="font-semibold text-green-600">{cat.firstTimeFixed}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Reopened</div>
                    <div className="font-semibold text-red-600">{cat.reopened}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottleneck Analysis */}
        <div className="bg-white rounded-lg shadow-sm border p-3">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Resolution Stage Bottlenecks</h2>
          <div className="space-y-2">
            {bottleneckAnalysis.map((stage, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(stage.status)}`}>
                      {stage.status}
                    </span>
                    <span className="font-medium text-gray-900">{stage.stage}</span>
                  </div>
                  <span className="font-semibold text-blue-600">{stage.avgTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${
                        stage.status === 'critical' ? 'bg-red-600' :
                        stage.status === 'warning' ? 'bg-yellow-600' : 'bg-green-600'
                      }`}
                      style={{ width: `${stage.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500 w-12 text-right">{stage.percentage}%</span>
                </div>
              </div>
            ))}
            <div className="pt-3 border-t border-gray-200 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Average Resolution Time</span>
                <span className="font-bold text-gray-900">{currentWeek.avgResolution} hours</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Resolution Performance Insights
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <TrendingDown className="h-4 w-4 mt-0.5 flex-shrink-0 text-green-600" />
            <span><strong>Improvement:</strong> Average resolution time decreased from {previousWeek.avgResolution}h to {currentWeek.avgResolution}h (-{((previousWeek.avgResolution - currentWeek.avgResolution) / previousWeek.avgResolution * 100).toFixed(1)}%).</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-green-600" />
            <span><strong>SLA Performance:</strong> {((currentWeek.withinSLA / currentWeek.totalResolved) * 100).toFixed(1)}% of tickets resolved within SLA ({currentWeek.withinSLA} of {currentWeek.totalResolved}).</span>
          </li>
          <li className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-orange-600" />
            <span><strong>Bottleneck:</strong> Solution Implementation stage accounts for 40.4% of resolution time - primary optimization opportunity.</span>
          </li>
          <li className="flex items-start gap-2">
            <TrendingUp className="h-4 w-4 mt-0.5 flex-shrink-0 text-green-600" />
            <span><strong>First Time Fix:</strong> 91.3% first time fix rate indicates strong diagnostic capabilities and effective solutions.</span>
          </li>
          <li className="flex items-start gap-2">
            <Clock className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span><strong>Top Performer:</strong> Security Incidents category achieving 100% efficiency with 1.8-hour average resolution.</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
