'use client';

import { useState } from 'react';
import { X, Plus, Edit, Eye, CheckCircle, XCircle, Upload, Download, RotateCcw, FileText, MessageSquare, TrendingUp } from 'lucide-react';

// ==================== 1. Add Consumption Modal ====================
interface AddConsumptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: any) => void;
}

export function AddConsumptionModal({ isOpen, onClose, onAdd }: AddConsumptionModalProps) {
  const [formData, setFormData] = useState({
    date: '',
    projectId: '',
    workPackage: '',
    materialCode: '',
    materialName: '',
    category: 'Raw Materials',
    unit: 'KG',
    plannedQty: '',
    consumedQty: '',
    unitCost: '',
    source: 'Stock',
    issuedBy: '',
    receivedBy: '',
    warehouseLocation: '',
    remarks: '',
  });

  if (!isOpen) return null;

  const isValid = formData.date && formData.projectId && formData.materialCode && formData.materialName && formData.plannedQty && formData.consumedQty;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-lg shadow-xl  w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Add Material Consumption</h2>
              <p className="text-blue-100 text-sm">Record material usage for project</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Project *</label>
              <input
                type="text"
                value={formData.projectId}
                onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                placeholder="e.g., PRJ-2025-001"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Work Package</label>
              <input
                type="text"
                value={formData.workPackage}
                onChange={(e) => setFormData({ ...formData, workPackage: e.target.value })}
                placeholder="e.g., WP-001 - Equipment Installation"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Material Code *</label>
              <input
                type="text"
                value={formData.materialCode}
                onChange={(e) => setFormData({ ...formData, materialCode: e.target.value })}
                placeholder="e.g., MAT-CK-001"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Material Name *</label>
              <input
                type="text"
                value={formData.materialName}
                onChange={(e) => setFormData({ ...formData, materialName: e.target.value })}
                placeholder="e.g., Stainless Steel Sheet 304 Grade"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option>Raw Materials</option>
                <option>Insulation Materials</option>
                <option>Plumbing Materials</option>
                <option>Electrical Materials</option>
                <option>Civil Materials</option>
                <option>HVAC Materials</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option>KG</option>
                <option>MTR</option>
                <option>SQM</option>
                <option>SFT</option>
                <option>BAG</option>
                <option>NOS</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Planned Quantity *</label>
              <input
                type="number"
                value={formData.plannedQty}
                onChange={(e) => setFormData({ ...formData, plannedQty: e.target.value })}
                placeholder="e.g., 500"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Consumed Quantity *</label>
              <input
                type="number"
                value={formData.consumedQty}
                onChange={(e) => setFormData({ ...formData, consumedQty: e.target.value })}
                placeholder="e.g., 520"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Unit Cost (₹)</label>
              <input
                type="number"
                value={formData.unitCost}
                onChange={(e) => setFormData({ ...formData, unitCost: e.target.value })}
                placeholder="e.g., 450"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Source</label>
              <select
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option>Stock</option>
                <option>Direct Purchase</option>
                <option>Subcontractor</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Issued By</label>
              <input
                type="text"
                value={formData.issuedBy}
                onChange={(e) => setFormData({ ...formData, issuedBy: e.target.value })}
                placeholder="Store keeper name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Received By</label>
              <input
                type="text"
                value={formData.receivedBy}
                onChange={(e) => setFormData({ ...formData, receivedBy: e.target.value })}
                placeholder="Site engineer name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Warehouse Location</label>
              <input
                type="text"
                value={formData.warehouseLocation}
                onChange={(e) => setFormData({ ...formData, warehouseLocation: e.target.value })}
                placeholder="e.g., WH-MUM-01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Remarks</label>
              <textarea
                rows={3}
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                placeholder="Any additional notes..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 px-3 py-2 flex justify-end gap-3 bg-gray-50">
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={() => {
              if (isValid) {
                onAdd(formData);
              }
            }}
            disabled={!isValid}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
          >
            Save Consumption Record
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== 2. Edit Consumption Modal ====================
interface EditConsumptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  consumption: any;
}

