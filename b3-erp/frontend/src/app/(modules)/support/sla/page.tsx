'use client'

import { useState, useEffect } from 'react'
import { Clock, TrendingUp, AlertTriangle, CheckCircle2, Target, Users, Calendar, ArrowUpRight, Search, Filter } from 'lucide-react'
import { supportPagesService } from '@/services/support-pages.service';

interface SLA {
  id: string
  slaNumber: string
  name: string
  type: 'Response Time' | 'Resolution Time' | 'Availability' | 'First Contact'
  priority: 'P0' | 'P1' | 'P2' | 'P3'
  target: string
  actual: string
  compliance: number
  status: 'Meeting' | 'At Risk' | 'Breached'
  ticketsCount: number
  breachCount: number
  applicableTo: string
  lastBreach?: string
  trend: 'up' | 'down' | 'stable'
}

export default function SLAManagement() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  const slas: SLA[] = [
    {
      id: '1',
      slaNumber: 'SLA-001',
      name: 'P0 Critical Response',
      type: 'Response Time',
      priority: 'P0',
      target: '15 minutes',
      actual: '12 minutes',
      compliance: 98.5,
      status: 'Meeting',
      ticketsCount: 45,
      breachCount: 2,
      applicableTo: 'Critical Incidents',
      lastBreach: '2024-10-15',
      trend: 'up'
    },
    {
      id: '2',
      slaNumber: 'SLA-002',
      name: 'P1 High Priority Response',
      type: 'Response Time',
      priority: 'P1',
      target: '1 hour',
      actual: '55 minutes',
      compliance: 95.2,
      status: 'Meeting',
      ticketsCount: 128,
      breachCount: 8,
      applicableTo: 'High Priority Incidents',
      lastBreach: '2024-10-18',
      trend: 'stable'
    },
    {
      id: '3',
      slaNumber: 'SLA-003',
      name: 'P2 Medium Priority Response',
      type: 'Response Time',
      priority: 'P2',
      target: '4 hours',
      actual: '4.2 hours',
      compliance: 87.5,
      status: 'At Risk',
      ticketsCount: 342,
      breachCount: 45,
      applicableTo: 'Medium Priority Tickets',
      lastBreach: '2024-10-20',
      trend: 'down'
    },
    {
      id: '4',
      slaNumber: 'SLA-004',
      name: 'P0 Critical Resolution',
      type: 'Resolution Time',
      priority: 'P0',
      target: '4 hours',
      actual: '3.5 hours',
      compliance: 96.8,
      status: 'Meeting',
      ticketsCount: 45,
      breachCount: 3,
      applicableTo: 'Critical Incidents',
      lastBreach: '2024-10-12',
      trend: 'up'
    },
    {
      id: '5',
      slaNumber: 'SLA-005',
      name: 'P1 High Priority Resolution',
      type: 'Resolution Time',
      priority: 'P1',
      target: '8 hours',
      actual: '9.2 hours',
      compliance: 82.3,
      status: 'Breached',
      ticketsCount: 128,
      breachCount: 28,
      applicableTo: 'High Priority Incidents',
      lastBreach: '2024-10-21',
      trend: 'down'
    },
    {
      id: '6',
      slaNumber: 'SLA-006',
      name: 'P2 Medium Priority Resolution',
      type: 'Resolution Time',
      priority: 'P2',
      target: '24 hours',
      actual: '22 hours',
      compliance: 91.5,
      status: 'Meeting',
      ticketsCount: 342,
      breachCount: 32,
      applicableTo: 'Medium Priority Tickets',
      lastBreach: '2024-10-19',
      trend: 'stable'
    },
    {
      id: '7',
      slaNumber: 'SLA-007',
      name: 'P3 Low Priority Response',
      type: 'Response Time',
      priority: 'P3',
      target: '24 hours',
      actual: '18 hours',
      compliance: 94.7,
      status: 'Meeting',
      ticketsCount: 567,
      breachCount: 35,
      applicableTo: 'Low Priority Tickets',
      lastBreach: '2024-10-17',
      trend: 'up'
    },
    {
      id: '8',
      slaNumber: 'SLA-008',
      name: 'First Contact Resolution',
      type: 'First Contact',
      priority: 'P2',
      target: '70%',
      actual: '68.5%',
      compliance: 85.2,
      status: 'At Risk',
      ticketsCount: 892,
      breachCount: 145,
      applicableTo: 'All Tickets',
      lastBreach: '2024-10-20',
      trend: 'down'
    },
    {
      id: '9',
      slaNumber: 'SLA-009',
      name: 'System Availability',
      type: 'Availability',
      priority: 'P0',
      target: '99.9%',
      actual: '99.95%',
      compliance: 99.8,
      status: 'Meeting',
      ticketsCount: 0,
      breachCount: 0,
      applicableTo: 'All Systems',
      trend: 'up'
    },
    {
      id: '10',
      slaNumber: 'SLA-010',
      name: 'Customer Response Satisfaction',
      type: 'First Contact',
      priority: 'P1',
      target: '4.5/5',
      actual: '4.3/5',
      compliance: 88.9,
      status: 'At Risk',
      ticketsCount: 1245,
      breachCount: 148,
      applicableTo: 'Customer Tickets',
      lastBreach: '2024-10-21',
      trend: 'stable'
    }
  ]

  const stats = [
    {
      label: 'Total SLAs',
      value: slas.length,
      change: '+2 this month',
      icon: Target,
      color: 'blue'
    },
    {
      label: 'Meeting SLA',
      value: slas.filter(s => s.status === 'Meeting').length,
      change: `${((slas.filter(s => s.status === 'Meeting').length / slas.length) * 100).toFixed(1)}% compliance`,
      icon: CheckCircle2,
      color: 'green'
    },
    {
      label: 'At Risk',
      value: slas.filter(s => s.status === 'At Risk').length,
      change: 'Needs attention',
      icon: AlertTriangle,
      color: 'yellow'
    },
    {
      label: 'Breached',
      value: slas.filter(s => s.status === 'Breached').length,
      change: 'Critical',
      icon: Clock,
      color: 'red'
    },
    {
      label: 'Avg Compliance',
      value: `${(slas.reduce((sum, s) => sum + s.compliance, 0) / slas.length).toFixed(1)}%`,
      change: '+2.3% vs last month',
      icon: TrendingUp,
      color: 'purple'
    },
    {
      label: 'Total Breaches',
      value: slas.reduce((sum, s) => sum + s.breachCount, 0),
      change: '-12% vs last month',
      icon: AlertTriangle,
      color: 'orange'
    }
  ]

  const filteredSLAs = slas.filter(sla => {
    const matchesSearch = sla.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         sla.slaNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         sla.applicableTo.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || sla.status === statusFilter
    const matchesType = typeFilter === 'all' || sla.type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Meeting': return 'bg-green-100 text-green-700 border-green-200'
      case 'At Risk': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'Breached': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'P0': return 'bg-red-500 text-white'
      case 'P1': return 'bg-orange-500 text-white'
      case 'P2': return 'bg-yellow-500 text-white'
      case 'P3': return 'bg-blue-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  const getComplianceColor = (compliance: number) => {
    if (compliance >= 95) return 'text-green-600'
    if (compliance >= 85) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <ArrowUpRight className="h-4 w-4 text-green-500" />
    if (trend === 'down') return <ArrowUpRight className="h-4 w-4 text-red-500 rotate-90" />
    return <div className="h-4 w-4" />
  }

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">SLA Management</h1>
          <p className="text-gray-600 mt-1">Monitor and manage Service Level Agreements</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <Target className="h-4 w-4" />
          Configure SLA
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          const colorClasses = {
            blue: 'bg-blue-500',
            green: 'bg-green-500',
            yellow: 'bg-yellow-500',
            red: 'bg-red-500',
            purple: 'bg-purple-500',
            orange: 'bg-orange-500'
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
            </div>
          )
        })}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search SLAs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="Meeting">Meeting</option>
              <option value="At Risk">At Risk</option>
              <option value="Breached">Breached</option>
            </select>
          </div>
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="Response Time">Response Time</option>
              <option value="Resolution Time">Resolution Time</option>
              <option value="Availability">Availability</option>
              <option value="First Contact">First Contact</option>
            </select>
          </div>
        </div>
      </div>

      {/* SLA Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {filteredSLAs.map((sla) => (
          <div key={sla.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(sla.priority)}`}>
                      {sla.priority}
                    </span>
                    <span className="text-gray-500 text-sm">{sla.slaNumber}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{sla.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{sla.type} • {sla.applicableTo}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(sla.status)}`}>
                  {sla.status}
                </span>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Target</div>
                  <div className="text-sm font-semibold text-gray-900">{sla.target}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Actual</div>
                  <div className="text-sm font-semibold text-gray-900">{sla.actual}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Compliance</div>
                  <div className={`text-sm font-semibold flex items-center gap-1 ${getComplianceColor(sla.compliance)}`}>
                    {sla.compliance}%
                    {getTrendIcon(sla.trend)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Breaches</div>
                  <div className="text-sm font-semibold text-red-600">
                    {sla.breachCount} / {sla.ticketsCount}
                  </div>
                </div>
              </div>

              {/* Compliance Bar */}
              <div className="mb-2">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Compliance Rate</span>
                  <span>{sla.compliance}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      sla.compliance >= 95 ? 'bg-green-500' :
                      sla.compliance >= 85 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${sla.compliance}%` }}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {sla.ticketsCount} tickets
                  </div>
                  {sla.lastBreach && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Last breach: {sla.lastBreach}
                    </div>
                  )}
                </div>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  View Details →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No Results */}
      {filteredSLAs.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <Filter className="h-12 w-12 text-gray-400 mb-2" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No SLAs Found</h3>
          <p className="text-gray-600">Try adjusting your filters or search query</p>
        </div>
      )}
    </div>
  )
}
