'use client'

import React, { useState } from 'react'
import { inventoryService } from '@/services/InventoryService'
import { X, TruckIcon, Package, ArrowRight, CheckCircle, Clock, MapPin, AlertCircle, FileText, User, Calendar, Edit, Printer, Download } from 'lucide-react'

// ==================== INTERFACES ====================

export interface CreateTransferData {
  transferType: 'warehouse' | 'within-warehouse' | 'zone'
  fromWarehouse: string
  fromZone?: string
  fromBin?: string
  toWarehouse: string
  toZone?: string
  toBin?: string
  transferDate: string
  expectedDelivery: string
  priority: 'normal' | 'urgent' | 'critical'
  reason: string
  items: TransferItem[]
  notes?: string
}

export interface TransferItem {
  itemId: string
  itemName: string
  availableQty: number
  transferQty: number
  uom: string
  serialNumbers?: string[]
  batchNumber?: string
}

export interface Transfer {
  id: string
  transferNumber: string
  status: 'draft' | 'pending' | 'approved' | 'in-transit' | 'completed' | 'cancelled'
  priority: 'normal' | 'urgent' | 'critical'
  transferType: string
  fromLocation: Location
  toLocation: Location
  transferDate: string
  expectedDelivery: string
  reason: string
  items: TransferItemDetail[]
  timeline: TransferEvent[]
  createdBy: string
  createdDate: string
  approvedBy?: string
  dispatchedBy?: string
  receivedBy?: string
  value?: number
}

export interface Location {
  warehouse: string
  zone?: string
  bin?: string
}

export interface TransferItemDetail {
  itemCode: string
  itemName: string
  quantity: number
  receivedQuantity?: number
  uom: string
  batchNumber?: string
  serialNumbers?: string[]
  status: string
}

export interface TransferEvent {
  event: string
  date: string
  user: string
  notes?: string
}

export interface ApproveTransferData {
  decision: 'approve' | 'reject' | 'request-changes'
  notes: string
  rejectionReason?: string
  changeRequests?: string
}

export interface DispatchTransferData {
  dispatchDate: string
  carrier: string
  vehicleNumber?: string
  driverName?: string
  trackingNumber?: string
  itemsVerified: { [itemId: string]: { packed: boolean; condition: string } }
  notes: string
}

export interface ReceiveTransferData {
  receiptDate: string
  receivedBy: string
  itemsReceived: ReceiveTransferItem[]
  discrepancies: Discrepancy[]
  inspectionStatus?: string
  qcNotes?: string
}

export interface ReceiveTransferItem {
  itemId: string
  sentQuantity: number
  receivedQuantity: number
  condition: 'good' | 'damaged'
  confirmed: boolean
}

export interface Discrepancy {
  itemId: string
  reason: string
  action: string
  notes: string
}

// ==================== UTILITY COMPONENTS ====================

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const statusColors: { [key: string]: string } = {
    draft: 'bg-gray-100 text-gray-800',
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-blue-100 text-blue-800',
    'in-transit': 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  }
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
      {status.toUpperCase().replace('-', ' ')}
    </span>
  )
}

