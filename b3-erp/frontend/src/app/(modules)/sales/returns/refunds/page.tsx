'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Search, Filter, DollarSign, CheckCircle, Clock, XCircle, AlertCircle, CreditCard, Banknote, Building2 } from 'lucide-react'
import { salesPagesService } from '@/services/sales-pages.service';
import { useRouter } from 'next/navigation'

interface Refund {
  id: string
  refundNumber: string
  returnNumber: string
  orderNumber: string
  invoiceNumber: string
  customerName: string
  productCode: string
  productName: string
  category: string
  quantity: number
  unitPrice: number
  refundAmount: number
  taxAmount: number
  totalRefund: number
  reason: string
  status: 'pending' | 'approved' | 'processing' | 'completed' | 'rejected' | 'on_hold'
  requestDate: string
  approvedDate?: string
  processedDate?: string
  completedDate?: string
  refundMethod: 'original_payment' | 'bank_transfer' | 'cheque' | 'credit_note'
  bankDetails?: {
    accountName: string
    accountNumber: string
    ifscCode: string
    bankName: string
  }
  approvedBy?: string
  processingDays?: number
  notes?: string
}

export default function RefundsPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')

  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = await salesPagesService.getQuotations();
        const mapped: Refund[] = raw.map((r: any) => ({
          id: String(r.id ?? ''),
          refundNumber: r.refundNumber ?? '',
          returnNumber: r.returnNumber ?? '',
          orderNumber: r.orderNumber ?? '',
          invoiceNumber: r.invoiceNumber ?? '',
          customerName: r.customerName ?? '',
          productCode: r.productCode ?? '',
          productName: r.productName ?? '',
          category: r.category ?? '',
          quantity: r.quantity ?? 0,
          unitPrice: r.unitPrice ?? 0,
          refundAmount: r.refundAmount ?? 0,
          taxAmount: r.taxAmount ?? 0,
          totalRefund: r.totalRefund ?? 0,
          reason: r.reason ?? '',
          status: (r.status ?? 'pending') as Refund['status'],
          requestDate: r.requestDate ?? '',
          approvedDate: r.approvedDate,
          processedDate: r.processedDate,
          completedDate: r.completedDate,
          refundMethod: (r.refundMethod ?? 'original_payment') as Refund['refundMethod'],
          bankDetails: r.bankDetails
            ? {
                accountName: r.bankDetails.accountName ?? '',
                accountNumber: r.bankDetails.accountNumber ?? '',
                ifscCode: r.bankDetails.ifscCode ?? '',
                bankName: r.bankDetails.bankName ?? '',
              }
            : undefined,
          approvedBy: r.approvedBy,
          processingDays: r.processingDays,
          notes: r.notes,
        }));
        if (!cancelled) setRefunds(mapped);
      } catch (e) {
        if (!cancelled) { setLoadError(e instanceof Error ? e.message : 'Failed to load'); setRefunds([]); }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const statuses = ['all', 'pending', 'approved', 'processing', 'completed', 'rejected', 'on_hold']

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'approved':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'processing':
        return 'bg-indigo-100 text-indigo-700 border-indigo-200'
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'rejected':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'on_hold':
        return 'bg-orange-100 text-orange-700 border-orange-200'
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
      case 'processing':
        return <DollarSign className="h-4 w-4" />
      case 'completed':
        return <CheckCircle className="h-4 w-4" />
      case 'rejected':
        return <XCircle className="h-4 w-4" />
      case 'on_hold':
        return <AlertCircle className="h-4 w-4" />
      default:
        return <DollarSign className="h-4 w-4" />
    }
  }

  const getRefundMethodIcon = (method: string) => {
    switch (method) {
      case 'original_payment':
        return <CreditCard className="h-4 w-4" />
      case 'bank_transfer':
        return <Building2 className="h-4 w-4" />
      case 'cheque':
        return <Banknote className="h-4 w-4" />
      case 'credit_note':
        return <DollarSign className="h-4 w-4" />
      default:
        return <DollarSign className="h-4 w-4" />
    }
  }

  const getRefundMethodLabel = (method: string) => {
    switch (method) {
      case 'original_payment':
        return 'Original Payment Method'
      case 'bank_transfer':
        return 'Bank Transfer (NEFT/RTGS)'
      case 'cheque':
        return 'Cheque'
      case 'credit_note':
        return 'Credit Note'
      default:
        return method
    }
  }

  const filteredRefunds = refunds.filter(ref => {
    const matchesSearch = ref.refundNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ref.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ref.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ref.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ref.returnNumber.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || ref.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const stats = {
    totalRefunds: refunds.length,
    pendingRefunds: refunds.filter(r => r.status === 'pending' || r.status === 'approved').length,
    totalAmount: refunds.filter(r => r.status === 'completed').reduce((sum, r) => sum + r.totalRefund, 0),
    avgProcessingDays: Math.round(refunds.filter(r => r.processingDays).reduce((sum, r) => sum + (r.processingDays || 0), 0) / refunds.filter(r => r.processingDays).length)
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
            <h1 className="text-2xl font-bold text-gray-900">Refund Management</h1>
            <p className="text-sm text-gray-600 mt-1">Process and track customer refunds</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-100">Total Refunds</p>
              <p className="text-3xl font-bold mt-1">{stats.totalRefunds}</p>
              <p className="text-xs text-blue-100 mt-1">This month</p>
            </div>
            <DollarSign className="h-10 w-10 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-100">Pending</p>
              <p className="text-3xl font-bold mt-1">{stats.pendingRefunds}</p>
              <p className="text-xs text-yellow-100 mt-1">Awaiting processing</p>
            </div>
            <Clock className="h-10 w-10 text-yellow-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-100">Total Refunded</p>
              <p className="text-3xl font-bold mt-1">₹{(stats.totalAmount / 100000).toFixed(2)}L</p>
              <p className="text-xs text-green-100 mt-1">Completed refunds</p>
            </div>
            <CheckCircle className="h-10 w-10 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-100">Avg Processing</p>
              <p className="text-3xl font-bold mt-1">{stats.avgProcessingDays}</p>
              <p className="text-xs text-purple-100 mt-1">Days to complete</p>
            </div>
            <Clock className="h-10 w-10 text-purple-200" />
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
              placeholder="Search by refund number, customer, product, or order..."
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
                  {status === 'all' ? 'All Status' : status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Refunds Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {filteredRefunds.map((refund) => (
          <div key={refund.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <div>
                      <h3 className="font-semibold text-gray-900">{refund.refundNumber}</h3>
                      <p className="text-sm text-gray-600">Return: {refund.returnNumber}</p>
                    </div>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusColor(refund.status)}`}>
                  {getStatusIcon(refund.status)}
                  {refund.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>

              {/* Customer */}
              <div className="mb-2 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Customer</p>
                <p className="font-semibold text-gray-900">{refund.customerName}</p>
              </div>

              {/* Product Info */}
              <div className="bg-blue-50 rounded-lg p-3 mb-2 border border-blue-200">
                <p className="font-semibold text-blue-900 mb-2">{refund.productName}</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p className="text-gray-700">Code: {refund.productCode}</p>
                  <p className="text-gray-700">Qty: {refund.quantity}</p>
                  <p className="text-gray-700">{refund.category}</p>
                  <p className="text-gray-700">₹{refund.unitPrice.toLocaleString('en-IN')}/unit</p>
                </div>
              </div>

              {/* Refund Amount Breakdown */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-3 mb-2 border border-green-200">
                <p className="text-xs text-green-700 mb-3 font-medium">Refund Breakdown</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Product Amount:</span>
                    <span className="font-semibold text-gray-900">₹{refund.refundAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Tax (18%):</span>
                    <span className="font-semibold text-gray-900">₹{refund.taxAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="border-t border-green-300 pt-2 flex justify-between">
                    <span className="font-semibold text-green-900">Total Refund:</span>
                    <span className="font-bold text-green-900 text-lg">₹{refund.totalRefund.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Refund Method */}
              <div className="mb-2 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                <div className="flex items-center gap-2 mb-2">
                  {getRefundMethodIcon(refund.refundMethod)}
                  <p className="text-xs text-indigo-700 font-medium">Refund Method</p>
                </div>
                <p className="text-sm font-semibold text-indigo-900">{getRefundMethodLabel(refund.refundMethod)}</p>
              </div>

              {/* Bank Details */}
              {refund.bankDetails && (
                <div className="mb-2 p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-xs text-purple-700 mb-2 font-medium">Bank Details</p>
                  <div className="text-sm space-y-1">
                    <p className="text-gray-700">Account: <span className="font-medium text-gray-900">{refund.bankDetails.accountName}</span></p>
                    <p className="text-gray-700">A/C No: <span className="font-mono text-gray-900">{refund.bankDetails.accountNumber}</span></p>
                    <p className="text-gray-700">IFSC: <span className="font-mono text-gray-900">{refund.bankDetails.ifscCode}</span></p>
                    <p className="text-gray-700">Bank: <span className="font-medium text-gray-900">{refund.bankDetails.bankName}</span></p>
                  </div>
                </div>
              )}

              {/* Reason */}
              <div className="mb-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-xs text-yellow-700 mb-1">Refund Reason</p>
                <p className="text-sm text-yellow-900">{refund.reason}</p>
              </div>

              {/* Timeline */}
              <div className="mb-2 text-sm space-y-1">
                <p className="text-gray-600">Requested: <span className="font-medium text-gray-900">{new Date(refund.requestDate).toLocaleDateString('en-IN')}</span></p>
                {refund.approvedDate && (
                  <p className="text-gray-600">Approved: <span className="font-medium text-gray-900">{new Date(refund.approvedDate).toLocaleDateString('en-IN')}</span></p>
                )}
                {refund.processedDate && (
                  <p className="text-gray-600">Processed: <span className="font-medium text-gray-900">{new Date(refund.processedDate).toLocaleDateString('en-IN')}</span></p>
                )}
                {refund.completedDate && (
                  <p className="text-green-600">Completed: <span className="font-semibold text-green-900">{new Date(refund.completedDate).toLocaleDateString('en-IN')}</span></p>
                )}
                {refund.processingDays && (
                  <p className="text-gray-600">Processing Time: <span className="font-medium text-gray-900">{refund.processingDays} days</span></p>
                )}
              </div>

              {/* Approved By */}
              {refund.approvedBy && (
                <div className="mb-2 text-sm">
                  <p className="text-gray-600">Approved by: <span className="font-medium text-gray-900">{refund.approvedBy}</span></p>
                </div>
              )}

              {/* Notes */}
              {refund.notes && (
                <div className="mb-2 p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <p className="text-xs text-orange-700 mb-1">Notes</p>
                  <p className="text-sm text-orange-900">{refund.notes}</p>
                </div>
              )}

              {/* Order References */}
              <div className="mb-2 text-xs text-gray-600 space-y-1">
                <p>Order: <span className="font-medium text-gray-900">{refund.orderNumber}</span></p>
                <p>Invoice: <span className="font-medium text-gray-900">{refund.invoiceNumber}</span></p>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                  View Details
                </button>
                <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  Process Refund
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredRefunds.length === 0 && (
        <div className="text-center py-12">
          <DollarSign className="h-12 w-12 text-gray-400 mb-2" />
          <p className="text-gray-600">No refunds found matching your criteria</p>
        </div>
      )}
    </div>
  )
}
