'use client'

import { useState, useEffect } from 'react'
import {
  Trash2,
  Package,
  DollarSign,
  TrendingDown,
  CheckCircle,
  AlertTriangle,
  Calendar,
  FileText,
  Download,
  Search,
  Filter,
  Plus,
  Eye,
  Edit
} from 'lucide-react'
import { FinanceService } from '@/services/finance.service'

interface AssetDisposal {
  id: string
  disposalNumber: string
  assetCode: string
  assetName: string
  assetCategory: string
  disposalDate: string
  disposalMethod: 'sale' | 'scrap' | 'donation' | 'write_off' | 'trade_in'
  originalCost: number
  accumulatedDepreciation: number
  bookValue: number
  saleProceeds: number
  disposalCost: number
  gainLoss: number
  status: 'pending' | 'approved' | 'completed' | 'cancelled'
  approvedBy?: string
  approvalDate?: string
  buyer?: string
  reason: string
  location: string
}

export default function AssetDisposalPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [methodFilter, setMethodFilter] = useState('all')

  const [disposals, setDisposals] = useState<AssetDisposal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setIsLoading(true)
      setLoadError(null)
      try {
        const raw = (await FinanceService.getFixedAssets()) as any[]
        if (cancelled) return
        const validMethods = ['sale', 'scrap', 'donation', 'write_off', 'trade_in']
        const validStatuses = ['pending', 'approved', 'completed', 'cancelled']
        const mapped: AssetDisposal[] = (raw || []).map((a: any, i: number) => {
          const originalCost = Number(a.originalCost ?? a.acquisitionCost ?? a.purchaseCost ?? a.cost ?? 0)
          const accumulatedDepreciation = Number(a.accumulatedDepreciation ?? a.totalDepreciation ?? 0)
          const bookValue = Number(a.bookValue ?? a.netBookValue ?? a.currentValue ?? (originalCost - accumulatedDepreciation))
          const saleProceeds = Number(a.saleProceeds ?? a.disposalProceeds ?? a.salvageValue ?? 0)
          const disposalCost = Number(a.disposalCost ?? 0)
          const rawMethod = String(a.disposalMethod ?? 'sale').toLowerCase()
          const disposalMethod = (validMethods.includes(rawMethod) ? rawMethod : 'sale') as AssetDisposal['disposalMethod']
          const rawStatus = String(a.disposalStatus ?? a.status ?? 'pending').toLowerCase()
          const status = (validStatuses.includes(rawStatus) ? rawStatus : 'pending') as AssetDisposal['status']
          const gainLoss = Number(a.gainLoss ?? (saleProceeds - disposalCost - bookValue))
          return {
            id: String(a.id ?? a.assetId ?? `DISP-${i}`),
            disposalNumber: String(a.disposalNumber ?? a.assetCode ?? a.code ?? a.id ?? `AD-${i}`),
            assetCode: String(a.assetCode ?? a.code ?? '-'),
            assetName: String(a.assetName ?? a.name ?? 'Asset'),
            assetCategory: String(a.assetCategory ?? a.category ?? '-'),
            disposalDate: String(a.disposalDate ?? a.updatedAt ?? a.createdAt ?? ''),
            disposalMethod,
            originalCost,
            accumulatedDepreciation,
            bookValue,
            saleProceeds,
            disposalCost,
            gainLoss,
            status,
            approvedBy: a.approvedBy ?? undefined,
            approvalDate: a.approvalDate ?? undefined,
            buyer: a.buyer ?? undefined,
            reason: String(a.reason ?? a.disposalReason ?? '-'),
            location: String(a.location ?? '-'),
          }
        })
        setDisposals(mapped)
      } catch (e) {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : 'Failed to load')
          setDisposals([])
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const filteredDisposals = disposals.filter(disposal => {
    const matchesSearch =
      disposal.assetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      disposal.disposalNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      disposal.assetCode.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || disposal.status === statusFilter
    const matchesMethod = methodFilter === 'all' || disposal.disposalMethod === methodFilter
    return matchesSearch && matchesStatus && matchesMethod
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Math.abs(amount))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'approved':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getMethodBadge = (method: string) => {
    const colors = {
      sale: 'bg-green-100 text-green-700',
      scrap: 'bg-orange-100 text-orange-700',
      donation: 'bg-purple-100 text-purple-700',
      write_off: 'bg-red-100 text-red-700',
      trade_in: 'bg-blue-100 text-blue-700'
    }
    return colors[method as keyof typeof colors] || 'bg-gray-100 text-gray-700'
  }

  // Calculate totals
  const totalOriginalCost = disposals.filter(d => d.status === 'completed').reduce((sum, d) => sum + d.originalCost, 0)
  const totalSaleProceeds = disposals.filter(d => d.status === 'completed').reduce((sum, d) => sum + d.saleProceeds, 0)
  const totalGainLoss = disposals.filter(d => d.status === 'completed').reduce((sum, d) => sum + d.gainLoss, 0)
  const pendingApprovals = disposals.filter(d => d.status === 'pending').length

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-gray-50 via-orange-50 to-red-50">
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="w-full p-3">
          <div className="w-full space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Asset Disposal Management</h1>
                <p className="text-gray-600 mt-1">Track and manage disposal of fixed assets</p>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-700 hover:to-red-700 transition-all shadow-md">
                <Plus className="h-5 w-5" />
                Initiate Disposal
              </button>
            </div>

            {isLoading && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
                Loading asset disposals…
              </div>
            )}
            {loadError && !isLoading && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                {loadError}
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-5 border border-blue-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Total Disposals (YTD)</p>
                    <p className="text-2xl font-bold text-blue-900 mt-1">{disposals.length}</p>
                    <p className="text-xs text-blue-700 mt-1">{disposals.filter(d => d.status === 'completed').length} completed</p>
                  </div>
                  <Trash2 className="h-10 w-10 text-blue-600" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-5 border border-green-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Sale Proceeds</p>
                    <p className="text-2xl font-bold text-green-900 mt-1">{formatCurrency(totalSaleProceeds)}</p>
                    <p className="text-xs text-green-700 mt-1">Total realized</p>
                  </div>
                  <DollarSign className="h-10 w-10 text-green-600" />
                </div>
              </div>

              <div className={`bg-gradient-to-br rounded-lg p-5 border shadow-sm ${totalGainLoss >= 0 ? 'from-purple-50 to-purple-100 border-purple-200' : 'from-orange-50 to-orange-100 border-orange-200'
                }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${totalGainLoss >= 0 ? 'text-purple-600' : 'text-orange-600'}`}>Net Gain/(Loss)</p>
                    <p className={`text-2xl font-bold mt-1 ${totalGainLoss >= 0 ? 'text-purple-900' : 'text-orange-900'}`}>
                      {totalGainLoss >= 0 ? '+' : ''}{formatCurrency(totalGainLoss)}
                    </p>
                    <p className={`text-xs mt-1 ${totalGainLoss >= 0 ? 'text-purple-700' : 'text-orange-700'}`}>
                      On disposals
                    </p>
                  </div>
                  <TrendingDown className={`h-10 w-10 ${totalGainLoss >= 0 ? 'text-purple-600' : 'text-orange-600'}`} />
                </div>
              </div>

              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-5 border border-yellow-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-yellow-600">Pending Approvals</p>
                    <p className="text-2xl font-bold text-yellow-900 mt-1">{pendingApprovals}</p>
                    <p className="text-xs text-yellow-700 mt-1">Awaiting review</p>
                  </div>
                  <AlertTriangle className="h-10 w-10 text-yellow-600" />
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex-1 min-w-[300px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by asset name, code, or disposal number..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-gray-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-gray-400" />
                  <select
                    value={methodFilter}
                    onChange={(e) => setMethodFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="all">All Methods</option>
                    <option value="sale">Sale</option>
                    <option value="scrap">Scrap</option>
                    <option value="donation">Donation</option>
                    <option value="write_off">Write Off</option>
                    <option value="trade_in">Trade In</option>
                  </select>
                </div>

                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Download className="h-4 w-4" />
                  Export
                </button>
              </div>
            </div>

            {/* Disposal List */}
            <div className="space-y-2">
              {filteredDisposals.map((disposal) => (
                <div key={disposal.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-2">
                        <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg">
                          <Package className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{disposal.assetName}</h3>
                          <p className="text-sm text-gray-600">{disposal.disposalNumber} • {disposal.assetCode}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(disposal.status)}`}>
                              {disposal.status === 'completed' && <CheckCircle className="h-3 w-3" />}
                              {disposal.status === 'pending' && <AlertTriangle className="h-3 w-3" />}
                              {disposal.status.toUpperCase()}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMethodBadge(disposal.disposalMethod)}`}>
                              {disposal.disposalMethod.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Disposal Date</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {new Date(disposal.disposalDate).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                    </div>

                    {/* Financial Details */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600 mb-1">Original Cost</p>
                        <p className="text-lg font-semibold text-gray-900">{formatCurrency(disposal.originalCost)}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600 mb-1">Book Value</p>
                        <p className="text-lg font-semibold text-gray-900">{formatCurrency(disposal.bookValue)}</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3">
                        <p className="text-xs text-green-600 mb-1">Sale Proceeds</p>
                        <p className="text-lg font-semibold text-green-700">{formatCurrency(disposal.saleProceeds)}</p>
                      </div>
                      <div className={`rounded-lg p-3 ${disposal.gainLoss >= 0 ? 'bg-purple-50' : 'bg-red-50'}`}>
                        <p className={`text-xs mb-1 ${disposal.gainLoss >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
                          Gain/(Loss)
                        </p>
                        <p className={`text-lg font-semibold ${disposal.gainLoss >= 0 ? 'text-purple-700' : 'text-red-700'}`}>
                          {disposal.gainLoss >= 0 ? '+' : ''}{formatCurrency(disposal.gainLoss)}
                        </p>
                      </div>
                    </div>

                    {/* Additional Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Disposal Information</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Category:</span>
                            <span className="font-medium text-gray-900">{disposal.assetCategory}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Location:</span>
                            <span className="font-medium text-gray-900">{disposal.location}</span>
                          </div>
                          {disposal.buyer && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Buyer:</span>
                              <span className="font-medium text-gray-900">{disposal.buyer}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-gray-600">Disposal Cost:</span>
                            <span className="font-medium text-gray-900">{formatCurrency(disposal.disposalCost)}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Approval & Status</h4>
                        <div className="space-y-2 text-sm">
                          {disposal.approvedBy && (
                            <>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Approved By:</span>
                                <span className="font-medium text-gray-900">{disposal.approvedBy}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Approval Date:</span>
                                <span className="font-medium text-gray-900">
                                  {disposal.approvalDate && new Date(disposal.approvalDate).toLocaleDateString('en-IN')}
                                </span>
                              </div>
                            </>
                          )}
                          <div className="pt-2 border-t border-gray-200">
                            <p className="text-xs text-gray-600 mb-1">Reason for Disposal:</p>
                            <p className="text-sm text-gray-900">{disposal.reason}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-200">
                      <button className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Eye className="h-4 w-4" />
                        View Details
                      </button>
                      {disposal.status === 'pending' && (
                        <button className="flex items-center gap-2 px-4 py-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                          <CheckCircle className="h-4 w-4" />
                          Approve
                        </button>
                      )}
                      <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                        <FileText className="h-4 w-4" />
                        Generate Report
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredDisposals.length === 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <Trash2 className="h-12 w-12 text-gray-400 mb-2" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Disposals Found</h3>
                <p className="text-gray-600">Try adjusting your filters or search query</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
