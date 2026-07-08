'use client'

import React, { useState, useEffect } from 'react'
import {
  Search,
  Download,
  Eye,
  Edit,
  CheckCircle,
  TrendingUp,
  Package,
  Truck,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Plus,
  Filter,
  Trash2
} from 'lucide-react'
import {
  CreateTransferModal,
  ViewTransferDetailsModal,
  ApproveTransferModal,
  DispatchTransferModal,
  ReceiveTransferModal,
  TransferHistoryModal,
  CreateTransferData,
  Transfer,
  ApproveTransferData,
  DispatchTransferData,
  ReceiveTransferData
} from '@/components/inventory/InventoryTransferModals'
import { inventoryService } from '@/services/InventoryService'
import { exportToCsv, printCurrentView } from '@/lib/export'

interface StockTransfer {
  id: string
  transferId: string
  fromWarehouse: string
  toWarehouse: string
  itemsCount: number
  totalQuantity: number
  transferDate: string
  expectedDelivery: string
  status: 'draft' | 'approved' | 'in_transit' | 'received' | 'cancelled'
  initiatedBy: string
  approvedBy: string
  totalValue: number
  transportMode: string
  vehicleNumber: string
  driverName: string
}

const InventoryTransfersPage = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [locationFilter, setLocationFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Modal state hooks
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false)
  const [isApproveOpen, setIsApproveOpen] = useState(false)
  const [isDispatchOpen, setIsDispatchOpen] = useState(false)
  const [isReceiveOpen, setIsReceiveOpen] = useState(false)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [selectedTransfer, setSelectedTransfer] = useState<Transfer | null>(null)

  // Loading and data states
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [transfers, setTransfers] = useState<StockTransfer[]>([])

  // Fetch transfers on mount
  useEffect(() => {
    fetchTransfers()
  }, [])

  // Map the raw backend TransferStatus (string enum: 'Draft', 'Submitted',
  // 'In Transit', 'Partially Received', 'Received', 'Cancelled', 'Rejected')
  // to the coarse status the table renders.
  const mapStatus = (raw: string): 'draft' | 'approved' | 'in_transit' | 'received' | 'cancelled' => {
    switch (raw) {
      case 'Draft':
        return 'draft'
      case 'Submitted':
        return 'approved'
      case 'In Transit':
        return 'in_transit'
      case 'Partially Received':
      case 'Received':
        return 'received'
      case 'Cancelled':
      case 'Rejected':
        return 'cancelled'
      default:
        return 'draft'
    }
  }

  const fetchTransfers = async () => {
    try {
      setLoading(true)
      setError(null)
      const transferData = await inventoryService.getStockTransfers()

      // Map raw ORM rows to the page's table format defensively.
      const mappedTransfers: StockTransfer[] = (transferData || []).map((t: any) => {
        const lines: any[] = Array.isArray(t.lines) ? t.lines : []
        const totalQuantity = lines.reduce(
          (sum, l) => sum + Number(l?.requestedQuantity ?? 0),
          0
        )
        return {
          id: t.id,
          transferId: t.transferNumber ?? '',
          fromWarehouse: t.fromWarehouseName ?? t.fromWarehouseId ?? '',
          toWarehouse: t.toWarehouseName ?? t.toWarehouseId ?? '',
          itemsCount: t.totalLines ?? lines.length,
          totalQuantity: t.totalQuantity ?? totalQuantity,
          transferDate: (t.transferDate ?? '').toString().split('T')[0],
          expectedDelivery: (t.expectedReceiptDate ?? '').toString().split('T')[0],
          status: mapStatus(t.status),
          initiatedBy: t.requestedByName ?? '',
          approvedBy: t.approvedByName ?? '',
          totalValue: Number(t.totalValue ?? 0),
          transportMode: t.transportMode ?? 'Road',
          vehicleNumber: t.vehicleNumber ?? '',
          driverName: t.driverName ?? ''
        }
      })

      setTransfers(mappedTransfers)
    } catch (err) {
      console.error('Failed to fetch transfers:', err)
      setError('Failed to load transfers. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Calculate stats from fetched data
  const pendingCount = transfers.filter(t => t.status === 'draft' || t.status === 'approved').length
  const inTransitCount = transfers.filter(t => t.status === 'in_transit').length
  const completedCount = transfers.filter(t => t.status === 'received').length
  const totalValue = transfers.reduce((sum, t) => sum + t.totalValue, 0)

  const stats = [
    {
      title: 'Pending Transfers',
      value: pendingCount.toString(),
      change: '+5.2%',
      icon: Package,
      gradient: 'from-orange-500 to-orange-600'
    },
    {
      title: 'In Transit',
      value: inTransitCount.toString(),
      change: '+8.7%',
      icon: Truck,
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Completed',
      value: completedCount.toString(),
      change: '+15.3%',
      icon: CheckCircle,
      gradient: 'from-green-500 to-green-600'
    },
    {
      title: 'Total Value',
      value: totalValue > 1000000 ? `₹${(totalValue / 1000000).toFixed(1)}M` : `₹${(totalValue / 1000).toFixed(0)}K`,
      change: '+12.1%',
      icon: DollarSign,
      gradient: 'from-purple-500 to-purple-600'
    }
  ]

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      approved: 'bg-blue-100 text-blue-800',
      in_transit: 'bg-yellow-100 text-yellow-800',
      received: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const filteredTransfers = transfers.filter(transfer => {
    const matchesSearch =
      transfer.transferId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transfer.fromWarehouse.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transfer.toWarehouse.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === 'all' || transfer.status === statusFilter
    const matchesLocation = locationFilter === 'all' ||
      transfer.fromWarehouse.toLowerCase().includes(locationFilter.toLowerCase())

    return matchesSearch && matchesStatus && matchesLocation
  })

  const totalPages = Math.ceil(filteredTransfers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentTransfers = filteredTransfers.slice(startIndex, endIndex)

  const handleExport = () => {
    exportToCsv('stock-transfers', filteredTransfers as unknown as Record<string, unknown>[])
  }

  const handleApprove = async (transferId: string) => {
    try {
      setSubmitting(true)
      setActionError(null)
      await inventoryService.approveStockTransfer(transferId)
      await fetchTransfers()
    } catch (err) {
      console.error('Failed to approve transfer:', err)
      setActionError('Failed to approve transfer. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // No dedicated delete endpoint for a draft transfer — the backend exposes
  // /cancel as the way to void a transfer, so a "delete" maps to cancel.
  const handleDelete = async (transferId: string) => {
    try {
      setSubmitting(true)
      setActionError(null)
      await inventoryService.cancelStockTransfer(transferId)
      await fetchTransfers()
    } catch (err) {
      console.error('Failed to cancel transfer:', err)
      setActionError('Failed to cancel transfer. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // Modal handler functions
  const handleCreateTransfer = () => {
    setIsCreateOpen(true)
  }

  const handleCreateTransferSubmit = async (data: CreateTransferData, _isDraft: boolean) => {
    try {
      setSubmitting(true)
      setActionError(null)
      // Map the modal form to the backend CreateStockTransferDto shape.
      await inventoryService.createStockTransfer({
        transferType: 'Warehouse to Warehouse',
        transferDate: data?.transferDate ?? new Date().toISOString().slice(0, 10),
        expectedReceiptDate: data?.expectedDelivery || undefined,
        fromWarehouseId: data?.fromWarehouse,
        toWarehouseId: data?.toWarehouse,
        purpose: data?.reason,
        lines: (data?.items ?? []).map((l, i) => ({
          lineNumber: i + 1,
          itemId: l?.itemId,
          itemCode: l?.itemId,
          itemName: l?.itemName,
          requestedQuantity: l?.transferQty ?? 0,
          uom: l?.uom,
          remarks: l?.batchNumber
            ? `Batch: ${l.batchNumber}`
            : undefined,
        })),
      })
      // Refresh the list after creating
      await fetchTransfers()
      setIsCreateOpen(false)
    } catch (err) {
      console.error('Failed to create transfer:', err)
      setActionError('Failed to create transfer. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleViewTransfer = (transfer: StockTransfer) => {
    // Convert StockTransfer to Transfer format
    const transferData: Transfer = {
      id: transfer.id,
      transferNumber: transfer.transferId,
      status: transfer.status === 'in_transit' ? 'in-transit' : transfer.status === 'received' ? 'completed' : transfer.status,
      priority: 'normal',
      transferType: 'warehouse',
      fromLocation: {
        warehouse: transfer.fromWarehouse,
        zone: '',
        bin: ''
      },
      toLocation: {
        warehouse: transfer.toWarehouse,
        zone: '',
        bin: ''
      },
      transferDate: transfer.transferDate,
      expectedDelivery: transfer.expectedDelivery,
      reason: 'Stock transfer',
      items: [],
      timeline: [
        {
          event: 'Transfer Created',
          date: transfer.transferDate,
          user: transfer.initiatedBy,
          notes: ''
        }
      ],
      createdBy: transfer.initiatedBy,
      createdDate: transfer.transferDate,
      approvedBy: transfer.approvedBy || undefined,
      value: transfer.totalValue
    }
    setSelectedTransfer(transferData)
    setIsViewDetailsOpen(true)
  }

  const handleApproveTransfer = () => {
    setIsViewDetailsOpen(false)
    setIsApproveOpen(true)
  }

  const handleApproveSubmit = async (data: ApproveTransferData) => {
    if (!selectedTransfer) {
      setIsApproveOpen(false)
      return
    }
    try {
      setSubmitting(true)
      setActionError(null)
      // No dedicated reject endpoint exists; a rejection voids the transfer
      // via /cancel. Approve uses /approve.
      if (data.decision === 'reject') {
        await inventoryService.cancelStockTransfer(selectedTransfer.id)
      } else {
        await inventoryService.approveStockTransfer(selectedTransfer.id)
      }
      await fetchTransfers()
    } catch (err) {
      console.error('Failed to process transfer approval:', err)
      setActionError('Failed to process transfer. Please try again.')
    } finally {
      setSubmitting(false)
      setIsApproveOpen(false)
    }
  }

  const handleDispatch = () => {
    setIsViewDetailsOpen(false)
    setIsDispatchOpen(true)
  }

  const handleDispatchSubmit = async (_data: DispatchTransferData) => {
    if (!selectedTransfer) {
      setIsDispatchOpen(false)
      return
    }
    try {
      setSubmitting(true)
      setActionError(null)
      await inventoryService.dispatchStockTransfer(selectedTransfer.id)
      await fetchTransfers()
    } catch (err) {
      console.error('Failed to dispatch transfer:', err)
      setActionError('Failed to dispatch transfer. Please try again.')
    } finally {
      setSubmitting(false)
      setIsDispatchOpen(false)
    }
  }

  const handleReceive = () => {
    setIsViewDetailsOpen(false)
    setIsReceiveOpen(true)
  }

  const handleReceiveSubmit = async (data: ReceiveTransferData) => {
    if (!selectedTransfer) {
      setIsReceiveOpen(false)
      return
    }
    try {
      setSubmitting(true)
      setActionError(null)
      await inventoryService.receiveStockTransfer(selectedTransfer.id, {
        lines: (data?.itemsReceived ?? []).map((item) => ({
          itemId: item?.itemId,
          receivedQuantity: item?.receivedQuantity ?? 0,
          receivedCondition: item?.condition === 'damaged' ? 'Damaged' : 'Good',
        })),
        remarks: data?.qcNotes,
      })
      await fetchTransfers()
    } catch (err) {
      console.error('Failed to receive transfer:', err)
      setActionError('Failed to receive transfer. Please try again.')
    } finally {
      setSubmitting(false)
      setIsReceiveOpen(false)
    }
  }

  // No reject-receipt endpoint exists; rejecting a receipt voids the transfer
  // via /cancel.
  const handleReceiveReject = async () => {
    if (selectedTransfer) {
      try {
        setSubmitting(true)
        setActionError(null)
        await inventoryService.cancelStockTransfer(selectedTransfer.id)
        await fetchTransfers()
      } catch (err) {
        console.error('Failed to reject transfer receipt:', err)
        setActionError('Failed to reject transfer. Please try again.')
      } finally {
        setSubmitting(false)
      }
    }
    setIsReceiveOpen(false)
    setIsViewDetailsOpen(true)
  }

  const handleViewHistory = () => {
    setIsHistoryOpen(true)
  }

  const handleHistoryViewDetails = (transfer: Transfer) => {
    // Convert Transfer type to StockTransfer for view handler
    const stockTransfer: StockTransfer = {
      id: transfer.id,
      transferId: transfer.transferNumber,
      fromWarehouse: transfer.fromLocation.warehouse,
      toWarehouse: transfer.toLocation.warehouse,
      itemsCount: transfer.items?.length || 0,
      totalQuantity: transfer.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0,
      transferDate: transfer.transferDate,
      expectedDelivery: transfer.expectedDelivery,
      status: (transfer.status === 'in-transit' ? 'in_transit' : transfer.status) as 'draft' | 'approved' | 'in_transit' | 'received' | 'cancelled',
      initiatedBy: transfer.createdBy,
      approvedBy: transfer.approvedBy || '',
      totalValue: transfer.value || 0,
      transportMode: 'Road',
      vehicleNumber: '',
      driverName: ''
    }
    handleViewTransfer(stockTransfer)
    setIsHistoryOpen(false)
  }

  const handleEdit = () => {
    setIsViewDetailsOpen(false)
    setIsCreateOpen(true)
  }

  const handleCancel = async () => {
    if (selectedTransfer) {
      try {
        setSubmitting(true)
        setActionError(null)
        await inventoryService.cancelStockTransfer(selectedTransfer.id)
        await fetchTransfers()
      } catch (err) {
        console.error('Failed to cancel transfer:', err)
        setActionError('Failed to cancel transfer. Please try again.')
      } finally {
        setSubmitting(false)
      }
    }
    setIsViewDetailsOpen(false)
  }

  if (loading) {
    return (
      <div className="w-full min-h-screen px-3 py-2 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading transfers...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full min-h-screen px-3 py-2 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-2">{error}</p>
          <button
            onClick={fetchTransfers}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen px-3 py-2">
      <div className="max-w-[1600px] space-y-3">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
          {stats.map((stat, index) => {
            const gradientMap: { [key: string]: string } = {
              'from-orange-500 to-orange-600': 'from-orange-50 to-orange-100',
              'from-blue-500 to-blue-600': 'from-blue-50 to-blue-100',
              'from-green-500 to-green-600': 'from-green-50 to-green-100',
              'from-purple-500 to-purple-600': 'from-purple-50 to-purple-100'
            }
            const borderMap: { [key: string]: string } = {
              'from-orange-500 to-orange-600': 'border-orange-200',
              'from-blue-500 to-blue-600': 'border-blue-200',
              'from-green-500 to-green-600': 'border-green-200',
              'from-purple-500 to-purple-600': 'border-purple-200'
            }
            const textMap: { [key: string]: { title: string; value: string } } = {
              'from-orange-500 to-orange-600': { title: 'text-orange-600', value: 'text-orange-900' },
              'from-blue-500 to-blue-600': { title: 'text-blue-600', value: 'text-blue-900' },
              'from-green-500 to-green-600': { title: 'text-green-600', value: 'text-green-900' },
              'from-purple-500 to-purple-600': { title: 'text-purple-600', value: 'text-purple-900' }
            }
            const iconColor = gradientMap[stat.gradient].includes('orange') ? 'text-orange-600' :
                            gradientMap[stat.gradient].includes('blue') ? 'text-blue-600' :
                            gradientMap[stat.gradient].includes('green') ? 'text-green-600' : 'text-purple-600'
            return (
              <div
                key={index}
                className={`bg-gradient-to-br ${gradientMap[stat.gradient]} rounded-lg p-3 border ${borderMap[stat.gradient]}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${textMap[stat.gradient].title}`}>{stat.title}</p>
                    <p className={`text-2xl font-bold mt-1 ${textMap[stat.gradient].value}`}>{stat.value}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${iconColor}`} />
                </div>
              </div>
            )
          })}
        </div>

        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Inventory Transfers</h1>
          <div className="flex gap-3">
            <button
              onClick={handleViewHistory}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-4 h-4" />
              View History
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export Report
            </button>
            <button
              onClick={handleCreateTransfer}
              disabled={submitting}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              Create Transfer
            </button>
          </div>
        </div>

        {actionError && (
          <div className="flex items-center justify-between gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            <span>{actionError}</span>
            <button
              onClick={() => setActionError(null)}
              className="text-red-600 hover:text-red-800 font-medium"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
          <div className="flex flex-col lg:flex-row gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by transfer ID or warehouse..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="approved">Approved</option>
                <option value="in_transit">In Transit</option>
                <option value="received">Received</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All From Locations</option>
                <option value="main warehouse">Main Warehouse</option>
                <option value="factory store">Factory Store</option>
                <option value="distribution center">Distribution Center</option>
                <option value="regional hub">Regional Hub</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-24rem)]">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Transfer ID
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    From Warehouse
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    To Warehouse
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Items Count
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Total Quantity
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Transfer Date
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Expected Delivery
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Initiated By
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentTransfers.map((transfer) => (
                  <tr
                    key={transfer.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => handleViewTransfer(transfer)}
                  >
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{transfer.transferId}</div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="text-sm text-gray-900">{transfer.fromWarehouse}</div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="text-sm text-gray-900">{transfer.toWarehouse}</div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-medium">{transfer.itemsCount} items</div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-medium">{transfer.totalQuantity.toLocaleString()}</div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{transfer.transferDate}</div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{transfer.expectedDelivery}</div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(transfer.status)}`}>
                        {transfer.status.replace('_', ' ').charAt(0).toUpperCase() + transfer.status.replace('_', ' ').slice(1)}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{transfer.initiatedBy}</div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleViewTransfer(transfer)
                          }}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleViewTransfer(transfer)
                            setTimeout(() => handleEdit(), 100)
                          }}
                          className="p-1 text-gray-600 hover:bg-gray-50 rounded transition-colors"
                          title="Edit Transfer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {transfer.status === 'draft' && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleApprove(transfer.id)
                              }}
                              className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                              title="Approve Transfer"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                if (confirm(`Delete transfer ${transfer.transferId}? This action cannot be undone.`)) {
                                  handleDelete(transfer.id)
                                }
                              }}
                              className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Delete Transfer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-gray-50 px-3 py-2 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredTransfers.length)} of {filteredTransfers.length} transfers
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Components */}
        <CreateTransferModal
          isOpen={isCreateOpen}
          onClose={() => {
            setIsCreateOpen(false)
            setSelectedTransfer(null)
          }}
          onSubmit={handleCreateTransferSubmit}
        />

        <ViewTransferDetailsModal
          isOpen={isViewDetailsOpen}
          onClose={() => {
            setIsViewDetailsOpen(false)
            setSelectedTransfer(null)
          }}
          transfer={selectedTransfer}
          onEdit={handleEdit}
          onApprove={handleApproveTransfer}
          onReject={() => {
            setIsViewDetailsOpen(false)
            setIsApproveOpen(true)
          }}
          onDispatch={handleDispatch}
          onReceive={handleReceive}
          onCancel={handleCancel}
          onPrint={() => printCurrentView()}
        />

        <ApproveTransferModal
          isOpen={isApproveOpen}
          onClose={() => {
            setIsApproveOpen(false)
            setIsViewDetailsOpen(true)
          }}
          onSubmit={handleApproveSubmit}
          transfer={selectedTransfer}
        />

        <DispatchTransferModal
          isOpen={isDispatchOpen}
          onClose={() => {
            setIsDispatchOpen(false)
            setIsViewDetailsOpen(true)
          }}
          onSubmit={handleDispatchSubmit}
          transfer={selectedTransfer}
        />

        <ReceiveTransferModal
          isOpen={isReceiveOpen}
          onClose={() => {
            setIsReceiveOpen(false)
            setIsViewDetailsOpen(true)
          }}
          onSubmit={handleReceiveSubmit}
          onReject={handleReceiveReject}
          transfer={selectedTransfer}
        />

        <TransferHistoryModal
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          onViewDetails={handleHistoryViewDetails}
          onExport={() => exportToCsv('stock-transfer-history', filteredTransfers as unknown as Record<string, unknown>[])}
        />
      </div>
    </div>
  )
}

export default InventoryTransfersPage
