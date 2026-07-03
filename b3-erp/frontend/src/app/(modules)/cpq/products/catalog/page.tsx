'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Package,
  Search,
  Filter,
  Download,
  Plus,
  Edit,
  Eye,
  Copy,
  Archive,
  DollarSign,
  Tag,
  Grid3x3,
  Image,
  AlertCircle
} from 'lucide-react'
import { ProductModal, ViewProductModal, FilterModal, Product } from '@/components/cpq/ProductCatalogModals'
import { cpqProductService } from '@/services/cpq'

export default function CPQProductsCatalogPage() {
  const router = useRouter()

  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setIsLoading(true)
      setLoadError(null)
      try {
        // Backend returns the CPQProduct ORM shape (sku/name/category/basePrice/
        // status/updatedAt); map it to this page's catalog Product model. variants
        // and image are presentation-only and not part of the product record.
        const raw = (await cpqProductService.findAllProducts()) as any[]
        const statusMap: Record<string, Product['status']> = {
          active: 'active',
          inactive: 'inactive',
          discontinued: 'discontinued',
        }
        const toDate = (v: unknown): string =>
          v ? new Date(v as string).toISOString().split('T')[0] : ''
        const mapped: Product[] = (raw ?? []).map((p) => ({
          id: p.id ?? '',
          sku: p.sku ?? '',
          name: p.name ?? '',
          category: p.category ?? '',
          basePrice: Number(p.basePrice ?? 0),
          status: statusMap[p.status] ?? 'active',
          variants: Number(p.variants ?? 0),
          lastModified: toDate(p.updatedAt ?? p.createdAt),
          image: p.imageUrl ?? '📦',
          description: p.description ?? undefined,
        }))
        if (!cancelled) setProducts(mapped)
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load products')
          setProducts([])
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
  const [selectedCategory, setSelectedCategory] = useState('All Categories')
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [appliedFilters, setAppliedFilters] = useState<any>(null)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'inactive':
        return 'bg-gray-100 text-gray-700 border-gray-200'
      case 'discontinued':
        return 'bg-red-100 text-red-700 border-red-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const categories = [
    'All Categories',
    'Premium Modular Kitchen',
    'Island Kitchen',
    'L-Shaped Kitchen',
    'Parallel Kitchen',
    'Compact Kitchen',
    'Commercial Kitchen',
    'Institutional Kitchen',
    'Builder Package'
  ]

  // Handlers
  const handleAddProduct = () => {
    setSelectedProduct(null)
    setIsProductModalOpen(true)
  }

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product)
    setIsProductModalOpen(true)
  }

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product)
    setIsViewModalOpen(true)
  }

  const handleSaveProduct = (product: Product) => {
    if (selectedProduct) {
      setProducts(products.map(p => p.id === product.id ? product : p))
    } else {
      setProducts([product, ...products])
    }
  }

  const handleCopyProduct = (product: Product) => {
    if (confirm(`Create a duplicate of "${product.name}"?`)) {
      const newProduct: Product = {
        ...product,
        id: `PROD-${Date.now()}`,
        sku: `${product.sku}-COPY`,
        name: `${product.name} (Copy)`,
        lastModified: new Date().toISOString().split('T')[0]
      }
      setProducts([newProduct, ...products])
    }
  }

  const handleExport = () => {
    const data = filteredProducts.map(p => ({
      SKU: p.sku,
      Name: p.name,
      Category: p.category,
      'Base Price': p.basePrice,
      Status: p.status,
      Variants: p.variants,
      'Last Modified': p.lastModified
    }))

    const csv = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `products-catalog-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const handleApplyFilters = (filters: any) => {
    setAppliedFilters(filters)
  }

  // Filtering logic
  const filteredProducts = products.filter(product => {
    const matchesSearch = searchQuery === '' ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = selectedCategory === 'All Categories' || product.category === selectedCategory

    let matchesFilters = true
    if (appliedFilters) {
      if (appliedFilters.status.length > 0 && !appliedFilters.status.includes(product.status)) {
        matchesFilters = false
      }

      if (appliedFilters.priceRange.min > 0 || appliedFilters.priceRange.max > 0) {
        const priceInLakhs = product.basePrice / 100000
        if (appliedFilters.priceRange.min > 0 && priceInLakhs < appliedFilters.priceRange.min) {
          matchesFilters = false
        }
        if (appliedFilters.priceRange.max > 0 && priceInLakhs > appliedFilters.priceRange.max) {
          matchesFilters = false
        }
      }

      if (appliedFilters.categories.length > 0 && !appliedFilters.categories.includes(product.category)) {
        matchesFilters = false
      }
    }

    return matchesSearch && matchesCategory && matchesFilters
  })

  return (
    <div className="w-full h-full px-4 py-2">
      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading products…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}
      {!isLoading && !loadError && products.length === 0 && (
        <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          No products found.
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
            {appliedFilters && (appliedFilters.status.length > 0 || appliedFilters.categories.length > 0 || appliedFilters.priceRange.min > 0 || appliedFilters.priceRange.max > 0) && (
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
            onClick={handleAddProduct}
            className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-5 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Products</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{products.length}</p>
              <p className="text-xs text-blue-700 mt-1">In catalog</p>
            </div>
            <Package className="h-10 w-10 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-5 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Active Products</p>
              <p className="text-2xl font-bold text-green-900 mt-1">
                {products.filter(p => p.status === 'active').length}
              </p>
              <p className="text-xs text-green-700 mt-1">Available for sale</p>
            </div>
            <Tag className="h-10 w-10 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-5 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Total Variants</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">
                {products.reduce((sum, p) => sum + p.variants, 0)}
              </p>
              <p className="text-xs text-purple-700 mt-1">Configuration options</p>
            </div>
            <Grid3x3 className="h-10 w-10 text-purple-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-5 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Avg Base Price</p>
              <p className="text-2xl font-bold text-orange-900 mt-1">
                ₹{((products.reduce((sum, p) => sum + p.basePrice, 0) / products.length) / 100000).toFixed(1)}L
              </p>
              <p className="text-xs text-orange-700 mt-1">Per product</p>
            </div>
            <DollarSign className="h-10 w-10 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Category Filters */}
      <div className="mb-3">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 ${
                category === selectedCategory
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              } rounded-lg text-sm font-medium transition-colors`}
            >
              {category}
            </button>
          ))}
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
            placeholder="Search products by name, SKU, or category..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 mb-3">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="h-40 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <span className="text-6xl">{product.image}</span>
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">{product.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">{product.sku}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(product.status)}`}>
                  {product.status}
                </span>
              </div>
              
              <div className="space-y-2 mb-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Category:</span>
                  <span className="font-medium text-gray-700 text-right">{product.category}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Base Price:</span>
                  <span className="font-semibold text-blue-600">₹{(product.basePrice / 100000).toFixed(2)}L</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Variants:</span>
                  <span className="font-medium text-gray-700">{product.variants} options</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Last Modified:</span>
                  <span className="font-medium text-gray-700">{product.lastModified}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleViewProduct(product)}
                  className="flex-1 px-3 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-1 text-xs transition-colors"
                >
                  <Eye className="h-3 w-3" />
                  View
                </button>
                <button
                  onClick={() => handleEditProduct(product)}
                  className="px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-xs transition-colors"
                  aria-label="Edit"
                >
                  <Edit className="h-3 w-3" />
                </button>
                <button
                  onClick={() => handleCopyProduct(product)}
                  className="px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-xs transition-colors"
                  aria-label="Copy"
                >
                  <Copy className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No Results */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Package className="h-12 w-12 text-gray-400 mb-3" />
          <p className="text-gray-600">No products found matching your criteria</p>
          <button
            onClick={() => {
              setSearchQuery('')
              setSelectedCategory('All Categories')
              setAppliedFilters(null)
            }}
            className="mt-4 px-4 py-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Pagination */}
      {filteredProducts.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing <span className="font-medium">{filteredProducts.length}</span> of <span className="font-medium">{products.length}</span> products
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm transition-colors">
              Previous
            </button>
            <button className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm">
              1
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm transition-colors">
              2
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm transition-colors">
              Next
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false)
          setSelectedProduct(null)
        }}
        onSave={handleSaveProduct}
        product={selectedProduct}
      />

      <ViewProductModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false)
          setSelectedProduct(null)
        }}
        product={selectedProduct}
        onEdit={handleEditProduct}
      />

      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={handleApplyFilters}
      />
    </div>
  )
}
