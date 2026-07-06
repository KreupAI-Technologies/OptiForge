'use client'

import { useState, useEffect } from 'react'
import { FinanceService } from '@/services/finance.service'
import {
  Factory,
  Package,
  TrendingUp,
  Clock,
  DollarSign,
  Activity,
  ArrowUpRight,
  Settings,
  BarChart3,
  CheckCircle
} from 'lucide-react'

interface WIPItem {
  id: string
  workOrderId: string
  productName: string
  quantityOrdered: number
  quantityCompleted: number
  quantityInProgress: number
  status: 'not_started' | 'in_progress' | 'completed' | 'on_hold'
  startDate: string
  targetDate: string
  costIncurred: {
    material: number
    labor: number
    overhead: number
    total: number
  }
  estimatedCost: {
    material: number
    labor: number
    overhead: number
    total: number
  }
  completionPercentage: number
}

const wnum = (v: any) => Number(v ?? 0)

const mapWipStatus = (s: any): WIPItem['status'] => {
  const v = String(s ?? '').toLowerCase().replace(/[\s-]/g, '_')
  if (v === 'completed' || v === 'complete') return 'completed'
  if (v === 'on_hold' || v === 'hold') return 'on_hold'
  if (v === 'not_started' || v === 'draft' || v === 'planned') return 'not_started'
  return 'in_progress'
}

const mapWip = (r: any): WIPItem => {
  const material = wnum(r?.materialCost)
  const labor = wnum(r?.laborCost)
  const overhead = wnum(r?.overheadCost)
  const total = wnum(r?.totalWIPValue ?? material + labor + overhead)
  const completion = wnum(r?.completionPercentage)
  const quantity = wnum(r?.quantity)
  // API does not expose a separate estimate; project total from completion %.
  const factor = completion > 0 ? 100 / completion : 1
  const estMaterial = material * factor
  const estLabor = labor * factor
  const estOverhead = overhead * factor
  const completedQty = Math.round((quantity * completion) / 100)
  return {
    id: String(r?.id ?? ''),
    workOrderId: r?.productionOrderNumber ?? r?.wipNumber ?? '',
    productName: r?.productName ?? '',
    quantityOrdered: quantity,
    quantityCompleted: completedQty,
    quantityInProgress: Math.max(quantity - completedQty, 0),
    status: mapWipStatus(r?.status),
    startDate: r?.startDate ?? r?.valuationDate ?? '',
    targetDate: r?.targetDate ?? r?.valuationDate ?? '',
    costIncurred: {
      material,
      labor,
      overhead,
      total
    },
    estimatedCost: {
      material: estMaterial,
      labor: estLabor,
      overhead: estOverhead,
      total: estMaterial + estLabor + estOverhead
    },
    completionPercentage: completion
  }
}

