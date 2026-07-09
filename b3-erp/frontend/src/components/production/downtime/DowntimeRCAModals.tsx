/**
 * Downtime Root Cause Analysis (RCA) Modal Components
 *
 * This file contains all modal components for RCA investigations:
 * 1. CreateRCAModal - Initiate new RCA investigation
 * 2. ViewRCADetailsModal - Full RCA investigation display
 * 3. AddRootCauseModal - 5 Whys wizard for root cause analysis
 * 4. AddCorrectiveActionModal - Define corrective actions
 * 5. AddPreventiveActionModal - Define preventive actions
 * 6. UpdateActionStatusModal - Update action completion status
 * 7. VerifyRCAModal - Final RCA verification and closure
 */

'use client'

import React, { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import {
  X,
  AlertCircle,
  Users,
  FileText,
  Plus,
  CheckCircle,
  Clock,
  TrendingUp,
  Target,
  Award,
  DollarSign,
  Calendar,
  ChevronRight,
  ChevronLeft,
  Upload,
  Download,
  ExternalLink,
  Edit,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Minus,
  BarChart3,
  Lightbulb,
  Shield,
  Zap,
  Star,
  Eye,
  Settings
} from 'lucide-react'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface CreateRCAData {
  downtimeEventId: string
  investigationLead: string
  teamMembers: string[]
  problemStatement: string
  targetCloseDate: string
  estimatedCost: number
  priority: 'critical' | 'high' | 'medium'
}

export interface RCAInvestigation {
  id: string
  rcaNumber: string
  downtimeEvent: string
  equipment: string
  incidentDate: string
  severity: string
  status: 'open' | 'investigating' | 'completed' | 'implemented'
  investigationLead: string
  teamMembers: string[]
  problemStatement: string
  immediateActions: string[]
  rootCauses: RootCause[]
  correctiveActions: CorrectiveAction[]
  preventiveActions: PreventiveAction[]
  estimatedCost: number
  actualCost: number | null
  targetCloseDate: string
  actualCloseDate: string | null
  verifiedBy: string | null
  verificationDate: string | null
  effectivenessRating: number | null
  lessonsLearned: string | null
}

export interface RootCause {
  id: string
  whyLevels: string[]
  cause: string
  category: string
  contribution: number
}

export interface CorrectiveAction {
  id: string
  action: string
  assignedTo: string
  targetDate: string
  status: 'pending' | 'in-progress' | 'completed'
  completionDate: string | null
  priority: string
  actualCost: number | null
  resourcesNeeded?: string
  estimatedCost?: number
  completionNotes?: string
}

export interface PreventiveAction {
  id: string
  action: string
  assignedTo: string
  targetDate: string
  status: 'pending' | 'in-progress' | 'completed'
  completionDate: string | null
  recurrenceType: 'one-time' | 'recurring'
  frequency?: string
  priority?: string
  actualCost?: number
  resourcesNeeded?: string
}

export interface AddRootCauseData {
  whyLevels: string[]
  category: string
  contribution: number
}

export interface UpdateActionStatusData {
  status: string
  completionDate?: string
  completionNotes: string
  actualCost?: number
  attachments?: File[]
}

export interface VerifyRCAData {
  verificationNotes: string
  actualTotalCost: number
  effectivenessRating: number
  lessonsLearned: string
  verifiedBy: string
  verificationDate: string
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const getStatusBadgeColor = (status: string): string => {
  const colors: { [key: string]: string } = {
    pending: 'bg-gray-100 text-gray-700 border-gray-300',
    'in-progress': 'bg-blue-100 text-blue-700 border-blue-300',
    completed: 'bg-green-100 text-green-700 border-green-300',
    open: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    investigating: 'bg-blue-100 text-blue-700 border-blue-300',
    implemented: 'bg-green-100 text-green-700 border-green-300'
  }
  return colors[status] || 'bg-gray-100 text-gray-700 border-gray-300'
}

const getSeverityBadgeColor = (severity: string): string => {
  const colors: { [key: string]: string } = {
    critical: 'bg-red-100 text-red-700 border-red-300',
    high: 'bg-orange-100 text-orange-700 border-orange-300',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    low: 'bg-blue-100 text-blue-700 border-blue-300'
  }
  return colors[severity.toLowerCase()] || 'bg-gray-100 text-gray-700 border-gray-300'
}

const formatCurrency = (amount: number | null): string => {
  if (amount === null || amount === undefined) return 'N/A'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

const formatDate = (dateString: string | null): string => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// ============================================================================
// MODAL 1: CREATE RCA MODAL
// ============================================================================

interface CreateRCAModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateRCAData, isDraft: boolean) => void
  downtimeEvents?: Array<{ id: string; eventNumber: string; equipment: string }>
}

export const CreateRCAModal: React.FC<CreateRCAModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  downtimeEvents = []
}) => {
  const [formData, setFormData] = useState<CreateRCAData>({
    downtimeEventId: '',
    investigationLead: '',
    teamMembers: [],
    problemStatement: '',
    targetCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    estimatedCost: 0,
    priority: 'medium'
  })

  const [errors, setErrors] = useState<Partial<Record<keyof CreateRCAData, string>>>({})
  const [teamMemberInput, setTeamMemberInput] = useState('')

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CreateRCAData, string>> = {}

    if (!formData.downtimeEventId) {
      newErrors.downtimeEventId = 'Downtime event is required'
    }
    if (!formData.investigationLead.trim()) {
      newErrors.investigationLead = 'Investigation lead is required'
    }
    if (!formData.problemStatement.trim()) {
      newErrors.problemStatement = 'Problem statement is required'
    } else if (formData.problemStatement.trim().length < 20) {
      newErrors.problemStatement = 'Problem statement must be at least 20 characters'
    }
    if (!formData.targetCloseDate) {
      newErrors.targetCloseDate = 'Target close date is required'
    } else if (new Date(formData.targetCloseDate) <= new Date()) {
      newErrors.targetCloseDate = 'Target close date must be in the future'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (isDraft: boolean = false) => {
    if (!isDraft && !validate()) return

    onSubmit(formData, isDraft)
    handleClose()
  }

  const handleClose = () => {
    setFormData({
      downtimeEventId: '',
      investigationLead: '',
      teamMembers: [],
      problemStatement: '',
      targetCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      estimatedCost: 0,
      priority: 'medium'
    })
    setErrors({})
    setTeamMemberInput('')
    onClose()
  }

  const handleAddTeamMember = () => {
    if (teamMemberInput.trim()) {
      setFormData(prev => ({
        ...prev,
        teamMembers: [...prev.teamMembers, teamMemberInput.trim()]
      }))
      setTeamMemberInput('')
    }
  }

  const handleRemoveTeamMember = (index: number) => {
    setFormData(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.filter((_, i) => i !== index)
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-3">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-3 py-2 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-6 h-6" />
            <h2 className="text-xl font-semibold">Create RCA Investigation</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3">
          <div className="space-y-3">
            {/* Downtime Event Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Downtime Event <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.downtimeEventId}
                onChange={(e) => setFormData(prev => ({ ...prev, downtimeEventId: e.target.value }))}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.downtimeEventId ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select downtime event...</option>
                {downtimeEvents.map(event => (
                  <option key={event.id} value={event.id}>
                    {event.eventNumber} - {event.equipment}
                  </option>
                ))}
              </select>
              {errors.downtimeEventId && (
                <p className="mt-1 text-sm text-red-600">{errors.downtimeEventId}</p>
              )}
            </div>

            {/* Investigation Lead */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Investigation Lead <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.investigationLead}
                onChange={(e) => setFormData(prev => ({ ...prev, investigationLead: e.target.value }))}
                placeholder="Enter lead investigator name"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.investigationLead ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.investigationLead && (
                <p className="mt-1 text-sm text-red-600">{errors.investigationLead}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                In production: Searchable user dropdown
              </p>
            </div>

            {/* Team Members */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Team Members
              </label>
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={teamMemberInput}
                  onChange={(e) => setTeamMemberInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTeamMember())}
                  placeholder="Enter team member name"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={handleAddTeamMember}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              {formData.teamMembers.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.teamMembers.map((member, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-1 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm"
                    >
                      <span>{member}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTeamMember(index)}
                        className="text-purple-700 hover:text-purple-900"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <p className="mt-1 text-xs text-gray-500">
                In production: Multi-select dropdown with user search
              </p>
            </div>

            {/* Problem Statement */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Problem Statement <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.problemStatement}
                onChange={(e) => setFormData(prev => ({ ...prev, problemStatement: e.target.value }))}
                placeholder="Describe the problem in detail (minimum 20 characters)..."
                rows={4}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none ${
                  errors.problemStatement ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              <div className="flex items-center justify-between mt-1">
                {errors.problemStatement ? (
                  <p className="text-sm text-red-600">{errors.problemStatement}</p>
                ) : (
                  <p className="text-xs text-gray-500">
                    {formData.problemStatement.length} / 20 minimum characters
                  </p>
                )}
              </div>
            </div>

            {/* Priority and Target Close Date */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    priority: e.target.value as 'critical' | 'high' | 'medium'
                  }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Close Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.targetCloseDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, targetCloseDate: e.target.value }))}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.targetCloseDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.targetCloseDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.targetCloseDate}</p>
                )}
              </div>
            </div>

            {/* Estimated Cost */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimated Cost (USD)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  value={formData.estimatedCost}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    estimatedCost: parseFloat(e.target.value) || 0
                  }))}
                  min="0"
                  step="100"
                  placeholder="0.00"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-3 py-2 flex items-center justify-between bg-gray-50">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
          >
            Cancel
          </button>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleSubmit(true)}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Save Draft
            </button>
            <button
              onClick={() => handleSubmit(false)}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
            >
              <CheckCircle className="w-5 h-5" />
              <span>Create & Start Investigation</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// MODAL 2: VIEW RCA DETAILS MODAL
