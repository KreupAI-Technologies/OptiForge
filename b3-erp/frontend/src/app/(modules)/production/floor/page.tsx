'use client'

import React, { useState, useEffect } from 'react'
import { Search, Filter, Download, Eye, Edit2, Pause, Users, Activity, Package, TrendingUp } from 'lucide-react'
import { exportToCsv } from '@/lib/export'
import { ProductionOrphanService } from '@/services/production/production-orphan.service'

interface FloorActivity {
  id: string
  activity_id: string
  work_center: string
  operator_name: string
  employee_id: string
  work_order_id: string
  product_name: string
  product_code: string
  operation: string
  start_time: string
  duration_minutes: number
  output_qty: number
  target_qty: number
  efficiency_percent: number
  status: 'active' | 'paused' | 'completed'
  shift: 'Morning' | 'Afternoon' | 'Night'
}

const ProductionFloorPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [workCenterFilter, setWorkCenterFilter] = useState('all')
  const [shiftFilter, setShiftFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const [activities, setActivities] = useState<FloorActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const rows = await ProductionOrphanService.getFloorActivities()
        if (!active) return
        const mapped: FloorActivity[] = (Array.isArray(rows) ? rows : []).map((r: any) => ({
          id: String(r.id ?? ''),
          activity_id: r.activityId ?? r.activity_id ?? '',
          work_center: r.workCenter ?? r.work_center ?? '',
          operator_name: r.operatorName ?? r.operator_name ?? '',
          employee_id: r.employeeId ?? r.employee_id ?? '',
          work_order_id: r.workOrderId ?? r.work_order_id ?? '',
          product_name: r.productName ?? r.product_name ?? '',
          product_code: r.productCode ?? r.product_code ?? '',
          operation: r.operation ?? '',
          start_time: r.startTime ?? r.start_time ?? '',
          duration_minutes: Number(r.durationMinutes ?? r.duration_minutes ?? 0),
          output_qty: Number(r.outputQty ?? r.output_qty ?? 0),
          target_qty: Number(r.targetQty ?? r.target_qty ?? 0),
          efficiency_percent: Number(r.efficiencyPercent ?? r.efficiency_percent ?? 0),
          status: (r.status ?? 'active') as FloorActivity['status'],
          shift: (r.shift ?? 'Morning') as FloorActivity['shift'],
        }))
        setActivities(mapped)
      } catch (e: any) {
        if (active) setError(e?.message || 'Failed to load floor activities')
      } finally {
        if (active) setLoading(false)
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
        return 'bg-green-100 text-green-800'
      case 'paused':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 90) return 'text-green-600 font-semibold'
    if (efficiency >= 70) return 'text-yellow-600 font-semibold'
    return 'text-red-600 font-semibold'
  }

  const getEfficiencyBgColor = (efficiency: number) => {
    if (efficiency >= 90) return 'bg-green-100'
    if (efficiency >= 70) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  const filteredActivities = activities.filter(activity => {
    const matchesSearch =
      activity.activity_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.work_order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.product_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.operator_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.operation.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesWorkCenter = workCenterFilter === 'all' || activity.work_center === workCenterFilter
    const matchesShift = shiftFilter === 'all' || activity.shift === shiftFilter

    return matchesSearch && matchesWorkCenter && matchesShift
  })

  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedActivities = filteredActivities.slice(startIndex, startIndex + itemsPerPage)

  const activeWorkCenters = new Set(activities.filter(a => a.status === 'active').map(a => a.work_center)).size
  const workersPresent = new Set(activities.map(a => a.employee_id)).size
  const currentOutput = activities.filter(a => a.status === 'active').reduce((sum, a) => sum + a.output_qty, 0)
  const totalTarget = activities.filter(a => a.status === 'active').reduce((sum, a) => sum + a.target_qty, 0)
  const overallEfficiency = totalTarget > 0 ? ((currentOutput / totalTarget) * 100).toFixed(1) : '0.0'

  const handleExport = () => {
    exportToCsv('production-floor', filteredActivities as unknown as Record<string, unknown>[])
  }

  const handleView = (id: string) => {
    console.log('View floor activity:', id)
  }

  const handleEdit = (id: string) => {
    console.log('Edit floor activity:', id)
  }

  const handlePause = (id: string) => {
    console.log('Pause floor activity:', id)
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  return (
    <div className="w-full min-h-screen px-3 py-2">
      {loading && (
        <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          Loading floor activities…
        </div>
      )}
      {error && !loading && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {/* Stats Cards */}
      <div className="mb-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Active Work Centers</p>
                <p className="text-2xl font-bold text-purple-900 mt-1">{activeWorkCenters}</p>
              </div>
              <Activity className="h-8 w-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Workers Present</p>
                <p className="text-2xl font-bold text-blue-900 mt-1">{workersPresent}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Current Output</p>
                <p className="text-2xl font-bold text-green-900 mt-1">{currentOutput}</p>
              </div>
              <Package className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Efficiency</p>
                <p className="text-2xl font-bold text-orange-900 mt-1">{overallEfficiency}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
            <div className="flex-1 flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by Activity ID, Work Order, Product, Operator..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                    value={workCenterFilter}
                    onChange={(e) => setWorkCenterFilter(e.target.value)}
                  >
                    <option value="all">All Work Centers</option>
                    <option value="Assembly Line 1">Assembly Line 1</option>
                    <option value="Assembly Line 2">Assembly Line 2</option>
                    <option value="Machining Center">Machining Center</option>
                    <option value="Welding Shop">Welding Shop</option>
                    <option value="Paint Shop">Paint Shop</option>
                    <option value="Quality Station">Quality Station</option>
                  </select>
                </div>

                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                    value={shiftFilter}
                    onChange={(e) => setShiftFilter(e.target.value)}
                  >
                    <option value="all">All Shifts</option>
                    <option value="Morning">Morning (6AM-2PM)</option>
                    <option value="Afternoon">Afternoon (2PM-10PM)</option>
                    <option value="Night">Night (10PM-6AM)</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-5 h-5" />
              Export Report
            </button>
          </div>
        </div>

        <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-24rem)]">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Activity ID
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Work Center
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Operator Name
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Work Order
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Operation
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Start Time
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Output/Target
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Efficiency %
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedActivities.map((activity) => (
                <tr key={activity.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{activity.activity_id}</div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{activity.work_center}</div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{activity.operator_name}</div>
                    <div className="text-sm text-gray-500">{activity.employee_id}</div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{activity.work_order_id}</div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-sm font-medium text-gray-900">{activity.product_name}</div>
                    <div className="text-sm text-gray-500">{activity.product_code}</div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{activity.operation}</div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{activity.start_time}</div>
                    <div className="text-sm text-gray-500">{activity.shift}</div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatDuration(activity.duration_minutes)}</div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {activity.output_qty} / {activity.target_qty}
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className={`px-2 py-1 rounded-full text-sm ${getEfficiencyBgColor(activity.efficiency_percent)}`}>
                      <span className={getEfficiencyColor(activity.efficiency_percent)}>
                        {activity.efficiency_percent}%
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(activity.status)}`}>
                      {activity.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleView(activity.id)}
                        className="text-blue-600 hover:text-blue-900"
                       
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleEdit(activity.id)}
                        className="text-yellow-600 hover:text-yellow-900"
                       
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      {activity.status === 'active' && (
                        <button
                          onClick={() => handlePause(activity.id)}
                          className="text-orange-600 hover:text-orange-900"
                         
                        >
                          <Pause className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-3 py-2 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min(startIndex + itemsPerPage, filteredActivities.length)}
              </span>{' '}
              of <span className="font-medium">{filteredActivities.length}</span> results
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-4 py-2 border rounded-lg text-sm font-medium ${
                    currentPage === i + 1
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductionFloorPage
