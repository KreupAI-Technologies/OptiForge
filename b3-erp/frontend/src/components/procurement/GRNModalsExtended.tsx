"use client"

import React, { useState } from 'react'
import { X, CheckCircle, XCircle, AlertTriangle, ClipboardCheck, Package, Upload, Eye, TrendingUp, Warehouse, MapPin } from 'lucide-react'
import type { GRNData, QualityInspectionData, PostToInventoryData, GRNItem } from './GRNModals'

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
