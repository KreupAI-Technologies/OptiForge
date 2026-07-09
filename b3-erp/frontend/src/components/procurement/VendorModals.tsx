"use client"

import React, { useState } from 'react'
import { X, Plus, Building2, Mail, Phone, MapPin, Star, CheckCircle, XCircle, AlertTriangle, Award, TrendingUp, BarChart3, FileText, Upload, Download, Edit, Eye, Ban, Calendar, TrendingDown } from 'lucide-react'

// ==================== INTERFACES ====================

export interface VendorData {
  vendorCode: string
  vendorName: string
  contactPerson: string
  email: string
  phone: string
  alternatePhone?: string
  website?: string
  category: string
  taxId: string
  registrationNumber: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  paymentTerms: string
  currency: string
  creditLimit?: number
  bankName?: string
  accountNumber?: string
  ifscCode?: string
  rating: number
  status: 'active' | 'inactive' | 'blacklisted' | 'pending_approval'
  tags?: string[]
  certifications?: string[]
  notes?: string
  registeredDate: string
}

export interface VendorPerformanceData {
  vendorId: string
  vendorName: string
  evaluationPeriod: string
  onTimeDelivery: number
  qualityScore: number
  responseTime: number
  priceCompetitiveness: number
  communication: number
  compliance: number
  overallRating: number
  strengths: string[]
  weaknesses: string[]
  recommendations: string
  evaluatedBy: string
  evaluationDate: string
}

export interface BlockVendorData {
  vendorId: string
  reason: string
  detailedComments: string
  blockType: 'temporary' | 'permanent'
  blockUntil?: string
  notifyVendor: boolean
}

// ==================== ADD/CREATE VENDOR MODAL ====================

interface AddVendorModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: VendorData) => void
}

