"use client"

import React, { useState } from 'react'
import { X, Plus, Trash2, AlertTriangle, TrendingUp, TrendingDown, CheckCircle, FileText, Upload, Download } from 'lucide-react'

// ==================== INTERFACES ====================

export interface AdjustmentItem {
  itemId: string
  itemCode: string
  itemName: string
  currentQuantity: number
  adjustedQuantity: number
  difference: number
  reason: string
  warehouse: string
  zone: string
  bin: string
  costImpact: number
}

export interface StockAdjustmentData {
  adjustmentNumber: string
  adjustmentType: 'increase' | 'decrease' | 'recount' | 'damage' | 'obsolete'
  adjustmentDate: string
  warehouse: string
  reason: string
  items: AdjustmentItem[]
  totalCostImpact: number
  approver?: string
  notes?: string
  attachments?: File[]
}

export interface BulkAdjustmentData {
  adjustmentDate: string
  warehouse: string
  reason: string
  adjustmentType: 'increase' | 'decrease'
  uploadedFile?: File
  items: Array<{
    itemCode: string
    itemName: string
    currentQuantity: number
    adjustedQuantity: number
    difference: number
    costImpact: number
  }>
}

export interface ReconciliationData {
  reconciliationNumber: string
  reconciliationDate: string
  warehouse: string
  zones: string[]
  systemTotal: number
  physicalTotal: number
  variance: number
  variancePercentage: number
  items: Array<{
    itemCode: string
    itemName: string
    systemQty: number
    physicalQty: number
    variance: number
    reason: string
  }>
  performedBy: string
  verifiedBy: string
  notes?: string
}

export interface AdjustmentApprovalData {
  adjustmentId: string
  approvalAction: 'approve' | 'reject'
  comments: string
  requiresSecondaryApproval: boolean
  approverName: string
}

// ==================== CREATE STOCK ADJUSTMENT MODAL ====================

interface CreateAdjustmentModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: StockAdjustmentData) => void
}

