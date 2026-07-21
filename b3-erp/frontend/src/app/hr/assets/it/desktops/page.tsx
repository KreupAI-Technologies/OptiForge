'use client';

import { useState, useMemo, useEffect } from 'react';
import { Monitor, User, Calendar, CheckCircle } from 'lucide-react';
import { HrAssetsService } from '@/services/hr-assets.service';
import { AssetManagementService } from '@/services/asset-management.service';

interface DesktopAsset {
  id: string;
  assetTag: string;
  brand: string;
  model: string;
  serialNumber: string;
  processor: string;
  ram: string;
  storage: string;
  purchaseDate: string;
  warranty: string;
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

  const fallbackDesktops: DesktopAsset[] = [
    {
      id: '1',
      assetTag: 'DESK-2024-001',
      brand: 'HP',
      model: 'Elite 800 G8',
      serialNumber: 'HP800-2024-001',
      processor: 'Intel Core i7 11th Gen',
      ram: '32GB DDR4',
      storage: '1TB SSD',
      purchaseDate: '2024-01-20',
      warranty: '2027-01-20',
      cost: 75000,
      status: 'allocated',
      condition: 'excellent',
      assignedTo: 'Sneha Reddy',
      employeeCode: 'EMP523',
      department: 'HR',
      location: 'Hyderabad Office'
    },
    {
      id: '2',
      assetTag: 'DESK-2024-002',
      brand: 'Dell',
      model: 'OptiPlex 7090',
      serialNumber: 'DL7090-2024-002',
      processor: 'Intel Core i5 11th Gen',
      ram: '16GB DDR4',
      storage: '512GB SSD',
      purchaseDate: '2024-02-15',
      warranty: '2027-02-15',
      cost: 60000,
      status: 'available',
      condition: 'excellent',
      location: 'IT Store'
    },
    {
      id: '3',
      assetTag: 'DESK-2023-089',
      brand: 'Lenovo',
      model: 'ThinkCentre M90',
      serialNumber: 'LN-M90-2023-089',
      processor: 'Intel Core i7 10th Gen',
      ram: '16GB DDR4',
      storage: '512GB SSD',
      purchaseDate: '2023-06-10',
      warranty: '2026-06-10',
      cost: 65000,
      status: 'allocated',
      condition: 'good',
      assignedTo: 'Vikram Singh',
      employeeCode: 'EMP198',
      department: 'IT',
      location: 'Pune Office'
    }
  ];

  const [mockDesktops, setMockDesktops] = useState<DesktopAsset[]>(fallbackDesktops);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [addForm, setAddForm] = useState({ brand: '', model: '', serialNumber: '', cost: '', location: '' });

