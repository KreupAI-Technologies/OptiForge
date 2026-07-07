'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { inventoryService } from '@/services/InventoryService';
import {
  ArrowLeft,
  Package,
  Warehouse,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Box,
  Boxes,
  RefreshCw,
  MapPin,
  ShoppingCart,
  DollarSign,
  Activity,
  Archive,
  Eye,
  FileText,
  Settings,
  Search,
  Filter,
  Calendar
} from 'lucide-react';

interface StockItem {
  id: string;
  itemCode: string;
  itemName: string;
  category: string;
  warehouse: string;
  currentStock: number;
  minLevel: number;
  maxLevel: number;
  unitCost: number;
  status: 'optimal' | 'low' | 'critical' | 'overstock';
  lastUpdated: string;
}

interface WarehouseData {
  id: string;
  name: string;
  location: string;
  capacity: number;
  used: number;
}

interface RecentMovement {
  id: string;
  type: 'receipt' | 'issue' | 'transfer' | 'adjustment';
  itemName: string;
  quantity: number;
  from?: string;
  to?: string;
  date: string;
  status: 'completed' | 'pending' | 'in-transit';
}

const statusConfig = {
  optimal: { color: 'bg-green-100 text-green-700 border-green-300', icon: CheckCircle },
  low: { color: 'bg-yellow-100 text-yellow-700 border-yellow-300', icon: Clock },
  critical: { color: 'bg-red-100 text-red-700 border-red-300', icon: AlertTriangle },
  overstock: { color: 'bg-blue-100 text-blue-700 border-blue-300', icon: Archive }
};

const movementTypeConfig = {
  receipt: { color: 'text-green-600', icon: ArrowDownRight, label: 'Receipt' },
  issue: { color: 'text-orange-600', icon: ArrowUpRight, label: 'Issue' },
  transfer: { color: 'text-blue-600', icon: RefreshCw, label: 'Transfer' },
  adjustment: { color: 'text-purple-600', icon: Settings, label: 'Adjustment' }
};

