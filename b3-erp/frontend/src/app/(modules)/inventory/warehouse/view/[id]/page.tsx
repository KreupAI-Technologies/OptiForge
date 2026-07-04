'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Edit, Warehouse as WarehouseIcon, MapPin, Package,
  Users, DollarSign, BarChart3, TrendingUp, AlertTriangle,
  CheckCircle, Phone, Mail, Calendar, Activity, Download,
  PieChart, Target, Zap, Layers, Box, TrendingDown, Eye
} from 'lucide-react';
import { inventoryService } from '@/services/InventoryService';

interface Warehouse {
  id: string;
  warehouseCode: string;
  warehouseName: string;
  warehouseType: 'main' | 'auxiliary' | 'transit' | 'external';
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  totalArea: number;
  usedArea: number;
  areaUnit: string;
  totalCapacity: number;
  usedCapacity: number;
  capacityUnit: string;
  zones: number;
  aisles: number;
  racks: number;
  bins: number;
  status: 'active' | 'inactive' | 'maintenance';
  temperatureControlled: boolean;
  securityEnabled: boolean;
  fireSafety: boolean;
  manager: string;
  establishedDate: string;
  createdBy: string;
  createdDate: string;
}

interface ZoneInfo {
  zone: string;
  name: string;
  aisles: number;
  capacity: number;
  utilized: number;
  itemsStored: number;
  utilizationPercentage: number;
}

interface StockSummary {
  category: string;
  itemCount: number;
  totalQuantity: number;
  totalValue: number;
  percentage: number;
}

interface ActivityLog {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  details: string;
  type: 'info' | 'warning' | 'success';
}

