'use client'

import React, { useState, useEffect } from 'react'
import {
  AlertTriangle,
  Clock,
  CheckCircle,
  FileText,
  Edit,
  Trash,
  X,
  Plus,
  Zap,
  MapPin,
  Users,
  DollarSign,
  TrendingDown,
  Calendar,
  Info,
} from 'lucide-react'

// ============================================================================
// TypeScript Interfaces
// ============================================================================

export interface LogDowntimeData {
  equipment: string
  category: string
  severity: string
  startTime: string
  estimatedDuration: number
  description: string
  affectedWO: string
  reportedBy: string
}

export interface DowntimeEvent {
  id: string
  eventNumber: string
  equipment: string
  location: string
  startTime: string
  endTime: string | null
  duration: number
  status: 'ongoing' | 'resolved'
  category: string
  severity: string
  description: string
  affectedWO: string[]
  productionLoss: number
  costImpact: number
  reportedBy: string
  assignedTo: string | null
  resolutionDescription?: string
  actionsTaken?: string
  resolvedBy?: string
  hasRCA?: boolean
  createdAt?: string
  inProgressAt?: string
  resolvedAt?: string
}

export interface EditDowntimeData {
  category?: string
  severity?: string
  description?: string
  assignedTo?: string
  affectedWO?: string
  endTime?: string
  notes?: string
}

export interface ResolveDowntimeData {
  endTime: string
  resolutionDescription: string
  actionsTaken: string
  productionLoss: number
  costImpact: number
  resolvedBy: string
  requireRCA: boolean
}

interface LogDowntimeModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: LogDowntimeData) => void
}

interface ViewDowntimeDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  event: DowntimeEvent | null
  onEdit?: (event: DowntimeEvent) => void
  onResolve?: (event: DowntimeEvent) => void
  onInitiateRCA?: (event: DowntimeEvent) => void
}

interface EditDowntimeEventModalProps {
  isOpen: boolean
  onClose: () => void
  event: DowntimeEvent | null
  onSubmit: (data: EditDowntimeData) => void
}

interface ResolveDowntimeModalProps {
  isOpen: boolean
  onClose: () => void
  event: DowntimeEvent | null
  onSubmit: (data: ResolveDowntimeData) => void
  onSubmitWithRCA: (data: ResolveDowntimeData) => void
}

interface DeleteDowntimeModalProps {
  isOpen: boolean
  onClose: () => void
  event: DowntimeEvent | null
  onConfirm: (reason: string) => void
}

// ============================================================================
// Equipment Options
// ============================================================================

const EQUIPMENT_OPTIONS = [
  'CNC Machine 01',
  'CNC Machine 02',
  'Injection Molding Press A',
  'Injection Molding Press B',
  'Assembly Line 1',
  'Assembly Line 2',
  'Packaging Line',
  'Welding Station 01',
  'Paint Booth',
  'Heat Treatment Furnace',
  'Quality Inspection Station',
  'Material Handling Robot',
  'Warehouse Forklift 03',
  'Conveyor System',
]

const CATEGORY_OPTIONS = [
  { value: 'breakdown', label: 'Equipment Breakdown' },
  { value: 'maintenance', label: 'Planned Maintenance' },
  { value: 'changeover', label: 'Changeover/Setup' },
  { value: 'material-shortage', label: 'Material Shortage' },
  { value: 'no-operator', label: 'No Operator Available' },
  { value: 'power-outage', label: 'Power Outage' },
  { value: 'quality-issue', label: 'Quality Issue' },
]

