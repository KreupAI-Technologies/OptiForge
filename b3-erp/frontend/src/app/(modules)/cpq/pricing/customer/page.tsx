'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Users,
  Search,
  Filter,
  Download,
  Plus,
  Edit,
  Star,
  TrendingUp,
  DollarSign,
  Award,
  AlertCircle
} from 'lucide-react'
import { CustomerPricingModal, ViewCustomerModal, FilterModal } from '@/components/cpq/CustomerPricingModals'
import { cpqPricingService } from '@/services/cpq'

interface CustomerPricing {
  id: string
  customerName: string
  customerId: string
  tier: 'platinum' | 'gold' | 'silver' | 'bronze'
  baseDiscount: number
  specialTerms: string
  lifetimeValue: number
  activeContracts: number
  lastUpdated: string
}

export default function CPQPricingCustomerPage() {
  const router = useRouter()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTierFilter, setSelectedTierFilter] = useState<string | null>(null)
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerPricing | null>(null)
  const [appliedFilters, setAppliedFilters] = useState<any>(null)

  const [customerPricing, setCustomerPricing] = useState<CustomerPricing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setIsLoading(true)
      setLoadError(null)
      try {
        // Backend returns the CustomerPricing ORM shape (customerId/customerName/
        // pricingTier/discountPercentage/contractReference/validFrom); map it to
        // this page's display model. lifetimeValue/activeContracts are not part of
        // the pricing record, so they default to 0.
        const raw = (await cpqPricingService.findAllCustomerPricing()) as any[]
        const tierMap: Record<string, CustomerPricing['tier']> = {
          platinum: 'platinum',
          gold: 'gold',
          silver: 'silver',
          bronze: 'bronze',
        }
        const toDate = (v: unknown): string =>
          v ? new Date(v as string).toISOString().split('T')[0] : ''
        const mapped: CustomerPricing[] = (raw ?? []).map((c) => ({
          id: c.id ?? '',
          customerName: c.customerName ?? '',
          customerId: c.customerId ?? '',
          tier: tierMap[String(c.pricingTier ?? '').toLowerCase()] ?? 'bronze',
          baseDiscount: Number(c.discountPercentage ?? 0),
          specialTerms: c.contractReference ?? '',
          lifetimeValue: Number(c.lifetimeValue ?? 0),
          activeContracts: Number(c.activeContracts ?? 0),
          lastUpdated: toDate(c.updatedAt ?? c.validFrom),
        }))
        if (!cancelled) setCustomerPricing(mapped)
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load customer pricing')
          setCustomerPricing([])
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

  const getTierColor = (tier: string) => {
    const colors: any = {
      platinum: 'bg-purple-100 text-purple-700 border-purple-200',
      gold: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      silver: 'bg-gray-100 text-gray-700 border-gray-200',
      bronze: 'bg-orange-100 text-orange-700 border-orange-200'
    }
    return colors[tier] || colors.bronze
  }

  const getTierIcon = (tier: string) => {
    if (tier === 'platinum') return <Award className="h-4 w-4" />
    if (tier === 'gold') return <Star className="h-4 w-4" />
    return <Users className="h-4 w-4" />
  }

  // Handlers
  const handleAddCustomer = () => {
    setSelectedCustomer(null)
    setIsCustomerModalOpen(true)
  }

  const handleEditCustomer = (customer: CustomerPricing) => {
    setSelectedCustomer(customer)
    setIsCustomerModalOpen(true)
  }

  const handleViewCustomer = (customer: CustomerPricing) => {
    setSelectedCustomer(customer)
    setIsViewModalOpen(true)
  }

  const handleSaveCustomer = (customer: CustomerPricing) => {
    if (selectedCustomer) {
      // Edit existing customer
      setCustomerPricing(customerPricing.map(c =>
        c.id === customer.id ? customer : c
      ))
    } else {
      // Add new customer
      setCustomerPricing([...customerPricing, customer])
    }
    setIsCustomerModalOpen(false)
    setSelectedCustomer(null)
  }

  const handleExport = () => {
    const headers = ['ID', 'Customer ID', 'Customer Name', 'Tier', 'Base Discount (%)', 'Lifetime Value', 'Active Contracts', 'Special Terms', 'Last Updated']
    const csvData = filteredCustomers.map(customer => [
      customer.id,
      customer.customerId,
      `"${customer.customerName}"`,
      customer.tier,
      customer.baseDiscount,
      customer.lifetimeValue,
      customer.activeContracts,
      `"${customer.specialTerms}"`,
      customer.lastUpdated
    ])

    const csv = [headers, ...csvData].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `customer-pricing-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleTierFilter = (tier: string | null) => {
    setSelectedTierFilter(tier)
  }

  const handleApplyFilters = (filters: any) => {
    setAppliedFilters(filters)
  }

  // Filtering logic
  const filteredCustomers = customerPricing.filter(customer => {
    const matchesSearch = searchQuery === '' ||
      customer.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.customerId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.specialTerms.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesTier = selectedTierFilter === null || customer.tier === selectedTierFilter

    let matchesAdvancedFilters = true
    if (appliedFilters) {
      if (appliedFilters.tiers.length > 0 && !appliedFilters.tiers.includes(customer.tier)) {
        matchesAdvancedFilters = false
      }
      if (appliedFilters.discountRange.min > 0 && customer.baseDiscount < appliedFilters.discountRange.min) {
        matchesAdvancedFilters = false
      }
      if (appliedFilters.discountRange.max > 0 && customer.baseDiscount > appliedFilters.discountRange.max) {
        matchesAdvancedFilters = false
      }
      if (appliedFilters.lifetimeValueRange.min > 0 && customer.lifetimeValue < appliedFilters.lifetimeValueRange.min * 100000) {
        matchesAdvancedFilters = false
      }
      if (appliedFilters.lifetimeValueRange.max > 0 && customer.lifetimeValue > appliedFilters.lifetimeValueRange.max * 100000) {
        matchesAdvancedFilters = false
      }
    }

    return matchesSearch && matchesTier && matchesAdvancedFilters
  })

  const totalLifetimeValue = filteredCustomers.reduce((sum, c) => sum + c.lifetimeValue, 0)
  const avgDiscount = filteredCustomers.length > 0
    ? filteredCustomers.reduce((sum, c) => sum + c.baseDiscount, 0) / filteredCustomers.length
    : 0

  return (
    <div className="w-full h-full px-4 py-2">
      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading customer pricing…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}
      {!isLoading && !loadError && customerPricing.length === 0 && (
        <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          No customer pricing found.
        </div>
      )}
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
          <button onClick={handleAddCustomer} className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Customer
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-5 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Customers</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{filteredCustomers.length}</p>
              <p className="text-xs text-blue-700 mt-1">{searchQuery || selectedTierFilter || appliedFilters ? 'Matching filter' : 'With custom pricing'}</p>
            </div>
            <Users className="h-10 w-10 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-5 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Lifetime Value</p>
              <p className="text-2xl font-bold text-green-900 mt-1">
                ₹{(totalLifetimeValue / 10000000).toFixed(1)}Cr
              </p>
              <p className="text-xs text-green-700 mt-1">Total customer value</p>
            </div>
            <DollarSign className="h-10 w-10 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-5 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Premium Tiers</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">
                {filteredCustomers.filter(c => c.tier === 'platinum' || c.tier === 'gold').length}
              </p>
              <p className="text-xs text-purple-700 mt-1">Platinum + Gold</p>
            </div>
            <Award className="h-10 w-10 text-purple-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-5 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Avg Discount</p>
              <p className="text-2xl font-bold text-orange-900 mt-1">{avgDiscount.toFixed(1)}%</p>
              <p className="text-xs text-orange-700 mt-1">Across all customers</p>
            </div>
            <TrendingUp className="h-10 w-10 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Tier Filter */}
      <div className="mb-3 flex gap-3">
        <button onClick={() => handleTierFilter(null)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          selectedTierFilter === null
            ? 'bg-blue-100 text-blue-700 border border-blue-200'
            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
        }`}>
          All Customers ({customerPricing.length})
        </button>
        <button onClick={() => handleTierFilter('platinum')} className={`px-4 py-2 rounded-lg text-sm transition-colors ${
          selectedTierFilter === 'platinum'
            ? 'bg-blue-100 text-blue-700 border border-blue-200'
            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
        }`}>
          Platinum ({customerPricing.filter(c => c.tier === 'platinum').length})
        </button>
        <button onClick={() => handleTierFilter('gold')} className={`px-4 py-2 rounded-lg text-sm transition-colors ${
          selectedTierFilter === 'gold'
            ? 'bg-blue-100 text-blue-700 border border-blue-200'
            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
        }`}>
          Gold ({customerPricing.filter(c => c.tier === 'gold').length})
        </button>
        <button onClick={() => handleTierFilter('silver')} className={`px-4 py-2 rounded-lg text-sm transition-colors ${
          selectedTierFilter === 'silver'
            ? 'bg-blue-100 text-blue-700 border border-blue-200'
            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
        }`}>
          Silver ({customerPricing.filter(c => c.tier === 'silver').length})
        </button>
        <button onClick={() => handleTierFilter('bronze')} className={`px-4 py-2 rounded-lg text-sm transition-colors ${
          selectedTierFilter === 'bronze'
            ? 'bg-blue-100 text-blue-700 border border-blue-200'
            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
        }`}>
          Bronze ({customerPricing.filter(c => c.tier === 'bronze').length})
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
            placeholder="Search customers..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Customer Pricing Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Tier</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Base Discount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Special Terms</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Lifetime Value</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Contracts</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Updated</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                    {searchQuery || selectedTierFilter || appliedFilters ? (
                      <div>
                        <p className="text-lg font-medium mb-2">No matching customers found</p>
                        <p className="text-sm">Try adjusting your search or filter criteria</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-lg font-medium mb-2">No customer pricing records yet</p>
                        <p className="text-sm">Click "Add Customer" to create your first customer pricing record</p>
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id} onClick={() => handleViewCustomer(customer)} className="hover:bg-gray-50 transition-colors cursor-pointer">
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-gray-900">{customer.customerName}</div>
                      <div className="text-xs text-gray-500">{customer.customerId}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <span className={`px-2 py-1 inline-flex items-center gap-1 text-xs leading-5 font-semibold rounded-full border ${getTierColor(customer.tier)}`}>
                        {getTierIcon(customer.tier)}
                        {customer.tier}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <span className="text-lg font-bold text-green-700">{customer.baseDiscount}%</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-xs text-gray-700 max-w-xs">{customer.specialTerms}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right">
                      <span className="text-sm font-semibold text-blue-600">
                        ₹{(customer.lifetimeValue / 100000).toFixed(1)}L
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <span className="text-sm text-gray-700">{customer.activeContracts}</span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-xs text-gray-600">{customer.lastUpdated}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleEditCustomer(customer); }}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        aria-label="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Tier Info */}
      <div className="mt-6 bg-purple-50 border border-purple-200 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-purple-900 mb-2">Customer Tier Benefits:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-purple-700">
          <div>
            <p><strong>Platinum (15-20%):</strong> Highest discount, Net 60-90 days, dedicated support, priority service</p>
            <p className="mt-1"><strong>Gold (10-15%):</strong> Premium discount, Net 45 days, quarterly rebates, enhanced support</p>
          </div>
          <div>
            <p><strong>Silver (7-10%):</strong> Standard discount, Net 30 days, regular warranty, basic support</p>
            <p className="mt-1"><strong>Bronze (3-7%):</strong> Entry discount, Net 15 days, standard terms, self-service</p>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CustomerPricingModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onSave={handleSaveCustomer}
        customer={selectedCustomer}
      />

      <ViewCustomerModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        customer={selectedCustomer}
        onEdit={() => {
          setIsViewModalOpen(false)
          setIsCustomerModalOpen(true)
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
