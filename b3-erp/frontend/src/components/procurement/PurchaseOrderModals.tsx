"use client"

import React, { useState } from 'react'
import { X, Plus, Trash2, Send, CheckCircle, XCircle, Package, FileText, Mail, AlertTriangle, Edit, Copy, Clock, DollarSign, Truck, User, Calendar, Building2, History } from 'lucide-react'

// ==================== INTERFACES ====================

export interface POItem {
  itemId: string
  itemCode: string
  itemName: string
  description: string
  quantity: number
  unitPrice: number
  totalPrice: number
  uom: string
  taxRate: number
  deliveryDate: string
  notes?: string
}

export interface PurchaseOrderData {
  poNumber: string
  requisitionNumber?: string
  vendorId: string
  vendorName: string
  vendorContact: string
  deliveryDate: string
  deliveryAddress: string
  paymentTerms: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  currency: string
  subtotal: number
  taxAmount: number
  shippingCost: number
  discount: number
  totalAmount: number
  items: POItem[]
  notes?: string
  attachments?: File[]
  status: string
  createdBy: string
  createdDate: string
}

export interface SendPOData {
  to: string[]
  cc?: string[]
  bcc?: string[]
  subject: string
  message: string
  attachPDF: boolean
  sendVia: 'email' | 'portal' | 'both'
  requestAcknowledgment: boolean
}

export interface ReceiveGoodsData {
  grnNumber: string
  receivedDate: string
  receivedBy: string
  items: Array<{
    itemId: string
    orderedQty: number
    receivedQty: number
    rejectedQty: number
    acceptedQty: number
    condition: 'good' | 'damaged' | 'defective'
    inspectionNotes: string
  }>
  overallNotes: string
}

export interface ApprovalData {
  decision: 'approve' | 'reject' | 'request_changes'
  comments: string
  budgetApproved: boolean
  requestedChanges?: string[]
  approverName: string
}

export interface CancelPOData {
  reason: 'duplicate' | 'vendor_issue' | 'requirement_change' | 'budget' | 'other'
  comments: string
  notifyVendor: boolean
  cancellationDate: string
}

// ==================== CREATE PURCHASE ORDER MODAL (3-STEP WIZARD) ====================

interface CreatePOModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: PurchaseOrderData) => void
}

