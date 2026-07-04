'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MasterDataService, mdLabel, MDEmployee, MDWarehouse } from '@/services/master-data.service'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  X,
  Plus,
  Trash2,
  Search,
  Upload,
  FileText,
  Calendar,
  DollarSign,
  Package,
  AlertCircle,
  Info,
  Save,
  Send,
  ChevronDown,
  Building2,
  User,
  Clock,
  Paperclip,
  Download,
  Calculator,
  Edit2,
  Copy,
  ShoppingCart
} from 'lucide-react'

interface RequisitionItem {
  id: string
  itemCode: string
  itemName: string
  description: string
  category: string
  quantity: number
  unit: string
  estimatedPrice: number
  totalPrice: number
  vendor?: string
  notes?: string
  specifications?: string
  urgency?: 'normal' | 'urgent'
}

interface RequisitionForm {
  // Basic Info
  prNumber: string
  requestDate: string
  department: string
  requestedBy: string
  requestedByEmail: string
  requestedByPhone: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  purpose: string
  projectCode?: string
  costCenter?: string

  // Delivery Info
  deliveryDate: string
  deliveryLocation: string
  deliveryAddress?: string
  deliveryInstructions?: string
  contactPerson?: string
  contactPhone?: string

  // Items
  items: RequisitionItem[]

  // Budget Info
  budgetCode: string
  budgetAvailable: number
  estimatedTotal: number
  currencyCode: string

  // Approval Info
  approver: string
  justification: string
  alternativeOptions?: string

  // Additional Info
  attachments: File[]
  notes?: string
  termsAccepted: boolean
}

const initialForm: RequisitionForm = {
  prNumber: 'PR-2025-' + Math.floor(Math.random() * 10000).toString().padStart(4, '0'),
  requestDate: new Date().toISOString().split('T')[0],
  department: '',
  requestedBy: '',
  requestedByEmail: '',
  requestedByPhone: '',
  priority: 'medium',
  purpose: '',
  deliveryDate: '',
  deliveryLocation: '',
  items: [],
  budgetCode: '',
  budgetAvailable: 0,
  estimatedTotal: 0,
  currencyCode: 'INR',
  approver: '',
  justification: '',
  attachments: [],
  termsAccepted: false
}

const departments = [
  'Production',
  'Maintenance',
  'Quality Control',
  'R&D',
  'Administration',
  'IT',
  'Finance',
  'HR',
  'Procurement',
  'Sales',
  'Marketing'
]

const categories = [
  'Raw Materials',
  'Components',
  'Tools',
  'Equipment',
  'Consumables',
  'Services',
  'Software',
  'Office Supplies',
  'Safety Equipment',
  'Other'
]

const units = ['Pcs', 'Kg', 'Lt', 'Mt', 'Box', 'Roll', 'Set', 'Pack', 'Hour', 'Day', 'Month']

// Seed data — used as initial state; overwritten by live API when available
const deliveryLocationsSeed = [
  { id: 'warehouse-main', name: 'Main Warehouse', address: '123 Industrial Ave, Sector 5' },
  { id: 'warehouse-secondary', name: 'Secondary Warehouse', address: '456 Storage Rd, Sector 8' },
  { id: 'production-floor', name: 'Production Floor', address: 'Building A, Ground Floor' },
  { id: 'office-building', name: 'Office Building', address: 'Corporate Tower, 5th Floor' },
  { id: 'rd-lab', name: 'R&D Laboratory', address: 'Innovation Center, Building C' }
]

const approversSeed = [
  { id: '1', name: 'Amit Sharma', role: 'Department Head', department: 'Operations', limit: 500000, email: 'amit.sharma@company.com' },
  { id: '2', name: 'Priya Patel', role: 'Finance Manager', department: 'Finance', limit: 1000000, email: 'priya.patel@company.com' },
  { id: '3', name: 'Rajesh Kumar', role: 'GM Operations', department: 'Operations', limit: 2500000, email: 'rajesh.kumar@company.com' },
  { id: '4', name: 'Vijay Singh', role: 'Director', department: 'Board', limit: 5000000, email: 'vijay.singh@company.com' }
]