// ============================================================================

interface ViewRCADetailsModalProps {
  isOpen: boolean
  onClose: () => void
  investigation: RCAInvestigation | null
  onEdit?: () => void
  onAddRootCause?: () => void
  onAddCorrectiveAction?: () => void
  onAddPreventiveAction?: () => void
  onVerifyClose?: () => void
  onExportReport?: () => void
}

export const ViewRCADetailsModal: React.FC<ViewRCADetailsModalProps> = ({
  isOpen,
  onClose,
  investigation,
  onEdit,
  onAddRootCause,
  onAddCorrectiveAction,
  onAddPreventiveAction,
  onVerifyClose,
  onExportReport
}) => {
  const [expandedSections, setExpandedSections] = useState({
    rootCauses: true,
    correctiveActions: true,
    preventiveActions: true,
    verification: true
  })

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  if (!isOpen || !investigation) return null

  const allActionsCompleted =
    investigation.correctiveActions.every(a => a.status === 'completed') &&
    investigation.preventiveActions.every(a => a.status === 'completed')

  const costProgress = investigation.estimatedCost > 0
    ? Math.min(((investigation.actualCost || 0) / investigation.estimatedCost) * 100, 100)
    : 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-3">
      <div className="bg-white rounded-lg shadow-xl  w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-3 py-2">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <FileText className="w-6 h-6" />
              <h2 className="text-xl font-semibold">RCA Investigation Details</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-2xl font-bold">{investigation.rcaNumber}</span>
            <span className={`px-3 py-1 rounded-full text-sm border ${getStatusBadgeColor(investigation.status)}`}>
              {investigation.status.replace('-', ' ').toUpperCase()}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm border ${getSeverityBadgeColor(investigation.severity)}`}>
              {investigation.severity.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3">
          <div className="space-y-3">
            {/* Investigation Info */}
            <div className="bg-gray-50 rounded-lg p-3">
              <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 text-indigo-600" />
                Investigation Information
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm font-medium text-gray-600">Downtime Event</label>
                  <div className="flex items-center space-x-2 mt-1">
                    <p className="text-gray-900">{investigation.downtimeEvent}</p>
                    <ExternalLink className="w-4 h-4 text-indigo-600 cursor-pointer hover:text-indigo-700" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Equipment</label>
                  <p className="text-gray-900 mt-1">{investigation.equipment}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Incident Date</label>
                  <p className="text-gray-900 mt-1">{formatDate(investigation.incidentDate)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Investigation Lead</label>
                  <p className="text-gray-900 mt-1">{investigation.investigationLead}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-600">Team Members</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {investigation.teamMembers.map((member, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm"
                      >
                        {member}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Problem Statement */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-yellow-600" />
                Problem Statement
              </h3>
              <p className="text-gray-700 leading-relaxed">{investigation.problemStatement}</p>
            </div>

            {/* Immediate Actions */}
            {investigation.immediateActions.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-blue-600" />
                  Immediate Actions Taken
                </h3>
                <ul className="space-y-2">
                  {investigation.immediateActions.map((action, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Root Causes Section */}
            <div className="border border-gray-200 rounded-lg">
              <button
                onClick={() => toggleSection('rootCauses')}
                className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
              >
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <Lightbulb className="w-5 h-5 mr-2 text-yellow-600" />
                  Root Causes ({investigation.rootCauses.length})
                </h3>
                <ChevronRight
                  className={`w-5 h-5 text-gray-600 transition-transform ${
                    expandedSections.rootCauses ? 'rotate-90' : ''
                  }`}
                />
              </button>
              {expandedSections.rootCauses && (
                <div className="p-4">
                  {investigation.rootCauses.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No root causes identified yet</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700">Root Cause</th>
                            <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700">Category</th>
                            <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700">Why Level</th>
                            <th className="text-right py-2 px-3 text-sm font-semibold text-gray-700">Contribution</th>
                          </tr>
                        </thead>
                        <tbody>
                          {investigation.rootCauses.map((cause) => (
                            <tr key={cause.id} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-3 px-3 text-sm text-gray-900">{cause.cause}</td>
                              <td className="py-3 px-3 text-sm">
                                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                                  {cause.category}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-sm text-gray-600">
                                Why {cause.whyLevels.length}
                              </td>
                              <td className="py-3 px-3 text-sm text-right font-medium text-gray-900">
                                {cause.contribution}%
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Corrective Actions Section */}
            <div className="border border-gray-200 rounded-lg">
              <button
                onClick={() => toggleSection('correctiveActions')}
                className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
              >
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <Settings className="w-5 h-5 mr-2 text-blue-600" />
                  Corrective Actions ({investigation.correctiveActions.length})
                </h3>
                <ChevronRight
                  className={`w-5 h-5 text-gray-600 transition-transform ${
                    expandedSections.correctiveActions ? 'rotate-90' : ''
                  }`}
                />
              </button>
              {expandedSections.correctiveActions && (
                <div className="p-4">
                  {investigation.correctiveActions.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No corrective actions defined yet</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700">Action</th>
                            <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700">Assigned To</th>
                            <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700">Target Date</th>
                            <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700">Status</th>
                            <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700">Completed</th>
                          </tr>
                        </thead>
                        <tbody>
                          {investigation.correctiveActions.map((action) => (
                            <tr key={action.id} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-3 px-3 text-sm text-gray-900">{action.action}</td>
                              <td className="py-3 px-3 text-sm text-gray-600">{action.assignedTo}</td>
                              <td className="py-3 px-3 text-sm text-gray-600">
                                {formatDate(action.targetDate)}
                              </td>
                              <td className="py-3 px-3 text-sm">
                                <span className={`px-2 py-1 rounded-full text-xs border ${getStatusBadgeColor(action.status)}`}>
                                  {action.status.replace('-', ' ')}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-sm text-gray-600">
                                {formatDate(action.completionDate)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Preventive Actions Section */}
            <div className="border border-gray-200 rounded-lg">
              <button
                onClick={() => toggleSection('preventiveActions')}
                className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
              >
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-green-600" />
                  Preventive Actions ({investigation.preventiveActions.length})
                </h3>
                <ChevronRight
                  className={`w-5 h-5 text-gray-600 transition-transform ${
                    expandedSections.preventiveActions ? 'rotate-90' : ''
                  }`}
                />
              </button>
              {expandedSections.preventiveActions && (
                <div className="p-4">
                  {investigation.preventiveActions.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No preventive actions defined yet</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700">Action</th>
                            <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700">Assigned To</th>
                            <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700">Target Date</th>
                            <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700">Type</th>
                            <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {investigation.preventiveActions.map((action) => (
                            <tr key={action.id} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-3 px-3 text-sm text-gray-900">{action.action}</td>
                              <td className="py-3 px-3 text-sm text-gray-600">{action.assignedTo}</td>
                              <td className="py-3 px-3 text-sm text-gray-600">
                                {formatDate(action.targetDate)}
                              </td>
                              <td className="py-3 px-3 text-sm">
                                <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                                  {action.recurrenceType}
                                  {action.frequency && ` - ${action.frequency}`}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-sm">
                                <span className={`px-2 py-1 rounded-full text-xs border ${getStatusBadgeColor(action.status)}`}>
                                  {action.status.replace('-', ' ')}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
              )}
                </div>
              )}
            </div>

            {/* Cost Tracking */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-gray-200 rounded-lg p-3">
              <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
                <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                Cost Tracking
              </h3>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div>
                  <label className="text-sm font-medium text-gray-600">Estimated Cost</label>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {formatCurrency(investigation.estimatedCost)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Actual Cost</label>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {formatCurrency(investigation.actualCost)}
                  </p>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Cost Progress</span>
                  <span className="text-sm font-semibold text-gray-900">{costProgress.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      costProgress > 100 ? 'bg-red-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(costProgress, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-gray-50 rounded-lg p-3">
              <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-indigo-600" />
                Timeline
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm font-medium text-gray-600">Target Close Date</label>
                  <p className="text-gray-900 mt-1 flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-gray-500" />
                    {formatDate(investigation.targetCloseDate)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Actual Close Date</label>
                  <p className="text-gray-900 mt-1 flex items-center">
                    {investigation.actualCloseDate ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                        {formatDate(investigation.actualCloseDate)}
                      </>
                    ) : (
                      <>
                        <Minus className="w-4 h-4 mr-2 text-gray-400" />
                        Not closed yet
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Verification Section */}
            {investigation.status === 'completed' && (
              <div className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => toggleSection('verification')}
                  className="w-full px-4 py-3 bg-green-50 hover:bg-green-100 transition-colors flex items-center justify-between"
                >
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <Award className="w-5 h-5 mr-2 text-green-600" />
                    Verification & Closure
                  </h3>
                  <ChevronRight
                    className={`w-5 h-5 text-gray-600 transition-transform ${
                      expandedSections.verification ? 'rotate-90' : ''
                    }`}
                  />
                </button>
                {expandedSections.verification && (
                  <div className="p-4 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Verified By</label>
                        <p className="text-gray-900 mt-1">{investigation.verifiedBy}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Verification Date</label>
                        <p className="text-gray-900 mt-1">{formatDate(investigation.verificationDate)}</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 mb-2 block">
                        Effectiveness Rating
                      </label>
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-6 h-6 ${
                              star <= (investigation.effectivenessRating || 0)
                                ? 'text-yellow-500 fill-yellow-500'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="ml-3 text-sm text-gray-600">
                          {investigation.effectivenessRating}/5 -{' '}
                          {investigation.effectivenessRating === 5
                            ? 'Excellent'
                            : investigation.effectivenessRating === 4
                            ? 'Very Good'
                            : investigation.effectivenessRating === 3
                            ? 'Good'
                            : investigation.effectivenessRating === 2
                            ? 'Fair'
                            : 'Poor'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 mb-2 block">
                        Lessons Learned
                      </label>
                      <div className="bg-white border border-gray-200 rounded-lg p-3">
                        <p className="text-gray-700 leading-relaxed">{investigation.lessonsLearned}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-3 py-2 bg-gray-50">
          <div className="flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              Close
            </button>
            <div className="flex items-center space-x-3">
              {investigation.status !== 'completed' && (
                <>
                  {onEdit && (
                    <button
                      onClick={onEdit}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                  )}
                  {onAddRootCause && (
                    <button
                      onClick={onAddRootCause}
                      className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Root Cause</span>
                    </button>
                  )}
                  {onAddCorrectiveAction && (
                    <button
                      onClick={onAddCorrectiveAction}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Corrective Action</span>
                    </button>
                  )}
                  {onAddPreventiveAction && (
                    <button
                      onClick={onAddPreventiveAction}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Preventive Action</span>
                    </button>
                  )}
                  {onVerifyClose && allActionsCompleted && (
                    <button
                      onClick={onVerifyClose}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Verify & Close</span>
                    </button>
                  )}
                </>
              )}
              {onExportReport && (
                <button
                  onClick={onExportReport}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Export Report</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// MODAL 3: ADD ROOT CAUSE MODAL (5 WHYS WIZARD)
// ============================================================================

interface AddRootCauseModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: AddRootCauseData) => void
}

export const AddRootCauseModal: React.FC<AddRootCauseModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [whyLevels, setWhyLevels] = useState(['', '', '', '', ''])
  const [category, setCategory] = useState('equipment')
  const [contribution, setContribution] = useState(50)
  const [errors, setErrors] = useState<{ [key: number]: string }>({})

  const steps = [
    { label: 'Why 1 (Problem)', description: 'Describe the initial problem' },
    { label: 'Why 2', description: 'Why did this happen?' },
    { label: 'Why 3', description: 'Why did that happen?' },
    { label: 'Why 4', description: 'Why did that happen?' },
    { label: 'Why 5 (Root Cause)', description: 'Root cause identified' },
    { label: 'Category', description: 'Categorize the root cause' },
    { label: 'Contribution', description: 'Estimate contribution percentage' }
  ]

  const validateStep = (step: number): boolean => {
    if (step < 5) {
      if (!whyLevels[step].trim()) {
        setErrors({ [step]: `Why ${step + 1} is required` })
        return false
      }
    }
    setErrors({})
    return true
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1))
    }
  }

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0))
    setErrors({})
  }

  const handleSubmit = () => {
    if (!validateStep(currentStep)) return

    const data: AddRootCauseData = {
      whyLevels: whyLevels.filter(w => w.trim()),
      category,
      contribution
    }

    onSubmit(data)
    handleClose()
  }

  const handleClose = () => {
    setCurrentStep(0)
    setWhyLevels(['', '', '', '', ''])
    setCategory('equipment')
    setContribution(50)
    setErrors({})
    onClose()
  }

  if (!isOpen) return null

  const categories = [
    { value: 'equipment', label: 'Equipment', icon: Settings },
    { value: 'process', label: 'Process', icon: TrendingUp },
    { value: 'people', label: 'People', icon: Users },
    { value: 'material', label: 'Material', icon: BarChart3 },
    { value: 'method', label: 'Method', icon: FileText },
    { value: 'environment', label: 'Environment', icon: Target }
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-3">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white px-3 py-2">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <Lightbulb className="w-6 h-6" />
              <h2 className="text-xl font-semibold">5 Whys Root Cause Analysis</h2>
            </div>
            <button
              onClick={handleClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          {/* Progress Indicator */}
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={index}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                      index <= currentStep
                        ? 'bg-white text-orange-600'
                        : 'bg-orange-400 text-white'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span className="text-xs mt-1 hidden sm:block">{step.label.split(' ')[0]}</span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-1 rounded transition-colors ${
                      index < currentStep ? 'bg-white' : 'bg-orange-400'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3">
          <div className="mb-3">
            <h3 className="text-lg font-semibold text-gray-800 mb-1">
              {steps[currentStep].label}
            </h3>
            <p className="text-sm text-gray-600">{steps[currentStep].description}</p>
          </div>

          {/* Display all previous whys */}
          {currentStep > 0 && currentStep < 5 && (
            <div className="mb-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Previous Analysis:</h4>
              <div className="space-y-2">
                {whyLevels.slice(0, currentStep).map((why, index) => (
                  why && (
                    <div key={index} className="flex items-start space-x-2">
                      <span className="text-sm font-medium text-orange-600 mt-0.5">
                        Why {index + 1}:
                      </span>
                      <span className="text-sm text-gray-700 flex-1">{why}</span>
                    </div>
                  )
                ))}
              </div>
            </div>
          )}

          {/* Step Content */}
          <div>
            {currentStep < 5 ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {currentStep === 0
                    ? 'What is the problem?'
                    : currentStep === 4
                    ? 'What is the root cause?'
                    : 'Why did this happen?'}
                  <span className="text-red-500"> *</span>
                </label>
                <textarea
                  value={whyLevels[currentStep]}
                  onChange={(e) => {
                    const newWhyLevels = [...whyLevels]
                    newWhyLevels[currentStep] = e.target.value
                    setWhyLevels(newWhyLevels)
                    setErrors({})
                  }}
                  placeholder={
                    currentStep === 0
                      ? 'Describe the problem you observed...'
                      : 'Explain why the previous issue occurred...'
                  }
                  rows={6}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none ${
                    errors[currentStep] ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors[currentStep] && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors[currentStep]}
                  </p>
                )}
                <p className="mt-2 text-xs text-gray-500">
                  Provide a clear and detailed explanation for this level of analysis.
                </p>
              </div>
            ) : currentStep === 5 ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Root Cause Category <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((cat) => {
                    const Icon = cat.icon
                    return (
                      <button
                        key={cat.value}
                        onClick={() => setCategory(cat.value)}
                        className={`p-4 border-2 rounded-lg transition-all ${
                          category === cat.value
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 hover:border-orange-300 hover:bg-gray-50'
                        }`}
                      >
                        <Icon
                          className={`w-8 h-8 mb-2 ${
                            category === cat.value ? 'text-orange-600' : 'text-gray-400'
                          }`}
                        />
                        <span
                          className={`text-sm font-medium ${
                            category === cat.value ? 'text-orange-700' : 'text-gray-700'
                          }`}
                        >
                          {cat.label}
                        </span>
                      </button>
                    )
                  })}
                </div>
                <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Root Cause Summary:</h4>
                  <p className="text-sm text-gray-700">{whyLevels[4]}</p>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Contribution Percentage <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-4">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={contribution}
                      onChange={(e) => setContribution(parseInt(e.target.value))}
                      className="flex-1 h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
                    />
                    <div className="w-20 text-center">
                      <span className="text-3xl font-bold text-orange-600">{contribution}</span>
                      <span className="text-lg text-gray-600">%</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>0% - Minimal</span>
                    <span>25% - Low</span>
                    <span>50% - Moderate</span>
                    <span>75% - High</span>
                    <span>100% - Complete</span>
                  </div>
                </div>
                <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Complete Analysis:</h4>
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="font-medium text-gray-700">Root Cause:</span>{' '}
                      <span className="text-gray-600">{whyLevels[4]}</span>
                    </p>
                    <p className="text-sm">
                      <span className="font-medium text-gray-700">Category:</span>{' '}
                      <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">
                        {category}
                      </span>
                    </p>
                    <p className="text-sm">
                      <span className="font-medium text-gray-700">Contribution:</span>{' '}
                      <span className="text-gray-600">{contribution}%</span>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-3 py-2 flex items-center justify-between bg-gray-50">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              Cancel
            </button>
            {currentStep > 0 && (
              <button
                onClick={handleBack}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
              >
                <ChevronLeft className="w-5 h-5" />
                <span>Back</span>
              </button>
            )}
          </div>
          <div>
            {currentStep < steps.length - 1 ? (
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2"
              >
                <span>Next</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <CheckCircle className="w-5 h-5" />
                <span>Add Root Cause</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// MODAL 4: ADD CORRECTIVE ACTION MODAL
// ============================================================================

interface AddCorrectiveActionModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: Partial<CorrectiveAction>, addAnother: boolean) => void
}

export const AddCorrectiveActionModal: React.FC<AddCorrectiveActionModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [formData, setFormData] = useState({
    action: '',
    assignedTo: '',
    targetDate: '',
    priority: 'medium',
    resourcesNeeded: '',
    estimatedCost: 0
  })

  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.action.trim()) {
      newErrors.action = 'Action description is required'
    } else if (formData.action.trim().length < 15) {
      newErrors.action = 'Action description must be at least 15 characters'
    }
    if (!formData.assignedTo.trim()) {
      newErrors.assignedTo = 'Assigned to is required'
    }
    if (!formData.targetDate) {
      newErrors.targetDate = 'Target date is required'
    } else if (new Date(formData.targetDate) <= new Date()) {
      newErrors.targetDate = 'Target date must be in the future'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (addAnother: boolean = false) => {
    if (!validate()) return

    onSubmit(formData, addAnother)

    if (addAnother) {
      setFormData({
        action: '',
        assignedTo: '',
        targetDate: '',
        priority: 'medium',
        resourcesNeeded: '',
        estimatedCost: 0
      })
      setErrors({})
    } else {
      handleClose()
    }
  }

  const handleClose = () => {
    setFormData({
      action: '',
      assignedTo: '',
      targetDate: '',
      priority: 'medium',
      resourcesNeeded: '',
      estimatedCost: 0
    })
    setErrors({})
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-3">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 py-2 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Settings className="w-6 h-6" />
            <h2 className="text-xl font-semibold">Add Corrective Action</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3">
          <div className="space-y-5">
            {/* Action Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Action Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.action}
                onChange={(e) => setFormData(prev => ({ ...prev, action: e.target.value }))}
                placeholder="Describe the corrective action to be taken (minimum 15 characters)..."
                rows={4}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                  errors.action ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.action ? (
                <p className="mt-1 text-sm text-red-600">{errors.action}</p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  {formData.action.length} / 15 minimum characters
                </p>
              )}
            </div>

            {/* Assigned To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assigned To <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.assignedTo}
                onChange={(e) => setFormData(prev => ({ ...prev, assignedTo: e.target.value }))}
                placeholder="Enter assignee name"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.assignedTo ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.assignedTo && (
                <p className="mt-1 text-sm text-red-600">{errors.assignedTo}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                In production: Searchable user dropdown
              </p>
            </div>

            {/* Priority and Target Date */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.targetDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, targetDate: e.target.value }))}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.targetDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.targetDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.targetDate}</p>
                )}
              </div>
            </div>

            {/* Resources Needed */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resources Needed
              </label>
              <textarea
                value={formData.resourcesNeeded}
                onChange={(e) => setFormData(prev => ({ ...prev, resourcesNeeded: e.target.value }))}
                placeholder="List any resources, tools, or materials needed..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Estimated Cost */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimated Cost (USD)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  value={formData.estimatedCost}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    estimatedCost: parseFloat(e.target.value) || 0
                  }))}
                  min="0"
                  step="10"
                  placeholder="0.00"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-3 py-2 flex items-center justify-between bg-gray-50">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
          >
            Cancel
          </button>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleSubmit(true)}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Add & Create Another</span>
            </button>
            <button
              onClick={() => handleSubmit(false)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <CheckCircle className="w-5 h-5" />
              <span>Add Action</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// MODAL 5: ADD PREVENTIVE ACTION MODAL
// ============================================================================

interface AddPreventiveActionModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: Partial<PreventiveAction>, addAnother: boolean) => void
}

export const AddPreventiveActionModal: React.FC<AddPreventiveActionModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [formData, setFormData] = useState({
    action: '',
    assignedTo: '',
    targetDate: '',
    priority: 'medium',
    resourcesNeeded: '',
    estimatedCost: 0,
    recurrenceType: 'one-time' as 'one-time' | 'recurring',
    frequency: ''
  })

  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.action.trim()) {
      newErrors.action = 'Action description is required'
    } else if (formData.action.trim().length < 15) {
      newErrors.action = 'Action description must be at least 15 characters'
    }
    if (!formData.assignedTo.trim()) {
      newErrors.assignedTo = 'Assigned to is required'
    }
    if (!formData.targetDate) {
      newErrors.targetDate = 'Target date is required'
    } else if (new Date(formData.targetDate) <= new Date()) {
      newErrors.targetDate = 'Target date must be in the future'
    }
    if (formData.recurrenceType === 'recurring' && !formData.frequency) {
      newErrors.frequency = 'Frequency is required for recurring actions'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (addAnother: boolean = false) => {
    if (!validate()) return

    const submitData = {
      ...formData,
      frequency: formData.recurrenceType === 'recurring' ? formData.frequency : undefined
    }

    onSubmit(submitData, addAnother)

    if (addAnother) {
      setFormData({
        action: '',
        assignedTo: '',
        targetDate: '',
        priority: 'medium',
        resourcesNeeded: '',
        estimatedCost: 0,
        recurrenceType: 'one-time',
        frequency: ''
      })
      setErrors({})
    } else {
      handleClose()
    }
  }

  const handleClose = () => {
    setFormData({
      action: '',
      assignedTo: '',
      targetDate: '',
      priority: 'medium',
      resourcesNeeded: '',
      estimatedCost: 0,
      recurrenceType: 'one-time',
      frequency: ''
    })
    setErrors({})
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-3">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-3 py-2 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="w-6 h-6" />
            <h2 className="text-xl font-semibold">Add Preventive Action</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3">
          <div className="space-y-5">
            {/* Action Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Action Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.action}
                onChange={(e) => setFormData(prev => ({ ...prev, action: e.target.value }))}
                placeholder="Describe the preventive action to be taken (minimum 15 characters)..."
                rows={4}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none ${
                  errors.action ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.action ? (
                <p className="mt-1 text-sm text-red-600">{errors.action}</p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  {formData.action.length} / 15 minimum characters
                </p>
              )}
            </div>

            {/* Assigned To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assigned To <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.assignedTo}
                onChange={(e) => setFormData(prev => ({ ...prev, assignedTo: e.target.value }))}
                placeholder="Enter assignee name"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.assignedTo ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.assignedTo && (
                <p className="mt-1 text-sm text-red-600">{errors.assignedTo}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                In production: Searchable user dropdown
              </p>
            </div>

            {/* Priority and Target Date */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.targetDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, targetDate: e.target.value }))}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.targetDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.targetDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.targetDate}</p>
                )}
              </div>
            </div>

            {/* Recurrence Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recurrence Type <span className="text-red-500">*</span>
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    value="one-time"
                    checked={formData.recurrenceType === 'one-time'}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      recurrenceType: e.target.value as 'one-time',
                      frequency: ''
                    }))}
                    className="w-4 h-4 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">One-time</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    value="recurring"
                    checked={formData.recurrenceType === 'recurring'}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      recurrenceType: e.target.value as 'recurring'
                    }))}
                    className="w-4 h-4 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">Recurring</span>
                </label>
              </div>
            </div>

            {/* Frequency (only if recurring) */}
            {formData.recurrenceType === 'recurring' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Frequency <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value }))}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.frequency ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select frequency...</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                </select>
                {errors.frequency && (
                  <p className="mt-1 text-sm text-red-600">{errors.frequency}</p>
                )}
              </div>
            )}

            {/* Resources Needed */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resources Needed
              </label>
              <textarea
                value={formData.resourcesNeeded}
                onChange={(e) => setFormData(prev => ({ ...prev, resourcesNeeded: e.target.value }))}
                placeholder="List any resources, tools, or materials needed..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Estimated Cost */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimated Cost (USD)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  value={formData.estimatedCost}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    estimatedCost: parseFloat(e.target.value) || 0
                  }))}
                  min="0"
                  step="10"
                  placeholder="0.00"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-3 py-2 flex items-center justify-between bg-gray-50">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
          >
            Cancel
          </button>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleSubmit(true)}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Add & Create Another</span>
            </button>
            <button
              onClick={() => handleSubmit(false)}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <CheckCircle className="w-5 h-5" />
              <span>Add Action</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// MODAL 6: UPDATE ACTION STATUS MODAL
// ============================================================================

interface UpdateActionStatusModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: UpdateActionStatusData) => void
  action: CorrectiveAction | PreventiveAction | null
  actionType: 'corrective' | 'preventive'
}

export const UpdateActionStatusModal: React.FC<UpdateActionStatusModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  action,
  actionType
}) => {
  const [formData, setFormData] = useState({
    status: 'pending',
    completionDate: '',
    completionNotes: '',
    actualCost: 0
  })

  const [attachments, setAttachments] = useState<File[]>([])
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {}

    if (formData.status === 'completed') {
      if (!formData.completionDate) {
        newErrors.completionDate = 'Completion date is required when marking as completed'
      }
      if (!formData.completionNotes.trim()) {
        newErrors.completionNotes = 'Completion notes are required when marking as completed'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(Array.from(e.target.files))
    }
  }

  const handleRemoveFile = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = () => {
    if (!validate()) return

    const submitData: UpdateActionStatusData = {
      status: formData.status,
      completionNotes: formData.completionNotes,
      actualCost: formData.actualCost || undefined,
      attachments: attachments.length > 0 ? attachments : undefined
    }

    if (formData.status === 'completed' && formData.completionDate) {
      submitData.completionDate = formData.completionDate
    }

    onSubmit(submitData)
    handleClose()
  }

  const handleClose = () => {
    setFormData({
      status: 'pending',
      completionDate: '',
      completionNotes: '',
      actualCost: 0
    })
    setAttachments([])
    setErrors({})
    onClose()
  }

  React.useEffect(() => {
    if (action && isOpen) {
      setFormData({
        status: action.status,
        completionDate: action.completionDate || '',
        completionNotes: '',
        actualCost: action.actualCost || 0
      })
    }
  }, [action, isOpen])

  if (!isOpen || !action) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-3">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 py-2 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-6 h-6" />
            <h2 className="text-xl font-semibold">Update Action Status</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3">
          <div className="space-y-5">
            {/* Action Description (Read-only) */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Action Description
              </label>
              <p className="text-gray-900">{action.action}</p>
              <div className="mt-3 flex items-center space-x-4 text-sm text-gray-600">
                <span>Assigned to: <strong>{action.assignedTo}</strong></span>
                <span>Target: <strong>{formatDate(action.targetDate)}</strong></span>
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Completion Date (required if completed) */}
            {formData.status === 'completed' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Completion Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.completionDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, completionDate: e.target.value }))}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.completionDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.completionDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.completionDate}</p>
                )}
              </div>
            )}

            {/* Completion Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {formData.status === 'completed' ? 'Completion Notes' : 'Progress Notes'}
                {formData.status === 'completed' && <span className="text-red-500"> *</span>}
              </label>
              <textarea
                value={formData.completionNotes}
                onChange={(e) => setFormData(prev => ({ ...prev, completionNotes: e.target.value }))}
                placeholder={
                  formData.status === 'completed'
                    ? 'Describe what was done and the results...'
                    : 'Add any notes about progress or challenges...'
                }
                rows={4}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                  errors.completionNotes ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.completionNotes && (
                <p className="mt-1 text-sm text-red-600">{errors.completionNotes}</p>
              )}
            </div>

            {/* Actual Cost */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Actual Cost (USD)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  value={formData.actualCost}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    actualCost: parseFloat(e.target.value) || 0
                  }))}
                  min="0"
                  step="10"
                  placeholder="0.00"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Attachments */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Evidence / Attachments
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  multiple
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="flex flex-col items-center cursor-pointer"
                >
                  <Upload className="w-10 h-10 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">
                    Click to upload or drag and drop
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    PDF, JPG, PNG, DOC, DOCX (max 10MB each)
                  </span>
                </label>
              </div>
              {attachments.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-sm font-medium text-gray-700">Selected files:</p>
                  {attachments.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-3 py-2"
                    >
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">{file.name}</span>
                        <span className="text-xs text-gray-500">
                          ({(file.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-3 py-2 flex items-center justify-between bg-gray-50">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <CheckCircle className="w-5 h-5" />
            <span>Update Status</span>
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// MODAL 7: VERIFY RCA MODAL
// ============================================================================

interface VerifyRCAModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: VerifyRCAData) => void
  onRequestRevisions: () => void
  investigation: RCAInvestigation | null
}

export const VerifyRCAModal: React.FC<VerifyRCAModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onRequestRevisions,
  investigation
}) => {
  const { user } = useAuth()
  const [formData, setFormData] = useState<VerifyRCAData>({
    verificationNotes: '',
    actualTotalCost: 0,
    effectivenessRating: 3,
    lessonsLearned: '',
    verifiedBy: '',
    verificationDate: new Date().toISOString().split('T')[0]
  })

  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.verificationNotes.trim()) {
      newErrors.verificationNotes = 'Verification notes are required'
    }
    if (!formData.lessonsLearned.trim()) {
      newErrors.lessonsLearned = 'Lessons learned are required'
    } else if (formData.lessonsLearned.trim().length < 50) {
      newErrors.lessonsLearned = 'Lessons learned must be at least 50 characters'
    }
    if (!formData.verifiedBy.trim()) {
      newErrors.verifiedBy = 'Verified by is required'
    }
    if (!formData.verificationDate) {
      newErrors.verificationDate = 'Verification date is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return

    onSubmit(formData)
    handleClose()
  }

  const handleClose = () => {
    setFormData({
      verificationNotes: '',
      actualTotalCost: 0,
      effectivenessRating: 3,
      lessonsLearned: '',
      verifiedBy: user?.fullName ?? '',
      verificationDate: new Date().toISOString().split('T')[0]
    })
    setErrors({})
    onClose()
  }

  React.useEffect(() => {
    if (investigation && isOpen) {
      // Calculate total actual cost from all actions
      const totalCost =
        (investigation.correctiveActions.reduce((sum, a) => sum + (a.actualCost || 0), 0) +
        investigation.preventiveActions.reduce((sum, a) => sum + (a.actualCost || 0), 0))

      setFormData(prev => ({
        ...prev,
        actualTotalCost: totalCost,
        verifiedBy: prev.verifiedBy || user?.fullName || ''
      }))
    }
  }, [investigation, isOpen, user])

  if (!isOpen || !investigation) return null

  const allRootCausesIdentified = investigation.rootCauses.length > 0
  const allCorrectiveActionsCompleted =
    investigation.correctiveActions.length > 0 &&
    investigation.correctiveActions.every(a => a.status === 'completed')
  const allPreventiveActionsCompleted =
    investigation.preventiveActions.length > 0 &&
    investigation.preventiveActions.every(a => a.status === 'completed')

  const canVerify =
    allRootCausesIdentified &&
    allCorrectiveActionsCompleted &&
    allPreventiveActionsCompleted

  const ratingLabels = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent']

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-3">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-3 py-2 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Award className="w-6 h-6" />
            <h2 className="text-xl font-semibold">Verify & Close RCA Investigation</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3">
          <div className="space-y-3">
            {/* Prerequisites Check */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Prerequisites Check</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  {allRootCausesIdentified ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <span className={allRootCausesIdentified ? 'text-green-700' : 'text-red-700'}>
                    All root causes identified ({investigation.rootCauses.length} total)
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  {allCorrectiveActionsCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <span className={allCorrectiveActionsCompleted ? 'text-green-700' : 'text-red-700'}>
                    All corrective actions completed ({investigation.correctiveActions.length} total)
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  {allPreventiveActionsCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <span className={allPreventiveActionsCompleted ? 'text-green-700' : 'text-red-700'}>
                    All preventive actions completed ({investigation.preventiveActions.length} total)
                  </span>
                </div>
              </div>
              {!canVerify && (
                <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Complete all prerequisites before verifying the RCA investigation.
                  </p>
                </div>
              )}
            </div>

            {/* Verification Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Verification Notes <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.verificationNotes}
                onChange={(e) => setFormData(prev => ({ ...prev, verificationNotes: e.target.value }))}
                placeholder="Summarize the verification process and findings..."
                rows={4}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none ${
                  errors.verificationNotes ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.verificationNotes && (
                <p className="mt-1 text-sm text-red-600">{errors.verificationNotes}</p>
              )}
            </div>

            {/* Actual Total Cost */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Actual Total Cost (USD) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  value={formData.actualTotalCost}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    actualTotalCost: parseFloat(e.target.value) || 0
                  }))}
                  min="0"
                  step="100"
                  placeholder="0.00"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Auto-calculated from action costs: {formatCurrency(formData.actualTotalCost)} |
                Estimated: {formatCurrency(investigation.estimatedCost)}
              </p>
            </div>

            {/* Effectiveness Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Effectiveness Rating <span className="text-red-500">*</span>
              </label>
              <div className="space-y-3">
                <div className="flex items-center justify-center space-x-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, effectivenessRating: rating }))}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-10 h-10 ${
                          rating <= formData.effectivenessRating
                            ? 'text-yellow-500 fill-yellow-500'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <div className="text-center">
                  <span className="text-lg font-semibold text-gray-800">
                    {ratingLabels[formData.effectivenessRating - 1]}
                  </span>
                  <span className="text-gray-600 ml-2">({formData.effectivenessRating}/5)</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 px-2">
                  <span>Poor</span>
                  <span>Fair</span>
                  <span>Good</span>
                  <span>Very Good</span>
                  <span>Excellent</span>
                </div>
              </div>
            </div>

            {/* Lessons Learned */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lessons Learned <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.lessonsLearned}
                onChange={(e) => setFormData(prev => ({ ...prev, lessonsLearned: e.target.value }))}
                placeholder="Document key learnings and recommendations for future improvements (minimum 50 characters)..."
                rows={5}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none ${
                  errors.lessonsLearned ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.lessonsLearned ? (
                <p className="mt-1 text-sm text-red-600">{errors.lessonsLearned}</p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  {formData.lessonsLearned.length} / 50 minimum characters
                </p>
              )}
            </div>

            {/* Verified By and Date */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verified By <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.verifiedBy}
                  onChange={(e) => setFormData(prev => ({ ...prev, verifiedBy: e.target.value }))}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.verifiedBy ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.verifiedBy && (
                  <p className="mt-1 text-sm text-red-600">{errors.verifiedBy}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.verificationDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, verificationDate: e.target.value }))}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.verificationDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.verificationDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.verificationDate}</p>
                )}
              </div>
            </div>

            {/* Warning */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-semibold text-orange-800 mb-1">Important</h4>
                  <p className="text-sm text-orange-700">
                    This will mark the RCA as completed and close the investigation.
                    This action cannot be easily undone. Please ensure all information is accurate.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-3 py-2 flex items-center justify-between bg-gray-50">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onRequestRevisions}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center space-x-2"
            >
              <AlertTriangle className="w-5 h-5" />
              <span>Request Revisions</span>
            </button>
          </div>
          <button
            onClick={handleSubmit}
            disabled={!canVerify}
            className={`px-6 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
              canVerify
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <CheckCircle className="w-5 h-5" />
            <span>Verify & Close RCA</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default {
  CreateRCAModal,
  ViewRCADetailsModal,
  AddRootCauseModal,
  AddCorrectiveActionModal,
  AddPreventiveActionModal,
  UpdateActionStatusModal,
  VerifyRCAModal
}
