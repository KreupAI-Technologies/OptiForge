'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Star, Clock, CheckCircle, Users, BarChart3, Target, Award, Calendar, Filter, AlertCircle } from 'lucide-react'
import { supportPagesService } from '@/services/support-pages.service'

interface TeamPerformanceData {
  agentId: string
  agentName: string
  team: string
  avatar: string
  metrics: {
    ticketsResolved: number
    avgResolutionTime: string
    firstResponseTime: string
    customerSatisfaction: number
    slaCompliance: number
    reopenRate: number
    productivityScore: number
  }
  thisMonth: {
    resolved: number
    avgTime: string
    csat: number
  }
  lastMonth: {
    resolved: number
    avgTime: string
    csat: number
  }
  trend: 'up' | 'down' | 'stable'
  achievements: string[]
  areasForImprovement: string[]
}

interface TeamComparison {
  teamName: string
  agents: number
  avgResolutionTime: string
  avgCSAT: number
  slaCompliance: number
  totalResolved: number
  rank: number
}

export default function TeamPerformance() {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('month')
  const [selectedTeam, setSelectedTeam] = useState<string>('All')

  const performanceData: TeamPerformanceData[] = [
    {
      agentId: '1',
      agentName: 'Sarah Johnson',
      team: 'Infrastructure',
      avatar: 'SJ',
      metrics: {
        ticketsResolved: 127,
        avgResolutionTime: '2.4h',
        firstResponseTime: '8 min',
        customerSatisfaction: 4.9,
        slaCompliance: 98.5,
        reopenRate: 2.3,
        productivityScore: 96
      },
      thisMonth: { resolved: 127, avgTime: '2.4h', csat: 4.9 },
      lastMonth: { resolved: 115, avgTime: '2.8h', csat: 4.7 },
      trend: 'up',
      achievements: ['Highest CSAT this month', 'SLA champion', '100+ tickets resolved'],
      areasForImprovement: ['Documentation could be improved']
    },
    {
      agentId: '2',
      agentName: 'Michael Chen',
      team: 'Application Support',
      avatar: 'MC',
      metrics: {
        ticketsResolved: 98,
        avgResolutionTime: '3.1h',
        firstResponseTime: '12 min',
        customerSatisfaction: 4.7,
        slaCompliance: 95.2,
        reopenRate: 3.8,
        productivityScore: 89
      },
      thisMonth: { resolved: 98, avgTime: '3.1h', csat: 4.7 },
      lastMonth: { resolved: 102, avgTime: '2.9h', csat: 4.8 },
      trend: 'down',
      achievements: ['Complex issue resolution expert'],
      areasForImprovement: ['Response time needs improvement', 'Reduce reopen rate']
    },
    {
      agentId: '3',
      agentName: 'Emily Davis',
      team: 'Security',
      avatar: 'ED',
      metrics: {
        ticketsResolved: 82,
        avgResolutionTime: '1.8h',
        firstResponseTime: '5 min',
        customerSatisfaction: 5.0,
        slaCompliance: 99.8,
        reopenRate: 0.5,
        productivityScore: 98
      },
      thisMonth: { resolved: 82, avgTime: '1.8h', csat: 5.0 },
      lastMonth: { resolved: 78, avgTime: '2.0h', csat: 5.0 },
      trend: 'up',
      achievements: ['Perfect CSAT', 'Fastest response time', 'Lowest reopen rate'],
      areasForImprovement: []
    },
    {
      agentId: '4',
      agentName: 'David Kumar',
      team: 'Network',
      avatar: 'DK',
      metrics: {
        ticketsResolved: 145,
        avgResolutionTime: '1.5h',
        firstResponseTime: '7 min',
        customerSatisfaction: 4.8,
        slaCompliance: 97.3,
        reopenRate: 1.8,
        productivityScore: 94
      },
      thisMonth: { resolved: 145, avgTime: '1.5h', csat: 4.8 },
      lastMonth: { resolved: 140, avgTime: '1.6h', csat: 4.7 },
      trend: 'up',
      achievements: ['Most tickets resolved', 'Fastest resolution time'],
      areasForImprovement: ['Maintain quality while handling volume']
    },
    {
      agentId: '5',
      agentName: 'Lisa Martinez',
      team: 'Desktop Support',
      avatar: 'LM',
      metrics: {
        ticketsResolved: 112,
        avgResolutionTime: '2.8h',
        firstResponseTime: '15 min',
        customerSatisfaction: 4.6,
        slaCompliance: 93.1,
        reopenRate: 4.2,
        productivityScore: 85
      },
      thisMonth: { resolved: 112, avgTime: '2.8h', csat: 4.6 },
      lastMonth: { resolved: 108, avgTime: '3.0h', csat: 4.5 },
      trend: 'up',
      achievements: ['Consistent improvement'],
      areasForImprovement: ['Response time', 'SLA compliance', 'Reduce reopens']
    },
    {
      agentId: '6',
      agentName: 'Robert Brown',
      team: 'Database',
      avatar: 'RB',
      metrics: {
        ticketsResolved: 56,
        avgResolutionTime: '4.2h',
        firstResponseTime: '10 min',
        customerSatisfaction: 4.9,
        slaCompliance: 96.8,
        reopenRate: 1.2,
        productivityScore: 92
      },
      thisMonth: { resolved: 56, avgTime: '4.2h', csat: 4.9 },
      lastMonth: { resolved: 58, avgTime: '4.1h', csat: 4.9 },
      trend: 'stable',
      achievements: ['High complexity resolution expert'],
      areasForImprovement: ['Volume could be increased']
    },
    {
      agentId: '7',
      agentName: 'Anna Lee',
      team: 'Application Support',
      avatar: 'AL',
      metrics: {
        ticketsResolved: 134,
        avgResolutionTime: '2.2h',
        firstResponseTime: '9 min',
        customerSatisfaction: 4.8,
        slaCompliance: 97.8,
        reopenRate: 2.1,
        productivityScore: 95
      },
      thisMonth: { resolved: 134, avgTime: '2.2h', csat: 4.8 },
      lastMonth: { resolved: 125, avgTime: '2.4h', csat: 4.7 },
      trend: 'up',
      achievements: ['Top performer', 'Excellent balance of speed and quality'],
      areasForImprovement: []
    },
    {
      agentId: '8',
      agentName: 'Tom Wilson',
      team: 'Infrastructure',
      avatar: 'TW',
      metrics: {
        ticketsResolved: 119,
        avgResolutionTime: '2.6h',
        firstResponseTime: '11 min',
        customerSatisfaction: 4.7,
        slaCompliance: 96.2,
        reopenRate: 2.9,
        productivityScore: 91
      },
      thisMonth: { resolved: 119, avgTime: '2.6h', csat: 4.7 },
      lastMonth: { resolved: 115, avgTime: '2.7h', csat: 4.6 },
      trend: 'up',
      achievements: ['Consistent performer'],
      areasForImprovement: ['Response time optimization']
    }
  ]

  const teamComparison: TeamComparison[] = [
    { teamName: 'Network', agents: 2, avgResolutionTime: '1.5h', avgCSAT: 4.8, slaCompliance: 97.3, totalResolved: 145, rank: 1 },
    { teamName: 'Security', agents: 1, avgResolutionTime: '1.8h', avgCSAT: 5.0, slaCompliance: 99.8, totalResolved: 82, rank: 2 },
    { teamName: 'Infrastructure', agents: 2, avgResolutionTime: '2.5h', avgCSAT: 4.8, slaCompliance: 97.4, totalResolved: 246, rank: 3 },
    { teamName: 'Application Support', agents: 2, avgResolutionTime: '2.7h', avgCSAT: 4.8, slaCompliance: 96.5, totalResolved: 232, rank: 4 },
    { teamName: 'Desktop Support', agents: 1, avgResolutionTime: '2.8h', avgCSAT: 4.6, slaCompliance: 93.1, totalResolved: 112, rank: 5 },
    { teamName: 'Database', agents: 1, avgResolutionTime: '4.2h', avgCSAT: 4.9, slaCompliance: 96.8, totalResolved: 56, rank: 6 }
  ]

  const overallStats = {
    totalResolved: performanceData.reduce((sum, agent) => sum + agent.metrics.ticketsResolved, 0),
    avgCSAT: (performanceData.reduce((sum, agent) => sum + agent.metrics.customerSatisfaction, 0) / performanceData.length).toFixed(1),
    avgSLA: (performanceData.reduce((sum, agent) => sum + agent.metrics.slaCompliance, 0) / performanceData.length).toFixed(1),
    topPerformer: performanceData.reduce((prev, current) =>
      current.metrics.productivityScore > prev.metrics.productivityScore ? current : prev
    ),
    avgProductivity: (performanceData.reduce((sum, agent) => sum + agent.metrics.productivityScore, 0) / performanceData.length).toFixed(0)
  }

  const filteredData = selectedTeam === 'All'
    ? performanceData
    : performanceData.filter(agent => agent.team === selectedTeam)

  const getScoreColor = (score: number) => {
    if (score >= 95) return 'text-green-600'
    if (score >= 90) return 'text-blue-600'
    if (score >= 85) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Team Performance</h1>
          <p className="text-gray-600 mt-1">Track team performance metrics and KPIs</p>
        </div>
        <div className="flex gap-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      {/* Overall Statistics */}
      <div className="grid grid-cols-5 gap-2">
        <div className="bg-white rounded-lg shadow-sm border p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Resolved</p>
              <p className="text-2xl font-bold mt-1">{overallStats.totalResolved}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg CSAT</p>
              <p className="text-2xl font-bold mt-1">{overallStats.avgCSAT}</p>
            </div>
            <Star className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg SLA</p>
              <p className="text-2xl font-bold mt-1">{overallStats.avgSLA}%</p>
            </div>
            <Target className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Productivity</p>
              <p className="text-2xl font-bold mt-1">{overallStats.avgProductivity}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Top Performer</p>
              <p className="text-lg font-bold mt-1 truncate">{overallStats.topPerformer.agentName.split(' ')[0]}</p>
            </div>
            <Award className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Team Comparison */}
      <div className="bg-white rounded-lg shadow-sm border p-3">
        <h2 className="text-xl font-semibold mb-2">Team Comparison</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-3 font-medium text-gray-600">Rank</th>
                <th className="text-left p-3 font-medium text-gray-600">Team</th>
                <th className="text-left p-3 font-medium text-gray-600">Agents</th>
                <th className="text-left p-3 font-medium text-gray-600">Total Resolved</th>
                <th className="text-left p-3 font-medium text-gray-600">Avg Resolution</th>
                <th className="text-left p-3 font-medium text-gray-600">Avg CSAT</th>
                <th className="text-left p-3 font-medium text-gray-600">SLA Compliance</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {teamComparison.map((team) => (
                <tr key={team.teamName} className="hover:bg-gray-50">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        team.rank === 1 ? 'bg-yellow-100 text-yellow-700' :
                        team.rank === 2 ? 'bg-gray-100 text-gray-700' :
                        team.rank === 3 ? 'bg-orange-100 text-orange-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {team.rank}
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="font-medium">{team.teamName}</span>
                  </td>
                  <td className="p-3">{team.agents}</td>
                  <td className="p-3">
                    <span className="font-bold">{team.totalResolved}</span>
                  </td>
                  <td className="p-3">{team.avgResolutionTime}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-medium">{team.avgCSAT}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className={`font-medium ${team.slaCompliance >= 95 ? 'text-green-600' : 'text-yellow-600'}`}>
                      {team.slaCompliance}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg shadow-sm border p-3">
        <select
          value={selectedTeam}
          onChange={(e) => setSelectedTeam(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="All">All Teams</option>
          <option value="Infrastructure">Infrastructure</option>
          <option value="Application Support">Application Support</option>
          <option value="Security">Security</option>
          <option value="Network">Network</option>
          <option value="Desktop Support">Desktop Support</option>
          <option value="Database">Database</option>
        </select>
      </div>

      {/* Individual Performance Cards */}
      <div className="grid grid-cols-2 gap-2">
        {filteredData.map((agent) => (
          <div key={agent.agentId} className="bg-white rounded-lg shadow-sm border p-3">
            {/* Agent Header */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                  {agent.avatar}
                </div>
                <div>
                  <h3 className="font-semibold">{agent.agentName}</h3>
                  <p className="text-sm text-gray-600">{agent.team}</p>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-bold ${getScoreColor(agent.metrics.productivityScore)}`}>
                  {agent.metrics.productivityScore}
                </div>
                <div className="text-xs text-gray-600">Productivity Score</div>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-3 gap-3 mb-2 pb-4 border-b">
              <div>
                <p className="text-xs text-gray-600">Resolved</p>
                <div className="flex items-center gap-1">
                  <p className="text-lg font-bold">{agent.metrics.ticketsResolved}</p>
                  {agent.trend === 'up' ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : agent.trend === 'down' ? (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  ) : null}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-600">CSAT</p>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <p className="text-lg font-bold">{agent.metrics.customerSatisfaction}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-600">SLA</p>
                <p className={`text-lg font-bold ${agent.metrics.slaCompliance >= 95 ? 'text-green-600' : 'text-yellow-600'}`}>
                  {agent.metrics.slaCompliance}%
                </p>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-2 gap-3 mb-2">
              <div>
                <p className="text-xs text-gray-600">Avg Resolution Time</p>
                <p className="font-medium">{agent.metrics.avgResolutionTime}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Response Time</p>
                <p className="font-medium">{agent.metrics.firstResponseTime}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Reopen Rate</p>
                <p className="font-medium">{agent.metrics.reopenRate}%</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Trend</p>
                <div className="flex items-center gap-1">
                  <p className="font-medium">{agent.thisMonth.resolved} vs {agent.lastMonth.resolved}</p>
                </div>
              </div>
            </div>

            {/* Achievements */}
            {agent.achievements.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                  <Award className="h-3 w-3" />
                  Achievements
                </p>
                <div className="flex flex-wrap gap-1">
                  {agent.achievements.map((achievement, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                      {achievement}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Areas for Improvement */}
            {agent.areasForImprovement.length > 0 && (
              <div>
                <p className="text-xs text-gray-600 mb-1">Areas for Improvement</p>
                <div className="flex flex-wrap gap-1">
                  {agent.areasForImprovement.map((area, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs">
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
