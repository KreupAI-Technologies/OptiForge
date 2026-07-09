'use client'

import React, { useState } from 'react'
import {
  X,
  Download,
  Calendar,
  FileText,
  FileSpreadsheet,
  Database,
  BarChart3,
  PieChart,
  TrendingUp,
  Settings,
  CheckCircle2,
  AlertCircle,
  Info,
  Search,
  ChevronDown,
  ChevronUp,
  Filter,
  FileCheck,
  Presentation,
  Clock,
} from 'lucide-react'

// ============================================================================
// INTERFACES
// ============================================================================

export interface ExportDowntimeConfig {
  exportType: 'events' | 'summary' | 'analysis'
  dateRange: {
    start: string
    end: string
  }
  filters: {
    equipment: string[]
    category: string[]
    severity: string[]
    status: string[]
  }
  format: 'excel' | 'pdf' | 'csv'
  includeFields?: string[]
  summaryOptions?: string[]
}

export interface ExportRCAConfig {
  rcaIds: string[]
  sections: string[]
  format: 'pdf' | 'word' | 'excel'
  template?: string
  includeAttachments: boolean
  combineFiles: boolean
}

export interface ExportAnalysisConfig {
  period: {
    start: string
    end: string
  }
  comparisonPeriod?: {
    start: string
    end: string
  }
  reportType: 'executive' | 'detailed' | 'technical'
  sections: string[]
  chartTypes: string[]
  format: 'pdf' | 'excel' | 'powerpoint'
  additionalOptions: {
    includeRawData: boolean
    includePhotos: boolean
    includeRCASummaries: boolean
    generateExecutiveSummary: boolean
  }
}

interface ExportDowntimeDataModalProps {
  isOpen: boolean
  onClose: () => void
  onExport: (config: ExportDowntimeConfig) => Promise<void>
}

interface ExportRCAReportModalProps {
  isOpen: boolean
  onClose: () => void
  onExport: (config: ExportRCAConfig) => Promise<void>
}

interface ExportAnalysisReportModalProps {
  isOpen: boolean
  onClose: () => void
  onExport: (config: ExportAnalysisConfig) => Promise<void>
}

// ============================================================================
// MODAL 1: EXPORT DOWNTIME DATA
// ============================================================================

