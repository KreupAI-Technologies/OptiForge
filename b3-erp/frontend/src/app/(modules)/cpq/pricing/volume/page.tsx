'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  TrendingDown,
  Search,
  Filter,
  Download,
  Plus,
  Edit,
  ToggleLeft,
  ToggleRight,
  Package,
  Percent,
  AlertCircle
} from 'lucide-react'
import { VolumeTierModal, FilterModal, VolumeTier } from '@/components/cpq/VolumePricingModals'
import { cpqPricingService } from '@/services/cpq'

export default function CPQPricingVolumePage() {
  const router = useRouter()

  const [volumeTiers, setVolumeTiers] = useState<VolumeTier[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setIsLoading(true)
      setLoadError(null)
      try {
        // Backend returns the VolumeDiscount ORM shape (name/productCategory/
        // tiers[]{minQuantity,maxQuantity,discountPercentage}/isActive). This page
        // renders a fixed tier1/tier2/tier3 model, so collapse the first three
        // tiers defensively (missing tiers become 0% brackets).
        const raw = (await cpqPricingService.findAllVolumeDiscounts()) as any[]
        const tierAt = (tiers: any, i: number) => {
          const t = Array.isArray(tiers) ? tiers[i] : undefined
          return {
            min: Number(t?.minQuantity ?? 0),
            max: Number(t?.maxQuantity ?? 999),
            discount: Number(t?.discountPercentage ?? 0),
          }
        }
        const mapped = (raw ?? []).map((v) => ({
          id: v?.id ?? '',
          name: v?.name ?? '',
          category: v?.productCategory ?? v?.productId ?? '—',
          tier1: tierAt(v?.tiers, 0),
          tier2: tierAt(v?.tiers, 1),
          tier3: tierAt(v?.tiers, 2),
          status: v?.isActive === false ? 'inactive' : 'active',
          applied: Number(v?.applied ?? 0),
        })) as VolumeTier[]
        if (!cancelled) setVolumeTiers(mapped)
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load volume pricing')
          setVolumeTiers([])
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

  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [selectedTier, setSelectedTier] = useState<VolumeTier | null>(null)
  const [appliedFilters, setAppliedFilters] = useState<any>(null)

  const getStatusColor = (status: string) => {
    return status === 'active'
      ? 'bg-green-100 text-green-700 border-green-200'
      : 'bg-gray-100 text-gray-700 border-gray-200'
  }

  // Handlers
  const handleAddTier = () => {
    setSelectedTier(null)
    setIsModalOpen(true)
  }

  const handleEditTier = (tier: VolumeTier) => {
    setSelectedTier(tier)
    setIsModalOpen(true)
  }

  const handleSaveTier = (tier: VolumeTier) => {
    if (selectedTier) {
      setVolumeTiers(volumeTiers.map(t => t.id === tier.id ? tier : t))
    } else {
      setVolumeTiers([tier, ...volumeTiers])
    }
  }

  const handleToggleStatus = (tier: VolumeTier) => {
    setVolumeTiers(volumeTiers.map(t =>
      t.id === tier.id ? { ...t, status: t.status === 'active' ? 'inactive' : 'active' } as VolumeTier : t
    ))
  }

  const handleExport = () => {
    const headers = ['ID', 'Name', 'Category', 'Tier1', 'Tier2', 'Tier3', 'Status', 'Applied']
    const csvData = filteredTiers.map(tier => [
      tier.id,
      `"${tier.name}"`,
      tier.category,
      `${tier.tier1.min}-${tier.tier1.max} units: ${tier.tier1.discount}%`,
      `${tier.tier2.min}-${tier.tier2.max} units: ${tier.tier2.discount}%`,
      `${tier.tier3.min}+ units: ${tier.tier3.discount}%`,
      tier.status,
      tier.applied
    ])

    const csv = [headers, ...csvData].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `volume-pricing-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleApplyFilters = (filters: any) => {
    setAppliedFilters(filters)
  }

  // Filtering logic
  const filteredTiers = volumeTiers.filter(tier => {
    const matchesSearch = searchQuery === '' ||
      tier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tier.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tier.category.toLowerCase().includes(searchQuery.toLowerCase())

    let matchesFilters = true
    if (appliedFilters) {
      if (appliedFilters.status.length > 0 && !appliedFilters.status.includes(tier.status)) {
        matchesFilters = false
      }

      if (appliedFilters.discountRange.min > 0 || appliedFilters.discountRange.max > 0) {
        if (appliedFilters.discountRange.min > 0 && tier.tier3.discount < appliedFilters.discountRange.min) {
          matchesFilters = false
        }
        if (appliedFilters.discountRange.max > 0 && tier.tier3.discount > appliedFilters.discountRange.max) {
          matchesFilters = false
        }
      }
    }

    return matchesSearch && matchesFilters
  })

  const totalApplied = filteredTiers.reduce((sum, tier) => sum + tier.applied, 0)
  const avgMaxDiscount = filteredTiers.length > 0
    ? filteredTiers.reduce((sum, tier) => sum + tier.tier3.discount, 0) / filteredTiers.length
    : 0

  return (
    <div className="w-full h-full px-4 py-2">
      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading volume pricing…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}
      {!isLoading && !loadError && volumeTiers.length === 0 && (
        <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          No volume pricing tiers found.
        </div>
      )}
      {/* Action Buttons */}
      <div className="mb-3 flex justify-end">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsFilterModalOpen(true)}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filter
            {appliedFilters && (appliedFilters.status.length > 0 || appliedFilters.discountRange.min > 0 || appliedFilters.discountRange.max > 0) && (
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
            onClick={handleAddTier}
            className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Tier
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-5 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Volume Tiers</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{filteredTiers.length}</p>
              <p className="text-xs text-blue-700 mt-1">{searchQuery || appliedFilters ? 'Matching tiers' : 'Active pricing tiers'}</p>
            </div>
            <Package className="h-10 w-10 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-5 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Total Applied</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{totalApplied}</p>
              <p className="text-xs text-green-700 mt-1">Orders with discounts</p>
            </div>
            <TrendingDown className="h-10 w-10 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-5 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Avg Max Discount</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">{avgMaxDiscount.toFixed(0)}%</p>
              <p className="text-xs text-purple-700 mt-1">Highest tier average</p>
            </div>
            <Percent className="h-10 w-10 text-purple-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-5 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Categories</p>
              <p className="text-2xl font-bold text-orange-900 mt-1">
                {new Set(volumeTiers.map(t => t.category)).size}
              </p>
              <p className="text-xs text-orange-700 mt-1">Product categories</p>
            </div>
            <Package className="h-10 w-10 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search volume pricing tiers..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Volume Pricing Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tier Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Tier 1 (Base)</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Tier 2</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Tier 3 (Max)</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Applied</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTiers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                    {searchQuery || appliedFilters ? (
                      <div>
                        <p className="text-lg font-medium mb-2">No matching tiers found</p>
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
                        <p className="text-lg font-medium mb-2">No volume tiers yet</p>
                        <p className="text-sm">Click "Add Tier" to create your first volume pricing tier</p>
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                filteredTiers.map((tier) => (
                <tr key={tier.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4">
                    <div className="text-sm font-medium text-gray-900">{tier.name}</div>
                    <div className="text-xs text-gray-500">{tier.id}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-700">{tier.category}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <div className="text-xs text-gray-700">
                      {tier.tier1.min}-{tier.tier1.max} units
                    </div>
                    <div className="text-sm font-semibold text-gray-900 mt-1">
                      {tier.tier1.discount}% off
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <div className="text-xs text-gray-700">
                      {tier.tier2.min}-{tier.tier2.max} units
                    </div>
                    <div className="text-sm font-semibold text-blue-700 mt-1">
                      {tier.tier2.discount}% off
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <div className="text-xs text-gray-700">
                      {tier.tier3.min}+ units
                    </div>
                    <div className="text-sm font-semibold text-green-700 mt-1">
                      {tier.tier3.discount}% off
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <span className="text-sm text-gray-700">{tier.applied}</span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(tier.status)}`}>
                      {tier.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEditTier(tier)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        aria-label="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(tier)}
                        className="p-1.5 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                        title={tier.status === 'active' ? 'Deactivate' : 'Activate'}
                      >
                        {tier.status === 'active' ? <ToggleRight className="h-4 w-4 text-green-600" /> : <ToggleLeft className="h-4 w-4 text-gray-400" />}
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

      {/* Volume Pricing Info */}
      <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-green-900 mb-2">Volume Pricing Benefits:</h3>
        <ul className="text-xs text-green-700 space-y-1">
          <li><strong>Incentivizes Bulk Orders:</strong> Encourages customers to purchase larger quantities</li>
          <li><strong>Inventory Turnover:</strong> Helps move stock faster with attractive volume discounts</li>
          <li><strong>Customer Loyalty:</strong> Rewards repeat and bulk purchasers with better pricing</li>
          <li><strong>Competitive Edge:</strong> Offers better value for large orders compared to competitors</li>
        </ul>
      </div>

      {/* Modals */}
      <VolumeTierModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedTier(null)
        }}
        onSave={handleSaveTier}
        tier={selectedTier}
      />

      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={handleApplyFilters}
      />
    </div>
  )
}
