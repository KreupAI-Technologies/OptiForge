"use client"

import React, { useState } from 'react'
import { X, Plus, Trash2, CheckCircle, XCircle, FileText, Send, ShoppingCart, AlertTriangle, Download, Edit, Eye, Calendar, User, Building2, DollarSign } from 'lucide-react'

// ==================== INTERFACES ====================

export interface PRItem {
  itemId: string
  itemCode: string
  itemName: string
  description: string
  quantity: number
  estimatedPrice: number
  totalPrice: number
  uom: string
  preferredVendor?: string
  deliveryDate: string
  purpose: string
}

export interface RequisitionData {
  prNumber: string
  requestedBy: string
  department: string
  requestDate: string
  deliveryDate: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  purpose: string
  budgetCode?: string
  costCenter?: string
  items: PRItem[]
  subtotal: number
  estimatedTax: number
  estimatedTotal: number
  justification?: string
  attachments?: File[]
  status: string
  approver?: string
}

export interface ApprovalDecision {
  decision: 'approve' | 'reject' | 'request_info'
  comments: string
  budgetApproved: boolean
  requestedInfo?: string[]
  approverName: string
  approvalDate: string
}

export interface ConvertToPOData {
  prNumber: string
  selectedItems: string[]
  vendorId: string
  vendorName: string
  deliveryDate: string
  paymentTerms: string
  specialInstructions?: string
}

export interface RejectRequisitionData {
  reason: string
  detailedComments: string
  suggestedAlternatives?: string
  allowResubmission: boolean
}

// ==================== CREATE REQUISITION MODAL (3-STEP WIZARD) ====================

interface CreateRequisitionModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: RequisitionData) => void
}

