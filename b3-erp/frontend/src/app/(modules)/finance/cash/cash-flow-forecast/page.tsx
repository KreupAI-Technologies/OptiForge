'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  ArrowUpCircle,
  ArrowDownCircle,
  BarChart3,
  Download,
  RefreshCw,
  Settings,
  AlertCircle,
  CheckCircle,
  Filter,
  Save,
  Trash2,
  X
} from 'lucide-react'
import { FinanceService } from '@/services/finance.service'

interface ForecastPeriod {
  date: string
  openingBalance: number
  expectedReceipts: {
    sales: number
    collections: number
    otherIncome: number
    total: number
  }
  expectedPayments: {
    suppliers: number
    salaries: number
    operating: number
    capex: number
    total: number
  }
  netCashFlow: number
  closingBalance: number
  status: 'surplus' | 'deficit' | 'critical'
}

interface Scenario {
  name: string
  type: 'optimistic' | 'base' | 'pessimistic'
  assumptions: {
    salesGrowth: number
    collectionEfficiency: number
    paymentDelay: number
  }
}

export default function CashFlowForecastPage() {
  const [forecastHorizon, setForecastHorizon] = useState('90')
  const [selectedScenario, setSelectedScenario] = useState<'optimistic' | 'base' | 'pessimistic'>('base')

  const scenarios: Scenario[] = [
    {
      name: 'Optimistic',
      type: 'optimistic',
      assumptions: {
        salesGrowth: 15,
        collectionEfficiency: 95,
        paymentDelay: 10
      }
    },
    {
      name: 'Base Case',
      type: 'base',
      assumptions: {
        salesGrowth: 10,
        collectionEfficiency: 85,
        paymentDelay: 5
      }
    },
    {
      name: 'Pessimistic',
      type: 'pessimistic',
      assumptions: {
        salesGrowth: 5,
        collectionEfficiency: 75,
        paymentDelay: 0
      }
    }
  ]

  const [forecast, setForecast] = useState<ForecastPeriod[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  // Saved forecast scenarios (real backend)
  const [savedScenarios, setSavedScenarios] = useState<any[]>([])
  const [scenariosKey, setScenariosKey] = useState(0)
  const [saveModalOpen, setSaveModalOpen] = useState(false)
  const [scenarioName, setScenarioName] = useState('')
  const [savingScenario, setSavingScenario] = useState(false)
  const [scenarioError, setScenarioError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const data = await FinanceService.getForecastScenarios()
        if (!cancelled) setSavedScenarios(Array.isArray(data) ? data : [])
      } catch {
        if (!cancelled) setSavedScenarios([])
      }
    })()
    return () => {
      cancelled = true
    }
  }, [scenariosKey])

  // Convert selected horizon (days) -> months for the scenario payload
  const horizonMonths = Math.max(1, Math.round(Number(forecastHorizon) / 30))
  const activeAssumptions =
    scenarios.find((s) => s.type === selectedScenario)?.assumptions ??
    scenarios[1].assumptions

  const handleSaveScenario = async () => {
    if (!scenarioName.trim()) {
      setScenarioError('Scenario name is required.')
      return
    }
    setSavingScenario(true)
    setScenarioError(null)
    try {
      await FinanceService.createForecastScenario({
        name: scenarioName.trim(),
        assumptions: {
          scenarioType: selectedScenario,
          horizonDays: Number(forecastHorizon),
          collectionEfficiency: activeAssumptions.collectionEfficiency,
          paymentDelay: activeAssumptions.paymentDelay,
        },
        horizonMonths,
        growthRate: activeAssumptions.salesGrowth,
      })
      setSaveModalOpen(false)
      setScenarioName('')
      setScenariosKey((k) => k + 1)
    } catch (err) {
      setScenarioError(err instanceof Error ? err.message : 'Failed to save scenario')
    } finally {
      setSavingScenario(false)
    }
  }

  const handleApplyScenario = (scenario: any) => {
    const a = scenario?.assumptions ?? {}
    const days = Number(a.horizonDays ?? (scenario?.horizonMonths ? scenario.horizonMonths * 30 : 0))
    if (days) {
      // Snap to the nearest available horizon option
      const options = [30, 60, 90, 180, 365]
      const nearest = options.reduce((prev, cur) =>
        Math.abs(cur - days) < Math.abs(prev - days) ? cur : prev,
      )
      setForecastHorizon(String(nearest))
    }
    const type = a.scenarioType as 'optimistic' | 'base' | 'pessimistic' | undefined
    if (type === 'optimistic' || type === 'base' || type === 'pessimistic') {
      setSelectedScenario(type)
    }
  }

  const handleDeleteScenario = async (id: string) => {
    try {
      await FinanceService.deleteForecastScenario(id)
      setScenariosKey((k) => k + 1)
    } catch {
      /* keep UI intact on failure */
    }
  }

  const loadForecast = useCallback(async () => {
    setIsLoading(true)
    setLoadError(null)
    try {
      const res = (await FinanceService.getCashFlowReport()) as any
      const rows: any[] = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res)
          ? res
          : []
      let running = Number(res?.openingBalance ?? res?.summary?.openingBalance ?? 0)
      const periods: ForecastPeriod[] = rows.map((r) => {
        const openingBalance = Number(r.openingBalance ?? running)
        const sales = Number(r.sales ?? r.salesReceipts ?? 0)
        const collections = Number(r.collections ?? r.arCollections ?? 0)
        const otherIncome = Number(r.otherIncome ?? 0)
        const receiptsTotal = Number(
          r.totalReceipts ?? r.inflow ?? sales + collections + otherIncome,
        )
        const suppliers = Number(r.suppliers ?? r.supplierPayments ?? 0)
        const salaries = Number(r.salaries ?? 0)
        const operating = Number(r.operating ?? r.operatingExpenses ?? 0)
        const capex = Number(r.capex ?? r.capitalExpenditure ?? 0)
        const paymentsTotal = Number(
          r.totalPayments ?? r.outflow ?? suppliers + salaries + operating + capex,
        )
        const netCashFlow = Number(r.netCashFlow ?? receiptsTotal - paymentsTotal)
        const closingBalance = Number(r.closingBalance ?? openingBalance + netCashFlow)
        running = closingBalance
        const status: ForecastPeriod['status'] =
          closingBalance < 0 ? 'critical' : netCashFlow < 0 ? 'deficit' : 'surplus'
        return {
          date: r.date ?? r.period ?? r.periodStart ?? '',
          openingBalance,
          expectedReceipts: { sales, collections, otherIncome, total: receiptsTotal },
          expectedPayments: { suppliers, salaries, operating, capex, total: paymentsTotal },
          netCashFlow,
          closingBalance,
          status,
        }
      })
      setForecast(periods)
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load cash flow forecast')
      setForecast([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadForecast()
  }, [loadForecast])

  const handleExportCsv = () => {
    const headers = [
      'Period', 'Opening Balance', 'Sales Receipts', 'AR Collections', 'Other Income',
      'Total Receipts', 'Supplier Payments', 'Salaries', 'Operating', 'Capex',
      'Total Payments', 'Net Cash Flow', 'Closing Balance', 'Status',
    ]
    const escape = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`
    const rows = forecast.map((p) => [
      p.date, p.openingBalance, p.expectedReceipts.sales, p.expectedReceipts.collections,
      p.expectedReceipts.otherIncome, p.expectedReceipts.total, p.expectedPayments.suppliers,
      p.expectedPayments.salaries, p.expectedPayments.operating, p.expectedPayments.capex,
      p.expectedPayments.total, p.netCashFlow, p.closingBalance, p.status,
    ].map(escape).join(','))
    const csv = [headers.map(escape).join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `cash-flow-forecast-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

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
      case 'surplus':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'deficit':
        return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'critical':
        return 'bg-red-100 text-red-700 border-red-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const currentBalance = forecast.length > 0 ? forecast[0].openingBalance : 0
  const minCashBalance = forecast.length > 0 ? Math.min(...forecast.map(p => p.closingBalance)) : 0
  const maxCashBalance = forecast.length > 0 ? Math.max(...forecast.map(p => p.closingBalance)) : 0
  const deficitPeriods = forecast.filter(p => p.status === 'deficit').length

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-gray-50 via-cyan-50 to-blue-50">
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="w-full p-3">
          <div className="w-full space-y-3">
            {isLoading && (
              <div className="rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm text-cyan-700">
                Loading cash flow forecast…
              </div>
            )}
            {loadError && !isLoading && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {loadError}
              </div>
            )}
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Cash Flow Forecasting</h1>
                <p className="text-gray-600 mt-1">Project future cash positions and plan liquidity management</p>
              </div>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all">
                  <Settings className="h-5 w-5" />
                  Assumptions
                </button>
                <button
                  onClick={loadForecast}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:from-cyan-700 hover:to-blue-700 transition-all shadow-md disabled:opacity-50"
                >
                  <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh Forecast
                </button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-5 border border-blue-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Current Balance</p>
                    <p className="text-2xl font-bold text-blue-900 mt-1">{formatCurrency(currentBalance)}</p>
                    <p className="text-xs text-blue-700 mt-1">As of today</p>
                  </div>
                  <DollarSign className="h-10 w-10 text-blue-600" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-5 border border-green-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Projected Peak</p>
                    <p className="text-2xl font-bold text-green-900 mt-1">{formatCurrency(maxCashBalance)}</p>
                    <p className="text-xs text-green-700 mt-1">Highest balance</p>
                  </div>
                  <TrendingUp className="h-10 w-10 text-green-600" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-5 border border-orange-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-600">Projected Low</p>
                    <p className="text-2xl font-bold text-orange-900 mt-1">{formatCurrency(minCashBalance)}</p>
                    <p className="text-xs text-orange-700 mt-1">Lowest balance</p>
                  </div>
                  <TrendingDown className="h-10 w-10 text-orange-600" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-5 border border-purple-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">Deficit Periods</p>
                    <p className="text-2xl font-bold text-purple-900 mt-1">{deficitPeriods}</p>
                    <p className="text-xs text-purple-700 mt-1">Out of {forecast.length} weeks</p>
                  </div>
                  <AlertCircle className="h-10 w-10 text-purple-600" />
                </div>
              </div>
            </div>

            {/* Scenario Selection */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900">Forecast Scenarios</h3>
                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-gray-400" />
                  <select
                    value={forecastHorizon}
                    onChange={(e) => setForecastHorizon(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="30">30 Days</option>
                    <option value="60">60 Days</option>
                    <option value="90">90 Days</option>
                    <option value="180">180 Days</option>
                    <option value="365">1 Year</option>
                  </select>
                  <button
                    onClick={() => {
                      setScenarioName('')
                      setScenarioError(null)
                      setSaveModalOpen(true)
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <Save className="h-4 w-4" />
                    Save Scenario
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {scenarios.map((scenario) => (
                  <div
                    key={scenario.type}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedScenario === scenario.type
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    onClick={() => setSelectedScenario(scenario.type)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900">{scenario.name}</h4>
                      {selectedScenario === scenario.type && (
                        <CheckCircle className="h-5 w-5 text-blue-600" />
                      )}
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Sales Growth:</span>
                        <span className="font-medium text-gray-900">+{scenario.assumptions.salesGrowth}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Collection:</span>
                        <span className="font-medium text-gray-900">{scenario.assumptions.collectionEfficiency}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payment Delay:</span>
                        <span className="font-medium text-gray-900">{scenario.assumptions.paymentDelay} days</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Saved Scenarios */}
              <div className="mt-4 border-t border-gray-200 pt-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-gray-900">Saved Scenarios</h4>
                  <span className="text-xs text-gray-500">{savedScenarios.length} saved</span>
                </div>
                {savedScenarios.length === 0 ? (
                  <p className="text-sm text-gray-400">
                    No saved scenarios yet. Use “Save Scenario” to capture the current forecast parameters.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {savedScenarios.map((sc: any) => (
                      <div key={sc.id} className="border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow">
                        <div className="flex items-start justify-between mb-2">
                          <p className="font-semibold text-gray-900">{sc.name}</p>
                          <button
                            onClick={() => handleDeleteScenario(sc.id)}
                            title="Delete scenario"
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="space-y-1 text-xs text-gray-600">
                          <div className="flex justify-between">
                            <span>Growth Rate:</span>
                            <span className="font-medium text-gray-900">{sc.growthRate ?? '—'}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Horizon:</span>
                            <span className="font-medium text-gray-900">{sc.horizonMonths ?? '—'} months</span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleApplyScenario(sc)}
                          className="mt-2 w-full px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-sm font-medium"
                        >
                          Apply
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Forecast Timeline */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Weekly Cash Flow Forecast</h2>
                  <button
                    onClick={handleExportCsv}
                    disabled={forecast.length === 0}
                    className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Download className="h-4 w-4" />
                    Export
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-3">
                {forecast.map((period, index) => (
                  <div key={index} className="border-2 border-gray-200 rounded-xl p-3 hover:shadow-lg transition-shadow">
                    {/* Period Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-6 w-6 text-blue-600" />
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Week of {new Date(period.date).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })}
                          </h3>
                          <p className="text-sm text-gray-600">Opening: {formatCurrency(period.openingBalance)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(period.status)}`}>
                          {period.status === 'surplus' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                          {period.status.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Cash Flow Details */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
                      {/* Receipts */}
                      <div className="bg-green-50 rounded-lg p-3">
                        <h4 className="text-sm font-semibold text-green-800 mb-3 flex items-center gap-2">
                          <ArrowDownCircle className="h-5 w-5" />
                          Expected Receipts
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-700">Sales Receipts:</span>
                            <span className="font-medium text-gray-900">{formatCurrency(period.expectedReceipts.sales)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-700">AR Collections:</span>
                            <span className="font-medium text-gray-900">{formatCurrency(period.expectedReceipts.collections)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-700">Other Income:</span>
                            <span className="font-medium text-gray-900">{formatCurrency(period.expectedReceipts.otherIncome)}</span>
                          </div>
                          <div className="flex justify-between pt-2 border-t border-green-200">
                            <span className="font-semibold text-green-800">Total Receipts:</span>
                            <span className="font-bold text-green-800">{formatCurrency(period.expectedReceipts.total)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Payments */}
                      <div className="bg-red-50 rounded-lg p-3">
                        <h4 className="text-sm font-semibold text-red-800 mb-3 flex items-center gap-2">
                          <ArrowUpCircle className="h-5 w-5" />
                          Expected Payments
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-700">Supplier Payments:</span>
                            <span className="font-medium text-gray-900">{formatCurrency(period.expectedPayments.suppliers)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-700">Salaries & Wages:</span>
                            <span className="font-medium text-gray-900">{formatCurrency(period.expectedPayments.salaries)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-700">Operating Expenses:</span>
                            <span className="font-medium text-gray-900">{formatCurrency(period.expectedPayments.operating)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-700">Capital Expenditure:</span>
                            <span className="font-medium text-gray-900">{formatCurrency(period.expectedPayments.capex)}</span>
                          </div>
                          <div className="flex justify-between pt-2 border-t border-red-200">
                            <span className="font-semibold text-red-800">Total Payments:</span>
                            <span className="font-bold text-red-800">{formatCurrency(period.expectedPayments.total)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Net Cash Flow & Closing */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div className={`p-4 rounded-lg ${period.netCashFlow >= 0 ? 'bg-blue-50' : 'bg-orange-50'}`}>
                        <p className="text-sm text-gray-600 mb-1">Net Cash Flow</p>
                        <p className={`text-2xl font-bold ${period.netCashFlow >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                          {period.netCashFlow >= 0 ? '+' : ''}{formatCurrency(period.netCashFlow)}
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-gradient-to-r from-purple-50 to-indigo-50">
                        <p className="text-sm text-gray-600 mb-1">Projected Closing Balance</p>
                        <p className="text-2xl font-bold text-purple-900">{formatCurrency(period.closingBalance)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Scenario Modal */}
      {saveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Save Forecast Scenario</h3>
              <button onClick={() => setSaveModalOpen(false)} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              {scenarioError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {scenarioError}
                </div>
              )}
              <label className="block text-sm">
                <span className="text-gray-700">Scenario Name</span>
                <input
                  value={scenarioName}
                  onChange={(e) => setScenarioName(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Q3 Base Case"
                />
              </label>
              <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-600">Base scenario:</span>
                  <span className="font-medium text-gray-900 capitalize">{selectedScenario}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Growth Rate:</span>
                  <span className="font-medium text-gray-900">{activeAssumptions.salesGrowth}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Horizon:</span>
                  <span className="font-medium text-gray-900">
                    {forecastHorizon} days ({horizonMonths} months)
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-gray-200">
              <button onClick={() => setSaveModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                Cancel
              </button>
              <button
                onClick={handleSaveScenario}
                disabled={savingScenario || !scenarioName.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
              >
                {savingScenario ? 'Saving…' : 'Save Scenario'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
