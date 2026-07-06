'use client'

import { useState, useEffect } from 'react'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Zap,
  Users,
  Clock,
  Target,
  ArrowLeft,
  Download,
  RefreshCw
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { ProductionOrphanService } from '@/services/production/production-orphan.service'

interface EfficiencyMetrics {
  overallEfficiency: number
  equipmentEfficiency: number
  laborEfficiency: number
  materialEfficiency: number
  energyEfficiency: number
  utilizationRate: number
  targetEfficiency: number
  improvementRate: number
}

interface MonthlyEfficiency {
  month: string
  overallEfficiency: number
  equipmentEfficiency: number
  laborEfficiency: number
  materialEfficiency: number
  trend: 'up' | 'down' | 'stable'
}

interface DepartmentEfficiency {
  id: string
  department: string
  efficiency: number
  target: number
  laborHours: number
  outputUnits: number
  variance: number
  trend: 'improving' | 'stable' | 'declining'
  bottlenecks: string[]
}

interface ResourceUtilization {
  id: string
  resourceName: string
  type: 'equipment' | 'labor' | 'material'
  plannedCapacity: number
  actualUtilization: number
  idleTime: number
  efficiency: number
  costPerHour: number
  totalCost: number
}

export default function EfficiencyAnalytics() {
  const router = useRouter()

  const [metrics, setMetrics] = useState<EfficiencyMetrics>({
    overallEfficiency: 84.5,
    equipmentEfficiency: 86.2,
    laborEfficiency: 82.8,
    materialEfficiency: 89.1,
    energyEfficiency: 78.3,
    utilizationRate: 87.4,
    targetEfficiency: 90.0,
    improvementRate: 5.2
  })

  // Wire top-level metrics to real OEE records; keep hardcoded values as fallback
  // defaults so the rich UI still renders when the DB is empty. Monthly/department/
  // resource breakdown tables have no clean endpoint and stay on reference data.
  useEffect(() => {
    let cancelled = false
    const avg = (nums: number[]) =>
      nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : undefined
    ;(async () => {
      try {
        const res = await ProductionOrphanService.getOeeRecords()
        const rows: any[] = Array.isArray(res) ? res : (res as any)?.data ?? []
        if (cancelled || rows.length === 0) return

        const oeeVals = rows
          .map((r) => Number(r?.oee ?? r?.oeePercentage))
          .filter((n) => Number.isFinite(n))
        const availVals = rows
          .map((r) => Number(r?.availability ?? r?.availabilityRate))
          .filter((n) => Number.isFinite(n))
        const perfVals = rows
          .map((r) => Number(r?.performance ?? r?.performanceRate))
          .filter((n) => Number.isFinite(n))

        const overall = avg(oeeVals)         // overall efficiency <- OEE
        const equipment = avg(perfVals)      // equipment efficiency <- performance
        const utilization = avg(availVals)   // utilization rate <- availability

        setMetrics((prev) => ({
          ...prev,
          ...(overall !== undefined ? { overallEfficiency: Number(overall.toFixed(1)) } : {}),
          ...(equipment !== undefined ? { equipmentEfficiency: Number(equipment.toFixed(1)) } : {}),
          ...(utilization !== undefined ? { utilizationRate: Number(utilization.toFixed(1)) } : {}),
        }))
      } catch {
        // Never crash on []/null — keep fallback defaults.
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const [monthlyData] = useState<MonthlyEfficiency[]>([
    {
      month: 'July 2025',
      overallEfficiency: 81.2,
      equipmentEfficiency: 83.5,
      laborEfficiency: 79.8,
      materialEfficiency: 86.3,
      trend: 'stable'
    },
    {
      month: 'August 2025',
      overallEfficiency: 82.8,
      equipmentEfficiency: 84.9,
      laborEfficiency: 81.2,
      materialEfficiency: 87.6,
      trend: 'up'
    },
    {
      month: 'September 2025',
      overallEfficiency: 83.6,
      equipmentEfficiency: 85.4,
      laborEfficiency: 81.9,
      materialEfficiency: 88.2,
      trend: 'up'
    },
    {
      month: 'October 2025',
      overallEfficiency: 84.5,
      equipmentEfficiency: 86.2,
      laborEfficiency: 82.8,
      materialEfficiency: 89.1,
      trend: 'up'
    }
  ])

  const [departmentData] = useState<DepartmentEfficiency[]>([
    {
      id: 'DEPT-001',
      department: 'Kitchen Sink Production',
      efficiency: 88.5,
      target: 90.0,
      laborHours: 2340,
      outputUnits: 1245,
      variance: -1.5,
      trend: 'improving',
      bottlenecks: ['Material delays', 'Setup time']
    },
    {
      id: 'DEPT-002',
      department: 'Faucet Assembly',
      efficiency: 85.2,
      target: 88.0,
      laborHours: 1890,
      outputUnits: 2890,
      variance: -2.8,
      trend: 'stable',
      bottlenecks: ['Quality checks', 'Component shortage']
    },
    {
      id: 'DEPT-003',
      department: 'Cookware Manufacturing',
      efficiency: 82.1,
      target: 85.0,
      laborHours: 3120,
      outputUnits: 4560,
      variance: -2.9,
      trend: 'declining',
      bottlenecks: ['Equipment downtime', 'Skill gap']
    },
    {
      id: 'DEPT-004',
      department: 'Cabinet Production',
      efficiency: 79.8,
      target: 85.0,
      laborHours: 2780,
      outputUnits: 890,
      variance: -5.2,
      trend: 'declining',
      bottlenecks: ['Complex processes', 'Material waste']
    },
    {
      id: 'DEPT-005',
      department: 'Appliance Assembly',
      efficiency: 86.9,
      target: 90.0,
      laborHours: 2450,
      outputUnits: 1340,
      variance: -3.1,
      trend: 'improving',
      bottlenecks: ['Testing time', 'Documentation']
    },
    {
      id: 'DEPT-006',
      department: 'Quality Control',
      efficiency: 91.3,
      target: 92.0,
      laborHours: 1560,
      outputUnits: 8920,
      variance: -0.7,
      trend: 'stable',
      bottlenecks: ['Sample size limits']
    },
    {
      id: 'DEPT-007',
      department: 'Packaging & Dispatch',
      efficiency: 89.7,
      target: 90.0,
      laborHours: 1230,
      outputUnits: 6780,
      variance: -0.3,
      trend: 'improving',
      bottlenecks: ['Peak hour delays']
    }
  ])

  const [resourceData] = useState<ResourceUtilization[]>([
    {
      id: 'RES-001',
      resourceName: 'CNC Cutting Machine #1',
      type: 'equipment',
      plannedCapacity: 168,
      actualUtilization: 145.2,
      idleTime: 22.8,
      efficiency: 86.4,
      costPerHour: 2800,
      totalCost: 406560
    },
    {
      id: 'RES-002',
      resourceName: 'Welding Station #2',
      type: 'equipment',
      plannedCapacity: 168,
      actualUtilization: 152.3,
      idleTime: 15.7,
      efficiency: 90.7,
      costPerHour: 1900,
      totalCost: 289370
    },
    {
      id: 'RES-003',
      resourceName: 'Assembly Line A',
      type: 'equipment',
      plannedCapacity: 168,
      actualUtilization: 138.6,
      idleTime: 29.4,
      efficiency: 82.5,
      costPerHour: 3200,
      totalCost: 443520
    },
    {
      id: 'RES-004',
      resourceName: 'Production Team A (12 workers)',
      type: 'labor',
      plannedCapacity: 2016,
      actualUtilization: 1845.2,
      idleTime: 170.8,
      efficiency: 91.5,
      costPerHour: 450,
      totalCost: 830340
    },
    {
      id: 'RES-005',
      resourceName: 'Production Team B (10 workers)',
      type: 'labor',
      plannedCapacity: 1680,
      actualUtilization: 1478.4,
      idleTime: 201.6,
      efficiency: 88.0,
      costPerHour: 450,
      totalCost: 665280
    },
    {
      id: 'RES-006',
      resourceName: 'Stainless Steel Stock',
      type: 'material',
      plannedCapacity: 15000,
      actualUtilization: 13450,
      idleTime: 1550,
      efficiency: 89.7,
      costPerHour: 850,
      totalCost: 11432500
    },
    {
      id: 'RES-007',
      resourceName: 'Brass Components',
      type: 'material',
      plannedCapacity: 8500,
      actualUtilization: 7890,
      idleTime: 610,
      efficiency: 92.8,
      costPerHour: 1200,
      totalCost: 9468000
    }
  ])

  const getEfficiencyColor = (efficiency: number, target: number) => {
    const percentage = (efficiency / target) * 100
    if (percentage >= 95) return 'text-green-600'
    if (percentage >= 85) return 'text-blue-600'
    if (percentage >= 75) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getEfficiencyBgColor = (efficiency: number, target: number) => {
    const percentage = (efficiency / target) * 100
    if (percentage >= 95) return 'bg-green-100 border-green-200'
    if (percentage >= 85) return 'bg-blue-100 border-blue-200'
    if (percentage >= 75) return 'bg-yellow-100 border-yellow-200'
    return 'bg-red-100 border-red-200'
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'down':
      case 'declining':
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <Minus className="h-4 w-4 text-gray-600" />
    }
  }

  const getResourceTypeColor = (type: string) => {
    switch (type) {
      case 'equipment':
        return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'labor':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'material':
        return 'bg-orange-100 text-orange-700 border-orange-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  return (
    <div className="w-full h-full px-4 py-2">
      {/* Inline Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Efficiency Analytics</h1>
            <p className="text-sm text-gray-600 mt-1">Monitor resource efficiency and utilization</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export Report</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-5 border border-blue-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Overall Efficiency</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{metrics.overallEfficiency}%</p>
              <p className="text-xs text-blue-700 mt-1">Target: {metrics.targetEfficiency}%</p>
            </div>
            <Zap className="h-10 w-10 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-5 border border-purple-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Equipment Efficiency</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">{metrics.equipmentEfficiency}%</p>
              <p className="text-xs text-purple-700 mt-1">+2.7% from last month</p>
            </div>
            <Target className="h-10 w-10 text-purple-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-5 border border-green-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Labor Efficiency</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{metrics.laborEfficiency}%</p>
              <p className="text-xs text-green-700 mt-1">+1.6% from last month</p>
            </div>
            <Users className="h-10 w-10 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-5 border border-orange-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Utilization Rate</p>
              <p className="text-2xl font-bold text-orange-900 mt-1">{metrics.utilizationRate}%</p>
              <p className="text-xs text-orange-700 mt-1">Across all resources</p>
            </div>
            <Clock className="h-10 w-10 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-3">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Efficiency Trend (Last 4 Months)</h2>
          <p className="text-sm text-gray-600 mt-1">Track efficiency improvements over time</p>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Month</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Overall</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Equipment</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Labor</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Material</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Trend</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.map((month, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4 text-sm text-gray-900 font-medium">{month.month}</td>
                    <td className="py-4 px-4 text-sm text-right">
                      <span className={`font-semibold ${getEfficiencyColor(month.overallEfficiency, metrics.targetEfficiency)}`}>
                        {month.overallEfficiency}%
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-900 text-right">{month.equipmentEfficiency}%</td>
                    <td className="py-4 px-4 text-sm text-gray-900 text-right">{month.laborEfficiency}%</td>
                    <td className="py-4 px-4 text-sm text-gray-900 text-right">{month.materialEfficiency}%</td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center">
                        {getTrendIcon(month.trend)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Department Efficiency */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-3">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Department-wise Efficiency</h2>
          <p className="text-sm text-gray-600 mt-1">Compare efficiency across departments</p>
        </div>
        <div className="p-6">
          <div className="space-y-2">
            {departmentData.map((dept) => (
              <div key={dept.id} className={`p-4 rounded-lg border ${getEfficiencyBgColor(dept.efficiency, dept.target)}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{dept.department}</h3>
                      {getTrendIcon(dept.trend)}
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {dept.outputUnits.toLocaleString()} units produced in {dept.laborHours.toLocaleString()} hours
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${getEfficiencyColor(dept.efficiency, dept.target)}`}>
                      {dept.efficiency}%
                    </p>
                    <p className="text-xs text-gray-600">Target: {dept.target}%</p>
                  </div>
                </div>

                {/* Efficiency Bar */}
                <div className="mb-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${dept.efficiency >= dept.target * 0.95
                          ? 'bg-green-500'
                          : dept.efficiency >= dept.target * 0.85
                            ? 'bg-blue-500'
                            : dept.efficiency >= dept.target * 0.75
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                        }`}
                      style={{ width: `${Math.min((dept.efficiency / dept.target) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div>
                    <p className="text-xs text-gray-600">Variance from Target</p>
                    <p className={`font-semibold ${dept.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {dept.variance >= 0 ? '+' : ''}{dept.variance}%
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-600">Key Bottlenecks</p>
                    <p className="text-xs text-gray-900 font-medium">{dept.bottlenecks.join(', ')}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Resource Utilization */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Resource Utilization Analysis</h2>
          <p className="text-sm text-gray-600 mt-1">Detailed utilization breakdown by resource type</p>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Resource</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Type</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Planned (hrs)</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Actual (hrs)</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Idle (hrs)</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Efficiency</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Total Cost</th>
                </tr>
              </thead>
              <tbody>
                {resourceData.map((resource) => (
                  <tr key={resource.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <p className="text-sm font-medium text-gray-900">{resource.resourceName}</p>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getResourceTypeColor(resource.type)}`}>
                        {resource.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-900 text-right">
                      {resource.plannedCapacity.toLocaleString()}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-900 text-right">
                      {resource.actualUtilization.toLocaleString()}
                    </td>
                    <td className="py-4 px-4 text-sm text-red-600 text-right">
                      {resource.idleTime.toLocaleString()}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className={`font-semibold ${getEfficiencyColor(resource.efficiency, 90)}`}>
                        {resource.efficiency}%
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-900 text-right font-medium">
                      ₹{resource.totalCost.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
