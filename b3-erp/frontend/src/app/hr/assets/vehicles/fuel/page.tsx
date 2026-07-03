'use client';

import { useState, useMemo, useEffect } from 'react';
import { Fuel, Calendar, TrendingUp, IndianRupee } from 'lucide-react';
import { HrAssetsService } from '@/services/hr-assets.service';

interface FuelRecord {
  id: string;
  recordId: string;
  vehicleNumber: string;
  vehicleName: string;
  registrationNumber: string;
  fuelDate: string;
  fuelType: 'petrol' | 'diesel' | 'cng';
  quantity: number;
  pricePerLiter: number;
  totalCost: number;
  odometer: number;
  fuelStation: string;
  billNumber: string;
  filledBy: string;
  location: string;
  remarks?: string;
}

export default function Page() {
  const [selectedVehicle, setSelectedVehicle] = useState('all');
  const [selectedFuelType, setSelectedFuelType] = useState('all');

  const fallbackRecords: FuelRecord[] = [
    {
      id: '1',
      recordId: 'FUEL-2024-001',
      vehicleNumber: 'VEH-2024-001',
      vehicleName: 'Maruti Suzuki Dzire',
      registrationNumber: 'MH-02-BX-1234',
      fuelDate: '2024-10-25',
      fuelType: 'petrol',
      quantity: 35,
      pricePerLiter: 106.50,
      totalCost: 3727.50,
      odometer: 12500,
      fuelStation: 'Indian Oil - Andheri',
      billNumber: 'IO-2024-98765',
      filledBy: 'Rajesh Kumar',
      location: 'Mumbai'
    },
    {
      id: '2',
      recordId: 'FUEL-2024-002',
      vehicleNumber: 'VEH-2024-002',
      vehicleName: 'Mahindra XUV700',
      registrationNumber: 'DL-3C-AB-5678',
      fuelDate: '2024-10-24',
      fuelType: 'diesel',
      quantity: 50,
      pricePerLiter: 94.20,
      totalCost: 4710,
      odometer: 8200,
      fuelStation: 'HP Petrol Pump - Connaught Place',
      billNumber: 'HP-2024-45632',
      filledBy: 'Sales Team Driver',
      location: 'Delhi'
    },
    {
      id: '3',
      recordId: 'FUEL-2024-003',
      vehicleNumber: 'VEH-2023-015',
      vehicleName: 'Hyundai i20',
      registrationNumber: 'KA-03-MN-9012',
      fuelDate: '2024-10-23',
      fuelType: 'petrol',
      quantity: 30,
      pricePerLiter: 104.80,
      totalCost: 3144,
      odometer: 25400,
      fuelStation: 'Bharat Petroleum - Indiranagar',
      billNumber: 'BP-2024-12389',
      filledBy: 'Priya Sharma',
      location: 'Bangalore'
    },
    {
      id: '4',
      recordId: 'FUEL-2024-004',
      vehicleNumber: 'VEH-2024-003',
      vehicleName: 'Tata Winger',
      registrationNumber: 'MH-12-DE-3456',
      fuelDate: '2024-10-22',
      fuelType: 'diesel',
      quantity: 60,
      pricePerLiter: 93.50,
      totalCost: 5610,
      odometer: 6800,
      fuelStation: 'Indian Oil - Hinjewadi',
      billNumber: 'IO-2024-87654',
      filledBy: 'Operations Driver',
      location: 'Pune'
    },
    {
      id: '5',
      recordId: 'FUEL-2024-005',
      vehicleNumber: 'VEH-2022-008',
      vehicleName: 'Honda City',
      registrationNumber: 'TS-09-FG-7890',
      fuelDate: '2024-10-21',
      fuelType: 'petrol',
      quantity: 40,
      pricePerLiter: 105.20,
      totalCost: 4208,
      odometer: 45600,
      fuelStation: 'Shell - Gachibowli',
      billNumber: 'SH-2024-56789',
      filledBy: 'Arjun Kapoor',
      location: 'Hyderabad'
    }
  ];

  const [mockRecords, setMockRecords] = useState<FuelRecord[]>(fallbackRecords);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const rows = await HrAssetsService.getVehicleFuel();
        if (cancelled) return;
        if (rows.length) {
          setMockRecords(
            rows.map((r) => ({
              id: r.id,
              recordId: r.recordId || '',
              vehicleNumber: r.vehicleNumber || '',
              vehicleName: r.vehicleName || '',
              registrationNumber: r.registrationNumber || '',
              fuelDate: r.fuelDate || '',
              fuelType: (r.fuelType as FuelRecord['fuelType']) || 'petrol',
              quantity: Number(r.quantity ?? 0),
              pricePerLiter: Number(r.pricePerLiter ?? 0),
              totalCost: Number(r.totalCost ?? 0),
              odometer: Number(r.odometer ?? 0),
              fuelStation: r.fuelStation || '',
              billNumber: r.billNumber || '',
              filledBy: r.filledBy || '',
              location: r.location || '',
              remarks: r.remarks || undefined,
            })),
          );
        }
      } catch (err) {
        if (!cancelled)
          setLoadError(err instanceof Error ? err.message : 'Failed to load fuel records');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredRecords = mockRecords.filter(r => {
    if (selectedVehicle !== 'all' && r.vehicleNumber !== selectedVehicle) return false;
    if (selectedFuelType !== 'all' && r.fuelType !== selectedFuelType) return false;
    return true;
  });

  const stats = useMemo(() => ({
    totalRecords: mockRecords.length,
    totalQuantity: mockRecords.reduce((sum, r) => sum + r.quantity, 0),
    totalCost: mockRecords.reduce((sum, r) => sum + r.totalCost, 0),
    avgCostPerLiter: mockRecords.reduce((sum, r) => sum + r.pricePerLiter, 0) / mockRecords.length
  }), [mockRecords]);

  const fuelTypeColors = {
    petrol: 'bg-orange-100 text-orange-700',
    diesel: 'bg-green-100 text-green-700',
    cng: 'bg-blue-100 text-blue-700'
  };

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900">Fuel Management</h1>
        <p className="text-sm text-gray-600 mt-1">Track vehicle fuel consumption and costs</p>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading fuel records…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {loadError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <p className="text-sm font-medium text-blue-600">Total Records</p>
          <p className="text-2xl font-bold text-blue-900 mt-1">{stats.totalRecords}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <p className="text-sm font-medium text-green-600">Total Quantity</p>
          <p className="text-2xl font-bold text-green-900 mt-1">{stats.totalQuantity}L</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <p className="text-sm font-medium text-purple-600">Total Cost</p>
          <p className="text-2xl font-bold text-purple-900 mt-1">₹{stats.totalCost.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Avg Price/L</p>
              <p className="text-2xl font-bold text-orange-900 mt-1">₹{stats.avgCostPerLiter.toFixed(2)}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle</label>
            <select value={selectedVehicle} onChange={(e) => setSelectedVehicle(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">All Vehicles</option>
              <option value="VEH-2024-001">Maruti Suzuki Dzire (MH-02-BX-1234)</option>
              <option value="VEH-2024-002">Mahindra XUV700 (DL-3C-AB-5678)</option>
              <option value="VEH-2023-015">Hyundai i20 (KA-03-MN-9012)</option>
              <option value="VEH-2024-003">Tata Winger (MH-12-DE-3456)</option>
              <option value="VEH-2022-008">Honda City (TS-09-FG-7890)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fuel Type</label>
            <select value={selectedFuelType} onChange={(e) => setSelectedFuelType(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">All Types</option>
              <option value="petrol">Petrol</option>
              <option value="diesel">Diesel</option>
              <option value="cng">CNG</option>
            </select>
          </div>
          <div className="flex items-end">
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm">
              Add Fuel Record
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {filteredRecords.map(record => (
          <div key={record.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-12 w-12 bg-orange-50 rounded-lg flex items-center justify-center">
                    <Fuel className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{record.vehicleName}</h3>
                    <p className="text-sm text-gray-600">{record.registrationNumber} • {record.recordId}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs font-semibold rounded ${fuelTypeColors[record.fuelType]}`}>
                    {record.fuelType.charAt(0).toUpperCase() + record.fuelType.slice(1)}
                  </span>
                  <span className="px-2 py-1 text-xs font-semibold rounded bg-gray-100 text-gray-700 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(record.fuelDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Total Cost</p>
                <p className="text-2xl font-bold text-blue-600">₹{record.totalCost.toLocaleString('en-IN')}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2 py-4 border-y border-gray-200">
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Quantity</p>
                <p className="text-lg font-semibold text-gray-900">{record.quantity} Liters</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Price/Liter</p>
                <p className="text-lg font-semibold text-gray-900 flex items-center gap-1">
                  <IndianRupee className="h-4 w-4 text-gray-500" />
                  {record.pricePerLiter.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Odometer</p>
                <p className="text-lg font-semibold text-gray-900">{record.odometer.toLocaleString('en-IN')} km</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Location</p>
                <p className="text-lg font-semibold text-gray-900">{record.location}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xs text-blue-600 uppercase font-medium mb-1">Fuel Station</p>
                <p className="text-sm font-semibold text-blue-900">{record.fuelStation}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <p className="text-xs text-green-600 uppercase font-medium mb-1">Bill Number</p>
                <p className="text-sm font-semibold text-green-900">{record.billNumber}</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-3">
                <p className="text-xs text-purple-600 uppercase font-medium mb-1">Filled By</p>
                <p className="text-sm font-semibold text-purple-900">{record.filledBy}</p>
              </div>
            </div>

            {record.remarks && (
              <div className="bg-yellow-50 rounded-lg p-3 mb-2 border border-yellow-200">
                <p className="text-xs text-yellow-700 uppercase font-medium mb-1">Remarks</p>
                <p className="text-sm text-yellow-800">{record.remarks}</p>
              </div>
            )}

            <div className="flex gap-2">
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm">
                View Details
              </button>
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm">
                Download Bill
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
