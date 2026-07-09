"use client"

import React, { useState } from 'react'
import { X, Plus, CheckCircle, XCircle, AlertTriangle, FileText, Upload, Eye, Edit, Calendar, DollarSign, Users, Send, Download, GitCompare, Award, Star, Clock, Target, Package, Scale, MessageSquare, Mail, Clipboard } from 'lucide-react'
import { exportToCsv } from '@/lib/export'

// ==================== INTERFACES ====================

export interface RFQItem {
  itemId: string
  itemCode: string
  itemName: string
  description: string
  quantity: number
  uom: string
  specifications: string
  deliveryDate: string
  estimatedPrice?: number
}

export interface RFQData {
  id?: string
  rfqNumber: string
  title: string
  description: string
  type: 'RFQ' | 'RFP' | 'RFI'
  category: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  estimatedValue: number
  currency: string
  budgetCode?: string
  publishDate: string
  responseDeadline: string
  qaDeadline?: string
  evaluationPeriod: string
  awardTargetDate: string
  items: RFQItem[]
  invitedSuppliers: string[]
  openToAll: boolean
  evaluationCriteria: {
    priceWeight: number
    qualityWeight: number
    deliveryWeight: number
    technicalWeight: number
    serviceWeight: number
  }
  status: 'draft' | 'published' | 'bidding' | 'evaluation' | 'awarded' | 'cancelled'
  owner: string
  createdDate: string
  documents?: File[]
  termsAndConditions?: string
}

export interface BidResponse {
  id: string
  rfqId: string
  supplier: string
  supplierCode: string
  submittedDate: string
  totalAmount: number
  leadTime: string
  score: number
  status: 'submitted' | 'under_review' | 'shortlisted' | 'rejected' | 'awarded'
  compliance: number
  technicalScore: number
  commercialScore: number
  items: Array<{
    itemId: string
    unitPrice: number
    totalPrice: number
    deliveryTime: string
    notes?: string
  }>
  documents?: Array<{
    name: string
    type: string
    size: string
  }>
}

export interface EvaluationData {
  bidId: string
  evaluator: string
  evaluationDate: string
  criteriaScores: {
    technical: number
    commercial: number
    quality: number
    delivery: number
    service: number
  }
  totalScore: number
  comments: string
  recommendation: 'award' | 'shortlist' | 'reject'
  conditionalApproval?: boolean
  conditions?: string
}

// ==================== CREATE RFQ MODAL ====================

interface CreateRFQModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: RFQData) => void
}

