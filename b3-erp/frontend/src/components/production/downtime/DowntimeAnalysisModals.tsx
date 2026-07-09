'use client'

import React, { useState } from 'react'
import {
  X,
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
  PieChart,
  Calendar,
  Clock,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Download,
  Filter,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Wrench,
  FileText,
  RefreshCw,
  Eye,
  Settings,
  Target,
  Award,
  TrendingDown as Stable,
} from 'lucide-react'

// =====================================================
// INTERFACES
// =====================================================

export interface DowntimeEvent {
  id: string
  date: string
  duration: number
  category: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  cause: string
  status: 'resolved' | 'ongoing' | 'pending'
}

export interface CategoryBreakdown {
  category: string
  count: number
  totalHours: number
  percentage: number
  avgDuration: number
  trend: 'increasing' | 'stable' | 'decreasing'
}

export interface EquipmentAnalysisData {
  equipmentId: string
  equipmentName: string
  type: string
  period: string
  metrics: {
    totalDowntime: number
    eventCount: number
    mtbf: number
    mttr: number
    trend: 'improving' | 'stable' | 'worsening'
    targetMTBF: number
    targetMTTR: number
  }
  events: DowntimeEvent[]
  categoryBreakdown: CategoryBreakdown[]
  costImpact: {
    total: number
    average: number
    trend: number
  }
  recommendations: string[]
}

export interface CategoryTrendData {
  category: string
  totalEvents: number
  totalHours: number
  avgDuration: number
  totalCost: number
  trendStatus: 'increasing' | 'stable' | 'decreasing'
  monthlyTrends: Array<{
    month: string
    count: number
    hours: number
    avgDuration: number
    cost: number
  }>
  topEquipment: Array<{
    equipment: string
    eventCount: number
    totalHours: number
    percentage: number
    trend: 'improving' | 'stable' | 'worsening'
  }>
}

export interface PeriodComparisonData {
  period1: {
    start: string
    end: string
    metrics: {
      totalDowntime: number
      eventCount: number
      mtbf: number
      mttr: number
      totalCost: number
      availability: number
      categoryBreakdown: CategoryBreakdown[]
    }
  }
  period2: {
    start: string
    end: string
    metrics: {
      totalDowntime: number
      eventCount: number
      mtbf: number
      mttr: number
      totalCost: number
      availability: number
      categoryBreakdown: CategoryBreakdown[]
    }
  }
  variance: {
    totalDowntime: number
    eventCount: number
    mtbf: number
    mttr: number
    totalCost: number
    availability: number
  }
  insights: string[]
}

export interface QuickAnalysisData {
  period: string
  summary: {
    totalDowntime: number
    totalEvents: number
    availability: number
  }
  topEquipment: Array<{
    rank: number
    equipment: string
    downtimeHours: number
    eventCount: number
    severity: 'critical' | 'high' | 'medium'
  }>
  topCategories: Array<{
    category: string
    percentage: number
    hours: number
    count: number
  }>
  recommendations: Array<{
    text: string
    priority: 'high' | 'medium' | 'low'
  }>
}

// =====================================================
// EQUIPMENT ANALYSIS MODAL
// =====================================================

interface EquipmentAnalysisModalProps {
  isOpen: boolean
  onClose: () => void
  data: EquipmentAnalysisData
  onExportReport?: () => void
  onViewAllEvents?: () => void
  onScheduleMaintenance?: () => void
}

