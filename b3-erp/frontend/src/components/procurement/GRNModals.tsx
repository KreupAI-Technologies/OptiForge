"use client"

import React, { useState } from 'react'
import { X, Plus, CheckCircle, XCircle, AlertTriangle, Package, ClipboardCheck, FileText, Upload, Eye, Edit, Truck, Calendar, User, Building2, Hash, TrendingUp, TrendingDown, Warehouse, MapPin, Printer, Download, History } from 'lucide-react'

// ==================== INTERFACES ====================

export interface GRNItem {
  itemId: string
  itemCode: string
  itemName: string
  orderedQty: number
  receivedQty: number
  acceptedQty: number
  rejectedQty: number
  damagedQty: number
  uom: string
  unitPrice: number
  totalValue: number
  batchNumber?: string
  expiryDate?: string
  condition: 'good' | 'damaged' | 'defective' | 'partial'
  inspectionNotes: string
  qcStatus: 'passed' | 'failed' | 'pending'
}

export interface GRNData {
  id?: string
  grnNumber: string
  poNumber: string
  vendorName: string
  vendorCode: string
  receiptDate: string
  deliveryNote: string
  vehicleNumber?: string
  driverName?: string
  receivedBy: string
  items: GRNItem[]
  status: 'draft' | 'under_inspection' | 'partially_accepted' | 'accepted' | 'rejected'
  qualityStatus: 'passed' | 'failed' | 'pending'
  inspector?: string
  inspectionDate?: string
  // Alternative field names for summary view (used by page)
  itemsCount?: number
  orderedQty?: number
  receivedQty?: number
  acceptedQty?: number
  rejectedQty?: number
  // Original detailed field names
  totalOrderedQty: number
  totalReceivedQty: number
  totalAcceptedQty: number
  totalRejectedQty: number
  invoiceValue: number
  discrepancyNotes?: string
  attachments?: File[]
  createdBy: string
  createdDate: string
}

export interface QualityInspectionData {
  grnNumber: string
  inspector: string
  inspectionDate: string
  inspectionType: 'visual' | 'dimensional' | 'functional' | 'laboratory' | 'comprehensive'
  samplingMethod: 'random' | 'batch' | 'full' | 'statistical'
  sampleSize: number
  items: Array<{
    itemId: string
    qcStatus: 'passed' | 'failed' | 'conditional'
    defects: string[]
    measurements: Record<string, number>
    testResults: Record<string, string>
    certificatesVerified: boolean
    remarks: string
  }>
  overallResult: 'passed' | 'failed' | 'conditional'
  recommendations: string
  nextAction: 'accept' | 'reject' | 'conditional_accept' | 'return_to_vendor'
}

export interface PostToInventoryData {
  grnNumber: string
  warehouseId: string
  warehouseName: string
  storageLocations: Array<{
    itemId: string
    zone: string
    bin: string
    quantity: number
  }>
  postingDate: string
  batchNumbers: Array<{
    itemId: string
    batchNumber: string
    quantity: number
    expiryDate?: string
  }>
  updateInventory: boolean
  updateAccounting: boolean
  generateStockEntry: boolean
  remarks: string
}

// ==================== CREATE GRN MODAL ====================

interface CreateGRNModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: GRNData) => void
  poNumber?: string
}

