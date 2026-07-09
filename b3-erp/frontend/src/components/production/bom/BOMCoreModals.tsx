'use client'

import { useState } from 'react'
import { X, Plus, Edit, Copy, Eye, Package, Calendar, DollarSign, Users, CheckCircle, AlertTriangle, FileText, Layers } from 'lucide-react'

// ============================================================================
// INTERFACES
// ============================================================================

// Create BOM Modal
interface CreateBOMModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (bom: CreateBOMData) => void
}

export interface CreateBOMData {
  productId: string
  bomCode: string
  version: string
  revision: number
  effectiveDateFrom: string
  effectiveDateTo: string
  status: 'draft' | 'active'
  notes: string
}

// Edit BOM Modal
interface EditBOMModalProps {
  isOpen: boolean
  onClose: () => void
  onUpdate: (bom: EditBOMData) => void
  currentBOM: BOMDetails | null
}

export interface EditBOMData {
  version: string
  revision: number
  effectiveDateFrom: string
  effectiveDateTo: string
  status: 'draft' | 'active' | 'inactive' | 'obsolete'
  notes: string
}

// Copy BOM Modal
interface CopyBOMModalProps {
  isOpen: boolean
  onClose: () => void
  onCopy: (copyData: CopyBOMData) => void
  sourceBOM: BOMDetails | null
}

export interface CopyBOMData {
  sourceId: string
  targetProductId: string
  newBomCode: string
  newVersion: string
  copyComponents: boolean
  copyCosts: boolean
  copyNotes: boolean
}

// View BOM Details Modal
interface ViewBOMDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  bom: BOMDetails | null
}

export interface BOMDetails {
  id: string
  bomCode: string
  productId: string
  productName: string
  productCode: string
  version: string
  revision: number
  status: 'draft' | 'active' | 'inactive' | 'obsolete'
  effectiveDateFrom: string
  effectiveDateTo: string
  notes: string
  components: BOMComponent[]
  componentCount: number
  bomLevels: number
  costs: {
    material: number
    labor: number
    overhead: number
    total: number
  }
  createdBy: string
  createdAt: string
  modifiedBy: string
  modifiedAt: string
  approvedBy?: string
  approvedAt?: string
}

export interface BOMComponent {
  id: string
  itemCode: string
  itemName: string
  quantity: number
  uom: string
  unitCost: number
  totalCost: number
  level: number
}

// ============================================================================
// CREATE BOM MODAL
// ============================================================================

