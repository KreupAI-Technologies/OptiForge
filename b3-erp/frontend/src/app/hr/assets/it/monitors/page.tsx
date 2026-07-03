'use client';

import { useState, useMemo, useEffect } from 'react';
import { Monitor, User } from 'lucide-react';
import { HrAssetsService } from '@/services/hr-assets.service';

interface MonitorAsset {
  id: string;
  assetTag: string;
  brand: string;
  model: string;
  serialNumber: string;
  size: string;
  resolution: string;
  panelType: string;
  purchaseDate: string;
  cost: number;
  status: 'available' | 'allocated' | 'maintenance' | 'retired';
  assignedTo?: string;
  employeeCode?: string;
  department?: string;
  location: string;
}

export default function Page() {
  const [selectedStatus, setSelectedStatus] = useState('all');

  const fallbackMonitors: MonitorAsset[] = [
    {
      id: '1',
      assetTag: 'MON-2024-001',
      brand: 'Dell',
      model: 'P2422H',
      serialNumber: 'DLP2422-2024-001',
      size: '24 inch',
      resolution: '1920x1080 Full HD',
      panelType: 'IPS',
      purchaseDate: '2024-01-15',
      cost: 12000,
      status: 'allocated',
      assignedTo: 'Priya Sharma',
      employeeCode: 'EMP412',
      department: 'Marketing',
      location: 'Delhi Office'
    },
    {
      id: '2',
      assetTag: 'MON-2024-002',
      brand: 'LG',
      model: '27UL500',
      serialNumber: 'LG27-2024-002',
      size: '27 inch',
      resolution: '3840x2160 4K UHD',
      panelType: 'IPS',
      purchaseDate: '2024-02-10',
      cost: 28000,
      status: 'allocated',
      assignedTo: 'Vikram Singh',
      employeeCode: 'EMP198',
      department: 'IT',
      location: 'Pune Office'
    },
    {
      id: '3',
      assetTag: 'MON-2023-145',
      brand: 'HP',
      model: 'E24 G4',
      serialNumber: 'HPE24-2023-145',
      size: '24 inch',
      resolution: '1920x1080 Full HD',
      panelType: 'IPS',
      purchaseDate: '2023-06-20',
      cost: 11000,
      status: 'available',
      location: 'IT Store'
    }
  ];

  const [mockMonitors, setMockMonitors] = useState<MonitorAsset[]>(fallbackMonitors);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const rows = await HrAssetsService.getAssetItems('monitor');
        if (cancelled) return;
        if (rows.length) {
          setMockMonitors(
            rows.map((r) => ({
              id: r.id,
              assetTag: r.assetTag || '',
              brand: r.brand || '',
              model: r.model || '',
              serialNumber: r.serialNumber || '',
              size: r.screenSize || '',
              resolution: r.resolution || '',
              panelType: '',
              purchaseDate: r.purchaseDate || '',
              cost: Number(r.cost ?? 0),
              status: (r.status as MonitorAsset['status']) || 'available',
              assignedTo: r.assignedTo || undefined,
              employeeCode: r.employeeCode || undefined,
              department: r.department || undefined,
              location: r.location || '',
            })),
          );
        }
      } catch (err) {
        if (!cancelled)
          setLoadError(err instanceof Error ? err.message : 'Failed to load monitors');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredMonitors = mockMonitors.filter(m => selectedStatus === 'all' || m.status === selectedStatus);

  const stats = useMemo(() => ({
    total: mockMonitors.length,
    allocated: mockMonitors.filter(m => m.status === 'allocated').length,
    available: mockMonitors.filter(m => m.status === 'available').length
  }), [mockMonitors]);

  const statusColors = {
    available: 'bg-green-100 text-green-700',
    allocated: 'bg-blue-100 text-blue-700',
    maintenance: 'bg-orange-100 text-orange-700',
    retired: 'bg-gray-100 text-gray-700'
  };

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900">Monitor Assets</h1>
        <p className="text-sm text-gray-600 mt-1">Manage and track monitor inventory</p>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading monitors…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {loadError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <p className="text-sm font-medium text-blue-600">Total Monitors</p>
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
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm">
              Add Monitor
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {filteredMonitors.map(monitor => (
          <div key={monitor.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-12 w-12 bg-orange-50 rounded-lg flex items-center justify-center">
                    <Monitor className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{monitor.brand} {monitor.model}</h3>
                    <p className="text-sm text-gray-600">Asset Tag: {monitor.assetTag} • S/N: {monitor.serialNumber}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColors[monitor.status]}`}>
                  {monitor.status.charAt(0).toUpperCase() + monitor.status.slice(1)}
                </span>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Purchase Cost</p>
                <p className="text-2xl font-bold text-blue-600">₹{monitor.cost.toLocaleString('en-IN')}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2 py-4 border-y border-gray-200">
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Size</p>
                <p className="text-sm font-semibold text-gray-900">{monitor.size}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Resolution</p>
                <p className="text-sm font-semibold text-gray-900">{monitor.resolution}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Panel Type</p>
                <p className="text-sm font-semibold text-gray-900">{monitor.panelType}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Location</p>
                <p className="text-sm font-semibold text-gray-900">{monitor.location}</p>
              </div>
            </div>

            {monitor.assignedTo && (
              <div className="bg-blue-50 rounded-lg p-3 mb-2">
                <p className="text-xs text-blue-600 uppercase font-medium mb-1">Assigned To</p>
                <p className="text-sm font-semibold text-blue-900 flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {monitor.assignedTo} • {monitor.employeeCode} • {monitor.department}
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm">
                View Details
              </button>
              {monitor.status === 'available' && (
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
