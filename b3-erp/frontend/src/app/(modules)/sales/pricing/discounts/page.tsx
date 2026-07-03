'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Plus, Search, Filter, Percent, Tag, TrendingDown, Calendar, Package, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { salesConfigService } from '@/services/sales-config.service'

interface Discount {
  id: string
  code: string
  name: string
  type: 'percentage' | 'fixed' | 'buyXgetY'
  category: string
  value: number
  minQuantity: number
  minOrderValue: number
  maxDiscount?: number
  applicableProducts: string[]
  validFrom: string
  validTo: string
  status: 'active' | 'scheduled' | 'expired' | 'inactive'
  usageCount: number
  usageLimit?: number
}

export default function DiscountsPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const [discounts, setDiscounts] = useState<Discount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setIsLoading(true)
      setLoadError(null)
      try {
        const rows = await salesConfigService.getDiscounts()
        const mapped: Discount[] = (rows || []).map((r) => ({
          id: r.id,
          code: r.code || '',
          name: r.name,
          type: (r.type as Discount['type']) || 'percentage',
          category: r.category || '',
          value: Number(r.value) || 0,
          minQuantity: Number(r.minQuantity) || 0,
          minOrderValue: Number(r.minOrderValue) || 0,
          maxDiscount: r.maxDiscount != null ? Number(r.maxDiscount) : undefined,
          applicableProducts: r.applicableProducts || [],
          validFrom: r.validFrom || '',
          validTo: r.validTo || '',
          status: (r.status as Discount['status']) || 'active',
          usageCount: Number(r.usageCount) || 0,
          usageLimit: r.usageLimit != null ? Number(r.usageLimit) : undefined,
        }))
        if (!cancelled) setDiscounts(mapped)
      } catch (err) {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : 'Failed to load discounts')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const categories = ['all', 'Kitchen Sinks', 'Kitchen Faucets', 'Cookware', 'Kitchen Appliances', 'Kitchen Storage', 'Kitchen Ventilation', 'Countertops', 'Kitchen Accessories', 'All Kitchen Products']

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'scheduled':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'expired':
        return 'bg-gray-100 text-gray-700 border-gray-200'
      case 'inactive':
        return 'bg-red-100 text-red-700 border-red-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'percentage':
        return <Percent className="h-4 w-4" />
      case 'fixed':
        return <Tag className="h-4 w-4" />
      case 'buyXgetY':
        return <Package className="h-4 w-4" />
      default:
        return <TrendingDown className="h-4 w-4" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'percentage':
        return 'Percentage'
      case 'fixed':
        return 'Fixed Amount'
      case 'buyXgetY':
        return 'Buy X Get Y'
      default:
        return type
    }
  }

  const filteredDiscounts = discounts.filter(discount => {
    const matchesSearch = discount.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         discount.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         discount.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || discount.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const stats = {
    activeDiscounts: discounts.filter(d => d.status === 'active').length,
    totalSavings: discounts.reduce((sum, d) => sum + (d.usageCount * (d.value * 1000)), 0),
    avgDiscountRate: discounts.filter(d => d.type === 'percentage').reduce((sum, d) => sum + d.value, 0) / discounts.filter(d => d.type === 'percentage').length,
    scheduledDiscounts: discounts.filter(d => d.status === 'scheduled').length
  }

  return (
    <div className="w-full h-full px-4 py-2">
      {/* Inline Header */}
      <div className="flex items-center justify-end mb-3">
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Create Discount
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-100">Active Discounts</p>
              <p className="text-3xl font-bold mt-1">{stats.activeDiscounts}</p>
              <p className="text-xs text-green-100 mt-1">Currently running</p>
            </div>
            <TrendingDown className="h-10 w-10 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-100">Total Savings</p>
              <p className="text-3xl font-bold mt-1">₹{(stats.totalSavings / 10000000).toFixed(2)}Cr</p>
              <p className="text-xs text-purple-100 mt-1">Customer savings</p>
            </div>
            <Tag className="h-10 w-10 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-100">Avg Discount Rate</p>
              <p className="text-3xl font-bold mt-1">{stats.avgDiscountRate.toFixed(1)}%</p>
              <p className="text-xs text-blue-100 mt-1">Across all products</p>
            </div>
            <Percent className="h-10 w-10 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-100">Scheduled</p>
              <p className="text-3xl font-bold mt-1">{stats.scheduledDiscounts}</p>
              <p className="text-xs text-orange-100 mt-1">Upcoming discounts</p>
            </div>
            <Calendar className="h-10 w-10 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by discount code, name, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Discounts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {filteredDiscounts.map((discount) => (
          <div key={discount.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      {getTypeIcon(discount.type)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{discount.name}</h3>
                      <p className="text-sm text-gray-600">Code: {discount.code}</p>
                    </div>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(discount.status)}`}>
                  {discount.status.toUpperCase()}
                </span>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600 mb-1">Discount Type</p>
                  <p className="font-semibold text-gray-900">{getTypeLabel(discount.type)}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600 mb-1">Value</p>
                  <p className="font-semibold text-gray-900">
                    {discount.type === 'percentage' ? `${discount.value}%` :
                     discount.type === 'fixed' ? `₹${discount.value.toLocaleString('en-IN')}` :
                     'See Details'}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600 mb-1">Min Quantity</p>
                  <p className="font-semibold text-gray-900">{discount.minQuantity} units</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600 mb-1">Min Order Value</p>
                  <p className="font-semibold text-gray-900">₹{(discount.minOrderValue / 100000).toFixed(1)}L</p>
                </div>
              </div>

              {/* Category */}
              <div className="mb-2">
                <p className="text-xs text-gray-600 mb-2">Category</p>
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
                  <Package className="h-3 w-3" />
                  {discount.category}
                </span>
              </div>

              {/* Validity */}
              <div className="mb-2 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span className="text-gray-700">
                    Valid: {new Date(discount.validFrom).toLocaleDateString('en-IN')} - {new Date(discount.validTo).toLocaleDateString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Usage Stats */}
              <div className="mb-2">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600">Usage</span>
                  <span className="font-medium text-gray-900">
                    {discount.usageCount} / {discount.usageLimit || '∞'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      discount.usageLimit && (discount.usageCount / discount.usageLimit) * 100 > 75
                        ? 'bg-red-500'
                        : discount.usageLimit && (discount.usageCount / discount.usageLimit) * 100 > 50
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    }`}
                    style={{
                      width: discount.usageLimit
                        ? `${Math.min((discount.usageCount / discount.usageLimit) * 100, 100)}%`
                        : '0%'
                    }}
                  />
                </div>
              </div>

              {/* Max Discount */}
              {discount.maxDiscount && (
                <div className="mb-2 p-3 bg-orange-50 rounded-lg">
                  <p className="text-xs text-orange-700 mb-1">Maximum Discount Cap</p>
                  <p className="font-semibold text-orange-900">₹{discount.maxDiscount.toLocaleString('en-IN')}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <button className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                  View Details
                </button>
                <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Edit
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredDiscounts.length === 0 && (
        <div className="text-center py-12">
          <TrendingDown className="h-12 w-12 text-gray-400 mb-2" />
          <p className="text-gray-600">No discounts found matching your criteria</p>
        </div>
      )}
    </div>
  )
}