export default function InventoryPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseData[]>([]);
  const [recentMovements, setRecentMovements] = useState<RecentMovement[]>([]);
  const [loadingStock, setLoadingStock] = useState(true);
  const [loadingWarehouses, setLoadingWarehouses] = useState(true);
  const [loadingMovements, setLoadingMovements] = useState(true);

  useEffect(() => {
    setIsMounted(true);

    inventoryService
      .getStockBalances()
      .then((balances) => {
        const rows = Array.isArray(balances) ? balances : [];
        setStockItems(
          rows.map((b) => {
            const current = b.availableQuantity ?? 0;
            const status: StockItem['status'] = b.belowReorderLevel
              ? current <= 0
                ? 'critical'
                : 'low'
              : b.reorderQuantity && current > b.reorderLevel * 3
                ? 'overstock'
                : 'optimal';
            return {
              id: b.id,
              itemCode: b.itemCode,
              itemName: b.itemName,
              category: b.uom || 'General',
              warehouse: b.warehouseName || '',
              currentStock: current,
              minLevel: b.reorderLevel ?? 0,
              maxLevel: (b.reorderLevel ?? 0) + (b.reorderQuantity ?? 0),
              unitCost: current > 0 ? (b.stockValue ?? 0) / current : 0,
              status,
              lastUpdated: b.lastUpdated,
            };
          })
        );
      })
      .catch(() => setStockItems([]))
      .finally(() => setLoadingStock(false));

    // Warehouse capacity utilisation (GET /inventory/warehouses/capacity-utilization)
    inventoryService
      .getCapacityUtilization()
      .then((rows) => {
        const list = Array.isArray(rows) ? rows : [];
        setWarehouses(
          list.map((w: any, i: number) => {
            const capacity = Number(w.totalCapacity ?? 0);
            const used = Number(
              w.currentUtilization ?? Math.max(capacity - Number(w.availableCapacity ?? 0), 0)
            );
            return {
              id: String(w.warehouseId ?? w.id ?? i),
              name: w.warehouseName ?? w.warehouseCode ?? '—',
              location: w.warehouseCode ?? '',
              capacity,
              used,
            };
          })
        );
      })
      .catch(() => setWarehouses([]))
      .finally(() => setLoadingWarehouses(false));

    // Recent movements from stock entries (GET /inventory/stock-entries)
    inventoryService
      .getStockEntries()
      .then((entries) => {
        const rows = Array.isArray(entries) ? entries : [];
        const typeMap: Record<string, RecentMovement['type']> = {
          Receipt: 'receipt', Receive: 'receipt', In: 'receipt', Inbound: 'receipt', Purchase: 'receipt',
          'Material Receipt': 'receipt',
          Issue: 'issue', Out: 'issue', Outbound: 'issue', Sale: 'issue', Dispatch: 'issue',
          'Material Issue': 'issue',
          Transfer: 'transfer',
          Adjustment: 'adjustment', Adjust: 'adjustment',
        };
        const statusMap: Record<string, RecentMovement['status']> = {
          Completed: 'completed', Posted: 'completed', Approved: 'completed', Done: 'completed',
          Pending: 'pending', Draft: 'pending', Submitted: 'pending',
          'In Transit': 'in-transit', InTransit: 'in-transit',
        };
        const mapped: RecentMovement[] = rows
          .map((e: any, i: number) => ({
            id: String(e.id ?? i),
            type: typeMap[e.entryType ?? e.movementType ?? e.type] ?? 'adjustment',
            itemName: e.itemName ?? e.item?.itemName ?? e.entryNumber ?? 'Item',
            quantity: Number(e.quantity ?? e.totalQuantity ?? 0),
            from: e.fromWarehouseName ?? e.sourceLocation ?? undefined,
            to: e.toWarehouseName ?? e.warehouseName ?? undefined,
            date: e.entryDate ?? e.postingDate ?? e.date ?? e.createdAt ?? '',
            status: statusMap[e.status] ?? 'completed',
          }))
          .sort((a: RecentMovement, b: RecentMovement) => (b.date > a.date ? 1 : -1));
        setRecentMovements(mapped);
      })
      .catch(() => setRecentMovements([]))
      .finally(() => setLoadingMovements(false));
  }, []);

  // Calculate statistics
  const totalItems = stockItems.reduce((sum, item) => sum + item.currentStock, 0);
  const totalValue = stockItems.reduce((sum, item) => sum + (item.currentStock * item.unitCost), 0);
  const criticalItems = stockItems.filter(item => item.status === 'critical').length;
  const lowStockItems = stockItems.filter(item => item.status === 'low' || item.status === 'critical').length;
  const overstockItems = stockItems.filter(item => item.status === 'overstock').length;
  const optimalItems = stockItems.filter(item => item.status === 'optimal').length;

  // Get unique categories
  const categories = Array.from(new Set(stockItems.map(item => item.category)));

  // Filter items
  const filteredItems = stockItems.filter(item => {
    const matchesSearch =
      item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.itemCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (!isMounted) {
    return null;
  }



  return (
    <div className="min-h-screen bg-gray-50">
      <div className=" px-3 py-8">
        {/* Header */}
        <div className="mb-3">
          <Link href="/" className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <div className="h-12 w-12 bg-orange-500 rounded-lg flex items-center justify-center mr-4">
              <Package className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Inventory Dashboard</h1>
              <p className="text-gray-600">Real-time stock and warehouse management</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => router.push('/inventory/stock/add')}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Package className="h-4 w-4" />
              <span>Add Stock</span>
            </button>
            <button
              onClick={() => router.push('/inventory/movements/add')}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span>New Movement</span>
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Items</p>
                <p className="text-2xl font-bold text-blue-900 mt-1">{totalItems.toLocaleString()}</p>
                <p className="text-xs text-blue-600 mt-1">Across all warehouses</p>
              </div>
              <Boxes className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Inventory Value</p>
                <p className="text-2xl font-bold text-green-900 mt-1">${(totalValue / 1000).toFixed(1)}K</p>
                <p className="text-xs text-green-600 mt-1 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +5.2% from last month
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3 border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Critical Stock</p>
                <p className="text-2xl font-bold text-red-900 mt-1">{criticalItems}</p>
                <p className="text-xs text-red-600 mt-1">Requires immediate attention</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Warehouses</p>
                <p className="text-2xl font-bold text-purple-900 mt-1">
                  {loadingWarehouses ? '—' : warehouses.length}
                </p>
                <p className="text-xs text-purple-600 mt-1">Active warehouses</p>
              </div>
              <Warehouse className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Stock Health Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-3">
          {/* Stock Status Distribution */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Stock Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-gray-600">Optimal</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{optimalItems}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm text-gray-600">Low Stock</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{lowStockItems}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-gray-600">Critical</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{criticalItems}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Archive className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-gray-600">Overstock</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{overstockItems}</span>
              </div>
            </div>
            <button
              onClick={() => router.push('/inventory/stock/levels')}
              className="mt-4 w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View All Stock Levels →
            </button>
          </div>

          {/* Warehouse Capacity */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Warehouse Capacity</h3>
            <div className="space-y-2">
              {loadingWarehouses ? (
                [1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex items-center justify-between mb-1">
                      <div className="h-3 w-32 bg-gray-200 rounded" />
                      <div className="h-3 w-8 bg-gray-200 rounded" />
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2" />
                    <div className="h-2 w-24 bg-gray-100 rounded mt-1" />
                  </div>
                ))
              ) : warehouses.length === 0 ? (
                <p className="text-sm text-gray-500 py-4 text-center">No warehouse capacity data available</p>
              ) : (
                warehouses.map(warehouse => {
                  const utilization = warehouse.capacity > 0 ? (warehouse.used / warehouse.capacity) * 100 : 0;
                  return (
                    <div key={warehouse.id}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">{warehouse.name}</span>
                        <span className="text-sm text-gray-600">{utilization.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${utilization > 80 ? 'bg-red-500' : utilization > 60 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                          style={{ width: `${Math.min(utilization, 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {warehouse.used.toLocaleString()} / {warehouse.capacity.toLocaleString()} units
                      </p>
                    </div>
                  );
                })
              )}
            </div>
            <button
              onClick={() => router.push('/inventory/warehouse')}
              className="mt-4 w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Manage Warehouses →
            </button>
          </div>

          {/* Recent Movements */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Recent Movements</h3>
            <div className="space-y-3">
              {loadingMovements ? (
                [1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-start space-x-2 animate-pulse">
                    <div className="h-4 w-4 mt-0.5 bg-gray-200 rounded" />
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="h-3 w-32 bg-gray-200 rounded" />
                      <div className="h-2 w-40 bg-gray-100 rounded" />
                    </div>
                  </div>
                ))
              ) : recentMovements.length === 0 ? (
                <p className="text-sm text-gray-500 py-4 text-center">No recent movements</p>
              ) : (
                recentMovements.slice(0, 5).map(movement => {
                  const config = movementTypeConfig[movement.type] || movementTypeConfig.receipt;
                  const Icon = config.icon;
                  return (
                    <div key={movement.id} className="flex items-start space-x-2">
                      <Icon className={`h-4 w-4 mt-0.5 ${config.color}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{movement.itemName}</p>
                        <p className="text-xs text-gray-500">
                          {config.label}: {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                          {movement.from && ` from ${movement.from}`}
                          {movement.to && ` to ${movement.to}`}
                        </p>
                        <p className="text-xs text-gray-400">{movement.date}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <button
              onClick={() => router.push('/inventory/movements')}
              className="mt-4 w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View All Movements →
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 mb-3">
          <button
            onClick={() => router.push('/inventory/stock')}
            className="bg-white rounded-lg border border-gray-200 p-3 hover:bg-gray-50 transition-colors"
          >
            <Box className="h-6 w-6 text-blue-600 mb-2" />
            <p className="text-sm font-medium text-gray-900">Stock Items</p>
          </button>
          <button
            onClick={() => router.push('/inventory/movements')}
            className="bg-white rounded-lg border border-gray-200 p-3 hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="h-6 w-6 text-green-600 mb-2" />
            <p className="text-sm font-medium text-gray-900">Movements</p>
          </button>
          <button
            onClick={() => router.push('/inventory/transfers')}
            className="bg-white rounded-lg border border-gray-200 p-3 hover:bg-gray-50 transition-colors"
          >
            <ArrowUpRight className="h-6 w-6 text-purple-600 mb-2" />
            <p className="text-sm font-medium text-gray-900">Transfers</p>
          </button>
          <button
            onClick={() => router.push('/inventory/adjustments')}
            className="bg-white rounded-lg border border-gray-200 p-3 hover:bg-gray-50 transition-colors"
          >
            <Settings className="h-6 w-6 text-orange-600 mb-2" />
            <p className="text-sm font-medium text-gray-900">Adjustments</p>
          </button>
          <button
            onClick={() => router.push('/inventory/analytics/reports')}
            className="bg-white rounded-lg border border-gray-200 p-3 hover:bg-gray-50 transition-colors"
          >
            <BarChart3 className="h-6 w-6 text-indigo-600 mb-2" />
            <p className="text-sm font-medium text-gray-900">Reports</p>
          </button>
          <button
            onClick={() => router.push('/inventory/cycle-count')}
            className="bg-white rounded-lg border border-gray-200 p-3 hover:bg-gray-50 transition-colors"
          >
            <FileText className="h-6 w-6 text-teal-600 mb-2" />
            <p className="text-sm font-medium text-gray-900">Cycle Count</p>
          </button>
        </div>

        {/* Critical & Low Stock Items */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-3 py-2 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Critical & Low Stock Items</h2>
                <p className="text-sm text-gray-600">Items requiring immediate attention</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="all">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="critical">Critical</option>
                  <option value="low">Low Stock</option>
                  <option value="optimal">Optimal</option>
                  <option value="overstock">Overstock</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item Code</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item Name</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Warehouse</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Current Stock</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Min/Max</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredItems.map((item) => {
                  const config = statusConfig[item.status] || statusConfig.optimal;
                  const StatusIcon = config.icon;
                  return (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-2">
                        <span className="text-sm font-mono font-medium text-gray-900">{item.itemCode}</span>
                      </td>
                      <td className="px-3 py-2">
                        <span className="text-sm text-gray-900">{item.itemName}</span>
                      </td>
                      <td className="px-3 py-2">
                        <span className="text-sm text-gray-600">{item.category}</span>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center space-x-1 text-sm text-gray-600">
                          <MapPin className="h-3 w-3" />
                          <span>{item.warehouse}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <span className="text-sm font-semibold text-gray-900">{item.currentStock}</span>
                      </td>
                      <td className="px-3 py-2">
                        <span className="text-sm text-gray-600">{item.minLevel} / {item.maxLevel}</span>
                      </td>
                      <td className="px-3 py-2">
                        <span className={`inline-flex items-center space-x-1 px-2 py-1 text-xs font-semibold rounded-full border ${config.color}`}>
                          <StatusIcon className="h-3 w-3" />
                          <span className="capitalize">{item.status}</span>
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => router.push(`/inventory/stock/view/${item.id}`)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => router.push(`/inventory/movements/add?item=${item.id}`)}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                            title="Add Movement"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {loadingStock && (
            <div className="px-6 py-12 text-center text-gray-500">
              <RefreshCw className="h-6 w-6 text-gray-400 mb-2 mx-auto animate-spin" />
              Loading stock items…
            </div>
          )}

          {!loadingStock && filteredItems.length === 0 && (
            <div className="px-6 py-12 text-center">
              <Package className="h-12 w-12 text-gray-400 mb-2" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No items found</h3>
              <p className="text-gray-600">Try adjusting your search or filters</p>
            </div>
          )}

          <div className="px-3 py-2 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {filteredItems.length} of {stockItems.length} items
            </p>
            <button
              onClick={() => router.push('/inventory/stock')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View All Stock Items →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
