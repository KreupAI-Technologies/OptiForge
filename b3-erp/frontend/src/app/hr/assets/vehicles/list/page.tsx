'use client';

import { useState, useMemo, useEffect } from 'react';
import { Car, Calendar, Gauge } from 'lucide-react';
import { HrAssetsService } from '@/services/hr-assets.service';

interface Vehicle {
  id: string;
  vehicleNumber: string;
  vehicleType: 'sedan' | 'suv' | 'hatchback' | 'van' | 'truck';
  make: string;
  model: string;
  year: number;
  purchaseDate: string;
  purchaseCost: number;
  registrationNumber: string;
  insuranceExpiry: string;
  pucExpiry: string;
  fitnessExpiry: string;
  currentOdometer: number;
  fuelType: 'petrol' | 'diesel' | 'cng' | 'electric';
  status: 'available' | 'assigned' | 'maintenance' | 'retired';
  assignedTo?: string;
  location: string;
}

export default function Page() {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  const fallbackVehicles: Vehicle[] = [
    {
      id: '1',
      vehicleNumber: 'VEH-2024-001',
      vehicleType: 'sedan',
      make: 'Maruti Suzuki',
      model: 'Dzire',
      year: 2024,
      purchaseDate: '2024-01-15',
      purchaseCost: 950000,
      registrationNumber: 'MH-02-BX-1234',
      insuranceExpiry: '2025-01-15',
      pucExpiry: '2025-01-15',
      fitnessExpiry: '2029-01-15',
      currentOdometer: 12500,
      fuelType: 'petrol',
      status: 'assigned',
      assignedTo: 'Rajesh Kumar (EMP345)',
      location: 'Mumbai Office'
    },
    {
      id: '2',
      vehicleNumber: 'VEH-2024-002',
      vehicleType: 'suv',
      make: 'Mahindra',
      model: 'XUV700',
      year: 2024,
      purchaseDate: '2024-02-20',
      purchaseCost: 2200000,
      registrationNumber: 'DL-3C-AB-5678',
      insuranceExpiry: '2025-02-20',
      pucExpiry: '2025-02-20',
      fitnessExpiry: '2029-02-20',
      currentOdometer: 8200,
      fuelType: 'diesel',
      status: 'assigned',
      assignedTo: 'Sales Team',
      location: 'Delhi Office'
    },
    {
      id: '3',
      vehicleNumber: 'VEH-2023-015',
      vehicleType: 'hatchback',
      make: 'Hyundai',
      model: 'i20',
      year: 2023,
      purchaseDate: '2023-06-10',
      purchaseCost: 850000,
      registrationNumber: 'KA-03-MN-9012',
      insuranceExpiry: '2025-06-10',
      pucExpiry: '2024-12-10',
      fitnessExpiry: '2028-06-10',
      currentOdometer: 25400,
      fuelType: 'petrol',
      status: 'available',
      location: 'Bangalore Office'
    },
    {
      id: '4',
      vehicleNumber: 'VEH-2024-003',
      vehicleType: 'van',
      make: 'Tata',
      model: 'Winger',
      year: 2024,
      purchaseDate: '2024-03-15',
      purchaseCost: 1650000,
      registrationNumber: 'MH-12-DE-3456',
      insuranceExpiry: '2025-03-15',
      pucExpiry: '2025-03-15',
      fitnessExpiry: '2029-03-15',
      currentOdometer: 6800,
      fuelType: 'diesel',
      status: 'assigned',
      assignedTo: 'Operations Team',
      location: 'Pune Office'
    },
    {
      id: '5',
      vehicleNumber: 'VEH-2022-008',
      vehicleType: 'sedan',
      make: 'Honda',
      model: 'City',
      year: 2022,
      purchaseDate: '2022-08-20',
      purchaseCost: 1200000,
      registrationNumber: 'TS-09-FG-7890',
      insuranceExpiry: '2024-11-20',
      pucExpiry: '2024-11-20',
      fitnessExpiry: '2027-08-20',
      currentOdometer: 45600,
      fuelType: 'petrol',
      status: 'maintenance',
      location: 'Hyderabad Office'
    }
  ];

  const [mockVehicles, setMockVehicles] = useState<Vehicle[]>(fallbackVehicles);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const rows = await HrAssetsService.getVehicles();
        if (cancelled) return;
        if (rows.length) {
          setMockVehicles(
            rows.map((r) => ({
              id: r.id,
              vehicleNumber: r.vehicleNumber || '',
              vehicleType: (r.vehicleType as Vehicle['vehicleType']) || 'sedan',
              make: r.make || '',
              model: r.model || '',
              year: Number(r.year ?? 0),
              purchaseDate: r.purchaseDate || '',
              purchaseCost: Number(r.purchaseCost ?? 0),
              registrationNumber: r.registrationNumber || '',
              insuranceExpiry: r.insuranceExpiry || '',
              pucExpiry: r.pucExpiry || '',
              fitnessExpiry: r.fitnessExpiry || '',
              currentOdometer: Number(r.currentOdometer ?? 0),
              fuelType: (r.fuelType as Vehicle['fuelType']) || 'petrol',
              status: (r.status as Vehicle['status']) || 'available',
              assignedTo: r.assignedTo || undefined,
              location: r.location || '',
            })),
          );
        }
      } catch (err) {
        if (!cancelled)
          setLoadError(err instanceof Error ? err.message : 'Failed to load vehicles');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredVehicles = mockVehicles.filter(v => {
    if (selectedStatus !== 'all' && v.status !== selectedStatus) return false;
    if (selectedType !== 'all' && v.vehicleType !== selectedType) return false;
    return true;
  });

  const stats = useMemo(() => ({
    total: mockVehicles.length,
    assigned: mockVehicles.filter(v => v.status === 'assigned').length,
    available: mockVehicles.filter(v => v.status === 'available').length,
    maintenance: mockVehicles.filter(v => v.status === 'maintenance').length,
    totalValue: mockVehicles.reduce((sum, v) => sum + v.purchaseCost, 0)
  }), [mockVehicles]);

  const statusColors = {
    available: 'bg-green-100 text-green-700',
    assigned: 'bg-blue-100 text-blue-700',
    maintenance: 'bg-orange-100 text-orange-700',
    retired: 'bg-gray-100 text-gray-700'
  };

  const typeColors = {
    sedan: 'bg-blue-100 text-blue-700',
    suv: 'bg-purple-100 text-purple-700',
    hatchback: 'bg-green-100 text-green-700',
    van: 'bg-orange-100 text-orange-700',
    truck: 'bg-red-100 text-red-700'
  };

  const getDaysUntilExpiry = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900">Company Vehicles</h1>
        <p className="text-sm text-gray-600 mt-1">Manage company vehicle inventory</p>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading vehicles…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {loadError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <p className="text-sm font-medium text-blue-600">Total Vehicles</p>
          <p className="text-2xl font-bold text-blue-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <p className="text-sm font-medium text-blue-600">Assigned</p>
          <p className="text-2xl font-bold text-blue-900 mt-1">{stats.assigned}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <p className="text-sm font-medium text-green-600">Available</p>
          <p className="text-2xl font-bold text-green-900 mt-1">{stats.available}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
          <p className="text-sm font-medium text-orange-600">Maintenance</p>
          <p className="text-2xl font-bold text-orange-900 mt-1">{stats.maintenance}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <p className="text-sm font-medium text-purple-600">Fleet Value</p>
          <p className="text-2xl font-bold text-purple-900 mt-1">₹{(stats.totalValue / 10000000).toFixed(2)}Cr</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="assigned">Assigned</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
            <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">All Types</option>
              <option value="sedan">Sedan</option>
              <option value="suv">SUV</option>
              <option value="hatchback">Hatchback</option>
              <option value="van">Van</option>
            </select>
          </div>
          <div className="flex items-end">
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm">
              Add Vehicle
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {filteredVehicles.map(vehicle => {
          const insuranceDays = getDaysUntilExpiry(vehicle.insuranceExpiry);
          const pucDays = getDaysUntilExpiry(vehicle.pucExpiry);
          const expiringSoon = insuranceDays <= 30 || pucDays <= 30;

          return (
            <div key={vehicle.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center">
                      <Car className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{vehicle.make} {vehicle.model}</h3>
                      <p className="text-sm text-gray-600">{vehicle.registrationNumber} • {vehicle.vehicleNumber}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded ${typeColors[vehicle.vehicleType]}`}>
                      {vehicle.vehicleType.charAt(0).toUpperCase() + vehicle.vehicleType.slice(1)}
                    </span>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColors[vehicle.status]}`}>
                      {vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1)}
                    </span>
                    <span className="px-2 py-1 text-xs font-semibold rounded bg-gray-100 text-gray-700">
                      {vehicle.fuelType.charAt(0).toUpperCase() + vehicle.fuelType.slice(1)}
                    </span>
                    <span className="px-2 py-1 text-xs font-semibold rounded bg-gray-100 text-gray-700">
                      {vehicle.year}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Purchase Value</p>
                  <p className="text-2xl font-bold text-blue-600">₹{(vehicle.purchaseCost / 100000).toFixed(2)}L</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2 py-4 border-y border-gray-200">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Odometer</p>
                  <p className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                    <Gauge className="h-4 w-4 text-gray-500" />
                    {vehicle.currentOdometer.toLocaleString('en-IN')} km
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Purchase Date</p>
                  <p className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    {new Date(vehicle.purchaseDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Location</p>
                  <p className="text-sm font-semibold text-gray-900">{vehicle.location}</p>
                </div>
                {vehicle.assignedTo && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-medium mb-1">Assigned To</p>
                    <p className="text-sm font-semibold text-gray-900">{vehicle.assignedTo}</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 mb-2">
                <div className={`rounded-lg p-3 ${insuranceDays <= 30 ? 'bg-red-50 border border-red-200' : 'bg-green-50'}`}>
                  <p className={`text-xs uppercase font-medium mb-1 ${insuranceDays <= 30 ? 'text-red-600' : 'text-green-600'}`}>Insurance</p>
                  <p className={`text-sm font-semibold ${insuranceDays <= 30 ? 'text-red-700' : 'text-green-700'}`}>
                    {new Date(vehicle.insuranceExpiry).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                  {insuranceDays <= 30 && <p className="text-xs text-red-600 mt-1">{insuranceDays} days left</p>}
                </div>
                <div className={`rounded-lg p-3 ${pucDays <= 30 ? 'bg-red-50 border border-red-200' : 'bg-green-50'}`}>
                  <p className={`text-xs uppercase font-medium mb-1 ${pucDays <= 30 ? 'text-red-600' : 'text-green-600'}`}>PUC</p>
                  <p className={`text-sm font-semibold ${pucDays <= 30 ? 'text-red-700' : 'text-green-700'}`}>
                    {new Date(vehicle.pucExpiry).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                  {pucDays <= 30 && <p className="text-xs text-red-600 mt-1">{pucDays} days left</p>}
                </div>
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-xs text-blue-600 uppercase font-medium mb-1">Fitness</p>
                  <p className="text-sm font-semibold text-blue-700">
                    {new Date(vehicle.fitnessExpiry).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm">
                  View Details
                </button>
                {vehicle.status === 'available' && (
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm">
                    Assign Vehicle
                  </button>
                )}
                {expiringSoon && (
                  <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm">
                    Renew Documents
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
