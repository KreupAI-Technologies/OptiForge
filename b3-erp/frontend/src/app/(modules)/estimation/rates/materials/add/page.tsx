'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Package, AlertCircle } from 'lucide-react'
import { estimationMaterialCostService } from '@/services/estimation-material-cost.service'

export default function AddMaterialRatePage() {
  const router = useRouter()

  const [materialCode, setMaterialCode] = useState('')
  const [materialName, setMaterialName] = useState('')
  const [category, setCategory] = useState('')
  const [unit, setUnit] = useState('KG')
  const [currentRate, setCurrentRate] = useState('')
  const [effectiveFrom, setEffectiveFrom] = useState('')
  const [supplier, setSupplier] = useState('')
  const [leadTime, setLeadTime] = useState('')
  const [minimumOrderQty, setMinimumOrderQty] = useState('')
  const [status, setStatus] = useState<'active' | 'inactive'>('active')
  const [notes, setNotes] = useState('')

  const categories = [
    'Raw Material - Sinks',
    'Raw Material - Faucets',
    'Raw Material - Countertops',
    'Raw Material - Cookware',
    'Raw Material - Cabinets',
    'Finishing - Faucets',
    'Finishing - Cookware',
    'Finishing - Appliances',
    'Components - Appliances',
    'Components - Sinks',
    'Components - Faucets',
    'Other'
  ]

  const units = [
    'KG',
    'SQ.FT',
    'SQ.M',
    'LITER',
    'PCS',
    'SHEET',
    'TUBE',
    'METER',
    'ROLL',
    'BAG',
    'UNIT'
  ]

  const handleBack = () => {
    router.push('/estimation/rates/materials')
  }

  const handleSave = async () => {
    // Validation
    if (!materialCode.trim()) {
      alert('Please enter material code')
      return
    }
    if (!materialName.trim()) {
      alert('Please enter material name')
      return
    }
    if (!category) {
      alert('Please select a category')
      return
    }
    if (!currentRate || parseFloat(currentRate) <= 0) {
      alert('Please enter a valid rate')
      return
    }
    if (!effectiveFrom) {
      alert('Please select effective from date')
      return
    }
    if (!supplier.trim()) {
      alert('Please enter supplier name')
      return
    }

    try {
      await estimationMaterialCostService.createRate({
        materialCode,
        materialName,
        category,
        unit,
        currentPrice: parseFloat(currentRate),
        supplier,
        status,
      })
      router.push('/estimation/rates/materials')
    } catch (error) {
      console.error('Failed to create material rate:', error)
      alert('Failed to save material rate. Please try again.')
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
              <h1 className="text-2xl font-bold text-gray-900">Add Material Rate</h1>
              <p className="text-sm text-gray-500 mt-1">Create new material rate entry</p>
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
              <p>Material rates are used for cost estimation and quotations. Ensure accuracy before saving. You can update rates later, and the system will maintain history.</p>
            </div>
          </div>

          {/* Material Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              Material Information
            </h2>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Material Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={materialCode}
                  onChange={(e) => setMaterialCode(e.target.value.toUpperCase())}
                  placeholder="e.g., SS304-18G"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Material Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={materialName}
                  onChange={(e) => setMaterialName(e.target.value)}
                  placeholder="e.g., Stainless Steel 304 - 18 Gauge Sheet"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit of Measurement <span className="text-red-500">*</span>
                </label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {units.map(u => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
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
                  Notes / Specifications
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Any additional notes or specifications"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Pricing Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Pricing Information</h2>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Rate (₹) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                  <input
                    type="number"
                    value={currentRate}
                    onChange={(e) => setCurrentRate(e.target.value)}
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
            </div>
          </div>

          {/* Supplier Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Supplier Information</h2>

            <div className="grid grid-cols-2 gap-2">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Supplier Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  placeholder="e.g., Steel India Ltd"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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
                <p className="text-xs text-gray-500 mt-1">Delivery time in days</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Order Quantity
                </label>
                <input
                  type="number"
                  value={minimumOrderQty}
                  onChange={(e) => setMinimumOrderQty(e.target.value)}
                  placeholder="0"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">MOQ in {unit}</p>
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
