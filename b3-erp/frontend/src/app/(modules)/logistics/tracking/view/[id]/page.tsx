'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogisticsService } from '@/services/logistics.service';
import {
  ArrowLeft,
  Package,
  Truck,
  MapPin,
  Navigation,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Phone,
  User,
  Calendar,
  FileText,
  DollarSign,
  TrendingUp,
  Map,
  Eye,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

interface TrackingEvent {
  timestamp: string;
  location: string;
  city: string;
  state: string;
  status: string;
  description: string;
  icon: 'pickup' | 'transit' | 'hub' | 'delivery' | 'delay' | 'issue';
}

interface ShipmentDetails {
  shipmentNumber: string;
  trackingNumber: string;
  status: 'in_transit' | 'delivered' | 'delayed' | 'cancelled' | 'scheduled';
  priority: 'standard' | 'express' | 'urgent';

  carrier: string;
  carrierService: string;
  vehicleNumber: string;
  driverName: string;
  driverPhone: string;

  fromLocation: {
    name: string;
    address: string;
    city: string;
    state: string;
    contactPerson: string;
    contactPhone: string;
  };

  toLocation: {
    name: string;
    address: string;
    city: string;
    state: string;
    contactPerson: string;
    contactPhone: string;
  };

  scheduledPickup: string;
  actualPickup: string;
  estimatedDelivery: string;
  actualDelivery: string;

  totalPackages: number;
  totalWeight: number;
  totalVolume: number;
  totalCharges: number;

  currentLocation: string;
  nextCheckpoint: string;
  estimatedArrival: string;
  distanceCovered: number;
  distanceRemaining: number;
}

export default function TrackingViewPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'timeline' | 'details' | 'route'>('timeline');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Mock shipment data
  const shipment: ShipmentDetails = {
    shipmentNumber: 'SHP-2024-003',
    trackingNumber: 'BLUEDART456789123',
    status: 'in_transit',
    priority: 'express',

    carrier: 'Blue Dart Express',
    carrierService: 'Surface Premium',
    vehicleNumber: 'MH-12-AB-1234',
    driverName: 'Rajesh Kumar',
    driverPhone: '+91 98765 43210',

    fromLocation: {
      name: 'Main Warehouse - Pune',
      address: 'Plot No. 45, MIDC Industrial Area',
      city: 'Pune',
      state: 'Maharashtra',
      contactPerson: 'Suresh Patil',
      contactPhone: '+91 98765 11111',
    },

    toLocation: {
      name: 'Tata Steel Limited',
      address: 'Tata Steel Complex, Burmamines',
      city: 'Jamshedpur',
      state: 'Jharkhand',
      contactPerson: 'Amit Singh',
      contactPhone: '+91 98765 22222',
    },

    scheduledPickup: '2024-01-17 09:00',
    actualPickup: '2024-01-17 09:15',
    estimatedDelivery: '2024-01-20 14:00',
    actualDelivery: '',

    totalPackages: 2,
    totalWeight: 4000,
    totalVolume: 20.5,
    totalCharges: 22000,

    currentLocation: 'Nagpur Sorting Hub',
    nextCheckpoint: 'Raipur Distribution Center',
    estimatedArrival: '2024-01-19 18:00',
    distanceCovered: 420,
    distanceRemaining: 650,
  };

  // Tracking events
  const [trackingEvents, setTrackingEvents] = useState<TrackingEvent[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await LogisticsService.getTrackingEvents();
        const list = Array.isArray(res) ? res : ((res as any)?.data ?? (res as any)?.items ?? []);
        if (cancelled) return;
        const iconFor = (status: string): TrackingEvent['icon'] => {
          const st = (status || '').toLowerCase();
          if (st.includes('pick')) return 'pickup';
          if (st.includes('deliver')) return 'delivery';
          if (st.includes('hub') || st.includes('sort')) return 'hub';
          if (st.includes('delay')) return 'delay';
          if (st.includes('issue') || st.includes('exception')) return 'issue';
          return 'transit';
        };
        setTrackingEvents((list as any[]).map((r) => ({
          timestamp: r.timestamp ?? r.eventTime ?? r.createdAt ?? '',
          location: r.location ?? '',
          city: r.city ?? '',
          state: r.state ?? '',
          status: r.status ?? r.eventType ?? '',
          description: r.description ?? r.notes ?? '',
          icon: r.icon ?? iconFor(r.status ?? r.eventType ?? ''),
        })));
      } catch (e) {
        if (!cancelled) setLoadError(e instanceof Error ? e.message : 'Failed to load tracking events');
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Route checkpoints
  const routeCheckpoints = [
    { location: 'Pune, Maharashtra', status: 'completed', time: '2024-01-17 09:15' },
    { location: 'Mumbai, Maharashtra', status: 'completed', time: '2024-01-17 21:30' },
    { location: 'Nagpur, Maharashtra', status: 'current', time: '2024-01-18 16:30' },
    { location: 'Raipur, Chhattisgarh', status: 'upcoming', time: 'Est: 2024-01-19 18:00' },
    { location: 'Ranchi, Jharkhand', status: 'upcoming', time: 'Est: 2024-01-20 08:00' },
    { location: 'Jamshedpur, Jharkhand', status: 'upcoming', time: 'Est: 2024-01-20 14:00' },
  ];

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'in_transit':
        return { label: 'In Transit', color: 'bg-blue-100 text-blue-700', icon: <Truck className="w-4 h-4" /> };
      case 'delivered':
        return { label: 'Delivered', color: 'bg-green-100 text-green-700', icon: <CheckCircle2 className="w-4 h-4" /> };
      case 'delayed':
        return { label: 'Delayed', color: 'bg-yellow-100 text-yellow-700', icon: <AlertTriangle className="w-4 h-4" /> };
      case 'cancelled':
        return { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: <AlertTriangle className="w-4 h-4" /> };
      case 'scheduled':
        return { label: 'Scheduled', color: 'bg-gray-100 text-gray-700', icon: <Clock className="w-4 h-4" /> };
      default:
        return { label: status, color: 'bg-gray-100 text-gray-700', icon: null };
    }
  };

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return { label: 'Urgent', color: 'bg-red-100 text-red-700' };
      case 'express':
        return { label: 'Express', color: 'bg-orange-100 text-orange-700' };
      case 'standard':
        return { label: 'Standard', color: 'bg-blue-100 text-blue-700' };
      default:
        return { label: priority, color: 'bg-gray-100 text-gray-700' };
    }
  };

  const getEventIcon = (icon: string) => {
    switch (icon) {
      case 'pickup':
        return { component: <Package className="w-5 h-5" />, color: 'bg-green-100 text-green-600' };
      case 'transit':
        return { component: <Truck className="w-5 h-5" />, color: 'bg-blue-100 text-blue-600' };
      case 'hub':
        return { component: <MapPin className="w-5 h-5" />, color: 'bg-purple-100 text-purple-600' };
      case 'delivery':
        return { component: <CheckCircle2 className="w-5 h-5" />, color: 'bg-green-100 text-green-600' };
      case 'delay':
        return { component: <AlertTriangle className="w-5 h-5" />, color: 'bg-yellow-100 text-yellow-600' };
      case 'issue':
        return { component: <AlertTriangle className="w-5 h-5" />, color: 'bg-red-100 text-red-600' };
      default:
        return { component: <MapPin className="w-5 h-5" />, color: 'bg-gray-100 text-gray-600' };
    }
  };

  const statusConfig = getStatusConfig(shipment.status);
  const priorityConfig = getPriorityConfig(shipment.priority);

  const handleBack = () => {
    router.push('/logistics/tracking');
  };

  const handleRefresh = () => {
    // Simulate refresh
    console.log('Refreshing tracking data...');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-3">
      <div className="w-full">
        {loadError && (
          <div className="mb-3 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
            {loadError}
          </div>
        )}
        {/* Header */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handleBack}
              className="p-2 hover:bg-white rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-900">Track Shipment</h1>
                <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1.5 ${statusConfig.color}`}>
                  {statusConfig.icon}
                  {statusConfig.label}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${priorityConfig.color}`}>
                  {priorityConfig.label}
                </span>
              </div>
              <p className="text-gray-600 mt-1">
                {shipment.shipmentNumber} • Tracking: {shipment.trackingNumber}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button
              onClick={() => router.push(`/logistics/shipping/view/${params.id}`)}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 font-medium transition-all flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              View Full Details
            </button>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 mb-3">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Shipment Progress</h3>
              <p className="text-sm text-gray-600">Current location: {shipment.currentLocation}</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Estimated Delivery</div>
              <div className="text-lg font-bold text-gray-900">
                {new Date(shipment.estimatedDelivery).toLocaleString('en-IN', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative mb-2">
            <div className="h-2 bg-gray-200 rounded-full">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all"
                style={{ width: `${(shipment.distanceCovered / (shipment.distanceCovered + shipment.distanceRemaining)) * 100}%` }}
              />
            </div>
          </div>

          {/* Distance Info */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{shipment.distanceCovered} km</div>
              <div className="text-sm text-blue-700">Distance Covered</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{shipment.distanceRemaining} km</div>
              <div className="text-sm text-purple-700">Distance Remaining</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {Math.round((shipment.distanceCovered / (shipment.distanceCovered + shipment.distanceRemaining)) * 100)}%
              </div>
              <div className="text-sm text-green-700">Complete</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-3">
          {/* From Location */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-xl text-white">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-5 h-5" />
              <div className="text-sm opacity-90">Pickup From</div>
            </div>
            <div className="font-bold text-lg mb-1">{shipment.fromLocation.name}</div>
            <div className="text-sm opacity-90">{shipment.fromLocation.city}, {shipment.fromLocation.state}</div>
            <div className="mt-3 pt-3 border-t border-green-400">
              <div className="text-xs opacity-75">Actual Pickup</div>
              <div className="text-sm font-semibold">
                {new Date(shipment.actualPickup).toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          {/* Current Status */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl text-white">
            <div className="flex items-center gap-2 mb-3">
              <Truck className="w-5 h-5" />
              <div className="text-sm opacity-90">Current Location</div>
            </div>
            <div className="font-bold text-lg mb-1">{shipment.currentLocation}</div>
            <div className="text-sm opacity-90">Next: {shipment.nextCheckpoint}</div>
            <div className="mt-3 pt-3 border-t border-blue-400">
              <div className="text-xs opacity-75">Est. Arrival at Next Hub</div>
              <div className="text-sm font-semibold">
                {new Date(shipment.estimatedArrival).toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          {/* To Location */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-3 rounded-xl text-white">
            <div className="flex items-center gap-2 mb-3">
              <Navigation className="w-5 h-5" />
              <div className="text-sm opacity-90">Deliver To</div>
            </div>
            <div className="font-bold text-lg mb-1">{shipment.toLocation.name}</div>
            <div className="text-sm opacity-90">{shipment.toLocation.city}, {shipment.toLocation.state}</div>
            <div className="mt-3 pt-3 border-t border-orange-400">
              <div className="text-xs opacity-75">Expected Delivery</div>
              <div className="text-sm font-semibold">
                {new Date(shipment.estimatedDelivery).toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-3">
          <div className="border-b border-gray-200">
            <div className="flex gap-8 px-6">
              <button
                onClick={() => setActiveTab('timeline')}
                className={`py-4 border-b-2 font-medium transition-colors ${activeTab === 'timeline'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
              >
                Timeline
              </button>
              <button
                onClick={() => setActiveTab('route')}
                className={`py-4 border-b-2 font-medium transition-colors ${activeTab === 'route'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
              >
                Route Map
              </button>
              <button
                onClick={() => setActiveTab('details')}
                className={`py-4 border-b-2 font-medium transition-colors ${activeTab === 'details'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
              >
                Shipment Details
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Timeline Tab */}
            {activeTab === 'timeline' && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Tracking Timeline</h3>
                <div className="space-y-2">
                  {trackingEvents.map((event, index) => {
                    const iconConfig = getEventIcon(event.icon);
                    return (
                      <div key={index} className="flex gap-2">
                        <div className="flex flex-col items-center">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${iconConfig.color}`}>
                            {iconConfig.component}
                          </div>
                          {index < trackingEvents.length - 1 && (
                            <div className="w-0.5 h-16 bg-gray-200 my-2" />
                          )}
                        </div>
                        <div className="flex-1 pb-8">
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <div className="font-bold text-gray-900">{event.status}</div>
                                <div className="text-sm text-gray-600">{event.location}</div>
                              </div>
                              <div className="text-right">
                                <div className="text-xs text-gray-500">
                                  {new Date(event.timestamp).toLocaleDateString('en-IN', {
                                    month: 'short',
                                    day: 'numeric',
                                  })}
                                </div>
                                <div className="text-sm font-semibold text-gray-700">
                                  {new Date(event.timestamp).toLocaleTimeString('en-IN', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </div>
                              </div>
                            </div>
                            <p className="text-sm text-gray-700 mb-2">{event.description}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <MapPin className="w-3 h-3" />
                              {event.city}, {event.state}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Route Tab */}
            {activeTab === 'route' && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Route Checkpoints</h3>

                {/* Map Placeholder */}
                <div className="mb-3 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-12">
                  <div className="text-center">
                    <Map className="w-16 h-16 text-blue-600 mb-2" />
                    <h4 className="text-xl font-bold text-gray-900 mb-2">Interactive Map View</h4>
                    <p className="text-gray-600 mb-2">
                      Real-time shipment tracking on interactive map
                    </p>
                    <button className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 font-medium transition-all flex items-center gap-2">
                      <ExternalLink className="w-4 h-4" />
                      Open in Full Screen
                    </button>
                  </div>
                </div>

                {/* Checkpoint List */}
                <div className="space-y-3">
                  {routeCheckpoints.map((checkpoint, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-2 p-3 rounded-lg border-2 ${checkpoint.status === 'completed'
                          ? 'bg-green-50 border-green-300'
                          : checkpoint.status === 'current'
                            ? 'bg-blue-50 border-blue-300'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${checkpoint.status === 'completed'
                            ? 'bg-green-600 text-white'
                            : checkpoint.status === 'current'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-300 text-gray-600'
                          }`}
                      >
                        {checkpoint.status === 'completed' ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          index + 1
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-gray-900">{checkpoint.location}</div>
                        <div className="text-sm text-gray-600">{checkpoint.time}</div>
                      </div>
                      <div>
                        {checkpoint.status === 'completed' && (
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                            Completed
                          </span>
                        )}
                        {checkpoint.status === 'current' && (
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                            Current
                          </span>
                        )}
                        {checkpoint.status === 'upcoming' && (
                          <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                            Upcoming
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Details Tab */}
            {activeTab === 'details' && (
              <div className="space-y-3">
                {/* Carrier Information */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <Truck className="w-5 h-5 text-blue-600" />
                    Carrier & Vehicle Information
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Carrier</div>
                      <div className="font-semibold text-gray-900">{shipment.carrier}</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Service Type</div>
                      <div className="font-semibold text-gray-900">{shipment.carrierService}</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Vehicle Number</div>
                      <div className="font-semibold text-gray-900 font-mono">{shipment.vehicleNumber}</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Driver Name</div>
                      <div className="font-semibold text-gray-900">{shipment.driverName}</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg col-span-2">
                      <div className="text-sm text-gray-600 mb-1">Driver Contact</div>
                      <div className="font-semibold text-gray-900 flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {shipment.driverPhone}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Location Details */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-green-600" />
                      Pickup Location
                    </h3>
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg space-y-2">
                      <div className="font-bold text-gray-900">{shipment.fromLocation.name}</div>
                      <div className="text-sm text-gray-700">{shipment.fromLocation.address}</div>
                      <div className="text-sm text-gray-700">
                        {shipment.fromLocation.city}, {shipment.fromLocation.state}
                      </div>
                      <div className="pt-2 border-t border-green-300">
                        <div className="text-xs text-gray-600">Contact Person</div>
                        <div className="text-sm font-semibold text-gray-900">{shipment.fromLocation.contactPerson}</div>
                        <div className="text-sm text-gray-700">{shipment.fromLocation.contactPhone}</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <Navigation className="w-5 h-5 text-orange-600" />
                      Delivery Location
                    </h3>
                    <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg space-y-2">
                      <div className="font-bold text-gray-900">{shipment.toLocation.name}</div>
                      <div className="text-sm text-gray-700">{shipment.toLocation.address}</div>
                      <div className="text-sm text-gray-700">
                        {shipment.toLocation.city}, {shipment.toLocation.state}
                      </div>
                      <div className="pt-2 border-t border-orange-300">
                        <div className="text-xs text-gray-600">Contact Person</div>
                        <div className="text-sm font-semibold text-gray-900">{shipment.toLocation.contactPerson}</div>
                        <div className="text-sm text-gray-700">{shipment.toLocation.contactPhone}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Package Information */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <Package className="w-5 h-5 text-purple-600" />
                    Package Information
                  </h3>
                  <div className="grid grid-cols-4 gap-2">
                    <div className="p-4 bg-gray-50 rounded-lg text-center">
                      <div className="text-2xl font-bold text-gray-900">{shipment.totalPackages}</div>
                      <div className="text-sm text-gray-600">Packages</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg text-center">
                      <div className="text-2xl font-bold text-gray-900">{shipment.totalWeight}</div>
                      <div className="text-sm text-gray-600">Weight (kg)</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg text-center">
                      <div className="text-2xl font-bold text-gray-900">{shipment.totalVolume}</div>
                      <div className="text-sm text-gray-600">Volume (m³)</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg text-center">
                      <div className="text-2xl font-bold text-gray-900">₹{shipment.totalCharges.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">Charges</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
