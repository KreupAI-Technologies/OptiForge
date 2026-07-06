'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Wrench, DollarSign, Settings, AlertCircle, Calculator } from 'lucide-react'
import { estimationResourceRateService } from '@/services/estimation-resource-rate.service'

const companyId = 'default-company-id'

export default function AddEquipmentRatePage() {
  const router = useRouter()

  const [equipmentCode, setEquipmentCode] = useState('')
  const [equipmentName, setEquipmentName] = useState('')
  const [category, setCategory] = useState('')
  const [hourlyRate, setHourlyRate] = useState('')
  const [dailyMultiplier, setDailyMultiplier] = useState('8')
  const [weeklyMultiplier, setWeeklyMultiplier] = useState('48')
  const [monthlyMultiplier, setMonthlyMultiplier] = useState('192')
  const [operatorIncluded, setOperatorIncluded] = useState(true)
  const [fuelIncluded, setFuelIncluded] = useState(false)
  const [minimumHours, setMinimumHours] = useState('4')
  const [effectiveFrom, setEffectiveFrom] = useState('')
  const [status, setStatus] = useState<'active' | 'maintenance' | 'inactive'>('active')
  const [notes, setNotes] = useState('')
  const [specifications, setSpecifications] = useState('')
  const [maintenanceSchedule, setMaintenanceSchedule] = useState('')

  const categories = [
    'CNC Machinery',
    'Welding Equipment',
    'Cutting Equipment',
    'Pressing Equipment',
    'Finishing Equipment',
    'Drilling Equipment',
    'Stone Working Equipment',
    'Material Handling',
    'Woodworking Equipment',
    'Packaging Equipment',
    'Testing Equipment',
    'Other'
  ]

  const handleBack = () => {
    router.push('/estimation/rates/equipment')
  }

  const calculateDailyRate = () => {
    const base = parseFloat(hourlyRate) || 0
    const multiplier = parseFloat(dailyMultiplier) || 8
    return (base * multiplier).toFixed(2)
  }

  const calculateWeeklyRate = () => {
    const base = parseFloat(hourlyRate) || 0
    const multiplier = parseFloat(weeklyMultiplier) || 48
    return (base * multiplier).toFixed(2)
  }

  const calculateMonthlyRate = () => {
    const base = parseFloat(hourlyRate) || 0
    const multiplier = parseFloat(monthlyMultiplier) || 192
    return (base * multiplier).toFixed(2)
  }

  const handleSave = async () => {
    // Validation
    if (!equipmentCode.trim()) {
      alert('Please enter equipment code')
      return
    }
    if (!equipmentName.trim()) {
      alert('Please enter equipment name')
      return
    }
    if (!category) {
      alert('Please select a category')
      return
    }
    if (!hourlyRate || parseFloat(hourlyRate) <= 0) {
      alert('Please enter a valid hourly rate')
      return
    }
    if (!effectiveFrom) {
      alert('Please select effective from date')
      return
    }
    if (!minimumHours || parseInt(minimumHours) <= 0) {
      alert('Please enter minimum hours')
      return
    }

    try {
      await estimationResourceRateService.createResourceRate(companyId, {
        rateType: 'Equipment',
        code: equipmentCode,
        name: equipmentName,
        category,
        unit: 'Hour',
        currency: 'INR',
        standardRate: parseFloat(hourlyRate),
        isActive: status === 'active',
        effectiveFrom: effectiveFrom || undefined,
        description: specifications || undefined,
        // Equipment-specific extras spread onto the payload
        dailyRate: parseFloat(calculateDailyRate()),
        weeklyRate: parseFloat(calculateWeeklyRate()),
        monthlyRate: parseFloat(calculateMonthlyRate()),
        dailyMultiplier: parseFloat(dailyMultiplier),
        weeklyMultiplier: parseFloat(weeklyMultiplier),
        monthlyMultiplier: parseFloat(monthlyMultiplier),
        operatorIncluded,
        fuelIncluded,
        minimumHours: parseInt(minimumHours),
        status,
        notes,
        specifications,
        maintenanceSchedule,
      } as any)
      router.push('/estimation/rates/equipment')
    } catch (error) {
      console.error('Failed to create equipment rate:', error)
      alert('Failed to save equipment rate. Please try again.')
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
              <h1 className="text-2xl font-bold text-gray-900">Add Equipment Rate</h1>
              <p className="text-sm text-gray-500 mt-1">Create new equipment rental rate entry</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Rate
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
              <p>Equipment rates are used for project costing and resource allocation. Enter the hourly rate and multipliers will automatically calculate daily, weekly, and monthly rates. Specify if operator and fuel costs are included in the rate.</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {/* Left Column - Main Information */}
            <div className="col-span-2 space-y-3">
              {/* Equipment Information */}
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-blue-600" />
                  Equipment Information
                </h2>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Equipment Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={equipmentCode}
                      onChange={(e) => setEquipmentCode(e.target.value.toUpperCase())}
                      placeholder="e.g., CNC-FAU-001"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Unique identifier</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Equipment Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={equipmentName}
                      onChange={(e) => setEquipmentName(e.target.value)}
                      placeholder="e.g., CNC Machine - Faucet Body Production"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Specifications
                    </label>
                    <textarea
                      value={specifications}
                      onChange={(e) => setSpecifications(e.target.value)}
                      rows={2}
                      placeholder="e.g., 5-axis, max capacity 1000kg, power 15kW"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Technical specifications</p>
                  </div>
                </div>
              </div>

              {/* Rate Information */}
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  Rate Information
                </h2>

                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hourly Rate (₹) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                        <input
                          type="number"
                          value={hourlyRate}
                          onChange={(e) => setHourlyRate(e.target.value)}
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                          className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Base rate per hour</p>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Calculator className="w-4 h-4 text-purple-600" />
                      Auto-Calculated Rates
                    </h3>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Daily Multiplier
                        </label>
                        <input
                          type="number"
                          value={dailyMultiplier}
                          onChange={(e) => setDailyMultiplier(e.target.value)}
                          placeholder="8"
                          min="1"
                          step="1"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">Hours per day</p>
                      </div>

                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Daily Rate (₹)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                          <input
                            type="text"
                            value={calculateDailyRate()}
                            readOnly
                            className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-blue-600 font-semibold"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Hourly × {dailyMultiplier} hours</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Weekly Multiplier
                        </label>
                        <input
                          type="number"
                          value={weeklyMultiplier}
                          onChange={(e) => setWeeklyMultiplier(e.target.value)}
                          placeholder="48"
                          min="1"
                          step="1"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">Hours per week</p>
                      </div>

                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Weekly Rate (₹)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                          <input
                            type="text"
                            value={calculateWeeklyRate()}
                            readOnly
                            className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-purple-600 font-semibold"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Hourly × {weeklyMultiplier} hours</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Monthly Multiplier
                        </label>
                        <input
                          type="number"
                          value={monthlyMultiplier}
                          onChange={(e) => setMonthlyMultiplier(e.target.value)}
                          placeholder="192"
                          min="1"
                          step="1"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">Hours per month</p>
                      </div>

                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Monthly Rate (₹)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                          <input
                            type="text"
                            value={calculateMonthlyRate()}
                            readOnly
                            className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-orange-600 font-semibold"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Hourly × {monthlyMultiplier} hours</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Settings */}
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-purple-600" />
                  Additional Settings
                </h2>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Hours <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={minimumHours}
                      onChange={(e) => setMinimumHours(e.target.value)}
                      placeholder="4"
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Minimum rental duration</p>
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
                      onChange={(e) => setStatus(e.target.value as 'active' | 'maintenance' | 'inactive')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="active">Active</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Rate Inclusions
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={operatorIncluded}
                          onChange={(e) => setOperatorIncluded(e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Operator Included</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={fuelIncluded}
                          onChange={(e) => setFuelIncluded(e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Fuel Included</span>
                      </label>
                    </div>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maintenance Schedule
                    </label>
                    <textarea
                      value={maintenanceSchedule}
                      onChange={(e) => setMaintenanceSchedule(e.target.value)}
                      rows={2}
                      placeholder="e.g., Weekly inspection, Monthly servicing"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
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

            {/* Right Column - Rate Preview */}
            <div className="space-y-3">
              <div className="bg-white rounded-lg border border-gray-200 p-3 sticky top-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-green-600" />
                  Rate Preview
                </h3>

                <div className="space-y-3">
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                    <p className="text-xs text-blue-600 font-medium mb-1">Hourly Rate</p>
                    <p className="text-3xl font-bold text-blue-900">₹{hourlyRate || '0.00'}</p>
                    <p className="text-xs text-blue-700 mt-1">per hour</p>
                  </div>

                  <div className="p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                    <p className="text-xs text-green-600 font-medium mb-1">Daily Rate</p>
                    <p className="text-2xl font-bold text-green-900">₹{calculateDailyRate()}</p>
                    <p className="text-xs text-green-700 mt-1">{dailyMultiplier} hours</p>
                  </div>

                  <div className="p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                    <p className="text-xs text-purple-600 font-medium mb-1">Weekly Rate</p>
                    <p className="text-2xl font-bold text-purple-900">₹{calculateWeeklyRate()}</p>
                    <p className="text-xs text-purple-700 mt-1">{weeklyMultiplier} hours</p>
                  </div>

                  <div className="p-3 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200">
                    <p className="text-xs text-orange-600 font-medium mb-1">Monthly Rate</p>
                    <p className="text-2xl font-bold text-orange-900">₹{calculateMonthlyRate()}</p>
                    <p className="text-xs text-orange-700 mt-1">{monthlyMultiplier} hours</p>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Inclusions</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Operator</span>
                      <span className={`font-semibold ${operatorIncluded ? 'text-green-600' : 'text-red-600'}`}>
                        {operatorIncluded ? 'Included' : 'Not Included'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Fuel</span>
                      <span className={`font-semibold ${fuelIncluded ? 'text-green-600' : 'text-red-600'}`}>
                        {fuelIncluded ? 'Included' : 'Not Included'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Minimum</span>
                      <span className="font-semibold text-blue-600">
                        {minimumHours || '0'} hours
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Typical Multipliers</h4>
                  <div className="space-y-2 text-xs text-gray-600">
                    <div className="flex justify-between">
                      <span>Daily (8 hrs):</span>
                      <span className="font-semibold text-green-600">8x</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Weekly (6 days):</span>
                      <span className="font-semibold text-purple-600">48x</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Monthly (24 days):</span>
                      <span className="font-semibold text-orange-600">192x</span>
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
              Save Rate
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