const PriorityBadge: React.FC<{ priority: string }> = ({ priority }) => {
  const priorityColors: { [key: string]: string } = {
    normal: 'bg-blue-100 text-blue-800',
    urgent: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800',
  }
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${priorityColors[priority] || 'bg-gray-100 text-gray-800'}`}>
      {priority.toUpperCase()}
    </span>
  )
}

// ==================== 1. CREATE TRANSFER MODAL ====================

interface CreateTransferModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateTransferData, isDraft: boolean) => void
}

export const CreateTransferModal: React.FC<CreateTransferModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<CreateTransferData>({
    transferType: 'warehouse',
    fromWarehouse: '',
    toWarehouse: '',
    transferDate: new Date().toISOString().split('T')[0],
    expectedDelivery: '',
    priority: 'normal',
    reason: '',
    items: [],
    notes: '',
  })

  const [itemRows, setItemRows] = useState<TransferItem[]>([
    { itemId: '', itemName: '', availableQty: 0, transferQty: 0, uom: '' },
  ])

  if (!isOpen) return null

  const handleNext = () => {
    if (currentStep === 1) {
      // Validate transfer details
      if (!formData.fromWarehouse || !formData.toWarehouse) {
        alert('Please select both from and to locations')
        return
      }
      if (formData.fromWarehouse === formData.toWarehouse && formData.transferType === 'warehouse') {
        alert('Source and destination warehouses cannot be the same')
        return
      }
      if (!formData.transferDate || !formData.expectedDelivery) {
        alert('Please provide both transfer and expected delivery dates')
        return
      }
      if (!formData.reason) {
        alert('Please select a reason for the transfer')
        return
      }
    }
    if (currentStep === 2) {
      // Validate items
      const validItems = itemRows.filter(item => item.itemId && item.transferQty > 0)
      if (validItems.length === 0) {
        alert('Please add at least one item to transfer')
        return
      }
      setFormData({ ...formData, items: validItems })
    }
    if (currentStep < 3) setCurrentStep(currentStep + 1)
  }

  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const handleSubmit = (isDraft: boolean) => {
    const validItems = itemRows.filter(item => item.itemId && item.transferQty > 0)
    onSubmit({ ...formData, items: validItems }, isDraft)
  }

  const addItemRow = () => {
    setItemRows([...itemRows, { itemId: '', itemName: '', availableQty: 0, transferQty: 0, uom: '' }])
  }

  const removeItemRow = (index: number) => {
    setItemRows(itemRows.filter((_, i) => i !== index))
  }

  const updateItemRow = (index: number, field: keyof TransferItem, value: any) => {
    const updated = [...itemRows]
    updated[index] = { ...updated[index], [field]: value }
    setItemRows(updated)
  }

  const lookupAvailableQty = async (index: number, itemId: string) => {
    const ref = itemId.trim()
    if (!ref) return
    try {
      const balances = await inventoryService.getStockBalances(
        formData.fromWarehouse ? { itemId: ref, warehouseId: formData.fromWarehouse } : { itemId: ref }
      )
      const total = (balances || []).reduce(
        (sum: number, b: any) => sum + Number(b.availableQuantity ?? b.available ?? b.quantity ?? 0),
        0
      )
      const uom = (balances || [])[0]?.uom ?? ''
      setItemRows((rows) => {
        const updated = [...rows]
        if (updated[index]) {
          updated[index] = { ...updated[index], availableQty: total, uom: uom || updated[index].uom }
        }
        return updated
      })
    } catch {
      // Leave availableQty as entered; user can still proceed with manual entry.
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-lg shadow-xl w-full  max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 py-2 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Package className="w-6 h-6" />
            <h2 className="text-xl font-bold">Create Transfer Request</h2>
          </div>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="px-3 py-2 bg-gray-50 border-b">
          <div className="flex items-center justify-between">
            <div className={`flex items-center ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
                1
              </div>
              <span className="ml-2 font-medium">Transfer Details</span>
            </div>
            <div className="flex-1 h-0.5 bg-gray-300 mx-4"></div>
            <div className={`flex items-center ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
                2
              </div>
              <span className="ml-2 font-medium">Select Items</span>
            </div>
            <div className="flex-1 h-0.5 bg-gray-300 mx-4"></div>
            <div className={`flex items-center ${currentStep >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
                3
              </div>
              <span className="ml-2 font-medium">Review & Submit</span>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-3">
          {/* Step 1: Transfer Details */}
          {currentStep === 1 && (
            <div className="space-y-3">
              {/* Transfer Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Transfer Type *</label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="transferType"
                      value="warehouse"
                      checked={formData.transferType === 'warehouse'}
                      onChange={(e) => setFormData({ ...formData, transferType: e.target.value as any })}
                      className="text-blue-600"
                    />
                    <span>Warehouse to Warehouse</span>
                  </label>
                  <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="transferType"
                      value="within-warehouse"
                      checked={formData.transferType === 'within-warehouse'}
                      onChange={(e) => setFormData({ ...formData, transferType: e.target.value as any })}
                      className="text-blue-600"
                    />
                    <span>Within Warehouse</span>
                  </label>
                  <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="transferType"
                      value="zone"
                      checked={formData.transferType === 'zone'}
                      onChange={(e) => setFormData({ ...formData, transferType: e.target.value as any })}
                      className="text-blue-600"
                    />
                    <span>Zone to Zone</span>
                  </label>
                </div>
              </div>

              {/* From Location */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-900 flex items-center">
                    <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                    From Location
                  </h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Warehouse *</label>
                    <select
                      value={formData.fromWarehouse}
                      onChange={(e) => setFormData({ ...formData, fromWarehouse: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Warehouse</option>
                      <option value="WH-001">Main Warehouse</option>
                      <option value="WH-002">Distribution Center</option>
                      <option value="WH-003">Regional Warehouse</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Zone</label>
                    <select
                      value={formData.fromZone || ''}
                      onChange={(e) => setFormData({ ...formData, fromZone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Zone</option>
                      <option value="A">Zone A</option>
                      <option value="B">Zone B</option>
                      <option value="C">Zone C</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bin</label>
                    <select
                      value={formData.fromBin || ''}
                      onChange={(e) => setFormData({ ...formData, fromBin: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Bin</option>
                      <option value="A-01">Bin A-01</option>
                      <option value="A-02">Bin A-02</option>
                      <option value="B-01">Bin B-01</option>
                    </select>
                  </div>
                </div>

                {/* To Location */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-900 flex items-center">
                    <MapPin className="w-5 h-5 mr-2 text-green-600" />
                    To Location
                  </h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Warehouse *</label>
                    <select
                      value={formData.toWarehouse}
                      onChange={(e) => setFormData({ ...formData, toWarehouse: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Warehouse</option>
                      <option value="WH-001">Main Warehouse</option>
                      <option value="WH-002">Distribution Center</option>
                      <option value="WH-003">Regional Warehouse</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Zone</label>
                    <select
                      value={formData.toZone || ''}
                      onChange={(e) => setFormData({ ...formData, toZone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Zone</option>
                      <option value="A">Zone A</option>
                      <option value="B">Zone B</option>
                      <option value="C">Zone C</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bin</label>
                    <select
                      value={formData.toBin || ''}
                      onChange={(e) => setFormData({ ...formData, toBin: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Bin</option>
                      <option value="A-01">Bin A-01</option>
                      <option value="A-02">Bin A-02</option>
                      <option value="B-01">Bin B-01</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Dates and Priority */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Transfer Date *</label>
                  <input
                    type="date"
                    value={formData.transferDate}
                    onChange={(e) => setFormData({ ...formData, transferDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expected Delivery Date *</label>
                  <input
                    type="date"
                    value={formData.expectedDelivery}
                    onChange={(e) => setFormData({ ...formData, expectedDelivery: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority *</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="normal">Normal</option>
                    <option value="urgent">Urgent</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reason *</label>
                  <select
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Reason</option>
                    <option value="rebalancing">Inventory Rebalancing</option>
                    <option value="demand">Meet Demand</option>
                    <option value="consolidation">Stock Consolidation</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Select Items */}
          {currentStep === 2 && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Transfer Items</h3>
                <button
                  onClick={addItemRow}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  + Add Item
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Available</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transfer Qty *</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">UOM</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Batch/Serial</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {itemRows.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={item.itemName}
                            onChange={(e) => {
                              updateItemRow(index, 'itemName', e.target.value)
                              updateItemRow(index, 'itemId', e.target.value)
                            }}
                            onBlur={(e) => lookupAvailableQty(index, e.target.value)}
                            placeholder="Item code / name"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm font-medium text-gray-900">{item.availableQty}</span>
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            value={item.transferQty || ''}
                            onChange={(e) => {
                              const qty = parseInt(e.target.value) || 0
                              if (qty > item.availableQty) {
                                alert('Transfer quantity cannot exceed available quantity')
                                return
                              }
                              updateItemRow(index, 'transferQty', qty)
                            }}
                            min="0"
                            max={item.availableQty}
                            className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-900">{item.uom}</span>
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={item.batchNumber || ''}
                            onChange={(e) => updateItemRow(index, 'batchNumber', e.target.value)}
                            placeholder="Batch/Serial"
                            className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => removeItemRow(index)}
                            className="text-red-600 hover:text-red-800"
                            disabled={itemRows.length === 1}
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Step 3: Review & Submit */}
          {currentStep === 3 && (
            <div className="space-y-3">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Transfer Summary</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Transfer Type:</span>
                    <span className="ml-2 text-gray-900">{formData.transferType.replace('-', ' ').toUpperCase()}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Priority:</span>
                    <span className="ml-2"><PriorityBadge priority={formData.priority} /></span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">From:</span>
                    <span className="ml-2 text-gray-900">{formData.fromWarehouse} {formData.fromZone && `- Zone ${formData.fromZone}`} {formData.fromBin && `- ${formData.fromBin}`}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">To:</span>
                    <span className="ml-2 text-gray-900">{formData.toWarehouse} {formData.toZone && `- Zone ${formData.toZone}`} {formData.toBin && `- ${formData.toBin}`}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Transfer Date:</span>
                    <span className="ml-2 text-gray-900">{formData.transferDate}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Expected Delivery:</span>
                    <span className="ml-2 text-gray-900">{formData.expectedDelivery}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Reason:</span>
                    <span className="ml-2 text-gray-900">{formData.reason}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Items to Transfer ({itemRows.filter(i => i.itemId).length})</h3>
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">UOM</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Batch/Serial</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {itemRows.filter(i => i.itemId).map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3 text-sm text-gray-900">{item.itemName}</td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.transferQty}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{item.uom}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{item.batchNumber || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={4}
                  placeholder="Add any additional notes or instructions..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                ></textarea>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-3 py-2 bg-gray-50 border-t flex justify-between">
          <button
            onClick={currentStep === 1 ? onClose : handlePrevious}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {currentStep === 1 ? 'Cancel' : 'Previous'}
          </button>
          <div className="flex space-x-3">
            {currentStep === 3 && (
              <button
                onClick={() => handleSubmit(true)}
                className="px-6 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Save as Draft
              </button>
            )}
            {currentStep < 3 ? (
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                onClick={() => handleSubmit(false)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Transfer
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ==================== 2. VIEW TRANSFER DETAILS MODAL ====================

interface ViewTransferDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  transfer: Transfer | null
  onEdit?: () => void
  onApprove?: () => void
  onReject?: () => void
  onDispatch?: () => void
  onReceive?: () => void
  onCancel?: () => void
  onPrint?: () => void
}

export const ViewTransferDetailsModal: React.FC<ViewTransferDetailsModalProps> = ({
  isOpen,
  onClose,
  transfer,
  onEdit,
  onApprove,
  onReject,
  onDispatch,
  onReceive,
  onCancel,
  onPrint,
}) => {
  if (!isOpen || !transfer) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-lg shadow-xl w-full  max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-3 py-2 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <FileText className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">Transfer Details</h2>
              <p className="text-sm text-indigo-100">{transfer.transferNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {/* Transfer Header */}
          <div className="bg-gray-50 rounded-lg p-3 flex justify-between items-start">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <StatusBadge status={transfer.status} />
                <PriorityBadge priority={transfer.priority} />
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">Type:</span> {transfer.transferType}
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">Reason:</span> {transfer.reason}
              </div>
            </div>
            <div className="text-right text-sm text-gray-600">
              <div><span className="font-medium">Transfer Date:</span> {transfer.transferDate}</div>
              <div><span className="font-medium">Expected Delivery:</span> {transfer.expectedDelivery}</div>
              {transfer.value && <div className="text-lg font-bold text-gray-900 mt-2">${transfer.value.toLocaleString()}</div>}
            </div>
          </div>

          {/* Locations */}
          <div className="grid grid-cols-3 gap-2 items-center">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center text-blue-700 mb-2">
                <MapPin className="w-5 h-5 mr-2" />
                <span className="font-semibold">From Location</span>
              </div>
              <div className="text-sm text-gray-900">
                <div className="font-medium">{transfer.fromLocation.warehouse}</div>
                {transfer.fromLocation.zone && <div>Zone: {transfer.fromLocation.zone}</div>}
                {transfer.fromLocation.bin && <div>Bin: {transfer.fromLocation.bin}</div>}
              </div>
            </div>

            <div className="flex justify-center">
              <ArrowRight className="w-8 h-8 text-gray-400" />
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center text-green-700 mb-2">
                <MapPin className="w-5 h-5 mr-2" />
                <span className="font-semibold">To Location</span>
              </div>
              <div className="text-sm text-gray-900">
                <div className="font-medium">{transfer.toLocation.warehouse}</div>
                {transfer.toLocation.zone && <div>Zone: {transfer.toLocation.zone}</div>}
                {transfer.toLocation.bin && <div>Bin: {transfer.toLocation.bin}</div>}
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Transfer Items</h3>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item Code</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Received</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">UOM</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Batch/Serial</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transfer.items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.itemCode}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.itemName}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.quantity}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.receivedQuantity || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.uom}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.batchNumber || item.serialNumbers?.join(', ') || '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.status === 'received' ? 'bg-green-100 text-green-800' :
                          item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {item.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Timeline */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Transfer Timeline</h3>
            <div className="space-y-2">
              {transfer.timeline.map((event, index) => (
                <div key={index} className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900">{event.event}</p>
                      <p className="text-sm text-gray-500">{event.date}</p>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 mt-1">
                      <User className="w-4 h-4 mr-1" />
                      <span>{event.user}</span>
                    </div>
                    {event.notes && <p className="text-sm text-gray-600 mt-1">{event.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Attachments */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Attachments</h3>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center text-gray-500">
              <FileText className="w-8 h-8 mb-2 text-gray-400" />
              <p className="text-sm">No attachments available</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-3 py-2 bg-gray-50 border-t flex justify-between">
          <div className="flex space-x-2">
            {transfer.status === 'draft' && onEdit && (
              <button
                onClick={onEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </button>
            )}
            {transfer.status === 'pending' && onApprove && (
              <>
                <button
                  onClick={onApprove}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve
                </button>
                <button
                  onClick={onReject}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
                >
                  <X className="w-4 h-4 mr-2" />
                  Reject
                </button>
              </>
            )}
            {transfer.status === 'approved' && onDispatch && (
              <button
                onClick={onDispatch}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center"
              >
                <TruckIcon className="w-4 h-4 mr-2" />
                Dispatch
              </button>
            )}
            {transfer.status === 'in-transit' && onReceive && (
              <button
                onClick={onReceive}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
              >
                <Package className="w-4 h-4 mr-2" />
                Receive
              </button>
            )}
            {transfer.status !== 'completed' && transfer.status !== 'cancelled' && onCancel && (
              <button
                onClick={onCancel}
                className="px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              >
                Cancel Transfer
              </button>
            )}
          </div>
          <div className="flex space-x-2">
            {onPrint && (
              <button
                onClick={onPrint}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
              >
                <Printer className="w-4 h-4 mr-2" />
                Print
              </button>
            )}
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ==================== 3. APPROVE TRANSFER MODAL ====================

interface ApproveTransferModalProps {
  isOpen: boolean
  onClose: () => void
  transfer: Transfer | null
  onSubmit: (data: ApproveTransferData) => void
}

export const ApproveTransferModal: React.FC<ApproveTransferModalProps> = ({
  isOpen,
  onClose,
  transfer,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<ApproveTransferData>({
    decision: 'approve',
    notes: '',
    rejectionReason: '',
    changeRequests: '',
  })

  if (!isOpen || !transfer) return null

  const handleSubmit = () => {
    if (formData.decision === 'reject' && !formData.notes) {
      alert('Please provide comments for rejection')
      return
    }
    if (formData.decision === 'request-changes' && !formData.changeRequests) {
      alert('Please specify the change requests')
      return
    }
    onSubmit(formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-3 py-2 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-6 h-6" />
            <h2 className="text-xl font-bold">Approve Transfer Request</h2>
          </div>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {/* Transfer Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h3 className="font-semibold text-gray-900 mb-3">Transfer Summary</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-600">Transfer Number:</span>
                <span className="ml-2 font-medium text-gray-900">{transfer.transferNumber}</span>
              </div>
              <div>
                <span className="text-gray-600">Priority:</span>
                <span className="ml-2"><PriorityBadge priority={transfer.priority} /></span>
              </div>
              <div>
                <span className="text-gray-600">From:</span>
                <span className="ml-2 font-medium text-gray-900">{transfer.fromLocation.warehouse}</span>
              </div>
              <div>
                <span className="text-gray-600">To:</span>
                <span className="ml-2 font-medium text-gray-900">{transfer.toLocation.warehouse}</span>
              </div>
              <div>
                <span className="text-gray-600">Items Count:</span>
                <span className="ml-2 font-medium text-gray-900">{transfer.items.length}</span>
              </div>
              <div>
                <span className="text-gray-600">Total Value:</span>
                <span className="ml-2 font-medium text-gray-900">${transfer.value?.toLocaleString() || '0'}</span>
              </div>
            </div>
          </div>

          {/* Decision */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Decision *</label>
            <div className="space-y-2">
              <label className="flex items-center space-x-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 border-green-300 bg-green-50">
                <input
                  type="radio"
                  name="decision"
                  value="approve"
                  checked={formData.decision === 'approve'}
                  onChange={(e) => setFormData({ ...formData, decision: e.target.value as any })}
                  className="text-green-600"
                />
                <div>
                  <div className="font-medium text-gray-900">Approve Transfer</div>
                  <div className="text-sm text-gray-600">Approve and proceed with transfer</div>
                </div>
              </label>
              <label className="flex items-center space-x-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 border-gray-300">
                <input
                  type="radio"
                  name="decision"
                  value="reject"
                  checked={formData.decision === 'reject'}
                  onChange={(e) => setFormData({ ...formData, decision: e.target.value as any })}
                  className="text-red-600"
                />
                <div>
                  <div className="font-medium text-gray-900">Reject Transfer</div>
                  <div className="text-sm text-gray-600">Reject this transfer request</div>
                </div>
              </label>
              <label className="flex items-center space-x-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 border-gray-300">
                <input
                  type="radio"
                  name="decision"
                  value="request-changes"
                  checked={formData.decision === 'request-changes'}
                  onChange={(e) => setFormData({ ...formData, decision: e.target.value as any })}
                  className="text-yellow-600"
                />
                <div>
                  <div className="font-medium text-gray-900">Request Changes</div>
                  <div className="text-sm text-gray-600">Send back for modifications</div>
                </div>
              </label>
            </div>
          </div>

          {/* Conditional Fields */}
          {formData.decision === 'approve' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Approval Notes (Optional)</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={4}
                placeholder="Add any notes or instructions for this approval..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              ></textarea>
            </div>
          )}

          {formData.decision === 'reject' && (
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rejection Reason *</label>
                <select
                  value={formData.rejectionReason}
                  onChange={(e) => setFormData({ ...formData, rejectionReason: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">Select Reason</option>
                  <option value="insufficient-stock">Insufficient Stock at Source</option>
                  <option value="incorrect-location">Incorrect Location Information</option>
                  <option value="unauthorized">Unauthorized Transfer</option>
                  <option value="duplicate">Duplicate Request</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Comments *</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={4}
                  placeholder="Provide detailed comments for rejection..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                ></textarea>
              </div>
            </div>
          )}

          {formData.decision === 'request-changes' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Change Requests *</label>
              <textarea
                value={formData.changeRequests}
                onChange={(e) => setFormData({ ...formData, changeRequests: e.target.value })}
                rows={4}
                placeholder="Specify what changes are needed..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              ></textarea>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-3 py-2 bg-gray-50 border-t flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className={`px-6 py-2 rounded-lg text-white transition-colors ${
              formData.decision === 'approve'
                ? 'bg-green-600 hover:bg-green-700'
                : formData.decision === 'reject'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-yellow-600 hover:bg-yellow-700'
            }`}
          >
            Submit Decision
          </button>
        </div>
      </div>
    </div>
  )
}

// ==================== 4. DISPATCH TRANSFER MODAL ====================

interface DispatchTransferModalProps {
  isOpen: boolean
  onClose: () => void
  transfer: Transfer | null
  onSubmit: (data: DispatchTransferData) => void
}

export const DispatchTransferModal: React.FC<DispatchTransferModalProps> = ({
  isOpen,
  onClose,
  transfer,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<DispatchTransferData>({
    dispatchDate: new Date().toISOString().slice(0, 16),
    carrier: '',
    vehicleNumber: '',
    driverName: '',
    trackingNumber: '',
    itemsVerified: {},
    notes: '',
  })

  const [itemsChecklist, setItemsChecklist] = useState<{ [key: string]: { packed: boolean; condition: string } }>({})

  if (!isOpen || !transfer) return null

  const handleItemCheck = (itemId: string, field: 'packed' | 'condition', value: boolean | string) => {
    setItemsChecklist({
      ...itemsChecklist,
      [itemId]: {
        ...itemsChecklist[itemId],
        [field]: value,
      },
    })
  }

  const allItemsVerified = transfer.items.every((item) => itemsChecklist[item.itemCode]?.packed)

  const handleSubmit = () => {
    if (!formData.carrier) {
      alert('Please select carrier/method')
      return
    }
    if (!allItemsVerified) {
      alert('Please verify all items are packed')
      return
    }
    onSubmit({ ...formData, itemsVerified: itemsChecklist })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white px-3 py-2 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <TruckIcon className="w-6 h-6" />
            <h2 className="text-xl font-bold">Dispatch Transfer</h2>
          </div>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {/* Transfer Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h3 className="font-semibold text-gray-900 mb-2">Transfer: {transfer.transferNumber}</h3>
            <div className="text-sm text-gray-600">
              <span className="font-medium">From:</span> {transfer.fromLocation.warehouse} → <span className="font-medium">To:</span> {transfer.toLocation.warehouse}
            </div>
          </div>

          {/* Dispatch Details */}
          <div className="grid grid-cols-2 gap-2">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Dispatch Date & Time *</label>
              <input
                type="datetime-local"
                value={formData.dispatchDate}
                onChange={(e) => setFormData({ ...formData, dispatchDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Carrier/Method *</label>
              <select
                value={formData.carrier}
                onChange={(e) => setFormData({ ...formData, carrier: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              >
                <option value="">Select Carrier/Method</option>
                <option value="internal-transport">Internal Transport</option>
                <option value="external-carrier">External Carrier</option>
                <option value="hand-carry">Hand Carry</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Number</label>
              <input
                type="text"
                value={formData.vehicleNumber}
                onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                placeholder="e.g., VEH-001"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Driver Name</label>
              <input
                type="text"
                value={formData.driverName}
                onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                placeholder="Driver name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Tracking Number (Optional)</label>
              <input
                type="text"
                value={formData.trackingNumber}
                onChange={(e) => setFormData({ ...formData, trackingNumber: e.target.value })}
                placeholder="Tracking/AWB number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Items Verification */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Items Verification *</h3>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Packed</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Condition</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transfer.items.map((item) => (
                    <tr key={item.itemCode}>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.itemName}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.quantity} {item.uom}</td>
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={itemsChecklist[item.itemCode]?.packed || false}
                          onChange={(e) => handleItemCheck(item.itemCode, 'packed', e.target.checked)}
                          className="w-4 h-4 text-yellow-600 rounded focus:ring-yellow-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={itemsChecklist[item.itemCode]?.condition || ''}
                          onChange={(e) => handleItemCheck(item.itemCode, 'condition', e.target.value)}
                          className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                        >
                          <option value="">Select</option>
                          <option value="good">Good</option>
                          <option value="damaged">Damaged</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!allItemsVerified && (
              <div className="mt-2 flex items-center text-sm text-yellow-700">
                <AlertCircle className="w-4 h-4 mr-1" />
                Please confirm all items are packed before dispatching
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Dispatch Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              placeholder="Add any dispatch notes or special instructions..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            ></textarea>
          </div>
        </div>

        {/* Footer */}
        <div className="px-3 py-2 bg-gray-50 border-t flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!allItemsVerified}
            className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Dispatch Transfer
          </button>
        </div>
      </div>
    </div>
  )
}

// ==================== 5. RECEIVE TRANSFER MODAL ====================

interface ReceiveTransferModalProps {
  isOpen: boolean
  onClose: () => void
  transfer: Transfer | null
  onSubmit: (data: ReceiveTransferData, isPartial: boolean) => void
  onReject: () => void
}

export const ReceiveTransferModal: React.FC<ReceiveTransferModalProps> = ({
  isOpen,
  onClose,
  transfer,
  onSubmit,
  onReject,
}) => {
  const [formData, setFormData] = useState<ReceiveTransferData>({
    receiptDate: new Date().toISOString().slice(0, 16),
    receivedBy: '',
    itemsReceived: [],
    discrepancies: [],
    inspectionStatus: '',
    qcNotes: '',
  })

  const [receivedItems, setReceivedItems] = useState<{ [key: string]: ReceiveTransferItem }>({})
  const [discrepancyInfo, setDiscrepancyInfo] = useState<{ [key: string]: { reason: string; action: string; notes: string } }>({})

  if (!isOpen || !transfer) return null

  const updateReceivedItem = (itemCode: string, field: keyof ReceiveTransferItem, value: any) => {
    const item = transfer.items.find((i) => i.itemCode === itemCode)
    if (!item) return

    setReceivedItems({
      ...receivedItems,
      [itemCode]: {
        itemId: itemCode,
        sentQuantity: item.quantity,
        receivedQuantity: field === 'receivedQuantity' ? value : receivedItems[itemCode]?.receivedQuantity || item.quantity,
        condition: field === 'condition' ? value : receivedItems[itemCode]?.condition || 'good',
        confirmed: field === 'confirmed' ? value : receivedItems[itemCode]?.confirmed || false,
      },
    })
  }

  const hasDiscrepancies = Object.values(receivedItems).some(
    (item) => item.receivedQuantity !== item.sentQuantity
  )

  const allItemsConfirmed = transfer.items.every((item) => receivedItems[item.itemCode]?.confirmed)

  const handleSubmit = (isPartial: boolean) => {
    if (!formData.receivedBy) {
      alert('Please enter receiver name')
      return
    }
    if (!allItemsConfirmed) {
      alert('Please confirm all items')
      return
    }
    if (hasDiscrepancies && Object.keys(discrepancyInfo).length === 0) {
      alert('Please provide discrepancy information for items with differences')
      return
    }

    const discrepancies = Object.entries(discrepancyInfo).map(([itemId, info]) => ({
      itemId,
      ...info,
    }))

    onSubmit(
      {
        ...formData,
        itemsReceived: Object.values(receivedItems),
        discrepancies,
      },
      isPartial
    )
  }

  const itemsFullyReceived = Object.values(receivedItems).filter(
    (item) => item.receivedQuantity === item.sentQuantity
  ).length
  const itemsWithDiscrepancies = Object.values(receivedItems).filter(
    (item) => item.receivedQuantity !== item.sentQuantity
  ).length
  const totalValue = transfer.value || 0

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-lg shadow-xl w-full  max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-3 py-2 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Package className="w-6 h-6" />
            <h2 className="text-xl font-bold">Receive Transfer</h2>
          </div>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {/* Transfer Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h3 className="font-semibold text-gray-900 mb-2">Transfer: {transfer.transferNumber}</h3>
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
              <div>
                <span className="font-medium">From:</span> {transfer.fromLocation.warehouse}
              </div>
              <div>
                <span className="font-medium">To:</span> {transfer.toLocation.warehouse}
              </div>
              <div>
                <span className="font-medium">Dispatched By:</span> {transfer.dispatchedBy || 'N/A'}
              </div>
              <div>
                <span className="font-medium">Expected:</span> {transfer.expectedDelivery}
              </div>
            </div>
          </div>

          {/* Receipt Details */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Receipt Date & Time *</label>
              <input
                type="datetime-local"
                value={formData.receiptDate}
                onChange={(e) => setFormData({ ...formData, receiptDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Received By *</label>
              <input
                type="text"
                value={formData.receivedBy}
                onChange={(e) => setFormData({ ...formData, receivedBy: e.target.value })}
                placeholder="Enter receiver name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Items Receipt */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Items Receipt *</h3>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sent Qty</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Received Qty</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Difference</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Condition</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Confirm</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transfer.items.map((item) => {
                    const receivedItem = receivedItems[item.itemCode] || {
                      itemId: item.itemCode,
                      sentQuantity: item.quantity,
                      receivedQuantity: item.quantity,
                      condition: 'good' as const,
                      confirmed: false,
                    }
                    const difference = receivedItem.receivedQuantity - receivedItem.sentQuantity

                    return (
                      <tr key={item.itemCode} className={difference !== 0 ? 'bg-yellow-50' : ''}>
                        <td className="px-4 py-3 text-sm text-gray-900">{item.itemName}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{item.quantity} {item.uom}</td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            value={receivedItem.receivedQuantity}
                            onChange={(e) => updateReceivedItem(item.itemCode, 'receivedQuantity', parseInt(e.target.value) || 0)}
                            min="0"
                            className="w-24 px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`text-sm font-medium ${
                              difference > 0 ? 'text-green-600' : difference < 0 ? 'text-red-600' : 'text-gray-600'
                            }`}
                          >
                            {difference > 0 ? '+' : ''}{difference}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={receivedItem.condition}
                            onChange={(e) => updateReceivedItem(item.itemCode, 'condition', e.target.value)}
                            className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          >
                            <option value="good">Good</option>
                            <option value="damaged">Damaged</option>
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={receivedItem.confirmed}
                            onChange={(e) => updateReceivedItem(item.itemCode, 'confirmed', e.target.checked)}
                            className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                          />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Discrepancy Section */}
          {hasDiscrepancies && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 text-yellow-600" />
                Discrepancy Information Required
              </h3>
              {Object.values(receivedItems)
                .filter((item) => item.receivedQuantity !== item.sentQuantity)
                .map((item) => (
                  <div key={item.itemId} className="mb-2 pb-4 border-b border-yellow-300 last:border-b-0">
                    <p className="font-medium text-gray-900 mb-3">
                      {transfer.items.find((i) => i.itemCode === item.itemId)?.itemName} (Diff: {item.receivedQuantity - item.sentQuantity})
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Reason *</label>
                        <select
                          value={discrepancyInfo[item.itemId]?.reason || ''}
                          onChange={(e) =>
                            setDiscrepancyInfo({
                              ...discrepancyInfo,
                              [item.itemId]: { ...discrepancyInfo[item.itemId], reason: e.target.value, action: discrepancyInfo[item.itemId]?.action || '', notes: discrepancyInfo[item.itemId]?.notes || '' },
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-yellow-500"
                        >
                          <option value="">Select Reason</option>
                          <option value="damaged-transit">Damaged in Transit</option>
                          <option value="missing">Missing Items</option>
                          <option value="excess">Excess Items</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Action *</label>
                        <select
                          value={discrepancyInfo[item.itemId]?.action || ''}
                          onChange={(e) =>
                            setDiscrepancyInfo({
                              ...discrepancyInfo,
                              [item.itemId]: { ...discrepancyInfo[item.itemId], action: e.target.value, reason: discrepancyInfo[item.itemId]?.reason || '', notes: discrepancyInfo[item.itemId]?.notes || '' },
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-yellow-500"
                        >
                          <option value="">Select Action</option>
                          <option value="adjust-inventory">Adjust Inventory</option>
                          <option value="shortage-report">Create Shortage Report</option>
                          <option value="return-sender">Return to Sender</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                        <textarea
                          value={discrepancyInfo[item.itemId]?.notes || ''}
                          onChange={(e) =>
                            setDiscrepancyInfo({
                              ...discrepancyInfo,
                              [item.itemId]: { ...discrepancyInfo[item.itemId], notes: e.target.value, reason: discrepancyInfo[item.itemId]?.reason || '', action: discrepancyInfo[item.itemId]?.action || '' },
                            })
                          }
                          rows={2}
                          placeholder="Additional notes..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-yellow-500"
                        ></textarea>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* Quality Check */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Inspection Status (Optional)</label>
              <select
                value={formData.inspectionStatus || ''}
                onChange={(e) => setFormData({ ...formData, inspectionStatus: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Select Status</option>
                <option value="passed">Passed</option>
                <option value="failed">Failed</option>
                <option value="conditional">Conditional Pass</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">QC Notes</label>
              <input
                type="text"
                value={formData.qcNotes || ''}
                onChange={(e) => setFormData({ ...formData, qcNotes: e.target.value })}
                placeholder="Quality control notes..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Summary */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <h3 className="font-semibold text-gray-900 mb-3">Receipt Summary</h3>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div>
                <div className="text-gray-600">Items Fully Received</div>
                <div className="text-2xl font-bold text-green-600">{itemsFullyReceived}</div>
              </div>
              <div>
                <div className="text-gray-600">Items with Discrepancies</div>
                <div className="text-2xl font-bold text-yellow-600">{itemsWithDiscrepancies}</div>
              </div>
              <div>
                <div className="text-gray-600">Total Value</div>
                <div className="text-2xl font-bold text-gray-900">${totalValue.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-3 py-2 bg-gray-50 border-t flex justify-between">
          <button
            onClick={onReject}
            className="px-6 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            Reject Shipment
          </button>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            {hasDiscrepancies && (
              <button
                onClick={() => handleSubmit(true)}
                disabled={!allItemsConfirmed}
                className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Partial Receipt
              </button>
            )}
            <button
              onClick={() => handleSubmit(false)}
              disabled={!allItemsConfirmed}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Complete Receipt
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ==================== 6. TRANSFER HISTORY MODAL ====================

interface TransferHistoryModalProps {
  isOpen: boolean
  onClose: () => void
  transfers: Transfer[]
  onViewDetails: (transfer: Transfer) => void
  onExport?: () => void
}

export const TransferHistoryModal: React.FC<TransferHistoryModalProps> = ({
  isOpen,
  onClose,
  transfers,
  onViewDetails,
  onExport,
}) => {
  const [filters, setFilters] = useState({
    dateRange: '30days',
    status: [] as string[],
    fromLocation: '',
    toLocation: '',
    priority: [] as string[],
    createdBy: '',
  })

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  if (!isOpen) return null

  const toggleFilter = (filterType: 'status' | 'priority', value: string) => {
    const currentFilter = filters[filterType]
    if (currentFilter.includes(value)) {
      setFilters({ ...filters, [filterType]: currentFilter.filter((v) => v !== value) })
    } else {
      setFilters({ ...filters, [filterType]: [...currentFilter, value] })
    }
  }

  const visibleTransfers = transfers.filter((t) => {
    if (filters.status.length > 0 && !filters.status.includes(t.status)) return false
    if (filters.priority.length > 0 && !filters.priority.includes(t.priority)) return false
    if (filters.fromLocation && t.fromLocation.warehouse !== filters.fromLocation) return false
    if (filters.toLocation && t.toLocation.warehouse !== filters.toLocation) return false
    return true
  })

  const totalTransfers = visibleTransfers.length
  const inTransit = visibleTransfers.filter((t) => t.status === 'in-transit').length
  const completed = visibleTransfers.filter((t) => t.status === 'completed').length
  const totalValue = visibleTransfers.reduce((sum, t) => sum + (t.value || 0), 0)

  const totalPages = Math.ceil(totalTransfers / itemsPerPage)
  const paginatedTransfers = visibleTransfers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-lg shadow-xl w-full  max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-3 py-2 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Clock className="w-6 h-6" />
            <h2 className="text-xl font-bold">Transfer History</h2>
          </div>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {/* Filters */}
          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
            <h3 className="font-semibold text-gray-900">Filters</h3>
            <div className="grid grid-cols-4 gap-2">
              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                <div className="space-y-1">
                  {['7days', '30days', '90days', 'custom'].map((range) => (
                    <button
                      key={range}
                      onClick={() => setFilters({ ...filters, dateRange: range })}
                      className={`w-full px-3 py-2 text-sm rounded ${
                        filters.dateRange === range
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {range === '7days' ? 'Last 7 Days' : range === '30days' ? 'Last 30 Days' : range === '90days' ? 'Last 90 Days' : 'Custom'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <div className="space-y-1">
                  {['draft', 'pending', 'in-transit', 'completed', 'cancelled'].map((status) => (
                    <label key={status} className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        checked={filters.status.includes(status)}
                        onChange={() => toggleFilter('status', status)}
                        className="rounded text-blue-600"
                      />
                      <span className="capitalize">{status.replace('-', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Locations */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">From Location</label>
                <select
                  value={filters.fromLocation}
                  onChange={(e) => setFilters({ ...filters, fromLocation: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">All Locations</option>
                  <option value="WH-001">Main Warehouse</option>
                  <option value="WH-002">Distribution Center</option>
                  <option value="WH-003">Regional Warehouse</option>
                </select>
                <label className="block text-sm font-medium text-gray-700 mb-2 mt-3">To Location</label>
                <select
                  value={filters.toLocation}
                  onChange={(e) => setFilters({ ...filters, toLocation: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">All Locations</option>
                  <option value="WH-001">Main Warehouse</option>
                  <option value="WH-002">Distribution Center</option>
                  <option value="WH-003">Regional Warehouse</option>
                </select>
              </div>

              {/* Priority & Created By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <div className="space-y-1">
                  {['normal', 'urgent', 'critical'].map((priority) => (
                    <label key={priority} className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        checked={filters.priority.includes(priority)}
                        onChange={() => toggleFilter('priority', priority)}
                        className="rounded text-blue-600"
                      />
                      <span className="capitalize">{priority}</span>
                    </label>
                  ))}
                </div>
                <label className="block text-sm font-medium text-gray-700 mb-2 mt-3">Created By</label>
                <select
                  value={filters.createdBy}
                  onChange={(e) => setFilters({ ...filters, createdBy: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">All Users</option>
                  <option value="user1">John Doe</option>
                  <option value="user2">Jane Smith</option>
                </select>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-4 gap-2">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="text-sm text-blue-700 mb-1">Total Transfers</div>
              <div className="text-3xl font-bold text-blue-900">{totalTransfers}</div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <div className="text-sm text-purple-700 mb-1">In Transit</div>
              <div className="text-3xl font-bold text-purple-900">{inTransit}</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="text-sm text-green-700 mb-1">Completed</div>
              <div className="text-3xl font-bold text-green-900">{completed}</div>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <div className="text-sm text-gray-700 mb-1">Total Value</div>
              <div className="text-3xl font-bold text-gray-900">${totalValue.toLocaleString()}</div>
            </div>
          </div>

          {/* Transfers Table */}
          <div>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transfer #</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">From → To</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedTransfers.map((transfer) => (
                    <tr key={transfer.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{transfer.transferDate}</td>
                      <td className="px-4 py-3 text-sm font-medium text-blue-600">{transfer.transferNumber}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        <div className="flex items-center">
                          <span>{transfer.fromLocation.warehouse}</span>
                          <ArrowRight className="w-4 h-4 mx-2 text-gray-400" />
                          <span>{transfer.toLocation.warehouse}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{transfer.items.length || 'N/A'}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={transfer.status} />
                      </td>
                      <td className="px-4 py-3">
                        <PriorityBadge priority={transfer.priority} />
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">${transfer.value?.toLocaleString() || '0'}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => onViewDetails(transfer)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalTransfers)} of {totalTransfers} transfers
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-3 py-2 bg-gray-50 border-t flex justify-end space-x-3">
          {onExport && (
            <button
              onClick={onExport}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          )}
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
