'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Plus, Edit, CreditCard, Calendar, Percent, DollarSign, CheckCircle, AlertCircle } from 'lucide-react'
import { salesPagesService } from '@/services/sales-pages.service';
import { useRouter } from 'next/navigation'

interface PaymentTerm {
  id: string
  name: string
  code: string
  dueDays: number
  discountPercent: number
  discountDays: number
  description: string
  applicableTo: string[]
  creditLimit?: number
  interestRate?: number
  status: 'active' | 'inactive'
  isDefault: boolean
  usageCount: number
}

export default function PaymentTermsPage() {
  const router = useRouter()
  const [selectedFilter, setSelectedFilter] = useState('all')

  const [paymentTerms, setPaymentTerms] = useState<PaymentTerm[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = await salesPagesService.getPaymentTerms();
        const mapped: PaymentTerm[] = raw.map((r: any) => ({
          id: String(r.id ?? ''),
          name: r.name ?? '',
          code: r.code ?? '',
          dueDays: r.dueDays ?? 0,
          discountPercent: r.discountPercent ?? 0,
          discountDays: r.discountDays ?? 0,
          description: r.description ?? '',
          applicableTo: r.applicableTo ?? [],
          creditLimit: r.creditLimit,
          interestRate: r.interestRate,
          status: (r.status ?? 'active') as PaymentTerm['status'],
          isDefault: r.isDefault ?? false,
          usageCount: r.usageCount ?? 0,
        }));
        if (!cancelled) setPaymentTerms(mapped);
      } catch (e) {
        if (!cancelled) { setLoadError(e instanceof Error ? e.message : 'Failed to load'); setPaymentTerms([]); }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [])

  const filters = ['all', 'active', 'inactive', 'with-discount']

  const filteredTerms = paymentTerms.filter(term => {
    if (selectedFilter === 'all') return true
    if (selectedFilter === 'active') return term.status === 'active'
    if (selectedFilter === 'inactive') return term.status === 'inactive'
    if (selectedFilter === 'with-discount') return term.discountPercent > 0
    return true
  })

  const stats = {
    totalTerms: paymentTerms.filter(t => t.status === 'active').length,
    withDiscount: paymentTerms.filter(t => t.discountPercent > 0 && t.status === 'active').length,
    avgDueDays: paymentTerms.filter(t => t.status === 'active' && t.dueDays > 0).reduce((sum, t) => sum + t.dueDays, 0) / paymentTerms.filter(t => t.status === 'active' && t.dueDays > 0).length,
    totalUsage: paymentTerms.reduce((sum, t) => sum + t.usageCount, 0)
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
            <h1 className="text-2xl font-bold text-gray-900">Payment Terms</h1>
            <p className="text-sm text-gray-600 mt-1">Configure payment terms and credit policies</p>
          </div>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Add Payment Term
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-100">Active Terms</p>
              <p className="text-3xl font-bold mt-1">{stats.totalTerms}</p>
              <p className="text-xs text-blue-100 mt-1">Payment options</p>
            </div>
            <CreditCard className="h-10 w-10 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-100">With Discount</p>
              <p className="text-3xl font-bold mt-1">{stats.withDiscount}</p>
              <p className="text-xs text-green-100 mt-1">Early payment incentives</p>
            </div>
            <Percent className="h-10 w-10 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-100">Avg Due Days</p>
              <p className="text-3xl font-bold mt-1">{Math.round(stats.avgDueDays)}</p>
              <p className="text-xs text-purple-100 mt-1">Average credit period</p>
            </div>
            <Calendar className="h-10 w-10 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-100">Total Usage</p>
              <p className="text-3xl font-bold mt-1">{(stats.totalUsage / 1000).toFixed(1)}K</p>
              <p className="text-xs text-orange-100 mt-1">Times applied</p>
            </div>
            <DollarSign className="h-10 w-10 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex flex-wrap gap-2">
          {filters.map(filter => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedFilter === filter
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filter === 'all' ? 'All Terms' :
               filter === 'with-discount' ? 'With Discount' :
               filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Payment Terms Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {filteredTerms.map((term) => (
          <div key={term.id} className={`bg-white rounded-xl shadow-sm border-2 ${term.isDefault ? 'border-blue-500' : 'border-gray-200'} hover:shadow-md transition-shadow`}>
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-lg text-gray-900">{term.name}</h3>
                    {term.isDefault && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                        DEFAULT
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 font-mono">{term.code}</p>
                </div>
                <div className="flex items-center gap-2">
                  {term.status === 'active' ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </div>

              {/* Key Terms */}
              <div className="grid grid-cols-2 gap-3 mb-2">
                <div className={`rounded-lg p-3 ${term.dueDays >= 0 ? 'bg-blue-50 border border-blue-200' : 'bg-green-50 border border-green-200'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className={`h-5 w-5 ${term.dueDays >= 0 ? 'text-blue-600' : 'text-green-600'}`} />
                    <p className={`text-xs font-medium ${term.dueDays >= 0 ? 'text-blue-700' : 'text-green-700'}`}>
                      {term.dueDays >= 0 ? 'Due Days' : 'Advance'}
                    </p>
                  </div>
                  <p className={`text-2xl font-bold ${term.dueDays >= 0 ? 'text-blue-900' : 'text-green-900'}`}>
                    {Math.abs(term.dueDays)} days
                  </p>
                </div>

                {term.discountPercent > 0 && (
                  <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Percent className="h-5 w-5 text-green-600" />
                      <p className="text-xs text-green-700 font-medium">Discount</p>
                    </div>
                    <p className="text-2xl font-bold text-green-900">{term.discountPercent}%</p>
                    <p className="text-xs text-green-700 mt-1">If paid in {term.discountDays} days</p>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="mb-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-700">{term.description}</p>
              </div>

              {/* Credit Details */}
              {term.creditLimit && (
                <div className="grid grid-cols-2 gap-3 mb-2">
                  <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                    <p className="text-xs text-purple-700 mb-1">Credit Limit</p>
                    <p className="font-semibold text-purple-900">₹{(term.creditLimit / 100000).toFixed(1)}L</p>
                  </div>
                  {term.interestRate !== undefined && term.interestRate > 0 && (
                    <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                      <p className="text-xs text-orange-700 mb-1">Late Interest</p>
                      <p className="font-semibold text-orange-900">{term.interestRate}%/month</p>
                    </div>
                  )}
                </div>
              )}

              {/* Applicable To */}
              <div className="mb-2">
                <p className="text-xs text-gray-600 mb-2 font-medium">Applicable To:</p>
                <div className="flex flex-wrap gap-2">
                  {term.applicableTo.map((item, index) => (
                    <span key={index} className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* Usage Stats */}
              <div className="mb-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-blue-700 font-medium">Usage Count</p>
                  <p className="font-semibold text-blue-900">{term.usageCount.toLocaleString('en-IN')} orders</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2">
                  <Edit className="h-4 w-4" />
                  Edit
                </button>
                {!term.isDefault && (
                  <button className="px-4 py-2 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50">
                    Set Default
                  </button>
                )}
                <button className={`px-4 py-2 rounded-lg ${
                  term.status === 'active'
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}>
                  {term.status === 'active' ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTerms.length === 0 && (
        <div className="text-center py-12">
          <CreditCard className="h-12 w-12 text-gray-400 mb-2" />
          <p className="text-gray-600">No payment terms found matching your criteria</p>
        </div>
      )}
    </div>
  )
}
