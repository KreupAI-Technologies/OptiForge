'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, FileText, Download, Calendar, Filter, TrendingUp, DollarSign, Package, Users, Eye } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { salesConfigService } from '@/services/sales-config.service'

interface Report {
  id: string
  name: string
  type: 'sales' | 'product' | 'customer' | 'inventory' | 'financial'
  description: string
  period: string
  generatedDate: string
  generatedBy: string
  fileSize: string
  format: 'PDF' | 'Excel' | 'CSV'
  keyMetrics: {
    label: string
    value: string
  }[]
  status: 'ready' | 'generating' | 'scheduled'
}

export default function ReportsPage() {
  const router = useRouter()
  const [selectedType, setSelectedType] = useState('all')
  const [selectedPeriod, setSelectedPeriod] = useState('all')

  const [reports, setReports] = useState<Report[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setIsLoading(true)
      setLoadError(null)
      try {
        const rows = await salesConfigService.getSalesReports()
        const mapped: Report[] = (rows || []).map((r) => ({
          id: r.id,
          name: r.name,
          type: (r.type as Report['type']) || 'sales',
          description: r.description || '',
          period: r.period || '',
          generatedDate: r.generatedDate || '',
          generatedBy: r.generatedBy || '',
          fileSize: r.fileSize || '',
          format: (r.format as Report['format']) || 'PDF',
          keyMetrics: r.keyMetrics || [],
          status: (r.status as Report['status']) || 'ready',
        }))
        if (!cancelled) setReports(mapped)
      } catch (err) {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : 'Failed to load reports')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const reportTypes = ['all', 'sales', 'product', 'customer', 'inventory', 'financial']
  const periods = ['all', 'weekly', 'monthly', 'quarterly', 'annual']

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'sales':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'product':
        return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'customer':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'inventory':
        return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'financial':
        return 'bg-pink-100 text-pink-700 border-pink-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'generating':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'scheduled':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getFormatIcon = (format: string) => {
    return format
  }

  const filteredReports = reports.filter(report => {
    const matchesType = selectedType === 'all' || report.type === selectedType
    const matchesPeriod = selectedPeriod === 'all' || report.period.toLowerCase().includes(selectedPeriod)
    return matchesType && matchesPeriod
  })

  const stats = {
    totalReports: reports.filter(r => r.status === 'ready').length,
    generatingReports: reports.filter(r => r.status === 'generating').length,
    scheduledReports: reports.filter(r => r.status === 'scheduled').length,
    thisMonth: reports.filter(r => (r.period || '').includes('October 2025')).length
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
            <h1 className="text-2xl font-bold text-gray-900">Sales Reports</h1>
            <p className="text-sm text-gray-600 mt-1">Generate and download sales analytics reports</p>
          </div>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Generate Report
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-100">Ready Reports</p>
              <p className="text-3xl font-bold mt-1">{stats.totalReports}</p>
              <p className="text-xs text-blue-100 mt-1">Available to download</p>
            </div>
            <FileText className="h-10 w-10 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-100">Generating</p>
              <p className="text-3xl font-bold mt-1">{stats.generatingReports}</p>
              <p className="text-xs text-yellow-100 mt-1">In progress</p>
            </div>
            <TrendingUp className="h-10 w-10 text-yellow-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-100">Scheduled</p>
              <p className="text-3xl font-bold mt-1">{stats.scheduledReports}</p>
              <p className="text-xs text-purple-100 mt-1">Auto-generate</p>
            </div>
            <Calendar className="h-10 w-10 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-100">This Month</p>
              <p className="text-3xl font-bold mt-1">{stats.thisMonth}</p>
              <p className="text-xs text-green-100 mt-1">October reports</p>
            </div>
            <FileText className="h-10 w-10 text-green-200" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              {reportTypes.map(type => (
                <option key={type} value={type}>
                  {type === 'all' ? 'All Report Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              {periods.map(period => (
                <option key={period} value={period}>
                  {period === 'all' ? 'All Periods' : period.charAt(0).toUpperCase() + period.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {filteredReports.map((report) => (
          <div key={report.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-900">{report.name}</h3>
                  </div>
                  <p className="text-sm text-gray-600">{report.description}</p>
                </div>
              </div>

              {/* Type and Status Badges */}
              <div className="flex gap-2 mb-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor(report.type)}`}>
                  {report.type.toUpperCase()}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(report.status)}`}>
                  {report.status.toUpperCase()}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium border bg-gray-100 text-gray-700 border-gray-200">
                  {getFormatIcon(report.format)}
                </span>
              </div>

              {/* Period */}
              <div className="mb-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-xs text-blue-700">Period</p>
                    <p className="font-semibold text-blue-900">{report.period}</p>
                  </div>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="mb-2">
                <p className="text-xs text-gray-600 mb-3 font-medium">Key Metrics</p>
                <div className="grid grid-cols-3 gap-2">
                  {report.keyMetrics.map((metric, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">{metric.label}</p>
                      <p className="font-semibold text-gray-900 text-sm">{metric.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Details */}
              <div className="mb-2 text-sm space-y-1">
                <p className="text-gray-600">Generated: <span className="font-medium text-gray-900">{report.generatedDate}</span></p>
                <p className="text-gray-600">Generated by: <span className="font-medium text-gray-900">{report.generatedBy}</span></p>
                {report.fileSize !== '-' && (
                  <p className="text-gray-600">File size: <span className="font-medium text-gray-900">{report.fileSize}</span></p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {report.status === 'ready' && (
                  <>
                    <button className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2">
                      <Eye className="h-4 w-4" />
                      Preview
                    </button>
                    <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2">
                      <Download className="h-4 w-4" />
                      Download
                    </button>
                  </>
                )}
                {report.status === 'generating' && (
                  <button className="w-full px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg cursor-not-allowed" disabled>
                    Generating... {report.keyMetrics[1]?.value}
                  </button>
                )}
                {report.status === 'scheduled' && (
                  <button className="w-full px-4 py-2 bg-blue-100 text-blue-700 rounded-lg">
                    View Schedule
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredReports.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mb-2" />
          <p className="text-gray-600">No reports found matching your criteria</p>
        </div>
      )}
    </div>
  )
}
