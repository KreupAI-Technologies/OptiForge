'use client'

import React, { useState, useEffect } from 'react'
import {
  FileText, Search, Filter, Plus, Download, Upload, Eye, Edit, Trash2,
  CheckCircle, XCircle, AlertCircle, Clock, DollarSign, Calendar, Link,
  ChevronDown, ChevronUp, ChevronRight, Package, ShoppingCart, FileCheck,
  AlertTriangle, Check, X, RefreshCw, Send, Printer, Mail, ArrowRight,
  TrendingUp, TrendingDown, MoreVertical, Copy, ExternalLink
} from 'lucide-react'
import { procurementPurchaseInvoiceService } from '@/services/procurement-purchase-invoice.service'

type InvoiceView = {
  id: string
  vendor: string
  poNumber: string
  grnNumber: string
  date: string
  dueDate: string
  amount: number
  status: string
  matchingStatus: string
  items: { name: string; qty: number; poQty: number; grnQty: number; price: number; poPrice: number }[]
  discrepancies: string[]
}

// Maps the backend PurchaseInvoice status enum to the compact UI status vocabulary.
const mapStatus = (raw?: string): string => {
  const s = (raw || '').toLowerCase()
  if (s.includes('paid')) return 'paid'
  if (s.includes('approv') || s.includes('posted') || s.includes('matched')) return 'approved'
  if (s.includes('reject') || s.includes('mismatch') || s.includes('dispute')) return 'disputed'
  return 'pending'
}

// Maps the backend MatchingStatus enum to matched | partial | unmatched.
const mapMatching = (raw?: string, isMatched?: boolean): string => {
  const s = (raw || '').toLowerCase()
  if (isMatched || s.includes('3-way') || s.includes('2-way')) return 'matched'
  if (s.includes('mismatch') || s.includes('variance') || s.includes('exceeded')) return 'partial'
  return 'unmatched'
}

const toView = (inv: any): InvoiceView => {
  const grn = Array.isArray(inv?.goodsReceipts) && inv.goodsReceipts.length > 0
    ? inv.goodsReceipts[0]?.grnNumber
    : ''
  const items = Array.isArray(inv?.items)
    ? inv.items.map((it: any) => ({
        name: it?.itemName || it?.itemCode || it?.description || 'Item',
        qty: Number(it?.invoicedQuantity) || 0,
        poQty: Number(it?.orderedQuantity ?? it?.invoicedQuantity) || 0,
        grnQty: Number(it?.receivedQuantity ?? it?.invoicedQuantity) || 0,
        price: Number(it?.unitPrice) || 0,
        poPrice: Number(it?.netUnitPrice ?? it?.unitPrice) || 0,
      }))
    : []
  const discrepancies = Array.isArray(inv?.matchingExceptions)
    ? inv.matchingExceptions.map((e: any) => e?.description).filter(Boolean)
    : []
  return {
    id: inv?.internalInvoiceNumber || inv?.vendorInvoiceNumber || inv?.id || '',
    vendor: inv?.vendorName || '',
    poNumber: inv?.purchaseOrderNumber || '',
    grnNumber: grn || '',
    date: inv?.invoiceDate ? String(inv.invoiceDate).slice(0, 10) : '',
    dueDate: inv?.dueDate ? String(inv.dueDate).slice(0, 10) : '',
    amount: Number(inv?.totalAmount) || 0,
    status: mapStatus(inv?.status),
    matchingStatus: mapMatching(inv?.matchingStatus, inv?.isMatched),
    items,
    discrepancies,
  }
}