export const CreateAdjustmentModal: React.FC<CreateAdjustmentModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [formData, setFormData] = useState<StockAdjustmentData>({
    adjustmentNumber: `ADJ-${Date.now()}`,
    adjustmentType: 'recount',
    adjustmentDate: new Date().toISOString().split('T')[0],
    warehouse: '',
    reason: '',
    items: [],
    totalCostImpact: 0,
    notes: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [currentItem, setCurrentItem] = useState<AdjustmentItem>({
    itemId: '',
    itemCode: '',
    itemName: '',
    currentQuantity: 0,
    adjustedQuantity: 0,
    difference: 0,
    reason: '',
    warehouse: '',
    zone: '',
    bin: '',
    costImpact: 0
  })

  const addItem = () => {
    if (!currentItem.itemCode || !currentItem.itemName) {
      setErrors({ ...errors, item: 'Please fill in item details' })
      return
    }

    const difference = currentItem.adjustedQuantity - currentItem.currentQuantity
    const updatedItem = { ...currentItem, difference }

    setFormData({
      ...formData,
      items: [...formData.items, updatedItem],
      totalCostImpact: formData.totalCostImpact + updatedItem.costImpact
    })

    setCurrentItem({
      itemId: '',
      itemCode: '',
      itemName: '',
      currentQuantity: 0,
      adjustedQuantity: 0,
      difference: 0,
      reason: '',
      warehouse: formData.warehouse,
      zone: '',
      bin: '',
      costImpact: 0
    })
    setErrors({})
  }

  const removeItem = (index: number) => {
    const removedItem = formData.items[index]
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
      totalCostImpact: formData.totalCostImpact - removedItem.costImpact
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: Record<string, string> = {}
    if (!formData.warehouse) newErrors.warehouse = 'Warehouse is required'
    if (!formData.reason) newErrors.reason = 'Reason is required'
    if (formData.items.length === 0) newErrors.items = 'Add at least one item'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onSubmit(formData)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-lg shadow-xl w-full  max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-2 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">Create Stock Adjustment</h2>
              <p className="text-sm opacity-90">{formData.adjustmentNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-3">
          {/* Adjustment Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adjustment Type *
              </label>
              <select
                value={formData.adjustmentType}
                onChange={(e) => setFormData({ ...formData, adjustmentType: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              >
                <option value="increase">Increase</option>
                <option value="decrease">Decrease</option>
                <option value="recount">Recount</option>
                <option value="damage">Damage</option>
                <option value="obsolete">Obsolete</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adjustment Date *
              </label>
              <input
                type="date"
                value={formData.adjustmentDate}
                onChange={(e) => setFormData({ ...formData, adjustmentDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Warehouse *
              </label>
              <select
                value={formData.warehouse}
                onChange={(e) => {
                  setFormData({ ...formData, warehouse: e.target.value })
                  setCurrentItem({ ...currentItem, warehouse: e.target.value })
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                  errors.warehouse ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select Warehouse</option>
                <option value="WH-001">Main Warehouse</option>
                <option value="WH-002">Production Warehouse</option>
                <option value="WH-003">Finished Goods</option>
              </select>
              {errors.warehouse && <p className="text-red-500 text-xs mt-1">{errors.warehouse}</p>}
            </div>
          </div>

          {/* Reason */}
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Adjustment Reason *
            </label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              rows={2}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                errors.reason ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Explain the reason for this adjustment..."
            />
            {errors.reason && <p className="text-red-500 text-xs mt-1">{errors.reason}</p>}
          </div>

          {/* Add Item Section */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 mb-3">
            <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add Item to Adjustment
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item Code</label>
                <input
                  type="text"
                  value={currentItem.itemCode}
                  onChange={(e) => setCurrentItem({ ...currentItem, itemCode: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="Enter code"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                <input
                  type="text"
                  value={currentItem.itemName}
                  onChange={(e) => setCurrentItem({ ...currentItem, itemName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="Enter name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Qty</label>
                <input
                  type="number"
                  value={currentItem.currentQuantity}
                  onChange={(e) => setCurrentItem({ ...currentItem, currentQuantity: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Adjusted Qty</label>
                <input
                  type="number"
                  value={currentItem.adjustedQuantity}
                  onChange={(e) => setCurrentItem({ ...currentItem, adjustedQuantity: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Zone</label>
                <input
                  type="text"
                  value={currentItem.zone}
                  onChange={(e) => setCurrentItem({ ...currentItem, zone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="Zone"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bin</label>
                <input
                  type="text"
                  value={currentItem.bin}
                  onChange={(e) => setCurrentItem({ ...currentItem, bin: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="Bin"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cost Impact ($)</label>
                <input
                  type="number"
                  value={currentItem.costImpact}
                  onChange={(e) => setCurrentItem({ ...currentItem, costImpact: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item Reason</label>
                <input
                  type="text"
                  value={currentItem.reason}
                  onChange={(e) => setCurrentItem({ ...currentItem, reason: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="Reason"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={addItem}
              className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Item
            </button>
            {errors.item && <p className="text-red-500 text-sm mt-2">{errors.item}</p>}
          </div>

          {/* Items List */}
          {formData.items.length > 0 && (
            <div className="mb-3">
              <h3 className="font-semibold text-gray-700 mb-3">Adjustment Items ({formData.items.length})</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">Item Code</th>
                      <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">Item Name</th>
                      <th className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold">Current</th>
                      <th className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold">Adjusted</th>
                      <th className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold">Difference</th>
                      <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">Location</th>
                      <th className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold">Cost Impact</th>
                      <th className="border border-gray-300 px-3 py-2 text-center text-sm font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.items.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-3 py-2 text-sm">{item.itemCode}</td>
                        <td className="border border-gray-300 px-3 py-2 text-sm">{item.itemName}</td>
                        <td className="border border-gray-300 px-3 py-2 text-sm text-right">{item.currentQuantity}</td>
                        <td className="border border-gray-300 px-3 py-2 text-sm text-right">{item.adjustedQuantity}</td>
                        <td className={`border border-gray-300 px-3 py-2 text-sm text-right font-semibold ${
                          item.difference > 0 ? 'text-green-600' : item.difference < 0 ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {item.difference > 0 ? '+' : ''}{item.difference}
                        </td>
                        <td className="border border-gray-300 px-3 py-2 text-sm">{item.zone}-{item.bin}</td>
                        <td className={`border border-gray-300 px-3 py-2 text-sm text-right ${
                          item.costImpact > 0 ? 'text-green-600' : item.costImpact < 0 ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          ${item.costImpact.toFixed(2)}
                        </td>
                        <td className="border border-gray-300 px-3 py-2 text-center">
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-100 font-semibold">
                    <tr>
                      <td colSpan={6} className="border border-gray-300 px-3 py-2 text-right">Total Cost Impact:</td>
                      <td className={`border border-gray-300 px-3 py-2 text-right ${
                        formData.totalCostImpact > 0 ? 'text-green-600' : formData.totalCostImpact < 0 ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        ${formData.totalCostImpact.toFixed(2)}
                      </td>
                      <td className="border border-gray-300"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              {errors.items && <p className="text-red-500 text-sm mt-2">{errors.items}</p>}
            </div>
          )}

          {/* Notes */}
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              placeholder="Any additional information..."
            />
          </div>
        </form>

        {/* Footer */}
        <div className="border-t px-3 py-2 bg-gray-50 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all"
          >
            Create Adjustment
          </button>
        </div>
      </div>
    </div>
  )
}

// ==================== BULK ADJUSTMENT MODAL ====================

interface BulkAdjustmentModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: BulkAdjustmentData) => void
}

export const BulkAdjustmentModal: React.FC<BulkAdjustmentModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<BulkAdjustmentData>({
    adjustmentDate: new Date().toISOString().split('T')[0],
    warehouse: '',
    reason: '',
    adjustmentType: 'increase',
    items: []
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData({ ...formData, uploadedFile: file })

      // TODO: Parse CSV/Excel file and populate items
      // Mock data for demonstration
      const mockItems = [
        { itemCode: 'ITM-001', itemName: 'Item 1', currentQuantity: 100, adjustedQuantity: 120, difference: 20, costImpact: 200 },
        { itemCode: 'ITM-002', itemName: 'Item 2', currentQuantity: 50, adjustedQuantity: 45, difference: -5, costImpact: -50 }
      ]
      setFormData({ ...formData, uploadedFile: file, items: mockItems })
      setStep(2)
    }
  }

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.warehouse) newErrors.warehouse = 'Warehouse is required'
    if (!formData.reason) newErrors.reason = 'Reason is required'
    if (formData.items.length === 0) newErrors.items = 'Upload a file with items'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onSubmit(formData)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-lg shadow-xl w-full  max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-3 py-2 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Upload className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">Bulk Stock Adjustment</h2>
              <p className="text-sm opacity-90">Upload CSV/Excel to adjust multiple items</p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 py-4 bg-gray-50 border-b">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-purple-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-purple-600 text-white' : 'bg-gray-300'}`}>1</div>
            <span className="font-medium">Upload File</span>
          </div>
          <div className="w-12 h-0.5 bg-gray-300"></div>
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-purple-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-purple-600 text-white' : 'bg-gray-300'}`}>2</div>
            <span className="font-medium">Review & Submit</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3">
          {step === 1 && (
            <div>
              {/* Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Warehouse *
                  </label>
                  <select
                    value={formData.warehouse}
                    onChange={(e) => setFormData({ ...formData, warehouse: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      errors.warehouse ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Warehouse</option>
                    <option value="WH-001">Main Warehouse</option>
                    <option value="WH-002">Production Warehouse</option>
                  </select>
                  {errors.warehouse && <p className="text-red-500 text-xs mt-1">{errors.warehouse}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adjustment Type *
                  </label>
                  <select
                    value={formData.adjustmentType}
                    onChange={(e) => setFormData({ ...formData, adjustmentType: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="increase">Increase</option>
                    <option value="decrease">Decrease</option>
                  </select>
                </div>
              </div>

              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason *
                </label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  rows={2}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.reason ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Explain the reason for bulk adjustment..."
                />
                {errors.reason && <p className="text-red-500 text-xs mt-1">{errors.reason}</p>}
              </div>

              {/* File Upload */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 text-gray-400 mb-2" />
                <p className="text-gray-700 font-medium mb-2">Upload Adjustment File</p>
                <p className="text-sm text-gray-500 mb-2">CSV or Excel file with item codes and adjusted quantities</p>
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="bulk-upload"
                />
                <label
                  htmlFor="bulk-upload"
                  className="bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600 transition-colors cursor-pointer inline-block"
                >
                  Choose File
                </label>
                <p className="text-xs text-gray-400 mt-3">
                  Download template:{' '}
                  <button
                    type="button"
                    onClick={() => {
                      const csv = 'SKU,Location,Adjustment Type,Quantity,Reason\n';
                      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = 'adjustment-template.csv';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      URL.revokeObjectURL(url);
                    }}
                    className="text-purple-600 hover:underline cursor-pointer bg-transparent border-0 p-0"
                  >
                    adjustment-template.csv
                  </button>
                </p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Review Adjustments ({formData.items.length} items)</h3>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-600 font-medium">Total Items</p>
                  <p className="text-2xl font-bold text-blue-700">{formData.items.length}</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-600 font-medium">Increases</p>
                  <p className="text-2xl font-bold text-green-700">
                    {formData.items.filter(i => i.difference > 0).length}
                  </p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-600 font-medium">Decreases</p>
                  <p className="text-2xl font-bold text-red-700">
                    {formData.items.filter(i => i.difference < 0).length}
                  </p>
                </div>
              </div>

              {/* Items Table */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">Item Code</th>
                      <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">Item Name</th>
                      <th className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold">Current</th>
                      <th className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold">Adjusted</th>
                      <th className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold">Difference</th>
                      <th className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold">Cost Impact</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.items.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-3 py-2 text-sm">{item.itemCode}</td>
                        <td className="border border-gray-300 px-3 py-2 text-sm">{item.itemName}</td>
                        <td className="border border-gray-300 px-3 py-2 text-sm text-right">{item.currentQuantity}</td>
                        <td className="border border-gray-300 px-3 py-2 text-sm text-right">{item.adjustedQuantity}</td>
                        <td className={`border border-gray-300 px-3 py-2 text-sm text-right font-semibold ${
                          item.difference > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {item.difference > 0 ? '+' : ''}{item.difference}
                        </td>
                        <td className={`border border-gray-300 px-3 py-2 text-sm text-right ${
                          item.costImpact > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          ${item.costImpact.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-3 py-2 bg-gray-50 flex justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <div className="flex gap-3">
            {step === 2 && (
              <button
                onClick={() => setStep(1)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Back
              </button>
            )}
            {step === 2 && (
              <button
                onClick={handleSubmit}
                className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all"
              >
                Submit Adjustments
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ==================== VIEW ADJUSTMENT DETAILS MODAL ====================

interface ViewAdjustmentDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  adjustment: StockAdjustmentData | null
  onApprove?: () => void
  onReject?: () => void
}

export const ViewAdjustmentDetailsModal: React.FC<ViewAdjustmentDetailsModalProps> = ({
  isOpen,
  onClose,
  adjustment,
  onApprove,
  onReject
}) => {
  if (!isOpen || !adjustment) return null

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'increase': return 'bg-green-100 text-green-700'
      case 'decrease': return 'bg-red-100 text-red-700'
      case 'recount': return 'bg-blue-100 text-blue-700'
      case 'damage': return 'bg-orange-100 text-orange-700'
      case 'obsolete': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-lg shadow-xl w-full  max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-3 py-2 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">Adjustment Details</h2>
              <p className="text-sm opacity-90">{adjustment.adjustmentNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="text-sm text-gray-600 mb-1">Adjustment Type</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getTypeColor(adjustment.adjustmentType)}`}>
                {adjustment.adjustmentType.toUpperCase()}
              </span>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="text-sm text-gray-600 mb-1">Date</p>
              <p className="text-lg font-bold text-gray-800">{adjustment.adjustmentDate}</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="text-sm text-gray-600 mb-1">Warehouse</p>
              <p className="text-lg font-bold text-gray-800">{adjustment.warehouse}</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="text-sm text-gray-600 mb-1">Total Items</p>
              <p className="text-lg font-bold text-gray-800">{adjustment.items.length}</p>
            </div>
          </div>

          {/* Reason */}
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">Adjustment Reason</label>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-gray-700">{adjustment.reason}</p>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-3">
            <h3 className="font-semibold text-gray-700 mb-3">Adjusted Items</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">Item Code</th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">Item Name</th>
                    <th className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold">Current</th>
                    <th className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold">Adjusted</th>
                    <th className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold">Difference</th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">Location</th>
                    <th className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold">Cost Impact</th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {adjustment.items.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-3 py-2 text-sm">{item.itemCode}</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">{item.itemName}</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm text-right">{item.currentQuantity}</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm text-right">{item.adjustedQuantity}</td>
                      <td className={`border border-gray-300 px-3 py-2 text-sm text-right font-semibold ${
                        item.difference > 0 ? 'text-green-600' : item.difference < 0 ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {item.difference > 0 ? '+' : ''}{item.difference}
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">{item.zone}-{item.bin}</td>
                      <td className={`border border-gray-300 px-3 py-2 text-sm text-right ${
                        item.costImpact > 0 ? 'text-green-600' : item.costImpact < 0 ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        ${item.costImpact.toFixed(2)}
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">{item.reason}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-100 font-semibold">
                  <tr>
                    <td colSpan={6} className="border border-gray-300 px-3 py-2 text-right">Total Cost Impact:</td>
                    <td className={`border border-gray-300 px-3 py-2 text-right ${
                      adjustment.totalCostImpact > 0 ? 'text-green-600' : adjustment.totalCostImpact < 0 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      ${adjustment.totalCostImpact.toFixed(2)}
                    </td>
                    <td className="border border-gray-300"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Notes */}
          {adjustment.notes && (
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <p className="text-gray-700">{adjustment.notes}</p>
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
          {(onApprove || onReject) && (
            <div className="flex gap-3">
              {onReject && (
                <button
                  onClick={onReject}
                  className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Reject
                </button>
              )}
              {onApprove && (
                <button
                  onClick={onApprove}
                  className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Approve
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ==================== RECONCILIATION MODAL ====================

interface ReconciliationModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: ReconciliationData) => void
}

export const ReconciliationModal: React.FC<ReconciliationModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [formData, setFormData] = useState<ReconciliationData>({
    reconciliationNumber: `REC-${Date.now()}`,
    reconciliationDate: new Date().toISOString().split('T')[0],
    warehouse: '',
    zones: [],
    systemTotal: 0,
    physicalTotal: 0,
    variance: 0,
    variancePercentage: 0,
    items: [],
    performedBy: '',
    verifiedBy: '',
    notes: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const calculateVariance = () => {
    const systemTotal = formData.items.reduce((sum, item) => sum + item.systemQty, 0)
    const physicalTotal = formData.items.reduce((sum, item) => sum + item.physicalQty, 0)
    const variance = physicalTotal - systemTotal
    const variancePercentage = systemTotal > 0 ? (variance / systemTotal) * 100 : 0

    setFormData({
      ...formData,
      systemTotal,
      physicalTotal,
      variance,
      variancePercentage
    })
  }

  const addItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        { itemCode: '', itemName: '', systemQty: 0, physicalQty: 0, variance: 0, reason: '' }
      ]
    })
  }

  const updateItem = (index: number, field: string, value: any) => {
    const updatedItems = [...formData.items]
    updatedItems[index] = { ...updatedItems[index], [field]: value }

    if (field === 'systemQty' || field === 'physicalQty') {
      updatedItems[index].variance = updatedItems[index].physicalQty - updatedItems[index].systemQty
    }

    setFormData({ ...formData, items: updatedItems })
  }

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    calculateVariance()

    const newErrors: Record<string, string> = {}
    if (!formData.warehouse) newErrors.warehouse = 'Warehouse is required'
    if (!formData.performedBy) newErrors.performedBy = 'Performer is required'
    if (formData.items.length === 0) newErrors.items = 'Add at least one item'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onSubmit(formData)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-lg shadow-xl w-full  max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-3 py-2 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">Stock Reconciliation</h2>
              <p className="text-sm opacity-90">{formData.reconciliationNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-3">
          {/* Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Warehouse *
              </label>
              <select
                value={formData.warehouse}
                onChange={(e) => setFormData({ ...formData, warehouse: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.warehouse ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select Warehouse</option>
                <option value="WH-001">Main Warehouse</option>
                <option value="WH-002">Production Warehouse</option>
              </select>
              {errors.warehouse && <p className="text-red-500 text-xs mt-1">{errors.warehouse}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Performed By *
              </label>
              <input
                type="text"
                value={formData.performedBy}
                onChange={(e) => setFormData({ ...formData, performedBy: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.performedBy ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Name"
              />
              {errors.performedBy && <p className="text-red-500 text-xs mt-1">{errors.performedBy}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Verified By
              </label>
              <input
                type="text"
                value={formData.verifiedBy}
                onChange={(e) => setFormData({ ...formData, verifiedBy: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Name"
              />
            </div>
          </div>

          {/* Variance Summary */}
          {formData.items.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-600 font-medium">System Total</p>
                <p className="text-2xl font-bold text-blue-700">{formData.systemTotal}</p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-600 font-medium">Physical Total</p>
                <p className="text-2xl font-bold text-green-700">{formData.physicalTotal}</p>
              </div>
              <div className={`border rounded-lg p-3 ${
                formData.variance > 0 ? 'bg-yellow-50 border-yellow-200' :
                formData.variance < 0 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'
              }`}>
                <p className={`text-sm font-medium ${
                  formData.variance > 0 ? 'text-yellow-600' :
                  formData.variance < 0 ? 'text-red-600' : 'text-gray-600'
                }`}>Variance</p>
                <p className={`text-2xl font-bold ${
                  formData.variance > 0 ? 'text-yellow-700' :
                  formData.variance < 0 ? 'text-red-700' : 'text-gray-700'
                }`}>
                  {formData.variance > 0 ? '+' : ''}{formData.variance}
                </p>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <p className="text-sm text-purple-600 font-medium">Variance %</p>
                <p className="text-2xl font-bold text-purple-700">{formData.variancePercentage.toFixed(2)}%</p>
              </div>
            </div>
          )}

          {/* Items */}
          <div className="mb-3">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-700">Reconciliation Items</h3>
              <button
                type="button"
                onClick={addItem}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Item
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">Item Code</th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">Item Name</th>
                    <th className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold">System Qty</th>
                    <th className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold">Physical Qty</th>
                    <th className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold">Variance</th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">Reason</th>
                    <th className="border border-gray-300 px-3 py-2 text-center text-sm font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.items.map((item, index) => (
                    <tr key={index}>
                      <td className="border border-gray-300 px-2 py-2">
                        <input
                          type="text"
                          value={item.itemCode}
                          onChange={(e) => updateItem(index, 'itemCode', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          placeholder="Code"
                        />
                      </td>
                      <td className="border border-gray-300 px-2 py-2">
                        <input
                          type="text"
                          value={item.itemName}
                          onChange={(e) => updateItem(index, 'itemName', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          placeholder="Name"
                        />
                      </td>
                      <td className="border border-gray-300 px-2 py-2">
                        <input
                          type="number"
                          value={item.systemQty}
                          onChange={(e) => updateItem(index, 'systemQty', parseFloat(e.target.value) || 0)}
                          onBlur={calculateVariance}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-right"
                        />
                      </td>
                      <td className="border border-gray-300 px-2 py-2">
                        <input
                          type="number"
                          value={item.physicalQty}
                          onChange={(e) => updateItem(index, 'physicalQty', parseFloat(e.target.value) || 0)}
                          onBlur={calculateVariance}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-right"
                        />
                      </td>
                      <td className={`border border-gray-300 px-3 py-2 text-right font-semibold ${
                        item.variance > 0 ? 'text-green-600' : item.variance < 0 ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {item.variance > 0 ? '+' : ''}{item.variance}
                      </td>
                      <td className="border border-gray-300 px-2 py-2">
                        <input
                          type="text"
                          value={item.reason}
                          onChange={(e) => updateItem(index, 'reason', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          placeholder="Reason"
                        />
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {errors.items && <p className="text-red-500 text-sm mt-2">{errors.items}</p>}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Additional notes..."
            />
          </div>
        </form>

        {/* Footer */}
        <div className="border-t px-3 py-2 bg-gray-50 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all"
          >
            Submit Reconciliation
          </button>
        </div>
      </div>
    </div>
  )
}

// ==================== EXPORT ADJUSTMENT REPORT MODAL ====================

interface ExportAdjustmentReportModalProps {
  isOpen: boolean
  onClose: () => void
  onExport: (format: string, filters: any) => void
}

export const ExportAdjustmentReportModal: React.FC<ExportAdjustmentReportModalProps> = ({
  isOpen,
  onClose,
  onExport
}) => {
  const [format, setFormat] = useState('pdf')
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    warehouse: '',
    adjustmentType: '',
    includeDetails: true,
    includeCostImpact: true
  })

  const handleExport = () => {
    onExport(format, filters)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-2 flex justify-between items-center rounded-t-lg">
          <div className="flex items-center gap-3">
            <Download className="w-6 h-6" />
            <h2 className="text-xl font-bold">Export Adjustment Report</h2>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Format Selection */}
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">Export Format</label>
            <div className="grid grid-cols-3 gap-3">
              {['pdf', 'excel', 'csv'].map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setFormat(fmt)}
                  className={`px-4 py-3 rounded-lg border-2 transition-all ${
                    format === fmt
                      ? 'border-purple-500 bg-purple-50 text-purple-700 font-semibold'
                      : 'border-gray-300 hover:border-purple-300'
                  }`}
                >
                  {fmt.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div className="space-y-2 mb-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Warehouse</label>
              <select
                value={filters.warehouse}
                onChange={(e) => setFilters({ ...filters, warehouse: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">All Warehouses</option>
                <option value="WH-001">Main Warehouse</option>
                <option value="WH-002">Production Warehouse</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Adjustment Type</label>
              <select
                value={filters.adjustmentType}
                onChange={(e) => setFilters({ ...filters, adjustmentType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">All Types</option>
                <option value="increase">Increase</option>
                <option value="decrease">Decrease</option>
                <option value="recount">Recount</option>
                <option value="damage">Damage</option>
                <option value="obsolete">Obsolete</option>
              </select>
            </div>

            {/* Options */}
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.includeDetails}
                  onChange={(e) => setFilters({ ...filters, includeDetails: e.target.checked })}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700">Include item details</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.includeCostImpact}
                  onChange={(e) => setFilters({ ...filters, includeCostImpact: e.target.checked })}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700">Include cost impact analysis</span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-3 py-2 bg-gray-50 flex justify-end gap-3 rounded-b-lg">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>
    </div>
  )
}
