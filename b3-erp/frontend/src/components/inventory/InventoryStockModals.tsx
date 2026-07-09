'use client'

import { useState } from 'react'
import { X, Package, Edit, Plus, Minus, AlertTriangle, TrendingUp, TrendingDown, BarChart, Download, Printer, Eye, Search, MapPin, DollarSign, Calendar, Clock, User, FileText, CheckCircle } from 'lucide-react'

// ==================== INTERFACES ====================

export interface StockItem {
  id: string
  itemCode: string
  itemName: string
  description: string
  category: string
  uom: string
  barcode: string
  currentQuantity: number
  available: number
  reserved: number
  onOrder: number
  minLevel: number
  maxLevel: number
  reorderPoint: number
  safetyStock: number
  costPrice: number
  sellingPrice: number
  supplier: string
  leadTime: number
  valuationMethod: 'FIFO' | 'LIFO' | 'Weighted Average'
  enableSerial: boolean
  enableBatch: boolean
  trackExpiry: boolean
  status: 'active' | 'inactive'
  locations: StockLocation[]
  lastModifiedBy?: string
  lastModifiedDate?: string
}

export interface StockLocation {
  warehouse: string
  zone: string
  bin: string
  quantity: number
  status: string
}

export interface AddStockItemData {
  itemCode: string
  itemName: string
  description: string
  category: string
  uom: string
  barcode: string
  initialQuantity: number
  minLevel: number
  maxLevel: number
  reorderPoint: number
  safetyStock: number
  reorderQuantity: number
  costPrice: number
  sellingPrice: number
  valuationMethod: string
  supplier: string
  leadTime: number
  minOrderQty: number
  enableSerial: boolean
  enableBatch: boolean
  trackExpiry: boolean
  warehouse: string
  zone: string
  bin: string
}

export interface QuickAdjustmentData {
  adjustmentType: 'increase' | 'decrease' | 'set'
  quantity: number
  reason: string
  notes: string
  location?: string
  date: string
}

export interface BulkUpdateData {
  category?: string
  minLevel?: number
  maxLevel?: number
  reorderPoint?: number
  supplier?: string
  leadTime?: number
  status?: string
}

export interface StockTransaction {
  id: string
  date: string
  type: 'receipt' | 'issue' | 'transfer' | 'adjustment' | 'return'
  reference: string
  quantityIn: number
  quantityOut: number
  balance: number
  location: string
  user: string
  notes: string
}

export interface LowStockItem {
  id: string
  itemCode: string
  itemName: string
  currentQty: number
  reorderPoint: number
  shortage: number
  suggestedOrderQty: number
  supplier: string
  leadTime: number
  lastOrderDate?: string
}

// ==================== HELPER FUNCTIONS ====================

