'use client'

import { useState, useEffect } from 'react'
import { Users, TrendingUp, TrendingDown, AlertCircle, CheckCircle, Clock, Calendar, Filter, BarChart3 } from 'lucide-react'
import { supportPagesService } from '@/services/support-pages.service'

interface AgentWorkload {
  agentId: string
  agentName: string
  team: string
  avatar: string
  status: 'Available' | 'Busy' | 'Away' | 'Offline'
  currentLoad: {
    activeTickets: number
    priority1: number
    priority2: number
    priority3: number
    priority4: number
  }
  capacity: {
    maxTickets: number
    utilizationRate: number
  }
  schedule: {
    shift: string
    availableHours: number
    currentTime: string
  }
  recentActivity: {
    resolvedToday: number
    assignedToday: number
    avgResponseTime: string
  }
  weeklyTrend: {
    monday: number
    tuesday: number
    wednesday: number
    thursday: number
    friday: number
  }
}

interface TeamWorkloadSummary {
  teamName: string
  totalAgents: number
  activeAgents: number
  totalActiveTickets: number
  avgUtilization: number
  overloadedAgents: number
  availableCapacity: number
}

export default function TeamWorkload() {
  const [selectedTeam, setSelectedTeam] = useState<string>('All')
  const [viewMode, setViewMode] = useState<'grid' | 'chart'>('grid')
  const [agentWorkloads, setAgentWorkloads] = useState<AgentWorkload[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setIsLoading(true)
      setLoadError(null)
      try {
        const raw = await supportPagesService.getTeamAgents()
        const mapped: AgentWorkload[] = raw.map((r: any, i: number) => {
          const name: string = r.agentName ?? r.name ?? ''
          const cl = r.currentLoad ?? {}
          const cap = r.capacity ?? {}
          const sch = r.schedule ?? {}
          const act = r.recentActivity ?? {}
          const wt = r.weeklyTrend ?? {}
          return {
            agentId: String(r.agentId ?? r.id ?? i),
            agentName: name,
            team: r.team ?? '',
            avatar: r.avatar ?? (name ? name.split(' ').map((p: string) => p[0]).join('').slice(0, 2).toUpperCase() : '?'),
            status: r.status ?? 'Offline',
            currentLoad: {
              activeTickets: cl.activeTickets ?? r.activeTickets ?? 0,
              priority1: cl.priority1 ?? 0,
              priority2: cl.priority2 ?? 0,
              priority3: cl.priority3 ?? 0,
              priority4: cl.priority4 ?? 0,
            },
            capacity: {
              maxTickets: cap.maxTickets ?? r.maxTickets ?? 0,
              utilizationRate: cap.utilizationRate ?? r.utilizationRate ?? 0,
            },
            schedule: {
              shift: sch.shift ?? '',
              availableHours: sch.availableHours ?? 0,
              currentTime: sch.currentTime ?? '',
            },
            recentActivity: {
              resolvedToday: act.resolvedToday ?? 0,
              assignedToday: act.assignedToday ?? 0,
              avgResponseTime: act.avgResponseTime ?? 'N/A',
            },
            weeklyTrend: {
              monday: wt.monday ?? 0,
              tuesday: wt.tuesday ?? 0,
              wednesday: wt.wednesday ?? 0,
              thursday: wt.thursday ?? 0,
              friday: wt.friday ?? 0,
            },
          }
        })
        if (!cancelled) setAgentWorkloads(mapped)
      } catch (e) {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : 'Failed to load')
          setAgentWorkloads([])
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  const teamSummaries: TeamWorkloadSummary[] = [
    { teamName: 'Infrastructure', totalAgents: 2, activeAgents: 2, totalActiveTickets: 15, avgUtilization: 63, overloadedAgents: 0, availableCapacity: 9 },
    { teamName: 'Application Support', totalAgents: 2, activeAgents: 2, totalActiveTickets: 23, avgUtilization: 106, overloadedAgents: 1, availableCapacity: -1 },
    { teamName: 'Security', totalAgents: 1, activeAgents: 1, totalActiveTickets: 5, avgUtilization: 50, overloadedAgents: 0, availableCapacity: 5 },
    { teamName: 'Network', totalAgents: 1, activeAgents: 1, totalActiveTickets: 10, avgUtilization: 83, overloadedAgents: 0, availableCapacity: 2 },
    { teamName: 'Desktop Support', totalAgents: 1, activeAgents: 1, totalActiveTickets: 15, avgUtilization: 100, overloadedAgents: 0, availableCapacity: 0 },
    { teamName: 'Database', totalAgents: 1, activeAgents: 0, totalActiveTickets: 0, avgUtilization: 0, overloadedAgents: 0, availableCapacity: 8 }
  ]

  const overallStats = {
    totalAgents: agentWorkloads.length,
    activeAgents: agentWorkloads.filter(a => a.status !== 'Offline').length,
    totalActiveTickets: agentWorkloads.reduce((sum, a) => sum + a.currentLoad.activeTickets, 0),
    avgUtilization: Math.round(
      agentWorkloads.reduce((sum, a) => sum + a.capacity.utilizationRate, 0) / agentWorkloads.length
    ),
    overloadedAgents: agentWorkloads.filter(a => a.capacity.utilizationRate > 100).length,
    availableCapacity: agentWorkloads.reduce(
      (sum, a) => sum + (a.capacity.maxTickets - a.currentLoad.activeTickets),
      0
    )
  }

  const filteredAgents = selectedTeam === 'All'
    ? agentWorkloads
    : agentWorkloads.filter(agent => agent.team === selectedTeam)

  const getUtilizationColor = (rate: number) => {
    if (rate > 100) return 'bg-red-500'
    if (rate >= 90) return 'bg-yellow-500'
    if (rate >= 70) return 'bg-blue-500'
    return 'bg-green-500'
  }

  const getUtilizationTextColor = (rate: number) => {
    if (rate > 100) return 'text-red-600'
    if (rate >= 90) return 'text-yellow-600'
    if (rate >= 70) return 'text-blue-600'
    return 'text-green-600'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available': return 'bg-green-100 text-green-700'
      case 'Busy': return 'bg-red-100 text-red-700'
      case 'Away': return 'bg-yellow-100 text-yellow-700'
      case 'Offline': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Team Workload</h1>
          <p className="text-gray-600 mt-1">Monitor team workload distribution and capacity</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-4 py-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Grid View
          </button>
          <button
            onClick={() => setViewMode('chart')}
            className={`px-4 py-2 rounded-lg ${viewMode === 'chart' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Chart View
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading team workload…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}

      {/* Overall Statistics */}
      <div className="grid grid-cols-6 gap-2">
        <div className="bg-white rounded-lg shadow-sm border p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Agents</p>
              <p className="text-2xl font-bold mt-1">{overallStats.totalAgents}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Agents</p>
              <p className="text-2xl font-bold mt-1">{overallStats.activeAgents}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Tickets</p>
              <p className="text-2xl font-bold mt-1">{overallStats.totalActiveTickets}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Utilization</p>
              <p className="text-2xl font-bold mt-1">{overallStats.avgUtilization}%</p>
            </div>
            <BarChart3 className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Overloaded</p>
              <p className="text-2xl font-bold mt-1">{overallStats.overloadedAgents}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Available Capacity</p>
              <p className="text-2xl font-bold mt-1">{overallStats.availableCapacity}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Team Summary Cards */}
      <div className="bg-white rounded-lg shadow-sm border p-3">
        <h2 className="text-xl font-semibold mb-2">Team Summary</h2>
        <div className="grid grid-cols-3 gap-2">
          {teamSummaries.map((team) => (
            <div key={team.teamName} className="border rounded-lg p-3">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">{team.teamName}</h3>
                {team.overloadedAgents > 0 && (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                )}
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Agents:</span>
                  <span className="font-medium">{team.activeAgents}/{team.totalAgents}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Active Tickets:</span>
                  <span className="font-medium">{team.totalActiveTickets}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Utilization:</span>
                  <span className={`font-bold ${getUtilizationTextColor(team.avgUtilization)}`}>
                    {team.avgUtilization}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Capacity:</span>
                  <span className={`font-medium ${team.availableCapacity < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {team.availableCapacity > 0 ? '+' : ''}{team.availableCapacity}
                  </span>
                </div>
              </div>
            </div>
          ))}
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

      {/* Agent Workload Cards */}
      <div className="grid grid-cols-2 gap-2">
        {filteredAgents.map((agent) => (
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
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(agent.status)}`}>
                {agent.status}
              </span>
            </div>

            {/* Utilization Bar */}
            <div className="mb-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Utilization</span>
                <span className={`text-lg font-bold ${getUtilizationTextColor(agent.capacity.utilizationRate)}`}>
                  {agent.capacity.utilizationRate}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${getUtilizationColor(agent.capacity.utilizationRate)}`}
                  style={{ width: `${Math.min(agent.capacity.utilizationRate, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{agent.currentLoad.activeTickets} active</span>
                <span>{agent.capacity.maxTickets} max</span>
              </div>
            </div>

            {/* Current Load by Priority */}
            <div className="mb-2 pb-4 border-b">
              <p className="text-sm text-gray-600 mb-2">Current Load by Priority</p>
              <div className="grid grid-cols-4 gap-2">
                <div className="text-center">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mb-1">
                    <span className="text-red-700 font-bold">{agent.currentLoad.priority1}</span>
                  </div>
                  <span className="text-xs text-gray-600">P1</span>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center mb-1">
                    <span className="text-orange-700 font-bold">{agent.currentLoad.priority2}</span>
                  </div>
                  <span className="text-xs text-gray-600">P2</span>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center mb-1">
                    <span className="text-yellow-700 font-bold">{agent.currentLoad.priority3}</span>
                  </div>
                  <span className="text-xs text-gray-600">P3</span>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mb-1">
                    <span className="text-green-700 font-bold">{agent.currentLoad.priority4}</span>
                  </div>
                  <span className="text-xs text-gray-600">P4</span>
                </div>
              </div>
            </div>

            {/* Schedule & Activity */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div>
                <p className="text-xs text-gray-600">Shift</p>
                <p className="text-sm font-medium">{agent.schedule.shift}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Available Hours</p>
                <p className="text-sm font-medium">{agent.schedule.availableHours}h left</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Resolved Today</p>
                <p className="text-sm font-medium">{agent.recentActivity.resolvedToday}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Assigned Today</p>
                <p className="text-sm font-medium">{agent.recentActivity.assignedToday}</p>
              </div>
            </div>

            {/* Recommendations */}
            {agent.capacity.utilizationRate > 100 && (
              <div className="bg-red-50 border border-red-200 rounded p-3 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-900">Overloaded</p>
                  <p className="text-xs text-red-700">Consider redistributing tickets to available agents</p>
                </div>
              </div>
            )}
            {agent.capacity.utilizationRate < 50 && agent.status === 'Available' && (
              <div className="bg-green-50 border border-green-200 rounded p-3 flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-green-900">Available Capacity</p>
                  <p className="text-xs text-green-700">Can handle {agent.capacity.maxTickets - agent.currentLoad.activeTickets} more tickets</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
