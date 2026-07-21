'use client';

import { useState, useMemo, useEffect } from 'react';
import { Armchair, User, MapPin } from 'lucide-react';
import { HrAssetsService } from '@/services/hr-assets.service';
import { AssetManagementService } from '@/services/asset-management.service';

interface FurnitureAsset {
  id: string;
  assetTag: string;
  item: string;
  category: 'desk' | 'chair' | 'cabinet' | 'table' | 'storage' | 'other';
  brand: string;
  purchaseDate: string;
  cost: number;
  status: 'available' | 'allocated' | 'maintenance' | 'retired';
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  assignedTo?: string;
  employeeCode?: string;
  department?: string;
  location: string;
}

export default function Page() {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const fallbackFurniture: FurnitureAsset[] = [
    {
      id: '1',
      assetTag: 'FUR-DESK-001',
      item: 'Executive Desk',
      category: 'desk',
      brand: 'Godrej Interio',
      purchaseDate: '2024-01-20',
      cost: 35000,
      status: 'allocated',
      condition: 'excellent',
      assignedTo: 'Rajesh Kumar',
      employeeCode: 'EMP345',
      department: 'Sales',
      location: 'Mumbai Office - 3rd Floor'
    },
    {
      id: '2',
      assetTag: 'FUR-CHAIR-045',
      item: 'Ergonomic Chair',
      category: 'chair',
      brand: 'Featherlite',
      purchaseDate: '2024-02-15',
      cost: 18000,
      status: 'allocated',
      condition: 'excellent',
      assignedTo: 'Sneha Reddy',
      employeeCode: 'EMP523',
      department: 'HR',
      location: 'Hyderabad Office - 2nd Floor'
    },
    {
      id: '3',
      assetTag: 'FUR-CAB-012',
      item: 'Filing Cabinet',
      category: 'cabinet',
      brand: 'Godrej',
      purchaseDate: '2023-06-10',
      cost: 12000,
      status: 'allocated',
      condition: 'good',
      assignedTo: 'Marketing Team',
      department: 'Marketing',
      location: 'Delhi Office - 1st Floor'
    },
    {
      id: '4',
      assetTag: 'FUR-TBL-089',
      item: 'Conference Table',
      category: 'table',
      brand: 'Durian',
      purchaseDate: '2023-03-15',
      cost: 55000,
      status: 'allocated',
      condition: 'good',
      location: 'Mumbai Office - Conference Room A'
    },
    {
      id: '5',
      assetTag: 'FUR-CHAIR-156',
      item: 'Visitor Chair',
      category: 'chair',
      brand: 'Nilkamal',
      purchaseDate: '2024-05-01',
      cost: 4500,
      status: 'available',
      condition: 'excellent',
      location: 'Bangalore Office - Storage'
    }
  ];

  const [mockFurniture, setMockFurniture] = useState<FurnitureAsset[]>(fallbackFurniture);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [selected, setSelected] = useState<FurnitureAsset | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [allocateTarget, setAllocateTarget] = useState<FurnitureAsset | null>(null);
  const [addForm, setAddForm] = useState({ item: '', brand: '', cost: '', location: '', category: 'chair' as FurnitureAsset['category'] });
  const [allocForm, setAllocForm] = useState({ employeeName: '', employeeCode: '', department: '' });
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    setSaving(true);
    setLoadError(null);
    try {
      const asset = await AssetManagementService.createAsset({
        assetName: addForm.item,
        brand: addForm.brand,
        purchasePrice: Number(addForm.cost) || undefined,
        location: addForm.location,
      });
      const newRow: FurnitureAsset = {
        id: asset?.id || Date.now().toString(),
        assetTag: asset?.assetCode || '',
        item: addForm.item,
        category: addForm.category,
        brand: addForm.brand,
        purchaseDate: new Date().toISOString().split('T')[0],
        cost: Number(addForm.cost) || 0,
        status: 'available',
        condition: 'good',
        location: addForm.location,
      };
      setMockFurniture((prev) => [newRow, ...prev]);
      setShowAdd(false);
      setAddForm({ item: '', brand: '', cost: '', location: '', category: 'chair' });
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to add furniture');
    } finally {
      setSaving(false);
    }
  };

  const handleAllocate = async () => {
    if (!allocateTarget) return;
    setSaving(true);
    setLoadError(null);
    try {
      await AssetManagementService.allocateAsset({
        assetId: allocateTarget.id,
        employeeName: allocForm.employeeName,
        employeeCode: allocForm.employeeCode,
        department: allocForm.department,
        allocationType: 'permanent',
      });
      setMockFurniture((prev) =>
        prev.map((f) =>
          f.id === allocateTarget.id
            ? {
                ...f,
                status: 'allocated',
                assignedTo: allocForm.employeeName,
                employeeCode: allocForm.employeeCode,
                department: allocForm.department,
              }
            : f,
        ),
      );
      setAllocateTarget(null);
      setAllocForm({ employeeName: '', employeeCode: '', department: '' });
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to allocate furniture');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const rows = await HrAssetsService.getAssetItems('furniture');
        if (cancelled) return;
        if (rows.length) {
          setMockFurniture(
            rows.map((r) => ({
              id: r.id,
              assetTag: r.assetTag || '',
              item: r.item || '',
              category: (r.category as FurnitureAsset['category']) || 'other',
              brand: r.brand || '',
              purchaseDate: r.purchaseDate || '',
              cost: Number(r.cost ?? 0),
              status: (r.status as FurnitureAsset['status']) || 'available',
              condition: (r.condition as FurnitureAsset['condition']) || 'good',
              assignedTo: r.assignedTo || undefined,
              employeeCode: r.employeeCode || undefined,
              department: r.department || undefined,
              location: r.location || '',
            })),
          );
        }
      } catch (err) {
        if (!cancelled)
          setLoadError(err instanceof Error ? err.message : 'Failed to load furniture');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredFurniture = mockFurniture.filter(f => {
    if (selectedStatus !== 'all' && f.status !== selectedStatus) return false;
    if (selectedCategory !== 'all' && f.category !== selectedCategory) return false;
    return true;
  });

  const stats = useMemo(() => ({
    total: mockFurniture.length,
    allocated: mockFurniture.filter(f => f.status === 'allocated').length,
    available: mockFurniture.filter(f => f.status === 'available').length,
    totalValue: mockFurniture.reduce((sum, f) => sum + f.cost, 0)
  }), [mockFurniture]);

  const statusColors = {
    available: 'bg-green-100 text-green-700',
    allocated: 'bg-blue-100 text-blue-700',
    maintenance: 'bg-orange-100 text-orange-700',
    retired: 'bg-gray-100 text-gray-700'
  };

  const categoryColors = {
    desk: 'bg-blue-100 text-blue-700',
    chair: 'bg-purple-100 text-purple-700',
    cabinet: 'bg-green-100 text-green-700',
    table: 'bg-orange-100 text-orange-700',
    storage: 'bg-yellow-100 text-yellow-700',
    other: 'bg-gray-100 text-gray-700'
  };

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900">Office Furniture</h1>
        <p className="text-sm text-gray-600 mt-1">Manage office furniture inventory and allocation</p>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading furniture…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {loadError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <p className="text-sm font-medium text-blue-600">Total Items</p>
          <p className="text-2xl font-bold text-blue-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <p className="text-sm font-medium text-blue-600">Allocated</p>
          <p className="text-2xl font-bold text-blue-900 mt-1">{stats.allocated}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <p className="text-sm font-medium text-green-600">Available</p>
          <p className="text-2xl font-bold text-green-900 mt-1">{stats.available}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <p className="text-sm font-medium text-purple-600">Total Value</p>
          <p className="text-2xl font-bold text-purple-900 mt-1">₹{(stats.totalValue / 100000).toFixed(2)}L</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="allocated">Allocated</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">All Categories</option>
              <option value="desk">Desk</option>
              <option value="chair">Chair</option>
              <option value="cabinet">Cabinet</option>
              <option value="table">Table</option>
              <option value="storage">Storage</option>
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={() => setShowAdd(true)} className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm">
              Add Furniture
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {filteredFurniture.map(furniture => (
          <div key={furniture.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-12 w-12 bg-orange-50 rounded-lg flex items-center justify-center">
                    <Armchair className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{furniture.item}</h3>
                    <p className="text-sm text-gray-600">Asset: {furniture.assetTag} • {furniture.brand}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs font-semibold rounded ${categoryColors[furniture.category]}`}>
                    {furniture.category.charAt(0).toUpperCase() + furniture.category.slice(1)}
                  </span>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColors[furniture.status]}`}>
                    {furniture.status.charAt(0).toUpperCase() + furniture.status.slice(1)}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Purchase Cost</p>
                <p className="text-2xl font-bold text-blue-600">₹{furniture.cost.toLocaleString('en-IN')}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-2 py-4 border-y border-gray-200">
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Purchase Date</p>
                <p className="text-sm font-semibold text-gray-900">{new Date(furniture.purchaseDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Condition</p>
                <p className="text-sm font-semibold text-gray-900">{furniture.condition.charAt(0).toUpperCase() + furniture.condition.slice(1)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1 flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  Location
                </p>
                <p className="text-sm font-semibold text-gray-900">{furniture.location}</p>
              </div>
            </div>

            {furniture.assignedTo && (
              <div className="bg-blue-50 rounded-lg p-3 mb-2">
                <p className="text-xs text-blue-600 uppercase font-medium mb-1">Assigned To</p>
                <p className="text-sm font-semibold text-blue-900 flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {furniture.assignedTo} {furniture.employeeCode && `• ${furniture.employeeCode}`} {furniture.department && `• ${furniture.department}`}
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <button onClick={() => setSelected(furniture)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm">
                View Details
              </button>
              {furniture.status === 'available' && (
                <button onClick={() => setAllocateTarget(furniture)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm">
                  Allocate
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-5 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-900 mb-3">{selected.item}</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-xs text-gray-500 uppercase font-medium">Asset Tag</p><p className="font-semibold text-gray-900">{selected.assetTag || '—'}</p></div>
              <div><p className="text-xs text-gray-500 uppercase font-medium">Brand</p><p className="font-semibold text-gray-900">{selected.brand || '—'}</p></div>
              <div><p className="text-xs text-gray-500 uppercase font-medium">Category</p><p className="font-semibold text-gray-900">{selected.category}</p></div>
              <div><p className="text-xs text-gray-500 uppercase font-medium">Status</p><p className="font-semibold text-gray-900">{selected.status}</p></div>
              <div><p className="text-xs text-gray-500 uppercase font-medium">Condition</p><p className="font-semibold text-gray-900">{selected.condition}</p></div>
              <div><p className="text-xs text-gray-500 uppercase font-medium">Cost</p><p className="font-semibold text-gray-900">₹{selected.cost.toLocaleString('en-IN')}</p></div>
              <div><p className="text-xs text-gray-500 uppercase font-medium">Purchase Date</p><p className="font-semibold text-gray-900">{selected.purchaseDate || '—'}</p></div>
              <div><p className="text-xs text-gray-500 uppercase font-medium">Location</p><p className="font-semibold text-gray-900">{selected.location || '—'}</p></div>
              {selected.assignedTo && <div><p className="text-xs text-gray-500 uppercase font-medium">Assigned To</p><p className="font-semibold text-gray-900">{selected.assignedTo}</p></div>}
              {selected.employeeCode && <div><p className="text-xs text-gray-500 uppercase font-medium">Employee Code</p><p className="font-semibold text-gray-900">{selected.employeeCode}</p></div>}
              {selected.department && <div><p className="text-xs text-gray-500 uppercase font-medium">Department</p><p className="font-semibold text-gray-900">{selected.department}</p></div>}
            </div>
            <div className="flex justify-end mt-4">
              <button onClick={() => setSelected(null)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm">Close</button>
            </div>
          </div>
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowAdd(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-5 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Add Furniture</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item</label>
                <input type="text" value={addForm.item} onChange={(e) => setAddForm({ ...addForm, item: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                <input type="text" value={addForm.brand} onChange={(e) => setAddForm({ ...addForm, brand: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cost</label>
                <input type="number" value={addForm.cost} onChange={(e) => setAddForm({ ...addForm, cost: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input type="text" value={addForm.location} onChange={(e) => setAddForm({ ...addForm, location: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select value={addForm.category} onChange={(e) => setAddForm({ ...addForm, category: e.target.value as FurnitureAsset['category'] })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                  <option value="desk">Desk</option>
                  <option value="chair">Chair</option>
                  <option value="cabinet">Cabinet</option>
                  <option value="table">Table</option>
                  <option value="storage">Storage</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowAdd(false)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm">Cancel</button>
              <button onClick={handleAdd} disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm disabled:opacity-50">Save</button>
            </div>
          </div>
        </div>
      )}

      {allocateTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setAllocateTarget(null)}>
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-5 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Allocate {allocateTarget.item}</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee Name</label>
                <input type="text" value={allocForm.employeeName} onChange={(e) => setAllocForm({ ...allocForm, employeeName: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee Code</label>
                <input type="text" value={allocForm.employeeCode} onChange={(e) => setAllocForm({ ...allocForm, employeeCode: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <input type="text" value={allocForm.department} onChange={(e) => setAllocForm({ ...allocForm, department: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setAllocateTarget(null)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm">Cancel</button>
              <button onClick={handleAllocate} disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm disabled:opacity-50">Allocate</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