const getStatusBadgeColor = (status: string) => {
  const colors: Record<string, string> = {
    'active': 'bg-green-100 text-green-800 border-green-200',
    'inactive': 'bg-gray-100 text-gray-800 border-gray-200',
    'low-stock': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'out-of-stock': 'bg-red-100 text-red-800 border-red-200',
    'in-stock': 'bg-green-100 text-green-800 border-green-200'
  }
  return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200'
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

const formatDateTime = (date: string) => {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// ==================== MODAL 1: VIEW STOCK DETAILS ====================

interface ViewStockDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  item: StockItem | null
  onEdit?: () => void
  onAdjust?: () => void
  onTransfer?: () => void
  onGenerateBarcode?: () => void
  onExport?: () => void
  recentTransactions?: StockTransaction[]
}

export function ViewStockDetailsModal({
  isOpen,
  onClose,
  item,
  onEdit,
  onAdjust,
  onTransfer,
  onGenerateBarcode,
  onExport,
  recentTransactions = []
}: ViewStockDetailsModalProps) {
  if (!isOpen || !item) return null

  const stockStatus = item.currentQuantity === 0 ? 'out-of-stock' :
                      item.currentQuantity <= item.minLevel ? 'low-stock' : 'in-stock'

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-lg shadow-xl w-full  max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-semibold">Stock Item Details</h2>
              <p className="text-sm text-indigo-100">{item.itemCode}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white hover:bg-indigo-800 p-2 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3">
          {/* Header Info */}
          <div className="mb-3">
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">{item.itemName}</h3>
            <p className="text-gray-600 mb-3">{item.description}</p>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusBadgeColor(stockStatus)}`}>
                {stockStatus.replace('-', ' ').toUpperCase()}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusBadgeColor(item.status)}`}>
                {item.status.toUpperCase()}
              </span>
              <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-200">
                {item.category}
              </span>
            </div>
          </div>

          {/* Stock Summary */}
          <div className="mb-3">
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Stock Summary</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="w-5 h-5 text-blue-600" />
                  <p className="text-sm font-medium text-blue-900">Current Quantity</p>
                </div>
                <p className="text-2xl font-bold text-blue-600">{item.currentQuantity}</p>
                <p className="text-sm text-blue-700">{item.uom}</p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <p className="text-sm font-medium text-green-900">Available</p>
                </div>
                <p className="text-2xl font-bold text-green-600">{item.available}</p>
                <p className="text-sm text-green-700">{item.uom}</p>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-yellow-600" />
                  <p className="text-sm font-medium text-yellow-900">Reserved</p>
                </div>
                <p className="text-2xl font-bold text-yellow-600">{item.reserved}</p>
                <p className="text-sm text-yellow-700">{item.uom}</p>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  <p className="text-sm font-medium text-purple-900">On Order</p>
                </div>
                <p className="text-2xl font-bold text-purple-600">{item.onOrder}</p>
                <p className="text-sm text-purple-700">{item.uom}</p>
              </div>
            </div>
          </div>

          {/* Item Details */}
          <div className="mb-3">
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Item Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 bg-gray-50 p-3 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-500">SKU / Barcode</p>
                <p className="text-base text-gray-900">{item.barcode}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Unit of Measure</p>
                <p className="text-base text-gray-900">{item.uom}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Supplier</p>
                <p className="text-base text-gray-900">{item.supplier}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Lead Time</p>
                <p className="text-base text-gray-900">{item.leadTime} days</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Cost Price</p>
                <p className="text-base text-gray-900 font-semibold">{formatCurrency(item.costPrice)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Selling Price</p>
                <p className="text-base text-gray-900 font-semibold">{formatCurrency(item.sellingPrice)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Min Level</p>
                <p className="text-base text-gray-900">{item.minLevel} {item.uom}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Max Level</p>
                <p className="text-base text-gray-900">{item.maxLevel} {item.uom}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Reorder Point</p>
                <p className="text-base text-gray-900">{item.reorderPoint} {item.uom}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Safety Stock</p>
                <p className="text-base text-gray-900">{item.safetyStock} {item.uom}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Valuation Method</p>
                <p className="text-base text-gray-900">{item.valuationMethod}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Tracking Options</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {item.enableSerial && <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">Serial</span>}
                  {item.enableBatch && <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">Batch</span>}
                  {item.trackExpiry && <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded">Expiry</span>}
                  {!item.enableSerial && !item.enableBatch && !item.trackExpiry && <span className="text-gray-500 text-sm">None</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Location Breakdown */}
          {item.locations && item.locations.length > 0 && (
            <div className="mb-3">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Location Breakdown</h4>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Warehouse</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Zone</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Bin Location</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Quantity</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {item.locations.map((loc, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">{loc.warehouse}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{loc.zone}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{loc.bin}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">{loc.quantity} {item.uom}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadgeColor(loc.status)}`}>
                            {loc.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Recent Transactions */}
          <div className="mb-3">
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Recent Transactions</h4>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Type</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Reference</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">In</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Out</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Balance</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">User</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentTransactions.length === 0 && (
                    <tr><td colSpan={7} className="px-4 py-6 text-center text-sm text-gray-400">No recent transactions</td></tr>
                  )}
                  {recentTransactions.map((txn) => (
                    <tr key={txn.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{formatDateTime(txn.date)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          txn.type === 'receipt' ? 'bg-green-100 text-green-700' :
                          txn.type === 'issue' ? 'bg-red-100 text-red-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {txn.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{txn.reference}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right">
                        {txn.quantityIn > 0 ? <span className="text-green-600 font-medium">+{txn.quantityIn}</span> : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right">
                        {txn.quantityOut > 0 ? <span className="text-red-600 font-medium">-{txn.quantityOut}</span> : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">{txn.balance}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{txn.user}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Valuation */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Valuation</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                <p className="text-sm font-medium text-indigo-900 mb-2">Total Value</p>
                <p className="text-2xl font-bold text-indigo-600">{formatCurrency(item.currentQuantity * item.costPrice)}</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm font-medium text-blue-900 mb-2">Average Cost</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(item.costPrice)}</p>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <p className="text-sm font-medium text-purple-900 mb-2">Method</p>
                <p className="text-lg font-bold text-purple-600">{item.valuationMethod}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-200 px-3 py-2 bg-gray-50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {onEdit && (
              <button
                onClick={onEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
            )}
            {onAdjust && (
              <button
                onClick={onAdjust}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center gap-2"
              >
                <TrendingUp className="w-4 h-4" />
                Adjust Quantity
              </button>
            )}
            {onTransfer && (
              <button
                onClick={onTransfer}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <Package className="w-4 h-4" />
                Transfer
              </button>
            )}
            {onGenerateBarcode && (
              <button
                onClick={onGenerateBarcode}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <BarChart className="w-4 h-4" />
                Generate Barcode
              </button>
            )}
            {onExport && (
              <button
                onClick={onExport}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

// ==================== MODAL 2: ADD STOCK ITEM ====================

interface AddStockItemModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: AddStockItemData, isDraft?: boolean) => void
}

export function AddStockItemModal({ isOpen, onClose, onSubmit }: AddStockItemModalProps) {
  const [formData, setFormData] = useState<AddStockItemData>({
    itemCode: `ITEM-${Date.now()}`,
    itemName: '',
    description: '',
    category: '',
    uom: 'Pieces',
    barcode: '',
    initialQuantity: 0,
    minLevel: 10,
    maxLevel: 100,
    reorderPoint: 20,
    safetyStock: 5,
    reorderQuantity: 50,
    costPrice: 0,
    sellingPrice: 0,
    valuationMethod: 'FIFO',
    supplier: '',
    leadTime: 7,
    minOrderQty: 10,
    enableSerial: false,
    enableBatch: false,
    trackExpiry: false,
    warehouse: '',
    zone: '',
    bin: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.itemName.trim()) newErrors.itemName = 'Item name is required'
    if (!formData.category) newErrors.category = 'Category is required'
    if (formData.initialQuantity < 0) newErrors.initialQuantity = 'Quantity cannot be negative'
    if (formData.minLevel >= formData.maxLevel) newErrors.minLevel = 'Min level must be less than max level'
    if (formData.costPrice <= 0) newErrors.costPrice = 'Cost price must be greater than 0'
    if (formData.sellingPrice < formData.costPrice) newErrors.sellingPrice = 'Selling price should be >= cost price'
    if (!formData.warehouse) newErrors.warehouse = 'Warehouse is required'
    if (formData.leadTime < 0) newErrors.leadTime = 'Lead time cannot be negative'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validate()) {
      onSubmit(formData)
      onClose()
    }
  }

  const handleSaveDraft = () => {
    onSubmit(formData, true)
    onClose()
  }

  const generateBarcode = () => {
    const barcode = `BC${Date.now().toString().slice(-10)}`
    setFormData({ ...formData, barcode })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-lg shadow-xl w-full  max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Plus className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-semibold">Add New Stock Item</h2>
              <p className="text-sm text-green-100">Create a new inventory item</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white hover:bg-green-800 p-2 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3">
          {/* Basic Information */}
          <div className="mb-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Item Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.itemCode}
                  onChange={(e) => setFormData({ ...formData, itemCode: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Auto-generated"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Item Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.itemName}
                  onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.itemName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter item name"
                />
                {errors.itemName && <p className="text-red-500 text-sm mt-1">{errors.itemName}</p>}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter item description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.category ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select category</option>
                  <option value="Raw Materials">Raw Materials</option>
                  <option value="Work in Progress">Work in Progress</option>
                  <option value="Finished Goods">Finished Goods</option>
                  <option value="Consumables">Consumables</option>
                  <option value="Spare Parts">Spare Parts</option>
                  <option value="Packaging">Packaging</option>
                </select>
                {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Unit of Measure</label>
                <select
                  value={formData.uom}
                  onChange={(e) => setFormData({ ...formData, uom: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="Pieces">Pieces (Pcs)</option>
                  <option value="Kilograms">Kilograms (Kg)</option>
                  <option value="Liters">Liters (L)</option>
                  <option value="Meters">Meters (M)</option>
                  <option value="Boxes">Boxes</option>
                  <option value="Cartons">Cartons</option>
                  <option value="Pallets">Pallets</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Barcode</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter or generate barcode"
                  />
                  <button
                    type="button"
                    onClick={generateBarcode}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Generate
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Initial Quantity</label>
                <input
                  type="number"
                  min="0"
                  value={formData.initialQuantity}
                  onChange={(e) => setFormData({ ...formData, initialQuantity: Number(e.target.value) })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.initialQuantity ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0"
                />
                {errors.initialQuantity && <p className="text-red-500 text-sm mt-1">{errors.initialQuantity}</p>}
              </div>
            </div>
          </div>

          {/* Inventory Parameters */}
          <div className="mb-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Inventory Parameters</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Min Stock Level</label>
                <input
                  type="number"
                  min="0"
                  value={formData.minLevel}
                  onChange={(e) => setFormData({ ...formData, minLevel: Number(e.target.value) })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.minLevel ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.minLevel && <p className="text-red-500 text-sm mt-1">{errors.minLevel}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Stock Level</label>
                <input
                  type="number"
                  min="0"
                  value={formData.maxLevel}
                  onChange={(e) => setFormData({ ...formData, maxLevel: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reorder Point</label>
                <input
                  type="number"
                  min="0"
                  value={formData.reorderPoint}
                  onChange={(e) => setFormData({ ...formData, reorderPoint: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Safety Stock</label>
                <input
                  type="number"
                  min="0"
                  value={formData.safetyStock}
                  onChange={(e) => setFormData({ ...formData, safetyStock: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reorder Quantity</label>
                <input
                  type="number"
                  min="0"
                  value={formData.reorderQuantity}
                  onChange={(e) => setFormData({ ...formData, reorderQuantity: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="mb-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Pricing</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cost Price <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.costPrice}
                  onChange={(e) => setFormData({ ...formData, costPrice: Number(e.target.value) })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.costPrice ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
                {errors.costPrice && <p className="text-red-500 text-sm mt-1">{errors.costPrice}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Selling Price</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.sellingPrice}
                  onChange={(e) => setFormData({ ...formData, sellingPrice: Number(e.target.value) })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.sellingPrice ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
                {errors.sellingPrice && <p className="text-red-500 text-sm mt-1">{errors.sellingPrice}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Valuation Method</label>
                <select
                  value={formData.valuationMethod}
                  onChange={(e) => setFormData({ ...formData, valuationMethod: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="FIFO">FIFO (First In First Out)</option>
                  <option value="LIFO">LIFO (Last In First Out)</option>
                  <option value="Weighted Average">Weighted Average</option>
                </select>
              </div>
            </div>
          </div>

          {/* Supplier Info */}
          <div className="mb-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Supplier Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Default Supplier</label>
                <input
                  type="text"
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter supplier name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Lead Time (days)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.leadTime}
                  onChange={(e) => setFormData({ ...formData, leadTime: Number(e.target.value) })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.leadTime ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.leadTime && <p className="text-red-500 text-sm mt-1">{errors.leadTime}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Min Order Quantity</label>
                <input
                  type="number"
                  min="0"
                  value={formData.minOrderQty}
                  onChange={(e) => setFormData({ ...formData, minOrderQty: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Tracking Options */}
          <div className="mb-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Tracking Options</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.enableSerial}
                  onChange={(e) => setFormData({ ...formData, enableSerial: e.target.checked })}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <div>
                  <p className="font-medium text-gray-900">Enable Serial Tracking</p>
                  <p className="text-sm text-gray-600">Track individual items with unique serial numbers</p>
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.enableBatch}
                  onChange={(e) => setFormData({ ...formData, enableBatch: e.target.checked })}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <div>
                  <p className="font-medium text-gray-900">Enable Batch Tracking</p>
                  <p className="text-sm text-gray-600">Group items by production batch or lot</p>
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.trackExpiry}
                  onChange={(e) => setFormData({ ...formData, trackExpiry: e.target.checked })}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <div>
                  <p className="font-medium text-gray-900">Track Expiry Dates</p>
                  <p className="text-sm text-gray-600">Monitor expiration dates for perishable items</p>
                </div>
              </label>
            </div>
          </div>

          {/* Location Assignment */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Location Assignment</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Warehouse <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.warehouse}
                  onChange={(e) => setFormData({ ...formData, warehouse: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.warehouse ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select warehouse</option>
                  <option value="WH-01">Warehouse 01 - Main</option>
                  <option value="WH-02">Warehouse 02 - Secondary</option>
                  <option value="WH-03">Warehouse 03 - Production</option>
                </select>
                {errors.warehouse && <p className="text-red-500 text-sm mt-1">{errors.warehouse}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Zone</label>
                <input
                  type="text"
                  value={formData.zone}
                  onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., Zone-A"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bin Location</label>
                <input
                  type="text"
                  value={formData.bin}
                  onChange={(e) => setFormData({ ...formData, bin: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., Bin-12"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-3 py-2 bg-gray-50 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveDraft}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Save as Draft
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Add Stock Item
          </button>
        </div>
      </div>
    </div>
  )
}

// ==================== MODAL 3: EDIT STOCK ITEM ====================

interface EditStockItemModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: Partial<AddStockItemData>) => void
  item: StockItem | null
}

export function EditStockItemModal({ isOpen, onClose, onSave, item }: EditStockItemModalProps) {
  const [formData, setFormData] = useState<Partial<AddStockItemData>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Initialize form data when item changes
  useState(() => {
    if (item) {
      setFormData({
        itemCode: item.itemCode,
        itemName: item.itemName,
        description: item.description,
        category: item.category,
        uom: item.uom,
        barcode: item.barcode,
        minLevel: item.minLevel,
        maxLevel: item.maxLevel,
        reorderPoint: item.reorderPoint,
        safetyStock: item.safetyStock,
        costPrice: item.costPrice,
        sellingPrice: item.sellingPrice,
        valuationMethod: item.valuationMethod,
        supplier: item.supplier,
        leadTime: item.leadTime,
        enableSerial: item.enableSerial,
        enableBatch: item.enableBatch,
        trackExpiry: item.trackExpiry
      })
    }
  })

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (formData.itemName && !formData.itemName.trim()) newErrors.itemName = 'Item name cannot be empty'
    if (formData.minLevel !== undefined && formData.maxLevel !== undefined && formData.minLevel >= formData.maxLevel) {
      newErrors.minLevel = 'Min level must be less than max level'
    }
    if (formData.costPrice !== undefined && formData.costPrice <= 0) newErrors.costPrice = 'Cost price must be greater than 0'
    if (formData.sellingPrice !== undefined && formData.costPrice !== undefined && formData.sellingPrice < formData.costPrice) {
      newErrors.sellingPrice = 'Selling price should be >= cost price'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validate()) {
      onSave(formData)
      onClose()
    }
  }

  if (!isOpen || !item) return null

  // Conservatively treat an item that holds stock as having movement history,
  // so the tracking-change warning is shown whenever it could matter.
  const hasTransactions = (item.currentQuantity ?? 0) > 0

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-lg shadow-xl w-full  max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Edit className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-semibold">Edit Stock Item</h2>
              <p className="text-sm text-blue-100">{item.itemCode} - {item.itemName}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white hover:bg-blue-800 p-2 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content - Similar structure to Add modal but pre-filled */}
        <div className="flex-1 overflow-y-auto p-3">
          {/* Warning about tracking changes */}
          {hasTransactions && (formData.enableSerial !== item.enableSerial || formData.enableBatch !== item.enableBatch) && (
            <div className="mb-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-900">Warning: Tracking Option Changes</p>
                <p className="text-sm text-yellow-700 mt-1">
                  This item has existing transactions. Changing tracking options (serial/batch) may require data migration
                  and could affect historical records. Please proceed with caution.
                </p>
              </div>
            </div>
          )}

          {/* Last Modified Info */}
          {item.lastModifiedBy && (
            <div className="mb-3 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-blue-600" />
              <span className="text-blue-900">
                Last modified by <strong>{item.lastModifiedBy}</strong> on {item.lastModifiedDate ? formatDateTime(item.lastModifiedDate) : 'N/A'}
              </span>
            </div>
          )}

          {/* Form fields - simplified version, similar to Add modal */}
          <div className="space-y-3">
            {/* Basic Info */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Item Name</label>
                  <input
                    type="text"
                    value={formData.itemName || ''}
                    onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.itemName ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.itemName && <p className="text-red-500 text-sm mt-1">{errors.itemName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={formData.category || ''}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Raw Materials">Raw Materials</option>
                    <option value="Work in Progress">Work in Progress</option>
                    <option value="Finished Goods">Finished Goods</option>
                    <option value="Consumables">Consumables</option>
                    <option value="Spare Parts">Spare Parts</option>
                    <option value="Packaging">Packaging</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Inventory Parameters */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Inventory Parameters</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Min Level</label>
                  <input
                    type="number"
                    value={formData.minLevel || 0}
                    onChange={(e) => setFormData({ ...formData, minLevel: Number(e.target.value) })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.minLevel ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.minLevel && <p className="text-red-500 text-sm mt-1">{errors.minLevel}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Level</label>
                  <input
                    type="number"
                    value={formData.maxLevel || 0}
                    onChange={(e) => setFormData({ ...formData, maxLevel: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reorder Point</label>
                  <input
                    type="number"
                    value={formData.reorderPoint || 0}
                    onChange={(e) => setFormData({ ...formData, reorderPoint: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Safety Stock</label>
                  <input
                    type="number"
                    value={formData.safetyStock || 0}
                    onChange={(e) => setFormData({ ...formData, safetyStock: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Pricing</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cost Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.costPrice || 0}
                    onChange={(e) => setFormData({ ...formData, costPrice: Number(e.target.value) })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.costPrice ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.costPrice && <p className="text-red-500 text-sm mt-1">{errors.costPrice}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Selling Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.sellingPrice || 0}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: Number(e.target.value) })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.sellingPrice ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.sellingPrice && <p className="text-red-500 text-sm mt-1">{errors.sellingPrice}</p>}
                </div>
              </div>
            </div>

            {/* Supplier */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Supplier Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Supplier</label>
                  <input
                    type="text"
                    value={formData.supplier || ''}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Lead Time (days)</label>
                  <input
                    type="number"
                    value={formData.leadTime || 0}
                    onChange={(e) => setFormData({ ...formData, leadTime: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-3 py-2 bg-gray-50 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}

// ==================== MODAL 4: QUICK ADJUSTMENT ====================

interface QuickAdjustmentModalProps {
  isOpen: boolean
  onClose: () => void
  onAdjust: (data: QuickAdjustmentData) => void
  item: StockItem | null
}

export function QuickAdjustmentModal({ isOpen, onClose, onAdjust, item }: QuickAdjustmentModalProps) {
  const [formData, setFormData] = useState<QuickAdjustmentData>({
    adjustmentType: 'increase',
    quantity: 0,
    reason: '',
    notes: '',
    date: new Date().toISOString().split('T')[0]
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const calculateNewQuantity = () => {
    if (!item) return 0

    switch (formData.adjustmentType) {
      case 'increase':
        return item.currentQuantity + formData.quantity
      case 'decrease':
        return item.currentQuantity - formData.quantity
      case 'set':
        return formData.quantity
      default:
        return item.currentQuantity
    }
  }

  const newQuantity = calculateNewQuantity()
  const changePercent = item ? Math.abs(((newQuantity - item.currentQuantity) / item.currentQuantity) * 100) : 0
  const isLargeChange = changePercent > 20

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (formData.quantity <= 0) newErrors.quantity = 'Quantity must be greater than 0'
    if (newQuantity < 0) newErrors.quantity = 'Cannot decrease below zero'
    if (!formData.reason) newErrors.reason = 'Reason is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validate()) {
      onAdjust(formData)
      onClose()
    }
  }

  if (!isOpen || !item) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-semibold">Quick Adjustment</h2>
              <p className="text-sm text-yellow-100">{item.itemCode} - {item.itemName}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white hover:bg-orange-700 p-2 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-3">
          {/* Current Stock */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm font-medium text-blue-900 mb-2">Current Stock Level</p>
            <p className="text-3xl font-bold text-blue-600">{item.currentQuantity} {item.uom}</p>
          </div>

          {/* Adjustment Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Adjustment Type</label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setFormData({ ...formData, adjustmentType: 'increase' })}
                className={`p-4 rounded-lg border-2 transition-all ${
                  formData.adjustmentType === 'increase'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-green-300'
                }`}
              >
                <Plus className={`w-6 h-6 mb-2 ${formData.adjustmentType === 'increase' ? 'text-green-600' : 'text-gray-400'}`} />
                <p className={`text-sm font-medium ${formData.adjustmentType === 'increase' ? 'text-green-900' : 'text-gray-600'}`}>
                  Increase
                </p>
              </button>
              <button
                onClick={() => setFormData({ ...formData, adjustmentType: 'decrease' })}
                className={`p-4 rounded-lg border-2 transition-all ${
                  formData.adjustmentType === 'decrease'
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 hover:border-red-300'
                }`}
              >
                <Minus className={`w-6 h-6 mb-2 ${formData.adjustmentType === 'decrease' ? 'text-red-600' : 'text-gray-400'}`} />
                <p className={`text-sm font-medium ${formData.adjustmentType === 'decrease' ? 'text-red-900' : 'text-gray-600'}`}>
                  Decrease
                </p>
              </button>
              <button
                onClick={() => setFormData({ ...formData, adjustmentType: 'set' })}
                className={`p-4 rounded-lg border-2 transition-all ${
                  formData.adjustmentType === 'set'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <Edit className={`w-6 h-6 mb-2 ${formData.adjustmentType === 'set' ? 'text-blue-600' : 'text-gray-400'}`} />
                <p className={`text-sm font-medium ${formData.adjustmentType === 'set' ? 'text-blue-900' : 'text-gray-600'}`}>
                  Set Exact
                </p>
              </button>
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {formData.adjustmentType === 'set' ? 'New Quantity' : 'Adjustment Quantity'}
            </label>
            <input
              type="number"
              min="0"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                errors.quantity ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter quantity"
            />
            {errors.quantity && <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>}
          </div>

          {/* New Quantity Preview */}
          <div className={`rounded-lg p-3 border-2 ${
            formData.adjustmentType === 'increase' ? 'bg-green-50 border-green-200' :
            formData.adjustmentType === 'decrease' ? 'bg-red-50 border-red-200' :
            'bg-blue-50 border-blue-200'
          }`}>
            <p className="text-sm font-medium text-gray-700 mb-2">New Stock Level</p>
            <p className={`text-3xl font-bold ${
              formData.adjustmentType === 'increase' ? 'text-green-600' :
              formData.adjustmentType === 'decrease' ? 'text-red-600' :
              'text-blue-600'
            }`}>
              {newQuantity} {item.uom}
            </p>
            {formData.quantity > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                {formData.adjustmentType === 'increase' && `+${formData.quantity} ${item.uom}`}
                {formData.adjustmentType === 'decrease' && `-${formData.quantity} ${item.uom}`}
                {formData.adjustmentType === 'set' && `Change: ${newQuantity - item.currentQuantity > 0 ? '+' : ''}${newQuantity - item.currentQuantity} ${item.uom}`}
              </p>
            )}
          </div>

          {/* Large Change Warning */}
          {isLargeChange && formData.quantity > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-900">Large Adjustment Detected</p>
                <p className="text-sm text-yellow-700 mt-1">
                  This adjustment represents a {changePercent.toFixed(1)}% change in stock level. Please ensure this is correct.
                </p>
              </div>
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                errors.reason ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select reason</option>
              <option value="Damaged">Damaged Goods</option>
              <option value="Lost">Lost / Missing</option>
              <option value="Found">Found / Discovered</option>
              <option value="Correction">Stock Count Correction</option>
              <option value="Audit">Physical Audit Adjustment</option>
              <option value="Expired">Expired Items</option>
              <option value="Quality">Quality Issues</option>
              <option value="Other">Other</option>
            </select>
            {errors.reason && <p className="text-red-500 text-sm mt-1">{errors.reason}</p>}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              placeholder="Additional details about this adjustment..."
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Adjustment Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-3 py-2 bg-gray-50 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
          >
            Apply Adjustment
          </button>
        </div>
      </div>
    </div>
  )
}

// ==================== MODAL 5: LOW STOCK ALERT ====================

interface LowStockAlertModalProps {
  isOpen: boolean
  onClose: () => void
  items: LowStockItem[]
  onCreatePurchaseOrders?: (itemIds: string[]) => void
  onAdjustLevels?: (itemIds: string[]) => void
  onDismissAlerts?: (itemIds: string[]) => void
}

export function LowStockAlertModal({
  isOpen,
  onClose,
  items,
  onCreatePurchaseOrders,
  onAdjustLevels,
  onDismissAlerts
}: LowStockAlertModalProps) {
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  const toggleItem = (id: string) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const toggleAll = () => {
    setSelectedItems(selectedItems.length === items.length ? [] : items.map(i => i.id))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-lg shadow-xl w-full  max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-semibold">Low Stock Alerts</h2>
              <p className="text-sm text-red-100">{items.length} items below reorder point</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white hover:bg-red-700 p-2 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3">
          {/* Bulk Actions */}
          <div className="mb-3 flex items-center justify-between gap-2 bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={selectedItems.length === items.length}
                onChange={toggleAll}
                className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
              />
              <span className="text-sm font-medium text-gray-700">
                {selectedItems.length > 0 ? `${selectedItems.length} items selected` : 'Select all'}
              </span>
            </div>
            <div className="flex gap-2">
              {selectedItems.length > 0 && (
                <>
                  {onCreatePurchaseOrders && (
                    <button
                      onClick={() => {
                        onCreatePurchaseOrders(selectedItems)
                        setSelectedItems([])
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      Create Purchase Orders
                    </button>
                  )}
                  {onAdjustLevels && (
                    <button
                      onClick={() => {
                        onAdjustLevels(selectedItems)
                        setSelectedItems([])
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      Adjust Levels
                    </button>
                  )}
                  {onDismissAlerts && (
                    <button
                      onClick={() => {
                        onDismissAlerts(selectedItems)
                        setSelectedItems([])
                      }}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                    >
                      Dismiss Alerts
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Items List */}
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.id}
                className={`border-2 rounded-lg p-3 transition-all ${
                  selectedItems.includes(item.id)
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 hover:border-red-300'
                }`}
              >
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={() => toggleItem(item.id)}
                    className="mt-1 w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">{item.itemName}</h4>
                        <p className="text-sm text-gray-600">{item.itemCode}</p>
                      </div>
                      <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium border border-red-200">
                        {item.shortage} units short
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                      <div>
                        <p className="text-xs font-medium text-gray-500">Current Stock</p>
                        <p className="text-lg font-bold text-red-600">{item.currentQty}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500">Reorder Point</p>
                        <p className="text-lg font-semibold text-gray-900">{item.reorderPoint}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500">Suggested Order</p>
                        <p className="text-lg font-semibold text-green-600">{item.suggestedOrderQty}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500">Supplier</p>
                        <p className="text-sm font-medium text-gray-900">{item.supplier}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500">Lead Time</p>
                        <p className="text-sm font-medium text-gray-900">{item.leadTime} days</p>
                      </div>
                    </div>

                    {item.lastOrderDate && (
                      <p className="text-xs text-gray-500 mt-2">
                        Last ordered: {formatDateTime(item.lastOrderDate)}
                      </p>
                    )}

                    {/* Individual Actions */}
                    <div className="mt-3 flex gap-2">
                      {onCreatePurchaseOrders && (
                        <button
                          onClick={() => onCreatePurchaseOrders([item.id])}
                          className="px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                        >
                          Order Now
                        </button>
                      )}
                      {onAdjustLevels && (
                        <button
                          onClick={() => onAdjustLevels([item.id])}
                          className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                        >
                          Adjust Levels
                        </button>
                      )}
                      {onDismissAlerts && (
                        <button
                          onClick={() => onDismissAlerts([item.id])}
                          className="px-3 py-1.5 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 transition-colors"
                        >
                          Snooze Alert
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-3 py-2 bg-gray-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
