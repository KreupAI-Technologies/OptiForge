'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Eye,
  Edit,
  Copy,
  Trash2,
  Send,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  FileText,
  Package,
  Truck,
  DollarSign,
  Calendar,
  Building2,
  User,
  MoreVertical,
  ChevronDown,
  ArrowUpDown,
  Printer,
  Mail,
  MessageSquare,
  History,
  TrendingUp,
  TrendingDown,
  BarChart3,
  RefreshCw,
  Settings,
  Loader2
} from 'lucide-react'
import { purchaseOrderService, PurchaseOrder as POServiceType, POStatus } from '@/services/purchase-order.service'
import { exportToCsv, printCurrentView } from '@/lib/export'

interface PurchaseOrder {
  id: string
  poNumber: string
  requisitionNumber?: string
  vendorName: string
  vendorCode: string
  category: 'Accessories' | 'Fittings' | 'Raw Materials' | 'Equipment' | 'Consumables' | 'Other'
  status: 'draft' | 'pending_approval' | 'approved' | 'sent' | 'acknowledged' | 'partially_delivered' | 'delivered' | 'closed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  totalAmount: number
  currency: string
  itemCount: number
  createdDate: string
  deliveryDate: string
  lastModified: string
  createdBy: string
  approvedBy?: string
  paymentTerms: string
  deliveryStatus: number
  invoiceStatus: 'not_invoiced' | 'partially_invoiced' | 'fully_invoiced'
  tags?: string[]
}

