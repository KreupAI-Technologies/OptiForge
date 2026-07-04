'use client'

import { useState, useEffect } from 'react'
import { Cog, Plus, Edit2, Trash2, Play, Pause, ChevronDown, ChevronRight, Save, X, AlertCircle } from 'lucide-react'
import { useToast } from '@/components/ui'
import { crmService } from '@/services/crm.service'

interface AssignmentRule {
  id: string
  name: string
  description: string
  type: 'round_robin' | 'territory' | 'load_balanced' | 'custom'
  active: boolean
  priority: number
  criteria: AssignmentCriteria
  assignees: Assignee[]
  createdAt: string
  lastRun?: string
  totalAssignments: number
}

interface AssignmentCriteria {
  leadSource?: string[]
  valueRange?: { min: number; max: number }
  territory?: string[]
  industry?: string[]
  company?: string[]
}

interface Assignee {
  id: string
  name: string
  email: string
  currentLoad: number
  maxLoad: number
  territories?: string[]
}

export default function AssignmentRulesPage() {
  const { addToast } = useToast()
  const [rules, setRules] = useState<AssignmentRule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setIsLoading(true)
      setLoadError(null)
      try {
        const raw = (await crmService.assignmentRules.getAll()) as any[]
        const list = Array.isArray(raw) ? raw : []
        const mapped: AssignmentRule[] = list.map((r, idx) => {
          const rawCriteria = r?.criteria ?? {}
          const rawValueRange = rawCriteria?.valueRange
          const criteria: AssignmentCriteria = {
            leadSource: Array.isArray(rawCriteria?.leadSource) ? rawCriteria.leadSource : undefined,
            valueRange: rawValueRange
              ? {
                  min: Number(rawValueRange?.min ?? 0),
                  max:
                    rawValueRange?.max === null || rawValueRange?.max === undefined
                      ? Infinity
                      : Number(rawValueRange.max),
                }
              : undefined,
            territory: Array.isArray(rawCriteria?.territory) ? rawCriteria.territory : undefined,
            industry: Array.isArray(rawCriteria?.industry) ? rawCriteria.industry : undefined,
            company: Array.isArray(rawCriteria?.company) ? rawCriteria.company : undefined,
          }
          const assignees: Assignee[] = Array.isArray(r?.assignees)
            ? r.assignees.map((a: any, aIdx: number) => ({
                id: a?.id ?? `${idx + 1}-${aIdx + 1}`,
                name: a?.name ?? '',
                email: a?.email ?? '',
                currentLoad: Number(a?.currentLoad ?? 0),
                maxLoad: Number(a?.maxLoad ?? 0),
                territories: Array.isArray(a?.territories) ? a.territories : undefined,
              }))
            : []
          return {
            id: r?.id ?? String(idx + 1),
            name: r?.name ?? '',
            description: r?.description ?? '',
            type: (r?.type ?? 'round_robin') as AssignmentRule['type'],
            active: !!r?.active,
            priority: Number(r?.priority ?? idx + 1),
            criteria,
            assignees,
            createdAt: r?.createdAt ?? '',
            lastRun: r?.lastRun ?? undefined,
            totalAssignments: Number(r?.totalAssignments ?? 0),
          }
        })
        if (!cancelled) setRules(mapped)
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load assignment rules')
          setRules([])
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

  const [expandedRules, setExpandedRules] = useState<Set<string>>(new Set())
  const [editingRule, setEditingRule] = useState<string | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const toggleRuleExpansion = (ruleId: string) => {
    setExpandedRules(prev => {
      const newSet = new Set(prev)
      if (newSet.has(ruleId)) {
        newSet.delete(ruleId)
      } else {
        newSet.add(ruleId)
      }
      return newSet
    })
  }

  const toggleRuleStatus = (ruleId: string) => {
    setRules(rules.map(rule => {
      if (rule.id === ruleId) {
        const newStatus = !rule.active
        addToast({
          title: newStatus ? 'Rule Activated' : 'Rule Deactivated',
          message: `${rule.name} has been ${newStatus ? 'activated' : 'deactivated'}`,
          variant: newStatus ? 'success' : 'warning'
        })
        return { ...rule, active: newStatus }
      }
      return rule
    }))
  }

  const deleteRule = (ruleId: string) => {
    const rule = rules.find(r => r.id === ruleId)
    if (rule && confirm(`Delete rule "${rule.name}"?`)) {
      setRules(rules.filter(r => r.id !== ruleId))
      addToast({
        title: 'Rule Deleted',
        message: `${rule.name} has been deleted`,
        variant: 'success'
      })
    }
  }

  const getTypeIcon = (type: AssignmentRule['type']) => {
    switch (type) {
      case 'round_robin': return '🔄'
      case 'territory': return '🗺️'
      case 'load_balanced': return '⚖️'
      case 'custom': return '⚙️'
    }
  }

  const getTypeName = (type: AssignmentRule['type']) => {
    switch (type) {
      case 'round_robin': return 'Round Robin'
      case 'territory': return 'Territory-Based'
      case 'load_balanced': return 'Load Balanced'
      case 'custom': return 'Custom Logic'
    }
  }

  const formatCriteria = (criteria: AssignmentCriteria) => {
    const parts: string[] = []
    if (criteria.leadSource?.length) {
      parts.push(`Source: ${criteria.leadSource.join(', ')}`)
    }
    if (criteria.valueRange) {
      const min = criteria.valueRange.min.toLocaleString('en-IN')
      const max = criteria.valueRange.max === Infinity ? '∞' : criteria.valueRange.max.toLocaleString('en-IN')
      parts.push(`Value: ₹${min} - ₹${max}`)
    }
    if (criteria.territory?.length) {
      parts.push(`Territory: ${criteria.territory.join(', ')}`)
    }
    if (criteria.industry?.length) {
      parts.push(`Industry: ${criteria.industry.join(', ')}`)
    }
    return parts.join(' • ')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Cog className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Lead Assignment Rules</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Automate lead distribution with intelligent routing rules
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateDialog(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Rule
            </button>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-4 gap-2 mt-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
              <div className="text-sm text-blue-600 font-medium">Total Rules</div>
              <div className="text-2xl font-bold text-blue-900 mt-1">{rules.length}</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
              <div className="text-sm text-green-600 font-medium">Active Rules</div>
              <div className="text-2xl font-bold text-green-900 mt-1">
                {rules.filter(r => r.active).length}
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
              <div className="text-sm text-purple-600 font-medium">Total Assignments</div>
              <div className="text-2xl font-bold text-purple-900 mt-1">
                {rules.reduce((sum, r) => sum + r.totalAssignments, 0)}
              </div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
              <div className="text-sm text-orange-600 font-medium">Avg. Load</div>
              <div className="text-2xl font-bold text-orange-900 mt-1">
                {Math.round(
                  rules.reduce((sum, r) =>
                    sum + r.assignees.reduce((s, a) => s + a.currentLoad, 0) / r.assignees.length, 0
                  ) / rules.length
                )}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rules List */}
      <div className="p-6 space-y-2">
        {isLoading && (
          <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
            Loading assignment rules…
          </div>
        )}
        {loadError && !isLoading && (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4" />
            {loadError}
          </div>
        )}
        {!isLoading && rules.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Cog className="w-16 h-16 text-gray-300 mb-2" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Assignment Rules</h3>
            <p className="text-gray-600 mb-2">Create your first rule to automate lead distribution</p>
            <button
              onClick={() => setShowCreateDialog(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create First Rule
            </button>
          </div>
        ) : (
          rules
            .sort((a, b) => a.priority - b.priority)
            .map((rule) => (
              <div
                key={rule.id}
                className={`bg-white rounded-lg border-2 transition-all ${
                  rule.active ? 'border-green-200' : 'border-gray-200'
                }`}
              >
                {/* Rule Header */}
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2 flex-1">
                      <button
                        onClick={() => toggleRuleExpansion(rule.id)}
                        className="p-1 hover:bg-gray-100 rounded transition-colors mt-1"
                      >
                        {expandedRules.has(rule.id) ? (
                          <ChevronDown className="w-5 h-5 text-gray-600" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-gray-600" />
                        )}
                      </button>

                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">{getTypeIcon(rule.type)}</span>
                          <div>
                            <h3 className="font-semibold text-gray-900">{rule.name}</h3>
                            <p className="text-sm text-gray-600">{rule.description}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mt-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            rule.active
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {rule.active ? '● Active' : '○ Inactive'}
                          </span>
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                            {getTypeName(rule.type)}
                          </span>
                          <span className="text-xs text-gray-500">
                            Priority: {rule.priority}
                          </span>
                          <span className="text-xs text-gray-500">
                            {rule.assignees.length} assignees
                          </span>
                          <span className="text-xs text-gray-500">
                            {rule.totalAssignments} total assignments
                          </span>
                        </div>

                        <div className="mt-2 text-sm text-gray-600">
                          <span className="font-medium">Criteria:</span> {formatCriteria(rule.criteria)}
                        </div>

                        {rule.lastRun && (
                          <div className="mt-1 text-xs text-gray-500">
                            Last run: {rule.lastRun}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleRuleStatus(rule.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          rule.active
                            ? 'bg-orange-100 text-orange-600 hover:bg-orange-200'
                            : 'bg-green-100 text-green-600 hover:bg-green-200'
                        }`}
                        title={rule.active ? 'Pause Rule' : 'Activate Rule'}
                      >
                        {rule.active ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => setEditingRule(rule.id)}
                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                        title="Edit Rule"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteRule(rule.id)}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                        title="Delete Rule"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedRules.has(rule.id) && (
                  <div className="border-t border-gray-200 p-3 bg-gray-50">
                    <h4 className="font-semibold text-gray-900 mb-3">Assignees & Load Distribution</h4>
                    <div className="space-y-3">
                      {rule.assignees.map((assignee) => (
                        <div key={assignee.id} className="bg-white rounded-lg p-3 border border-gray-200">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <div className="font-medium text-gray-900">{assignee.name}</div>
                              <div className="text-sm text-gray-600">{assignee.email}</div>
                              {assignee.territories && assignee.territories.length > 0 && (
                                <div className="text-xs text-gray-500 mt-1">
                                  Territories: {assignee.territories.join(', ')}
                                </div>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium text-gray-900">
                                {assignee.currentLoad} / {assignee.maxLoad} leads
                              </div>
                              <div className={`text-xs ${
                                assignee.currentLoad / assignee.maxLoad > 0.8
                                  ? 'text-red-600'
                                  : assignee.currentLoad / assignee.maxLoad > 0.6
                                  ? 'text-orange-600'
                                  : 'text-green-600'
                              }`}>
                                {Math.round((assignee.currentLoad / assignee.maxLoad) * 100)}% capacity
                              </div>
                            </div>
                          </div>
                          {/* Load Bar */}
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                assignee.currentLoad / assignee.maxLoad > 0.8
                                  ? 'bg-red-500'
                                  : assignee.currentLoad / assignee.maxLoad > 0.6
                                  ? 'bg-orange-500'
                                  : 'bg-green-500'
                              }`}
                              style={{ width: `${(assignee.currentLoad / assignee.maxLoad) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
        )}
      </div>

      {/* Create/Edit Dialog Placeholder */}
      {showCreateDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Create Assignment Rule</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-600">Rule creation form will be implemented here...</p>
              <div className="space-y-2 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rule Name</label>
                  <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rule Type</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option>Round Robin</option>
                    <option>Territory-Based</option>
                    <option>Load Balanced</option>
                    <option>Custom Logic</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowCreateDialog(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Create Rule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
