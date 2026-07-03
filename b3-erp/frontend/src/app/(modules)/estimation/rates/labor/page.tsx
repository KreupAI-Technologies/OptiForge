'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { exportToCsv } from '@/lib/export'
import { estimationResourceRateService } from '@/services/estimation-resource-rate.service'
import {
  Users,
  TrendingUp,
  Edit2,
  Save,
  History,
  ArrowLeft,
  Search,
  Filter,
  Download,
  Plus,
  Award
} from 'lucide-react'

interface LaborRate {
  id: string
  skillCode: string
  skillName: string
  department: string
  skillLevel: 'trainee' | 'skilled' | 'expert' | 'supervisor'
  standardRate: number
  overtimeRate: number
  holidayRate: number
  effectiveFrom: string
  lastUpdated: string
  status: 'active' | 'inactive'
}

const SKILL_LEVELS: LaborRate['skillLevel'][] = ['trainee', 'skilled', 'expert', 'supervisor']

export default function LaborRatesPage() {
  const router = useRouter()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [laborRates, setLaborRates] = useState<LaborRate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const handleAddRate = () => {
    router.push('/estimation/rates/labor/add')
  }

  const handleExport = () => {
    exportToCsv('labor-rates', laborRates)
  }

  const handleViewHistory = (laborId: string) => {
    router.push(`/estimation/rates/labor/history/${laborId}`)
  }

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setIsLoading(true)
      setLoadError(null)
      try {
        // Backend returns raw ResourceRate[] (rateType=Labor); map to the page's LaborRate model.
        const res = await estimationResourceRateService.findAllResourceRates('', {
          rateType: 'Labor',
        })
        const raw = (Array.isArray(res) ? res : []) as any[]
        const mapped: LaborRate[] = raw.map((r) => {
          const level = String(r.subCategory ?? '').toLowerCase()
          return {
            id: r.id,
            skillCode: r.code ?? '',
            skillName: r.name ?? '',
            department: r.category ?? '',
            skillLevel: SKILL_LEVELS.includes(level as LaborRate['skillLevel'])
              ? (level as LaborRate['skillLevel'])
              : 'skilled',
            standardRate: Number(r.standardRate ?? 0),
            overtimeRate: Number(r.overtimeRate ?? Number(r.standardRate ?? 0) * 1.5),
            holidayRate: Number(r.maximumRate ?? Number(r.standardRate ?? 0) * 2),
            effectiveFrom: r.effectiveFrom ?? '',
            lastUpdated: r.updatedAt ?? '',
            status: r.isActive === false ? 'inactive' : 'active',
          }
        })
        if (!cancelled) setLaborRates(mapped)
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load labor rates')
          setLaborRates([])
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

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case 'trainee':
        return 'bg-gray-100 text-gray-700 border-gray-200'
      case 'skilled':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'expert':
        return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'supervisor':
        return 'bg-orange-100 text-orange-700 border-orange-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'inactive':
        return 'bg-gray-100 text-gray-700 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const totalLabor = laborRates.length
  const avgRate = totalLabor > 0 ? laborRates.reduce((sum, l) => sum + l.standardRate, 0) / totalLabor : 0
  const expertCount = laborRates.filter(l => l.skillLevel === 'expert').length
  const supervisorCount = laborRates.filter(l => l.skillLevel === 'supervisor').length

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
            <h1 className="text-2xl font-bold text-gray-900">Labor Rates</h1>
            <p className="text-sm text-gray-600 mt-1">Standard hourly rates by skill and department</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filter
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
          Loading labor rates…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {loadError}
        </div>
      )}
      {!isLoading && !loadError && laborRates.length === 0 && (
        <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          No labor rates found.
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-5 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Skills</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{totalLabor}</p>
              <p className="text-xs text-blue-700 mt-1">Active rates</p>
            </div>
            <Users className="h-10 w-10 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-5 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Avg Rate</p>
              <p className="text-2xl font-bold text-green-900 mt-1">₹{avgRate.toFixed(0)}/hr</p>
              <p className="text-xs text-green-700 mt-1">Standard rate</p>
            </div>
            <TrendingUp className="h-10 w-10 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-5 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Expert Level</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">{expertCount}</p>
              <p className="text-xs text-purple-700 mt-1">Specialists</p>
            </div>
            <Award className="h-10 w-10 text-purple-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-5 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Supervisors</p>
              <p className="text-2xl font-bold text-orange-900 mt-1">{supervisorCount}</p>
              <p className="text-xs text-orange-700 mt-1">Leadership roles</p>
            </div>
            <Users className="h-10 w-10 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Labor Rates Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Labor Rates by Skill</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search skills..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Skill</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Level</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Standard Rate</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Overtime Rate</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Holiday Rate</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Effective From</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {laborRates.map((labor) => (
                <tr key={labor.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{labor.skillName}</p>
                      <p className="text-xs text-gray-600 mt-1">{labor.skillCode}</p>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <p className="text-sm text-gray-900">{labor.department}</p>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSkillLevelColor(labor.skillLevel)}`}>
                      {labor.skillLevel.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    {editingId === labor.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          defaultValue={labor.standardRate}
                          className="w-20 px-2 py-1 border border-blue-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-xs text-gray-600">/hr</span>
                      </div>
                    ) : (
                      <p className="text-sm font-bold text-gray-900">₹{labor.standardRate}/hr</p>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <p className="text-sm font-medium text-orange-600">₹{labor.overtimeRate}/hr</p>
                    <p className="text-xs text-gray-600">1.5x standard</p>
                  </td>
                  <td className="px-3 py-2">
                    <p className="text-sm font-medium text-red-600">₹{labor.holidayRate}/hr</p>
                    <p className="text-xs text-gray-600">2x standard</p>
                  </td>
                  <td className="px-3 py-2">
                    <p className="text-sm text-gray-900">{labor.effectiveFrom}</p>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(labor.status)}`}>
                      {labor.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      {editingId === labor.id ? (
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                         
                        >
                          <Save className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => setEditingId(labor.id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                         
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleViewHistory(labor.id)}
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
