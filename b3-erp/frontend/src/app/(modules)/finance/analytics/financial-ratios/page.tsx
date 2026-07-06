'use client'

import { useState, useEffect } from 'react'
import {
  TrendingUp,
  Activity,
  BarChart3,
  PieChart,
  DollarSign,
  Target
} from 'lucide-react'
import { FinanceService } from '@/services/finance.service'

interface Ratio {
  name: string
  value: number
  benchmark: number
  formula: string
  interpretation: string
  category: string
}

// Local lookup for benchmark/formula/interpretation/category keyed by humanized ratio name.
const RATIO_META: Record<string, { benchmark: number; formula: string; interpretation: string; category: string }> = {
  'Current Ratio': { benchmark: 2.0, formula: 'Current Assets / Current Liabilities', interpretation: 'Liquidity position', category: 'Liquidity' },
  'Quick Ratio': { benchmark: 1.5, formula: '(Current Assets - Inventory) / Current Liabilities', interpretation: 'Short-term liquidity', category: 'Liquidity' },
  'Cash Ratio': { benchmark: 0.5, formula: 'Cash / Current Liabilities', interpretation: 'Cash position', category: 'Liquidity' },
  'Gross Profit Margin': { benchmark: 35.0, formula: '(Revenue - COGS) / Revenue × 100', interpretation: 'Gross margin', category: 'Profitability' },
  'Net Profit Margin': { benchmark: 18.0, formula: 'Net Income / Revenue × 100', interpretation: 'Net profitability', category: 'Profitability' },
  'Return on Assets (ROA)': { benchmark: 12.0, formula: 'Net Income / Total Assets × 100', interpretation: 'Asset utilization', category: 'Profitability' },
  'Return on Equity (ROE)': { benchmark: 20.0, formula: 'Net Income / Shareholders Equity × 100', interpretation: 'Return for shareholders', category: 'Profitability' },
  'Asset Turnover': { benchmark: 1.5, formula: 'Revenue / Total Assets', interpretation: 'Asset efficiency', category: 'Efficiency' },
  'Inventory Turnover': { benchmark: 6.0, formula: 'COGS / Average Inventory', interpretation: 'Inventory management', category: 'Efficiency' },
  'Receivables Turnover': { benchmark: 8.0, formula: 'Revenue / Average Receivables', interpretation: 'Collection efficiency', category: 'Efficiency' },
  'Debt-to-Equity': { benchmark: 1.0, formula: 'Total Debt / Total Equity', interpretation: 'Leverage', category: 'Leverage' },
  'Debt Ratio': { benchmark: 0.5, formula: 'Total Debt / Total Assets', interpretation: 'Financial risk', category: 'Leverage' },
  'Interest Coverage': { benchmark: 5.0, formula: 'EBIT / Interest Expense', interpretation: 'Debt service ability', category: 'Leverage' },
}

// Humanize an API key like "currentRatio" / "current_ratio" into "Current Ratio".
function humanizeKey(key: string): string {
  const spaced = key
    .replace(/_/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim()
  return spaced.replace(/\b\w/g, (c) => c.toUpperCase())
}

export default function FinancialRatiosPage() {
  const [ratios, setRatios] = useState<Ratio[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await FinanceService.getFinancialRatios()
        const flat: Ratio[] = []
        const walk = (obj: any) => {
          if (!obj || typeof obj !== 'object') return
          Object.entries(obj).forEach(([key, val]) => {
            if (typeof val === 'number' && isFinite(val)) {
              const name = humanizeKey(key)
              const meta = RATIO_META[name]
              flat.push({
                name,
                value: val,
                benchmark: meta?.benchmark ?? 0,
                formula: meta?.formula ?? '',
                interpretation: meta?.interpretation ?? '',
                category: meta?.category ?? 'Other',
              })
            } else if (val && typeof val === 'object' && !Array.isArray(val)) {
              // Nested groups like { liquidity: {...}, profitability: {...} }
              walk(val)
            }
          })
        }
        walk(res)
        if (mounted) setRatios(flat)
      } catch (e: any) {
        if (mounted) {
          setError(e?.message || 'Failed to load financial ratios')
          setRatios([])
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

  const categories = ['Liquidity', 'Profitability', 'Efficiency', 'Leverage']

  const getRatioStatus = (value: number, benchmark: number, category: string) => {
    const diff = value - benchmark
    const isGood = category === 'Leverage' ? diff <= 0 : diff >= 0
    return isGood ? 'good' : 'concern'
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50 px-3 py-2">
      <div className="w-full space-y-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Financial Ratios Analysis</h1>
          <p className="text-gray-600 mt-1">Comprehensive financial ratio analysis and benchmarking</p>
        </div>

        {categories.map((category) => (
          <div key={category} className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">{category} Ratios</h2>
            </div>
            <div className="p-6">
              <div className="space-y-2">
                {ratios
                  .filter(r => r.category === category)
                  .map((ratio, idx) => {
                    const status = getRatioStatus(ratio.value, ratio.benchmark, category)
                    return (
                      <div key={idx} className="border-2 border-gray-200 rounded-xl p-5">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{ratio.name}</h3>
                            <p className="text-sm text-gray-600 mt-1">{ratio.formula}</p>
                          </div>
                          <div className="text-right">
                            <p className={`text-3xl font-bold ${status === 'good' ? 'text-green-600' : 'text-orange-600'}`}>
                              {ratio.value.toFixed(2)}{ratio.name.includes('Margin') || ratio.name.includes('Return') || ratio.name.includes('ROA') || ratio.name.includes('ROE') ? '%' : ''}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-600 mb-1">Benchmark</p>
                            <p className="text-lg font-semibold text-gray-900">
                              {ratio.benchmark.toFixed(2)}{ratio.name.includes('Margin') || ratio.name.includes('Return') || ratio.name.includes('ROA') || ratio.name.includes('ROE') ? '%' : ''}
                            </p>
                          </div>
                          <div className={`rounded-lg p-3 ${status === 'good' ? 'bg-green-50' : 'bg-orange-50'}`}>
                            <p className={`text-xs mb-1 ${status === 'good' ? 'text-green-600' : 'text-orange-600'}`}>Status</p>
                            <p className={`text-lg font-semibold ${status === 'good' ? 'text-green-900' : 'text-orange-900'}`}>
                              {ratio.interpretation}
                            </p>
                          </div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-600 mb-2">
                          <span>vs Benchmark</span>
                          <span className={`font-medium ${status === 'good' ? 'text-green-600' : 'text-orange-600'}`}>
                            {((ratio.value / ratio.benchmark - 1) * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${status === 'good' ? 'bg-green-500' : 'bg-orange-500'}`}
                            style={{ width: `${Math.min((ratio.value / ratio.benchmark) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