// Mock item catalog for search
const itemCatalog = [
  { code: 'STL-001', name: 'Stainless Steel Sheet', category: 'Raw Materials', unit: 'Kg', price: 850 },
  { code: 'CMP-002', name: 'Circuit Board', category: 'Components', unit: 'Pcs', price: 2500 },
  { code: 'TLS-003', name: 'Drill Bit Set', category: 'Tools', unit: 'Set', price: 1200 },
  { code: 'CNS-004', name: 'Lubricant Oil', category: 'Consumables', unit: 'Lt', price: 450 },
  { code: 'SFT-005', name: 'Safety Helmet', category: 'Safety Equipment', unit: 'Pcs', price: 350 }
]

export default function AddRequisitionPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [form, setForm] = useState<RequisitionForm>(initialForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showItemModal, setShowItemModal] = useState(false)
  const [editingItem, setEditingItem] = useState<RequisitionItem | null>(null)
  const [searchingItems, setSearchingItems] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isLoadingMasterData, setIsLoadingMasterData] = useState(false)

  // Live master-data state — seeds are the fallback until API responds
  const [approvers, setApprovers] = useState<Array<{ id: string; name: string; role: string; department: string; limit: number; email: string }>>(approversSeed)
  const [deliveryLocations, setDeliveryLocations] = useState<Array<{ id: string; name: string; address: string }>>(deliveryLocationsSeed)

  useEffect(() => {
    setIsLoadingMasterData(true)
    Promise.all([
      MasterDataService.getEmployees(),
      MasterDataService.getWarehouses(),
    ]).then(([employees, warehouses]) => {
      if (employees.length > 0) {
        setApprovers(
          employees.map((e: MDEmployee) => ({
            id: e.id,
            name: mdLabel.employee(e),
            role: e.designation || 'Employee',
            department: e.department || '',
            limit: 500000,
            email: '',
          }))
        )
      }
      if (warehouses.length > 0) {
        setDeliveryLocations(
          warehouses.map((w: MDWarehouse) => ({
            id: w.id,
            name: w.warehouseName || w.warehouseCode || w.id,
            address: [w.warehouseCode, w.city].filter(Boolean).join(', '),
          }))
        )
      }
    }).finally(() => setIsLoadingMasterData(false))
  }, [])

  const steps = [
    { id: 1, title: 'Basic Information', icon: FileText, description: 'Requester and purpose details' },
    { id: 2, title: 'Add Items', icon: Package, description: 'Items to be procured' },
    { id: 3, title: 'Delivery Details', icon: Calendar, description: 'When and where to deliver' },
    { id: 4, title: 'Budget & Approval', icon: DollarSign, description: 'Budget and approver selection' },
    { id: 5, title: 'Review & Submit', icon: Check, description: 'Final review before submission' }
  ]

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    switch (step) {
      case 1:
        if (!form.department) newErrors.department = 'Department is required'
        if (!form.requestedBy) newErrors.requestedBy = 'Requester name is required'
        if (!form.requestedByEmail) newErrors.requestedByEmail = 'Email is required'
        if (form.requestedByEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.requestedByEmail)) {
          newErrors.requestedByEmail = 'Invalid email format'
        }
        if (!form.purpose) newErrors.purpose = 'Purpose is required'
        break
      case 2:
        if (form.items.length === 0) newErrors.items = 'At least one item is required'
        form.items.forEach((item, index) => {
          if (!item.itemName) newErrors[`item_${index}_name`] = 'Item name is required'
          if (!item.category) newErrors[`item_${index}_category`] = 'Category is required'
          if (item.quantity <= 0) newErrors[`item_${index}_quantity`] = 'Quantity must be greater than 0'
        })
        break
      case 3:
        if (!form.deliveryDate) newErrors.deliveryDate = 'Delivery date is required'
        if (!form.deliveryLocation) newErrors.deliveryLocation = 'Delivery location is required'
        if (new Date(form.deliveryDate) <= new Date()) {
          newErrors.deliveryDate = 'Delivery date must be in the future'
        }
        break
      case 4:
        if (!form.budgetCode) newErrors.budgetCode = 'Budget code is required'
        if (!form.approver) newErrors.approver = 'Approver is required'
        if (!form.justification) newErrors.justification = 'Business justification is required'
        if (form.estimatedTotal > form.budgetAvailable && form.budgetAvailable > 0) {
          newErrors.budget = 'Estimated total exceeds available budget'
        }
        break
      case 5:
        if (!form.termsAccepted) newErrors.terms = 'You must accept the terms and conditions'
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1)
      window.scrollTo(0, 0)
    }
  }

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1)
    window.scrollTo(0, 0)
  }

  const handleAddItem = () => {
    const newItem: RequisitionItem = {
      id: Date.now().toString(),
      itemCode: '',
      itemName: '',
      description: '',
      category: '',
      quantity: 1,
      unit: 'Pcs',
      estimatedPrice: 0,
      totalPrice: 0,
      urgency: 'normal'
    }
    setEditingItem(newItem)
    setShowItemModal(true)
  }

  const handleSaveItem = (item: RequisitionItem) => {
    const updatedItem = {
      ...item,
      totalPrice: item.quantity * item.estimatedPrice
    }

    if (form.items.find(i => i.id === item.id)) {
      setForm({
        ...form,
        items: form.items.map(i => i.id === item.id ? updatedItem : i)
      })
    } else {
      setForm({
        ...form,
        items: [...form.items, updatedItem]
      })
    }

    setShowItemModal(false)
    setEditingItem(null)

    // Recalculate total
    const newTotal = form.items.reduce((sum, i) => {
      if (i.id === item.id) return sum + updatedItem.totalPrice
      return sum + i.totalPrice
    }, 0)

    setForm(prev => ({ ...prev, estimatedTotal: newTotal }))
  }

  const handleDeleteItem = (id: string) => {
    const updatedItems = form.items.filter(i => i.id !== id)
    const newTotal = updatedItems.reduce((sum, item) => sum + item.totalPrice, 0)
    setForm({
      ...form,
      items: updatedItems,
      estimatedTotal: newTotal
    })
  }

  const handleDuplicateItem = (item: RequisitionItem) => {
    const newItem = {
      ...item,
      id: Date.now().toString(),
      itemCode: item.itemCode + '-COPY'
    }
    setForm({
      ...form,
      items: [...form.items, newItem],
      estimatedTotal: form.estimatedTotal + newItem.totalPrice
    })
  }

  const handleSubmit = async (isDraft: boolean = false) => {
    if (!isDraft && !validateStep(5)) {
      return
    }

    setIsSaving(true)

    // Simulate API call
    setTimeout(() => {
      console.log('Submitting requisition:', { ...form, status: isDraft ? 'draft' : 'pending_approval' })
      router.push('/procurement/requisitions')
    }, 1500)
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* PR Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  PR Number <span className="text-gray-400">(Auto-generated)</span>
                </label>
                <input
                  type="text"
                  value={form.prNumber}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
              </div>

              {/* Request Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Request Date
                </label>
                <input
                  type="date"
                  value={form.requestDate}
                  onChange={(e) => setForm({ ...form, requestDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Department */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.department ? 'border-red-500' : 'border-gray-300'
                    }`}
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
                {errors.department && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.department}
                  </p>
                )}
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority Level
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {['low', 'medium', 'high', 'urgent'].map((priority) => (
                    <button
                      key={priority}
                      type="button"
                      onClick={() => setForm({ ...form, priority: priority as any })}
                      className={`px-3 py-2 rounded-lg font-medium text-sm transition-all ${form.priority === priority
                          ? priority === 'urgent'
                            ? 'bg-red-600 text-white shadow-md'
                            : priority === 'high'
                              ? 'bg-orange-600 text-white shadow-md'
                              : priority === 'medium'
                                ? 'bg-yellow-600 text-white shadow-md'
                                : 'bg-gray-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Requester Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Requested By <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={form.requestedBy}
                    onChange={(e) => setForm({ ...form, requestedBy: e.target.value })}
                    placeholder="Enter requester name"
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.requestedBy ? 'border-red-500' : 'border-gray-300'
                      }`}
                  />
                </div>
                {errors.requestedBy && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.requestedBy}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={form.requestedByEmail}
                  onChange={(e) => setForm({ ...form, requestedByEmail: e.target.value })}
                  placeholder="requester@company.com"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.requestedByEmail ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
                {errors.requestedByEmail && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.requestedByEmail}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={form.requestedByPhone}
                  onChange={(e) => setForm({ ...form, requestedByPhone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Project Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Code <span className="text-gray-400">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={form.projectCode || ''}
                  onChange={(e) => setForm({ ...form, projectCode: e.target.value })}
                  placeholder="PRJ-2025-001"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Cost Center */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cost Center <span className="text-gray-400">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={form.costCenter || ''}
                  onChange={(e) => setForm({ ...form, costCenter: e.target.value })}
                  placeholder="CC-100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Purpose */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Purpose / Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={form.purpose}
                  onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                  placeholder="Describe the purpose of this requisition..."
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.purpose ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
                {errors.purpose && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.purpose}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  {form.purpose.length}/500 characters
                </p>
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-3">
            {/* Items Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Requisition Items</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {form.items.length} item{form.items.length !== 1 ? 's' : ''} added •
                  Total: ₹{form.estimatedTotal.toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSearchingItems(true)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Search className="h-4 w-4" />
                  Search Catalog
                </button>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4" />
                  Add Item
                </button>
              </div>
            </div>

            {errors.items && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <p className="text-sm text-red-600">{errors.items}</p>
              </div>
            )}

            {/* Items List */}
            {form.items.length > 0 ? (
              <div className="space-y-3">
                {form.items.map((item, index) => (
                  <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-gray-900">{item.itemName || 'Unnamed Item'}</h4>
                              {item.urgency === 'urgent' && (
                                <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
                                  Urgent
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500">{item.itemCode}</p>
                            {item.description && (
                              <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                            )}
                          </div>
                        </div>

                        <div className="mt-3 flex items-center gap-3 text-sm">
                          <div>
                            <span className="text-gray-500">Category:</span>
                            <span className="ml-2 font-medium text-gray-900">{item.category}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Qty:</span>
                            <span className="ml-2 font-medium text-gray-900">{item.quantity} {item.unit}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Unit Price:</span>
                            <span className="ml-2 font-medium text-gray-900">₹{item.estimatedPrice.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Total:</span>
                            <span className="ml-2 font-bold text-green-700">₹{item.totalPrice.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 ml-4">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingItem(item)
                            setShowItemModal(true)
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"

                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDuplicateItem(item)}
                          className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"

                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"

                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Total Summary */}
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Items: {form.items.length}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {form.items.filter(i => i.urgency === 'urgent').length} urgent items
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Estimated Total</p>
                      <p className="text-2xl font-bold text-green-700">₹{form.estimatedTotal.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <Package className="h-12 w-12 text-gray-400 mb-2" />
                <p className="text-gray-600 mb-2">No items added yet</p>
                <p className="text-sm text-gray-500 mb-2">Add items to your requisition to proceed</p>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add First Item
                </button>
              </div>
            )}
          </div>
        )

      case 3:
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Delivery Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Required Delivery Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    value={form.deliveryDate}
                    onChange={(e) => setForm({ ...form, deliveryDate: e.target.value })}
                    min={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.deliveryDate ? 'border-red-500' : 'border-gray-300'
                      }`}
                  />
                </div>
                {errors.deliveryDate && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.deliveryDate}
                  </p>
                )}
              </div>

              {/* Delivery Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Location <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.deliveryLocation}
                  onChange={(e) => {
                    const location = deliveryLocations.find(l => l.id === e.target.value)
                    setForm({
                      ...form,
                      deliveryLocation: e.target.value,
                      deliveryAddress: location?.address || ''
                    })
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.deliveryLocation ? 'border-red-500' : 'border-gray-300'
                    }`}
                >
                  <option value="">Select Location</option>
                  {deliveryLocations.map(loc => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
                {errors.deliveryLocation && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.deliveryLocation}
                  </p>
                )}
              </div>

              {/* Delivery Address */}
              {form.deliveryAddress && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Delivery Address
                  </label>
                  <input
                    type="text"
                    value={form.deliveryAddress}
                    onChange={(e) => setForm({ ...form, deliveryAddress: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
              )}

              {/* Contact Person */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Person <span className="text-gray-400">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={form.contactPerson || ''}
                  onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                  placeholder="Receiving person name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Contact Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Phone <span className="text-gray-400">(Optional)</span>
                </label>
                <input
                  type="tel"
                  value={form.contactPhone || ''}
                  onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Delivery Instructions */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Special Delivery Instructions <span className="text-gray-400">(Optional)</span>
                </label>
                <textarea
                  value={form.deliveryInstructions || ''}
                  onChange={(e) => setForm({ ...form, deliveryInstructions: e.target.value })}
                  placeholder="Any special instructions for delivery, handling, or storage..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Delivery Timeline Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-blue-900">Standard Delivery Timelines</h4>
                  <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-blue-700">
                    <div>• Local suppliers: 3-5 business days</div>
                    <div>• Domestic suppliers: 7-10 business days</div>
                    <div>• International suppliers: 15-30 business days</div>
                    <div>• Custom/Made-to-order items: 30-60 business days</div>
                  </div>
                  {form.priority === 'urgent' && (
                    <p className="mt-2 text-sm font-medium text-red-700">
                      ⚠ Urgent priority may incur expedited shipping charges
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Budget Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Budget Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.budgetCode}
                  onChange={(e) => setForm({ ...form, budgetCode: e.target.value })}
                  placeholder="BUD-2025-001"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.budgetCode ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
                {errors.budgetCode && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.budgetCode}
                  </p>
                )}
              </div>

              {/* Budget Available */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Available Budget
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                  <input
                    type="number"
                    value={form.budgetAvailable}
                    onChange={(e) => setForm({ ...form, budgetAvailable: parseFloat(e.target.value) || 0 })}
                    placeholder="0"
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Approver Selection */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Approver <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {approvers.map((approver) => {
                    const canApprove = form.estimatedTotal <= approver.limit
                    return (
                      <div
                        key={approver.id}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${form.approver === approver.id
                            ? 'border-blue-500 bg-blue-50'
                            : canApprove
                              ? 'border-gray-200 hover:border-gray-300'
                              : 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                          }`}
                        onClick={() => canApprove && setForm({ ...form, approver: approver.id })}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{approver.name}</p>
                            <p className="text-sm text-gray-600">{approver.role}</p>
                            <p className="text-xs text-gray-500 mt-1">{approver.department}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              Limit: ₹{(approver.limit / 100000).toFixed(0)}L
                            </p>
                          </div>
                          {form.approver === approver.id && (
                            <Check className="h-5 w-5 text-blue-600 flex-shrink-0" />
                          )}
                          {!canApprove && (
                            <AlertCircle className="h-5 w-5 text-orange-500 flex-shrink-0" />
                          )}
                        </div>
                        {!canApprove && (
                          <p className="text-xs text-orange-600 mt-2">
                            Amount exceeds approval limit
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
                {errors.approver && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.approver}
                  </p>
                )}
              </div>

              {/* Business Justification */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Justification <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={form.justification}
                  onChange={(e) => setForm({ ...form, justification: e.target.value })}
                  placeholder="Provide detailed business justification for this requisition..."
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.justification ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
                {errors.justification && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.justification}
                  </p>
                )}
              </div>

              {/* Alternative Options */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alternative Options Considered <span className="text-gray-400">(Optional)</span>
                </label>
                <textarea
                  value={form.alternativeOptions || ''}
                  onChange={(e) => setForm({ ...form, alternativeOptions: e.target.value })}
                  placeholder="Describe any alternative options that were considered..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Budget Summary */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 border border-gray-200">
              <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                <Calculator className="h-5 w-5 text-gray-600" />
                Budget Analysis
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                  <span className="text-gray-600">Requisition Total:</span>
                  <span className="font-semibold text-gray-900 text-lg">₹{form.estimatedTotal.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Available Budget:</span>
                  <span className="font-semibold text-gray-900">₹{form.budgetAvailable.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <span className="text-gray-700 font-medium">Remaining After Approval:</span>
                  <span className={`font-bold text-lg ${form.budgetAvailable - form.estimatedTotal >= 0 ? 'text-green-700' : 'text-red-700'
                    }`}>
                    ₹{Math.abs(form.budgetAvailable - form.estimatedTotal).toLocaleString()}
                    {form.budgetAvailable - form.estimatedTotal < 0 && ' (Over Budget)'}
                  </span>
                </div>
              </div>
              {errors.budget && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {errors.budget}
                  </p>
                </div>
              )}
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-3">
            {/* Summary Card */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-3 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Requisition Summary</h3>
                <p className="text-sm text-gray-600 mt-1">Review all details before submission</p>
              </div>

              <div className="p-6 space-y-3">
                {/* Basic Info */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    Basic Information
                  </h4>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">PR Number:</span>
                      <span className="font-medium text-gray-900">{form.prNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Department:</span>
                      <span className="font-medium text-gray-900">{form.department}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Requested By:</span>
                      <span className="font-medium text-gray-900">{form.requestedBy}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Priority:</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${form.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                          form.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                            form.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-700'
                        }`}>
                        {form.priority.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Items Summary */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Package className="h-4 w-4 text-gray-500" />
                    Items ({form.items.length})
                  </h4>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-gray-600">Item</th>
                          <th className="px-4 py-2 text-center text-gray-600">Quantity</th>
                          <th className="px-4 py-2 text-right text-gray-600">Unit Price</th>
                          <th className="px-4 py-2 text-right text-gray-600">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {form.items.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2">
                              <div>
                                <p className="font-medium text-gray-900">{item.itemName}</p>
                                <p className="text-xs text-gray-500">{item.category}</p>
                              </div>
                            </td>
                            <td className="px-4 py-2 text-center">{item.quantity} {item.unit}</td>
                            <td className="px-4 py-2 text-right">₹{item.estimatedPrice.toLocaleString()}</td>
                            <td className="px-4 py-2 text-right font-medium">₹{item.totalPrice.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                        <tr>
                          <td colSpan={3} className="px-4 py-3 text-right font-semibold">Grand Total:</td>
                          <td className="px-4 py-3 text-right font-bold text-green-700 text-lg">
                            ₹{form.estimatedTotal.toLocaleString()}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {/* Delivery & Approval */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Delivery Info */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      Delivery Details
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-600">Required Date:</span>
                        <span className="ml-2 font-medium text-gray-900">{form.deliveryDate}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Location:</span>
                        <span className="ml-2 font-medium text-gray-900">
                          {deliveryLocations.find(l => l.id === form.deliveryLocation)?.name}
                        </span>
                      </div>
                      {form.deliveryAddress && (
                        <div>
                          <span className="text-gray-600">Address:</span>
                          <span className="ml-2 font-medium text-gray-900">{form.deliveryAddress}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Approval Info */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      Approval Details
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-600">Approver:</span>
                        <span className="ml-2 font-medium text-gray-900">
                          {approvers.find(a => a.id === form.approver)?.name}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Role:</span>
                        <span className="ml-2 font-medium text-gray-900">
                          {approvers.find(a => a.id === form.approver)?.role}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Budget Code:</span>
                        <span className="ml-2 font-medium text-gray-900">{form.budgetCode}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="terms"
                  checked={form.termsAccepted}
                  onChange={(e) => setForm({ ...form, termsAccepted: e.target.checked })}
                  className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="terms" className="text-sm text-gray-700">
                  I confirm that the information provided is accurate and complete. I have reviewed and accept the company's
                  procurement policies, terms & conditions, and understand that this requisition is subject to approval based
                  on budget availability and business requirements.
                </label>
              </div>
              {errors.terms && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1 ml-7">
                  <AlertCircle className="h-3 w-3" />
                  {errors.terms}
                </p>
              )}
            </div>

            {/* Attachments */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Paperclip className="h-4 w-4 text-gray-500" />
                Supporting Documents
              </h4>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center hover:border-gray-400 transition-colors">
                <Upload className="h-10 w-10 text-gray-400 mb-3" />
                <p className="text-sm text-gray-600 mb-2">Drag and drop files here, or click to browse</p>
                <p className="text-xs text-gray-500 mb-3">Supported formats: PDF, DOC, DOCX, XLS, XLSX, PNG, JPG (Max 10MB)</p>
                <button
                  type="button"
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Select Files
                </button>
              </div>
              {form.attachments.length > 0 && (
                <div className="mt-3 space-y-2">
                  {form.attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-700">{file.name}</span>
                        <span className="text-xs text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const newAttachments = form.attachments.filter((_, i) => i !== index)
                          setForm({ ...form, attachments: newAttachments })
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Additional Notes */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Additional Notes <span className="text-gray-400">(Optional)</span></h4>
              <textarea
                value={form.notes || ''}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Any additional information or special requirements..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="w-full min-h-screen bg-gray-50 px-3 py-2">
      <div className="w-full">
        {/* Header */}
        <div className="mb-3">
          <button
            onClick={() => router.push('/procurement/requisitions')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Requisitions
          </button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create Purchase Requisition</h1>
              <p className="text-gray-600 mt-1">Complete all required fields to submit a new requisition</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              Auto-save enabled
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between relative">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isCompleted = currentStep > step.id
              const isCurrent = currentStep === step.id

              return (
                <div key={step.id} className="flex-1 relative">
                  <div
                    className="flex flex-col items-center cursor-pointer"
                    onClick={() => {
                      if (step.id < currentStep) {
                        setCurrentStep(step.id)
                      }
                    }}
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isCompleted
                          ? 'bg-green-600 text-white shadow-md'
                          : isCurrent
                            ? 'bg-blue-600 text-white shadow-md animate-pulse'
                            : 'bg-gray-200 text-gray-400'
                        }`}
                    >
                      {isCompleted ? (
                        <Check className="h-6 w-6" />
                      ) : (
                        <Icon className="h-6 w-6" />
                      )}
                    </div>
                    <div className="mt-2 text-center">
                      <p className={`text-sm font-medium ${isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-400'
                        }`}>
                        {step.title}
                      </p>
                      <p className={`text-xs mt-0.5 hidden md:block ${isCompleted || isCurrent ? 'text-gray-600' : 'text-gray-400'
                        }`}>
                        {step.description}
                      </p>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`absolute top-6 left-[50%] w-full h-0.5 transition-all ${isCompleted ? 'bg-green-600' : 'bg-gray-200'
                        }`}
                      style={{ width: 'calc(100% - 3rem)' }}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 md:p-8">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between">
          <div>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handlePrevious}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              Save as Draft
            </button>

            {currentStep < 5 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
              >
                Next Step
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSubmit(false)}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-md disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Submit for Approval
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Item Modal */}
      {showItemModal && editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <h3 className="text-lg font-semibold text-gray-900">
                {form.items.find(i => i.id === editingItem.id) ? 'Edit Item' : 'Add New Item'}
              </h3>
            </div>

            <div className="p-6 space-y-2 overflow-y-auto flex-1">
              {searchingItems && (
                <div className="mb-2 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <Search className="h-5 w-5 text-blue-600" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search item catalog..."
                      className="flex-1 px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                  </div>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {itemCatalog
                      .filter(item =>
                        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        item.code.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map(item => (
                        <div
                          key={item.code}
                          className="p-2 bg-white rounded border border-gray-200 hover:border-blue-300 cursor-pointer"
                          onClick={() => {
                            setEditingItem({
                              ...editingItem,
                              itemCode: item.code,
                              itemName: item.name,
                              category: item.category,
                              unit: item.unit,
                              estimatedPrice: item.price,
                              totalPrice: editingItem.quantity * item.price
                            })
                            setSearchingItems(false)
                            setSearchQuery('')
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm">{item.name}</p>
                              <p className="text-xs text-gray-500">{item.code} • {item.category}</p>
                            </div>
                            <p className="text-sm font-medium">₹{item.price}/{item.unit}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Item Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingItem.itemCode}
                    onChange={(e) => setEditingItem({ ...editingItem, itemCode: e.target.value })}
                    placeholder="ITM-001"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Item Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingItem.itemName}
                    onChange={(e) => setEditingItem({ ...editingItem, itemName: e.target.value })}
                    placeholder="Enter item name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={editingItem.category}
                    onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Urgency
                  </label>
                  <select
                    value={editingItem.urgency || 'normal'}
                    onChange={(e) => setEditingItem({ ...editingItem, urgency: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="normal">Normal</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={editingItem.quantity}
                      onChange={(e) => {
                        const qty = parseFloat(e.target.value) || 0
                        setEditingItem({
                          ...editingItem,
                          quantity: qty,
                          totalPrice: qty * editingItem.estimatedPrice
                        })
                      }}
                      min="1"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                      value={editingItem.unit}
                      onChange={(e) => setEditingItem({ ...editingItem, unit: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {units.map(unit => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estimated Unit Price <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                    <input
                      type="number"
                      value={editingItem.estimatedPrice}
                      onChange={(e) => {
                        const price = parseFloat(e.target.value) || 0
                        setEditingItem({
                          ...editingItem,
                          estimatedPrice: price,
                          totalPrice: editingItem.quantity * price
                        })
                      }}
                      min="0"
                      step="0.01"
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Price
                  </label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                    <span className="text-lg font-bold text-green-700">
                      ₹{(editingItem.quantity * editingItem.estimatedPrice).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={editingItem.description}
                    onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                    placeholder="Item description..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Specifications
                  </label>
                  <textarea
                    value={editingItem.specifications || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, specifications: e.target.value })}
                    placeholder="Technical specifications, requirements, or standards..."
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Vendor <span className="text-gray-400">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={editingItem.vendor || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, vendor: e.target.value })}
                    placeholder="Vendor name or code"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes <span className="text-gray-400">(Optional)</span>
                  </label>
                  <textarea
                    value={editingItem.notes || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, notes: e.target.value })}
                    placeholder="Additional notes or requirements..."
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowItemModal(false)
                  setEditingItem(null)
                  setSearchingItems(false)
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (editingItem.itemName && editingItem.category && editingItem.quantity > 0) {
                    handleSaveItem(editingItem)
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {form.items.find(i => i.id === editingItem.id) ? 'Update Item' : 'Add Item'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}