export function EquipmentAnalysisModal({
  isOpen,
  onClose,
  data,
  onExportReport,
  onViewAllEvents,
  onScheduleMaintenance,
}: EquipmentAnalysisModalProps) {
  const [sortField, setSortField] = useState<string>('date')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  if (!isOpen) return null

  const getTrendIcon = (trend: 'improving' | 'stable' | 'worsening') => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="h-5 w-5 text-green-600" />
      case 'worsening':
        return <TrendingDown className="h-5 w-5 text-red-600" />
      default:
        return <Minus className="h-5 w-5 text-yellow-600" />
    }
  }

  const getTrendBadge = (trend: 'improving' | 'stable' | 'worsening') => {
    const styles = {
      improving: 'bg-green-100 text-green-800',
      stable: 'bg-yellow-100 text-yellow-800',
      worsening: 'bg-red-100 text-red-800',
    }

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${styles[trend]}`}>
        {getTrendIcon(trend)}
        {trend.charAt(0).toUpperCase() + trend.slice(1)}
      </span>
    )
  }

  const getSeverityBadge = (severity: string) => {
    const styles = {
      critical: 'bg-red-100 text-red-800',
      high: 'bg-orange-100 text-orange-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-blue-100 text-blue-800',
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[severity as keyof typeof styles]}`}>
        {severity.charAt(0).toUpperCase() + severity.slice(1)}
      </span>
    )
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      resolved: 'bg-green-100 text-green-800',
      ongoing: 'bg-orange-100 text-orange-800',
      pending: 'bg-gray-100 text-gray-800',
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />

      <div className="absolute inset-4 flex items-center justify-center">
        <div className="relative bg-white rounded-lg shadow-xl w-full  max-h-full overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-3 py-2 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className="h-6 w-6 text-white" />
              <h2 className="text-xl font-semibold text-white">Equipment Analysis</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-indigo-800 p-2 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-3">
            {/* Equipment Header */}
            <div className="mb-3 pb-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{data.equipmentName}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {data.type} • {data.period}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {getTrendBadge(data.metrics.trend)}
                </div>
              </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
              {/* Total Downtime */}
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <Clock className="h-5 w-5 text-indigo-600" />
                  <div className="flex items-center gap-1 text-sm">
                    {data.metrics.trend === 'improving' ? (
                      <ArrowDownRight className="h-4 w-4 text-green-600" />
                    ) : (
                      <ArrowUpRight className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">{data.metrics.totalDowntime.toFixed(1)}</p>
                <p className="text-sm text-gray-500 mt-1">Total Downtime (hours)</p>
              </div>

              {/* Event Count */}
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  <div className="flex items-center gap-1 text-sm">
                    {data.metrics.trend === 'improving' ? (
                      <ArrowDownRight className="h-4 w-4 text-green-600" />
                    ) : (
                      <ArrowUpRight className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">{data.metrics.eventCount}</p>
                <p className="text-sm text-gray-500 mt-1">Event Count</p>
              </div>

              {/* MTBF */}
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  <span className={`text-xs px-2 py-1 rounded ${
                    data.metrics.mtbf >= data.metrics.targetMTBF
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {data.metrics.mtbf >= data.metrics.targetMTBF ? 'Above' : 'Below'} Target
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{data.metrics.mtbf.toFixed(1)}</p>
                <p className="text-sm text-gray-500 mt-1">
                  MTBF (hours) • Target: {data.metrics.targetMTBF}
                </p>
              </div>

              {/* MTTR */}
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <Wrench className="h-5 w-5 text-purple-600" />
                  <span className={`text-xs px-2 py-1 rounded ${
                    data.metrics.mttr <= data.metrics.targetMTTR
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {data.metrics.mttr <= data.metrics.targetMTTR ? 'Below' : 'Above'} Target
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{data.metrics.mttr.toFixed(1)}</p>
                <p className="text-sm text-gray-500 mt-1">
                  MTTR (hours) • Target: {data.metrics.targetMTTR}
                </p>
              </div>
            </div>

            {/* Performance Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
              {/* Monthly Downtime Trend Chart Placeholder */}
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="h-5 w-5 text-indigo-600" />
                  <h4 className="text-lg font-semibold text-gray-900">Monthly Downtime Trend</h4>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 flex items-center justify-center h-64">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">Bar Chart Placeholder</p>
                  </div>
                </div>
              </div>

              {/* Downtime by Category Pie Chart Placeholder */}
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <PieChart className="h-5 w-5 text-purple-600" />
                  <h4 className="text-lg font-semibold text-gray-900">Downtime by Category</h4>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 flex items-center justify-center h-64">
                  <div className="text-center">
                    <PieChart className="h-12 w-12 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">Pie Chart Placeholder</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Breakdown History Table */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-lg font-semibold text-gray-900">Breakdown History</h4>
                <button
                  onClick={onViewAllEvents}
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                >
                  View All Events
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          onClick={() => handleSort('date')}
                          className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        >
                          <div className="flex items-center gap-2">
                            Date
                            {sortField === 'date' && (
                              sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                            )}
                          </div>
                        </th>
                        <th
                          onClick={() => handleSort('duration')}
                          className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        >
                          <div className="flex items-center gap-2">
                            Duration
                            {sortField === 'duration' && (
                              sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                            )}
                          </div>
                        </th>
                        <th
                          onClick={() => handleSort('category')}
                          className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        >
                          <div className="flex items-center gap-2">
                            Category
                            {sortField === 'category' && (
                              sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                            )}
                          </div>
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Severity
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cause
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
                      {data.events.slice(0, 10).map((event) => (
                        <tr key={event.id} className="hover:bg-gray-50">
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                            {event.date}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                            {event.duration.toFixed(1)} hrs
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                            {event.category}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            {getSeverityBadge(event.severity)}
                          </td>
                          <td className="px-3 py-2 text-sm text-gray-900 max-w-xs truncate">
                            {event.cause}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            {getStatusBadge(event.status)}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm">
                            <button className="text-indigo-600 hover:text-indigo-900">
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="mb-3">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Category Breakdown</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {data.categoryBreakdown.map((category, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-medium text-gray-900">{category.category}</h5>
                      {category.trend === 'increasing' && (
                        <TrendingUp className="h-4 w-4 text-red-600" />
                      )}
                      {category.trend === 'decreasing' && (
                        <TrendingDown className="h-4 w-4 text-green-600" />
                      )}
                      {category.trend === 'stable' && (
                        <Minus className="h-4 w-4 text-yellow-600" />
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Events:</span>
                        <span className="font-medium text-gray-900">{category.count}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Hours:</span>
                        <span className="font-medium text-gray-900">
                          {category.totalHours.toFixed(1)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Percentage:</span>
                        <span className="font-medium text-gray-900">
                          {category.percentage.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div
                          className="bg-indigo-600 h-2 rounded-full"
                          style={{ width: `${category.percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cost Analysis */}
            <div className="mb-3">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Cost Analysis</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-gray-500">Total Cost Impact</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    ${data.costImpact.total.toLocaleString()}
                  </p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                    <span className="text-sm text-gray-500">Average per Event</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    ${data.costImpact.average.toLocaleString()}
                  </p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                    <span className="text-sm text-gray-500">Cost Trend</span>
                  </div>
                  <p className={`text-2xl font-bold ${
                    data.costImpact.trend > 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {data.costImpact.trend > 0 ? '+' : ''}{data.costImpact.trend.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>

            {/* Recommendations Section */}
            {data.metrics.trend === 'worsening' && data.recommendations.length > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-6 w-6 text-orange-600 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">
                      Recommended Actions
                    </h4>
                    <ul className="space-y-2">
                      {data.recommendations.map((recommendation, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-orange-600 mt-1">•</span>
                          <span className="text-gray-700">{recommendation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="border-t border-gray-200 px-3 py-2 bg-gray-50 flex items-center justify-end gap-3">
            <button
              onClick={onExportReport}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
            >
              <Download className="h-4 w-4" />
              Export Report
            </button>
            <button
              onClick={onViewAllEvents}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
            >
              <Eye className="h-4 w-4" />
              View All Events
            </button>
            <button
              onClick={onScheduleMaintenance}
              className="flex items-center gap-2 px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 font-medium"
            >
              <Settings className="h-4 w-4" />
              Schedule Maintenance
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// =====================================================
// CATEGORY TREND MODAL
// =====================================================

interface CategoryTrendModalProps {
  isOpen: boolean
  onClose: () => void
  data: CategoryTrendData
  onExport?: () => void
  onFilterPeriod?: () => void
}

export function CategoryTrendModal({
  isOpen,
  onClose,
  data,
  onExport,
  onFilterPeriod,
}: CategoryTrendModalProps) {
  if (!isOpen) return null

  const getTrendBadge = (status: 'increasing' | 'stable' | 'decreasing') => {
    const styles = {
      increasing: 'bg-red-100 text-red-800',
      stable: 'bg-yellow-100 text-yellow-800',
      decreasing: 'bg-green-100 text-green-800',
    }

    const icons = {
      increasing: <TrendingUp className="h-4 w-4" />,
      stable: <Minus className="h-4 w-4" />,
      decreasing: <TrendingDown className="h-4 w-4" />,
    }

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${styles[status]}`}>
        {icons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const getEquipmentTrendIcon = (trend: 'improving' | 'stable' | 'worsening') => {
    switch (trend) {
      case 'improving':
        return <TrendingDown className="h-4 w-4 text-green-600" />
      case 'worsening':
        return <TrendingUp className="h-4 w-4 text-red-600" />
      default:
        return <Minus className="h-4 w-4 text-yellow-600" />
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />

      <div className="absolute inset-4 flex items-center justify-center">
        <div className="relative bg-white rounded-lg shadow-xl w-full  max-h-full overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-3 py-2 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <PieChart className="h-6 w-6 text-white" />
              <h2 className="text-xl font-semibold text-white">Category Trend Analysis</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-purple-800 p-2 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-3">
            {/* Category Header */}
            <div className="mb-3 pb-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{data.category}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm text-gray-500">
                      Total Events: <span className="font-semibold text-gray-900">{data.totalEvents}</span>
                    </span>
                    <span className="text-sm text-gray-500">
                      Total Hours: <span className="font-semibold text-gray-900">{data.totalHours.toFixed(1)}</span>
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getTrendBadge(data.trendStatus)}
                </div>
              </div>
            </div>

            {/* Trend Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-5 w-5 text-purple-600" />
                  <span className="text-sm text-gray-500">Average Duration</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {data.avgDuration.toFixed(0)} min
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <span className="text-sm text-gray-500">Total Cost Impact</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  ${data.totalCost.toLocaleString()}
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  <span className="text-sm text-gray-500">Trend Status</span>
                </div>
                <div className="mt-2">
                  {getTrendBadge(data.trendStatus)}
                </div>
              </div>
            </div>

            {/* Monthly Trend Chart Placeholder */}
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-5 w-5 text-purple-600" />
                <h4 className="text-lg font-semibold text-gray-900">12-Month Trend</h4>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-8">
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">Line Chart: Count & Hours Over Time</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Contributing Equipment Table */}
            <div className="mb-3">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Top Contributing Equipment</h4>
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Equipment
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Event Count
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Hours
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Percentage
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Trend
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {data.topEquipment.map((equipment, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                            {equipment.equipment}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                            {equipment.eventCount}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                            {equipment.totalHours.toFixed(1)}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex items-center gap-2">
                              <div className="w-24 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-purple-600 h-2 rounded-full"
                                  style={{ width: `${equipment.percentage}%` }}
                                />
                              </div>
                              <span>{equipment.percentage.toFixed(1)}%</span>
                            </div>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            {getEquipmentTrendIcon(equipment.trend)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Average Duration Trend */}
            <div className="mb-3">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Average Duration Trend</h4>
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Month
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Event Count
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Hours
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Avg Duration
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Trend
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {data.monthlyTrends.map((month, index) => {
                        const prevMonth = index > 0 ? data.monthlyTrends[index - 1] : null
                        const trendDirection = prevMonth
                          ? month.avgDuration > prevMonth.avgDuration
                            ? 'up'
                            : month.avgDuration < prevMonth.avgDuration
                            ? 'down'
                            : 'stable'
                          : 'stable'

                        return (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                              {month.month}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                              {month.count}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                              {month.hours.toFixed(1)}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                              {month.avgDuration.toFixed(0)} min
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap">
                              {trendDirection === 'up' && (
                                <ArrowUpRight className="h-4 w-4 text-red-600" />
                              )}
                              {trendDirection === 'down' && (
                                <ArrowDownRight className="h-4 w-4 text-green-600" />
                              )}
                              {trendDirection === 'stable' && (
                                <Minus className="h-4 w-4 text-yellow-600" />
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Cost Impact Over Time */}
            <div className="mb-3">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Cost Impact Over Time</h4>
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Month
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Cost
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Avg per Event
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {data.monthlyTrends.map((month, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                            {month.month}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                            ${month.cost.toLocaleString()}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                            ${(month.cost / month.count).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="border-t border-gray-200 px-3 py-2 bg-gray-50 flex items-center justify-end gap-3">
            <button
              onClick={onExport}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
            <button
              onClick={onFilterPeriod}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
            >
              <Filter className="h-4 w-4" />
              Filter Period
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// =====================================================
// PERIOD COMPARISON MODAL
// =====================================================

interface PeriodComparisonModalProps {
  isOpen: boolean
  onClose: () => void
  data: PeriodComparisonData
  onExport?: () => void
  onReset?: () => void
}

export function PeriodComparisonModal({
  isOpen,
  onClose,
  data,
  onExport,
  onReset,
}: PeriodComparisonModalProps) {
  const [isConfigOpen, setIsConfigOpen] = useState(false)
  const [selectedMetrics, setSelectedMetrics] = useState({
    totalDowntime: true,
    eventCount: true,
    mtbf: true,
    mttr: true,
    cost: true,
    availability: true,
    categories: true,
  })

  if (!isOpen) return null

  const getVarianceColor = (variance: number, inverse: boolean = false) => {
    if (variance === 0) return 'text-yellow-600'
    if (inverse) {
      return variance > 0 ? 'text-green-600' : 'text-red-600'
    }
    return variance > 0 ? 'text-red-600' : 'text-green-600'
  }

  const getVarianceIcon = (variance: number, inverse: boolean = false) => {
    if (variance === 0) return <Minus className="h-5 w-5" />
    if (inverse) {
      return variance > 0 ? (
        <TrendingUp className="h-5 w-5" />
      ) : (
        <TrendingDown className="h-5 w-5" />
      )
    }
    return variance > 0 ? (
      <TrendingUp className="h-5 w-5" />
    ) : (
      <TrendingDown className="h-5 w-5" />
    )
  }

  const getVarianceBadge = (variance: number, inverse: boolean = false) => {
    const color = getVarianceColor(variance, inverse)
    const icon = getVarianceIcon(variance, inverse)

    return (
      <div className={`flex items-center gap-1 ${color}`}>
        {icon}
        <span className="font-semibold">
          {variance > 0 ? '+' : ''}{variance.toFixed(1)}%
        </span>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />

      <div className="absolute inset-4 flex items-center justify-center">
        <div className="relative bg-white rounded-lg shadow-xl w-full  max-h-full overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-3 py-2 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="h-6 w-6 text-white" />
              <h2 className="text-xl font-semibold text-white">Period Comparison</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-blue-800 p-2 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-3">
            {/* Configuration Section */}
            <div className="mb-3">
              <button
                onClick={() => setIsConfigOpen(!isConfigOpen)}
                className="flex items-center justify-between w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 hover:bg-gray-100"
              >
                <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-gray-600" />
                  <span className="font-medium text-gray-900">Configuration</span>
                </div>
                {isConfigOpen ? (
                  <ChevronUp className="h-5 w-5 text-gray-600" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-600" />
                )}
              </button>

              {isConfigOpen && (
                <div className="mt-4 bg-white border border-gray-200 rounded-lg p-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    {/* Period 1 */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Period 1</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">From</label>
                          <input
                            type="date"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            defaultValue={data.period1.start}
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">To</label>
                          <input
                            type="date"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            defaultValue={data.period1.end}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Period 2 */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Period 2</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">From</label>
                          <input
                            type="date"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            defaultValue={data.period2.start}
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">To</label>
                          <input
                            type="date"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            defaultValue={data.period2.end}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Metrics to Compare */}
                  <div className="mb-2">
                    <h4 className="font-semibold text-gray-900 mb-3">Metrics to Compare</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {Object.entries(selectedMetrics).map(([key, value]) => (
                        <label key={key} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) =>
                              setSelectedMetrics({
                                ...selectedMetrics,
                                [key]: e.target.checked,
                              })
                            }
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">
                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium">
                    Compare Periods
                  </button>
                </div>
              )}
            </div>

            {/* Comparison Display */}
            <div className="space-y-3">
              {/* Total Downtime */}
              {selectedMetrics.totalDowntime && (
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <h4 className="font-semibold text-gray-900 mb-2">Total Downtime (hours)</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center">
                      <p className="text-sm text-gray-500 mb-2">Period 1</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {data.period1.metrics.totalDowntime.toFixed(1)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {data.period1.start} - {data.period1.end}
                      </p>
                    </div>
                    <div className="flex items-center justify-center">
                      {getVarianceBadge(data.variance.totalDowntime, false)}
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500 mb-2">Period 2</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {data.period2.metrics.totalDowntime.toFixed(1)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {data.period2.start} - {data.period2.end}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Event Count */}
              {selectedMetrics.eventCount && (
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <h4 className="font-semibold text-gray-900 mb-2">Event Count</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center">
                      <p className="text-sm text-gray-500 mb-2">Period 1</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {data.period1.metrics.eventCount}
                      </p>
                    </div>
                    <div className="flex items-center justify-center">
                      {getVarianceBadge(data.variance.eventCount, false)}
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500 mb-2">Period 2</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {data.period2.metrics.eventCount}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* MTBF */}
              {selectedMetrics.mtbf && (
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <h4 className="font-semibold text-gray-900 mb-2">MTBF (hours)</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center">
                      <p className="text-sm text-gray-500 mb-2">Period 1</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {data.period1.metrics.mtbf.toFixed(1)}
                      </p>
                    </div>
                    <div className="flex items-center justify-center">
                      {getVarianceBadge(data.variance.mtbf, true)}
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500 mb-2">Period 2</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {data.period2.metrics.mtbf.toFixed(1)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* MTTR */}
              {selectedMetrics.mttr && (
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <h4 className="font-semibold text-gray-900 mb-2">MTTR (hours)</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center">
                      <p className="text-sm text-gray-500 mb-2">Period 1</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {data.period1.metrics.mttr.toFixed(1)}
                      </p>
                    </div>
                    <div className="flex items-center justify-center">
                      {getVarianceBadge(data.variance.mttr, false)}
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500 mb-2">Period 2</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {data.period2.metrics.mttr.toFixed(1)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Total Cost */}
              {selectedMetrics.cost && (
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <h4 className="font-semibold text-gray-900 mb-2">Total Cost</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center">
                      <p className="text-sm text-gray-500 mb-2">Period 1</p>
                      <p className="text-3xl font-bold text-gray-900">
                        ${data.period1.metrics.totalCost.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center justify-center">
                      {getVarianceBadge(data.variance.totalCost, false)}
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500 mb-2">Period 2</p>
                      <p className="text-3xl font-bold text-gray-900">
                        ${data.period2.metrics.totalCost.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Availability */}
              {selectedMetrics.availability && (
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <h4 className="font-semibold text-gray-900 mb-2">Availability</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center">
                      <p className="text-sm text-gray-500 mb-2">Period 1</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {data.period1.metrics.availability.toFixed(2)}%
                      </p>
                    </div>
                    <div className="flex items-center justify-center">
                      {getVarianceBadge(data.variance.availability, true)}
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500 mb-2">Period 2</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {data.period2.metrics.availability.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Category Breakdown */}
              {selectedMetrics.categories && (
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <h4 className="font-semibold text-gray-900 mb-2">Category Breakdown</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Category
                          </th>
                          <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Period 1 (hrs)
                          </th>
                          <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Change
                          </th>
                          <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Period 2 (hrs)
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {data.period1.metrics.categoryBreakdown.map((cat, index) => {
                          const period2Cat = data.period2.metrics.categoryBreakdown.find(
                            (c) => c.category === cat.category
                          )
                          const variance = period2Cat
                            ? ((period2Cat.totalHours - cat.totalHours) / cat.totalHours) * 100
                            : 0

                          return (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                {cat.category}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 text-center">
                                {cat.totalHours.toFixed(1)}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-center">
                                <span className={getVarianceColor(variance, false)}>
                                  {variance > 0 ? '+' : ''}{variance.toFixed(1)}%
                                </span>
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 text-center">
                                {period2Cat?.totalHours.toFixed(1) || '0.0'}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Summary Section */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Key Insights</h4>
                  <ul className="space-y-2">
                    {data.insights.map((insight, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span className="text-gray-700">{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="border-t border-gray-200 px-3 py-2 bg-gray-50 flex items-center justify-end gap-3">
            <button
              onClick={onExport}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
            >
              <Download className="h-4 w-4" />
              Export Comparison
            </button>
            <button
              onClick={onReset}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
            >
              <RefreshCw className="h-4 w-4" />
              Reset
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// =====================================================
// QUICK ANALYSIS MODAL
// =====================================================

interface QuickAnalysisModalProps {
  isOpen: boolean
  onClose: () => void
  data: QuickAnalysisData
  onViewFullAnalysis?: () => void
  onExport?: () => void
}

export function QuickAnalysisModal({
  isOpen,
  onClose,
  data,
  onViewFullAnalysis,
  onExport,
}: QuickAnalysisModalProps) {
  if (!isOpen) return null

  const getSeverityColor = (severity: 'critical' | 'high' | 'medium') => {
    switch (severity) {
      case 'critical':
        return 'bg-red-50 border-red-200'
      case 'high':
        return 'bg-orange-50 border-orange-200'
      case 'medium':
        return 'bg-yellow-50 border-yellow-200'
    }
  }

  const getSeverityTextColor = (severity: 'critical' | 'high' | 'medium') => {
    switch (severity) {
      case 'critical':
        return 'text-red-900'
      case 'high':
        return 'text-orange-900'
      case 'medium':
        return 'text-yellow-900'
    }
  }

  const getPriorityBadge = (priority: 'high' | 'medium' | 'low') => {
    const styles = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-blue-100 text-blue-800',
    }

    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${styles[priority]}`}>
        {priority.toUpperCase()}
      </span>
    )
  }

  const getRankBadge = (rank: number) => {
    const colors = [
      'bg-red-500',
      'bg-orange-500',
      'bg-yellow-500',
      'bg-blue-500',
      'bg-indigo-500',
    ]

    return (
      <div
        className={`${colors[rank - 1] || 'bg-gray-500'} text-white rounded-full h-8 w-8 flex items-center justify-center font-bold text-sm`}
      >
        {rank}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />

      <div className="absolute inset-4 flex items-center justify-center">
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-full overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 px-3 py-2 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Award className="h-6 w-6 text-white" />
              <h2 className="text-xl font-semibold text-white">Quick Analysis</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-green-800 p-2 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-3">
            {/* Current Period Summary */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900">Current Period Summary</h3>
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {data.period}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-5 w-5 text-red-600" />
                    <span className="text-sm text-red-700">Total Downtime</span>
                  </div>
                  <p className="text-2xl font-bold text-red-900">
                    {data.summary.totalDowntime.toFixed(1)} hrs
                  </p>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    <span className="text-sm text-orange-700">Total Events</span>
                  </div>
                  <p className="text-2xl font-bold text-orange-900">
                    {data.summary.totalEvents}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-green-700">Availability</span>
                  </div>
                  <p className="text-2xl font-bold text-green-900">
                    {data.summary.availability.toFixed(2)}%
                  </p>
                </div>
              </div>
            </div>

            {/* Top 5 Problem Equipment */}
            <div className="mb-3">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Top 5 Problem Equipment</h3>
              <div className="space-y-3">
                {data.topEquipment.map((equipment) => (
                  <div
                    key={equipment.rank}
                    className={`border rounded-lg p-3 ${getSeverityColor(equipment.severity)}`}
                  >
                    <div className="flex items-center gap-2">
                      {getRankBadge(equipment.rank)}
                      <div className="flex-1">
                        <h4 className={`font-semibold ${getSeverityTextColor(equipment.severity)}`}>
                          {equipment.equipment}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-gray-600">
                            <span className="font-medium">{equipment.downtimeHours.toFixed(1)}</span> hrs downtime
                          </span>
                          <span className="text-sm text-gray-600">
                            <span className="font-medium">{equipment.eventCount}</span> events
                          </span>
                        </div>
                      </div>
                      <span className={`text-xs font-medium px-2 py-1 rounded ${
                        equipment.severity === 'critical'
                          ? 'bg-red-200 text-red-900'
                          : equipment.severity === 'high'
                          ? 'bg-orange-200 text-orange-900'
                          : 'bg-yellow-200 text-yellow-900'
                      }`}>
                        {equipment.severity.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top 3 Categories */}
            <div className="mb-3">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Top 3 Categories</h3>
              <div className="space-y-2">
                {data.topCategories.map((category, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{category.category}</h4>
                      <span className="text-sm font-semibold text-gray-900">
                        {category.percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                      <div
                        className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all"
                        style={{ width: `${category.percentage}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{category.hours.toFixed(1)} hours</span>
                      <span>{category.count} events</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Recommendations */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Key Recommendations
                  </h3>
                  <div className="space-y-3">
                    {data.recommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="flex-shrink-0 mt-1">
                          {getPriorityBadge(recommendation.priority)}
                        </div>
                        <p className="text-gray-700 flex-1">{recommendation.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="border-t border-gray-200 px-3 py-2 bg-gray-50 flex items-center justify-end gap-3">
            <button
              onClick={onExport}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
            <button
              onClick={onViewFullAnalysis}
              className="flex items-center gap-2 px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 font-medium"
            >
              <FileText className="h-4 w-4" />
              View Full Analysis
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
