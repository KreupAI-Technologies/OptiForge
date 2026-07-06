'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Users, DollarSign, Phone, Mail, AlertCircle, Star, FileText, X } from 'lucide-react'
import { estimationResourceRateService } from '@/services/estimation-resource-rate.service'

const companyId = 'default-company-id'

export default function AddSubcontractorPage() {
  const router = useRouter()

  const [contractorCode, setContractorCode] = useState('')
  const [contractorName, setContractorName] = useState('')
  const [serviceType, setServiceType] = useState('')
  const [specializations, setSpecializations] = useState<string[]>([])
  const [newSpecialization, setNewSpecialization] = useState('')
  const [rateType, setRateType] = useState<'per-hour' | 'per-sqft' | 'per-unit' | 'fixed'>('per-sqft')
  const [rate, setRate] = useState('')
  const [unit, setUnit] = useState('SQ.FT')
  const [contactPerson, setContactPerson] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [minimumOrder, setMinimumOrder] = useState('')
  const [leadTime, setLeadTime] = useState('')
  const [paymentTerms, setPaymentTerms] = useState('')
  const [effectiveFrom, setEffectiveFrom] = useState('')
  const [status, setStatus] = useState<'active' | 'inactive' | 'blacklisted'>('active')
  const [companyAddress, setCompanyAddress] = useState('')
  const [gstNumber, setGstNumber] = useState('')
  const [panNumber, setPanNumber] = useState('')
  const [bankDetails, setBankDetails] = useState('')
  const [insuranceDetails, setInsuranceDetails] = useState('')
  const [notes, setNotes] = useState('')

  const serviceTypes = [
    'Installation',
    'Plumbing',
    'Electrical',
    'Stone Fabrication',
    'Painting & Finishing',
    'Glass Work',
    'Demolition',
    'Tiling',
    'HVAC',
    'Carpentry',
    'Masonry',
    'Waterproofing',
    'Other'
  ]

  const paymentTermsList = [
    'COD',
    'Net 7',
    'Net 10',
    'Net 15',
    'Net 30',
    '50% Advance, 50% on completion',
    '40% Advance, 60% on completion',
    '60% Advance, 40% on completion',
    '30-60-10 (30% Advance, 60% on Progress, 10% on Completion)',
    'Custom'
  ]

  const handleBack = () => {
    router.push('/estimation/rates/subcontractors')
  }

  const handleAddSpecialization = () => {
    if (newSpecialization.trim() && !specializations.includes(newSpecialization.trim())) {
      setSpecializations([...specializations, newSpecialization.trim()])
      setNewSpecialization('')
    }
  }

  const handleRemoveSpecialization = (spec: string) => {
    setSpecializations(specializations.filter(s => s !== spec))
  }

  const getUnitForRateType = (type: string) => {
    switch (type) {
      case 'per-hour':
        return 'HOUR'
      case 'per-sqft':
        return 'SQ.FT'
      case 'per-unit':
        return 'UNIT'
      case 'fixed':
        return 'PROJECT'
      default:
        return 'SQ.FT'
    }
  }

  const handleRateTypeChange = (newRateType: 'per-hour' | 'per-sqft' | 'per-unit' | 'fixed') => {
    setRateType(newRateType)
    setUnit(getUnitForRateType(newRateType))
  }

  const handleSave = async () => {
    // Validation
    if (!contractorCode.trim()) {
      alert('Please enter contractor code')
      return
    }
    if (!contractorName.trim()) {
      alert('Please enter contractor name')
      return
    }
    if (!serviceType) {
      alert('Please select a service type')
      return
    }
    if (specializations.length === 0) {
      alert('Please add at least one specialization')
      return
    }
    if (!rate || parseFloat(rate) <= 0) {
      alert('Please enter a valid rate')
      return
    }
    if (!contactPerson.trim()) {
      alert('Please enter contact person name')
      return
    }
    if (!phone.trim()) {
      alert('Please enter phone number')
      return
    }
    if (!email.trim()) {
      alert('Please enter email address')
      return
    }
    if (!effectiveFrom) {
      alert('Please select effective from date')
      return
    }

    try {
      await estimationResourceRateService.createResourceRate(companyId, {
        rateType: 'Subcontractor',
        code: contractorCode,
        name: contractorName,
        category: serviceType,
        unit,
        currency: 'INR',
        standardRate: parseFloat(rate),
        isActive: status === 'active',
        effectiveFrom: effectiveFrom || undefined,
        supplierName: contractorName,
        // Subcontractor-specific extras spread onto the payload
        serviceType,
        specialization: specializations,
        subcontractorRateType: rateType,
        contactPerson,
        phone,
        email,
        minimumOrder: parseFloat(minimumOrder) || 0,
        leadTime: parseInt(leadTime) || 0,
        paymentTerms,
        status,
        companyAddress,
        gstNumber,
        panNumber,
        bankDetails,
        insuranceDetails,
        notes,
      } as any)
      router.push('/estimation/rates/subcontractors')
    } catch (error) {
      console.error('Failed to create subcontractor:', error)
      alert('Failed to save subcontractor. Please try again.')
    }
  }

  return (
    <div className="w-full h-full flex flex-col bg-gray-50">
      <div className="flex-none bg-white border-b border-gray-200 px-3 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Add Subcontractor</h1>
              <p className="text-sm text-gray-500 mt-1">Register new subcontractor and service rates</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Subcontractor
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-3">
        <div className="space-y-3">
          {/* Info Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-1">Important Note</p>
              <p>Subcontractor information is used for vendor management and project costing. Ensure all contact details, rates, and payment terms are accurate. Verify credentials before approving for projects.</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {/* Left Column - Main Information */}
            <div className="col-span-2 space-y-3">
              {/* Basic Information */}
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Basic Information
                </h2>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contractor Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={contractorCode}
                      onChange={(e) => setContractorCode(e.target.value.toUpperCase())}
                      placeholder="e.g., SUB-INST-001"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Unique identifier</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Service Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={serviceType}
                      onChange={(e) => setServiceType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Service Type</option>
                      {serviceTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contractor Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={contractorName}
                      onChange={(e) => setContractorName(e.target.value)}
                      placeholder="e.g., Premium Kitchen Installers Pvt Ltd"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Specializations <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={newSpecialization}
                        onChange={(e) => setNewSpecialization(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddSpecialization()}
                        placeholder="e.g., Modular Kitchen, Countertops"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={handleAddSpecialization}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {specializations.map((spec, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-2"
                        >
                          {spec}
                          <button
                            onClick={() => handleRemoveSpecialization(spec)}
                            className="hover:text-blue-900"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Press Enter or click Add to add specializations</p>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Address
                    </label>
                    <textarea
                      value={companyAddress}
                      onChange={(e) => setCompanyAddress(e.target.value)}
                      rows={2}
                      placeholder="Complete business address"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Rate Information */}
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  Rate Information
                </h2>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rate Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={rateType}
                      onChange={(e) => handleRateTypeChange(e.target.value as 'per-hour' | 'per-sqft' | 'per-unit' | 'fixed')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="per-hour">Per Hour</option>
                      <option value="per-sqft">Per Square Foot</option>
                      <option value="per-unit">Per Unit</option>
                      <option value="fixed">Fixed Rate</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unit
                    </label>
                    <input
                      type="text"
                      value={unit}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rate (₹) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                      <input
                        type="number"
                        value={rate}
                        onChange={(e) => setRate(e.target.value)}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Rate per {unit}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Order
                    </label>
                    <input
                      type="number"
                      value={minimumOrder}
                      onChange={(e) => setMinimumOrder(e.target.value)}
                      placeholder="0"
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Minimum {unit} required</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lead Time (Days)
                    </label>
                    <input
                      type="number"
                      value={leadTime}
                      onChange={(e) => setLeadTime(e.target.value)}
                      placeholder="0"
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Days needed for mobilization</p>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Terms
                    </label>
                    <select
                      value={paymentTerms}
                      onChange={(e) => setPaymentTerms(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Payment Terms</option>
                      {paymentTermsList.map(term => (
                        <option key={term} value={term}>{term}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Effective From <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={effectiveFrom}
                      onChange={(e) => setEffectiveFrom(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as 'active' | 'inactive' | 'blacklisted')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="blacklisted">Blacklisted</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Phone className="w-5 h-5 text-purple-600" />
                  Contact Information
                </h2>

                <div className="grid grid-cols-2 gap-2">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Person <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      placeholder="e.g., Mr. Rajesh Kumar"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91-98765-43210"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="contact@company.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Legal & Financial Information */}
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-orange-600" />
                  Legal & Financial Information
                </h2>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      GST Number
                    </label>
                    <input
                      type="text"
                      value={gstNumber}
                      onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                      placeholder="22AAAAA0000A1Z5"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      PAN Number
                    </label>
                    <input
                      type="text"
                      value={panNumber}
                      onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                      placeholder="ABCDE1234F"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bank Details
                    </label>
                    <textarea
                      value={bankDetails}
                      onChange={(e) => setBankDetails(e.target.value)}
                      rows={2}
                      placeholder="Bank name, Account number, IFSC code"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Insurance Details
                    </label>
                    <textarea
                      value={insuranceDetails}
                      onChange={(e) => setInsuranceDetails(e.target.value)}
                      rows={2}
                      placeholder="Liability insurance, Worker's compensation details"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes / Additional Information
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      placeholder="Any additional notes or special conditions"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Summary Preview */}
            <div className="space-y-3">
              <div className="bg-white rounded-lg border border-gray-200 p-3 sticky top-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-600" />
                  Summary Preview
                </h3>

                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Contractor Name</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {contractorName || 'Not set'}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 mb-1">Service Type</p>
                    <p className="text-sm font-medium text-gray-900">
                      {serviceType || 'Not selected'}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 mb-1">Specializations</p>
                    {specializations.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {specializations.map((spec, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                            {spec}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400">None added</p>
                    )}
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500 mb-2">Rate Information</p>
                    <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                      <p className="text-3xl font-bold text-green-900">₹{rate || '0.00'}</p>
                      <p className="text-sm text-green-700 mt-1">per {unit}</p>
                      {minimumOrder && (
                        <p className="text-xs text-green-600 mt-2">Min: {minimumOrder} {unit}</p>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500 mb-2">Contact Details</p>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {contactPerson || 'Not set'}
                        </p>
                      </div>
                      {phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="w-4 h-4" />
                          <span>{phone}</span>
                        </div>
                      )}
                      {email && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-4 h-4" />
                          <span className="text-xs">{email}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500 mb-2">Terms</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Lead Time:</span>
                        <span className="font-medium text-gray-900">
                          {leadTime || '0'} days
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payment:</span>
                        <span className="font-medium text-gray-900 text-xs">
                          {paymentTerms || 'Not set'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          status === 'active' ? 'bg-green-100 text-green-700' :
                          status === 'inactive' ? 'bg-gray-100 text-gray-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pb-6">
            <button
              onClick={handleBack}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Subcontractor
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