const SEVERITY_OPTIONS = [
  { value: 'critical', label: 'Critical', color: 'text-red-600' },
  { value: 'high', label: 'High', color: 'text-orange-600' },
  { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
  { value: 'low', label: 'Low', color: 'text-blue-600' },
]

// ============================================================================
// Helper Functions
// ============================================================================

const getSeverityBadgeColor = (severity: string): string => {
  switch (severity) {
    case 'critical':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'high':
      return 'bg-orange-100 text-orange-800 border-orange-200'
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'low':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

const getStatusBadgeColor = (status: string): string => {
  switch (status) {
    case 'ongoing':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'resolved':
      return 'bg-green-100 text-green-800 border-green-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

const getCategoryLabel = (category: string): string => {
  const option = CATEGORY_OPTIONS.find((opt) => opt.value === category)
  return option ? option.label : category
}

const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} minutes`
  }
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (mins === 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}`
  }
  return `${hours}h ${mins}m`
}

const calculateDuration = (startTime: string, endTime: string | null): number => {
  const start = new Date(startTime).getTime()
  const end = endTime ? new Date(endTime).getTime() : Date.now()
  return Math.floor((end - start) / (1000 * 60)) // Convert to minutes
}

// ============================================================================
// 1. LogDowntimeModal Component
// ============================================================================

export const LogDowntimeModal: React.FC<LogDowntimeModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<LogDowntimeData>({
    equipment: '',
    category: '',
    severity: '',
    startTime: '',
    estimatedDuration: 0,
    description: '',
    affectedWO: '',
    reportedBy: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      const now = new Date()
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
      setFormData({
        equipment: '',
        category: '',
        severity: '',
        startTime: now.toISOString().slice(0, 16),
        estimatedDuration: 0,
        description: '',
        affectedWO: '',
        reportedBy: '',
      })
      setErrors({})
    }
  }, [isOpen])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.equipment) {
      newErrors.equipment = 'Equipment is required'
    }

    if (!formData.category) {
      newErrors.category = 'Category is required'
    }

    if (!formData.severity) {
      newErrors.severity = 'Severity is required'
    }

    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required'
    } else {
      const startTime = new Date(formData.startTime)
      const now = new Date()
      if (startTime > now) {
        newErrors.startTime = 'Start time cannot be in the future'
      }
    }

    if (!formData.estimatedDuration || formData.estimatedDuration <= 0) {
      newErrors.estimatedDuration = 'Estimated duration must be greater than 0'
    }

    if (!formData.description || formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters'
    }

    if (!formData.reportedBy || formData.reportedBy.trim().length === 0) {
      newErrors.reportedBy = 'Reported by is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(formData)
      onClose()
    }
  }

  const handleChange = (
    field: keyof LogDowntimeData,
    value: string | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-3">
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-gradient-to-r from-red-600 to-orange-600 px-3 py-2 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Log Downtime Event
                  </h2>
                  <p className="text-sm text-white/90">
                    Report a new equipment downtime incident
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-3">
            {/* Equipment Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Equipment <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.equipment}
                onChange={(e) => handleChange('equipment', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                  errors.equipment ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Select equipment...</option>
                {EQUIPMENT_OPTIONS.map((equipment) => (
                  <option key={equipment} value={equipment}>
                    {equipment}
                  </option>
                ))}
              </select>
              {errors.equipment && (
                <p className="mt-1 text-sm text-red-600">{errors.equipment}</p>
              )}
            </div>

            {/* Category and Severity */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                    errors.category ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select category...</option>
                  {CATEGORY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Severity <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.severity}
                  onChange={(e) => handleChange('severity', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                    errors.severity ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select severity...</option>
                  {SEVERITY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.severity && (
                  <p className="mt-1 text-sm text-red-600">{errors.severity}</p>
                )}
              </div>
            </div>

            {/* Start Time and Duration */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) => handleChange('startTime', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                    errors.startTime ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.startTime && (
                  <p className="mt-1 text-sm text-red-600">{errors.startTime}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Duration (minutes){' '}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.estimatedDuration || ''}
                  onChange={(e) =>
                    handleChange('estimatedDuration', parseInt(e.target.value) || 0)
                  }
                  placeholder="e.g., 120"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                    errors.estimatedDuration
                      ? 'border-red-300'
                      : 'border-gray-300'
                  }`}
                />
                {errors.estimatedDuration && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.estimatedDuration}
                  </p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={4}
                placeholder="Provide a detailed description of the downtime incident..."
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                  errors.description ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              <div className="flex justify-between items-center mt-1">
                {errors.description ? (
                  <p className="text-sm text-red-600">{errors.description}</p>
                ) : (
                  <p className="text-sm text-gray-500">
                    Minimum 10 characters required
                  </p>
                )}
                <p className="text-sm text-gray-500">
                  {formData.description.length} characters
                </p>
              </div>
            </div>

            {/* Affected Work Orders */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Affected Work Orders
              </label>
              <input
                type="text"
                value={formData.affectedWO}
                onChange={(e) => handleChange('affectedWO', e.target.value)}
                placeholder="e.g., WO-2025-001, WO-2025-002"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
              <p className="mt-1 text-sm text-gray-500">
                Comma-separated list of work order IDs
              </p>
            </div>

            {/* Reported By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reported By <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.reportedBy}
                onChange={(e) => handleChange('reportedBy', e.target.value)}
                placeholder="Enter your name"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                  errors.reportedBy ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.reportedBy && (
                <p className="mt-1 text-sm text-red-600">{errors.reportedBy}</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg hover:from-red-700 hover:to-orange-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Log Downtime Event</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// 2. ViewDowntimeDetailsModal Component
// ============================================================================

export const ViewDowntimeDetailsModal: React.FC<
  ViewDowntimeDetailsModalProps
> = ({ isOpen, onClose, event, onEdit, onResolve, onInitiateRCA }) => {
  if (!isOpen || !event) return null

  const currentDuration = calculateDuration(event.startTime, event.endTime)
  const shouldRequireRCA =
    event.severity === 'critical' || currentDuration > 240 // 4 hours

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-3">
        <div className="relative bg-white rounded-lg shadow-xl  w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-gradient-to-r from-indigo-600 to-indigo-700 px-3 py-2 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Downtime Event Details
                  </h2>
                  <p className="text-sm text-white/90">{event.eventNumber}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-3">
            {/* Header Section - Status and Severity */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Status</p>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusBadgeColor(
                      event.status
                    )}`}
                  >
                    {event.status === 'ongoing' ? (
                      <Zap className="w-3 h-3 mr-1" />
                    ) : (
                      <CheckCircle className="w-3 h-3 mr-1" />
                    )}
                    {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Severity</p>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getSeverityBadgeColor(
                      event.severity
                    )}`}
                  >
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    {event.severity.charAt(0).toUpperCase() +
                      event.severity.slice(1)}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Category</p>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
                    {getCategoryLabel(event.category)}
                  </span>
                </div>
              </div>
            </div>

            {/* Equipment & Location */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Zap className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">Equipment</h3>
                </div>
                <p className="text-lg font-medium text-gray-900">
                  {event.equipment}
                </p>
              </div>

              <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                <div className="flex items-center space-x-2 mb-2">
                  <MapPin className="w-5 h-5 text-purple-600" />
                  <h3 className="font-semibold text-gray-900">Location</h3>
                </div>
                <p className="text-lg font-medium text-gray-900">
                  {event.location}
                </p>
              </div>
            </div>

            {/* Timing Details */}
            <div className="border border-gray-200 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="w-5 h-5 text-indigo-600" />
                <h3 className="font-semibold text-gray-900">Timing Details</h3>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Start Time</p>
                  <p className="font-medium text-gray-900">
                    {new Date(event.startTime).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">End Time</p>
                  <p className="font-medium text-gray-900">
                    {event.endTime
                      ? new Date(event.endTime).toLocaleString()
                      : 'Ongoing'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Duration</p>
                  <p className="font-medium text-gray-900">
                    {formatDuration(currentDuration)}
                  </p>
                </div>
              </div>
            </div>

            {/* Impact Metrics */}
            <div className="border border-gray-200 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingDown className="w-5 h-5 text-red-600" />
                <h3 className="font-semibold text-gray-900">Impact Metrics</h3>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-sm text-gray-600 mb-1">Production Loss</p>
                  <p className="text-2xl font-bold text-red-600">
                    {event.productionLoss}
                  </p>
                  <p className="text-xs text-gray-500">units</p>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <p className="text-sm text-gray-600 mb-1">Cost Impact</p>
                  <p className="text-2xl font-bold text-orange-600 flex items-center">
                    <DollarSign className="w-5 h-5" />
                    {event.costImpact.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">estimated</p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm text-gray-600 mb-1">Affected Work Orders</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {event.affectedWO.length}
                  </p>
                  <p className="text-xs text-gray-500">work orders</p>
                </div>
              </div>

              {event.affectedWO.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Affected Work Orders:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {event.affectedWO.map((wo) => (
                      <span
                        key={wo}
                        className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full border border-blue-200"
                      >
                        {wo}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="border border-gray-200 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-3">
                <FileText className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Description</h3>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap">
                {event.description}
              </p>
            </div>

            {/* Resolution Details (if resolved) */}
            {event.status === 'resolved' && event.resolutionDescription && (
              <div className="border border-green-200 bg-green-50 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-gray-900">
                    Resolution Details
                  </h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      Resolution Description:
                    </p>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {event.resolutionDescription}
                    </p>
                  </div>
                  {event.actionsTaken && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        Actions Taken:
                      </p>
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {event.actionsTaken}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Assignment */}
            <div className="border border-gray-200 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-3">
                <Users className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Assignment</h3>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Reported By</p>
                  <p className="font-medium text-gray-900">{event.reportedBy}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Assigned To</p>
                  <p className="font-medium text-gray-900">
                    {event.assignedTo || (
                      <span className="text-gray-400 italic">Not assigned</span>
                    )}
                  </p>
                </div>
                {event.resolvedBy && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Resolved By</p>
                    <p className="font-medium text-gray-900">
                      {event.resolvedBy}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Status Timeline */}
            <div className="border border-gray-200 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-2">
                <Calendar className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Status Timeline</h3>
              </div>
              <div className="space-y-3">
                {event.createdAt && (
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Created</p>
                      <p className="text-sm text-gray-600">
                        {new Date(event.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
                {event.inProgressAt && (
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-yellow-600 rounded-full" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        In Progress
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(event.inProgressAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
                {event.resolvedAt && (
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-600 rounded-full" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Resolved</p>
                      <p className="text-sm text-gray-600">
                        {new Date(event.resolvedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* RCA Requirement Warning */}
            {event.status === 'resolved' &&
              shouldRequireRCA &&
              !event.hasRCA && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Info className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-900">
                        Root Cause Analysis Required
                      </p>
                      <p className="text-sm text-yellow-800 mt-1">
                        This event requires a root cause analysis due to its{' '}
                        {event.severity === 'critical'
                          ? 'critical severity'
                          : 'extended duration'}
                        . Please initiate an RCA to prevent future occurrences.
                      </p>
                    </div>
                  </div>
                </div>
              )}
          </div>

          {/* Action Buttons */}
          <div className="sticky bottom-0 bg-gray-50 px-3 py-2 border-t flex justify-between rounded-b-lg">
            <div className="flex space-x-3">
              {event.status === 'ongoing' && onEdit && (
                <button
                  onClick={() => onEdit(event)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
              )}
              {event.status === 'ongoing' && onResolve && (
                <button
                  onClick={() => onResolve(event)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Resolve</span>
                </button>
              )}
              {event.status === 'resolved' &&
                !event.hasRCA &&
                onInitiateRCA && (
                  <button
                    onClick={() => onInitiateRCA(event)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Initiate RCA</span>
                  </button>
                )}
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-white transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// 3. EditDowntimeEventModal Component
// ============================================================================

export const EditDowntimeEventModal: React.FC<EditDowntimeEventModalProps> = ({
  isOpen,
  onClose,
  event,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<EditDowntimeData>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (isOpen && event) {
      setFormData({
        category: event.category,
        severity: event.severity,
        description: event.description,
        assignedTo: event.assignedTo || '',
        affectedWO: event.affectedWO.join(', '),
        endTime: '',
        notes: '',
      })
      setErrors({})
    }
  }, [isOpen, event])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.category) {
      newErrors.category = 'Category is required'
    }

    if (!formData.severity) {
      newErrors.severity = 'Severity is required'
    }

    if (!formData.description || formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters'
    }

    if (formData.endTime && event) {
      const endTime = new Date(formData.endTime)
      const startTime = new Date(event.startTime)
      if (endTime < startTime) {
        newErrors.endTime = 'End time cannot be before start time'
      }
    }

    if (!formData.notes || formData.notes.trim().length === 0) {
      newErrors.notes = 'Please provide a reason for this update'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(formData)
      onClose()
    }
  }

  const handleChange = (field: keyof EditDowntimeData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  if (!isOpen || !event) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-3">
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-blue-700 px-3 py-2 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Edit className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Edit Downtime Event
                  </h2>
                  <p className="text-sm text-white/90">{event.eventNumber}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-3">
            {/* Event Info */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Equipment</p>
                  <p className="font-medium text-gray-900">{event.equipment}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Start Time</p>
                  <p className="font-medium text-gray-900">
                    {new Date(event.startTime).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Category and Severity */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.category ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  {CATEGORY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Severity <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.severity}
                  onChange={(e) => handleChange('severity', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.severity ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  {SEVERITY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.severity && (
                  <p className="mt-1 text-sm text-red-600">{errors.severity}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={4}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.description ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            {/* Assigned To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assigned To
              </label>
              <input
                type="text"
                value={formData.assignedTo}
                onChange={(e) => handleChange('assignedTo', e.target.value)}
                placeholder="Enter technician name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Affected Work Orders */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Affected Work Orders
              </label>
              <input
                type="text"
                value={formData.affectedWO}
                onChange={(e) => handleChange('affectedWO', e.target.value)}
                placeholder="e.g., WO-2025-001, WO-2025-002"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="mt-1 text-sm text-gray-500">
                Comma-separated list of work order IDs
              </p>
            </div>

            {/* End Time (optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Time (if marking as resolved)
              </label>
              <input
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) => handleChange('endTime', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.endTime ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.endTime && (
                <p className="mt-1 text-sm text-red-600">{errors.endTime}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                Leave blank to keep event as ongoing
              </p>
            </div>

            {/* Update Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Update Notes <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                rows={3}
                placeholder="Describe what changes you made and why..."
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.notes ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.notes && (
                <p className="mt-1 text-sm text-red-600">{errors.notes}</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-colors flex items-center space-x-2"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// 4. ResolveDowntimeModal Component
// ============================================================================

export const ResolveDowntimeModal: React.FC<ResolveDowntimeModalProps> = ({
  isOpen,
  onClose,
  event,
  onSubmit,
  onSubmitWithRCA,
}) => {
  const [formData, setFormData] = useState<ResolveDowntimeData>({
    endTime: '',
    resolutionDescription: '',
    actionsTaken: '',
    productionLoss: 0,
    costImpact: 0,
    resolvedBy: '',
    requireRCA: false,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (isOpen && event) {
      const now = new Date()
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
      const currentDuration = calculateDuration(event.startTime, null)
      const shouldRequireRCA =
        event.severity === 'critical' || currentDuration > 240

      setFormData({
        endTime: now.toISOString().slice(0, 16),
        resolutionDescription: '',
        actionsTaken: '',
        productionLoss: 0,
        costImpact: 0,
        resolvedBy: '',
        requireRCA: shouldRequireRCA,
      })
      setErrors({})
    }
  }, [isOpen, event])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.endTime) {
      newErrors.endTime = 'End time is required'
    } else if (event) {
      const endTime = new Date(formData.endTime)
      const startTime = new Date(event.startTime)
      if (endTime < startTime) {
        newErrors.endTime = 'End time cannot be before start time'
      }
    }

    if (
      !formData.resolutionDescription ||
      formData.resolutionDescription.trim().length < 10
    ) {
      newErrors.resolutionDescription =
        'Resolution description must be at least 10 characters'
    }

    if (!formData.actionsTaken || formData.actionsTaken.trim().length < 10) {
      newErrors.actionsTaken = 'Actions taken must be at least 10 characters'
    }

    if (!formData.resolvedBy || formData.resolvedBy.trim().length === 0) {
      newErrors.resolvedBy = 'Resolved by is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (createRCA: boolean) => (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      if (createRCA || formData.requireRCA) {
        onSubmitWithRCA(formData)
      } else {
        onSubmit(formData)
      }
      onClose()
    }
  }

  const handleChange = (field: keyof ResolveDowntimeData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  if (!isOpen || !event) return null

  const currentDuration = calculateDuration(event.startTime, formData.endTime)
  const shouldRequireRCA =
    event.severity === 'critical' || currentDuration > 240

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-3">
        <div className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-gradient-to-r from-green-600 to-green-700 px-3 py-2 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Resolve Downtime Event
                  </h2>
                  <p className="text-sm text-white/90">
                    Mark event as resolved and record details
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Form */}
          <form className="p-6 space-y-3">
            {/* Summary Section */}
            <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">
                Event Summary
              </h3>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <p className="text-sm text-gray-600">Event Number</p>
                  <p className="font-medium text-gray-900">
                    {event.eventNumber}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Equipment</p>
                  <p className="font-medium text-gray-900">{event.equipment}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Duration So Far</p>
                  <p className="font-medium text-gray-900">
                    {formatDuration(currentDuration)}
                  </p>
                </div>
              </div>
            </div>

            {/* RCA Warning */}
            {shouldRequireRCA && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-900">
                      Root Cause Analysis Recommended
                    </p>
                    <p className="text-sm text-yellow-800 mt-1">
                      This event {event.severity === 'critical' ? 'is marked as critical' : 'has exceeded 4 hours'} and
                      should have a root cause analysis to prevent future
                      occurrences.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* End Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Time <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) => handleChange('endTime', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.endTime ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.endTime && (
                <p className="mt-1 text-sm text-red-600">{errors.endTime}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                Default is set to current time
              </p>
            </div>

            {/* Resolution Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resolution Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.resolutionDescription}
                onChange={(e) =>
                  handleChange('resolutionDescription', e.target.value)
                }
                rows={4}
                placeholder="Describe how the issue was resolved..."
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.resolutionDescription
                    ? 'border-red-300'
                    : 'border-gray-300'
                }`}
              />
              {errors.resolutionDescription && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.resolutionDescription}
                </p>
              )}
            </div>

            {/* Actions Taken */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Actions Taken <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.actionsTaken}
                onChange={(e) => handleChange('actionsTaken', e.target.value)}
                rows={4}
                placeholder="List the specific actions taken to resolve the issue..."
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.actionsTaken ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.actionsTaken && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.actionsTaken}
                </p>
              )}
            </div>

            {/* Impact Metrics */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Production Loss (units)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.productionLoss || ''}
                  onChange={(e) =>
                    handleChange('productionLoss', parseFloat(e.target.value) || 0)
                  }
                  placeholder="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cost Impact ($)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.costImpact || ''}
                  onChange={(e) =>
                    handleChange('costImpact', parseFloat(e.target.value) || 0)
                  }
                  placeholder="0.00"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Resolved By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resolved By <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.resolvedBy}
                onChange={(e) => handleChange('resolvedBy', e.target.value)}
                placeholder="Enter your name"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.resolvedBy ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.resolvedBy && (
                <p className="mt-1 text-sm text-red-600">{errors.resolvedBy}</p>
              )}
            </div>

            {/* Require RCA Checkbox */}
            <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <input
                type="checkbox"
                id="requireRCA"
                checked={formData.requireRCA}
                onChange={(e) => handleChange('requireRCA', e.target.checked)}
                className="mt-1 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <label htmlFor="requireRCA" className="flex-1">
                <p className="font-medium text-gray-900">
                  Require Root Cause Analysis
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Check this box to create an RCA investigation for this
                  downtime event. This is recommended for critical events or
                  extended downtime periods.
                </p>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              {!formData.requireRCA && (
                <button
                  type="button"
                  onClick={handleSubmit(false)}
                  className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-colors flex items-center space-x-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Resolve & Close</span>
                </button>
              )}
              {formData.requireRCA && (
                <button
                  type="button"
                  onClick={handleSubmit(true)}
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-colors flex items-center space-x-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>Resolve & Create RCA</span>
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// 5. DeleteDowntimeModal Component
// ============================================================================

export const DeleteDowntimeModal: React.FC<DeleteDowntimeModalProps> = ({
  isOpen,
  onClose,
  event,
  onConfirm,
}) => {
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setReason('')
      setError('')
    }
  }, [isOpen])

  const handleConfirm = () => {
    if (!reason || reason.trim().length < 10) {
      setError('Deletion reason must be at least 10 characters')
      return
    }
    onConfirm(reason)
    onClose()
  }

  if (!isOpen || !event) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-3">
        <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-700 to-red-800 px-3 py-2 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Trash className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Delete Downtime Event
                  </h2>
                  <p className="text-sm text-white/90">
                    Permanently remove this event
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-3">
            {/* Event Details Summary */}
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">
                Event Details
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Event Number:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {event.eventNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Equipment:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {event.equipment}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
                  <span
                    className={`text-sm font-medium px-2 py-0.5 rounded ${
                      event.status === 'ongoing'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {event.status.charAt(0).toUpperCase() +
                      event.status.slice(1)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Duration:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatDuration(
                      calculateDuration(event.startTime, event.endTime)
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Warning Message */}
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-900">Warning</p>
                  <p className="text-sm text-yellow-800 mt-1">
                    Are you sure you want to delete this downtime event? This
                    action cannot be undone. All associated data and history
                    will be permanently removed.
                  </p>
                </div>
              </div>
            </div>

            {/* Deletion Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Deletion <span className="text-red-500">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value)
                  if (error) setError('')
                }}
                rows={3}
                placeholder="Provide a detailed reason for deleting this event..."
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                  error ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
              <p className="mt-1 text-sm text-gray-500">
                Minimum 10 characters required
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-gray-50 px-3 py-2 border-t flex justify-end space-x-3 rounded-b-lg">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="px-6 py-2 bg-gradient-to-r from-red-700 to-red-800 text-white rounded-lg hover:from-red-800 hover:to-red-900 transition-colors flex items-center space-x-2"
            >
              <Trash className="w-4 h-4" />
              <span>Delete Event</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