export function ExportDowntimeDataModal({
  isOpen,
  onClose,
  onExport,
}: ExportDowntimeDataModalProps) {
  const [exportType, setExportType] = useState<'events' | 'summary' | 'analysis'>('events')
  const [dateRange, setDateRange] = useState({
    start: '',
    end: '',
  })
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedSeverities, setSelectedSeverities] = useState<string[]>([])
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
  const [format, setFormat] = useState<'excel' | 'pdf' | 'csv'>('excel')
  const [includeFields, setIncludeFields] = useState<string[]>([
    'Event Details',
    'Impact Metrics',
    'Resolution Info',
  ])
  const [summaryOptions, setSummaryOptions] = useState<string[]>([
    'Statistics',
    'Category Breakdown',
  ])
  const [isGenerating, setIsGenerating] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [notice, setNotice] = useState('')

  const equipmentList = [
    'CNC Mill 001',
    'Lathe 002',
    'Press 003',
    'Grinder 004',
    'Welder 005',
    'Assembly Line A',
    'Packaging Unit B',
  ]

  const categories = [
    'Mechanical Failure',
    'Electrical Issue',
    'Material Shortage',
    'Operator Error',
    'Planned Maintenance',
    'Quality Issue',
  ]

  const severities = ['Critical', 'High', 'Medium', 'Low']
  const statuses = ['Ongoing', 'Resolved']

  const eventFields = [
    'Event Details',
    'Impact Metrics',
    'Resolution Info',
    'Timeline',
    'Cost Data',
    'Affected Work Orders',
  ]

  const summaryOptionsData = [
    'Statistics',
    'Category Breakdown',
    'Equipment Analysis',
    'Cost Summary',
    'Charts',
  ]

  const handleQuickDateRange = (range: string) => {
    const end = new Date()
    const start = new Date()

    switch (range) {
      case 'last7':
        start.setDate(start.getDate() - 7)
        break
      case 'last30':
        start.setDate(start.getDate() - 30)
        break
      case 'lastQuarter':
        start.setMonth(start.getMonth() - 3)
        break
      case 'lastYear':
        start.setFullYear(start.getFullYear() - 1)
        break
    }

    setDateRange({
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
    })
    setErrors((prev) => ({ ...prev, dateRange: '' }))
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!dateRange.start || !dateRange.end) {
      newErrors.dateRange = 'Both start and end dates are required'
    } else {
      const start = new Date(dateRange.start)
      const end = new Date(dateRange.end)
      const today = new Date()
      const yearAgo = new Date()
      yearAgo.setFullYear(yearAgo.getFullYear() - 1)

      if (end < start) {
        newErrors.dateRange = 'End date must be after start date'
      } else if (end > today) {
        newErrors.dateRange = 'End date cannot be in the future'
      } else if (start < yearAgo) {
        newErrors.dateRange = 'Date range cannot exceed 1 year'
      }
    }

    if (exportType === 'events' && includeFields.length === 0) {
      newErrors.includeFields = 'Select at least one field to include'
    }

    if (exportType === 'summary' && summaryOptions.length === 0) {
      newErrors.summaryOptions = 'Select at least one summary option'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const calculatePreview = () => {
    const start = dateRange.start ? new Date(dateRange.start) : null
    const end = dateRange.end ? new Date(dateRange.end) : null
    const days = start && end ? Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) : 0

    // Estimate number of events (mock calculation)
    const estimatedEvents = days * 3.5
    const filterCount =
      selectedEquipment.length +
      selectedCategories.length +
      selectedSeverities.length +
      selectedStatuses.length

    let estimatedSize = '2-5 MB'
    if (format === 'pdf') estimatedSize = '500 KB - 2 MB'
    if (format === 'csv') estimatedSize = '100-500 KB'

    return {
      days,
      estimatedEvents: Math.round(estimatedEvents),
      filterCount,
      estimatedSize,
    }
  }

  const handleExport = async () => {
    if (!validateForm()) return

    setIsGenerating(true)

    const config: ExportDowntimeConfig = {
      exportType,
      dateRange,
      filters: {
        equipment: selectedEquipment,
        category: selectedCategories,
        severity: selectedSeverities,
        status: selectedStatuses,
      },
      format,
      includeFields: exportType === 'events' ? includeFields : undefined,
      summaryOptions: exportType === 'summary' ? summaryOptions : undefined,
    }

    try {
      await onExport(config)
      onClose()
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleScheduleExport = () => {
    setNotice(
      'Scheduled exports are not yet available. Use "Generate & Download" for an immediate export.'
    )
  }

  const preview = calculatePreview()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-lg shadow-xl  w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-3 rounded-t-lg sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Download className="w-6 h-6" />
              <h2 className="text-xl font-semibold">Export Downtime Data</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-3">
          {/* Export Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Export Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setExportType('events')}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  exportType === 'events'
                    ? 'border-green-600 bg-green-50'
                    : 'border-gray-200 hover:border-green-300'
                }`}
              >
                <FileText className="w-6 h-6 text-green-600 mb-2" />
                <div className="font-medium text-gray-900">Events List</div>
                <div className="text-xs text-gray-500 mt-1">
                  Detailed event data
                </div>
              </button>

              <button
                onClick={() => setExportType('summary')}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  exportType === 'summary'
                    ? 'border-green-600 bg-green-50'
                    : 'border-gray-200 hover:border-green-300'
                }`}
              >
                <BarChart3 className="w-6 h-6 text-green-600 mb-2" />
                <div className="font-medium text-gray-900">Summary Report</div>
                <div className="text-xs text-gray-500 mt-1">
                  Aggregated statistics
                </div>
              </button>

              <button
                onClick={() => setExportType('analysis')}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  exportType === 'analysis'
                    ? 'border-green-600 bg-green-50'
                    : 'border-gray-200 hover:border-green-300'
                }`}
              >
                <TrendingUp className="w-6 h-6 text-green-600 mb-2" />
                <div className="font-medium text-gray-900">Analysis Report</div>
                <div className="text-xs text-gray-500 mt-1">
                  Trends and charts
                </div>
              </button>
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <Calendar className="w-4 h-4 inline mr-2" />
              Date Range
            </label>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">From</label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => {
                    setDateRange((prev) => ({ ...prev, start: e.target.value }))
                    setErrors((prev) => ({ ...prev, dateRange: '' }))
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">To</label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => {
                    setDateRange((prev) => ({ ...prev, end: e.target.value }))
                    setErrors((prev) => ({ ...prev, dateRange: '' }))
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
            {errors.dateRange && (
              <p className="text-sm text-red-600 mb-3">{errors.dateRange}</p>
            )}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleQuickDateRange('last7')}
                className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                Last 7 Days
              </button>
              <button
                onClick={() => handleQuickDateRange('last30')}
                className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                Last 30 Days
              </button>
              <button
                onClick={() => handleQuickDateRange('lastQuarter')}
                className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                Last Quarter
              </button>
              <button
                onClick={() => handleQuickDateRange('lastYear')}
                className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                Last Year
              </button>
            </div>
          </div>

          {/* Filters */}
          <div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-between w-full text-sm font-medium text-gray-700 mb-3"
            >
              <span>
                <Filter className="w-4 h-4 inline mr-2" />
                Filters {preview.filterCount > 0 && `(${preview.filterCount} active)`}
              </span>
              {showFilters ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {showFilters && (
              <div className="space-y-2 border border-gray-200 rounded-lg p-3">
                {/* Equipment */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Equipment
                  </label>
                  <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                    {equipmentList.map((equipment) => (
                      <label key={equipment} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={selectedEquipment.includes(equipment)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedEquipment([...selectedEquipment, equipment])
                            } else {
                              setSelectedEquipment(
                                selectedEquipment.filter((e) => e !== equipment)
                              )
                            }
                          }}
                          className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-700">{equipment}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map((category) => (
                      <label key={category} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCategories([...selectedCategories, category])
                            } else {
                              setSelectedCategories(
                                selectedCategories.filter((c) => c !== category)
                              )
                            }
                          }}
                          className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-700">{category}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Severity */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Severity
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {severities.map((severity) => (
                      <label key={severity} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={selectedSeverities.includes(severity)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedSeverities([...selectedSeverities, severity])
                            } else {
                              setSelectedSeverities(
                                selectedSeverities.filter((s) => s !== severity)
                              )
                            }
                          }}
                          className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-700">{severity}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {statuses.map((status) => (
                      <label key={status} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={selectedStatuses.includes(status)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedStatuses([...selectedStatuses, status])
                            } else {
                              setSelectedStatuses(
                                selectedStatuses.filter((s) => s !== status)
                              )
                            }
                          }}
                          className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-700">{status}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Export Format
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setFormat('excel')}
                className={`p-4 border-2 rounded-lg text-center transition-all ${
                  format === 'excel'
                    ? 'border-green-600 bg-green-50'
                    : 'border-gray-200 hover:border-green-300'
                }`}
              >
                <FileSpreadsheet className="w-8 h-8 text-green-600 mb-2" />
                <div className="font-medium text-gray-900">Excel</div>
                <div className="text-xs text-gray-500">.xlsx</div>
              </button>

              <button
                onClick={() => setFormat('pdf')}
                className={`p-4 border-2 rounded-lg text-center transition-all ${
                  format === 'pdf'
                    ? 'border-green-600 bg-green-50'
                    : 'border-gray-200 hover:border-green-300'
                }`}
              >
                <FileText className="w-8 h-8 text-green-600 mb-2" />
                <div className="font-medium text-gray-900">PDF</div>
                <div className="text-xs text-gray-500">.pdf</div>
              </button>

              <button
                onClick={() => setFormat('csv')}
                className={`p-4 border-2 rounded-lg text-center transition-all ${
                  format === 'csv'
                    ? 'border-green-600 bg-green-50'
                    : 'border-gray-200 hover:border-green-300'
                }`}
              >
                <Database className="w-8 h-8 text-green-600 mb-2" />
                <div className="font-medium text-gray-900">CSV</div>
                <div className="text-xs text-gray-500">.csv</div>
              </button>
            </div>
          </div>

          {/* Include Fields (Events List) */}
          {exportType === 'events' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Include Fields
              </label>
              <div className="grid grid-cols-2 gap-3">
                {eventFields.map((field) => (
                  <label key={field} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={includeFields.includes(field)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setIncludeFields([...includeFields, field])
                        } else {
                          setIncludeFields(includeFields.filter((f) => f !== field))
                        }
                        setErrors((prev) => ({ ...prev, includeFields: '' }))
                      }}
                      className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700">{field}</span>
                  </label>
                ))}
              </div>
              {errors.includeFields && (
                <p className="text-sm text-red-600 mt-2">{errors.includeFields}</p>
              )}
            </div>
          )}

          {/* Summary Options (Summary Report) */}
          {exportType === 'summary' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Summary Options
              </label>
              <div className="grid grid-cols-2 gap-3">
                {summaryOptionsData.map((option) => (
                  <label key={option} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={summaryOptions.includes(option)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSummaryOptions([...summaryOptions, option])
                        } else {
                          setSummaryOptions(summaryOptions.filter((o) => o !== option))
                        }
                        setErrors((prev) => ({ ...prev, summaryOptions: '' }))
                      }}
                      className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
              {errors.summaryOptions && (
                <p className="text-sm text-red-600 mt-2">{errors.summaryOptions}</p>
              )}
            </div>
          )}

          {/* Preview Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-blue-900 mb-2">
                  Export Preview
                </h4>
                <div className="space-y-1 text-sm text-blue-800">
                  <div>
                    <span className="font-medium">Date Range:</span>{' '}
                    {dateRange.start && dateRange.end
                      ? `${dateRange.start} to ${dateRange.end} (${preview.days} days)`
                      : 'Not selected'}
                  </div>
                  <div>
                    <span className="font-medium">Estimated Events:</span>{' '}
                    {preview.estimatedEvents || 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Active Filters:</span>{' '}
                    {preview.filterCount || 'None'}
                  </div>
                  <div>
                    <span className="font-medium">Format:</span>{' '}
                    {format.toUpperCase()}
                  </div>
                  <div>
                    <span className="font-medium">Estimated Size:</span>{' '}
                    {preview.estimatedSize}
                  </div>
                  {exportType === 'events' && (
                    <div>
                      <span className="font-medium">Fields Included:</span>{' '}
                      {includeFields.length}
                    </div>
                  )}
                  {exportType === 'summary' && (
                    <div>
                      <span className="font-medium">Summary Sections:</span>{' '}
                      {summaryOptions.length}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-200 p-3 bg-gray-50 rounded-b-lg">
          {notice && (
            <div className="mb-3 flex items-start space-x-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-800">
              <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{notice}</span>
            </div>
          )}
          <div className="flex justify-between items-center">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              Cancel
            </button>
            <div className="flex space-x-3">
              <button
                onClick={handleScheduleExport}
                disabled={isGenerating}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Clock className="w-4 h-4 inline mr-2" />
                Schedule Export
              </button>
              <button
                onClick={handleExport}
                disabled={isGenerating}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Generate & Download</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// MODAL 2: EXPORT RCA REPORT
// ============================================================================

export function ExportRCAReportModal({
  isOpen,
  onClose,
  onExport,
}: ExportRCAReportModalProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRCAs, setSelectedRCAs] = useState<string[]>([])
  const [selectedSections, setSelectedSections] = useState<string[]>([
    'Executive Summary',
    'Problem Statement',
    'Root Cause Analysis',
    'Corrective Actions',
  ])
  const [format, setFormat] = useState<'pdf' | 'word' | 'excel'>('pdf')
  const [template, setTemplate] = useState('Standard Report')
  const [includeAttachments, setIncludeAttachments] = useState(true)
  const [combineFiles, setCombineFiles] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [notice, setNotice] = useState('')

  const rcaInvestigations = [
    {
      id: 'RCA-001',
      equipment: 'CNC Mill 001',
      issue: 'Spindle bearing failure',
      status: 'Completed',
      date: '2025-10-15',
    },
    {
      id: 'RCA-002',
      equipment: 'Press 003',
      issue: 'Hydraulic system leak',
      status: 'Completed',
      date: '2025-10-20',
    },
    {
      id: 'RCA-003',
      equipment: 'Assembly Line A',
      issue: 'Conveyor belt misalignment',
      status: 'In Progress',
      date: '2025-10-25',
    },
    {
      id: 'RCA-004',
      equipment: 'Grinder 004',
      issue: 'Motor overheating',
      status: 'Completed',
      date: '2025-10-28',
    },
  ]

  const reportSections = [
    {
      name: 'Executive Summary',
      description: 'High-level overview',
    },
    {
      name: 'Problem Statement',
      description: 'Detailed problem description',
    },
    {
      name: 'Investigation Timeline',
      description: 'Dates and milestones',
    },
    {
      name: 'Root Cause Analysis',
      description: '5 Whys, fishbone',
    },
    {
      name: 'Corrective Actions',
      description: 'Actions and status',
    },
    {
      name: 'Preventive Actions',
      description: 'Actions and status',
    },
    {
      name: 'Cost Analysis',
      description: 'Estimated vs actual',
    },
    {
      name: 'Lessons Learned',
      description: 'Insights and recommendations',
    },
    {
      name: 'Appendix',
      description: 'Supporting documents',
    },
  ]

  const templates = [
    'Standard Report',
    'Executive Summary',
    'Technical Detailed',
    'Regulatory Compliance',
  ]

  const filteredRCAs = rcaInvestigations.filter(
    (rca) =>
      rca.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rca.equipment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rca.issue.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSelectAll = () => {
    if (selectedRCAs.length === filteredRCAs.length) {
      setSelectedRCAs([])
    } else {
      setSelectedRCAs(filteredRCAs.map((rca) => rca.id))
    }
  }

  const calculatePreview = () => {
    const basePages = 8
    const pagesPerSection = 2
    const totalPages =
      basePages + selectedSections.length * pagesPerSection * selectedRCAs.length

    return {
      rcaCount: selectedRCAs.length,
      sectionCount: selectedSections.length,
      estimatedPages: combineFiles ? totalPages : Math.ceil(totalPages / selectedRCAs.length),
    }
  }

  const handleExport = async () => {
    if (selectedRCAs.length === 0) {
      alert('Please select at least one RCA investigation')
      return
    }

    setIsGenerating(true)

    const config: ExportRCAConfig = {
      rcaIds: selectedRCAs,
      sections: selectedSections,
      format,
      template: format === 'pdf' ? template : undefined,
      includeAttachments,
      combineFiles,
    }

    try {
      await onExport(config)
      onClose()
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePreview = () => {
    setNotice(
      'A separate preview is not yet available. Use "Generate Report" to produce the export.'
    )
  }

  const preview = calculatePreview()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-lg shadow-xl  w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-3 rounded-t-lg sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileCheck className="w-6 h-6" />
              <h2 className="text-xl font-semibold">Export RCA Report</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-3">
          {/* RCA Investigations Selection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Select RCA Investigations
              </label>
              <div className="flex space-x-2">
                <button
                  onClick={handleSelectAll}
                  className="px-3 py-1 text-sm bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg transition-colors"
                >
                  {selectedRCAs.length === filteredRCAs.length
                    ? 'Clear All'
                    : 'Select All'}
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by RCA number, equipment, or issue..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* RCA List */}
            <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
              {filteredRCAs.map((rca) => (
                <label
                  key={rca.id}
                  className={`flex items-start space-x-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0 ${
                    selectedRCAs.includes(rca.id) ? 'bg-purple-50' : ''
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedRCAs.includes(rca.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedRCAs([...selectedRCAs, rca.id])
                      } else {
                        setSelectedRCAs(selectedRCAs.filter((id) => id !== rca.id))
                      }
                    }}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">{rca.id}</span>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          rca.status === 'Completed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {rca.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">{rca.equipment}</div>
                    <div className="text-xs text-gray-500 mt-1">{rca.issue}</div>
                    <div className="text-xs text-gray-400 mt-1">{rca.date}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Report Sections */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Report Sections
            </label>
            <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-3">
              {reportSections.map((section) => (
                <label
                  key={section.name}
                  className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedSections.includes(section.name)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedSections([...selectedSections, section.name])
                      } else {
                        setSelectedSections(
                          selectedSections.filter((s) => s !== section.name)
                        )
                      }
                    }}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 mt-1"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 text-sm">
                      {section.name}
                    </div>
                    <div className="text-xs text-gray-500">{section.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Export Format
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setFormat('pdf')}
                className={`p-4 border-2 rounded-lg text-center transition-all ${
                  format === 'pdf'
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <FileText className="w-8 h-8 text-purple-600 mb-2" />
                <div className="font-medium text-gray-900">PDF Report</div>
                <div className="text-xs text-gray-500">Formatted with charts</div>
              </button>

              <button
                onClick={() => setFormat('word')}
                className={`p-4 border-2 rounded-lg text-center transition-all ${
                  format === 'word'
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <FileText className="w-8 h-8 text-purple-600 mb-2" />
                <div className="font-medium text-gray-900">Word Document</div>
                <div className="text-xs text-gray-500">.docx, editable</div>
              </button>

              <button
                onClick={() => setFormat('excel')}
                className={`p-4 border-2 rounded-lg text-center transition-all ${
                  format === 'excel'
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <FileSpreadsheet className="w-8 h-8 text-purple-600 mb-2" />
                <div className="font-medium text-gray-900">Excel Workbook</div>
                <div className="text-xs text-gray-500">.xlsx, data and charts</div>
              </button>
            </div>
          </div>

          {/* Template Selection (PDF only) */}
          {format === 'pdf' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Report Template
              </label>
              <select
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {templates.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Additional Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Additional Options
            </label>
            <div className="space-y-2">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={includeAttachments}
                  onChange={(e) => setIncludeAttachments(e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700">Include attachments</span>
              </label>
              {selectedRCAs.length > 1 && (
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={combineFiles}
                    onChange={(e) => setCombineFiles(e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">
                    Combine into single file
                  </span>
                </label>
              )}
            </div>
          </div>

          {/* Preview Section */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-purple-900 mb-2">
                  Report Preview
                </h4>
                <div className="space-y-1 text-sm text-purple-800">
                  <div>
                    <span className="font-medium">RCAs Selected:</span>{' '}
                    {preview.rcaCount}
                  </div>
                  <div>
                    <span className="font-medium">Sections Included:</span>{' '}
                    {preview.sectionCount}
                  </div>
                  <div>
                    <span className="font-medium">Estimated Pages:</span>{' '}
                    {preview.estimatedPages}
                    {!combineFiles && selectedRCAs.length > 1 && ' per report'}
                  </div>
                  <div>
                    <span className="font-medium">Format:</span>{' '}
                    {format.toUpperCase()}
                    {format === 'pdf' && ` (${template})`}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-200 p-3 bg-gray-50 rounded-b-lg">
          {notice && (
            <div className="mb-3 flex items-start space-x-2 rounded-lg border border-purple-200 bg-purple-50 px-3 py-2 text-sm text-purple-800">
              <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{notice}</span>
            </div>
          )}
          <div className="flex justify-between items-center">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              Cancel
            </button>
            <div className="flex space-x-3">
              <button
                onClick={handlePreview}
                disabled={isGenerating || selectedRCAs.length === 0}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Preview
              </button>
              <button
                onClick={handleExport}
                disabled={isGenerating || selectedRCAs.length === 0}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Generate Report</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// MODAL 3: EXPORT ANALYSIS REPORT
// ============================================================================

export function ExportAnalysisReportModal({
  isOpen,
  onClose,
  onExport,
}: ExportAnalysisReportModalProps) {
  const [period, setPeriod] = useState({ start: '', end: '' })
  const [enableComparison, setEnableComparison] = useState(false)
  const [comparisonPeriod, setComparisonPeriod] = useState({ start: '', end: '' })
  const [reportType, setReportType] = useState<'executive' | 'detailed' | 'technical'>('detailed')
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    overview: true,
  })
  const [selectedSections, setSelectedSections] = useState<string[]>([
    'Overview',
    'Trends',
    'Equipment Analysis',
  ])
  const [selectedCharts, setSelectedCharts] = useState<string[]>([
    'Bar Charts',
    'Pie Charts',
    'Line Charts',
  ])
  const [format, setFormat] = useState<'pdf' | 'excel' | 'powerpoint'>('pdf')
  const [additionalOptions, setAdditionalOptions] = useState({
    includeRawData: false,
    includePhotos: false,
    includeRCASummaries: true,
    generateExecutiveSummary: true,
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [notice, setNotice] = useState('')

  const sections = [
    { name: 'Overview', description: 'Summary statistics, key metrics, availability' },
    { name: 'Trends', description: 'Monthly trends, year-over-year comparison' },
    {
      name: 'Equipment Analysis',
      description: 'Equipment-wise breakdown, MTBF/MTTR',
    },
    { name: 'Category Analysis', description: 'Pareto charts, category breakdown' },
    {
      name: 'Cost Analysis',
      description: 'Total cost, cost by category, ROI on preventive actions',
    },
    { name: 'RCA Summary', description: 'Completed RCAs, effectiveness ratings' },
    { name: 'Recommendations', description: 'Data-driven insights, action items' },
  ]

  const chartTypes = [
    { name: 'Bar Charts', description: 'Monthly trends' },
    { name: 'Pie Charts', description: 'Category breakdown' },
    { name: 'Line Charts', description: 'Trend analysis' },
    { name: 'Scatter Plots', description: 'MTBF vs MTTR' },
    { name: 'Heat Maps', description: 'Equipment vs category' },
  ]

  const toggleSection = (sectionName: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionName]: !prev[sectionName],
    }))
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!period.start || !period.end) {
      newErrors.period = 'Both start and end dates are required'
    } else {
      const start = new Date(period.start)
      const end = new Date(period.end)

      if (end < start) {
        newErrors.period = 'End date must be after start date'
      }
    }

    if (enableComparison) {
      if (!comparisonPeriod.start || !comparisonPeriod.end) {
        newErrors.comparisonPeriod = 'Comparison period dates are required'
      } else {
        const start = new Date(comparisonPeriod.start)
        const end = new Date(comparisonPeriod.end)

        if (end < start) {
          newErrors.comparisonPeriod = 'End date must be after start date'
        }
      }
    }

    if (selectedSections.length === 0) {
      newErrors.sections = 'Select at least one section'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const calculatePreview = () => {
    let basePages = 5
    if (reportType === 'detailed') basePages = 15
    if (reportType === 'technical') basePages = 25

    const sectionsPages = selectedSections.length * 3
    const chartsPages = Math.ceil(selectedCharts.length / 2)
    const totalPages = basePages + sectionsPages + chartsPages

    let estimatedSize = '2-5 MB'
    if (format === 'excel') estimatedSize = '1-3 MB'
    if (format === 'powerpoint') estimatedSize = '5-10 MB'

    if (additionalOptions.includePhotos) {
      estimatedSize = estimatedSize.split('-')[0] + '-15 MB'
    }

    return {
      sectionsCount: selectedSections.length,
      chartsCount: selectedCharts.length,
      estimatedPages: totalPages,
      estimatedSize,
    }
  }

  const handleExport = async () => {
    if (!validateForm()) return

    setIsGenerating(true)

    const config: ExportAnalysisConfig = {
      period,
      comparisonPeriod: enableComparison ? comparisonPeriod : undefined,
      reportType,
      sections: selectedSections,
      chartTypes: selectedCharts,
      format,
      additionalOptions,
    }

    try {
      await onExport(config)
      onClose()
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSaveConfiguration = () => {
    setNotice('Saving report configurations is not yet available.')
  }

  const handleScheduleRecurring = () => {
    setNotice(
      'Recurring scheduled reports are not yet available. Use "Generate Report" for an immediate export.'
    )
  }

  const preview = calculatePreview()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-lg shadow-xl  w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3 rounded-t-lg sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-6 h-6" />
              <h2 className="text-xl font-semibold">Export Analysis Report</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-3">
          {/* Report Period */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <Calendar className="w-4 h-4 inline mr-2" />
              Report Period
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-600 mb-1">From</label>
                <input
                  type="date"
                  value={period.start}
                  onChange={(e) => {
                    setPeriod((prev) => ({ ...prev, start: e.target.value }))
                    setErrors((prev) => ({ ...prev, period: '' }))
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">To</label>
                <input
                  type="date"
                  value={period.end}
                  onChange={(e) => {
                    setPeriod((prev) => ({ ...prev, end: e.target.value }))
                    setErrors((prev) => ({ ...prev, period: '' }))
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            {errors.period && (
              <p className="text-sm text-red-600 mt-2">{errors.period}</p>
            )}

            {/* Comparison Period */}
            <div className="mt-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={enableComparison}
                  onChange={(e) => setEnableComparison(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  Enable comparison period
                </span>
              </label>

              {enableComparison && (
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Comparison From
                    </label>
                    <input
                      type="date"
                      value={comparisonPeriod.start}
                      onChange={(e) => {
                        setComparisonPeriod((prev) => ({
                          ...prev,
                          start: e.target.value,
                        }))
                        setErrors((prev) => ({ ...prev, comparisonPeriod: '' }))
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Comparison To
                    </label>
                    <input
                      type="date"
                      value={comparisonPeriod.end}
                      onChange={(e) => {
                        setComparisonPeriod((prev) => ({
                          ...prev,
                          end: e.target.value,
                        }))
                        setErrors((prev) => ({ ...prev, comparisonPeriod: '' }))
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}
              {errors.comparisonPeriod && (
                <p className="text-sm text-red-600 mt-2">{errors.comparisonPeriod}</p>
              )}
            </div>
          </div>

          {/* Report Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Report Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setReportType('executive')}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  reportType === 'executive'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="font-medium text-gray-900">Executive Summary</div>
                <div className="text-xs text-gray-500 mt-1">
                  1-2 pages, high-level metrics
                </div>
              </button>

              <button
                onClick={() => setReportType('detailed')}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  reportType === 'detailed'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="font-medium text-gray-900">Detailed Analysis</div>
                <div className="text-xs text-gray-500 mt-1">
                  10+ pages, comprehensive
                </div>
              </button>

              <button
                onClick={() => setReportType('technical')}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  reportType === 'technical'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="font-medium text-gray-900">Technical Report</div>
                <div className="text-xs text-gray-500 mt-1">
                  In-depth with calculations
                </div>
              </button>
            </div>
          </div>

          {/* Sections to Include */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Sections to Include
            </label>
            <div className="border border-gray-200 rounded-lg">
              {sections.map((section) => (
                <div key={section.name} className="border-b border-gray-200 last:border-0">
                  <label className="flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-center space-x-3 flex-1">
                      <input
                        type="checkbox"
                        checked={selectedSections.includes(section.name)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedSections([...selectedSections, section.name])
                          } else {
                            setSelectedSections(
                              selectedSections.filter((s) => s !== section.name)
                            )
                          }
                          setErrors((prev) => ({ ...prev, sections: '' }))
                        }}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 text-sm">
                          {section.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {section.description}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        toggleSection(section.name)
                      }}
                      className="ml-2 text-gray-400 hover:text-gray-600"
                    >
                      {expandedSections[section.name] ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </label>
                </div>
              ))}
            </div>
            {errors.sections && (
              <p className="text-sm text-red-600 mt-2">{errors.sections}</p>
            )}
          </div>

          {/* Chart Types */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Chart Types to Include
            </label>
            <div className="grid grid-cols-2 gap-3">
              {chartTypes.map((chart) => (
                <label
                  key={chart.name}
                  className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedCharts.includes(chart.name)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedCharts([...selectedCharts, chart.name])
                      } else {
                        setSelectedCharts(
                          selectedCharts.filter((c) => c !== chart.name)
                        )
                      }
                    }}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 mt-1"
                  />
                  <div className="flex items-start space-x-2 flex-1">
                    {chart.name === 'Bar Charts' && (
                      <BarChart3 className="w-5 h-5 text-blue-600 mt-0.5" />
                    )}
                    {chart.name === 'Pie Charts' && (
                      <PieChart className="w-5 h-5 text-blue-600 mt-0.5" />
                    )}
                    {chart.name === 'Line Charts' && (
                      <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
                    )}
                    {chart.name === 'Scatter Plots' && (
                      <BarChart3 className="w-5 h-5 text-blue-600 mt-0.5" />
                    )}
                    {chart.name === 'Heat Maps' && (
                      <Settings className="w-5 h-5 text-blue-600 mt-0.5" />
                    )}
                    <div>
                      <div className="font-medium text-gray-900 text-sm">
                        {chart.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {chart.description}
                      </div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Export Format
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setFormat('pdf')}
                className={`p-4 border-2 rounded-lg text-center transition-all ${
                  format === 'pdf'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <FileText className="w-8 h-8 text-blue-600 mb-2" />
                <div className="font-medium text-gray-900">PDF</div>
                <div className="text-xs text-gray-500">With charts, printable</div>
              </button>

              <button
                onClick={() => setFormat('excel')}
                className={`p-4 border-2 rounded-lg text-center transition-all ${
                  format === 'excel'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <FileSpreadsheet className="w-8 h-8 text-blue-600 mb-2" />
                <div className="font-medium text-gray-900">Excel</div>
                <div className="text-xs text-gray-500">Raw data and pivots</div>
              </button>

              <button
                onClick={() => setFormat('powerpoint')}
                className={`p-4 border-2 rounded-lg text-center transition-all ${
                  format === 'powerpoint'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <Presentation className="w-8 h-8 text-blue-600 mb-2" />
                <div className="font-medium text-gray-900">PowerPoint</div>
                <div className="text-xs text-gray-500">Presentation slides</div>
              </button>
            </div>
          </div>

          {/* Additional Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Additional Options
            </label>
            <div className="space-y-2">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={additionalOptions.includeRawData}
                  onChange={(e) =>
                    setAdditionalOptions((prev) => ({
                      ...prev,
                      includeRawData: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  Include raw data appendix
                </span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={additionalOptions.includePhotos}
                  onChange={(e) =>
                    setAdditionalOptions((prev) => ({
                      ...prev,
                      includePhotos: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Include equipment photos</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={additionalOptions.includeRCASummaries}
                  onChange={(e) =>
                    setAdditionalOptions((prev) => ({
                      ...prev,
                      includeRCASummaries: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Include RCA summaries</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={additionalOptions.generateExecutiveSummary}
                  onChange={(e) =>
                    setAdditionalOptions((prev) => ({
                      ...prev,
                      generateExecutiveSummary: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  Generate executive summary page
                </span>
              </label>
            </div>
          </div>

          {/* Preview Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-blue-900 mb-2">
                  Report Configuration Preview
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1 text-sm text-blue-800">
                    <div>
                      <span className="font-medium">Report Type:</span>{' '}
                      {reportType === 'executive'
                        ? 'Executive Summary'
                        : reportType === 'detailed'
                        ? 'Detailed Analysis'
                        : 'Technical Report'}
                    </div>
                    <div>
                      <span className="font-medium">Sections:</span>{' '}
                      {preview.sectionsCount}
                    </div>
                    <div>
                      <span className="font-medium">Charts:</span> {preview.chartsCount}
                    </div>
                  </div>
                  <div className="space-y-1 text-sm text-blue-800">
                    <div>
                      <span className="font-medium">Format:</span>{' '}
                      {format.toUpperCase()}
                    </div>
                    <div>
                      <span className="font-medium">Estimated Pages:</span>{' '}
                      {preview.estimatedPages}
                    </div>
                    <div>
                      <span className="font-medium">Estimated Size:</span>{' '}
                      {preview.estimatedSize}
                    </div>
                  </div>
                </div>
                {period.start && period.end && (
                  <div className="mt-2 text-sm text-blue-800">
                    <span className="font-medium">Date Range:</span> {period.start} to{' '}
                    {period.end}
                    {enableComparison &&
                      comparisonPeriod.start &&
                      comparisonPeriod.end && (
                        <span className="ml-2">
                          (vs {comparisonPeriod.start} to {comparisonPeriod.end})
                        </span>
                      )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-200 p-3 bg-gray-50 rounded-b-lg">
          {notice && (
            <div className="mb-3 flex items-start space-x-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-800">
              <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{notice}</span>
            </div>
          )}
          <div className="flex justify-between items-center">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              Cancel
            </button>
            <div className="flex space-x-3">
              <button
                onClick={handleSaveConfiguration}
                disabled={isGenerating}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Settings className="w-4 h-4 inline mr-2" />
                Save Configuration
              </button>
              <button
                onClick={handleScheduleRecurring}
                disabled={isGenerating}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Clock className="w-4 h-4 inline mr-2" />
                Schedule Recurring
              </button>
              <button
                onClick={handleExport}
                disabled={isGenerating}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Generate Report</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
