'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Package2,
  Search,
  Filter,
  Download,
  Plus,
  Edit,
  Eye,
  Trash2,
  DollarSign,
  Tag,
  ShoppingCart,
  AlertCircle
} from 'lucide-react'
import {
  BundleModal,
  ViewBundleModal,
  FilterModal
} from '@/components/cpq/BundleModals'
import { cpqProductService } from '@/services/cpq'

interface Bundle {
  id: string
  name: string
  description: string
  products: number
  basePrice: number
  bundlePrice: number
  savings: number
  status: 'active' | 'inactive'
  popularity: number
}

export default function CPQProductsBundlesPage() {
  const router = useRouter()

  const [bundles, setBundles] = useState<Bundle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setIsLoading(true)
      setLoadError(null)
      try {
        // Backend returns the ProductBundle ORM shape (bundleName/description/
        // basePrice/finalPrice/discountPercentage/items[]/isActive); map it to this
        // page's Bundle model. popularity is presentation-only (defaults to 0).
        const raw = (await cpqProductService.findAllBundles()) as any[]
        const mapped: Bundle[] = (raw ?? []).map((b) => ({
          id: b.id ?? '',
          name: b.bundleName ?? '',
          description: b.description ?? '',
          products: Array.isArray(b.items) ? b.items.length : Number(b.products ?? 0),
          basePrice: Number(b.basePrice ?? 0),
          bundlePrice: Number(b.finalPrice ?? b.basePrice ?? 0),
          savings: Number(b.discountPercentage ?? 0),
          status: b.isActive === false ? 'inactive' : 'active',
          popularity: Number(b.popularity ?? 0),
        }))
        if (!cancelled) setBundles(mapped)
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load bundles')
          setBundles([])
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

  // Modal states
  const [isBundleModalOpen, setIsBundleModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [selectedBundle, setSelectedBundle] = useState<Bundle | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [appliedFilters, setAppliedFilters] = useState<any>(null)

  const getStatusColor = (status: string) => {
    return status === 'active'
      ? 'bg-green-100 text-green-700 border-green-200'
      : 'bg-gray-100 text-gray-700 border-gray-200'
  }

  // Handlers
  const handleCreateBundle = () => {
    setSelectedBundle(null)
    setIsBundleModalOpen(true)
  }

  const handleEditBundle = (bundle: Bundle) => {
    setSelectedBundle(bundle)
    setIsBundleModalOpen(true)
  }

  const handleViewBundle = (bundle: Bundle) => {
    setSelectedBundle(bundle)
    setIsViewModalOpen(true)
  }

  const handleSaveBundle = (bundleData: Partial<Bundle>) => {
    if (selectedBundle) {
      // Update existing bundle
      setBundles(bundles.map(b =>
        b.id === selectedBundle.id
          ? { ...b, ...bundleData }
          : b
      ))
    } else {
      // Create new bundle
      const newBundle: Bundle = {
        ...bundleData as Bundle,
        id: `BUN-${String(bundles.length + 1).padStart(3, '0')}`
      }
      setBundles([...bundles, newBundle])
    }
  }

  const handleExport = () => {
    const data = filteredBundles.map(b => ({
      ID: b.id,
      Name: b.name,
      Description: b.description,
      Products: b.products,
      'Base Price': b.basePrice,
      'Bundle Price': b.bundlePrice,
      'Savings %': b.savings,
      Status: b.status,
      'Popularity %': b.popularity
    }))

    const csv = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `product-bundles-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleApplyFilters = (filters: any) => {
    setAppliedFilters(filters)
  }

  // Filtering logic
  const filteredBundles = bundles.filter(bundle => {
    // Search filter
    const matchesSearch = searchQuery === '' ||
      bundle.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bundle.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bundle.id.toLowerCase().includes(searchQuery.toLowerCase())

    // Advanced filters
    let matchesFilters = true
    if (appliedFilters) {
      // Status filter
      if (appliedFilters.status.length > 0 && !appliedFilters.status.includes(bundle.status)) {
        matchesFilters = false
      }

      // Products count filter
      if (appliedFilters.minProducts && bundle.products < parseInt(appliedFilters.minProducts)) {
        matchesFilters = false
      }
      if (appliedFilters.maxProducts && bundle.products > parseInt(appliedFilters.maxProducts)) {
        matchesFilters = false
      }

      // Price filter (in lakhs)
      const bundlePriceInLakhs = bundle.bundlePrice / 100000
      if (appliedFilters.minPrice && bundlePriceInLakhs < parseFloat(appliedFilters.minPrice)) {
        matchesFilters = false
      }
      if (appliedFilters.maxPrice && bundlePriceInLakhs > parseFloat(appliedFilters.maxPrice)) {
        matchesFilters = false
      }

      // Savings filter
      if (appliedFilters.minSavings && bundle.savings < parseFloat(appliedFilters.minSavings)) {
        matchesFilters = false
      }
      if (appliedFilters.maxSavings && bundle.savings > parseFloat(appliedFilters.maxSavings)) {
        matchesFilters = false
      }

      // Popularity filter
      if (appliedFilters.minPopularity && bundle.popularity < parseFloat(appliedFilters.minPopularity)) {
        matchesFilters = false
      }
      if (appliedFilters.maxPopularity && bundle.popularity > parseFloat(appliedFilters.maxPopularity)) {
        matchesFilters = false
      }
    }

    return matchesSearch && matchesFilters
  })

  return (
    <div className="w-full h-full px-4 py-2">
      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading bundles…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}
      {!isLoading && !loadError && bundles.length === 0 && (
        <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          No bundles found.
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
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
          <button
            onClick={handleCreateBundle}
            className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Bundle
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-5 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Bundles</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{filteredBundles.length}</p>
              <p className="text-xs text-blue-700 mt-1">
                {filteredBundles.length === bundles.length ? 'Active offers' : `of ${bundles.length} total`}
              </p>
            </div>
            <Package2 className="h-10 w-10 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-5 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Avg Savings</p>
              <p className="text-2xl font-bold text-green-900 mt-1">
                {filteredBundles.length > 0
                  ? (filteredBundles.reduce((sum, b) => sum + b.savings, 0) / filteredBundles.length).toFixed(0)
                  : 0}%
              </p>
              <p className="text-xs text-green-700 mt-1">For customers</p>
            </div>
            <Tag className="h-10 w-10 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-5 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Total Products</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">
                {filteredBundles.reduce((sum, b) => sum + b.products, 0)}
              </p>
              <p className="text-xs text-purple-700 mt-1">In bundles</p>
            </div>
            <ShoppingCart className="h-10 w-10 text-purple-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-5 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Bundle Value</p>
              <p className="text-2xl font-bold text-orange-900 mt-1">
                ₹{(filteredBundles.reduce((sum, b) => sum + b.bundlePrice, 0) / 10000000).toFixed(1)}Cr
              </p>
              <p className="text-xs text-orange-700 mt-1">Total worth</p>
            </div>
            <DollarSign className="h-10 w-10 text-orange-600" />
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
            placeholder="Search bundles by name or description..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Bundles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredBundles.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Package2 className="h-16 w-16 text-gray-400 mb-2" />
            <p className="text-gray-600 text-lg">No bundles found</p>
            <p className="text-gray-500 text-sm mt-2">
              {searchQuery || appliedFilters
                ? 'Try adjusting your search or filters'
                : 'Create your first bundle to get started'}
            </p>
          </div>
        ) : (
          filteredBundles.map((bundle) => (
            <div
              key={bundle.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="h-32 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                <Package2 className="h-16 w-16 text-blue-600" />
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{bundle.name}</h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{bundle.description}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(bundle.status)}`}>
                    {bundle.status}
                  </span>
                </div>

                <div className="space-y-2 mb-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Products:</span>
                    <span className="font-medium text-gray-900">{bundle.products} items</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Base Price:</span>
                    <span className="font-medium text-gray-900 line-through">₹{(bundle.basePrice / 100000).toFixed(2)}L</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Bundle Price:</span>
                    <span className="font-bold text-green-600">₹{(bundle.bundlePrice / 100000).toFixed(2)}L</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-green-600">Save {bundle.savings}%</span>
                    <span className="text-xs text-gray-500">Popularity: {bundle.popularity}%</span>
                  </div>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${bundle.popularity}%` }}
                  ></div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleViewBundle(bundle)}
                    className="flex-1 px-3 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 text-sm"
                  >
                    <Eye className="h-4 w-4" />
                    View Details
                  </button>
                  <button
                    onClick={() => handleEditBundle(bundle)}
                    className="px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    aria-label="Edit"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modals */}
      <BundleModal
        isOpen={isBundleModalOpen}
        onClose={() => setIsBundleModalOpen(false)}
        onSave={handleSaveBundle}
        bundle={selectedBundle}
      />

      <ViewBundleModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        bundle={selectedBundle}
        onEdit={() => {
          setIsViewModalOpen(false)
          setIsBundleModalOpen(true)
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
