'use client';

import { useState, useMemo, useEffect } from 'react';
import { Car, Calendar, Gauge } from 'lucide-react';
import { HrAssetsService } from '@/services/hr-assets.service';
import { AssetManagementService } from '@/services/asset-management.service';

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


  const [mockVehicles, setMockVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [selected, setSelected] = useState<Vehicle | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [assignTarget, setAssignTarget] = useState<Vehicle | null>(null);
  const [saving, setSaving] = useState(false);
  const [addForm, setAddForm] = useState({ make: '', model: '', registrationNumber: '', vehicleType: 'sedan' as Vehicle['vehicleType'], fuelType: 'petrol' as Vehicle['fuelType'], purchaseCost: '', location: '' });
  const [assignForm, setAssignForm] = useState({ employeeName: '', employeeCode: '', department: '' });

  const handleAdd = async () => {
    setSaving(true);
    setLoadError(null);
    try {
      const asset = await AssetManagementService.createAsset({
        assetName: `${addForm.make} ${addForm.model}`.trim(),
        brand: addForm.make,
        model: addForm.model,
        registrationNumber: addForm.registrationNumber,
        fuelType: addForm.fuelType,
        purchasePrice: Number(addForm.purchaseCost) || undefined,
        location: addForm.location,
      });
      const newVehicle: Vehicle = {
        id: asset?.id || Date.now().toString(),
        vehicleNumber: asset?.assetCode || '',
        vehicleType: addForm.vehicleType,
        make: addForm.make,
        model: addForm.model,
        year: new Date().getFullYear(),
        purchaseDate: '',
        purchaseCost: Number(addForm.purchaseCost) || 0,
        registrationNumber: addForm.registrationNumber,
        insuranceExpiry: '',
        pucExpiry: '',
        fitnessExpiry: '',
        currentOdometer: 0,
        fuelType: addForm.fuelType,
        status: 'available',
        location: addForm.location,
      };
      setMockVehicles((prev) => [newVehicle, ...prev]);
      setShowAdd(false);
      setAddForm({ make: '', model: '', registrationNumber: '', vehicleType: 'sedan', fuelType: 'petrol', purchaseCost: '', location: '' });
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to add vehicle');
    } finally {
      setSaving(false);
    }
  };

  const handleAssign = async () => {
    if (!assignTarget) return;
    setSaving(true);
    setLoadError(null);
    try {
      await AssetManagementService.allocateAsset({
        assetId: assignTarget.id,
        employeeName: assignForm.employeeName,
        employeeCode: assignForm.employeeCode,
        department: assignForm.department,
        allocationType: 'permanent',
      });
      const targetId = assignTarget.id;
      setMockVehicles((prev) =>
        prev.map((v) =>
          v.id === targetId
            ? { ...v, status: 'assigned', assignedTo: `${assignForm.employeeName} (${assignForm.employeeCode})` }
            : v,
        ),
      );
      setAssignTarget(null);
      setAssignForm({ employeeName: '', employeeCode: '', department: '' });
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to assign vehicle');
    } finally {
      setSaving(false);
    }
  };

  const handleRenew = async (vehicle: Vehicle) => {
    setSaving(true);
    setLoadError(null);
    try {
      await AssetManagementService.createMaintenanceRequest({
        assetId: vehicle.id,
        requestType: 'service_request' as any,
        priority: 'high',
        issueDescription: `Document renewal required for ${vehicle.registrationNumber} (insurance/PUC expiring)`,
      });
      setLoadError(null);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to raise renewal request');
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
        const rows = await HrAssetsService.getVehicles();
        if (cancelled) return;
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
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load vehicles');
          setMockVehicles([]);
        }
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
            <button onClick={() => setShowAdd(true)} className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm">
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
                <button onClick={() => setSelected(vehicle)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm">
                  View Details
                </button>
                {vehicle.status === 'available' && (
                  <button onClick={() => setAssignTarget(vehicle)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm">
                    Assign Vehicle
                  </button>
                )}
                {expiringSoon && (
                  <button onClick={() => handleRenew(vehicle)} disabled={saving} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm disabled:opacity-50">
                    Renew Documents
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto p-5" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-900 mb-3">{selected.make} {selected.model}</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-xs text-gray-500 uppercase font-medium">Registration</p><p className="font-semibold text-gray-900">{selected.registrationNumber}</p></div>
              <div><p className="text-xs text-gray-500 uppercase font-medium">Vehicle Number</p><p className="font-semibold text-gray-900">{selected.vehicleNumber}</p></div>
              <div><p className="text-xs text-gray-500 uppercase font-medium">Type</p><p className="font-semibold text-gray-900">{selected.vehicleType}</p></div>
              <div><p className="text-xs text-gray-500 uppercase font-medium">Status</p><p className="font-semibold text-gray-900">{selected.status}</p></div>
              <div><p className="text-xs text-gray-500 uppercase font-medium">Fuel Type</p><p className="font-semibold text-gray-900">{selected.fuelType}</p></div>
              <div><p className="text-xs text-gray-500 uppercase font-medium">Year</p><p className="font-semibold text-gray-900">{selected.year}</p></div>
              <div><p className="text-xs text-gray-500 uppercase font-medium">Purchase Cost</p><p className="font-semibold text-gray-900">₹{selected.purchaseCost.toLocaleString('en-IN')}</p></div>
              <div><p className="text-xs text-gray-500 uppercase font-medium">Odometer</p><p className="font-semibold text-gray-900">{selected.currentOdometer.toLocaleString('en-IN')} km</p></div>
              <div><p className="text-xs text-gray-500 uppercase font-medium">Location</p><p className="font-semibold text-gray-900">{selected.location}</p></div>
              <div><p className="text-xs text-gray-500 uppercase font-medium">Assigned To</p><p className="font-semibold text-gray-900">{selected.assignedTo || '—'}</p></div>
              <div><p className="text-xs text-gray-500 uppercase font-medium">Insurance Expiry</p><p className="font-semibold text-gray-900">{selected.insuranceExpiry || '—'}</p></div>
              <div><p className="text-xs text-gray-500 uppercase font-medium">PUC Expiry</p><p className="font-semibold text-gray-900">{selected.pucExpiry || '—'}</p></div>
              <div><p className="text-xs text-gray-500 uppercase font-medium">Fitness Expiry</p><p className="font-semibold text-gray-900">{selected.fitnessExpiry || '—'}</p></div>
            </div>
            <div className="flex justify-end mt-4">
              <button onClick={() => setSelected(null)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm">Close</button>
            </div>
          </div>
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowAdd(false)}>
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto p-5" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Add Vehicle</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Make</label>
                <input value={addForm.make} onChange={(e) => setAddForm({ ...addForm, make: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                <input value={addForm.model} onChange={(e) => setAddForm({ ...addForm, model: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Registration Number</label>
                <input value={addForm.registrationNumber} onChange={(e) => setAddForm({ ...addForm, registrationNumber: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
                <select value={addForm.vehicleType} onChange={(e) => setAddForm({ ...addForm, vehicleType: e.target.value as Vehicle['vehicleType'] })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="sedan">Sedan</option>
                  <option value="suv">SUV</option>
                  <option value="hatchback">Hatchback</option>
                  <option value="van">Van</option>
                  <option value="truck">Truck</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fuel Type</label>
                <select value={addForm.fuelType} onChange={(e) => setAddForm({ ...addForm, fuelType: e.target.value as Vehicle['fuelType'] })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="petrol">Petrol</option>
                  <option value="diesel">Diesel</option>
                  <option value="cng">CNG</option>
                  <option value="electric">Electric</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Cost</label>
                <input type="number" value={addForm.purchaseCost} onChange={(e) => setAddForm({ ...addForm, purchaseCost: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input value={addForm.location} onChange={(e) => setAddForm({ ...addForm, location: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowAdd(false)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm">Cancel</button>
              <button onClick={handleAdd} disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm disabled:opacity-50">{saving ? 'Saving…' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}

      {assignTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setAssignTarget(null)}>
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-5" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-900 mb-1">Assign Vehicle</h2>
            <p className="text-sm text-gray-600 mb-3">{assignTarget.make} {assignTarget.model} • {assignTarget.registrationNumber}</p>
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee Name</label>
                <input value={assignForm.employeeName} onChange={(e) => setAssignForm({ ...assignForm, employeeName: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee Code</label>
                <input value={assignForm.employeeCode} onChange={(e) => setAssignForm({ ...assignForm, employeeCode: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <input value={assignForm.department} onChange={(e) => setAssignForm({ ...assignForm, department: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setAssignTarget(null)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm">Cancel</button>
              <button onClick={handleAssign} disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm disabled:opacity-50">{saving ? 'Saving…' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
