'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Search, Edit2, Trash2, Navigation, Clock, Eye, Download, Filter, Truck, Train, Plane, Ship, X } from 'lucide-react';
import { routeService } from '@/services/route.service';

interface RouteData {
  id: string;
  code: string;
  name: string;
  origin: string;
  destination: string;
  distance: number;
  estimatedTime: string;
  stops: string[];
  mode: 'Road' | 'Rail' | 'Air' | 'Sea';
  tollCharges: number;
  fuelCost: number;
  status: 'Active' | 'Inactive' | 'Under Review';
}

export default function RouteMaster() {
  const [searchTerm, setSearchTerm] = useState('');
  const [modeFilter, setModeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<RouteData | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [routes, setRoutes] = useState<RouteData[]>([]);

  useEffect(() => {
    const loadRoutes = async () => {
      try {
        const data = await routeService.getAllRoutes();
        const list = Array.isArray(data) ? data : [];
        const mapped: RouteData[] = list.map((r) => {
          const durationMinutes = r.estimatedDuration || 0;
          const estimatedTime = durationMinutes
            ? `${Math.round(durationMinutes / 60)} hours`
            : '';
          const status = (r.status || 'Active') as RouteData['status'];
          return {
            id: r.id || '',
            code: r.routeCode || '',
            name: r.routeName || '',
            origin: r.origin || '',
            destination: r.destination || '',
            distance: r.totalDistance || 0,
            estimatedTime,
            stops: Array.isArray(r.stops)
              ? r.stops.map((s) => s.locationName || '')
              : [],
            mode: 'Road',
            tollCharges: r.tollCost || 0,
            fuelCost: r.fuelCostEstimate || 0,
            status,
          };
        });
        setRoutes(mapped);
      } catch (error) {
        console.error('Error loading routes:', error);
        setRoutes([]);
      }
    };
    loadRoutes();
  }, []);

  const filteredRoutes = routes.filter(route => {
    const matchesSearch =
      route.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.destination.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesMode = modeFilter === 'all' || route.mode === modeFilter;
    const matchesStatus = statusFilter === 'all' || route.status === statusFilter;

    return matchesSearch && matchesMode && matchesStatus;
  });

  const stats = {
    total: routes.length,
    active: routes.filter(r => r.status === 'Active').length,
    totalDistance: routes.reduce((sum, r) => sum + r.distance, 0),
    avgDistance: routes.length ? Math.round(routes.reduce((sum, r) => sum + r.distance, 0) / routes.length) : 0,
    totalToll: routes.reduce((sum, r) => sum + r.tollCharges, 0),
    totalFuelCost: routes.reduce((sum, r) => sum + r.fuelCost, 0)
  };

  const modeIcons = {
    'Road': Truck,
    'Rail': Train,
    'Air': Plane,
    'Sea': Ship
  };

  const handleViewRoute = (route: RouteData) => {
    setSelectedRoute(route);
    setShowViewModal(true);
  };

  const handleExport = () => {
    setToastMessage('Routes exported successfully!');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2 bg-white border-b border-gray-200 flex-shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Navigation className="h-8 w-8 text-orange-600" />
              Route Master
            </h1>
            <p className="text-gray-500 mt-1 uppercase text-[10px] font-black tracking-widest leading-none">
              Manage transportation routes and waypoints
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="px-4 py-2 border border-gray-200 bg-white text-gray-600 rounded-lg font-black uppercase text-[10px] tracking-widest hover:bg-gray-50 flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
            <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2 shadow-md font-black uppercase text-[10px] tracking-widest">
              <Plus className="h-4 w-4" />
              Add Route
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 text-sm font-medium">

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-2 mb-3">
          <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Routes</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Navigation className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <MapPin className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Distance</p>
                <p className="text-2xl font-bold">{stats.totalDistance.toLocaleString()} km</p>
              </div>
              <Navigation className="h-8 w-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Distance</p>
                <p className="text-2xl font-bold">{stats.avgDistance} km</p>
              </div>
              <MapPin className="h-8 w-8 text-orange-600" />
            </div>
          </div>

          <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Toll</p>
                <p className="text-2xl font-bold">₹{stats.totalToll.toLocaleString()}</p>
              </div>
              <Truck className="h-8 w-8 text-indigo-600" />
            </div>
          </div>

          <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Fuel Cost</p>
                <p className="text-2xl font-bold">₹{stats.totalFuelCost.toLocaleString()}</p>
              </div>
              <Truck className="h-8 w-8 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <div className="flex gap-2 items-center">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search routes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Filter className="h-4 w-4" />
                    Filters
                  </button>
                </div>
              </div>

              {/* Advanced Filters */}
              {showAdvancedFilters && (
                <div className="flex gap-2 p-3 bg-gray-50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Transport Mode</label>
                    <select
                      value={modeFilter}
                      onChange={(e) => setModeFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Modes</option>
                      <option value="Road">Road</option>
                      <option value="Rail">Rail</option>
                      <option value="Air">Air</option>
                      <option value="Sea">Sea</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Status</option>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Under Review">Under Review</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>

          {filteredRoutes.length === 0 ? (
            <div className="p-12 text-center">
              <Navigation className="h-12 w-12 text-gray-400 mb-2" />
              <p className="text-gray-500 mb-2">No routes found</p>
              <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Route</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Origin - Destination</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Mode</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Distance</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Est. Time</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Stops</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRoutes.map((route) => {
                    const ModeIcon = modeIcons[route.mode];
                    return (
                      <tr key={route.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2">
                          <div className="text-sm font-medium">{route.name}</div>
                          <div className="text-xs text-gray-500">{route.code}</div>
                        </td>
                        <td className="px-3 py-2">
                          <div className="text-sm flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-green-600" />
                            {route.origin}
                            <Navigation className="h-3 w-3 text-gray-400" />
                            <MapPin className="h-4 w-4 text-red-600" />
                            {route.destination}
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <ModeIcon className="h-4 w-4 text-blue-600" />
                            <span className="text-sm">{route.mode}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-sm">{route.distance} km</td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Clock className="h-3 w-3" />
                            {route.estimatedTime}
                          </div>
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-600">
                          {route.stops.length > 0 ? `${route.stops.length} stops` : 'Direct'}
                        </td>
                        <td className="px-3 py-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs ${route.status === 'Active' ? 'bg-green-100 text-green-800' :
                              route.status === 'Inactive' ? 'bg-gray-100 text-gray-800' :
                                'bg-yellow-100 text-yellow-800'
                            }`}>
                            {route.status}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleViewRoute(route)}
                              className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                            >
                              <Eye className="h-4 w-4 text-gray-600" />
                              <span className="text-gray-700">View</span>
                            </button>
                            <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                              <Edit2 className="h-4 w-4 text-gray-600" />
                              <span className="text-gray-700">Edit</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* View Route Modal */}
        {showViewModal && selectedRoute && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-3 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-xl font-bold">{selectedRoute.name}</h3>
                  <p className="text-sm text-gray-500">{selectedRoute.code}</p>
                </div>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3">
                {/* Route Details */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Route Details</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-gray-500">Origin</p>
                      <p className="text-sm font-medium">{selectedRoute.origin}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Destination</p>
                      <p className="text-sm font-medium">{selectedRoute.destination}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Distance</p>
                      <p className="text-sm font-medium">{selectedRoute.distance} km</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Estimated Time</p>
                      <p className="text-sm font-medium">{selectedRoute.estimatedTime}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Transport Mode</p>
                      <p className="text-sm font-medium">{selectedRoute.mode}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Status</p>
                      <p className="text-sm font-medium">{selectedRoute.status}</p>
                    </div>
                  </div>
                </div>

                {/* Cost Breakdown */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Cost Breakdown</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-xs text-blue-600">Toll Charges</p>
                      <p className="text-lg font-bold text-blue-700">₹{selectedRoute.tollCharges.toLocaleString()}</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-xs text-green-600">Fuel Cost</p>
                      <p className="text-lg font-bold text-green-700">₹{selectedRoute.fuelCost.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="mt-3 bg-purple-50 p-3 rounded-lg">
                    <p className="text-xs text-purple-600">Total Estimated Cost</p>
                    <p className="text-xl font-bold text-purple-700">₹{(selectedRoute.tollCharges + selectedRoute.fuelCost).toLocaleString()}</p>
                  </div>
                </div>

                {/* Stops */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Route Stops</h4>
                  {selectedRoute.stops.length > 0 ? (
                    <div className="space-y-2">
                      {selectedRoute.stops.map((stop, index) => (
                        <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                          <div className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                            {index + 1}
                          </div>
                          <p className="text-sm">{stop}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No intermediate stops - Direct route</p>
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Edit Route
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast Notification */}
        {showToast && (
          <div className="fixed bottom-4 right-4 bg-green-600 text-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-2">
            <Download className="h-4 w-4" />
            {toastMessage}
          </div>
        )}
      </div>
    </div>
  );
}
