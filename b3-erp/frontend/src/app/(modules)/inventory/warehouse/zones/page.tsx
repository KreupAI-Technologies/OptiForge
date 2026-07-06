'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Search, Edit2, Trash2, Grid, Package, Thermometer, Shield, TrendingUp } from 'lucide-react';
import {
  CreateZoneModal,
  CreateBinModal,
  ZoneData,
  BinData
} from '@/components/inventory/InventoryWarehouseModals';
import { inventoryService } from '@/services/InventoryService';

interface Zone {
  id: string;
  code: string;
  name: string;
  warehouse: string;
  zoneType: 'storage' | 'picking' | 'receiving' | 'shipping' | 'cold-storage' | 'hazardous' | 'quarantine';
  area: number;
  capacity: number;
  currentOccupancy: number;
  utilizationPercent: number;
  totalLocations: number;
  availableLocations: number;
  temperature: string;
  status: 'active' | 'inactive' | 'maintenance';
  manager: string;
  specialRequirements: string[];
}

export default function WarehouseZonesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterWarehouse, setFilterWarehouse] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  // Modal states
  const [isCreateZoneOpen, setIsCreateZoneOpen] = useState(false);
  const [isCreateBinOpen, setIsCreateBinOpen] = useState(false);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [selectedZoneIdForBin, setSelectedZoneIdForBin] = useState<string>('');
  const [zoneList, setZoneList] = useState<Zone[]>([]);

  const [zones, setZones] = useState<Zone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = (await inventoryService.getStockLocations()) as any[];
        if (cancelled) return;

        const normalizeType = (t: string): Zone['zoneType'] => {
          const v = (t ?? '').toLowerCase();
          if (v.includes('pick')) return 'picking';
          if (v.includes('receiv')) return 'receiving';
          if (v.includes('ship') || v.includes('dispatch')) return 'shipping';
          if (v.includes('cold') || v.includes('freez')) return 'cold-storage';
          if (v.includes('hazard')) return 'hazardous';
          if (v.includes('quarantine') || v.includes('qc') || v.includes('reject')) return 'quarantine';
          return 'storage';
        };
        const normalizeStatus = (s: string): Zone['status'] => {
          const v = (s ?? '').toLowerCase();
          if (v === 'inactive') return 'inactive';
          if (v === 'maintenance') return 'maintenance';
          return 'active';
        };

        const mapped: Zone[] = (raw ?? []).map((loc) => {
          const capacity = Number(loc?.maxCapacity ?? 0);
          const currentOccupancy = Number(loc?.currentCapacity ?? 0);
          const utilizationPercent = Math.round(Number(loc?.utilizationPercentage ?? 0));
          return {
            id: loc?.id ?? loc?.locationCode ?? '',
            code: loc?.locationCode ?? '',
            name: loc?.locationName ?? loc?.locationCode ?? '',
            warehouse: loc?.warehouseName ?? loc?.warehouseId ?? '',
            zoneType: normalizeType(loc?.locationType),
            area: 0,
            capacity,
            currentOccupancy,
            utilizationPercent,
            totalLocations: 0,
            availableLocations: 0,
            temperature: loc?.isTemperatureControlled
              ? `Controlled (${loc?.temperatureMin ?? '?'}-${loc?.temperatureMax ?? '?'}°C)`
              : 'Ambient',
            status: normalizeStatus(loc?.status),
            manager: '',
            specialRequirements: Array.isArray(loc?.allowedItemCategories)
              ? loc.allowedItemCategories
              : [],
          };
        });
        setZones(mapped);
      } catch (err: any) {
        if (!cancelled) setLoadError(err?.message ?? 'Failed to load zones');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const filteredZones = zones.filter(zone => {
    const matchesSearch = zone.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         zone.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesWarehouse = filterWarehouse === 'all' || zone.warehouse === filterWarehouse;
    const matchesType = filterType === 'all' || zone.zoneType === filterType;
    return matchesSearch && matchesWarehouse && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'inactive': return 'bg-gray-100 text-gray-700';
      case 'maintenance': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'storage': return 'bg-blue-100 text-blue-700';
      case 'picking': return 'bg-green-100 text-green-700';
      case 'receiving': return 'bg-purple-100 text-purple-700';
      case 'shipping': return 'bg-orange-100 text-orange-700';
      case 'cold-storage': return 'bg-cyan-100 text-cyan-700';
      case 'hazardous': return 'bg-red-100 text-red-700';
      case 'quarantine': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'cold-storage': return <Thermometer className="w-4 h-4" />;
      case 'hazardous': return <Shield className="w-4 h-4" />;
      default: return <Grid className="w-4 h-4" />;
    }
  };

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 90) return 'text-red-600';
    if (utilization >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  // Convert Zone to ZoneData
  const convertToZoneData = (zone: Zone): ZoneData => {
    return {
      zoneId: zone.id,
      zoneName: zone.name,
      zoneCode: zone.code,
      warehouseId: 'WH-001', // Default warehouse ID
      zoneType: zone.zoneType === 'cold-storage' ? 'storage' : zone.zoneType === 'hazardous' ? 'quarantine' : zone.zoneType,
      capacity: zone.capacity,
      currentUtilization: zone.utilizationPercent,
      temperature: zone.temperature.includes('Cold') || zone.temperature.includes('Controlled') ? {
        min: 2,
        max: 8,
        controlled: true
      } : undefined,
      bins: [],
      restrictions: zone.specialRequirements
    };
  };

  // Handle zone creation
  const handleCreateZone = async (data: ZoneData) => {
    const code = data?.zoneCode;
    const name = data?.zoneName;
    if (!code && !name) return;
    try {
      await inventoryService.createStockLocation({
        locationCode: code ?? name,
        locationName: name ?? code,
        warehouseId: data?.warehouseId,
        zone: name ?? code,
        locationType: data?.zoneType ?? 'storage',
        status: 'Active',
      });
      setIsCreateZoneOpen(false);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      console.error('Failed to create zone:', err);
    }
  };

  // Handle zone card click to view details
  const handleZoneClick = (zone: Zone) => {
    setSelectedZone(zone);
    // Could open a details modal here if needed
    console.log('Zone clicked:', zone);
  };

  // Handle add bin from zone
  const handleAddBinToZone = (zoneId: string) => {
    setSelectedZoneIdForBin(zoneId);
    setIsCreateBinOpen(true);
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
        bin: binCode,
        locationType: 'storage',
        status: 'Active',
      });
      setIsCreateBinOpen(false);
      setSelectedZoneIdForBin('');
      setRefreshKey((k) => k + 1);
    } catch (err) {
      console.error('Failed to create bin:', err);
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
            <h1 className="text-2xl font-bold text-gray-900">Warehouse Zones</h1>
            <p className="text-sm text-gray-500 mt-1">Manage warehouse zones and area configurations</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCreateZoneOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Zone</span>
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Zones</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">{zones.length}</p>
            </div>
            <div className="p-3 bg-blue-200 rounded-lg">
              <Grid className="w-6 h-6 text-blue-700" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Active Zones</p>
              <p className="text-3xl font-bold text-green-900 mt-1">
                {zones.filter(z => z.status === 'active').length}
              </p>
            </div>
            <div className="p-3 bg-green-200 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-700" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-3 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Total Area</p>
              <p className="text-3xl font-bold text-purple-900 mt-1">
                {(zones.reduce((sum, z) => sum + z.area, 0) / 1000).toFixed(1)}K
              </p>
              <p className="text-xs text-purple-600 mt-1">sq. meters</p>
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
                {(zones.reduce((sum, z) => sum + z.utilizationPercent, 0) / zones.length).toFixed(0)}%
              </p>
            </div>
            <div className="p-3 bg-orange-200 rounded-lg">
              <TrendingUp className="w-6 h-6 text-orange-700" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-3 mb-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search zones..."
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
            <option value="Chennai Distribution Center">Chennai Distribution</option>
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Zone Types</option>
            <option value="storage">Storage</option>
            <option value="picking">Picking</option>
            <option value="receiving">Receiving</option>
            <option value="shipping">Shipping</option>
            <option value="cold-storage">Cold Storage</option>
            <option value="hazardous">Hazardous</option>
            <option value="quarantine">Quarantine</option>
          </select>
        </div>
      </div>

      {/* Zones Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredZones.map((zone) => (
          <div
            key={zone.id}
            className="bg-white rounded-xl border border-gray-200 p-3 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleZoneClick(zone)}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg ${getTypeColor(zone.zoneType)} bg-opacity-20`}>
                  {getTypeIcon(zone.zoneType)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{zone.name}</h3>
                  <p className="text-sm text-gray-500">{zone.warehouse}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(zone.zoneType)}`}>
                  {zone.zoneType}
                </span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(zone.status)}`}>
                  {zone.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-2">
              <div>
                <p className="text-xs text-gray-500">Zone Code</p>
                <p className="text-sm font-mono font-bold text-gray-900">{zone.code}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Manager</p>
                <p className="text-sm font-semibold text-gray-900">{zone.manager}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Area</p>
                <p className="text-sm font-semibold text-gray-900">{zone.area.toLocaleString()} m²</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Temperature</p>
                <p className="text-sm font-semibold text-gray-900">{zone.temperature}</p>
              </div>
            </div>

            <div className="mb-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Capacity Utilization</span>
                <span className={`text-sm font-bold ${getUtilizationColor(zone.utilizationPercent)}`}>
                  {zone.utilizationPercent}%
                </span>
              </div>
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${zone.utilizationPercent >= 90 ? 'bg-red-500' : zone.utilizationPercent >= 70 ? 'bg-yellow-500' : 'bg-green-500'}`}
                  style={{ width: `${zone.utilizationPercent}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-1 text-xs text-gray-500">
                <span>{zone.currentOccupancy.toLocaleString()} / {zone.capacity.toLocaleString()}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-2 p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-xs text-gray-500">Total Locations</p>
                <p className="text-lg font-bold text-gray-900">{zone.totalLocations}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Available Locations</p>
                <p className="text-lg font-bold text-green-600">{zone.availableLocations}</p>
              </div>
            </div>

            <div className="mb-2">
              <p className="text-xs text-gray-500 mb-2">Special Requirements</p>
              <div className="flex flex-wrap gap-1">
                {zone.specialRequirements.map((req, idx) => (
                  <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                    {req}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-4 border-t border-gray-200">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddBinToZone(zone.id);
                }}
                className="px-3 py-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors flex items-center gap-1 text-sm"
              >
                <Plus className="w-3 h-3" />
                Add Bin
              </button>
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleZoneClick(zone);
                  }}
                  className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1 text-sm"
                >
                  <Edit2 className="w-3 h-3" />
                  Edit
                </button>
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-1 text-sm"
                >
                  <Trash2 className="w-3 h-3" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredZones.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12">
          <div className="text-center">
            <p className="text-gray-500">No zones found matching your criteria</p>
          </div>
        </div>
      )}

      {/* Modals */}
      <CreateZoneModal
        isOpen={isCreateZoneOpen}
        onClose={() => setIsCreateZoneOpen(false)}
        onSubmit={handleCreateZone}
      />

      <CreateBinModal
        isOpen={isCreateBinOpen}
        onClose={() => {
          setIsCreateBinOpen(false);
          setSelectedZoneIdForBin('');
        }}
        onSubmit={handleCreateBin}
        zoneId={selectedZoneIdForBin}
      />
    </div>
  );
}
