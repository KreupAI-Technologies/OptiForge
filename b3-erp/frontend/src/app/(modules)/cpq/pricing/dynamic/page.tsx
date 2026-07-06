'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Zap,
  Search,
  Filter,
  Download,
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  RefreshCw,
  Plus
} from 'lucide-react'
import { DynamicFactorModal, FilterModal, DynamicPricingFactor } from '@/components/cpq/DynamicPricingModals'
import { cpqPricingService } from '@/services/cpq/cpq-pricing.service'

export default function CPQPricingDynamicPage() {
  const router = useRouter()

  const [pricingFactors, setPricingFactors] = useState<DynamicPricingFactor[]>([
    {
      id: 'DF-001',
      name: 'High Demand - Modular Kitchens',
      type: 'demand',
      currentValue: 'Demand +45%',
      impact: 'positive',
      adjustment: '+8%',
      lastUpdated: '2 hours ago'
    },
    {
      id: 'DF-002',
      name: 'Low Stock - Premium Cabinets',
      type: 'inventory',
      currentValue: 'Stock Level: 12%',
      impact: 'positive',
      adjustment: '+12%',
      lastUpdated: '30 mins ago'
    },
    {
      id: 'DF-003',
      name: 'Competitor Price Drop - L-Shaped',
      type: 'competitor',
      currentValue: 'Market: -5%',
      impact: 'negative',
      adjustment: '-5%',
      lastUpdated: '4 hours ago'
    },
    {
      id: 'DF-004',
      name: 'Peak Season Pricing',
      type: 'time',
      currentValue: 'Q4 Festival Season',
      impact: 'positive',
      adjustment: '+10%',
      lastUpdated: '1 day ago'
    },
    {
      id: 'DF-005',
      name: 'Excess Inventory - Basic Countertops',
      type: 'inventory',
      currentValue: 'Stock Level: 87%',
      impact: 'negative',
      adjustment: '-15%',
      lastUpdated: '1 hour ago'
    },
    {
      id: 'DF-006',
      name: 'VIP Customer Segment',
      type: 'customer',
      currentValue: 'Loyalty Tier: Platinum',
      impact: 'negative',
      adjustment: '-7%',
      lastUpdated: '3 hours ago'
    },
    {
      id: 'DF-007',
      name: 'Rush Order Premium',
      type: 'time',
      currentValue: 'Delivery < 7 days',
      impact: 'positive',
      adjustment: '+18%',
      lastUpdated: '45 mins ago'
    },
    {
      id: 'DF-008',
      name: 'Market Share Competition',
      type: 'competitor',
      currentValue: 'Aggressive pricing detected',
      impact: 'negative',
      adjustment: '-8%',
      lastUpdated: '6 hours ago'
    }
  ])

  useEffect(() => {
    let mounted = true
    cpqPricingService.findAllRules().then((rules) => {
      const list = Array.isArray(rules) ? rules : []
      if (!mounted || list.length === 0) return
      const mapped: DynamicPricingFactor[] = list.map((r: any) => ({
        id: (r.id ?? '') as string,
        name: (r.ruleName ?? r.name ?? '') as string,
        type: (r.ruleType ?? r.type ?? 'demand') as any,
        currentValue: String(r.currentValue ?? r.adjustmentType ?? ''),
        impact: (r.impact ?? ((Number(r.adjustmentValue) ?? 0) < 0 ? 'negative' : 'positive')) as any,
        adjustment: String(
          r.adjustment ??
            `${(Number(r.adjustmentValue) ?? 0) >= 0 ? '+' : ''}${r.adjustmentValue ?? 0}%`
        ),
        lastUpdated: (r.updatedAt ?? r.lastUpdated ?? new Date().toISOString()) as string
      }))
      setPricingFactors(mapped)
    })
    return () => {
      mounted = false
    }
  }, [])

  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [selectedFactor, setSelectedFactor] = useState<DynamicPricingFactor | null>(null)
  const [appliedFilters, setAppliedFilters] = useState<any>(null)

  const getTypeColor = (type: string) => {
    const colors: any = {
      demand: 'bg-blue-100 text-blue-700 border-blue-200',
      inventory: 'bg-purple-100 text-purple-700 border-purple-200',
      competitor: 'bg-orange-100 text-orange-700 border-orange-200',
      time: 'bg-green-100 text-green-700 border-green-200',
      customer: 'bg-pink-100 text-pink-700 border-pink-200'
    }
    return colors[type] || colors.demand
  }

  const getImpactIcon = (impact: string) => {
    if (impact === 'positive') return <TrendingUp className="h-4 w-4 text-green-600" />
    if (impact === 'negative') return <TrendingDown className="h-4 w-4 text-red-600" />
    return <Activity className="h-4 w-4 text-gray-600" />
  }

  const getAdjustmentColor = (adjustment: string) => {
    if (adjustment.startsWith('+')) return 'text-green-700 font-semibold'
    if (adjustment.startsWith('-')) return 'text-red-700 font-semibold'
    return 'text-gray-700'
  }

  // Handlers
  const handleAddFactor = () => {
    setSelectedFactor(null)
    setIsModalOpen(true)
  }

  const handleEditFactor = (factor: DynamicPricingFactor) => {
    setSelectedFactor(factor)
    setIsModalOpen(true)
  }

  const handleSaveFactor = (factor: DynamicPricingFactor) => {
    const mapped: any = {
      ruleName: factor.name ?? '',
      ruleType: (factor.type ?? 'discount') as any,
      adjustmentType: 'percentage',
      adjustmentValue: Number(String(factor.adjustment ?? '0').replace(/[+%]/g, '')) || 0,
      isActive: true
    }
    if (selectedFactor) {
      cpqPricingService.updateRule(factor.id, mapped).catch(() => {})
      setPricingFactors(pricingFactors.map(f => f.id === factor.id ? factor : f))
    } else {
      cpqPricingService.createRule(mapped).catch(() => {})
      setPricingFactors([factor, ...pricingFactors])
    }
  }

  const handleExport = () => {
    const headers = ['ID', 'Name', 'Type', 'Current Value', 'Impact', 'Adjustment', 'Last Updated']
    const csvData = filteredFactors.map(factor => [
      factor.id,
      `"${factor.name}"`,
      factor.type,
      `"${factor.currentValue}"`,
      factor.impact,
      factor.adjustment,
      factor.lastUpdated
    ])

    const csv = [headers, ...csvData].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `dynamic-pricing-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleApplyFilters = (filters: any) => {
    setAppliedFilters(filters)
  }

  // Filtering logic
  const filteredFactors = pricingFactors.filter(factor => {
    const matchesSearch = searchQuery === '' ||
      factor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      factor.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      factor.type.toLowerCase().includes(searchQuery.toLowerCase())

    let matchesFilters = true
    if (appliedFilters) {
      if (appliedFilters.types.length > 0 && !appliedFilters.types.includes(factor.type)) {
        matchesFilters = false
      }
      if (appliedFilters.impacts.length > 0 && !appliedFilters.impacts.includes(factor.impact)) {
        matchesFilters = false
      }
    }

    return matchesSearch && matchesFilters
  })

  const totalAdjustment = filteredFactors.reduce((sum, factor) => {
    const value = parseFloat(factor.adjustment.replace(/[+%-]/g, ''))
    return sum + (factor.adjustment.startsWith('-') ? -value : value)
  }, 0)

  return (
    <div className="w-full h-full px-4 py-2">
      {/* Action Buttons */}
      <div className="mb-3 flex justify-end">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsFilterModalOpen(true)}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filter
            {appliedFilters && (appliedFilters.types.length > 0 || appliedFilters.impacts.length > 0) && (
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                Active
              </span>
            )}
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
          <button
            onClick={handleAddFactor}
            className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Factor
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-5 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Active Factors</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{filteredFactors.length}</p>
              <p className="text-xs text-blue-700 mt-1">{searchQuery || appliedFilters ? 'Matching factors' : 'Influencing prices'}</p>
            </div>
            <Zap className="h-10 w-10 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-5 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Positive Impact</p>
              <p className="text-2xl font-bold text-green-900 mt-1">
                {filteredFactors.filter(f => f.impact === 'positive').length}
              </p>
              <p className="text-xs text-green-700 mt-1">Price increases</p>
            </div>
            <TrendingUp className="h-10 w-10 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-5 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Negative Impact</p>
              <p className="text-2xl font-bold text-red-900 mt-1">
                {filteredFactors.filter(f => f.impact === 'negative').length}
              </p>
              <p className="text-xs text-red-700 mt-1">Price decreases</p>
            </div>
            <TrendingDown className="h-10 w-10 text-red-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-5 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Net Adjustment</p>
              <p className={`text-2xl font-bold mt-1 ${totalAdjustment >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                {totalAdjustment >= 0 ? '+' : ''}{totalAdjustment.toFixed(1)}%
              </p>
              <p className="text-xs text-purple-700 mt-1">Combined effect</p>
            </div>
            <DollarSign className="h-10 w-10 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Factor Type Filter */}
      <div className="mb-3 flex gap-3 flex-wrap">
        <button className="px-4 py-2 bg-blue-100 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-200 text-sm font-medium">
          All Factors ({filteredFactors.length})
        </button>
        <button className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
          Demand ({pricingFactors.filter(f => f.type === 'demand').length})
        </button>
        <button className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
          Inventory ({pricingFactors.filter(f => f.type === 'inventory').length})
        </button>
        <button className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
          Competitor ({pricingFactors.filter(f => f.type === 'competitor').length})
        </button>
        <button className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
          Time ({pricingFactors.filter(f => f.type === 'time').length})
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
            placeholder="Search dynamic pricing factors..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Dynamic Pricing Factors Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Factor Name</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Value</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Impact</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Adjustment</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredFactors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                    {searchQuery || appliedFilters ? (
                      <div>
                        <p className="text-lg font-medium mb-2">No matching factors found</p>
                        <p className="text-sm">Try adjusting your search or filter criteria</p>
                        <button
                          onClick={() => {
                            setSearchQuery('')
                            setAppliedFilters(null)
                          }}
                          className="mt-4 px-4 py-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          Clear filters
                        </button>
                      </div>
                    ) : (
                      <div>
                        <p className="text-lg font-medium mb-2">No dynamic pricing factors yet</p>
                        <p className="text-sm">Click "Add Factor" to create your first dynamic pricing factor</p>
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                filteredFactors.map((factor) => (
                <tr key={factor.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4">
                    <div className="text-sm font-medium text-gray-900">{factor.name}</div>
                    <div className="text-xs text-gray-500">{factor.id}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getTypeColor(factor.type)}`}>
                      {factor.type}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-gray-700">{factor.currentValue}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center">
                      {getImpactIcon(factor.impact)}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <span className={`text-lg ${getAdjustmentColor(factor.adjustment)}`}>
                      {factor.adjustment}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditFactor(factor)}
                        className="text-xs text-gray-600 hover:text-blue-600"
                      >
                        {new Date(factor.lastUpdated).toLocaleString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
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

      {/* Dynamic Pricing Info */}
      <div className="mt-6 bg-purple-50 border border-purple-200 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-purple-900 mb-2">Dynamic Pricing Factors:</h3>
        <ul className="text-xs text-purple-700 space-y-1">
          <li><strong>Demand:</strong> Adjusts pricing based on product demand trends and forecasts</li>
          <li><strong>Inventory:</strong> Modifies prices based on current stock levels (high stock = discount, low stock = premium)</li>
          <li><strong>Competitor:</strong> Responds to competitor pricing changes in real-time</li>
          <li><strong>Time:</strong> Applies seasonal, promotional, or urgency-based pricing</li>
          <li><strong>Customer:</strong> Personalizes pricing based on customer segment and loyalty</li>
        </ul>
      </div>

      {/* Modals */}
      <DynamicFactorModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedFactor(null)
        }}
        onSave={handleSaveFactor}
        factor={selectedFactor}
      />

      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={handleApplyFilters}
      />
    </div>
  )
}
