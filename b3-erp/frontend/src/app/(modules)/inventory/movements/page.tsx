'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { inventoryService } from '@/services/InventoryService'
import {
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  ArrowRightLeft,
  ChevronLeft,
  ChevronRight,
  Package,
  Send,
  RotateCcw,
  History
} from 'lucide-react'
import {
  ReceiveStockModal,
  IssueStockModal,
  RecordReturnModal,
  ViewMovementDetailsModal,
  MovementHistoryModal,
  ReceiveStockData,
  IssueStockData,
  ReturnStockData,
  Movement
} from '@/components/inventory/InventoryMovementModals'
import { exportToCsv } from '@/lib/export'
import { EmptyState } from '@/components/ui/EmptyState'

interface InventoryMovement {
  id: string
  movementId: string
  itemCode: string
  itemName: string
  movementType: 'inbound' | 'outbound' | 'adjustment' | 'transfer'
  quantity: number
  fromLocation: string
  toLocation: string
  date: string
  referenceDoc: string
  status: 'completed' | 'pending' | 'cancelled'
  initiatedBy: string
  remarks: string
  unitOfMeasure: string
  cost: number
}

const InventoryMovementsPage = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [movementTypeFilter, setMovementTypeFilter] = useState('all')
  const [locationFilter, setLocationFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Modal states
  const [isReceiveOpen, setIsReceiveOpen] = useState(false)
  const [isIssueOpen, setIsIssueOpen] = useState(false)
  const [isReturnOpen, setIsReturnOpen] = useState(false)
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [selectedMovement, setSelectedMovement] = useState<Movement | null>(null)

  const [movements, setMovements] = useState<InventoryMovement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  // Write-action feedback (submitting / success / error) shared across the
  // receive / issue / return / edit handlers.
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setIsLoading(true)
      setLoadError(null)
      try {
        // GET /inventory/stock-entries -> stock movements (bare array).
        const raw = (await inventoryService.getStockEntries()) as any[]
        const typeMap: Record<string, InventoryMovement['movementType']> = {
          Receipt: 'inbound', Receive: 'inbound', In: 'inbound', Inbound: 'inbound', Purchase: 'inbound',
          Issue: 'outbound', Out: 'outbound', Outbound: 'outbound', Sale: 'outbound', Dispatch: 'outbound',
          Adjustment: 'adjustment', Adjust: 'adjustment',
          Transfer: 'transfer',
        }
        const statusMap: Record<string, InventoryMovement['status']> = {
          Completed: 'completed', Posted: 'completed', Approved: 'completed', Done: 'completed',
          Pending: 'pending', Draft: 'pending', Submitted: 'pending',
          Cancelled: 'cancelled', Canceled: 'cancelled', Rejected: 'cancelled',
        }
        const mapped: InventoryMovement[] = (raw || []).map((e: any, i: number) => ({
          id: String(e.id ?? i),
          movementId: e.entryNumber ?? e.movementId ?? e.documentNumber ?? e.id ?? '',
          itemCode: e.itemCode ?? e.item?.itemCode ?? '',
          itemName: e.itemName ?? e.item?.itemName ?? '',
          movementType: typeMap[e.entryType ?? e.movementType ?? e.type] ?? 'adjustment',
          quantity: Number(e.quantity ?? e.totalQuantity ?? 0),
          fromLocation: e.fromLocation ?? e.sourceLocation ?? e.fromWarehouseName ?? '',
          toLocation: e.toLocation ?? e.destinationLocation ?? e.toWarehouseName ?? e.warehouseName ?? '',
          date: e.entryDate ?? e.date ?? e.createdAt ?? '',
          referenceDoc: e.referenceNumber ?? e.referenceDoc ?? e.reference ?? '',
          status: statusMap[e.status] ?? 'pending',
          initiatedBy: e.createdBy ?? e.initiatedBy ?? e.createdByName ?? '',
          remarks: e.remarks ?? e.notes ?? '',
          unitOfMeasure: e.uom ?? e.unitOfMeasure ?? '',
          cost: Number(e.totalValue ?? e.totalCost ?? e.unitCost ?? e.cost ?? e.valuationRate ?? 0),
        }))
        if (!cancelled) setMovements(mapped)
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load stock movements')
          setMovements([])
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey])

  // Derive summary stat cards from the loaded movements list.
  const stats = useMemo(() => {
    const count = (t: InventoryMovement['movementType']) =>
      movements.filter((m) => m.movementType === t).length
    return [
      {
        title: 'Total Movements',
        value: movements.length.toLocaleString(),
        change: '',
        trend: 'up',
        gradient: 'from-blue-500 to-blue-600'
      },
      {
        title: 'Inbound',
        value: count('inbound').toLocaleString(),
        change: '',
        trend: 'up',
        gradient: 'from-green-500 to-green-600'
      },
      {
        title: 'Outbound',
        value: count('outbound').toLocaleString(),
        change: '',
        trend: 'up',
        gradient: 'from-purple-500 to-purple-600'
      },
      {
        title: 'Adjusted',
        value: count('adjustment').toLocaleString(),
        change: '',
        trend: 'down',
        gradient: 'from-orange-500 to-orange-600'
      }
    ]
  }, [movements])

  const getMovementTypeColor = (type: string) => {
    const colors = {
      inbound: 'bg-green-100 text-green-800',
      outbound: 'bg-blue-100 text-blue-800',
      adjustment: 'bg-yellow-100 text-yellow-800',
      transfer: 'bg-purple-100 text-purple-800'
    }
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getMovementTypeIcon = (type: string) => {
    switch (type) {
      case 'inbound':
        return <TrendingUp className="w-4 h-4" />
      case 'outbound':
        return <TrendingDown className="w-4 h-4" />
      case 'adjustment':
        return <RefreshCw className="w-4 h-4" />
      case 'transfer':
        return <ArrowRightLeft className="w-4 h-4" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    const colors = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const filteredMovements = movements.filter(movement => {
    const matchesSearch =
      movement.movementId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      movement.itemCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      movement.itemName.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesType = movementTypeFilter === 'all' || movement.movementType === movementTypeFilter
    const matchesLocation = locationFilter === 'all' ||
      movement.fromLocation.toLowerCase().includes(locationFilter.toLowerCase()) ||
      movement.toLocation.toLowerCase().includes(locationFilter.toLowerCase())

    return matchesSearch && matchesType && matchesLocation
  })

  const totalPages = Math.ceil(filteredMovements.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentMovements = filteredMovements.slice(startIndex, endIndex)

  const handleExport = () => {
    exportToCsv('inventory-movements', filteredMovements)
  }

  // Modal handlers
  const handleReceiveStock = () => {
    setIsReceiveOpen(true)
  }

  const handleReceiveStockSubmit = async (data: any) => {
    setIsSubmitting(true)
    setActionError(null)
    setActionSuccess(null)
    try {
      const today = new Date().toISOString().slice(0, 10)
      const items: any[] = (data.items ?? [data])
      const payload = {
        entryType: 'Material Receipt',
        postingDate: data.date ?? data.receiptDate ?? today,
        toWarehouseId: data.warehouseId ?? data.warehouse ?? items[0]?.warehouse,
        referenceNumber: data.reference ?? data.deliveryNoteNumber ?? data.poReference,
        remarks: data.notes,
        lines: items.map((l: any, i: number) => ({
          lineNumber: i + 1,
          itemId: l.itemId ?? l.itemCode,
          itemCode: l.itemCode,
          itemName: l.itemName,
          quantity: l.quantity ?? l.receivedQuantity ?? 0,
          uom: l.uom,
        })),
      }
      await inventoryService.createStockEntry(payload)
      setIsReceiveOpen(false)
      setActionSuccess('Stock receipt recorded successfully.')
      setRefreshKey((k) => k + 1)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to receive stock.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleIssueStock = () => {
    setIsIssueOpen(true)
  }

  const handleIssueStockSubmit = async (data: any) => {
    setIsSubmitting(true)
    setActionError(null)
    setActionSuccess(null)
    try {
      const today = new Date().toISOString().slice(0, 10)
      const items: any[] = (data.items ?? [data])
      const payload = {
        entryType: 'Material Issue',
        postingDate: data.date ?? data.issueDate ?? today,
        fromWarehouseId: data.warehouseId ?? data.warehouse ?? items[0]?.fromWarehouse,
        referenceNumber: data.reference ?? data.departmentWorkOrder,
        remarks: data.notes,
        lines: items.map((l: any, i: number) => ({
          lineNumber: i + 1,
          itemId: l.itemId ?? l.itemCode,
          itemCode: l.itemCode,
          itemName: l.itemName,
          quantity: l.quantity ?? l.issueQuantity ?? 0,
          uom: l.uom,
        })),
      }
      await inventoryService.createStockEntry(payload)
      setIsIssueOpen(false)
      setActionSuccess('Stock issue recorded successfully.')
      setRefreshKey((k) => k + 1)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to issue stock.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRecordReturn = () => {
    setIsReturnOpen(true)
  }

  const handleRecordReturnSubmit = async (data: any) => {
    setIsSubmitting(true)
    setActionError(null)
    setActionSuccess(null)
    try {
      const today = new Date().toISOString().slice(0, 10)
      const items: any[] = (data.items ?? [data])
      const isPurchaseReturn = String(
        data.returnType ?? data.returnReason ?? data.originalIssueRef ?? ''
      ).toLowerCase().includes('purchase')
      const payload = {
        entryType: isPurchaseReturn ? 'Purchase Return' : 'Sales Return',
        postingDate: data.date ?? data.returnDate ?? today,
        toWarehouseId: data.warehouseId ?? data.warehouse ?? items[0]?.toWarehouse,
        referenceNumber: data.reference ?? data.originalIssueRef,
        remarks: data.notes ?? data.returnReason,
        lines: items.map((l: any, i: number) => ({
          lineNumber: i + 1,
          itemId: l.itemId ?? l.itemCode,
          itemCode: l.itemCode,
          itemName: l.itemName,
          quantity: l.quantity ?? l.returnQuantity ?? 0,
          uom: l.uom,
        })),
      }
      await inventoryService.createStockEntry(payload)
      setIsReturnOpen(false)
      setActionSuccess('Stock return recorded successfully.')
      setRefreshKey((k) => k + 1)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to record return.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const convertToMovement = (movement: InventoryMovement): Movement => {
    return {
      id: movement.id,
      movementNumber: movement.movementId,
      type: movement.movementType === 'inbound' ? 'receipt' :
        movement.movementType === 'outbound' ? 'issue' :
          movement.movementType === 'adjustment' ? 'transfer' : 'transfer',
      date: movement.date,
      status: movement.status === 'completed' ? 'completed' :
        movement.status === 'pending' ? 'draft' : 'cancelled',
      fromLocation: movement.fromLocation,
      toLocation: movement.toLocation,
      supplier: movement.fromLocation.includes('Supplier') ? movement.fromLocation : undefined,
      reference: movement.referenceDoc,
      items: [{
        itemCode: movement.itemCode,
        itemName: movement.itemName,
        quantity: movement.quantity,
        uom: movement.unitOfMeasure,
        location: movement.toLocation,
        cost: movement.cost
      }],
      createdBy: movement.initiatedBy,
      createdDate: movement.date
    }
  }

  const handleViewMovement = (movement: InventoryMovement) => {
    const movementData = convertToMovement(movement)
    setSelectedMovement(movementData)
    setIsViewDetailsOpen(true)
  }

  const handleViewMovementFromHistory = (movement: Movement) => {
    setSelectedMovement(movement)
    setIsViewDetailsOpen(true)
  }

  const handleViewHistory = () => {
    setIsHistoryOpen(true)
  }

  // Edit is limited to the mutable remarks field: the create modals have no
  // edit/initialData mode, so a full edit form is out of scope for this phase.
  // Persists via the existing PUT /inventory/stock-entries/:id endpoint.
  const handleEditMovement = async (movement: InventoryMovement) => {
    const nextRemarks = window.prompt('Update remarks for this movement:', movement.remarks)
    if (nextRemarks === null || nextRemarks === movement.remarks) return
    setIsSubmitting(true)
    setActionError(null)
    setActionSuccess(null)
    try {
      await inventoryService.updateStockEntry(movement.id, { remarks: nextRemarks })
      setActionSuccess('Movement updated successfully.')
      setRefreshKey((k) => k + 1)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to update movement.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full min-h-screen px-3 py-2">
      <div className="max-w-[1600px] space-y-3">
        {loadError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {loadError}
          </div>
        )}
        {actionError && (
          <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            <span>{actionError}</span>
            <button onClick={() => setActionError(null)} className="text-red-500 hover:text-red-700">×</button>
          </div>
        )}
        {actionSuccess && (
          <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700">
            <span>{actionSuccess}</span>
            <button onClick={() => setActionSuccess(null)} className="text-green-500 hover:text-green-700">×</button>
          </div>
        )}
        {isSubmitting && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">
            Saving movement…
          </div>
        )}
        {isLoading && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">
            Loading movements…
          </div>
        )}
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
          {stats.map((stat, index) => {
            const gradientMap: { [key: string]: string } = {
              'from-blue-500 to-blue-600': 'from-blue-50 to-blue-100',
              'from-green-500 to-green-600': 'from-green-50 to-green-100',
              'from-purple-500 to-purple-600': 'from-purple-50 to-purple-100',
              'from-orange-500 to-orange-600': 'from-orange-50 to-orange-100'
            }
            const borderMap: { [key: string]: string } = {
              'from-blue-500 to-blue-600': 'border-blue-200',
              'from-green-500 to-green-600': 'border-green-200',
              'from-purple-500 to-purple-600': 'border-purple-200',
              'from-orange-500 to-orange-600': 'border-orange-200'
            }
            const textMap: { [key: string]: { title: string; value: string } } = {
              'from-blue-500 to-blue-600': { title: 'text-blue-600', value: 'text-blue-900' },
              'from-green-500 to-green-600': { title: 'text-green-600', value: 'text-green-900' },
              'from-purple-500 to-purple-600': { title: 'text-purple-600', value: 'text-purple-900' },
              'from-orange-500 to-orange-600': { title: 'text-orange-600', value: 'text-orange-900' }
            }
            const Icon = stat.trend === 'up' ? TrendingUp : TrendingDown
            const iconColor = gradientMap[stat.gradient].includes('blue') ? 'text-blue-600' :
              gradientMap[stat.gradient].includes('green') ? 'text-green-600' :
                gradientMap[stat.gradient].includes('purple') ? 'text-purple-600' : 'text-orange-600'
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
                  <Icon className={`h-8 w-8 ${iconColor}`} />
                </div>
              </div>
            )
          })}
        </div>

        <div className="flex justify-between items-center">
          <div className="flex gap-3">
            <button
              onClick={handleReceiveStock}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Package className="w-4 h-4" />
              Receive Stock
            </button>
            <button
              onClick={handleIssueStock}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              Issue Stock
            </button>
            <button
              onClick={handleRecordReturn}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RotateCcw className="w-4 h-4" />
              Record Return
            </button>
            <button
              onClick={handleViewHistory}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <History className="w-4 h-4" />
              View History
            </button>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
          <div className="flex flex-col lg:flex-row gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by movement ID, item code, or item name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={movementTypeFilter}
                onChange={(e) => setMovementTypeFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Movement Types</option>
                <option value="inbound">Inbound</option>
                <option value="outbound">Outbound</option>
                <option value="adjustment">Adjustment</option>
                <option value="transfer">Transfer</option>
              </select>
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Locations</option>
                <option value="main warehouse">Main Warehouse</option>
                <option value="factory store">Factory Store</option>
                <option value="regional hub">Regional Hub</option>
                <option value="distribution center">Distribution Center</option>
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
                    Movement ID
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Item Code
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Item Name
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Movement Type
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    From Location
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    To Location
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Reference Doc
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentMovements.map((movement) => (
                  <tr
                    key={movement.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => handleViewMovement(movement)}
                  >
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{movement.movementId}</div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{movement.itemCode}</div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="text-sm text-gray-900">{movement.itemName}</div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getMovementTypeColor(movement.movementType)}`}>
                        {getMovementTypeIcon(movement.movementType)}
                        {movement.movementType.charAt(0).toUpperCase() + movement.movementType.slice(1)}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-medium">
                        {movement.quantity > 0 ? '+' : ''}{movement.quantity} {movement.unitOfMeasure}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="text-sm text-gray-600">{movement.fromLocation}</div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="text-sm text-gray-600">{movement.toLocation}</div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{movement.date}</div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{movement.referenceDoc}</div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(movement.status)}`}>
                        {movement.status.charAt(0).toUpperCase() + movement.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleViewMovement(movement)
                          }}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEditMovement(movement)
                          }}
                          className="p-1 text-gray-600 hover:bg-gray-50 rounded transition-colors"
                          title="Edit Movement"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!isLoading && currentMovements.length === 0 && (
                  <tr>
                    <td colSpan={11} className="px-3 py-8">
                      <EmptyState
                        icon={ArrowRightLeft}
                        title="No stock movements found"
                        description={
                          movements.length === 0
                            ? 'No inventory movements have been recorded yet. Use Receive, Issue, or Record Return to create one.'
                            : 'No movements match your current search and filters.'
                        }
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-gray-50 px-3 py-2 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredMovements.length)} of {filteredMovements.length} movements
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
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${currentPage === page
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
      </div>

      {/* Modals */}
      <ReceiveStockModal
        isOpen={isReceiveOpen}
        onClose={() => setIsReceiveOpen(false)}
        onSubmit={handleReceiveStockSubmit}
      />

      <IssueStockModal
        isOpen={isIssueOpen}
        onClose={() => setIsIssueOpen(false)}
        onSubmit={handleIssueStockSubmit}
      />

      <RecordReturnModal
        isOpen={isReturnOpen}
        onClose={() => setIsReturnOpen(false)}
        onSubmit={handleRecordReturnSubmit}
      />

      <ViewMovementDetailsModal
        isOpen={isViewDetailsOpen}
        onClose={() => setIsViewDetailsOpen(false)}
        movement={selectedMovement}
      />

      <MovementHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        movements={movements.map(m => convertToMovement(m))}
        onViewDetails={handleViewMovementFromHistory}
      />
    </div>
  )
}

export default InventoryMovementsPage
