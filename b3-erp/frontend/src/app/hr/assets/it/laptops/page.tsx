'use client';

import { useState, useMemo, useEffect } from 'react';
import { Laptop, User, Calendar, Package, IndianRupee, CheckCircle, AlertCircle } from 'lucide-react';
import { HrAssetsService } from '@/services/hr-assets.service';

interface LaptopAsset {
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
  const [selectedBrand, setSelectedBrand] = useState('all');

  const fallbackLaptops: LaptopAsset[] = [
    {
      id: '1',
      assetTag: 'LAP-2024-001',
      brand: 'Dell',
      model: 'Latitude 5420',
      serialNumber: 'DL5420-2024-001',
      processor: 'Intel Core i5 11th Gen',
      ram: '16GB DDR4',
      storage: '512GB SSD',
      purchaseDate: '2024-01-15',
      warranty: '2027-01-15',
      cost: 65000,
      status: 'allocated',
      condition: 'excellent',
      assignedTo: 'Rajesh Kumar',
      employeeCode: 'EMP345',
      department: 'Sales',
      location: 'Mumbai Office'
    },
    {
      id: '2',
      assetTag: 'LAP-2024-002',
      brand: 'HP',
      model: 'EliteBook 840',
      serialNumber: 'HP840-2024-002',
      processor: 'Intel Core i7 11th Gen',
      ram: '16GB DDR4',
      storage: '1TB SSD',
      purchaseDate: '2024-02-10',
      warranty: '2027-02-10',
      cost: 85000,
      status: 'allocated',
      condition: 'excellent',
      assignedTo: 'Priya Sharma',
      employeeCode: 'EMP412',
      department: 'Marketing',
      location: 'Delhi Office'
    },
    {
      id: '3',
      assetTag: 'LAP-2023-125',
      brand: 'Lenovo',
      model: 'ThinkPad T14',
      serialNumber: 'LN-T14-2023-125',
      processor: 'AMD Ryzen 5',
      ram: '16GB DDR4',
      storage: '512GB SSD',
      purchaseDate: '2023-08-20',
      warranty: '2026-08-20',
      cost: 72000,
      status: 'maintenance',
      condition: 'good',
      location: 'Service Center'
    },
    {
      id: '4',
      assetTag: 'LAP-2024-003',
      brand: 'Dell',
      model: 'Latitude 5420',
      serialNumber: 'DL5420-2024-003',
      processor: 'Intel Core i5 11th Gen',
      ram: '16GB DDR4',
      storage: '512GB SSD',
      purchaseDate: '2024-03-15',
      warranty: '2027-03-15',
      cost: 65000,
      status: 'available',
      condition: 'excellent',
      location: 'IT Store'
    },
    {
      id: '5',
      assetTag: 'LAP-2022-089',
      brand: 'HP',
      model: 'ProBook 450',
      serialNumber: 'HP450-2022-089',
      processor: 'Intel Core i5 10th Gen',
      ram: '8GB DDR4',
      storage: '256GB SSD',
      purchaseDate: '2022-06-10',
      warranty: '2025-06-10',
      cost: 45000,
      status: 'retired',
      condition: 'fair',
      location: 'Disposal Yard'
    }
  ];

