'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { vendorService } from '@/services/VendorService'
import { purchaseOrderService } from '@/services/purchase-order.service'
import {
  ArrowLeft,
  ArrowRight,
  Save,
  Send,
  X,
  Plus,
  Minus,
  Search,
  Upload,
  FileText,
  Package,
  Building2,
  Calendar,
  DollarSign,
  Truck,
  CreditCard,
  User,
  Mail,
  Phone,
  MapPin,
  Hash,
  Percent,
  AlertCircle,
  CheckCircle,
  Info,
  Copy,
  Trash2,
  Edit2,
  ShoppingCart,
  Calculator,
  Globe,
  Clock,
  Briefcase,
  FileSpreadsheet,
  Download,
  Printer
} from 'lucide-react'

interface POItem {
  id: string
  itemCode: string
  itemName: string
  description: string
  category: string
  quantity: number
  unit: string
  unitPrice: number
  discount: number
  discountType: 'percentage' | 'fixed'
  tax: number
  totalPrice: number
  requisitionRef?: string
  specifications?: string
  deliveryDate?: string
  warehouse?: string
}

interface Vendor {
  id: string
  code: string
  name: string
  contactPerson: string
  email: string
  phone: string
  address: string
  city: string
  country: string
  paymentTerms: string
  currency: string
  taxId: string
  rating: number
}

