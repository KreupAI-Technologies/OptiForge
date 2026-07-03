'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Gift,
  Search,
  Filter,
  Download,
  Plus,
  Edit,
  ToggleLeft,
  ToggleRight,
  Calendar,
  Tag,
  TrendingUp,
  AlertCircle
} from 'lucide-react'
import { PromotionModal, FilterModal, Promotion } from '@/components/cpq/PromotionModals'
import { cpqPricingService } from '@/services/cpq'

export default function CPQPricingPromotionsPage() {
  const router = useRouter()

  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setIsLoading(true)
      setLoadError(null)
      try {
        // Backend returns the PromotionalPricing ORM shape (promotionName/
        // promotionType/discountValue/validFrom/validTo/usageCount/isActive/
        // applicableProducts); map it to this page's display Promotion model.
        const raw = (await cpqPricingService.findAllPromotions()) as any[]
        const typeMap: Record<string, Promotion['type']> = {
          percentage_off: 'percentage',
          fixed_amount_off: 'fixed-amount',
          buy_x_get_y: 'bogo',
          bundle_discount: 'bundle',
        }
        const toDate = (v: unknown): string =>
          v ? new Date(v as string).toISOString().split('T')[0] : ''
        const deriveStatus = (r: any): Promotion['status'] => {
          if (r?.isActive === false) return 'expired'
          const now = Date.now()
          const from = r?.validFrom ? new Date(r.validFrom).getTime() : NaN
          const to = r?.validTo ? new Date(r.validTo).getTime() : NaN
          if (!Number.isNaN(to) && to < now) return 'expired'
          if (!Number.isNaN(from) && from > now) return 'scheduled'
          return 'active'
        }
        const describeValue = (r: any): string => {
          const v = Number(r?.discountValue ?? 0)
          if (r?.promotionType === 'percentage_off') return `${v}% off`
          if (r?.promotionType === 'fixed_amount_off') return `₹${v.toLocaleString()} off`
          return String(r?.promotionType ?? '')
        }
        const mapped: Promotion[] = (raw ?? []).map((r) => ({
          id: r.id ?? '',
          name: r.promotionName ?? '',
          type: typeMap[r.promotionType] ?? 'percentage',
          value: describeValue(r),
          startDate: toDate(r.validFrom),
          endDate: toDate(r.validTo),
          applicableProducts: Array.isArray(r.applicableProducts)
            ? r.applicableProducts
            : Array.isArray(r.applicableCategories)
              ? r.applicableCategories
              : [],
          minPurchase: r.minimumPurchase != null ? Number(r.minimumPurchase) : undefined,
          status: deriveStatus(r),
          usageCount: Number(r.usageCount ?? 0),
        }))
        if (!cancelled) setPromotions(mapped)
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load promotions')
          setPromotions([])
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
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null)
  const [appliedFilters, setAppliedFilters] = useState<any>(null)

  const getTypeColor = (type: string) => {
    const colors: any = {
      percentage: 'bg-blue-100 text-blue-700 border-blue-200',
      'fixed-amount': 'bg-green-100 text-green-700 border-green-200',
      bogo: 'bg-purple-100 text-purple-700 border-purple-200',
      bundle: 'bg-orange-100 text-orange-700 border-orange-200'
    }
    return colors[type] || colors.percentage
  }

  const getStatusColor = (status: string) => {
    const colors: any = {
      active: 'bg-green-100 text-green-700 border-green-200',
      scheduled: 'bg-blue-100 text-blue-700 border-blue-200',
      expired: 'bg-gray-100 text-gray-700 border-gray-200'
    }
    return colors[status] || colors.active
  }

  // Handlers
  const handleAddPromotion = () => {
    setSelectedPromotion(null)
    setIsModalOpen(true)
  }

  const handleEditPromotion = (promotion: Promotion) => {
    setSelectedPromotion(promotion)
    setIsModalOpen(true)
  }

  const handleSavePromotion = (promotion: Promotion) => {
    if (selectedPromotion) {
      setPromotions(promotions.map(p => p.id === promotion.id ? promotion : p))
    } else {
      setPromotions([promotion, ...promotions])
    }
  }

  const handleToggleStatus = (promotion: Promotion) => {
    const newStatus = promotion.status === 'active' ? 'scheduled' : 'active'
    setPromotions(promotions.map(p =>
      p.id === promotion.id ? { ...p, status: newStatus as Promotion['status'] } : p
    ))
  }

  const handleExport = () => {
    const headers = ['ID', 'Name', 'Type', 'Value', 'Start Date', 'End Date', 'Products', 'Min Purchase', 'Usage', 'Status']
    const csvData = filteredPromotions.map(promo => [
      promo.id,
      `"${promo.name}"`,
      promo.type,
      `"${promo.value}"`,
      promo.startDate,
      promo.endDate,
      `"${promo.applicableProducts.join(', ')}"`,
      promo.minPurchase || 0,
      promo.usageCount,
      promo.status
    ])

    const csv = [headers, ...csvData].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `promotions-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleApplyFilters = (filters: any) => {
    setAppliedFilters(filters)
  }

  // Filtering logic
  const filteredPromotions = promotions.filter(promo => {
    const matchesSearch = searchQuery === '' ||
      promo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      promo.id.toLowerCase().includes(searchQuery.toLowerCase())

    let matchesFilters = true
    if (appliedFilters) {
      if (appliedFilters.types.length > 0 && !appliedFilters.types.includes(promo.type)) {
        matchesFilters = false
      }
      if (appliedFilters.statuses.length > 0 && !appliedFilters.statuses.includes(promo.status)) {
        matchesFilters = false
      }
    }

    return matchesSearch && matchesFilters
  })

  const activePromotions = filteredPromotions.filter(p => p.status === 'active').length
  const totalUsage = filteredPromotions.reduce((sum, p) => sum + p.usageCount, 0)

  return (
    <div className="w-full h-full px-4 py-2">
      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading promotions…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}
      {!isLoading && !loadError && promotions.length === 0 && (
        <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          No promotions found.
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
            {appliedFilters && (appliedFilters.types.length > 0 || appliedFilters.statuses.length > 0) && (
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
            onClick={handleAddPromotion}
            className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New Promotion
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-5 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Promotions</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{filteredPromotions.length}</p>
              <p className="text-xs text-blue-700 mt-1">{searchQuery || appliedFilters ? 'Matching campaigns' : 'All time campaigns'}</p>
            </div>
            <Gift className="h-10 w-10 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-5 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Active Now</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{activePromotions}</p>
              <p className="text-xs text-green-700 mt-1">Currently running</p>
            </div>
            <TrendingUp className="h-10 w-10 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-5 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Total Usage</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">{totalUsage}</p>
              <p className="text-xs text-purple-700 mt-1">Times applied</p>
            </div>
            <Tag className="h-10 w-10 text-purple-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-5 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Scheduled</p>
              <p className="text-2xl font-bold text-orange-900 mt-1">
                {promotions.filter(p => p.status === 'scheduled').length}
              </p>
              <p className="text-xs text-orange-700 mt-1">Upcoming campaigns</p>
            </div>
            <Calendar className="h-10 w-10 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Status Filter */}
      <div className="mb-3 flex gap-3">
        <button className="px-4 py-2 bg-blue-100 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-200 text-sm font-medium">
          All Promotions ({promotions.length})
        </button>
        <button className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
          Active ({activePromotions})
        </button>
        <button className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
          Scheduled ({promotions.filter(p => p.status === 'scheduled').length})
        </button>
        <button className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
          Expired ({promotions.filter(p => p.status === 'expired').length})
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
            placeholder="Search promotions..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Promotions Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Promotion Name</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Value</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Period</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applicable To</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Usage</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPromotions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                    {searchQuery || appliedFilters ? (
                      <div>
                        <p className="text-lg font-medium mb-2">No matching promotions found</p>
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
                        <p className="text-lg font-medium mb-2">No promotions yet</p>
                        <p className="text-sm">Click "New Promotion" to create your first promotion</p>
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                filteredPromotions.map((promo) => (
                <tr key={promo.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4">
                    <div className="text-sm font-medium text-gray-900">{promo.name}</div>
                    <div className="text-xs text-gray-500">{promo.id}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getTypeColor(promo.type)}`}>
                      {promo.type}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <span className="text-sm font-bold text-green-700">{promo.value}</span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <div className="text-xs text-gray-700">
                      {new Date(promo.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </div>
                    <div className="text-xs text-gray-500">to</div>
                    <div className="text-xs text-gray-700">
                      {new Date(promo.endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-xs text-gray-700 max-w-xs">
                      {promo.applicableProducts.slice(0, 2).join(', ')}
                      {promo.applicableProducts.length > 2 && ` +${promo.applicableProducts.length - 2} more`}
                    </div>
                    {promo.minPurchase && (
                      <div className="text-xs text-gray-500 mt-1">
                        Min: ₹{(promo.minPurchase / 100000).toFixed(1)}L
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <span className="text-sm text-gray-700">{promo.usageCount}</span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(promo.status)}`}>
                      {promo.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEditPromotion(promo)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        aria-label="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(promo)}
                        className="p-1.5 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                        title={promo.status === 'active' ? 'Deactivate' : 'Activate'}
                      >
                        {promo.status === 'active' ? <ToggleRight className="h-4 w-4 text-green-600" /> : <ToggleLeft className="h-4 w-4 text-gray-400" />}
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

      {/* Promotion Types Info */}
      <div className="mt-6 bg-orange-50 border border-orange-200 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-orange-900 mb-2">Promotion Types:</h3>
        <ul className="text-xs text-orange-700 space-y-1">
          <li><strong>Percentage:</strong> Apply a percentage discount on eligible products</li>
          <li><strong>Fixed Amount:</strong> Deduct a fixed amount from the total price</li>
          <li><strong>BOGO (Buy One Get One):</strong> Free or discounted products with purchase</li>
          <li><strong>Bundle:</strong> Special pricing when buying multiple products together</li>
        </ul>
      </div>

      {/* Modals */}
      <PromotionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedPromotion(null)
        }}
        onSave={handleSavePromotion}
        promotion={selectedPromotion}
      />

      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={handleApplyFilters}
      />
    </div>
  )
}