  const [mockLaptops, setMockLaptops] = useState<LaptopAsset[]>(fallbackLaptops);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const rows = await HrAssetsService.getAssetItems('laptop');
        if (cancelled) return;
        if (rows.length) {
          setMockLaptops(
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
              status: (r.status as LaptopAsset['status']) || 'available',
              condition: (r.condition as LaptopAsset['condition']) || 'good',
              assignedTo: r.assignedTo || undefined,
              employeeCode: r.employeeCode || undefined,
              department: r.department || undefined,
              location: r.location || '',
            })),
          );
        }
      } catch (err) {
        if (!cancelled)
          setLoadError(err instanceof Error ? err.message : 'Failed to load laptops');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredLaptops = mockLaptops.filter(l => {
    const statusMatch = selectedStatus === 'all' || l.status === selectedStatus;
    const brandMatch = selectedBrand === 'all' || l.brand === selectedBrand;
    return statusMatch && brandMatch;
  });

  const stats = useMemo(() => ({
    total: mockLaptops.length,
    allocated: mockLaptops.filter(l => l.status === 'allocated').length,
    available: mockLaptops.filter(l => l.status === 'available').length,
    maintenance: mockLaptops.filter(l => l.status === 'maintenance').length
  }), [mockLaptops]);

  const statusColors = {
    available: 'bg-green-100 text-green-700',
    allocated: 'bg-blue-100 text-blue-700',
    maintenance: 'bg-orange-100 text-orange-700',
    retired: 'bg-gray-100 text-gray-700'
  };

  const conditionColors = {
    excellent: 'text-green-600',
    good: 'text-blue-600',
    fair: 'text-orange-600',
    poor: 'text-red-600'
  };

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900">Laptop Assets</h1>
        <p className="text-sm text-gray-600 mt-1">Manage and track laptop inventory</p>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading laptops…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <p className="text-sm font-medium text-blue-600">Total Laptops</p>
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

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="allocated">Allocated</option>
              <option value="maintenance">Maintenance</option>
              <option value="retired">Retired</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
            <select value={selectedBrand} onChange={(e) => setSelectedBrand(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">All Brands</option>
              <option value="Dell">Dell</option>
              <option value="HP">HP</option>
              <option value="Lenovo">Lenovo</option>
            </select>
          </div>
          <div className="flex items-end">
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm">
              Add Laptop
            </button>
          </div>
        </div>
      </div>

      {/* Laptops List */}
      <div className="space-y-2">
        {filteredLaptops.map(laptop => (
          <div key={laptop.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-12 w-12 bg-indigo-50 rounded-lg flex items-center justify-center">
                    <Laptop className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{laptop.brand} {laptop.model}</h3>
                    <p className="text-sm text-gray-600">Asset Tag: {laptop.assetTag} • S/N: {laptop.serialNumber}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColors[laptop.status]}`}>
                    {laptop.status.charAt(0).toUpperCase() + laptop.status.slice(1)}
                  </span>
                  <span className={`font-semibold ${conditionColors[laptop.condition]}`}>
                    {laptop.condition.charAt(0).toUpperCase() + laptop.condition.slice(1)} Condition
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Purchase Cost</p>
                <p className="text-2xl font-bold text-blue-600">₹{laptop.cost.toLocaleString('en-IN')}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2 py-4 border-y border-gray-200">
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Processor</p>
                <p className="text-sm font-semibold text-gray-900">{laptop.processor}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">RAM</p>
                <p className="text-sm font-semibold text-gray-900">{laptop.ram}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Storage</p>
                <p className="text-sm font-semibold text-gray-900">{laptop.storage}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Location</p>
                <p className="text-sm font-semibold text-gray-900">{laptop.location}</p>
              </div>
            </div>

            {laptop.assignedTo && (
              <div className="bg-blue-50 rounded-lg p-3 mb-2">
                <p className="text-xs text-blue-600 uppercase font-medium mb-1">Assigned To</p>
                <p className="text-sm font-semibold text-blue-900 flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {laptop.assignedTo} • {laptop.employeeCode} • {laptop.department}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 mb-2">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Purchase Date</p>
                <p className="text-sm text-gray-700 flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(laptop.purchaseDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Warranty Until</p>
                <p className="text-sm text-gray-700 flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  {new Date(laptop.warranty).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm">
                View Details
              </button>
              {laptop.status === 'available' && (
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm">
                  Allocate
                </button>
              )}
              {laptop.status === 'allocated' && (
                <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium text-sm">
                  Return
                </button>
              )}
              {laptop.status === 'maintenance' && (
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm">
                  Mark Repaired
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
