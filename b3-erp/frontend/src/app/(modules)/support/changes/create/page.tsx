'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Calendar, Clock, AlertCircle, Users, CheckCircle, Plus, X, Upload } from 'lucide-react'
import { ITILService } from '@/services/support.service'

const COMPANY_ID = process.env.NEXT_PUBLIC_COMPANY_ID || 'company-1'

interface ChangeRequest {
  title: string
  type: 'Standard' | 'Normal' | 'Emergency'
  category: string
  priority: 'P0' | 'P1' | 'P2' | 'P3'
  description: string
  reason: string
  impact: string
  rollbackPlan: string
  implementationDate: string
  implementationTime: string
  estimatedDuration: string
  affectedSystems: string[]
  affectedUsers: string
  requester: string
  requestDate: string
  department: string
  businessJustification: string
  attachments: string[]
}

interface SystemOption {
  id: string
  name: string
  criticality: 'High' | 'Medium' | 'Low'
}

export default function CreateChange() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [formData, setFormData] = useState<ChangeRequest>({
    title: '',
    type: 'Normal',
    category: '',
    priority: 'P2',
    description: '',
    reason: '',
    impact: '',
    rollbackPlan: '',
    implementationDate: '',
    implementationTime: '',
    estimatedDuration: '',
    affectedSystems: [],
    affectedUsers: '',
    requester: 'John Smith',
    requestDate: new Date().toISOString().split('T')[0],
    department: '',
    businessJustification: '',
    attachments: []
  })

  const systems: SystemOption[] = [
    { id: 'erp', name: 'ERP System', criticality: 'High' },
    { id: 'crm', name: 'CRM Platform', criticality: 'High' },
    { id: 'email', name: 'Email Server', criticality: 'High' },
    { id: 'db', name: 'Production Database', criticality: 'High' },
    { id: 'web', name: 'Company Website', criticality: 'Medium' },
    { id: 'vpn', name: 'VPN Gateway', criticality: 'Medium' },
    { id: 'fileserver', name: 'File Server', criticality: 'Medium' },
    { id: 'backup', name: 'Backup System', criticality: 'Low' }
  ]

  const categories = [
    'Infrastructure',
    'Application',
    'Database',
    'Network',
    'Security',
    'Hardware',
    'Software Update',
    'Configuration',
    'Emergency Patch'
  ]

  const departments = [
    'IT Operations',
    'Application Development',
    'Infrastructure',
    'Security',
    'Network',
    'Database Administration',
    'End User Computing'
  ]

  const steps = [
    { number: 1, title: 'Basic Information', icon: FileText },
    { number: 2, title: 'Impact Assessment', icon: AlertCircle },
    { number: 3, title: 'Implementation Plan', icon: Calendar },
    { number: 4, title: 'Review & Submit', icon: CheckCircle }
  ]

  const handleInputChange = (field: keyof ChangeRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const toggleSystem = (systemId: string) => {
    setFormData(prev => ({
      ...prev,
      affectedSystems: prev.affectedSystems.includes(systemId)
        ? prev.affectedSystems.filter(s => s !== systemId)
        : [...prev.affectedSystems, systemId]
    }))
  }

  const handleSubmit = async () => {
    if (submitting) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      const scheduledStart = formData.implementationDate
        ? (formData.implementationTime
            ? `${formData.implementationDate}T${formData.implementationTime}`
            : formData.implementationDate)
        : undefined
      await ITILService.createChange({
        companyId: COMPANY_ID,
        title: formData.title,
        description: formData.description,
        type: formData.type.toLowerCase() as 'standard' | 'normal' | 'emergency',
        category: formData.category,
        priority: formData.priority,
        impact: formData.impact,
        affectedServices: formData.affectedSystems,
        implementationPlan: formData.businessJustification || formData.reason,
        backoutPlan: formData.rollbackPlan,
        scheduledStart,
      } as any)
      setSubmitSuccess(true)
      router.push('/support/changes/scheduled')
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit change request. Please try again.')
      setSubmitting(false)
    }
  }

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return formData.title && formData.category && formData.description && formData.department
      case 2:
        return formData.impact && formData.affectedSystems.length > 0 && formData.affectedUsers
      case 3:
        return formData.implementationDate && formData.implementationTime && formData.rollbackPlan
      default:
        return true
    }
  }

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Request Change</h1>
          <p className="text-gray-600 mt-1">Create a new change request following ITIL process</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">
            Save as Draft
          </button>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white rounded-lg shadow-sm border p-3">
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  currentStep >= step.number 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  <step.icon className="h-6 w-6" />
                </div>
                <div className="text-center mt-2">
                  <div className={`text-sm font-medium ${
                    currentStep >= step.number ? 'text-blue-600' : 'text-gray-600'
                  }`}>
                    Step {step.number}
                  </div>
                  <div className="text-xs text-gray-500">{step.title}</div>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={`h-1 flex-1 mx-4 ${
                  currentStep > step.number ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <div className="space-y-3">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Basic Information
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Change Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Brief description of the change"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Change Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Standard">Standard - Pre-approved change</option>
                  <option value="Normal">Normal - Requires CAB approval</option>
                  <option value="Emergency">Emergency - Urgent change</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select category...</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Priority <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="P0">P0 - Critical (Service Down)</option>
                  <option value="P1">P1 - High (Major Impact)</option>
                  <option value="P2">P2 - Medium (Moderate Impact)</option>
                  <option value="P3">P3 - Low (Minor Impact)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Department <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select department...</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  placeholder="Detailed description of the change..."
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Reason for Change <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => handleInputChange('reason', e.target.value)}
                  rows={3}
                  placeholder="Why is this change necessary?"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Business Justification
                </label>
                <textarea
                  value={formData.businessJustification}
                  onChange={(e) => handleInputChange('businessJustification', e.target.value)}
                  rows={3}
                  placeholder="Business case and expected benefits..."
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Impact Assessment */}
        {currentStep === 2 && (
          <div className="space-y-3">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Impact Assessment
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Affected Systems <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {systems.map(system => (
                    <div
                      key={system.id}
                      onClick={() => toggleSystem(system.id)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        formData.affectedSystems.includes(system.id)
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            formData.affectedSystems.includes(system.id)
                              ? 'border-blue-600 bg-blue-600'
                              : 'border-gray-300'
                          }`}>
                            {formData.affectedSystems.includes(system.id) && (
                              <CheckCircle className="h-4 w-4 text-white" />
                            )}
                          </div>
                          <span className="font-medium">{system.name}</span>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${
                          system.criticality === 'High' 
                            ? 'bg-red-100 text-red-700'
                            : system.criticality === 'Medium'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {system.criticality}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Number of Affected Users <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.affectedUsers}
                    onChange={(e) => handleInputChange('affectedUsers', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select range...</option>
                    <option value="1-10">1-10 users</option>
                    <option value="11-50">11-50 users</option>
                    <option value="51-100">51-100 users</option>
                    <option value="101-500">101-500 users</option>
                    <option value="500+">500+ users</option>
                    <option value="All">All users</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Estimated Duration <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.estimatedDuration}
                    onChange={(e) => handleInputChange('estimatedDuration', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select duration...</option>
                    <option value="< 30 min">Less than 30 minutes</option>
                    <option value="30 min - 1 hour">30 minutes - 1 hour</option>
                    <option value="1-2 hours">1-2 hours</option>
                    <option value="2-4 hours">2-4 hours</option>
                    <option value="4-8 hours">4-8 hours</option>
                    <option value="8+ hours">More than 8 hours</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Impact Analysis <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.impact}
                  onChange={(e) => handleInputChange('impact', e.target.value)}
                  rows={4}
                  placeholder="Describe the potential impact on systems, users, and business operations..."
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Risk Assessment */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <h3 className="font-medium text-amber-900 mb-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Risk Assessment
                </h3>
                <div className="text-sm text-amber-800 space-y-1">
                  <p>• Systems affected: {formData.affectedSystems.length}</p>
                  <p>• Priority level: {formData.priority}</p>
                  <p>• User impact: {formData.affectedUsers || 'Not specified'}</p>
                  <p>• Change type: {formData.type}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Implementation Plan */}
        {currentStep === 3 && (
          <div className="space-y-3">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Implementation Plan
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Implementation Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.implementationDate}
                  onChange={(e) => handleInputChange('implementationDate', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Implementation Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={formData.implementationTime}
                  onChange={(e) => handleInputChange('implementationTime', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Rollback Plan <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.rollbackPlan}
                  onChange={(e) => handleInputChange('rollbackPlan', e.target.value)}
                  rows={4}
                  placeholder="Detailed steps to rollback if the change fails..."
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Attachments
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center hover:border-gray-400 cursor-pointer">
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-500 mt-1">Implementation plans, diagrams, or documentation</p>
                </div>
              </div>
            </div>

            {/* Implementation Checklist */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <h3 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Pre-Implementation Checklist
              </h3>
              <div className="space-y-2 text-sm text-blue-800">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span>Stakeholders notified</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span>Backup completed</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span>Rollback plan tested</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span>Change window approved</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span>Resources allocated</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Review & Submit */}
        {currentStep === 4 && (
          <div className="space-y-3">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Review & Submit
            </h2>

            <div className="space-y-2">
              {/* Basic Information Summary */}
              <div className="border rounded-lg p-3">
                <h3 className="font-medium mb-3">Basic Information</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">Title:</span>
                    <p className="font-medium">{formData.title || 'Not provided'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Type:</span>
                    <p className="font-medium">{formData.type}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Category:</span>
                    <p className="font-medium">{formData.category || 'Not provided'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Priority:</span>
                    <p className="font-medium">{formData.priority}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-600">Description:</span>
                    <p className="font-medium">{formData.description || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              {/* Impact Summary */}
              <div className="border rounded-lg p-3">
                <h3 className="font-medium mb-3">Impact Assessment</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">Affected Systems:</span>
                    <p className="font-medium">{formData.affectedSystems.length} systems</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Affected Users:</span>
                    <p className="font-medium">{formData.affectedUsers || 'Not specified'}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-600">Impact:</span>
                    <p className="font-medium">{formData.impact || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              {/* Implementation Summary */}
              <div className="border rounded-lg p-3">
                <h3 className="font-medium mb-3">Implementation Plan</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">Date:</span>
                    <p className="font-medium">{formData.implementationDate || 'Not set'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Time:</span>
                    <p className="font-medium">{formData.implementationTime || 'Not set'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Duration:</span>
                    <p className="font-medium">{formData.estimatedDuration || 'Not specified'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Rollback Plan:</span>
                    <p className="font-medium">{formData.rollbackPlan ? 'Provided' : 'Not provided'}</p>
                  </div>
                </div>
              </div>

              {/* Approval Notice */}
              <div className="bg-gray-50 border rounded-lg p-3">
                <h3 className="font-medium mb-2">Next Steps</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Your change request will be reviewed by the Change Advisory Board (CAB)</li>
                  <li>• You will receive notifications on approval status</li>
                  <li>• Standard changes are typically approved within 24 hours</li>
                  <li>• Normal changes require CAB meeting approval (next meeting: Friday 2:00 PM)</li>
                  <li>• Emergency changes follow expedited approval process</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t">
          <button
            onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
            disabled={currentStep === 1}
            className="px-6 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          {currentStep < 4 ? (
            <button
              onClick={() => setCurrentStep(prev => Math.min(4, prev + 1))}
              disabled={!isStepValid(currentStep)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting || submitSuccess}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting…' : submitSuccess ? 'Submitted' : 'Submit Change Request'}
            </button>
          )}
        </div>

        {submitError && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4" />
            {submitError}
          </div>
        )}
      </div>
    </div>
  )
}
