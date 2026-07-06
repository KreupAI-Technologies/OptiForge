'use client'

import { useState, useEffect } from 'react'
import { FinanceService } from '@/services/finance.service'
import {
  Building2,
  PieChart,
  DollarSign,
  TrendingUp,
  BarChart3,
  Download,
  RefreshCw,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

interface ConsolidatedEntity {
  name: string
  revenue: number
  expenses: number
  assets: number
  liabilities: number
  equity: number
  netIncome: number
}

export default function FinancialConsolidationPage() {
  const [entities, setEntities] = useState<ConsolidatedEntity[]>([])
  const [eliminations, setEliminations] = useState({ revenue: 0, expenses: 0, assets: 0, liabilities: 0 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await FinanceService.getConsolidation()
        if (cancelled) return
        const byType: any[] = Array.isArray(data?.balancesByType) ? data.balancesByType : []

        // Group balances into a single consolidated group entity by account type.
        const sumType = (predicate: (t: string) => boolean) =>
          byType
            .filter((b) => predicate(String(b.type || '').toUpperCase()))
            .reduce((s, b) => s + (Number(b.balance) || 0), 0)

        const revenue = sumType((t) => t.includes('REVENUE') || t.includes('INCOME'))
        const expenses = sumType((t) => t.includes('EXPENSE'))
        const assets = sumType((t) => t.includes('ASSET'))
        const liabilities = sumType((t) => t.includes('LIABILIT'))
        const equity = sumType((t) => t.includes('EQUITY'))

        const entity: ConsolidatedEntity = {
          name: 'Consolidated Group',
          revenue,
          expenses,
          assets,
          liabilities,
          equity,
          netIncome: revenue - expenses,
        }

        const ic = data?.intercompany ?? {}
        setEliminations({
          revenue: 0,
          expenses: 0,
          assets: Number(ic.openReceivable) || 0,
          liabilities: Number(ic.openPayable) || 0,
        })
        setEntities(revenue || expenses || assets || liabilities || equity ? [entity] : [])
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message || 'Failed to load consolidation')
          setEntities([])
          setEliminations({ revenue: 0, expenses: 0, assets: 0, liabilities: 0 })
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const consolidated = {
    revenue: entities.reduce((sum, e) => sum + e.revenue, 0) - eliminations.revenue,
    expenses: entities.reduce((sum, e) => sum + e.expenses, 0) - eliminations.expenses,
    assets: entities.reduce((sum, e) => sum + e.assets, 0) - eliminations.assets,
    liabilities: entities.reduce((sum, e) => sum + e.liabilities, 0) - eliminations.liabilities,
    equity: entities.reduce((sum, e) => sum + e.equity, 0),
    netIncome: entities.reduce((sum, e) => sum + e.netIncome, 0) - (eliminations.revenue - eliminations.expenses)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      notation: 'compact',
      compactDisplay: 'short'
    }).format(amount)
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-violet-50 to-purple-50 px-3 py-2">
      <div className="w-full space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Financial Consolidation</h1>
            <p className="text-gray-600 mt-1">Consolidated financial statements for group companies</p>
            {loading && <p className="text-sm text-gray-500 mt-1">Loading…</p>}
            {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
              <Download className="h-5 w-5" />
              Export Report
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg hover:from-violet-700 hover:to-purple-700 shadow-md">
              <RefreshCw className="h-5 w-5" />
              Run Consolidation
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          {[
            { label: 'Consolidated Revenue', value: consolidated.revenue, icon: DollarSign, color: 'blue' },
            { label: 'Consolidated Assets', value: consolidated.assets, icon: Building2, color: 'green' },
            { label: 'Net Income', value: consolidated.netIncome, icon: TrendingUp, color: 'purple' },
            { label: 'Total Equity', value: consolidated.equity, icon: PieChart, color: 'orange' }
          ].map((stat, idx) => (
            <div key={idx} className={`bg-gradient-to-br from-${stat.color}-50 to-${stat.color}-100 rounded-lg p-5 border border-${stat.color}-200 shadow-sm`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium text-${stat.color}-600`}>{stat.label}</p>
                  <p className={`text-2xl font-bold text-${stat.color}-900 mt-1`}>{formatCurrency(stat.value)}</p>
                </div>
                <stat.icon className={`h-10 w-10 text-${stat.color}-600`} />
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Consolidated Income Statement</h2>
          </div>
          <div className="p-6">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">Entity</th>
                  <th className="px-3 py-2 text-right text-sm font-semibold text-gray-700">Revenue</th>
                  <th className="px-3 py-2 text-right text-sm font-semibold text-gray-700">Expenses</th>
                  <th className="px-3 py-2 text-right text-sm font-semibold text-gray-700">Net Income</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {entities.map((entity, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-3 py-2 font-medium text-gray-900">{entity.name}</td>
                    <td className="px-3 py-2 text-right font-medium text-gray-900">{formatCurrency(entity.revenue)}</td>
                    <td className="px-3 py-2 text-right font-medium text-orange-600">{formatCurrency(entity.expenses)}</td>
                    <td className="px-3 py-2 text-right font-medium text-green-600">{formatCurrency(entity.netIncome)}</td>
                  </tr>
                ))}
                <tr className="bg-yellow-50 font-semibold">
                  <td className="px-3 py-2">Eliminations</td>
                  <td className="px-3 py-2 text-right text-red-600">({formatCurrency(eliminations.revenue)})</td>
                  <td className="px-3 py-2 text-right text-green-600">({formatCurrency(eliminations.expenses)})</td>
                  <td className="px-3 py-2 text-right text-red-600">({formatCurrency(eliminations.revenue - eliminations.expenses)})</td>
                </tr>
                <tr className="bg-violet-100 font-bold border-t-2 border-violet-300">
                  <td className="px-3 py-2 text-violet-900">Consolidated Total</td>
                  <td className="px-3 py-2 text-right text-violet-900">{formatCurrency(consolidated.revenue)}</td>
                  <td className="px-3 py-2 text-right text-violet-900">{formatCurrency(consolidated.expenses)}</td>
                  <td className="px-3 py-2 text-right text-violet-900">{formatCurrency(consolidated.netIncome)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Consolidated Balance Sheet</h2>
          </div>
          <div className="p-6">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">Entity</th>
                  <th className="px-3 py-2 text-right text-sm font-semibold text-gray-700">Assets</th>
                  <th className="px-3 py-2 text-right text-sm font-semibold text-gray-700">Liabilities</th>
                  <th className="px-3 py-2 text-right text-sm font-semibold text-gray-700">Equity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {entities.map((entity, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-3 py-2 font-medium text-gray-900">{entity.name}</td>
                    <td className="px-3 py-2 text-right font-medium text-blue-600">{formatCurrency(entity.assets)}</td>
                    <td className="px-3 py-2 text-right font-medium text-orange-600">{formatCurrency(entity.liabilities)}</td>
                    <td className="px-3 py-2 text-right font-medium text-green-600">{formatCurrency(entity.equity)}</td>
                  </tr>
                ))}
                <tr className="bg-yellow-50 font-semibold">
                  <td className="px-3 py-2">Eliminations</td>
                  <td className="px-3 py-2 text-right text-red-600">({formatCurrency(eliminations.assets)})</td>
                  <td className="px-3 py-2 text-right text-green-600">({formatCurrency(eliminations.liabilities)})</td>
                  <td className="px-3 py-2 text-right">-</td>
                </tr>
                <tr className="bg-violet-100 font-bold border-t-2 border-violet-300">
                  <td className="px-3 py-2 text-violet-900">Consolidated Total</td>
                  <td className="px-3 py-2 text-right text-violet-900">{formatCurrency(consolidated.assets)}</td>
                  <td className="px-3 py-2 text-right text-violet-900">{formatCurrency(consolidated.liabilities)}</td>
                  <td className="px-3 py-2 text-right text-violet-900">{formatCurrency(consolidated.equity)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