export const CreateRFQModal: React.FC<CreateRFQModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<RFQData>({
    rfqNumber: `RFQ-${Date.now()}`,
    title: '',
    description: '',
    type: 'RFQ',
    category: '',
    priority: 'medium',
    estimatedValue: 0,
    currency: 'USD',
    publishDate: '',
    responseDeadline: '',
    evaluationPeriod: '',
    awardTargetDate: '',
    items: [],
    invitedSuppliers: [],
    openToAll: false,
    evaluationCriteria: {
      priceWeight: 40,
      qualityWeight: 25,
      deliveryWeight: 20,
      technicalWeight: 10,
      serviceWeight: 5
    },
    status: 'draft',
    owner: 'Current User',
    createdDate: new Date().toISOString().split('T')[0]
  })

  const [currentItem, setCurrentItem] = useState<RFQItem>({
    itemId: '',
    itemCode: '',
    itemName: '',
    description: '',
    quantity: 0,
    uom: '',
    specifications: '',
    deliveryDate: ''
  })

  const [currentSupplier, setCurrentSupplier] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const addItem = () => {
    if (!currentItem.itemName || currentItem.quantity <= 0) {
      setErrors({ item: 'Please fill in all item details' })
      return
    }

    setFormData({
      ...formData,
      items: [...formData.items, { ...currentItem, itemId: `ITEM-${Date.now()}` }]
    })
    setCurrentItem({
      itemId: '',
      itemCode: '',
      itemName: '',
      description: '',
      quantity: 0,
      uom: '',
      specifications: '',
      deliveryDate: ''
    })
    setErrors({})
  }

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    })
  }

  const addSupplier = () => {
    if (!currentSupplier.trim()) return
    setFormData({
      ...formData,
      invitedSuppliers: [...formData.invitedSuppliers, currentSupplier]
    })
    setCurrentSupplier('')
  }

  const removeSupplier = (index: number) => {
    setFormData({
      ...formData,
      invitedSuppliers: formData.invitedSuppliers.filter((_, i) => i !== index)
    })
  }

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    if (step === 1) {
      if (!formData.title) newErrors.title = 'Title is required'
      if (!formData.category) newErrors.category = 'Category is required'
      if (!formData.publishDate) newErrors.publishDate = 'Publish date is required'
      if (!formData.responseDeadline) newErrors.responseDeadline = 'Response deadline is required'
    } else if (step === 2) {
      if (formData.items.length === 0) newErrors.items = 'Add at least one item'
    } else if (step === 3) {
      const totalWeight = Object.values(formData.evaluationCriteria).reduce((sum, val) => sum + val, 0)
      if (totalWeight !== 100) newErrors.criteria = `Weights must total 100% (currently ${totalWeight}%)`
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
    if (validateStep(4)) {
      onSubmit(formData)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-lg shadow-xl w-full  max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-3 py-2 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">Create New {formData.type}</h2>
              <p className="text-sm opacity-90">{formData.rfqNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 py-4 bg-gray-50 border-b">
          {[1, 2, 3, 4].map(step => (
            <div key={step} className={`flex items-center gap-2 ${currentStep >= step ? 'text-purple-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= step ? 'bg-purple-600 text-white' : 'bg-gray-300'}`}>
                {step}
              </div>
              <span className="font-medium text-sm">
                {step === 1 ? 'Basic Info' : step === 2 ? 'Items' : step === 3 ? 'Evaluation' : 'Suppliers'}
              </span>
              {step < 4 && <div className="w-8 h-0.5 bg-gray-300 mx-2"></div>}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="RFQ">RFQ - Request for Quotation</option>
                    <option value="RFP">RFP - Request for Proposal</option>
                    <option value="RFI">RFI - Request for Information</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      errors.title ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Annual IT Infrastructure Upgrade"
                  />
                  {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Detailed description of requirements..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      errors.category ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., IT Services, Raw Materials"
                  />
                  {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Value</label>
                  <input
                    type="number"
                    value={formData.estimatedValue}
                    onChange={(e) => setFormData({ ...formData, estimatedValue: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Publish Date *</label>
                  <input
                    type="date"
                    value={formData.publishDate}
                    onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      errors.publishDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.publishDate && <p className="text-red-500 text-xs mt-1">{errors.publishDate}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Response Deadline *</label>
                  <input
                    type="date"
                    value={formData.responseDeadline}
                    onChange={(e) => setFormData({ ...formData, responseDeadline: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      errors.responseDeadline ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.responseDeadline && <p className="text-red-500 text-xs mt-1">{errors.responseDeadline}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Award Target Date</label>
                  <input
                    type="date"
                    value={formData.awardTargetDate}
                    onChange={(e) => setFormData({ ...formData, awardTargetDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Budget Code</label>
                  <input
                    type="text"
                    value={formData.budgetCode || ''}
                    onChange={(e) => setFormData({ ...formData, budgetCode: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Items/Requirements */}
          {currentStep === 2 && (
            <div className="space-y-2">
              {/* Add Item Form */}
              <div className="border border-gray-300 rounded-lg p-3">
                <h4 className="font-semibold text-gray-700 mb-3">Add Item/Requirement</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Item Code</label>
                    <input
                      type="text"
                      value={currentItem.itemCode}
                      onChange={(e) => setCurrentItem({ ...currentItem, itemCode: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="ITEM-001"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                    <input
                      type="text"
                      value={currentItem.itemName}
                      onChange={(e) => setCurrentItem({ ...currentItem, itemName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="Item description"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                    <input
                      type="number"
                      value={currentItem.quantity}
                      onChange={(e) => setCurrentItem({ ...currentItem, quantity: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">UOM</label>
                    <input
                      type="text"
                      value={currentItem.uom}
                      onChange={(e) => setCurrentItem({ ...currentItem, uom: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="Units, Kg, Liters"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Specifications</label>
                    <textarea
                      value={currentItem.specifications}
                      onChange={(e) => setCurrentItem({ ...currentItem, specifications: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="Technical specifications and requirements..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Required Delivery Date</label>
                    <input
                      type="date"
                      value={currentItem.deliveryDate}
                      onChange={(e) => setCurrentItem({ ...currentItem, deliveryDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                {errors.item && <p className="text-red-500 text-xs mb-2">{errors.item}</p>}

                <button
                  onClick={addItem}
                  className="w-full px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Item
                </button>
              </div>

              {/* Items List */}
              {formData.items.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-3">Items ({formData.items.length})</h4>
                  <div className="space-y-2">
                    {formData.items.map((item, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h5 className="font-semibold text-gray-900">{item.itemName}</h5>
                            <p className="text-sm text-gray-500">{item.itemCode}</p>
                          </div>
                          <button onClick={() => removeItem(index)} className="text-red-600 hover:text-red-700">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div>
                            <p className="text-gray-600">Quantity:</p>
                            <p className="font-semibold">{item.quantity} {item.uom}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Delivery:</p>
                            <p className="font-semibold">{item.deliveryDate}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Specs:</p>
                            <p className="font-semibold text-xs">{item.specifications.substring(0, 30)}...</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {errors.items && <p className="text-red-500 text-xs">{errors.items}</p>}
            </div>
          )}

          {/* Step 3: Evaluation Criteria */}
          {currentStep === 3 && (
            <div className="space-y-2">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-2">
                <h4 className="font-semibold text-purple-900 mb-2">Evaluation Criteria Weights</h4>
                <p className="text-sm text-purple-700">Define how bids will be evaluated. Total must equal 100%.</p>
              </div>

              <div className="space-y-2">
                {[
                  { key: 'priceWeight', label: 'Price / Commercial', icon: DollarSign },
                  { key: 'qualityWeight', label: 'Quality Standards', icon: Award },
                  { key: 'deliveryWeight', label: 'Delivery Time', icon: Clock },
                  { key: 'technicalWeight', label: 'Technical Capability', icon: Target },
                  { key: 'serviceWeight', label: 'Service & Support', icon: Users }
                ].map(({ key, label, icon: Icon }) => (
                  <div key={key}>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-purple-600" />
                        <label className="text-sm font-medium text-gray-700">{label}</label>
                      </div>
                      <span className="text-lg font-bold text-purple-600">
                        {formData.evaluationCriteria[key as keyof typeof formData.evaluationCriteria]}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={formData.evaluationCriteria[key as keyof typeof formData.evaluationCriteria]}
                      onChange={(e) => setFormData({
                        ...formData,
                        evaluationCriteria: {
                          ...formData.evaluationCriteria,
                          [key]: parseInt(e.target.value)
                        }
                      })}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                    />
                  </div>
                ))}
              </div>

              <div className="bg-gray-100 border border-gray-300 rounded-lg p-3 mt-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-700">Total Weight:</span>
                  <span className={`text-2xl font-bold ${
                    Object.values(formData.evaluationCriteria).reduce((sum, val) => sum + val, 0) === 100
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}>
                    {Object.values(formData.evaluationCriteria).reduce((sum, val) => sum + val, 0)}%
                  </span>
                </div>
              </div>

              {errors.criteria && <p className="text-red-500 text-xs">{errors.criteria}</p>}
            </div>
          )}

          {/* Step 4: Suppliers */}
          {currentStep === 4 && (
            <div className="space-y-2">
              <div className="flex items-center gap-3 mb-2">
                <input
                  type="checkbox"
                  checked={formData.openToAll}
                  onChange={(e) => setFormData({ ...formData, openToAll: e.target.checked })}
                  className="text-purple-600 focus:ring-purple-500 rounded"
                />
                <label className="text-sm text-gray-700">Open to all qualified suppliers (public tender)</label>
              </div>

              {!formData.openToAll && (
                <>
                  {/* Add Supplier */}
                  <div className="border border-gray-300 rounded-lg p-3">
                    <h4 className="font-semibold text-gray-700 mb-3">Invite Suppliers</h4>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={currentSupplier}
                        onChange={(e) => setCurrentSupplier(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        placeholder="Enter supplier name or code"
                        onKeyPress={(e) => e.key === 'Enter' && addSupplier()}
                      />
                      <button
                        onClick={addSupplier}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Suppliers List */}
                  {formData.invitedSuppliers.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-3">
                        Invited Suppliers ({formData.invitedSuppliers.length})
                      </h4>
                      <div className="space-y-2">
                        {formData.invitedSuppliers.map((supplier, index) => (
                          <div key={index} className="flex justify-between items-center p-3 bg-gray-50 border border-gray-200 rounded-lg">
                            <span className="font-medium text-gray-900">{supplier}</span>
                            <button onClick={() => removeSupplier(index)} className="text-red-600 hover:text-red-700">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Summary */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mt-6">
                <h4 className="font-semibold text-purple-900 mb-3">{formData.type} Summary</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-purple-700">Title:</p>
                    <p className="font-semibold text-gray-900">{formData.title || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-purple-700">Category:</p>
                    <p className="font-semibold text-gray-900">{formData.category || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-purple-700">Items:</p>
                    <p className="font-semibold text-gray-900">{formData.items.length}</p>
                  </div>
                  <div>
                    <p className="text-purple-700">Invited Suppliers:</p>
                    <p className="font-semibold text-gray-900">
                      {formData.openToAll ? 'Open to All' : formData.invitedSuppliers.length}
                    </p>
                  </div>
                  <div>
                    <p className="text-purple-700">Response Deadline:</p>
                    <p className="font-semibold text-gray-900">{formData.responseDeadline}</p>
                  </div>
                  <div>
                    <p className="text-purple-700">Estimated Value:</p>
                    <p className="font-semibold text-gray-900">${formData.estimatedValue.toLocaleString()}</p>
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
            {currentStep < 4 ? (
              <button
                onClick={handleNext}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Create {formData.type}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ==================== VIEW RFQ DETAILS MODAL ====================

interface ViewRFQDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  rfq: RFQData | null
  onEdit?: () => void
  onSend?: () => void
  onCancel?: () => void
}

export const ViewRFQDetailsModal: React.FC<ViewRFQDetailsModalProps> = ({
  isOpen,
  onClose,
  rfq,
  onEdit,
  onSend,
  onCancel
}) => {
  if (!isOpen || !rfq) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-700'
      case 'published': return 'bg-blue-100 text-blue-700'
      case 'bidding': return 'bg-green-100 text-green-700'
      case 'evaluation': return 'bg-yellow-100 text-yellow-700'
      case 'awarded': return 'bg-purple-100 text-purple-700'
      case 'cancelled': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-lg shadow-xl w-full  max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-3 py-2 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Eye className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">{rfq.type} Details</h2>
              <p className="text-sm opacity-90">{rfq.rfqNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          <div className="flex gap-3 mb-3">
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(rfq.status)}`}>
              {rfq.status.toUpperCase()}
            </span>
            <span className="px-4 py-2 rounded-full text-sm font-semibold bg-blue-100 text-blue-700">
              {rfq.type}
            </span>
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
              rfq.priority === 'urgent' ? 'bg-red-100 text-red-700' :
              rfq.priority === 'high' ? 'bg-orange-100 text-orange-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {rfq.priority.toUpperCase()}
            </span>
          </div>

          <h3 className="text-2xl font-bold text-gray-900 mb-3">{rfq.title}</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="text-sm text-gray-600 mb-1">Category</p>
              <p className="text-lg font-bold text-gray-900">{rfq.category}</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="text-sm text-gray-600 mb-1">Estimated Value</p>
              <p className="text-lg font-bold text-gray-900">{rfq.currency} {rfq.estimatedValue.toLocaleString()}</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="text-sm text-gray-600 mb-1">Response Deadline</p>
              <p className="text-lg font-bold text-gray-900">{rfq.responseDeadline}</p>
            </div>
          </div>

          {rfq.description && (
            <div className="mb-3">
              <h4 className="font-semibold text-gray-700 mb-2">Description</h4>
              <p className="text-gray-600">{rfq.description}</p>
            </div>
          )}

          <div className="mb-3">
            <h4 className="font-semibold text-gray-700 mb-3">Items ({rfq.items.length})</h4>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">Item</th>
                    <th className="border border-gray-300 px-3 py-2 text-center text-sm font-semibold">Quantity</th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">Specifications</th>
                    <th className="border border-gray-300 px-3 py-2 text-center text-sm font-semibold">Delivery</th>
                  </tr>
                </thead>
                <tbody>
                  {rfq.items.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-3 py-2 text-sm">
                        <p className="font-semibold">{item.itemName}</p>
                        <p className="text-xs text-gray-500">{item.itemCode}</p>
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-center">{item.quantity} {item.uom}</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">{item.specifications}</td>
                      <td className="border border-gray-300 px-3 py-2 text-center">{item.deliveryDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <h4 className="font-semibold text-gray-700 mb-3">Evaluation Criteria</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Price / Commercial:</span>
                  <span className="font-semibold">{rfq.evaluationCriteria.priceWeight}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Quality Standards:</span>
                  <span className="font-semibold">{rfq.evaluationCriteria.qualityWeight}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Delivery Time:</span>
                  <span className="font-semibold">{rfq.evaluationCriteria.deliveryWeight}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Technical Capability:</span>
                  <span className="font-semibold">{rfq.evaluationCriteria.technicalWeight}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Service & Support:</span>
                  <span className="font-semibold">{rfq.evaluationCriteria.serviceWeight}%</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-700 mb-3">Invited Suppliers</h4>
              {rfq.openToAll ? (
                <p className="text-sm text-gray-600">Open to all qualified suppliers</p>
              ) : (
                <div className="space-y-1">
                  {rfq.invitedSuppliers.map((supplier, index) => (
                    <div key={index} className="text-sm text-gray-700">{supplier}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="border-t px-3 py-2 bg-gray-50 flex justify-between">
          <button onClick={onClose} className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">
            Close
          </button>
          <div className="flex gap-3">
            {onEdit && rfq.status === 'draft' && (
              <button onClick={onEdit} className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors flex items-center gap-2">
                <Edit className="w-4 h-4" />
                Edit
              </button>
            )}
            {onSend && (rfq.status === 'draft' || rfq.status === 'published') && (
              <button onClick={onSend} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2">
                <Send className="w-4 h-4" />
                Send to Suppliers
              </button>
            )}
            {onCancel && rfq.status !== 'awarded' && rfq.status !== 'cancelled' && (
              <button onClick={onCancel} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2">
                <XCircle className="w-4 h-4" />
                Cancel {rfq.type}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ==================== SEND RFQ TO SUPPLIERS MODAL ====================

interface SendRFQToSuppliersModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  rfq: RFQData | null
}

export const SendRFQToSuppliersModal: React.FC<SendRFQToSuppliersModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  rfq
}) => {
  const [formData, setFormData] = useState({
    sendEmail: true,
    sendPortalNotification: true,
    emailSubject: '',
    emailMessage: '',
    includeAttachments: true,
    requestReadConfirmation: true,
    setReminders: true,
    reminderDays: 3
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  React.useEffect(() => {
    if (rfq) {
      setFormData(prev => ({
        ...prev,
        emailSubject: `${rfq.type}: ${rfq.title}`,
        emailMessage: `Dear Supplier,\n\nYou are invited to submit a bid for the following ${rfq.type}:\n\nTitle: ${rfq.title}\nCategory: ${rfq.category}\nResponse Deadline: ${rfq.responseDeadline}\n\nPlease review the attached documents and submit your response through our supplier portal.\n\nBest regards,\n${rfq.owner}`
      }))
    }
  }, [rfq])

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.emailSubject) newErrors.emailSubject = 'Email subject is required'
    if (!formData.emailMessage) newErrors.emailMessage = 'Email message is required'

    setErrors(newErrors)
    if (Object.keys(newErrors).length === 0) {
      onSubmit(formData)
    }
  }

  if (!isOpen || !rfq) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-3 py-2 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Send className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">Send {rfq.type} to Suppliers</h2>
              <p className="text-sm opacity-90">{rfq.rfqNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="font-semibold text-blue-900">Recipients</p>
            <p className="text-sm text-blue-700 mt-1">
              {rfq.openToAll ? 'All qualified suppliers in the portal' : `${rfq.invitedSuppliers.length} invited suppliers`}
            </p>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.sendEmail}
                onChange={(e) => setFormData({ ...formData, sendEmail: e.target.checked })}
                className="text-blue-500 focus:ring-blue-500 rounded"
              />
              <span className="text-sm text-gray-700">Send email notification</span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.sendPortalNotification}
                onChange={(e) => setFormData({ ...formData, sendPortalNotification: e.target.checked })}
                className="text-blue-500 focus:ring-blue-500 rounded"
              />
              <span className="text-sm text-gray-700">Send supplier portal notification</span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.includeAttachments}
                onChange={(e) => setFormData({ ...formData, includeAttachments: e.target.checked })}
                className="text-blue-500 focus:ring-blue-500 rounded"
              />
              <span className="text-sm text-gray-700">Include all attachments and documents</span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.requestReadConfirmation}
                onChange={(e) => setFormData({ ...formData, requestReadConfirmation: e.target.checked })}
                className="text-blue-500 focus:ring-blue-500 rounded"
              />
              <span className="text-sm text-gray-700">Request read confirmation</span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.setReminders}
                onChange={(e) => setFormData({ ...formData, setReminders: e.target.checked })}
                className="text-blue-500 focus:ring-blue-500 rounded"
              />
              <span className="text-sm text-gray-700">Set automatic reminders</span>
            </label>
          </div>

          {formData.setReminders && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Send reminder (days before deadline)</label>
              <input
                type="number"
                value={formData.reminderDays}
                onChange={(e) => setFormData({ ...formData, reminderDays: parseInt(e.target.value) || 3 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                min="1"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Subject *</label>
            <input
              type="text"
              value={formData.emailSubject}
              onChange={(e) => setFormData({ ...formData, emailSubject: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.emailSubject ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.emailSubject && <p className="text-red-500 text-xs mt-1">{errors.emailSubject}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Message *</label>
            <textarea
              value={formData.emailMessage}
              onChange={(e) => setFormData({ ...formData, emailMessage: e.target.value })}
              rows={8}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.emailMessage ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.emailMessage && <p className="text-red-500 text-xs mt-1">{errors.emailMessage}</p>}
          </div>
        </div>

        <div className="border-t px-3 py-2 bg-gray-50 flex justify-between">
          <button onClick={onClose} className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            Send to Suppliers
          </button>
        </div>
      </div>
    </div>
  )
}

// ==================== COMPARE BIDS MODAL ====================

interface CompareBidsModalProps {
  isOpen: boolean
  onClose: () => void
  rfq: RFQData | null
  bids: BidResponse[]
}

export const CompareBidsModal: React.FC<CompareBidsModalProps> = ({
  isOpen,
  onClose,
  rfq,
  bids
}) => {
  const [selectedBids, setSelectedBids] = useState<string[]>([])

  const toggleBidSelection = (bidId: string) => {
    if (selectedBids.includes(bidId)) {
      setSelectedBids(selectedBids.filter(id => id !== bidId))
    } else if (selectedBids.length < 4) {
      setSelectedBids([...selectedBids, bidId])
    }
  }

  if (!isOpen || !rfq) return null

  const selectedBidData = bids.filter(bid => selectedBids.includes(bid.id))

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-lg shadow-xl w-full  max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-3 py-2 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <GitCompare className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">Compare Bids</h2>
              <p className="text-sm opacity-90">{rfq.rfqNumber} - {selectedBids.length} selected</p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {selectedBids.length === 0 && (
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-3 mb-2">
              <p className="text-teal-900 font-semibold">Select bids to compare</p>
              <p className="text-sm text-teal-700 mt-1">Choose up to 4 bids for side-by-side comparison</p>
            </div>
          )}

          {selectedBids.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">Criteria</th>
                    {selectedBidData.map(bid => (
                      <th key={bid.id} className="border border-gray-300 px-3 py-2 text-center text-sm font-semibold">
                        {bid.supplier}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-3 py-2 font-semibold bg-gray-50">Total Amount</td>
                    {selectedBidData.map(bid => (
                      <td key={bid.id} className="border border-gray-300 px-3 py-2 text-center">
                        ${(bid.totalAmount / 1000).toFixed(0)}K
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-3 py-2 font-semibold bg-gray-50">Lead Time</td>
                    {selectedBidData.map(bid => (
                      <td key={bid.id} className="border border-gray-300 px-3 py-2 text-center">
                        {bid.leadTime}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-3 py-2 font-semibold bg-gray-50">Technical Score</td>
                    {selectedBidData.map(bid => (
                      <td key={bid.id} className="border border-gray-300 px-3 py-2 text-center">
                        <span className={`font-semibold ${
                          bid.technicalScore >= 90 ? 'text-green-600' :
                          bid.technicalScore >= 75 ? 'text-blue-600' :
                          'text-yellow-600'
                        }`}>
                          {bid.technicalScore}/100
                        </span>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-3 py-2 font-semibold bg-gray-50">Commercial Score</td>
                    {selectedBidData.map(bid => (
                      <td key={bid.id} className="border border-gray-300 px-3 py-2 text-center">
                        <span className={`font-semibold ${
                          bid.commercialScore >= 90 ? 'text-green-600' :
                          bid.commercialScore >= 75 ? 'text-blue-600' :
                          'text-yellow-600'
                        }`}>
                          {bid.commercialScore}/100
                        </span>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-3 py-2 font-semibold bg-gray-50">Overall Score</td>
                    {selectedBidData.map(bid => (
                      <td key={bid.id} className="border border-gray-300 px-3 py-2 text-center">
                        <span className={`text-lg font-bold ${
                          bid.score >= 85 ? 'text-green-600' :
                          bid.score >= 75 ? 'text-blue-600' :
                          'text-yellow-600'
                        }`}>
                          {bid.score}/100
                        </span>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-3 py-2 font-semibold bg-gray-50">Compliance</td>
                    {selectedBidData.map(bid => (
                      <td key={bid.id} className="border border-gray-300 px-3 py-2 text-center">
                        {bid.compliance}%
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-3 py-2 font-semibold bg-gray-50">Status</td>
                    {selectedBidData.map(bid => (
                      <td key={bid.id} className="border border-gray-300 px-3 py-2 text-center">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          bid.status === 'awarded' ? 'bg-purple-100 text-purple-700' :
                          bid.status === 'shortlisted' ? 'bg-green-100 text-green-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {bid.status.toUpperCase().replace('_', ' ')}
                        </span>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-700 mb-3">Available Bids</h4>
              {bids.map(bid => (
                <div
                  key={bid.id}
                  onClick={() => toggleBidSelection(bid.id)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedBids.includes(bid.id)
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-gray-900">{bid.supplier}</p>
                      <p className="text-sm text-gray-500">Score: {bid.score}/100 • ${(bid.totalAmount / 1000).toFixed(0)}K</p>
                    </div>
                    {selectedBids.includes(bid.id) && (
                      <CheckCircle className="w-6 h-6 text-teal-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t px-3 py-2 bg-gray-50 flex justify-between">
          <button onClick={onClose} className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">
            Close
          </button>
          <button
            onClick={() =>
              exportToCsv(
                `bid-comparison-${rfq.rfqNumber}`,
                selectedBidData.map(bid => ({
                  supplier: bid.supplier,
                  supplierCode: bid.supplierCode,
                  totalAmount: bid.totalAmount,
                  leadTime: bid.leadTime,
                  technicalScore: bid.technicalScore,
                  commercialScore: bid.commercialScore,
                  overallScore: bid.score,
                  compliance: bid.compliance,
                  status: bid.status,
                })),
                [
                  { key: 'supplier', label: 'Supplier' },
                  { key: 'supplierCode', label: 'Supplier Code' },
                  { key: 'totalAmount', label: 'Total Amount' },
                  { key: 'leadTime', label: 'Lead Time' },
                  { key: 'technicalScore', label: 'Technical Score' },
                  { key: 'commercialScore', label: 'Commercial Score' },
                  { key: 'overallScore', label: 'Overall Score' },
                  { key: 'compliance', label: 'Compliance %' },
                  { key: 'status', label: 'Status' },
                ],
              )
            }
            className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
            disabled={selectedBids.length === 0}
          >
            <Download className="w-4 h-4" />
            Export Comparison
          </button>
        </div>
      </div>
    </div>
  )
}

// ==================== AWARD BID MODAL ====================

interface AwardBidModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  bid: BidResponse | null
  rfq: RFQData | null
}

export const AwardBidModal: React.FC<AwardBidModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  bid,
  rfq
}) => {
  const [formData, setFormData] = useState({
    awardDate: new Date().toISOString().split('T')[0],
    awardValue: bid?.totalAmount || 0,
    awardJustification: '',
    createPO: true,
    notifyWinner: true,
    notifyOthers: true,
    poNumber: `PO-${Date.now()}`,
    contractRequired: false,
    approvalRequired: true,
    approver: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  React.useEffect(() => {
    if (bid) {
      setFormData(prev => ({ ...prev, awardValue: bid.totalAmount }))
    }
  }, [bid])

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.awardJustification) newErrors.awardJustification = 'Award justification is required'

    setErrors(newErrors)
    if (Object.keys(newErrors).length === 0) {
      onSubmit(formData)
    }
  }

  if (!isOpen || !bid || !rfq) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-2 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Award className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">Award {rfq.type}</h2>
              <p className="text-sm opacity-90">{rfq.rfqNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <p className="font-semibold text-purple-900">Winning Supplier</p>
            <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
              <div>
                <p className="text-purple-700">Supplier:</p>
                <p className="font-semibold text-gray-900">{bid.supplier}</p>
              </div>
              <div>
                <p className="text-purple-700">Total Amount:</p>
                <p className="font-semibold text-gray-900">${(bid.totalAmount / 1000).toFixed(0)}K</p>
              </div>
              <div>
                <p className="text-purple-700">Overall Score:</p>
                <p className="font-semibold text-green-600">{bid.score}/100</p>
              </div>
              <div>
                <p className="text-purple-700">Lead Time:</p>
                <p className="font-semibold text-gray-900">{bid.leadTime}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Award Date</label>
              <input
                type="date"
                value={formData.awardDate}
                onChange={(e) => setFormData({ ...formData, awardDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Award Value</label>
              <input
                type="number"
                value={formData.awardValue}
                onChange={(e) => setFormData({ ...formData, awardValue: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Award Justification *</label>
            <textarea
              value={formData.awardJustification}
              onChange={(e) => setFormData({ ...formData, awardJustification: e.target.value })}
              rows={5}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 ${
                errors.awardJustification ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Provide detailed justification for awarding to this supplier..."
            />
            {errors.awardJustification && <p className="text-red-500 text-xs mt-1">{errors.awardJustification}</p>}
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.createPO}
                onChange={(e) => setFormData({ ...formData, createPO: e.target.checked })}
                className="text-purple-500 focus:ring-purple-500 rounded"
              />
              <span className="text-sm text-gray-700">Create Purchase Order automatically</span>
            </label>

            {formData.createPO && (
              <div className="ml-8">
                <label className="block text-sm font-medium text-gray-700 mb-1">PO Number</label>
                <input
                  type="text"
                  value={formData.poNumber}
                  onChange={(e) => setFormData({ ...formData, poNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            )}

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.contractRequired}
                onChange={(e) => setFormData({ ...formData, contractRequired: e.target.checked })}
                className="text-purple-500 focus:ring-purple-500 rounded"
              />
              <span className="text-sm text-gray-700">Contract execution required</span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.notifyWinner}
                onChange={(e) => setFormData({ ...formData, notifyWinner: e.target.checked })}
                className="text-purple-500 focus:ring-purple-500 rounded"
              />
              <span className="text-sm text-gray-700">Notify winning supplier</span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.notifyOthers}
                onChange={(e) => setFormData({ ...formData, notifyOthers: e.target.checked })}
                className="text-purple-500 focus:ring-purple-500 rounded"
              />
              <span className="text-sm text-gray-700">Send regret letters to unsuccessful bidders</span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.approvalRequired}
                onChange={(e) => setFormData({ ...formData, approvalRequired: e.target.checked })}
                className="text-purple-500 focus:ring-purple-500 rounded"
              />
              <span className="text-sm text-gray-700">Requires approval before award</span>
            </label>

            {formData.approvalRequired && (
              <div className="ml-8">
                <label className="block text-sm font-medium text-gray-700 mb-1">Approver</label>
                <input
                  type="text"
                  value={formData.approver}
                  onChange={(e) => setFormData({ ...formData, approver: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter approver name"
                />
              </div>
            )}
          </div>
        </div>

        <div className="border-t px-3 py-2 bg-gray-50 flex justify-between">
          <button onClick={onClose} className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Award className="w-4 h-4" />
            Award {rfq.type}
          </button>
        </div>
      </div>
    </div>
  )
}

// ==================== EXPORT RFQ MODAL ====================

interface ExportRFQModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
}

export const ExportRFQModal: React.FC<ExportRFQModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [formData, setFormData] = useState({
    format: 'excel',
    includeItems: true,
    includeBids: true,
    includeEvaluation: true,
    includeDocuments: false,
    dateRange: 'all',
    startDate: '',
    endDate: '',
    status: 'all',
    category: 'all'
  })

  const handleSubmit = () => {
    onSubmit(formData)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-2 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Download className="w-6 h-6" />
            <h2 className="text-xl font-bold">Export RFQ/RFP Data</h2>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Export Format</label>
            <div className="grid grid-cols-3 gap-3">
              {['excel', 'pdf', 'csv'].map(format => (
                <button
                  key={format}
                  onClick={() => setFormData({ ...formData, format })}
                  className={`px-4 py-3 border-2 rounded-lg font-medium transition-all ${
                    formData.format === format
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                >
                  {format.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Include in Export</label>
            <div className="space-y-2">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.includeItems}
                  onChange={(e) => setFormData({ ...formData, includeItems: e.target.checked })}
                  className="text-green-500 focus:ring-green-500 rounded"
                />
                <span className="text-sm text-gray-700">Item details and specifications</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.includeBids}
                  onChange={(e) => setFormData({ ...formData, includeBids: e.target.checked })}
                  className="text-green-500 focus:ring-green-500 rounded"
                />
                <span className="text-sm text-gray-700">Bid responses and pricing</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.includeEvaluation}
                  onChange={(e) => setFormData({ ...formData, includeEvaluation: e.target.checked })}
                  className="text-green-500 focus:ring-green-500 rounded"
                />
                <span className="text-sm text-gray-700">Evaluation scores and comments</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.includeDocuments}
                  onChange={(e) => setFormData({ ...formData, includeDocuments: e.target.checked })}
                  className="text-green-500 focus:ring-green-500 rounded"
                />
                <span className="text-sm text-gray-700">Attached documents (PDF only)</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
              <select
                value={formData.dateRange}
                onChange={(e) => setFormData({ ...formData, dateRange: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Time</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="bidding">Bidding</option>
                <option value="evaluation">Evaluation</option>
                <option value="awarded">Awarded</option>
              </select>
            </div>
          </div>
        </div>

        <div className="border-t px-3 py-2 bg-gray-50 flex justify-between">
          <button onClick={onClose} className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export Data
          </button>
        </div>
      </div>
    </div>
  )
}
