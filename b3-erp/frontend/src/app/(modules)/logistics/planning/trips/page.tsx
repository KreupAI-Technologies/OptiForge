'use client';

import React, { useState, useEffect } from 'react';
import {
  Navigation,
  Plus,
  Edit2,
  Eye,
  Search,
  MapPin,
  Calendar,
  Clock,
  Truck,
  Package,
  CheckCircle,
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import { LogisticsService } from '@/services/logistics.service';

interface TripDetails {
  id: number;
  tripId: string;
  dispatchId: string;
  vehicleNumber: string;
  driverName: string;
  routeCode: string;
  origin: string;
  destination: string;
  departureDate: string;
  departureTime: string;
  arrivalDate: string;
  arrivalTime: string;
  actualDeparture: string | null;
  actualArrival: string | null;
  distance: number; // in km
  estimatedDuration: number; // in hours
  actualDuration: number | null; // in hours
  fuelConsumed: number; // in liters
  averageSpeed: number; // in km/h
  stops: number;
  delays: number; // in minutes
  currentStatus: 'scheduled' | 'in-progress' | 'completed' | 'delayed' | 'cancelled';
  currentLocation: string;
  completionPercentage: number;
  shipments: number;
  totalWeight: number; // in kg
  deliveredShipments: number;
  remainingShipments: number;
  odometerStart: number;
  odometerEnd: number | null;
  tollsPaid: number;
  fuelCost: number;
  totalCost: number;
  remarks: string;
}

export default function TripTrackingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  const [trips, setTrips] = useState<TripDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = (await LogisticsService.getTrips()) as any[];
        const list = Array.isArray(raw) ? raw : [];
        const mapped: TripDetails[] = list.map((r, idx) => ({
          id: idx + 1,
          tripId: r?.tripId ?? r?.tripNumber ?? '',
          dispatchId: r?.dispatchId ?? '',
          vehicleNumber: r?.vehicleNumber ?? '',
          driverName: r?.driverName ?? '',
          routeCode: r?.routeCode ?? '',
          origin: r?.origin ?? '',
          destination: r?.destination ?? '',
          departureDate: r?.departureDate ?? '',
          departureTime: r?.departureTime ?? '',
          arrivalDate: r?.arrivalDate ?? '',
          arrivalTime: r?.arrivalTime ?? '',
          actualDeparture: r?.actualDeparture ?? null,
          actualArrival: r?.actualArrival ?? null,
          distance: Number(r?.distance ?? 0),
          estimatedDuration: Number(r?.estimatedDuration ?? 0),
          actualDuration: r?.actualDuration != null ? Number(r.actualDuration) : null,
          fuelConsumed: Number(r?.fuelConsumed ?? 0),
          averageSpeed: Number(r?.averageSpeed ?? 0),
          stops: Number(r?.stops ?? 0),
          delays: Number(r?.delays ?? 0),
          currentStatus: (r?.currentStatus ?? r?.status ?? 'scheduled') as TripDetails['currentStatus'],
          currentLocation: r?.currentLocation ?? '',
          completionPercentage: Number(r?.completionPercentage ?? 0),
          shipments: Number(r?.shipments ?? 0),
          totalWeight: Number(r?.totalWeight ?? 0),
          deliveredShipments: Number(r?.deliveredShipments ?? 0),
          remainingShipments: Number(r?.remainingShipments ?? 0),
          odometerStart: Number(r?.odometerStart ?? 0),
          odometerEnd: r?.odometerEnd != null ? Number(r.odometerEnd) : null,
          tollsPaid: Number(r?.tollsPaid ?? 0),
          fuelCost: Number(r?.fuelCost ?? 0),
          totalCost: Number(r?.totalCost ?? 0),
          remarks: r?.remarks ?? '',
        }));
        if (!cancelled) setTrips(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load trips');
          setTrips([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'scheduled': 'text-blue-600 bg-blue-50 border-blue-200',
      'in-progress': 'text-green-600 bg-green-50 border-green-200',
      'completed': 'text-gray-600 bg-gray-50 border-gray-200',
      'delayed': 'text-orange-600 bg-orange-50 border-orange-200',
      'cancelled': 'text-red-600 bg-red-50 border-red-200'
    };
    return colors[status] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'delayed':
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
      case 'in-progress':
        return <Truck className="w-4 h-4 text-green-500" />;
      default:
        return <Clock className="w-4 h-4 text-blue-500" />;
    }
  };

  const totalTrips = trips.length;
  const inProgress = trips.filter(t => t.currentStatus === 'in-progress').length;
  const completed = trips.filter(t => t.currentStatus === 'completed').length;
  const onTimeTrips = trips.filter(t => t.currentStatus === 'completed' && t.delays === 0).length;
  const onTimePercentage = completed > 0 ? ((onTimeTrips / completed) * 100).toFixed(1) : '0';

  const filteredTrips = trips.filter(trip => {
    const matchesSearch = trip.tripId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         trip.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         trip.driverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         trip.routeCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || trip.currentStatus === selectedStatus;
    // Date filter implementation
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <Navigation className="w-8 h-8 text-indigo-600" />
            <span>Trip Tracking</span>
          </h1>
          <p className="text-gray-600 mt-1">Monitor and track trip progress in real-time</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Create Trip</span>
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading trips…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-3 border border-indigo-200">
          <div className="flex items-center justify-between mb-2">
            <Navigation className="w-8 h-8 text-indigo-600" />
            <span className="text-2xl font-bold text-indigo-900">{totalTrips}</span>
          </div>
          <div className="text-sm font-medium text-indigo-700">Total Trips</div>
          <div className="text-xs text-indigo-600 mt-1">Active & Completed</div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <Truck className="w-8 h-8 text-green-600" />
            <span className="text-2xl font-bold text-green-900">{inProgress}</span>
          </div>
          <div className="text-sm font-medium text-green-700">In Progress</div>
          <div className="text-xs text-green-600 mt-1">Currently Moving</div>
        </div>

        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-8 h-8 text-gray-600" />
            <span className="text-2xl font-bold text-gray-900">{completed}</span>
          </div>
          <div className="text-sm font-medium text-gray-700">Completed</div>
          <div className="text-xs text-gray-600 mt-1">Successfully Finished</div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-blue-900">{onTimePercentage}%</span>
          </div>
          <div className="text-sm font-medium text-blue-700">On-Time Rate</div>
          <div className="text-xs text-blue-600 mt-1">Performance</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search trips..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="delayed">Delayed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>

      {/* Trips Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trip Details</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle & Driver</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Schedule</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Location</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTrips.map((trip) => (
                <tr key={trip.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <div className="font-medium text-gray-900">{trip.tripId}</div>
                    <div className="text-sm text-gray-600">Dispatch: {trip.dispatchId}</div>
                    <div className="text-xs text-gray-500 mt-1 flex items-center space-x-2">
                      <Package className="w-3 h-3" />
                      <span>{trip.shipments} shipments • {(trip.totalWeight / 1000).toFixed(1)}T</span>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center space-x-2 text-sm font-medium text-gray-900">
                      <Truck className="w-4 h-4 text-gray-400" />
                      <span>{trip.vehicleNumber}</span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">{trip.driverName}</div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-sm text-gray-900">{trip.origin}</div>
                    <div className="text-sm text-gray-600">→ {trip.destination}</div>
                    <div className="text-xs text-gray-500 mt-1">{trip.routeCode} • {trip.distance}km</div>
                  </td>
                  <td className="px-3 py-2 text-sm">
                    <div className="flex items-center space-x-1 text-gray-900">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      <span>{trip.departureDate}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-gray-600 mt-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span>{trip.departureTime} → {trip.arrivalTime}</span>
                    </div>
                    {trip.actualDeparture && (
                      <div className="text-xs text-green-600 mt-1">
                        Started: {new Date(trip.actualDeparture).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center space-x-2 text-sm text-gray-900">
                      <MapPin className="w-4 h-4 text-blue-500" />
                      <span>{trip.currentLocation}</span>
                    </div>
                    {trip.delays > 0 && (
                      <div className="flex items-center space-x-1 text-xs text-orange-600 mt-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>+{trip.delays}min delay</span>
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 w-20">
                        <div
                          className="h-2 rounded-full bg-indigo-500"
                          style={{ width: `${trip.completionPercentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold text-indigo-900">
                        {trip.completionPercentage}%
                      </span>
                    </div>
                    <div className="text-xs text-gray-600">
                      {trip.deliveredShipments}/{trip.shipments} delivered
                    </div>
                  </td>
                  <td className="px-3 py-2 text-xs">
                    {trip.actualDuration !== null && (
                      <>
                        <div className="text-gray-900">Duration: {trip.actualDuration.toFixed(1)}h</div>
                        <div className="text-gray-600 mt-1">Avg Speed: {trip.averageSpeed}km/h</div>
                        <div className="text-gray-600">Fuel: {trip.fuelConsumed}L</div>
                      </>
                    )}
                    {trip.actualDuration === null && trip.currentStatus === 'in-progress' && (
                      <>
                        <div className="text-gray-600">Avg Speed: {trip.averageSpeed}km/h</div>
                        <div className="text-gray-600">Fuel: {trip.fuelConsumed}L</div>
                      </>
                    )}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(trip.currentStatus)}
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(trip.currentStatus)}`}>
                        {trip.currentStatus.replace('-', ' ').toUpperCase()}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm">
                    <div className="flex items-center space-x-2">
                      <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                        <Eye className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-700">View</span>
                      </button>
                      <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                        <Edit2 className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-700">Edit</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Trip Analytics Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Navigation className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Real-Time Tracking</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Monitor trip progress with live location updates, GPS tracking, and ETA calculations.
          </p>
          <div className="text-xs text-gray-500 space-y-1">
            <div>• Live GPS location updates</div>
            <div>• Route adherence monitoring</div>
            <div>• Dynamic ETA adjustments</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Performance Metrics</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Track fuel consumption, average speed, delays, and overall trip efficiency.
          </p>
          <div className="text-xs text-gray-500 space-y-1">
            <div>• Fuel consumption tracking</div>
            <div>• Average speed monitoring</div>
            <div>• Delay analysis and reporting</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Package className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Shipment Tracking</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Monitor shipment delivery progress, tracking delivered vs. remaining shipments.
          </p>
          <div className="text-xs text-gray-500 space-y-1">
            <div>• Shipment delivery status</div>
            <div>• Multi-stop route management</div>
            <div>• Proof of delivery collection</div>
          </div>
        </div>
      </div>
    </div>
  );
}