export default function WIPAccountingPage() {
  const [wipItems, setWipItems] = useState<WIPItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadWip = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await FinanceService.getWipAccounting()
      setWipItems((Array.isArray(res) ? res : []).map(mapWip))
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load WIP accounting')
      setWipItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadWip()
  }, [])

  const handleDelete = async (id: string) => {
    try {
      await FinanceService.deleteWip(id)
      await loadWip()
    } catch (e: any) {
      setError(e?.message ?? 'Failed to delete WIP record')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'not_started':
        return 'bg-gray-100 text-gray-700 border-gray-200'
      case 'in_progress':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'on_hold':
        return 'bg-orange-100 text-orange-700 border-orange-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  // Calculate totals
  const totalWIPValue = wipItems.reduce((sum, item) => sum + item.costIncurred.total, 0)
  const totalEstimatedCost = wipItems.reduce((sum, item) => sum + item.estimatedCost.total, 0)
  const totalQuantityInProgress = wipItems.reduce((sum, item) => sum + item.quantityInProgress, 0)
  const avgCompletion = wipItems.length > 0
    ? wipItems.reduce((sum, item) => sum + item.completionPercentage, 0) / wipItems.length
    : 0

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-blue-50 px-3 py-2">
      <div className="w-full space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Work-in-Progress (WIP) Accounting</h1>
            <p className="text-gray-600 mt-1">Track costs and progress of ongoing production</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:from-indigo-700 hover:to-blue-700 transition-all shadow-md">
            <Activity className="h-5 w-5" />
            WIP Report
          </button>
        </div>

        {loading && (
          <div className="text-sm text-gray-500">Loading WIP records...</div>
        )}
        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{error}</div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-5 border border-blue-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total WIP Value</p>
                <p className="text-2xl font-bold text-blue-900 mt-1">{formatCurrency(totalWIPValue)}</p>
                <p className="text-xs text-blue-700 mt-1">Cost incurred</p>
              </div>
              <DollarSign className="h-10 w-10 text-blue-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-5 border border-green-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Active Work Orders</p>
                <p className="text-2xl font-bold text-green-900 mt-1">{wipItems.length}</p>
                <p className="text-xs text-green-700 mt-1">In progress</p>
              </div>
              <Factory className="h-10 w-10 text-green-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-5 border border-purple-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Units in Progress</p>
                <p className="text-2xl font-bold text-purple-900 mt-1">{totalQuantityInProgress}</p>
                <p className="text-xs text-purple-700 mt-1">Total units</p>
              </div>
              <Package className="h-10 w-10 text-purple-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-5 border border-orange-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Avg Completion</p>
                <p className="text-2xl font-bold text-orange-900 mt-1">{avgCompletion.toFixed(1)}%</p>
                <p className="text-xs text-orange-700 mt-1">Overall progress</p>
              </div>
              <BarChart3 className="h-10 w-10 text-orange-600" />
            </div>
          </div>
        </div>

        {/* WIP Items List */}
        <div className="space-y-3">
          {wipItems.map((item) => (
            <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-3 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold">{item.productName}</h3>
                    <p className="text-indigo-100 mt-1">{item.workOrderId}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="text-indigo-100 text-sm">Completion</p>
                      <p className="text-2xl font-bold">{item.completionPercentage}%</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border border-white/30 bg-white/20`}>
                      {item.status.replace('_', ' ').toUpperCase()}
                    </span>
                    <button onClick={() => handleDelete(item.id)} className="px-3 py-1 rounded-full text-sm font-medium border border-white/30 bg-white/20 hover:bg-white/30 transition-colors">
                      Delete
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="w-full bg-indigo-400/30 rounded-full h-3">
                    <div
                      className="bg-white rounded-full h-3 transition-all duration-500"
                      style={{ width: `${item.completionPercentage}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-4">
                  <div>
                    <p className="text-indigo-200 text-sm">Ordered</p>
                    <p className="text-lg font-semibold">{item.quantityOrdered} units</p>
                  </div>
                  <div>
                    <p className="text-indigo-200 text-sm">Completed</p>
                    <p className="text-lg font-semibold">{item.quantityCompleted} units</p>
                  </div>
                  <div>
                    <p className="text-indigo-200 text-sm">In Progress</p>
                    <p className="text-lg font-semibold">{item.quantityInProgress} units</p>
                  </div>
                </div>
              </div>

              {/* Cost Details */}
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {/* Cost Incurred */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-blue-600" />
                      Cost Incurred
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <span className="text-gray-700">Material Cost</span>
                        <span className="font-semibold text-gray-900">{formatCurrency(item.costIncurred.material)}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <span className="text-gray-700">Labor Cost</span>
                        <span className="font-semibold text-gray-900">{formatCurrency(item.costIncurred.labor)}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                        <span className="text-gray-700">Overhead Cost</span>
                        <span className="font-semibold text-gray-900">{formatCurrency(item.costIncurred.overhead)}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg text-white">
                        <span className="font-semibold">Total Cost Incurred</span>
                        <span className="text-xl font-bold">{formatCurrency(item.costIncurred.total)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Estimated Total Cost */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-purple-600" />
                      Estimated Total Cost
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-700">Material Cost</span>
                        <span className="font-semibold text-gray-900">{formatCurrency(item.estimatedCost.material)}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-700">Labor Cost</span>
                        <span className="font-semibold text-gray-900">{formatCurrency(item.estimatedCost.labor)}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-700">Overhead Cost</span>
                        <span className="font-semibold text-gray-900">{formatCurrency(item.estimatedCost.overhead)}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white">
                        <span className="font-semibold">Estimated Total</span>
                        <span className="text-xl font-bold">{formatCurrency(item.estimatedCost.total)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cost vs Estimate */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Cost to Complete</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(item.estimatedCost.total - item.costIncurred.total)}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Timeline</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {item.startDate} to {item.targetDate}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Cost per Unit (Incurred)</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(item.quantityOrdered > 0 ? item.costIncurred.total / item.quantityOrdered : 0)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">WIP Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total WIP Value (Cost Incurred):</span>
                <span className="text-xl font-bold text-blue-600">{formatCurrency(totalWIPValue)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Estimated Cost:</span>
                <span className="text-xl font-bold text-purple-600">{formatCurrency(totalEstimatedCost)}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Cost to Complete:</span>
                <span className="text-xl font-bold text-orange-600">
                  {formatCurrency(totalEstimatedCost - totalWIPValue)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Average Completion:</span>
                <span className="text-xl font-bold text-green-600">{avgCompletion.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
