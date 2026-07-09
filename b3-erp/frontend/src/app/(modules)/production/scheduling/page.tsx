'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Filter, Download, Eye, Edit2, Play, Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { exportToCsv } from '@/lib/export'
import { ProductionOrphanService } from '@/services/production/production-orphan.service'

interface ProductionSchedule {
  id: string
  schedule_id: string
  work_order_id: string
  product_name: string
  product_code: string
  work_center: string
  planned_start: string
  planned_end: string
  actual_start: string | null
  actual_end: string | null
  quantity: number
  unit: string
  status: 'scheduled' | 'in_progress' | 'completed' | 'delayed' | 'on_hold'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assigned_to: string
}

const ProductionSchedulingPage = () => {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [workCenterFilter, setWorkCenterFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const [schedules, setSchedules] = useState<ProductionSchedule[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [startingId, setStartingId] = useState<string | null>(null)
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const load = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const rows = await ProductionOrphanService.getScheduleLines()
      const mapped: ProductionSchedule[] = (Array.isArray(rows) ? rows : []).map((r: any) => ({
        id: String(r.id ?? ''),
        schedule_id: r.scheduleCode ?? r.schedule_code ?? '',
        work_order_id: r.workOrderId ?? r.work_order_id ?? '',
        product_name: r.productName ?? r.product_name ?? '',
        product_code: r.productCode ?? r.product_code ?? '',
        work_center: r.workCenter ?? r.work_center ?? '',
        planned_start: r.plannedStart ?? r.planned_start ?? '',
        planned_end: r.plannedEnd ?? r.planned_end ?? '',
        actual_start: r.actualStart ?? r.actual_start ?? null,
        actual_end: r.actualEnd ?? r.actual_end ?? null,
        quantity: Number(r.quantity ?? 0),
        unit: r.unit ?? 'units',
        status: (r.status ?? 'scheduled') as ProductionSchedule['status'],
        priority: (r.priority ?? 'medium') as ProductionSchedule['priority'],
        assigned_to: r.assignedTo ?? r.assigned_to ?? '',
      }))
      setSchedules(mapped)
    } catch (e: any) {
      setError(e?.message || 'Failed to load production schedules')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800'
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'delayed':
        return 'bg-red-100 text-red-800'
      case 'on_hold':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600'
      case 'high':
        return 'text-orange-600'
      case 'medium':
        return 'text-yellow-600'
      case 'low':
        return 'text-green-600'
      default:
        return 'text-gray-600'
    }
  }

  const filteredSchedules = schedules.filter(schedule => {
    const matchesSearch =
      schedule.schedule_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.work_order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.product_code.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || schedule.status === statusFilter
    const matchesWorkCenter = workCenterFilter === 'all' || schedule.work_center === workCenterFilter

    return matchesSearch && matchesStatus && matchesWorkCenter
  })

  const totalPages = Math.ceil(filteredSchedules.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedSchedules = filteredSchedules.slice(startIndex, startIndex + itemsPerPage)

  const scheduledToday = schedules.filter(s => s.status === 'scheduled').length
  const inProgress = schedules.filter(s => s.status === 'in_progress').length
  const completed = schedules.filter(s => s.status === 'completed').length
  const delayed = schedules.filter(s => s.status === 'delayed').length

  const [publishing, setPublishing] = useState(false)
  const [optimizing, setOptimizing] = useState(false)

  // Publish every scheduled line via POST /production/schedule-lines/publish.
  const handlePublish = async () => {
    try {
      setPublishing(true)
      setActionMessage(null)
      const res = await ProductionOrphanService.publishScheduleLines()
      setActionMessage({ type: 'success', text: `Published ${res?.published ?? 0} schedule line(s).` })
      await load()
    } catch (e: any) {
      setActionMessage({ type: 'error', text: e?.message || 'Failed to publish schedule.' })
    } finally {
      setPublishing(false)
    }
  }

  // Level-load / optimize the schedule via POST /production/schedule-lines/optimize.
  const handleOptimize = async () => {
    try {
      setOptimizing(true)
      setActionMessage(null)
      const workCenter = workCenterFilter !== 'all' ? workCenterFilter : undefined
      const res = await ProductionOrphanService.optimizeScheduleLines(workCenter)
      setActionMessage({ type: 'success', text: `Optimized ${res?.optimized ?? 0} schedule line(s).` })
      await load()
    } catch (e: any) {
      setActionMessage({ type: 'error', text: e?.message || 'Failed to optimize schedule.' })
    } finally {
      setOptimizing(false)
    }
  }

  const handleExport = () => {
    exportToCsv('production-schedule', filteredSchedules as unknown as Record<string, unknown>[])
  }

  const handleView = (id: string) => {
    router.push(`/production/scheduling/view/${id}`)
  }

  const handleEdit = (id: string) => {
    router.push(`/production/scheduling/edit/${id}`)
  }

  const handleStart = async (id: string) => {
    const schedule = schedules.find(s => s.id === id)
    if (!schedule) return
    if (!confirm(`Start production for Schedule ${schedule.schedule_id}?\n\nWork Order: ${schedule.work_order_id}\nProduct: ${schedule.product_name}\nQuantity: ${schedule.quantity} ${schedule.unit}`)) {
      return
    }
    try {
      setStartingId(id)
      setActionMessage(null)
      await ProductionOrphanService.updateScheduleLine(id, { status: 'in_progress' })
      setActionMessage({ type: 'success', text: `Production started for ${schedule.schedule_id}.` })
      await load()
    } catch (e: any) {
      setActionMessage({ type: 'error', text: e?.message || 'Failed to start production.' })
    } finally {
      setStartingId(null)
    }
  }

  return (
    <div className="w-full min-h-screen px-3 py-2">
      {loading && (
        <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          Loading production schedules…
        </div>
      )}
      {error && !loading && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {actionMessage && (
        <div
          className={`mb-3 rounded-lg border px-4 py-3 text-sm ${
            actionMessage.type === 'success'
              ? 'border-green-200 bg-green-50 text-green-700'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {actionMessage.text}
        </div>
      )}
      {/* Stats Cards */}
      <div className="mb-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Scheduled Today</p>
                <p className="text-2xl font-bold text-blue-900 mt-1">{scheduledToday}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">In Progress</p>
                <p className="text-2xl font-bold text-yellow-900 mt-1">{inProgress}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Completed</p>
                <p className="text-2xl font-bold text-green-900 mt-1">{completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3 border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Delayed</p>
                <p className="text-2xl font-bold text-red-900 mt-1">{delayed}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
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
                  placeholder="Search by Schedule ID, Work Order, Product..."
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
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="delayed">Delayed</option>
                    <option value="on_hold">On Hold</option>
                  </select>
                </div>

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
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleOptimize}
                disabled={optimizing}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Clock className="w-5 h-5" />
                {optimizing ? 'Optimizing…' : 'Optimize'}
              </button>
              <button
                onClick={handlePublish}
                disabled={publishing}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle className="w-5 h-5" />
                {publishing ? 'Publishing…' : 'Publish'}
              </button>
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-5 h-5" />
                Export Report
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-24rem)]">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Schedule ID
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Work Order
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product Name
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Work Center
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Planned Start
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Planned End
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actual Start
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actual End
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
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
              {paginatedSchedules.map((schedule) => (
                <tr key={schedule.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{schedule.schedule_id}</div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{schedule.work_order_id}</div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-sm font-medium text-gray-900">{schedule.product_name}</div>
                    <div className="text-sm text-gray-500">{schedule.product_code}</div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{schedule.work_center}</div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{schedule.planned_start}</div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{schedule.planned_end}</div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {schedule.actual_start || '-'}
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {schedule.actual_end || '-'}
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {schedule.quantity} {schedule.unit}
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(schedule.status)}`}>
                      {schedule.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleView(schedule.id)}
                        className="text-blue-600 hover:text-blue-900"
                       
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleEdit(schedule.id)}
                        className="text-yellow-600 hover:text-yellow-900"
                       
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      {schedule.status === 'scheduled' && (
                        <button
                          onClick={() => handleStart(schedule.id)}
                          disabled={startingId === schedule.id}
                          className="text-green-600 hover:text-green-900 disabled:opacity-40"

                        >
                          <Play className="w-5 h-5" />
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
                {Math.min(startIndex + itemsPerPage, filteredSchedules.length)}
              </span>{' '}
              of <span className="font-medium">{filteredSchedules.length}</span> results
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

export default ProductionSchedulingPage
