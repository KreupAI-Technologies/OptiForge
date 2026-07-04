'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Plus, Search, Filter, RefreshCw, AlertCircle, CheckCircle, Clock, Package, TrendingDown } from 'lucide-react'
import { salesPagesService } from '@/services/sales-pages.service';
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Return {
  id: string
  returnNumber: string
  orderNumber: string
  customerName: string
  productCode: string
  productName: string
  category: string
  quantity: number
  unitPrice: number
  totalAmount: number
  reason: string
  returnType: 'defective' | 'wrong_item' | 'damaged' | 'not_satisfied' | 'size_issue' | 'quality_issue'
  status: 'pending' | 'approved' | 'rejected' | 'inspecting' | 'completed'
  requestDate: string
  inspectionDate?: string
  resolutionType?: 'replacement' | 'refund' | 'repair' | 'exchange'
  daysOpen: number
  images?: string[]
  notes?: string
}

export default function ReturnsPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')

  const [returns, setReturns] = useState<Return[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = await salesPagesService.getQuotations();
        const mapped: Return[] = raw.map((r: any) => ({
          id: String(r.id ?? ''),
          returnNumber: r.returnNumber ?? '',
          orderNumber: r.orderNumber ?? '',
          customerName: r.customerName ?? '',
          productCode: r.productCode ?? '',
          productName: r.productName ?? '',
          category: r.category ?? '',
          quantity: r.quantity ?? 0,
          unitPrice: r.unitPrice ?? 0,
          totalAmount: r.totalAmount ?? 0,
          reason: r.reason ?? '',
          returnType: (r.returnType ?? 'defective') as Return['returnType'],
          status: (r.status ?? 'pending') as Return['status'],
          requestDate: r.requestDate ?? '',
          inspectionDate: r.inspectionDate,
          resolutionType: r.resolutionType,
          daysOpen: r.daysOpen ?? 0,
          images: r.images,
          notes: r.notes,
        }));
        if (!cancelled) setReturns(mapped);
      } catch (e) {
        if (!cancelled) { setLoadError(e instanceof Error ? e.message : 'Failed to load'); setReturns([]); }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const statuses = ['all', 'pending', 'inspecting', 'approved', 'rejected', 'completed']

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'approved':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'rejected':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'inspecting':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'completed':
        return 'bg-gray-100 text-gray-700 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />
      case 'approved':
        return <CheckCircle className="h-4 w-4" />
      case 'rejected':
        return <AlertCircle className="h-4 w-4" />
      case 'inspecting':
        return <Search className="h-4 w-4" />
      case 'completed':
        return <CheckCircle className="h-4 w-4" />
      default:
        return <RefreshCw className="h-4 w-4" />
    }
  }

  const getReturnTypeColor = (type: string) => {
    switch (type) {
      case 'defective':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'damaged':
        return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'wrong_item':
        return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'quality_issue':
        return 'bg-pink-100 text-pink-700 border-pink-200'
      case 'size_issue':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'not_satisfied':
        return 'bg-gray-100 text-gray-700 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const filteredReturns = returns.filter(ret => {
    const matchesSearch = ret.returnNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ret.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ret.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ret.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || ret.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const stats = {
    totalReturns: returns.length,
    pendingReturns: returns.filter(r => r.status === 'pending').length,
    returnRate: ((returns.length / 850) * 100).toFixed(1),
    totalValue: returns.reduce((sum, r) => sum + r.totalAmount, 0)
  }

  return (
    <div className="w-full h-full px-4 py-2">
      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}
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
            <h1 className="text-2xl font-bold text-gray-900">Returns Management</h1>
            <p className="text-sm text-gray-600 mt-1">Track and manage product returns</p>
          </div>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Process Return
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-100">Total Returns</p>
              <p className="text-3xl font-bold mt-1">{stats.totalReturns}</p>
              <p className="text-xs text-blue-100 mt-1">This month</p>
            </div>
            <RefreshCw className="h-10 w-10 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-100">Pending</p>
              <p className="text-3xl font-bold mt-1">{stats.pendingReturns}</p>
              <p className="text-xs text-yellow-100 mt-1">Awaiting action</p>
            </div>
            <Clock className="h-10 w-10 text-yellow-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-100">Return Rate</p>
              <p className="text-3xl font-bold mt-1">{stats.returnRate}%</p>
              <p className="text-xs text-red-100 mt-1">Of total orders</p>
            </div>
            <TrendingDown className="h-10 w-10 text-red-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-100">Total Value</p>
              <p className="text-3xl font-bold mt-1">₹{(stats.totalValue / 100000).toFixed(2)}L</p>
              <p className="text-xs text-purple-100 mt-1">Returns value</p>
            </div>
            <Package className="h-10 w-10 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
        <Link href="/sales/returns/replacements" className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-green-900">Replacements</h3>
              <p className="text-sm text-green-700 mt-1">View replacement orders</p>
            </div>
            <RefreshCw className="h-8 w-8 text-green-600" />
          </div>
        </Link>

        <Link href="/sales/returns/refunds" className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-blue-900">Refunds</h3>
              <p className="text-sm text-blue-700 mt-1">Manage refund requests</p>
            </div>
            <TrendingDown className="h-8 w-8 text-blue-600" />
          </div>
        </Link>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by return number, customer, product, or order..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              {statuses.map(status => (
                <option key={status} value={status}>
                  {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Returns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {filteredReturns.map((returnItem) => (
          <div key={returnItem.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <RefreshCw className="h-5 w-5 text-blue-600" />
                    <div>
                      <h3 className="font-semibold text-gray-900">{returnItem.returnNumber}</h3>
                      <p className="text-sm text-gray-600">Order: {returnItem.orderNumber}</p>
                    </div>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusColor(returnItem.status)}`}>
                  {getStatusIcon(returnItem.status)}
                  {returnItem.status.toUpperCase()}
                </span>
              </div>

              {/* Customer */}
              <div className="mb-2 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Customer</p>
                <p className="font-semibold text-gray-900">{returnItem.customerName}</p>
              </div>

              {/* Product Info */}
              <div className="bg-blue-50 rounded-lg p-3 mb-2 border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="h-4 w-4 text-blue-600" />
                  <p className="font-semibold text-blue-900">{returnItem.productName}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p className="text-gray-700">Code: {returnItem.productCode}</p>
                  <p className="text-gray-700">Qty: {returnItem.quantity}</p>
                  <p className="text-gray-700">{returnItem.category}</p>
                  <p className="text-gray-700">₹{returnItem.unitPrice.toLocaleString('en-IN')}/unit</p>
                </div>
              </div>

              {/* Return Type */}
              <div className="mb-2">
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getReturnTypeColor(returnItem.returnType)}`}>
                  {returnItem.returnType.replace('_', ' ').toUpperCase()}
                </span>
              </div>

              {/* Reason */}
              <div className="mb-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-xs text-yellow-700 mb-1">Return Reason</p>
                <p className="text-sm text-yellow-900">{returnItem.reason}</p>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600 mb-1">Total Amount</p>
                  <p className="font-semibold text-gray-900">₹{returnItem.totalAmount.toLocaleString('en-IN')}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600 mb-1">Days Open</p>
                  <p className="font-semibold text-gray-900">{returnItem.daysOpen} days</p>
                </div>
              </div>

              {/* Dates */}
              <div className="mb-2 text-sm">
                <p className="text-gray-600">Requested: <span className="font-medium text-gray-900">{new Date(returnItem.requestDate).toLocaleDateString('en-IN')}</span></p>
                {returnItem.inspectionDate && (
                  <p className="text-gray-600 mt-1">Inspected: <span className="font-medium text-gray-900">{new Date(returnItem.inspectionDate).toLocaleDateString('en-IN')}</span></p>
                )}
              </div>

              {/* Resolution Type */}
              {returnItem.resolutionType && (
                <div className="mb-2 p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-xs text-green-700 mb-1">Resolution</p>
                  <p className="font-semibold text-green-900">{returnItem.resolutionType.charAt(0).toUpperCase() + returnItem.resolutionType.slice(1)}</p>
                </div>
              )}

              {/* Notes */}
              {returnItem.notes && (
                <div className="mb-2 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                  <p className="text-xs text-indigo-700 mb-1">Notes</p>
                  <p className="text-sm text-indigo-900">{returnItem.notes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <button className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                  View Details
                </button>
                <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Process
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredReturns.length === 0 && (
        <div className="text-center py-12">
          <RefreshCw className="h-12 w-12 text-gray-400 mb-2" />
          <p className="text-gray-600">No returns found matching your criteria</p>
        </div>
      )}
    </div>
  )
}
