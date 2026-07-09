'use client'

import React, { useState } from 'react'
import { inventoryService } from '@/services/InventoryService'
import { exportToCsv, printCurrentView } from '@/lib/export'
import {
  Package,
  TruckIcon,
  Archive,
  RotateCcw,
  FileText,
  Plus,
  Minus,
  X,
  AlertTriangle,
  Calendar,
  Search,
  Download,
  Printer,
  ChevronDown,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  User,
  Filter,
  RefreshCw
} from 'lucide-react'

// ============================================================================
// INTERFACES
// ============================================================================

export interface ReceiveStockData {
  receiptDate: string
  supplier: string
  poReference?: string
  deliveryNoteNumber: string
  items: ReceiveItem[]
  notes?: string
}

export interface ReceiveItem {
  itemId: string
  itemName: string
  expectedQuantity?: number
  receivedQuantity: number
  uom: string
  condition: 'good' | 'damaged' | 'partial'
  warehouse: string
  zone: string
  bin: string
  batchNumber?: string
  serialNumbers?: string[]
  expiryDate?: string
}

export interface IssueStockData {
  issueDate: string
  issueType: 'production' | 'sales' | 'consumption' | 'other'
  departmentWorkOrder: string
  issuedTo: string
  items: IssueItem[]
  expectedReturn: boolean
  expectedReturnDate?: string
  notes?: string
}

export interface IssueItem {
  itemId: string
  itemName: string
  availableQuantity: number
  issueQuantity: number
  uom: string
  fromWarehouse: string
  fromZone: string
  fromBin: string
  serialNumbers?: string[]
  batchNumber?: string
  cost: number
}

export interface ReturnStockData {
  returnDate: string
  originalIssueRef: string
  returnedBy: string
  returnReason: string
  items: ReturnItem[]
  notes: string
}

export interface ReturnItem {
  itemId: string
  itemName: string
  issuedQuantity: number
  returnQuantity: number
  condition: 'good' | 'damaged' | 'scrap'
  toWarehouse: string
  toZone: string
  toBin: string
}

export interface Movement {
  id: string
  movementNumber: string
  type: 'receipt' | 'issue' | 'return' | 'transfer'
  date: string
  status: 'draft' | 'completed' | 'cancelled'
  fromLocation?: string
  toLocation?: string
  supplier?: string
  reference?: string
  items: MovementItem[]
  createdBy: string
  createdDate: string
  modifiedBy?: string
  modifiedDate?: string
}

export interface MovementItem {
  itemCode: string
  itemName: string
  quantity: number
  uom: string
  batchNumber?: string
  serialNumbers?: string[]
  location: string
  cost: number
}

export interface BatchIssueData {
  workOrderNumber: string
  productionBatchNumber: string
  issueDate: string
  items: BatchIssueItem[]
}

export interface BatchIssueItem {
  itemId: string
  itemName: string
  requiredQuantity: number
  issueQuantity: number
  availableStock: number
  fromWarehouse: string
  fromZone: string
  fromBin: string
  serialNumbers?: string[]
  batchNumber?: string
}

export interface MovementFilters {
  dateFrom: string
  dateTo: string
  movementTypes: string[]
  itemId?: string
  location?: string
  status?: string
}

