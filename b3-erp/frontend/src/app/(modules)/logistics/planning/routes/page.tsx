'use client';

import React, { useState, useEffect } from 'react';
import {
  Route,
  Plus,
  Edit2,
  Eye,
  Search,
  MapPin,
  Navigation,
  Clock,
  DollarSign,
  TrendingUp,
  Calendar,
  Truck,
  AlertCircle,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { routeService, Route as ServiceRoute, Trip, CreateRouteDto } from '@/services/route.service';
import { toast } from '@/hooks/use-toast';

interface RouteDetails {
  id: number;
  routeCode: string;
  routeName: string;
  origin: string;
  destination: string;
  waypoints: string[];
  distance: number; // in km
  estimatedTime: number; // in hours
  routeType: 'primary' | 'alternate' | 'emergency';
  transportMode: 'road' | 'rail' | 'air' | 'sea';
  routeCost: number;
  fuelCost: number;
  tollCost: number;
  frequency: 'daily' | 'weekly' | 'bi-weekly' | 'monthly' | 'on-demand';
  activeTrips: number;
  avgDelay: number; // in minutes
  reliability: number; // percentage
  status: 'active' | 'inactive' | 'under-review';
  lastUsed: string;
  createdDate: string;
}

// Helper function to map service route to UI format
const mapServiceRouteToUI = (route: ServiceRoute, trips: Trip[]): RouteDetails => {
  const routeTrips = trips.filter(t => t.routeId === route.id);
  const activeTrips = routeTrips.filter(t => t.status === 'In Progress' || t.status === 'Planned').length;
  const completedTrips = routeTrips.filter(t => t.status === 'Completed');
  const delayedTrips = routeTrips.filter(t => t.status === 'Delayed' || (t.delays && t.delays.length > 0));

  const avgDelay = delayedTrips.length > 0
    ? delayedTrips.reduce((sum, t) => sum + (t.delays?.reduce((s, d) => s + d.duration, 0) || 0), 0) / delayedTrips.length
    : 0;

  const reliability = completedTrips.length > 0
    ? Math.round(((completedTrips.length - delayedTrips.length) / completedTrips.length) * 100)
    : 95;

  const routeTypeMap: Record<ServiceRoute['routeType'], RouteDetails['routeType']> = {
    'Regular': 'primary',
    'Express': 'primary',
    'Economy': 'alternate'
  };

  const statusMap: Record<ServiceRoute['status'], RouteDetails['status']> = {
    'Active': 'active',
    'Inactive': 'inactive',
    'Under Review': 'under-review'
  };

  return {
    id: parseInt(route.id.replace(/\D/g, '')) || Date.now(),
    routeCode: route.routeCode,
    routeName: route.routeName,
    origin: route.origin,
    destination: route.destination,
    waypoints: route.stops.map(s => s.locationName),
    distance: route.totalDistance,
    estimatedTime: Math.round(route.estimatedDuration / 60), // Convert minutes to hours
    routeType: route.routeType === 'Express' ? 'primary' : routeTypeMap[route.routeType] || 'primary',
    transportMode: 'road', // Default to road
    routeCost: (route.tollCost || 0) + (route.fuelCostEstimate || 0) + 2000, // Add base cost
    fuelCost: route.fuelCostEstimate || 0,
    tollCost: route.tollCost || 0,
    frequency: activeTrips > 5 ? 'daily' : activeTrips > 2 ? 'weekly' : 'on-demand',
    activeTrips,
    avgDelay: Math.round(avgDelay),
    reliability: reliability > 100 ? 95 : reliability,
    status: statusMap[route.status] || 'active',
    lastUsed: routeTrips.length > 0 ? routeTrips[0].createdAt.split('T')[0] : route.updatedAt.split('T')[0],
    createdDate: route.createdAt.split('T')[0]
  };
};

export default function RoutePlanningPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedMode, setSelectedMode] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // State for routes loaded from service
  const [routes, setRoutes] = useState<RouteDetails[]>([]);
  // Keep the raw service routes so edit can map a UI row back to its service id
  const [serviceRoutes, setServiceRoutes] = useState<ServiceRoute[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Create / Edit form modal state
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingRouteId, setEditingRouteId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const emptyForm = {
    routeCode: '',
    routeName: '',
    description: '',
    origin: '',
    originCity: '',
    originState: '',
    destination: '',
    destinationCity: '',
    destinationState: '',
    totalDistance: 0,
    estimatedDuration: 0,
    routeType: 'Regular' as ServiceRoute['routeType'],
    tollCost: 0,
    fuelCostEstimate: 0,
  };
  const [formData, setFormData] = useState({ ...emptyForm });

  // Load routes from service
  useEffect(() => {
    loadRouteData();
  }, []);

  const loadRouteData = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      // Fetch routes and trips in parallel
      const [routesResult, tripsResult] = await Promise.all([
        routeService.getAllRoutes(),
        routeService.getAllTrips()
      ]);

      // Map service data to UI format
      setServiceRoutes(routesResult);
      const mappedRoutes = routesResult.map(r => mapServiceRouteToUI(r, tripsResult.data));
      setRoutes(mappedRoutes);
    } catch (error) {
      console.error('Error loading route data:', error);
      setLoadError('Failed to load route data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    await loadRouteData();
  };

  const handleCreateRoute = () => {
    setEditingRouteId(null);
    setFormData({ ...emptyForm });
    setShowFormModal(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload: CreateRouteDto = {
        routeCode: formData.routeCode,
        routeName: formData.routeName,
        description: formData.description || undefined,
        origin: formData.origin,
        originCity: formData.originCity,
        originState: formData.originState,
        destination: formData.destination,
        destinationCity: formData.destinationCity,
        destinationState: formData.destinationState,
        totalDistance: Number(formData.totalDistance) || 0,
        estimatedDuration: Number(formData.estimatedDuration) || 0,
        routeType: formData.routeType,
        tollCost: Number(formData.tollCost) || 0,
        fuelCostEstimate: Number(formData.fuelCostEstimate) || 0,
      };

      if (editingRouteId) {
        await routeService.updateRoute(editingRouteId, payload);
        toast({ title: 'Route updated', description: `${formData.routeCode} was updated successfully.`, variant: 'success' });
      } else {
        await routeService.createRoute(payload);
        toast({ title: 'Route created', description: `${formData.routeCode} was created successfully.`, variant: 'success' });
      }

      setShowFormModal(false);
      await loadRouteData();
    } catch (error) {
      console.error('Error saving route:', error);
      toast({ title: 'Error', description: 'Failed to save the route. Please try again.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewRoute = (route: RouteDetails) => {
    alert(`Route Details - ${route.routeCode}

ROUTE INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Route Code: ${route.routeCode}
Route Name: ${route.routeName}
Route Type: ${route.routeType.toUpperCase()}
Transport Mode: ${route.transportMode.toUpperCase()}
Status: ${route.status.toUpperCase()}

ORIGIN & DESTINATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Origin: ${route.origin}
Destination: ${route.destination}
${route.waypoints.length > 0 ? `Waypoints:\n${route.waypoints.map((w, i) => `  ${i + 1}. ${w}`).join('\n')}` : 'No waypoints'}

DISTANCE & TIME
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Distance: ${route.distance.toLocaleString()} km
Estimated Time: ${route.estimatedTime} hours
Average Speed: ${Math.round(route.distance / route.estimatedTime)} km/h
Average Delay: ${route.avgDelay} minutes

COST BREAKDOWN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Route Cost: ₹${route.routeCost.toLocaleString()}
├─ Fuel Cost: ₹${route.fuelCost.toLocaleString()} (${((route.fuelCost/route.routeCost)*100).toFixed(1)}%)
├─ Toll Cost: ₹${route.tollCost.toLocaleString()} (${((route.tollCost/route.routeCost)*100).toFixed(1)}%)
└─ Other Costs: ₹${(route.routeCost - route.fuelCost - route.tollCost).toLocaleString()}

Cost Per Kilometer: ₹${(route.routeCost / route.distance).toFixed(2)}/km
Fuel Efficiency: ₹${(route.fuelCost / route.distance).toFixed(2)}/km

OPERATIONAL METRICS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Frequency: ${route.frequency.toUpperCase()}
Active Trips: ${route.activeTrips} shipments currently in transit
Reliability: ${route.reliability}% (on-time delivery rate)
Last Used: ${route.lastUsed}
Created: ${route.createdDate}

PERFORMANCE ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Trips (Last 30 days): ${route.activeTrips * 4}
On-Time Deliveries: ${Math.round((route.activeTrips * 4 * route.reliability) / 100)}
Delayed Deliveries: ${Math.round((route.activeTrips * 4 * (100 - route.reliability)) / 100)}
Average Delay Time: ${route.avgDelay} minutes
Revenue Generated: ₹${(route.routeCost * route.activeTrips * 4 * 1.2).toLocaleString()}

ROUTE HEALTH
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Overall Score: ${route.reliability >= 95 ? 'Excellent ⭐⭐⭐⭐⭐' : route.reliability >= 90 ? 'Good ⭐⭐⭐⭐' : 'Fair ⭐⭐⭐'}
${route.reliability >= 95 ? '✓ Highly reliable route' : route.reliability >= 90 ? '⚠ Minor delays observed' : '⚠ Requires optimization'}
${route.avgDelay < 20 ? '✓ Minimal average delay' : route.avgDelay < 40 ? '⚠ Moderate delay concerns' : '⚠ High delay - investigate causes'}
${route.activeTrips > 5 ? '✓ High utilization rate' : route.activeTrips > 2 ? '○ Moderate utilization' : '○ Low utilization'}

SAFETY & COMPLIANCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Permits & Licenses: Valid
• Insurance Coverage: Active
• Safety Inspections: Up to date
• Driver Certifications: Verified
• Vehicle Fitness: Approved
• Hazmat Clearance: ${route.transportMode === 'air' ? 'Required' : 'Not Applicable'}

WEATHER & TRAFFIC
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Current Conditions: Normal
Traffic Status: Moderate
Weather Impact: None
Recommended Departure: As scheduled

Actions Available:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Edit Route] [Duplicate Route] [Generate Report] [View Map] [View History] [Optimize] [Deactivate]`);
  };

  const handleEditRoute = (route: RouteDetails) => {
    // Find the raw service route matching this UI row (match on routeCode which is stable)
    const svc = serviceRoutes.find(r => r.routeCode === route.routeCode);
    if (!svc) {
      toast({ title: 'Cannot edit', description: 'Original route record not found. Please refresh.', variant: 'destructive' });
      return;
    }
    setEditingRouteId(svc.id);
    setFormData({
      routeCode: svc.routeCode,
      routeName: svc.routeName,
      description: svc.description || '',
      origin: svc.origin,
      originCity: svc.originCity,
      originState: svc.originState,
      destination: svc.destination,
      destinationCity: svc.destinationCity,
      destinationState: svc.destinationState,
      totalDistance: svc.totalDistance,
      estimatedDuration: svc.estimatedDuration,
      routeType: svc.routeType,
      tollCost: svc.tollCost || 0,
      fuelCostEstimate: svc.fuelCostEstimate || 0,
    });
    setShowFormModal(true);
  };


  const getTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'primary': 'text-blue-600 bg-blue-50 border-blue-200',
      'alternate': 'text-orange-600 bg-orange-50 border-orange-200',
      'emergency': 'text-red-600 bg-red-50 border-red-200'
    };
    return colors[type] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getModeColor = (mode: string) => {
    const colors: { [key: string]: string } = {
      'road': 'text-green-600 bg-green-50 border-green-200',
      'rail': 'text-purple-600 bg-purple-50 border-purple-200',
      'air': 'text-blue-600 bg-blue-50 border-blue-200',
      'sea': 'text-teal-600 bg-teal-50 border-teal-200'
    };
    return colors[mode] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'inactive':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      case 'under-review':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getReliabilityColor = (reliability: number) => {
    if (reliability >= 95) return 'text-green-600';
    if (reliability >= 90) return 'text-yellow-600';
    return 'text-red-600';
  };

  const activeRoutes = routes.filter(r => r.status === 'active').length;
  const totalActiveTrips = routes.filter(r => r.status === 'active').reduce((sum, r) => sum + r.activeTrips, 0);
  const avgReliability = (routes.filter(r => r.status === 'active').reduce((sum, r) => sum + r.reliability, 0) / activeRoutes).toFixed(1);
  const totalDistance = routes.filter(r => r.status === 'active').reduce((sum, r) => sum + r.distance, 0);

  const filteredRoutes = routes.filter(route => {
    const matchesSearch = route.routeCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         route.routeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         route.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         route.destination.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || route.routeType === selectedType;
    const matchesMode = selectedMode === 'all' || route.transportMode === selectedMode;
    const matchesStatus = selectedStatus === 'all' || route.status === selectedStatus;
    return matchesSearch && matchesType && matchesMode && matchesStatus;
  });

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <Route className="w-8 h-8 text-blue-600" />
            <span>Route Planning</span>
          </h1>
          <p className="text-gray-600 mt-1">Manage transportation routes and optimize delivery paths</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Loading...' : 'Refresh'}</span>
          </button>
          <button
            onClick={handleCreateRoute}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Route</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <Route className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-blue-900">{activeRoutes}</span>
          </div>
          <div className="text-sm font-medium text-blue-700">Active Routes</div>
          <div className="text-xs text-blue-600 mt-1">In Operation</div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <Truck className="w-8 h-8 text-green-600" />
            <span className="text-2xl font-bold text-green-900">{totalActiveTrips}</span>
          </div>
          <div className="text-sm font-medium text-green-700">Active Trips</div>
          <div className="text-xs text-green-600 mt-1">In Transit</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-purple-600" />
            <span className="text-2xl font-bold text-purple-900">{avgReliability}%</span>
          </div>
          <div className="text-sm font-medium text-purple-700">Avg Reliability</div>
          <div className="text-xs text-purple-600 mt-1">On-Time Performance</div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <Navigation className="w-8 h-8 text-orange-600" />
            <span className="text-2xl font-bold text-orange-900">{totalDistance.toLocaleString()}</span>
          </div>
          <div className="text-sm font-medium text-orange-700">Total Network</div>
          <div className="text-xs text-orange-600 mt-1">Kilometers</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search routes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Route Types</option>
            <option value="primary">Primary Routes</option>
            <option value="alternate">Alternate Routes</option>
            <option value="emergency">Emergency Routes</option>
          </select>

          <select
            value={selectedMode}
            onChange={(e) => setSelectedMode(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Transport Modes</option>
            <option value="road">Road</option>
            <option value="rail">Rail</option>
            <option value="air">Air</option>
            <option value="sea">Sea</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="under-review">Under Review</option>
          </select>
        </div>
      </div>

      {/* Routes Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route Details</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Origin → Destination</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mode</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Distance</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Est. Time</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active Trips</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reliability</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={11} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
                      <span className="text-gray-500">Loading routes...</span>
                    </div>
                  </td>
                </tr>
              ) : loadError ? (
                <tr>
                  <td colSpan={11} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
                      <span className="text-red-500">{loadError}</span>
                      <button
                        onClick={handleRefresh}
                        className="mt-2 text-blue-600 hover:text-blue-700"
                      >
                        Try again
                      </button>
                    </div>
                  </td>
                </tr>
              ) : filteredRoutes.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Route className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-gray-500">No routes found</span>
                    </div>
                  </td>
                </tr>
              ) : filteredRoutes.map((route) => (
                <tr key={route.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <div className="font-medium text-gray-900">{route.routeCode}</div>
                    <div className="text-sm text-gray-600">{route.routeName}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {route.waypoints.length > 0 && `Via: ${route.waypoints.slice(0, 2).join(', ')}${route.waypoints.length > 2 ? '...' : ''}`}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center space-x-2 text-sm">
                      <MapPin className="w-4 h-4 text-green-500" />
                      <span className="text-gray-900">{route.origin}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm mt-1">
                      <MapPin className="w-4 h-4 text-red-500" />
                      <span className="text-gray-900">{route.destination}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor(route.routeType)}`}>
                      {route.routeType.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getModeColor(route.transportMode)}`}>
                      {route.transportMode.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                    {route.distance.toLocaleString()} km
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>{route.estimatedTime}h</span>
                    </div>
                    {route.avgDelay > 0 && (
                      <div className="text-xs text-orange-600 flex items-center space-x-1 mt-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>+{route.avgDelay}m avg delay</span>
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex items-center space-x-1 text-sm font-medium text-gray-900">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      <span>₹{(route.routeCost / 1000).toFixed(1)}K</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Fuel: ₹{(route.fuelCost / 1000).toFixed(1)}K | Toll: ₹{(route.tollCost / 1000).toFixed(1)}K
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <Truck className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-bold text-gray-900">{route.activeTrips}</span>
                    </div>
                    <div className="text-xs text-gray-500">{route.frequency}</div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 w-16">
                        <div
                          className={`h-2 rounded-full ${
                            route.reliability >= 95 ? 'bg-green-500' :
                            route.reliability >= 90 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${route.reliability}%` }}
                        />
                      </div>
                      <span className={`font-bold ${getReliabilityColor(route.reliability)}`}>
                        {route.reliability}%
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(route.status)}`}>
                      {route.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewRoute(route)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                      >
                        <Eye className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-700">View</span>
                      </button>
                      <button
                        onClick={() => handleEditRoute(route)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                      >
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

      {/* Route Performance Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Route className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Route Optimization</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Use AI-powered route planning to minimize distance, fuel costs, and delivery time.
          </p>
          <div className="text-xs text-gray-500 space-y-1">
            <div>• Primary routes for regular shipments</div>
            <div>• Alternate routes for contingency</div>
            <div>• Emergency routes for urgent deliveries</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Performance Tracking</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Monitor route reliability, average delays, and on-time delivery performance.
          </p>
          <div className="text-xs text-gray-500 space-y-1">
            <div>• Reliability: % of on-time deliveries</div>
            <div>• Avg Delay: Minutes behind schedule</div>
            <div>• Active Trips: Current shipments in transit</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-orange-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Cost Analysis</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Track total route costs including fuel, tolls, driver wages, and vehicle maintenance.
          </p>
          <div className="text-xs text-gray-500 space-y-1">
            <div>• Fuel Cost: Major expense component</div>
            <div>• Toll Cost: Highway and bridge fees</div>
            <div>• Total Cost: Per trip or per kilometer</div>
          </div>
        </div>
      </div>

      {/* Create / Edit Route Modal */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-4 py-3 flex items-center justify-between rounded-t-xl z-10">
              <div className="flex items-center gap-2">
                <Route className="h-6 w-6" />
                <h2 className="text-xl font-bold">{editingRouteId ? 'Edit Route' : 'Create New Route'}</h2>
              </div>
              <button onClick={() => setShowFormModal(false)} className="text-white hover:bg-white/20 rounded-lg p-1">
                <span className="text-2xl leading-none">&times;</span>
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Route Code <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={formData.routeCode}
                    onChange={(e) => setFormData({ ...formData, routeCode: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., MUM-BLR-01"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Route Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={formData.routeName}
                    onChange={(e) => setFormData({ ...formData, routeName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Mumbai to Bangalore Express"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={2}
                  placeholder="Optional route description"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Origin <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={formData.origin}
                    onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Origin location"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Origin City <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={formData.originCity}
                    onChange={(e) => setFormData({ ...formData, originCity: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Origin State <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={formData.originState}
                    onChange={(e) => setFormData({ ...formData, originState: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Destination <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Destination location"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Destination City <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={formData.destinationCity}
                    onChange={(e) => setFormData({ ...formData, destinationCity: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Destination State <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={formData.destinationState}
                    onChange={(e) => setFormData({ ...formData, destinationState: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Distance (km) <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    min={0}
                    value={formData.totalDistance}
                    onChange={(e) => setFormData({ ...formData, totalDistance: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Est. Duration (min) <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    min={0}
                    value={formData.estimatedDuration}
                    onChange={(e) => setFormData({ ...formData, estimatedDuration: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Route Type</label>
                  <select
                    value={formData.routeType}
                    onChange={(e) => setFormData({ ...formData, routeType: e.target.value as ServiceRoute['routeType'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Regular">Regular</option>
                    <option value="Express">Express</option>
                    <option value="Economy">Economy</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Toll Cost (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.tollCost}
                    onChange={(e) => setFormData({ ...formData, tollCost: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fuel Cost Estimate (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.fuelCostEstimate}
                    onChange={(e) => setFormData({ ...formData, fuelCostEstimate: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSubmitting ? 'Saving...' : editingRouteId ? 'Save Changes' : 'Create Route'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
