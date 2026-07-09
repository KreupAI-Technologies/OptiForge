"use client"

import React, { useState } from 'react'
import { X, Plus, CheckCircle, XCircle, AlertTriangle, FileText, Upload, Eye, Edit, Calendar, DollarSign, Building2, User, Clock, RefreshCw, Scale, Award, Send, Download, History, Trash2, Copy, FilePlus } from 'lucide-react'

// ==================== INTERFACES ====================

export interface ContractDocument {
  type: string
  name: string
  uploadDate: string
  size: string
  url?: string
}

export interface ContractMilestone {
  title: string
  date: string
  status: 'pending' | 'completed' | 'overdue'
  value?: number
  description?: string
}

export interface ContractData {
  id?: string
  contractNumber: string
  title: string
  vendorName: string
  vendorCode: string
  type: 'purchase' | 'service' | 'maintenance' | 'lease' | 'nda' | 'framework'
  status: 'draft' | 'active' | 'expired' | 'terminated' | 'renewed' | 'under_review'
  value: number
  currency: string
  startDate: string
  endDate: string
  renewalDate?: string
  department: string
  owner: string
  category: string
  paymentTerms: string
  autoRenew: boolean
  renewalNotice: number
  compliance: number
  risk: 'low' | 'medium' | 'high'
  documents: ContractDocument[]
  milestones: ContractMilestone[]
  amendments: number
  lastReviewDate?: string
  nextReviewDate?: string
  tags?: string[]
  description?: string
  terms?: string
}

export interface RenewContractData {
  contractNumber: string
  newStartDate: string
  newEndDate: string
  newValue: number
  currency: string
  valueChange: number
  valueChangeReason: string
  termsChanged: boolean
  changesDescription: string
  approver: string
  renewalType: 'automatic' | 'negotiated' | 'same_terms'
  notifyVendor: boolean
}

export interface AmendContractData {
  contractNumber: string
  amendmentNumber: string
  amendmentType: 'value' | 'terms' | 'dates' | 'scope' | 'other'
  effectiveDate: string
  description: string
  changes: Array<{
    field: string
    oldValue: string
    newValue: string
    reason: string
  }>
  approver: string
  requiresVendorSignature: boolean
  notifyStakeholders: boolean
}

export interface TerminateContractData {
  contractNumber: string
  terminationDate: string
  terminationType: 'mutual' | 'breach' | 'convenience' | 'expiration'
  reason: string
  noticePeriodMet: boolean
  penaltyApplicable: boolean
  penaltyAmount?: number
  finalPayment?: number
  exitObligations: string
  notifyVendor: boolean
  approver: string
}

// ==================== CREATE CONTRACT MODAL ====================

interface CreateContractModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: ContractData) => void
}

