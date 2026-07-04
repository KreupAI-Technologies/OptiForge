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

  const [trips, setTrips] = useState<TripDetails[]>([
    {
      id: 1,
      tripId: 'TRP-2024-001',
      dispatchId: 'DSP-2024-001',
      vehicleNumber: 'MH-01-AB-1234',
      driverName: 'Ramesh Sharma',
      routeCode: 'RT-MUM-DEL-001',
      origin: 'Mumbai Warehouse',
      destination: 'Delhi Distribution Center',
      departureDate: '2024-10-22',
      departureTime: '18:00',
      arrivalDate: '2024-10-23',
      arrivalTime: '18:00',
      actualDeparture: '2024-10-22 18:30',
      actualArrival: null,
      distance: 1425,
      estimatedDuration: 24,
      actualDuration: null,
      fuelConsumed: 285,
      averageSpeed: 62,
      stops: 3,
      delays: 45,
      currentStatus: 'in-progress',
      currentLocation: 'Vadodara Hub',
      completionPercentage: 35,
      shipments: 15,
      totalWeight: 18500,
      deliveredShipments: 0,
      remainingShipments: 15,
      odometerStart: 125680,
      odometerEnd: null,
      tollsPaid: 8000,
      fuelCost: 35000,
      totalCost: 45000,
      remarks: 'On schedule, slight delay at Vadodara'
    },
    {
      id: 2,
      tripId: 'TRP-2024-002',
      dispatchId: 'DSP-2024-002',
      vehicleNumber: 'KA-05-CD-5678',
      driverName: 'Suresh Kumar',
      routeCode: 'RT-BLR-CHN-001',
      origin: 'Bangalore Plant',
      destination: 'Chennai Port',
      departureDate: '2024-10-23',
      departureTime: '08:00',
      arrivalDate: '2024-10-23',
      arrivalTime: '15:00',
      actualDeparture: null,
      actualArrival: null,
      distance: 350,
      estimatedDuration: 7,
      actualDuration: null,
      fuelConsumed: 0,
      averageSpeed: 0,
      stops: 1,
      delays: 0,
      currentStatus: 'scheduled',
      currentLocation: 'Bangalore Plant',
      completionPercentage: 0,
      shipments: 8,
      totalWeight: 8200,
      deliveredShipments: 0,
      remainingShipments: 8,
      odometerStart: 89450,
      odometerEnd: null,
      tollsPaid: 0,
      fuelCost: 9000,
      totalCost: 12000,
      remarks: 'Ready for departure'
    },
    {
      id: 3,
      tripId: 'TRP-2024-003',
      dispatchId: 'DSP-2024-003',
      vehicleNumber: 'WB-02-EF-9012',
      driverName: 'Mohan Das',
      routeCode: 'RT-KOL-MUM-001',
      origin: 'Kolkata Depot',
      destination: 'Mumbai Warehouse',
      departureDate: '2024-10-22',
      departureTime: '06:00',
      arrivalDate: '2024-10-23',
      arrivalTime: '18:00',
      actualDeparture: '2024-10-22 06:45',
      actualArrival: null,
      distance: 2050,
      estimatedDuration: 36,
      actualDuration: null,
      fuelConsumed: 380,
      averageSpeed: 58,
      stops: 4,
      delays: 120,
      currentStatus: 'delayed',
      currentLocation: 'Bhubaneswar Hub',
      completionPercentage: 25,
      shipments: 22,
      totalWeight: 28000,
      deliveredShipments: 0,
      remainingShipments: 22,
      odometerStart: 215680,
      odometerEnd: null,
      tollsPaid: 12000,
      fuelCost: 52000,
      totalCost: 68000,
      remarks: 'Delayed due to weather conditions'
    },
    {
      id: 4,
      tripId: 'TRP-2024-004',
      dispatchId: 'DSP-2024-004',
      vehicleNumber: 'TS-09-GH-3456',
      driverName: 'Prakash Reddy',
      routeCode: 'RT-HYD-BLR-001',
      origin: 'Hyderabad Factory',
      destination: 'Bangalore Plant',
      departureDate: '2024-10-21',
      departureTime: '14:00',
      arrivalDate: '2024-10-22',
      arrivalTime: '00:00',
      actualDeparture: '2024-10-21 14:00',
      actualArrival: '2024-10-21 23:45',
      distance: 575,
      estimatedDuration: 10,
      actualDuration: 9.75,
      fuelConsumed: 115,
      averageSpeed: 59,
      stops: 1,
      delays: 0,
      currentStatus: 'completed',
      currentLocation: 'Bangalore Plant',
      completionPercentage: 100,
      shipments: 12,
      totalWeight: 11500,
      deliveredShipments: 12,
      remainingShipments: 0,
      odometerStart: 145280,
      odometerEnd: 145855,
      tollsPaid: 3000,
      fuelCost: 14000,
      totalCost: 18000,
      remarks: 'Early delivery, excellent performance'
    },
    {
      id: 5,
      tripId: 'TRP-2024-005',
      dispatchId: 'DSP-2024-005',
      vehicleNumber: 'MH-12-IJ-7890',
      driverName: 'Ganesh Patil',
      routeCode: 'RT-PUN-GOA-001',
      origin: 'Pune Hub',
      destination: 'Goa Distribution',
      departureDate: '2024-10-24',
      departureTime: '10:00',
      arrivalDate: '2024-10-24',
      arrivalTime: '19:00',
      actualDeparture: null,
      actualArrival: null,
      distance: 485,
      estimatedDuration: 9,
      actualDuration: null,
      fuelConsumed: 0,
      averageSpeed: 0,
      stops: 1,
      delays: 0,
      currentStatus: 'scheduled',
      currentLocation: 'Pune Hub',
      completionPercentage: 0,
      shipments: 6,
      totalWeight: 4500,
      deliveredShipments: 0,
      remainingShipments: 6,
      odometerStart: 98750,
      odometerEnd: null,
      tollsPaid: 0,
      fuelCost: 12000,
      totalCost: 16000,
      remarks: 'Scheduled for tomorrow'
    },
    {
      id: 6,
      tripId: 'TRP-2024-006',
      dispatchId: 'DSP-2024-006',
      vehicleNumber: 'DL-03-KL-2468',
      driverName: 'Vijay Singh',
      routeCode: 'RT-DEL-JAM-001',
      origin: 'Delhi Distribution Center',
      destination: 'Jammu Depot',
      departureDate: '2024-10-22',
      departureTime: '22:00',
      arrivalDate: '2024-10-23',
      arrivalTime: '09:00',
      actualDeparture: '2024-10-22 22:15',
      actualArrival: null,
      distance: 585,
      estimatedDuration: 11,
      actualDuration: null,
      fuelConsumed: 25,
      averageSpeed: 65,
      stops: 0,
      delays: 0,
      currentStatus: 'in-progress',
      currentLocation: 'Ambala Transit',
      completionPercentage: 15,
      shipments: 10,
      totalWeight: 14000,
      deliveredShipments: 0,
      remainingShipments: 10,
      odometerStart: 178920,
      odometerEnd: null,
      tollsPaid: 3500,
      fuelCost: 15000,
      totalCost: 19000,
      remarks: 'Just started, on track'
    },
    {
      id: 7,
      tripId: 'TRP-2024-007',
      dispatchId: 'DSP-2024-007',
      vehicleNumber: 'TN-01-MN-1357',
      driverName: 'Murugan Subramanian',
      routeCode: 'RT-CHN-KOC-001',
      origin: 'Chennai Port',
      destination: 'Kochi Depot',
      departureDate: '2024-10-23',
      departureTime: '16:00',
      arrivalDate: '2024-10-24',
      arrivalTime: '04:00',
      actualDeparture: null,
      actualArrival: null,
      distance: 695,
      estimatedDuration: 12,
      actualDuration: null,
      fuelConsumed: 0,
      averageSpeed: 0,
      stops: 2,
      delays: 0,
      currentStatus: 'scheduled',
      currentLocation: 'Chennai Port',
      completionPercentage: 0,
      shipments: 14,
      totalWeight: 16800,
      deliveredShipments: 0,
      remainingShipments: 14,
      odometerStart: 156890,
      odometerEnd: null,
      tollsPaid: 0,
      fuelCost: 17000,
      totalCost: 22000,
      remarks: 'Awaiting departure'
    },
    {
      id: 8,
      tripId: 'TRP-2024-008',
      dispatchId: 'DSP-2024-008',
      vehicleNumber: 'GJ-01-OP-2580',
      driverName: 'Bharat Patel',
      routeCode: 'RT-AHM-MUM-001',
      origin: 'Ahmedabad Factory',
      destination: 'Mumbai Warehouse',
      departureDate: '2024-10-21',
      departureTime: '20:00',
      arrivalDate: '2024-10-22',
      arrivalTime: '05:00',
      actualDeparture: '2024-10-21 20:00',
      actualArrival: '2024-10-22 04:50',
      distance: 535,
      estimatedDuration: 9,
      actualDuration: 8.83,
      fuelConsumed: 107,
      averageSpeed: 61,
      stops: 2,
      delays: 0,
      currentStatus: 'completed',
      currentLocation: 'Mumbai Warehouse',
      completionPercentage: 100,
      shipments: 9,
      totalWeight: 7200,
      deliveredShipments: 9,
      remainingShipments: 0,
      odometerStart: 134560,
      odometerEnd: 135095,
      tollsPaid: 3500,
      fuelCost: 13000,
      totalCost: 17000,
      remarks: 'Early delivery, excellent performance'
    }
  ]);

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