  const handleAdd = async () => {
    setSaving(true);
    setLoadError(null);
    try {
      const asset = await AssetManagementService.createAsset({
        assetName: `${addForm.brand} ${addForm.model}`.trim() || 'Desktop',
        brand: addForm.brand,
        model: addForm.model,
        serialNumber: addForm.serialNumber,
        purchasePrice: Number(addForm.cost) || undefined,
        location: addForm.location,
      });
      const newRow: DesktopAsset = {
        id: asset?.id || Date.now().toString(),
        assetTag: asset?.assetTag || asset?.assetCode || '',
        brand: addForm.brand,
        model: addForm.model,
        serialNumber: addForm.serialNumber,
        processor: '',
        ram: '',
        storage: '',
        purchaseDate: new Date().toISOString().split('T')[0],
        warranty: '',
        cost: Number(addForm.cost) || 0,
        status: 'available',
        condition: 'good',
        location: addForm.location,
      };
      setMockDesktops((prev) => [newRow, ...prev]);
      setShowAdd(false);
      setAddForm({ brand: '', model: '', serialNumber: '', cost: '', location: '' });
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to add desktop');
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
        const rows = await HrAssetsService.getAssetItems('desktop');
        if (cancelled) return;
        if (rows.length) {
          setMockDesktops(
            rows.map((r) => ({
              id: r.id,
              assetTag: r.assetTag || '',
              brand: r.brand || '',
              model: r.model || '',
              serialNumber: r.serialNumber || '',
              processor: r.processor || '',
              ram: r.ram || '',
              storage: r.storage || '',
              purchaseDate: r.purchaseDate || '',
              warranty: r.warranty || '',
              cost: Number(r.cost ?? 0),
              status: (r.status as DesktopAsset['status']) || 'available',
              condition: (r.condition as DesktopAsset['condition']) || 'good',
              assignedTo: r.assignedTo || undefined,
              employeeCode: r.employeeCode || undefined,
              department: r.department || undefined,
              location: r.location || '',
            })),
          );
        }
      } catch (err) {
        if (!cancelled)
          setLoadError(err instanceof Error ? err.message : 'Failed to load desktops');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredDesktops = mockDesktops.filter(d => selectedStatus === 'all' || d.status === selectedStatus);

  const stats = useMemo(() => ({
    total: mockDesktops.length,
    allocated: mockDesktops.filter(d => d.status === 'allocated').length,
    available: mockDesktops.filter(d => d.status === 'available').length,
    maintenance: mockDesktops.filter(d => d.status === 'maintenance').length
  }), [mockDesktops]);

  const statusColors = {
    available: 'bg-green-100 text-green-700',
    allocated: 'bg-blue-100 text-blue-700',
    maintenance: 'bg-orange-100 text-orange-700',
    retired: 'bg-gray-100 text-gray-700'
  };

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900">Desktop Assets</h1>
        <p className="text-sm text-gray-600 mt-1">Manage and track desktop inventory</p>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading desktops…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {loadError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <p className="text-sm font-medium text-blue-600">Total Desktops</p>
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
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
          <p className="text-sm font-medium text-orange-600">In Maintenance</p>
          <p className="text-2xl font-bold text-orange-900 mt-1">{stats.maintenance}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="allocated">Allocated</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={() => setShowAdd(true)} className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm">
              Add Desktop
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {filteredDesktops.map(desktop => (
          <div key={desktop.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-12 w-12 bg-indigo-50 rounded-lg flex items-center justify-center">
                    <Monitor className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{desktop.brand} {desktop.model}</h3>
                    <p className="text-sm text-gray-600">Asset Tag: {desktop.assetTag} • S/N: {desktop.serialNumber}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColors[desktop.status]}`}>
                  {desktop.status.charAt(0).toUpperCase() + desktop.status.slice(1)}
                </span>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Purchase Cost</p>
                <p className="text-2xl font-bold text-blue-600">₹{desktop.cost.toLocaleString('en-IN')}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2 py-4 border-y border-gray-200">
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Processor</p>
                <p className="text-sm font-semibold text-gray-900">{desktop.processor}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">RAM</p>
                <p className="text-sm font-semibold text-gray-900">{desktop.ram}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Storage</p>
                <p className="text-sm font-semibold text-gray-900">{desktop.storage}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Location</p>
                <p className="text-sm font-semibold text-gray-900">{desktop.location}</p>
              </div>
            </div>

            {desktop.assignedTo && (
              <div className="bg-blue-50 rounded-lg p-3 mb-2">
                <p className="text-xs text-blue-600 uppercase font-medium mb-1">Assigned To</p>
                <p className="text-sm font-semibold text-blue-900 flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {desktop.assignedTo} • {desktop.employeeCode} • {desktop.department}
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm">
                View Details
              </button>
              {desktop.status === 'available' && (
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm">
                  Allocate
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowAdd(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-5 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Add Desktop</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                <input type="text" value={addForm.brand} onChange={(e) => setAddForm({ ...addForm, brand: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                <input type="text" value={addForm.model} onChange={(e) => setAddForm({ ...addForm, model: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number</label>
                <input type="text" value={addForm.serialNumber} onChange={(e) => setAddForm({ ...addForm, serialNumber: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cost</label>
                <input type="number" value={addForm.cost} onChange={(e) => setAddForm({ ...addForm, cost: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input type="text" value={addForm.location} onChange={(e) => setAddForm({ ...addForm, location: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowAdd(false)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm">Cancel</button>
              <button onClick={handleAdd} disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm disabled:opacity-50">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
