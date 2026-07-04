'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Download, Filter, TrendingUp, TrendingDown, Package, Layers, AlertTriangle, CheckCircle } from 'lucide-react';
import { inventoryService } from '@/services/InventoryService';

interface CapacityData {
  warehouse: string;
  location: string;
  totalCapacity: number;
  usedCapacity: number;
  availableCapacity: number;
  utilizationPercent: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  totalZones: number;
  totalLocations: number;
  availableLocations: number;
  avgItemsPerLocation: number;
  peakUtilization: number;
  lowUtilization: number;
  status: 'optimal' | 'warning' | 'critical';
}

interface ZoneCapacity {
  zoneName: string;
  capacity: number;
  used: number;
  utilization: number;
}

export default function WarehouseCapacityPage() {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState<string>('current');
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('all');

  const [capacityData, setCapacityData] = useState<CapacityData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = (await inventoryService.getCapacityUtilization()) as any[];
        if (cancelled) return;
        const mapped: CapacityData[] = (raw ?? []).map((w) => {
          const totalCapacity = Number(w.totalCapacity ?? 0);
          const usedCapacity = Number(w.currentUtilization ?? 0);
          const availableCapacity = Number(
            w.availableCapacity ?? Math.max(totalCapacity - usedCapacity, 0),
          );
          const utilizationPercent =
            totalCapacity > 0 ? Math.round((usedCapacity / totalCapacity) * 100) : 0;
          const status: CapacityData['status'] =
            utilizationPercent >= 90 ? 'critical' : utilizationPercent >= 80 ? 'warning' : 'optimal';
          return {
            warehouse: w.warehouseName ?? w.warehouseCode ?? '—',
            location: w.warehouseCode ?? '',
            totalCapacity,
            usedCapacity,
            availableCapacity,
            utilizationPercent,
            trend: 'stable',
            totalZones: 0,
            totalLocations: 0,
            availableLocations: 0,
            avgItemsPerLocation: 0,
            peakUtilization: utilizationPercent,
            lowUtilization: utilizationPercent,
            status,
          };
        });
        setCapacityData(mapped);
      } catch (err: any) {
        if (!cancelled) setLoadError(err?.message ?? 'Failed to load capacity data');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Mock zone-wise capacity breakdown
  const zoneCapacityBreakdown: { [key: string]: ZoneCapacity[] } = {
    'Mumbai Central Warehouse': [
      { zoneName: 'Zone A - General Storage', capacity: 10000, used: 8500, utilization: 85 },
      { zoneName: 'Zone B - Picking Area', capacity: 5000, used: 3200, utilization: 64 },
      { zoneName: 'Zone C - Cold Storage', capacity: 3000, used: 2700, utilization: 90 },
      { zoneName: 'Receiving Zone', capacity: 2000, used: 450, utilization: 23 },
      { zoneName: 'Shipping Zone', capacity: 2000, used: 800, utilization: 40 }
    ],
    'Delhi Regional Hub': [
      { zoneName: 'Zone A - General Storage', capacity: 8000, used: 5200, utilization: 65 },
      { zoneName: 'Hazardous Materials Zone', capacity: 1500, used: 450, utilization: 30 },
      { zoneName: 'Receiving/Shipping', capacity: 3000, used: 850, utilization: 28 }
    ],
    'Bangalore Factory Store': [
      { zoneName: 'Zone A - High Velocity', capacity: 7000, used: 6440, utilization: 92 },
      { zoneName: 'Zone B - Raw Materials', capacity: 5000, used: 4800, utilization: 96 },
      { zoneName: 'Quarantine Zone', capacity: 1000, used: 150, utilization: 15 },
      { zoneName: 'Work-in-Progress', capacity: 3000, used: 2970, utilization: 99 }
    ]
  };

  const filteredData = selectedWarehouse === 'all'
    ? capacityData
    : capacityData.filter(w => w.warehouse === selectedWarehouse);

  const totalCapacity = filteredData.reduce((sum, w) => sum + w.totalCapacity, 0);
  const totalUsed = filteredData.reduce((sum, w) => sum + w.usedCapacity, 0);
  const totalAvailable = filteredData.reduce((sum, w) => sum + w.availableCapacity, 0);
  const avgUtilization = filteredData.length
    ? filteredData.reduce((sum, w) => sum + w.utilizationPercent, 0) / filteredData.length
    : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal': return 'bg-green-100 text-green-700';
      case 'warning': return 'bg-yellow-100 text-yellow-700';
      case 'critical': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'optimal': return <CheckCircle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'critical': return <AlertTriangle className="w-4 h-4" />;
      default: return null;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="w-4 h-4 text-orange-600" />;
      case 'decreasing': return <TrendingDown className="w-4 h-4 text-blue-600" />;
      default: return <span className="text-xs text-gray-500">→</span>;
    }
  };

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 90) return 'text-red-600';
    if (utilization >= 80) return 'text-yellow-600';
    if (utilization >= 70) return 'text-blue-600';
    return 'text-green-600';
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
            <h1 className="text-2xl font-bold text-gray-900">Warehouse Capacity</h1>
            <p className="text-sm text-gray-500 mt-1">Monitor and analyze warehouse capacity utilization</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-3 mb-3">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="current">Current Status</option>
            <option value="last-week">Last Week</option>
            <option value="last-month">Last Month</option>
            <option value="last-quarter">Last Quarter</option>
          </select>
          <select
            value={selectedWarehouse}
            onChange={(e) => setSelectedWarehouse(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Warehouses</option>
            {capacityData.map((w, idx) => (
              <option key={idx} value={w.warehouse}>{w.warehouse}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Capacity</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">{(totalCapacity / 1000).toFixed(1)}K</p>
              <p className="text-xs text-blue-600 mt-1">units</p>
            </div>
            <div className="p-3 bg-blue-200 rounded-lg">
              <Package className="w-6 h-6 text-blue-700" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-3 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Used Capacity</p>
              <p className="text-3xl font-bold text-purple-900 mt-1">{(totalUsed / 1000).toFixed(1)}K</p>
              <p className="text-xs text-purple-600 mt-1">{avgUtilization.toFixed(1)}% utilized</p>
            </div>
            <div className="p-3 bg-purple-200 rounded-lg">
              <Layers className="w-6 h-6 text-purple-700" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Available</p>
              <p className="text-3xl font-bold text-green-900 mt-1">{(totalAvailable / 1000).toFixed(1)}K</p>
              <p className="text-xs text-green-600 mt-1">units free</p>
            </div>
            <div className="p-3 bg-green-200 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-700" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-3 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Avg Utilization</p>
              <p className="text-3xl font-bold text-orange-900 mt-1">{avgUtilization.toFixed(0)}%</p>
              <p className="text-xs text-orange-600 mt-1">across {filteredData.length} warehouses</p>
            </div>
            <div className="p-3 bg-orange-200 rounded-lg">
              <TrendingUp className="w-6 h-6 text-orange-700" />
            </div>
          </div>
        </div>
      </div>

      {/* Warehouse Capacity Overview */}
      <div className="bg-white rounded-xl border border-gray-200 p-3 mb-3">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Warehouse Capacity Overview</h3>
        <div className="space-y-2">
          {filteredData.map((warehouse, idx) => (
            <div key={idx} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <h4 className="text-sm font-bold text-gray-900">{warehouse.warehouse}</h4>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(warehouse.status)}`}>
                    {getStatusIcon(warehouse.status)}
                    {warehouse.status}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-600">
                    {getTrendIcon(warehouse.trend)}
                    {warehouse.trend}
                  </span>
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-bold ${getUtilizationColor(warehouse.utilizationPercent)}`}>
                    {warehouse.utilizationPercent}%
                  </p>
                  <p className="text-xs text-gray-500">utilization</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-3">
                <div>
                  <p className="text-xs text-gray-500">Location</p>
                  <p className="text-sm font-semibold text-gray-900">{warehouse.location}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Capacity</p>
                  <p className="text-sm font-bold text-blue-600">{warehouse.totalCapacity.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Used</p>
                  <p className="text-sm font-bold text-purple-600">{warehouse.usedCapacity.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Available</p>
                  <p className="text-sm font-bold text-green-600">{warehouse.availableCapacity.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Locations</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {warehouse.availableLocations}/{warehouse.totalLocations}
                  </p>
                </div>
              </div>

              <div className="mb-3">
                <div className="flex items-center justify-between mb-1 text-xs">
                  <span className="text-gray-600">Capacity Utilization</span>
                  <span className="font-semibold text-gray-900">
                    {warehouse.usedCapacity.toLocaleString()} / {warehouse.totalCapacity.toLocaleString()}
                  </span>
                </div>
                <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${warehouse.utilizationPercent >= 90 ? 'bg-red-500' : warehouse.utilizationPercent >= 80 ? 'bg-yellow-500' : 'bg-green-500'}`}
                    style={{ width: `${warehouse.utilizationPercent}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3 text-xs">
                <div className="p-2 bg-white rounded">
                  <p className="text-gray-500">Zones</p>
                  <p className="font-bold text-gray-900">{warehouse.totalZones}</p>
                </div>
                <div className="p-2 bg-white rounded">
                  <p className="text-gray-500">Avg Items/Loc</p>
                  <p className="font-bold text-gray-900">{warehouse.avgItemsPerLocation}</p>
                </div>
                <div className="p-2 bg-white rounded">
                  <p className="text-gray-500">Peak</p>
                  <p className="font-bold text-red-600">{warehouse.peakUtilization}%</p>
                </div>
                <div className="p-2 bg-white rounded">
                  <p className="text-gray-500">Low</p>
                  <p className="font-bold text-green-600">{warehouse.lowUtilization}%</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Zone-wise Capacity Breakdown */}
      {selectedWarehouse !== 'all' && zoneCapacityBreakdown[selectedWarehouse] && (
        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Zone-wise Capacity Breakdown</h3>
          <div className="space-y-3">
            {zoneCapacityBreakdown[selectedWarehouse].map((zone, idx) => (
              <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-900">{zone.zoneName}</span>
                  <span className={`text-sm font-bold ${getUtilizationColor(zone.utilization)}`}>
                    {zone.utilization}%
                  </span>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden mb-1">
                  <div
                    className={`h-full ${zone.utilization >= 90 ? 'bg-red-500' : zone.utilization >= 70 ? 'bg-yellow-500' : 'bg-green-500'}`}
                    style={{ width: `${zone.utilization}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>{zone.used.toLocaleString()} used</span>
                  <span>{(zone.capacity - zone.used).toLocaleString()} available</span>
                  <span>{zone.capacity.toLocaleString()} total</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
