'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogisticsService } from '@/services/logistics.service';
import { ArrowLeft, Search, Truck, MapPin, Clock, AlertTriangle, CheckCircle, Package, Filter, Eye } from 'lucide-react';

interface YardVehicle {
  id: string;
  vehicleNo: string;
  carrierName: string;
  driverName: string;
  driverPhone: string;
  checkInTime: string;
  parkingSpot: string;
  vehicleType: 'truck' | 'trailer' | 'container';
  status: 'checked-in' | 'waiting' | 'at-dock' | 'loading' | 'departed';
  appointmentNo: string;
  dockAssigned: string;
  estimatedDeparture: string;
  waitTime: number;
  trailerNo: string;
  sealNo: string;
  notes: string;
}

export default function YardManagementPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [yardVehicles, setYardVehicles] = useState<YardVehicle[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await LogisticsService.getYardVehicles();
        const list = Array.isArray(res) ? res : ((res as any)?.data ?? (res as any)?.items ?? []);
        if (cancelled) return;
        setYardVehicles((list as any[]).map((r, i) => ({
          id: String(r.id ?? i),
          vehicleNo: r.vehicleNo ?? '',
          carrierName: r.carrierName ?? '',
          driverName: r.driverName ?? '',
          driverPhone: r.driverPhone ?? '',
          checkInTime: r.checkInTime ?? '',
          parkingSpot: r.parkingSpot ?? '',
          vehicleType: (r.vehicleType ?? 'truck') as YardVehicle['vehicleType'],
          status: (r.status ?? 'checked-in') as YardVehicle['status'],
          appointmentNo: r.appointmentNo ?? '',
          dockAssigned: r.dockAssigned ?? '',
          estimatedDeparture: r.estimatedDeparture ?? '',
          waitTime: Number(r.waitTime ?? 0),
          trailerNo: r.trailerNo ?? '',
          sealNo: r.sealNo ?? '',
          notes: r.notes ?? '',
        })));
      } catch (e) {
        if (!cancelled) setLoadError(e instanceof Error ? e.message : 'Failed to load yard vehicles');
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const yardStats = {
    total: yardVehicles.length,
    checkedIn: yardVehicles.filter(v => v.status === 'checked-in').length,
    waiting: yardVehicles.filter(v => v.status === 'waiting').length,
    atDock: yardVehicles.filter(v => v.status === 'at-dock').length,
    loading: yardVehicles.filter(v => v.status === 'loading').length,
    avgWaitTime: Math.round(yardVehicles.reduce((sum, v) => sum + v.waitTime, 0) / yardVehicles.length),
    longWait: yardVehicles.filter(v => v.waitTime > 30).length
  };

  const filteredVehicles = yardVehicles.filter(vehicle => {
    const matchesSearch =
      vehicle.vehicleNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.carrierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.parkingSpot.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || vehicle.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'checked-in': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'waiting': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'at-dock': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'loading': return 'bg-green-100 text-green-700 border-green-200';
      case 'departed': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-3 py-2">
      <div className="mb-3 flex items-center gap-2">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Yard Management</h1>
          <p className="text-sm text-gray-500 mt-1">Track vehicles and parking in warehouse yard</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 mb-3">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-3 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <Truck className="w-7 h-7 opacity-80" />
            <span className="text-2xl font-bold">{yardStats.total}</span>
          </div>
          <p className="text-xs font-medium opacity-90">Total Vehicles</p>
        </div>

        <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white rounded-xl p-3 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-7 h-7 opacity-80" />
            <span className="text-2xl font-bold">{yardStats.checkedIn}</span>
          </div>
          <p className="text-xs font-medium opacity-90">Checked In</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white rounded-xl p-3 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-7 h-7 opacity-80" />
            <span className="text-2xl font-bold">{yardStats.waiting}</span>
          </div>
          <p className="text-xs font-medium opacity-90">Waiting</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-3 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <MapPin className="w-7 h-7 opacity-80" />
            <span className="text-2xl font-bold">{yardStats.atDock}</span>
          </div>
          <p className="text-xs font-medium opacity-90">At Dock</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-3 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <Package className="w-7 h-7 opacity-80" />
            <span className="text-2xl font-bold">{yardStats.loading}</span>
          </div>
          <p className="text-xs font-medium opacity-90">Loading</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl p-3 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-7 h-7 opacity-80" />
            <span className="text-2xl font-bold">{yardStats.avgWaitTime}</span>
          </div>
          <p className="text-xs font-medium opacity-90">Avg Wait (mins)</p>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl p-3 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-7 h-7 opacity-80" />
            <span className="text-2xl font-bold">{yardStats.longWait}</span>
          </div>
          <p className="text-xs font-medium opacity-90">Long Wait</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-3 mb-3">
        <div className="flex flex-col md:flex-row gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by vehicle no, carrier, driver, or parking spot..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="checked-in">Checked In</option>
            <option value="waiting">Waiting</option>
            <option value="at-dock">At Dock</option>
            <option value="loading">Loading</option>
            <option value="departed">Departed</option>
          </select>
        </div>

        <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
          <Filter className="w-4 h-4" />
          <span>Showing {filteredVehicles.length} of {yardStats.total} vehicles</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        {filteredVehicles.map((vehicle) => (
          <div key={vehicle.id} className="bg-white rounded-xl border border-gray-200 p-3 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-gray-900">{vehicle.vehicleNo}</h3>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(vehicle.status)}`}>
                    {vehicle.status}
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700">
                    {vehicle.vehicleType}
                  </span>
                </div>
                <p className="text-sm font-semibold text-blue-600">{vehicle.carrierName}</p>
              </div>

              {vehicle.waitTime > 30 && (
                <div className="bg-red-50 rounded-lg p-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-2">
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xs text-blue-600 font-medium mb-1">Driver</p>
                <p className="text-sm font-bold text-blue-900">{vehicle.driverName}</p>
                <p className="text-xs text-blue-700 mt-0.5">{vehicle.driverPhone}</p>
              </div>

              <div className="bg-green-50 rounded-lg p-3">
                <p className="text-xs text-green-600 font-medium mb-1">Parking Spot</p>
                <p className="text-lg font-bold text-green-900">{vehicle.parkingSpot}</p>
                <p className="text-xs text-green-700 mt-0.5">Checked in: {vehicle.checkInTime.split(' ')[1]}</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3 mb-2">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-gray-500">Appointment</p>
                  <p className="font-medium text-gray-900">{vehicle.appointmentNo}</p>
                </div>
                <div>
                  <p className="text-gray-500">Dock Assigned</p>
                  <p className="font-medium text-gray-900">{vehicle.dockAssigned}</p>
                </div>
                <div>
                  <p className="text-gray-500">Est. Departure</p>
                  <p className="font-medium text-gray-900">{vehicle.estimatedDeparture.split(' ')[1]}</p>
                </div>
                <div>
                  <p className="text-gray-500">Wait Time</p>
                  <p className={`font-medium ${vehicle.waitTime > 30 ? 'text-red-600' : vehicle.waitTime > 0 ? 'text-yellow-600' : 'text-green-600'}`}>
                    {vehicle.waitTime} mins
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-2">
              {vehicle.trailerNo && (
                <div className="bg-purple-50 rounded-lg p-2">
                  <p className="text-xs text-purple-600 font-medium">Trailer</p>
                  <p className="text-sm font-bold text-purple-900">{vehicle.trailerNo}</p>
                </div>
              )}
              <div className="bg-orange-50 rounded-lg p-2">
                <p className="text-xs text-orange-600 font-medium">Seal No</p>
                <p className="text-sm font-bold text-orange-900">{vehicle.sealNo}</p>
              </div>
            </div>

            {vehicle.notes && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-2">
                <p className="text-xs text-yellow-600 font-medium mb-1">Notes</p>
                <p className="text-sm text-yellow-900">{vehicle.notes}</p>
              </div>
            )}

            <div className="flex gap-2">
              <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm flex items-center justify-center gap-2">
                <Eye className="w-4 h-4" />
                View Details
              </button>
              {vehicle.status === 'waiting' && (
                <button className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-medium text-sm">
                  Assign Dock
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredVehicles.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Truck className="w-16 h-16 text-gray-400 mb-2" />
          <p className="text-gray-500 text-lg mb-2">No vehicles found</p>
          <p className="text-sm text-gray-400">Try adjusting your search or filter criteria</p>
        </div>
      )}

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-3">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Yard Status Guide:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-blue-700">
          <div><span className="font-medium">Checked In:</span> Vehicle entered yard, parking assigned</div>
          <div><span className="font-medium">Waiting:</span> Waiting for dock assignment or availability</div>
          <div><span className="font-medium">At Dock:</span> Vehicle moved to assigned dock door</div>
          <div><span className="font-medium">Loading:</span> Loading/unloading operation in progress</div>
        </div>
      </div>
    </div>
  );
}
