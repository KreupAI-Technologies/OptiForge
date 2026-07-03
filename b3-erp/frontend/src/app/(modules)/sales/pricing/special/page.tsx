'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Plus, Search, Filter, Star, Building2, TrendingDown, Package, Calendar, Award } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { salesConfigService } from '@/services/sales-config.service'

interface SpecialPrice {
  id: string
  customerName: string
  customerType: 'contractor' | 'dealer' | 'builder' | 'vip' | 'institutional'
  productCode: string
  productName: string
  category: string
  standardPrice: number
  specialPrice: number
  discountPercent: number
  minOrderQty: number
  validFrom: string
  validTo: string
  status: 'active' | 'pending_approval' | 'expired' | 'revoked'
  approvedBy?: string
  contractRef?: string
  orderCount: number
  totalRevenue: number
}

export default function SpecialPricingPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('all')

  const [specialPrices, setSpecialPrices] = useState<SpecialPrice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setIsLoading(true)
      setLoadError(null)
      try {
        const rows = await salesConfigService.getSpecialPrices()
        const mapped: SpecialPrice[] = (rows || []).map((r) => ({
          id: r.id,
          customerName: r.customerName,
          customerType: (r.customerType as SpecialPrice['customerType']) || 'dealer',
          productCode: r.productCode || '',
          productName: r.productName || '',
          category: r.category || '',
          standardPrice: Number(r.standardPrice) || 0,
          specialPrice: Number(r.specialPrice) || 0,
          discountPercent: Number(r.discountPercent) || 0,
          minOrderQty: Number(r.minOrderQty) || 0,
          validFrom: r.validFrom || '',
          validTo: r.validTo || '',
          status: (r.status as SpecialPrice['status']) || 'active',
          approvedBy: r.approvedBy,
          contractRef: r.contractRef,
          orderCount: Number(r.orderCount) || 0,
          totalRevenue: Number(r.totalRevenue) || 0,
        }))
        if (!cancelled) setSpecialPrices(mapped)
      } catch (err) {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : 'Failed to load special prices')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const customerTypes = ['all', 'contractor', 'dealer', 'builder', 'vip', 'institutional']

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'pending_approval':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'expired':
        return 'bg-gray-100 text-gray-700 border-gray-200'
      case 'revoked':
        return 'bg-red-100 text-red-700 border-red-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getCustomerTypeColor = (type: string) => {
    switch (type) {
      case 'contractor':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'dealer':
        return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'builder':
        return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'vip':
        return 'bg-pink-100 text-pink-700 border-pink-200'
      case 'institutional':
        return 'bg-indigo-100 text-indigo-700 border-indigo-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getCustomerTypeIcon = (type: string) => {
    switch (type) {
      case 'vip':
        return <Star className="h-4 w-4" />
      case 'institutional':
        return <Building2 className="h-4 w-4" />
      default:
        return <Award className="h-4 w-4" />
    }
  }

  const filteredPrices = specialPrices.filter(price => {
    const matchesSearch = price.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         price.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         price.productCode.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === 'all' || price.customerType === selectedType
    return matchesSearch && matchesType
  })

  const stats = {
    activeContracts: specialPrices.filter(p => p.status === 'active').length,
    totalRevenue: specialPrices.reduce((sum, p) => sum + p.totalRevenue, 0),
    avgDiscount: specialPrices.reduce((sum, p) => sum + p.discountPercent, 0) / specialPrices.length,
    pendingApprovals: specialPrices.filter(p => p.status === 'pending_approval').length
  }

  return (
    <div className="w-full h-full px-4 py-2">
      {/* Inline Header */}
      <div className="flex items-center justify-end mb-3">
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Create Special Price
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-100">Active Contracts</p>
              <p className="text-3xl font-bold mt-1">{stats.activeContracts}</p>
              <p className="text-xs text-green-100 mt-1">Special pricing active</p>
            </div>
            <Award className="h-10 w-10 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-100">Total Revenue</p>
              <p className="text-3xl font-bold mt-1">₹{(stats.totalRevenue / 10000000).toFixed(2)}Cr</p>
              <p className="text-xs text-purple-100 mt-1">From special pricing</p>
            </div>
            <TrendingDown className="h-10 w-10 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-100">Avg Discount</p>
              <p className="text-3xl font-bold mt-1">{stats.avgDiscount.toFixed(1)}%</p>
              <p className="text-xs text-blue-100 mt-1">Across contracts</p>
            </div>
            <Star className="h-10 w-10 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-100">Pending Approvals</p>
              <p className="text-3xl font-bold mt-1">{stats.pendingApprovals}</p>
              <p className="text-xs text-yellow-100 mt-1">Awaiting review</p>
            </div>
            <Calendar className="h-10 w-10 text-yellow-200" />
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
              placeholder="Search by customer, product code, or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              {customerTypes.map(type => (
                <option key={type} value={type}>
                  {type === 'all' ? 'All Customer Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Special Prices Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {filteredPrices.map((price) => (
          <div key={price.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`p-2 rounded-lg border ${getCustomerTypeColor(price.customerType)}`}>
                      {getCustomerTypeIcon(price.customerType)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{price.customerName}</h3>
                      <p className="text-sm text-gray-600">Contract: {price.contractRef}</p>
                    </div>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(price.status)}`}>
                  {price.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>

              {/* Customer Type Badge */}
              <div className="mb-2">
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getCustomerTypeColor(price.customerType)}`}>
                  {price.customerType.toUpperCase()}
                </span>
              </div>

              {/* Product Info */}
              <div className="bg-gray-50 rounded-lg p-3 mb-2">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="h-4 w-4 text-gray-600" />
                  <p className="font-semibold text-gray-900">{price.productName}</p>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Code: {price.productCode}</span>
                  <span className="text-gray-600">{price.category}</span>
                </div>
              </div>

              {/* Pricing Details */}
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div className="bg-red-50 rounded-lg p-3">
                  <p className="text-xs text-red-600 mb-1">Standard Price</p>
                  <p className="font-semibold text-red-900">₹{price.standardPrice.toLocaleString('en-IN')}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-xs text-green-600 mb-1">Special Price</p>
                  <p className="font-semibold text-green-900">₹{price.specialPrice.toLocaleString('en-IN')}</p>
                </div>
              </div>

              {/* Discount Badge */}
              <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg p-3 mb-2 text-center">
                <p className="text-2xl font-bold">{price.discountPercent}% OFF</p>
                <p className="text-xs mt-1">Savings: ₹{(price.standardPrice - price.specialPrice).toLocaleString('en-IN')} per unit</p>
              </div>

              {/* Order Details */}
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600 mb-1">Min Order Qty</p>
                  <p className="font-semibold text-gray-900">{price.minOrderQty} units</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600 mb-1">Total Orders</p>
                  <p className="font-semibold text-gray-900">{price.orderCount}</p>
                </div>
              </div>

              {/* Revenue */}
              {price.totalRevenue > 0 && (
                <div className="bg-blue-50 rounded-lg p-3 mb-2">
                  <p className="text-xs text-blue-600 mb-1">Total Revenue Generated</p>
                  <p className="font-semibold text-blue-900">₹{(price.totalRevenue / 100000).toFixed(2)}L</p>
                </div>
              )}

              {/* Validity */}
              <div className="mb-2 p-3 bg-indigo-50 rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-indigo-600" />
                  <span className="text-gray-700">
                    Valid: {new Date(price.validFrom).toLocaleDateString('en-IN')} - {new Date(price.validTo).toLocaleDateString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Approved By */}
              {price.approvedBy && (
                <div className="mb-2 text-sm">
                  <p className="text-gray-600">Approved by: <span className="font-medium text-gray-900">{price.approvedBy}</span></p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <button className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                  View Contract
                </button>
                <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Edit
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPrices.length === 0 && (
        <div className="text-center py-12">
          <Award className="h-12 w-12 text-gray-400 mb-2" />
          <p className="text-gray-600">No special pricing found matching your criteria</p>
        </div>
      )}
    </div>
  )
}
