'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FinanceService } from '@/services/finance.service'
import {
  Package,
  TrendingDown,
  TrendingUp,
  Building2,
  Truck,
  Laptop,
  Wrench,
  AlertCircle,
  Calendar,
  DollarSign,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  RefreshCw,
  Download,
  Plus
} from 'lucide-react'

interface AssetSummary {
  totalAssets: number
  totalCost: number
  totalDepreciation: number
  netBookValue: number
  activeAssets: number
  disposedAssets: number
  underMaintenance: number
  monthlyDepreciation: number
}

interface AssetByCategory {
  category: string
  count: number
  cost: number
  nbv: number
  depreciation: number
  icon: any
  color: string
}

interface RecentActivity {
  id: string
  type: 'acquisition' | 'disposal' | 'maintenance' | 'depreciation'
  assetName: string
  date: string
  amount: number
  status: string
}

// Backend byCategory items carry no visual metadata; map category name -> icon/color.
const CATEGORY_META: Record<string, { icon: any; color: string }> = {
  'Land & Building': { icon: Building2, color: 'blue' },
  'Plant & Machinery': { icon: Package, color: 'purple' },
  'Vehicles': { icon: Truck, color: 'orange' },
  'Computers & IT': { icon: Laptop, color: 'green' },
  'Furniture & Fixtures': { icon: Package, color: 'gray' },
}
const DEFAULT_CATEGORY_META = { icon: Package, color: 'gray' }

const EMPTY_SUMMARY: AssetSummary = {
  totalAssets: 0,
  totalCost: 0,
  totalDepreciation: 0,
  netBookValue: 0,
  activeAssets: 0,
  disposedAssets: 0,
  underMaintenance: 0,
  monthlyDepreciation: 0,
}

