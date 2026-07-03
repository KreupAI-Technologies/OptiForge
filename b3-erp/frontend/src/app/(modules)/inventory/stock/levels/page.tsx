'use client';

import React, { useState, useEffect } from 'react';
import {
  Package,
  Search,
  Filter,
  Download,
  RefreshCw,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Warehouse,
  BarChart3,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle
} from 'lucide-react';
import { inventoryService } from '@/services/InventoryService';

interface StockItem {
  id: number;
  itemCode: string;
  itemName: string;
  category: string;
  warehouse: string;
  currentStock: number;
  reorderLevel: number;
  maxLevel: number;
  uom: string;
  unitValue: number;
  totalValue: number;
  lastUpdated: string;
  status: 'adequate' | 'low' | 'critical' | 'overstock';
}

export default function StockLevelsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        // Backend returns the raw StockBalance shape; map it onto this page's
        // StockItem model and derive a status band from the reorder level.
        const raw = (await inventoryService.getStockBalances()) as any[];
        const mapped: StockItem[] = (raw || []).map((b, index) => {
          const currentStock = Number(b.availableQuantity ?? b.freeQuantity ?? 0);
          const reorderLevel = Number(b.reorderLevel ?? 0);
          const maxLevel = Number(b.maxLevel ?? b.maxStockLevel ?? 0);
          const totalValue = Number(b.stockValue ?? 0);
          let status: StockItem['status'] = 'adequate';
          if (b.belowReorderLevel || (reorderLevel > 0 && currentStock <= reorderLevel * 0.5)) {
            status = 'critical';
          } else if (reorderLevel > 0 && currentStock <= reorderLevel) {
            status = 'low';
          } else if (maxLevel > 0 && currentStock > maxLevel) {
            status = 'overstock';
          }
          return {
            id: b.id ?? index + 1,
            itemCode: b.itemCode ?? '',
            itemName: b.itemName ?? '',
            category: b.category ?? b.itemCategory ?? '',
            warehouse: b.warehouseName ?? b.warehouseId ?? '',
            currentStock,
            reorderLevel,
            maxLevel,
            uom: b.uom ?? '',
            unitValue: currentStock > 0 ? Number((totalValue / currentStock).toFixed(2)) : 0,
            totalValue,
            lastUpdated: b.lastUpdated ? String(b.lastUpdated).replace('T', ' ').slice(0, 16) : '',
            status,
          };
        });
        if (!cancelled) setStockItems(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load stock levels');
          setStockItems([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'adequate':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'low':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'overstock':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'adequate':
        return <TrendingUp className="w-4 h-4" />;
      case 'low':
        return <AlertTriangle className="w-4 h-4" />;
      case 'critical':
        return <AlertTriangle className="w-4 h-4" />;
      case 'overstock':
        return <TrendingDown className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const totalStockValue = stockItems.reduce((sum, item) => sum + item.totalValue, 0);
  const criticalItems = stockItems.filter(item => item.status === 'critical').length;
  const lowStockItems = stockItems.filter(item => item.status === 'low').length;
  const overstockItems = stockItems.filter(item => item.status === 'overstock').length;

  const filteredItems = stockItems.filter(item => {
    const matchesSearch = item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.itemCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesWarehouse = selectedWarehouse === 'all' || item.warehouse === selectedWarehouse;
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
    
    return matchesSearch && matchesWarehouse && matchesCategory && matchesStatus;
  });

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <Package className="w-8 h-8 text-blue-600" />
            <span>Stock Levels</span>
          </h1>
          <p className="text-gray-600 mt-1">Real-time inventory levels across all warehouses</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading stock levels…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <Package className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-blue-900">{stockItems.length}</span>
          </div>
          <div className="text-sm font-medium text-blue-700">Total Items</div>
          <div className="text-xs text-blue-600 mt-1">In Stock</div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <BarChart3 className="w-8 h-8 text-green-600" />
            <span className="text-2xl font-bold text-green-900">₹{(totalStockValue / 100000).toFixed(1)}L</span>
          </div>
          <div className="text-sm font-medium text-green-700">Total Stock Value</div>
          <div className="text-xs text-green-600 mt-1">Current Valuation</div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3 border border-red-200">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-8 h-8 text-red-600" />
            <span className="text-2xl font-bold text-red-900">{criticalItems + lowStockItems}</span>
          </div>
          <div className="text-sm font-medium text-red-700">Low Stock Alerts</div>
          <div className="text-xs text-red-600 mt-1">{criticalItems} Critical</div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <TrendingDown className="w-8 h-8 text-orange-600" />
            <span className="text-2xl font-bold text-orange-900">{overstockItems}</span>
          </div>
          <div className="text-sm font-medium text-orange-700">Overstock Items</div>
          <div className="text-xs text-orange-600 mt-1">Above Max Level</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
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
            value={selectedWarehouse}
            onChange={(e) => setSelectedWarehouse(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Warehouses</option>
            <option value="Main Warehouse">Main Warehouse</option>
            <option value="Assembly Plant">Assembly Plant</option>
            <option value="FG Store">FG Store</option>
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            <option value="Raw Material">Raw Material</option>
            <option value="Components">Components</option>
            <option value="Finished Goods">Finished Goods</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="adequate">Adequate</option>
            <option value="low">Low Stock</option>
            <option value="critical">Critical</option>
            <option value="overstock">Overstock</option>
          </select>
        </div>
      </div>

      {/* Stock Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Code</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Warehouse</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Stock</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reorder Level</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Max Level</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Value</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{item.itemCode}</td>
                  <td className="px-3 py-2 text-sm text-gray-900">{item.itemName}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">{item.category}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Warehouse className="w-4 h-4 text-gray-400" />
                      <span>{item.warehouse}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">{item.currentStock} {item.uom}</div>
                    <div className="text-xs text-gray-500">Updated: {item.lastUpdated.split(' ')[1]}</div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">{item.reorderLevel} {item.uom}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">{item.maxLevel} {item.uom}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-semibold text-gray-900">
                    ₹{item.totalValue.toLocaleString()}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center space-x-1 w-fit ${getStatusColor(item.status)}`}>
                      {getStatusIcon(item.status)}
                      <span className="capitalize">{item.status}</span>
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm">
                    <button className="text-blue-600 hover:text-blue-800 flex items-center space-x-1">
                      <Eye className="w-4 h-4" />
                      <span>View</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mb-2" />
            <p className="text-gray-500">No stock items found matching your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
