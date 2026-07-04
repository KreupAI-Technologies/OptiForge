'use client';

import React, { useState, useEffect } from 'react';
import { inventoryService } from '@/services/InventoryService';
import {
  Settings,
  TrendingUp,
  TrendingDown,
  Calendar,
  User,
  FileText,
  Eye,
  Plus,
  Search,
  Filter,
  Download,
  AlertCircle,
  CheckCircle,
  Clock,
  Upload
} from 'lucide-react';
import {
  CreateAdjustmentModal,
  BulkAdjustmentModal,
  ViewAdjustmentDetailsModal,
  ReconciliationModal,
  ExportAdjustmentReportModal,
  StockAdjustmentData,
  BulkAdjustmentData,
  ReconciliationData
} from '@/components/inventory/InventoryAdjustmentModals';
import { exportToCsv } from '@/lib/export';

interface Adjustment {
  id: number;
  backendId?: string;
  adjustmentNumber: string;
  date: string;
  warehouse: string;
  type: 'quantity' | 'value' | 'write-off';
  reason: string;
  itemsCount: number;
  adjustmentValue: number;
  adjustmentType: 'increase' | 'decrease';
  createdBy: string;
  status: 'draft' | 'pending-approval' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedDate?: string;
}

export default function AdjustmentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedWarehouse, setSelectedWarehouse] = useState('all');

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isReconciliationModalOpen, setIsReconciliationModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [selectedAdjustment, setSelectedAdjustment] = useState<Adjustment | null>(null);

  const [adjustments, setAdjustments] = useState<Adjustment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadAdjustments = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      // Backend returns raw ORM shape (adjustmentNumber/adjustmentDate/
      // warehouseName/adjustmentType/status/totalAdjustmentValue/referenceType/
      // approvedByName/approvedAt); map it to the page's Adjustment model.
      const raw = (await inventoryService.getStockAdjustments()) as any[];
      const typeMap: Record<string, Adjustment['type']> = {
        Quantity: 'quantity', QUANTITY: 'quantity', 'Stock Adjustment': 'quantity',
        Value: 'value', VALUE: 'value', Revaluation: 'value',
        WriteOff: 'write-off', 'Write-Off': 'write-off', WRITE_OFF: 'write-off', WriteOn: 'quantity',
      };
      const statusMap: Record<string, Adjustment['status']> = {
        Draft: 'draft', DRAFT: 'draft',
        PendingApproval: 'pending-approval', PENDING_APPROVAL: 'pending-approval', Pending: 'pending-approval', Submitted: 'pending-approval',
        Approved: 'approved', APPROVED: 'approved', Posted: 'approved',
        Rejected: 'rejected', REJECTED: 'rejected',
      };
      const toDate = (d: any): string => (d ? String(d).split('T')[0] : '');
      const mapped: Adjustment[] = raw.map((a, idx) => {
        const total = Number(a.totalAdjustmentValue ?? 0);
        return {
          id: idx + 1,
          backendId: a.id != null ? String(a.id) : undefined,
          adjustmentNumber: a.adjustmentNumber ?? '',
          date: toDate(a.adjustmentDate),
          warehouse: a.warehouseName ?? a.warehouseId ?? '-',
          type: typeMap[a.adjustmentType] ?? 'quantity',
          reason: a.referenceType ?? a.approvalRemarks ?? '-',
          itemsCount: Number(a.itemsCount ?? (Array.isArray(a.items) ? a.items.length : 0)),
          adjustmentValue: Math.abs(total),
          adjustmentType: total < 0 ? 'decrease' : 'increase',
          createdBy: a.createdByName ?? a.counterName ?? a.createdBy ?? '-',
          status: statusMap[a.status] ?? 'draft',
          approvedBy: a.approvedByName ?? undefined,
          approvedDate: toDate(a.approvedAt) || undefined,
        };
      });
      setAdjustments(mapped);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load stock adjustments');
      setAdjustments([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdjustments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'pending-approval':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'rejected':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'draft':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'quantity':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'value':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'write-off':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const totalAdjustments = adjustments.length;
  const pendingApproval = adjustments.filter(a => a.status === 'pending-approval').length;
  const totalValue = adjustments.reduce((sum, a) => sum + a.adjustmentValue, 0);
  const approvedThisMonth = adjustments.filter(a => a.status === 'approved').length;

  const filteredAdjustments = adjustments.filter(adj => {
    const matchesSearch = adj.adjustmentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         adj.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         adj.warehouse.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || adj.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || adj.status === selectedStatus;
    const matchesWarehouse = selectedWarehouse === 'all' || adj.warehouse.toLowerCase().includes(selectedWarehouse.toLowerCase());

    return matchesSearch && matchesType && matchesStatus && matchesWarehouse;
  });

  // Helper function to convert Adjustment to StockAdjustmentData
  const convertToStockAdjustmentData = (adjustment: Adjustment): StockAdjustmentData => {
    // Map adjustment type to modal's adjustment type
    const mapAdjustmentType = (type: string): 'increase' | 'decrease' | 'recount' | 'damage' | 'obsolete' => {
      if (type === 'quantity') return 'recount';
      if (type === 'write-off') return 'damage';
      return 'recount';
    };

    return {
      adjustmentNumber: adjustment.adjustmentNumber,
      adjustmentType: mapAdjustmentType(adjustment.type),
      adjustmentDate: adjustment.date,
      warehouse: adjustment.warehouse,
      reason: adjustment.reason,
      items: [
        // Mock items - in real implementation, fetch from API
        {
          itemId: '1',
          itemCode: 'ITEM-001',
          itemName: 'Sample Item',
          currentQuantity: 100,
          adjustedQuantity: 120,
          difference: 20,
          reason: adjustment.reason,
          warehouse: adjustment.warehouse,
          zone: 'A1',
          bin: 'B01',
          costImpact: adjustment.adjustmentValue
        }
      ],
      totalCostImpact: adjustment.adjustmentValue,
      approver: adjustment.approvedBy,
      notes: `Created by ${adjustment.createdBy}`
    };
  };

  // Modal handlers
  const handleCreateAdjustment = (data: StockAdjustmentData) => {
    // TODO: Integrate with API to create adjustment
    console.log('Creating adjustment:', data);

    // Mock: Add to local state
    const newAdjustment: Adjustment = {
      id: adjustments.length + 1,
      adjustmentNumber: data.adjustmentNumber,
      date: data.adjustmentDate,
      warehouse: data.warehouse,
      type: 'quantity',
      reason: data.reason,
      itemsCount: data.items.length,
      adjustmentValue: data.totalCostImpact,
      adjustmentType: data.items.reduce((sum, item) => sum + item.difference, 0) > 0 ? 'increase' : 'decrease',
      createdBy: 'Current User',
      status: 'draft'
    };

    setAdjustments([newAdjustment, ...adjustments]);
    setIsCreateModalOpen(false);
  };

  const handleBulkAdjustment = (data: BulkAdjustmentData) => {
    // TODO: Integrate with API to create bulk adjustments
    console.log('Creating bulk adjustment:', data);

    // Mock: Add to local state
    const newAdjustment: Adjustment = {
      id: adjustments.length + 1,
      adjustmentNumber: `ADJ-BULK-${Date.now()}`,
      date: data.adjustmentDate,
      warehouse: data.warehouse,
      type: 'quantity',
      reason: data.reason,
      itemsCount: data.items.length,
      adjustmentValue: data.items.reduce((sum, item) => sum + item.costImpact, 0),
      adjustmentType: data.adjustmentType,
      createdBy: 'Current User',
      status: 'draft'
    };

    setAdjustments([newAdjustment, ...adjustments]);
    setIsBulkModalOpen(false);
  };

  const handleReconciliation = (data: ReconciliationData) => {
    // TODO: Integrate with API to create reconciliation
    console.log('Creating reconciliation:', data);

    // Mock: Add to local state
    const newAdjustment: Adjustment = {
      id: adjustments.length + 1,
      adjustmentNumber: data.reconciliationNumber,
      date: data.reconciliationDate,
      warehouse: data.warehouse,
      type: 'quantity',
      reason: 'Stock Reconciliation',
      itemsCount: data.items.length,
      adjustmentValue: Math.abs(data.variance * 100), // Mock calculation
      adjustmentType: data.variance > 0 ? 'increase' : 'decrease',
      createdBy: data.performedBy,
      status: 'pending-approval'
    };

    setAdjustments([newAdjustment, ...adjustments]);
    setIsReconciliationModalOpen(false);
  };

  const handleExport = (_format: string, _filters: any) => {
    exportToCsv('inventory-adjustments', filteredAdjustments as unknown as Record<string, unknown>[]);
  };

  const handleViewAdjustment = (adjustment: Adjustment) => {
    setSelectedAdjustment(adjustment);
    setIsViewModalOpen(true);
  };

  const handleApproveAdjustment = async () => {
    if (!selectedAdjustment) return;
    if (!selectedAdjustment.backendId) {
      alert('Cannot approve: missing adjustment identifier.');
      return;
    }
    try {
      await inventoryService.approveStockAdjustment(selectedAdjustment.backendId);
      setIsViewModalOpen(false);
      setSelectedAdjustment(null);
      await loadAdjustments();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to approve adjustment.');
    }
  };

  const handleRejectAdjustment = async () => {
    if (!selectedAdjustment) return;
    if (!selectedAdjustment.backendId) {
      alert('Cannot reject: missing adjustment identifier.');
      return;
    }
    try {
      await inventoryService.rejectStockAdjustment(selectedAdjustment.backendId);
      setIsViewModalOpen(false);
      setSelectedAdjustment(null);
      await loadAdjustments();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to reject adjustment.');
    }
  };

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <Settings className="w-8 h-8 text-blue-600" />
            <span>Inventory Adjustments</span>
          </h1>
          <p className="text-gray-600 mt-1">Manage inventory quantity and value adjustments</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button
            onClick={() => setIsBulkModalOpen(true)}
            className="px-4 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 flex items-center space-x-2"
          >
            <Upload className="w-4 h-4" />
            <span>Bulk Adjustment</span>
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Adjustment</span>
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading stock adjustments…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}
      {!isLoading && !loadError && adjustments.length === 0 && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          No stock adjustments found.
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <Settings className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-blue-900">{totalAdjustments}</span>
          </div>
          <div className="text-sm font-medium text-blue-700">Total Adjustments</div>
          <div className="text-xs text-blue-600 mt-1">This Month</div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-8 h-8 text-yellow-600" />
            <span className="text-2xl font-bold text-yellow-900">{pendingApproval}</span>
          </div>
          <div className="text-sm font-medium text-yellow-700">Pending Approval</div>
          <div className="text-xs text-yellow-600 mt-1">Awaiting Review</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-purple-600" />
            <span className="text-2xl font-bold text-purple-900">₹{(totalValue / 100000).toFixed(1)}L</span>
          </div>
          <div className="text-sm font-medium text-purple-700">Total Value</div>
          <div className="text-xs text-purple-600 mt-1">All Adjustments</div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <span className="text-2xl font-bold text-green-900">{approvedThisMonth}</span>
          </div>
          <div className="text-sm font-medium text-green-700">Approved</div>
          <div className="text-xs text-green-600 mt-1">This Month</div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-white rounded-lg shadow p-3">
        <h3 className="text-lg font-semibold mb-2">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="p-4 border border-blue-200 rounded-lg hover:bg-blue-50 flex flex-col items-center space-y-2"
          >
            <Settings className="w-8 h-8 text-blue-600" />
            <span className="text-sm font-medium">Quantity Adjustment</span>
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="p-4 border border-purple-200 rounded-lg hover:bg-purple-50 flex flex-col items-center space-y-2"
          >
            <TrendingUp className="w-8 h-8 text-purple-600" />
            <span className="text-sm font-medium">Value Adjustment</span>
          </button>
          <button
            onClick={() => setIsReconciliationModalOpen(true)}
            className="p-4 border border-cyan-200 rounded-lg hover:bg-cyan-50 flex flex-col items-center space-y-2"
          >
            <CheckCircle className="w-8 h-8 text-cyan-600" />
            <span className="text-sm font-medium">Reconciliation</span>
          </button>
          <button
            onClick={() => setSelectedStatus('pending-approval')}
            className="p-4 border border-yellow-200 rounded-lg hover:bg-yellow-50 flex flex-col items-center space-y-2"
          >
            <Clock className="w-8 h-8 text-yellow-600" />
            <span className="text-sm font-medium">View Approvals</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search adjustments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="quantity">Quantity</option>
            <option value="value">Value</option>
            <option value="write-off">Write-Off</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="pending-approval">Pending Approval</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            value={selectedWarehouse}
            onChange={(e) => setSelectedWarehouse(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Warehouses</option>
            <option value="main">Main Warehouse</option>
            <option value="assembly">Assembly Plant</option>
            <option value="fg">FG Store</option>
            <option value="rm">RM Store</option>
          </select>
        </div>
      </div>

      {/* Adjustments Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Adjustment #</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Warehouse</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value Impact</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created By</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAdjustments.map((adj) => (
                <tr
                  key={adj.id}
                  onClick={() => handleViewAdjustment(adj)}
                  className="hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                    {adj.adjustmentNumber}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>{adj.date}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    {adj.warehouse}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor(adj.type)}`}>
                      {adj.type.replace('-', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-900">
                    <div className="flex items-center space-x-1">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span>{adj.reason}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    {adj.itemsCount} items
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm">
                    <div className={`flex items-center space-x-1 ${adj.adjustmentType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
                      {adj.adjustmentType === 'increase' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      <span className="font-medium">₹{(adj.adjustmentValue / 1000).toFixed(1)}K</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center space-x-1">
                      <User className="w-4 h-4 text-gray-400" />
                      <span>{adj.createdBy}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(adj.status)}`}>
                      {adj.status.replace('-', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewAdjustment(adj);
                      }}
                      className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAdjustments.length === 0 && (
          <div className="text-center py-12">
            <Settings className="w-12 h-12 text-gray-400 mb-2" />
            <p className="text-gray-500">No adjustments found matching your filters</p>
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateAdjustmentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateAdjustment}
      />

      <BulkAdjustmentModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onSubmit={handleBulkAdjustment}
      />

      <ViewAdjustmentDetailsModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedAdjustment(null);
        }}
        adjustment={selectedAdjustment ? convertToStockAdjustmentData(selectedAdjustment) : null}
        onApprove={selectedAdjustment?.status === 'pending-approval' ? handleApproveAdjustment : undefined}
        onReject={selectedAdjustment?.status === 'pending-approval' ? handleRejectAdjustment : undefined}
      />

      <ReconciliationModal
        isOpen={isReconciliationModalOpen}
        onClose={() => setIsReconciliationModalOpen(false)}
        onSubmit={handleReconciliation}
      />

      <ExportAdjustmentReportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={handleExport}
      />
    </div>
  );
}