export const AddVendorModal: React.FC<AddVendorModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<VendorData>({
    vendorCode: `VND-${Date.now()}`,
    vendorName: '',
    contactPerson: '',
    email: '',
    phone: '',
    category: '',
    taxId: '',
    registrationNumber: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    paymentTerms: 'Net 30',
    currency: 'INR',
    rating: 0,
    status: 'pending_approval',
    registeredDate: new Date().toISOString().split('T')[0]
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    if (step === 1) {
      if (!formData.vendorName) newErrors.vendorName = 'Vendor name is required'
      if (!formData.contactPerson) newErrors.contactPerson = 'Contact person is required'
      if (!formData.email) newErrors.email = 'Email is required'
      if (!formData.phone) newErrors.phone = 'Phone is required'
      if (!formData.category) newErrors.category = 'Category is required'
    } else if (step === 2) {
      if (!formData.address) newErrors.address = 'Address is required'
      if (!formData.city) newErrors.city = 'City is required'
      if (!formData.state) newErrors.state = 'State is required'
    } else if (step === 3) {
      if (!formData.taxId) newErrors.taxId = 'Tax ID is required'
      if (!formData.paymentTerms) newErrors.paymentTerms = 'Payment terms are required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1)
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
        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-3 py-2 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Plus className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">Add New Vendor</h2>
              <p className="text-sm opacity-90">{formData.vendorCode}</p>
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
            <span className="font-medium">Address</span>
          </div>
          <div className="w-12 h-0.5 bg-gray-300"></div>
          <div className={`flex items-center gap-2 ${currentStep >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>3</div>
            <span className="font-medium">Financial Details</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Name *</label>
                  <input
                    type="text"
                    value={formData.vendorName}
                    onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.vendorName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter vendor company name"
                  />
                  {errors.vendorName && <p className="text-red-500 text-xs mt-1">{errors.vendorName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Code</label>
                  <input
                    type="text"
                    value={formData.vendorCode}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person *</label>
                  <input
                    type="text"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.contactPerson ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Primary contact name"
                  />
                  {errors.contactPerson && <p className="text-red-500 text-xs mt-1">{errors.contactPerson}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.category ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Category</option>
                    <option value="Raw Material">Raw Material</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Packaging">Packaging</option>
                    <option value="Machinery">Machinery</option>
                    <option value="Chemicals">Chemicals</option>
                    <option value="Logistics">Logistics</option>
                    <option value="Services">Services</option>
                    <option value="IT & Software">IT & Software</option>
                  </select>
                  {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="vendor@example.com"
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="+91 XXXXX XXXXX"
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alternate Phone</label>
                  <input
                    type="tel"
                    value={formData.alternatePhone || ''}
                    onChange={(e) => setFormData({ ...formData, alternatePhone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                  <input
                    type="url"
                    value={formData.website || ''}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://www.vendor.com"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Address */}
          {currentStep === 2 && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={2}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.address ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Street address"
                  />
                  {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.city ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="City"
                  />
                  {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.state ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="State/Province"
                  />
                  {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                  <input
                    type="text"
                    value={formData.zipCode}
                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Postal code"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <select
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="India">India</option>
                    <option value="USA">USA</option>
                    <option value="UK">UK</option>
                    <option value="China">China</option>
                    <option value="Germany">Germany</option>
                    <option value="Japan">Japan</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Financial Details */}
          {currentStep === 3 && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tax ID / GST Number *</label>
                  <input
                    type="text"
                    value={formData.taxId}
                    onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.taxId ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="GST/TAX ID"
                  />
                  {errors.taxId && <p className="text-red-500 text-xs mt-1">{errors.taxId}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Registration Number</label>
                  <input
                    type="text"
                    value={formData.registrationNumber}
                    onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Company registration number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms *</label>
                  <select
                    value={formData.paymentTerms}
                    onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.paymentTerms ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="Immediate">Immediate</option>
                    <option value="Net 15">Net 15</option>
                    <option value="Net 30">Net 30</option>
                    <option value="Net 45">Net 45</option>
                    <option value="Net 60">Net 60</option>
                    <option value="Net 90">Net 90</option>
                  </select>
                  {errors.paymentTerms && <p className="text-red-500 text-xs mt-1">{errors.paymentTerms}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="INR">INR</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="CNY">CNY</option>
                    <option value="JPY">JPY</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Credit Limit</label>
                  <input
                    type="number"
                    value={formData.creditLimit || ''}
                    onChange={(e) => setFormData({ ...formData, creditLimit: parseFloat(e.target.value) || undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                  <input
                    type="text"
                    value={formData.bankName || ''}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Bank name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                  <input
                    type="text"
                    value={formData.accountNumber || ''}
                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Account number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code</label>
                  <input
                    type="text"
                    value={formData.ifscCode || ''}
                    onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="IFSC/SWIFT code"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Additional notes about the vendor..."
                />
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
                onClick={handlePrevious}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Previous
              </button>
            )}
            {currentStep < 3 ? (
              <button
                onClick={handleNext}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all"
              >
                Add Vendor
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ==================== VIEW VENDOR DETAILS MODAL ====================

interface ViewVendorDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  vendor: VendorData | null
  onEdit?: () => void
  onEvaluate?: () => void
  onBlock?: () => void
}

export const ViewVendorDetailsModal: React.FC<ViewVendorDetailsModalProps> = ({
  isOpen,
  onClose,
  vendor,
  onEdit,
  onEvaluate,
  onBlock
}) => {
  if (!isOpen || !vendor) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700'
      case 'inactive': return 'bg-gray-100 text-gray-700'
      case 'blacklisted': return 'bg-red-100 text-red-700'
      case 'pending_approval': return 'bg-yellow-100 text-yellow-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-lg shadow-xl w-full  max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-3 py-2 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Eye className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">Vendor Details</h2>
              <p className="text-sm opacity-90">{vendor.vendorCode}</p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3">
          {/* Status Badge */}
          <div className="mb-3">
            <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(vendor.status)}`}>
              {vendor.status.toUpperCase().replace('_', ' ')}
            </span>
          </div>

          {/* Vendor Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <Building2 className="w-4 h-4" />
                <p className="text-sm font-medium">Vendor Name</p>
              </div>
              <p className="text-lg font-bold text-gray-900">{vendor.vendorName}</p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <Award className="w-4 h-4" />
                <p className="text-sm font-medium">Category</p>
              </div>
              <p className="text-lg font-bold text-gray-900">{vendor.category}</p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <Star className="w-4 h-4" />
                <p className="text-sm font-medium">Rating</p>
              </div>
              <p className="text-lg font-bold text-gray-900">{vendor.rating.toFixed(1)} / 5.0</p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="mb-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Mail className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-semibold text-gray-900">{vendor.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Phone className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-semibold text-gray-900">{vendor.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Building2 className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600">Contact Person</p>
                  <p className="font-semibold text-gray-900">{vendor.contactPerson}</p>
                </div>
              </div>
              {vendor.website && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <FileText className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600">Website</p>
                    <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-600 hover:underline">
                      {vendor.website}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Address */}
          <div className="mb-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Address</h3>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <MapPin className="w-5 h-5 text-gray-600 mt-0.5" />
              <div>
                <p className="text-gray-900">{vendor.address}</p>
                <p className="text-gray-900">{vendor.city}, {vendor.state} {vendor.zipCode}</p>
                <p className="text-gray-900">{vendor.country}</p>
              </div>
            </div>
          </div>

          {/* Financial Information */}
          <div className="mb-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Financial Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <p className="text-sm text-gray-600">Tax ID / GST</p>
                <p className="font-semibold text-gray-900">{vendor.taxId}</p>
              </div>
              {vendor.registrationNumber && (
                <div>
                  <p className="text-sm text-gray-600">Registration Number</p>
                  <p className="font-semibold text-gray-900">{vendor.registrationNumber}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600">Payment Terms</p>
                <p className="font-semibold text-gray-900">{vendor.paymentTerms}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Currency</p>
                <p className="font-semibold text-gray-900">{vendor.currency}</p>
              </div>
              {vendor.creditLimit && (
                <div>
                  <p className="text-sm text-gray-600">Credit Limit</p>
                  <p className="font-semibold text-gray-900">{vendor.currency} {vendor.creditLimit.toLocaleString()}</p>
                </div>
              )}
              {vendor.bankName && (
                <div>
                  <p className="text-sm text-gray-600">Bank Details</p>
                  <p className="font-semibold text-gray-900">{vendor.bankName}</p>
                  {vendor.accountNumber && <p className="text-sm text-gray-600">A/C: {vendor.accountNumber}</p>}
                </div>
              )}
            </div>
          </div>

          {/* Tags & Certifications */}
          {(vendor.tags && vendor.tags.length > 0) || (vendor.certifications && vendor.certifications.length > 0) ? (
            <div className="mb-3">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Tags & Certifications</h3>
              <div className="space-y-3">
                {vendor.tags && vendor.tags.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {vendor.tags.map((tag, index) => (
                        <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {vendor.certifications && vendor.certifications.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Certifications</p>
                    <div className="flex flex-wrap gap-2">
                      {vendor.certifications.map((cert, index) => (
                        <span key={index} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center gap-1">
                          <Award className="w-3 h-3" />
                          {cert}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : null}

          {/* Notes */}
          {vendor.notes && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Notes</h3>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-gray-700">{vendor.notes}</p>
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
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
            )}
            {onEvaluate && (
              <button
                onClick={onEvaluate}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                Evaluate Performance
              </button>
            )}
            {onBlock && vendor.status === 'active' && (
              <button
                onClick={onBlock}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
              >
                <Ban className="w-4 h-4" />
                Block Vendor
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ==================== EVALUATE VENDOR PERFORMANCE MODAL ====================

interface EvaluateVendorPerformanceModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: VendorPerformanceData) => void
  vendor: VendorData | null
}

export const EvaluateVendorPerformanceModal: React.FC<EvaluateVendorPerformanceModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  vendor
}) => {
  const [formData, setFormData] = useState<VendorPerformanceData>({
    vendorId: vendor?.vendorCode || '',
    vendorName: vendor?.vendorName || '',
    evaluationPeriod: '',
    onTimeDelivery: 0,
    qualityScore: 0,
    responseTime: 0,
    priceCompetitiveness: 0,
    communication: 0,
    compliance: 0,
    overallRating: 0,
    strengths: [],
    weaknesses: [],
    recommendations: '',
    evaluatedBy: 'Current User',
    evaluationDate: new Date().toISOString().split('T')[0]
  })

  const [strengthText, setStrengthText] = useState('')
  const [weaknessText, setWeaknessText] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const addStrength = () => {
    if (strengthText.trim()) {
      setFormData({ ...formData, strengths: [...formData.strengths, strengthText] })
      setStrengthText('')
    }
  }

  const removeStrength = (index: number) => {
    setFormData({ ...formData, strengths: formData.strengths.filter((_, i) => i !== index) })
  }

  const addWeakness = () => {
    if (weaknessText.trim()) {
      setFormData({ ...formData, weaknesses: [...formData.weaknesses, weaknessText] })
      setWeaknessText('')
    }
  }

  const removeWeakness = (index: number) => {
    setFormData({ ...formData, weaknesses: formData.weaknesses.filter((_, i) => i !== index) })
  }

  const calculateOverallRating = () => {
    const avg = (
      formData.onTimeDelivery +
      formData.qualityScore +
      formData.responseTime +
      formData.priceCompetitiveness +
      formData.communication +
      formData.compliance
    ) / 6
    setFormData({ ...formData, overallRating: avg })
  }

  React.useEffect(() => {
    calculateOverallRating()
  }, [
    formData.onTimeDelivery,
    formData.qualityScore,
    formData.responseTime,
    formData.priceCompetitiveness,
    formData.communication,
    formData.compliance
  ])

  const handleSubmit = () => {
    if (!formData.evaluationPeriod) {
      setErrors({ period: 'Evaluation period is required' })
      return
    }
    onSubmit(formData)
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 75) return 'text-blue-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (!isOpen || !vendor) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-lg shadow-xl w-full  max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-2 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">Evaluate Vendor Performance</h2>
              <p className="text-sm opacity-90">{vendor.vendorName}</p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {/* Evaluation Period */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Evaluation Period *</label>
            <select
              value={formData.evaluationPeriod}
              onChange={(e) => setFormData({ ...formData, evaluationPeriod: e.target.value })}
              className={`w-full max-w-md px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                errors.period ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select Period</option>
              <option value="Q1 2025">Q1 2025</option>
              <option value="Q2 2025">Q2 2025</option>
              <option value="Q3 2025">Q3 2025</option>
              <option value="Q4 2025">Q4 2025</option>
              <option value="2025">Year 2025</option>
              <option value="Last 6 Months">Last 6 Months</option>
              <option value="Last 12 Months">Last 12 Months</option>
            </select>
            {errors.period && <p className="text-red-500 text-xs mt-1">{errors.period}</p>}
          </div>

          {/* Performance Metrics */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Performance Metrics (0-100)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* On-Time Delivery */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">On-Time Delivery</label>
                  <span className={`text-2xl font-bold ${getScoreColor(formData.onTimeDelivery)}`}>
                    {formData.onTimeDelivery}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.onTimeDelivery}
                  onChange={(e) => setFormData({ ...formData, onTimeDelivery: parseInt(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0</span>
                  <span>50</span>
                  <span>100</span>
                </div>
              </div>

              {/* Quality Score */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">Quality Score</label>
                  <span className={`text-2xl font-bold ${getScoreColor(formData.qualityScore)}`}>
                    {formData.qualityScore}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.qualityScore}
                  onChange={(e) => setFormData({ ...formData, qualityScore: parseInt(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0</span>
                  <span>50</span>
                  <span>100</span>
                </div>
              </div>

              {/* Response Time */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">Response Time</label>
                  <span className={`text-2xl font-bold ${getScoreColor(formData.responseTime)}`}>
                    {formData.responseTime}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.responseTime}
                  onChange={(e) => setFormData({ ...formData, responseTime: parseInt(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0</span>
                  <span>50</span>
                  <span>100</span>
                </div>
              </div>

              {/* Price Competitiveness */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">Price Competitiveness</label>
                  <span className={`text-2xl font-bold ${getScoreColor(formData.priceCompetitiveness)}`}>
                    {formData.priceCompetitiveness}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.priceCompetitiveness}
                  onChange={(e) => setFormData({ ...formData, priceCompetitiveness: parseInt(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0</span>
                  <span>50</span>
                  <span>100</span>
                </div>
              </div>

              {/* Communication */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">Communication</label>
                  <span className={`text-2xl font-bold ${getScoreColor(formData.communication)}`}>
                    {formData.communication}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.communication}
                  onChange={(e) => setFormData({ ...formData, communication: parseInt(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0</span>
                  <span>50</span>
                  <span>100</span>
                </div>
              </div>

              {/* Compliance */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">Compliance</label>
                  <span className={`text-2xl font-bold ${getScoreColor(formData.compliance)}`}>
                    {formData.compliance}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.compliance}
                  onChange={(e) => setFormData({ ...formData, compliance: parseInt(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0</span>
                  <span>50</span>
                  <span>100</span>
                </div>
              </div>
            </div>
          </div>

          {/* Overall Rating */}
          <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-3">
            <div className="text-center">
              <p className="text-sm font-medium text-purple-700 mb-2">Overall Performance Rating</p>
              <p className={`text-5xl font-bold ${getScoreColor(formData.overallRating)}`}>
                {formData.overallRating.toFixed(1)}
              </p>
              <p className="text-sm text-purple-600 mt-2">
                {formData.overallRating >= 90 ? 'Excellent' :
                 formData.overallRating >= 75 ? 'Good' :
                 formData.overallRating >= 60 ? 'Average' : 'Needs Improvement'}
              </p>
            </div>
          </div>

          {/* Strengths */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Strengths</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={strengthText}
                onChange={(e) => setStrengthText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addStrength()}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter a strength..."
              />
              <button
                onClick={addStrength}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Add
              </button>
            </div>
            <div className="space-y-2">
              {formData.strengths.map((strength, index) => (
                <div key={index} className="flex items-start gap-2 bg-green-50 border border-green-200 rounded-lg p-3">
                  <TrendingUp className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="flex-1 text-sm text-gray-700">{strength}</span>
                  <button onClick={() => removeStrength(index)} className="text-green-600 hover:text-green-800">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Weaknesses */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Weaknesses / Areas for Improvement</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={weaknessText}
                onChange={(e) => setWeaknessText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addWeakness()}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Enter a weakness..."
              />
              <button
                onClick={addWeakness}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Add
              </button>
            </div>
            <div className="space-y-2">
              {formData.weaknesses.map((weakness, index) => (
                <div key={index} className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
                  <TrendingDown className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <span className="flex-1 text-sm text-gray-700">{weakness}</span>
                  <button onClick={() => removeWeakness(index)} className="text-red-600 hover:text-red-800">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Recommendations</label>
            <textarea
              value={formData.recommendations}
              onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter your recommendations for this vendor..."
            />
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
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Award className="w-4 h-4" />
            Submit Evaluation
          </button>
        </div>
      </div>
    </div>
  )
}

// ==================== BLOCK VENDOR MODAL ====================

interface BlockVendorModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: BlockVendorData) => void
  vendorId: string
  vendorName: string
}

export const BlockVendorModal: React.FC<BlockVendorModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  vendorId,
  vendorName
}) => {
  const [formData, setFormData] = useState<BlockVendorData>({
    vendorId,
    reason: 'quality_issues',
    detailedComments: '',
    blockType: 'temporary',
    notifyVendor: true
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = () => {
    if (!formData.detailedComments.trim()) {
      setErrors({ comments: 'Detailed reason is required' })
      return
    }
    if (formData.blockType === 'temporary' && !formData.blockUntil) {
      setErrors({ blockUntil: 'Block until date is required for temporary blocks' })
      return
    }
    onSubmit(formData)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-rose-500 text-white px-3 py-2 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Ban className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">Block Vendor</h2>
              <p className="text-sm opacity-90">{vendorName}</p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {/* Warning */}
          <div className="bg-red-50 border-l-4 border-red-500 p-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-red-900">Warning: Blocking Vendor</p>
                <p className="text-sm text-red-700 mt-1">
                  Blocking this vendor will prevent any new purchase orders from being created. Existing orders will not be affected.
                </p>
              </div>
            </div>
          </div>

          {/* Block Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Block Type</label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-yellow-50 transition-colors"
                style={{ borderColor: formData.blockType === 'temporary' ? '#f59e0b' : '#e5e7eb' }}
              >
                <input
                  type="radio"
                  checked={formData.blockType === 'temporary'}
                  onChange={() => setFormData({ ...formData, blockType: 'temporary' })}
                  className="text-yellow-500 focus:ring-yellow-500"
                />
                <div>
                  <p className="font-medium">Temporary Block</p>
                  <p className="text-sm text-gray-600">Block for a specific period</p>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-red-50 transition-colors"
                style={{ borderColor: formData.blockType === 'permanent' ? '#ef4444' : '#e5e7eb' }}
              >
                <input
                  type="radio"
                  checked={formData.blockType === 'permanent'}
                  onChange={() => setFormData({ ...formData, blockType: 'permanent' })}
                  className="text-red-500 focus:ring-red-500"
                />
                <div>
                  <p className="font-medium">Permanent Block</p>
                  <p className="text-sm text-gray-600">Blacklist vendor permanently</p>
                </div>
              </label>
            </div>
          </div>

          {/* Block Until Date (only for temporary) */}
          {formData.blockType === 'temporary' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Block Until *</label>
              <input
                type="date"
                value={formData.blockUntil || ''}
                onChange={(e) => setFormData({ ...formData, blockUntil: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                  errors.blockUntil ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.blockUntil && <p className="text-red-500 text-xs mt-1">{errors.blockUntil}</p>}
            </div>
          )}

          {/* Reason Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Blocking</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  checked={formData.reason === 'quality_issues'}
                  onChange={() => setFormData({ ...formData, reason: 'quality_issues' })}
                  className="text-red-500 focus:ring-red-500"
                />
                <span>Quality Issues</span>
              </label>
              <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  checked={formData.reason === 'delivery_delays'}
                  onChange={() => setFormData({ ...formData, reason: 'delivery_delays' })}
                  className="text-red-500 focus:ring-red-500"
                />
                <span>Consistent Delivery Delays</span>
              </label>
              <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  checked={formData.reason === 'pricing_disputes'}
                  onChange={() => setFormData({ ...formData, reason: 'pricing_disputes' })}
                  className="text-red-500 focus:ring-red-500"
                />
                <span>Pricing Disputes</span>
              </label>
              <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  checked={formData.reason === 'fraud'}
                  onChange={() => setFormData({ ...formData, reason: 'fraud' })}
                  className="text-red-500 focus:ring-red-500"
                />
                <span>Fraud or Misrepresentation</span>
              </label>
              <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  checked={formData.reason === 'compliance_violation'}
                  onChange={() => setFormData({ ...formData, reason: 'compliance_violation' })}
                  className="text-red-500 focus:ring-red-500"
                />
                <span>Compliance Violation</span>
              </label>
              <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  checked={formData.reason === 'other'}
                  onChange={() => setFormData({ ...formData, reason: 'other' })}
                  className="text-red-500 focus:ring-red-500"
                />
                <span>Other</span>
              </label>
            </div>
          </div>

          {/* Detailed Comments */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Detailed Reason *
            </label>
            <textarea
              value={formData.detailedComments}
              onChange={(e) => setFormData({ ...formData, detailedComments: e.target.value })}
              rows={4}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                errors.comments ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Provide a detailed explanation for blocking this vendor..."
            />
            {errors.comments && <p className="text-red-500 text-xs mt-1">{errors.comments}</p>}
          </div>

          {/* Notify Vendor */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={formData.notifyVendor}
                onChange={(e) => setFormData({ ...formData, notifyVendor: e.target.checked })}
                className="mt-1 text-red-500 focus:ring-red-500 rounded"
              />
              <div>
                <p className="font-semibold text-gray-900">Notify Vendor</p>
                <p className="text-sm text-gray-600">Send notification email to the vendor about this block</p>
              </div>
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
            className="bg-gradient-to-r from-red-500 to-rose-500 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Ban className="w-4 h-4" />
            {formData.blockType === 'temporary' ? 'Temporarily Block' : 'Permanently Block'} Vendor
          </button>
        </div>
      </div>
    </div>
  )
}

// ==================== EDIT VENDOR MODAL ====================

interface EditVendorModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: VendorData) => void
  vendor: VendorData | null
}

export const EditVendorModal: React.FC<EditVendorModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  vendor
}) => {
  const [formData, setFormData] = useState<VendorData>(
    vendor || {
      vendorCode: '',
      vendorName: '',
      contactPerson: '',
      email: '',
      phone: '',
      category: '',
      taxId: '',
      registrationNumber: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India',
      paymentTerms: 'Net 30',
      currency: 'INR',
      rating: 0,
      status: 'active',
      registeredDate: ''
    }
  )

  const [errors, setErrors] = useState<Record<string, string>>({})

  React.useEffect(() => {
    if (vendor) setFormData(vendor)
  }, [vendor])

  const handleSubmit = () => {
    if (!formData.vendorName) {
      setErrors({ vendorName: 'Vendor name is required' })
      return
    }
    onSubmit(formData)
  }

  if (!isOpen || !vendor) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-lg shadow-xl w-full  max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-3 py-2 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Edit className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">Edit Vendor</h2>
              <p className="text-sm opacity-90">{formData.vendorCode}</p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
              <input
                type="text"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Raw Material">Raw Material</option>
                <option value="Electronics">Electronics</option>
                <option value="Packaging">Packaging</option>
                <option value="Machinery">Machinery</option>
                <option value="Chemicals">Chemicals</option>
                <option value="Logistics">Logistics</option>
                <option value="Services">Services</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending_approval">Pending Approval</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms</label>
              <select
                value={formData.paymentTerms}
                onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Immediate">Immediate</option>
                <option value="Net 15">Net 15</option>
                <option value="Net 30">Net 30</option>
                <option value="Net 45">Net 45</option>
                <option value="Net 60">Net 60</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Credit Limit</label>
              <input
                type="number"
                value={formData.creditLimit || ''}
                onChange={(e) => setFormData({ ...formData, creditLimit: parseFloat(e.target.value) || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
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
            className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Update Vendor
          </button>
        </div>
      </div>
    </div>
  )
}