export function EditConsumptionModal({ isOpen, onClose, onSave, consumption }: EditConsumptionModalProps) {
  if (!isOpen || !consumption) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        <div className="bg-gradient-to-r from-green-500 to-green-600 px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Edit className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Edit Consumption</h2>
              <p className="text-green-100 text-sm">{consumption.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-600">Edit material consumption details and quantities.</p>
        </div>

        <div className="border-t border-gray-200 px-3 py-2 flex justify-end gap-3 bg-gray-50">
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={() => onSave({})}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== 3. View Details Modal ====================
interface ViewDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  consumption: any;
}

export function ViewDetailsModal({ isOpen, onClose, consumption }: ViewDetailsModalProps) {
  if (!isOpen || !consumption) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-lg shadow-xl  w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Eye className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Consumption Details</h2>
              <p className="text-purple-100 text-sm">{consumption.materialCode}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          <div className="space-y-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">{consumption.materialName}</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600 mb-1">Project</p>
                  <p className="text-sm font-medium text-gray-900">{consumption.projectName}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600 mb-1">Work Package</p>
                  <p className="text-sm font-medium text-gray-900">{consumption.workPackage}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-blue-600">{consumption.plannedQty}</p>
                <p className="text-xs text-gray-600">Planned {consumption.unit}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-green-600">{consumption.consumedQty}</p>
                <p className="text-xs text-gray-600">Consumed {consumption.unit}</p>
              </div>
              <div className={`rounded-lg p-3 text-center ${consumption.variance < 0 ? 'bg-red-50' : 'bg-green-50'}`}>
                <p className={`text-xl font-bold ${consumption.variance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {consumption.variance > 0 ? '+' : ''}{consumption.variance}
                </p>
                <p className="text-xs text-gray-600">Variance {consumption.unit}</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-purple-600">₹{consumption.totalCost.toLocaleString('en-IN')}</p>
                <p className="text-xs text-gray-600">Total Cost</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Source & Location</h4>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-900">Source: {consumption.source}</p>
                  <p className="text-sm text-gray-600 mt-1">Location: {consumption.warehouseLocation}</p>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Personnel</h4>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-900">Issued: {consumption.issuedBy}</p>
                  <p className="text-sm text-gray-600 mt-1">Received: {consumption.receivedBy}</p>
                </div>
              </div>
            </div>

            {consumption.remarks && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Remarks</h4>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-700">{consumption.remarks}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-gray-200 px-3 py-2 flex justify-end gap-3 bg-gray-50">
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== 4. Variance Analysis Modal ====================
interface VarianceAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  consumption: any;
}

export function VarianceAnalysisModal({ isOpen, onClose, consumption }: VarianceAnalysisModalProps) {
  if (!isOpen || !consumption) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Variance Analysis</h2>
              <p className="text-orange-100 text-sm">{consumption.materialName}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="space-y-2">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-2xl font-bold text-blue-600">{consumption.plannedQty} {consumption.unit}</p>
                  <p className="text-xs text-gray-600">Planned</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{consumption.consumedQty} {consumption.unit}</p>
                  <p className="text-xs text-gray-600">Consumed</p>
                </div>
                <div>
                  <p className={`text-2xl font-bold ${consumption.variance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {consumption.variance > 0 ? '+' : ''}{consumption.variance} {consumption.unit}
                  </p>
                  <p className="text-xs text-gray-600">Variance</p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm font-medium text-yellow-800">
                Variance: {consumption.variancePercent > 0 ? '+' : ''}{consumption.variancePercent.toFixed(2)}%
              </p>
              <p className="text-sm text-yellow-700 mt-1">
                {consumption.variance < 0 ? 'Material overused beyond planned quantity' : 'Material usage within planned limits'}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Analysis</h4>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-700">{consumption.remarks || 'No additional analysis provided'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 px-3 py-2 flex justify-end gap-3 bg-gray-50">
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== 5. Approve Consumption Modal ====================
interface ApproveConsumptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApprove: (data: any) => void;
  consumption: any;
}

export function ApproveConsumptionModal({ isOpen, onClose, onApprove, consumption }: ApproveConsumptionModalProps) {
  const [approvalNotes, setApprovalNotes] = useState('');

  if (!isOpen || !consumption) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="bg-gradient-to-r from-green-500 to-green-600 px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Approve Consumption</h2>
            </div>
          </div>
          <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-600 mb-2">Approve consumption record for {consumption.materialName}</p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Approval Notes</label>
            <textarea
              rows={3}
              value={approvalNotes}
              onChange={(e) => setApprovalNotes(e.target.value)}
              placeholder="Add approval notes (optional)..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        <div className="border-t border-gray-200 px-3 py-2 flex justify-end gap-3 bg-gray-50">
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={() => onApprove({ approvalNotes })}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Approve
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== 6. Reject/Flag Consumption Modal ====================
interface RejectConsumptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReject: (data: any) => void;
  consumption: any;
}

export function RejectConsumptionModal({ isOpen, onClose, onReject, consumption }: RejectConsumptionModalProps) {
  const [reason, setReason] = useState('');

  if (!isOpen || !consumption) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="bg-gradient-to-r from-red-500 to-red-600 px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <XCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Reject/Flag Consumption</h2>
            </div>
          </div>
          <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-600 mb-2">Flag consumption record for {consumption.materialName}</p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Rejection *</label>
            <textarea
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain the reason for rejection..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>

        <div className="border-t border-gray-200 px-3 py-2 flex justify-end gap-3 bg-gray-50">
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={() => onReject({ reason })}
            disabled={!reason}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== 7. Bulk Upload Modal ====================
interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (data: any) => void;
}

export function BulkUploadModal({ isOpen, onClose, onUpload }: BulkUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Upload className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Bulk Upload</h2>
            </div>
          </div>
          <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-600 mb-2">Upload multiple consumption records from a CSV file</p>
          <p className="text-xs text-gray-500 mb-2">
            First row must be a header of field names (e.g. projectName, materialCode, materialName, unit, plannedQty, consumedQty, unitCost, totalCost, status).
          </p>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Upload className="w-12 h-12 text-gray-400 mb-2" />
            <p className="text-sm text-gray-600 mb-2">Drop your CSV file here or click to browse</p>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </div>
          {file && <p className="text-sm text-gray-600 mt-2">Selected: {file.name}</p>}
        </div>

        <div className="border-t border-gray-200 px-3 py-2 flex justify-end gap-3 bg-gray-50">
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={() => onUpload({ file })}
            disabled={!file}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300"
          >
            Upload
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== 8. Export Report Modal ====================
interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (data: any) => void;
}

export function ExportReportModal({ isOpen, onClose, onExport }: ExportReportModalProps) {
  const [format, setFormat] = useState('Excel');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Download className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Export Report</h2>
            </div>
          </div>
          <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-600 mb-2">Export material consumption data</p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Export Format</label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            >
              <option>Excel</option>
              <option>PDF</option>
              <option>CSV</option>
            </select>
          </div>
        </div>

        <div className="border-t border-gray-200 px-3 py-2 flex justify-end gap-3 bg-gray-50">
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={() => onExport({ format })}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
          >
            Export
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== 9. Material Return Modal ====================
interface MaterialReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReturn: (data: any) => void;
  consumption: any;
}

export function MaterialReturnModal({ isOpen, onClose, onReturn, consumption }: MaterialReturnModalProps) {
  const [returnQty, setReturnQty] = useState('');
  const [reason, setReason] = useState('');

  if (!isOpen || !consumption) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <RotateCcw className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Material Return</h2>
            </div>
          </div>
          <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-2">
          <p className="text-gray-600">Return unused material for {consumption.materialName}</p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Return Quantity</label>
            <input
              type="number"
              value={returnQty}
              onChange={(e) => setReturnQty(e.target.value)}
              placeholder={`Max: ${consumption.consumedQty} ${consumption.unit}`}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason for return..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
            />
          </div>
        </div>

        <div className="border-t border-gray-200 px-3 py-2 flex justify-end gap-3 bg-gray-50">
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={() => onReturn({ returnQty, reason })}
            disabled={!returnQty}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:bg-gray-300"
          >
            Process Return
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== 10. Adjust Quantity Modal ====================
interface AdjustQuantityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdjust: (data: any) => void;
  consumption: any;
}

export function AdjustQuantityModal({ isOpen, onClose, onAdjust, consumption }: AdjustQuantityModalProps) {
  const [newQty, setNewQty] = useState('');
  const [adjustmentReason, setAdjustmentReason] = useState('');

  if (!isOpen || !consumption) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="bg-gradient-to-r from-cyan-500 to-cyan-600 px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Edit className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Adjust Quantity</h2>
            </div>
          </div>
          <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-2">
          <p className="text-gray-600">Adjust consumed quantity for {consumption.materialName}</p>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-600">Current: {consumption.consumedQty} {consumption.unit}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">New Quantity</label>
            <input
              type="number"
              value={newQty}
              onChange={(e) => setNewQty(e.target.value)}
              placeholder="Enter new quantity"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Adjustment Reason</label>
            <textarea
              rows={3}
              value={adjustmentReason}
              onChange={(e) => setAdjustmentReason(e.target.value)}
              placeholder="Explain the adjustment..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
            />
          </div>
        </div>

        <div className="border-t border-gray-200 px-3 py-2 flex justify-end gap-3 bg-gray-50">
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={() => onAdjust({ newQty, adjustmentReason })}
            disabled={!newQty || !adjustmentReason}
            className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:bg-gray-300"
          >
            Adjust
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== 11. Add Comments/Notes Modal ====================
interface AddCommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: any) => void;
  consumption: any;
}

export function AddCommentsModal({ isOpen, onClose, onAdd, consumption }: AddCommentsModalProps) {
  const [comment, setComment] = useState('');

  if (!isOpen || !consumption) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="bg-gradient-to-r from-pink-500 to-pink-600 px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Add Comment</h2>
            </div>
          </div>
          <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-600 mb-2">Add comment for {consumption.materialName}</p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Comment</label>
            <textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add your comment..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
            />
          </div>
        </div>

        <div className="border-t border-gray-200 px-3 py-2 flex justify-end gap-3 bg-gray-50">
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={() => onAdd({ comment })}
            disabled={!comment}
            className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:bg-gray-300"
          >
            Add Comment
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== 12. Generate Variance Report Modal ====================
interface GenerateVarianceReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (data: any) => void;
}

export function GenerateVarianceReportModal({ isOpen, onClose, onGenerate }: GenerateVarianceReportModalProps) {
  const [reportType, setReportType] = useState('Summary');
  const [dateRange, setDateRange] = useState('This Month');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="bg-gradient-to-r from-violet-500 to-violet-600 px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Generate Variance Report</h2>
            </div>
          </div>
          <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
            >
              <option>Summary</option>
              <option>Detailed Analysis</option>
              <option>By Project</option>
              <option>By Material</option>
              <option>By Category</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
            >
              <option>This Month</option>
              <option>Last Month</option>
              <option>Last 3 Months</option>
              <option>Last 6 Months</option>
              <option>This Year</option>
            </select>
          </div>
        </div>

        <div className="border-t border-gray-200 px-3 py-2 flex justify-end gap-3 bg-gray-50">
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={() => onGenerate({ reportType, dateRange })}
            className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700"
          >
            Generate Report
          </button>
        </div>
      </div>
    </div>
  );
}
