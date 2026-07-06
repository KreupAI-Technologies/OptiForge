'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, TrendingUp, TrendingDown, Calendar, User, DollarSign, Package, Clock } from 'lucide-react'
import { estimationMaterialCostService } from '@/services/estimation-material-cost.service'

interface RateHistory {
  id: string
  rate: number
  effectiveFrom: string
  effectiveTo: string | null
  supplier: string
  leadTime: number
  minimumOrderQty: number
  changePercentage: number | null
  updatedBy: string
  updatedAt: string
  notes: string
}

export default function MaterialRateHistoryPage() {
  const router = useRouter()
  const params = useParams()
  const materialId = params?.id as string

  const [materialInfo, setMaterialInfo] = useState({
    materialCode: '',
    materialName: '',
    category: '',
    unit: '',
    currentRate: 0,
    status: 'active'
  })

  const [history, setHistory] = useState<RateHistory[]>([])

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const rates = await estimationMaterialCostService.getRates()
        const list = Array.isArray(rates) ? rates : []
        const material = list.find((r) => r?.id === materialId) || list[0]
        if (active && material) {
          setMaterialInfo({
            materialCode: material.materialCode || '',
            materialName: material.materialName || '',
            category: material.category || '',
            unit: material.unit || '',
            currentRate: material.currentPrice || 0,
            status: material.status || 'active'
          })
        }
        // The material-cost service exposes no price-history endpoint,
        // so the history timeline stays empty until one exists.
        if (active) setHistory([])
      } catch (error) {
        console.error('Failed to load material rate history:', error)
      }
    }
    if (materialId) load()
    return () => {
      active = false
    }
  }, [materialId])

  const handleBack = () => {
    router.push('/estimation/rates/materials')
  }

  const getTrendIcon = (percentage: number | null) => {
    if (percentage === null) return null
    if (percentage > 0) return <TrendingUp className="w-4 h-4 text-red-500" />
    if (percentage < 0) return <TrendingDown className="w-4 h-4 text-green-500" />
    return <div className="w-4 h-4" />
  }

  const getTrendColor = (percentage: number | null) => {
    if (percentage === null) return 'text-gray-600'
    if (percentage > 0) return 'text-red-600'
    if (percentage < 0) return 'text-green-600'
    return 'text-gray-600'
  }

  const getTrendBgColor = (percentage: number | null) => {
    if (percentage === null) return 'bg-gray-50'
    if (percentage > 0) return 'bg-red-50'
    if (percentage < 0) return 'bg-green-50'
    return 'bg-gray-50'
  }

  // Calculate statistics (guarded against empty history)
  const avgRate = history.length > 0
    ? history.reduce((sum, h) => sum + h.rate, 0) / history.length
    : 0
  const maxRate = history.length > 0 ? Math.max(...history.map(h => h.rate)) : 0
  const minRate = history.length > 0 ? Math.min(...history.map(h => h.rate)) : 0
  const totalChanges = history.length

  return (
    <div className="w-full h-full flex flex-col bg-gray-50">
      <div className="flex-none bg-white border-b border-gray-200 px-3 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Rate History</h1>
              <p className="text-sm text-gray-500 mt-1">{materialInfo.materialCode} - {materialInfo.materialName}</p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            materialInfo.status === 'active'
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            {materialInfo.status === 'active' ? 'Active' : 'Inactive'}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-3">
        <div className="space-y-3">
          {/* Material Summary */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              Material Information
            </h2>
            <div className="grid grid-cols-4 gap-3">
              <div>
                <p className="text-sm text-gray-500 mb-1">Material Code</p>
                <p className="text-base font-semibold text-gray-900">{materialInfo.materialCode}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Category</p>
                <p className="text-base font-medium text-gray-900">{materialInfo.category}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Unit</p>
                <p className="text-base font-medium text-gray-900">{materialInfo.unit}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Current Rate</p>
                <p className="text-base font-bold text-blue-600">₹{materialInfo.currentRate.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-5 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Current Rate</p>
                  <p className="text-2xl font-bold text-blue-900 mt-1">₹{materialInfo.currentRate.toFixed(2)}</p>
                  <p className="text-xs text-blue-700 mt-1">per {materialInfo.unit}</p>
                </div>
                <DollarSign className="h-10 w-10 text-blue-600" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-5 border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Average Rate</p>
                  <p className="text-2xl font-bold text-green-900 mt-1">₹{avgRate.toFixed(2)}</p>
                  <p className="text-xs text-green-700 mt-1">Historical avg</p>
                </div>
                <TrendingUp className="h-10 w-10 text-green-600" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-5 border border-orange-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Rate Range</p>
                  <p className="text-2xl font-bold text-orange-900 mt-1">₹{minRate} - ₹{maxRate}</p>
                  <p className="text-xs text-orange-700 mt-1">Min - Max</p>
                </div>
                <TrendingDown className="h-10 w-10 text-orange-600" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-5 border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Total Changes</p>
                  <p className="text-2xl font-bold text-purple-900 mt-1">{totalChanges}</p>
                  <p className="text-xs text-purple-700 mt-1">Rate revisions</p>
                </div>
                <Clock className="h-10 w-10 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Rate History Timeline */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Rate Change History
            </h2>

            <div className="space-y-2">
              {history.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <Clock className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">No rate change history available for this material.</p>
                </div>
              )}
              {history.map((record, index) => (
                <div
                  key={record.id}
                  className={`border rounded-lg p-5 ${
                    index === 0 ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${getTrendBgColor(record.changePercentage)}`}>
                        {getTrendIcon(record.changePercentage) || <DollarSign className="w-4 h-4 text-gray-500" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <p className="text-2xl font-bold text-gray-900">₹{record.rate.toFixed(2)}</p>
                          {record.changePercentage !== null && (
                            <span className={`px-2 py-1 rounded text-sm font-semibold ${getTrendColor(record.changePercentage)}`}>
                              {record.changePercentage > 0 ? '+' : ''}{record.changePercentage.toFixed(2)}%
                            </span>
                          )}
                          {index === 0 && (
                            <span className="px-2 py-1 bg-blue-600 text-white rounded text-xs font-medium">
                              CURRENT
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">per {materialInfo.unit}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
                    <div>
                      <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Effective From
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(record.effectiveFrom).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Effective To
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        {record.effectiveTo
                          ? new Date(record.effectiveTo).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })
                          : 'Present'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Supplier</p>
                      <p className="text-sm font-medium text-gray-900">{record.supplier}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Lead Time</p>
                      <p className="text-sm font-medium text-gray-900">{record.leadTime} days</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Minimum Order Quantity</p>
                      <p className="text-sm font-medium text-gray-900">{record.minimumOrderQty} {materialInfo.unit}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                        <User className="w-3 h-3" />
                        Updated By
                      </p>
                      <p className="text-sm font-medium text-gray-900">{record.updatedBy}</p>
                      <p className="text-xs text-gray-500">{record.updatedAt}</p>
                    </div>
                  </div>

                  {record.notes && (
                    <div className="pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">Notes</p>
                      <p className="text-sm text-gray-700">{record.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