export default function CreatePurchaseOrderPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'details' | 'items' | 'terms' | 'attachments'>('details')
  const [showVendorSearch, setShowVendorSearch] = useState(false)
  const [showItemCatalog, setShowItemCatalog] = useState(false)
  const [isCalculating, setIsCalculating] = useState(false)

  // Form State
  const [formData, setFormData] = useState({
    poType: 'standard',
    priority: 'medium',
    requisitionNumber: '',
    projectCode: '',
    department: '',
    costCenter: '',
    buyer: 'John Smith',
    buyerEmail: 'john.smith@company.com',
    buyerPhone: '+1 234 567 8900',
    notes: '',
    internalNotes: ''
  })

  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [items, setItems] = useState<POItem[]>([])
  const [deliveryDetails, setDeliveryDetails] = useState({
    deliveryDate: '',
    deliveryAddress: 'Main Warehouse',
    deliveryCity: 'New York',
    deliveryCountry: 'USA',
    deliveryInstructions: '',
    shippingMethod: 'standard',
    incoterms: 'DDP',
    insuranceRequired: false
  })

  const [paymentTerms, setPaymentTerms] = useState({
    paymentTerm: 'net30',
    paymentMethod: 'bank_transfer',
    downPayment: 0,
    currency: 'USD',
    bankDetails: '',
    specialTerms: ''
  })

  const [attachments, setAttachments] = useState<File[]>([])

  // Vendor picker data — loaded from procurement/vendors
  const [mockVendors, setMockVendors] = useState<Vendor[]>([])

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const res = (await vendorService.getVendors()) as any
        const rows: any[] = Array.isArray(res) ? res : res?.data ?? []
        if (!cancelled && rows.length) {
          setMockVendors(rows.map((v: any) => {
            const addr = Array.isArray(v.addresses) ? v.addresses[0] ?? {} : {}
            const contact = Array.isArray(v.contactPersons) ? v.contactPersons[0] ?? {} : {}
            const terms = v.paymentTerms ?? {}
            return {
              id: v.id,
              code: v.vendorCode ?? '',
              name: v.legalName ?? v.tradeName ?? '',
              contactPerson: contact.name ?? '',
              email: contact.email ?? '',
              phone: contact.mobile ?? contact.phone ?? '',
              address: addr.addressLine1 ?? '',
              city: addr.city ?? '',
              country: addr.country ?? '',
              paymentTerms: terms.netDays ? `Net ${terms.netDays}` : (terms.discountTerms ?? 'Net 30'),
              currency: 'INR',
              taxId: v.gstNumber ?? '',
              rating: Number(v.rating ?? 0),
            } as Vendor
          }))
        }
      } catch { /* keep fallback vendors on error */ }
    }
    load()
    return () => { cancelled = true }
  }, [])

  // Mock item catalog
  const mockCatalog = [
    {
      itemCode: 'ITEM-001',
      itemName: 'Laptop Dell XPS 15',
      description: 'High-performance laptop',
      category: 'IT Equipment',
      unit: 'Unit',
      unitPrice: 1500,
      tax: 10
    },
    {
      itemCode: 'ITEM-002',
      itemName: 'Office Chair Ergonomic',
      description: 'Adjustable ergonomic chair',
      category: 'Furniture',
      unit: 'Unit',
      unitPrice: 450,
      tax: 10
    },
    {
      itemCode: 'ITEM-003',
      itemName: 'Printer Paper A4',
      description: '80gsm white paper',
      category: 'Stationery',
      unit: 'Ream',
      unitPrice: 5,
      tax: 5
    }
  ]

  const handleVendorSelect = (selectedVendor: Vendor) => {
    setVendor(selectedVendor)
    setPaymentTerms({
      ...paymentTerms,
      paymentTerm: selectedVendor.paymentTerms.toLowerCase().replace(' ', ''),
      currency: selectedVendor.currency
    })
    setShowVendorSearch(false)
  }

  const handleAddItem = (catalogItem: any) => {
    const newItem: POItem = {
      id: Date.now().toString(),
      itemCode: catalogItem.itemCode,
      itemName: catalogItem.itemName,
      description: catalogItem.description,
      category: catalogItem.category,
      quantity: 1,
      unit: catalogItem.unit,
      unitPrice: catalogItem.unitPrice,
      discount: 0,
      discountType: 'percentage',
      tax: catalogItem.tax,
      totalPrice: catalogItem.unitPrice * (1 + catalogItem.tax / 100)
    }
    setItems([...items, newItem])
    setShowItemCatalog(false)
  }

  const handleUpdateItem = (itemId: string, field: keyof POItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === itemId) {
        const updated = { ...item, [field]: value }

        // Recalculate total
        const subtotal = updated.quantity * updated.unitPrice
        let discountAmount = 0
        if (updated.discountType === 'percentage') {
          discountAmount = subtotal * (updated.discount / 100)
        } else {
          discountAmount = updated.discount
        }
        const afterDiscount = subtotal - discountAmount
        const taxAmount = afterDiscount * (updated.tax / 100)
        updated.totalPrice = afterDiscount + taxAmount

        return updated
      }
      return item
    }))
  }

  const handleRemoveItem = (itemId: string) => {
    setItems(items.filter(item => item.id !== itemId))
  }

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => {
      const itemSubtotal = item.quantity * item.unitPrice
      const discount = item.discountType === 'percentage'
        ? itemSubtotal * (item.discount / 100)
        : item.discount
      return sum + (itemSubtotal - discount)
    }, 0)

    const totalTax = items.reduce((sum, item) => {
      const itemSubtotal = item.quantity * item.unitPrice
      const discount = item.discountType === 'percentage'
        ? itemSubtotal * (item.discount / 100)
        : item.discount
      const afterDiscount = itemSubtotal - discount
      return sum + (afterDiscount * (item.tax / 100))
    }, 0)

    const total = subtotal + totalTax

    return { subtotal, totalTax, total }
  }

  const totals = calculateTotals()

  const buildPODto = () => ({
    vendorId: vendor!.id,
    deliveryDate: deliveryDetails.deliveryDate || new Date().toISOString().split('T')[0],
    paymentTerms: paymentTerms.paymentTerm || vendor!.paymentTerms || 'net30',
    currency: paymentTerms.currency || vendor!.currency || 'USD',
    notes: deliveryDetails.deliveryInstructions || undefined,
    terms: paymentTerms.specialTerms || undefined,
    items: items.map((it) => ({
      itemId: it.itemCode,
      quantity: Number(it.quantity ?? 0),
      unitPrice: Number(it.unitPrice ?? 0),
      discount: Number(it.discount ?? 0),
      taxRate: Number(it.tax ?? 0),
      deliveryDate: it.deliveryDate || deliveryDetails.deliveryDate || new Date().toISOString().split('T')[0],
      warehouseId: it.warehouse || undefined,
    })),
  })

  const handleSaveDraft = async () => {
    if (!vendor || items.length === 0) {
      alert('Select a vendor and add at least one item before saving.')
      return
    }
    try {
      await purchaseOrderService.createPurchaseOrder(buildPODto())
      alert('Purchase order saved as draft.')
      router.push('/procurement/purchase-orders')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save purchase order')
    }
  }

  const handleSubmit = async () => {
    if (!vendor) {
      alert('Please select a vendor')
      return
    }
    if (items.length === 0) {
      alert('Please add at least one item')
      return
    }
    try {
      const created = await purchaseOrderService.createPurchaseOrder(buildPODto())
      if ((created as any)?.id) {
        await purchaseOrderService.submitPurchaseOrder((created as any).id)
      }
      alert('Purchase order submitted.')
      router.push('/procurement/purchase-orders')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to submit purchase order')
    }
  }

  return (
    <div className="p-6 w-full">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link
              href="/procurement/purchase-orders"
              className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
              <span className="text-gray-700">Back</span>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Create Purchase Order</h1>
          </div>
          <p className="text-gray-500 ml-11">Fill in the details to create a new purchase order</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleSaveDraft}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Save Draft
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            disabled={!vendor || items.length === 0}
          >
            <Send className="h-4 w-4" />
            Submit PO
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-3">
        <div className="flex gap-8">
          <button
            onClick={() => setActiveTab('details')}
            className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'details'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
          >
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Order Details
            </div>
          </button>
          <button
            onClick={() => setActiveTab('items')}
            className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'items'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
          >
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Items ({items.length})
            </div>
          </button>
          <button
            onClick={() => setActiveTab('terms')}
            className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'terms'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
          >
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Terms & Delivery
            </div>
          </button>
          <button
            onClick={() => setActiveTab('attachments')}
            className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'attachments'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
          >
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              Attachments ({attachments.length})
            </div>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'details' && (
        <div className="space-y-3">
          {/* Vendor Selection */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-gray-400" />
              Vendor Information
            </h3>

            {vendor ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex justify-between items-start">
                  <div className="grid grid-cols-2 gap-2 flex-1">
                    <div>
                      <p className="text-sm text-gray-600">Vendor Name</p>
                      <p className="font-medium text-gray-900">{vendor.name}</p>
                      <p className="text-sm text-gray-500">{vendor.code}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Contact Person</p>
                      <p className="font-medium text-gray-900">{vendor.contactPerson}</p>
                      <p className="text-sm text-gray-500">{vendor.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Address</p>
                      <p className="text-sm text-gray-900">{vendor.address}</p>
                      <p className="text-sm text-gray-500">{vendor.city}, {vendor.country}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Payment Terms</p>
                      <p className="font-medium text-gray-900">{vendor.paymentTerms}</p>
                      <p className="text-sm text-gray-500">Currency: {vendor.currency}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setVendor(null)}
                    className="p-1 hover:bg-blue-100 rounded"
                  >
                    <X className="h-4 w-4 text-gray-500" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowVendorSearch(true)}
                className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
              >
                <div className="flex flex-col items-center gap-2">
                  <Search className="h-8 w-8 text-gray-400" />
                  <span className="text-gray-600 font-medium">Click to search and select vendor</span>
                  <span className="text-sm text-gray-500">Search from approved vendor list</span>
                </div>
              </button>
            )}
          </div>

          {/* Order Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <FileText className="h-5 w-5 text-gray-400" />
              Order Information
            </h3>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  PO Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.poType}
                  onChange={(e) => setFormData({ ...formData, poType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="standard">Standard PO</option>
                  <option value="blanket">Blanket PO</option>
                  <option value="contract">Contract PO</option>
                  <option value="planned">Planned PO</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Requisition Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.requisitionNumber}
                    onChange={(e) => setFormData({ ...formData, requisitionNumber: e.target.value })}
                    placeholder="REQ-2024-XXX"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button className="absolute right-2 top-2.5 inline-flex items-center gap-1.5 px-2 py-1 text-gray-600 hover:text-gray-800">
                    <Search className="h-4 w-4" />
                    <span className="text-sm">Search</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Code
                </label>
                <input
                  type="text"
                  value={formData.projectCode}
                  onChange={(e) => setFormData({ ...formData, projectCode: e.target.value })}
                  placeholder="PROJ-XXX"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Department</option>
                  <option value="it">IT</option>
                  <option value="hr">Human Resources</option>
                  <option value="finance">Finance</option>
                  <option value="operations">Operations</option>
                  <option value="sales">Sales</option>
                  <option value="marketing">Marketing</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cost Center <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.costCenter}
                  onChange={(e) => setFormData({ ...formData, costCenter: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Cost Center</option>
                  <option value="cc001">CC001 - Administration</option>
                  <option value="cc002">CC002 - Production</option>
                  <option value="cc003">CC003 - R&D</option>
                  <option value="cc004">CC004 - Sales</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Buyer Name
                </label>
                <input
                  type="text"
                  value={formData.buyer}
                  readOnly
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Buyer Email
                </label>
                <input
                  type="email"
                  value={formData.buyerEmail}
                  readOnly
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Buyer Phone
                </label>
                <input
                  type="tel"
                  value={formData.buyerPhone}
                  readOnly
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vendor Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Notes visible to vendor..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Internal Notes
                </label>
                <textarea
                  value={formData.internalNotes}
                  onChange={(e) => setFormData({ ...formData, internalNotes: e.target.value })}
                  placeholder="Internal notes (not visible to vendor)..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'items' && (
        <div className="space-y-3">
          {/* Add Item Button */}
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Order Items</h3>
            <button
              onClick={() => setShowItemCatalog(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Item
            </button>
          </div>

          {/* Items Table */}
          {items.length > 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Discount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tax</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{item.itemName}</p>
                          <p className="text-xs text-gray-500">{item.itemCode} • {item.category}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleUpdateItem(item.id, 'quantity', parseInt(e.target.value))}
                            className="w-20 px-2 py-1 border border-gray-300 rounded"
                            min="1"
                          />
                          <span className="text-sm text-gray-500">{item.unit}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => handleUpdateItem(item.id, 'unitPrice', parseFloat(e.target.value))}
                          className="w-24 px-2 py-1 border border-gray-300 rounded"
                          min="0"
                          step="0.01"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={item.discount}
                            onChange={(e) => handleUpdateItem(item.id, 'discount', parseFloat(e.target.value))}
                            className="w-16 px-2 py-1 border border-gray-300 rounded"
                            min="0"
                          />
                          <select
                            value={item.discountType}
                            onChange={(e) => handleUpdateItem(item.id, 'discountType', e.target.value)}
                            className="px-1 py-1 border border-gray-300 rounded text-sm"
                          >
                            <option value="percentage">%</option>
                            <option value="fixed">$</option>
                          </select>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={item.tax}
                            onChange={(e) => handleUpdateItem(item.id, 'tax', parseFloat(e.target.value))}
                            className="w-16 px-2 py-1 border border-gray-300 rounded"
                            min="0"
                          />
                          <span className="text-sm text-gray-500">%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-semibold text-gray-900">
                          ${item.totalPrice.toFixed(2)}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                            <Edit2 className="h-4 w-4 text-gray-600" />
                            <span className="text-gray-700">Edit</span>
                          </button>
                          <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                            <Copy className="h-4 w-4 text-gray-600" />
                            <span className="text-gray-700">Copy</span>
                          </button>
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="bg-gray-50 px-3 py-2">
                <div className="flex justify-end">
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-medium">${totals.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Tax:</span>
                      <span className="font-medium">${totals.totalTax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-semibold pt-2 border-t">
                      <span>Grand Total:</span>
                      <span className="text-blue-600">${totals.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-12">
              <div className="text-center">
                <Package className="h-12 w-12 text-gray-400 mb-2" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No items added</h3>
                <p className="text-gray-500 mb-2">Add items to this purchase order</p>
                <button
                  onClick={() => setShowItemCatalog(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add First Item
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'terms' && (
        <div className="space-y-3">
          {/* Delivery Details */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Truck className="h-5 w-5 text-gray-400" />
              Delivery Details
            </h3>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expected Delivery Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={deliveryDetails.deliveryDate}
                  onChange={(e) => setDeliveryDetails({ ...deliveryDetails, deliveryDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Shipping Method
                </label>
                <select
                  value={deliveryDetails.shippingMethod}
                  onChange={(e) => setDeliveryDetails({ ...deliveryDetails, shippingMethod: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="standard">Standard Shipping</option>
                  <option value="express">Express Shipping</option>
                  <option value="air">Air Freight</option>
                  <option value="sea">Sea Freight</option>
                  <option value="courier">Courier Service</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Address
                </label>
                <input
                  type="text"
                  value={deliveryDetails.deliveryAddress}
                  onChange={(e) => setDeliveryDetails({ ...deliveryDetails, deliveryAddress: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={deliveryDetails.deliveryCity}
                  onChange={(e) => setDeliveryDetails({ ...deliveryDetails, deliveryCity: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <input
                  type="text"
                  value={deliveryDetails.deliveryCountry}
                  onChange={(e) => setDeliveryDetails({ ...deliveryDetails, deliveryCountry: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Incoterms
                </label>
                <select
                  value={deliveryDetails.incoterms}
                  onChange={(e) => setDeliveryDetails({ ...deliveryDetails, incoterms: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="EXW">EXW - Ex Works</option>
                  <option value="FCA">FCA - Free Carrier</option>
                  <option value="CPT">CPT - Carriage Paid To</option>
                  <option value="CIP">CIP - Carriage and Insurance Paid To</option>
                  <option value="DAP">DAP - Delivered At Place</option>
                  <option value="DPU">DPU - Delivered At Place Unloaded</option>
                  <option value="DDP">DDP - Delivered Duty Paid</option>
                  <option value="FAS">FAS - Free Alongside Ship</option>
                  <option value="FOB">FOB - Free On Board</option>
                  <option value="CFR">CFR - Cost and Freight</option>
                  <option value="CIF">CIF - Cost, Insurance and Freight</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Instructions
                </label>
                <textarea
                  value={deliveryDetails.deliveryInstructions}
                  onChange={(e) => setDeliveryDetails({ ...deliveryDetails, deliveryInstructions: e.target.value })}
                  placeholder="Special delivery instructions..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="col-span-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={deliveryDetails.insuranceRequired}
                    onChange={(e) => setDeliveryDetails({ ...deliveryDetails, insuranceRequired: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">Insurance Required</span>
                </label>
              </div>
            </div>
          </div>

          {/* Payment Terms */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-gray-400" />
              Payment Terms
            </h3>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Term <span className="text-red-500">*</span>
                </label>
                <select
                  value={paymentTerms.paymentTerm}
                  onChange={(e) => setPaymentTerms({ ...paymentTerms, paymentTerm: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="immediate">Immediate</option>
                  <option value="net15">Net 15</option>
                  <option value="net30">Net 30</option>
                  <option value="net45">Net 45</option>
                  <option value="net60">Net 60</option>
                  <option value="net90">Net 90</option>
                  <option value="cod">Cash on Delivery</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentTerms.paymentMethod}
                  onChange={(e) => setPaymentTerms({ ...paymentTerms, paymentMethod: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="check">Check</option>
                  <option value="cash">Cash</option>
                  <option value="letter_of_credit">Letter of Credit</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Currency
                </label>
                <select
                  value={paymentTerms.currency}
                  onChange={(e) => setPaymentTerms({ ...paymentTerms, currency: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="JPY">JPY - Japanese Yen</option>
                  <option value="CNY">CNY - Chinese Yuan</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Down Payment (%)
                </label>
                <input
                  type="number"
                  value={paymentTerms.downPayment}
                  onChange={(e) => setPaymentTerms({ ...paymentTerms, downPayment: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  max="100"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bank Details
                </label>
                <textarea
                  value={paymentTerms.bankDetails}
                  onChange={(e) => setPaymentTerms({ ...paymentTerms, bankDetails: e.target.value })}
                  placeholder="Bank account details for payment..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Special Payment Terms
                </label>
                <textarea
                  value={paymentTerms.specialTerms}
                  onChange={(e) => setPaymentTerms({ ...paymentTerms, specialTerms: e.target.value })}
                  placeholder="Any special payment terms or conditions..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'attachments' && (
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Attachments</h3>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
            <div className="text-center">
              <Upload className="h-12 w-12 text-gray-400 mb-2" />
              <p className="text-gray-600 mb-2">Drop files here or click to upload</p>
              <p className="text-sm text-gray-500 mb-2">
                Supported formats: PDF, DOC, DOCX, XLS, XLSX, PNG, JPG (Max 10MB)
              </p>
              <input
                type="file"
                multiple
                className="hidden"
                id="file-upload"
                onChange={(e) => {
                  if (e.target.files) {
                    setAttachments([...attachments, ...Array.from(e.target.files)])
                  }
                }}
              />
              <label
                htmlFor="file-upload"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer inline-flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Choose Files
              </label>
            </div>
          </div>

          {attachments.length > 0 && (
            <div className="mt-4 space-y-2">
              {attachments.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{file.name}</p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setAttachments(attachments.filter((_, i) => i !== index))}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Vendor Search Modal */}
      {showVendorSearch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-3 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">Select Vendor</h3>
              <button
                onClick={() => setShowVendorSearch(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-2">
              <input
                type="text"
                placeholder="Search vendor..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              {mockVendors.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-6">No vendors found.</p>
              )}
              {mockVendors.map((v) => (
                <button
                  key={v.id}
                  onClick={() => handleVendorSelect(v)}
                  className="w-full p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">{v.name}</p>
                      <p className="text-sm text-gray-500">{v.code} • {v.contactPerson}</p>
                      <p className="text-sm text-gray-500">{v.city}, {v.country}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{v.paymentTerms}</p>
                      <p className="text-sm text-gray-500">⭐ {v.rating}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Item Catalog Modal */}
      {showItemCatalog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-3 w-full max-w-3xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">Add Item from Catalog</h3>
              <button
                onClick={() => setShowItemCatalog(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-2">
              <input
                type="text"
                placeholder="Search items..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 gap-3">
              {mockCatalog.map((item) => (
                <div
                  key={item.itemCode}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.itemName}</p>
                      <p className="text-sm text-gray-500">
                        {item.itemCode} • {item.category} • ${item.unitPrice}/{item.unit}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                    </div>
                    <button
                      onClick={() => handleAddItem(item)}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}