export const CreateRequisitionModal: React.FC<CreateRequisitionModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<RequisitionData>({
    prNumber: `PR-${Date.now()}`,
    requestedBy: 'Current User',
    department: '',
    requestDate: new Date().toISOString().split('T')[0],
    deliveryDate: '',
    priority: 'medium',
    purpose: '',
    items: [],
    subtotal: 0,
    estimatedTax: 0,
    estimatedTotal: 0,
    status: 'draft'
  })

  const [currentItem, setCurrentItem] = useState<PRItem>({
    itemId: '',
    itemCode: '',
    itemName: '',
    description: '',
    quantity: 0,
    estimatedPrice: 0,
    totalPrice: 0,
    uom: 'Units',
    deliveryDate: '',
    purpose: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const addItem = () => {
    if (!currentItem.itemCode || !currentItem.itemName || currentItem.quantity <= 0) {
      setErrors({ ...errors, item: 'Please fill in all required item details' })
      return
    }

    const totalPrice = currentItem.quantity * currentItem.estimatedPrice
    const updatedItem = { ...currentItem, totalPrice, itemId: `ITEM-${Date.now()}` }

    setFormData({
      ...formData,
      items: [...formData.items, updatedItem],
      subtotal: formData.subtotal + totalPrice
    })

    setCurrentItem({
      itemId: '',
      itemCode: '',
      itemName: '',
      description: '',
      quantity: 0,
      estimatedPrice: 0,
      totalPrice: 0,
      uom: 'Units',
      deliveryDate: formData.deliveryDate,
      purpose: ''
    })
    setErrors({})
  }

  const removeItem = (index: number) => {
    const removedItem = formData.items[index]
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
      subtotal: formData.subtotal - removedItem.totalPrice
    })
  }

  const calculateTotal = () => {
    const total = formData.subtotal + formData.estimatedTax
    setFormData({ ...formData, estimatedTotal: total })
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1)
  }

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    if (step === 1) {
      if (!formData.department) newErrors.department = 'Department is required'
      if (!formData.deliveryDate) newErrors.deliveryDate = 'Delivery date is required'
      if (!formData.purpose) newErrors.purpose = 'Purpose is required'
    } else if (step === 2) {
      if (formData.items.length === 0) newErrors.items = 'Add at least one item'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validateStep(3)) {
      calculateTotal()
      onSubmit(formData)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-lg shadow-xl w-full  max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-3 py-2 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Plus className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">Create Purchase Requisition</h2>
              <p className="text-sm opacity-90">{formData.prNumber}</p>
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
            <span className="font-medium">PR Details</span>
          </div>
          <div className="w-12 h-0.5 bg-gray-300"></div>
          <div className={`flex items-center gap-2 ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>2</div>
            <span className="font-medium">Add Items</span>
          </div>
          <div className="w-12 h-0.5 bg-gray-300"></div>
          <div className={`flex items-center gap-2 ${currentStep >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>3</div>
            <span className="font-medium">Review & Submit</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3">
          {/* Step 1: PR Details */}
          {currentStep === 1 && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.department ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Department</option>
                    <option value="Production">Production</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Quality Control">Quality Control</option>
                    <option value="R&D">R&D</option>
                    <option value="Administration">Administration</option>
                    <option value="Sales & Marketing">Sales & Marketing</option>
                    <option value="IT">IT</option>
                  </select>
                  {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Required Delivery Date *</label>
                  <input
                    type="date"
                    value={formData.deliveryDate}
                    onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.deliveryDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.deliveryDate && <p className="text-red-500 text-xs mt-1">{errors.deliveryDate}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Budget Code</label>
                  <input
                    type="text"
                    value={formData.budgetCode || ''}
                    onChange={(e) => setFormData({ ...formData, budgetCode: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="BUD-2025-001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cost Center</label>
                  <input
                    type="text"
                    value={formData.costCenter || ''}
                    onChange={(e) => setFormData({ ...formData, costCenter: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="CC-PROD-001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Approver</label>
                  <select
                    value={formData.approver || ''}
                    onChange={(e) => setFormData({ ...formData, approver: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Auto-assign by department</option>
                    <option value="Amit Sharma">Amit Sharma (Production Manager)</option>
                    <option value="Vijay Singh">Vijay Singh (Procurement Head)</option>
                    <option value="Priya Mehta">Priya Mehta (Finance Manager)</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Purpose *</label>
                  <textarea
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                    rows={2}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.purpose ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Briefly describe the purpose of this requisition..."
                  />
                  {errors.purpose && <p className="text-red-500 text-xs mt-1">{errors.purpose}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Justification / Additional Details</label>
                <textarea
                  value={formData.justification || ''}
                  onChange={(e) => setFormData({ ...formData, justification: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Provide additional justification or context for this request..."
                />
              </div>
            </div>
          )}

          {/* Step 2: Add Items */}
          {currentStep === 2 && (
            <div className="space-y-3">
              {/* Add Item Section */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-3">
                <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Add Item to Requisition
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Item Code</label>
                    <input
                      type="text"
                      value={currentItem.itemCode}
                      onChange={(e) => setCurrentItem({ ...currentItem, itemCode: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="ITEM-001"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                    <input
                      type="text"
                      value={currentItem.itemName}
                      onChange={(e) => setCurrentItem({ ...currentItem, itemName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter item name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">UOM</label>
                    <select
                      value={currentItem.uom}
                      onChange={(e) => setCurrentItem({ ...currentItem, uom: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Units">Units</option>
                      <option value="Pieces">Pieces</option>
                      <option value="Kg">Kg</option>
                      <option value="Liters">Liters</option>
                      <option value="Meters">Meters</option>
                      <option value="Box">Box</option>
                      <option value="Set">Set</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                    <input
                      type="number"
                      value={currentItem.quantity}
                      onChange={(e) => setCurrentItem({ ...currentItem, quantity: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Price</label>
                    <input
                      type="number"
                      value={currentItem.estimatedPrice}
                      onChange={(e) => setCurrentItem({ ...currentItem, estimatedPrice: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Total</label>
                    <input
                      type="number"
                      value={currentItem.quantity * currentItem.estimatedPrice}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <input
                      type="text"
                      value={currentItem.description}
                      onChange={(e) => setCurrentItem({ ...currentItem, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Item description or specifications"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Vendor (Optional)</label>
                    <input
                      type="text"
                      value={currentItem.preferredVendor || ''}
                      onChange={(e) => setCurrentItem({ ...currentItem, preferredVendor: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Vendor name"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={addItem}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Item
                </button>
                {errors.item && <p className="text-red-500 text-sm mt-2">{errors.item}</p>}
              </div>

              {/* Items List */}
              {formData.items.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">Requisition Items ({formData.items.length})</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">Item Code</th>
                          <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">Item Name</th>
                          <th className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold">Quantity</th>
                          <th className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold">Est. Price</th>
                          <th className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold">Est. Total</th>
                          <th className="border border-gray-300 px-3 py-2 text-center text-sm font-semibold">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.items.map((item, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="border border-gray-300 px-3 py-2 text-sm">{item.itemCode}</td>
                            <td className="border border-gray-300 px-3 py-2 text-sm">{item.itemName}</td>
                            <td className="border border-gray-300 px-3 py-2 text-sm text-right">{item.quantity} {item.uom}</td>
                            <td className="border border-gray-300 px-3 py-2 text-sm text-right">₹{item.estimatedPrice.toFixed(2)}</td>
                            <td className="border border-gray-300 px-3 py-2 text-sm text-right font-semibold">₹{item.totalPrice.toFixed(2)}</td>
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
                          <td colSpan={4} className="border border-gray-300 px-3 py-2 text-right">Estimated Subtotal:</td>
                          <td className="border border-gray-300 px-3 py-2 text-right">₹{formData.subtotal.toFixed(2)}</td>
                          <td className="border border-gray-300"></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                  {errors.items && <p className="text-red-500 text-sm mt-2">{errors.items}</p>}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Review & Submit */}
          {currentStep === 3 && (
            <div className="space-y-3">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                <h3 className="font-semibold text-blue-900 mb-3">Review Requisition</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-blue-700">Department:</p>
                    <p className="font-semibold text-blue-900">{formData.department}</p>
                  </div>
                  <div>
                    <p className="text-blue-700">Required By:</p>
                    <p className="font-semibold text-blue-900">{formData.deliveryDate}</p>
                  </div>
                  <div>
                    <p className="text-blue-700">Priority:</p>
                    <p className="font-semibold text-blue-900">{formData.priority.toUpperCase()}</p>
                  </div>
                  <div>
                    <p className="text-blue-700">Items Count:</p>
                    <p className="font-semibold text-blue-900">{formData.items.length} items</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-blue-700">Purpose:</p>
                    <p className="font-semibold text-blue-900">{formData.purpose}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700 mb-3">Items Summary</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">Item</th>
                        <th className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold">Quantity</th>
                        <th className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold">Est. Price</th>
                        <th className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold">Est. Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.items.map((item, index) => (
                        <tr key={index}>
                          <td className="border border-gray-300 px-3 py-2 text-sm">{item.itemName}</td>
                          <td className="border border-gray-300 px-3 py-2 text-sm text-right">{item.quantity} {item.uom}</td>
                          <td className="border border-gray-300 px-3 py-2 text-sm text-right">₹{item.estimatedPrice.toFixed(2)}</td>
                          <td className="border border-gray-300 px-3 py-2 text-sm text-right">₹{item.totalPrice.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="grid grid-cols-2 gap-2 max-w-md ml-auto">
                  <div className="grid grid-cols-3 gap-2">
                    <label className="col-span-2 text-sm font-medium text-gray-700">Subtotal:</label>
                    <input
                      type="number"
                      value={formData.subtotal}
                      readOnly
                      className="px-2 py-1 border border-gray-300 rounded bg-gray-50 text-right"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <label className="col-span-2 text-sm font-medium text-gray-700">Est. Tax:</label>
                    <input
                      type="number"
                      value={formData.estimatedTax}
                      onChange={(e) => setFormData({ ...formData, estimatedTax: parseFloat(e.target.value) || 0 })}
                      onBlur={calculateTotal}
                      className="px-2 py-1 border border-gray-300 rounded text-right focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="col-span-2 border-t pt-3 grid grid-cols-3 gap-2">
                    <label className="col-span-2 text-base font-bold text-gray-900">Estimated Total:</label>
                    <input
                      type="number"
                      value={formData.subtotal + formData.estimatedTax}
                      readOnly
                      className="px-2 py-1 border-2 border-blue-500 rounded bg-blue-50 text-right font-bold text-blue-900"
                    />
                  </div>
                </div>
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
                className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all"
              >
                Submit Requisition
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ==================== VIEW REQUISITION DETAILS MODAL ====================

interface ViewRequisitionDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  requisition: RequisitionData | null
  onApprove?: () => void
  onReject?: () => void
  onConvertToPO?: () => void
  onEdit?: () => void
}

export const ViewRequisitionDetailsModal: React.FC<ViewRequisitionDetailsModalProps> = ({
  isOpen,
  onClose,
  requisition,
  onApprove,
  onReject,
  onConvertToPO,
  onEdit
}) => {
  if (!isOpen || !requisition) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-700'
      case 'pending_approval': return 'bg-yellow-100 text-yellow-700'
      case 'approved': return 'bg-green-100 text-green-700'
      case 'rejected': return 'bg-red-100 text-red-700'
      case 'converted_to_po': return 'bg-purple-100 text-purple-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-lg shadow-xl w-full  max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white px-3 py-2 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Eye className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">Requisition Details</h2>
              <p className="text-sm opacity-90">{requisition.prNumber}</p>
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
            <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(requisition.status)}`}>
              {requisition.status.toUpperCase().replace('_', ' ')}
            </span>
          </div>

          {/* Requisition Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <User className="w-4 h-4" />
                <p className="text-sm font-medium">Requested By</p>
              </div>
              <p className="text-lg font-bold text-gray-900">{requisition.requestedBy}</p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <Building2 className="w-4 h-4" />
                <p className="text-sm font-medium">Department</p>
              </div>
              <p className="text-lg font-bold text-gray-900">{requisition.department}</p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <DollarSign className="w-4 h-4" />
                <p className="text-sm font-medium">Estimated Total</p>
              </div>
              <p className="text-lg font-bold text-gray-900">₹{requisition.estimatedTotal.toFixed(2)}</p>
            </div>
          </div>

          {/* Additional Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
            <div>
              <p className="text-sm text-gray-600">Request Date</p>
              <p className="font-semibold text-gray-900">{requisition.requestDate}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Required Delivery Date</p>
              <p className="font-semibold text-gray-900">{requisition.deliveryDate}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Priority</p>
              <p className="font-semibold text-gray-900">{requisition.priority.toUpperCase()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Items Count</p>
              <p className="font-semibold text-gray-900">{requisition.items.length} items</p>
            </div>
            {requisition.budgetCode && (
              <div>
                <p className="text-sm text-gray-600">Budget Code</p>
                <p className="font-semibold text-gray-900">{requisition.budgetCode}</p>
              </div>
            )}
            {requisition.costCenter && (
              <div>
                <p className="text-sm text-gray-600">Cost Center</p>
                <p className="font-semibold text-gray-900">{requisition.costCenter}</p>
              </div>
            )}
            <div className="md:col-span-2">
              <p className="text-sm text-gray-600">Purpose</p>
              <p className="font-semibold text-gray-900">{requisition.purpose}</p>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-3">
            <h3 className="font-semibold text-gray-700 mb-3">Requisition Items</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">Item Code</th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">Item Name</th>
                    <th className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold">Quantity</th>
                    <th className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold">Est. Price</th>
                    <th className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold">Est. Total</th>
                  </tr>
                </thead>
                <tbody>
                  {requisition.items.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-3 py-2 text-sm">{item.itemCode}</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">{item.itemName}</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm text-right">{item.quantity} {item.uom}</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm text-right">₹{item.estimatedPrice.toFixed(2)}</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm text-right font-semibold">₹{item.totalPrice.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-100 font-semibold">
                  <tr>
                    <td colSpan={4} className="border border-gray-300 px-3 py-2 text-right">Estimated Total:</td>
                    <td className="border border-gray-300 px-3 py-2 text-right">₹{requisition.estimatedTotal.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Justification */}
          {requisition.justification && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Justification</p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-gray-700">{requisition.justification}</p>
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
            {onEdit && requisition.status === 'draft' && (
              <button
                onClick={onEdit}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
            )}
            {onApprove && requisition.status === 'pending_approval' && (
              <button
                onClick={onApprove}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Approve
              </button>
            )}
            {onReject && requisition.status === 'pending_approval' && (
              <button
                onClick={onReject}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                Reject
              </button>
            )}
            {onConvertToPO && requisition.status === 'approved' && (
              <button
                onClick={onConvertToPO}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" />
                Convert to PO
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ==================== APPROVE REQUISITION MODAL ====================

interface ApproveRequisitionModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: ApprovalDecision) => void
  requisition: RequisitionData | null
}

export const ApproveRequisitionModal: React.FC<ApproveRequisitionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  requisition
}) => {
  const [formData, setFormData] = useState<ApprovalDecision>({
    decision: 'approve',
    comments: '',
    budgetApproved: false,
    requestedInfo: [],
    approverName: 'Current User',
    approvalDate: new Date().toISOString().split('T')[0]
  })

  const [infoText, setInfoText] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const addInfo = () => {
    if (infoText.trim()) {
      setFormData({
        ...formData,
        requestedInfo: [...(formData.requestedInfo || []), infoText]
      })
      setInfoText('')
    }
  }

  const removeInfo = (index: number) => {
    setFormData({
      ...formData,
      requestedInfo: formData.requestedInfo?.filter((_, i) => i !== index)
    })
  }

  const handleSubmit = () => {
    if (formData.decision === 'approve' && !formData.budgetApproved) {
      setErrors({ budget: 'Please confirm budget availability' })
      return
    }
    if (formData.decision === 'request_info' && (!formData.requestedInfo || formData.requestedInfo.length === 0)) {
      setErrors({ info: 'Please specify what information is needed' })
      return
    }
    onSubmit(formData)
  }

  if (!isOpen || !requisition) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-2 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">Approve Requisition</h2>
              <p className="text-sm opacity-90">{requisition.prNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {/* Requisition Summary */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <h3 className="font-semibold text-gray-700 mb-3">Requisition Summary</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-gray-600">Requested By:</p>
                <p className="font-semibold">{requisition.requestedBy}</p>
              </div>
              <div>
                <p className="text-gray-600">Department:</p>
                <p className="font-semibold">{requisition.department}</p>
              </div>
              <div>
                <p className="text-gray-600">Estimated Total:</p>
                <p className="font-semibold text-lg text-green-600">₹{requisition.estimatedTotal.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-gray-600">Items Count:</p>
                <p className="font-semibold">{requisition.items.length} items</p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-600">Purpose:</p>
                <p className="font-semibold">{requisition.purpose}</p>
              </div>
            </div>
          </div>

          {/* Decision */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Decision</label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-green-50 transition-colors"
                style={{ borderColor: formData.decision === 'approve' ? '#10b981' : '#e5e7eb' }}
              >
                <input
                  type="radio"
                  checked={formData.decision === 'approve'}
                  onChange={() => setFormData({ ...formData, decision: 'approve' })}
                  className="text-green-500 focus:ring-green-500"
                />
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="font-medium">Approve</span>
              </label>
              <label className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-yellow-50 transition-colors"
                style={{ borderColor: formData.decision === 'request_info' ? '#f59e0b' : '#e5e7eb' }}
              >
                <input
                  type="radio"
                  checked={formData.decision === 'request_info'}
                  onChange={() => setFormData({ ...formData, decision: 'request_info' })}
                  className="text-yellow-500 focus:ring-yellow-500"
                />
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                <span className="font-medium">Request More Information</span>
              </label>
              <label className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-red-50 transition-colors"
                style={{ borderColor: formData.decision === 'reject' ? '#ef4444' : '#e5e7eb' }}
              >
                <input
                  type="radio"
                  checked={formData.decision === 'reject'}
                  onChange={() => setFormData({ ...formData, decision: 'reject' })}
                  className="text-red-500 focus:ring-red-500"
                />
                <XCircle className="w-5 h-5 text-red-500" />
                <span className="font-medium">Reject</span>
              </label>
            </div>
          </div>

          {/* Budget Approval (only for approve) */}
          {formData.decision === 'approve' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={formData.budgetApproved}
                  onChange={(e) => setFormData({ ...formData, budgetApproved: e.target.checked })}
                  className="mt-1 text-blue-500 focus:ring-blue-500 rounded"
                />
                <div>
                  <p className="font-semibold text-blue-900">Confirm Budget Availability</p>
                  <p className="text-sm text-blue-700">I confirm that funds are available in the budget for this requisition</p>
                </div>
              </label>
              {errors.budget && <p className="text-red-500 text-sm mt-2">{errors.budget}</p>}
            </div>
          )}

          {/* Request Information (only for request_info) */}
          {formData.decision === 'request_info' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Information Needed</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={infoText}
                  onChange={(e) => setInfoText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addInfo()}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="What information do you need?"
                />
                <button
                  onClick={addInfo}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                >
                  Add
                </button>
              </div>
              {errors.info && <p className="text-red-500 text-sm mb-2">{errors.info}</p>}
              <ul className="space-y-2">
                {formData.requestedInfo?.map((info, index) => (
                  <li key={index} className="flex items-start gap-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <span className="flex-1 text-sm text-gray-700">{info}</span>
                    <button onClick={() => removeInfo(index)} className="text-yellow-600 hover:text-yellow-800">
                      <X className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Comments */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Comments {formData.decision === 'reject' && <span className="text-red-500">*</span>}
            </label>
            <textarea
              value={formData.comments}
              onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter your comments..."
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
            className={`px-6 py-2 rounded-lg text-white hover:shadow-lg transition-all ${
              formData.decision === 'approve' ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
              formData.decision === 'reject' ? 'bg-gradient-to-r from-red-500 to-rose-500' :
              'bg-gradient-to-r from-yellow-500 to-orange-500'
            }`}
          >
            {formData.decision === 'approve' ? 'Approve Requisition' :
             formData.decision === 'reject' ? 'Reject Requisition' :
             'Request Information'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ==================== REJECT REQUISITION MODAL ====================

interface RejectRequisitionModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: RejectRequisitionData) => void
  prNumber: string
}

export const RejectRequisitionModal: React.FC<RejectRequisitionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  prNumber
}) => {
  const [formData, setFormData] = useState<RejectRequisitionData>({
    reason: 'budget_constraints',
    detailedComments: '',
    suggestedAlternatives: '',
    allowResubmission: true
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = () => {
    if (!formData.detailedComments.trim()) {
      setErrors({ comments: 'Detailed reason for rejection is required' })
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
            <XCircle className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">Reject Requisition</h2>
              <p className="text-sm opacity-90">{prNumber}</p>
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
                <p className="font-semibold text-red-900">Rejecting Requisition</p>
                <p className="text-sm text-red-700 mt-1">
                  This will reject the requisition and notify the requestor. Please provide a clear reason.
                </p>
              </div>
            </div>
          </div>

          {/* Reason Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rejection Reason</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  checked={formData.reason === 'budget_constraints'}
                  onChange={() => setFormData({ ...formData, reason: 'budget_constraints' })}
                  className="text-red-500 focus:ring-red-500"
                />
                <span>Budget Constraints</span>
              </label>
              <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  checked={formData.reason === 'insufficient_justification'}
                  onChange={() => setFormData({ ...formData, reason: 'insufficient_justification' })}
                  className="text-red-500 focus:ring-red-500"
                />
                <span>Insufficient Justification</span>
              </label>
              <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  checked={formData.reason === 'alternative_available'}
                  onChange={() => setFormData({ ...formData, reason: 'alternative_available' })}
                  className="text-red-500 focus:ring-red-500"
                />
                <span>Alternative Solution Available</span>
              </label>
              <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  checked={formData.reason === 'not_authorized'}
                  onChange={() => setFormData({ ...formData, reason: 'not_authorized' })}
                  className="text-red-500 focus:ring-red-500"
                />
                <span>Not Authorized / Out of Scope</span>
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
              Detailed Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.detailedComments}
              onChange={(e) => setFormData({ ...formData, detailedComments: e.target.value })}
              rows={4}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                errors.comments ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Please provide a detailed explanation for rejecting this requisition..."
            />
            {errors.comments && <p className="text-red-500 text-xs mt-1">{errors.comments}</p>}
          </div>

          {/* Suggested Alternatives */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Suggested Alternatives (Optional)</label>
            <textarea
              value={formData.suggestedAlternatives || ''}
              onChange={(e) => setFormData({ ...formData, suggestedAlternatives: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Suggest alternative solutions or approaches..."
            />
          </div>

          {/* Allow Resubmission */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={formData.allowResubmission}
                onChange={(e) => setFormData({ ...formData, allowResubmission: e.target.checked })}
                className="mt-1 text-red-500 focus:ring-red-500 rounded"
              />
              <div>
                <p className="font-semibold text-gray-900">Allow Resubmission</p>
                <p className="text-sm text-gray-600">Requestor can modify and resubmit this requisition</p>
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
            <XCircle className="w-4 h-4" />
            Reject Requisition
          </button>
        </div>
      </div>
    </div>
  )
}

// ==================== CONVERT TO PO MODAL ====================

interface ConvertToPOModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: ConvertToPOData) => void
  requisition: RequisitionData | null
}

export const ConvertToPOModal: React.FC<ConvertToPOModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  requisition
}) => {
  const [formData, setFormData] = useState<ConvertToPOData>({
    prNumber: requisition?.prNumber || '',
    selectedItems: [],
    vendorId: '',
    vendorName: '',
    deliveryDate: '',
    paymentTerms: 'Net 30',
    specialInstructions: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  React.useEffect(() => {
    if (requisition) {
      setFormData(prev => ({
        ...prev,
        prNumber: requisition.prNumber,
        selectedItems: requisition.items.map(item => item.itemId),
        deliveryDate: requisition.deliveryDate
      }))
    }
  }, [requisition])

  const toggleItem = (itemId: string) => {
    if (formData.selectedItems.includes(itemId)) {
      setFormData({
        ...formData,
        selectedItems: formData.selectedItems.filter(id => id !== itemId)
      })
    } else {
      setFormData({
        ...formData,
        selectedItems: [...formData.selectedItems, itemId]
      })
    }
  }

  const handleSubmit = () => {
    if (!formData.vendorId) {
      setErrors({ vendor: 'Vendor is required' })
      return
    }
    if (formData.selectedItems.length === 0) {
      setErrors({ items: 'Select at least one item to convert' })
      return
    }
    onSubmit(formData)
  }

  if (!isOpen || !requisition) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-lg shadow-xl w-full  max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-2 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">Convert to Purchase Order</h2>
              <p className="text-sm opacity-90">{requisition.prNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {/* Vendor Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Vendor *</label>
              <select
                value={formData.vendorId}
                onChange={(e) => {
                  const vendorId = e.target.value
                  const vendorName = e.target.options[e.target.selectedIndex].text
                  setFormData({ ...formData, vendorId, vendorName })
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.vendor ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select Vendor</option>
                <option value="VEN-001">Tech Supplies Co.</option>
                <option value="VEN-002">Office Furniture Ltd</option>
                <option value="VEN-003">Industrial Parts Inc</option>
                <option value="VEN-004">Chemical Suppliers Inc</option>
              </select>
              {errors.vendor && <p className="text-red-500 text-xs mt-1">{errors.vendor}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expected Delivery Date</label>
              <input
                type="date"
                value={formData.deliveryDate}
                onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms</label>
              <select
                value={formData.paymentTerms}
                onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="Immediate">Immediate</option>
                <option value="Net 15">Net 15</option>
                <option value="Net 30">Net 30</option>
                <option value="Net 45">Net 45</option>
                <option value="Net 60">Net 60</option>
              </select>
            </div>
          </div>

          {/* Items Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Select Items to Convert *</label>
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={formData.selectedItems.length === requisition.items.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, selectedItems: requisition.items.map(item => item.itemId) })
                          } else {
                            setFormData({ ...formData, selectedItems: [] })
                          }
                        }}
                        className="text-purple-500 focus:ring-purple-500 rounded"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Item</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Quantity</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Est. Price</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Est. Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {requisition.items.map((item) => (
                    <tr key={item.itemId} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={formData.selectedItems.includes(item.itemId)}
                          onChange={() => toggleItem(item.itemId)}
                          className="text-purple-500 focus:ring-purple-500 rounded"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{item.itemName}</p>
                        <p className="text-sm text-gray-500">{item.itemCode}</p>
                      </td>
                      <td className="px-4 py-3 text-right">{item.quantity} {item.uom}</td>
                      <td className="px-4 py-3 text-right">₹{item.estimatedPrice.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right font-semibold">₹{item.totalPrice.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {errors.items && <p className="text-red-500 text-sm mt-2">{errors.items}</p>}
            <p className="text-sm text-gray-600 mt-2">
              Selected: {formData.selectedItems.length} of {requisition.items.length} items
            </p>
          </div>

          {/* Special Instructions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Special Instructions (Optional)</label>
            <textarea
              value={formData.specialInstructions || ''}
              onChange={(e) => setFormData({ ...formData, specialInstructions: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Any special instructions for the purchase order..."
            />
          </div>

          {/* Info Box */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <h4 className="font-semibold text-purple-900 mb-2">Conversion Summary</h4>
            <ul className="text-sm text-purple-800 space-y-1">
              <li>• A new PO will be created with the selected items</li>
              <li>• The requisition will be marked as "Converted to PO"</li>
              <li>• You can review and edit the PO before sending to vendor</li>
            </ul>
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
            <ShoppingCart className="w-4 h-4" />
            Create Purchase Order
          </button>
        </div>
      </div>
    </div>
  )
}

// ==================== EXPORT REQUISITIONS MODAL ====================

interface ExportRequisitionsModalProps {
  isOpen: boolean
  onClose: () => void
  onExport: (options: any) => void
}

export const ExportRequisitionsModal: React.FC<ExportRequisitionsModalProps> = ({
  isOpen,
  onClose,
  onExport
}) => {
  const [exportOptions, setExportOptions] = useState({
    format: 'excel',
    dateRange: 'all',
    status: 'all',
    includeItems: true,
    includeComments: false
  })

  const handleExport = () => {
    onExport(exportOptions)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-3 py-2 flex justify-between items-center rounded-t-lg">
          <div className="flex items-center gap-3">
            <Download className="w-6 h-6" />
            <h2 className="text-xl font-bold">Export Requisitions</h2>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-3">
          {/* Export Format */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Export Format</label>
            <div className="grid grid-cols-3 gap-3">
              <label className={`flex items-center justify-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                exportOptions.format === 'excel' ? 'border-teal-500 bg-teal-50' : 'border-gray-300 hover:bg-gray-50'
              }`}>
                <input
                  type="radio"
                  checked={exportOptions.format === 'excel'}
                  onChange={() => setExportOptions({ ...exportOptions, format: 'excel' })}
                  className="text-teal-500 focus:ring-teal-500"
                />
                <span className="font-medium">Excel</span>
              </label>
              <label className={`flex items-center justify-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                exportOptions.format === 'pdf' ? 'border-teal-500 bg-teal-50' : 'border-gray-300 hover:bg-gray-50'
              }`}>
                <input
                  type="radio"
                  checked={exportOptions.format === 'pdf'}
                  onChange={() => setExportOptions({ ...exportOptions, format: 'pdf' })}
                  className="text-teal-500 focus:ring-teal-500"
                />
                <span className="font-medium">PDF</span>
              </label>
              <label className={`flex items-center justify-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                exportOptions.format === 'csv' ? 'border-teal-500 bg-teal-50' : 'border-gray-300 hover:bg-gray-50'
              }`}>
                <input
                  type="radio"
                  checked={exportOptions.format === 'csv'}
                  onChange={() => setExportOptions({ ...exportOptions, format: 'csv' })}
                  className="text-teal-500 focus:ring-teal-500"
                />
                <span className="font-medium">CSV</span>
              </label>
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
            <select
              value={exportOptions.dateRange}
              onChange={(e) => setExportOptions({ ...exportOptions, dateRange: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={exportOptions.status}
              onChange={(e) => setExportOptions({ ...exportOptions, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="pending_approval">Pending Approval</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="converted_to_po">Converted to PO</option>
            </select>
          </div>

          {/* Additional Options */}
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={exportOptions.includeItems}
                onChange={(e) => setExportOptions({ ...exportOptions, includeItems: e.target.checked })}
                className="text-teal-500 focus:ring-teal-500 rounded"
              />
              <span className="text-sm text-gray-700">Include line item details</span>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={exportOptions.includeComments}
                onChange={(e) => setExportOptions({ ...exportOptions, includeComments: e.target.checked })}
                className="text-teal-500 focus:ring-teal-500 rounded"
              />
              <span className="text-sm text-gray-700">Include comments and notes</span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-3 py-2 bg-gray-50 flex justify-between rounded-b-lg">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>
    </div>
  )
}