export const CreatePurchaseOrderModal: React.FC<CreatePOModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<PurchaseOrderData>({
    poNumber: `PO-${Date.now()}`,
    vendorId: '',
    vendorName: '',
    vendorContact: '',
    deliveryDate: '',
    deliveryAddress: '',
    paymentTerms: 'Net 30',
    priority: 'medium',
    currency: 'USD',
    subtotal: 0,
    taxAmount: 0,
    shippingCost: 0,
    discount: 0,
    totalAmount: 0,
    items: [],
    status: 'draft',
    createdBy: 'Current User',
    createdDate: new Date().toISOString().split('T')[0]
  })

  const [currentItem, setCurrentItem] = useState<POItem>({
    itemId: '',
    itemCode: '',
    itemName: '',
    description: '',
    quantity: 0,
    unitPrice: 0,
    totalPrice: 0,
    uom: 'Units',
    taxRate: 0,
    deliveryDate: '',
    notes: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const addItem = () => {
    if (!currentItem.itemCode || !currentItem.itemName || currentItem.quantity <= 0) {
      setErrors({ ...errors, item: 'Please fill in all item details' })
      return
    }

    const totalPrice = currentItem.quantity * currentItem.unitPrice
    const updatedItem = { ...currentItem, totalPrice }

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
      unitPrice: 0,
      totalPrice: 0,
      uom: 'Units',
      taxRate: 0,
      deliveryDate: formData.deliveryDate,
      notes: ''
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
    const total = formData.subtotal + formData.taxAmount + formData.shippingCost - formData.discount
    setFormData({ ...formData, totalAmount: total })
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
      if (!formData.vendorId) newErrors.vendor = 'Vendor is required'
      if (!formData.deliveryDate) newErrors.deliveryDate = 'Delivery date is required'
      if (!formData.deliveryAddress) newErrors.deliveryAddress = 'Delivery address is required'
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
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-2 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Plus className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">Create Purchase Order</h2>
              <p className="text-sm opacity-90">{formData.poNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 py-4 bg-gray-50 border-b">
          <div className={`flex items-center gap-2 ${currentStep >= 1 ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-green-600 text-white' : 'bg-gray-300'}`}>1</div>
            <span className="font-medium">PO Details</span>
          </div>
          <div className="w-12 h-0.5 bg-gray-300"></div>
          <div className={`flex items-center gap-2 ${currentStep >= 2 ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-green-600 text-white' : 'bg-gray-300'}`}>2</div>
            <span className="font-medium">Add Items</span>
          </div>
          <div className="w-12 h-0.5 bg-gray-300"></div>
          <div className={`flex items-center gap-2 ${currentStep >= 3 ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 3 ? 'bg-green-600 text-white' : 'bg-gray-300'}`}>3</div>
            <span className="font-medium">Review & Submit</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3">
          {/* Step 1: PO Details */}
          {currentStep === 1 && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vendor *
                  </label>
                  <select
                    value={formData.vendorId}
                    onChange={(e) => {
                      const vendorId = e.target.value
                      const vendorName = e.target.options[e.target.selectedIndex].text
                      setFormData({ ...formData, vendorId, vendorName })
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.vendor ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Vendor</option>
                    <option value="VEN-001">Tech Supplies Co.</option>
                    <option value="VEN-002">Office Furniture Ltd</option>
                    <option value="VEN-003">Industrial Parts Inc</option>
                  </select>
                  {errors.vendor && <p className="text-red-500 text-xs mt-1">{errors.vendor}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Requisition Reference
                  </label>
                  <input
                    type="text"
                    value={formData.requisitionNumber || ''}
                    onChange={(e) => setFormData({ ...formData, requisitionNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="REQ-2024-001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expected Delivery Date *
                  </label>
                  <input
                    type="date"
                    value={formData.deliveryDate}
                    onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Delivery Address *
                  </label>
                  <textarea
                    value={formData.deliveryAddress}
                    onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                    rows={2}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.deliveryAddress ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter delivery address..."
                  />
                  {errors.deliveryAddress && <p className="text-red-500 text-xs mt-1">{errors.deliveryAddress}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms</label>
                  <select
                    value={formData.paymentTerms}
                    onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="Immediate">Immediate</option>
                    <option value="Net 15">Net 15</option>
                    <option value="Net 30">Net 30</option>
                    <option value="Net 45">Net 45</option>
                    <option value="Net 60">Net 60</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="USD">USD</option>
                    <option value="INR">INR</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Additional notes or instructions..."
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
                  Add Item to PO
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Item Code</label>
                    <input
                      type="text"
                      value={currentItem.itemCode}
                      onChange={(e) => setCurrentItem({ ...currentItem, itemCode: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter code"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                    <input
                      type="text"
                      value={currentItem.itemName}
                      onChange={(e) => setCurrentItem({ ...currentItem, itemName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">UOM</label>
                    <select
                      value={currentItem.uom}
                      onChange={(e) => setCurrentItem({ ...currentItem, uom: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="Units">Units</option>
                      <option value="Pieces">Pieces</option>
                      <option value="Kg">Kg</option>
                      <option value="Liters">Liters</option>
                      <option value="Meters">Meters</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                    <input
                      type="number"
                      value={currentItem.quantity}
                      onChange={(e) => setCurrentItem({ ...currentItem, quantity: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price</label>
                    <input
                      type="number"
                      value={currentItem.unitPrice}
                      onChange={(e) => setCurrentItem({ ...currentItem, unitPrice: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Price</label>
                    <input
                      type="number"
                      value={currentItem.quantity * currentItem.unitPrice}
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Item description"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Date</label>
                    <input
                      type="date"
                      value={currentItem.deliveryDate}
                      onChange={(e) => setCurrentItem({ ...currentItem, deliveryDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={addItem}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Item
                </button>
                {errors.item && <p className="text-red-500 text-sm mt-2">{errors.item}</p>}
              </div>

              {/* Items List */}
              {formData.items.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">PO Items ({formData.items.length})</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">Item Code</th>
                          <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">Item Name</th>
                          <th className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold">Quantity</th>
                          <th className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold">Unit Price</th>
                          <th className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold">Total Price</th>
                          <th className="border border-gray-300 px-3 py-2 text-center text-sm font-semibold">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.items.map((item, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="border border-gray-300 px-3 py-2 text-sm">{item.itemCode}</td>
                            <td className="border border-gray-300 px-3 py-2 text-sm">{item.itemName}</td>
                            <td className="border border-gray-300 px-3 py-2 text-sm text-right">{item.quantity} {item.uom}</td>
                            <td className="border border-gray-300 px-3 py-2 text-sm text-right">${item.unitPrice.toFixed(2)}</td>
                            <td className="border border-gray-300 px-3 py-2 text-sm text-right font-semibold">${item.totalPrice.toFixed(2)}</td>
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
                          <td colSpan={4} className="border border-gray-300 px-3 py-2 text-right">Subtotal:</td>
                          <td className="border border-gray-300 px-3 py-2 text-right">${formData.subtotal.toFixed(2)}</td>
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
                <h3 className="font-semibold text-blue-900 mb-3">Review Purchase Order</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-blue-700">Vendor:</p>
                    <p className="font-semibold text-blue-900">{formData.vendorName}</p>
                  </div>
                  <div>
                    <p className="text-blue-700">Delivery Date:</p>
                    <p className="font-semibold text-blue-900">{formData.deliveryDate}</p>
                  </div>
                  <div>
                    <p className="text-blue-700">Payment Terms:</p>
                    <p className="font-semibold text-blue-900">{formData.paymentTerms}</p>
                  </div>
                  <div>
                    <p className="text-blue-700">Priority:</p>
                    <p className="font-semibold text-blue-900">{formData.priority.toUpperCase()}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-blue-700">Delivery Address:</p>
                    <p className="font-semibold text-blue-900">{formData.deliveryAddress}</p>
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
                        <th className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold">Unit Price</th>
                        <th className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.items.map((item, index) => (
                        <tr key={index}>
                          <td className="border border-gray-300 px-3 py-2 text-sm">{item.itemName}</td>
                          <td className="border border-gray-300 px-3 py-2 text-sm text-right">{item.quantity} {item.uom}</td>
                          <td className="border border-gray-300 px-3 py-2 text-sm text-right">${item.unitPrice.toFixed(2)}</td>
                          <td className="border border-gray-300 px-3 py-2 text-sm text-right">${item.totalPrice.toFixed(2)}</td>
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
                    <label className="col-span-2 text-sm font-medium text-gray-700">Tax:</label>
                    <input
                      type="number"
                      value={formData.taxAmount}
                      onChange={(e) => setFormData({ ...formData, taxAmount: parseFloat(e.target.value) || 0 })}
                      onBlur={calculateTotal}
                      className="px-2 py-1 border border-gray-300 rounded text-right focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <label className="col-span-2 text-sm font-medium text-gray-700">Shipping:</label>
                    <input
                      type="number"
                      value={formData.shippingCost}
                      onChange={(e) => setFormData({ ...formData, shippingCost: parseFloat(e.target.value) || 0 })}
                      onBlur={calculateTotal}
                      className="px-2 py-1 border border-gray-300 rounded text-right focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <label className="col-span-2 text-sm font-medium text-gray-700">Discount:</label>
                    <input
                      type="number"
                      value={formData.discount}
                      onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
                      onBlur={calculateTotal}
                      className="px-2 py-1 border border-gray-300 rounded text-right focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div className="col-span-2 border-t pt-3 grid grid-cols-3 gap-2">
                    <label className="col-span-2 text-base font-bold text-gray-900">Total Amount:</label>
                    <input
                      type="number"
                      value={formData.subtotal + formData.taxAmount + formData.shippingCost - formData.discount}
                      readOnly
                      className="px-2 py-1 border-2 border-green-500 rounded bg-green-50 text-right font-bold text-green-900"
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
                className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all"
              >
                Create Purchase Order
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ==================== VIEW PO DETAILS MODAL ====================

interface ViewPODetailsModalProps {
  isOpen: boolean
  onClose: () => void
  po: PurchaseOrderData | null
  onSend?: () => void
  onApprove?: () => void
  onReceive?: () => void
  onCancel?: () => void
  onEdit?: () => void
}

export const ViewPODetailsModal: React.FC<ViewPODetailsModalProps> = ({
  isOpen,
  onClose,
  po,
  onSend,
  onApprove,
  onReceive,
  onCancel,
  onEdit
}) => {
  if (!isOpen || !po) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-700'
      case 'pending_approval': return 'bg-yellow-100 text-yellow-700'
      case 'approved': return 'bg-blue-100 text-blue-700'
      case 'sent': return 'bg-purple-100 text-purple-700'
      case 'delivered': return 'bg-green-100 text-green-700'
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
              <h2 className="text-xl font-bold">Purchase Order Details</h2>
              <p className="text-sm opacity-90">{po.poNumber}</p>
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
            <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(po.status)}`}>
              {po.status.toUpperCase().replace('_', ' ')}
            </span>
          </div>

          {/* PO Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <Building2 className="w-4 h-4" />
                <p className="text-sm font-medium">Vendor</p>
              </div>
              <p className="text-lg font-bold text-gray-900">{po.vendorName}</p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <Calendar className="w-4 h-4" />
                <p className="text-sm font-medium">Delivery Date</p>
              </div>
              <p className="text-lg font-bold text-gray-900">{po.deliveryDate}</p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <DollarSign className="w-4 h-4" />
                <p className="text-sm font-medium">Total Amount</p>
              </div>
              <p className="text-lg font-bold text-gray-900">${po.totalAmount.toFixed(2)}</p>
            </div>
          </div>

          {/* Additional Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
            <div>
              <p className="text-sm text-gray-600">Payment Terms</p>
              <p className="font-semibold text-gray-900">{po.paymentTerms}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Priority</p>
              <p className="font-semibold text-gray-900">{po.priority.toUpperCase()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Created By</p>
              <p className="font-semibold text-gray-900">{po.createdBy}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Created Date</p>
              <p className="font-semibold text-gray-900">{po.createdDate}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-gray-600">Delivery Address</p>
              <p className="font-semibold text-gray-900">{po.deliveryAddress}</p>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-3">
            <h3 className="font-semibold text-gray-700 mb-3">Order Items</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">Item Code</th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">Item Name</th>
                    <th className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold">Quantity</th>
                    <th className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold">Unit Price</th>
                    <th className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {po.items.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-3 py-2 text-sm">{item.itemCode}</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">{item.itemName}</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm text-right">{item.quantity} {item.uom}</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm text-right">${item.unitPrice.toFixed(2)}</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm text-right font-semibold">${item.totalPrice.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-100 font-semibold">
                  <tr>
                    <td colSpan={4} className="border border-gray-300 px-3 py-2 text-right">Total:</td>
                    <td className="border border-gray-300 px-3 py-2 text-right">${po.totalAmount.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Notes */}
          {po.notes && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Notes</p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-gray-700">{po.notes}</p>
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
            {onApprove && (
              <button
                onClick={onApprove}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Approve
              </button>
            )}
            {onSend && (
              <button
                onClick={onSend}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Send to Vendor
              </button>
            )}
            {onReceive && (
              <button
                onClick={onReceive}
                className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors flex items-center gap-2"
              >
                <Package className="w-4 h-4" />
                Receive Goods
              </button>
            )}
            {onCancel && (
              <button
                onClick={onCancel}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                Cancel PO
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ==================== EDIT PURCHASE ORDER MODAL ====================

interface EditPOModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: PurchaseOrderData) => void
  po: PurchaseOrderData | null
}

export const EditPurchaseOrderModal: React.FC<EditPOModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  po
}) => {
  const [formData, setFormData] = useState<PurchaseOrderData>(
    po || {
      poNumber: '',
      vendorId: '',
      vendorName: '',
      vendorContact: '',
      deliveryDate: '',
      deliveryAddress: '',
      paymentTerms: 'Net 30',
      priority: 'medium',
      currency: 'USD',
      subtotal: 0,
      taxAmount: 0,
      shippingCost: 0,
      discount: 0,
      totalAmount: 0,
      items: [],
      status: 'draft',
      createdBy: '',
      createdDate: ''
    }
  )

  const [errors, setErrors] = useState<Record<string, string>>({})

  React.useEffect(() => {
    if (po) setFormData(po)
  }, [po])

  const calculateTotal = () => {
    const total = formData.subtotal + formData.taxAmount + formData.shippingCost - formData.discount
    setFormData({ ...formData, totalAmount: total })
  }

  const handleSubmit = () => {
    if (!formData.vendorId) {
      setErrors({ vendor: 'Vendor is required' })
      return
    }
    calculateTotal()
    onSubmit(formData)
  }

  if (!isOpen || !po) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-lg shadow-xl w-full  max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-3 py-2 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Edit className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">Edit Purchase Order</h2>
              <p className="text-sm opacity-90">{formData.poNumber}</p>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Vendor *</label>
              <select
                value={formData.vendorId}
                onChange={(e) => {
                  const vendorId = e.target.value
                  const vendorName = e.target.options[e.target.selectedIndex].text
                  setFormData({ ...formData, vendorId, vendorName })
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.vendor ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select Vendor</option>
                <option value="VEN-001">Tech Supplies Co.</option>
                <option value="VEN-002">Office Furniture Ltd</option>
                <option value="VEN-003">Industrial Parts Inc</option>
              </select>
              {errors.vendor && <p className="text-red-500 text-xs mt-1">{errors.vendor}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Date</label>
              <input
                type="date"
                value={formData.deliveryDate}
                onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
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

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address</label>
              <textarea
                value={formData.deliveryAddress}
                onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Items Table */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-3">Order Items</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">Item</th>
                    <th className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold">Quantity</th>
                    <th className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold">Unit Price</th>
                    <th className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.items.map((item, index) => (
                    <tr key={index}>
                      <td className="border border-gray-300 px-3 py-2 text-sm">{item.itemName}</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm text-right">{item.quantity} {item.uom}</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm text-right">${item.unitPrice.toFixed(2)}</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm text-right">${item.totalPrice.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="border-t pt-4">
            <div className="grid grid-cols-2 gap-2 max-w-md ml-auto">
              <div className="grid grid-cols-3 gap-2">
                <label className="col-span-2 text-sm font-medium text-gray-700">Tax:</label>
                <input
                  type="number"
                  value={formData.taxAmount}
                  onChange={(e) => setFormData({ ...formData, taxAmount: parseFloat(e.target.value) || 0 })}
                  onBlur={calculateTotal}
                  className="px-2 py-1 border border-gray-300 rounded text-right focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <label className="col-span-2 text-sm font-medium text-gray-700">Shipping:</label>
                <input
                  type="number"
                  value={formData.shippingCost}
                  onChange={(e) => setFormData({ ...formData, shippingCost: parseFloat(e.target.value) || 0 })}
                  onBlur={calculateTotal}
                  className="px-2 py-1 border border-gray-300 rounded text-right focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <label className="col-span-2 text-sm font-medium text-gray-700">Discount:</label>
                <input
                  type="number"
                  value={formData.discount}
                  onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
                  onBlur={calculateTotal}
                  className="px-2 py-1 border border-gray-300 rounded text-right focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
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
            <Edit className="w-4 h-4" />
            Update PO
          </button>
        </div>
      </div>
    </div>
  )
}

// ==================== CLONE PO MODAL ====================

interface ClonePOModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: PurchaseOrderData) => void
  po: PurchaseOrderData | null
}

export const ClonePOModal: React.FC<ClonePOModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  po
}) => {
  const [cloneOptions, setCloneOptions] = useState({
    cloneItems: true,
    cloneVendor: true,
    cloneTerms: true,
    cloneNotes: false
  })

  const [newPONumber, setNewPONumber] = useState(`PO-CLONE-${Date.now()}`)

  const handleClone = () => {
    if (!po) return

    const clonedPO: PurchaseOrderData = {
      ...po,
      poNumber: newPONumber,
      status: 'draft',
      createdDate: new Date().toISOString().split('T')[0],
      items: cloneOptions.cloneItems ? po.items : [],
      vendorId: cloneOptions.cloneVendor ? po.vendorId : '',
      vendorName: cloneOptions.cloneVendor ? po.vendorName : '',
      paymentTerms: cloneOptions.cloneTerms ? po.paymentTerms : 'Net 30',
      notes: cloneOptions.cloneNotes ? po.notes : ''
    }

    onSubmit(clonedPO)
  }

  if (!isOpen || !po) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-3 py-2 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Copy className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">Clone Purchase Order</h2>
              <p className="text-sm opacity-90">Source: {po.poNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {/* New PO Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New PO Number</label>
            <input
              type="text"
              value={newPONumber}
              onChange={(e) => setNewPONumber(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          {/* Clone Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">What to Clone</label>
            <div className="space-y-3">
              <label className="flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-teal-50 transition-colors"
                style={{ borderColor: cloneOptions.cloneItems ? '#14b8a6' : '#e5e7eb' }}
              >
                <input
                  type="checkbox"
                  checked={cloneOptions.cloneItems}
                  onChange={(e) => setCloneOptions({ ...cloneOptions, cloneItems: e.target.checked })}
                  className="mt-1 text-teal-500 focus:ring-teal-500 rounded"
                />
                <div>
                  <p className="font-semibold text-gray-900">Clone Items ({po.items.length} items)</p>
                  <p className="text-sm text-gray-600">Copy all line items from the original PO</p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-teal-50 transition-colors"
                style={{ borderColor: cloneOptions.cloneVendor ? '#14b8a6' : '#e5e7eb' }}
              >
                <input
                  type="checkbox"
                  checked={cloneOptions.cloneVendor}
                  onChange={(e) => setCloneOptions({ ...cloneOptions, cloneVendor: e.target.checked })}
                  className="mt-1 text-teal-500 focus:ring-teal-500 rounded"
                />
                <div>
                  <p className="font-semibold text-gray-900">Clone Vendor ({po.vendorName})</p>
                  <p className="text-sm text-gray-600">Use the same vendor for the new PO</p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-teal-50 transition-colors"
                style={{ borderColor: cloneOptions.cloneTerms ? '#14b8a6' : '#e5e7eb' }}
              >
                <input
                  type="checkbox"
                  checked={cloneOptions.cloneTerms}
                  onChange={(e) => setCloneOptions({ ...cloneOptions, cloneTerms: e.target.checked })}
                  className="mt-1 text-teal-500 focus:ring-teal-500 rounded"
                />
                <div>
                  <p className="font-semibold text-gray-900">Clone Payment Terms ({po.paymentTerms})</p>
                  <p className="text-sm text-gray-600">Copy payment terms, currency, and pricing details</p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-teal-50 transition-colors"
                style={{ borderColor: cloneOptions.cloneNotes ? '#14b8a6' : '#e5e7eb' }}
              >
                <input
                  type="checkbox"
                  checked={cloneOptions.cloneNotes}
                  onChange={(e) => setCloneOptions({ ...cloneOptions, cloneNotes: e.target.checked })}
                  className="mt-1 text-teal-500 focus:ring-teal-500 rounded"
                />
                <div>
                  <p className="font-semibold text-gray-900">Clone Notes</p>
                  <p className="text-sm text-gray-600">Copy notes and special instructions</p>
                </div>
              </label>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-teal-50 border border-teal-200 rounded-lg p-3">
            <h4 className="font-semibold text-teal-900 mb-2">Clone Summary</h4>
            <ul className="text-sm text-teal-800 space-y-1">
              <li>• New PO will be created in DRAFT status</li>
              <li>• You can edit the cloned PO before submission</li>
              <li>• Original PO ({po.poNumber}) will remain unchanged</li>
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
            onClick={handleClone}
            className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Copy className="w-4 h-4" />
            Create Clone
          </button>
        </div>
      </div>
    </div>
  )
}

// ==================== PO HISTORY MODAL ====================

interface POHistoryModalProps {
  isOpen: boolean
  onClose: () => void
  poNumber: string
}

interface POHistoryEvent {
  timestamp: string
  action: string
  user: string
  details: string
  status?: string
}

export const POHistoryModal: React.FC<POHistoryModalProps> = ({
  isOpen,
  onClose,
  poNumber
}) => {
  // Mock history data - would come from API
  const historyEvents: POHistoryEvent[] = [
    {
      timestamp: '2024-01-15 14:30:00',
      action: 'PO Created',
      user: 'John Doe',
      details: 'Purchase order created in draft status',
      status: 'draft'
    },
    {
      timestamp: '2024-01-15 15:45:00',
      action: 'Items Added',
      user: 'John Doe',
      details: 'Added 5 items to purchase order'
    },
    {
      timestamp: '2024-01-16 09:15:00',
      action: 'Submitted for Approval',
      user: 'John Doe',
      details: 'PO submitted for manager approval',
      status: 'pending_approval'
    },
    {
      timestamp: '2024-01-16 11:20:00',
      action: 'Approved',
      user: 'Jane Smith',
      details: 'PO approved by procurement manager',
      status: 'approved'
    },
    {
      timestamp: '2024-01-16 14:00:00',
      action: 'Sent to Vendor',
      user: 'System',
      details: 'PO sent via email to vendor@example.com',
      status: 'sent'
    },
    {
      timestamp: '2024-01-17 10:30:00',
      action: 'Acknowledged',
      user: 'Vendor',
      details: 'Vendor acknowledged receipt and confirmed delivery date',
      status: 'acknowledged'
    }
  ]

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-700'
      case 'pending_approval': return 'bg-yellow-100 text-yellow-700'
      case 'approved': return 'bg-blue-100 text-blue-700'
      case 'sent': return 'bg-purple-100 text-purple-700'
      case 'acknowledged': return 'bg-green-100 text-green-700'
      default: return ''
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-lg shadow-xl w-full  max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-700 to-gray-900 text-white px-3 py-2 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <History className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">Purchase Order History</h2>
              <p className="text-sm opacity-90">{poNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3">
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-300"></div>

            {/* Timeline Events */}
            <div className="space-y-3">
              {historyEvents.map((event, index) => (
                <div key={index} className="relative flex gap-2">
                  {/* Timeline Dot */}
                  <div className="flex-shrink-0 w-16 flex items-start justify-center pt-1">
                    <div className="w-4 h-4 rounded-full bg-blue-500 border-4 border-white shadow-md z-10"></div>
                  </div>

                  {/* Event Card */}
                  <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900">{event.action}</h4>
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          {event.timestamp}
                        </p>
                      </div>
                      {event.status && (
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(event.status)}`}>
                          {event.status.replace('_', ' ').toUpperCase()}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{event.details}</p>
                    <p className="text-xs text-gray-500">by {event.user}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-3 py-2 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

// ==================== ADD NOTE MODAL ====================

interface AddNoteModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (note: string) => void
  poNumber: string
}

export const AddNoteModal: React.FC<AddNoteModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  poNumber
}) => {
  const [note, setNote] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = () => {
    if (!note.trim()) {
      setErrors({ note: 'Note cannot be empty' })
      return
    }
    onSubmit(note)
    setNote('')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-2 flex justify-between items-center rounded-t-lg">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">Add Note</h2>
              <p className="text-sm opacity-90">{poNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Note</label>
            <textarea
              value={note}
              onChange={(e) => {
                setNote(e.target.value)
                setErrors({})
              }}
              rows={6}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                errors.note ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your note here..."
            />
            {errors.note && <p className="text-red-500 text-xs mt-1">{errors.note}</p>}
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-4">
            <p className="text-sm text-amber-800">
              This note will be added to the PO history and visible to all users with access to this purchase order.
            </p>
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
            onClick={handleSubmit}
            className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Note
          </button>
        </div>
      </div>
    </div>
  )
}
