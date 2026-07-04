'use client'

import { useState, useEffect } from 'react'
import { Clock, TrendingUp, TrendingDown, Target, Users, AlertCircle, Download, Calendar } from 'lucide-react'
import { supportPagesService } from '@/services/support-pages.service'

interface FRTMetric {
  period: string
  avgFRT: number
  target: number
  compliance: number
  p0: number
  p1: number
  p2: number
  p3: number
}

interface TeamPerformance {
  teamName: string
  agent: string
  ticketsHandled: number
  avgFRT: string
  slaCompliance: number
  withinSLA: number
  breached: number
  trend: 'up' | 'down' | 'stable'
}

interface TimeDistribution {
  range: string
  count: number
  percentage: number
  priority: string
}

export default function FirstResponseTime() {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter'>('month')
  const [timeDistribution, setTimeDistribution] = useState<TimeDistribution[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setIsLoading(true)
      setLoadError(null)
      try {
        const raw = await supportPagesService.getOmnichannel()
        // Omnichannel conversations; only records carrying a response-time bucket map here.
        const mapped: TimeDistribution[] = raw
          .filter((r: any) => r?.range || r?.responseRange)
          .map((r: any) => ({
            range: r.range ?? r.responseRange ?? '',
            count: r.count ?? 0,
            percentage: r.percentage ?? 0,
            priority: r.priority ?? '',
          }))
        if (!cancelled) setTimeDistribution(mapped)
      } catch (e) {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : 'Failed to load')
          setTimeDistribution([])
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  const frtMetrics: FRTMetric[] = [
    { period: 'Week 1', avgFRT: 28, target: 30, compliance: 94.5, p0: 6, p1: 22, p2: 35, p3: 45 },
    { period: 'Week 2', avgFRT: 32, target: 30, compliance: 91.2, p0: 7, p1: 25, p2: 38, p3: 48 },
    { period: 'Week 3', avgFRT: 26, target: 30, compliance: 96.8, p0: 5, p1: 20, p2: 32, p3: 42 },
    { period: 'Week 4', avgFRT: 24, target: 30, compliance: 98.2, p0: 4, p1: 18, p2: 30, p3: 40 }
  ]

  const teamPerformance: TeamPerformance[] = [
    { teamName: 'Infrastructure', agent: 'Amit Patel', ticketsHandled: 87, avgFRT: '12 min', slaCompliance: 97.7, withinSLA: 85, breached: 2, trend: 'up' },
    { teamName: 'Application Support', agent: 'Priya Sharma', ticketsHandled: 142, avgFRT: '18 min', slaCompliance: 95.1, withinSLA: 135, breached: 7, trend: 'stable' },
    { teamName: 'Network', agent: 'Rahul Verma', ticketsHandled: 98, avgFRT: '15 min', slaCompliance: 96.9, withinSLA: 95, breached: 3, trend: 'up' },
    { teamName: 'Security', agent: 'Rajesh Kumar', ticketsHandled: 34, avgFRT: '8 min', slaCompliance: 100, withinSLA: 34, breached: 0, trend: 'up' },
    { teamName: 'Database', agent: 'Sneha Reddy', ticketsHandled: 56, avgFRT: '22 min', slaCompliance: 92.9, withinSLA: 52, breached: 4, trend: 'down' },
    { teamName: 'Desktop Support', agent: 'Vikram Singh', ticketsHandled: 167, avgFRT: '35 min', slaCompliance: 89.2, withinSLA: 149, breached: 18, trend: 'down' }
  ]

  const currentWeek = frtMetrics[frtMetrics.length - 1]
  const previousWeek = frtMetrics[frtMetrics.length - 2]

  const stats = [
    {
      label: 'Avg FRT (This Week)',
      value: `${currentWeek.avgFRT} min`,
      change: `${currentWeek.avgFRT < previousWeek.avgFRT ? '-' : '+'}${Math.abs(currentWeek.avgFRT - previousWeek.avgFRT)} min`,
      trend: currentWeek.avgFRT < previousWeek.avgFRT ? 'down' : 'up',
      icon: Clock,
      color: 'blue'
    },
    {
      label: 'SLA Compliance',
      value: `${currentWeek.compliance}%`,
      change: `${(currentWeek.compliance - previousWeek.compliance).toFixed(1)}%`,
      trend: currentWeek.compliance > previousWeek.compliance ? 'up' : 'down',
      icon: Target,
      color: currentWeek.compliance >= 95 ? 'green' : currentWeek.compliance >= 90 ? 'yellow' : 'red'
    },
    {
      label: 'P0 Avg FRT',
      value: `${currentWeek.p0} min`,
      change: 'Critical tickets',
      trend: 'stable',
      icon: AlertCircle,
      color: 'red'
    },
    {
      label: 'P1 Avg FRT',
      value: `${currentWeek.p1} min`,
      change: 'High priority',
      trend: 'stable',
      icon: Clock,
      color: 'orange'
    },
    {
      label: 'Best Performer',
      value: teamPerformance[0].agent.split(' ')[0],
      change: `${teamPerformance[0].slaCompliance}% compliance`,
      trend: 'up',
      icon: Users,
      color: 'purple'
    },
    {
      label: 'Target',
      value: `${currentWeek.target} min`,
      change: 'Organization SLA',
      trend: 'stable',
      icon: Target,
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
    // For FRT, down is good (faster response)
    if (metric === 'FRT') {
      return trend === 'down' ? 'text-green-600' : 'text-red-600'
    }
    // For compliance, up is good
    return trend === 'up' ? 'text-green-600' : 'text-red-600'
  }

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">First Response Time Analytics</h1>
          <p className="text-gray-600 mt-1">Track and optimize initial response performance</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Date Range
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
          Loading first response time analytics…
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
            yellow: 'bg-yellow-500',
            red: 'bg-red-500',
            orange: 'bg-orange-500',
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
              <div className={`text-xs mt-1 flex items-center gap-1 ${getTrendColor(stat.trend as 'up' | 'down' | 'stable', stat.label.includes('FRT') ? 'FRT' : 'other')}`}>
                {getTrendIcon(stat.trend as 'up' | 'down' | 'stable')}
                {stat.change}
              </div>
            </div>
          )
        })}
      </div>

      {/* FRT Trend Chart */}
      <div className="bg-white rounded-lg shadow-sm border p-3">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-gray-900">FRT Trend by Priority</h2>
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
              <span className="text-gray-600">Target (30 min)</span>
            </div>
          </div>

          <div className="space-y-3">
            {frtMetrics.map((metric, index) => {
              const maxValue = 60 // Max scale for visualization
              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span className="font-medium w-20">{metric.period}</span>
                    <span className={`${metric.compliance >= 95 ? 'text-green-600' : metric.compliance >= 90 ? 'text-yellow-600' : 'text-red-600'} font-semibold`}>
                      {metric.compliance}% SLA
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
                      <div className="bg-red-500 h-4 rounded" style={{ width: `${(metric.p0 / maxValue) * 100}%` }}></div>
                      <div className="bg-orange-500 h-4 rounded" style={{ width: `${(metric.p1 / maxValue) * 100}%` }}></div>
                      <div className="bg-yellow-500 h-4 rounded" style={{ width: `${(metric.p2 / maxValue) * 100}%` }}></div>
                      <div className="bg-blue-500 h-4 rounded" style={{ width: `${(metric.p3 / maxValue) * 100}%` }}></div>
                    </div>
                  </div>
                  <div className="flex gap-2 text-xs text-gray-500">
                    <span>P0: {metric.p0}m</span>
                    <span>P1: {metric.p1}m</span>
                    <span>P2: {metric.p2}m</span>
                    <span>P3: {metric.p3}m</span>
                    <span className="ml-auto">Avg: {metric.avgFRT}m</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Team Performance and Time Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Team Performance */}
        <div className="bg-white rounded-lg shadow-sm border p-3">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Team Performance</h2>
          <div className="space-y-3">
            {teamPerformance.map((team, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold text-gray-900">{team.agent}</div>
                    <div className="text-xs text-gray-500">{team.teamName}</div>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    team.trend === 'up' ? 'bg-green-100 text-green-700' :
                    team.trend === 'down' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {team.trend === 'up' ? '↑' : team.trend === 'down' ? '↓' : '→'}
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2 text-sm">
                  <div>
                    <div className="text-gray-500 text-xs">Tickets</div>
                    <div className="font-semibold text-gray-900">{team.ticketsHandled}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 text-xs">Avg FRT</div>
                    <div className="font-semibold text-blue-600">{team.avgFRT}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 text-xs">Compliance</div>
                    <div className={`font-semibold ${
                      team.slaCompliance >= 95 ? 'text-green-600' :
                      team.slaCompliance >= 90 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {team.slaCompliance}%
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500 text-xs">Breached</div>
                    <div className="font-semibold text-red-600">{team.breached}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Response Time Distribution */}
        <div className="bg-white rounded-lg shadow-sm border p-3">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Response Time Distribution</h2>
          <div className="space-y-3">
            {timeDistribution.map((dist, index) => {
              const isBreached = dist.range.includes('4+')
              const isWarning = dist.range.includes('2-4')
              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-900">{dist.range}</span>
                    <div className="text-right">
                      <span className="font-semibold text-gray-900">{dist.count}</span>
                      <span className="text-gray-500 ml-1">({dist.percentage}%)</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          isBreached ? 'bg-red-600' :
                          isWarning ? 'bg-yellow-600' :
                          'bg-green-600'
                        }`}
                        style={{ width: `${dist.percentage * 3}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500 w-24">{dist.priority}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
        <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
          <Target className="h-5 w-5" />
          Performance Insights
        </h3>
        <ul className="space-y-2 text-sm text-green-800">
          <li className="flex items-start gap-2">
            <TrendingUp className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span><strong>Excellent Compliance:</strong> Current SLA compliance at {currentWeek.compliance}%, exceeding the 95% target.</span>
          </li>
          <li className="flex items-start gap-2">
            <Clock className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span><strong>P0 Performance:</strong> Critical tickets averaging {currentWeek.p0} minutes response time, well within 30-minute SLA.</span>
          </li>
          <li className="flex items-start gap-2">
            <Users className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span><strong>Top Performer:</strong> {teamPerformance[0].agent} ({teamPerformance[0].teamName}) achieving {teamPerformance[0].slaCompliance}% compliance.</span>
          </li>
          <li className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span><strong>Improvement Area:</strong> Desktop Support team needs attention with 89.2% compliance and 35-minute average FRT.</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