export const CreateGRNModal: React.FC<CreateGRNModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  poNumber
}) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<GRNData>({
    grnNumber: `GRN-${Date.now()}`,
    poNumber: poNumber || '',
    vendorName: '',
    vendorCode: '',
    receiptDate: new Date().toISOString().split('T')[0],
    deliveryNote: '',
    receivedBy: 'Current User',
    items: [],
    status: 'draft',
    qualityStatus: 'pending',
    totalOrderedQty: 0,
    totalReceivedQty: 0,
    totalAcceptedQty: 0,
    totalRejectedQty: 0,
    invoiceValue: 0,
    createdBy: 'Current User',
    createdDate: new Date().toISOString().split('T')[0]
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const updateItemReceived = (index: number, field: string, value: any) => {
    const updatedItems = [...formData.items]
    updatedItems[index] = { ...updatedItems[index], [field]: value }

    // Auto-calculate values
    if (field === 'receivedQty' || field === 'rejectedQty' || field === 'damagedQty') {
      const received = field === 'receivedQty' ? parseFloat(value) || 0 : updatedItems[index].receivedQty
      const rejected = field === 'rejectedQty' ? parseFloat(value) || 0 : updatedItems[index].rejectedQty
      const damaged = field === 'damagedQty' ? parseFloat(value) || 0 : updatedItems[index].damagedQty
      updatedItems[index].acceptedQty = received - rejected - damaged
      updatedItems[index].totalValue = updatedItems[index].acceptedQty * updatedItems[index].unitPrice
    }

    setFormData({ ...formData, items: updatedItems })
    calculateTotals(updatedItems)
  }

  const calculateTotals = (items: GRNItem[]) => {
    const totals = items.reduce((acc, item) => ({
      ordered: acc.ordered + item.orderedQty,
      received: acc.received + item.receivedQty,
      accepted: acc.accepted + item.acceptedQty,
      rejected: acc.rejected + item.rejectedQty,
      value: acc.value + item.totalValue
    }), { ordered: 0, received: 0, accepted: 0, rejected: 0, value: 0 })

    setFormData(prev => ({
      ...prev,
      totalOrderedQty: totals.ordered,
      totalReceivedQty: totals.received,
      totalAcceptedQty: totals.accepted,
      totalRejectedQty: totals.rejected,
      invoiceValue: totals.value
    }))
  }

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    if (step === 1) {
      if (!formData.poNumber) newErrors.poNumber = 'PO Number is required'
      if (!formData.receiptDate) newErrors.receiptDate = 'Receipt date is required'
      if (!formData.deliveryNote) newErrors.deliveryNote = 'Delivery note is required'
    } else if (step === 2) {
      if (formData.items.length === 0) newErrors.items = 'Load PO items first'
      const hasReceivedItems = formData.items.some(item => item.receivedQty > 0)
      if (!hasReceivedItems) newErrors.items = 'Record received quantities for at least one item'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1)
  }

  const handleSubmit = () => {
    if (validateStep(2)) {
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
            <Package className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">Create Goods Receipt Note (GRN)</h2>
              <p className="text-sm opacity-90">{formData.grnNumber}</p>
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
            <span className="font-medium">Receipt Details</span>
          </div>
          <div className="w-12 h-0.5 bg-gray-300"></div>
          <div className={`flex items-center gap-2 ${currentStep >= 2 ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-green-600 text-white' : 'bg-gray-300'}`}>2</div>
            <span className="font-medium">Item Inspection</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3">
          {/* Step 1: Receipt Details */}
          {currentStep === 1 && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">PO Number *</label>
                  <div className="flex gap-2">
                    <select
                      value={formData.poNumber}
                      onChange={(e) => setFormData({ ...formData, poNumber: e.target.value })}
                      className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        errors.poNumber ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select PO</option>
                      <option value="PO-2025-001">PO-2025-001</option>
                      <option value="PO-2025-002">PO-2025-002</option>
                    </select>
                  </div>
                  {errors.poNumber && <p className="text-red-500 text-xs mt-1">{errors.poNumber}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Receipt Date *</label>
                  <input
                    type="date"
                    value={formData.receiptDate}
                    onChange={(e) => setFormData({ ...formData, receiptDate: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.receiptDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.receiptDate && <p className="text-red-500 text-xs mt-1">{errors.receiptDate}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Note Number *</label>
                  <input
                    type="text"
                    value={formData.deliveryNote}
                    onChange={(e) => setFormData({ ...formData, deliveryNote: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.deliveryNote ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="DN-123456"
                  />
                  {errors.deliveryNote && <p className="text-red-500 text-xs mt-1">{errors.deliveryNote}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Name</label>
                  <input
                    type="text"
                    value={formData.vendorName}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Number</label>
                  <input
                    type="text"
                    value={formData.vehicleNumber || ''}
                    onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="MH-01-AB-1234"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Driver Name</label>
                  <input
                    type="text"
                    value={formData.driverName || ''}
                    onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Driver name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Received By</label>
                  <input
                    type="text"
                    value={formData.receivedBy}
                    onChange={(e) => setFormData({ ...formData, receivedBy: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Vendor Info Display */}
              {formData.vendorName && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <h4 className="font-semibold text-blue-900 mb-2">Purchase Order Information</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-blue-700">Vendor:</p>
                      <p className="font-semibold text-blue-900">{formData.vendorName}</p>
                    </div>
                    <div>
                      <p className="text-blue-700">Vendor Code:</p>
                      <p className="font-semibold text-blue-900">{formData.vendorCode}</p>
                    </div>
                    <div>
                      <p className="text-blue-700">Items in PO:</p>
                      <p className="font-semibold text-blue-900">{formData.items.length} items</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Item Inspection */}
          {currentStep === 2 && (
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-gray-700 mb-3">Item-wise Inspection</h3>
                {errors.items && <p className="text-red-500 text-sm mb-2">{errors.items}</p>}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">Item</th>
                        <th className="border border-gray-300 px-3 py-2 text-center text-sm font-semibold">Ordered</th>
                        <th className="border border-gray-300 px-3 py-2 text-center text-sm font-semibold">Received</th>
                        <th className="border border-gray-300 px-3 py-2 text-center text-sm font-semibold">Rejected</th>
                        <th className="border border-gray-300 px-3 py-2 text-center text-sm font-semibold">Damaged</th>
                        <th className="border border-gray-300 px-3 py-2 text-center text-sm font-semibold">Accepted</th>
                        <th className="border border-gray-300 px-3 py-2 text-center text-sm font-semibold">Condition</th>
                        <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.items.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-3 py-2 text-sm">
                            <p className="font-semibold">{item.itemName}</p>
                            <p className="text-xs text-gray-500">{item.itemCode}</p>
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-center text-sm font-semibold">
                            {item.orderedQty} {item.uom}
                          </td>
                          <td className="border border-gray-300 px-3 py-2">
                            <input
                              type="number"
                              value={item.receivedQty}
                              onChange={(e) => updateItemReceived(index, 'receivedQty', parseFloat(e.target.value) || 0)}
                              className="w-20 px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-green-500"
                              min="0"
                              max={item.orderedQty}
                            />
                          </td>
                          <td className="border border-gray-300 px-3 py-2">
                            <input
                              type="number"
                              value={item.rejectedQty}
                              onChange={(e) => updateItemReceived(index, 'rejectedQty', parseFloat(e.target.value) || 0)}
                              className="w-20 px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-red-500"
                              min="0"
                              max={item.receivedQty}
                            />
                          </td>
                          <td className="border border-gray-300 px-3 py-2">
                            <input
                              type="number"
                              value={item.damagedQty}
                              onChange={(e) => updateItemReceived(index, 'damagedQty', parseFloat(e.target.value) || 0)}
                              className="w-20 px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-yellow-500"
                              min="0"
                              max={item.receivedQty - item.rejectedQty}
                            />
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-center">
                            <span className={`font-semibold ${item.acceptedQty > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                              {item.acceptedQty}
                            </span>
                          </td>
                          <td className="border border-gray-300 px-3 py-2">
                            <select
                              value={item.condition}
                              onChange={(e) => updateItemReceived(index, 'condition', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500"
                            >
                              <option value="good">Good</option>
                              <option value="damaged">Damaged</option>
                              <option value="defective">Defective</option>
                              <option value="partial">Partial</option>
                            </select>
                          </td>
                          <td className="border border-gray-300 px-3 py-2">
                            <input
                              type="text"
                              value={item.inspectionNotes}
                              onChange={(e) => updateItemReceived(index, 'inspectionNotes', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500"
                              placeholder="Notes..."
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-100 font-semibold">
                      <tr>
                        <td className="border border-gray-300 px-3 py-2 text-right">Totals:</td>
                        <td className="border border-gray-300 px-3 py-2 text-center">{formData.totalOrderedQty}</td>
                        <td className="border border-gray-300 px-3 py-2 text-center text-blue-600">{formData.totalReceivedQty}</td>
                        <td className="border border-gray-300 px-3 py-2 text-center text-red-600">{formData.totalRejectedQty}</td>
                        <td className="border border-gray-300 px-3 py-2 text-center text-yellow-600">
                          {formData.items.reduce((sum, item) => sum + item.damagedQty, 0)}
                        </td>
                        <td className="border border-gray-300 px-3 py-2 text-center text-green-600">{formData.totalAcceptedQty}</td>
                        <td colSpan={2} className="border border-gray-300"></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <h4 className="font-semibold text-green-900 mb-3">Receipt Summary</h4>
                <div className="grid grid-cols-4 gap-2 text-sm">
                  <div>
                    <p className="text-green-700">Total Ordered:</p>
                    <p className="text-2xl font-bold text-green-900">{formData.totalOrderedQty}</p>
                  </div>
                  <div>
                    <p className="text-green-700">Total Received:</p>
                    <p className="text-2xl font-bold text-blue-900">{formData.totalReceivedQty}</p>
                  </div>
                  <div>
                    <p className="text-green-700">Total Accepted:</p>
                    <p className="text-2xl font-bold text-green-900">{formData.totalAcceptedQty}</p>
                  </div>
                  <div>
                    <p className="text-green-700">Invoice Value:</p>
                    <p className="text-2xl font-bold text-green-900">₹{formData.invoiceValue.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Discrepancy Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discrepancy Notes</label>
                <textarea
                  value={formData.discrepancyNotes || ''}
                  onChange={(e) => setFormData({ ...formData, discrepancyNotes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Note any discrepancies, damages, or issues..."
                />
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
            {currentStep < 2 ? (
              <button
                onClick={handleNext}
                className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Create GRN
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ==================== QUALITY INSPECTION MODAL ====================

interface QualityInspectionModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: QualityInspectionData) => void
  grn: GRNData | null
}

export const QualityInspectionModal: React.FC<QualityInspectionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  grn
}) => {
  const [formData, setFormData] = useState<QualityInspectionData>({
    grnNumber: grn?.grnNumber || '',
    inspector: 'Current User',
    inspectionDate: new Date().toISOString().split('T')[0],
    inspectionType: 'visual',
    samplingMethod: 'random',
    sampleSize: 0,
    items: [],
    overallResult: 'passed',
    recommendations: '',
    nextAction: 'accept'
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  React.useEffect(() => {
    if (grn) {
      setFormData(prev => ({
        ...prev,
        grnNumber: grn.grnNumber,
        items: grn.items.map(item => ({
          itemId: item.itemId,
          qcStatus: 'passed' as const,
          defects: [],
          measurements: {},
          testResults: {},
          certificatesVerified: false,
          remarks: ''
        }))
      }))
    }
  }, [grn])

  const updateItemQC = (index: number, field: string, value: any) => {
    const updatedItems = [...formData.items]
    updatedItems[index] = { ...updatedItems[index], [field]: value }
    setFormData({ ...formData, items: updatedItems })
  }

  const handleSubmit = () => {
    if (!formData.recommendations.trim()) {
      setErrors({ recommendations: 'Recommendations are required' })
      return
    }
    onSubmit(formData)
  }

  if (!isOpen || !grn) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-lg shadow-xl w-full  max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-3 py-2 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <ClipboardCheck className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">Quality Inspection</h2>
              <p className="text-sm opacity-90">{grn.grnNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {/* Inspection Details */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Inspection Type</label>
              <select
                value={formData.inspectionType}
                onChange={(e) => setFormData({ ...formData, inspectionType: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="visual">Visual Inspection</option>
                <option value="dimensional">Dimensional Check</option>
                <option value="functional">Functional Testing</option>
                <option value="laboratory">Laboratory Testing</option>
                <option value="comprehensive">Comprehensive</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sampling Method</label>
              <select
                value={formData.samplingMethod}
                onChange={(e) => setFormData({ ...formData, samplingMethod: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="random">Random Sampling</option>
                <option value="batch">Batch Sampling</option>
                <option value="full">Full Inspection</option>
                <option value="statistical">Statistical Sampling</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sample Size</label>
              <input
                type="number"
                value={formData.sampleSize}
                onChange={(e) => setFormData({ ...formData, sampleSize: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Inspection Date</label>
              <input
                type="date"
                value={formData.inspectionDate}
                onChange={(e) => setFormData({ ...formData, inspectionDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Item-wise Quality Check */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-3">Item-wise Quality Assessment</h3>
            <div className="space-y-2">
              {grn.items.map((grnItem, index) => {
                const qcItem = formData.items[index]
                if (!qcItem) return null

                return (
                  <div key={index} className="border border-gray-300 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">{grnItem.itemName}</h4>
                        <p className="text-sm text-gray-500">{grnItem.itemCode} • Qty: {grnItem.receivedQty} {grnItem.uom}</p>
                      </div>
                      <select
                        value={qcItem.qcStatus}
                        onChange={(e) => updateItemQC(index, 'qcStatus', e.target.value)}
                        className={`px-3 py-1 border rounded-lg font-medium ${
                          qcItem.qcStatus === 'passed' ? 'bg-green-100 text-green-700 border-green-300' :
                          qcItem.qcStatus === 'failed' ? 'bg-red-100 text-red-700 border-red-300' :
                          'bg-yellow-100 text-yellow-700 border-yellow-300'
                        }`}
                      >
                        <option value="passed">Passed</option>
                        <option value="failed">Failed</option>
                        <option value="conditional">Conditional</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div>
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={qcItem.certificatesVerified}
                            onChange={(e) => updateItemQC(index, 'certificatesVerified', e.target.checked)}
                            className="text-purple-500 focus:ring-purple-500 rounded"
                          />
                          <span>Certificates Verified</span>
                        </label>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                        <input
                          type="text"
                          value={qcItem.remarks}
                          onChange={(e) => updateItemQC(index, 'remarks', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                          placeholder="QC remarks..."
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Overall Assessment */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <h3 className="font-semibold text-purple-900 mb-3">Overall Assessment</h3>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div>
                <label className="block text-sm font-medium text-purple-700 mb-2">Overall Result</label>
                <select
                  value={formData.overallResult}
                  onChange={(e) => setFormData({ ...formData, overallResult: e.target.value as any })}
                  className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="passed">Passed</option>
                  <option value="failed">Failed</option>
                  <option value="conditional">Conditional</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-700 mb-2">Next Action</label>
                <select
                  value={formData.nextAction}
                  onChange={(e) => setFormData({ ...formData, nextAction: e.target.value as any })}
                  className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="accept">Accept All</option>
                  <option value="reject">Reject All</option>
                  <option value="conditional_accept">Conditional Accept</option>
                  <option value="return_to_vendor">Return to Vendor</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-purple-700 mb-1">Recommendations *</label>
              <textarea
                value={formData.recommendations}
                onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })}
                rows={4}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 ${
                  errors.recommendations ? 'border-red-500' : 'border-purple-300'
                }`}
                placeholder="Enter quality inspection recommendations and findings..."
              />
              {errors.recommendations && <p className="text-red-500 text-xs mt-1">{errors.recommendations}</p>}
            </div>
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
            className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Submit Inspection
          </button>
        </div>
      </div>
    </div>
  )
}

// ==================== ACCEPT/REJECT GRN MODAL ====================

interface AcceptRejectGRNModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (action: 'accept' | 'reject', data: any) => void
  grn: GRNData | null
  action: 'accept' | 'reject'
}

export const AcceptRejectGRNModal: React.FC<AcceptRejectGRNModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  grn,
  action
}) => {
  const [formData, setFormData] = useState({
    reason: '',
    notifyVendor: true,
    generateDebitNote: action === 'reject',
    actionDate: new Date().toISOString().split('T')[0]
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = () => {
    if (action === 'reject' && !formData.reason.trim()) {
      setErrors({ reason: 'Rejection reason is required' })
      return
    }
    onSubmit(action, formData)
  }

  if (!isOpen || !grn) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        {/* Header */}
        <div className={`px-3 py-2 flex justify-between items-center rounded-t-lg ${
          action === 'accept' ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-red-500 to-rose-500'
        } text-white`}>
          <div className="flex items-center gap-3">
            {action === 'accept' ? <CheckCircle className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
            <div>
              <h2 className="text-xl font-bold">{action === 'accept' ? 'Accept' : 'Reject'} GRN</h2>
              <p className="text-sm opacity-90">{grn.grnNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-2">
          {/* Warning/Confirmation Message */}
          <div className={`border-l-4 p-3 rounded ${
            action === 'accept' ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'
          }`}>
            <div className="flex items-start gap-3">
              {action === 'accept' ? (
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              )}
              <div>
                <p className={`font-semibold ${action === 'accept' ? 'text-green-900' : 'text-red-900'}`}>
                  {action === 'accept' ? 'Confirm Acceptance' : 'Confirm Rejection'}
                </p>
                <p className={`text-sm mt-1 ${action === 'accept' ? 'text-green-700' : 'text-red-700'}`}>
                  {action === 'accept'
                    ? 'Accepting this GRN will update inventory and create stock entries. This action cannot be undone.'
                    : 'Rejecting this GRN will notify the vendor and may generate a debit note. Please provide a detailed reason.'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* GRN Summary */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <h4 className="font-semibold text-gray-900 mb-2">GRN Summary</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-gray-600">PO Number:</p>
                <p className="font-semibold">{grn.poNumber}</p>
              </div>
              <div>
                <p className="text-gray-600">Vendor:</p>
                <p className="font-semibold">{grn.vendorName}</p>
              </div>
              <div>
                <p className="text-gray-600">Total Accepted:</p>
                <p className="font-semibold text-green-600">{grn.totalAcceptedQty} units</p>
              </div>
              <div>
                <p className="text-gray-600">Invoice Value:</p>
                <p className="font-semibold">₹{grn.invoiceValue.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Action Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {action === 'accept' ? 'Acceptance' : 'Rejection'} Date
            </label>
            <input
              type="date"
              value={formData.actionDate}
              onChange={(e) => setFormData({ ...formData, actionDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Reason (required for reject) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {action === 'accept' ? 'Comments' : 'Reason for Rejection'} {action === 'reject' && <span className="text-red-500">*</span>}
            </label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              rows={4}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 ${
                action === 'accept' ? 'focus:ring-green-500' : 'focus:ring-red-500'
              } focus:border-transparent ${errors.reason ? 'border-red-500' : 'border-gray-300'}`}
              placeholder={action === 'accept' ? 'Optional comments...' : 'Provide detailed reason for rejection...'}
            />
            {errors.reason && <p className="text-red-500 text-xs mt-1">{errors.reason}</p>}
          </div>

          {/* Options */}
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.notifyVendor}
                onChange={(e) => setFormData({ ...formData, notifyVendor: e.target.checked })}
                className={`${action === 'accept' ? 'text-green-500 focus:ring-green-500' : 'text-red-500 focus:ring-red-500'} rounded`}
              />
              <span className="text-sm text-gray-700">Notify vendor via email</span>
            </label>

            {action === 'reject' && (
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.generateDebitNote}
                  onChange={(e) => setFormData({ ...formData, generateDebitNote: e.target.checked })}
                  className="text-red-500 focus:ring-red-500 rounded"
                />
                <span className="text-sm text-gray-700">Generate debit note for rejected items</span>
              </label>
            )}
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
            className={`px-6 py-2 rounded-lg text-white hover:shadow-lg transition-all flex items-center gap-2 ${
              action === 'accept' ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-red-500 to-rose-500'
            }`}
          >
            {action === 'accept' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            {action === 'accept' ? 'Accept GRN' : 'Reject GRN'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ==================== POST TO INVENTORY MODAL ====================

interface PostToInventoryModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: PostToInventoryData) => void
  grn: GRNData | null
}

export const PostToInventoryModal: React.FC<PostToInventoryModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  grn
}) => {
  const [formData, setFormData] = useState<PostToInventoryData>({
    grnNumber: grn?.grnNumber || '',
    warehouseId: '',
    warehouseName: '',
    storageLocations: [],
    postingDate: new Date().toISOString().split('T')[0],
    batchNumbers: [],
    updateInventory: true,
    updateAccounting: true,
    generateStockEntry: true,
    remarks: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  React.useEffect(() => {
    if (grn) {
      setFormData(prev => ({
        ...prev,
        grnNumber: grn.grnNumber,
        storageLocations: grn.items.filter(item => item.acceptedQty > 0).map(item => ({
          itemId: item.itemId,
          zone: '',
          bin: '',
          quantity: item.acceptedQty
        })),
        batchNumbers: grn.items.filter(item => item.acceptedQty > 0).map(item => ({
          itemId: item.itemId,
          batchNumber: '',
          quantity: item.acceptedQty,
          expiryDate: ''
        }))
      }))
    }
  }, [grn])

  const updateStorageLocation = (index: number, field: string, value: any) => {
    const updated = [...formData.storageLocations]
    updated[index] = { ...updated[index], [field]: value }
    setFormData({ ...formData, storageLocations: updated })
  }

  const updateBatchNumber = (index: number, field: string, value: any) => {
    const updated = [...formData.batchNumbers]
    updated[index] = { ...updated[index], [field]: value }
    setFormData({ ...formData, batchNumbers: updated })
  }

  const handleSubmit = () => {
    if (!formData.warehouseId) {
      setErrors({ warehouse: 'Warehouse is required' })
      return
    }
    onSubmit(formData)
  }

  if (!isOpen || !grn) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-lg shadow-xl w-full  max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-3 py-2 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Warehouse className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">Post to Inventory</h2>
              <p className="text-sm opacity-90">{grn.grnNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {/* Warehouse Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Warehouse *</label>
              <select
                value={formData.warehouseId}
                onChange={(e) => {
                  const selectedOption = e.target.options[e.target.selectedIndex]
                  setFormData({
                    ...formData,
                    warehouseId: e.target.value,
                    warehouseName: selectedOption.text
                  })
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.warehouse ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select Warehouse</option>
                <option value="WH-001">Main Warehouse</option>
                <option value="WH-002">Distribution Center</option>
                <option value="WH-003">Production Warehouse</option>
              </select>
              {errors.warehouse && <p className="text-red-500 text-xs mt-1">{errors.warehouse}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Posting Date</label>
              <input
                type="date"
                value={formData.postingDate}
                onChange={(e) => setFormData({ ...formData, postingDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Storage Locations */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-3">Storage Locations</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">Item</th>
                    <th className="border border-gray-300 px-3 py-2 text-center text-sm font-semibold">Quantity</th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">Zone</th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">Bin Location</th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">Batch Number</th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">Expiry Date</th>
                  </tr>
                </thead>
                <tbody>
                  {grn.items.filter(item => item.acceptedQty > 0).map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-3 py-2 text-sm">
                        <p className="font-semibold">{item.itemName}</p>
                        <p className="text-xs text-gray-500">{item.itemCode}</p>
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-center font-semibold">
                        {item.acceptedQty} {item.uom}
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        <input
                          type="text"
                          value={formData.storageLocations[index]?.zone || ''}
                          onChange={(e) => updateStorageLocation(index, 'zone', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                          placeholder="Zone A"
                        />
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        <input
                          type="text"
                          value={formData.storageLocations[index]?.bin || ''}
                          onChange={(e) => updateStorageLocation(index, 'bin', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                          placeholder="A-01-05"
                        />
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        <input
                          type="text"
                          value={formData.batchNumbers[index]?.batchNumber || ''}
                          onChange={(e) => updateBatchNumber(index, 'batchNumber', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                          placeholder="BATCH-001"
                        />
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        <input
                          type="date"
                          value={formData.batchNumbers[index]?.expiryDate || ''}
                          onChange={(e) => updateBatchNumber(index, 'expiryDate', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Posting Options */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h4 className="font-semibold text-blue-900 mb-3">Posting Options</h4>
            <div className="space-y-2">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.updateInventory}
                  onChange={(e) => setFormData({ ...formData, updateInventory: e.target.checked })}
                  className="text-blue-500 focus:ring-blue-500 rounded"
                />
                <span className="text-sm text-blue-900">Update Inventory Balances</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.updateAccounting}
                  onChange={(e) => setFormData({ ...formData, updateAccounting: e.target.checked })}
                  className="text-blue-500 focus:ring-blue-500 rounded"
                />
                <span className="text-sm text-blue-900">Update Accounting Entries</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.generateStockEntry}
                  onChange={(e) => setFormData({ ...formData, generateStockEntry: e.target.checked })}
                  className="text-blue-500 focus:ring-blue-500 rounded"
                />
                <span className="text-sm text-blue-900">Generate Stock Entry Document</span>
              </label>
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
            <textarea
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Any additional notes for inventory posting..."
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
            className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Package className="w-4 h-4" />
            Post to Inventory
          </button>
        </div>
      </div>
    </div>
  )
}

// ==================== VIEW GRN DETAILS MODAL ====================

interface ViewGRNDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  grn: GRNData | null
  onInspect?: () => void
  onAccept?: () => void
  onReject?: () => void
  onPostToInventory?: () => void
}

export const ViewGRNDetailsModal: React.FC<ViewGRNDetailsModalProps> = ({
  isOpen,
  onClose,
  grn,
  onInspect,
  onAccept,
  onReject,
  onPostToInventory
}) => {
  if (!isOpen || !grn) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-700'
      case 'under_inspection': return 'bg-blue-100 text-blue-700'
      case 'partially_accepted': return 'bg-yellow-100 text-yellow-700'
      case 'accepted': return 'bg-green-100 text-green-700'
      case 'rejected': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getQualityColor = (status: string) => {
    switch (status) {
      case 'passed': return 'bg-green-100 text-green-700'
      case 'failed': return 'bg-red-100 text-red-700'
      case 'pending': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-lg shadow-xl w-full  max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-3 py-2 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Eye className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">GRN Details</h2>
              <p className="text-sm opacity-90">{grn.grnNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3">
          {/* Status Badges */}
          <div className="flex gap-3 mb-3">
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(grn.status)}`}>
              {grn.status.toUpperCase().replace('_', ' ')}
            </span>
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getQualityColor(grn.qualityStatus)}`}>
              QC: {grn.qualityStatus.toUpperCase()}
            </span>
          </div>

          {/* GRN Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="text-sm text-gray-600 mb-1">PO Number</p>
              <p className="text-lg font-bold text-gray-900">{grn.poNumber}</p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="text-sm text-gray-600 mb-1">Vendor</p>
              <p className="text-lg font-bold text-gray-900">{grn.vendorName}</p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="text-sm text-gray-600 mb-1">Receipt Date</p>
              <p className="text-lg font-bold text-gray-900">{grn.receiptDate}</p>
            </div>
          </div>

          {/* Additional Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
            <div>
              <p className="text-sm text-gray-600">Delivery Note</p>
              <p className="font-semibold text-gray-900">{grn.deliveryNote}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Received By</p>
              <p className="font-semibold text-gray-900">{grn.receivedBy}</p>
            </div>
            {grn.inspector && (
              <div>
                <p className="text-sm text-gray-600">Inspector</p>
                <p className="font-semibold text-gray-900">{grn.inspector}</p>
              </div>
            )}
            {grn.inspectionDate && (
              <div>
                <p className="text-sm text-gray-600">Inspection Date</p>
                <p className="font-semibold text-gray-900">{grn.inspectionDate}</p>
              </div>
            )}
          </div>

          {/* Items Table */}
          <div className="mb-3">
            <h3 className="font-semibold text-gray-700 mb-3">Items</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">Item</th>
                    <th className="border border-gray-300 px-3 py-2 text-center text-sm font-semibold">Ordered</th>
                    <th className="border border-gray-300 px-3 py-2 text-center text-sm font-semibold">Received</th>
                    <th className="border border-gray-300 px-3 py-2 text-center text-sm font-semibold">Accepted</th>
                    <th className="border border-gray-300 px-3 py-2 text-center text-sm font-semibold">Rejected</th>
                    <th className="border border-gray-300 px-3 py-2 text-center text-sm font-semibold">Condition</th>
                  </tr>
                </thead>
                <tbody>
                  {grn.items.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-3 py-2 text-sm">
                        <p className="font-semibold">{item.itemName}</p>
                        <p className="text-xs text-gray-500">{item.itemCode}</p>
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-center">{item.orderedQty} {item.uom}</td>
                      <td className="border border-gray-300 px-3 py-2 text-center text-blue-600 font-semibold">{item.receivedQty}</td>
                      <td className="border border-gray-300 px-3 py-2 text-center text-green-600 font-semibold">{item.acceptedQty}</td>
                      <td className="border border-gray-300 px-3 py-2 text-center text-red-600 font-semibold">{item.rejectedQty}</td>
                      <td className="border border-gray-300 px-3 py-2 text-center">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          item.condition === 'good' ? 'bg-green-100 text-green-700' :
                          item.condition === 'damaged' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {item.condition}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Discrepancy Notes */}
          {grn.discrepancyNotes && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <h4 className="font-semibold text-yellow-900 mb-2">Discrepancy Notes</h4>
              <p className="text-yellow-800">{grn.discrepancyNotes}</p>
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
            {onInspect && grn.status === 'under_inspection' && (
              <button
                onClick={onInspect}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-2"
              >
                <ClipboardCheck className="w-4 h-4" />
                Inspect Quality
              </button>
            )}
            {onAccept && (grn.status === 'under_inspection' || grn.status === 'partially_accepted') && (
              <button
                onClick={onAccept}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Accept
              </button>
            )}
            {onReject && grn.status === 'under_inspection' && (
              <button
                onClick={onReject}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                Reject
              </button>
            )}
            {onPostToInventory && grn.status === 'accepted' && (
              <button
                onClick={onPostToInventory}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
              >
                <Package className="w-4 h-4" />
                Post to Inventory
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ==================== EDIT GRN MODAL ====================

interface EditGRNModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: GRNData) => void
  grn: GRNData | null
}

export const EditGRNModal: React.FC<EditGRNModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  grn
}) => {
  const [formData, setFormData] = useState<GRNData>(
    grn || {
      grnNumber: '',
      poNumber: '',
      vendorName: '',
      vendorCode: '',
      receiptDate: '',
      deliveryNote: '',
      receivedBy: '',
      items: [],
      status: 'draft',
      qualityStatus: 'pending',
      totalOrderedQty: 0,
      totalReceivedQty: 0,
      totalAcceptedQty: 0,
      totalRejectedQty: 0,
      invoiceValue: 0,
      createdBy: '',
      createdDate: ''
    }
  )

  React.useEffect(() => {
    if (grn) {
      setFormData(grn)
    }
  }, [grn])

  const updateItemReceived = (index: number, field: string, value: any) => {
    const updatedItems = [...formData.items]
    updatedItems[index] = { ...updatedItems[index], [field]: value }

    // Auto-calculate values
    if (field === 'receivedQty' || field === 'rejectedQty' || field === 'damagedQty') {
      const received = field === 'receivedQty' ? parseFloat(value) || 0 : updatedItems[index].receivedQty
      const rejected = field === 'rejectedQty' ? parseFloat(value) || 0 : updatedItems[index].rejectedQty
      const damaged = field === 'damagedQty' ? parseFloat(value) || 0 : updatedItems[index].damagedQty
      updatedItems[index].acceptedQty = received - rejected - damaged
      updatedItems[index].totalValue = updatedItems[index].acceptedQty * updatedItems[index].unitPrice
    }

    setFormData({ ...formData, items: updatedItems })
  }

  const handleSubmit = () => {
    onSubmit(formData)
  }

  if (!isOpen || !grn) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-lg shadow-xl w-full  max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-2 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Edit className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">Edit GRN</h2>
              <p className="text-sm opacity-90">{grn.grnNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {/* Basic Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Receipt Date</label>
              <input
                type="date"
                value={formData.receiptDate}
                onChange={(e) => setFormData({ ...formData, receiptDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Note</label>
              <input
                type="text"
                value={formData.deliveryNote}
                onChange={(e) => setFormData({ ...formData, deliveryNote: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Number</label>
              <input
                type="text"
                value={formData.vehicleNumber || ''}
                onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Items Table */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-3">Update Item Details</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">Item</th>
                    <th className="border border-gray-300 px-3 py-2 text-center text-sm font-semibold">Ordered</th>
                    <th className="border border-gray-300 px-3 py-2 text-center text-sm font-semibold">Received</th>
                    <th className="border border-gray-300 px-3 py-2 text-center text-sm font-semibold">Rejected</th>
                    <th className="border border-gray-300 px-3 py-2 text-center text-sm font-semibold">Damaged</th>
                    <th className="border border-gray-300 px-3 py-2 text-center text-sm font-semibold">Accepted</th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.items.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-3 py-2 text-sm">
                        <p className="font-semibold">{item.itemName}</p>
                        <p className="text-xs text-gray-500">{item.itemCode}</p>
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-center">
                        {item.orderedQty} {item.uom}
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        <input
                          type="number"
                          value={item.receivedQty}
                          onChange={(e) => updateItemReceived(index, 'receivedQty', parseFloat(e.target.value) || 0)}
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-amber-500"
                        />
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        <input
                          type="number"
                          value={item.rejectedQty}
                          onChange={(e) => updateItemReceived(index, 'rejectedQty', parseFloat(e.target.value) || 0)}
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-red-500"
                        />
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        <input
                          type="number"
                          value={item.damagedQty}
                          onChange={(e) => updateItemReceived(index, 'damagedQty', parseFloat(e.target.value) || 0)}
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-yellow-500"
                        />
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-center">
                        <span className="font-semibold text-green-600">{item.acceptedQty}</span>
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        <input
                          type="text"
                          value={item.inspectionNotes}
                          onChange={(e) => updateItemReceived(index, 'inspectionNotes', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-amber-500"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Discrepancy Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Discrepancy Notes</label>
            <textarea
              value={formData.discrepancyNotes || ''}
              onChange={(e) => setFormData({ ...formData, discrepancyNotes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="Update any discrepancy notes..."
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
            className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Update GRN
          </button>
        </div>
      </div>
    </div>
  )
}

// ==================== PRINT GRN MODAL ====================

interface PrintGRNModalProps {
  isOpen: boolean
  onClose: () => void
  grn: GRNData | null
}

export const PrintGRNModal: React.FC<PrintGRNModalProps> = ({
  isOpen,
  onClose,
  grn
}) => {
  const [printOptions, setPrintOptions] = useState({
    includeQC: true,
    includeDiscrepancies: true,
    includeSignatures: true,
    copies: 1
  })

  const handlePrint = () => {
    window.print()
  }

  if (!isOpen || !grn) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-700 to-gray-900 text-white px-3 py-2 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Printer className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">Print GRN</h2>
              <p className="text-sm opacity-90">{grn.grnNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-2">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-blue-900 font-medium">Print Options</p>
            <p className="text-sm text-blue-700 mt-1">Configure what to include in the printed document</p>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={printOptions.includeQC}
                onChange={(e) => setPrintOptions({ ...printOptions, includeQC: e.target.checked })}
                className="text-gray-700 focus:ring-gray-500 rounded"
              />
              <span className="text-sm text-gray-900">Include Quality Check Details</span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={printOptions.includeDiscrepancies}
                onChange={(e) => setPrintOptions({ ...printOptions, includeDiscrepancies: e.target.checked })}
                className="text-gray-700 focus:ring-gray-500 rounded"
              />
              <span className="text-sm text-gray-900">Include Discrepancy Notes</span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={printOptions.includeSignatures}
                onChange={(e) => setPrintOptions({ ...printOptions, includeSignatures: e.target.checked })}
                className="text-gray-700 focus:ring-gray-500 rounded"
              />
              <span className="text-sm text-gray-900">Include Signature Section</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Number of Copies</label>
            <input
              type="number"
              value={printOptions.copies}
              onChange={(e) => setPrintOptions({ ...printOptions, copies: parseInt(e.target.value) || 1 })}
              className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              min="1"
              max="10"
            />
          </div>

          {/* Preview Info */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <h4 className="font-semibold text-gray-900 mb-2">Document Preview</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-gray-600">GRN Number:</p>
                <p className="font-semibold">{grn.grnNumber}</p>
              </div>
              <div>
                <p className="text-gray-600">PO Number:</p>
                <p className="font-semibold">{grn.poNumber}</p>
              </div>
              <div>
                <p className="text-gray-600">Vendor:</p>
                <p className="font-semibold">{grn.vendorName}</p>
              </div>
              <div>
                <p className="text-gray-600">Total Items:</p>
                <p className="font-semibold">{grn.items.length}</p>
              </div>
            </div>
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
            onClick={handlePrint}
            className="bg-gradient-to-r from-gray-700 to-gray-900 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Print GRN
          </button>
        </div>
      </div>
    </div>
  )
}

// ==================== EXPORT GRNS MODAL ====================

interface ExportGRNsModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  selectedGRNs?: string[]
}

export const ExportGRNsModal: React.FC<ExportGRNsModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  selectedGRNs = []
}) => {
  const [formData, setFormData] = useState({
    format: 'excel',
    dateRange: 'all',
    startDate: '',
    endDate: '',
    includeItems: true,
    includeQC: true,
    includeDiscrepancies: false,
    status: 'all'
  })

  const handleSubmit = () => {
    onSubmit(formData)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-3 py-2 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Download className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">Export GRNs</h2>
              <p className="text-sm opacity-90">
                {selectedGRNs.length > 0 ? `${selectedGRNs.length} selected` : 'All GRNs'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-2">
          {/* Export Format */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Export Format</label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setFormData({ ...formData, format: 'excel' })}
                className={`px-4 py-3 border-2 rounded-lg font-medium transition-all ${
                  formData.format === 'excel'
                    ? 'border-teal-500 bg-teal-50 text-teal-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
              >
                Excel
              </button>
              <button
                onClick={() => setFormData({ ...formData, format: 'pdf' })}
                className={`px-4 py-3 border-2 rounded-lg font-medium transition-all ${
                  formData.format === 'pdf'
                    ? 'border-teal-500 bg-teal-50 text-teal-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
              >
                PDF
              </button>
              <button
                onClick={() => setFormData({ ...formData, format: 'csv' })}
                className={`px-4 py-3 border-2 rounded-lg font-medium transition-all ${
                  formData.format === 'csv'
                    ? 'border-teal-500 bg-teal-50 text-teal-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
              >
                CSV
              </button>
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
            <select
              value={formData.dateRange}
              onChange={(e) => setFormData({ ...formData, dateRange: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {formData.dateRange === 'custom' && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
          )}

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status Filter</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="under_inspection">Under Inspection</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Include Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Include in Export</label>
            <div className="space-y-2">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.includeItems}
                  onChange={(e) => setFormData({ ...formData, includeItems: e.target.checked })}
                  className="text-teal-500 focus:ring-teal-500 rounded"
                />
                <span className="text-sm text-gray-900">Item Details</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.includeQC}
                  onChange={(e) => setFormData({ ...formData, includeQC: e.target.checked })}
                  className="text-teal-500 focus:ring-teal-500 rounded"
                />
                <span className="text-sm text-gray-900">Quality Check Information</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.includeDiscrepancies}
                  onChange={(e) => setFormData({ ...formData, includeDiscrepancies: e.target.checked })}
                  className="text-teal-500 focus:ring-teal-500 rounded"
                />
                <span className="text-sm text-gray-900">Discrepancy Notes</span>
              </label>
            </div>
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
            className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export GRNs
          </button>
        </div>
      </div>
    </div>
  )
}

// ==================== GRN HISTORY MODAL ====================

export interface GRNHistoryEntry {
  date: string
  action: string
  user: string
  details: string
}

interface GRNHistoryModalProps {
  isOpen: boolean
  onClose: () => void
  grn: GRNData | null
  history?: GRNHistoryEntry[]
}

export const GRNHistoryModal: React.FC<GRNHistoryModalProps> = ({
  isOpen,
  onClose,
  grn,
  history = []
}) => {
  if (!isOpen || !grn) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-lg shadow-xl w-full  max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-600 to-gray-700 text-white px-3 py-2 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <History className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">GRN History</h2>
              <p className="text-sm opacity-90">{grn.grnNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3">
          {/* GRN Summary */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3">
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div>
                <p className="text-gray-600">PO Number:</p>
                <p className="font-semibold">{grn.poNumber}</p>
              </div>
              <div>
                <p className="text-gray-600">Vendor:</p>
                <p className="font-semibold">{grn.vendorName}</p>
              </div>
              <div>
                <p className="text-gray-600">Current Status:</p>
                <p className="font-semibold text-green-600">{grn.status.toUpperCase().replace('_', ' ')}</p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-700">Activity Timeline</h3>
            <div className="relative border-l-2 border-gray-300 pl-6 space-y-3">
              {history.length === 0 && (
                <p className="text-sm text-gray-400 py-4">No activity history available</p>
              )}
              {history.map((entry, index) => (
                <div key={index} className="relative">
                  <div className="absolute -left-9 mt-1.5 w-5 h-5 rounded-full bg-gray-600 border-4 border-white"></div>
                  <div className="bg-white border border-gray-200 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-900">{entry.action}</h4>
                      <span className="text-xs text-gray-500">{entry.date}</span>
                    </div>
                    <p className="text-sm text-gray-700 mb-1">{entry.details}</p>
                    <p className="text-xs text-gray-500">By: {entry.user}</p>
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
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
