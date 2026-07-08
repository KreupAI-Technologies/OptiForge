'use client'

import { useState, useEffect } from 'react'
import { FileText, Download, Calendar, Clock, BarChart3, Filter, Plus, Play, Settings, Eye, TrendingUp, Trash2, Loader2 } from 'lucide-react'
import { supportPagesService } from '@/services/support-pages.service'
import EmptyState from '@/components/ui/EmptyState'

interface Report {
  id: string
  name: string
  category: 'Operations' | 'Performance' | 'Compliance' | 'Customer' | 'Executive'
  description: string
  lastGenerated: string
  frequency: 'On-Demand' | 'Daily' | 'Weekly' | 'Monthly'
  format: string[]
  recipients: number
  scheduled: boolean
  popularity: number
}

interface ScheduledReport {
  id: string
  reportName: string
  reportType: string
  frequency: string
  time: string
  format: string
  recipients: string[]
  isActive: boolean
  nextRunAt?: string | null
}

interface CustomReport {
  id: string
  name: string
  description?: string
  dataSource: string
  columns: string[]
  chartType?: string | null
  createdAt?: string
}

export default function SupportReports() {
  const [activeTab, setActiveTab] = useState<'templates' | 'scheduled' | 'custom'>('templates')
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // --- Scheduled Reports state ---
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([])
  const [schedLoading, setSchedLoading] = useState(false)
  const [schedError, setSchedError] = useState<string | null>(null)
  const [showSchedForm, setShowSchedForm] = useState(false)
  const [schedSaving, setSchedSaving] = useState(false)
  const [schedForm, setSchedForm] = useState({ reportName: '', frequency: 'weekly', format: 'pdf', recipients: '' })

  // --- Custom Reports state ---
  const [customReports, setCustomReports] = useState<CustomReport[]>([])
  const [customLoading, setCustomLoading] = useState(false)
  const [customError, setCustomError] = useState<string | null>(null)
  const [customSaving, setCustomSaving] = useState(false)
  const [customForm, setCustomForm] = useState({ name: '', dataSource: 'tickets', columns: '', chartType: 'bar' })

  const loadSchedules = () => {
    setSchedLoading(true)
    supportPagesService
      .getReportSchedules()
      .then((rows) => {
        setScheduledReports(
          (Array.isArray(rows) ? rows : []).map((r: any) => ({
            id: String(r?.id),
            reportName: r?.reportName ?? 'Untitled',
            reportType: r?.reportType ?? '',
            frequency: r?.frequency ?? 'weekly',
            time: r?.time ?? '09:00',
            format: r?.format ?? 'pdf',
            recipients: Array.isArray(r?.recipients) ? r.recipients : [],
            isActive: Boolean(r?.isActive),
            nextRunAt: r?.nextRunAt ?? null,
          })),
        )
        setSchedError(null)
      })
      .catch(() => setSchedError('Unable to load scheduled reports.'))
      .finally(() => setSchedLoading(false))
  }

  const loadCustomReports = () => {
    setCustomLoading(true)
    supportPagesService
      .getCustomReports()
      .then((rows) => {
        setCustomReports(
          (Array.isArray(rows) ? rows : []).map((r: any) => ({
            id: String(r?.id),
            name: r?.name ?? 'Untitled',
            description: r?.description ?? '',
            dataSource: r?.dataSource ?? '',
            columns: Array.isArray(r?.columns) ? r.columns : [],
            chartType: r?.chartType ?? null,
            createdAt: r?.createdAt,
          })),
        )
        setCustomError(null)
      })
      .catch(() => setCustomError('Unable to load custom reports.'))
      .finally(() => setCustomLoading(false))
  }

  useEffect(() => {
    if (activeTab === 'scheduled') loadSchedules()
    if (activeTab === 'custom') loadCustomReports()
  }, [activeTab])

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!schedForm.reportName.trim()) return
    setSchedSaving(true)
    try {
      await supportPagesService.createReportSchedule({
        reportName: schedForm.reportName.trim(),
        reportType: schedForm.reportName.trim(),
        frequency: schedForm.frequency,
        format: schedForm.format,
        recipients: schedForm.recipients
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      })
      setSchedForm({ reportName: '', frequency: 'weekly', format: 'pdf', recipients: '' })
      setShowSchedForm(false)
      loadSchedules()
    } catch {
      setSchedError('Failed to create schedule.')
    } finally {
      setSchedSaving(false)
    }
  }

  const handleToggleSchedule = async (r: ScheduledReport) => {
    try {
      await supportPagesService.toggleReportSchedule(r.id, !r.isActive)
      loadSchedules()
    } catch {
      setSchedError('Failed to update schedule.')
    }
  }

  const handleDeleteSchedule = async (id: string) => {
    try {
      await supportPagesService.deleteReportSchedule(id)
      loadSchedules()
    } catch {
      setSchedError('Failed to delete schedule.')
    }
  }

  const handleCreateCustomReport = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!customForm.name.trim()) return
    setCustomSaving(true)
    try {
      await supportPagesService.createCustomReport({
        name: customForm.name.trim(),
        dataSource: customForm.dataSource,
        columns: customForm.columns
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        chartType: customForm.chartType || null,
      })
      setCustomForm({ name: '', dataSource: 'tickets', columns: '', chartType: 'bar' })
      loadCustomReports()
    } catch {
      setCustomError('Failed to save custom report.')
    } finally {
      setCustomSaving(false)
    }
  }

  const handleDeleteCustomReport = async (id: string) => {
    try {
      await supportPagesService.deleteCustomReport(id)
      loadCustomReports()
    } catch {
      setCustomError('Failed to delete custom report.')
    }
  }

  useEffect(() => {
    let active = true
    setLoading(true)
    supportPagesService
      .getReportTemplates()
      .then((rows) => {
        if (!active) return
        const mapped: Report[] = (Array.isArray(rows) ? rows : []).map((r: any, i: number) => ({
          id: String(r?.id ?? i + 1),
          name: r?.name ?? 'Untitled Report',
          category: (r?.category as Report['category']) ?? 'Operations',
          description: r?.description ?? '',
          lastGenerated: r?.lastGenerated ?? '—',
          frequency: (r?.frequency as Report['frequency']) ?? 'On-Demand',
          format: Array.isArray(r?.format) ? r.format : (r?.format ? [String(r.format)] : ['PDF']),
          recipients: Number(r?.recipients ?? 0),
          scheduled: Boolean(r?.scheduled),
          popularity: Number(r?.popularity ?? 0),
        }))
        setReports(mapped)
        setError(null)
      })
      .catch(() => {
        if (!active) return
        setReports([])
        setError('Unable to load report templates. Please try again.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const categories = ['All', 'Operations', 'Performance', 'Compliance', 'Customer', 'Executive']

  const filteredReports = reports.filter(report => 
    selectedCategory === 'All' || report.category === selectedCategory
  )

  const stats = [
    {
      label: 'Total Templates',
      value: reports.length,
      change: `${reports.filter(r => r.scheduled).length} scheduled`,
      icon: FileText,
      color: 'blue'
    },
    {
      label: 'Generated Today',
      value: reports.filter(r => r.lastGenerated.includes('2024-10-21')).length,
      change: 'Since midnight',
      icon: TrendingUp,
      color: 'green'
    },
    {
      label: 'Scheduled Reports',
      value: scheduledReports.filter(r => r.isActive).length,
      change: `${scheduledReports.length} total`,
      icon: Calendar,
      color: 'purple'
    },
    {
      label: 'Total Recipients',
      value: reports.reduce((sum, r) => sum + r.recipients, 0),
      change: 'Across all reports',
      icon: Download,
      color: 'orange'
    },
    {
      label: 'Avg Generation Time',
      value: '2.3 min',
      change: 'Last 30 days',
      icon: Clock,
      color: 'blue'
    },
    {
      label: 'Categories',
      value: categories.length - 1,
      change: 'Report types',
      icon: BarChart3,
      color: 'gray'
    }
  ]

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Operations': 'bg-blue-100 text-blue-700',
      'Performance': 'bg-green-100 text-green-700',
      'Compliance': 'bg-purple-100 text-purple-700',
      'Customer': 'bg-pink-100 text-pink-700',
      'Executive': 'bg-orange-100 text-orange-700'
    }
    return colors[category] || 'bg-gray-100 text-gray-700'
  }

  const getFrequencyColor = (frequency: string) => {
    const colors: Record<string, string> = {
      'On-Demand': 'bg-gray-100 text-gray-700',
      'Daily': 'bg-green-100 text-green-700',
      'Weekly': 'bg-blue-100 text-blue-700',
      'Monthly': 'bg-purple-100 text-purple-700'
    }
    return colors[frequency] || 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Support Reports</h1>
          <p className="text-gray-600 mt-1">Generate, schedule, and manage support analytics reports</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Custom Report
        </button>
      </div>

      {loading && (
        <div className="bg-white border border-gray-200 rounded-lg p-3 text-sm text-gray-500">
          Loading report templates…
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          const colorClasses = {
            blue: 'bg-blue-500',
            green: 'bg-green-500',
            purple: 'bg-purple-500',
            orange: 'bg-orange-500',
            gray: 'bg-gray-500'
          }
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm border p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 text-sm">{stat.label}</span>
                <div className={`${colorClasses[stat.color as keyof typeof colorClasses]} p-2 rounded-lg`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-xs text-gray-500 mt-1">{stat.change}</div>
            </div>
          )
        })}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('templates')}
              className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'templates'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Report Templates
              </div>
            </button>
            <button
              onClick={() => setActiveTab('scheduled')}
              className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'scheduled'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Scheduled Reports
              </div>
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'custom'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Custom Report Builder
              </div>
            </button>
          </nav>
        </div>

        {/* Report Templates Tab */}
        {activeTab === 'templates' && (
          <div className="p-6 space-y-2">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Reports Grid */}
            {!loading && filteredReports.length === 0 && (
              <EmptyState
                icon={FileText}
                title={error ? 'Report templates unavailable' : 'No report templates found'}
                description={
                  error
                    ? 'We could not load report templates. Please try again later.'
                    : selectedCategory === 'All'
                      ? 'No report templates have been created yet.'
                      : `No report templates in the "${selectedCategory}" category.`
                }
              />
            )}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
              {filteredReports.map((report) => (
                <div key={report.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-3 py-1 rounded text-xs font-medium ${getCategoryColor(report.category)}`}>
                          {report.category}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getFrequencyColor(report.frequency)}`}>
                          {report.frequency}
                        </span>
                        {report.scheduled && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                            Scheduled
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{report.name}</h3>
                      <p className="text-sm text-gray-600 mb-3">{report.description}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-2 pb-4 border-b border-gray-300">
                    <div>
                      <div className="text-xs text-gray-500">Last Generated</div>
                      <div className="text-sm font-medium text-gray-900">{report.lastGenerated}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Recipients</div>
                      <div className="text-sm font-medium text-gray-900">{report.recipients} users</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Available Formats</div>
                      <div className="flex gap-1">
                        {report.format.map((fmt, idx) => (
                          <span key={idx} className="text-xs px-2 py-0.5 bg-white border border-gray-300 rounded">
                            {fmt}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Popularity</div>
                      <div className="flex items-center gap-1">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${report.popularity}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-medium text-gray-900">{report.popularity}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 text-sm">
                      <Play className="h-4 w-4" />
                      Generate Now
                    </button>
                    <button className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                      <Eye className="h-4 w-4 text-gray-600" />
                      <span className="text-gray-700">View</span>
                    </button>
                    <button className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                      <Settings className="h-4 w-4 text-gray-600" />
                      <span className="text-gray-700">Settings</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Scheduled Reports Tab */}
        {activeTab === 'scheduled' && (
          <div className="p-6 space-y-2">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">Automated report delivery schedules</div>
              <button
                onClick={() => setShowSchedForm((s) => !s)}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                {showSchedForm ? 'Cancel' : 'New Schedule'}
              </button>
            </div>

            {schedError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{schedError}</div>
            )}

            {showSchedForm && (
              <form onSubmit={handleCreateSchedule} className="bg-gray-50 border border-gray-200 rounded-lg p-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Report Name</label>
                  <input
                    value={schedForm.reportName}
                    onChange={(e) => setSchedForm({ ...schedForm, reportName: e.target.value })}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    placeholder="e.g. Weekly SLA Compliance"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Frequency</label>
                  <select
                    value={schedForm.frequency}
                    onChange={(e) => setSchedForm({ ...schedForm, frequency: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Format</label>
                  <select
                    value={schedForm.format}
                    onChange={(e) => setSchedForm({ ...schedForm, format: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="pdf">PDF</option>
                    <option value="excel">Excel</option>
                    <option value="powerpoint">PowerPoint</option>
                    <option value="csv">CSV</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Recipients (comma-separated)</label>
                  <input
                    value={schedForm.recipients}
                    onChange={(e) => setSchedForm({ ...schedForm, recipients: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    placeholder="a@co.com, b@co.com"
                  />
                </div>
                <div className="md:col-span-2">
                  <button
                    type="submit"
                    disabled={schedSaving}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center gap-2 disabled:opacity-60"
                  >
                    {schedSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                    Create Schedule
                  </button>
                </div>
              </form>
            )}

            {schedLoading && (
              <div className="text-sm text-gray-500 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading schedules…
              </div>
            )}

            {!schedLoading && scheduledReports.length === 0 && (
              <EmptyState
                icon={Calendar}
                title="No scheduled reports"
                description="Create a schedule to automate report delivery to recipients."
              />
            )}

            {scheduledReports.map((scheduled) => (
              <div key={scheduled.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{scheduled.reportName}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        scheduled.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {scheduled.isActive ? 'Active' : 'Paused'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 capitalize">{scheduled.frequency} at {scheduled.time}</div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggleSchedule(scheduled)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                    >
                      <span className="text-gray-700">{scheduled.isActive ? 'Pause' : 'Activate'}</span>
                    </button>
                    <button
                      onClick={() => handleDeleteSchedule(scheduled.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-red-300 rounded-lg hover:bg-red-50 text-sm"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                      <span className="text-red-700">Delete</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Next Run</div>
                    <div className="text-sm font-medium text-blue-600">{scheduled.nextRunAt ?? '—'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Format</div>
                    <div className="text-sm font-medium text-gray-900 uppercase">{scheduled.format}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Recipients ({scheduled.recipients.length})</div>
                    <div className="text-xs text-gray-700">
                      {scheduled.recipients.length > 0
                        ? `${scheduled.recipients[0]}${scheduled.recipients.length > 1 ? `, +${scheduled.recipients.length - 1} more` : ''}`
                        : '—'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Custom Report Builder Tab */}
        {activeTab === 'custom' && (
          <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Builder form */}
            <form onSubmit={handleCreateCustomReport} className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Settings className="h-5 w-5 text-blue-600" /> Build a Report
              </h3>
              {customError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{customError}</div>
              )}
              <div>
                <label className="block text-xs text-gray-500 mb-1">Report Name</label>
                <input
                  value={customForm.name}
                  onChange={(e) => setCustomForm({ ...customForm, name: e.target.value })}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="e.g. High-priority ticket trend"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Data Source</label>
                <select
                  value={customForm.dataSource}
                  onChange={(e) => setCustomForm({ ...customForm, dataSource: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="tickets">Tickets</option>
                  <option value="sla">SLA</option>
                  <option value="analytics">Analytics</option>
                  <option value="csat">CSAT</option>
                  <option value="agents">Agents</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Columns (comma-separated)</label>
                <input
                  value={customForm.columns}
                  onChange={(e) => setCustomForm({ ...customForm, columns: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="priority, status, createdAt"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Chart Type</label>
                <select
                  value={customForm.chartType}
                  onChange={(e) => setCustomForm({ ...customForm, chartType: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="bar">Bar</option>
                  <option value="line">Line</option>
                  <option value="pie">Pie</option>
                  <option value="table">Table</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={customSaving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center gap-2 disabled:opacity-60"
              >
                {customSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Save Report
              </button>
            </form>

            {/* Saved reports */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">Saved Reports</h3>
              {customLoading && (
                <div className="text-sm text-gray-500 flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading…
                </div>
              )}
              {!customLoading && customReports.length === 0 && (
                <EmptyState
                  icon={FileText}
                  title="No custom reports yet"
                  description="Use the builder to define and save your first custom report."
                />
              )}
              {customReports.map((cr) => (
                <div key={cr.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900">{cr.name}</h4>
                      <div className="text-xs text-gray-500 mt-1">
                        <span className="capitalize">{cr.dataSource}</span>
                        {cr.chartType && <span> · {cr.chartType} chart</span>}
                        {cr.columns.length > 0 && <span> · {cr.columns.length} columns</span>}
                      </div>
                      {cr.columns.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {cr.columns.map((c, i) => (
                            <span key={i} className="text-xs px-2 py-0.5 bg-white border border-gray-300 rounded">{c}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteCustomReport(cr.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-red-300 rounded-lg hover:bg-red-50 text-sm"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Quick Report Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button className="bg-white border border-blue-200 rounded-lg p-3 text-left hover:bg-blue-50 transition-colors">
            <Download className="h-5 w-5 text-blue-600 mb-2" />
            <div className="font-semibold text-blue-900">Export All Data</div>
            <div className="text-xs text-blue-700">Download complete dataset</div>
          </button>
          <button className="bg-white border border-blue-200 rounded-lg p-3 text-left hover:bg-blue-50 transition-colors">
            <Calendar className="h-5 w-5 text-blue-600 mb-2" />
            <div className="font-semibold text-blue-900">Schedule Report</div>
            <div className="text-xs text-blue-700">Set up automated delivery</div>
          </button>
          <button className="bg-white border border-blue-200 rounded-lg p-3 text-left hover:bg-blue-50 transition-colors">
            <FileText className="h-5 w-5 text-blue-600 mb-2" />
            <div className="font-semibold text-blue-900">Save Template</div>
            <div className="text-xs text-blue-700">Create reusable report</div>
          </button>
        </div>
      </div>
    </div>
  )
}