export const CreateContractModal: React.FC<CreateContractModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<ContractData>({
    contractNumber: `CON-${Date.now()}`,
    title: '',
    vendorName: '',
    vendorCode: '',
    type: 'service',
    status: 'draft',
    value: 0,
    currency: 'USD',
    startDate: '',
    endDate: '',
    department: '',
    owner: 'Current User',
    category: '',
    paymentTerms: '',
    autoRenew: false,
    renewalNotice: 60,
    compliance: 100,
    risk: 'low',
    documents: [],
    milestones: [],
    amendments: 0,
    tags: [],
    description: '',
    terms: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    if (step === 1) {
      if (!formData.title) newErrors.title = 'Contract title is required'
      if (!formData.vendorName) newErrors.vendorName = 'Vendor name is required'
      if (!formData.type) newErrors.type = 'Contract type is required'
      if (!formData.startDate) newErrors.startDate = 'Start date is required'
      if (!formData.endDate) newErrors.endDate = 'End date is required'
    } else if (step === 2) {
      if (formData.value < 0) newErrors.value = 'Contract value must be positive'
      if (!formData.department) newErrors.department = 'Department is required'
      if (!formData.category) newErrors.category = 'Category is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleSubmit = () => {
    if (validateStep(3)) {
      onSubmit(formData)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-lg shadow-xl w-full  max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-2 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <FilePlus className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">Create New Contract</h2>
              <p className="text-sm opacity-90">{formData.contractNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 py-4 bg-gray-50 border-b">
          <div className={`flex items-center gap-2 ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>1</div>
            <span className="font-medium">Basic Info</span>
          </div>
          <div className="w-12 h-0.5 bg-gray-300"></div>
          <div className={`flex items-center gap-2 ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>2</div>
            <span className="font-medium">Financial & Terms</span>
          </div>
          <div className="w-12 h-0.5 bg-gray-300"></div>
          <div className={`flex items-center gap-2 ${currentStep >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>3</div>
            <span className="font-medium">Additional Details</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contract Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.title ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Annual IT Support and Maintenance"
                  />
                  {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Name *</label>
                  <input
                    type="text"
                    value={formData.vendorName}
                    onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.vendorName ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.vendorName && <p className="text-red-500 text-xs mt-1">{errors.vendorName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Code</label>
                  <input
                    type="text"
                    value={formData.vendorCode}
                    onChange={(e) => setFormData({ ...formData, vendorCode: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contract Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="purchase">Purchase Agreement</option>
                    <option value="service">Service Contract</option>
                    <option value="maintenance">Maintenance Contract</option>
                    <option value="lease">Lease Agreement</option>
                    <option value="nda">Non-Disclosure Agreement</option>
                    <option value="framework">Framework Agreement</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Risk Level</label>
                  <select
                    value={formData.risk}
                    onChange={(e) => setFormData({ ...formData, risk: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.startDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.endDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.endDate && <p className="text-red-500 text-xs mt-1">{errors.endDate}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Brief description of the contract..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Financial & Terms */}
          {currentStep === 2 && (
            <div className="space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contract Value</label>
                  <input
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="INR">INR</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.department ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.category ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., IT Services, Raw Materials"
                  />
                  {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms</label>
                  <select
                    value={formData.paymentTerms}
                    onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Payment Terms</option>
                    <option value="Net 30">Net 30</option>
                    <option value="Net 60">Net 60</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Annually">Annually</option>
                    <option value="On Delivery">On Delivery</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contract Owner</label>
                  <input
                    type="text"
                    value={formData.owner}
                    onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.autoRenew}
                      onChange={(e) => setFormData({ ...formData, autoRenew: e.target.checked })}
                      className="text-blue-600 focus:ring-blue-500 rounded"
                    />
                    <span className="text-sm text-gray-700">Auto-Renew Contract</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Renewal Notice (days)</label>
                  <input
                    type="number"
                    value={formData.renewalNotice}
                    onChange={(e) => setFormData({ ...formData, renewalNotice: parseInt(e.target.value) || 60 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Terms and Conditions</label>
                  <textarea
                    value={formData.terms}
                    onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter contract terms and conditions..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Additional Details */}
          {currentStep === 3 && (
            <div className="space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Renewal Date</label>
                  <input
                    type="date"
                    value={formData.renewalDate || ''}
                    onChange={(e) => setFormData({ ...formData, renewalDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Next Review Date</label>
                  <input
                    type="date"
                    value={formData.nextReviewDate || ''}
                    onChange={(e) => setFormData({ ...formData, nextReviewDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.tags?.join(', ')}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(',').map(t => t.trim()) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Critical, Auto-Renew, Strategic"
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <h4 className="font-semibold text-blue-900 mb-2">Contract Summary</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-blue-700">Title:</p>
                    <p className="font-semibold">{formData.title || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-blue-700">Vendor:</p>
                    <p className="font-semibold">{formData.vendorName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-blue-700">Value:</p>
                    <p className="font-semibold">{formData.currency} {formData.value.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-blue-700">Duration:</p>
                    <p className="font-semibold">{formData.startDate} to {formData.endDate}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-3 py-2 bg-gray-50 flex justify-between">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <div className="flex gap-3">
            {currentStep > 1 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Previous
              </button>
            )}
            {currentStep < 3 ? (
              <button
                onClick={handleNext}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Create Contract
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ==================== VIEW CONTRACT DETAILS MODAL ====================

interface ViewContractDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  contract: ContractData | null
  onEdit?: () => void
  onRenew?: () => void
  onAmend?: () => void
  onTerminate?: () => void
}

export const ViewContractDetailsModal: React.FC<ViewContractDetailsModalProps> = ({
  isOpen,
  onClose,
  contract,
  onEdit,
  onRenew,
  onAmend,
  onTerminate
}) => {
  if (!isOpen || !contract) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-700'
      case 'active': return 'bg-green-100 text-green-700'
      case 'expired': return 'bg-red-100 text-red-700'
      case 'terminated': return 'bg-orange-100 text-orange-700'
      case 'renewed': return 'bg-blue-100 text-blue-700'
      case 'under_review': return 'bg-yellow-100 text-yellow-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-700'
      case 'medium': return 'bg-yellow-100 text-yellow-700'
      case 'high': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-lg shadow-xl w-full  max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-3 py-2 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Eye className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">Contract Details</h2>
              <p className="text-sm opacity-90">{contract.contractNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3">
          {/* Status Badges */}
          <div className="flex gap-3 mb-3">
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(contract.status)}`}>
              {contract.status.toUpperCase().replace('_', ' ')}
            </span>
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getRiskColor(contract.risk)}`}>
              Risk: {contract.risk.toUpperCase()}
            </span>
            <span className="px-4 py-2 rounded-full text-sm font-semibold bg-blue-100 text-blue-700">
              {contract.type.toUpperCase()}
            </span>
          </div>

          {/* Contract Title */}
          <h3 className="text-2xl font-bold text-gray-900 mb-3">{contract.title}</h3>

          {/* Main Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="text-sm text-gray-600 mb-1">Vendor</p>
              <p className="text-lg font-bold text-gray-900">{contract.vendorName}</p>
              <p className="text-xs text-gray-500">{contract.vendorCode}</p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="text-sm text-gray-600 mb-1">Contract Value</p>
              <p className="text-lg font-bold text-gray-900">{contract.currency} {contract.value.toLocaleString()}</p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="text-sm text-gray-600 mb-1">Contract Period</p>
              <p className="text-lg font-bold text-gray-900">{contract.startDate}</p>
              <p className="text-sm text-gray-600">to {contract.endDate}</p>
            </div>
          </div>

          {/* Additional Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <div>
              <p className="text-sm text-gray-600">Department</p>
              <p className="font-semibold text-gray-900">{contract.department}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Contract Owner</p>
              <p className="font-semibold text-gray-900">{contract.owner}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Category</p>
              <p className="font-semibold text-gray-900">{contract.category}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Payment Terms</p>
              <p className="font-semibold text-gray-900">{contract.paymentTerms}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Auto-Renew</p>
              <p className="font-semibold text-gray-900">{contract.autoRenew ? 'Yes' : 'No'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Renewal Notice Period</p>
              <p className="font-semibold text-gray-900">{contract.renewalNotice} days</p>
            </div>
          </div>

          {/* Description */}
          {contract.description && (
            <div className="mb-3">
              <h4 className="font-semibold text-gray-700 mb-2">Description</h4>
              <p className="text-gray-600">{contract.description}</p>
            </div>
          )}

          {/* Documents */}
          {contract.documents && contract.documents.length > 0 && (
            <div className="mb-3">
              <h4 className="font-semibold text-gray-700 mb-3">Documents</h4>
              <div className="space-y-2">
                {contract.documents.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="font-semibold text-gray-900">{doc.name}</p>
                        <p className="text-xs text-gray-500">{doc.type} • {doc.size} • {doc.uploadDate}</p>
                      </div>
                    </div>
                    <button className="text-blue-600 hover:text-blue-700">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Milestones */}
          {contract.milestones && contract.milestones.length > 0 && (
            <div className="mb-3">
              <h4 className="font-semibold text-gray-700 mb-3">Milestones</h4>
              <div className="space-y-2">
                {contract.milestones.map((milestone, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-900">{milestone.title}</p>
                      <p className="text-sm text-gray-500">{milestone.date}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {milestone.value && (
                        <span className="text-sm font-semibold text-gray-700">${milestone.value.toLocaleString()}</span>
                      )}
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        milestone.status === 'completed' ? 'bg-green-100 text-green-700' :
                        milestone.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {milestone.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {contract.tags && contract.tags.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {contract.tags.map((tag, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-3 py-2 bg-gray-50 flex justify-between">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Close
          </button>
          <div className="flex gap-3">
            {onEdit && (
              <button
                onClick={onEdit}
                className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
            )}
            {onRenew && contract.status === 'active' && (
              <button
                onClick={onRenew}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Renew
              </button>
            )}
            {onAmend && (contract.status === 'active' || contract.status === 'under_review') && (
              <button
                onClick={onAmend}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Amend
              </button>
            )}
            {onTerminate && contract.status === 'active' && (
              <button
                onClick={onTerminate}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                Terminate
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ==================== RENEW CONTRACT MODAL ====================

interface RenewContractModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: RenewContractData) => void
  contract: ContractData | null
}

export const RenewContractModal: React.FC<RenewContractModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  contract
}) => {
  const [formData, setFormData] = useState<RenewContractData>({
    contractNumber: contract?.contractNumber || '',
    newStartDate: '',
    newEndDate: '',
    newValue: contract?.value || 0,
    currency: contract?.currency || 'USD',
    valueChange: 0,
    valueChangeReason: '',
    termsChanged: false,
    changesDescription: '',
    approver: '',
    renewalType: 'same_terms',
    notifyVendor: true
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  React.useEffect(() => {
    if (contract) {
      const valueChange = formData.newValue - contract.value
      setFormData(prev => ({
        ...prev,
        contractNumber: contract.contractNumber,
        newValue: contract.value,
        currency: contract.currency,
        valueChange
      }))
    }
  }, [contract])

  const handleValueChange = (newValue: number) => {
    const valueChange = newValue - (contract?.value || 0)
    setFormData({ ...formData, newValue, valueChange })
  }

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.newStartDate) newErrors.newStartDate = 'Start date is required'
    if (!formData.newEndDate) newErrors.newEndDate = 'End date is required'
    if (formData.valueChange !== 0 && !formData.valueChangeReason) {
      newErrors.valueChangeReason = 'Please explain value change'
    }
    if (formData.termsChanged && !formData.changesDescription) {
      newErrors.changesDescription = 'Please describe term changes'
    }

    setErrors(newErrors)
    if (Object.keys(newErrors).length === 0) {
      onSubmit(formData)
    }
  }

  if (!isOpen || !contract) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-2 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <RefreshCw className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">Renew Contract</h2>
              <p className="text-sm opacity-90">{contract.contractNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {/* Current Contract Info */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <h4 className="font-semibold text-gray-900 mb-2">Current Contract</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-gray-600">Contract Period:</p>
                <p className="font-semibold">{contract.startDate} to {contract.endDate}</p>
              </div>
              <div>
                <p className="text-gray-600">Current Value:</p>
                <p className="font-semibold">{contract.currency} {contract.value.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Renewal Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Renewal Type</label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setFormData({ ...formData, renewalType: 'same_terms' })}
                className={`px-4 py-3 border-2 rounded-lg font-medium transition-all ${
                  formData.renewalType === 'same_terms'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
              >
                Same Terms
              </button>
              <button
                onClick={() => setFormData({ ...formData, renewalType: 'negotiated' })}
                className={`px-4 py-3 border-2 rounded-lg font-medium transition-all ${
                  formData.renewalType === 'negotiated'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
              >
                Negotiated
              </button>
              <button
                onClick={() => setFormData({ ...formData, renewalType: 'automatic' })}
                className={`px-4 py-3 border-2 rounded-lg font-medium transition-all ${
                  formData.renewalType === 'automatic'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
              >
                Automatic
              </button>
            </div>
          </div>

          {/* New Period */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Start Date *</label>
              <input
                type="date"
                value={formData.newStartDate}
                onChange={(e) => setFormData({ ...formData, newStartDate: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.newStartDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.newStartDate && <p className="text-red-500 text-xs mt-1">{errors.newStartDate}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New End Date *</label>
              <input
                type="date"
                value={formData.newEndDate}
                onChange={(e) => setFormData({ ...formData, newEndDate: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.newEndDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.newEndDate && <p className="text-red-500 text-xs mt-1">{errors.newEndDate}</p>}
            </div>
          </div>

          {/* New Value */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Contract Value</label>
            <input
              type="number"
              value={formData.newValue}
              onChange={(e) => handleValueChange(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              min="0"
              step="0.01"
            />
            {formData.valueChange !== 0 && (
              <p className={`text-sm mt-1 ${formData.valueChange > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {formData.valueChange > 0 ? '+' : ''}{formData.currency} {formData.valueChange.toLocaleString()}
                ({((formData.valueChange / (contract.value || 1)) * 100).toFixed(1)}%)
              </p>
            )}
          </div>

          {/* Value Change Reason */}
          {formData.valueChange !== 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Value Change *</label>
              <textarea
                value={formData.valueChangeReason}
                onChange={(e) => setFormData({ ...formData, valueChangeReason: e.target.value })}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.valueChangeReason ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Explain the reason for value change..."
              />
              {errors.valueChangeReason && <p className="text-red-500 text-xs mt-1">{errors.valueChangeReason}</p>}
            </div>
          )}

          {/* Terms Changed */}
          <div>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.termsChanged}
                onChange={(e) => setFormData({ ...formData, termsChanged: e.target.checked })}
                className="text-green-500 focus:ring-green-500 rounded"
              />
              <span className="text-sm text-gray-700">Contract terms have changed</span>
            </label>
          </div>

          {formData.termsChanged && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Describe Changes *</label>
              <textarea
                value={formData.changesDescription}
                onChange={(e) => setFormData({ ...formData, changesDescription: e.target.value })}
                rows={4}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.changesDescription ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Describe all changes to terms and conditions..."
              />
              {errors.changesDescription && <p className="text-red-500 text-xs mt-1">{errors.changesDescription}</p>}
            </div>
          )}

          {/* Approver */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Approver</label>
            <input
              type="text"
              value={formData.approver}
              onChange={(e) => setFormData({ ...formData, approver: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter approver name"
            />
          </div>

          {/* Notify Vendor */}
          <div>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.notifyVendor}
                onChange={(e) => setFormData({ ...formData, notifyVendor: e.target.checked })}
                className="text-green-500 focus:ring-green-500 rounded"
              />
              <span className="text-sm text-gray-700">Notify vendor of renewal</span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-3 py-2 bg-gray-50 flex justify-between">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Renew Contract
          </button>
        </div>
      </div>
    </div>
  )
}

// ==================== AMEND CONTRACT MODAL ====================

interface AmendContractModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: AmendContractData) => void
  contract: ContractData | null
}

export const AmendContractModal: React.FC<AmendContractModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  contract
}) => {
  const [formData, setFormData] = useState<AmendContractData>({
    contractNumber: contract?.contractNumber || '',
    amendmentNumber: `AMD-${Date.now()}`,
    amendmentType: 'terms',
    effectiveDate: new Date().toISOString().split('T')[0],
    description: '',
    changes: [],
    approver: '',
    requiresVendorSignature: true,
    notifyStakeholders: true
  })

  const [currentChange, setCurrentChange] = useState({
    field: '',
    oldValue: '',
    newValue: '',
    reason: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const addChange = () => {
    if (!currentChange.field || !currentChange.newValue || !currentChange.reason) {
      setErrors({ change: 'Please fill in all change details' })
      return
    }

    setFormData({
      ...formData,
      changes: [...formData.changes, currentChange]
    })

    setCurrentChange({ field: '', oldValue: '', newValue: '', reason: '' })
    setErrors({})
  }

  const removeChange = (index: number) => {
    setFormData({
      ...formData,
      changes: formData.changes.filter((_, i) => i !== index)
    })
  }

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.description) newErrors.description = 'Amendment description is required'
    if (formData.changes.length === 0) newErrors.changes = 'Add at least one change'

    setErrors(newErrors)
    if (Object.keys(newErrors).length === 0) {
      onSubmit(formData)
    }
  }

  if (!isOpen || !contract) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-lg shadow-xl w-full  max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-3 py-2 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">Amend Contract</h2>
              <p className="text-sm opacity-90">{contract.contractNumber} - {formData.amendmentNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {/* Amendment Type */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amendment Type</label>
              <select
                value={formData.amendmentType}
                onChange={(e) => setFormData({ ...formData, amendmentType: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="value">Contract Value</option>
                <option value="terms">Terms & Conditions</option>
                <option value="dates">Contract Dates</option>
                <option value="scope">Scope of Work</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Effective Date</label>
              <input
                type="date"
                value={formData.effectiveDate}
                onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amendment Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Provide a comprehensive description of this amendment..."
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>

          {/* Add Changes */}
          <div className="border border-gray-300 rounded-lg p-3">
            <h4 className="font-semibold text-gray-700 mb-3">Add Change</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Field Being Changed</label>
                <input
                  type="text"
                  value={currentChange.field}
                  onChange={(e) => setCurrentChange({ ...currentChange, field: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Payment Terms, Delivery Schedule"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Value</label>
                <input
                  type="text"
                  value={currentChange.oldValue}
                  onChange={(e) => setCurrentChange({ ...currentChange, oldValue: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Current value"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Value</label>
                <input
                  type="text"
                  value={currentChange.newValue}
                  onChange={(e) => setCurrentChange({ ...currentChange, newValue: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="New value"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Change</label>
                <input
                  type="text"
                  value={currentChange.reason}
                  onChange={(e) => setCurrentChange({ ...currentChange, reason: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Explain why this change is needed"
                />
              </div>
            </div>

            {errors.change && <p className="text-red-500 text-xs mb-2">{errors.change}</p>}

            <button
              onClick={addChange}
              className="w-full px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Change
            </button>
          </div>

          {/* Changes List */}
          {formData.changes.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-700 mb-3">Changes ({formData.changes.length})</h4>
              <div className="space-y-2">
                {formData.changes.map((change, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="font-semibold text-gray-900">{change.field}</h5>
                      <button
                        onClick={() => removeChange(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                      <div>
                        <p className="text-gray-600">From:</p>
                        <p className="font-semibold text-red-600">{change.oldValue || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">To:</p>
                        <p className="font-semibold text-green-600">{change.newValue}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Reason:</span> {change.reason}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {errors.changes && <p className="text-red-500 text-xs">{errors.changes}</p>}

          {/* Additional Options */}
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Approver</label>
              <input
                type="text"
                value={formData.approver}
                onChange={(e) => setFormData({ ...formData, approver: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter approver name"
              />
            </div>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.requiresVendorSignature}
                onChange={(e) => setFormData({ ...formData, requiresVendorSignature: e.target.checked })}
                className="text-blue-500 focus:ring-blue-500 rounded"
              />
              <span className="text-sm text-gray-700">Requires vendor signature</span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.notifyStakeholders}
                onChange={(e) => setFormData({ ...formData, notifyStakeholders: e.target.checked })}
                className="text-blue-500 focus:ring-blue-500 rounded"
              />
              <span className="text-sm text-gray-700">Notify all stakeholders</span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-3 py-2 bg-gray-50 flex justify-between">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Create Amendment
          </button>
        </div>
      </div>
    </div>
  )
}

// ==================== TERMINATE CONTRACT MODAL ====================

interface TerminateContractModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: TerminateContractData) => void
  contract: ContractData | null
}

export const TerminateContractModal: React.FC<TerminateContractModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  contract
}) => {
  const [formData, setFormData] = useState<TerminateContractData>({
    contractNumber: contract?.contractNumber || '',
    terminationDate: new Date().toISOString().split('T')[0],
    terminationType: 'mutual',
    reason: '',
    noticePeriodMet: true,
    penaltyApplicable: false,
    penaltyAmount: 0,
    finalPayment: 0,
    exitObligations: '',
    notifyVendor: true,
    approver: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.reason) newErrors.reason = 'Termination reason is required'
    if (!formData.exitObligations) newErrors.exitObligations = 'Exit obligations must be specified'

    setErrors(newErrors)
    if (Object.keys(newErrors).length === 0) {
      onSubmit(formData)
    }
  }

  if (!isOpen || !contract) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-rose-500 text-white px-3 py-2 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <XCircle className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">Terminate Contract</h2>
              <p className="text-sm opacity-90">{contract.contractNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {/* Warning */}
          <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-red-900">Warning: Contract Termination</p>
                <p className="text-sm text-red-700 mt-1">
                  This action will permanently terminate the contract. Ensure all parties are informed and all obligations are fulfilled.
                </p>
              </div>
            </div>
          </div>

          {/* Contract Info */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <h4 className="font-semibold text-gray-900 mb-2">Contract Information</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-gray-600">Contract Title:</p>
                <p className="font-semibold">{contract.title}</p>
              </div>
              <div>
                <p className="text-gray-600">Vendor:</p>
                <p className="font-semibold">{contract.vendorName}</p>
              </div>
              <div>
                <p className="text-gray-600">Contract Value:</p>
                <p className="font-semibold">{contract.currency} {contract.value.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-600">End Date:</p>
                <p className="font-semibold">{contract.endDate}</p>
              </div>
            </div>
          </div>

          {/* Termination Details */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Termination Type</label>
              <select
                value={formData.terminationType}
                onChange={(e) => setFormData({ ...formData, terminationType: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="mutual">Mutual Agreement</option>
                <option value="breach">Breach of Contract</option>
                <option value="convenience">Termination for Convenience</option>
                <option value="expiration">Natural Expiration</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Termination Date</label>
              <input
                type="date"
                value={formData.terminationDate}
                onChange={(e) => setFormData({ ...formData, terminationDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Termination *</label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              rows={4}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                errors.reason ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Provide detailed reason for contract termination..."
            />
            {errors.reason && <p className="text-red-500 text-xs mt-1">{errors.reason}</p>}
          </div>

          {/* Notice Period & Penalties */}
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.noticePeriodMet}
                onChange={(e) => setFormData({ ...formData, noticePeriodMet: e.target.checked })}
                className="text-red-500 focus:ring-red-500 rounded"
              />
              <span className="text-sm text-gray-700">Required notice period has been met</span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.penaltyApplicable}
                onChange={(e) => setFormData({ ...formData, penaltyApplicable: e.target.checked })}
                className="text-red-500 focus:ring-red-500 rounded"
              />
              <span className="text-sm text-gray-700">Termination penalty applicable</span>
            </label>
          </div>

          {formData.penaltyApplicable && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Penalty Amount</label>
              <input
                type="number"
                value={formData.penaltyAmount}
                onChange={(e) => setFormData({ ...formData, penaltyAmount: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                min="0"
                step="0.01"
              />
            </div>
          )}

          {/* Final Payment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Final Payment Amount</label>
            <input
              type="number"
              value={formData.finalPayment}
              onChange={(e) => setFormData({ ...formData, finalPayment: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              min="0"
              step="0.01"
            />
          </div>

          {/* Exit Obligations */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Exit Obligations *</label>
            <textarea
              value={formData.exitObligations}
              onChange={(e) => setFormData({ ...formData, exitObligations: e.target.value })}
              rows={4}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                errors.exitObligations ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="List all exit obligations and handover requirements..."
            />
            {errors.exitObligations && <p className="text-red-500 text-xs mt-1">{errors.exitObligations}</p>}
          </div>

          {/* Approver & Notification */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Approver</label>
              <input
                type="text"
                value={formData.approver}
                onChange={(e) => setFormData({ ...formData, approver: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Enter approver name"
              />
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.notifyVendor}
                  onChange={(e) => setFormData({ ...formData, notifyVendor: e.target.checked })}
                  className="text-red-500 focus:ring-red-500 rounded"
                />
                <span className="text-sm text-gray-700">Send termination notice to vendor</span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-3 py-2 bg-gray-50 flex justify-between">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="bg-gradient-to-r from-red-500 to-rose-500 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
          >
            <XCircle className="w-4 h-4" />
            Terminate Contract
          </button>
        </div>
      </div>
    </div>
  )
}