interface BaseModalProps {
  isOpen: boolean
  onClose: () => void
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

const Modal: React.FC<{
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  maxWidth?: string
}> = ({ isOpen, onClose, children, maxWidth = '' }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black bg-opacity-50">
      <div className={`relative w-full ${maxWidth} mx-4 my-8`}>
        <div className="bg-white rounded-lg shadow-2xl max-h-[90vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  )
}

const ModalHeader: React.FC<{
  title: string
  icon: React.ReactNode
  onClose: () => void
  gradientClass: string
}> = ({ title, icon, onClose, gradientClass }) => {
  return (
    <div className={`${gradientClass} text-white px-3 py-2 rounded-t-lg sticky top-0 z-10`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {icon}
          <h2 className="text-xl font-semibold">{title}</h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-white/20 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}

const FormField: React.FC<{
  label: string
  required?: boolean
  children: React.ReactNode
  error?: string
  className?: string
}> = ({ label, required, children, error, className = '' }) => {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}

// ============================================================================
// 1. RECEIVE STOCK MODAL
// ============================================================================

interface ReceiveStockModalProps extends BaseModalProps {
  onSubmit: (data: ReceiveStockData, isDraft?: boolean) => void
}

export const ReceiveStockModal: React.FC<ReceiveStockModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [formData, setFormData] = useState<ReceiveStockData>({
    receiptDate: new Date().toISOString().split('T')[0],
    supplier: '',
    poReference: '',
    deliveryNoteNumber: '',
    items: [],
    notes: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const addItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          itemId: '',
          itemName: '',
          receivedQuantity: 0,
          uom: '',
          condition: 'good',
          warehouse: '',
          zone: '',
          bin: '',
        }
      ]
    })
  }

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    })
  }

  const updateItem = (index: number, field: keyof ReceiveItem, value: any) => {
    const newItems = [...formData.items]
    newItems[index] = { ...newItems[index], [field]: value }
    setFormData({ ...formData, items: newItems })
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.supplier) newErrors.supplier = 'Supplier is required'
    if (!formData.deliveryNoteNumber) newErrors.deliveryNoteNumber = 'Delivery note number is required'
    if (formData.items.length === 0) newErrors.items = 'At least one item is required'

    formData.items.forEach((item, index) => {
      if (!item.itemId) newErrors[`item_${index}_id`] = 'Item is required'
      if (item.receivedQuantity <= 0) newErrors[`item_${index}_qty`] = 'Quantity must be greater than 0'
      if (!item.warehouse) newErrors[`item_${index}_location`] = 'Location is required'
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (isDraft = false) => {
    if (!isDraft && !validate()) return
    onSubmit(formData, isDraft)
    handleClose()
  }

  const handleClose = () => {
    setFormData({
      receiptDate: new Date().toISOString().split('T')[0],
      supplier: '',
      poReference: '',
      deliveryNoteNumber: '',
      items: [],
      notes: ''
    })
    setErrors({})
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} maxWidth="">
      <ModalHeader
        title="Receive Stock"
        icon={<Package className="w-6 h-6" />}
        onClose={handleClose}
        gradientClass="bg-gradient-to-r from-green-600 to-green-700"
      />

      <div className="p-6 space-y-3">
        {/* Header Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
          <FormField label="Receipt Date" required error={errors.receiptDate}>
            <input
              type="date"
              value={formData.receiptDate}
              onChange={(e) => setFormData({ ...formData, receiptDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </FormField>

          <FormField label="Supplier" required error={errors.supplier}>
            <input
              type="text"
              value={formData.supplier}
              onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
              placeholder="Enter supplier name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </FormField>

          <FormField label="PO Reference" error={errors.poReference}>
            <input
              type="text"
              value={formData.poReference}
              onChange={(e) => setFormData({ ...formData, poReference: e.target.value })}
              placeholder="Optional"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </FormField>

          <FormField label="Delivery Note #" required error={errors.deliveryNoteNumber}>
            <input
              type="text"
              value={formData.deliveryNoteNumber}
              onChange={(e) => setFormData({ ...formData, deliveryNoteNumber: e.target.value })}
              placeholder="Enter delivery note"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </FormField>
        </div>

        {/* Items Table */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-800">Items</h3>
            <button
              onClick={addItem}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Item
            </button>
          </div>

          {errors.items && (
            <p className="text-sm text-red-600 mb-2">{errors.items}</p>
          )}

          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Item</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Expected</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Received</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">UOM</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Condition</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Location</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Batch/Serial</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Expiry</th>
                    <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {formData.items.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={item.itemName}
                          onChange={(e) => updateItem(index, 'itemName', e.target.value)}
                          placeholder="Select item"
                          className="w-40 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                        />
                        {errors[`item_${index}_id`] && (
                          <p className="text-xs text-red-600 mt-1">{errors[`item_${index}_id`]}</p>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          value={item.expectedQuantity || ''}
                          onChange={(e) => updateItem(index, 'expectedQuantity', parseFloat(e.target.value))}
                          placeholder="0"
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          value={item.receivedQuantity}
                          onChange={(e) => updateItem(index, 'receivedQuantity', parseFloat(e.target.value))}
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                        />
                        {errors[`item_${index}_qty`] && (
                          <p className="text-xs text-red-600 mt-1">{errors[`item_${index}_qty`]}</p>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={item.uom}
                          onChange={(e) => updateItem(index, 'uom', e.target.value)}
                          placeholder="UOM"
                          className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <select
                          value={item.condition}
                          onChange={(e) => updateItem(index, 'condition', e.target.value)}
                          className="w-28 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                        >
                          <option value="good">Good</option>
                          <option value="damaged">Damaged</option>
                          <option value="partial">Partial</option>
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <div className="space-y-1">
                          <input
                            type="text"
                            value={item.warehouse}
                            onChange={(e) => updateItem(index, 'warehouse', e.target.value)}
                            placeholder="Warehouse"
                            className="w-28 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                          />
                          <div className="flex gap-1">
                            <input
                              type="text"
                              value={item.zone}
                              onChange={(e) => updateItem(index, 'zone', e.target.value)}
                              placeholder="Zone"
                              className="w-14 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                            />
                            <input
                              type="text"
                              value={item.bin}
                              onChange={(e) => updateItem(index, 'bin', e.target.value)}
                              placeholder="Bin"
                              className="w-14 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                            />
                          </div>
                        </div>
                        {errors[`item_${index}_location`] && (
                          <p className="text-xs text-red-600 mt-1">{errors[`item_${index}_location`]}</p>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={item.batchNumber || ''}
                          onChange={(e) => updateItem(index, 'batchNumber', e.target.value)}
                          placeholder="Batch #"
                          className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-green-500 mb-1"
                        />
                        <textarea
                          value={item.serialNumbers?.join('\n') || ''}
                          onChange={(e) => updateItem(index, 'serialNumbers', e.target.value.split('\n'))}
                          placeholder="Serials"
                          rows={2}
                          className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="date"
                          value={item.expiryDate || ''}
                          onChange={(e) => updateItem(index, 'expiryDate', e.target.value)}
                          className="w-32 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                        />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button
                          onClick={() => removeItem(index)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {formData.items.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Package className="w-12 h-12 mb-2 opacity-50" />
                <p>No items added. Click "Add Item" to begin.</p>
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        <FormField label="Notes">
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            placeholder="Additional notes..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </FormField>
      </div>

      {/* Footer Actions */}
      <div className="px-3 py-2 bg-gray-50 border-t border-gray-200 rounded-b-lg flex justify-end gap-3">
        <button
          onClick={handleClose}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => handleSubmit(true)}
          className="px-4 py-2 border border-green-600 text-green-700 rounded-md hover:bg-green-50 transition-colors"
        >
          Save Draft
        </button>
        <button
          onClick={() => handleSubmit(false)}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          Receive Stock
        </button>
      </div>
    </Modal>
  )
}

// ============================================================================
// 2. ISSUE STOCK MODAL
// ============================================================================

interface IssueStockModalProps extends BaseModalProps {
  onSubmit: (data: IssueStockData) => void
}

export const IssueStockModal: React.FC<IssueStockModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [formData, setFormData] = useState<IssueStockData>({
    issueDate: new Date().toISOString().split('T')[0],
    issueType: 'production',
    departmentWorkOrder: '',
    issuedTo: '',
    items: [],
    expectedReturn: false,
    notes: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const addItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          itemId: '',
          itemName: '',
          availableQuantity: 0,
          issueQuantity: 0,
          uom: '',
          fromWarehouse: '',
          fromZone: '',
          fromBin: '',
          cost: 0
        }
      ]
    })
  }

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    })
  }

  const updateItem = (index: number, field: keyof IssueItem, value: any) => {
    const newItems = [...formData.items]
    newItems[index] = { ...newItems[index], [field]: value }
    setFormData({ ...formData, items: newItems })
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.departmentWorkOrder) newErrors.departmentWorkOrder = 'Work order/Department is required'
    if (!formData.issuedTo) newErrors.issuedTo = 'Issued to is required'
    if (formData.items.length === 0) newErrors.items = 'At least one item is required'

    formData.items.forEach((item, index) => {
      if (!item.itemId) newErrors[`item_${index}_id`] = 'Item is required'
      if (item.issueQuantity <= 0) newErrors[`item_${index}_qty`] = 'Quantity must be greater than 0'
      if (item.issueQuantity > item.availableQuantity) {
        newErrors[`item_${index}_qty`] = 'Cannot exceed available quantity'
      }
      if (!item.fromWarehouse) newErrors[`item_${index}_location`] = 'Location is required'
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    onSubmit(formData)
    handleClose()
  }

  const handleClose = () => {
    setFormData({
      issueDate: new Date().toISOString().split('T')[0],
      issueType: 'production',
      departmentWorkOrder: '',
      issuedTo: '',
      items: [],
      expectedReturn: false,
      notes: ''
    })
    setErrors({})
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} maxWidth="">
      <ModalHeader
        title="Issue Stock"
        icon={<TruckIcon className="w-6 h-6" />}
        onClose={handleClose}
        gradientClass="bg-gradient-to-r from-red-600 to-orange-600"
      />

      <div className="p-6 space-y-3">
        {/* Header Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
          <FormField label="Issue Date" required error={errors.issueDate}>
            <input
              type="date"
              value={formData.issueDate}
              onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </FormField>

          <FormField label="Issue Type" required>
            <select
              value={formData.issueType}
              onChange={(e) => setFormData({ ...formData, issueType: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="production">Production</option>
              <option value="sales">Sales</option>
              <option value="consumption">Consumption</option>
              <option value="other">Other</option>
            </select>
          </FormField>

          <FormField label="Work Order / Department" required error={errors.departmentWorkOrder}>
            <input
              type="text"
              value={formData.departmentWorkOrder}
              onChange={(e) => setFormData({ ...formData, departmentWorkOrder: e.target.value })}
              placeholder="Enter work order or department"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </FormField>

          <FormField label="Issued To" required error={errors.issuedTo}>
            <input
              type="text"
              value={formData.issuedTo}
              onChange={(e) => setFormData({ ...formData, issuedTo: e.target.value })}
              placeholder="Person or department"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </FormField>
        </div>

        {/* Items Table */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-800">Items</h3>
            <button
              onClick={addItem}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Item
            </button>
          </div>

          {errors.items && (
            <p className="text-sm text-red-600 mb-2">{errors.items}</p>
          )}

          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Item</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Available</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Issue Qty</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">UOM</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">From Location</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Batch/Serial</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Cost</th>
                    <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {formData.items.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={item.itemName}
                          onChange={(e) => updateItem(index, 'itemName', e.target.value)}
                          placeholder="Select item"
                          className="w-40 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                        />
                        {errors[`item_${index}_id`] && (
                          <p className="text-xs text-red-600 mt-1">{errors[`item_${index}_id`]}</p>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <span className="text-sm font-medium text-gray-700">
                          {item.availableQuantity}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          value={item.issueQuantity}
                          onChange={(e) => updateItem(index, 'issueQuantity', parseFloat(e.target.value))}
                          className={`w-24 px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 ${
                            item.issueQuantity > item.availableQuantity
                              ? 'border-red-500 focus:ring-red-500'
                              : 'border-gray-300 focus:ring-red-500'
                          }`}
                        />
                        {errors[`item_${index}_qty`] && (
                          <p className="text-xs text-red-600 mt-1">{errors[`item_${index}_qty`]}</p>
                        )}
                        {item.issueQuantity > item.availableQuantity && (
                          <div className="flex items-center gap-1 text-xs text-red-600 mt-1">
                            <AlertTriangle className="w-3 h-3" />
                            Exceeds available
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={item.uom}
                          onChange={(e) => updateItem(index, 'uom', e.target.value)}
                          placeholder="UOM"
                          className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <div className="space-y-1">
                          <input
                            type="text"
                            value={item.fromWarehouse}
                            onChange={(e) => updateItem(index, 'fromWarehouse', e.target.value)}
                            placeholder="Warehouse"
                            className="w-28 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                          />
                          <div className="flex gap-1">
                            <input
                              type="text"
                              value={item.fromZone}
                              onChange={(e) => updateItem(index, 'fromZone', e.target.value)}
                              placeholder="Zone"
                              className="w-14 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                            />
                            <input
                              type="text"
                              value={item.fromBin}
                              onChange={(e) => updateItem(index, 'fromBin', e.target.value)}
                              placeholder="Bin"
                              className="w-14 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                            />
                          </div>
                        </div>
                        {errors[`item_${index}_location`] && (
                          <p className="text-xs text-red-600 mt-1">{errors[`item_${index}_location`]}</p>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={item.batchNumber || ''}
                          onChange={(e) => updateItem(index, 'batchNumber', e.target.value)}
                          placeholder="Batch #"
                          className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-red-500 mb-1"
                        />
                        <textarea
                          value={item.serialNumbers?.join('\n') || ''}
                          onChange={(e) => updateItem(index, 'serialNumbers', e.target.value.split('\n'))}
                          placeholder="Serials"
                          rows={2}
                          className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          value={item.cost}
                          onChange={(e) => updateItem(index, 'cost', parseFloat(e.target.value))}
                          placeholder="0.00"
                          className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                        />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button
                          onClick={() => removeItem(index)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {formData.items.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <TruckIcon className="w-12 h-12 mb-2 opacity-50" />
                <p>No items added. Click "Add Item" to begin.</p>
              </div>
            )}
          </div>
        </div>

        {/* Expected Return */}
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.expectedReturn}
              onChange={(e) => setFormData({ ...formData, expectedReturn: e.target.checked })}
              className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
            />
            <span className="text-sm font-medium text-gray-700">Expected Return</span>
          </label>

          {formData.expectedReturn && (
            <FormField label="Expected Return Date">
              <input
                type="date"
                value={formData.expectedReturnDate || ''}
                onChange={(e) => setFormData({ ...formData, expectedReturnDate: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </FormField>
          )}
        </div>

        {/* Notes */}
        <FormField label="Notes">
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            placeholder="Additional notes..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </FormField>
      </div>

      {/* Footer Actions */}
      <div className="px-3 py-2 bg-gray-50 border-t border-gray-200 rounded-b-lg flex justify-end gap-3">
        <button
          onClick={handleClose}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Issue Stock
        </button>
      </div>
    </Modal>
  )
}

// ============================================================================
// 3. RECORD RETURN MODAL
// ============================================================================

interface RecordReturnModalProps extends BaseModalProps {
  onSubmit: (data: ReturnStockData) => void
}

export const RecordReturnModal: React.FC<RecordReturnModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [formData, setFormData] = useState<ReturnStockData>({
    returnDate: new Date().toISOString().split('T')[0],
    originalIssueRef: '',
    returnedBy: '',
    returnReason: '',
    items: [],
    notes: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loadingIssue, setLoadingIssue] = useState(false)
  const [loadError, setLoadError] = useState('')

  const updateItem = (index: number, field: keyof ReturnItem, value: any) => {
    const newItems = [...formData.items]
    newItems[index] = { ...newItems[index], [field]: value }
    setFormData({ ...formData, items: newItems })
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.originalIssueRef) newErrors.originalIssueRef = 'Original issue reference is required'
    if (!formData.returnedBy) newErrors.returnedBy = 'Returned by is required'
    if (!formData.returnReason) newErrors.returnReason = 'Return reason is required'

    formData.items.forEach((item, index) => {
      if (item.returnQuantity <= 0) newErrors[`item_${index}_qty`] = 'Quantity must be greater than 0'
      if (item.returnQuantity > item.issuedQuantity) {
        newErrors[`item_${index}_qty`] = 'Cannot exceed issued quantity'
      }
      if (!item.toWarehouse) newErrors[`item_${index}_location`] = 'Location is required'
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    onSubmit(formData)
    handleClose()
  }

  const handleClose = () => {
    setFormData({
      returnDate: new Date().toISOString().split('T')[0],
      originalIssueRef: '',
      returnedBy: '',
      returnReason: '',
      items: [],
      notes: ''
    })
    setErrors({})
    onClose()
  }

  const loadIssueData = async () => {
    const ref = formData.originalIssueRef.trim()
    if (!ref) {
      setLoadError('Enter an issue reference first')
      return
    }
    setLoadingIssue(true)
    setLoadError('')
    try {
      const entries = (await inventoryService.getStockEntries()) as any[]
      const match = (entries || []).find(
        (e) =>
          e?.referenceNumber === ref ||
          e?.reference === ref ||
          e?.entryNumber === ref ||
          e?.id === ref
      )
      if (!match) {
        setFormData({ ...formData, items: [] })
        setLoadError(`No issue found for reference "${ref}"`)
        return
      }
      const sourceItems: any[] = match.items ?? match.lines ?? match.entryItems ?? []
      const items: ReturnItem[] = sourceItems.map((it) => ({
        itemId: String(it.itemId ?? it.id ?? it.itemCode ?? ''),
        itemName: String(it.itemName ?? it.name ?? it.itemCode ?? ''),
        issuedQuantity: Number(it.quantity ?? it.issueQuantity ?? it.qty ?? 0),
        returnQuantity: 0,
        condition: 'good',
        toWarehouse: String(it.warehouse ?? it.fromWarehouse ?? ''),
        toZone: String(it.zone ?? it.fromZone ?? ''),
        toBin: String(it.bin ?? it.fromBin ?? '')
      }))
      setFormData({ ...formData, items })
      if (items.length === 0) {
        setLoadError('The referenced issue has no line items')
      }
    } catch {
      setLoadError('Failed to load issue data. Please try again.')
    } finally {
      setLoadingIssue(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} maxWidth="">
      <ModalHeader
        title="Record Return"
        icon={<RotateCcw className="w-6 h-6" />}
        onClose={handleClose}
        gradientClass="bg-gradient-to-r from-blue-600 to-blue-700"
      />

      <div className="p-6 space-y-3">
        {/* Header Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
          <FormField label="Return Date" required error={errors.returnDate}>
            <input
              type="date"
              value={formData.returnDate}
              onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </FormField>

          <FormField label="Original Issue Reference" required error={errors.originalIssueRef}>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.originalIssueRef}
                onChange={(e) => setFormData({ ...formData, originalIssueRef: e.target.value })}
                placeholder="Enter issue reference"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={loadIssueData}
                disabled={loadingIssue}
                className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingIssue ? <Clock className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              </button>
            </div>
            {loadError && <p className="mt-1 text-sm text-red-600">{loadError}</p>}
          </FormField>

          <FormField label="Returned By" required error={errors.returnedBy}>
            <input
              type="text"
              value={formData.returnedBy}
              onChange={(e) => setFormData({ ...formData, returnedBy: e.target.value })}
              placeholder="Person name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </FormField>

          <FormField label="Return Reason" required error={errors.returnReason}>
            <select
              value={formData.returnReason}
              onChange={(e) => setFormData({ ...formData, returnReason: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select reason</option>
              <option value="unused">Unused</option>
              <option value="defective">Defective</option>
              <option value="excess">Excess</option>
              <option value="production_scrap">Production Scrap</option>
              <option value="other">Other</option>
            </select>
          </FormField>
        </div>

        {/* Items Table */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Items</h3>

          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Item</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Issued Qty</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Return Qty</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Condition</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Return to Location</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {formData.items.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-3 py-2">
                        <span className="text-sm font-medium text-gray-700">{item.itemName}</span>
                      </td>
                      <td className="px-3 py-2">
                        <span className="text-sm text-gray-700">{item.issuedQuantity}</span>
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          value={item.returnQuantity}
                          onChange={(e) => updateItem(index, 'returnQuantity', parseFloat(e.target.value))}
                          max={item.issuedQuantity}
                          className={`w-24 px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 ${
                            item.returnQuantity > item.issuedQuantity
                              ? 'border-red-500 focus:ring-red-500'
                              : 'border-gray-300 focus:ring-blue-500'
                          }`}
                        />
                        {errors[`item_${index}_qty`] && (
                          <p className="text-xs text-red-600 mt-1">{errors[`item_${index}_qty`]}</p>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <select
                          value={item.condition}
                          onChange={(e) => updateItem(index, 'condition', e.target.value)}
                          className="w-28 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="good">Good</option>
                          <option value="damaged">Damaged</option>
                          <option value="scrap">Scrap</option>
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <div className="space-y-1">
                          <input
                            type="text"
                            value={item.toWarehouse}
                            onChange={(e) => updateItem(index, 'toWarehouse', e.target.value)}
                            placeholder="Warehouse"
                            className="w-28 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                          <div className="flex gap-1">
                            <input
                              type="text"
                              value={item.toZone}
                              onChange={(e) => updateItem(index, 'toZone', e.target.value)}
                              placeholder="Zone"
                              className="w-14 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            <input
                              type="text"
                              value={item.toBin}
                              onChange={(e) => updateItem(index, 'toBin', e.target.value)}
                              placeholder="Bin"
                              className="w-14 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                        {errors[`item_${index}_location`] && (
                          <p className="text-xs text-red-600 mt-1">{errors[`item_${index}_location`]}</p>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <textarea
                          placeholder="Item notes..."
                          rows={2}
                          className="w-32 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {formData.items.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <RotateCcw className="w-12 h-12 mb-2 opacity-50" />
                <p>Enter an issue reference and click search to load items.</p>
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        <FormField label="Notes">
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            placeholder="Additional notes..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </FormField>
      </div>

      {/* Footer Actions */}
      <div className="px-3 py-2 bg-gray-50 border-t border-gray-200 rounded-b-lg flex justify-end gap-3">
        <button
          onClick={handleClose}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Record Return
        </button>
      </div>
    </Modal>
  )
}

// ============================================================================
// 4. VIEW MOVEMENT DETAILS MODAL
// ============================================================================

interface ViewMovementDetailsModalProps extends BaseModalProps {
  movement: Movement | null
}

export const ViewMovementDetailsModal: React.FC<ViewMovementDetailsModalProps> = ({
  isOpen,
  onClose,
  movement
}) => {
  if (!movement) return null

  const getStatusBadge = (status: string) => {
    const styles = {
      completed: 'bg-green-100 text-green-800',
      draft: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800'
    }
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'
  }

  const getTypeBadge = (type: string) => {
    const styles = {
      receipt: 'bg-green-100 text-green-800',
      issue: 'bg-red-100 text-red-800',
      return: 'bg-blue-100 text-blue-800',
      transfer: 'bg-purple-100 text-purple-800'
    }
    return styles[type as keyof typeof styles] || 'bg-gray-100 text-gray-800'
  }

  const handlePrint = () => {
    printCurrentView()
  }

  const handleExport = () => {
    exportToCsv(
      `movement-${movement.movementNumber}`,
      movement.items.map((item) => ({
        movementNumber: movement.movementNumber,
        type: movement.type,
        date: movement.date,
        itemCode: item.itemCode,
        itemName: item.itemName,
        quantity: item.quantity,
        uom: item.uom,
        batchNumber: item.batchNumber ?? '',
        serialNumbers: item.serialNumbers?.join('; ') ?? '',
        location: item.location,
        cost: item.cost,
        total: item.cost * item.quantity
      }))
    )
  }

  const totalCost = movement.items.reduce((sum, item) => sum + (item.cost * item.quantity), 0)

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="">
      <ModalHeader
        title="Movement Details"
        icon={<FileText className="w-6 h-6" />}
        onClose={onClose}
        gradientClass="bg-gradient-to-r from-indigo-600 to-indigo-700"
      />

      <div className="p-6 space-y-3">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-3 border border-indigo-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <div>
              <p className="text-sm text-gray-600">Movement Number</p>
              <p className="text-lg font-semibold text-gray-900">{movement.movementNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Type</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getTypeBadge(movement.type)}`}>
                {movement.type.charAt(0).toUpperCase() + movement.type.slice(1)}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Date</p>
              <p className="text-lg font-semibold text-gray-900">{movement.date}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(movement.status)}`}>
                {movement.status.charAt(0).toUpperCase() + movement.status.slice(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Source/Destination Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {movement.type === 'receipt' ? 'From' : 'Source'}
            </h4>
            <div className="space-y-2">
              {movement.supplier && (
                <div>
                  <p className="text-xs text-gray-600">Supplier</p>
                  <p className="text-sm font-medium text-gray-900">{movement.supplier}</p>
                </div>
              )}
              {movement.fromLocation && (
                <div>
                  <p className="text-xs text-gray-600">Location</p>
                  <p className="text-sm font-medium text-gray-900">{movement.fromLocation}</p>
                </div>
              )}
              {movement.reference && (
                <div>
                  <p className="text-xs text-gray-600">Reference</p>
                  <p className="text-sm font-medium text-gray-900">{movement.reference}</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {movement.type === 'issue' ? 'To' : 'Destination'}
            </h4>
            <div className="space-y-2">
              {movement.toLocation && (
                <div>
                  <p className="text-xs text-gray-600">Location</p>
                  <p className="text-sm font-medium text-gray-900">{movement.toLocation}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Items</h3>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Item Code</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Name</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">Quantity</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">UOM</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Batch/Serial</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Location</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">Cost</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {movement.items.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{item.itemCode}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.itemName}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-900">{item.quantity}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{item.uom}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {item.batchNumber && <div>Batch: {item.batchNumber}</div>}
                        {item.serialNumbers && item.serialNumbers.length > 0 && (
                          <div className="text-xs text-gray-600">
                            S/N: {item.serialNumbers.join(', ')}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{item.location}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-900">
                        ${item.cost.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                        ${(item.cost * item.quantity).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50 font-semibold">
                    <td colSpan={7} className="px-4 py-3 text-sm text-right text-gray-700">
                      Total Cost:
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900">
                      ${totalCost.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Documents Section */}
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Attached Documents
          </h4>
          <p className="text-sm text-gray-500 italic">No documents attached</p>
        </div>

        {/* Audit Trail */}
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <User className="w-4 h-4" />
            Audit Trail
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <p className="text-xs text-gray-600">Created By</p>
              <p className="text-sm font-medium text-gray-900">{movement.createdBy}</p>
              <p className="text-xs text-gray-600">{movement.createdDate}</p>
            </div>
            {movement.modifiedBy && (
              <div>
                <p className="text-xs text-gray-600">Modified By</p>
                <p className="text-sm font-medium text-gray-900">{movement.modifiedBy}</p>
                <p className="text-xs text-gray-600">{movement.modifiedDate}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="px-3 py-2 bg-gray-50 border-t border-gray-200 rounded-b-lg flex justify-end gap-3">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
        >
          <Printer className="w-4 h-4" />
          Print
        </button>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export
        </button>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          Close
        </button>
      </div>
    </Modal>
  )
}

// ============================================================================
// 5. BATCH ISSUE MODAL
// ============================================================================

interface BatchIssueModalProps extends BaseModalProps {
  onSubmit: (data: BatchIssueData) => void
}

export const BatchIssueModal: React.FC<BatchIssueModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [formData, setFormData] = useState<BatchIssueData>({
    workOrderNumber: '',
    productionBatchNumber: '',
    issueDate: new Date().toISOString().split('T')[0],
    items: []
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const updateItem = (index: number, field: keyof BatchIssueItem, value: any) => {
    const newItems = [...formData.items]
    newItems[index] = { ...newItems[index], [field]: value }
    setFormData({ ...formData, items: newItems })
  }

  const autoAllocate = () => {
    const newItems = formData.items.map(item => ({
      ...item,
      issueQuantity: Math.min(item.requiredQuantity, item.availableStock)
    }))
    setFormData({ ...formData, items: newItems })
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.workOrderNumber) newErrors.workOrderNumber = 'Work order number is required'
    if (!formData.productionBatchNumber) newErrors.productionBatchNumber = 'Production batch number is required'

    formData.items.forEach((item, index) => {
      if (item.issueQuantity > item.availableStock) {
        newErrors[`item_${index}_qty`] = 'Exceeds available stock'
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (isPartial = false) => {
    if (!validate()) return
    onSubmit(formData)
    handleClose()
  }

  const handleClose = () => {
    setFormData({
      workOrderNumber: '',
      productionBatchNumber: '',
      issueDate: new Date().toISOString().split('T')[0],
      items: []
    })
    setErrors({})
    onClose()
  }

  const addBomRow = () => {
    const newRow: BatchIssueItem = {
      itemId: '',
      itemName: '',
      requiredQuantity: 0,
      issueQuantity: 0,
      availableStock: 0,
      fromWarehouse: '',
      fromZone: '',
      fromBin: ''
    }
    setFormData({ ...formData, items: [...formData.items, newRow] })
  }

  const fullyAllocatedCount = formData.items.filter(
    item => item.issueQuantity >= item.requiredQuantity
  ).length

  const shortageCount = formData.items.filter(
    item => item.issueQuantity < item.requiredQuantity
  ).length

  return (
    <Modal isOpen={isOpen} onClose={handleClose} maxWidth="">
      <ModalHeader
        title="Batch Issue for Production"
        icon={<Archive className="w-6 h-6" />}
        onClose={handleClose}
        gradientClass="bg-gradient-to-r from-purple-600 to-purple-700"
      />

      <div className="p-6 space-y-3">
        {/* Header Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <FormField label="Work Order Number" required error={errors.workOrderNumber}>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.workOrderNumber}
                onChange={(e) => setFormData({ ...formData, workOrderNumber: e.target.value })}
                placeholder="Enter work order"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                onClick={addBomRow}
                className="px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                title="Add BOM item"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </FormField>

          <FormField label="Production Batch Number" required error={errors.productionBatchNumber}>
            <input
              type="text"
              value={formData.productionBatchNumber}
              onChange={(e) => setFormData({ ...formData, productionBatchNumber: e.target.value })}
              placeholder="Enter batch number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </FormField>

          <FormField label="Issue Date" required>
            <input
              type="date"
              value={formData.issueDate}
              onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </FormField>
        </div>

        {/* Summary Cards */}
        {formData.items.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <p className="text-sm text-blue-700 font-medium">Total Items</p>
              <p className="text-2xl font-bold text-blue-900">{formData.items.length}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3 border border-green-200">
              <p className="text-sm text-green-700 font-medium">Fully Allocated</p>
              <p className="text-2xl font-bold text-green-900">{fullyAllocatedCount}</p>
            </div>
            <div className="bg-red-50 rounded-lg p-3 border border-red-200">
              <p className="text-sm text-red-700 font-medium">Shortages</p>
              <p className="text-2xl font-bold text-red-900">{shortageCount}</p>
            </div>
          </div>
        )}

        {/* Items Table */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-800">Items from BOM</h3>
            <button
              onClick={autoAllocate}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              disabled={formData.items.length === 0}
            >
              <RefreshCw className="w-4 h-4" />
              Auto-Allocate
            </button>
          </div>

          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Item Name</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700">Required</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700">Issue Qty</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700">Available</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700">Shortage</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">From Location</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Batch/Serial</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {formData.items.map((item, index) => {
                    const shortage = item.issueQuantity - item.requiredQuantity
                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            value={item.itemName}
                            onChange={(e) => {
                              updateItem(index, 'itemName', e.target.value)
                              updateItem(index, 'itemId', e.target.value)
                            }}
                            placeholder="Item name"
                            className="w-40 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            value={item.requiredQuantity}
                            onChange={(e) => updateItem(index, 'requiredQuantity', parseFloat(e.target.value) || 0)}
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm text-right focus:outline-none focus:ring-1 focus:ring-purple-500"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            value={item.issueQuantity}
                            onChange={(e) => updateItem(index, 'issueQuantity', parseFloat(e.target.value))}
                            className={`w-24 px-2 py-1 border rounded text-sm text-right focus:outline-none focus:ring-1 ${
                              item.issueQuantity > item.availableStock
                                ? 'border-red-500 focus:ring-red-500'
                                : 'border-gray-300 focus:ring-purple-500'
                            }`}
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            value={item.availableStock}
                            onChange={(e) => updateItem(index, 'availableStock', parseFloat(e.target.value) || 0)}
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm text-right focus:outline-none focus:ring-1 focus:ring-purple-500"
                          />
                        </td>
                        <td className="px-3 py-2 text-sm text-right">
                          {shortage < 0 ? (
                            <span className="text-red-600 font-medium flex items-center justify-end gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              {Math.abs(shortage)}
                            </span>
                          ) : shortage === 0 ? (
                            <span className="text-green-600 font-medium flex items-center justify-end gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              OK
                            </span>
                          ) : (
                            <span className="text-gray-500">+{shortage}</span>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex gap-1">
                            <input
                              type="text"
                              value={item.fromWarehouse}
                              onChange={(e) => updateItem(index, 'fromWarehouse', e.target.value)}
                              placeholder="WH"
                              className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                            />
                            <input
                              type="text"
                              value={item.fromZone}
                              onChange={(e) => updateItem(index, 'fromZone', e.target.value)}
                              placeholder="Z"
                              className="w-12 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                            />
                            <input
                              type="text"
                              value={item.fromBin}
                              onChange={(e) => updateItem(index, 'fromBin', e.target.value)}
                              placeholder="B"
                              className="w-12 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                            />
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            value={item.batchNumber || ''}
                            onChange={(e) => updateItem(index, 'batchNumber', e.target.value)}
                            placeholder="Batch"
                            className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                          />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {formData.items.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Archive className="w-12 h-12 mb-2 opacity-50" />
                <p>Enter the work order number, then click + to add BOM items.</p>
              </div>
            )}
          </div>
        </div>

        {shortageCount > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-900">Stock Shortage Warning</p>
              <p className="text-sm text-yellow-700 mt-1">
                {shortageCount} item(s) have insufficient stock. You can proceed with partial issue or adjust quantities.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="px-3 py-2 bg-gray-50 border-t border-gray-200 rounded-b-lg flex justify-end gap-3">
        <button
          onClick={handleClose}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => handleSubmit(true)}
          className="px-4 py-2 border border-purple-600 text-purple-700 rounded-md hover:bg-purple-50 transition-colors"
          disabled={formData.items.length === 0}
        >
          Partial Issue
        </button>
        <button
          onClick={() => handleSubmit(false)}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          disabled={formData.items.length === 0}
        >
          Issue All Items
        </button>
      </div>
    </Modal>
  )
}

// ============================================================================
// 6. MOVEMENT HISTORY MODAL
// ============================================================================

interface MovementHistoryModalProps extends BaseModalProps {
  movements: Movement[]
  onViewDetails: (movement: Movement) => void
}

export const MovementHistoryModal: React.FC<MovementHistoryModalProps> = ({
  isOpen,
  onClose,
  movements,
  onViewDetails
}) => {
  const [filters, setFilters] = useState<MovementFilters>({
    dateFrom: '',
    dateTo: '',
    movementTypes: [],
    itemId: '',
    location: '',
    status: ''
  })

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const filteredMovements = movements.filter(movement => {
    if (filters.dateFrom && movement.date < filters.dateFrom) return false
    if (filters.dateTo && movement.date > filters.dateTo) return false
    if (filters.movementTypes.length > 0 && !filters.movementTypes.includes(movement.type)) return false
    if (filters.status && movement.status !== filters.status) return false
    return true
  })

  const totalReceipts = filteredMovements.filter(m => m.type === 'receipt').length
  const totalIssues = filteredMovements.filter(m => m.type === 'issue').length
  const netChange = totalReceipts - totalIssues

  const paginatedMovements = filteredMovements.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const totalPages = Math.ceil(filteredMovements.length / itemsPerPage)

  const handleExport = () => {
    exportToCsv(
      'movement-history',
      filteredMovements.map((m) => ({
        date: m.date,
        movementNumber: m.movementNumber,
        type: m.type,
        status: m.status,
        items: m.items.length,
        location: m.toLocation || m.fromLocation || '',
        createdBy: m.createdBy
      }))
    )
  }

  const getTypeBadge = (type: string) => {
    const config = {
      receipt: { bg: 'bg-green-100', text: 'text-green-800', icon: Package },
      issue: { bg: 'bg-red-100', text: 'text-red-800', icon: TruckIcon },
      return: { bg: 'bg-blue-100', text: 'text-blue-800', icon: RotateCcw },
      transfer: { bg: 'bg-purple-100', text: 'text-purple-800', icon: Archive }
    }
    const cfg = config[type as keyof typeof config] || { bg: 'bg-gray-100', text: 'text-gray-800', icon: FileText }
    const Icon = cfg.icon
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
        <Icon className="w-3 h-3" />
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </span>
    )
  }

  const getStatusIcon = (status: string) => {
    const icons = {
      completed: <CheckCircle2 className="w-4 h-4 text-green-600" />,
      draft: <Clock className="w-4 h-4 text-yellow-600" />,
      cancelled: <XCircle className="w-4 h-4 text-red-600" />
    }
    return icons[status as keyof typeof icons] || null
  }

  const setQuickDateRange = (range: 'today' | 'week' | 'month') => {
    const today = new Date()
    const dateTo = today.toISOString().split('T')[0]
    let dateFrom = ''

    if (range === 'today') {
      dateFrom = dateTo
    } else if (range === 'week') {
      const weekAgo = new Date(today)
      weekAgo.setDate(weekAgo.getDate() - 7)
      dateFrom = weekAgo.toISOString().split('T')[0]
    } else if (range === 'month') {
      const monthAgo = new Date(today)
      monthAgo.setMonth(monthAgo.getMonth() - 1)
      dateFrom = monthAgo.toISOString().split('T')[0]
    }

    setFilters({ ...filters, dateFrom, dateTo })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="">
      <ModalHeader
        title="Movement History"
        icon={<FileText className="w-6 h-6" />}
        onClose={onClose}
        gradientClass="bg-gradient-to-r from-gray-600 to-gray-700"
      />

      <div className="p-6 space-y-3">
        {/* Filters */}
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="text-sm font-semibold text-gray-800">Filters</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Date From</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Date To</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Item</label>
              <input
                type="text"
                value={filters.itemId || ''}
                onChange={(e) => setFilters({ ...filters, itemId: e.target.value })}
                placeholder="Search item..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={filters.location || ''}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                placeholder="Any location"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status || ''}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                <option value="">All</option>
                <option value="completed">Completed</option>
                <option value="draft">Draft</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setQuickDateRange('today')}
              className="px-3 py-1 text-xs border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => setQuickDateRange('week')}
              className="px-3 py-1 text-xs border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
            >
              Last 7 Days
            </button>
            <button
              onClick={() => setQuickDateRange('month')}
              className="px-3 py-1 text-xs border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
            >
              Last 30 Days
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div className="bg-green-50 rounded-lg p-3 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 font-medium">Total Receipts</p>
                <p className="text-2xl font-bold text-green-900">{totalReceipts}</p>
              </div>
              <Package className="w-8 h-8 text-green-600 opacity-50" />
            </div>
          </div>

          <div className="bg-red-50 rounded-lg p-3 border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-700 font-medium">Total Issues</p>
                <p className="text-2xl font-bold text-red-900">{totalIssues}</p>
              </div>
              <TruckIcon className="w-8 h-8 text-red-600 opacity-50" />
            </div>
          </div>

          <div className={`rounded-lg p-3 border ${netChange >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${netChange >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>Net Change</p>
                <p className={`text-2xl font-bold ${netChange >= 0 ? 'text-blue-900' : 'text-orange-900'}`}>
                  {netChange >= 0 ? '+' : ''}{netChange}
                </p>
              </div>
              <Archive className={`w-8 h-8 opacity-50 ${netChange >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
            </div>
          </div>
        </div>

        {/* Movements Table */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-800">
              Movements ({filteredMovements.length})
            </h3>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>

          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Movement #</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Items</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Location</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">User</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Status</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedMovements.map((movement) => (
                    <tr key={movement.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{movement.date}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {movement.movementNumber}
                      </td>
                      <td className="px-4 py-3">{getTypeBadge(movement.type)}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {movement.items.length} item(s)
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {movement.toLocation || movement.fromLocation || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{movement.createdBy}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {getStatusIcon(movement.status)}
                          <span className="text-sm text-gray-700">
                            {movement.status.charAt(0).toUpperCase() + movement.status.slice(1)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => onViewDetails(movement)}
                          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredMovements.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mb-2 opacity-50" />
                <p>No movements found matching the filters.</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-700">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredMovements.length)} of {filteredMovements.length} results
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="px-3 py-2 bg-gray-50 border-t border-gray-200 rounded-b-lg flex justify-end gap-3">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
        >
          Close
        </button>
      </div>
    </Modal>
  )
}
