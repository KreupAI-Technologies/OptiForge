'use client'

import { useState, useEffect } from 'react'
import {
  TrendingUp,
  TrendingDown,
  Package,
  Users,
  Clock,
  DollarSign,
  ArrowLeft,
  Download,
  RefreshCw,
  Factory
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { ProductionOrphanService } from '@/services/production/production-orphan.service'

interface ProductivityMetrics {
  overallProductivity: number
  laborProductivity: number
  machineProductivity: number
  valueAddedPerHour: number
  unitsPerLaborHour: number
  revenuePerEmployee: number
  outputGrowth: number
  productivityIndex: number
}

interface MonthlyProductivity {
  month: string
  totalOutput: number
  laborHours: number
  machineHours: number
  productivity: number
  revenue: number
  costPerUnit: number
}

interface ProductLineProductivity {
  id: string
  productLine: string
  category: string
  unitsProduced: number
  laborHours: number
  machineHours: number
  unitsPerHour: number
  targetUnitsPerHour: number
  variance: number
  revenue: number
  costOfProduction: number
  profitMargin: number
}

interface WorkerProductivity {
  id: string
  workerName: string
  shift: string
  hoursWorked: number
  unitsProduced: number
  productivityRate: number
  qualityScore: number
  targetRate: number
  performanceRating: 'excellent' | 'good' | 'average' | 'below-average'
}

export default function ProductivityAnalytics() {
  const router = useRouter()

  const [metrics, setMetrics] = useState<ProductivityMetrics>({
    overallProductivity: 127.5,
    laborProductivity: 8.4,
    machineProductivity: 15.2,
    valueAddedPerHour: 12500,
    unitsPerLaborHour: 8.4,
    revenuePerEmployee: 4250000,
    outputGrowth: 12.3,
    productivityIndex: 118.7
  })

  // Wire top-level metrics to real productivity-metric rows; keep hardcoded values
  // as fallback defaults so the UI still renders on an empty DB. Monthly/productLine/
  // worker breakdown tables have no clean endpoint and stay on reference data.
  useEffect(() => {
    let cancelled = false
    const avg = (nums: number[]) =>
      nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : undefined
    const pick = (rows: any[], keys: string[]) =>
      avg(
        rows
          .map((r) => {
            const k = keys.find((key) => r?.[key] != null)
            return k ? Number(r[k]) : NaN
          })
          .filter((n) => Number.isFinite(n))
      )
    ;(async () => {
      try {
        const res = await ProductionOrphanService.getProductivityMetrics()
        const rows: any[] = Array.isArray(res) ? res : (res as any)?.data ?? []
        if (cancelled || rows.length === 0) return

        const productivity = pick(rows, ['productivity', 'productivityRate', 'productivityIndex'])
        const labor = pick(rows, ['laborProductivity', 'unitsPerLaborHour', 'output'])
        const machine = pick(rows, ['machineProductivity', 'unitsPerMachineHour'])
        const utilization = pick(rows, ['utilization', 'utilizationRate'])
        const growth = pick(rows, ['outputGrowth', 'growth'])

        setMetrics((prev) => ({
          ...prev,
          ...(productivity !== undefined ? { productivityIndex: Number(productivity.toFixed(1)) } : {}),
          ...(labor !== undefined
            ? { laborProductivity: Number(labor.toFixed(1)), unitsPerLaborHour: Number(labor.toFixed(1)) }
            : {}),
          ...(machine !== undefined ? { machineProductivity: Number(machine.toFixed(1)) } : {}),
          ...(utilization !== undefined ? { overallProductivity: Number(utilization.toFixed(1)) } : {}),
          ...(growth !== undefined ? { outputGrowth: Number(growth.toFixed(1)) } : {}),
        }))
      } catch {
        // Never crash on []/null — keep fallback defaults.
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const [monthlyData] = useState<MonthlyProductivity[]>([
    {
      month: 'July 2025',
      totalOutput: 18450,
      laborHours: 2340,
      machineHours: 1456,
      productivity: 7.9,
      revenue: 156800000,
      costPerUnit: 7200
    },
    {
      month: 'August 2025',
      totalOutput: 19230,
      laborHours: 2380,
      machineHours: 1489,
      productivity: 8.1,
      revenue: 168400000,
      costPerUnit: 7050
    },
    {
      month: 'September 2025',
      totalOutput: 19890,
      laborHours: 2410,
      machineHours: 1512,
      productivity: 8.3,
      revenue: 175600000,
      costPerUnit: 6980
    },
    {
      month: 'October 2025',
      totalOutput: 20540,
      laborHours: 2450,
      machineHours: 1534,
      productivity: 8.4,
      revenue: 182300000,
      costPerUnit: 6890
    }
  ])

  const [productLineData] = useState<ProductLineProductivity[]>([
    {
      id: 'PL-001',
      productLine: 'Stainless Steel Kitchen Sinks',
      category: 'Sinks',
      unitsProduced: 4560,
      laborHours: 520,
      machineHours: 342,
      unitsPerHour: 8.8,
      targetUnitsPerHour: 8.5,
      variance: 3.5,
      revenue: 45600000,
      costOfProduction: 28800000,
      profitMargin: 36.8
    },
    {
      id: 'PL-002',
      productLine: 'Premium Kitchen Faucets',
      category: 'Faucets',
      unitsProduced: 6780,
      laborHours: 780,
      machineHours: 512,
      unitsPerHour: 8.7,
      targetUnitsPerHour: 9.0,
      variance: -3.3,
      revenue: 67800000,
      costOfProduction: 42300000,
      profitMargin: 37.6
    },
    {
      id: 'PL-003',
      productLine: 'Non-Stick Cookware Sets',
      category: 'Cookware',
      unitsProduced: 3240,
      laborHours: 420,
      machineHours: 289,
      unitsPerHour: 7.7,
      targetUnitsPerHour: 8.0,
      variance: -3.8,
      revenue: 32400000,
      costOfProduction: 21800000,
      profitMargin: 32.7
    },
    {
      id: 'PL-004',
      productLine: 'Modular Kitchen Cabinets',
      category: 'Cabinets',
      unitsProduced: 1890,
      laborHours: 340,
      machineHours: 256,
      unitsPerHour: 5.6,
      targetUnitsPerHour: 6.0,
      variance: -6.7,
      revenue: 94500000,
      costOfProduction: 62400000,
      profitMargin: 34.0
    },
    {
      id: 'PL-005',
      productLine: 'Smart Kitchen Appliances',
      category: 'Appliances',
      unitsProduced: 2340,
      laborHours: 290,
      machineHours: 198,
      unitsPerHour: 8.1,
      targetUnitsPerHour: 7.5,
      variance: 8.0,
      revenue: 117000000,
      costOfProduction: 72800000,
      profitMargin: 37.8
    },
    {
      id: 'PL-006',
      productLine: 'Kitchen Storage Systems',
      category: 'Accessories',
      unitsProduced: 5670,
      laborHours: 620,
      machineHours: 412,
      unitsPerHour: 9.1,
      targetUnitsPerHour: 8.5,
      variance: 7.1,
      revenue: 28350000,
      costOfProduction: 18200000,
      profitMargin: 35.8
    }
  ])

  const [workerData] = useState<WorkerProductivity[]>([
    {
      id: 'WKR-001',
      workerName: 'Rajesh Kumar',
      shift: 'Morning',
      hoursWorked: 184,
      unitsProduced: 1845,
      productivityRate: 10.0,
      qualityScore: 98.5,
      targetRate: 9.0,
      performanceRating: 'excellent'
    },
    {
      id: 'WKR-002',
      workerName: 'Priya Singh',
      shift: 'Morning',
      hoursWorked: 184,
      unitsProduced: 1756,
      productivityRate: 9.5,
      qualityScore: 97.2,
      targetRate: 9.0,
      performanceRating: 'excellent'
    },
    {
      id: 'WKR-003',
      workerName: 'Amit Patel',
      shift: 'Afternoon',
      hoursWorked: 176,
      unitsProduced: 1584,
      productivityRate: 9.0,
      qualityScore: 95.8,
      targetRate: 9.0,
      performanceRating: 'good'
    },
    {
      id: 'WKR-004',
      workerName: 'Sneha Reddy',
      shift: 'Morning',
      hoursWorked: 184,
      unitsProduced: 1656,
      productivityRate: 9.0,
      qualityScore: 96.4,
      targetRate: 9.0,
      performanceRating: 'good'
    },
    {
      id: 'WKR-005',
      workerName: 'Vikram Sharma',
      shift: 'Afternoon',
      hoursWorked: 176,
      unitsProduced: 1496,
      productivityRate: 8.5,
      qualityScore: 94.1,
      targetRate: 9.0,
      performanceRating: 'good'
    },
    {
      id: 'WKR-006',
      workerName: 'Anjali Desai',
      shift: 'Night',
      hoursWorked: 168,
      unitsProduced: 1344,
      productivityRate: 8.0,
      qualityScore: 92.6,
      targetRate: 9.0,
      performanceRating: 'average'
    },
    {
      id: 'WKR-007',
      workerName: 'Arjun Menon',
      shift: 'Morning',
      hoursWorked: 184,
      unitsProduced: 1472,
      productivityRate: 8.0,
      qualityScore: 93.2,
      targetRate: 9.0,
      performanceRating: 'average'
    },
    {
      id: 'WKR-008',
      workerName: 'Deepika Verma',
      shift: 'Afternoon',
      hoursWorked: 176,
      unitsProduced: 1320,
      productivityRate: 7.5,
      qualityScore: 90.8,
      targetRate: 9.0,
      performanceRating: 'average'
    },
    {
      id: 'WKR-009',
      workerName: 'Karthik Rao',
      shift: 'Night',
      hoursWorked: 168,
      unitsProduced: 1176,
      productivityRate: 7.0,
      qualityScore: 88.5,
      targetRate: 9.0,
      performanceRating: 'below-average'
    },
    {
      id: 'WKR-010',
      workerName: 'Pooja Nair',
      shift: 'Morning',
      hoursWorked: 184,
      unitsProduced: 1564,
      productivityRate: 8.5,
      qualityScore: 94.7,
      targetRate: 9.0,
      performanceRating: 'good'
    }
  ])

  const getPerformanceColor = (rating: string) => {
    switch (rating) {
      case 'excellent':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'good':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'average':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'below-average':
        return 'bg-red-100 text-red-700 border-red-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getVarianceColor = (variance: number) => {
    if (variance >= 5) return 'text-green-600'
    if (variance >= 0) return 'text-blue-600'
    if (variance >= -5) return 'text-yellow-600'
    return 'text-red-600'
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
            <h1 className="text-2xl font-bold text-gray-900">Productivity Analytics</h1>
            <p className="text-sm text-gray-600 mt-1">Track output and performance metrics</p>
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
              <p className="text-sm font-medium text-blue-600">Productivity Index</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{metrics.productivityIndex}</p>
              <p className="text-xs text-blue-700 mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                +{metrics.outputGrowth}% growth
              </p>
            </div>
            <Factory className="h-10 w-10 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-5 border border-green-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Labor Productivity</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{metrics.laborProductivity}</p>
              <p className="text-xs text-green-700 mt-1">units per labor hour</p>
            </div>
            <Users className="h-10 w-10 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-5 border border-purple-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Machine Productivity</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">{metrics.machineProductivity}</p>
              <p className="text-xs text-purple-700 mt-1">units per machine hour</p>
            </div>
            <Package className="h-10 w-10 text-purple-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-5 border border-orange-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Value Added/Hour</p>
              <p className="text-2xl font-bold text-orange-900 mt-1">₹{(metrics.valueAddedPerHour / 1000).toFixed(1)}K</p>
              <p className="text-xs text-orange-700 mt-1">per productive hour</p>
            </div>
            <DollarSign className="h-10 w-10 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Monthly Productivity Trend */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-3">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Monthly Productivity Trend</h2>
          <p className="text-sm text-gray-600 mt-1">Track production output and efficiency over time</p>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Month</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Output (Units)</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Labor Hours</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Machine Hours</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Productivity</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Revenue</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Cost/Unit</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.map((month, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4 text-sm text-gray-900 font-medium">{month.month}</td>
                    <td className="py-4 px-4 text-sm text-gray-900 text-right font-semibold">
                      {month.totalOutput.toLocaleString()}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-900 text-right">
                      {month.laborHours.toLocaleString()}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-900 text-right">
                      {month.machineHours.toLocaleString()}
                    </td>
                    <td className="py-4 px-4 text-sm text-right">
                      <span className="font-semibold text-blue-600">{month.productivity}</span>
                      <span className="text-xs text-gray-600"> units/hr</span>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-900 text-right">
                      ₹{(month.revenue / 10000000).toFixed(2)}Cr
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-900 text-right">
                      ₹{month.costPerUnit.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Product Line Productivity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-3">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Product Line Productivity</h2>
          <p className="text-sm text-gray-600 mt-1">Compare productivity across different product lines</p>
        </div>
        <div className="p-6">
          <div className="space-y-2">
            {productLineData.map((line) => (
              <div key={line.id} className="p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{line.productLine}</h3>
                    <p className="text-xs text-gray-600 mt-1">
                      {line.unitsProduced.toLocaleString()} units | {line.laborHours} labor hrs | {line.machineHours} machine hrs
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">{line.unitsPerHour}</p>
                    <p className="text-xs text-gray-600">units/hour</p>
                  </div>
                </div>

                {/* Productivity Bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                    <span>vs Target: {line.targetUnitsPerHour} units/hr</span>
                    <span className={`font-semibold ${getVarianceColor(line.variance)}`}>
                      {line.variance >= 0 ? '+' : ''}{line.variance.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${line.variance >= 5
                          ? 'bg-green-500'
                          : line.variance >= 0
                            ? 'bg-blue-500'
                            : line.variance >= -5
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                        }`}
                      style={{ width: `${Math.min((line.unitsPerHour / line.targetUnitsPerHour) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <p className="text-xs text-gray-600">Revenue</p>
                    <p className="font-semibold text-gray-900">₹{(line.revenue / 10000000).toFixed(2)}Cr</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Production Cost</p>
                    <p className="font-semibold text-gray-900">₹{(line.costOfProduction / 10000000).toFixed(2)}Cr</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-600">Profit Margin</p>
                    <p className="font-semibold text-green-600">{line.profitMargin}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Worker Productivity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Top Worker Productivity</h2>
          <p className="text-sm text-gray-600 mt-1">Individual worker performance tracking</p>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Worker</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Shift</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Hours</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Units</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Rate</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Quality</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Performance</th>
                </tr>
              </thead>
              <tbody>
                {workerData.map((worker) => (
                  <tr key={worker.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <p className="text-sm font-medium text-gray-900">{worker.workerName}</p>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600 text-center">{worker.shift}</td>
                    <td className="py-4 px-4 text-sm text-gray-900 text-right">{worker.hoursWorked}</td>
                    <td className="py-4 px-4 text-sm text-gray-900 text-right font-medium">
                      {worker.unitsProduced.toLocaleString()}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className={`font-semibold ${worker.productivityRate >= worker.targetRate ? 'text-green-600' : 'text-orange-600'
                        }`}>
                        {worker.productivityRate}
                      </span>
                      <span className="text-xs text-gray-600"> /hr</span>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-900 text-right">{worker.qualityScore}%</td>
                    <td className="py-4 px-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPerformanceColor(worker.performanceRating)}`}>
                        {worker.performanceRating.toUpperCase()}
                      </span>
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
