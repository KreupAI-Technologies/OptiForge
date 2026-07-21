'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Users,
  TrendingUp,
  Clock,
  DollarSign,
  ArrowLeft,
  Search,
  Filter,
  Download,
  Wrench,
  Activity,
  Award,
  AlertCircle
} from 'lucide-react'
import { estimationLaborCostService } from '@/services/estimation-labor-cost.service'

interface LaborRate {
  id: string
  skillCode: string
  skillName: string
  department: string
  category: 'direct' | 'indirect' | 'supervision'
  standardRate: number
  actualRate: number
  overtimeRate: number
  variance: number
  variancePercent: number
  headcount: number
  avgHoursPerMonth: number
  efficiency: number
  utilization: number
  status: 'optimal' | 'over-budget' | 'under-utilized'
}

interface DepartmentStats {
  department: string
  totalWorkers: number
  avgRate: number
  totalCost: number
  efficiency: number
  utilization: number
}

export default function LaborCostingPage() {
  const router = useRouter()

  const [laborRates, setLaborRates] = useState<LaborRate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const AVG_HOURS_PER_MONTH = 208

  const load = async () => {
    setIsLoading(true)
    setLoadError(null)
    try {
      // Backend returns raw ORM shape (decimals come back as strings).
      // Map onto the page's LaborRate; page-only fields are defaulted.
      const raw = (await estimationLaborCostService.getRates()) as any[]
      const categoryMap: Record<string, LaborRate['category']> = {
        direct: 'direct',
        indirect: 'indirect',
        supervision: 'supervision',
      }
      const statusMap: Record<string, LaborRate['status']> = {
        optimal: 'optimal',
        'over-budget': 'over-budget',
        'under-utilized': 'under-utilized',
      }
      const mapped: LaborRate[] = raw.map((r) => ({
        id: String(r.id),
        skillCode: r.skill ?? '',
        skillName: r.skill ?? '',
        department: r.department ?? '',
        category: categoryMap[String(r.level ?? '').toLowerCase()] ?? 'direct',
        standardRate: Number(r.standardRate ?? 0),
        actualRate: Number(r.standardRate ?? 0),
        overtimeRate: Number(r.overtimeRate ?? 0),
        variance: 0,
        variancePercent: 0,
        headcount: 0,
        avgHoursPerMonth: AVG_HOURS_PER_MONTH,
        efficiency: Number(r.efficiency ?? 0),
        utilization: Number(r.utilization ?? 0),
        status: statusMap[String(r.status ?? '').toLowerCase()] ?? 'optimal',
      }))
      setLaborRates(mapped)
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load labor rates')
      setLaborRates([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filteredLaborRates = laborRates.filter((l) => {
    const q = searchTerm.trim().toLowerCase()
    if (!q) return true
    return (
      l.skillName.toLowerCase().includes(q) ||
      l.skillCode.toLowerCase().includes(q) ||
      l.department.toLowerCase().includes(q) ||
      l.category.toLowerCase().includes(q)
    )
  })

  const handleExport = () => {
    const headers = ['Skill Code', 'Skill Name', 'Department', 'Category', 'Standard Rate', 'Actual Rate', 'Overtime Rate', 'Efficiency', 'Utilization', 'Status']
    const rows = filteredLaborRates.map((l) => [
      l.skillCode,
      l.skillName,
      l.department,
      l.category,
      l.standardRate,
      l.actualRate,
      l.overtimeRate,
      l.efficiency,
      l.utilization,
      l.status,
    ])
    const csv = [headers, ...rows]
      .map((r) => r.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'labor-rates.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  // Aggregate department stats from the fetched labor rates.
  const departmentStats: DepartmentStats[] = (() => {
    const byDept = new Map<string, LaborRate[]>()
    laborRates.forEach((l) => {
      const key = l.department || 'Unassigned'
      if (!byDept.has(key)) byDept.set(key, [])
      byDept.get(key)!.push(l)
    })
    return Array.from(byDept.entries()).map(([department, rows]) => {
      const totalWorkers = rows.reduce((s, r) => s + r.headcount, 0)
      const avgRate = rows.length
        ? Math.round(rows.reduce((s, r) => s + r.actualRate, 0) / rows.length)
        : 0
      const totalCost = rows.reduce(
        (s, r) => s + r.actualRate * r.headcount * r.avgHoursPerMonth,
        0,
      )
      const efficiency = rows.length
        ? Math.round(rows.reduce((s, r) => s + r.efficiency, 0) / rows.length)
        : 0
      const utilization = rows.length
        ? Math.round(rows.reduce((s, r) => s + r.utilization, 0) / rows.length)
        : 0
      return { department, totalWorkers, avgRate, totalCost, efficiency, utilization }
    })
  })()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'over-budget':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'under-utilized':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'direct':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'indirect':
        return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'supervision':
        return 'bg-orange-100 text-orange-700 border-orange-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getVarianceColor = (variance: number) => {
    if (variance > 5) return 'text-red-600'
    if (variance > 0) return 'text-orange-600'
    if (variance < 0) return 'text-green-600'
    return 'text-gray-600'
  }

  const totalWorkers = laborRates.reduce((sum, l) => sum + l.headcount, 0)
  const avgEfficiency = laborRates.length ? laborRates.reduce((sum, l) => sum + l.efficiency, 0) / laborRates.length : 0
  const avgUtilization = laborRates.length ? laborRates.reduce((sum, l) => sum + l.utilization, 0) / laborRates.length : 0
  const overBudgetCount = laborRates.filter(l => l.status === 'over-budget').length

  const totalMonthlyCost = laborRates.reduce((sum, l) => sum + (l.actualRate * l.headcount * l.avgHoursPerMonth), 0)

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
            <h1 className="text-2xl font-bold text-gray-900">Labor Costing</h1>
            <p className="text-sm text-gray-600 mt-1">Track labor rates and workforce productivity</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => document.getElementById('labor-search')?.focus()}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filter
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export
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
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-5 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Workers</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{totalWorkers}</p>
              <p className="text-xs text-blue-700 mt-1">Active workforce</p>
            </div>
            <Users className="h-10 w-10 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-5 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Monthly Cost</p>
              <p className="text-2xl font-bold text-green-900 mt-1">₹{(totalMonthlyCost / 10000000).toFixed(2)}Cr</p>
              <p className="text-xs text-green-700 mt-1">Total labor cost</p>
            </div>
            <DollarSign className="h-10 w-10 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-5 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Avg Efficiency</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">{avgEfficiency.toFixed(1)}%</p>
              <p className="text-xs text-purple-700 mt-1">Production efficiency</p>
            </div>
            <Award className="h-10 w-10 text-purple-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-5 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Utilization</p>
              <p className="text-2xl font-bold text-orange-900 mt-1">{avgUtilization.toFixed(1)}%</p>
              <p className="text-xs text-orange-700 mt-1">Workforce utilization</p>
            </div>
            <Activity className="h-10 w-10 text-orange-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-5 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Over Budget</p>
              <p className="text-2xl font-bold text-red-900 mt-1">{overBudgetCount}</p>
              <p className="text-xs text-red-700 mt-1">Skills over-budget</p>
            </div>
            <TrendingUp className="h-10 w-10 text-red-600" />
          </div>
        </div>
      </div>

      {/* Department Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-3">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Department Summary</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {departmentStats.map((dept) => (
              <div key={dept.department} className="p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 text-sm">{dept.department}</p>
                    <p className="text-xs text-gray-600 mt-1">{dept.totalWorkers} workers</p>
                  </div>
                  <Wrench className="h-5 w-5 text-gray-400" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Avg Rate:</span>
                    <span className="font-semibold text-gray-900">₹{dept.avgRate}/hr</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Monthly Cost:</span>
                    <span className="font-semibold text-gray-900">₹{(dept.totalCost / 100000).toFixed(1)}L</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Efficiency:</span>
                    <span className="font-semibold text-green-600">{dept.efficiency}%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Utilization:</span>
                    <span className="font-semibold text-blue-600">{dept.utilization}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Labor Rates Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Labor Rate Details</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                id="labor-search"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Standard Rate</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actual Rate</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Variance</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Headcount</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Performance</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredLaborRates.map((labor) => (
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
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(labor.category)}`}>
                      {labor.category.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <p className="text-sm font-medium text-gray-900">₹{labor.standardRate}/hr</p>
                    <p className="text-xs text-gray-600">OT: ₹{labor.overtimeRate}/hr</p>
                  </td>
                  <td className="px-3 py-2">
                    <p className="text-sm font-medium text-gray-900">₹{labor.actualRate}/hr</p>
                    <p className="text-xs text-gray-600">{labor.avgHoursPerMonth} hrs/month</p>
                  </td>
                  <td className="px-3 py-2">
                    <p className={`text-sm font-semibold ${getVarianceColor(labor.variancePercent)}`}>
                      {labor.variancePercent > 0 ? '+' : ''}{labor.variancePercent.toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-600">₹{labor.variance > 0 ? '+' : ''}{labor.variance}/hr</p>
                  </td>
                  <td className="px-3 py-2">
                    <p className="text-sm font-medium text-gray-900">{labor.headcount}</p>
                    <p className="text-xs text-gray-600">workers</p>
                  </td>
                  <td className="px-3 py-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-gray-600">Eff:</span>
                        <span className="font-semibold text-green-600">{labor.efficiency}%</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-gray-600">Util:</span>
                        <span className="font-semibold text-blue-600">{labor.utilization}%</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(labor.status)}`}>
                      {labor.status.toUpperCase().replace('-', ' ')}
                    </span>
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