export default function InvoiceManagement() {
  const [activeTab, setActiveTab] = useState('all')
  const [showMatchingModal, setShowMatchingModal] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null)
  const [expandedInvoice, setExpandedInvoice] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState('list')
  const [invoices, setInvoices] = useState<InvoiceView[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        setLoading(true)
        const rows = await procurementPurchaseInvoiceService.getInvoices()
        if (active) setInvoices((rows || []).map(toView))
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : 'Failed to load invoices')
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [])

  // Summary Stats
  const matchedCount = invoices.filter(i => i.matchingStatus === 'matched').length
  const stats = {
    total: invoices.length,
    pending: invoices.filter(i => i.status === 'pending').length,
    approved: invoices.filter(i => i.status === 'approved').length,
    disputed: invoices.filter(i => i.status === 'disputed').length,
    totalAmount: invoices.reduce((sum, i) => sum + i.amount, 0),
    avgProcessingTime: 2.3,
    matchingRate: invoices.length ? Math.round((matchedCount / invoices.length) * 100) : 0,
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-700'
      case 'approved': return 'bg-blue-100 text-blue-700'
      case 'pending': return 'bg-amber-100 text-amber-700'
      case 'disputed': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getMatchingStatusIcon = (status: string) => {
    switch (status) {
      case 'matched':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'partial':
        return <AlertCircle className="h-5 w-5 text-amber-600" />
      case 'unmatched':
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <Clock className="h-5 w-5 text-gray-600" />
    }
  }

  const ThreeWayMatchingModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg  w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b sticky top-0 bg-white z-10">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Three-Way Matching - {selectedInvoice?.id}</h2>
            <button
              onClick={() => setShowMatchingModal(false)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Matching Summary */}
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="flex items-center gap-3 mb-3">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
                <h3 className="font-semibold">Purchase Order</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">PO Number:</span>
                  <span className="font-medium">{selectedInvoice?.poNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="font-medium">${selectedInvoice?.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="text-green-600 font-medium">Confirmed</span>
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-3">
              <div className="flex items-center gap-3 mb-3">
                <Package className="h-6 w-6 text-green-600" />
                <h3 className="font-semibold">Goods Receipt</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">GRN Number:</span>
                  <span className="font-medium">{selectedInvoice?.grnNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Received Date:</span>
                  <span className="font-medium">2024-03-10</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="text-green-600 font-medium">Inspected</span>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-3">
              <div className="flex items-center gap-3 mb-3">
                <FileText className="h-6 w-6 text-purple-600" />
                <h3 className="font-semibold">Invoice</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Invoice Number:</span>
                  <span className="font-medium">{selectedInvoice?.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-medium">${selectedInvoice?.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">{selectedInvoice?.date}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Line Item Comparison */}
          <div className="mb-3">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-gray-600" />
              Line Item Comparison
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Item</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700" colSpan={2}>
                      Purchase Order
                    </th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700" colSpan={2}>
                      Goods Receipt
                    </th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700" colSpan={2}>
                      Invoice
                    </th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">Match Status</th>
                  </tr>
                  <tr className="bg-gray-50 border-b">
                    <th className="text-left py-2 px-4 text-sm text-gray-600"></th>
                    <th className="text-center py-2 px-4 text-sm text-gray-600">Qty</th>
                    <th className="text-center py-2 px-4 text-sm text-gray-600">Price</th>
                    <th className="text-center py-2 px-4 text-sm text-gray-600">Qty</th>
                    <th className="text-center py-2 px-4 text-sm text-gray-600">Status</th>
                    <th className="text-center py-2 px-4 text-sm text-gray-600">Qty</th>
                    <th className="text-center py-2 px-4 text-sm text-gray-600">Price</th>
                    <th className="text-center py-2 px-4 text-sm text-gray-600"></th>
                  </tr>
                </thead>
                <tbody>
                  {selectedInvoice?.items.map((item: any, idx: number) => {
                    const isMatched = item.qty === item.poQty && item.qty === item.grnQty && item.price === item.poPrice
                    return (
                      <tr key={idx} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{item.name}</td>
                        <td className="text-center py-3 px-4">{item.poQty}</td>
                        <td className="text-center py-3 px-4">${item.poPrice}</td>
                        <td className={`text-center py-3 px-4 ${item.grnQty !== item.poQty ? 'text-red-600 font-medium' : ''}`}>
                          {item.grnQty}
                        </td>
                        <td className="text-center py-3 px-4">
                          <span className="text-green-600">✓ Passed</span>
                        </td>
                        <td className={`text-center py-3 px-4 ${item.qty !== item.poQty ? 'text-red-600 font-medium' : ''}`}>
                          {item.qty}
                        </td>
                        <td className={`text-center py-3 px-4 ${item.price !== item.poPrice ? 'text-red-600 font-medium' : ''}`}>
                          ${item.price}
                        </td>
                        <td className="text-center py-3 px-4">
                          {isMatched ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <AlertTriangle className="h-5 w-5 text-amber-600" />
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50 font-medium">
                    <td className="py-3 px-4">Total</td>
                    <td className="text-center py-3 px-4" colSpan={2}>
                      ${selectedInvoice?.amount.toLocaleString()}
                    </td>
                    <td className="text-center py-3 px-4" colSpan={2}>
                      ${(selectedInvoice?.amount * 0.95).toLocaleString()}
                    </td>
                    <td className="text-center py-3 px-4" colSpan={2}>
                      ${selectedInvoice?.amount.toLocaleString()}
                    </td>
                    <td className="text-center py-3 px-4">
                      {selectedInvoice?.matchingStatus === 'matched' ? (
                        <span className="text-green-600">Matched</span>
                      ) : (
                        <span className="text-amber-600">Variance</span>
                      )}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Discrepancies */}
          {selectedInvoice?.discrepancies && selectedInvoice.discrepancies.length > 0 && (
            <div className="mb-3">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                Discrepancies Found
              </h3>
              <div className="bg-amber-50 rounded-lg p-3">
                <ul className="space-y-2">
                  {selectedInvoice.discrepancies.map((disc: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                      <span className="text-sm">{disc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="flex gap-3">
              <button className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Re-match
              </button>
              <button className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2">
                <Eye className="h-4 w-4" />
                View Documents
              </button>
            </div>
            <div className="flex gap-3">
              {selectedInvoice?.matchingStatus === 'matched' ? (
                <>
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    Approve Invoice
                  </button>
                </>
              ) : (
                <>
                  <button className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Request Clarification
                  </button>
                  <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2">
                    <X className="h-4 w-4" />
                    Dispute Invoice
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 p-3">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-3 mb-3">
        <div className="flex justify-between items-center mb-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Invoice Management</h1>
            <p className="text-gray-600 mt-1">Three-way matching and invoice processing</p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload Invoice
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Invoice
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-3">
              <FileText className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">{stats.total}</span>
            </div>
            <div className="text-sm text-gray-600">Total Invoices</div>
            <div className="text-xs text-gray-500 mt-1">This month</div>
          </div>

          <div className="bg-amber-50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-3">
              <Clock className="h-8 w-8 text-amber-600" />
              <span className="text-2xl font-bold text-gray-900">{stats.pending}</span>
            </div>
            <div className="text-sm text-gray-600">Pending Approval</div>
            <div className="text-xs text-amber-600 mt-1">Requires action</div>
          </div>

          <div className="bg-green-50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-3">
              <DollarSign className="h-8 w-8 text-green-600" />
              <span className="text-2xl font-bold text-gray-900">
                ${(stats.totalAmount / 1000).toFixed(0)}K
              </span>
            </div>
            <div className="text-sm text-gray-600">Total Amount</div>
            <div className="text-xs text-green-600 mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              12% from last month
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-3">
              <Link className="h-8 w-8 text-purple-600" />
              <span className="text-2xl font-bold text-gray-900">{stats.matchingRate}%</span>
            </div>
            <div className="text-sm text-gray-600">Matching Rate</div>
            <div className="text-xs text-gray-500 mt-1">3-way matching success</div>
          </div>
        </div>
      </div>

      {/* Filters and Tabs */}
      <div className="bg-white rounded-lg shadow-sm mb-3">
        <div className="border-b">
          <div className="flex items-center justify-between p-3">
            <div className="flex gap-2">
              {['all', 'pending', 'approved', 'disputed', 'paid'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg capitalize ${
                    activeTab === tab
                      ? 'bg-blue-100 text-blue-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search invoices..."
                  className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 w-64"
                />
              </div>
              <button className="inline-flex items-center gap-1.5 px-3 py-2 border rounded-lg hover:bg-gray-50">
                <Filter className="h-4 w-4 text-gray-600" />
                <span className="text-gray-700">Filter</span>
              </button>
              <button className="inline-flex items-center gap-1.5 px-3 py-2 border rounded-lg hover:bg-gray-50">
                <Download className="h-4 w-4 text-gray-600" />
                <span className="text-gray-700">Download</span>
              </button>
            </div>
          </div>
        </div>

        {/* Invoice List */}
        <div className="p-6">
          {loading && (
            <div className="text-center text-gray-500 py-8">Loading invoices...</div>
          )}
          {error && !loading && (
            <div className="text-center text-red-600 py-8">{error}</div>
          )}
          {!loading && !error && invoices.length === 0 && (
            <div className="text-center text-gray-500 py-8">No invoices found.</div>
          )}
          <div className="space-y-2">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="border rounded-lg hover:shadow-md transition-shadow">
                <div
                  className="p-4 cursor-pointer"
                  onClick={() => setExpandedInvoice(expandedInvoice === invoice.id ? null : invoice.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-gray-900">{invoice.id}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                            {invoice.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                          <span>{invoice.vendor}</span>
                          <span>•</span>
                          <span>PO: {invoice.poNumber}</span>
                          <span>•</span>
                          <span>GRN: {invoice.grnNumber}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">${invoice.amount.toLocaleString()}</div>
                        <div className="text-sm text-gray-500">Due: {invoice.dueDate}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {getMatchingStatusIcon(invoice.matchingStatus)}
                          <span className="text-sm capitalize">{invoice.matchingStatus}</span>
                        </div>
                        <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${
                          expandedInvoice === invoice.id ? 'rotate-180' : ''
                        }`} />
                      </div>
                    </div>
                  </div>
                </div>

                {expandedInvoice === invoice.id && (
                  <div className="border-t p-3 bg-gray-50">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Invoice Items</h4>
                        <div className="space-y-2">
                          {invoice.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                              <span className="text-gray-600">{item.name}</span>
                              <span className="text-gray-900">
                                {item.qty} × ${item.price} = ${(item.qty * item.price).toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Matching Results</h4>
                        {invoice.discrepancies.length > 0 ? (
                          <div className="space-y-2">
                            {invoice.discrepancies.map((disc, idx) => (
                              <div key={idx} className="flex items-start gap-2 text-sm">
                                <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                                <span className="text-gray-600">{disc}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-sm text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            <span>All items matched successfully</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedInvoice(invoice)
                          setShowMatchingModal(true)
                        }}
                        className="px-3 py-1.5 border rounded-lg hover:bg-white text-sm flex items-center gap-2"
                      >
                        <Link className="h-4 w-4" />
                        View Matching
                      </button>
                      <button className="px-3 py-1.5 border rounded-lg hover:bg-white text-sm flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        View Invoice
                      </button>
                      <button className="px-3 py-1.5 border rounded-lg hover:bg-white text-sm flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Download
                      </button>
                      {invoice.status === 'pending' && (
                        <>
                          <button className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm flex items-center gap-2">
                            <Check className="h-4 w-4" />
                            Approve
                          </button>
                          <button className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm flex items-center gap-2">
                            <X className="h-4 w-4" />
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Three-Way Matching Modal */}
      {showMatchingModal && selectedInvoice && <ThreeWayMatchingModal />}
    </div>
  )
}