'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogisticsService } from '@/services/logistics.service';
import { ArrowLeft, Search, Package, Truck, CheckCircle, Clock, AlertTriangle, User, Weight, Maximize } from 'lucide-react';

interface LoadingBay {
  id: string;
  bayNo: string;
  bayName: string;
  status: 'available' | 'loading' | 'occupied' | 'maintenance';
  currentShipment: string;
  vehicleNo: string;
  driverName: string;
  startTime: string;
  estimatedEnd: string;
  loadedItems: number;
  totalItems: number;
  loadedWeight: number;
  totalWeight: number;
  progress: number;
}

export default function LoadingPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const [loadingBays, setLoadingBays] = useState<LoadingBay[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await LogisticsService.getShipments();
        const list = Array.isArray(res) ? res : ((res as any)?.data ?? (res as any)?.items ?? []);
        if (cancelled) return;
        setLoadingBays((list as any[]).map((r, i) => {
          const loaded = Number(r.loadedItems ?? 0);
          const total = Number(r.totalItems ?? r.itemCount ?? 0);
          return {
            id: String(r.id ?? i),
            bayNo: r.bayNo ?? r.dockDoor ?? '',
            bayName: r.bayName ?? '',
            status: (r.status ?? 'available') as LoadingBay['status'],
            currentShipment: r.currentShipment ?? r.shipmentNumber ?? '',
            vehicleNo: r.vehicleNo ?? r.vehicleNumber ?? '',
            driverName: r.driverName ?? '',
            startTime: r.startTime ?? r.scheduledTime ?? '',
            estimatedEnd: r.estimatedEnd ?? '',
            loadedItems: loaded,
            totalItems: total,
            loadedWeight: Number(r.loadedWeight ?? 0),
            totalWeight: Number(r.totalWeight ?? r.weight ?? 0),
            progress: Number(r.progress ?? (total ? Math.round((loaded / total) * 100) : 0)),
          };
        }));
      } catch (e) {
        if (!cancelled) setLoadError(e instanceof Error ? e.message : 'Failed to load loading bays');
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filteredBays = loadingBays.filter(bay => {
    const matchesSearch = bay.bayNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         bay.bayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         bay.currentShipment.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         bay.vehicleNo.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || bay.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-700 border-green-200';
      case 'loading': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'occupied': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'maintenance': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <CheckCircle className="w-3 h-3" />;
      case 'loading': return <Truck className="w-3 h-3" />;
      case 'occupied': return <Package className="w-3 h-3" />;
      case 'maintenance': return <AlertTriangle className="w-3 h-3" />;
      default: return null;
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return 'bg-green-600';
    if (progress >= 50) return 'bg-blue-600';
    if (progress >= 25) return 'bg-yellow-600';
    return 'bg-red-600';
  };

  return (
    <div className="min-h-screen bg-gray-50 px-3 py-2">
      <div className="mb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-2">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Loading Bays</h1>
            <p className="text-sm text-gray-500 mt-1">Monitor and manage loading bay operations</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Available</p>
              <p className="text-3xl font-bold text-green-900 mt-1">
                {loadingBays.filter(b => b.status === 'available').length}
              </p>
            </div>
            <CheckCircle className="w-6 h-6 text-green-700" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Loading</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">
                {loadingBays.filter(b => b.status === 'loading').length}
              </p>
            </div>
            <Truck className="w-6 h-6 text-blue-700" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-3 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">Occupied</p>
              <p className="text-3xl font-bold text-yellow-900 mt-1">
                {loadingBays.filter(b => b.status === 'occupied').length}
              </p>
            </div>
            <Package className="w-6 h-6 text-yellow-700" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-3 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Maintenance</p>
              <p className="text-3xl font-bold text-red-900 mt-1">
                {loadingBays.filter(b => b.status === 'maintenance').length}
              </p>
            </div>
            <AlertTriangle className="w-6 h-6 text-red-700" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-3 mb-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by bay, shipment, or vehicle..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="loading">Loading</option>
            <option value="occupied">Occupied</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {filteredBays.map((bay) => (
          <div key={bay.id} className="bg-white rounded-xl border border-gray-200 p-3 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Maximize className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{bay.bayNo}</h3>
                  <p className="text-sm text-gray-500">{bay.bayName}</p>
                </div>
              </div>
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(bay.status)}`}>
                {getStatusIcon(bay.status)}
                {bay.status.toUpperCase()}
              </span>
            </div>

            {bay.status === 'loading' || bay.status === 'occupied' ? (
              <div className="space-y-2">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Shipment No</p>
                      <p className="text-sm font-semibold text-blue-600">{bay.currentShipment}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Vehicle No</p>
                      <p className="text-sm font-mono font-semibold text-gray-900">{bay.vehicleNo}</p>
                    </div>
                    <div className="col-span-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <p className="text-sm text-gray-700">Driver: <span className="font-semibold">{bay.driverName}</span></p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Package className="w-4 h-4 text-blue-600" />
                      <p className="text-xs text-blue-600 font-medium">Items Loaded</p>
                    </div>
                    <p className="text-2xl font-bold text-blue-900">
                      {bay.loadedItems}<span className="text-sm text-blue-600">/{bay.totalItems}</span>
                    </p>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Weight className="w-4 h-4 text-purple-600" />
                      <p className="text-xs text-purple-600 font-medium">Weight (kg)</p>
                    </div>
                    <p className="text-2xl font-bold text-purple-900">
                      {bay.loadedWeight}<span className="text-sm text-purple-600">/{bay.totalWeight}</span>
                    </p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-700">Loading Progress</p>
                    <p className="text-sm font-bold text-gray-900">{bay.progress.toFixed(0)}%</p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${getProgressColor(bay.progress)}`}
                      style={{ width: `${bay.progress}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-gray-500">Start Time</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <p className="font-semibold text-gray-900">{bay.startTime}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-500">Estimated End</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3 text-green-500" />
                      <p className="font-semibold text-green-600">{bay.estimatedEnd}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : bay.status === 'available' ? (
              <div className="py-8 text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mb-3" />
                <p className="text-green-700 font-semibold">Bay Available</p>
                <p className="text-sm text-gray-500 mt-1">Ready for next shipment</p>
              </div>
            ) : (
              <div className="py-8 text-center">
                <AlertTriangle className="w-12 h-12 text-red-500 mb-3" />
                <p className="text-red-700 font-semibold">Under Maintenance</p>
                <p className="text-sm text-gray-500 mt-1">Bay temporarily unavailable</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredBays.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Truck className="w-12 h-12 text-gray-400 mb-3" />
          <p className="text-gray-500">No loading bays found</p>
        </div>
      )}

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-3">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Loading Bay Operations:</h3>
        <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
          <li><strong>Available:</strong> Bay is empty and ready to receive next shipment</li>
          <li><strong>Occupied:</strong> Vehicle assigned to bay, awaiting loading start</li>
          <li><strong>Loading:</strong> Active loading operation in progress</li>
          <li><strong>Maintenance:</strong> Bay under maintenance or repair, temporarily unavailable</li>
          <li>Monitor loading progress in real-time to optimize bay utilization</li>
          <li>Ensure proper weight distribution and secure cargo before dispatch</li>
        </ul>
      </div>
    </div>
  );
}