export function CreateBOMModal({ isOpen, onClose, onCreate }: CreateBOMModalProps) {
  const [formData, setFormData] = useState<CreateBOMData>({
    productId: '',
    bomCode: `BOM-${Date.now().toString().slice(-8)}`,
    version: '1.0',
    revision: 1,
    effectiveDateFrom: new Date().toISOString().split('T')[0],
    effectiveDateTo: '',
    status: 'draft',
    notes: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.productId) newErrors.productId = 'Product is required'
    if (!formData.bomCode) newErrors.bomCode = 'BOM Code is required'
    if (!formData.version) newErrors.version = 'Version is required'
    if (!formData.effectiveDateFrom) newErrors.effectiveDateFrom = 'Effective from date is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validateForm()) {
      onCreate(formData)
      onClose()
      resetForm()
    }
  }

  const resetForm = () => {
    setFormData({
      productId: '',
      bomCode: `BOM-${Date.now().toString().slice(-8)}`,
      version: '1.0',
      revision: 1,
      effectiveDateFrom: new Date().toISOString().split('T')[0],
      effectiveDateTo: '',
      status: 'draft',
      notes: ''
    })
    setErrors({})
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-green-700 px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Plus className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Create New BOM</h2>
              <p className="text-sm text-green-100">Define a new Bill of Materials</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Product Selection */}
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.productId}
              onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                errors.productId ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select a product</option>
              <option value="prod-001">Assembly Product A - PROD-A001</option>
              <option value="prod-002">Manufacturing Item B - PROD-B002</option>
              <option value="prod-003">Finished Goods C - PROD-C003</option>
            </select>
            {errors.productId && <p className="text-xs text-red-500 mt-1">{errors.productId}</p>}
          </div>

          {/* BOM Code and Version */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                BOM Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.bomCode}
                onChange={(e) => setFormData({ ...formData, bomCode: e.target.value })}
                placeholder="BOM-12345678"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  errors.bomCode ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.bomCode && <p className="text-xs text-red-500 mt-1">{errors.bomCode}</p>}
              <p className="text-xs text-gray-500 mt-1">Auto-generated, can be edited</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Version <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.version}
                onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                placeholder="1.0"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  errors.version ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.version && <p className="text-xs text-red-500 mt-1">{errors.version}</p>}
            </div>
          </div>

          {/* Revision and Status */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Revision Number <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.revision}
                onChange={(e) => setFormData({ ...formData, revision: parseInt(e.target.value) || 1 })}
                min={1}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'draft' | 'active' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
              </select>
            </div>
          </div>

          {/* Effective Dates */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Effective Date From <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.effectiveDateFrom}
                onChange={(e) => setFormData({ ...formData, effectiveDateFrom: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  errors.effectiveDateFrom ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.effectiveDateFrom && <p className="text-xs text-red-500 mt-1">{errors.effectiveDateFrom}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Effective Date To
              </label>
              <input
                type="date"
                value={formData.effectiveDateTo}
                onChange={(e) => setFormData({ ...formData, effectiveDateTo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <p className="text-xs text-gray-500 mt-1">Leave blank for no end date</p>
            </div>
          </div>

          {/* Notes */}
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
              placeholder="Add any additional notes or comments about this BOM..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Components Info */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Plus className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-green-900">Components</p>
                <p className="text-sm text-green-700">
                  After creating this BOM you can add materials and sub-assemblies by opening it in the editor.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 px-3 py-2 flex justify-end gap-3 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            Create BOM
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// EDIT BOM MODAL
// ============================================================================

export function EditBOMModal({ isOpen, onClose, onUpdate, currentBOM }: EditBOMModalProps) {
  const [formData, setFormData] = useState<EditBOMData>({
    version: currentBOM?.version || '',
    revision: currentBOM?.revision || 1,
    effectiveDateFrom: currentBOM?.effectiveDateFrom || '',
    effectiveDateTo: currentBOM?.effectiveDateTo || '',
    status: currentBOM?.status || 'draft',
    notes: currentBOM?.notes || ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Update form when currentBOM changes
  useState(() => {
    if (currentBOM) {
      setFormData({
        version: currentBOM.version,
        revision: currentBOM.revision,
        effectiveDateFrom: currentBOM.effectiveDateFrom,
        effectiveDateTo: currentBOM.effectiveDateTo,
        status: currentBOM.status,
        notes: currentBOM.notes
      })
    }
  })

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.version) newErrors.version = 'Version is required'
    if (!formData.effectiveDateFrom) newErrors.effectiveDateFrom = 'Effective from date is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validateForm()) {
      onUpdate(formData)
      onClose()
    }
  }

  if (!isOpen || !currentBOM) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-xl shadow-2xl  w-full max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Edit className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Edit BOM</h2>
              <p className="text-sm text-blue-100">{currentBOM.bomCode}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Current BOM Summary */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 mb-3">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Current BOM Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div>
                <p className="text-sm text-blue-600 mb-1">BOM Code</p>
                <p className="font-bold text-blue-900">{currentBOM.bomCode}</p>
              </div>
              <div>
                <p className="text-sm text-blue-600 mb-1">Product</p>
                <p className="font-bold text-blue-900">{currentBOM.productName}</p>
              </div>
              <div>
                <p className="text-sm text-blue-600 mb-1">Version</p>
                <p className="font-bold text-blue-900">{currentBOM.version}</p>
              </div>
              <div>
                <p className="text-sm text-blue-600 mb-1">Status</p>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  currentBOM.status === 'active' ? 'bg-green-100 text-green-700' :
                  currentBOM.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                  currentBOM.status === 'inactive' ? 'bg-gray-100 text-gray-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {currentBOM.status.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Editable Fields */}
          <div className="mb-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">BOM Information</h3>

            {/* Version and Revision */}
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Version <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.version ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.version && <p className="text-xs text-red-500 mt-1">{errors.version}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Revision Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.revision}
                  onChange={(e) => setFormData({ ...formData, revision: parseInt(e.target.value) || 1 })}
                  min={1}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Effective Dates */}
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Effective Date From <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.effectiveDateFrom}
                  onChange={(e) => setFormData({ ...formData, effectiveDateFrom: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.effectiveDateFrom ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.effectiveDateFrom && <p className="text-xs text-red-500 mt-1">{errors.effectiveDateFrom}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Effective Date To
                </label>
                <input
                  type="date"
                  value={formData.effectiveDateTo}
                  onChange={(e) => setFormData({ ...formData, effectiveDateTo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Status */}
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="obsolete">Obsolete</option>
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Component List Display */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900">Components</h3>
            </div>

            {currentBOM.components && currentBOM.components.length > 0 ? (
              <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Item Code</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Item Name</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase">Quantity</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">UOM</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase">Unit Cost</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase">Total Cost</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {currentBOM.components.map((component) => (
                        <tr key={component.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{component.itemCode}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{component.itemName}</td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900">{component.quantity}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{component.uom}</td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900">₹{component.unitCost.toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">₹{component.totalCost.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-8 text-center">
                <Package className="h-12 w-12 text-gray-400 mb-3" />
                <p className="text-gray-600">No components added yet</p>
                <p className="text-sm text-gray-500 mt-1">Components can be added from the BOM editor</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-50 px-3 py-2 flex justify-end gap-3 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            Update BOM
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// COPY BOM MODAL
// ============================================================================

export function CopyBOMModal({ isOpen, onClose, onCopy, sourceBOM }: CopyBOMModalProps) {
  const [formData, setFormData] = useState<CopyBOMData>({
    sourceId: sourceBOM?.id || '',
    targetProductId: '',
    newBomCode: `BOM-${Date.now().toString().slice(-8)}`,
    newVersion: '1.0',
    copyComponents: true,
    copyCosts: true,
    copyNotes: false
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.targetProductId) newErrors.targetProductId = 'Target product is required'
    if (!formData.newBomCode) newErrors.newBomCode = 'BOM Code is required'
    if (!formData.newVersion) newErrors.newVersion = 'Version is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validateForm()) {
      onCopy(formData)
      onClose()
    }
  }

  if (!isOpen || !sourceBOM) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Copy className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Copy BOM</h2>
              <p className="text-sm text-purple-100">Duplicate BOM to another product</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Source BOM Summary */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 mb-3">
            <h3 className="text-lg font-semibold text-purple-900 mb-2">Source BOM</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div>
                <p className="text-sm text-purple-600 mb-1">BOM Code</p>
                <p className="font-bold text-purple-900">{sourceBOM.bomCode}</p>
              </div>
              <div>
                <p className="text-sm text-purple-600 mb-1">Product</p>
                <p className="font-bold text-purple-900">{sourceBOM.productName}</p>
              </div>
              <div>
                <p className="text-sm text-purple-600 mb-1">Version</p>
                <p className="font-bold text-purple-900">{sourceBOM.version}</p>
              </div>
              <div>
                <p className="text-sm text-purple-600 mb-1">Components</p>
                <p className="font-bold text-purple-900">{sourceBOM.componentCount}</p>
              </div>
            </div>
          </div>

          {/* Target Product Selection */}
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Product <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.targetProductId}
              onChange={(e) => setFormData({ ...formData, targetProductId: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                errors.targetProductId ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select target product</option>
              <option value="prod-101">New Product X - PROD-X101</option>
              <option value="prod-102">Assembly Y - PROD-Y102</option>
              <option value="prod-103">Variant Z - PROD-Z103</option>
            </select>
            {errors.targetProductId && <p className="text-xs text-red-500 mt-1">{errors.targetProductId}</p>}
          </div>

          {/* New BOM Code and Version */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New BOM Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.newBomCode}
                onChange={(e) => setFormData({ ...formData, newBomCode: e.target.value })}
                placeholder="BOM-12345678"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.newBomCode ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.newBomCode && <p className="text-xs text-red-500 mt-1">{errors.newBomCode}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Version <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.newVersion}
                onChange={(e) => setFormData({ ...formData, newVersion: e.target.value })}
                placeholder="1.0"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.newVersion ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.newVersion && <p className="text-xs text-red-500 mt-1">{errors.newVersion}</p>}
            </div>
          </div>

          {/* Copy Options */}
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Copy Options
            </label>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 border border-gray-200">
                <input
                  type="checkbox"
                  checked={formData.copyComponents}
                  onChange={(e) => setFormData({ ...formData, copyComponents: e.target.checked })}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700">Copy Components</span>
                  <p className="text-xs text-gray-500">Include all component items and quantities</p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 border border-gray-200">
                <input
                  type="checkbox"
                  checked={formData.copyCosts}
                  onChange={(e) => setFormData({ ...formData, copyCosts: e.target.checked })}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700">Copy Costs</span>
                  <p className="text-xs text-gray-500">Include cost information from source BOM</p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 border border-gray-200">
                <input
                  type="checkbox"
                  checked={formData.copyNotes}
                  onChange={(e) => setFormData({ ...formData, copyNotes: e.target.checked })}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700">Copy Notes</span>
                  <p className="text-xs text-gray-500">Include notes and documentation</p>
                </div>
              </label>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-purple-800">
                <p className="font-semibold mb-1">Copy BOM Information</p>
                <p className="text-xs">
                  A new BOM will be created with the selected options. The original BOM will remain unchanged.
                  The new BOM will be created in draft status and can be modified before activation.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 px-3 py-2 flex justify-end gap-3 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
          >
            <Copy className="h-4 w-4" />
            Copy BOM
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// VIEW BOM DETAILS MODAL
// ============================================================================

export function ViewBOMDetailsModal({ isOpen, onClose, bom }: ViewBOMDetailsModalProps) {
  if (!isOpen || !bom) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-xl shadow-2xl  w-full max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Eye className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">BOM Details</h2>
              <p className="text-sm text-indigo-100">{bom.bomCode}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Summary Header */}
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-3 mb-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div>
                <p className="text-sm text-indigo-600 mb-1">BOM Code</p>
                <p className="font-bold text-indigo-900">{bom.bomCode}</p>
              </div>
              <div>
                <p className="text-sm text-indigo-600 mb-1">Product</p>
                <p className="font-bold text-indigo-900">{bom.productName}</p>
              </div>
              <div>
                <p className="text-sm text-indigo-600 mb-1">Version</p>
                <p className="font-bold text-indigo-900">{bom.version} (Rev. {bom.revision})</p>
              </div>
              <div>
                <p className="text-sm text-indigo-600 mb-1">Status</p>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  bom.status === 'active' ? 'bg-green-100 text-green-700' :
                  bom.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                  bom.status === 'inactive' ? 'bg-gray-100 text-gray-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {bom.status.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* BOM Information */}
          <div className="mb-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-600" />
              BOM Information
            </h3>
            <div className="bg-gray-50 rounded-lg p-3 grid grid-cols-2 md:grid-cols-3 gap-2">
              <div>
                <p className="text-sm text-gray-600">BOM Code</p>
                <p className="font-semibold text-gray-900">{bom.bomCode}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Product Code</p>
                <p className="font-semibold text-gray-900">{bom.productCode}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Product Name</p>
                <p className="font-semibold text-gray-900">{bom.productName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Version</p>
                <p className="font-semibold text-gray-900">{bom.version}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Revision</p>
                <p className="font-semibold text-gray-900">{bom.revision}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">BOM Levels</p>
                <p className="font-semibold text-gray-900">{bom.bomLevels}</p>
              </div>
            </div>
          </div>

          {/* Status & Dates */}
          <div className="mb-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-indigo-600" />
              Status & Dates
            </h3>
            <div className="bg-gray-50 rounded-lg p-3 grid grid-cols-2 md:grid-cols-3 gap-2">
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                  bom.status === 'active' ? 'bg-green-100 text-green-700' :
                  bom.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                  bom.status === 'inactive' ? 'bg-gray-100 text-gray-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {bom.status.toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Created Date</p>
                <p className="font-semibold text-gray-900">{new Date(bom.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Modified Date</p>
                <p className="font-semibold text-gray-900">{new Date(bom.modifiedAt).toLocaleDateString()}</p>
              </div>
              {bom.approvedAt && (
                <div>
                  <p className="text-sm text-gray-600">Approved Date</p>
                  <p className="font-semibold text-gray-900">{new Date(bom.approvedAt).toLocaleDateString()}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600">Effective From</p>
                <p className="font-semibold text-gray-900">{new Date(bom.effectiveDateFrom).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Effective To</p>
                <p className="font-semibold text-gray-900">
                  {bom.effectiveDateTo ? new Date(bom.effectiveDateTo).toLocaleDateString() : 'No end date'}
                </p>
              </div>
            </div>
          </div>

          {/* Cost Summary */}
          <div className="mb-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-indigo-600" />
              Cost Summary
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-sm text-blue-600 mb-1">Material Cost</p>
                <p className="text-2xl font-bold text-blue-900">₹{bom.costs.material.toLocaleString()}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <p className="text-sm text-green-600 mb-1">Labor Cost</p>
                <p className="text-2xl font-bold text-green-900">₹{bom.costs.labor.toLocaleString()}</p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-3">
                <p className="text-sm text-yellow-600 mb-1">Overhead Cost</p>
                <p className="text-2xl font-bold text-yellow-900">₹{bom.costs.overhead.toLocaleString()}</p>
              </div>
              <div className="bg-indigo-50 rounded-lg p-3 border-2 border-indigo-200">
                <p className="text-sm text-indigo-600 mb-1">Total Cost</p>
                <p className="text-2xl font-bold text-indigo-900">₹{bom.costs.total.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Components Count and Levels */}
          <div className="mb-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Layers className="h-5 w-5 text-indigo-600" />
              Component Structure
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-purple-50 rounded-lg p-3">
                <p className="text-sm text-purple-600 mb-1">Total Components</p>
                <p className="text-3xl font-bold text-purple-900">{bom.componentCount}</p>
              </div>
              <div className="bg-pink-50 rounded-lg p-3">
                <p className="text-sm text-pink-600 mb-1">BOM Levels</p>
                <p className="text-3xl font-bold text-pink-900">{bom.bomLevels}</p>
              </div>
            </div>
          </div>

          {/* Components List */}
          {bom.components && bom.components.length > 0 && (
            <div className="mb-3">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Package className="h-5 w-5 text-indigo-600" />
                Components
              </h3>
              <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Level</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Item Code</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Item Name</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase">Quantity</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">UOM</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase">Unit Cost</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase">Total Cost</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {bom.components.map((component) => (
                        <tr key={component.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-700">
                            <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-medium">
                              L{component.level}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{component.itemCode}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{component.itemName}</td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900">{component.quantity}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{component.uom}</td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900">₹{component.unitCost.toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">₹{component.totalCost.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Created/Modified By Information */}
          <div className="mb-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-600" />
              Audit Information
            </h3>
            <div className="bg-gray-50 rounded-lg p-3 grid grid-cols-2 md:grid-cols-3 gap-2">
              <div>
                <p className="text-sm text-gray-600">Created By</p>
                <p className="font-semibold text-gray-900">{bom.createdBy}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Created At</p>
                <p className="font-semibold text-gray-900">{new Date(bom.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Modified By</p>
                <p className="font-semibold text-gray-900">{bom.modifiedBy}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Modified At</p>
                <p className="font-semibold text-gray-900">{new Date(bom.modifiedAt).toLocaleString()}</p>
              </div>
              {bom.approvedBy && (
                <>
                  <div>
                    <p className="text-sm text-gray-600">Approved By</p>
                    <p className="font-semibold text-gray-900">{bom.approvedBy}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Approved At</p>
                    <p className="font-semibold text-gray-900">{bom.approvedAt ? new Date(bom.approvedAt).toLocaleString() : '-'}</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Notes */}
          {bom.notes && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Notes</h3>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{bom.notes}</p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-gray-50 px-3 py-2 flex justify-end border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
