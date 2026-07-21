'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { exportToCsv } from '@/lib/export'
import { estimationResourceRateService } from '@/services/estimation-resource-rate.service'

const companyId = 'default-company-id'
import {
  Users,
  TrendingUp,
  Star,
  Edit2,
  Save,
  History,
  ArrowLeft,
  Search,
  Filter,
  Download,
  Plus,
  Phone,
  Mail
} from 'lucide-react'

interface SubcontractorRate {
  id: string
  contractorCode: string
  contractorName: string
  serviceType: string
  specialization: string[]
  rateType: 'per-hour' | 'per-sqft' | 'per-unit' | 'fixed'
  rate: number
  unit: string
  rating: number
  projectsCompleted: number
  contactPerson: string
  phone: string
  email: string
  minimumOrder: number
  leadTime: number
  paymentTerms: string
  effectiveFrom: string
  lastUpdated: string
  status: 'active' | 'inactive' | 'blacklisted'
}

export default function SubcontractorsRatesPage() {
  const router = useRouter()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState<number>(0)
  const [activeOnly, setActiveOnly] = useState(false)
  // Preserve the raw backend records so a rate edit can send the full
  // `services[]` payload back (rate lives inside the first service).
  const rawRecordsRef = useRef<Record<string, any>>({})

  const handleAddSubcontractor = () => {
    router.push('/estimation/rates/subcontractors/add')
  }

  const handleStartEdit = (subcontractor: SubcontractorRate) => {
    setEditingId(subcontractor.id)
    setEditValue(subcontractor.rate)
  }

  const handleSaveRate = async (subcontractorId: string) => {
    try {
      const raw = rawRecordsRef.current[subcontractorId]
      const services = Array.isArray(raw?.services) ? [...raw.services] : []
      if (services.length > 0) {
        services[0] = { ...services[0], rate: editValue }
      }
      await estimationResourceRateService.updateSubcontractorRate(companyId, subcontractorId, {
        services,
      })
      setSubcontractorRates((prev) =>
        prev.map((s) =>
          s.id === subcontractorId
            ? { ...s, rate: editValue, lastUpdated: new Date().toISOString() }
            : s,
        ),
      )
      setEditingId(null)
    } catch (error) {
      console.error('Failed to update subcontractor rate:', error)
    }
  }

  const handleExport = () => {
    exportToCsv('subcontractor-rates', subcontractorRates)
  }

  const handleViewHistory = (subcontractorId: string) => {
    router.push(`/estimation/rates/subcontractors/history/${subcontractorId}`)
  }

  const [subcontractorRates, setSubcontractorRates] = useState<SubcontractorRate[]>([])

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const data = await estimationResourceRateService.findAllSubcontractorRates(companyId)
        const list = Array.isArray(data) ? data : []
        rawRecordsRef.current = Object.fromEntries(
          list.filter((s) => s?.id).map((s) => [s.id as string, s]),
        )
        const mapped: SubcontractorRate[] = list.map((s) => {
          const firstService = Array.isArray(s?.services) && s.services.length > 0 ? s.services[0] : undefined
          return {
            id: s?.id || '',
            contractorCode: s?.subcontractorId || '',
            contractorName: s?.subcontractorName || '',
            serviceType: firstService?.serviceName || '',
            specialization: Array.isArray(s?.services) ? s.services.map((sv) => sv?.serviceName).filter(Boolean) : [],
            rateType: 'fixed',
            rate: firstService?.rate ?? 0,
            unit: firstService?.unit || '',
            rating: s?.performanceRating ?? 0,
            projectsCompleted: 0,
            contactPerson: s?.contactPerson || '',
            phone: s?.phone || '',
            email: s?.email || '',
            minimumOrder: firstService?.minimumCharge ?? 0,
            leadTime: 0,
            paymentTerms: '',
            effectiveFrom: s?.createdAt || '',
            lastUpdated: s?.createdAt || '',
            status: s?.isActive ? 'active' : 'inactive',
          }
        })
        if (active) setSubcontractorRates(mapped)
      } catch (error) {
        console.error('Failed to load subcontractor rates:', error)
        if (active) setSubcontractorRates([])
      }
    }
    load()
    return () => {
      active = false
    }
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'inactive':
        return 'bg-gray-100 text-gray-700 border-gray-200'
      case 'blacklisted':
        return 'bg-red-100 text-red-700 border-red-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 4.7) return 'text-green-600'
    if (rating >= 4.5) return 'text-blue-600'
    if (rating >= 4.0) return 'text-yellow-600'
    return 'text-orange-600'
  }

  const visibleSubcontractorRates = activeOnly
    ? subcontractorRates.filter(s => s.status === 'active')
    : subcontractorRates

  const totalSubcontractors = subcontractorRates.length
  const avgRating = totalSubcontractors > 0
    ? subcontractorRates.reduce((sum, s) => sum + s.rating, 0) / totalSubcontractors
    : 0
  const activeCount = subcontractorRates.filter(s => s.status === 'active').length
  const totalProjects = subcontractorRates.reduce((sum, s) => sum + s.projectsCompleted, 0)

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
            <h1 className="text-2xl font-bold text-gray-900">Subcontractor Rates</h1>
            <p className="text-sm text-gray-600 mt-1">Approved subcontractors and service rates</p>
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
            onClick={handleAddSubcontractor}
            className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Subcontractor
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-5 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Subcontractors</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{totalSubcontractors}</p>
              <p className="text-xs text-blue-700 mt-1">Registered</p>
            </div>
            <Users className="h-10 w-10 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-5 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Avg Rating</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{avgRating.toFixed(1)}</p>
              <p className="text-xs text-green-700 mt-1">Out of 5.0</p>
            </div>
            <Star className="h-10 w-10 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-5 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Active</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">{activeCount}</p>
              <p className="text-xs text-purple-700 mt-1">Available now</p>
            </div>
            <TrendingUp className="h-10 w-10 text-purple-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-5 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Total Projects</p>
              <p className="text-2xl font-bold text-orange-900 mt-1">{totalProjects}</p>
              <p className="text-xs text-orange-700 mt-1">Completed</p>
            </div>
            <Star className="h-10 w-10 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Subcontractor Rates Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Subcontractor Directory</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search subcontractors..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Subcontractor</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Service Type</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Rate</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Projects</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Terms</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {visibleSubcontractorRates.map((subcontractor) => (
                <tr key={subcontractor.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{subcontractor.contractorName}</p>
                      <p className="text-xs text-gray-600 mt-1">{subcontractor.contractorCode}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {subcontractor.specialization.slice(0, 2).map((spec, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <p className="text-sm text-gray-900">{subcontractor.serviceType}</p>
                  </td>
                  <td className="px-3 py-2">
                    {editingId === subcontractor.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(Number(e.target.value))}
                          className="w-24 px-2 py-1 border border-blue-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-xs text-gray-600">/{subcontractor.unit}</span>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm font-bold text-blue-600">₹{subcontractor.rate.toLocaleString()}</p>
                        <p className="text-xs text-gray-600">per {subcontractor.unit}</p>
                        <p className="text-xs text-gray-600 mt-1">Min: {subcontractor.minimumOrder} {subcontractor.unit}</p>
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1">
                      <Star className={`h-4 w-4 ${getRatingColor(subcontractor.rating)} fill-current`} />
                      <span className={`text-sm font-bold ${getRatingColor(subcontractor.rating)}`}>
                        {subcontractor.rating.toFixed(1)}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <p className="text-sm font-medium text-gray-900">{subcontractor.projectsCompleted}</p>
                    <p className="text-xs text-gray-600">completed</p>
                  </td>
                  <td className="px-3 py-2">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-900">{subcontractor.contactPerson}</p>
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <Phone className="h-3 w-3" />
                        <span>{subcontractor.phone}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <Mail className="h-3 w-3" />
                        <span>{subcontractor.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div>
                      <p className="text-sm text-gray-900">{subcontractor.paymentTerms}</p>
                      <p className="text-xs text-gray-600 mt-1">{subcontractor.leadTime} days lead</p>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(subcontractor.status)}`}>
                      {subcontractor.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      {editingId === subcontractor.id ? (
                        <button
                          onClick={() => handleSaveRate(subcontractor.id)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg"

                        >
                          <Save className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStartEdit(subcontractor)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"

                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleViewHistory(subcontractor.id)}
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