export default function AssetsManagementPage() {
  const [summary, setSummary] = useState<AssetSummary>(EMPTY_SUMMARY)
  const [assetsByCategory, setAssetsByCategory] = useState<AssetByCategory[]>([])
  // No backend endpoint exists for recent activity; kept empty rather than mocked.
  const [recentActivities] = useState<RecentActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setIsLoading(true)
      setLoadError(null)
      try {
        const data = (await FinanceService.getFixedAssetsSummary()) as any
        const s = data?.summary ?? {}
        const mappedSummary: AssetSummary = {
          totalAssets: Number(s.totalAssets ?? 0),
          totalCost: Number(s.totalCost ?? 0),
          totalDepreciation: Number(s.totalDepreciation ?? 0),
          netBookValue: Number(s.totalNetBookValue ?? 0),
          activeAssets: Number(s.activeAssets ?? 0),
          disposedAssets: 0,
          underMaintenance: 0,
          monthlyDepreciation: 0,
        }
        const mappedCategories: AssetByCategory[] = (data?.byCategory ?? []).map((c: any) => {
          const meta = CATEGORY_META[c.category] ?? DEFAULT_CATEGORY_META
          return {
            category: c.category,
            count: Number(c.count ?? 0),
            cost: Number(c.cost ?? 0),
            nbv: Number(c.nbv ?? 0),
            depreciation: Number(c.depreciation ?? 0),
            icon: meta.icon,
            color: meta.color,
          }
        })
        if (!cancelled) {
          setSummary(mappedSummary)
          setAssetsByCategory(mappedCategories)
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load fixed assets summary')
          setSummary(EMPTY_SUMMARY)
          setAssetsByCategory([])
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'acquisition':
        return <Plus className="h-4 w-4 text-green-600" />
      case 'disposal':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'maintenance':
        return <Wrench className="h-4 w-4 text-orange-600" />
      case 'depreciation':
        return <TrendingDown className="h-4 w-4 text-blue-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'acquisition':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'disposal':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'maintenance':
        return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'depreciation':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'pending':
        return 'bg-gray-100 text-gray-700 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="w-full p-3">
          <div className="w-full space-y-3">
            {isLoading && (
              <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
                Loading fixed assets summary…
              </div>
            )}
            {loadError && !isLoading && (
              <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertCircle className="h-4 w-4" />
                {loadError}
              </div>
            )}
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <Package className="h-8 w-8 text-blue-600" />
                  Fixed Assets Management
                </h1>
                <p className="text-gray-600 mt-1">Track and manage all company fixed assets, depreciation, and disposals</p>
              </div>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all">
                  <RefreshCw className="h-5 w-5" />
                  Calculate Depreciation
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md">
                  <Plus className="h-5 w-5" />
                  Add Asset
                </button>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-5 border border-blue-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Total Assets</p>
                    <p className="text-2xl font-bold text-blue-900 mt-1">{summary.totalAssets}</p>
                    <p className="text-xs text-blue-700 mt-1">{summary.activeAssets} active</p>
                  </div>
                  <Package className="h-10 w-10 text-blue-600" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-5 border border-green-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Gross Book Value</p>
                    <p className="text-2xl font-bold text-green-900 mt-1">{formatCurrency(summary.totalCost)}</p>
                    <p className="text-xs text-green-700 mt-1">Original cost</p>
                  </div>
                  <DollarSign className="h-10 w-10 text-green-600" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-5 border border-purple-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">Net Book Value</p>
                    <p className="text-2xl font-bold text-purple-900 mt-1">{formatCurrency(summary.netBookValue)}</p>
                    <p className="text-xs text-purple-700 mt-1">After depreciation</p>
                  </div>
                  <BarChart3 className="h-10 w-10 text-purple-600" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-5 border border-orange-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-600">Monthly Depreciation</p>
                    <p className="text-2xl font-bold text-orange-900 mt-1">{formatCurrency(summary.monthlyDepreciation)}</p>
                    <p className="text-xs text-orange-700 mt-1">Current rate</p>
                  </div>
                  <TrendingDown className="h-10 w-10 text-orange-600" />
                </div>
              </div>
            </div>

            {/* Quick Access Navigation */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Access</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <Link
                  href="/finance/assets/fixed-assets"
                  className="group flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <Package className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600">Fixed Assets Register</h4>
                    <p className="text-xs text-gray-500">View all assets & details</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </Link>

                <Link
                  href="/finance/assets/depreciation"
                  className="group flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-orange-500 hover:bg-orange-50 transition-all duration-200"
                >
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                    <TrendingDown className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-900 group-hover:text-orange-600">Depreciation</h4>
                    <p className="text-xs text-gray-500">Calculate & manage depreciation</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-orange-600 group-hover:translate-x-1 transition-all" />
                </Link>

                <Link
                  href="/finance/assets/asset-disposal"
                  className="group flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-red-500 hover:bg-red-50 transition-all duration-200"
                >
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition-colors">
                    <XCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-900 group-hover:text-red-600">Asset Disposal</h4>
                    <p className="text-xs text-gray-500">Dispose, sell or retire assets</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-red-600 group-hover:translate-x-1 transition-all" />
                </Link>
              </div>
            </div>

            {/* Assets by Category */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Assets by Category</h2>
              </div>
              <div className="p-6">
                <div className="space-y-2">
                  {assetsByCategory.map((category) => {
                    const Icon = category.icon
                    return (
                      <div key={category.category} className="p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 bg-${category.color}-100 rounded-lg flex items-center justify-center`}>
                              <Icon className={`h-5 w-5 text-${category.color}-600`} />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{category.category}</h3>
                              <p className="text-sm text-gray-600">{category.count} assets</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">{formatCurrency(category.nbv)}</p>
                            <p className="text-xs text-gray-600">Net Book Value</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div>
                            <p className="text-gray-600 text-xs">Original Cost</p>
                            <p className="font-medium text-gray-900">{formatCurrency(category.cost)}</p>
                          </div>
                          <div>
                            <p className="text-gray-600 text-xs">Depreciation</p>
                            <p className="font-medium text-orange-600">{formatCurrency(Math.abs(category.depreciation))}</p>
                          </div>
                          <div>
                            <p className="text-gray-600 text-xs">Depreciation %</p>
                            <p className="font-medium text-gray-900">
                              {((Math.abs(category.depreciation) / category.cost) * 100).toFixed(1)}%
                            </p>
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div className="mt-3">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`bg-${category.color}-600 h-2 rounded-full`}
                              style={{ width: `${((category.nbv / category.cost) * 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Recent Activities */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Activities</h2>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1">
                    View All
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="divide-y divide-gray-200">
                {recentActivities.length === 0 && (
                  <div className="p-6 text-center text-sm text-gray-500">
                    No recent activity
                  </div>
                )}
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`p-2 rounded-lg ${getActivityColor(activity.type).replace('text-', 'bg-').replace('-700', '-100')}`}>
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{activity.assetName}</h3>
                          <div className="flex items-center gap-3 mt-1">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getActivityColor(activity.type)}`}>
                              {activity.type.replace('-', ' ').toUpperCase()}
                            </span>
                            <span className="text-xs text-gray-600 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(activity.date).toLocaleDateString('en-IN', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className="font-semibold text-gray-900">{formatCurrency(activity.amount)}</p>
                        <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(activity.status)}`}>
                          {activity.status.replace('-', ' ').toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-600">Assets Under Maintenance</h3>
                  <Wrench className="h-5 w-5 text-gray-400" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{summary.underMaintenance}</p>
                <p className="text-xs text-orange-600 mt-1">Requires attention</p>
              </div>

              <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-600">Disposed This Year</h3>
                  <XCircle className="h-5 w-5 text-gray-400" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{summary.disposedAssets}</p>
                <p className="text-xs text-gray-600 mt-1">Since Jan 2025</p>
              </div>

              <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-600">Total Depreciation</h3>
                  <TrendingDown className="h-5 w-5 text-gray-400" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.totalDepreciation)}</p>
                <p className="text-xs text-gray-600 mt-1">Accumulated</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
