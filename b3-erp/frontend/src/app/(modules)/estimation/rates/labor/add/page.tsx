'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Users, DollarSign, Clock, AlertCircle, Award } from 'lucide-react'
import { estimationResourceRateService } from '@/services/estimation-resource-rate.service'

const companyId = 'default-company-id'

export default function AddLaborRatePage() {
  const router = useRouter()

  const [submitting, setSubmitting] = useState(false)
  const [skillCode, setSkillCode] = useState('')
  const [skillName, setSkillName] = useState('')
  const [department, setDepartment] = useState('')
  const [skillLevel, setSkillLevel] = useState<'trainee' | 'skilled' | 'expert' | 'supervisor'>('skilled')
  const [standardRate, setStandardRate] = useState('')
  const [overtimeMultiplier, setOvertimeMultiplier] = useState('1.5')
  const [holidayMultiplier, setHolidayMultiplier] = useState('2.0')
  const [effectiveFrom, setEffectiveFrom] = useState('')
  const [status, setStatus] = useState<'active' | 'inactive'>('active')
  const [notes, setNotes] = useState('')
  const [certifications, setCertifications] = useState('')

  const departments = [
    'Sink Manufacturing',
    'Faucet Manufacturing',
    'Countertop Manufacturing',
    'Cookware Manufacturing',
    'Cabinet Manufacturing',
    'Appliances',
    'Finishing',
    'Quality Assurance',
    'Maintenance',
    'Production',
    'Packaging',
    'All Departments'
  ]

  const handleBack = () => {
    router.push('/estimation/rates/labor')
  }

  const calculateOvertimeRate = () => {
    const base = parseFloat(standardRate) || 0
    const multiplier = parseFloat(overtimeMultiplier) || 1.5
    return (base * multiplier).toFixed(2)
  }

  const calculateHolidayRate = () => {
    const base = parseFloat(standardRate) || 0
    const multiplier = parseFloat(holidayMultiplier) || 2.0
    return (base * multiplier).toFixed(2)
  }

  const handleSave = async () => {
    // Validation
    if (!skillCode.trim()) {
      alert('Please enter skill code')
      return
    }
    if (!skillName.trim()) {
      alert('Please enter skill name')
      return
    }
    if (!department) {
      alert('Please select a department')
      return
    }
    if (!standardRate || parseFloat(standardRate) <= 0) {
      alert('Please enter a valid standard rate')
      return
    }
    if (!effectiveFrom) {
      alert('Please select effective from date')
      return
    }

    setSubmitting(true)
    try {
      await estimationResourceRateService.createResourceRate(companyId, {
        rateType: 'Labor',
        code: skillCode,
        name: skillName,
        category: department,
        unit: 'Hour',
        currency: 'INR',
        standardRate: parseFloat(standardRate),
        overtimeRate: parseFloat(calculateOvertimeRate()),
        isActive: status === 'active',
        effectiveFrom: effectiveFrom || undefined,
        description: certifications || undefined,
        // Labor-specific extras spread onto the payload
        skillLevel,
        holidayRate: parseFloat(calculateHolidayRate()),
        overtimeMultiplier: parseFloat(overtimeMultiplier),
        holidayMultiplier: parseFloat(holidayMultiplier),
        department,
        status,
        notes,
        certifications,
      } as any)
      router.push('/estimation/rates/labor')
    } catch (error) {
      console.error('Failed to create labor rate:', error)
      alert(error instanceof Error ? error.message : 'Failed to save labor rate. Please try again.')
    } finally {
      setSubmitting(false)
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
              <h1 className="text-2xl font-bold text-gray-900">Add Labor Rate</h1>
              <p className="text-sm text-gray-500 mt-1">Create new labor skill rate entry</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={submitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {submitting ? 'Saving...' : 'Save Rate'}
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
              <p>Labor rates are used for project costing and resource planning. Standard rates are for regular working hours. Overtime and holiday rates are automatically calculated based on multipliers. Ensure all information is accurate before saving.</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {/* Left Column - Main Information */}
            <div className="col-span-2 space-y-3">
              {/* Skill Information */}
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Skill Information
                </h2>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Skill Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={skillCode}
                      onChange={(e) => setSkillCode(e.target.value.toUpperCase())}
                      placeholder="e.g., WELD-SS"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Unique identifier for the skill</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Skill Level <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={skillLevel}
                      onChange={(e) => setSkillLevel(e.target.value as 'trainee' | 'skilled' | 'expert' | 'supervisor')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="trainee">Trainee</option>
                      <option value="skilled">Skilled</option>
                      <option value="expert">Expert</option>
                      <option value="supervisor">Supervisor</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Proficiency level</p>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Skill Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={skillName}
                      onChange={(e) => setSkillName(e.target.value)}
                      placeholder="e.g., Stainless Steel Welder"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Department</option>
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Required Certifications / Skills
                    </label>
                    <textarea
                      value={certifications}
                      onChange={(e) => setCertifications(e.target.value)}
                      rows={2}
                      placeholder="e.g., AWS Certified Welder, 5+ years experience"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Certifications or experience required</p>
                  </div>
                </div>
              </div>

              {/* Rate Information */}
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  Rate Information
                </h2>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Standard Hourly Rate (₹) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                      <input
                        type="number"
                        value={standardRate}
                        onChange={(e) => setStandardRate(e.target.value)}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Base rate for regular working hours</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Overtime Multiplier <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={overtimeMultiplier}
                      onChange={(e) => setOvertimeMultiplier(e.target.value)}
                      placeholder="1.5"
                      min="1"
                      step="0.1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Usually 1.5x</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Overtime Rate (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                      <input
                        type="text"
                        value={calculateOvertimeRate()}
                        readOnly
                        className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-orange-600 font-semibold"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Auto-calculated</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Holiday Multiplier <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={holidayMultiplier}
                      onChange={(e) => setHolidayMultiplier(e.target.value)}
                      placeholder="2.0"
                      min="1"
                      step="0.1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Usually 2.0x</p>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Holiday Rate (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                      <input
                        type="text"
                        value={calculateHolidayRate()}
                        readOnly
                        className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-red-600 font-semibold"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Auto-calculated</p>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-purple-600" />
                  Additional Information
                </h2>

                <div className="grid grid-cols-2 gap-2">
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
                    <p className="text-xs text-gray-500 mt-1">Date when rate becomes active</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes / Additional Details
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

            {/* Right Column - Preview & Guidelines */}
            <div className="space-y-3">
              {/* Rate Preview */}
              <div className="bg-white rounded-lg border border-gray-200 p-3 sticky top-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-600" />
                  Rate Preview
                </h3>

                <div className="space-y-2">
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                    <p className="text-xs text-blue-600 font-medium mb-1">Standard Rate</p>
                    <p className="text-3xl font-bold text-blue-900">₹{standardRate || '0.00'}</p>
                    <p className="text-xs text-blue-700 mt-1">per hour</p>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200">
                    <p className="text-xs text-orange-600 font-medium mb-1">Overtime Rate</p>
                    <p className="text-2xl font-bold text-orange-900">₹{calculateOvertimeRate()}</p>
                    <p className="text-xs text-orange-700 mt-1">{overtimeMultiplier}x standard</p>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-lg border border-red-200">
                    <p className="text-xs text-red-600 font-medium mb-1">Holiday Rate</p>
                    <p className="text-2xl font-bold text-red-900">₹{calculateHolidayRate()}</p>
                    <p className="text-xs text-red-700 mt-1">{holidayMultiplier}x standard</p>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Rate Guidelines</h4>
                  <div className="space-y-2 text-xs text-gray-600">
                    <div className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <p><span className="font-medium">Trainee:</span> ₹250-350/hr</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <p><span className="font-medium">Skilled:</span> ₹350-500/hr</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-purple-600 font-bold">•</span>
                      <p><span className="font-medium">Expert:</span> ₹500-650/hr</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-orange-600 font-bold">•</span>
                      <p><span className="font-medium">Supervisor:</span> ₹650-800/hr</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Standard Multipliers</h4>
                  <div className="space-y-2 text-xs text-gray-600">
                    <div className="flex justify-between">
                      <span>Overtime:</span>
                      <span className="font-semibold text-orange-600">1.5x</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Holiday:</span>
                      <span className="font-semibold text-red-600">2.0x</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Night Shift:</span>
                      <span className="font-semibold text-purple-600">1.25x</span>
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
              disabled={submitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {submitting ? 'Saving...' : 'Save Rate'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
