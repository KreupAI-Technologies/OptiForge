'use client';

import { useState, useMemo, useEffect } from 'react';
import { Pen, Package, AlertTriangle, AlertCircle } from 'lucide-react';
import { HrAssetsService } from '@/services/hr-assets.service';

interface StationeryItem {
  id: string;
  itemCode: string;
  itemName: string;
  category: 'writing' | 'paper' | 'filing' | 'desk' | 'binding' | 'other';
  brand: string;
  unit: 'pcs' | 'box' | 'pack' | 'ream' | 'set';
  totalQuantity: number;
  issued: number;
  available: number;
  minStockLevel: number;
  reorderLevel: number;
  unitCost: number;
  totalValue: number;
  location: string;
  supplier: string;
  lastPurchaseDate: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'reorder';
}

export default function Page() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [stationery, setStationery] = useState<StationeryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // NOTE: HrAssetsService exposes only READ getStationery (writes are createAssetRequest/
  // updateAssetRequest, and AssetManagementService has no stationery method). There is no
  // backend stationery create/issue/reorder endpoint, so the actions below optimistically
  // update the locally-loaded `stationery` state until such an endpoint exists.
  const [selected, setSelected] = useState<StationeryItem | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [issueTarget, setIssueTarget] = useState<StationeryItem | null>(null);
  const [reorderTarget, setReorderTarget] = useState<StationeryItem | null>(null);
  const [addForm, setAddForm] = useState({ itemName: '', itemCode: '', brand: '', category: 'writing' as StationeryItem['category'], unit: 'pcs' as StationeryItem['unit'], totalQuantity: '', unitCost: '', location: '', supplier: '' });
  const [issueQty, setIssueQty] = useState('');
  const [reorderQty, setReorderQty] = useState('');

  const handleAdd = () => {
    const totalQuantity = Number(addForm.totalQuantity) || 0;
    const unitCost = Number(addForm.unitCost) || 0;
    const newItem: StationeryItem = {
      id: Date.now().toString(),
      itemCode: addForm.itemCode,
      itemName: addForm.itemName,
      category: addForm.category,
      brand: addForm.brand,
      unit: addForm.unit,
      totalQuantity,
      issued: 0,
      available: totalQuantity,
      minStockLevel: 0,
      reorderLevel: 0,
      unitCost,
      totalValue: totalQuantity * unitCost,
      location: addForm.location,
      supplier: addForm.supplier,
      lastPurchaseDate: new Date().toISOString(),
      status: 'in_stock',
    };
    setStationery(prev => [newItem, ...prev]);
    setShowAdd(false);
    setAddForm({ itemName: '', itemCode: '', brand: '', category: 'writing', unit: 'pcs', totalQuantity: '', unitCost: '', location: '', supplier: '' });
  };

  const handleIssue = () => {
    if (!issueTarget) return;
    const qty = Number(issueQty) || 0;
    setStationery(prev => prev.map(s => {
      if (s.id !== issueTarget.id) return s;
      const issued = s.issued + qty;
      const available = Math.max(0, s.available - qty);
      const status: StationeryItem['status'] = available <= 0 ? 'out_of_stock' : available <= s.reorderLevel ? 'low_stock' : 'in_stock';
      return { ...s, issued, available, status };
    }));
    setIssueTarget(null);
    setIssueQty('');
  };

  const handleReorder = () => {
    if (!reorderTarget) return;
    const qty = Number(reorderQty) || 0;
    setStationery(prev => prev.map(s => {
      if (s.id !== reorderTarget.id) return s;
      const totalQuantity = s.totalQuantity + qty;
      const available = s.available + qty;
      return { ...s, totalQuantity, available, totalValue: totalQuantity * s.unitCost, status: 'in_stock', lastPurchaseDate: new Date().toISOString() };
    }));
    setReorderTarget(null);
    setReorderQty('');
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = await HrAssetsService.getStationery();
        const categories: StationeryItem['category'][] = ['writing', 'paper', 'filing', 'desk', 'binding', 'other'];
        const units: StationeryItem['unit'][] = ['pcs', 'box', 'pack', 'ream', 'set'];
        const statuses: StationeryItem['status'][] = ['in_stock', 'low_stock', 'out_of_stock', 'reorder'];
        const mapped: StationeryItem[] = raw.map((r, idx) => ({
          id: String(r.id ?? idx),
          itemCode: r.itemCode ?? '',
          itemName: r.itemName ?? '',
          category: categories.includes(r.category as StationeryItem['category'])
            ? (r.category as StationeryItem['category'])
            : 'other',
          brand: r.brand ?? '',
          unit: units.includes(r.unit as StationeryItem['unit'])
            ? (r.unit as StationeryItem['unit'])
            : 'pcs',
          totalQuantity: Number(r.totalQuantity ?? 0),
          issued: Number(r.issued ?? 0),
          available: Number(r.available ?? 0),
          minStockLevel: Number(r.minStockLevel ?? 0),
          reorderLevel: Number(r.reorderLevel ?? 0),
          unitCost: Number(r.unitCost ?? 0),
          totalValue: Number(r.totalValue ?? 0),
          location: r.location ?? '',
          supplier: r.supplier ?? '',
          lastPurchaseDate: r.lastPurchaseDate ?? '',
          status: statuses.includes(r.status as StationeryItem['status'])
            ? (r.status as StationeryItem['status'])
            : 'in_stock',
        }));
        if (!cancelled) setStationery(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load stationery');
          setStationery([]);
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

  const filteredStationery = stationery.filter(s => {
    if (selectedCategory !== 'all' && s.category !== selectedCategory) return false;
    if (selectedStatus !== 'all' && s.status !== selectedStatus) return false;
    return true;
  });

  const stats = useMemo(() => ({
    totalItems: stationery.reduce((sum, s) => sum + s.totalQuantity, 0),
    available: stationery.reduce((sum, s) => sum + s.available, 0),
    lowStock: stationery.filter(s => s.status === 'low_stock' || s.status === 'reorder').length,
    outOfStock: stationery.filter(s => s.status === 'out_of_stock').length,
    totalValue: stationery.reduce((sum, s) => sum + s.totalValue, 0)
  }), [stationery]);

  const statusColors = {
    in_stock: 'bg-green-100 text-green-700',
    low_stock: 'bg-yellow-100 text-yellow-700',
    out_of_stock: 'bg-red-100 text-red-700',
    reorder: 'bg-orange-100 text-orange-700'
  };

  const categoryColors = {
    writing: 'bg-blue-100 text-blue-700',
    paper: 'bg-green-100 text-green-700',
    filing: 'bg-purple-100 text-purple-700',
    desk: 'bg-orange-100 text-orange-700',
    binding: 'bg-pink-100 text-pink-700',
    other: 'bg-gray-100 text-gray-700'
  };

  const categoryLabel = {
    writing: 'Writing',
    paper: 'Paper',
    filing: 'Filing',
    desk: 'Desk Accessories',
    binding: 'Binding',
    other: 'Other'
  };

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900">Stationery Management</h1>
        <p className="text-sm text-gray-600 mt-1">Manage office stationery inventory and stock levels</p>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading stationery…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <p className="text-sm font-medium text-blue-600">Total Items</p>
          <p className="text-2xl font-bold text-blue-900 mt-1">{stats.totalItems}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <p className="text-sm font-medium text-green-600">Available</p>
          <p className="text-2xl font-bold text-green-900 mt-1">{stats.available}</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
          <p className="text-sm font-medium text-yellow-600">Low Stock</p>
          <p className="text-2xl font-bold text-yellow-900 mt-1">{stats.lowStock}</p>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3 border border-red-200">
          <p className="text-sm font-medium text-red-600">Out of Stock</p>
          <p className="text-2xl font-bold text-red-900 mt-1">{stats.outOfStock}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <p className="text-sm font-medium text-purple-600">Total Value</p>
          <p className="text-2xl font-bold text-purple-900 mt-1">₹{stats.totalValue.toLocaleString('en-IN')}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">All Categories</option>
              <option value="writing">Writing</option>
              <option value="paper">Paper</option>
              <option value="filing">Filing</option>
              <option value="desk">Desk Accessories</option>
              <option value="binding">Binding</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">All Status</option>
              <option value="in_stock">In Stock</option>
              <option value="low_stock">Low Stock</option>
              <option value="out_of_stock">Out of Stock</option>
              <option value="reorder">Reorder</option>
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={() => setShowAdd(true)} className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm">
              Add Item
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {filteredStationery.map(item => {
          const stockPercent = (item.available / item.totalQuantity) * 100;

          return (
            <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-12 w-12 bg-green-50 rounded-lg flex items-center justify-center">
                      <Pen className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{item.itemName}</h3>
                      <p className="text-sm text-gray-600">Code: {item.itemCode} • {item.brand}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded ${categoryColors[item.category]}`}>
                      {categoryLabel[item.category]}
                    </span>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColors[item.status]}`}>
                      {item.status === 'in_stock' ? 'In Stock' : item.status === 'low_stock' ? 'Low Stock' : item.status === 'out_of_stock' ? 'Out of Stock' : 'Reorder'}
                    </span>
                    {(item.status === 'low_stock' || item.status === 'reorder' || item.status === 'out_of_stock') && (
                      <span className="px-2 py-1 text-xs font-semibold rounded bg-red-50 text-red-700 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Action Required
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Total Value</p>
                  <p className="text-2xl font-bold text-blue-600">₹{item.totalValue.toLocaleString('en-IN')}</p>
                  <p className="text-xs text-gray-600 mt-1">₹{item.unitCost}/{item.unit}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2 py-4 border-y border-gray-200">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Total Quantity</p>
                  <p className="text-sm font-semibold text-gray-900">{item.totalQuantity} {item.unit}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Issued</p>
                  <p className="text-sm font-semibold text-gray-900">{item.issued} {item.unit}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Available</p>
                  <p className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                    <Package className="h-4 w-4 text-green-600" />
                    {item.available} {item.unit}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Reorder Level</p>
                  <p className="text-sm font-semibold text-gray-900">{item.reorderLevel} {item.unit}</p>
                </div>
              </div>

              <div className="mb-2">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-gray-500 uppercase font-medium">Stock Level</p>
                  <p className="text-xs font-semibold text-gray-900">{item.available} / {item.totalQuantity} ({stockPercent.toFixed(0)}%)</p>
                </div>
                <div className="bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full ${
                      stockPercent >= 50 ? 'bg-green-500' :
                      stockPercent >= 20 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${stockPercent}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-2">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Supplier</p>
                  <p className="text-sm font-semibold text-gray-900">{item.supplier}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Location</p>
                  <p className="text-sm font-semibold text-gray-900">{item.location}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Last Purchase</p>
                  <p className="text-sm font-semibold text-gray-900">{new Date(item.lastPurchaseDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={() => setIssueTarget(item)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm">
                  Issue Item
                </button>
                {(item.status === 'low_stock' || item.status === 'reorder' || item.status === 'out_of_stock') && (
                  <button onClick={() => setReorderTarget(item)} className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium text-sm">
                    Reorder
                  </button>
                )}
                <button onClick={() => setSelected(item)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm">
                  View History
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Item modal — optimistic local add (no backend stationery write endpoint) */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg bg-white rounded-lg shadow-lg p-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Add Stationery Item</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                <input value={addForm.itemName} onChange={(e) => setAddForm({ ...addForm, itemName: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item Code</label>
                <input value={addForm.itemCode} onChange={(e) => setAddForm({ ...addForm, itemCode: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                <input value={addForm.brand} onChange={(e) => setAddForm({ ...addForm, brand: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select value={addForm.category} onChange={(e) => setAddForm({ ...addForm, category: e.target.value as StationeryItem['category'] })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="writing">Writing</option>
                  <option value="paper">Paper</option>
                  <option value="filing">Filing</option>
                  <option value="desk">Desk Accessories</option>
                  <option value="binding">Binding</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                <select value={addForm.unit} onChange={(e) => setAddForm({ ...addForm, unit: e.target.value as StationeryItem['unit'] })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="pcs">pcs</option>
                  <option value="box">box</option>
                  <option value="pack">pack</option>
                  <option value="ream">ream</option>
                  <option value="set">set</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Quantity</label>
                <input type="number" value={addForm.totalQuantity} onChange={(e) => setAddForm({ ...addForm, totalQuantity: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit Cost</label>
                <input type="number" value={addForm.unitCost} onChange={(e) => setAddForm({ ...addForm, unitCost: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input value={addForm.location} onChange={(e) => setAddForm({ ...addForm, location: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                <input value={addForm.supplier} onChange={(e) => setAddForm({ ...addForm, supplier: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowAdd(false)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm">Cancel</button>
              <button onClick={handleAdd} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Issue Item modal — optimistic local update (no backend stationery write endpoint) */}
      {issueTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-4">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Issue Item</h2>
            <p className="text-sm text-gray-600 mb-3">{issueTarget.itemName}</p>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
            <input type="number" value={issueQty} onChange={(e) => setIssueQty(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => { setIssueTarget(null); setIssueQty(''); }} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm">Cancel</button>
              <button onClick={handleIssue} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm">Issue</button>
            </div>
          </div>
        </div>
      )}

      {/* Reorder modal — optimistic local update (no backend stationery write endpoint) */}
      {reorderTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-4">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Reorder Item</h2>
            <p className="text-sm text-gray-600 mb-3">{reorderTarget.itemName}</p>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
            <input type="number" value={reorderQty} onChange={(e) => setReorderQty(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => { setReorderTarget(null); setReorderQty(''); }} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm">Cancel</button>
              <button onClick={handleReorder} className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium text-sm">Reorder</button>
            </div>
          </div>
        </div>
      )}

      {/* View History / details modal — read-only */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg bg-white rounded-lg shadow-lg p-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-900 mb-3">{selected.itemName}</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Item Code</p><p className="font-semibold text-gray-900">{selected.itemCode}</p></div>
              <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Brand</p><p className="font-semibold text-gray-900">{selected.brand}</p></div>
              <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Category</p><p className="font-semibold text-gray-900">{categoryLabel[selected.category]}</p></div>
              <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Unit</p><p className="font-semibold text-gray-900">{selected.unit}</p></div>
              <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Total Quantity</p><p className="font-semibold text-gray-900">{selected.totalQuantity}</p></div>
              <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Issued</p><p className="font-semibold text-gray-900">{selected.issued}</p></div>
              <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Available</p><p className="font-semibold text-gray-900">{selected.available}</p></div>
              <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Reorder Level</p><p className="font-semibold text-gray-900">{selected.reorderLevel}</p></div>
              <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Unit Cost</p><p className="font-semibold text-gray-900">₹{selected.unitCost}</p></div>
              <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Total Value</p><p className="font-semibold text-gray-900">₹{selected.totalValue.toLocaleString('en-IN')}</p></div>
              <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Supplier</p><p className="font-semibold text-gray-900">{selected.supplier}</p></div>
              <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Location</p><p className="font-semibold text-gray-900">{selected.location}</p></div>
              <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Last Purchase</p><p className="font-semibold text-gray-900">{selected.lastPurchaseDate ? new Date(selected.lastPurchaseDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}</p></div>
              <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Status</p><p className="font-semibold text-gray-900">{selected.status}</p></div>
            </div>
            <div className="flex justify-end mt-4">
              <button onClick={() => setSelected(null)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
