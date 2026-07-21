'use client';

import { useState, useMemo, useEffect } from 'react';
import { Package, AlertTriangle, TrendingUp, TrendingDown, IndianRupee, X } from 'lucide-react';
import { HrAssetsService } from '@/services/hr-assets.service';

interface StockItem {
  id: string;
  assetCode: string;
  assetName: string;
  category: 'laptop' | 'desktop' | 'mobile' | 'monitor' | 'furniture' | 'accessories' | 'other';
  brand: string;
  model: string;
  totalQuantity: number;
  allocated: number;
  available: number;
  minStockLevel: number;
  reorderLevel: number;
  unitCost: number;
  totalValue: number;
  location: string;
  supplier: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'reorder';
}

export default function Page() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const fallbackStock: StockItem[] = [
    {
      id: '1',
      assetCode: 'LAP-DEL-5420',
      assetName: 'Dell Latitude 5420',
      category: 'laptop',
      brand: 'Dell',
      model: 'Latitude 5420',
      totalQuantity: 50,
      allocated: 35,
      available: 15,
      minStockLevel: 10,
      reorderLevel: 15,
      unitCost: 65000,
      totalValue: 3250000,
      location: 'Central Warehouse',
      supplier: 'Dell India',
      status: 'in_stock'
    },
    {
      id: '2',
      assetCode: 'MON-DEL-24',
      assetName: 'Dell 24" Monitor',
      category: 'monitor',
      brand: 'Dell',
      model: 'P2422H',
      totalQuantity: 80,
      allocated: 65,
      available: 15,
      minStockLevel: 20,
      reorderLevel: 25,
      unitCost: 12000,
      totalValue: 960000,
      location: 'Central Warehouse',
      supplier: 'Dell India',
      status: 'low_stock'
    },
    {
      id: '3',
      assetCode: 'MOB-SAM-S21',
      assetName: 'Samsung Galaxy S21',
      category: 'mobile',
      brand: 'Samsung',
      model: 'Galaxy S21',
      totalQuantity: 30,
      allocated: 28,
      available: 2,
      minStockLevel: 5,
      reorderLevel: 8,
      unitCost: 45000,
      totalValue: 1350000,
      location: 'IT Store',
      supplier: 'Samsung India',
      status: 'reorder'
    },
    {
      id: '4',
      assetCode: 'DESK-HP-800',
      assetName: 'HP Elite 800 Desktop',
      category: 'desktop',
      brand: 'HP',
      model: 'Elite 800 G8',
      totalQuantity: 25,
      allocated: 25,
      available: 0,
      minStockLevel: 5,
      reorderLevel: 10,
      unitCost: 55000,
      totalValue: 1375000,
      location: 'Central Warehouse',
      supplier: 'HP India',
      status: 'out_of_stock'
    },
    {
      id: '5',
      assetCode: 'FURN-CHR-ERG',
      assetName: 'Ergonomic Office Chair',
      category: 'furniture',
      brand: 'Featherlite',
      model: 'Amaze High Back',
      totalQuantity: 100,
      allocated: 75,
      available: 25,
      minStockLevel: 15,
      reorderLevel: 20,
      unitCost: 8500,
      totalValue: 850000,
      location: 'Furniture Warehouse',
      supplier: 'Featherlite',
      status: 'in_stock'
    },
    {
      id: '6',
      assetCode: 'LAP-LEN-T14',
      assetName: 'Lenovo ThinkPad T14',
      category: 'laptop',
      brand: 'Lenovo',
      model: 'ThinkPad T14 Gen 3',
      totalQuantity: 40,
      allocated: 32,
      available: 8,
      minStockLevel: 10,
      reorderLevel: 12,
      unitCost: 72000,
      totalValue: 2880000,
      location: 'Central Warehouse',
      supplier: 'Lenovo India',
      status: 'low_stock'
    }
  ];

  const [mockStock, setMockStock] = useState<StockItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [detailItem, setDetailItem] = useState<StockItem | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const rows = await HrAssetsService.getAssetInventory();
        if (cancelled) return;
        setMockStock(
            rows.map((r) => ({
              id: r.id,
              assetCode: r.assetCode || '',
              assetName: r.assetName || '',
              category: (r.category as StockItem['category']) || 'other',
              brand: r.brand || '',
              model: r.model || '',
              totalQuantity: Number(r.totalQuantity ?? 0),
              allocated: Number(r.allocated ?? 0),
              available: Number(r.available ?? 0),
              minStockLevel: Number(r.minStockLevel ?? 0),
              reorderLevel: Number(r.reorderLevel ?? 0),
              unitCost: Number(r.unitCost ?? 0),
              totalValue: Number(r.totalValue ?? 0),
              location: r.location || '',
              supplier: r.supplier || '',
              status: (r.status as StockItem['status']) || 'in_stock',
            })),
          );
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load stock');
          setMockStock(fallbackStock);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredStock = mockStock.filter(s => {
    const categoryMatch = selectedCategory === 'all' || s.category === selectedCategory;
    const statusMatch = selectedStatus === 'all' || s.status === selectedStatus;
    return categoryMatch && statusMatch;
  });

  const stats = useMemo(() => ({
    totalValue: mockStock.reduce((sum, s) => sum + s.totalValue, 0),
    totalItems: mockStock.reduce((sum, s) => sum + s.totalQuantity, 0),
    available: mockStock.reduce((sum, s) => sum + s.available, 0),
    lowStock: mockStock.filter(s => s.status === 'low_stock' || s.status === 'reorder').length
  }), [mockStock]);

  const statusColors = {
    in_stock: 'bg-green-100 text-green-700',
    low_stock: 'bg-yellow-100 text-yellow-700',
    out_of_stock: 'bg-red-100 text-red-700',
    reorder: 'bg-orange-100 text-orange-700'
  };

  const categoryColors = {
    laptop: 'bg-purple-100 text-purple-700',
    desktop: 'bg-blue-100 text-blue-700',
    mobile: 'bg-green-100 text-green-700',
    monitor: 'bg-orange-100 text-orange-700',
    furniture: 'bg-pink-100 text-pink-700',
    accessories: 'bg-gray-100 text-gray-700',
    other: 'bg-gray-100 text-gray-700'
  };

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900">Stock Management</h1>
        <p className="text-sm text-gray-600 mt-1">Monitor and manage asset inventory stock levels</p>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading stock…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {loadError}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Value</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">₹{(stats.totalValue / 100000).toFixed(2)}L</p>
            </div>
            <IndianRupee className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Total Items</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{stats.totalItems}</p>
            </div>
            <Package className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Available</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">{stats.available}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Low Stock Alerts</p>
              <p className="text-2xl font-bold text-red-900 mt-1">{stats.lowStock}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">All Categories</option>
              <option value="laptop">Laptop</option>
              <option value="desktop">Desktop</option>
              <option value="mobile">Mobile</option>
              <option value="monitor">Monitor</option>
              <option value="furniture">Furniture</option>
              <option value="accessories">Accessories</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">All Status</option>
              <option value="in_stock">In Stock</option>
              <option value="low_stock">Low Stock</option>
              <option value="reorder">Reorder Required</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setShowForm(true)}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
            >
              Add Stock Item
            </button>
          </div>
        </div>
      </div>

      {/* Stock List */}
      <div className="space-y-2">
        {filteredStock.map(item => (
          <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-12 w-12 bg-indigo-50 rounded-lg flex items-center justify-center">
                    <Package className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{item.assetName}</h3>
                    <p className="text-sm text-gray-600">Code: {item.assetCode} • {item.brand} {item.model}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 text-xs font-semibold rounded ${categoryColors[item.category]}`}>
                    {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                  </span>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColors[item.status]}`}>
                    {item.status === 'in_stock' ? 'In Stock' : item.status === 'low_stock' ? 'Low Stock' : item.status === 'out_of_stock' ? 'Out of Stock' : 'Reorder Required'}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Total Value</p>
                <p className="text-2xl font-bold text-blue-600">₹{item.totalValue.toLocaleString('en-IN')}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-2 py-4 border-y border-gray-200">
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Total Quantity</p>
                <p className="text-2xl font-bold text-gray-900">{item.totalQuantity}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Allocated</p>
                <p className="text-2xl font-bold text-orange-600">{item.allocated}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Available</p>
                <p className="text-2xl font-bold text-green-600">{item.available}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Min Level</p>
                <p className="text-lg font-semibold text-gray-900">{item.minStockLevel}</p>
                <p className="text-xs text-gray-500">Reorder: {item.reorderLevel}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Unit Cost</p>
                <p className="text-lg font-semibold text-gray-900">₹{item.unitCost.toLocaleString('en-IN')}</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3 mb-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Location</p>
                  <p className="text-sm text-gray-700">{item.location}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Supplier</p>
                  <p className="text-sm text-gray-700">{item.supplier}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-gray-500 font-medium">Stock Level:</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-xs">
                    <div
                      className={`h-2 rounded-full ${
                        item.available >= item.reorderLevel ? 'bg-green-500' :
                        item.available >= item.minStockLevel ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${(item.available / item.totalQuantity) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-semibold text-gray-900">{Math.round((item.available / item.totalQuantity) * 100)}%</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setDetailItem(item)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm"
                >
                  View Details
                </button>
                {(item.status === 'low_stock' || item.status === 'reorder' || item.status === 'out_of_stock') && (
                  <button
                    onClick={() => setDetailItem(item)}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium text-sm"
                  >
                    Create PO
                  </button>
                )}
                <button
                  onClick={() => setDetailItem(item)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
                >
                  Adjust Stock
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {detailItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3" onClick={() => setDetailItem(null)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-4 py-3 flex items-center justify-between rounded-t-xl">
              <h2 className="text-xl font-bold">Stock Item Details</h2>
              <button onClick={() => setDetailItem(null)} className="text-white hover:bg-white/20 rounded-lg p-1">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-3">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{detailItem.assetName}</h3>
                <p className="text-sm text-gray-600">Code: {detailItem.assetCode} • {detailItem.brand} {detailItem.model}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-xs text-gray-500 uppercase">Category</p><p className="font-medium text-gray-900 capitalize">{detailItem.category}</p></div>
                <div><p className="text-xs text-gray-500 uppercase">Status</p><p className="font-medium text-gray-900">{detailItem.status.replace(/_/g, ' ')}</p></div>
                <div><p className="text-xs text-gray-500 uppercase">Total Quantity</p><p className="font-medium text-gray-900">{detailItem.totalQuantity}</p></div>
                <div><p className="text-xs text-gray-500 uppercase">Allocated</p><p className="font-medium text-gray-900">{detailItem.allocated}</p></div>
                <div><p className="text-xs text-gray-500 uppercase">Available</p><p className="font-medium text-gray-900">{detailItem.available}</p></div>
                <div><p className="text-xs text-gray-500 uppercase">Min / Reorder Level</p><p className="font-medium text-gray-900">{detailItem.minStockLevel} / {detailItem.reorderLevel}</p></div>
                <div><p className="text-xs text-gray-500 uppercase">Unit Cost</p><p className="font-medium text-gray-900">₹{detailItem.unitCost.toLocaleString('en-IN')}</p></div>
                <div><p className="text-xs text-gray-500 uppercase">Total Value</p><p className="font-medium text-gray-900">₹{detailItem.totalValue.toLocaleString('en-IN')}</p></div>
                <div><p className="text-xs text-gray-500 uppercase">Location</p><p className="font-medium text-gray-900">{detailItem.location}</p></div>
                <div><p className="text-xs text-gray-500 uppercase">Supplier</p><p className="font-medium text-gray-900">{detailItem.supplier}</p></div>
              </div>
              <button onClick={() => setDetailItem(null)} className="w-full bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 font-semibold">Close</button>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 flex items-center justify-between rounded-t-xl">
              <h2 className="text-xl font-bold">Add Stock Item</h2>
              <button onClick={() => setShowForm(false)} className="text-white hover:bg-white/20 rounded-lg p-1">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-3">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                Adding stock items from this screen is not yet available — the inventory service endpoint is pending.
              </div>
              <button onClick={() => setShowForm(false)} className="w-full bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 font-semibold">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
