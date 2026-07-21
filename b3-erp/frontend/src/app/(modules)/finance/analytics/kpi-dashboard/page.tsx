'use client'

import { useState, useEffect } from 'react'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Package,
  ShoppingCart,
  CreditCard,
  BarChart3,
  PieChart,
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { FinanceService } from '@/services/finance.service'

interface KPI {
  label: string
  value: string | number
  change: number
  trend: 'up' | 'down'
  target: number
  actual: number
  icon: any
  color: string
}

export default function KPIDashboardPage() {
  const [period, setPeriod] = useState('This Month')

  const [kpis, setKpis] = useState<KPI[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const dash = (await FinanceService.getAdvancedDashboard()) || {}
        const generalLedger = dash.generalLedger || {}
        const compliance = dash.compliance || {}
        const treasury = dash.treasury || {}
        const cashForecast = dash.cashForecast || {}

        const num = (v: any): number => (typeof v === 'number' && isFinite(v) ? v : 0)
        const fmt = (v: number): string =>
          new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            notation: 'compact',
          }).format(v)

        const cashPosition = num(treasury.cashPosition)
        const openReceivable = num(compliance.openReceivable)
        const openPayable = num(compliance.openPayable)
        const netProjected = num(cashForecast.netProjected)
        const totalDebit = num(generalLedger.totalDebit)
        const totalCredit = num(generalLedger.totalCredit)
        const postedJournalCount = num(generalLedger.postedJournalCount)

        const built: KPI[] = [
          { label: 'Cash Position', value: fmt(cashPosition), change: 0, trend: 'up', target: cashPosition || 1, actual: cashPosition, icon: DollarSign, color: 'blue' },
          { label: 'Open Receivable', value: fmt(openReceivable), change: 0, trend: 'up', target: openReceivable || 1, actual: openReceivable, icon: TrendingUp, color: 'green' },
          { label: 'Open Payable', value: fmt(openPayable), change: 0, trend: 'up', target: openPayable || 1, actual: openPayable, icon: CreditCard, color: 'orange' },
          { label: 'Net Cash Forecast', value: fmt(netProjected), change: 0, trend: netProjected >= 0 ? 'up' : 'down', target: netProjected || 1, actual: netProjected, icon: Activity, color: 'purple' },
          { label: 'Total Debit', value: fmt(totalDebit), change: 0, trend: 'up', target: totalDebit || 1, actual: totalDebit, icon: BarChart3, color: 'cyan' },
          { label: 'Total Credit', value: fmt(totalCredit), change: 0, trend: 'up', target: totalCredit || 1, actual: totalCredit, icon: PieChart, color: 'indigo' },
          { label: 'Posted Journals', value: postedJournalCount, change: 0, trend: 'up', target: postedJournalCount || 1, actual: postedJournalCount, icon: Package, color: 'teal' },
        ]
        if (mounted) setKpis(built)
      } catch (e: any) {
        if (mounted) {
          setError(e?.message || 'Failed to load KPI dashboard')
          setKpis([])
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  const getProgressColor = (actual: number, target: number) => {
    const percentage = (actual / target) * 100
    if (percentage >= 100) return 'bg-green-500'
    if (percentage >= 80) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 px-3 py-2">
      <div className="w-full space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Financial KPI Dashboard</h1>
            <p className="text-gray-600 mt-1">Monitor key performance indicators and metrics</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>This Month</option>
              <option>Last Month</option>
              <option>This Quarter</option>
              <option>This Year</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
          {kpis.map((kpi, idx) => {
            const Icon = kpi.icon
            const progress = (kpi.actual / kpi.target) * 100

            return (
              <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 rounded-lg bg-${kpi.color}-100`}>
                    <Icon className={`h-5 w-5 text-${kpi.color}-600`} />
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${kpi.trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                    {kpi.trend === 'up' ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3" />
                    )}
                    {Math.abs(kpi.change)}%
                  </div>
                </div>

                <div className="mb-3">
                  <p className="text-sm text-gray-600 mb-1">{kpi.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Progress to Target</span>
                    <span className="font-medium">{Math.min(progress, 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getProgressColor(kpi.actual, kpi.target)} transition-all`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Top Performing KPIs</h3>
            <div className="space-y-3">
              {kpis
                .filter(k => (k.actual / k.target) >= 1)
                .slice(0, 5)
                .map((kpi, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <kpi.icon className="h-4 w-4 text-green-600" />
                      </div>
                      <span className="font-medium text-gray-900">{kpi.label}</span>
                    </div>
                    <span className="text-green-700 font-semibold">{((kpi.actual / kpi.target) * 100).toFixed(0)}%</span>
                  </div>
                ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Needs Attention</h3>
            <div className="space-y-3">
              {kpis
                .filter(k => (k.actual / k.target) < 0.9)
                .slice(0, 5)
                .map((kpi, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <kpi.icon className="h-4 w-4 text-orange-600" />
                      </div>
                      <span className="font-medium text-gray-900">{kpi.label}</span>
                    </div>
                    <span className="text-orange-700 font-semibold">{((kpi.actual / kpi.target) * 100).toFixed(0)}%</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
