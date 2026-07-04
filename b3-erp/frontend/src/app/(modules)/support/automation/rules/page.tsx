'use client'

import { useState, useEffect } from 'react'
import { Plus, Play, Pause, Edit2, Trash2, Zap, Filter, Search, Copy, BarChart, AlertCircle } from 'lucide-react'
import { supportPagesService } from '@/services/support-pages.service'

interface AutomationRule {
  id: string
  ruleId: string
  name: string
  description: string
  trigger: {
    type: 'Ticket Created' | 'Ticket Updated' | 'SLA Threshold' | 'Status Changed' | 'Time-based'
    conditions: string[]
  }
  actions: {
    type: 'Assign' | 'Notify' | 'Escalate' | 'Update Status' | 'Add Tag' | 'Send Email'
    details: string
  }[]
  priority: number
  active: boolean
  executionCount: number
  successRate: number
  lastExecuted?: string
  createdBy: string
  createdDate: string
  category: string
}

export default function AutomationRules() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [selectedRule, setSelectedRule] = useState<AutomationRule | null>(null)
  const [rules, setRules] = useState<AutomationRule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setIsLoading(true)
      setLoadError(null)
      try {
        const raw = await supportPagesService.getAutomationRules()
        const mapped: AutomationRule[] = raw.map((r: any, i: number) => ({
          id: String(r.id ?? i),
          ruleId: r.ruleId ?? r.code ?? '',
          name: r.name ?? '',
          description: r.description ?? '',
          trigger: {
            type: r.trigger?.type ?? r.triggerType ?? 'Ticket Created',
            conditions: Array.isArray(r.trigger?.conditions)
              ? r.trigger.conditions
              : Array.isArray(r.conditions) ? r.conditions : [],
          },
          actions: Array.isArray(r.actions)
            ? r.actions.map((a: any) => ({ type: a.type ?? 'Assign', details: a.details ?? a.description ?? '' }))
            : [],
          priority: r.priority ?? 0,
          active: r.active ?? r.isActive ?? false,
          executionCount: r.executionCount ?? 0,
          successRate: r.successRate ?? 0,
          lastExecuted: r.lastExecuted ?? undefined,
          createdBy: r.createdBy ?? '',
          createdDate: r.createdDate ?? r.createdAt ?? '',
          category: r.category ?? '',
        }))
        if (!cancelled) setRules(mapped)
      } catch (e) {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : 'Failed to load')
          setRules([])
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  const stats = [
    {
      label: 'Total Rules',
      value: rules.length,
      change: `${rules.filter(r => r.active).length} active`,
      icon: Zap,
      color: 'blue'
    },
    {
      label: 'Active Rules',
      value: rules.filter(r => r.active).length,
      change: `${((rules.filter(r => r.active).length / rules.length) * 100).toFixed(0)}% of total`,
      icon: Play,
      color: 'green'
    },
    {
      label: 'Total Executions',
      value: rules.reduce((sum, r) => sum + r.executionCount, 0).toLocaleString(),
      change: 'All time',
      icon: BarChart,
      color: 'purple'
    },
    {
      label: 'Avg Success Rate',
      value: `${(rules.reduce((sum, r) => sum + r.successRate, 0) / rules.length).toFixed(1)}%`,
      change: 'Across all rules',
      icon: BarChart,
      color: 'green'
    },
    {
      label: 'Categories',
      value: new Set(rules.map(r => r.category)).size,
      change: 'Rule categories',
      icon: Filter,
      color: 'orange'
    },
    {
      label: 'Inactive Rules',
      value: rules.filter(r => !r.active).length,
      change: 'Need review',
      icon: Pause,
      color: 'gray'
    }
  ]

  const filteredRules = rules.filter(rule => {
    const matchesSearch = rule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         rule.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         rule.ruleId.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' ||
                         (statusFilter === 'active' && rule.active) ||
                         (statusFilter === 'inactive' && !rule.active)
    const matchesCategory = categoryFilter === 'all' || rule.category === categoryFilter
    return matchesSearch && matchesStatus && matchesCategory
  })

  const getTriggerColor = (type: string) => {
    switch (type) {
      case 'Ticket Created': return 'bg-blue-100 text-blue-700'
      case 'Ticket Updated': return 'bg-purple-100 text-purple-700'
      case 'SLA Threshold': return 'bg-orange-100 text-orange-700'
      case 'Status Changed': return 'bg-green-100 text-green-700'
      case 'Time-based': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getActionColor = (type: string) => {
    const colors: Record<string, string> = {
      'Assign': 'bg-blue-50 text-blue-700',
      'Notify': 'bg-yellow-50 text-yellow-700',
      'Escalate': 'bg-red-50 text-red-700',
      'Update Status': 'bg-green-50 text-green-700',
      'Add Tag': 'bg-purple-50 text-purple-700',
      'Send Email': 'bg-indigo-50 text-indigo-700'
    }
    return colors[type] || 'bg-gray-50 text-gray-700'
  }

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Automation Rules</h1>
          <p className="text-gray-600 mt-1">Create and manage automated workflows for ticket management</p>
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
            blue: 'bg-blue-500',
            green: 'bg-green-500',
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
                placeholder="Search rules..."
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
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {Array.from(new Set(rules.map(r => r.category))).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Rules Grid */}
      <div className="space-y-2">
        {filteredRules.map((rule) => (
          <div key={rule.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-gray-500 text-sm font-medium">{rule.ruleId}</span>
                    <span className="text-gray-400">•</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getTriggerColor(rule.trigger.type)}`}>
                      {rule.trigger.type}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                      Priority {rule.priority}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{rule.name}</h3>
                  <p className="text-sm text-gray-600">{rule.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    rule.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {rule.active ? 'Active' : 'Inactive'}
                  </span>
                  <button className="inline-flex items-center gap-1.5 px-3 py-2 hover:bg-gray-100 rounded-lg text-sm">
                    <Edit2 className="h-4 w-4 text-gray-600" />
                    <span className="text-gray-700">Edit</span>
                  </button>
                  <button className="inline-flex items-center gap-1.5 px-3 py-2 hover:bg-gray-100 rounded-lg text-sm">
                    <Copy className="h-4 w-4 text-gray-600" />
                    <span className="text-gray-700">Copy</span>
                  </button>
                  <button className="inline-flex items-center gap-1.5 px-3 py-2 hover:bg-gray-100 rounded-lg text-sm">
                    <Trash2 className="h-4 w-4 text-red-600" />
                    <span className="text-red-700">Delete</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-2">
                {/* Trigger Conditions */}
                <div>
                  <div className="text-xs font-medium text-gray-700 mb-2">TRIGGER CONDITIONS</div>
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <ul className="space-y-1 text-sm text-gray-700">
                      {rule.trigger.conditions.map((cond, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-blue-600 mt-0.5">•</span>
                          <span>{cond}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Actions */}
                <div>
                  <div className="text-xs font-medium text-gray-700 mb-2">ACTIONS</div>
                  <div className="space-y-2">
                    {rule.actions.map((action, idx) => (
                      <div key={idx} className={`rounded-lg p-3 border ${getActionColor(action.type)}`}>
                        <div className="font-medium text-xs mb-1">{action.type}</div>
                        <div className="text-sm">{action.details}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">Executions:</span>
                    <span className="ml-1 font-semibold text-gray-900">{rule.executionCount}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Success Rate:</span>
                    <span className={`ml-1 font-semibold ${
                      rule.successRate >= 95 ? 'text-green-600' :
                      rule.successRate >= 85 ? 'text-yellow-600' : 'text-red-600'
                    }`}>{rule.successRate}%</span>
                  </div>
                  {rule.lastExecuted && (
                    <div>
                      <span className="text-gray-500">Last Executed:</span>
                      <span className="ml-1 font-medium text-gray-900">{rule.lastExecuted}</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                    rule.active
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}>
                    {rule.active ? (
                      <><Pause className="h-3 w-3 inline mr-1" />Pause</>
                    ) : (
                      <><Play className="h-3 w-3 inline mr-1" />Activate</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No Results */}
      {filteredRules.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <Filter className="h-12 w-12 text-gray-400 mb-2" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Rules Found</h3>
          <p className="text-gray-600">Try adjusting your filters or search query</p>
        </div>
      )}
    </div>
  )
}