export default function WarehouseViewPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'zones' | 'stock' | 'activity' | 'analytics'>('overview');

  const emptyWarehouse: Warehouse = {
    id: params.id,
    warehouseCode: '',
    warehouseName: '',
    warehouseType: 'main',
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: '',
    contactPerson: '',
    contactPhone: '',
    contactEmail: '',
    totalArea: 0,
    usedArea: 0,
    areaUnit: '',
    totalCapacity: 0,
    usedCapacity: 0,
    capacityUnit: '',
    zones: 0,
    aisles: 0,
    racks: 0,
    bins: 0,
    status: 'active',
    temperatureControlled: false,
    securityEnabled: false,
    fireSafety: false,
    manager: '',
    establishedDate: '',
    createdBy: '',
    createdDate: '',
  };

  const [warehouse, setWarehouse] = useState<Warehouse>(emptyWarehouse);
  const [zones, setZones] = useState<ZoneInfo[]>([]);
  const [stockSummary, setStockSummary] = useState<StockSummary[]>([]);
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const id = params.id;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const [wh, locations, summary] = await Promise.all([
          inventoryService.getWarehouse(id),
          inventoryService.getWarehouseLocations(id),
          inventoryService.getWarehouseStockSummary(id),
        ]);
        if (cancelled) return;

        const typeMap: Record<string, Warehouse['warehouseType']> = {
          'Main Warehouse': 'main',
          'Branch Warehouse': 'auxiliary',
          'Transit Warehouse': 'transit',
          'External Warehouse': 'external',
        };
        const statusMap: Record<string, Warehouse['status']> = {
          Active: 'active',
          Inactive: 'inactive',
          Maintenance: 'maintenance',
        };
        const totalCapacity = Number(wh?.storageCapacity ?? 0);
        const usedCapacity = Number(wh?.currentUtilization ?? 0);
        const totalArea = Number(wh?.totalArea ?? 0);

        const mappedWarehouse: Warehouse = {
          id: wh?.id ?? id,
          warehouseCode: wh?.warehouseCode ?? '',
          warehouseName: wh?.warehouseName ?? '',
          warehouseType: typeMap[wh?.warehouseType] ?? 'main',
          address: [wh?.addressLine1, wh?.addressLine2].filter(Boolean).join(', '),
          city: wh?.city ?? '',
          state: wh?.state ?? '',
          pincode: wh?.postalCode ?? '',
          country: wh?.country ?? '',
          contactPerson: wh?.contactPerson ?? wh?.managerName ?? '',
          contactPhone: wh?.phone ?? '',
          contactEmail: wh?.email ?? '',
          totalArea,
          usedArea: 0,
          areaUnit: wh?.areaUnit ?? '',
          totalCapacity,
          usedCapacity,
          capacityUnit: wh?.capacityUnit ?? '',
          zones: Array.isArray(locations) ? locations.length : 0,
          aisles: 0,
          racks: 0,
          bins: 0,
          status: statusMap[wh?.status] ?? 'active',
          temperatureControlled:
            wh?.temperatureMin != null || wh?.temperatureMax != null,
          securityEnabled: Array.isArray(wh?.facilities)
            ? wh.facilities.some((f: string) => /cctv|security/i.test(f))
            : false,
          fireSafety: Array.isArray(wh?.facilities)
            ? wh.facilities.some((f: string) => /fire/i.test(f))
            : false,
          manager: wh?.managerName ?? '',
          establishedDate: wh?.createdAt ? String(wh.createdAt).slice(0, 10) : '',
          createdBy: wh?.createdBy ?? '',
          createdDate: wh?.createdAt ? String(wh.createdAt).slice(0, 10) : '',
        };
        setWarehouse(mappedWarehouse);

        const mappedZones: ZoneInfo[] = (Array.isArray(locations) ? locations : []).map(
          (loc: any) => {
            const capacity = Number(loc?.maxCapacity ?? 0);
            const utilized = Number(loc?.currentCapacity ?? 0);
            return {
              zone: loc?.zone ?? loc?.locationCode ?? '',
              name: loc?.locationName ?? loc?.locationCode ?? '',
              aisles: Number(loc?.aisle ?? 0) || 0,
              capacity,
              utilized,
              itemsStored: 0,
              utilizationPercentage: Number(loc?.utilizationPercentage ?? 0),
            };
          },
        );
        setZones(mappedZones);

        // stock-summary endpoint returns a single aggregate OBJECT; the JSX
        // consumes stockSummary as an array (.map/.reduce), so wrap it into a
        // one-row array matching the StockSummary shape.
        const totalValue = Number(summary?.totalValue ?? 0);
        const summaryRows: StockSummary[] =
          summary && (summary.totalItems || summary.totalQuantity || summary.totalValue)
            ? [
                {
                  category: summary?.warehouseName ?? mappedWarehouse.warehouseName ?? 'All Stock',
                  itemCount: Number(summary?.totalItems ?? 0),
                  totalQuantity: Number(summary?.totalQuantity ?? 0),
                  totalValue,
                  percentage: totalValue > 0 ? 100 : 0,
                },
              ]
            : [];
        setStockSummary(summaryRows);

        // No activity-log endpoint available; default to empty.
        setActivityLog([]);
      } catch (err: any) {
        if (!cancelled) setLoadError(err?.message ?? 'Failed to load warehouse');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'main': return 'Main Warehouse';
      case 'auxiliary': return 'Auxiliary Storage';
      case 'transit': return 'Transit Hub';
      case 'external': return 'External Storage';
      default: return type;
    }
  };

  const getUtilizationColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600 bg-red-100';
    if (percentage >= 75) return 'text-orange-600 bg-orange-100';
    if (percentage >= 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const areaUtilization = ((warehouse.usedArea / warehouse.totalArea) * 100).toFixed(1);
  const capacityUtilization = ((warehouse.usedCapacity / warehouse.totalCapacity) * 100).toFixed(1);

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-2">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{warehouse.warehouseName}</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(warehouse.status)}`}>
                {warehouse.status.toUpperCase()}
              </span>
              <span className="px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-700">
                {getTypeLabel(warehouse.warehouseType)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <WarehouseIcon className="w-4 h-4" />
                <span className="font-mono font-semibold">{warehouse.warehouseCode}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {warehouse.city}, {warehouse.state}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                Manager: {warehouse.manager}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={() => router.push(`/inventory/warehouse/edit/${params.id}`)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700"
          >
            <Edit className="w-4 h-4" />
            Edit Warehouse
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-5 gap-2">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl text-white">
          <div className="flex items-center justify-between mb-2">
            <BarChart3 className="w-8 h-8 opacity-80" />
          </div>
          <div className="text-3xl font-bold mb-1">{zones.reduce((sum, z) => sum + z.itemsStored, 0)}</div>
          <div className="text-blue-100 text-sm">Total Items</div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-xl text-white">
          <div className="flex items-center justify-between mb-2">
            <Package className="w-8 h-8 opacity-80" />
            <span className="text-sm text-green-100">{areaUtilization}%</span>
          </div>
          <div className="text-3xl font-bold mb-1">{warehouse.usedArea.toLocaleString()}</div>
          <div className="text-green-100 text-sm">Used Area ({warehouse.areaUnit})</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-xl text-white">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 opacity-80" />
            <span className="text-sm text-purple-100">{capacityUtilization}%</span>
          </div>
          <div className="text-3xl font-bold mb-1">{warehouse.usedCapacity.toLocaleString()}</div>
          <div className="text-purple-100 text-sm">Used Capacity ({warehouse.capacityUnit})</div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-3 rounded-xl text-white">
          <div className="flex items-center justify-between mb-2">
            <MapPin className="w-8 h-8 opacity-80" />
          </div>
          <div className="text-3xl font-bold mb-1">{warehouse.zones}</div>
          <div className="text-orange-100 text-sm">Storage Zones</div>
        </div>

        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-3 rounded-xl text-white">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 opacity-80" />
          </div>
          <div className="text-3xl font-bold mb-1">₹{(stockSummary.reduce((sum, s) => sum + s.totalValue, 0) / 10000000).toFixed(1)}Cr</div>
          <div className="text-indigo-100 text-sm">Stock Value</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-3">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('zones')}
            className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
              activeTab === 'zones'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Zones & Capacity
          </button>
          <button
            onClick={() => setActiveTab('stock')}
            className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
              activeTab === 'stock'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Stock Summary
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
              activeTab === 'activity'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Recent Activity
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
              activeTab === 'analytics'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Capacity Analytics
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-3">
          {/* Warehouse Information */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-3 rounded-lg border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                <WarehouseIcon className="w-5 h-5 text-blue-600" />
                Warehouse Information
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Warehouse Code</span>
                  <span className="font-mono font-semibold text-gray-900">{warehouse.warehouseCode}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Type</span>
                  <span className="font-medium text-gray-900">{getTypeLabel(warehouse.warehouseType)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Status</span>
                  <span className={`px-2 py-1 rounded text-sm font-semibold ${getStatusColor(warehouse.status)}`}>
                    {warehouse.status.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Manager</span>
                  <span className="font-medium text-gray-900">{warehouse.manager}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Established Date</span>
                  <span className="font-medium text-gray-900">{warehouse.establishedDate}</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-3 rounded-lg border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-green-600" />
                Location & Contact
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-600 block mb-1">Address</label>
                  <p className="text-sm font-medium text-gray-900">{warehouse.address}</p>
                  <p className="text-sm text-gray-700 mt-1">
                    {warehouse.city}, {warehouse.state} - {warehouse.pincode}
                  </p>
                </div>
                <div className="pt-3 border-t border-gray-200">
                  <label className="text-sm text-gray-600 block mb-2">Contact Person</label>
                  <p className="font-semibold text-gray-900 mb-2">{warehouse.contactPerson}</p>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700">{warehouse.contactPhone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700">{warehouse.contactEmail}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Capacity Information */}
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              Capacity & Utilization
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-gray-600 block mb-2">Area Utilization</label>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">
                    {warehouse.usedArea.toLocaleString()} / {warehouse.totalArea.toLocaleString()} {warehouse.areaUnit}
                  </span>
                  <span className={`px-2 py-1 rounded text-sm font-bold ${getUtilizationColor(parseFloat(areaUtilization))}`}>
                    {areaUtilization}%
                  </span>
                </div>
                <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      parseFloat(areaUtilization) >= 90 ? 'bg-red-500' :
                      parseFloat(areaUtilization) >= 75 ? 'bg-orange-500' :
                      parseFloat(areaUtilization) >= 50 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${areaUtilization}%` }}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-600 block mb-2">Capacity Utilization</label>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">
                    {warehouse.usedCapacity.toLocaleString()} / {warehouse.totalCapacity.toLocaleString()} {warehouse.capacityUnit}
                  </span>
                  <span className={`px-2 py-1 rounded text-sm font-bold ${getUtilizationColor(parseFloat(capacityUtilization))}`}>
                    {capacityUtilization}%
                  </span>
                </div>
                <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      parseFloat(capacityUtilization) >= 90 ? 'bg-red-500' :
                      parseFloat(capacityUtilization) >= 75 ? 'bg-orange-500' :
                      parseFloat(capacityUtilization) >= 50 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${capacityUtilization}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Storage Infrastructure */}
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Storage Infrastructure</h3>
            <div className="grid grid-cols-4 gap-3">
              <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-3xl font-bold text-blue-900 mb-1">{warehouse.zones}</div>
                <div className="text-sm text-blue-600">Zones</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="text-3xl font-bold text-green-900 mb-1">{warehouse.aisles}</div>
                <div className="text-sm text-green-600">Aisles</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div className="text-3xl font-bold text-purple-900 mb-1">{warehouse.racks}</div>
                <div className="text-sm text-purple-600">Racks</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div className="text-3xl font-bold text-orange-900 mb-1">{warehouse.bins}</div>
                <div className="text-sm text-orange-600">Storage Bins</div>
              </div>
            </div>
          </div>

          {/* Facilities */}
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Facilities & Features</h3>
            <div className="grid grid-cols-3 gap-2">
              <div className={`flex items-center gap-3 p-3 rounded-lg border-2 ${
                warehouse.temperatureControlled ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
              }`}>
                {warehouse.temperatureControlled ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-gray-400" />
                )}
                <div>
                  <div className="font-semibold text-gray-900">Temperature Control</div>
                  <div className="text-sm text-gray-600">
                    {warehouse.temperatureControlled ? 'Available' : 'Not Available'}
                  </div>
                </div>
              </div>

              <div className={`flex items-center gap-3 p-3 rounded-lg border-2 ${
                warehouse.securityEnabled ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
              }`}>
                {warehouse.securityEnabled ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-gray-400" />
                )}
                <div>
                  <div className="font-semibold text-gray-900">Security System</div>
                  <div className="text-sm text-gray-600">
                    {warehouse.securityEnabled ? 'Enabled' : 'Not Enabled'}
                  </div>
                </div>
              </div>

              <div className={`flex items-center gap-3 p-3 rounded-lg border-2 ${
                warehouse.fireSafety ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
              }`}>
                {warehouse.fireSafety ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-gray-400" />
                )}
                <div>
                  <div className="font-semibold text-gray-900">Fire Safety</div>
                  <div className="text-sm text-gray-600">
                    {warehouse.fireSafety ? 'Compliant' : 'Not Compliant'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'zones' && (
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-3">Zone Details & Utilization</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Zone</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Name</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Aisles</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Capacity</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Utilized</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Items</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Utilization</th>
                </tr>
              </thead>
              <tbody>
                {zones.map((zone) => (
                  <tr key={zone.zone} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-lg text-blue-600">{zone.zone}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-gray-900">{zone.name}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-sm font-medium text-gray-900">{zone.aisles}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-sm font-medium text-gray-900">{zone.capacity.toLocaleString()}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-sm font-bold text-blue-700">{zone.utilized.toLocaleString()}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-sm font-medium text-gray-900">{zone.itemsStored}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              zone.utilizationPercentage >= 90 ? 'bg-red-500' :
                              zone.utilizationPercentage >= 75 ? 'bg-orange-500' :
                              zone.utilizationPercentage >= 50 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${zone.utilizationPercentage}%` }}
                          />
                        </div>
                        <span className={`text-sm font-bold ${getUtilizationColor(zone.utilizationPercentage)}`}>
                          {zone.utilizationPercentage.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'stock' && (
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-3">Stock Summary by Category</h3>
          <div className="space-y-2">
            {stockSummary.map((stock, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">{stock.category}</h4>
                    <div className="text-sm text-gray-600">
                      {stock.itemCount} items • {stock.totalQuantity.toLocaleString()} units
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-700">
                      ₹{(stock.totalValue / 10000000).toFixed(2)}Cr
                    </div>
                    <div className="text-sm text-gray-600">{stock.percentage.toFixed(1)}% of total</div>
                  </div>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                    style={{ width: `${stock.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-sm text-blue-600 mb-1">Total Items</div>
                <div className="text-2xl font-bold text-blue-900">
                  {stockSummary.reduce((sum, s) => sum + s.itemCount, 0)}
                </div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-sm text-green-600 mb-1">Total Quantity</div>
                <div className="text-2xl font-bold text-green-900">
                  {stockSummary.reduce((sum, s) => sum + s.totalQuantity, 0).toLocaleString()}
                </div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-sm text-purple-600 mb-1">Total Value</div>
                <div className="text-2xl font-bold text-purple-900">
                  ₹{(stockSummary.reduce((sum, s) => sum + s.totalValue, 0) / 10000000).toFixed(2)}Cr
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-3">Recent Activity</h3>
          <div className="space-y-3">
            {activityLog.map((log) => (
              <div key={log.id} className="flex items-start gap-2 p-3 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  log.type === 'success' ? 'bg-green-100 text-green-600' :
                  log.type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                  'bg-blue-100 text-blue-600'
                }`}>
                  <Activity className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-1">
                    <h4 className="font-semibold text-gray-900">{log.action}</h4>
                    <span className="text-xs text-gray-500">{log.timestamp}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{log.details}</p>
                  <p className="text-xs text-gray-500">by {log.user}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-3">
          {/* Capacity & Utilization Analytics */}
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Capacity & Space Utilization Analytics
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <Layers className="w-8 h-8 text-blue-600" />
                  <span className="text-2xl font-bold text-blue-600">{areaUtilization}%</span>
                </div>
                <div className="text-sm text-gray-600 mb-2">Space Utilization</div>
                <div className="text-xs text-gray-500 mb-2">{warehouse.usedArea.toLocaleString()} / {warehouse.totalArea.toLocaleString()} {warehouse.areaUnit}</div>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full" style={{ width: `${areaUtilization}%` }}></div>
                </div>
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Available: {(warehouse.totalArea - warehouse.usedArea).toLocaleString()} {warehouse.areaUnit}</span>
                  <span className={parseFloat(areaUtilization) > 85 ? 'text-orange-600 font-semibold' : 'text-green-600'}>
                    {parseFloat(areaUtilization) > 85 ? 'High' : 'Optimal'}
                  </span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-3 rounded-lg border border-purple-200">
                <div className="flex items-center justify-between mb-2">
                  <Package className="w-8 h-8 text-purple-600" />
                  <span className="text-2xl font-bold text-purple-600">{capacityUtilization}%</span>
                </div>
                <div className="text-sm text-gray-600 mb-2">Pallet Capacity</div>
                <div className="text-xs text-gray-500 mb-2">{warehouse.usedCapacity.toLocaleString()} / {warehouse.totalCapacity.toLocaleString()} {warehouse.capacityUnit}</div>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full" style={{ width: `${capacityUtilization}%` }}></div>
                </div>
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Available: {(warehouse.totalCapacity - warehouse.usedCapacity).toLocaleString()} {warehouse.capacityUnit}</span>
                  <span className={parseFloat(capacityUtilization) > 85 ? 'text-orange-600 font-semibold' : 'text-green-600'}>
                    {parseFloat(capacityUtilization) > 85 ? 'High' : 'Optimal'}
                  </span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-3 rounded-lg border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="w-8 h-8 text-green-600" />
                  <span className="text-sm font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">Efficient</span>
                </div>
                <div className="text-sm text-gray-600 mb-2">Storage Efficiency</div>
                <div className="text-3xl font-bold text-gray-900 mb-1">92.5%</div>
                <div className="text-xs text-gray-500 mb-2">vs 88% industry average</div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Picking efficiency:</span>
                    <span className="font-semibold text-green-600">95%</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Accuracy rate:</span>
                    <span className="font-semibold text-blue-600">98.5%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Zone-wise Performance Heatmap */}
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Eye className="w-5 h-5 text-indigo-600" />
              Zone Performance Heatmap
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {zones.map((zone, index) => {
                const utilization = zone.utilizationPercentage;
                const getHeatColor = (util: number) => {
                  if (util >= 90) return 'from-red-400 to-red-600 text-white';
                  if (util >= 75) return 'from-orange-400 to-orange-600 text-white';
                  if (util >= 50) return 'from-yellow-400 to-yellow-600 text-white';
                  return 'from-green-400 to-green-600 text-white';
                };
                
                return (
                  <div key={zone.zone} className={`bg-gradient-to-br ${getHeatColor(utilization)} p-3 rounded-lg shadow-md hover:shadow-lg transition-shadow`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-lg font-bold">Zone {zone.zone}</span>
                      <span className="text-2xl font-bold">{utilization}%</span>
                    </div>
                    <div className="text-sm opacity-90 mb-3">{zone.name}</div>
                    <div className="space-y-1 text-xs opacity-90">
                      <div className="flex justify-between">
                        <span>Capacity:</span>
                        <span className="font-semibold">{zone.utilized.toLocaleString()} / {zone.capacity.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Items:</span>
                        <span className="font-semibold">{zone.itemsStored}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Aisles:</span>
                        <span className="font-semibold">{zone.aisles}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-6 flex items-center justify-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-br from-green-400 to-green-600 rounded"></div>
                <span className="text-xs text-gray-600">0-50% (Underutilized)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded"></div>
                <span className="text-xs text-gray-600">50-75% (Optimal)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-br from-orange-400 to-orange-600 rounded"></div>
                <span className="text-xs text-gray-600">75-90% (High)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-br from-red-400 to-red-600 rounded"></div>
                <span className="text-xs text-gray-600">90-100% (Critical)</span>
              </div>
            </div>
          </div>

          {/* Storage Optimization Recommendations */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-3 rounded-lg border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-600" />
                Storage Optimization Insights
              </h3>
              <div className="space-y-2">
                <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-3 rounded-lg border border-emerald-100">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-gray-700">Space Optimization Score</span>
                    <span className="text-xs bg-emerald-600 text-white px-2 py-1 rounded-full">Excellent</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-4xl font-bold text-emerald-600">8.7/10</div>
                    <div className="flex-1">
                      <div className="text-xs text-gray-600 mb-1">Compared to industry benchmark</div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-gradient-to-r from-emerald-500 to-green-500 h-2 rounded-full" style={{ width: '87%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-900 mb-1">Zone D - Optimization Opportunity</div>
                      <div className="text-xs text-gray-600">Currently at 95% capacity. Consider expanding vertical storage or redistributing to Zone E (52% utilized)</div>
                      <div className="mt-2 text-xs text-blue-600 font-semibold">Potential space savings: 450 sq ft</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-100">
                    <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-900 mb-1">Zone A - Nearing Capacity</div>
                      <div className="text-xs text-gray-600">90% utilized. Recommend immediate action: expand vertical racks or transfer slow-moving items</div>
                      <div className="mt-2 text-xs text-orange-600 font-semibold">Action required within 2 weeks</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                    <TrendingUp className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-900 mb-1">Cross-Docking Efficiency</div>
                      <div className="text-xs text-gray-600">Transit zone operating at 67% efficiency. Increase by 20% through improved scheduling</div>
                      <div className="mt-2 text-xs text-green-600 font-semibold">Estimated time savings: 3.5 hrs/day</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-3 rounded-lg border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-purple-600" />
                Cost & Operational Metrics
              </h3>
              <div className="space-y-2">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-lg border border-purple-100">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-gray-700">Monthly Operating Cost</span>
                    <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded-full">-8% vs last month</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Total Cost</div>
                      <div className="text-2xl font-bold text-purple-600">₹12.5L</div>
                      <div className="text-xs text-gray-500">October 2025</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Per Sq Ft Cost</div>
                      <div className="text-2xl font-bold text-blue-600">₹25</div>
                      <div className="text-xs text-gray-500">Industry: ₹28</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-700">Cost Breakdown</span>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-600">Labor (45%)</span>
                          <span className="font-semibold">₹5.6L</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-600">Utilities (30%)</span>
                          <span className="font-semibold">₹3.8L</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: '30%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-600">Maintenance (15%)</span>
                          <span className="font-semibold">₹1.9L</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-orange-500 h-2 rounded-full" style={{ width: '15%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-600">Other (10%)</span>
                          <span className="font-semibold">₹1.2L</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-purple-500 h-2 rounded-full" style={{ width: '10%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg border border-green-100">
                  <div className="flex items-center gap-3 mb-3">
                    <Zap className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-semibold text-gray-700">Cost Savings Potential</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Energy Optimization</div>
                      <div className="text-lg font-bold text-green-600">₹45K/mo</div>
                      <div className="text-xs text-gray-500">LED lighting, HVAC</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Process Automation</div>
                      <div className="text-lg font-bold text-blue-600">₹85K/mo</div>
                      <div className="text-xs text-gray-500">AGV, WMS upgrades</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Predictive Analytics */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-3 rounded-lg border border-indigo-200">
            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Zap className="w-5 h-5 text-indigo-600" />
              Predictive Analytics & Forecasts
            </h3>
            <div className="grid grid-cols-4 gap-2">
              <div className="bg-white p-3 rounded-lg border border-indigo-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Capacity Forecast</div>
                    <div className="text-sm font-bold text-gray-900">Next 90 days</div>
                  </div>
                </div>
                <p className="text-xs text-gray-600">Expected to reach 85% utilization by Jan 15, 2026. Plan expansion or stock reduction</p>
              </div>

              <div className="bg-white p-3 rounded-lg border border-indigo-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Peak Season Alert</div>
                    <div className="text-sm font-bold text-gray-900">Dec 10-Jan 5</div>
                  </div>
                </div>
                <p className="text-xs text-gray-600">Demand surge expected. Reserve 2,000 additional pallet positions for seasonal inventory</p>
              </div>

              <div className="bg-white p-3 rounded-lg border border-indigo-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Inventory Turnover</div>
                    <div className="text-sm font-bold text-gray-900">14.2x/year</div>
                  </div>
                </div>
                <p className="text-xs text-gray-600">Exceeds industry average of 11.5x. Efficient stock rotation and fast-moving inventory mix</p>
              </div>

              <div className="bg-white p-3 rounded-lg border border-indigo-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">ROI Improvement</div>
                    <div className="text-sm font-bold text-gray-900">+12% potential</div>
                  </div>
                </div>
                <p className="text-xs text-gray-600">Implement recommended optimizations to improve warehouse ROI from current 18% to 20.2%</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Metadata */}
      <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <div>
            <span className="text-gray-600">Created By: </span>
            <span className="font-medium text-gray-900">{warehouse.createdBy}</span>
            <span className="text-gray-500 ml-2">{warehouse.createdDate}</span>
          </div>
          <div>
            <span className="text-gray-600">Warehouse ID: </span>
            <span className="font-mono font-medium text-gray-900">{warehouse.id}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
