'use client';

import { useState, useMemo, useEffect } from 'react';
import { Armchair, User, MapPin } from 'lucide-react';
import { HrAssetsService } from '@/services/hr-assets.service';

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
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm">
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
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm">
                View Details
              </button>
              {furniture.status === 'available' && (
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm">
                  Allocate
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
