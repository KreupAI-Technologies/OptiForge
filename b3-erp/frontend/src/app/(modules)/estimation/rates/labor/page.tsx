'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { exportToCsv } from '@/lib/export'
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

export default function LaborRatesPage() {
  const router = useRouter()
  const [editingId, setEditingId] = useState<string | null>(null)

  const handleAddRate = () => {
    router.push('/estimation/rates/labor/add')
  }

  const handleExport = () => {
    exportToCsv('labor-rates', laborRates)
  }

  const handleViewHistory = (laborId: string) => {
    router.push(`/estimation/rates/labor/history/${laborId}`)
  }

  const [laborRates] = useState<LaborRate[]>([
    {
      id: 'LAB-R-001',
      skillCode: 'WELD-SS',
      skillName: 'Stainless Steel Welder',
      department: 'Sink Manufacturing',
      skillLevel: 'skilled',
      standardRate: 485,
      overtimeRate: 727.5,
      holidayRate: 970,
      effectiveFrom: '2025-10-01',
      lastUpdated: '2025-10-01',
      status: 'active'
    },
    {
      id: 'LAB-R-002',
      skillCode: 'MACH-CNC',
      skillName: 'CNC Machine Operator',
      department: 'Faucet Manufacturing',
      skillLevel: 'expert',
      standardRate: 515,
      overtimeRate: 772.5,
      holidayRate: 1030,
      effectiveFrom: '2025-10-01',
      lastUpdated: '2025-10-01',
      status: 'active'
    },
    {
      id: 'LAB-R-003',
      skillCode: 'POLISH-CHR',
      skillName: 'Chrome Polishing Specialist',
      department: 'Finishing',
      skillLevel: 'skilled',
      standardRate: 380,
      overtimeRate: 570,
      holidayRate: 760,
      effectiveFrom: '2025-10-01',
      lastUpdated: '2025-10-01',
      status: 'active'
    },
    {
      id: 'LAB-R-004',
      skillCode: 'ASSY-FAUCET',
      skillName: 'Faucet Assembly Technician',
      department: 'Faucet Manufacturing',
      skillLevel: 'skilled',
      standardRate: 365,
      overtimeRate: 547.5,
      holidayRate: 730,
      effectiveFrom: '2025-10-01',
      lastUpdated: '2025-10-01',
      status: 'active'
    },
    {
      id: 'LAB-R-005',
      skillCode: 'CAST-ALUM',
      skillName: 'Aluminum Casting Operator',
      department: 'Cookware Manufacturing',
      skillLevel: 'skilled',
      standardRate: 410,
      overtimeRate: 615,
      holidayRate: 820,
      effectiveFrom: '2025-10-01',
      lastUpdated: '2025-10-01',
      status: 'active'
    },
    {
      id: 'LAB-R-006',
      skillCode: 'QC-INSP',
      skillName: 'Quality Control Inspector',
      department: 'Quality Assurance',
      skillLevel: 'expert',
      standardRate: 490,
      overtimeRate: 735,
      holidayRate: 980,
      effectiveFrom: '2025-10-01',
      lastUpdated: '2025-10-01',
      status: 'active'
    },
    {
      id: 'LAB-R-007',
      skillCode: 'CARP-CAB',
      skillName: 'Cabinet Carpenter',
      department: 'Cabinet Manufacturing',
      skillLevel: 'skilled',
      standardRate: 475,
      overtimeRate: 712.5,
      holidayRate: 950,
      effectiveFrom: '2025-10-01',
      lastUpdated: '2025-10-01',
      status: 'active'
    },
    {
      id: 'LAB-R-008',
      skillCode: 'STONE-CUT',
      skillName: 'Stone Cutting Specialist',
      department: 'Countertop Manufacturing',
      skillLevel: 'expert',
      standardRate: 580,
      overtimeRate: 870,
      holidayRate: 1160,
      effectiveFrom: '2025-10-01',
      lastUpdated: '2025-10-01',
      status: 'active'
    },
    {
      id: 'LAB-R-009',
      skillCode: 'PAINT-IND',
      skillName: 'Industrial Painter',
      department: 'Finishing',
      skillLevel: 'skilled',
      standardRate: 355,
      overtimeRate: 532.5,
      holidayRate: 710,
      effectiveFrom: '2025-10-01',
      lastUpdated: '2025-10-01',
      status: 'active'
    },
    {
      id: 'LAB-R-010',
      skillCode: 'SUPV-PROD',
      skillName: 'Production Supervisor',
      department: 'Production',
      skillLevel: 'supervisor',
      standardRate: 695,
      overtimeRate: 1042.5,
      holidayRate: 1390,
      effectiveFrom: '2025-10-01',
      lastUpdated: '2025-10-01',
      status: 'active'
    },
    {
      id: 'LAB-R-011',
      skillCode: 'HELP-GEN',
      skillName: 'General Helper',
      department: 'All Departments',
      skillLevel: 'trainee',
      standardRate: 280,
      overtimeRate: 420,
      holidayRate: 560,
      effectiveFrom: '2025-10-01',
      lastUpdated: '2025-10-01',
      status: 'active'
    },
    {
      id: 'LAB-R-012',
      skillCode: 'ELECT-TECH',
      skillName: 'Electrical Technician',
      department: 'Maintenance',
      skillLevel: 'expert',
      standardRate: 520,
      overtimeRate: 780,
      holidayRate: 1040,
      effectiveFrom: '2025-10-01',
      lastUpdated: '2025-10-01',
      status: 'active'
    }
  ])

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
  const avgRate = laborRates.reduce((sum, l) => sum + l.standardRate, 0) / totalLabor
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
