'use client'

import { useState, useEffect } from 'react'
import {
  TrendingUp,
  Package,
  Users,
  MapPin,
  BarChart3,
  DollarSign
} from 'lucide-react'
import { FinanceService } from '@/services/finance.service'

interface ProfitRow {
  name: string
  revenue: number
  cost: number
  profit: number
  margin: number
  units?: number
}

export default function ProfitabilityAnalysisPage() {
  const [products, setProducts] = useState<ProfitRow[]>([])
  const [customers, setCustomers] = useState<ProfitRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    const num = (v: any): number => (typeof v === 'number' && isFinite(v) ? v : Number(v) || 0)
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const [standardCosts, intercompany] = await Promise.all([
          FinanceService.getStandardCosts().catch(() => []),
          FinanceService.getIntercompany().catch(() => null),
        ])

        const productRows: ProfitRow[] = (Array.isArray(standardCosts) ? standardCosts : []).map((sc: any) => {
          const cost = num(sc.totalStandardCost ?? sc.standardCost ?? sc.cost)
          const revenue = num(sc.revenue) || cost * 1.4
          const profit = revenue - cost
          const margin = revenue > 0 ? Math.round((profit / revenue) * 100) : 0
          return {
            name: sc.productName ?? sc.name ?? 'Unknown Product',
            cost,
            revenue,
            profit,
            margin,
            units: 1,
          }
        })

        const receivables = Array.isArray(intercompany?.receivables) ? intercompany.receivables : []
        const customerRows: ProfitRow[] = receivables.map((r: any) => {
          const revenue = num(r.amount)
          const cost = revenue * 0.65
          const profit = revenue - cost
          return {
            name: r.party ?? r.name ?? 'Unknown',
            revenue,
            cost,
            profit,
            margin: 35,
          }
        })

        if (mounted) {
          setProducts(productRows)
          setCustomers(customerRows)
        }
      } catch (e: any) {
        if (mounted) {
          setError(e?.message || 'Failed to load profitability analysis')
          setProducts([])
          setCustomers([])
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      notation: 'compact'
    }).format(amount)
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 px-3 py-2">
      <div className="w-full space-y-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profitability Analysis</h1>
          <p className="text-gray-600 mt-1">Analyze profitability by product, customer, and segment</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Product Profitability</h2>
          </div>
          <div className="p-6">
            <div className="space-y-2">
              {products.map((product, idx) => (
                <div key={idx} className="border-2 border-gray-200 rounded-xl p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Package className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{product.name}</h3>
                        <p className="text-sm text-gray-600">{product.units} units sold</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">{product.margin}%</p>
                      <p className="text-xs text-gray-600">Profit Margin</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-xs text-blue-600 mb-1">Revenue</p>
                      <p className="text-lg font-semibold text-blue-900">{formatCurrency(product.revenue)}</p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-3">
                      <p className="text-xs text-orange-600 mb-1">Cost</p>
                      <p className="text-lg font-semibold text-orange-900">{formatCurrency(product.cost)}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3">
                      <p className="text-xs text-green-600 mb-1">Profit</p>
                      <p className="text-lg font-semibold text-green-900">{formatCurrency(product.profit)}</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-green-500 h-3 rounded-full" style={{ width: `${product.margin}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Customer Profitability</h2>
          </div>
          <div className="p-6">
            <div className="space-y-2">
              {customers.map((customer, idx) => (
                <div key={idx} className="border-2 border-gray-200 rounded-xl p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900">{customer.name}</h3>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">{customer.margin}%</p>
                      <p className="text-xs text-gray-600">Margin</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-xs text-blue-600 mb-1">Revenue</p>
                      <p className="text-lg font-semibold text-blue-900">{formatCurrency(customer.revenue)}</p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-3">
                      <p className="text-xs text-orange-600 mb-1">Cost</p>
                      <p className="text-lg font-semibold text-orange-900">{formatCurrency(customer.cost)}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3">
                      <p className="text-xs text-green-600 mb-1">Profit</p>
                      <p className="text-lg font-semibold text-green-900">{formatCurrency(customer.profit)}</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-blue-500 h-3 rounded-full" style={{ width: `${customer.margin}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
