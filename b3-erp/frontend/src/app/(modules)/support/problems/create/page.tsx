'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Save, X, AlertTriangle, Users, Calendar, FileText, Plus, Tag, Link
} from 'lucide-react'
import { ITILService } from '@/services/support.service'

const COMPANY_ID = process.env.NEXT_PUBLIC_COMPANY_ID || 'company-1'

export default function CreateProblem() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium',
    impact: 'medium',
    assignedTo: '',
    relatedIncidents: [] as string[],
    workaround: '',
    rootCause: '',
    symptoms: '',
    affectedServices: '',
    estimatedResolutionTime: ''
  })

  const [incidentId, setIncidentId] = useState('')

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addRelatedIncident = () => {
    if (incidentId.trim()) {
      setFormData(prev => ({
        ...prev,
        relatedIncidents: [...prev.relatedIncidents, incidentId.trim()]
      }))
      setIncidentId('')
    }
  }

  const removeIncident = (index: number) => {
    setFormData(prev => ({
      ...prev,
      relatedIncidents: prev.relatedIncidents.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      await ITILService.createProblem({
        title: formData.title,
        description: formData.description,
        priority: formData.priority as any,
        category: formData.category || undefined,
        rootCause: formData.rootCause || undefined,
        workaround: formData.workaround || undefined,
        assignedTo: formData.assignedTo || undefined,
        companyId: COMPANY_ID
      })
      router.push('/support/problems')
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to create problem. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create Problem Record</h1>
          <p className="text-gray-600 mt-1">Document a new problem for investigation and resolution</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <X className="h-4 w-4 inline mr-2" />
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4 inline mr-2" />
            {submitting ? 'Creating…' : 'Create Problem'}
          </button>
        </div>
      </div>

      {submitError && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4" />
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-5 w-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Problem Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Brief description of the problem"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Problem Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Detailed description of the problem, including when it was first identified..."
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Category</option>
                  <option value="Infrastructure">Infrastructure</option>
                  <option value="Application">Application</option>
                  <option value="Database">Database</option>
                  <option value="Network">Network</option>
                  <option value="Security">Security</option>
                  <option value="Integration">Integration</option>
                  <option value="Performance">Performance</option>
                  <option value="Data">Data Quality</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Affected Services
                </label>
                <input
                  type="text"
                  value={formData.affectedServices}
                  onChange={(e) => handleInputChange('affectedServices', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Email Service, CRM Module"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Classification */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <div className="flex items-center gap-2 mb-3">
            <Tag className="h-5 w-5 text-orange-600" />
            <h2 className="text-lg font-semibold text-gray-900">Classification</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Impact
              </label>
              <select
                value={formData.impact}
                onChange={(e) => handleInputChange('impact', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="low">Low - Single User</option>
                <option value="medium">Medium - Department</option>
                <option value="high">High - Multiple Departments</option>
                <option value="critical">Critical - Organization Wide</option>
              </select>
            </div>
          </div>
        </div>

        {/* Technical Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Technical Details</h2>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Symptoms
              </label>
              <textarea
                value={formData.symptoms}
                onChange={(e) => handleInputChange('symptoms', e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Observable symptoms and error messages..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Root Cause (if known)
              </label>
              <textarea
                value={formData.rootCause}
                onChange={(e) => handleInputChange('rootCause', e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Identified or suspected root cause..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Workaround
              </label>
              <textarea
                value={formData.workaround}
                onChange={(e) => handleInputChange('workaround', e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Temporary workaround or mitigation steps..."
              />
            </div>
          </div>
        </div>

        {/* Assignment & Timeline */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <div className="flex items-center gap-2 mb-3">
            <Users className="h-5 w-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900">Assignment & Timeline</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assign To
              </label>
              <select
                value={formData.assignedTo}
                onChange={(e) => handleInputChange('assignedTo', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Select Team Member</option>
                <option value="rajesh-kumar">Rajesh Kumar</option>
                <option value="priya-sharma">Priya Sharma</option>
                <option value="amit-patel">Amit Patel</option>
                <option value="sneha-reddy">Sneha Reddy</option>
                <option value="vikram-singh">Vikram Singh</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimated Resolution Time
              </label>
              <input
                type="text"
                value={formData.estimatedResolutionTime}
                onChange={(e) => handleInputChange('estimatedResolutionTime', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="e.g., 2 weeks, 30 days"
              />
            </div>
          </div>
        </div>

        {/* Related Incidents */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <div className="flex items-center gap-2 mb-3">
            <Link className="h-5 w-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-gray-900">Related Incidents</h2>
          </div>

          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={incidentId}
                onChange={(e) => setIncidentId(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter Incident ID (e.g., INC-2024-001)"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addRelatedIncident()
                  }
                }}
              />
              <button
                type="button"
                onClick={addRelatedIncident}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
              >
                <Plus className="h-4 w-4 inline mr-2" />
                Add
              </button>
            </div>

            {formData.relatedIncidents.length > 0 && (
              <div className="space-y-2">
                {formData.relatedIncidents.map((incident, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-indigo-50 border border-indigo-200 rounded-lg"
                  >
                    <code className="text-sm font-mono text-indigo-900">{incident}</code>
                    <button
                      type="button"
                      onClick={() => removeIncident(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-blue-900 mb-2">Problem Record Guidelines</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Link all related incidents to track the pattern</li>
                <li>• Document symptoms and error messages thoroughly</li>
                <li>• Provide workarounds to help affected users</li>
                <li>• Update the record as investigation progresses</li>
                <li>• Document root cause once identified for knowledge base</li>
              </ul>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
