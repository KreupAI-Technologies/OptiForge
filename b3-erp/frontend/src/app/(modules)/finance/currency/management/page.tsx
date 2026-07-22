'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  DollarSign,
  Globe,
  TrendingUp,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  ToggleLeft,
  ToggleRight,
  Trash2,
  CheckCircle
} from 'lucide-react'
import { FinanceService } from '@/services/finance.service'

interface Currency {
  id: string
  code: string
  name: string
  symbol: string
  decimalPlaces: number
  isBaseCurrency: boolean
  isActive: boolean
  currentRate: number
  lastUpdated: string
}

interface CurrencyForm {
  code: string
  name: string
  symbol: string
  decimalPlaces: string
  isBaseCurrency: boolean
  isActive: boolean
}

const EMPTY_FORM: CurrencyForm = {
  code: '',
  name: '',
  symbol: '',
  decimalPlaces: '2',
  isBaseCurrency: false,
  isActive: true,
}

export default function CurrencyManagementPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  // Add / edit currency modal
  const [showFormModal, setShowFormModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<CurrencyForm>(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Per-row action state
  const [rowBusyId, setRowBusyId] = useState<string | null>(null)

  // View details modal
  const [viewCurrency, setViewCurrency] = useState<Currency | null>(null)

  const reload = useCallback(() => setReloadKey(k => k + 1), [])

  const loadCurrencies = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [records, rates] = await Promise.all([
        FinanceService.getCurrencies(),
        // Preserve the exchange-rate display: build a rate lookup keyed by currency code.
        FinanceService.getExchangeRates().catch(() => []),
      ])

      // Rate lookup: 1 base = <rate> toCurrency, keyed by the target currency code.
      const rateByCode = new Map<string, { rate: number; effectiveDate: string }>()
      ;(Array.isArray(rates) ? rates : []).forEach((r: any) => {
        const toCode = r?.toCurrency ? String(r.toCurrency).toUpperCase() : ''
        const rate = Number(r?.rate)
        if (!toCode || !Number.isFinite(rate)) return
        const effectiveDate = r?.effectiveDate ? String(r.effectiveDate).slice(0, 10) : ''
        rateByCode.set(toCode, { rate, effectiveDate })
      })

      const mapped: Currency[] = (Array.isArray(records) ? records : []).map((rec: any) => {
        const code = String(rec?.code ?? '').toUpperCase()
        const isBase = Boolean(rec?.isBaseCurrency)
        const rateEntry = rateByCode.get(code)
        return {
          id: String(rec?.id ?? code),
          code,
          name: String(rec?.name ?? code),
          symbol: String(rec?.symbol ?? code),
          decimalPlaces: Number.isFinite(Number(rec?.decimalPlaces)) ? Number(rec.decimalPlaces) : 2,
          isBaseCurrency: isBase,
          isActive: rec?.isActive !== false,
          currentRate: isBase ? 1 : (rateEntry?.rate ?? 0),
          lastUpdated: rateEntry?.effectiveDate
            || (rec?.updatedAt ? String(rec.updatedAt).slice(0, 10) : ''),
        }
      })
      setCurrencies(mapped)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load currencies')
      setCurrencies([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCurrencies()
  }, [loadCurrencies, reloadKey])

  const openAddModal = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setFormError(null)
    setShowFormModal(true)
  }

  const openEditModal = (currency: Currency) => {
    setEditingId(currency.id)
    setForm({
      code: currency.code,
      name: currency.name,
      symbol: currency.symbol,
      decimalPlaces: String(currency.decimalPlaces),
      isBaseCurrency: currency.isBaseCurrency,
      isActive: currency.isActive,
    })
    setFormError(null)
    setShowFormModal(true)
  }

  const handleSubmitForm = async () => {
    const code = form.code.trim().toUpperCase()
    const name = form.name.trim()
    const symbol = form.symbol.trim()
    const decimalPlaces = Number(form.decimalPlaces)
    if (!code || !name || !symbol) {
      setFormError('Code, name and symbol are required.')
      return
    }
    if (!Number.isInteger(decimalPlaces) || decimalPlaces < 0 || decimalPlaces > 8) {
      setFormError('Decimal places must be an integer between 0 and 8.')
      return
    }
    const payload = {
      code,
      name,
      symbol,
      isBaseCurrency: form.isBaseCurrency,
      isActive: form.isActive,
      decimalPlaces,
    }
    setSubmitting(true)
    setFormError(null)
    try {
      if (editingId) {
        await FinanceService.updateCurrency(editingId, payload)
      } else {
        await FinanceService.createCurrency(payload)
      }
      setShowFormModal(false)
      reload()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save currency')
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleActive = async (currency: Currency) => {
    setRowBusyId(currency.id)
    setError(null)
    try {
      await FinanceService.updateCurrency(currency.id, { isActive: !currency.isActive })
      reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status')
    } finally {
      setRowBusyId(null)
    }
  }

  const handleDelete = async (currency: Currency) => {
    if (typeof window !== 'undefined' && !window.confirm(`Delete currency ${currency.code}?`)) return
    setRowBusyId(currency.id)
    setError(null)
    try {
      await FinanceService.deleteCurrency(currency.id)
      reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete currency')
    } finally {
      setRowBusyId(null)
    }
  }

  const handleExport = () => {
    if (filteredCurrencies.length === 0) return
    const rows = filteredCurrencies.map(c => ({
      Code: c.code,
      Name: c.name,
      Symbol: c.symbol,
      'Exchange Rate': c.currentRate.toFixed(6),
      'Decimal Places': c.decimalPlaces,
      'Base Currency': c.isBaseCurrency ? 'Yes' : 'No',
      Status: c.isActive ? 'Active' : 'Inactive',
      'Last Updated': c.lastUpdated,
    }))
    const headers = Object.keys(rows[0])
    const escape = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`
    const csv = [
      headers.join(','),
      ...rows.map(r => headers.map(h => escape((r as Record<string, unknown>)[h])).join(',')),
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `currencies-${new Date().getTime()}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const filteredCurrencies = currencies.filter(currency => {
    const matchesSearch =
      currency.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      currency.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' ? currency.isActive : !currency.isActive)
    return matchesSearch && matchesStatus
  })

  const activeCurrencies = currencies.filter(c => c.isActive).length
  const baseCurrency = currencies.find(c => c.isBaseCurrency)

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 px-3 py-2">
      <div className="w-full space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Currency Management</h1>
            <p className="text-gray-600 mt-1">Manage currencies and exchange rates for multi-currency transactions</p>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all shadow-md"
          >
            <Plus className="h-5 w-5" />
            Add Currency
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-5 border border-blue-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Base Currency</p>
                <p className="text-2xl font-bold text-blue-900 mt-1">{baseCurrency?.code || '—'}</p>
                <p className="text-xs text-blue-700 mt-1">{baseCurrency?.name || 'Not set'}</p>
              </div>
              <Globe className="h-10 w-10 text-blue-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-5 border border-green-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Active Currencies</p>
                <p className="text-2xl font-bold text-green-900 mt-1">{activeCurrencies}</p>
                <p className="text-xs text-green-700 mt-1">Out of {currencies.length}</p>
              </div>
              <DollarSign className="h-10 w-10 text-green-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-5 border border-purple-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Last Rate Update</p>
                <p className="text-2xl font-bold text-purple-900 mt-1">Today</p>
                <p className="text-xs text-purple-700 mt-1">{new Date().toLocaleDateString('en-IN')}</p>
              </div>
              <TrendingUp className="h-10 w-10 text-purple-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-5 border border-orange-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Update Frequency</p>
                <p className="text-2xl font-bold text-orange-900 mt-1">Daily</p>
                <p className="text-xs text-orange-700 mt-1">Automatic sync</p>
              </div>
              <CheckCircle className="h-10 w-10 text-orange-600" />
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
                  placeholder="Search by code or name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <button
              onClick={handleExport}
              disabled={filteredCurrencies.length === 0}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>

        {/* Loading / Error states */}
        {loading && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center text-gray-500">
            Loading currencies...
          </div>
        )}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl shadow-sm p-4">
            {error}
          </div>
        )}

        {/* Currency List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {!loading && filteredCurrencies.length === 0 && (
            <p className="text-center text-gray-500 py-6">No currencies found.</p>
          )}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">Currency</th>
                  <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">Symbol</th>
                  <th className="px-3 py-2 text-right text-sm font-semibold text-gray-700">Exchange Rate</th>
                  <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">Decimal Places</th>
                  <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">Last Updated</th>
                  <th className="px-3 py-2 text-center text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-3 py-2 text-center text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCurrencies.map((currency) => (
                  <tr key={currency.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg">
                          <Globe className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{currency.code}</p>
                          <p className="text-sm text-gray-600">{currency.name}</p>
                        </div>
                        {currency.isBaseCurrency && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                            Base
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <span className="text-lg font-semibold text-gray-900">{currency.symbol}</span>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {currency.currentRate.toFixed(currency.isBaseCurrency ? 4 : 6)}
                        </p>
                        <p className="text-xs text-gray-500">
                          1 {baseCurrency?.code || 'BASE'} = {currency.currentRate.toFixed(6)} {currency.code}
                        </p>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-gray-900">{currency.decimalPlaces}</td>
                    <td className="px-3 py-2 text-sm text-gray-600">
                      {currency.lastUpdated ? new Date(currency.lastUpdated).toLocaleDateString('en-IN') : '—'}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <button
                        onClick={() => handleToggleActive(currency)}
                        disabled={rowBusyId === currency.id}
                        title={currency.isActive ? 'Deactivate currency' : 'Activate currency'}
                        className="inline-flex items-center gap-1 disabled:opacity-50"
                      >
                        {currency.isActive ? (
                          <>
                            <ToggleRight className="h-5 w-5 text-green-600" />
                            <span className="text-xs font-medium text-green-700">Active</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="h-5 w-5 text-gray-400" />
                            <span className="text-xs font-medium text-gray-500">Inactive</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setViewCurrency(currency)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                          <Eye className="h-4 w-4 text-gray-600" />
                          <span className="text-gray-700">View</span>
                        </button>
                        <button
                          onClick={() => openEditModal(currency)}
                          disabled={rowBusyId === currency.id}
                          className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm disabled:opacity-50">
                          <Edit className="h-4 w-4 text-gray-600" />
                          <span className="text-gray-700">Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(currency)}
                          disabled={rowBusyId === currency.id}
                          className="inline-flex items-center gap-1.5 px-3 py-2 border border-red-200 rounded-lg hover:bg-red-50 text-sm disabled:opacity-50">
                          <Trash2 className="h-4 w-4 text-red-600" />
                          <span className="text-red-700">Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add / Edit Currency Modal */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              {editingId ? 'Edit Currency' : 'Add Currency'}
            </h3>
            {formError && (
              <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {formError}
              </div>
            )}
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Currency Code</label>
                <input
                  type="text"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  placeholder="USD"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="US Dollar"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">Symbol</label>
                  <input
                    type="text"
                    value={form.symbol}
                    onChange={(e) => setForm({ ...form, symbol: e.target.value })}
                    placeholder="$"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">Decimal Places</label>
                  <input
                    type="number"
                    min="0"
                    max="8"
                    step="1"
                    value={form.decimalPlaces}
                    onChange={(e) => setForm({ ...form, decimalPlaces: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex items-center gap-6 pt-1">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={form.isBaseCurrency}
                    onChange={(e) => setForm({ ...form, isBaseCurrency: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Base Currency
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Active
                </label>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowFormModal(false)}
                disabled={submitting}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitForm}
                disabled={submitting}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? 'Saving...' : editingId ? 'Save Changes' : 'Add Currency'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Currency Details Modal */}
      {viewCurrency && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {viewCurrency.code} — {viewCurrency.name}
              </h3>
              <span className="text-2xl font-semibold text-gray-700">{viewCurrency.symbol}</span>
            </div>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Exchange Rate</dt>
                <dd className="font-medium text-gray-900">{viewCurrency.currentRate.toFixed(6)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Decimal Places</dt>
                <dd className="font-medium text-gray-900">{viewCurrency.decimalPlaces}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Base Currency</dt>
                <dd className="font-medium text-gray-900">{viewCurrency.isBaseCurrency ? 'Yes' : 'No'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Status</dt>
                <dd className="font-medium text-gray-900">{viewCurrency.isActive ? 'Active' : 'Inactive'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Last Updated</dt>
                <dd className="font-medium text-gray-900">
                  {viewCurrency.lastUpdated ? new Date(viewCurrency.lastUpdated).toLocaleDateString('en-IN') : '—'}
                </dd>
              </div>
            </dl>
            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setViewCurrency(null)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
