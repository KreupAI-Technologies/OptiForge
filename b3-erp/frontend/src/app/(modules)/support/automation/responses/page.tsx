'use client'

import { useState, useEffect } from 'react'
import { Plus, Mail, TrendingUp, Target, BarChart, Clock, Copy, Edit2, Trash2, AlertCircle } from 'lucide-react'
import { ResponseTemplateService, SupportResponseTemplate } from '@/services/support.service'

interface ResponseTemplate {
  id: string
  name: string
  category: string
  subject: string
  body: string
  trigger: {
    type: string
    conditions: string[]
  }
  language: string
  active: boolean
  usageCount: number
  effectivenessRate: number
  avgResponseTime: string
}

export default function AutoResponses() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<ResponseTemplate | null>(null)
  const [templates, setTemplates] = useState<ResponseTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setIsLoading(true)
      setLoadError(null)
      try {
        const raw = (await ResponseTemplateService.getTemplates()) as SupportResponseTemplate[]
        const mapped: ResponseTemplate[] = (Array.isArray(raw) ? raw : []).map((t) => ({
          id: t.id,
          name: t.name ?? '',
          category: t.category ?? 'General',
          subject: t.subject ?? '',
          body: t.body ?? '',
          trigger: {
            type: t.trigger?.type ?? 'Manual',
            conditions: Array.isArray(t.trigger?.conditions) ? t.trigger!.conditions : [],
          },
          language: t.language ?? 'English',
          active: t.active ?? true,
          usageCount: Number(t.usageCount ?? 0),
          effectivenessRate: Number(t.effectivenessRate ?? 0),
          avgResponseTime: t.avgResponseTime ?? '—',
        }))
        if (!cancelled) setTemplates(mapped)
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load templates')
          setTemplates([])
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

  const categories = ['All', 'Acknowledgment', 'Update', 'Resolution', 'Escalation', 'Survey', 'Follow-up']

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.subject.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const stats = [
    {
      label: 'Total Templates',
      value: templates.length,
      change: `${templates.filter(t => t.active).length} active`,
      icon: Mail,
      color: 'blue'
    },
    {
      label: 'Sent Today',
      value: '1,234',
      change: '+18% vs yesterday',
      icon: TrendingUp,
      color: 'green'
    },
    {
      label: 'Avg Effectiveness',
      value: `${(templates.length ? templates.reduce((sum, t) => sum + t.effectivenessRate, 0) / templates.length : 0).toFixed(1)}%`,
      change: 'All templates',
      icon: Target,
      color: 'purple'
    },
    {
      label: 'Total Usage',
      value: templates.reduce((sum, t) => sum + t.usageCount, 0).toLocaleString(),
      change: 'All time',
      icon: BarChart,
      color: 'orange'
    },
    {
      label: 'Response Time',
      value: '< 2 min',
      change: 'Average delivery',
      icon: Clock,
      color: 'green'
    },
    {
      label: 'Categories',
      value: categories.length - 1,
      change: 'Template types',
      icon: Copy,
      color: 'gray'
    }
  ]

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Acknowledgment': 'bg-blue-100 text-blue-700',
      'Update': 'bg-purple-100 text-purple-700',
      'Resolution': 'bg-green-100 text-green-700',
      'Escalation': 'bg-orange-100 text-orange-700',
      'Survey': 'bg-pink-100 text-pink-700',
      'Follow-up': 'bg-yellow-100 text-yellow-700'
    }
    return colors[category] || 'bg-gray-100 text-gray-700'
  }

  const getTriggerColor = (type: string) => {
    const colors: Record<string, string> = {
      'On Creation': 'bg-green-100 text-green-700',
      'Status Change': 'bg-blue-100 text-blue-700',
      'Priority Change': 'bg-orange-100 text-orange-700',
      'Time-based': 'bg-purple-100 text-purple-700',
      'Manual': 'bg-gray-100 text-gray-700'
    }
    return colors[type] || 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Auto-Response Templates</h1>
          <p className="text-gray-600 mt-1">Manage automated response templates and track effectiveness</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Template
        </button>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading templates…
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
        <div className="flex flex-col md:flex-row gap-2">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        {filteredTemplates.map((template) => (
          <div key={template.id} className="bg-white rounded-lg shadow-sm border p-3 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-3 py-1 rounded text-xs font-medium ${getCategoryColor(template.category)}`}>
                    {template.category}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getTriggerColor(template.trigger.type)}`}>
                    {template.trigger.type}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    template.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {template.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{template.name}</h3>
                <div className="text-sm text-gray-600 mb-3">
                  <strong>Subject:</strong> {template.subject}
                </div>
              </div>
              <div className="flex gap-2">
                <button className="inline-flex items-center gap-1.5 px-3 py-2 hover:bg-gray-100 rounded-lg text-sm">
                  <Edit2 className="h-4 w-4 text-gray-600" />
                  <span className="text-gray-700">Edit</span>
                </button>
                <button className="inline-flex items-center gap-1.5 px-3 py-2 hover:bg-gray-100 rounded-lg text-sm">
                  <Copy className="h-4 w-4 text-blue-600" />
                  <span className="text-blue-700">Copy</span>
                </button>
                <button className="inline-flex items-center gap-1.5 px-3 py-2 hover:bg-gray-100 rounded-lg text-sm">
                  <Trash2 className="h-4 w-4 text-red-600" />
                  <span className="text-red-700">Delete</span>
                </button>
              </div>
            </div>

            <div className="bg-gray-50 rounded p-3 mb-2 max-h-32 overflow-y-auto">
              <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">{template.body.substring(0, 200)}...</pre>
            </div>

            <div className="space-y-2 mb-2">
              <div className="text-xs font-medium text-gray-700">TRIGGER CONDITIONS:</div>
              <div className="flex flex-wrap gap-2">
                {template.trigger.conditions.map((condition, idx) => (
                  <span key={idx} className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">
                    {condition}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-200">
              <div>
                <div className="text-xs text-gray-500">Usage</div>
                <div className="text-lg font-semibold text-gray-900">{template.usageCount}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Effectiveness</div>
                <div className={`text-lg font-semibold ${
                  template.effectivenessRate >= 90 ? 'text-green-600' :
                  template.effectivenessRate >= 75 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {template.effectivenessRate}%
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Avg Time</div>
                <div className="text-lg font-semibold text-blue-600">{template.avgResponseTime}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Mail className="h-12 w-12 text-gray-400 mb-2" />
          <p className="text-gray-600">No templates found matching your criteria</p>
        </div>
      )}
    </div>
  )
}
