'use client'

import { useEffect, useState } from 'react'
import { ArrowLeft, Package, TrendingUp, TrendingDown, DollarSign, ShoppingCart, Star, AlertCircle, BarChart3 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { salesConfigService } from '@/services/sales-config.service'

interface ProductAnalytics {
  code: string
  name: string
  category: string
  unitsSold: number
  revenue: number
  avgPrice: number
  stockLevel: number
  reorderPoint: number
  margin: number
  rating: number
  reviews: number
  returns: number
  returnRate: number
  trend: number
  topRegion: string
  topCustomerType: string
}

export default function ProductsAnalyticsPage() {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('revenue')
  const [products, setProducts] = useState<ProductAnalytics[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setIsLoading(true)
      setLoadError(null)
      try {
        const rows = await salesConfigService.getProductAnalytics()
        if (cancelled) return
        const mapped: ProductAnalytics[] = (Array.isArray(rows) ? rows : []).map((r) => ({
          code: r.code ?? '',
          name: r.name ?? '',
          category: r.category ?? 'General',
          unitsSold: Number(r.unitsSold) || 0,
          revenue: Number(r.revenue) || 0,
          avgPrice: Number(r.avgPrice) || 0,
          stockLevel: Number(r.stockLevel) || 0,
          reorderPoint: Number(r.reorderPoint) || 0,
          margin: Number(r.margin) || 0,
          rating: Number(r.rating) || 0,
          reviews: Number(r.reviews) || 0,
          returns: Number(r.returns) || 0,
          returnRate: Number(r.returnRate) || 0,
          trend: Number(r.trend) || 0,
          topRegion: r.topRegion ?? '',
          topCustomerType: r.topCustomerType ?? '',
        }))
        setProducts(mapped)
      } catch (e) {
        if (!cancelled) setLoadError(e instanceof Error ? e.message : 'Failed to load product analytics')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const categories = ['all', 'Kitchen Sinks', 'Kitchen Faucets', 'Cookware', 'Kitchen Appliances', 'Kitchen Storage', 'Kitchen Ventilation', 'Countertops', 'Kitchen Accessories']

  const sortOptions = [
    { value: 'revenue', label: 'Revenue (High to Low)' },
    { value: 'units', label: 'Units Sold (High to Low)' },
    { value: 'margin', label: 'Margin (High to Low)' },
    { value: 'rating', label: 'Rating (High to Low)' },
    { value: 'trend', label: 'Growth (High to Low)' }
  ]

  const filteredProducts = products
    .filter(product => selectedCategory === 'all' || product.category === selectedCategory)
    .sort((a, b) => {
      switch (sortBy) {
        case 'revenue':
          return b.revenue - a.revenue
        case 'units':
          return b.unitsSold - a.unitsSold
        case 'margin':
          return b.margin - a.margin
        case 'rating':
          return b.rating - a.rating
        case 'trend':
          return b.trend - a.trend
        default:
          return 0
      }
    })

  const stats = {
    totalProducts: filteredProducts.length,
    totalRevenue: filteredProducts.reduce((sum, p) => sum + p.revenue, 0),
    avgMargin: filteredProducts.length ? filteredProducts.reduce((sum, p) => sum + p.margin, 0) / filteredProducts.length : 0,
    avgRating: filteredProducts.length ? filteredProducts.reduce((sum, p) => sum + p.rating, 0) / filteredProducts.length : 0,
    lowStockItems: filteredProducts.filter(p => p.stockLevel < p.reorderPoint).length
  }

  if (isLoading) {
    return (
      <div className="w-full h-full px-4 py-6 flex items-center justify-center text-gray-500">
        Loading product analytics...
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="w-full h-full px-4 py-6 flex items-center justify-center text-red-600">
        {loadError}
      </div>
    )
  }

  return (
    <div className="w-full h-full px-4 py-2">
      {/* Inline Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Product Analytics</h1>
            <p className="text-sm text-gray-600 mt-1">Detailed performance metrics for kitchen products</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-100">Total Products</p>
              <p className="text-3xl font-bold mt-1">{stats.totalProducts}</p>
              <p className="text-xs text-blue-100 mt-1">Active SKUs</p>
            </div>
            <Package className="h-10 w-10 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-100">Total Revenue</p>
              <p className="text-3xl font-bold mt-1">₹{(stats.totalRevenue / 10000000).toFixed(2)}Cr</p>
              <p className="text-xs text-green-100 mt-1">From selected</p>
            </div>
            <DollarSign className="h-10 w-10 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-100">Avg Margin</p>
              <p className="text-3xl font-bold mt-1">{stats.avgMargin.toFixed(1)}%</p>
              <p className="text-xs text-purple-100 mt-1">Profit margin</p>
            </div>
            <BarChart3 className="h-10 w-10 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-100">Avg Rating</p>
              <p className="text-3xl font-bold mt-1">{stats.avgRating.toFixed(1)}</p>
              <p className="text-xs text-yellow-100 mt-1">Out of 5.0</p>
            </div>
            <Star className="h-10 w-10 text-yellow-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-100">Low Stock</p>
              <p className="text-3xl font-bold mt-1">{stats.lowStockItems}</p>
              <p className="text-xs text-red-100 mt-1">Need reorder</p>
            </div>
            <AlertCircle className="h-10 w-10 text-red-200" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Product</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Category</th>
                <th className="text-right py-4 px-4 text-sm font-semibold text-gray-700">Units Sold</th>
                <th className="text-right py-4 px-4 text-sm font-semibold text-gray-700">Revenue</th>
                <th className="text-right py-4 px-4 text-sm font-semibold text-gray-700">Avg Price</th>
                <th className="text-right py-4 px-4 text-sm font-semibold text-gray-700">Margin</th>
                <th className="text-center py-4 px-4 text-sm font-semibold text-gray-700">Rating</th>
                <th className="text-right py-4 px-4 text-sm font-semibold text-gray-700">Returns</th>
                <th className="text-center py-4 px-4 text-sm font-semibold text-gray-700">Trend</th>
                <th className="text-center py-4 px-4 text-sm font-semibold text-gray-700">Stock</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.code} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-600 font-mono">{product.code}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-gray-700">{product.category}</span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className="font-medium text-gray-900">{product.unitsSold.toLocaleString('en-IN')}</span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className="font-semibold text-green-600">₹{(product.revenue / 100000).toFixed(2)}L</span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className="text-gray-700">₹{product.avgPrice.toLocaleString('en-IN')}</span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className={`font-semibold ${product.margin >= 40 ? 'text-green-600' : product.margin >= 30 ? 'text-blue-600' : 'text-orange-600'}`}>
                      {product.margin}%
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-medium text-gray-900">{product.rating}</span>
                      <span className="text-xs text-gray-600">({product.reviews})</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div>
                      <span className="text-gray-700">{product.returns}</span>
                      <span className={`block text-xs ${product.returnRate > 2 ? 'text-red-600' : 'text-gray-600'}`}>
                        {product.returnRate}%
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-center gap-1">
                      {product.trend >= 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      )}
                      <span className={`font-semibold ${product.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {Math.abs(product.trend)}%
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-center">
                      <span className={`font-medium ${product.stockLevel < product.reorderPoint ? 'text-red-600' : 'text-gray-900'}`}>
                        {product.stockLevel}
                      </span>
                      {product.stockLevel < product.reorderPoint && (
                        <div className="flex items-center justify-center gap-1 mt-1">
                          <AlertCircle className="h-3 w-3 text-red-600" />
                          <span className="text-xs text-red-600">Low</span>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mb-2" />
          <p className="text-gray-600">No products found matching your criteria</p>
        </div>
      )}
    </div>
  )
}
