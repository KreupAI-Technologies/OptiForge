'use client'

import { useState, useEffect } from 'react'
import { FinanceService } from '@/services/finance.service'
import { exportToCsv } from '@/lib/export'
import {
  Building2,
  ArrowLeftRight,
  DollarSign,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Clock,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Plus,
  X
} from 'lucide-react'

interface IntercompanyTransaction {
  id: string
  transactionNumber: string
  transactionDate: string
  fromCompany: string
  toCompany: string
  transactionType: 'sale' | 'purchase' | 'transfer' | 'loan' | 'service'
  amount: number
  currency: string
  status: 'pending' | 'approved' | 'posted' | 'reconciled' | 'eliminated'
  description: string
  eliminationStatus: 'not_required' | 'pending' | 'completed'
}

export default function IntercompanyTransactionsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')

  const [transactions, setTransactions] = useState<IntercompanyTransaction[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Intercompany transactions ledger (net-new endpoint)
  interface LedgerTxn {
    id: string
    entityFrom: string
    entityTo: string
    transactionType: string
    amount: number
    currency: string
    date: string
    status: string
    description: string
    reference: string
  }

  const emptyForm = {
    entityFrom: '',
    entityTo: '',
    transactionType: 'sale',
    amount: 0,
    currency: 'INR',
    date: new Date().toISOString().slice(0, 10),
    status: 'pending',
    description: '',
    reference: '',
  }

  const [ledger, setLedger] = useState<LedgerTxn[]>([])
  const [ledgerLoading, setLedgerLoading] = useState(false)
  const [ledgerError, setLedgerError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view' | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [form, setForm] = useState<typeof emptyForm>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLedgerLoading(true)
      setLedgerError(null)
      try {
        const data = await FinanceService.getIntercompanyTransactions()
        if (cancelled) return
        const rows: LedgerTxn[] = (Array.isArray(data) ? data : []).map((r: any, i: number) => ({
          id: String(r.id ?? i),
          entityFrom: String(r.entityFrom ?? ''),
          entityTo: String(r.entityTo ?? ''),
          transactionType: String(r.transactionType ?? ''),
          amount: Number(r.amount) || 0,
          currency: String(r.currency ?? 'INR'),
          date: String(r.date ?? ''),
          status: String(r.status ?? ''),
          description: String(r.description ?? ''),
          reference: String(r.reference ?? ''),
        }))
        setLedger(rows)
      } catch (e: any) {
        if (!cancelled) {
          setLedgerError(e?.message || 'Failed to load intercompany transactions')
          setLedger([])
        }
      } finally {
        if (!cancelled) setLedgerLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [reloadKey])

  const openCreate = () => {
    setModalMode('create')
    setActiveId(null)
    setForm(emptyForm)
    setSaveError(null)
  }

  const openEdit = async (id: string) => {
    setModalMode('edit')
    setActiveId(id)
    setSaveError(null)
    const existing = ledger.find((t) => t.id === id)
    if (existing) {
      setForm({
        entityFrom: existing.entityFrom,
        entityTo: existing.entityTo,
        transactionType: existing.transactionType || 'sale',
        amount: existing.amount,
        currency: existing.currency || 'INR',
        date: existing.date ? String(existing.date).slice(0, 10) : emptyForm.date,
        status: existing.status || 'pending',
        description: existing.description,
        reference: existing.reference,
      })
    }
    try {
      const fresh = await FinanceService.getIntercompanyTransaction(id)
      if (fresh) {
        setForm((prev) => ({
          ...prev,
          entityFrom: String(fresh.entityFrom ?? prev.entityFrom),
          entityTo: String(fresh.entityTo ?? prev.entityTo),
          transactionType: String(fresh.transactionType ?? prev.transactionType),
          amount: Number(fresh.amount ?? prev.amount) || 0,
          currency: String(fresh.currency ?? prev.currency),
          date: fresh.date ? String(fresh.date).slice(0, 10) : prev.date,
          status: String(fresh.status ?? prev.status),
          description: String(fresh.description ?? prev.description),
          reference: String(fresh.reference ?? prev.reference),
        }))
      }
    } catch {
      /* keep local values on fetch failure */
    }
  }

  const openView = async (id: string) => {
    await openEdit(id)
    setModalMode('view')
  }

  const closeModal = () => {
    setModalMode(null)
    setActiveId(null)
    setSaveError(null)
  }

  const handleSave = async () => {
    setSaving(true)
    setSaveError(null)
    try {
      const payload = {
        entityFrom: form.entityFrom,
        entityTo: form.entityTo,
        transactionType: form.transactionType,
        amount: Number(form.amount) || 0,
        currency: form.currency,
        date: form.date,
        status: form.status,
        description: form.description,
        reference: form.reference,
      }
      if (modalMode === 'edit' && activeId) {
        await FinanceService.updateIntercompanyTransaction(activeId, payload)
      } else {
        await FinanceService.createIntercompanyTransaction(payload)
      }
      closeModal()
      setReloadKey((k) => k + 1)
    } catch (e: any) {
      setSaveError(e?.message || 'Failed to save transaction')
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await FinanceService.getIntercompany()
        if (cancelled) return
        const receivables: any[] = Array.isArray(data?.receivables) ? data.receivables : []
        const payables: any[] = Array.isArray(data?.payables) ? data.payables : []

        const mapRow = (
          r: any,
          i: number,
          type: 'sale' | 'purchase',
        ): IntercompanyTransaction => ({
          id: String(r.id ?? `${type}-${i}`),
          transactionNumber: String(r.reference ?? r.id ?? ''),
          transactionDate: String(r.date ?? r.transactionDate ?? ''),
          fromCompany: type === 'sale' ? 'This Company' : String(r.party ?? ''),
          toCompany: type === 'sale' ? String(r.party ?? '') : 'This Company',
          transactionType: type,
          amount: Number(r.amount) || 0,
          currency: String(r.currency ?? 'INR'),
          status: 'posted',
          description: String(r.description ?? r.reference ?? ''),
          eliminationStatus: 'pending',
        })

        const rows: IntercompanyTransaction[] = [
          ...receivables.map((r, i) => mapRow(r, i, 'sale')),
          ...payables.map((r, i) => mapRow(r, i, 'purchase')),
        ]
        setTransactions(rows)
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message || 'Failed to load intercompany transactions')
          setTransactions([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const filteredTransactions = transactions.filter(txn => {
    const matchesSearch =
      txn.transactionNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.fromCompany.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.toCompany.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || txn.status === statusFilter
    const matchesType = typeFilter === 'all' || txn.transactionType === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'approved': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'posted': return 'bg-green-100 text-green-700 border-green-200'
      case 'reconciled': return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'eliminated': return 'bg-gray-100 text-gray-700 border-gray-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getTypeBadge = (type: string) => {
    const colors = {
      sale: 'bg-green-100 text-green-700',
      purchase: 'bg-blue-100 text-blue-700',
      transfer: 'bg-purple-100 text-purple-700',
      loan: 'bg-orange-100 text-orange-700',
      service: 'bg-cyan-100 text-cyan-700'
    }
    return colors[type as keyof typeof colors]
  }

  const totalTransactions = transactions.length
  const pendingElimination = transactions.filter(t => t.eliminationStatus === 'pending').length
  const totalValue = transactions.reduce((sum, t) => sum + t.amount, 0)

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 px-3 py-2">
      <div className="w-full space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Inter-company Transactions</h1>
            <p className="text-gray-600 mt-1">Manage transactions between group companies</p>
            {loading && <p className="text-sm text-gray-500 mt-1">Loading…</p>}
            {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md"
          >
            <Plus className="h-5 w-5" />
            New Transaction
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-5 border border-blue-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Transactions</p>
                <p className="text-2xl font-bold text-blue-900 mt-1">{totalTransactions}</p>
                <p className="text-xs text-blue-700 mt-1">This period</p>
              </div>
              <ArrowLeftRight className="h-10 w-10 text-blue-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-5 border border-green-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Total Value</p>
                <p className="text-2xl font-bold text-green-900 mt-1">{formatCurrency(totalValue)}</p>
                <p className="text-xs text-green-700 mt-1">Aggregate amount</p>
              </div>
              <DollarSign className="h-10 w-10 text-green-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-5 border border-orange-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Pending Elimination</p>
                <p className="text-2xl font-bold text-orange-900 mt-1">{pendingElimination}</p>
                <p className="text-xs text-orange-700 mt-1">Requires action</p>
              </div>
              <AlertTriangle className="h-10 w-10 text-orange-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-5 border border-purple-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Companies</p>
                <p className="text-2xl font-bold text-purple-900 mt-1">6</p>
                <p className="text-xs text-purple-700 mt-1">Active entities</p>
              </div>
              <Building2 className="h-10 w-10 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="all">All Types</option>
              <option value="sale">Sale</option>
              <option value="purchase">Purchase</option>
              <option value="transfer">Transfer</option>
              <option value="loan">Loan</option>
              <option value="service">Service</option>
            </select>

            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="posted">Posted</option>
              <option value="reconciled">Reconciled</option>
            </select>

            <button
              onClick={() => exportToCsv('intercompany-transactions', filteredTransactions as unknown as Record<string, unknown>[])}
              disabled={filteredTransactions.length === 0}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {filteredTransactions.map((txn) => (
            <div key={txn.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-start gap-2">
                  <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                    <ArrowLeftRight className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{txn.transactionNumber}</h3>
                    <p className="text-sm text-gray-600">{txn.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(txn.status)}`}>
                        {txn.status.toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeBadge(txn.transactionType)}`}>
                        {txn.transactionType.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Amount</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(txn.amount)}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-xs text-blue-600 mb-1">From Company</p>
                  <p className="font-semibold text-blue-900">{txn.fromCompany}</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-3 flex items-center justify-center">
                  <ArrowLeftRight className="h-6 w-6 text-purple-600" />
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-xs text-green-600 mb-1">To Company</p>
                  <p className="font-semibold text-green-900">{txn.toCompany}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {new Date(txn.transactionDate).toLocaleDateString('en-IN')}
                  </span>
                  <span>Elimination: {txn.eliminationStatus.replace('_', ' ')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                    <Eye className="h-4 w-4 text-gray-600" />
                    <span className="text-gray-700">View</span>
                  </button>
                  <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                    <Edit className="h-4 w-4 text-gray-600" />
                    <span className="text-gray-700">Edit</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Intercompany Transactions Ledger (managed) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Recorded Intercompany Transactions</h2>
              <p className="text-sm text-gray-600">Create, view and edit intercompany entries</p>
              {ledgerLoading && <p className="text-sm text-gray-500 mt-1">Loading…</p>}
              {ledgerError && <p className="text-sm text-red-600 mt-1">{ledgerError}</p>}
            </div>
            <button
              onClick={openCreate}
              className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
            >
              <Plus className="h-4 w-4" />
              New Transaction
            </button>
          </div>

          {ledger.length === 0 && !ledgerLoading ? (
            <p className="text-sm text-gray-500 py-4 text-center">No intercompany transactions recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-600 border-b border-gray-200">
                    <th className="py-2 pr-3 font-medium">Reference</th>
                    <th className="py-2 pr-3 font-medium">From</th>
                    <th className="py-2 pr-3 font-medium">To</th>
                    <th className="py-2 pr-3 font-medium">Type</th>
                    <th className="py-2 pr-3 font-medium">Date</th>
                    <th className="py-2 pr-3 font-medium text-right">Amount</th>
                    <th className="py-2 pr-3 font-medium">Status</th>
                    <th className="py-2 pr-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {ledger.map((row) => (
                    <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2 pr-3 font-medium text-gray-900">{row.reference || '—'}</td>
                      <td className="py-2 pr-3 text-gray-700">{row.entityFrom}</td>
                      <td className="py-2 pr-3 text-gray-700">{row.entityTo}</td>
                      <td className="py-2 pr-3 text-gray-700">{row.transactionType}</td>
                      <td className="py-2 pr-3 text-gray-700">{row.date ? new Date(row.date).toLocaleDateString('en-IN') : '—'}</td>
                      <td className="py-2 pr-3 text-right font-semibold text-gray-900">{formatCurrency(row.amount)}</td>
                      <td className="py-2 pr-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(row.status)}`}>
                          {(row.status || '').toUpperCase()}
                        </span>
                      </td>
                      <td className="py-2 pr-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openView(row.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-xs"
                          >
                            <Eye className="h-4 w-4 text-gray-600" />
                            <span className="text-gray-700">View</span>
                          </button>
                          <button
                            onClick={() => openEdit(row.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-xs"
                          >
                            <Edit className="h-4 w-4 text-gray-600" />
                            <span className="text-gray-700">Edit</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create / Edit / View Modal */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {modalMode === 'create' && 'New Intercompany Transaction'}
                {modalMode === 'edit' && 'Edit Intercompany Transaction'}
                {modalMode === 'view' && 'Intercompany Transaction'}
              </h3>
              <button onClick={closeModal} className="p-1 rounded hover:bg-gray-100">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="px-5 py-4 space-y-3">
              {saveError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{saveError}</div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Entity From</label>
                  <input
                    type="text"
                    value={form.entityFrom}
                    disabled={modalMode === 'view'}
                    onChange={(e) => setForm({ ...form, entityFrom: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Entity To</label>
                  <input
                    type="text"
                    value={form.entityTo}
                    disabled={modalMode === 'view'}
                    onChange={(e) => setForm({ ...form, entityTo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Type</label>
                  <select
                    value={form.transactionType}
                    disabled={modalMode === 'view'}
                    onChange={(e) => setForm({ ...form, transactionType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                  >
                    <option value="sale">Sale</option>
                    <option value="purchase">Purchase</option>
                    <option value="transfer">Transfer</option>
                    <option value="loan">Loan</option>
                    <option value="service">Service</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={form.status}
                    disabled={modalMode === 'view'}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="posted">Posted</option>
                    <option value="reconciled">Reconciled</option>
                    <option value="eliminated">Eliminated</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                  <input
                    type="number"
                    value={form.amount}
                    disabled={modalMode === 'view'}
                    onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                  <input
                    type="text"
                    value={form.currency}
                    disabled={modalMode === 'view'}
                    onChange={(e) => setForm({ ...form, currency: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={form.date}
                    disabled={modalMode === 'view'}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reference</label>
                  <input
                    type="text"
                    value={form.reference}
                    disabled={modalMode === 'view'}
                    onChange={(e) => setForm({ ...form, reference: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={form.description}
                  disabled={modalMode === 'view'}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-200">
              <button
                onClick={closeModal}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
              >
                {modalMode === 'view' ? 'Close' : 'Cancel'}
              </button>
              {modalMode !== 'view' && (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 text-sm disabled:opacity-50"
                >
                  {saving ? 'Saving…' : modalMode === 'edit' ? 'Update' : 'Create'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
