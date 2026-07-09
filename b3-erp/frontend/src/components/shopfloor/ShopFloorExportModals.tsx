'use client'

import React, { useState } from 'react'
import { Download, Calendar, FileText, X, CheckCircle2, AlertCircle } from 'lucide-react'

// ============================================================================
// INTERFACES
// ============================================================================

interface OperatorExportModalProps {
  isOpen: boolean
  onClose: () => void
  onExport: (config: OperatorExportConfig) => void
  operatorName?: string
}

export interface OperatorExportConfig {
  format: 'excel' | 'pdf' | 'csv'
  dateFrom: string
  dateTo: string
  includeEfficiency: boolean
  includeQuality: boolean
  includeDowntime: boolean
  includeProductionSummary: boolean
}

interface LogExportModalProps {
  isOpen: boolean
  onClose: () => void
  onExport: (config: LogExportConfig) => void
  dateRange?: {
    from: string
    to: string
  }
}

export interface LogExportConfig {
  format: 'excel' | 'pdf' | 'csv'
  dateFrom: string
  dateTo: string
  logTypes: {
    production: boolean
    quality: boolean
    downtime: boolean
    materialRequest: boolean
  }
  includeOperatorDetails: boolean
  includeTimestamps: boolean
  includeStationInfo: boolean
}

// ============================================================================
// OPERATOR EXPORT MODAL
// ============================================================================

