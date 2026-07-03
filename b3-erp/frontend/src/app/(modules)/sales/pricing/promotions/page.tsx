'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Plus, Search, Filter, Megaphone, Gift, Sparkles, Calendar, Package, Target, TrendingUp, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { salesConfigService } from '@/services/sales-config.service'

interface Promotion {
  id: string
  name: string
  code: string
  type: 'festival' | 'clearance' | 'combo' | 'seasonal' | 'launch' | 'bundle'
  description: string
  category: string
  applicableProducts: string[]
  discountType: 'percentage' | 'fixed' | 'bundle'
  discountValue: number
  startDate: string
  endDate: string
  status: 'active' | 'scheduled' | 'ended' | 'paused'
  targetAudience: string
  minPurchase: number
  maxDiscount?: number
  claimedCount: number
  targetCount: number
  revenue: number
  bannerImage?: string
}

export default function PromotionsPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('all')

  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setIsLoading(true)
      setLoadError(null)
      try {
        const rows = await salesConfigService.getPromotions()
        const mapped: Promotion[] = (rows || []).map((r) => ({
          id: r.id,
          name: r.name,
          code: r.code || '',
          type: (r.type as Promotion['type']) || 'seasonal',
          description: r.description || '',
          category: r.category || '',
          applicableProducts: r.applicableProducts || [],
          discountType: (r.discountType as Promotion['discountType']) || 'percentage',
          discountValue: Number(r.discountValue) || 0,
          startDate: r.startDate || '',
          endDate: r.endDate || '',
          status: (r.status as Promotion['status']) || 'active',
          targetAudience: r.targetAudience || '',
          minPurchase: Number(r.minPurchase) || 0,
          maxDiscount: r.maxDiscount != null ? Number(r.maxDiscount) : undefined,
          claimedCount: Number(r.claimedCount) || 0,
          targetCount: Number(r.targetCount) || 0,
          revenue: Number(r.revenue) || 0,
          bannerImage: r.bannerImage,
        }))
        if (!cancelled) setPromotions(mapped)
      } catch (err) {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : 'Failed to load promotions')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const promotionTypes = ['all', 'festival', 'clearance', 'combo', 'seasonal', 'launch']

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'scheduled':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'ended':
        return 'bg-gray-100 text-gray-700 border-gray-200'
      case 'paused':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'festival':
        return 'bg-pink-100 text-pink-700 border-pink-200'
      case 'clearance':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'combo':
        return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'seasonal':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'launch':
        return 'bg-green-100 text-green-700 border-green-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'festival':
        return <Sparkles className="h-4 w-4" />
      case 'clearance':
        return <TrendingUp className="h-4 w-4" />
      case 'combo':
        return <Package className="h-4 w-4" />
      case 'seasonal':
        return <Calendar className="h-4 w-4" />
      case 'launch':
        return <Gift className="h-4 w-4" />
      default:
        return <Megaphone className="h-4 w-4" />
    }
  }

  const filteredPromotions = promotions.filter(promo => {
    const matchesSearch = promo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         promo.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         promo.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === 'all' || promo.type === selectedType
    return matchesSearch && matchesType
  })

  const stats = {
    activePromotions: promotions.filter(p => p.status === 'active').length,
    totalRevenue: promotions.reduce((sum, p) => sum + p.revenue, 0),
    totalClaims: promotions.reduce((sum, p) => sum + p.claimedCount, 0),
    scheduledPromotions: promotions.filter(p => p.status === 'scheduled').length
  }

  return (
    <div className="w-full h-full px-4 py-2">
      {/* Inline Header */}
      <div className="flex items-center justify-end mb-3">
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Create Promotion
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-100">Active Promotions</p>
              <p className="text-3xl font-bold mt-1">{stats.activePromotions}</p>
              <p className="text-xs text-green-100 mt-1">Currently running</p>
            </div>
            <Megaphone className="h-10 w-10 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-100">Total Revenue</p>
              <p className="text-3xl font-bold mt-1">₹{(stats.totalRevenue / 10000000).toFixed(2)}Cr</p>
              <p className="text-xs text-purple-100 mt-1">From promotions</p>
            </div>
            <TrendingUp className="h-10 w-10 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-100">Total Claims</p>
              <p className="text-3xl font-bold mt-1">{stats.totalClaims}</p>
              <p className="text-xs text-blue-100 mt-1">Customers reached</p>
            </div>
            <Users className="h-10 w-10 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-100">Scheduled</p>
              <p className="text-3xl font-bold mt-1">{stats.scheduledPromotions}</p>
              <p className="text-xs text-orange-100 mt-1">Upcoming campaigns</p>
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
              placeholder="Search by promotion name, code, or description..."
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
              {promotionTypes.map(type => (
                <option key={type} value={type}>
                  {type === 'all' ? 'All Promotion Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Promotions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {filteredPromotions.map((promo) => (
          <div key={promo.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden">
            {/* Promotional Banner */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 text-white">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-lg">
                    {getTypeIcon(promo.type)}
                  </div>
                  <div>
                    <h3 className="font-bold text-xl">{promo.name}</h3>
                    <p className="text-sm text-blue-100 mt-1">Code: {promo.code}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(promo.status)}`}>
                  {promo.status.toUpperCase()}
                </span>
              </div>
              <p className="text-sm text-white/90">{promo.description}</p>
            </div>

            <div className="p-6">
              {/* Type and Category */}
              <div className="flex gap-2 mb-2">
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getTypeColor(promo.type)}`}>
                  {promo.type.toUpperCase()}
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm border border-gray-200">
                  <Package className="h-3 w-3" />
                  {promo.category}
                </span>
              </div>

              {/* Discount Info */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 mb-2 border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-700 font-medium">Discount Offer</p>
                    <p className="text-2xl font-bold text-green-900 mt-1">
                      {promo.discountType === 'percentage' ? `${promo.discountValue}% OFF` :
                       promo.discountType === 'fixed' ? `₹${promo.discountValue} OFF` :
                       'Bundle Offer'}
                    </p>
                  </div>
                  <Gift className="h-10 w-10 text-green-600" />
                </div>
                {promo.maxDiscount && (
                  <p className="text-xs text-green-700 mt-2">Max discount: ₹{promo.maxDiscount.toLocaleString('en-IN')}</p>
                )}
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600 mb-1">Min Purchase</p>
                  <p className="font-semibold text-gray-900">₹{(promo.minPurchase / 1000).toFixed(0)}K</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600 mb-1">Target Audience</p>
                  <p className="font-semibold text-gray-900 text-sm">{promo.targetAudience}</p>
                </div>
              </div>

              {/* Validity Period */}
              <div className="mb-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 text-sm mb-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-900">Campaign Period</span>
                </div>
                <p className="text-sm text-gray-700">
                  {new Date(promo.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} - {new Date(promo.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>

              {/* Performance Metrics */}
              <div className="mb-2">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Campaign Progress
                  </span>
                  <span className="font-medium text-gray-900">
                    {promo.claimedCount} / {promo.targetCount}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                  <div
                    className={`h-2.5 rounded-full ${
                      (promo.claimedCount / promo.targetCount) * 100 >= 100
                        ? 'bg-green-500'
                        : (promo.claimedCount / promo.targetCount) * 100 >= 75
                        ? 'bg-blue-500'
                        : 'bg-yellow-500'
                    }`}
                    style={{
                      width: `${Math.min((promo.claimedCount / promo.targetCount) * 100, 100)}%`
                    }}
                  />
                </div>
                <p className="text-xs text-gray-600">
                  {((promo.claimedCount / promo.targetCount) * 100).toFixed(1)}% of target achieved
                </p>
              </div>

              {/* Revenue */}
              {promo.revenue > 0 && (
                <div className="bg-purple-50 rounded-lg p-3 mb-2 border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-purple-700 mb-1">Revenue Generated</p>
                      <p className="font-semibold text-purple-900">₹{(promo.revenue / 100000).toFixed(2)}L</p>
                    </div>
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <button className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                  View Analytics
                </button>
                <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Edit Campaign
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPromotions.length === 0 && (
        <div className="text-center py-12">
          <Megaphone className="h-12 w-12 text-gray-400 mb-2" />
          <p className="text-gray-600">No promotions found matching your criteria</p>
        </div>
      )}
    </div>
  )
}
