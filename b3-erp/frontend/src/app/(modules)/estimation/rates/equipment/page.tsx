'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { exportToCsv } from '@/lib/export'
import { estimationResourceRateService } from '@/services/estimation-resource-rate.service'
import {
  Wrench,
  TrendingUp,
  Edit2,
  Save,
  History,
  ArrowLeft,
  Search,
  Filter,
  Download,
  Plus,
  AlertCircle
} from 'lucide-react'

interface EquipmentRate {
  id: string
  equipmentCode: string
  equipmentName: string
  category: string
  hourlyRate: number
  dailyRate: number
  weeklyRate: number
  monthlyRate: number
  operatorIncluded: boolean
  fuelIncluded: boolean
  minimumHours: number
  effectiveFrom: string
  lastUpdated: string
  status: 'active' | 'maintenance' | 'inactive'
}

export default function EquipmentRatesPage() {
  const router = useRouter()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState<number>(0)
  const [activeOnly, setActiveOnly] = useState(false)
  const [equipmentRates, setEquipmentRates] = useState<EquipmentRate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setIsLoading(true)
      setLoadError(null)
      try {
        // Backend returns raw equipment rate cards; map to the page's EquipmentRate model.
        const res = await estimationResourceRateService.findAllEquipmentRates('')
        const raw = (Array.isArray(res) ? res : []) as any[]
        const mapped: EquipmentRate[] = raw.map((e) => ({
          id: e.id,
          equipmentCode: e.code ?? '',
          equipmentName: e.name ?? '',
          category: e.category ?? '',
          hourlyRate: Number(e.hourlyRate ?? 0),
          dailyRate: Number(e.dailyRate ?? 0),
          weeklyRate: Number(e.weeklyRate ?? 0),
          monthlyRate: Number(e.monthlyRate ?? 0),
          operatorIncluded: Number(e.operatorCostPerHour ?? 0) > 0,
          fuelIncluded: Number(e.fuelCostPerHour ?? 0) > 0,
          minimumHours: Number(e.minimumHours ?? 0),
          effectiveFrom: e.effectiveFrom ?? '',
          lastUpdated: e.updatedAt ?? e.createdAt ?? '',
          status: e.isActive === false ? 'inactive' : 'active',
        }))
        if (!cancelled) setEquipmentRates(mapped)
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load equipment rates')
          setEquipmentRates([])
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
    router.push('/estimation/rates/equipment/add')
  }

  const handleExport = () => {
    exportToCsv('equipment-rates', equipmentRates)
  }

  const handleViewHistory = (equipmentId: string) => {
    router.push(`/estimation/rates/equipment/history/${equipmentId}`)
  }

  const handleStartEdit = (equipment: EquipmentRate) => {
    setEditingId(equipment.id)
    setEditValue(equipment.hourlyRate)
  }

  const handleSaveRate = async (equipmentId: string) => {
    try {
      await estimationResourceRateService.updateEquipmentRate('', equipmentId, {
        hourlyRate: editValue,
      })
      setEquipmentRates((prev) =>
        prev.map((e) =>
          e.id === equipmentId
            ? { ...e, hourlyRate: editValue, lastUpdated: new Date().toISOString() }
            : e,
        ),
      )
      setEditingId(null)
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to update equipment rate')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'inactive':
        return 'bg-gray-100 text-gray-700 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const visibleEquipmentRates = activeOnly
    ? equipmentRates.filter((e) => e.status === 'active')
    : equipmentRates

  const totalEquipment = equipmentRates.length
  const avgHourlyRate = totalEquipment > 0 ? equipmentRates.reduce((sum, e) => sum + e.hourlyRate, 0) / totalEquipment : 0
  const activeCount = equipmentRates.filter(e => e.status === 'active').length
  const withOperator = equipmentRates.filter(e => e.operatorIncluded).length

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
            <h1 className="text-2xl font-bold text-gray-900">Equipment Rates</h1>
            <p className="text-sm text-gray-600 mt-1">Hourly and rental rates for machinery and equipment</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveOnly((v) => !v)}
            className={`px-4 py-2 border rounded-lg flex items-center gap-2 ${
              activeOnly
                ? 'text-blue-700 bg-blue-50 border-blue-300'
                : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'
            }`}>
            <Filter className="h-4 w-4" />
            {activeOnly ? 'Active Only' : 'Filter'}
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </button>
          <button
            onClick={handleAddRate}
            className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Rate
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading equipment rates…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {loadError}
        </div>
      )}
      {!isLoading && !loadError && equipmentRates.length === 0 && (
        <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          No equipment rates found.
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-5 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Equipment</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{totalEquipment}</p>
              <p className="text-xs text-blue-700 mt-1">Units</p>
            </div>
            <Wrench className="h-10 w-10 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-5 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Avg Hourly Rate</p>
              <p className="text-2xl font-bold text-green-900 mt-1">₹{avgHourlyRate.toFixed(0)}</p>
              <p className="text-xs text-green-700 mt-1">Per hour</p>
            </div>
            <TrendingUp className="h-10 w-10 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-5 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Active Equipment</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">{activeCount}</p>
              <p className="text-xs text-purple-700 mt-1">Ready to use</p>
            </div>
            <AlertCircle className="h-10 w-10 text-purple-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-5 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">With Operator</p>
              <p className="text-2xl font-bold text-orange-900 mt-1">{withOperator}</p>
              <p className="text-xs text-orange-700 mt-1">Operator included</p>
            </div>
            <Wrench className="h-10 w-10 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Equipment Rates Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Equipment Rental Rates</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search equipment..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Equipment</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Hourly Rate</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Daily Rate</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Weekly Rate</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Monthly Rate</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Inclusions</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {visibleEquipmentRates.map((equipment) => (
                <tr key={equipment.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{equipment.equipmentName}</p>
                      <p className="text-xs text-gray-600 mt-1">{equipment.equipmentCode}</p>
                      <p className="text-xs text-gray-600">Min {equipment.minimumHours}hrs</p>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <p className="text-sm text-gray-900">{equipment.category}</p>
                  </td>
                  <td className="px-3 py-2">
                    {editingId === equipment.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(Number(e.target.value))}
                          className="w-24 px-2 py-1 border border-blue-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-xs text-gray-600">/hr</span>
                      </div>
                    ) : (
                      <p className="text-sm font-bold text-blue-600">₹{equipment.hourlyRate}/hr</p>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <p className="text-sm font-medium text-gray-900">₹{equipment.dailyRate.toLocaleString()}</p>
                  </td>
                  <td className="px-3 py-2">
                    <p className="text-sm font-medium text-gray-900">₹{equipment.weeklyRate.toLocaleString()}</p>
                  </td>
                  <td className="px-3 py-2">
                    <p className="text-sm font-medium text-gray-900">₹{equipment.monthlyRate.toLocaleString()}</p>
                  </td>
                  <td className="px-3 py-2">
                    <div className="space-y-1">
                      {equipment.operatorIncluded && (
                        <span className="block px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Operator</span>
                      )}
                      {equipment.fuelIncluded && (
                        <span className="block px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">Fuel</span>
                      )}
                      {!equipment.operatorIncluded && !equipment.fuelIncluded && (
                        <span className="text-xs text-gray-600">None</span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(equipment.status)}`}>
                      {equipment.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      {editingId === equipment.id ? (
                        <button
                          onClick={() => handleSaveRate(equipment.id)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg"

                        >
                          <Save className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStartEdit(equipment)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"

                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleViewHistory(equipment.id)}
                        className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg">
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
