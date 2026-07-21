'use client';

import { useState, useMemo, useEffect } from 'react';
import { Smartphone, User } from 'lucide-react';
import { HrAssetsService } from '@/services/hr-assets.service';
import { AssetManagementService } from '@/services/asset-management.service';

interface MobileAsset {
  id: string;
  assetTag: string;
  brand: string;
  model: string;
  imei: string;
  simNumber?: string;
  os: string;
  storage: string;
  purchaseDate: string;
  cost: number;
  status: 'available' | 'allocated' | 'maintenance' | 'lost';
  assignedTo?: string;
  employeeCode?: string;
  department?: string;
  location: string;
}

export default function Page() {
  const [selectedStatus, setSelectedStatus] = useState('all');

  const fallbackMobiles: MobileAsset[] = [
    {
      id: '1',
      assetTag: 'MOB-2024-001',
      brand: 'Samsung',
      model: 'Galaxy S21',
      imei: '352345678901234',
      simNumber: '9876543210',
      os: 'Android 13',
      storage: '128GB',
      purchaseDate: '2024-01-10',
      cost: 45000,
      status: 'allocated',
      assignedTo: 'Arjun Kapoor',
      employeeCode: 'EMP890',
      department: 'Sales',
      location: 'Delhi Office'
    },
    {
      id: '2',
      assetTag: 'MOB-2024-002',
      brand: 'Apple',
      model: 'iPhone 13',
      imei: '352387654321098',
      simNumber: '9123456789',
      os: 'iOS 16',
      storage: '128GB',
      purchaseDate: '2024-02-05',
      cost: 65000,
      status: 'allocated',
      assignedTo: 'Rajesh Kumar',
      employeeCode: 'EMP345',
      department: 'Sales',
      location: 'Mumbai Office'
    },
    {
      id: '3',
      assetTag: 'MOB-2023-125',
      brand: 'Samsung',
      model: 'Galaxy M52',
      imei: '358912345678901',
      os: 'Android 12',
      storage: '64GB',
      purchaseDate: '2023-08-15',
      cost: 28000,
      status: 'available',
      location: 'IT Store'
    }
  ];

  const [mockMobiles, setMockMobiles] = useState<MobileAsset[]>(fallbackMobiles);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [addForm, setAddForm] = useState({ brand: '', model: '', imei: '', cost: '', location: '' });

  const handleAdd = async () => {
    setSaving(true);
    setLoadError(null);
    try {
      const asset = await AssetManagementService.createAsset({
        assetName: `${addForm.brand} ${addForm.model}`.trim() || 'Mobile',
        brand: addForm.brand,
        model: addForm.model,
        serialNumber: addForm.imei,
        purchasePrice: Number(addForm.cost) || undefined,
        location: addForm.location,
      });
      const newRow: MobileAsset = {
        id: asset?.id || Date.now().toString(),
        assetTag: asset?.assetTag || asset?.assetCode || '',
        brand: addForm.brand,
        model: addForm.model,
        imei: addForm.imei,
        os: '',
        storage: '',
        purchaseDate: new Date().toISOString().split('T')[0],
        cost: Number(addForm.cost) || 0,
        status: 'available',
        location: addForm.location,
      };
      setMockMobiles((prev) => [newRow, ...prev]);
      setShowAdd(false);
      setAddForm({ brand: '', model: '', imei: '', cost: '', location: '' });
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to add mobile');
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
        const rows = await HrAssetsService.getAssetItems('mobile');
        if (cancelled) return;
        if (rows.length) {
          setMockMobiles(
            rows.map((r) => ({
              id: r.id,
              assetTag: r.assetTag || '',
              brand: r.brand || '',
              model: r.model || '',
              imei: r.imei || '',
              simNumber: r.simNumber || undefined,
              os: r.os || '',
              storage: r.storage || '',
              purchaseDate: r.purchaseDate || '',
              cost: Number(r.cost ?? 0),
              status: (r.status as MobileAsset['status']) || 'available',
              assignedTo: r.assignedTo || undefined,
              employeeCode: r.employeeCode || undefined,
              department: r.department || undefined,
              location: r.location || '',
            })),
          );
        }
      } catch (err) {
        if (!cancelled)
          setLoadError(err instanceof Error ? err.message : 'Failed to load mobiles');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredMobiles = mockMobiles.filter(m => selectedStatus === 'all' || m.status === selectedStatus);

  const stats = useMemo(() => ({
    total: mockMobiles.length,
    allocated: mockMobiles.filter(m => m.status === 'allocated').length,
    available: mockMobiles.filter(m => m.status === 'available').length
  }), [mockMobiles]);

  const statusColors = {
    available: 'bg-green-100 text-green-700',
    allocated: 'bg-blue-100 text-blue-700',
    maintenance: 'bg-orange-100 text-orange-700',
    lost: 'bg-red-100 text-red-700'
  };

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900">Mobile Assets</h1>
        <p className="text-sm text-gray-600 mt-1">Manage and track mobile device inventory</p>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading mobiles…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {loadError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <p className="text-sm font-medium text-blue-600">Total Mobiles</p>
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
              Add Mobile
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {filteredMobiles.map(mobile => (
          <div key={mobile.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-12 w-12 bg-green-50 rounded-lg flex items-center justify-center">
                    <Smartphone className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{mobile.brand} {mobile.model}</h3>
                    <p className="text-sm text-gray-600">Asset Tag: {mobile.assetTag} • IMEI: {mobile.imei}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColors[mobile.status]}`}>
                  {mobile.status.charAt(0).toUpperCase() + mobile.status.slice(1)}
                </span>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Purchase Cost</p>
                <p className="text-2xl font-bold text-blue-600">₹{mobile.cost.toLocaleString('en-IN')}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2 py-4 border-y border-gray-200">
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">OS</p>
                <p className="text-sm font-semibold text-gray-900">{mobile.os}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Storage</p>
                <p className="text-sm font-semibold text-gray-900">{mobile.storage}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">SIM Number</p>
                <p className="text-sm font-semibold text-gray-900">{mobile.simNumber || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Location</p>
                <p className="text-sm font-semibold text-gray-900">{mobile.location}</p>
              </div>
            </div>

            {mobile.assignedTo && (
              <div className="bg-blue-50 rounded-lg p-3 mb-2">
                <p className="text-xs text-blue-600 uppercase font-medium mb-1">Assigned To</p>
                <p className="text-sm font-semibold text-blue-900 flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {mobile.assignedTo} • {mobile.employeeCode} • {mobile.department}
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm">
                View Details
              </button>
              {mobile.status === 'available' && (
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
            <h2 className="text-lg font-bold text-gray-900 mb-3">Add Mobile</h2>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">IMEI</label>
                <input type="text" value={addForm.imei} onChange={(e) => setAddForm({ ...addForm, imei: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
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
