'use client'

import React, { useState, useEffect } from 'react'
import { AlertTriangle, Bell, Clock, Wrench, X, Upload, CheckCircle2 } from 'lucide-react'

// ==================== Quality Alert Modal ====================

export interface QualityAlertData {
  alertType: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  affectedParts: number
  immediateAction: string
  photo?: File | null
  notifySupervisor: boolean
  stopProduction: boolean
  workOrderId?: string
  operatorId?: string
  stationId?: string
}

interface QualityAlertModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (alert: QualityAlertData) => void
  context?: {
    workOrderId: string
    operatorId: string
    stationId: string
  }
}

export function QualityAlertModal({ isOpen, onClose, onSubmit, context }: QualityAlertModalProps) {
  const [formData, setFormData] = useState<QualityAlertData>({
    alertType: '',
    severity: 'medium',
    description: '',
    affectedParts: 0,
    immediateAction: '',
    photo: null,
    notifySupervisor: false,
    stopProduction: false,
    workOrderId: context?.workOrderId || '',
    operatorId: context?.operatorId || '',
    stationId: context?.stationId || '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  // Auto-update context when it changes
  useEffect(() => {
    if (context) {
      setFormData(prev => ({
        ...prev,
        workOrderId: context.workOrderId,
        operatorId: context.operatorId,
        stationId: context.stationId,
      }))
    }
  }, [context])

  // Auto-check notify supervisor for High/Critical severity
  useEffect(() => {
    if (formData.severity === 'high' || formData.severity === 'critical') {
      setFormData(prev => ({ ...prev, notifySupervisor: true }))
    }
  }, [formData.severity])

  const alertTypes = [
    'Defect Detected',
    'Process Issue',
    'Equipment Malfunction',
    'Material Issue',
    'Safety Concern',
  ]

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.alertType) {
      newErrors.alertType = 'Alert type is required'
    }

    if (!formData.description || formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters'
    }

    if (formData.affectedParts < 0) {
      newErrors.affectedParts = 'Affected parts cannot be negative'
    }

    if (formData.stopProduction && formData.severity !== 'high' && formData.severity !== 'critical') {
      newErrors.stopProduction = 'Stop production only available for High/Critical severity'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData(prev => ({ ...prev, photo: file }))
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemovePhoto = () => {
    setFormData(prev => ({ ...prev, photo: null }))
    setPhotoPreview(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(formData)
      handleClose()
    }
  }

  const handleClose = () => {
    setFormData({
      alertType: '',
      severity: 'medium',
      description: '',
      affectedParts: 0,
      immediateAction: '',
      photo: null,
      notifySupervisor: false,
      stopProduction: false,
      workOrderId: context?.workOrderId || '',
      operatorId: context?.operatorId || '',
      stationId: context?.stationId || '',
    })
    setErrors({})
    setPhotoPreview(null)
    onClose()
  }

  if (!isOpen) return null

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300'
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-red-600 p-3 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-6 h-6" />
              <div>
                <h2 className="text-2xl font-bold">Raise Quality Alert</h2>
                <p className="text-orange-100 text-sm mt-1">
                  Report quality issues from shop floor terminal
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-3">
          <div className="space-y-3">
            {/* Context Info */}
            {context && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">Work Order:</span>
                    <p className="font-semibold text-gray-900">{context.workOrderId}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Station:</span>
                    <p className="font-semibold text-gray-900">{context.stationId}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Operator:</span>
                    <p className="font-semibold text-gray-900">{context.operatorId}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Alert Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Alert Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.alertType}
                onChange={(e) => setFormData(prev => ({ ...prev, alertType: e.target.value }))}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                  errors.alertType ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select alert type...</option>
                {alertTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              {errors.alertType && (
                <p className="text-red-500 text-sm mt-1">{errors.alertType}</p>
              )}
            </div>

            {/* Severity */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Severity <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {(['low', 'medium', 'high', 'critical'] as const).map((severity) => (
                  <label
                    key={severity}
                    className={`cursor-pointer border-2 rounded-lg p-3 text-center transition-all ${
                      formData.severity === severity
                        ? getSeverityColor(severity)
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="severity"
                      value={severity}
                      checked={formData.severity === severity}
                      onChange={(e) =>
                        setFormData(prev => ({
                          ...prev,
                          severity: e.target.value as QualityAlertData['severity'],
                        }))
                      }
                      className="sr-only"
                    />
                    <span className="font-semibold capitalize">{severity}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the quality issue in detail..."
                rows={4}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              <div className="flex justify-between mt-1">
                <div>
                  {errors.description && (
                    <p className="text-red-500 text-sm">{errors.description}</p>
                  )}
                </div>
                <span className="text-sm text-gray-500">{formData.description.length} / min 10 chars</span>
              </div>
            </div>

            {/* Affected Parts */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Affected Parts (Quantity)
              </label>
              <input
                type="number"
                value={formData.affectedParts}
                onChange={(e) =>
                  setFormData(prev => ({ ...prev, affectedParts: parseInt(e.target.value) || 0 }))
                }
                min="0"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                  errors.affectedParts ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.affectedParts && (
                <p className="text-red-500 text-sm mt-1">{errors.affectedParts}</p>
              )}
            </div>

            {/* Immediate Action Taken */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Immediate Action Taken
              </label>
              <textarea
                value={formData.immediateAction}
                onChange={(e) => setFormData(prev => ({ ...prev, immediateAction: e.target.value }))}
                placeholder="Describe any immediate actions taken to address the issue..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Photo Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Photo Upload (Optional)
              </label>
              <div className="space-y-3">
                {!photoPreview ? (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-orange-500 transition-colors">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">Click to upload photo</span>
                    <span className="text-xs text-gray-500 mt-1">PNG, JPG, JPEG up to 10MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="relative">
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Notify Supervisor */}
            <div className="space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.notifySupervisor}
                  onChange={(e) =>
                    setFormData(prev => ({ ...prev, notifySupervisor: e.target.checked }))
                  }
                  disabled={formData.severity === 'high' || formData.severity === 'critical'}
                  className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Notify Supervisor
                  {(formData.severity === 'high' || formData.severity === 'critical') && (
                    <span className="text-orange-600 ml-2">(Auto-enabled for High/Critical)</span>
                  )}
                </span>
              </label>

              {/* Stop Production - Only show for High/Critical */}
              {(formData.severity === 'high' || formData.severity === 'critical') && (
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.stopProduction}
                    onChange={(e) =>
                      setFormData(prev => ({ ...prev, stopProduction: e.target.checked }))
                    }
                    className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Stop Production
                    <span className="text-red-600 ml-2">(Production will be halted)</span>
                  </span>
                </label>
              )}
            </div>

            {/* Severity Warning */}
            {formData.severity === 'critical' && (
              <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded">
                <div className="flex items-start">
                  <AlertTriangle className="w-5 h-5 text-red-500 mr-3 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-red-800">Critical Alert</h4>
                    <p className="text-sm text-red-700 mt-1">
                      This will trigger immediate supervisor and quality manager notification.
                      Production may be stopped pending investigation.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="border-t border-gray-200 p-3 bg-gray-50">
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-700 hover:to-red-700 transition-colors font-medium shadow-lg"
            >
              Raise Alert
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ==================== Supervisor Call Modal ====================

export interface SupervisorCallData {
  requestType: string
  priority: 'normal' | 'urgent' | 'emergency'
  description: string
  currentStatus: 'production_paused' | 'production_continuing' | 'station_idle'
  estimatedImpact: string
  additionalNotes: string
  stationId?: string
  operatorId?: string
}

interface SupervisorCallModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (request: SupervisorCallData) => void
  context?: {
    stationId: string
    operatorId: string
    operatorName?: string
  }
}

export function SupervisorCallModal({ isOpen, onClose, onSubmit, context }: SupervisorCallModalProps) {
  const [formData, setFormData] = useState<SupervisorCallData>({
    requestType: '',
    priority: 'normal',
    description: '',
    currentStatus: 'production_continuing',
    estimatedImpact: '',
    additionalNotes: '',
    stationId: context?.stationId || '',
    operatorId: context?.operatorId || '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (context) {
      setFormData(prev => ({
        ...prev,
        stationId: context.stationId,
        operatorId: context.operatorId,
      }))
    }
  }, [context])

  const requestTypes = [
    'Technical Support',
    'Material Shortage',
    'Quality Issue',
    'Process Clarification',
    'Equipment Setup',
    'Emergency',
    'Other',
  ]

  const impactOptions = [
    'No Impact',
    'Minor Delay',
    'Significant Delay',
    'Production Stopped',
  ]

  const getEstimatedResponseTime = (priority: string): string => {
    switch (priority) {
      case 'emergency':
        return 'Immediate (< 5 min)'
      case 'urgent':
        return '10-15 minutes'
      case 'normal':
        return '30-45 minutes'
      default:
        return 'Standard'
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.requestType) {
      newErrors.requestType = 'Request type is required'
    }

    if (!formData.description || formData.description.trim().length < 5) {
      newErrors.description = 'Description must be at least 5 characters'
    }

    if (!formData.estimatedImpact) {
      newErrors.estimatedImpact = 'Estimated impact is required'
    }

    if (formData.priority === 'emergency' && formData.requestType !== 'Emergency') {
      newErrors.priority = 'Emergency priority requires Emergency request type'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(formData)
      handleClose()
    }
  }

  const handleClose = () => {
    setFormData({
      requestType: '',
      priority: 'normal',
      description: '',
      currentStatus: 'production_continuing',
      estimatedImpact: '',
      additionalNotes: '',
      stationId: context?.stationId || '',
      operatorId: context?.operatorId || '',
    })
    setErrors({})
    onClose()
  }

  if (!isOpen) return null

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'normal':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'urgent':
        return 'bg-orange-100 text-orange-800 border-orange-300'
      case 'emergency':
        return 'bg-red-100 text-red-800 border-red-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-3 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bell className="w-6 h-6" />
              <div>
                <h2 className="text-2xl font-bold">Request Supervisor</h2>
                <p className="text-blue-100 text-sm mt-1">
                  Get assistance from your supervisor
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-3">
          <div className="space-y-3">
            {/* Context Info */}
            {context && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">Station:</span>
                    <p className="font-semibold text-gray-900">{context.stationId}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Operator:</span>
                    <p className="font-semibold text-gray-900">
                      {context.operatorName || context.operatorId}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Request Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Request Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.requestType}
                onChange={(e) => setFormData(prev => ({ ...prev, requestType: e.target.value }))}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.requestType ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select request type...</option>
                {requestTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              {errors.requestType && (
                <p className="text-red-500 text-sm mt-1">{errors.requestType}</p>
              )}
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Priority <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['normal', 'urgent', 'emergency'] as const).map((priority) => (
                  <label
                    key={priority}
                    className={`cursor-pointer border-2 rounded-lg p-3 text-center transition-all ${
                      formData.priority === priority
                        ? getPriorityColor(priority)
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="priority"
                      value={priority}
                      checked={formData.priority === priority}
                      onChange={(e) =>
                        setFormData(prev => ({
                          ...prev,
                          priority: e.target.value as SupervisorCallData['priority'],
                        }))
                      }
                      className="sr-only"
                    />
                    <span className="font-semibold capitalize">{priority}</span>
                  </label>
                ))}
              </div>
              <div className="mt-2 text-sm text-gray-600 flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                Estimated response time: <span className="font-semibold ml-1">{getEstimatedResponseTime(formData.priority)}</span>
              </div>
              {errors.priority && (
                <p className="text-red-500 text-sm mt-1">{errors.priority}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what assistance you need..."
                rows={4}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description}</p>
              )}
            </div>

            {/* Current Status */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Current Status <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                {[
                  { value: 'production_paused', label: 'Production Paused', color: 'border-orange-300' },
                  { value: 'production_continuing', label: 'Production Continuing', color: 'border-green-300' },
                  { value: 'station_idle', label: 'Station Idle', color: 'border-gray-300' },
                ].map((status) => (
                  <label
                    key={status.value}
                    className={`flex items-center space-x-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.currentStatus === status.value
                        ? `${status.color} bg-gray-50`
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="currentStatus"
                      value={status.value}
                      checked={formData.currentStatus === status.value}
                      onChange={(e) =>
                        setFormData(prev => ({
                          ...prev,
                          currentStatus: e.target.value as SupervisorCallData['currentStatus'],
                        }))
                      }
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="font-medium text-gray-700">{status.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Estimated Impact */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Estimated Impact <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.estimatedImpact}
                onChange={(e) => setFormData(prev => ({ ...prev, estimatedImpact: e.target.value }))}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.estimatedImpact ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select impact level...</option>
                {impactOptions.map((impact) => (
                  <option key={impact} value={impact}>
                    {impact}
                  </option>
                ))}
              </select>
              {errors.estimatedImpact && (
                <p className="text-red-500 text-sm mt-1">{errors.estimatedImpact}</p>
              )}
            </div>

            {/* Additional Notes */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                value={formData.additionalNotes}
                onChange={(e) => setFormData(prev => ({ ...prev, additionalNotes: e.target.value }))}
                placeholder="Any other relevant information..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Priority Warning */}
            {formData.priority === 'emergency' && (
              <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded">
                <div className="flex items-start">
                  <AlertTriangle className="w-5 h-5 text-red-500 mr-3 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-red-800">Emergency Request</h4>
                    <p className="text-sm text-red-700 mt-1">
                      Emergency requests trigger immediate supervisor notification and may escalate to management.
                      Use only for critical situations requiring immediate attention.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Impact Warning */}
            {formData.estimatedImpact === 'Production Stopped' && (
              <div className="bg-orange-50 border-l-4 border-orange-500 p-3 rounded">
                <div className="flex items-start">
                  <AlertTriangle className="w-5 h-5 text-orange-500 mr-3 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-orange-800">Production Stopped</h4>
                    <p className="text-sm text-orange-700 mt-1">
                      Production stoppage will be logged and may affect station metrics.
                      Supervisor will be prioritized for immediate response.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="border-t border-gray-200 p-3 bg-gray-50">
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-colors font-medium shadow-lg"
            >
              Request Supervisor
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ==================== Quick Downtime Modal ====================

export interface QuickDowntimeData {
  category: string
  startTime: string
  estimatedDuration: number
  description: string
  immediateActions: string[]
  stationId?: string
  operatorId?: string
}

interface QuickDowntimeModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (downtime: QuickDowntimeData) => void
  context?: {
    stationId: string
    operatorId: string
  }
}

export function QuickDowntimeModal({ isOpen, onClose, onSubmit, context }: QuickDowntimeModalProps) {
  const [formData, setFormData] = useState<QuickDowntimeData>({
    category: '',
    startTime: new Date().toISOString().slice(0, 16),
    estimatedDuration: 0,
    description: '',
    immediateActions: [],
    stationId: context?.stationId || '',
    operatorId: context?.operatorId || '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (context) {
      setFormData(prev => ({
        ...prev,
        stationId: context.stationId,
        operatorId: context.operatorId,
      }))
    }
  }, [context])

  useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({
        ...prev,
        startTime: new Date().toISOString().slice(0, 16),
      }))
    }
  }, [isOpen])

  const downtimeCategories = [
    'Machine Breakdown',
    'Material Shortage',
    'Setup/Changeover',
    'Quality Issue',
    'Waiting for Instructions',
    'Break',
    'Other',
  ]

  const actionOptions = [
    'Supervisor Notified',
    'Maintenance Called',
    'Material Requested',
    'Issue Resolved',
  ]

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.category) {
      newErrors.category = 'Downtime category is required'
    }

    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required'
    }

    if (formData.estimatedDuration <= 0) {
      newErrors.estimatedDuration = 'Estimated duration must be greater than 0'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleActionToggle = (action: string) => {
    setFormData(prev => ({
      ...prev,
      immediateActions: prev.immediateActions.includes(action)
        ? prev.immediateActions.filter(a => a !== action)
        : [...prev.immediateActions, action],
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(formData)
      handleClose()
    }
  }

  const handleClose = () => {
    setFormData({
      category: '',
      startTime: new Date().toISOString().slice(0, 16),
      estimatedDuration: 0,
      description: '',
      immediateActions: [],
      stationId: context?.stationId || '',
      operatorId: context?.operatorId || '',
    })
    setErrors({})
    onClose()
  }

  if (!isOpen) return null

  const showImpactWarning = formData.estimatedDuration > 30

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-600 to-orange-600 p-3 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Clock className="w-6 h-6" />
              <div>
                <h2 className="text-2xl font-bold">Log Downtime</h2>
                <p className="text-yellow-100 text-sm mt-1">
                  Record downtime event from shop floor terminal
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-3">
          <div className="space-y-3">
            {/* Context Info */}
            {context && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">Station:</span>
                    <p className="font-semibold text-gray-900">{context.stationId}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Operator:</span>
                    <p className="font-semibold text-gray-900">{context.operatorId}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Downtime Category */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Downtime Category <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                  errors.category ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select category...</option>
                {downtimeCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-red-500 text-sm mt-1">{errors.category}</p>
              )}
            </div>

            {/* Start Time */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Start Time <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                  errors.startTime ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.startTime && (
                <p className="text-red-500 text-sm mt-1">{errors.startTime}</p>
              )}
            </div>

            {/* Estimated Duration */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Estimated Duration (minutes) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.estimatedDuration}
                onChange={(e) =>
                  setFormData(prev => ({ ...prev, estimatedDuration: parseInt(e.target.value) || 0 }))
                }
                min="1"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                  errors.estimatedDuration ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.estimatedDuration && (
                <p className="text-red-500 text-sm mt-1">{errors.estimatedDuration}</p>
              )}
              {formData.estimatedDuration > 0 && (
                <p className="text-sm text-gray-600 mt-1">
                  Duration: {Math.floor(formData.estimatedDuration / 60)}h {formData.estimatedDuration % 60}m
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the reason for downtime..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Immediate Actions */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Immediate Actions
              </label>
              <div className="space-y-2">
                {actionOptions.map((action) => (
                  <label
                    key={action}
                    className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={formData.immediateActions.includes(action)}
                      onChange={() => handleActionToggle(action)}
                      className="w-5 h-5 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                    />
                    <span className="text-sm font-medium text-gray-700">{action}</span>
                    {formData.immediateActions.includes(action) && (
                      <CheckCircle2 className="w-4 h-4 text-green-500 ml-auto" />
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Duration Warning */}
            {showImpactWarning && (
              <div className="bg-orange-50 border-l-4 border-orange-500 p-3 rounded">
                <div className="flex items-start">
                  <AlertTriangle className="w-5 h-5 text-orange-500 mr-3 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-orange-800">Extended Downtime</h4>
                    <p className="text-sm text-orange-700 mt-1">
                      This downtime exceeds 30 minutes and will significantly impact production metrics.
                      Supervisor will be automatically notified.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Summary Card */}
            {formData.category && formData.estimatedDuration > 0 && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Downtime Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-semibold text-gray-900">{formData.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-semibold text-gray-900">
                      {formData.estimatedDuration} minutes
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Start Time:</span>
                    <span className="font-semibold text-gray-900">
                      {new Date(formData.startTime).toLocaleString()}
                    </span>
                  </div>
                  {formData.immediateActions.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Actions Taken:</span>
                      <span className="font-semibold text-gray-900">
                        {formData.immediateActions.length}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="border-t border-gray-200 p-3 bg-gray-50">
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-lg hover:from-yellow-700 hover:to-orange-700 transition-colors font-medium shadow-lg"
            >
              Log Downtime
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
