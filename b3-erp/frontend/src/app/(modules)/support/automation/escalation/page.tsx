'use client'

import { useState, useEffect } from 'react'
import { SupportEscalationRuleService } from '@/services/support.service'
import { Plus, AlertTriangle, Clock, TrendingUp, Users, Settings, BarChart, ArrowUp } from 'lucide-react'

interface EscalationRule {
  id: string
  name: string
  description: string
  level: number
  trigger: {
    type: 'SLA Breach' | 'Time-based' | 'Priority' | 'No Response' | 'Manual'
    threshold: string
  }
  escalateTo: string
  notificationChannels: string[]
  active: boolean
  executionCount: number
  avgResponseTime: string
}

interface EscalationPath {
  ticketId: string
  title: string
  priority: string
  currentLevel: number
  escalationHistory: {
    level: number
    escalatedTo: string
    timestamp: string
    reason: string
  }[]
  status: 'In Progress' | 'Resolved' | 'Pending'
}

export default function AutoEscalation() {
  const [activeTab, setActiveTab] = useState<'rules' | 'paths' | 'settings'>('rules')

  const seedEscalationRules: EscalationRule[] = [
    {
      id: '1',
      name: 'P0 Critical - No Response in 30 Minutes',
      description: 'Escalate critical tickets if no response within 30 minutes',
      level: 1,
      trigger: {
        type: 'No Response',
        threshold: '30 minutes'
      },
      escalateTo: 'Team Lead',
      notificationChannels: ['Email', 'SMS'],
      active: true,
      executionCount: 45,
      avgResponseTime: '8 min'
    },
    {
      id: '2',
      name: 'SLA Breach - 85% Threshold',
      description: 'Escalate when SLA time reaches 85% for P0 and P1 tickets',
      level: 1,
      trigger: {
        type: 'SLA Breach',
        threshold: '85% of SLA time'
      },
      escalateTo: 'Manager',
      notificationChannels: ['Email', 'SMS', 'Phone'],
      active: true,
      executionCount: 89,
      avgResponseTime: '5 min'
    },
    {
      id: '3',
      name: 'Level 2 Escalation - 1 Hour',
      description: 'Escalate to manager if not resolved after level 1 escalation',
      level: 2,
      trigger: {
        type: 'Time-based',
        threshold: '1 hour after Level 1'
      },
      escalateTo: 'Department Manager',
      notificationChannels: ['Email', 'SMS', 'Phone', 'Slack'],
      active: true,
      executionCount: 34,
      avgResponseTime: '12 min'
    },
    {
      id: '4',
      name: 'High Priority - 4 Hour No Progress',
      description: 'Escalate P1 tickets with no progress updates in 4 hours',
      level: 1,
      trigger: {
        type: 'Time-based',
        threshold: '4 hours no update'
      },
      escalateTo: 'Team Lead',
      notificationChannels: ['Email'],
      active: true,
      executionCount: 67,
      avgResponseTime: '15 min'
    },
    {
      id: '5',
      name: 'Executive Escalation - Major Incidents',
      description: 'Escalate major incidents affecting 100+ users to executives',
      level: 3,
      trigger: {
        type: 'Priority',
        threshold: 'Major Incident + 100+ users'
      },
      escalateTo: 'Director/VP',
      notificationChannels: ['Email', 'SMS', 'Phone'],
      active: true,
      executionCount: 12,
      avgResponseTime: '3 min'
    },
    {
      id: '6',
      name: 'Medium Priority - 8 Hours',
      description: 'Escalate P2 tickets unresolved after 8 hours',
      level: 1,
      trigger: {
        type: 'Time-based',
        threshold: '8 hours'
      },
      escalateTo: 'Team Lead',
      notificationChannels: ['Email'],
      active: true,
      executionCount: 156,
      avgResponseTime: '18 min'
    },
    {
      id: '7',
      name: 'Customer VIP Escalation',
      description: 'Automatically escalate all VIP customer tickets to senior agents',
      level: 1,
      trigger: {
        type: 'Priority',
        threshold: 'Customer = VIP'
      },
      escalateTo: 'Senior Support',
      notificationChannels: ['Email', 'SMS'],
      active: true,
      executionCount: 89,
      avgResponseTime: '6 min'
    },
    {
      id: '8',
      name: 'Security Incident Escalation',
      description: 'Immediate escalation of security incidents to CISO',
      level: 1,
      trigger: {
        type: 'Priority',
        threshold: 'Category = Security'
      },
      escalateTo: 'Security Team + CISO',
      notificationChannels: ['Email', 'SMS', 'Phone', 'Slack'],
      active: true,
      executionCount: 23,
      avgResponseTime: '2 min'
    }
  ]

  const [escalationRules, setEscalationRules] = useState<EscalationRule[]>(seedEscalationRules)

  useEffect(() => {
    let cancelled = false
    SupportEscalationRuleService.getRules()
      .then((rows) => {
        if (!cancelled && Array.isArray(rows) && rows.length > 0) {
          setEscalationRules(rows as unknown as EscalationRule[])
        }
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  const escalationPaths: EscalationPath[] = [
    {
      ticketId: 'TKT-2024-1245',
      title: 'Production database connection timeout',
      priority: 'P0',
      currentLevel: 2,
      escalationHistory: [
        {
          level: 1,
          escalatedTo: 'Team Lead - Rajesh Kumar',
          timestamp: '2024-10-21 14:15',
          reason: 'No response in 30 minutes'
        },
        {
          level: 2,
          escalatedTo: 'Manager - Priya Sharma',
          timestamp: '2024-10-21 15:00',
          reason: 'SLA at 85%'
        }
      ],
      status: 'In Progress'
    },
    {
      ticketId: 'TKT-2024-1238',
      title: 'Email server not responding',
      priority: 'P1',
      currentLevel: 1,
      escalationHistory: [
        {
          level: 1,
          escalatedTo: 'Team Lead - Amit Patel',
          timestamp: '2024-10-21 12:00',
          reason: '4 hours no progress update'
        }
      ],
      status: 'In Progress'
    },
    {
      ticketId: 'TKT-2024-1232',
      title: 'VPN connectivity issues for remote users',
      priority: 'P1',
      currentLevel: 1,
      escalationHistory: [
        {
          level: 1,
          escalatedTo: 'Team Lead - Rahul Verma',
          timestamp: '2024-10-21 10:30',
          reason: 'SLA breach imminent'
        }
      ],
      status: 'Resolved'
    }
  ]

  const stats = [
    {
      label: 'Active Rules',
      value: escalationRules.filter(r => r.active).length,
      change: `${escalationRules.length} total`,
      icon: AlertTriangle,
      color: 'orange'
    },
    {
      label: 'Escalations Today',
      value: '23',
      change: '-15% vs yesterday',
      icon: TrendingUp,
      color: 'blue'
    },
    {
      label: 'Active Escalations',
      value: escalationPaths.filter(p => p.status === 'In Progress').length,
      change: 'Currently in progress',
      icon: ArrowUp,
      color: 'red'
    },
    {
      label: 'Avg Response Time',
      value: `${(escalationRules.reduce((sum, r) => sum + parseInt(r.avgResponseTime), 0) / escalationRules.length).toFixed(0)} min`,
      change: 'After escalation',
      icon: Clock,
      color: 'green'
    },
    {
      label: 'Total Executions',
      value: escalationRules.reduce((sum, r) => sum + r.executionCount, 0),
      change: 'All time',
      icon: BarChart,
      color: 'purple'
    },
    {
      label: 'Escalation Levels',
      value: Math.max(...escalationRules.map(r => r.level)),
      change: 'Maximum levels',
      icon: Settings,
      color: 'gray'
    }
  ]

  const getTriggerColor = (type: string) => {
    const colors: Record<string, string> = {
      'SLA Breach': 'bg-red-100 text-red-700',
      'Time-based': 'bg-blue-100 text-blue-700',
      'Priority': 'bg-purple-100 text-purple-700',
      'No Response': 'bg-orange-100 text-orange-700',
      'Manual': 'bg-gray-100 text-gray-700'
    }
    return colors[type] || 'bg-gray-100 text-gray-700'
  }

  const getLevelColor = (level: number) => {
    if (level === 1) return 'bg-yellow-100 text-yellow-700 border-yellow-200'
    if (level === 2) return 'bg-orange-100 text-orange-700 border-orange-200'
    return 'bg-red-100 text-red-700 border-red-200'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Progress': return 'bg-blue-100 text-blue-700'
      case 'Resolved': return 'bg-green-100 text-green-700'
      case 'Pending': return 'bg-yellow-100 text-yellow-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Auto-Escalation Rules</h1>
          <p className="text-gray-600 mt-1">Configure automatic escalation policies and paths</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Rule
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          const colorClasses = {
            orange: 'bg-orange-500',
            blue: 'bg-blue-500',
            red: 'bg-red-500',
            green: 'bg-green-500',
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
              <div className="text-xs text-gray-500 mt-1">{stat.change}</div>
            </div>
          )
        })}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('rules')}
              className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'rules'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Escalation Rules
            </button>
            <button
              onClick={() => setActiveTab('paths')}
              className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'paths'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Active Paths
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'settings'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Settings
            </button>
          </nav>
        </div>

        {/* Rules Tab */}
        {activeTab === 'rules' && (
          <div className="p-6 space-y-2">
            {escalationRules.map((rule) => (
              <div key={rule.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded border font-medium text-sm ${getLevelColor(rule.level)}`}>
                        Level {rule.level}
                      </span>
                      <span className={`px-3 py-1 rounded text-xs font-medium ${getTriggerColor(rule.trigger.type)}`}>
                        {rule.trigger.type}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        rule.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {rule.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{rule.name}</h3>
                    <p className="text-sm text-gray-600">{rule.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2 pb-4 border-b border-gray-300">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Trigger Threshold</div>
                    <div className="text-sm font-semibold text-gray-900">{rule.trigger.threshold}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Escalate To</div>
                    <div className="text-sm font-semibold text-gray-900">{rule.escalateTo}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Notification Channels</div>
                    <div className="flex flex-wrap gap-1">
                      {rule.notificationChannels.map((channel, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                          {channel}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex gap-3">
                    <div>
                      <span className="text-gray-500">Executions:</span>
                      <span className="ml-1 font-semibold text-gray-900">{rule.executionCount}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Avg Response:</span>
                      <span className="ml-1 font-semibold text-green-600">{rule.avgResponseTime}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Active Paths Tab */}
        {activeTab === 'paths' && (
          <div className="p-6 space-y-2">
            {escalationPaths.map((path) => (
              <div key={path.ticketId} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-gray-500 font-medium">{path.ticketId}</span>
                      <span className="px-2 py-1 bg-red-500 text-white rounded text-xs font-medium">
                        {path.priority}
                      </span>
                      <span className={`px-3 py-1 rounded text-xs font-medium ${getStatusColor(path.status)}`}>
                        {path.status}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{path.title}</h3>
                  </div>
                  <span className={`px-3 py-1 rounded border font-medium ${getLevelColor(path.currentLevel)}`}>
                    Level {path.currentLevel}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="text-xs font-medium text-gray-700 mb-2">ESCALATION HISTORY</div>
                  {path.escalationHistory.map((history, idx) => (
                    <div key={idx} className="flex items-start gap-3 pl-4 border-l-2 border-blue-500">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm text-gray-900">Level {history.level}</span>
                          <ArrowUp className="h-3 w-3 text-orange-500" />
                          <span className="text-sm text-gray-700">{history.escalatedTo}</span>
                        </div>
                        <div className="text-xs text-gray-500">{history.reason}</div>
                        <div className="text-xs text-gray-400 mt-1">{history.timestamp}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="p-6 space-y-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Escalation Settings</h2>
              <p className="text-sm text-gray-600">Configure global escalation behavior</p>
            </div>

            <div className="space-y-3">
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">General Settings</h3>
                <div className="space-y-3">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-sm text-gray-700">Enable auto-escalation</span>
                    <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-sm text-gray-700">Notify all stakeholders on escalation</span>
                    <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-sm text-gray-700">Allow manual de-escalation</span>
                    <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-sm text-gray-700">Require escalation justification</span>
                    <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  </label>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Escalation Hierarchy</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">Level 1: Escalate to</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                      <option>Team Lead</option>
                      <option>Senior Agent</option>
                      <option>Specialist</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">Level 2: Escalate to</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                      <option>Manager</option>
                      <option>Department Head</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">Level 3: Escalate to</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                      <option>Director</option>
                      <option>VP</option>
                      <option>Executive Team</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
