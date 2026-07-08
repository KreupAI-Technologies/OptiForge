'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogisticsService } from '@/services/logistics.service';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Search, MapPin, Truck, Package, Clock, CheckCircle, Navigation, Phone, User, Fuel, Route, RefreshCw, Loader2, AlertCircle } from 'lucide-react';

interface TrackingEvent {
  timestamp: string;
  location: string;
  status: string;
  description: string;
  icon: 'checkpoint' | 'loading' | 'transit' | 'delivery';
}

interface ShipmentTrace {
  shipmentNo: string;
  trackingNumber: string;
  origin: string;
  destination: string;
  currentLocation: string;
  status: 'in-transit' | 'delivered' | 'pending' | 'delayed';
  estimatedDelivery: string;
  vehicleNo: string;
  driverName: string;
  driverPhone: string;
  distanceCovered: string;
  distanceRemaining: string;
  progress: number;
  events: TrackingEvent[];
}

export default function TraceTrackingPage() {
  const router = useRouter();
  const [trackingQuery, setTrackingQuery] = useState('');
  const [shipmentTrace, setShipmentTrace] = useState<ShipmentTrace | null>(null);

  const [availableTraces, setAvailableTraces] = useState<ShipmentTrace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const loadShipments = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const shipments = await LogisticsService.getShipments();
      const list = Array.isArray(shipments) ? shipments : [];
      const mapped: ShipmentTrace[] = list.map((s: any) => ({
        shipmentNo: s.shipmentCode || s.shipmentNumber || s.shipmentNo || s.id || '',
        trackingNumber: s.trackingNumber || s.tracking_number || '',
        origin: s.origin || '',
        destination: s.destination || '',
        currentLocation: s.currentLocation || s.origin || '',
        status: (s.status as ShipmentTrace['status']) || 'pending',
        estimatedDelivery: s.estimatedDelivery || s.eta || '',
        vehicleNo: s.vehicleNo || s.vehicleNumber || '',
        driverName: s.driverName || '',
        driverPhone: s.driverPhone || '',
        distanceCovered: s.distanceCovered || '',
        distanceRemaining: s.distanceRemaining || '',
        progress: typeof s.progress === 'number' ? s.progress : 0,
        events: Array.isArray(s.events) ? s.events : [],
      }));
      setAvailableTraces(mapped);
    } catch (error) {
      console.error('Error loading shipments for trace:', error);
      setLoadError('Failed to load shipment data. Please try again.');
      setAvailableTraces([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadShipments();
  }, []);

  const handleTrack = () => {
    const query = trackingQuery.trim().toLowerCase();
    if (!query) {
      setShipmentTrace(null);
      setNotFound(false);
      return;
    }
    const trace = availableTraces.find(
      (t) =>
        (t.trackingNumber && t.trackingNumber.toLowerCase().includes(query)) ||
        (t.shipmentNo && t.shipmentNo.toLowerCase().includes(query))
    );
    if (trace) {
      setShipmentTrace(trace);
      setNotFound(false);
    } else {
      setShipmentTrace(null);
      setNotFound(true);
      toast({ title: 'Not found', description: `No shipment matched "${trackingQuery.trim()}".`, variant: 'destructive' });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-700 border-green-200';
      case 'in-transit': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'delayed': return 'bg-red-100 text-red-700 border-red-200';
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getEventIcon = (icon: string) => {
    switch (icon) {
      case 'loading': return <Package className="w-4 h-4 text-blue-600" />;
      case 'checkpoint': return <MapPin className="w-4 h-4 text-purple-600" />;
      case 'transit': return <Truck className="w-4 h-4 text-yellow-600" />;
      case 'delivery': return <CheckCircle className="w-4 h-4 text-green-600" />;
      default: return <MapPin className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2 bg-white border-b border-gray-200 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Navigation className="w-6 h-6 text-orange-600" />
              Trace & Track Shipment
            </h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black">Real-time shipment tracking and GPS location</p>
          </div>
        </div>
        <button
          onClick={loadShipments}
          disabled={isLoading}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span className="text-xs font-bold">{isLoading ? 'Loading...' : 'Refresh'}</span>
        </button>
      </div>

      {/* Main Content - Full Width Split View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Tracking Info */}
        <div className="w-full lg:w-[480px] bg-white border-r border-gray-200 flex flex-col overflow-hidden">
          {/* Search Bar */}
          <div className="p-4 border-b border-gray-100 flex-shrink-0">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Enter tracking number..."
                  value={trackingQuery}
                  onChange={(e) => setTrackingQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleTrack()}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono"
                />
              </div>
              <button
                onClick={handleTrack}
                className="px-4 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-black text-[10px] uppercase tracking-widest flex items-center gap-2"
              >
                <Navigation className="w-4 h-4" />
                Track
              </button>
            </div>
            <p className="text-[10px] text-gray-400 mt-2">
              Enter a tracking number or shipment number to trace
            </p>
          </div>

          {/* Shipment Details */}
          <div className="flex-1 overflow-y-auto">
            {shipmentTrace ? (
              <div className="p-4 space-y-2">
                {/* Status Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-black text-gray-900">{shipmentTrace.shipmentNo}</h3>
                    <p className="text-xs text-gray-500 font-mono">{shipmentTrace.trackingNumber}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase border ${getStatusColor(shipmentTrace.status)}`}>
                    {shipmentTrace.status.replace('-', ' ')}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="bg-gray-100 rounded-xl p-3">
                  <div className="flex justify-between text-[10px] font-black text-gray-500 uppercase mb-2">
                    <span>Origin</span>
                    <span>Destination</span>
                  </div>
                  <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full bg-orange-500 rounded-full transition-all"
                      style={{ width: `${shipmentTrace.progress}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-600">
                    <span>{shipmentTrace.distanceCovered} covered</span>
                    <span>{shipmentTrace.distanceRemaining} remaining</span>
                  </div>
                </div>

                {/* Location Cards */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <span className="text-[10px] font-black text-blue-600 uppercase">Origin</span>
                    </div>
                    <p className="text-xs font-bold text-blue-900">{shipmentTrace.origin}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="w-4 h-4 text-green-600" />
                      <span className="text-[10px] font-black text-green-600 uppercase">Destination</span>
                    </div>
                    <p className="text-xs font-bold text-green-900">{shipmentTrace.destination}</p>
                  </div>
                </div>

                {/* Current Location */}
                <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
                  <div className="flex items-center gap-2 mb-1">
                    <Navigation className="w-4 h-4 text-purple-600" />
                    <span className="text-[10px] font-black text-purple-600 uppercase">Current Location</span>
                  </div>
                  <p className="text-sm font-bold text-purple-900">{shipmentTrace.currentLocation}</p>
                </div>

                {/* ETA & Driver */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-orange-50 rounded-lg p-3 border border-orange-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-4 h-4 text-orange-600" />
                      <span className="text-[10px] font-black text-orange-600 uppercase">ETA</span>
                    </div>
                    <p className="text-xs font-bold text-orange-900">{shipmentTrace.estimatedDelivery}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Truck className="w-4 h-4 text-gray-600" />
                      <span className="text-[10px] font-black text-gray-600 uppercase">Vehicle</span>
                    </div>
                    <p className="text-xs font-mono font-bold text-gray-900">{shipmentTrace.vehicleNo}</p>
                  </div>
                </div>

                {/* Driver Info */}
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900">{shipmentTrace.driverName}</p>
                        <p className="text-[10px] text-gray-500">{shipmentTrace.driverPhone}</p>
                      </div>
                    </div>
                    <button className="p-2 bg-green-50 rounded-lg text-green-600 hover:bg-green-100 transition-colors">
                      <Phone className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Timeline */}
                <div className="pt-4 border-t border-gray-100">
                  <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Route className="w-4 h-4 text-orange-600" /> Tracking History
                  </h4>
                  <div className="relative">
                    <div className="absolute left-[11px] top-0 bottom-0 w-0.5 bg-gray-200"></div>
                    <div className="space-y-3">
                      {shipmentTrace.events.map((event, index) => (
                        <div key={index} className="relative flex gap-3">
                          <div className="relative z-10 flex-shrink-0 w-6 h-6 bg-white rounded-full border-2 border-gray-200 flex items-center justify-center">
                            {getEventIcon(event.icon)}
                          </div>
                          <div className="flex-1 bg-gray-50 rounded-lg p-3">
                            <div className="flex items-start justify-between">
                              <p className="text-xs font-bold text-gray-900">{event.status}</p>
                              <span className="text-[10px] text-gray-400">{event.timestamp.split(' ')[1]}</span>
                            </div>
                            <p className="text-[10px] text-gray-500 mt-0.5">{event.description}</p>
                            <p className="text-[10px] text-blue-600 mt-1 flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> {event.location}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : isLoading ? (
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center">
                  <Loader2 className="w-10 h-10 text-orange-500 animate-spin mx-auto mb-2" />
                  <p className="text-gray-500 font-bold">Loading shipments...</p>
                </div>
              </div>
            ) : loadError ? (
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center">
                  <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-2 mx-auto">
                    <AlertCircle className="w-10 h-10 text-red-500" />
                  </div>
                  <p className="text-red-500 font-bold mb-1">{loadError}</p>
                  <button onClick={loadShipments} className="text-xs text-orange-600 hover:text-orange-700 font-bold mt-1">
                    Try again
                  </button>
                </div>
              </div>
            ) : notFound ? (
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-2 mx-auto">
                    <Search className="w-10 h-10 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-bold mb-1">No shipment found</p>
                  <p className="text-xs text-gray-400">Check the tracking number and try again</p>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-2 mx-auto">
                    <Navigation className="w-10 h-10 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-bold mb-1">Enter tracking number</p>
                  <p className="text-xs text-gray-400">Get real-time updates on shipment location</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Map Area */}
        <div className="hidden lg:flex flex-1 bg-gray-100 items-center justify-center relative">
          {shipmentTrace ? (
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50">
              {/* Map Placeholder with Route Visualization */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="relative mb-3">
                    {/* Origin Point */}
                    <div className="absolute -top-20 left-1/2 -translate-x-1/2">
                      <div className="p-3 bg-blue-500 rounded-full shadow-lg">
                        <MapPin className="w-6 h-6 text-white" />
                      </div>
                      <p className="text-xs font-bold text-blue-700 mt-2 whitespace-nowrap">{shipmentTrace.origin}</p>
                    </div>

                    {/* Route Line */}
                    <div className="w-1 h-32 bg-gradient-to-b from-blue-500 via-orange-500 to-green-500 rounded-full"></div>

                    {/* Current Position */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <div className="p-3 bg-orange-500 rounded-full shadow-lg animate-pulse">
                        <Truck className="w-6 h-6 text-white" />
                      </div>
                    </div>

                    {/* Destination Point */}
                    <div className="absolute -bottom-20 left-1/2 -translate-x-1/2">
                      <div className="p-3 bg-green-500 rounded-full shadow-lg">
                        <MapPin className="w-6 h-6 text-white" />
                      </div>
                      <p className="text-xs font-bold text-green-700 mt-2 whitespace-nowrap">{shipmentTrace.destination}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map Info Overlay */}
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-lg">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Live Tracking</p>
                <p className="text-lg font-black text-gray-900">{shipmentTrace.progress}% Complete</p>
                <div className="w-32 bg-gray-200 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-orange-500 rounded-full" style={{ width: `${shipmentTrace.progress}%` }}></div>
                </div>
              </div>

              {/* Map Note */}
              <div className="absolute bottom-4 left-4 right-4 bg-white/80 backdrop-blur-sm rounded-lg p-3 text-center">
                <p className="text-[10px] text-gray-500">Interactive map integration available with GPS provider</p>
              </div>
            </div>
          ) : (
            <div className="text-center p-8">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-2">
                <MapPin className="w-12 h-12 text-gray-400" />
              </div>
              <p className="text-gray-500 font-bold mb-1">Map View</p>
              <p className="text-xs text-gray-400">Track a shipment to see its location on the map</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
