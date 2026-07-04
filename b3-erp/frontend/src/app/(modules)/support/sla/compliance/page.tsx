'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, Target, Award, AlertCircle, Users, Calendar, Download, BarChart3 } from 'lucide-react'
import { supportPagesService } from '@/services/support-pages.service'

interface ComplianceData {
  month: string
  compliance: number
  breaches: number
  totalTickets: number
}

interface TeamPerformance {
  teamName: string
  agent: string
  ticketsHandled: number
  slaCompliance: number
  avgResponseTime: string
  avgResolutionTime: string
  breaches: number
}

export default function SLACompliance() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month')
  const [complianceData, setComplianceData] = useState<ComplianceData[]>([])
  const [teamPerformance, setTeamPerformance] = useState<TeamPerformance[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setIsLoading(true)
      setLoadError(null)
      try {
        const settings = await supportPagesService.getSlaSettings()
        const source: any[] = Array.isArray(settings?.slaConfigs)
          ? settings.slaConfigs
          : Array.isArray(settings?.compliance) ? settings.compliance : []
        const mapped: ComplianceData[] = source.map((r: any) => ({
          month: r.month ?? r.name ?? r.label ?? '',
          compliance: r.compliance ?? r.complianceRate ?? 0,
          breaches: r.breaches ?? 0,
          totalTickets: r.totalTickets ?? r.ticketCount ?? 0,
        }))
        if (!cancelled) setComplianceData(mapped)
      } catch (e) {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : 'Failed to load')
          setComplianceData([])
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  const overallCompliance = complianceData.length > 0
    ? complianceData[complianceData.length - 1].compliance
    : 0
  const totalBreaches = complianceData.reduce((sum, d) => sum + d.breaches, 0)
  const totalTickets = complianceData.reduce((sum, d) => sum + d.totalTickets, 0)
  const bestPerformer = teamPerformance.length > 0
    ? teamPerformance.reduce((best, team) => (team.slaCompliance > best.slaCompliance ? team : best))
    : null

  const stats = [
    {
      label: 'Overall Compliance',
      value: `${overallCompliance}%`,
      change: '+1.3% vs last month',
      icon: Target,
      color: 'green',
      target: '95%'
    },
    {
      label: 'Total Tickets',
      value: totalTickets,
      change: `${complianceData.length > 0 ? complianceData[complianceData.length - 1].totalTickets : 0} this month`,
      icon: BarChart3,
      color: 'blue'
    },
    {
      label: 'Total Breaches',
      value: totalBreaches,
      change: '-12% vs last period',
      icon: AlertCircle,
      color: 'red'
    },
    {
      label: 'Best Performer',
      value: bestPerformer ? bestPerformer.agent.split(' ')[0] : '—',
      change: bestPerformer ? `${bestPerformer.slaCompliance}% compliance` : 'No data',
      icon: Award,
      color: 'purple'
    },
    {
      label: 'Teams Meeting Target',
      value: `${teamPerformance.filter(t => t.slaCompliance >= 95).length}/${teamPerformance.length}`,
      change: '95% compliance target',
      icon: Users,
      color: 'orange'
    },
    {
      label: 'Period',
      value: complianceData.length,
      change: 'months tracked',
      icon: Calendar,
      color: 'gray'
    }
  ]

  const getComplianceColor = (compliance: number) => {
    if (compliance >= 95) return 'text-green-600'
    if (compliance >= 90) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getComplianceBadge = (compliance: number) => {
    if (compliance >= 95) return 'bg-green-100 text-green-700 border-green-200'
    if (compliance >= 90) return 'bg-yellow-100 text-yellow-700 border-yellow-200'
    return 'bg-red-100 text-red-700 border-red-200'
  }

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">SLA Compliance</h1>
          <p className="text-gray-600 mt-1">Monitor overall SLA performance and team metrics</p>
        </div>
        <div className="flex gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </select>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading SLA compliance…
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
            green: 'bg-green-500',
            blue: 'bg-blue-500',
            red: 'bg-red-500',
            purple: 'bg-purple-500',
            orange: 'bg-orange-500',
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
              <div className="text-xs text-gray-500 mt-1">{stat.change}</div>
              {stat.target && (
                <div className="text-xs text-blue-600 mt-1">Target: {stat.target}</div>
              )}
            </div>
          )
        })}
      </div>

      {/* Compliance Trend */}
      <div className="bg-white rounded-lg shadow-sm border p-3">
        <div className="flex justify-between items-center mb-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Compliance Trend</h2>
            <p className="text-sm text-gray-600">Monthly SLA compliance percentage</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Target: 95%</span>
          </div>
        </div>

        {/* Simple Chart Visualization */}
        <div className="space-y-2">
          {complianceData.map((data, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-700 font-medium">{data.month}</span>
                <span className={`font-semibold ${getComplianceColor(data.compliance)}`}>
                  {data.compliance}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 relative">
                <div
                  className={`h-2 rounded-full ${
                    data.compliance >= 95 ? 'bg-green-500' :
                    data.compliance >= 90 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${data.compliance}%` }}
                />
                <div
                  className="absolute top-0 h-2 w-0.5 bg-blue-500"
                  style={{ left: '95%' }}
                 
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>{data.breaches} breaches</span>
                <span>{data.totalTickets} total tickets</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Team Performance */}
      <div className="bg-white rounded-lg shadow-sm border p-3">
        <div className="flex justify-between items-center mb-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Team Performance</h2>
            <p className="text-sm text-gray-600">Individual agent SLA compliance metrics</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Team / Agent
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tickets
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Compliance
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Response
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Resolution
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Breaches
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {teamPerformance.map((team, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{team.agent}</div>
                      <div className="text-sm text-gray-500">{team.teamName}</div>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-sm text-gray-900">{team.ticketsHandled}</div>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getComplianceBadge(team.slaCompliance)}`}>
                      {team.slaCompliance}%
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-sm text-gray-900">{team.avgResponseTime}</div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-sm text-gray-900">{team.avgResolutionTime}</div>
                  </td>
                  <td className="px-3 py-2">
                    <div className={`text-sm font-semibold ${team.breaches === 0 ? 'text-green-600' : team.breaches < 5 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {team.breaches}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex gap-3">
            <TrendingUp className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-blue-900 mb-2">Positive Trends</h3>
              <ul className="space-y-1 text-sm text-blue-700">
                <li>• Overall compliance improved by 1.3% this month</li>
                <li>• Security team maintaining 97.7% compliance</li>
                <li>• Total breaches decreased by 12% compared to last period</li>
                <li>• 50% of teams meeting the 95% compliance target</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-orange-900 mb-2">Areas for Improvement</h3>
              <ul className="space-y-1 text-sm text-orange-700">
                <li>• Desktop Support team at 89.3% (below 95% target)</li>
                <li>• Network team response time averaging 22 minutes</li>
                <li>• Desktop Support has highest breach count (25)</li>
                <li>• Consider additional resources for Desktop Support</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
