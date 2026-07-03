'use client'

import React, { useState, useMemo, useEffect } from 'react'
import {
  Clock,
  TrendingDown,
  AlertTriangle,
  AlertCircle,
  DollarSign,
  Calendar,
  Users,
  FileText,
  Download,
  Mail,
  Phone
} from 'lucide-react'
import { ViewInvoiceModal } from '@/components/finance/ar/InvoicesModals'
import { SendCustomerStatementModal } from '@/components/finance/ar/CustomerManagementModals'
import { FinanceService } from '@/services/finance.service'

interface ARAgingRecord {
  id: string
  customerCode: string
  customerName: string
  contactPerson: string
  phone: string
  email: string
  totalOutstanding: number
  current: number          // 0-30 days
  days30to60: number      // 30-60 days
  days60to90: number      // 60-90 days
  days90to120: number     // 90-120 days
  over120: number         // >120 days
  oldestInvoice: string
  oldestInvoiceDate: string
  invoiceCount: number
  creditLimit: number
  creditDays: number
  lastPaymentDate: string
  lastPaymentAmount: number
}

export default function ARAgingPage() {
  const [arData, setArData] = useState<ARAgingRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [ageFilter, setAgeFilter] = useState<string>('all')

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setIsLoading(true)
      setLoadError(null)
      try {
        const res = await FinanceService.getReceivablesAging()
        const mapped: ARAgingRecord[] = (res.data || []).map((r: any, idx: number) => ({
          id: r.partyId || String(idx),
          customerCode: r.partyId || '—',
          customerName: r.partyName || 'Unknown',
          contactPerson: '',
          phone: '',
          email: '',
          totalOutstanding: Number(r.totalOutstanding ?? 0),
          current: Number(r.current ?? 0),
          days30to60: Number(r.days30to60 ?? 0),
          days60to90: Number(r.days60to90 ?? 0),
          days90to120: Number(r.days90to120 ?? 0),
          over120: Number(r.over120 ?? 0),
          oldestInvoice: r.oldestInvoice || '—',
          oldestInvoiceDate: r.oldestInvoiceDate || '',
          invoiceCount: Number(r.invoiceCount ?? 0),
          creditLimit: 0,
          creditDays: Number(r.creditDays ?? 0),
          lastPaymentDate: '',
          lastPaymentAmount: 0,
        }))
        if (!cancelled) setArData(mapped)
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load receivables aging')
          setArData([])
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
  const [isViewInvoiceModalOpen, setIsViewInvoiceModalOpen] = useState(false)
  const [isStatementModalOpen, setIsStatementModalOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<ARAgingRecord | null>(null)

  const filteredData = useMemo(() => {
    let data = arData.filter(record =>
      record.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.customerCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (ageFilter === 'current') {
      data = data.filter(r => r.current > 0)
    } else if (ageFilter === '30-60') {
      data = data.filter(r => r.days30to60 > 0)
    } else if (ageFilter === '60-90') {
      data = data.filter(r => r.days60to90 > 0)
    } else if (ageFilter === '90+') {
      data = data.filter(r => r.days90to120 > 0 || r.over120 > 0)
    } else if (ageFilter === 'overdue') {
      data = data.filter(r => (r.days30to60 + r.days60to90 + r.days90to120 + r.over120) > 0)
    }

    return data
  }, [arData, searchTerm, ageFilter])

  const stats = useMemo(() => {
    const total = arData.reduce((sum, r) => sum + r.totalOutstanding, 0)
    const current = arData.reduce((sum, r) => sum + r.current, 0)
    const days30to60 = arData.reduce((sum, r) => sum + r.days30to60, 0)
    const days60to90 = arData.reduce((sum, r) => sum + r.days60to90, 0)
    const days90to120 = arData.reduce((sum, r) => sum + r.days90to120, 0)
    const over120 = arData.reduce((sum, r) => sum + r.over120, 0)
    const overdue = days30to60 + days60to90 + days90to120 + over120
    const overduePercentage = total > 0 ? (overdue / total) * 100 : 0

    return { total, current, days30to60, days60to90, days90to120, over120, overdue, overduePercentage }
  }, [arData])

  const getCreditUtilization = (outstanding: number, limit: number) => {
    return Math.round((outstanding / limit) * 100)
  }

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 90) return 'text-red-700'
    if (utilization >= 75) return 'text-yellow-700'
    return 'text-green-700'
  }

  return (
    <div className="p-6">
      <div className="mb-3">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Accounts Receivable Aging Report</h1>
        <p className="text-gray-600">Track overdue customer invoices by aging buckets</p>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading receivables aging…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}
      {!isLoading && !loadError && arData.length === 0 && (
        <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          No outstanding receivables found.
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 mb-1">Total Outstanding</p>
              <p className="text-2xl font-bold text-blue-900">₹{(stats.total / 100000).toFixed(1)}L</p>
            </div>
            <div className="h-12 w-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600 mb-1">Current (0-30)</p>
              <p className="text-2xl font-bold text-green-900">₹{(stats.current / 100000).toFixed(1)}L</p>
            </div>
            <div className="h-12 w-12 bg-green-500 rounded-lg flex items-center justify-center">
              <Calendar className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg shadow p-3 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600 mb-1">30-60 days</p>
              <p className="text-2xl font-bold text-yellow-900">₹{(stats.days30to60 / 100000).toFixed(1)}L</p>
            </div>
            <div className="h-12 w-12 bg-yellow-500 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg shadow p-3 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600 mb-1">60-90 days</p>
              <p className="text-2xl font-bold text-orange-900">₹{(stats.days60to90 / 100000).toFixed(1)}L</p>
            </div>
            <div className="h-12 w-12 bg-orange-500 rounded-lg flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg shadow p-3 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600 mb-1">90+ days</p>
              <p className="text-2xl font-bold text-red-900">₹{((stats.days90to120 + stats.over120) / 100000).toFixed(1)}L</p>
            </div>
            <div className="h-12 w-12 bg-red-500 rounded-lg flex items-center justify-center">
              <TrendingDown className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow p-3 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600 mb-1">Overdue %</p>
              <p className="text-2xl font-bold text-purple-900">{stats.overduePercentage.toFixed(1)}%</p>
            </div>
            <div className="h-12 w-12 bg-purple-500 rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow mb-3 p-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search Customer</label>
            <input
              type="text"
              placeholder="Search by customer name, code, or contact..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Age</label>
            <select
              value={ageFilter}
              onChange={(e) => setAgeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Ages</option>
              <option value="current">Current (0-30 days)</option>
              <option value="30-60">30-60 days</option>
              <option value="60-90">60-90 days</option>
              <option value="90+">90+ days</option>
              <option value="overdue">All Overdue</option>
            </select>
          </div>
        </div>
      </div>

      {/* Customer AR Aging List */}
      <div className="space-y-2">
        {filteredData.map((record) => (
          <div key={record.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{record.customerName}</h3>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {record.customerCode}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {record.contactPerson}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      {record.phone}
                    </span>
                    <span className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {record.email}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedCustomer(record)
                      setIsViewInvoiceModalOpen(true)
                    }}
                    className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2 text-sm"
                  >
                    <FileText className="h-4 w-4" />
                    View Invoices
                  </button>
                  <button
                    onClick={() => {
                      setSelectedCustomer(record)
                      setIsStatementModalOpen(true)
                    }}
                    className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2 text-sm"
                  >
                    <Download className="h-4 w-4" />
                    Statement
                  </button>
                </div>
              </div>

              {/* AR Aging Grid */}
              <div className="grid grid-cols-1 md:grid-cols-6 gap-2 mb-2">
                {/* Total Outstanding */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
                  <h4 className="text-xs font-semibold text-blue-900 mb-2">Total Outstanding</h4>
                  <p className="text-xl font-bold text-blue-900">₹{(record.totalOutstanding / 100000).toFixed(2)}L</p>
                  <p className="text-xs text-blue-600 mt-1">{record.invoiceCount} invoices</p>
                </div>

                {/* Current */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
                  <h4 className="text-xs font-semibold text-green-900 mb-2">Current (0-30)</h4>
                  <p className="text-xl font-bold text-green-900">₹{(record.current / 100000).toFixed(2)}L</p>
                  <p className="text-xs text-green-600 mt-1">{((record.current / record.totalOutstanding) * 100).toFixed(0)}%</p>
                </div>

                {/* 30-60 days */}
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
                  <h4 className="text-xs font-semibold text-yellow-900 mb-2">30-60 days</h4>
                  <p className="text-xl font-bold text-yellow-900">₹{(record.days30to60 / 100000).toFixed(2)}L</p>
                  <p className="text-xs text-yellow-600 mt-1">{((record.days30to60 / record.totalOutstanding) * 100).toFixed(0)}%</p>
                </div>

                {/* 60-90 days */}
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
                  <h4 className="text-xs font-semibold text-orange-900 mb-2">60-90 days</h4>
                  <p className="text-xl font-bold text-orange-900">₹{(record.days60to90 / 100000).toFixed(2)}L</p>
                  <p className="text-xs text-orange-600 mt-1">{((record.days60to90 / record.totalOutstanding) * 100).toFixed(0)}%</p>
                </div>

                {/* 90-120 days */}
                <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3 border border-red-200">
                  <h4 className="text-xs font-semibold text-red-900 mb-2">90-120 days</h4>
                  <p className="text-xl font-bold text-red-900">₹{(record.days90to120 / 100000).toFixed(2)}L</p>
                  <p className="text-xs text-red-600 mt-1">{((record.days90to120 / record.totalOutstanding) * 100).toFixed(0)}%</p>
                </div>

                {/* Over 120 days */}
                <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-lg p-3 border border-rose-200">
                  <h4 className="text-xs font-semibold text-rose-900 mb-2">Over 120 days</h4>
                  <p className="text-xl font-bold text-rose-900">₹{(record.over120 / 100000).toFixed(2)}L</p>
                  <p className="text-xs text-rose-600 mt-1">{((record.over120 / record.totalOutstanding) * 100).toFixed(0)}%</p>
                </div>
              </div>

              {/* Additional Info */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2 pt-4 border-t border-gray-200">
                <div>
                  <p className="text-xs text-gray-600">Oldest Invoice</p>
                  <p className="text-sm font-semibold text-gray-900">{record.oldestInvoice}</p>
                  <p className="text-xs text-gray-500">{new Date(record.oldestInvoiceDate).toLocaleDateString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Credit Limit</p>
                  <p className="text-sm font-semibold text-gray-900">₹{(record.creditLimit / 100000).toFixed(1)}L</p>
                  <p className={`text-xs font-semibold ${getUtilizationColor(getCreditUtilization(record.totalOutstanding, record.creditLimit))}`}>
                    {getCreditUtilization(record.totalOutstanding, record.creditLimit)}% utilized
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Credit Days</p>
                  <p className="text-sm font-semibold text-gray-900">{record.creditDays} days</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Last Payment</p>
                  <p className="text-sm font-semibold text-gray-900">₹{(record.lastPaymentAmount / 100000).toFixed(2)}L</p>
                  <p className="text-xs text-gray-500">{new Date(record.lastPaymentDate).toLocaleDateString('en-IN')}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Guidelines */}
      <div className="mt-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-md p-3 border border-blue-200">
        <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-600" />
          AR Aging Report Guidelines
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Aging Buckets</h3>
            <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
              <li>Current (0-30 days): Within credit period</li>
              <li>30-60 days: Slightly overdue, follow-up required</li>
              <li>60-90 days: Significantly overdue, escalate</li>
              <li>90-120 days: High-risk, legal notice consideration</li>
              <li>Over 120 days: Bad debt provision required</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Collection Actions</h3>
            <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
              <li>0-30 days: Send payment reminder</li>
              <li>30-60 days: Phone call + email escalation</li>
              <li>60-90 days: Hold new orders, senior management involved</li>
              <li>90-120 days: Legal notice, stop credit facility</li>
              <li>Over 120 days: Legal action, write-off consideration</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Credit Management</h3>
            <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
              <li>Monitor credit utilization (≤75% is healthy)</li>
              <li>Review credit limits quarterly</li>
              <li>Block orders if credit limit exceeded</li>
              <li>Enforce credit days policy strictly</li>
              <li>Maintain customer payment history</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Best Practices</h3>
            <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
              <li>Review AR aging report weekly</li>
              <li>Follow up with customers before due date</li>
              <li>Offer early payment discounts</li>
              <li>Maintain good customer relationships</li>
              <li>Provide easy payment options</li>
              <li>Document all communication</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ViewInvoiceModal
        isOpen={isViewInvoiceModalOpen}
        onClose={() => setIsViewInvoiceModalOpen(false)}
        invoiceId={selectedCustomer?.oldestInvoice}
      />

      <SendCustomerStatementModal
        isOpen={isStatementModalOpen}
        onClose={() => setIsStatementModalOpen(false)}
        customer={selectedCustomer ? {
          id: selectedCustomer.id,
          code: selectedCustomer.customerCode,
          name: selectedCustomer.customerName,
          type: 'customer',
          contactPerson: selectedCustomer.contactPerson,
          email: selectedCustomer.email,
          phone: selectedCustomer.phone,
          billingAddress: '',
          shippingAddress: '',
          creditLimit: selectedCustomer.creditLimit,
          creditUsed: selectedCustomer.totalOutstanding,
          paymentTerms: `${selectedCustomer.creditDays} days`,
          status: 'active',
          createdDate: '',
          totalInvoices: selectedCustomer.invoiceCount,
          totalRevenue: selectedCustomer.totalOutstanding,
          averagePaymentDays: selectedCustomer.creditDays,
        } : undefined}
      />
    </div>
  )
}
