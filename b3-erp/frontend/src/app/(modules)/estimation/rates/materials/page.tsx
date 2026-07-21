'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { exportToCsv } from '@/lib/export'
import { estimationResourceRateService } from '@/services/estimation-resource-rate.service'
import {
  Package,
  TrendingUp,
  TrendingDown,
  Edit2,
  Save,
  History,
  ArrowLeft,
  Search,
  Filter,
  Download,
  Plus,
  Calendar
} from 'lucide-react'

interface MaterialRate {
  id: string
  materialCode: string
  materialName: string
  category: string
  unit: string
  currentRate: number
  previousRate: number
  rateChange: number
  rateChangePercent: number
  effectiveFrom: string
  supplier: string
  leadTime: number
  minimumOrderQty: number
  lastUpdated: string
  updatedBy: string
  status: 'active' | 'inactive' | 'discontinued'
}

const COMPANY_ID = ''

export default function MaterialsRatesPage() {
  const router = useRouter()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState<number>(0)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [materialRates, setMaterialRates] = useState<MaterialRate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setIsLoading(true)
      setLoadError(null)
      try {
        // Backend returns raw ResourceRate[] (rateType=Material); map to the page's MaterialRate model.
        const res = await estimationResourceRateService.findAllResourceRates('', {
          rateType: 'Material',
        })
        const raw = (Array.isArray(res) ? res : []) as any[]
        const mapped: MaterialRate[] = raw.map((r) => {
          const current = Number(r.standardRate ?? 0)
          return {
            id: r.id,
            materialCode: r.code ?? '',
            materialName: r.name ?? '',
            category: r.category ?? '',
            unit: r.unit ?? '',
            currentRate: current,
            previousRate: current,
            rateChange: 0,
            rateChangePercent: 0,
            effectiveFrom: r.effectiveFrom ?? '',
            supplier: r.supplierName ?? '',
            leadTime: 0,
            minimumOrderQty: 0,
            lastUpdated: r.updatedAt ?? '',
            updatedBy: '',
            status: r.isActive === false ? 'inactive' : 'active',
          }
        })
        if (!cancelled) setMaterialRates(mapped)
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load material rates')
          setMaterialRates([])
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const handleAddRate = () => {
    router.push('/estimation/rates/materials/add')
  }

  const handleViewHistory = (materialId: string) => {
    router.push(`/estimation/rates/materials/history/${materialId}`)
  }

  const handleStartEdit = (material: MaterialRate) => {
    setEditingId(material.id)
    setEditValue(material.currentRate)
  }

  const handleSaveRate = async (materialId: string) => {
    setSavingId(materialId)
    setLoadError(null)
    try {
      await estimationResourceRateService.updateResourceRate(COMPANY_ID, materialId, {
        standardRate: editValue,
      })
      setMaterialRates((prev) =>
        prev.map((m) =>
          m.id === materialId
            ? {
                ...m,
                previousRate: m.currentRate,
                currentRate: editValue,
                rateChange: editValue - m.currentRate,
                rateChangePercent: m.currentRate ? ((editValue - m.currentRate) / m.currentRate) * 100 : 0,
              }
            : m
        )
      )
      setEditingId(null)
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to update material rate')
    } finally {
      setSavingId(null)
    }
  }

  const handleExport = () => {
    exportToCsv('material-rates', materialRates)
  }


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'inactive':
        return 'bg-gray-100 text-gray-700 border-gray-200'
      case 'discontinued':
        return 'bg-red-100 text-red-700 border-red-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getRateChangeColor = (change: number) => {
    if (change > 0) return 'text-red-600'
    if (change < 0) return 'text-green-600'
    return 'text-gray-600'
  }

  const totalMaterials = materialRates.length
  const avgRate = totalMaterials > 0 ? materialRates.reduce((sum, m) => sum + m.currentRate, 0) / totalMaterials : 0
  const increasedRates = materialRates.filter(m => m.rateChange > 0).length
  const decreasedRates = materialRates.filter(m => m.rateChange < 0).length

  return (
    <div className="w-full h-full px-4 py-2">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Material Rates</h1>
            <p className="text-sm text-gray-600 mt-1">Standard rates for estimation and costing</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
          <button
            onClick={handleAddRate}
            className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Rate
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading material rates…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {loadError}
        </div>
      )}
      {!isLoading && !loadError && materialRates.length === 0 && (
        <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          No material rates found.
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-5 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Materials</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{totalMaterials}</p>
              <p className="text-xs text-blue-700 mt-1">Active rates</p>
            </div>
            <Package className="h-10 w-10 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-5 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Avg Rate</p>
              <p className="text-2xl font-bold text-green-900 mt-1">₹{avgRate.toFixed(0)}</p>
              <p className="text-xs text-green-700 mt-1">Per unit</p>
            </div>
            <TrendingUp className="h-10 w-10 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-5 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Rate Increased</p>
              <p className="text-2xl font-bold text-red-900 mt-1">{increasedRates}</p>
              <p className="text-xs text-red-700 mt-1">Materials</p>
            </div>
            <TrendingUp className="h-10 w-10 text-red-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-5 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Rate Decreased</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">{decreasedRates}</p>
              <p className="text-xs text-purple-700 mt-1">Materials</p>
            </div>
            <TrendingDown className="h-10 w-10 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Material Rates Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Material Rates</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search materials..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Material</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Current Rate</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Previous Rate</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Change</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Effective From</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {materialRates.map((material) => (
                <tr key={material.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{material.materialName}</p>
                      <p className="text-xs text-gray-600 mt-1">{material.materialCode}</p>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <p className="text-sm text-gray-900">{material.category}</p>
                  </td>
                  <td className="px-3 py-2">
                    {editingId === material.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(Number(e.target.value))}
                          className="w-24 px-2 py-1 border border-blue-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-xs text-gray-600">/{material.unit}</span>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm font-bold text-gray-900">₹{material.currentRate.toLocaleString()}</p>
                        <p className="text-xs text-gray-600">per {material.unit}</p>
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <p className="text-sm text-gray-600">₹{material.previousRate.toLocaleString()}</p>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1">
                      {material.rateChange > 0 ? (
                        <TrendingUp className="h-4 w-4 text-red-600" />
                      ) : material.rateChange < 0 ? (
                        <TrendingDown className="h-4 w-4 text-green-600" />
                      ) : null}
                      <div>
                        <p className={`text-sm font-semibold ${getRateChangeColor(material.rateChange)}`}>
                          {material.rateChange > 0 ? '+' : ''}₹{material.rateChange}
                        </p>
                        <p className={`text-xs ${getRateChangeColor(material.rateChange)}`}>
                          {material.rateChangePercent > 0 ? '+' : ''}{material.rateChangePercent.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1 text-sm text-gray-900">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>{material.effectiveFrom}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div>
                      <p className="text-sm text-gray-900">{material.supplier}</p>
                      <p className="text-xs text-gray-600 mt-1">{material.leadTime} days lead</p>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(material.status)}`}>
                      {material.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      {editingId === material.id ? (
                        <button
                          onClick={() => handleSaveRate(material.id)}
                          disabled={savingId === material.id}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg disabled:opacity-50"
                          title="Save Rate"
                        >
                          <Save className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStartEdit(material)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Edit Rate"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleViewHistory(material.id)}
                        className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                        title="View Rate History"
                      >
                        <History className="h-4 w-4" />
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
  )
}