export default function PurchaseOrdersPage() {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([])
  const [filteredOrders, setFilteredOrders] = useState<PurchaseOrder[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedPriority, setSelectedPriority] = useState('all')
  const [selectedVendor, setSelectedVendor] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'vendor' | 'status'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'quarter' | 'all'>('month')

  const [error, setError] = useState<string | null>(null)

  // Map service PO status to local status
  const mapStatus = (status: POStatus): PurchaseOrder['status'] => {
    const statusMap: Record<POStatus, PurchaseOrder['status']> = {
      'Draft': 'draft',
      'Pending Approval': 'pending_approval',
      'Approved': 'approved',
      'Sent to Vendor': 'sent',
      'Partially Received': 'partially_delivered',
      'Fully Received': 'delivered',
      'Closed': 'closed',
      'Cancelled': 'cancelled'
    }
    return statusMap[status] || 'draft'
  }

  // Determine priority based on delivery date
  const determinePriority = (deliveryDate: string): PurchaseOrder['priority'] => {
    const today = new Date()
    const delivery = new Date(deliveryDate)
    const daysUntilDelivery = Math.ceil((delivery.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    if (daysUntilDelivery <= 3) return 'urgent'
    if (daysUntilDelivery <= 7) return 'high'
    if (daysUntilDelivery <= 14) return 'medium'
    return 'low'
  }

  // Load purchase orders from service
  const loadPurchaseOrders = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await purchaseOrderService.getAllPurchaseOrders()

      const mappedOrders: PurchaseOrder[] = response.data.map(po => {
        // Calculate delivery status percentage
        const totalQty = po.items.reduce((sum, item) => sum + item.quantity, 0)
        const receivedQty = po.items.reduce((sum, item) => sum + (item.receivedQuantity || 0), 0)
        const deliveryStatus = totalQty > 0 ? Math.round((receivedQty / totalQty) * 100) : 0

        return {
          id: po.id,
          poNumber: po.poNumber,
          requisitionNumber: po.prReference ? `REQ-${po.prReference.slice(-4)}` : undefined,
          vendorName: po.vendorName,
          vendorCode: po.vendorCode,
          category: 'Raw Materials' as const,
          status: mapStatus(po.status),
          priority: determinePriority(po.deliveryDate),
          totalAmount: po.totalAmount,
          currency: po.currency,
          itemCount: po.items.length,
          createdDate: po.orderDate,
          deliveryDate: po.deliveryDate,
          lastModified: po.updatedAt.split('T')[0],
          createdBy: po.createdBy,
          approvedBy: po.approvedBy,
          paymentTerms: po.paymentTerms,
          deliveryStatus: deliveryStatus,
          invoiceStatus: 'not_invoiced' as const,
          tags: po.items.slice(0, 2).map(item => item.itemCode)
        }
      })

      setPurchaseOrders(mappedOrders)
      setFilteredOrders(mappedOrders)
    } catch (err) {
      console.error('Error loading purchase orders:', err)
      setError('Failed to load purchase orders. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadPurchaseOrders()
  }, [])

  // Filter and search logic
  useEffect(() => {
    let filtered = [...purchaseOrders]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.requisitionNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.createdBy.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(order => order.status === selectedStatus)
    }

    // Priority filter
    if (selectedPriority !== 'all') {
      filtered = filtered.filter(order => order.priority === selectedPriority)
    }

    // Vendor filter
    if (selectedVendor !== 'all') {
      filtered = filtered.filter(order => order.vendorCode === selectedVendor)
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(order => order.category === selectedCategory)
    }

    // Date range filter
    const now = new Date()
    if (dateRange !== 'all') {
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.createdDate)
        switch (dateRange) {
          case 'today':
            return orderDate.toDateString() === now.toDateString()
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            return orderDate >= weekAgo
          case 'month':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
            return orderDate >= monthAgo
          case 'quarter':
            const quarterAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
            return orderDate >= quarterAgo
          default:
            return true
        }
      })
    }

    // Sorting
    filtered.sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime()
          break
        case 'amount':
          comparison = a.totalAmount - b.totalAmount
          break
        case 'vendor':
          comparison = a.vendorName.localeCompare(b.vendorName)
          break
        case 'status':
          comparison = a.status.localeCompare(b.status)
          break
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })

    setFilteredOrders(filtered)
  }, [purchaseOrders, searchTerm, selectedStatus, selectedPriority, selectedVendor, selectedCategory, dateRange, sortBy, sortOrder])

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-700 border-gray-300',
      pending_approval: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      approved: 'bg-green-100 text-green-700 border-green-300',
      sent: 'bg-blue-100 text-blue-700 border-blue-300',
      acknowledged: 'bg-indigo-100 text-indigo-700 border-indigo-300',
      partially_delivered: 'bg-orange-100 text-orange-700 border-orange-300',
      delivered: 'bg-teal-100 text-teal-700 border-teal-300',
      closed: 'bg-purple-100 text-purple-700 border-purple-300',
      cancelled: 'bg-red-100 text-red-700 border-red-300'
    }
    return colors[status as keyof typeof colors] || colors.draft
  }

  const getStatusIcon = (status: string) => {
    const icons = {
      draft: FileText,
      pending_approval: Clock,
      approved: CheckCircle,
      sent: Send,
      acknowledged: MessageSquare,
      partially_delivered: Truck,
      delivered: Package,
      closed: CheckCircle,
      cancelled: XCircle
    }
    return icons[status as keyof typeof icons] || FileText
  }

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'text-gray-600',
      medium: 'text-blue-600',
      high: 'text-orange-600',
      urgent: 'text-red-600'
    }
    return colors[priority as keyof typeof colors] || colors.medium
  }

  const handleSelectOrder = (orderId: string) => {
    setSelectedOrders(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    )
  }

  const handleSelectAll = () => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([])
    } else {
      setSelectedOrders(filteredOrders.map(order => order.id))
    }
  }

  const handleBulkAction = (action: string) => {
    if (action === 'export') {
      const selected = filteredOrders.filter(o => selectedOrders.includes(o.id))
      const rows = (selected.length ? selected : filteredOrders) as unknown as Record<string, unknown>[]
      exportToCsv('purchase-orders', rows)
    } else {
      console.log(`Performing ${action} on orders:`, selectedOrders)
    }
    setSelectedOrders([])
    setShowBulkActions(false)
  }

  const stats = {
    total: purchaseOrders.length,
    draft: purchaseOrders.filter(o => o.status === 'draft').length,
    pending: purchaseOrders.filter(o => o.status === 'pending_approval').length,
    active: purchaseOrders.filter(o => ['approved', 'sent', 'acknowledged'].includes(o.status)).length,
    delivered: purchaseOrders.filter(o => ['partially_delivered', 'delivered'].includes(o.status)).length,
    totalValue: purchaseOrders.reduce((sum, o) => sum + o.totalAmount, 0)
  }

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Purchase Orders</h1>
          <p className="text-gray-500 mt-1">Manage and track all purchase orders</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Import
          </button>
          <button
            onClick={() => exportToCsv('purchase-orders', filteredOrders as unknown as Record<string, unknown>[])}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
          <Link
            href="/procurement/purchase-orders/create"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create PO
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total POs</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <FileText className="h-8 w-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Draft</p>
              <p className="text-2xl font-bold text-gray-600">{stats.draft}</p>
            </div>
            <Edit className="h-8 w-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-400" />
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active</p>
              <p className="text-2xl font-bold text-blue-600">{stats.active}</p>
            </div>
            <Send className="h-8 w-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Delivered</p>
              <p className="text-2xl font-bold text-green-600">{stats.delivered}</p>
            </div>
            <Package className="h-8 w-8 text-green-400" />
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Value</p>
              <p className="text-2xl font-bold text-indigo-600">
                ${(stats.totalValue / 1000000).toFixed(1)}M
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-indigo-400" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-3">
        <div className="flex flex-col lg:flex-row gap-2">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search PO number, vendor, requisition..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex gap-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="pending_approval">Pending Approval</option>
              <option value="approved">Approved</option>
              <option value="sent">Sent</option>
              <option value="acknowledged">Acknowledged</option>
              <option value="partially_delivered">Partially Delivered</option>
              <option value="delivered">Delivered</option>
              <option value="closed">Closed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium text-purple-900"
            >
              <option value="all">All Categories</option>
              <option value="Accessories">🔧 Accessories</option>
              <option value="Fittings">🔩 Fittings</option>
              <option value="Raw Materials">📦 Raw Materials</option>
              <option value="Equipment">⚙️ Equipment</option>
              <option value="Consumables">🛒 Consumables</option>
              <option value="Other">📋 Other</option>
            </select>

            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="all">All Time</option>
            </select>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-3 py-2 border rounded-lg flex items-center gap-2 ${showFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-300 hover:bg-gray-50'
                }`}
            >
              <Filter className="h-4 w-4" />
              More Filters
            </button>
          </div>

          {/* View Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'
                }`}
            >
              <BarChart3 className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'
                }`}
            >
              <Package className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t grid grid-cols-2 md:grid-cols-4 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
              <select
                value={selectedVendor}
                onChange={(e) => setSelectedVendor(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Vendors</option>
                <option value="VEND-001">Tech Supplies Co.</option>
                <option value="VEND-002">Office Furniture Ltd</option>
                <option value="VEND-003">Industrial Parts Inc</option>
                <option value="VEND-004">Safety Equipment Pro</option>
                <option value="VEND-005">Chemical Supplies Global</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Status</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="all">All</option>
                <option value="not_invoiced">Not Invoiced</option>
                <option value="partially_invoiced">Partially Invoiced</option>
                <option value="fully_invoiced">Fully Invoiced</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="all">All Terms</option>
                <option value="immediate">Immediate</option>
                <option value="net15">Net 15</option>
                <option value="net30">Net 30</option>
                <option value="net45">Net 45</option>
                <option value="net60">Net 60</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="date">Date</option>
                  <option value="amount">Amount</option>
                  <option value="vendor">Vendor</option>
                  <option value="status">Status</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <ArrowUpDown className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedOrders.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-blue-700">
              {selectedOrders.length} order(s) selected
            </span>
            <button
              onClick={() => setSelectedOrders([])}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Clear selection
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleBulkAction('approve')}
              className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm flex items-center gap-1"
            >
              <CheckCircle className="h-4 w-4" />
              Approve
            </button>
            <button
              onClick={() => handleBulkAction('send')}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center gap-1"
            >
              <Send className="h-4 w-4" />
              Send
            </button>
            <button
              onClick={() => handleBulkAction('export')}
              className="px-3 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm flex items-center gap-1"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
            <button
              onClick={() => handleBulkAction('delete')}
              className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm flex items-center gap-1"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <span className="text-red-700">{error}</span>
          <button
            onClick={loadPurchaseOrders}
            className="ml-auto px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
          >
            Retry
          </button>
        </div>
      )}

      {/* Purchase Orders List/Grid */}
      {isLoading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12">
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
            <p className="mt-4 text-gray-600">Loading purchase orders...</p>
          </div>
        </div>
      ) : viewMode === 'list' ? (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left">
                  <input
                    type="checkbox"
                    checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PO Number
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vendor
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Delivery
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => {
                const StatusIcon = getStatusIcon(order.status)
                return (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={selectedOrders.includes(order.id)}
                        onChange={() => handleSelectOrder(order.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{order.poNumber}</div>
                        {order.requisitionNumber && (
                          <div className="text-xs text-gray-500">{order.requisitionNumber}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{order.vendorName}</div>
                        <div className="text-xs text-gray-500">{order.vendorCode}</div>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                        <StatusIcon className="h-3 w-3" />
                        {order.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span className={`text-sm font-medium ${getPriorityColor(order.priority)}`}>
                        {order.priority}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          ${order.totalAmount.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">{order.itemCount} items</div>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div>
                        <div className="text-sm text-gray-900">{order.deliveryDate}</div>
                        {order.deliveryStatus > 0 && (
                          <div className="w-20 bg-gray-200 rounded-full h-1.5 mt-1">
                            <div
                              className="bg-green-600 h-1.5 rounded-full"
                              style={{ width: `${order.deliveryStatus}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div>
                        <div className="text-sm text-gray-900">{order.createdDate}</div>
                        <div className="text-xs text-gray-500">by {order.createdBy}</div>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/procurement/purchase-orders/${order.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                        >
                          <Eye className="h-4 w-4 text-gray-600" />
                          <span className="text-gray-700">View</span>
                        </Link>

                        {/* Submit for Approval - show for draft or approved orders */}
                        {(order.status === 'draft' || order.status === 'approved') && (
                          <button
                            onClick={() => {
                              // TODO: API call to create approval request
                              alert(`Submitting PO ${order.poNumber} for approval...`);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
                          >
                            <CheckCircle className="h-4 w-4" />
                            <span>Submit for Approval</span>
                          </button>
                        )}

                        {/* Show Approval Status - for pending_approval */}
                        {order.status === 'pending_approval' && (
                          <Link
                            href="/workflow/approvals"
                            className="inline-flex items-center gap-1.5 px-3 py-2 bg-yellow-50 border border-yellow-300 text-yellow-700 rounded-lg hover:bg-yellow-100 text-sm font-medium"
                          >
                            <Clock className="h-4 w-4" />
                            <span>View Approval Status</span>
                          </Link>
                        )}

                        <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                          <Edit className="h-4 w-4 text-gray-600" />
                          <span className="text-gray-700">Edit</span>
                        </button>
                        <button onClick={() => printCurrentView()} className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                          <Printer className="h-4 w-4 text-gray-600" />
                          <span className="text-gray-700">Print</span>
                        </button>
                        <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                          <MoreVertical className="h-4 w-4 text-gray-600" />
                          <span className="text-gray-700">More</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {filteredOrders.map((order) => {
            const StatusIcon = getStatusIcon(order.status)
            return (
              <div key={order.id} className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="p-4">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{order.poNumber}</h3>
                      {order.requisitionNumber && (
                        <p className="text-xs text-gray-500">{order.requisitionNumber}</p>
                      )}
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedOrders.includes(order.id)}
                      onChange={() => handleSelectOrder(order.id)}
                      className="rounded border-gray-300"
                    />
                  </div>

                  {/* Vendor */}
                  <div className="flex items-center gap-2 mb-3">
                    <Building2 className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{order.vendorName}</p>
                      <p className="text-xs text-gray-500">{order.vendorCode}</p>
                    </div>
                  </div>

                  {/* Status and Priority */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                      <StatusIcon className="h-3 w-3" />
                      {order.status.replace(/_/g, ' ')}
                    </span>
                    <span className={`text-xs font-medium ${getPriorityColor(order.priority)}`}>
                      {order.priority}
                    </span>
                  </div>

                  {/* Amount and Items */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <p className="text-xs text-gray-500">Amount</p>
                      <p className="text-lg font-semibold text-gray-900">
                        ${(order.totalAmount / 1000).toFixed(0)}K
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Items</p>
                      <p className="text-lg font-semibold text-gray-900">{order.itemCount}</p>
                    </div>
                  </div>

                  {/* Delivery Progress */}
                  {order.deliveryStatus > 0 && (
                    <div className="mb-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-500">Delivery Progress</span>
                        <span className="text-gray-700">{order.deliveryStatus}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${order.deliveryStatus}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Dates */}
                  <div className="flex justify-between text-xs text-gray-500 mb-3">
                    <span>Created: {order.createdDate}</span>
                    <span>Delivery: {order.deliveryDate}</span>
                  </div>

                  {/* Tags */}
                  {order.tags && order.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {order.tags.map((tag) => (
                        <span key={tag} className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex justify-between items-center pt-3 border-t">
                    <div className="flex gap-2">
                      <Link
                        href={`/procurement/purchase-orders/${order.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                      >
                        <Eye className="h-4 w-4 text-gray-600" />
                        <span className="text-gray-700">View</span>
                      </Link>
                      <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                        <Edit className="h-4 w-4 text-gray-600" />
                        <span className="text-gray-700">Edit</span>
                      </button>
                      <button onClick={() => printCurrentView()} className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                        <Printer className="h-4 w-4 text-gray-600" />
                        <span className="text-gray-700">Print</span>
                      </button>
                      <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                        <Mail className="h-4 w-4 text-gray-600" />
                        <span className="text-gray-700">Email</span>
                      </button>
                    </div>
                    <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                      <MoreVertical className="h-4 w-4 text-gray-600" />
                      <span className="text-gray-700">More</span>
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {filteredOrders.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">
              Showing <span className="font-medium">{filteredOrders.length}</span> of{' '}
              <span className="font-medium">{purchaseOrders.length}</span> results
            </span>
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
              Previous
            </button>
            <button className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm">1</button>
            <button className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
              2
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
              3
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}