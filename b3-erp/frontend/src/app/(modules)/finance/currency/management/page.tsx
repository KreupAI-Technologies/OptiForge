'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  DollarSign,
  Globe,
  TrendingUp,
  TrendingDown,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  ToggleLeft,
  ToggleRight,
  CheckCircle,
  AlertCircle
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
  countries: string[]
}

const CURRENCY_META: Record<string, { name: string; symbol: string; countries: string[] }> = {
  INR: { name: 'Indian Rupee', symbol: '₹', countries: ['India'] },
  USD: { name: 'US Dollar', symbol: '$', countries: ['United States'] },
  EUR: { name: 'Euro', symbol: '€', countries: ['European Union'] },
  GBP: { name: 'British Pound', symbol: '£', countries: ['United Kingdom'] },
  JPY: { name: 'Japanese Yen', symbol: '¥', countries: ['Japan'] },
  AED: { name: 'UAE Dirham', symbol: 'د.إ', countries: ['United Arab Emirates'] },
  SGD: { name: 'Singapore Dollar', symbol: 'S$', countries: ['Singapore'] },
  CNY: { name: 'Chinese Yuan', symbol: '¥', countries: ['China'] },
}

export default function CurrencyManagementPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadCurrencies = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const rates = await FinanceService.getExchangeRates()
      // Build a currency list from the exchange-rate pairs.
      const map = new Map<string, Currency>()
      const addCurrency = (code: string, rate: number, effectiveDate: string, isBase: boolean) => {
        if (!code) return
        const meta = CURRENCY_META[code] || { name: code, symbol: code, countries: [] }
        if (!map.has(code)) {
          map.set(code, {
            id: code,
            code,
            name: meta.name,
            symbol: meta.symbol,
            decimalPlaces: code === 'JPY' ? 0 : 2,
            isBaseCurrency: isBase,
            isActive: true,
            currentRate: isBase ? 1 : rate,
            lastUpdated: effectiveDate,
            countries: meta.countries,
          })
        }
      }
      ;(Array.isArray(rates) ? rates : []).forEach((r: any) => {
        const effectiveDate = r?.effectiveDate ? String(r.effectiveDate).slice(0, 10) : ''
        addCurrency(r?.toCurrency, Number(r?.rate) || 0, effectiveDate, true)
        addCurrency(r?.fromCurrency, Number(r?.rate) ? 1 / Number(r.rate) : 0, effectiveDate, false)
      })
      setCurrencies(Array.from(map.values()))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load currencies')
      setCurrencies([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCurrencies()
  }, [loadCurrencies])

  const handleAddCurrency = async (data: any) => {
    try {
      await FinanceService.createExchangeRate(data)
      await loadCurrencies()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add currency')
    }
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
            onClick={() => handleAddCurrency({})}
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
                <p className="text-2xl font-bold text-blue-900 mt-1">{baseCurrency?.code}</p>
                <p className="text-xs text-blue-700 mt-1">{baseCurrency?.name}</p>
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

            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
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
                  <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">Countries</th>
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
                          1 {baseCurrency?.code} = {currency.currentRate.toFixed(6)} {currency.code}
                        </p>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-gray-900">{currency.decimalPlaces}</td>
                    <td className="px-3 py-2">
                      <p className="text-sm text-gray-900">{currency.countries.join(', ')}</p>
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-600">
                      {new Date(currency.lastUpdated).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <button className="inline-flex items-center gap-1">
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
                        <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                          <Eye className="h-4 w-4 text-gray-600" />
                          <span className="text-gray-700">View</span>
                        </button>
                        <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                          <Edit className="h-4 w-4 text-gray-600" />
                          <span className="text-gray-700">Edit</span>
                        </button>
                        <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                          <TrendingUp className="h-4 w-4 text-gray-600" />
                          <span className="text-gray-700">Trends</span>
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
    </div>
  )
}
