'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  GitBranch,
  Search,
  Filter,
  Download,
  Plus,
  Edit,
  ToggleLeft,
  ToggleRight,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react'
import { cpqConfigRuleService } from '@/services/cpq/cpq-orphans.service'
import {
  RuleModal,
  ViewRuleModal,
  FilterModal
} from '@/components/cpq/RuleModals'

interface ConfigurationRule {
  id: string
  name: string
  type: 'compatibility' | 'dependency' | 'constraint' | 'pricing'
  condition: string
  action: string
  priority: number
  status: 'active' | 'inactive'
  affectedProducts: number
}

export default function CPQProductsRulesPage() {
  const router = useRouter()

  const [rules, setRules] = useState<ConfigurationRule[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)
    cpqConfigRuleService
      .findAll()
      .then((rows) => {
        if (!active) return
        const mapped: ConfigurationRule[] = (Array.isArray(rows) ? rows : []).map((r) => ({
          id: r.id,
          name: r.name ?? '',
          type: (r.type ?? 'compatibility') as ConfigurationRule['type'],
          condition: r.condition ?? '',
          action: r.action ?? '',
          priority: Number(r.priority) || 1,
          status: (r.status ?? 'active') as ConfigurationRule['status'],
          affectedProducts: Number(r.affectedProducts) || 0
        }))
        setRules(mapped)
      })
      .catch((err) => {
        if (active) setError(err?.message || 'Failed to load configuration rules')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  // Modal states
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [selectedRule, setSelectedRule] = useState<ConfigurationRule | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string | null>(null)
  const [appliedFilters, setAppliedFilters] = useState<any>(null)

  // Handlers
  const handleAddRule = () => {
    setSelectedRule(null)
    setIsRuleModalOpen(true)
  }

  const handleEditRule = (rule: ConfigurationRule) => {
    setSelectedRule(rule)
    setIsRuleModalOpen(true)
  }

  const handleViewRule = (rule: ConfigurationRule) => {
    setSelectedRule(rule)
    setIsViewModalOpen(true)
  }

  const handleSaveRule = (ruleData: Partial<ConfigurationRule>) => {
    if (selectedRule) {
      // Update existing rule
      setRules(rules.map(r =>
        r.id === selectedRule.id
          ? { ...r, ...ruleData }
          : r
      ))
    } else {
      // Create new rule
      const newRule: ConfigurationRule = {
        ...ruleData as ConfigurationRule,
        id: `RULE-${String(rules.length + 1).padStart(3, '0')}`
      }
      setRules([...rules, newRule])
    }
  }

  const handleToggleStatus = (rule: ConfigurationRule) => {
    setRules(rules.map(r =>
      r.id === rule.id
        ? { ...r, status: r.status === 'active' ? 'inactive' : 'active' }
        : r
    ))
  }

  const handleExport = () => {
    if (filteredRules.length === 0) return
    const data = filteredRules.map(r => ({
      ID: r.id,
      Name: r.name,
      Type: r.type,
      Condition: r.condition,
      Action: r.action,
      Priority: r.priority,
      'Affected Products': r.affectedProducts,
      Status: r.status
    }))

    const csv = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).map(v =>
        typeof v === 'string' && v.includes(',') ? `"${v}"` : v
      ).join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `configuration-rules-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleApplyFilters = (filters: any) => {
    setAppliedFilters(filters)
  }

  const handleTypeFilter = (type: string | null) => {
    setSelectedTypeFilter(type)
  }

  // Filtering logic
  const filteredRules = rules.filter(rule => {
    // Search filter
    const matchesSearch = searchQuery === '' ||
      rule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.condition.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.id.toLowerCase().includes(searchQuery.toLowerCase())

    // Type filter (quick filter buttons)
    const matchesTypeFilter = !selectedTypeFilter || rule.type === selectedTypeFilter

    // Advanced filters
    let matchesFilters = true
    if (appliedFilters) {
      // Types filter
      if (appliedFilters.types.length > 0 && !appliedFilters.types.includes(rule.type)) {
        matchesFilters = false
      }

      // Priorities filter
      if (appliedFilters.priorities.length > 0 && !appliedFilters.priorities.includes(rule.priority)) {
        matchesFilters = false
      }

      // Status filter
      if (appliedFilters.status.length > 0 && !appliedFilters.status.includes(rule.status)) {
        matchesFilters = false
      }

      // Affected products filter
      if (appliedFilters.minAffectedProducts && rule.affectedProducts < parseInt(appliedFilters.minAffectedProducts)) {
        matchesFilters = false
      }
      if (appliedFilters.maxAffectedProducts && rule.affectedProducts > parseInt(appliedFilters.maxAffectedProducts)) {
        matchesFilters = false
      }
    }

    return matchesSearch && matchesTypeFilter && matchesFilters
  })

  const getTypeColor = (type: string) => {
    const colors: any = {
      compatibility: 'bg-blue-100 text-blue-700 border-blue-200',
      dependency: 'bg-purple-100 text-purple-700 border-purple-200',
      constraint: 'bg-orange-100 text-orange-700 border-orange-200',
      pricing: 'bg-green-100 text-green-700 border-green-200'
    }
    return colors[type] || colors.compatibility
  }

  const getStatusColor = (status: string) => {
    return status === 'active'
      ? 'bg-green-100 text-green-700 border-green-200'
      : 'bg-gray-100 text-gray-700 border-gray-200'
  }

  const getPriorityColor = (priority: number) => {
    if (priority === 1) return 'bg-red-100 text-red-700 border-red-200'
    if (priority === 2) return 'bg-yellow-100 text-yellow-700 border-yellow-200'
    return 'bg-gray-100 text-gray-700 border-gray-200'
  }

  return (
    <div className="w-full h-full px-4 py-2">
      {/* Action Buttons */}
      <div className="mb-3 flex justify-end">
        <div className="flex items-center gap-3">
          <button onClick={() => setIsFilterModalOpen(true)} className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </button>
          <button onClick={handleExport} className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </button>
          <button onClick={handleAddRule} className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Rule
          </button>
        </div>
      </div>

      {loading && (
        <div className="mb-3 flex items-center gap-2 text-sm text-gray-600">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading configuration rules...
        </div>
      )}
      {error && !loading && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-5 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Rules</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{filteredRules.length}</p>
              <p className="text-xs text-blue-700 mt-1">Configuration rules</p>
            </div>
            <GitBranch className="h-10 w-10 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-5 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Active Rules</p>
              <p className="text-2xl font-bold text-green-900 mt-1">
                {rules.filter(r => r.status === 'active').length}
              </p>
              <p className="text-xs text-green-700 mt-1">Currently enforced</p>
            </div>
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-5 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">High Priority</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">
                {rules.filter(r => r.priority === 1).length}
              </p>
              <p className="text-xs text-purple-700 mt-1">Critical rules</p>
            </div>
            <AlertCircle className="h-10 w-10 text-purple-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-5 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Avg Products</p>
              <p className="text-2xl font-bold text-orange-900 mt-1">
                {rules.length > 0 ? Math.round(rules.reduce((sum, r) => sum + r.affectedProducts, 0) / rules.length) : 0}
              </p>
              <p className="text-xs text-orange-700 mt-1">Per rule</p>
            </div>
            <GitBranch className="h-10 w-10 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Rule Type Filter */}
      <div className="mb-3 flex gap-3">
        <button onClick={() => handleTypeFilter(null)} className={`px-4 py-2 rounded-lg text-sm font-medium ${!selectedTypeFilter ? 'bg-blue-100 text-blue-700 border border-blue-200 hover:bg-blue-200' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}>
          All Rules ({rules.length})
        </button>
        <button onClick={() => handleTypeFilter('compatibility')} className={`px-4 py-2 rounded-lg text-sm ${selectedTypeFilter === 'compatibility' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}>
          Compatibility ({rules.filter(r => r.type === 'compatibility').length})
        </button>
        <button onClick={() => handleTypeFilter('dependency')} className={`px-4 py-2 rounded-lg text-sm ${selectedTypeFilter === 'dependency' ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}>
          Dependency ({rules.filter(r => r.type === 'dependency').length})
        </button>
        <button onClick={() => handleTypeFilter('constraint')} className={`px-4 py-2 rounded-lg text-sm ${selectedTypeFilter === 'constraint' ? 'bg-orange-100 text-orange-700 border border-orange-200' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}>
          Constraint ({rules.filter(r => r.type === 'constraint').length})
        </button>
        <button onClick={() => handleTypeFilter('pricing')} className={`px-4 py-2 rounded-lg text-sm ${selectedTypeFilter === 'pricing' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}>
          Pricing ({rules.filter(r => r.type === 'pricing').length})
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search configuration rules..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Rules Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rule Name</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Condition</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Priority</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Affected</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRules.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <GitBranch className="h-12 w-12 text-gray-400 mb-3" />
                    <p className="text-gray-600 text-lg">No rules found</p>
                    <p className="text-gray-500 text-sm mt-2">
                      {searchQuery || appliedFilters ? 'Try adjusting your search or filters' : 'Create your first configuration rule to get started'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredRules.map((rule) => (
                  <tr key={rule.id} onClick={() => handleViewRule(rule)} className="hover:bg-gray-50 transition-colors cursor-pointer">
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-gray-900">{rule.name}</div>
                      <div className="text-xs text-gray-500">{rule.id}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getTypeColor(rule.type)}`}>
                        {rule.type}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-xs text-gray-700 max-w-xs">{rule.condition}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-xs text-gray-700 max-w-xs">{rule.action}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getPriorityColor(rule.priority)}`}>
                        P{rule.priority}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <span className="text-sm text-gray-700">{rule.affectedProducts} products</span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(rule.status)}`}>
                        {rule.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={(e) => { e.stopPropagation(); handleEditRule(rule); }} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" aria-label="Edit">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleToggleStatus(rule); }} className="p-1.5 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors" title={rule.status === 'active' ? 'Deactivate' : 'Activate'}>
                          {rule.status === 'active' ? <ToggleRight className="h-4 w-4 text-green-600" /> : <ToggleLeft className="h-4 w-4 text-gray-400" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rule Examples Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Rule Types:</h3>
        <ul className="text-xs text-blue-700 space-y-1">
          <li><strong>Compatibility:</strong> Defines which options can or cannot be selected together</li>
          <li><strong>Dependency:</strong> Specifies that selecting one option requires another option</li>
          <li><strong>Constraint:</strong> Sets limits on configuration values (min/max, ranges)</li>
          <li><strong>Pricing:</strong> Applies dynamic pricing based on selections (discounts, upcharges)</li>
        </ul>
      </div>

      {/* Modals */}
      <RuleModal
        isOpen={isRuleModalOpen}
        onClose={() => setIsRuleModalOpen(false)}
        onSave={handleSaveRule}
        rule={selectedRule}
      />

      <ViewRuleModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        rule={selectedRule}
        onEdit={() => {
          setIsViewModalOpen(false)
          setIsRuleModalOpen(true)
        }}
      />

      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={handleApplyFilters}
      />
    </div>
  )
}
