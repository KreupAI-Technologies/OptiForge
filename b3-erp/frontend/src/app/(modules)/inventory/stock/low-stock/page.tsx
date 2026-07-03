'use client';

import React, { useState } from 'react';
import {
  AlertTriangle,
  ShoppingCart,
  Package,
  TrendingDown,
  Search,
  Download,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Send,
  Bell
} from 'lucide-react';
import {
  ViewStockDetailsModal, LowStockAlertModal, QuickAdjustmentModal,
  StockItem, LowStockItem as LowStockItemModal, QuickAdjustmentData
} from '@/components/inventory/InventoryStockModals';
import { ExportStockDataModal, ExportStockDataConfig } from '@/components/inventory/InventoryExportModals';
import { exportToCsv } from '@/lib/export';

interface LowStockItem {
  id: number;
  itemCode: string;
  itemName: string;
  category: string;
  warehouse: string;
  currentStock: number;
  reorderLevel: number;
  safetyStock: number;
  uom: string;
  leadTimeDays: number;
  suggestedQty: number;
  preferredSupplier: string;
  lastOrderDate: string;
  avgConsumption: number;
  priority: 'critical' | 'high' | 'medium';
  status: 'pending' | 'ordered' | 'ignored';
}

export default function LowStockPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Modal states
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);
  const [isLowStockAlertOpen, setIsLowStockAlertOpen] = useState(false);
  const [isQuickAdjustOpen, setIsQuickAdjustOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);
  const [lowStockModalItems, setLowStockModalItems] = useState<LowStockItemModal[]>([]);

  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([
    {
      id: 1,
      itemCode: 'CP-102',
      itemName: 'Electric Motor 5HP',
      category: 'Components',
      warehouse: 'Assembly Plant',
      currentStock: 8,
      reorderLevel: 15,
      safetyStock: 10,
      uom: 'Nos',
      leadTimeDays: 7,
      suggestedQty: 30,
      preferredSupplier: 'Motors India Ltd',
      lastOrderDate: '2025-01-10',
      avgConsumption: 4.5,
      priority: 'critical',
      status: 'pending'
    },
    {
      id: 2,
      itemCode: 'CP-101',
      itemName: 'Hydraulic Cylinder Assembly',
      category: 'Components',
      warehouse: 'Assembly Plant',
      currentStock: 12,
      reorderLevel: 20,
      safetyStock: 15,
      uom: 'Nos',
      leadTimeDays: 10,
      suggestedQty: 40,
      preferredSupplier: 'Hydraulics Corp',
      lastOrderDate: '2025-01-08',
      avgConsumption: 3.2,
      priority: 'critical',
      status: 'pending'
    },
    {
      id: 3,
      itemCode: 'RM-002',
      itemName: 'Stainless Steel Rod 25mm',
      category: 'Raw Material',
      warehouse: 'Main Warehouse',
      currentStock: 85,
      reorderLevel: 100,
      safetyStock: 80,
      uom: 'Pcs',
      leadTimeDays: 5,
      suggestedQty: 200,
      preferredSupplier: 'Steel Solutions',
      lastOrderDate: '2025-01-15',
      avgConsumption: 12.5,
      priority: 'high',
      status: 'ordered'
    },
    {
      id: 4,
      itemCode: 'RM-008',
      itemName: 'Copper Wire 10mm',
      category: 'Raw Material',
      warehouse: 'Main Warehouse',
      currentStock: 145,
      reorderLevel: 150,
      safetyStock: 120,
      uom: 'Mtrs',
      leadTimeDays: 3,
      suggestedQty: 500,
      preferredSupplier: 'Wire Traders',
      lastOrderDate: '2025-01-18',
      avgConsumption: 25.0,
      priority: 'medium',
      status: 'pending'
    },
    {
      id: 5,
      itemCode: 'CS-015',
      itemName: 'Cutting Oil Grade A',
      category: 'Consumables',
      warehouse: 'Main Warehouse',
      currentStock: 22,
      reorderLevel: 30,
      safetyStock: 25,
      uom: 'Ltrs',
      leadTimeDays: 2,
      suggestedQty: 100,
      preferredSupplier: 'Lubrication Supplies',
      lastOrderDate: '2025-01-12',
      avgConsumption: 8.0,
      priority: 'high',
      status: 'pending'
    }
  ]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'ordered':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'ignored':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'ordered':
        return <CheckCircle className="w-4 h-4" />;
      case 'ignored':
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const criticalCount = lowStockItems.filter(item => item.priority === 'critical').length;
  const highCount = lowStockItems.filter(item => item.priority === 'high').length;
  const pendingCount = lowStockItems.filter(item => item.status === 'pending').length;
  const orderedCount = lowStockItems.filter(item => item.status === 'ordered').length;

  const filteredItems = lowStockItems.filter(item => {
    const matchesSearch = item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.itemCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = selectedPriority === 'all' || item.priority === selectedPriority;
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
    
    return matchesSearch && matchesPriority && matchesStatus;
  });

  const handleCreatePO = (itemId: number) => {
    console.log('Create PO for item:', itemId);
    // In real implementation, this would navigate to PO creation or open a modal
  };

  const handleMarkOrdered = (itemId: number) => {
    setLowStockItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, status: 'ordered' as const } : item
      )
    );
  };

  const handleIgnore = (itemId: number) => {
    setLowStockItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, status: 'ignored' as const } : item
      )
    );
  };

  // Modal handlers
  const handleViewItem = (item: LowStockItem) => {
    // Convert to StockItem format
    const stockItem: StockItem = {
      id: item.id.toString(),
      itemCode: item.itemCode,
      itemName: item.itemName,
      description: `${item.category} item`,
      category: item.category,
      uom: item.uom,
      barcode: `BC${item.itemCode}`,
      currentQuantity: item.currentStock,
      available: item.currentStock,
      reserved: 0,
      onOrder: item.suggestedQty,
      minLevel: item.safetyStock,
      maxLevel: item.reorderLevel * 2,
      reorderPoint: item.reorderLevel,
      safetyStock: item.safetyStock,
      costPrice: 0, // Not available in current data
      sellingPrice: 0, // Not available in current data
      supplier: item.preferredSupplier,
      leadTime: item.leadTimeDays,
      valuationMethod: 'FIFO',
      enableSerial: false,
      enableBatch: false,
      trackExpiry: false,
      status: 'active',
      locations: [
        {
          warehouse: item.warehouse,
          zone: 'N/A',
          bin: 'N/A',
          quantity: item.currentStock,
          status: 'active'
        }
      ]
    };
    setSelectedItem(stockItem);
    setIsViewDetailsOpen(true);
  };

  const handleManageAlerts = () => {
    // Convert current low stock items to LowStockItemModal format
    const items: LowStockItemModal[] = lowStockItems
      .filter(item => item.status === 'pending')
      .map(item => ({
        id: item.id.toString(),
        itemCode: item.itemCode,
        itemName: item.itemName,
        currentQty: item.currentStock,
        reorderPoint: item.reorderLevel,
        shortage: item.reorderLevel - item.currentStock,
        suggestedOrderQty: item.suggestedQty,
        supplier: item.preferredSupplier,
        leadTime: item.leadTimeDays,
        lastOrderDate: item.lastOrderDate
      }));
    setLowStockModalItems(items);
    setIsLowStockAlertOpen(true);
  };

  const handleCreatePurchaseOrders = (itemIds: string[]) => {
    console.log('Creating purchase orders for:', itemIds);
    // TODO: Implement API call to create POs
    // Convert string IDs back to numbers and mark as ordered
    const numericIds = itemIds.map(id => parseInt(id));
    setLowStockItems(prev =>
      prev.map(item =>
        numericIds.includes(item.id) ? { ...item, status: 'ordered' as const } : item
      )
    );
  };

  const handleAdjustLevels = (itemIds: string[]) => {
    console.log('Adjusting levels for:', itemIds);
    // TODO: Open adjustment modal or navigate to settings
    setIsLowStockAlertOpen(false);
    alert('Adjust levels functionality - navigate to stock settings');
  };

  const handleDismissAlerts = (itemIds: string[]) => {
    console.log('Dismissing alerts for:', itemIds);
    // TODO: Implement API call to dismiss alerts
    const numericIds = itemIds.map(id => parseInt(id));
    setLowStockItems(prev =>
      prev.map(item =>
        numericIds.includes(item.id) ? { ...item, status: 'ignored' as const } : item
      )
    );
  };

  const handleExport = () => {
    setIsExportOpen(true);
  };

  const handleExportSubmit = (_config: ExportStockDataConfig) => {
    exportToCsv('low-stock', filteredItems as unknown as Record<string, unknown>[]);
    setIsExportOpen(false);
  };

  const handleQuickAdjust = (data: QuickAdjustmentData) => {
    console.log('Quick adjustment:', data);
    // TODO: Implement API call to adjust stock
    alert('Stock adjustment submitted');
  };

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <AlertTriangle className="w-8 h-8 text-red-600" />
            <span>Low Stock Alerts</span>
          </h1>
          <p className="text-gray-600 mt-1">Items below reorder level requiring action</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleManageAlerts}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
          >
            <Bell className="w-4 h-4" />
            <span>Manage Alerts</span>
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3 border border-red-200">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-8 h-8 text-red-600" />
            <span className="text-2xl font-bold text-red-900">{criticalCount}</span>
          </div>
          <div className="text-sm font-medium text-red-700">Critical Items</div>
          <div className="text-xs text-red-600 mt-1">Below Safety Stock</div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <TrendingDown className="w-8 h-8 text-orange-600" />
            <span className="text-2xl font-bold text-orange-900">{highCount}</span>
          </div>
          <div className="text-sm font-medium text-orange-700">High Priority</div>
          <div className="text-xs text-orange-600 mt-1">Below Reorder Level</div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-8 h-8 text-yellow-600" />
            <span className="text-2xl font-bold text-yellow-900">{pendingCount}</span>
          </div>
          <div className="text-sm font-medium text-yellow-700">Pending Action</div>
          <div className="text-xs text-yellow-600 mt-1">Awaiting Order</div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <ShoppingCart className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-blue-900">{orderedCount}</span>
          </div>
          <div className="text-sm font-medium text-blue-700">Already Ordered</div>
          <div className="text-xs text-blue-600 mt-1">In Process</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="ordered">Ordered</option>
            <option value="ignored">Ignored</option>
          </select>
        </div>
      </div>

      {/* Low Stock Items Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Code</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Stock</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reorder Level</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Suggested Qty</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lead Time</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preferred Supplier</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredItems.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleViewItem(item)}
                >
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center space-x-1 w-fit ${getPriorityColor(item.priority)}`}>
                      <AlertTriangle className="w-3 h-3" />
                      <span className="capitalize">{item.priority}</span>
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{item.itemCode}</td>
                  <td className="px-3 py-2 text-sm text-gray-900">
                    <div>{item.itemName}</div>
                    <div className="text-xs text-gray-500">{item.category}</div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="text-sm font-semibold text-red-600">{item.currentStock} {item.uom}</div>
                    <div className="text-xs text-gray-500">Avg: {item.avgConsumption} {item.uom}/day</div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">{item.reorderLevel} {item.uom}</td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="text-sm font-semibold text-green-600">{item.suggestedQty} {item.uom}</div>
                    <div className="text-xs text-gray-500">Safety: {item.safetyStock} {item.uom}</div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">{item.leadTimeDays} days</td>
                  <td className="px-3 py-2 text-sm text-gray-600">
                    <div>{item.preferredSupplier}</div>
                    <div className="text-xs text-gray-500">Last: {item.lastOrderDate}</div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center space-x-1 w-fit ${getStatusColor(item.status)}`}>
                      {getStatusIcon(item.status)}
                      <span className="capitalize">{item.status}</span>
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm">
                    {item.status === 'pending' && (
                      <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleCreatePO(item.id)}
                          className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                          title="Create Purchase Order"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          <span>Order</span>
                        </button>
                        <button
                          onClick={() => handleMarkOrdered(item.id)}
                          className="text-green-600 hover:text-green-800"
                          title="Mark as Ordered"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleIgnore(item.id)}
                          className="text-gray-600 hover:text-gray-800"
                          title="Ignore Alert"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    {item.status === 'ordered' && (
                      <span className="text-gray-500 text-xs">Order Placed</span>
                    )}
                    {item.status === 'ignored' && (
                      <span className="text-gray-500 text-xs">Ignored</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mb-2" />
            <p className="text-gray-500">No low stock items found matching your filters</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-3">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <button
            onClick={handleManageAlerts}
            className="px-3 py-2 border-2 border-blue-300 rounded-lg hover:bg-blue-50 flex items-center space-x-3 transition-colors"
          >
            <ShoppingCart className="w-6 h-6 text-blue-600" />
            <div className="text-left">
              <div className="font-semibold text-gray-900">Manage Alerts</div>
              <div className="text-sm text-gray-600">Bulk manage low stock items</div>
            </div>
          </button>

          <button className="px-3 py-2 border-2 border-orange-300 rounded-lg hover:bg-orange-50 flex items-center space-x-3 transition-colors">
            <Send className="w-6 h-6 text-orange-600" />
            <div className="text-left">
              <div className="font-semibold text-gray-900">Send Email Alerts</div>
              <div className="text-sm text-gray-600">Notify procurement team</div>
            </div>
          </button>

          <button
            onClick={handleExport}
            className="px-3 py-2 border-2 border-green-300 rounded-lg hover:bg-green-50 flex items-center space-x-3 transition-colors"
          >
            <Download className="w-6 h-6 text-green-600" />
            <div className="text-left">
              <div className="font-semibold text-gray-900">Export Report</div>
              <div className="text-sm text-gray-600">Download detailed report</div>
            </div>
          </button>
        </div>
      </div>

      {/* Modals */}
      <ViewStockDetailsModal
        isOpen={isViewDetailsOpen}
        onClose={() => setIsViewDetailsOpen(false)}
        item={selectedItem}
        onEdit={() => alert('Edit not implemented')}
        onAdjust={() => {
          setIsViewDetailsOpen(false);
          setIsQuickAdjustOpen(true);
        }}
      />

      <LowStockAlertModal
        isOpen={isLowStockAlertOpen}
        onClose={() => setIsLowStockAlertOpen(false)}
        items={lowStockModalItems}
        onCreatePurchaseOrders={handleCreatePurchaseOrders}
        onAdjustLevels={handleAdjustLevels}
        onDismissAlerts={handleDismissAlerts}
      />

      <QuickAdjustmentModal
        isOpen={isQuickAdjustOpen}
        onClose={() => setIsQuickAdjustOpen(false)}
        onAdjust={handleQuickAdjust}
        item={selectedItem}
      />

      <ExportStockDataModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        onExport={handleExportSubmit}
      />
    </div>
  );
}
