'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Search, Edit2, Trash2, MapPin, Package, Layers, Grid, ChevronRight, AlertCircle } from 'lucide-react';
import {
  CreateBinModal,
  BinData
} from '@/components/inventory/InventoryWarehouseModals';
import { inventoryService } from '@/services/InventoryService';

interface Location {
  id: string;
  code: string;
  name: string;
  warehouse: string;
  zone: string;
  aisle: string;
  rack: string;
  shelf: string;
  bin: string;
  locationType: 'storage' | 'picking' | 'receiving' | 'shipping' | 'staging';
  capacity: number;
  currentOccupancy: number;
  utilizationPercent: number;
  status: 'available' | 'occupied' | 'reserved' | 'blocked';
  itemsStored: number;
  lastUpdated: string;
}

export default function WarehouseLocationsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterWarehouse, setFilterWarehouse] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  // Modal states
  const [isCreateBinOpen, setIsCreateBinOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [locationList, setLocationList] = useState<Location[]>([]);
  const [isViewBinOpen, setIsViewBinOpen] = useState(false);

  // Warehouse locations loaded from the NestJS inventory service.
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        // Backend returns raw ORM shape (locationCode/locationName/locationType/
        // status/zone/aisle/rack/shelf/bin/maxCapacity/currentCapacity/
        // utilizationPercentage/warehouseId); map it to the page's Location model.
        const raw = (await inventoryService.getStockLocations()) as any[];
        const typeMap: Record<string, Location['locationType']> = {
          'Storage': 'storage', 'Storage Area': 'storage',
          'Picking': 'picking', 'Picking Area': 'picking',
          'Receiving': 'receiving', 'Receiving Area': 'receiving',
          'Shipping': 'shipping', 'Dispatch Area': 'shipping', 'Shipping Area': 'shipping',
          'Staging': 'staging', 'Staging Area': 'staging',
        };
        const statusMap: Record<string, Location['status']> = {
          'Active': 'available', 'Available': 'available',
          'Occupied': 'occupied', 'Reserved': 'reserved',
          'Blocked': 'blocked', 'Inactive': 'blocked',
        };
        const mapped: Location[] = raw.map((l) => {
          const capacity = Number(l.maxCapacity ?? 0);
          const currentOccupancy = Number(l.currentCapacity ?? 0);
          const utilizationPercent = l.utilizationPercentage != null
            ? Number(l.utilizationPercentage)
            : (capacity > 0 ? Math.round((currentOccupancy / capacity) * 100) : 0);
          return {
            id: l.id ?? l.locationCode ?? '',
            code: l.locationCode ?? '',
            name: l.locationName ?? l.locationCode ?? '',
            warehouse: l.warehouseName ?? l.warehouseId ?? '',
            zone: l.zone ?? '-',
            aisle: l.aisle ?? '-',
            rack: l.rack ?? '-',
            shelf: l.shelf ?? '-',
            bin: l.bin ?? '-',
            locationType: typeMap[l.locationType] ?? 'storage',
            capacity,
            currentOccupancy,
            utilizationPercent,
            status: statusMap[l.status] ?? 'available',
            itemsStored: Number(l.itemsStored ?? 0),
            lastUpdated: (l.updatedAt ?? l.createdAt ?? '').toString().split('T')[0] || '',
          };
        });
        if (!cancelled) setLocations(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load warehouse locations');
          setLocations([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const filteredLocations = locations.filter(loc => {
    const matchesSearch = loc.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         loc.zone.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesWarehouse = filterWarehouse === 'all' || loc.warehouse === filterWarehouse;
    const matchesStatus = filterStatus === 'all' || loc.status === filterStatus;
    const matchesType = filterType === 'all' || loc.locationType === filterType;
    return matchesSearch && matchesWarehouse && matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-700';
      case 'occupied': return 'bg-blue-100 text-blue-700';
      case 'reserved': return 'bg-yellow-100 text-yellow-700';
      case 'blocked': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'storage': return 'bg-purple-100 text-purple-700';
      case 'picking': return 'bg-green-100 text-green-700';
      case 'receiving': return 'bg-blue-100 text-blue-700';
      case 'shipping': return 'bg-orange-100 text-orange-700';
      case 'staging': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 90) return 'text-red-600';
    if (utilization >= 70) return 'text-yellow-600';
    if (utilization >= 50) return 'text-blue-600';
    return 'text-green-600';
  };

  // Convert Location to BinData
  const convertToBinData = (location: Location): BinData => {
    return {
      binId: location.id,
      binCode: location.code,
      zoneId: 'ZONE-001', // Default zone ID
      row: location.aisle,
      rack: location.rack,
      level: location.shelf,
      capacity: location.capacity,
      currentLoad: location.currentOccupancy,
      status: location.status,
      itemStored: location.itemsStored > 0 ? `${location.itemsStored} items` : undefined,
      dimensions: undefined
    };
  };

  // Handle bin creation
  const handleCreateBin = async (data: BinData) => {
    const binCode = data?.binCode;
    if (!binCode) return;
    try {
      await inventoryService.createStockLocation({
        locationCode: binCode,
        locationName: binCode,
        zone: data?.zoneId,
        aisle: data?.row,
        rack: data?.rack,
        shelf: data?.level,
        bin: binCode,
        locationType: 'storage',
        status: 'Active',
      });
      setIsCreateBinOpen(false);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      console.error('Failed to create bin location:', err);
    }
  };

  // Handle bin/location click to view details
  const handleLocationClick = (location: Location) => {
    setSelectedLocation(location);
    setIsViewBinOpen(true);
    console.log('Location clicked:', location);
  };

  // Handle bin/location edit
  const handleEditLocation = async (location: Location) => {
    setSelectedLocation(location);
    if (!location?.id) return;
    try {
      await inventoryService.updateStockLocation(location.id, {
        locationCode: location.code,
        locationName: location.name,
        zone: location.zone,
        aisle: location.aisle,
        rack: location.rack,
        shelf: location.shelf,
        bin: location.bin,
      });
      setRefreshKey((k) => k + 1);
    } catch (err) {
      console.error('Failed to update location:', err);
    }
  };

  // Get status-based row color for table
  const getStatusRowColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-50';
      case 'occupied': return 'bg-blue-50';
      case 'reserved': return 'bg-yellow-50';
      case 'blocked': return 'bg-red-50';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-3 py-2">
      {/* Inline Header */}
      <div className="mb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Warehouse Locations</h1>
            <p className="text-sm text-gray-500 mt-1">Manage storage locations and bins across warehouses</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCreateBinOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Location</span>
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Locations</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">{locations.length}</p>
            </div>
            <div className="p-3 bg-blue-200 rounded-lg">
              <MapPin className="w-6 h-6 text-blue-700" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Available</p>
              <p className="text-3xl font-bold text-green-900 mt-1">
                {locations.filter(loc => loc.status === 'available').length}
              </p>
            </div>
            <div className="p-3 bg-green-200 rounded-lg">
              <Grid className="w-6 h-6 text-green-700" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-3 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Occupied</p>
              <p className="text-3xl font-bold text-purple-900 mt-1">
                {locations.filter(loc => loc.status === 'occupied').length}
              </p>
            </div>
            <div className="p-3 bg-purple-200 rounded-lg">
              <Package className="w-6 h-6 text-purple-700" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-3 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Avg Utilization</p>
              <p className="text-3xl font-bold text-orange-900 mt-1">
                {(locations.length > 0 ? locations.reduce((sum, loc) => sum + loc.utilizationPercent, 0) / locations.length : 0).toFixed(0)}%
              </p>
            </div>
            <div className="p-3 bg-orange-200 rounded-lg">
              <Layers className="w-6 h-6 text-orange-700" />
            </div>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading warehouse locations…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}
      {!isLoading && !loadError && locations.length === 0 && (
        <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          No warehouse locations found.
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-3 mb-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterWarehouse}
            onChange={(e) => setFilterWarehouse(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Warehouses</option>
            <option value="Mumbai Central Warehouse">Mumbai Central</option>
            <option value="Delhi Regional Hub">Delhi Regional</option>
            <option value="Bangalore Factory Store">Bangalore Factory</option>
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="storage">Storage</option>
            <option value="picking">Picking</option>
            <option value="receiving">Receiving</option>
            <option value="shipping">Shipping</option>
            <option value="staging">Staging</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="occupied">Occupied</option>
            <option value="reserved">Reserved</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>
      </div>

      {/* Locations List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location Code</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Warehouse</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Zone/Aisle</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rack/Shelf/Bin</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Capacity</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Occupancy</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Utilization</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Items</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredLocations.map((loc) => (
                <tr
                  key={loc.id}
                  className={`hover:bg-gray-100 cursor-pointer transition-colors ${getStatusRowColor(loc.status)}`}
                  onClick={() => handleLocationClick(loc)}
                >
                  <td className="px-4 py-3">
                    <div className="text-sm font-mono font-bold text-gray-900">{loc.code}</div>
                    <div className="text-xs text-gray-500 mt-1">Updated: {loc.lastUpdated}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{loc.warehouse}</td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-semibold text-gray-900">{loc.zone}</div>
                    <div className="text-xs text-gray-500">{loc.aisle}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-xs text-gray-600">
                      {loc.rack} / {loc.shelf} / {loc.bin}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(loc.locationType)}`}>
                      {loc.locationType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right font-semibold">{loc.capacity}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right">{loc.currentOccupancy}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className={`text-sm font-bold ${getUtilizationColor(loc.utilizationPercent)}`}>
                        {loc.utilizationPercent}%
                      </span>
                      <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${loc.utilizationPercent >= 90 ? 'bg-red-500' : loc.utilizationPercent >= 70 ? 'bg-yellow-500' : 'bg-green-500'}`}
                          style={{ width: `${loc.utilizationPercent}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-center font-semibold">{loc.itemsStored}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(loc.status)}`}>
                      {loc.status}
                    </span>
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleEditLocation(loc)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                      >
                        <Edit2 className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-700">Edit</span>
                      </button>
                      <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-red-300 rounded-lg hover:bg-red-50 text-sm">
                        <Trash2 className="w-4 h-4 text-red-600" />
                        <span className="text-red-600">Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLocations.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No locations found matching your criteria</p>
          </div>
        )}
      </div>

      {/* Bin Status Legend */}
      <div className="bg-white rounded-xl border border-gray-200 p-3">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Status Color Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 border border-green-200 rounded"></div>
            <span className="text-sm text-gray-600">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-100 border border-blue-200 rounded"></div>
            <span className="text-sm text-gray-600">Occupied</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-100 border border-yellow-200 rounded"></div>
            <span className="text-sm text-gray-600">Reserved</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-100 border border-red-200 rounded"></div>
            <span className="text-sm text-gray-600">Blocked</span>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreateBinModal
        isOpen={isCreateBinOpen}
        onClose={() => setIsCreateBinOpen(false)}
        onSubmit={handleCreateBin}
      />
    </div>
  );
}
