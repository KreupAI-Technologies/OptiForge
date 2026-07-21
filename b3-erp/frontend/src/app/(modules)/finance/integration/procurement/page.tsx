'use client'

import { useState, useEffect } from 'react'
import { FinanceService } from '@/services/finance.service'
import { ShoppingCart, FileText, CreditCard, CheckCircle, Clock, XCircle, TrendingUp, DollarSign } from 'lucide-react'

interface ProcurementSync {
  id: string
  poNumber: string
  supplier: string
  orderDate: string
  items: number
  poAmount: number
  receivedAmount: number
  invoicedAmount: number
  paidAmount: number
  grStatus: 'pending' | 'partial' | 'completed'
  invoiceStatus: 'pending' | 'received' | 'matched' | 'disputed'
  paymentStatus: 'unpaid' | 'partial' | 'paid'
  syncStatus: 'synced' | 'pending' | 'failed'
  journalEntries: string[]
}

export default function ProcurementIntegrationPage() {
  const [syncData, setSyncData] = useState<ProcurementSync[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [syncing, setSyncing] = useState(false)

  // Payables from finance ↔ procurement (vendor bills / purchase invoices awaiting
  // payment). Mapped into the ProcurementSync shape the table reads.
  const mapPayable = (r: any): ProcurementSync => {
    const poAmount = Number(r?.totalAmount ?? r?.amount ?? r?.invoiceAmount ?? r?.poAmount) || 0
    const paidAmount = Number(r?.paidAmount ?? r?.amountPaid) || 0
    const invoicedAmount = Number(r?.invoicedAmount ?? r?.invoiceAmount ?? poAmount) || 0
    const receivedAmount = Number(r?.receivedAmount ?? invoicedAmount) || 0
    const outstanding = Number(r?.outstandingAmount ?? (poAmount - paidAmount))

    let paymentStatus: ProcurementSync['paymentStatus'] = 'unpaid'
    if (paidAmount > 0 && outstanding > 0) paymentStatus = 'partial'
    else if (paidAmount > 0 && outstanding <= 0) paymentStatus = 'paid'

    const rawStatus = String(r?.status ?? '').toLowerCase()
    let invoiceStatus: ProcurementSync['invoiceStatus'] = 'received'
    if (rawStatus.includes('dispute')) invoiceStatus = 'disputed'
    else if (rawStatus.includes('match') || paymentStatus === 'paid') invoiceStatus = 'matched'
    else if (rawStatus.includes('pending') || rawStatus.includes('draft')) invoiceStatus = 'pending'

    return {
      id: String(r?.id ?? r?.invoiceNumber ?? ''),
      poNumber: String(r?.poNumber ?? r?.invoiceNumber ?? r?.referenceNumber ?? r?.id ?? ''),
      supplier: String(r?.vendorName ?? r?.supplierName ?? r?.partyName ?? r?.vendor ?? '-'),
      orderDate: r?.invoiceDate ?? r?.date ?? r?.dueDate ?? '',
      items: Number(r?.itemCount ?? r?.lineItems?.length) || 0,
      poAmount,
      receivedAmount,
      invoicedAmount,
      paidAmount,
      grStatus: receivedAmount >= poAmount && poAmount > 0 ? 'completed' : receivedAmount > 0 ? 'partial' : 'pending',
      invoiceStatus,
      paymentStatus,
      syncStatus: 'synced',
      journalEntries: Array.isArray(r?.journalEntries) ? r.journalEntries.map((j: any) => String(j?.entryNumber ?? j)) : [],
    }
  }

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await FinanceService.getPayables()
      setSyncData((Array.isArray(data) ? data : []).map(mapPayable))
    } catch (e: any) {
      setError(e?.message || 'Failed to load procurement payables')
      setSyncData([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Re-synchronise finance ↔ procurement data by refetching the latest payables.
  const handleSyncAll = async () => {
    setSyncing(true)
    try {
      await loadData()
    } finally {
      setSyncing(false)
    }
  }

  // Derived integration stats from the loaded payables (replaces mock totals).
  const integrationStats = {
    totalPOs: syncData.length,
    syncedPOs: syncData.filter((p) => p.syncStatus === 'synced').length,
    pendingPOs: syncData.filter((p) => p.syncStatus === 'pending').length,
    failedPOs: syncData.filter((p) => p.syncStatus === 'failed').length,
    totalPOValue: syncData.reduce((s, p) => s + p.poAmount, 0),
    totalReceived: syncData.reduce((s, p) => s + p.receivedAmount, 0),
    totalInvoiced: syncData.reduce((s, p) => s + p.invoicedAmount, 0),
    totalPaid: syncData.reduce((s, p) => s + p.paidAmount, 0),
    lastSyncTime: new Date().toLocaleString('en-IN'),
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getGRStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700'
      case 'partial': return 'bg-yellow-100 text-yellow-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getInvoiceStatusColor = (status: string) => {
    switch (status) {
      case 'matched': return 'bg-green-100 text-green-700'
      case 'received': return 'bg-blue-100 text-blue-700'
      case 'disputed': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-700'
      case 'partial': return 'bg-yellow-100 text-yellow-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-blue-50 px-3 py-2">
      <div className="w-full space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Procurement Integration</h1>
            <p className="text-gray-600 mt-1">Finance-Procurement module synchronization</p>
          </div>
          <button
            onClick={handleSyncAll}
            disabled={syncing || loading}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:from-cyan-700 hover:to-blue-700 disabled:opacity-50"
          >
            <CheckCircle className="h-5 w-5" />
            {syncing ? 'Syncing...' : 'Sync All'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-2">
              <ShoppingCart className="h-6 w-6 text-cyan-600" />
              <span className="text-sm text-gray-600">PO Value</span>
            </div>
            <p className="text-2xl font-bold text-cyan-600">{formatCurrency(integrationStats.totalPOValue)}</p>
            <p className="text-xs text-gray-500 mt-1">{integrationStats.totalPOs} purchase orders</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="h-6 w-6 text-green-600" />
              <span className="text-sm text-gray-600">Received</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(integrationStats.totalReceived)}</p>
            <p className="text-xs text-gray-500 mt-1">{(integrationStats.totalPOValue ? (integrationStats.totalReceived / integrationStats.totalPOValue) * 100 : 0).toFixed(0)}% of PO value</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="h-6 w-6 text-blue-600" />
              <span className="text-sm text-gray-600">Invoiced</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(integrationStats.totalInvoiced)}</p>
            <p className="text-xs text-gray-500 mt-1">{(integrationStats.totalPOValue ? (integrationStats.totalInvoiced / integrationStats.totalPOValue) * 100 : 0).toFixed(0)}% of PO value</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-2">
              <CreditCard className="h-6 w-6 text-purple-600" />
              <span className="text-sm text-gray-600">Paid</span>
            </div>
            <p className="text-2xl font-bold text-purple-600">{formatCurrency(integrationStats.totalPaid)}</p>
            <p className="text-xs text-gray-500 mt-1">{(integrationStats.totalPOValue ? (integrationStats.totalPaid / integrationStats.totalPOValue) * 100 : 0).toFixed(0)}% of PO value</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Purchase Order Integration Status</h2>
            <p className="text-sm text-gray-600 mt-1">Last sync: {integrationStats.lastSyncTime}</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">PO Number</th>
                  <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">Supplier</th>
                  <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">PO Amount</th>
                  <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">Received</th>
                  <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">Invoiced</th>
                  <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">Paid</th>
                  <th className="px-3 py-2 text-center text-sm font-semibold text-gray-700">GR Status</th>
                  <th className="px-3 py-2 text-center text-sm font-semibold text-gray-700">Invoice Status</th>
                  <th className="px-3 py-2 text-center text-sm font-semibold text-gray-700">Payment Status</th>
                  <th className="px-3 py-2 text-center text-sm font-semibold text-gray-700">Sync</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading && (
                  <tr>
                    <td colSpan={10} className="px-3 py-8 text-center text-sm text-gray-500">Loading payables…</td>
                  </tr>
                )}
                {!loading && error && (
                  <tr>
                    <td colSpan={10} className="px-3 py-8 text-center text-sm text-red-600">{error}</td>
                  </tr>
                )}
                {!loading && !error && syncData.length === 0 && (
                  <tr>
                    <td colSpan={10} className="px-3 py-8 text-center text-sm text-gray-500">No procurement payables found.</td>
                  </tr>
                )}
                {syncData.map((po) => (
                  <tr key={po.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2">
                      <span className="font-mono text-sm font-medium text-gray-900">{po.poNumber}</span>
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-900">{po.supplier}</td>
                    <td className="px-3 py-2 text-sm font-semibold text-gray-900">{formatCurrency(po.poAmount)}</td>
                    <td className="px-3 py-2 text-sm text-green-600">{formatCurrency(po.receivedAmount)}</td>
                    <td className="px-3 py-2 text-sm text-blue-600">{formatCurrency(po.invoicedAmount)}</td>
                    <td className="px-3 py-2 text-sm text-purple-600">{formatCurrency(po.paidAmount)}</td>
                    <td className="px-3 py-2">
                      <div className="flex justify-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGRStatusColor(po.grStatus)}`}>
                          {po.grStatus.toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex justify-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getInvoiceStatusColor(po.invoiceStatus)}`}>
                          {po.invoiceStatus.toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex justify-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(po.paymentStatus)}`}>
                          {po.paymentStatus.toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex justify-center">
                        {po.syncStatus === 'synced' ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : po.syncStatus === 'pending' ? (
                          <Clock className="h-5 w-5 text-yellow-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl shadow-sm p-3 text-white">
          <h3 className="text-lg font-semibold mb-2">Three-Way Matching Process</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Purchase Order
              </h4>
              <ul className="space-y-1 text-sm">
                <li>• PO created in Procurement</li>
                <li>• Commitment entry in Finance</li>
                <li>• Budget check and reservation</li>
                <li>• Approval workflow tracking</li>
              </ul>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Goods Receipt
              </h4>
              <ul className="space-y-1 text-sm">
                <li>• GRN recorded in Procurement</li>
                <li>• Dr. Inventory | Cr. GR/IR Clearing</li>
                <li>• Quality inspection status</li>
                <li>• Automatic PO matching</li>
              </ul>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Invoice & Payment
              </h4>
              <ul className="space-y-1 text-sm">
                <li>• Invoice matched to PO & GRN</li>
                <li>• Dr. GR/IR Clearing | Cr. Accounts Payable</li>
                <li>• Payment processing</li>
                <li>• Dr. Accounts Payable | Cr. Bank</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