export function OperatorExportModal({
  isOpen,
  onClose,
  onExport,
  operatorName = 'Operator',
}: OperatorExportModalProps) {
  const [formData, setFormData] = useState<OperatorExportConfig>({
    format: 'excel',
    dateFrom: '',
    dateTo: '',
    includeEfficiency: true,
    includeQuality: true,
    includeDowntime: true,
    includeProductionSummary: true,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isExporting, setIsExporting] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.format) {
      newErrors.format = 'Please select an export format'
    }

    if (!formData.dateFrom) {
      newErrors.dateFrom = 'Start date is required'
    }

    if (!formData.dateTo) {
      newErrors.dateTo = 'End date is required'
    }

    if (formData.dateFrom && formData.dateTo) {
      const fromDate = new Date(formData.dateFrom)
      const toDate = new Date(formData.dateTo)

      if (fromDate > toDate) {
        newErrors.dateRange = 'End date must be after start date'
      }

      // Check if date range is too large (more than 1 year)
      const daysDiff = Math.floor((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24))
      if (daysDiff > 365) {
        newErrors.dateRange = 'Date range cannot exceed 1 year'
      }
    }

    // Check if at least one option is selected
    if (
      !formData.includeEfficiency &&
      !formData.includeQuality &&
      !formData.includeDowntime &&
      !formData.includeProductionSummary
    ) {
      newErrors.options = 'Please select at least one data option to include'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsExporting(true)

    try {
      // Delegate the actual export to the parent handler, which builds the
      // download from in-scope operator data (see onExport prop).
      onExport(formData)
      handleClose()
    } catch (error) {
      setErrors({ submit: 'Export failed. Please try again.' })
    } finally {
      setIsExporting(false)
    }
  }

  const handleClose = () => {
    if (!isExporting) {
      setFormData({
        format: 'excel',
        dateFrom: '',
        dateTo: '',
        includeEfficiency: true,
        includeQuality: true,
        includeDowntime: true,
        includeProductionSummary: true,
      })
      setErrors({})
      onClose()
    }
  }

  const updateFormData = (updates: Partial<OperatorExportConfig>) => {
    setFormData((prev) => ({ ...prev, ...updates }))
    // Clear related errors when user makes changes
    if (updates.format) setErrors((prev) => ({ ...prev, format: '' }))
    if (updates.dateFrom) setErrors((prev) => ({ ...prev, dateFrom: '', dateRange: '' }))
    if (updates.dateTo) setErrors((prev) => ({ ...prev, dateTo: '', dateRange: '' }))
    if (
      updates.includeEfficiency !== undefined ||
      updates.includeQuality !== undefined ||
      updates.includeDowntime !== undefined ||
      updates.includeProductionSummary !== undefined
    ) {
      setErrors((prev) => ({ ...prev, options: '' }))
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-green-600 to-green-700 text-white px-3 py-2 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Export Operator Performance</h2>
                <p className="text-green-100 text-sm">{operatorName}</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={isExporting}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-3">
          {/* Format Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Export Format <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'excel', label: 'Excel', icon: FileText },
                { value: 'pdf', label: 'PDF', icon: FileText },
                { value: 'csv', label: 'CSV', icon: FileText },
              ].map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => updateFormData({ format: value as 'excel' | 'pdf' | 'csv' })}
                  className={`
                    flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all
                    ${
                      formData.format === value
                        ? 'border-green-600 bg-green-50 text-green-700'
                        : 'border-gray-200 hover:border-green-300 text-gray-600'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{label}</span>
                </button>
              ))}
            </div>
            {errors.format && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.format}
              </p>
            )}
          </div>

          {/* Date Range */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Date Range <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <label className="block text-xs text-gray-600">From Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    value={formData.dateFrom}
                    onChange={(e) => updateFormData({ dateFrom: e.target.value })}
                    className={`
                      w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent
                      ${errors.dateFrom || errors.dateRange ? 'border-red-300' : 'border-gray-300'}
                    `}
                    disabled={isExporting}
                  />
                </div>
                {errors.dateFrom && (
                  <p className="text-xs text-red-600">{errors.dateFrom}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-xs text-gray-600">To Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    value={formData.dateTo}
                    onChange={(e) => updateFormData({ dateTo: e.target.value })}
                    className={`
                      w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent
                      ${errors.dateTo || errors.dateRange ? 'border-red-300' : 'border-gray-300'}
                    `}
                    disabled={isExporting}
                  />
                </div>
                {errors.dateTo && (
                  <p className="text-xs text-red-600">{errors.dateTo}</p>
                )}
              </div>
            </div>
            {errors.dateRange && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.dateRange}
              </p>
            )}
          </div>

          {/* Export Options */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Include Data <span className="text-red-500">*</span>
            </label>
            <div className="space-y-3 bg-gray-50 p-3 rounded-lg">
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center mt-0.5">
                  <input
                    type="checkbox"
                    checked={formData.includeEfficiency}
                    onChange={(e) =>
                      updateFormData({ includeEfficiency: e.target.checked })
                    }
                    className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
                    disabled={isExporting}
                  />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900 group-hover:text-green-700 transition-colors">
                    Efficiency Metrics
                  </div>
                  <div className="text-sm text-gray-500">
                    OEE, availability, performance, and quality rates
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center mt-0.5">
                  <input
                    type="checkbox"
                    checked={formData.includeQuality}
                    onChange={(e) =>
                      updateFormData({ includeQuality: e.target.checked })
                    }
                    className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
                    disabled={isExporting}
                  />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900 group-hover:text-green-700 transition-colors">
                    Quality Metrics
                  </div>
                  <div className="text-sm text-gray-500">
                    Defect rates, quality checks, and rejection data
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center mt-0.5">
                  <input
                    type="checkbox"
                    checked={formData.includeDowntime}
                    onChange={(e) =>
                      updateFormData({ includeDowntime: e.target.checked })
                    }
                    className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
                    disabled={isExporting}
                  />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900 group-hover:text-green-700 transition-colors">
                    Downtime Details
                  </div>
                  <div className="text-sm text-gray-500">
                    Downtime events, durations, and reasons
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center mt-0.5">
                  <input
                    type="checkbox"
                    checked={formData.includeProductionSummary}
                    onChange={(e) =>
                      updateFormData({ includeProductionSummary: e.target.checked })
                    }
                    className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
                    disabled={isExporting}
                  />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900 group-hover:text-green-700 transition-colors">
                    Production Summary
                  </div>
                  <div className="text-sm text-gray-500">
                    Units produced, work orders completed, and cycle times
                  </div>
                </div>
              </label>
            </div>
            {errors.options && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.options}
              </p>
            )}
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {errors.submit}
              </p>
            </div>
          )}

          {/* Export Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Export will include:</p>
                <ul className="space-y-1 text-blue-700">
                  <li>Operator performance data for {operatorName}</li>
                  <li>Selected metrics within the specified date range</li>
                  <li>Formatted {formData.format.toUpperCase()} file ready for analysis</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleClose}
              disabled={isExporting}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isExporting}
              className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-lg shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isExporting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Export Data
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ============================================================================
// LOG EXPORT MODAL
// ============================================================================

export function LogExportModal({
  isOpen,
  onClose,
  onExport,
  dateRange,
}: LogExportModalProps) {
  const [formData, setFormData] = useState<LogExportConfig>({
    format: 'excel',
    dateFrom: dateRange?.from || '',
    dateTo: dateRange?.to || '',
    logTypes: {
      production: true,
      quality: true,
      downtime: true,
      materialRequest: true,
    },
    includeOperatorDetails: true,
    includeTimestamps: true,
    includeStationInfo: true,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isExporting, setIsExporting] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.format) {
      newErrors.format = 'Please select an export format'
    }

    if (!formData.dateFrom) {
      newErrors.dateFrom = 'Start date is required'
    }

    if (!formData.dateTo) {
      newErrors.dateTo = 'End date is required'
    }

    if (formData.dateFrom && formData.dateTo) {
      const fromDate = new Date(formData.dateFrom)
      const toDate = new Date(formData.dateTo)

      if (fromDate > toDate) {
        newErrors.dateRange = 'End date must be after start date'
      }

      // Check if date range is too large (more than 6 months)
      const daysDiff = Math.floor((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24))
      if (daysDiff > 180) {
        newErrors.dateRange = 'Date range cannot exceed 6 months for log exports'
      }
    }

    // Check if at least one log type is selected
    const { logTypes } = formData
    if (
      !logTypes.production &&
      !logTypes.quality &&
      !logTypes.downtime &&
      !logTypes.materialRequest
    ) {
      newErrors.logTypes = 'Please select at least one log type to export'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsExporting(true)

    try {
      // Delegate the actual export to the parent handler, which builds the
      // download from in-scope log data (see onExport prop).
      onExport(formData)
      handleClose()
    } catch (error) {
      setErrors({ submit: 'Export failed. Please try again.' })
    } finally {
      setIsExporting(false)
    }
  }

  const handleClose = () => {
    if (!isExporting) {
      setFormData({
        format: 'excel',
        dateFrom: dateRange?.from || '',
        dateTo: dateRange?.to || '',
        logTypes: {
          production: true,
          quality: true,
          downtime: true,
          materialRequest: true,
        },
        includeOperatorDetails: true,
        includeTimestamps: true,
        includeStationInfo: true,
      })
      setErrors({})
      onClose()
    }
  }

  const updateFormData = (updates: Partial<LogExportConfig>) => {
    setFormData((prev) => ({ ...prev, ...updates }))
    // Clear related errors when user makes changes
    if (updates.format) setErrors((prev) => ({ ...prev, format: '' }))
    if (updates.dateFrom) setErrors((prev) => ({ ...prev, dateFrom: '', dateRange: '' }))
    if (updates.dateTo) setErrors((prev) => ({ ...prev, dateTo: '', dateRange: '' }))
    if (updates.logTypes) setErrors((prev) => ({ ...prev, logTypes: '' }))
  }

  const updateLogTypes = (updates: Partial<LogExportConfig['logTypes']>) => {
    setFormData((prev) => ({
      ...prev,
      logTypes: { ...prev.logTypes, ...updates },
    }))
    setErrors((prev) => ({ ...prev, logTypes: '' }))
  }

  const getSelectedLogTypesCount = () => {
    const { logTypes } = formData
    return Object.values(logTypes).filter(Boolean).length
  }

  const formatDateRange = () => {
    if (!formData.dateFrom || !formData.dateTo) {
      return 'Select date range'
    }
    const from = new Date(formData.dateFrom).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
    const to = new Date(formData.dateTo).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
    return `${from} - ${to}`
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-green-600 to-green-700 text-white px-3 py-2 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Export Shop Floor Logs</h2>
                <p className="text-green-100 text-sm">{formatDateRange()}</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={isExporting}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-3">
          {/* Format Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Export Format <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'excel', label: 'Excel', icon: FileText },
                { value: 'pdf', label: 'PDF', icon: FileText },
                { value: 'csv', label: 'CSV', icon: FileText },
              ].map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => updateFormData({ format: value as 'excel' | 'pdf' | 'csv' })}
                  className={`
                    flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all
                    ${
                      formData.format === value
                        ? 'border-green-600 bg-green-50 text-green-700'
                        : 'border-gray-200 hover:border-green-300 text-gray-600'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{label}</span>
                </button>
              ))}
            </div>
            {errors.format && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.format}
              </p>
            )}
          </div>

          {/* Date Range */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Date Range <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <label className="block text-xs text-gray-600">From Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    value={formData.dateFrom}
                    onChange={(e) => updateFormData({ dateFrom: e.target.value })}
                    className={`
                      w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent
                      ${errors.dateFrom || errors.dateRange ? 'border-red-300' : 'border-gray-300'}
                    `}
                    disabled={isExporting}
                  />
                </div>
                {errors.dateFrom && (
                  <p className="text-xs text-red-600">{errors.dateFrom}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-xs text-gray-600">To Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    value={formData.dateTo}
                    onChange={(e) => updateFormData({ dateTo: e.target.value })}
                    className={`
                      w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent
                      ${errors.dateTo || errors.dateRange ? 'border-red-300' : 'border-gray-300'}
                    `}
                    disabled={isExporting}
                  />
                </div>
                {errors.dateTo && (
                  <p className="text-xs text-red-600">{errors.dateTo}</p>
                )}
              </div>
            </div>
            {errors.dateRange && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.dateRange}
              </p>
            )}
          </div>

          {/* Log Type Filters */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                Log Types <span className="text-red-500">*</span>
              </label>
              <span className="text-xs text-gray-500">
                {getSelectedLogTypesCount()} of 4 selected
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer border-2 border-transparent hover:border-green-300 transition-all">
                <input
                  type="checkbox"
                  checked={formData.logTypes.production}
                  onChange={(e) => updateLogTypes({ production: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
                  disabled={isExporting}
                />
                <div>
                  <div className="font-medium text-gray-900">Production Logs</div>
                  <div className="text-xs text-gray-500">Start/stop, output data</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer border-2 border-transparent hover:border-green-300 transition-all">
                <input
                  type="checkbox"
                  checked={formData.logTypes.quality}
                  onChange={(e) => updateLogTypes({ quality: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
                  disabled={isExporting}
                />
                <div>
                  <div className="font-medium text-gray-900">Quality Logs</div>
                  <div className="text-xs text-gray-500">Inspections, defects</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer border-2 border-transparent hover:border-green-300 transition-all">
                <input
                  type="checkbox"
                  checked={formData.logTypes.downtime}
                  onChange={(e) => updateLogTypes({ downtime: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
                  disabled={isExporting}
                />
                <div>
                  <div className="font-medium text-gray-900">Downtime Logs</div>
                  <div className="text-xs text-gray-500">Stops, breakdowns</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer border-2 border-transparent hover:border-green-300 transition-all">
                <input
                  type="checkbox"
                  checked={formData.logTypes.materialRequest}
                  onChange={(e) => updateLogTypes({ materialRequest: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
                  disabled={isExporting}
                />
                <div>
                  <div className="font-medium text-gray-900">Material Requests</div>
                  <div className="text-xs text-gray-500">Requests, consumptions</div>
                </div>
              </label>
            </div>
            {errors.logTypes && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.logTypes}
              </p>
            )}
          </div>

          {/* Additional Options */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Additional Options
            </label>
            <div className="space-y-3 bg-gray-50 p-3 rounded-lg">
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center mt-0.5">
                  <input
                    type="checkbox"
                    checked={formData.includeOperatorDetails}
                    onChange={(e) =>
                      updateFormData({ includeOperatorDetails: e.target.checked })
                    }
                    className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
                    disabled={isExporting}
                  />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900 group-hover:text-green-700 transition-colors">
                    Include Operator Details
                  </div>
                  <div className="text-sm text-gray-500">
                    Names, IDs, and roles of operators in each log entry
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center mt-0.5">
                  <input
                    type="checkbox"
                    checked={formData.includeTimestamps}
                    onChange={(e) =>
                      updateFormData({ includeTimestamps: e.target.checked })
                    }
                    className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
                    disabled={isExporting}
                  />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900 group-hover:text-green-700 transition-colors">
                    Include Timestamps
                  </div>
                  <div className="text-sm text-gray-500">
                    Precise date and time for each log entry
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center mt-0.5">
                  <input
                    type="checkbox"
                    checked={formData.includeStationInfo}
                    onChange={(e) =>
                      updateFormData({ includeStationInfo: e.target.checked })
                    }
                    className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
                    disabled={isExporting}
                  />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900 group-hover:text-green-700 transition-colors">
                    Include Station Information
                  </div>
                  <div className="text-sm text-gray-500">
                    Workstation names, locations, and equipment details
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {errors.submit}
              </p>
            </div>
          )}

          {/* Export Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Export will include:</p>
                <ul className="space-y-1 text-blue-700">
                  <li>{getSelectedLogTypesCount()} log type(s) from shop floor activities</li>
                  <li>Data within the specified date range</li>
                  <li>Formatted {formData.format.toUpperCase()} file with selected details</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleClose}
              disabled={isExporting}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isExporting}
              className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-lg shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isExporting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Export Logs
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
