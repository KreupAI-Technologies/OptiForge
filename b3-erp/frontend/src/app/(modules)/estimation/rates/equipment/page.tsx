'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { exportToCsv } from '@/lib/export'
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

  const handleAddRate = () => {
    router.push('/estimation/rates/equipment/add')
  }

  const handleExport = () => {
    exportToCsv('equipment-rates', equipmentRates)
  }

  const handleViewHistory = (equipmentId: string) => {
    router.push(`/estimation/rates/equipment/history/${equipmentId}`)
  }

  const [equipmentRates] = useState<EquipmentRate[]>([
    {
      id: 'EQ-R-001',
      equipmentCode: 'CNC-FAU-001',
      equipmentName: 'CNC Machine - Faucet Body Production',
      category: 'CNC Machinery',
      hourlyRate: 850,
      dailyRate: 6800,
      weeklyRate: 40800,
      monthlyRate: 163200,
      operatorIncluded: true,
      fuelIncluded: false,
      minimumHours: 4,
      effectiveFrom: '2025-10-01',
      lastUpdated: '2025-10-01',
      status: 'active'
    },
    {
      id: 'EQ-R-002',
      equipmentCode: 'WELD-SS-AUTO',
      equipmentName: 'Automatic Welding Machine - SS Sinks',
      category: 'Welding Equipment',
      hourlyRate: 650,
      dailyRate: 5200,
      weeklyRate: 31200,
      monthlyRate: 124800,
      operatorIncluded: true,
      fuelIncluded: false,
      minimumHours: 4,
      effectiveFrom: '2025-10-01',
      lastUpdated: '2025-10-01',
      status: 'active'
    },
    {
      id: 'EQ-R-003',
      equipmentCode: 'LASER-CUT-001',
      equipmentName: 'Laser Cutting Machine',
      category: 'Cutting Equipment',
      hourlyRate: 1200,
      dailyRate: 9600,
      weeklyRate: 57600,
      monthlyRate: 230400,
      operatorIncluded: true,
      fuelIncluded: false,
      minimumHours: 4,
      effectiveFrom: '2025-10-01',
      lastUpdated: '2025-10-01',
      status: 'active'
    },
    {
      id: 'EQ-R-004',
      equipmentCode: 'PRESS-HYD-500',
      equipmentName: 'Hydraulic Press 500 Ton',
      category: 'Pressing Equipment',
      hourlyRate: 950,
      dailyRate: 7600,
      weeklyRate: 45600,
      monthlyRate: 182400,
      operatorIncluded: true,
      fuelIncluded: false,
      minimumHours: 4,
      effectiveFrom: '2025-10-01',
      lastUpdated: '2025-10-01',
      status: 'active'
    },
    {
      id: 'EQ-R-005',
      equipmentCode: 'POLISH-AUTO',
      equipmentName: 'Automatic Polishing Machine',
      category: 'Finishing Equipment',
      hourlyRate: 550,
      dailyRate: 4400,
      weeklyRate: 26400,
      monthlyRate: 105600,
      operatorIncluded: true,
      fuelIncluded: false,
      minimumHours: 4,
      effectiveFrom: '2025-10-01',
      lastUpdated: '2025-10-01',
      status: 'active'
    },
    {
      id: 'EQ-R-006',
      equipmentCode: 'SPRAY-BOOTH',
      equipmentName: 'Powder Coating Spray Booth',
      category: 'Finishing Equipment',
      hourlyRate: 750,
      dailyRate: 6000,
      weeklyRate: 36000,
      monthlyRate: 144000,
      operatorIncluded: true,
      fuelIncluded: false,
      minimumHours: 8,
      effectiveFrom: '2025-10-01',
      lastUpdated: '2025-10-01',
      status: 'active'
    },
    {
      id: 'EQ-R-007',
      equipmentCode: 'DRILL-MAG',
      equipmentName: 'Magnetic Drilling Machine',
      category: 'Drilling Equipment',
      hourlyRate: 420,
      dailyRate: 3360,
      weeklyRate: 20160,
      monthlyRate: 80640,
      operatorIncluded: false,
      fuelIncluded: false,
      minimumHours: 4,
      effectiveFrom: '2025-10-01',
      lastUpdated: '2025-10-01',
      status: 'active'
    },
    {
      id: 'EQ-R-008',
      equipmentCode: 'STONE-CUT-BRIDGE',
      equipmentName: 'Bridge Saw - Stone Cutting',
      category: 'Stone Working Equipment',
      hourlyRate: 1100,
      dailyRate: 8800,
      weeklyRate: 52800,
      monthlyRate: 211200,
      operatorIncluded: true,
      fuelIncluded: false,
      minimumHours: 4,
      effectiveFrom: '2025-10-01',
      lastUpdated: '2025-10-01',
      status: 'active'
    },
    {
      id: 'EQ-R-009',
      equipmentCode: 'EDGE-POLISH',
      equipmentName: 'Edge Polishing Machine - Countertops',
      category: 'Stone Working Equipment',
      hourlyRate: 680,
      dailyRate: 5440,
      weeklyRate: 32640,
      monthlyRate: 130560,
      operatorIncluded: true,
      fuelIncluded: false,
      minimumHours: 4,
      effectiveFrom: '2025-10-01',
      lastUpdated: '2025-10-01',
      status: 'active'
    },
    {
      id: 'EQ-R-010',
      equipmentCode: 'FORK-LIFT-3T',
      equipmentName: 'Forklift 3 Ton Capacity',
      category: 'Material Handling',
      hourlyRate: 380,
      dailyRate: 3040,
      weeklyRate: 18240,
      monthlyRate: 72960,
      operatorIncluded: true,
      fuelIncluded: true,
      minimumHours: 4,
      effectiveFrom: '2025-10-01',
      lastUpdated: '2025-10-01',
      status: 'active'
    },
    {
      id: 'EQ-R-011',
      equipmentCode: 'SAW-PANEL',
      equipmentName: 'Panel Saw - Cabinet Making',
      category: 'Woodworking Equipment',
      hourlyRate: 520,
      dailyRate: 4160,
      weeklyRate: 24960,
      monthlyRate: 99840,
      operatorIncluded: true,
      fuelIncluded: false,
      minimumHours: 4,
      effectiveFrom: '2025-10-01',
      lastUpdated: '2025-10-01',
      status: 'active'
    },
    {
      id: 'EQ-R-012',
      equipmentCode: 'EDGE-BAND',
      equipmentName: 'Edge Banding Machine',
      category: 'Woodworking Equipment',
      hourlyRate: 450,
      dailyRate: 3600,
      weeklyRate: 21600,
      monthlyRate: 86400,
      operatorIncluded: true,
      fuelIncluded: false,
      minimumHours: 4,
      effectiveFrom: '2025-10-01',
      lastUpdated: '2025-10-01',
      status: 'active'
    }
  ])

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

  const totalEquipment = equipmentRates.length
  const avgHourlyRate = equipmentRates.reduce((sum, e) => sum + e.hourlyRate, 0) / totalEquipment
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
              {equipmentRates.map((equipment) => (
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
                          defaultValue={equipment.hourlyRate}
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
                          onClick={() => setEditingId(null)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                         
                        >
                          <Save className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => setEditingId(equipment.id)}
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
