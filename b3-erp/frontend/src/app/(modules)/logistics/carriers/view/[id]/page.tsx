'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogisticsService } from '@/services/logistics.service';
import {
  ArrowLeft,
  Edit2,
  Trash2,
  Truck,
  Phone,
  Mail,
  MapPin,
  Globe,
  FileText,
  CheckCircle2,
  Clock,
  TrendingUp,
  TrendingDown,
  Package,
  DollarSign,
  AlertTriangle,
  Award,
  Star,
  Calendar,
  Navigation,
  Building2,
  User,
  X,
} from 'lucide-react';

interface Carrier {
  id: string;
  carrierCode: string;
  carrierName: string;
  carrierType: string;
  status: 'active' | 'inactive' | 'suspended';

  contactPerson: string;
  email: string;
  phone: string;
  website: string;

  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;

  serviceTypes: string[];
  coverageArea: string;
  transportModes: string[];

  performanceRating: number;
  totalShipments: number;
  onTimeDeliveries: number;
  delayedDeliveries: number;
  onTimePercentage: number;

  totalRevenue: number;
  averageTransitTime: number;

  gstNumber: string;
  panNumber: string;

  bankName: string;
  accountNumber: string;
  ifscCode: string;

  insuranceCoverage: boolean;
  trackingEnabled: boolean;
  podEnabled: boolean;

  remarks: string;
  createdDate: string;
  lastUpdated: string;
}

interface ShipmentHistory {
  id: string;
  shipmentNumber: string;
  trackingNumber: string;
  from: string;
  to: string;
  pickupDate: string;
  deliveryDate: string;
  status: 'delivered' | 'in_transit' | 'delayed' | 'cancelled';
  charges: number;
  rating: number;
}

export default function ViewCarrierPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'shipments' | 'performance' | 'activity'>('overview');

  // Mock carrier data
  const carrier: Carrier = {
    id: params.id,
    carrierCode: 'CAR-001',
    carrierName: 'Blue Dart Express',
    carrierType: 'Courier Service',
    status: 'active',

    contactPerson: 'Rajesh Kumar',
    email: 'rajesh.kumar@bluedart.com',
    phone: '+91 98765 43210',
    website: 'www.bluedart.com',

    address: 'Blue Dart Centre, Safdarjung Airport',
    city: 'New Delhi',
    state: 'Delhi',
    pincode: '110003',
    country: 'India',

    serviceTypes: ['Express', 'Surface', 'Same Day', 'International'],
    coverageArea: 'Pan India + International',
    transportModes: ['Air', 'Surface', 'Rail'],

    performanceRating: 4.5,
    totalShipments: 1250,
    onTimeDeliveries: 1125,
    delayedDeliveries: 95,
    onTimePercentage: 90,

    totalRevenue: 3250000,
    averageTransitTime: 3.2,

    gstNumber: '07AAACB1234F1Z5',
    panNumber: 'AAACB1234F',

    bankName: 'HDFC Bank',
    accountNumber: '12345678901234',
    ifscCode: 'HDFC0001234',

    insuranceCoverage: true,
    trackingEnabled: true,
    podEnabled: true,

    remarks: 'Premium carrier with excellent track record for express deliveries',
    createdDate: '2024-01-15',
    lastUpdated: '2024-01-20',
  };

  // Mock shipment history
  const [shipmentHistory, setShipmentHistory] = useState<ShipmentHistory[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await LogisticsService.getShipments();
        const list = Array.isArray(res) ? res : ((res as any)?.data ?? (res as any)?.items ?? []);
        if (cancelled) return;
        setShipmentHistory((list as any[]).map((r, i) => ({
          id: String(r.id ?? i),
          shipmentNumber: r.shipmentNumber ?? r.shipmentNo ?? '',
          trackingNumber: r.trackingNumber ?? '',
          from: r.from ?? r.origin ?? r.originAddress ?? '',
          to: r.to ?? r.destination ?? r.destinationAddress ?? '',
          pickupDate: r.pickupDate ?? r.actualPickup ?? '',
          deliveryDate: r.deliveryDate ?? r.actualDelivery ?? r.deliveredAt ?? '',
          status: (r.status ?? 'in_transit') as ShipmentHistory['status'],
          charges: Number(r.charges ?? r.totalCharges ?? r.value ?? 0),
          rating: Number(r.rating ?? 0),
        })));
      } catch (e) {
        if (!cancelled) setLoadError(e instanceof Error ? e.message : 'Failed to load shipment history');
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Activity timeline
  const activities = [
    { date: '2024-01-20 14:30', user: 'System', action: 'Performance metrics updated', type: 'info' },
    { date: '2024-01-20 10:15', user: 'Rahul Sharma', action: 'Updated contact information', type: 'update' },
    { date: '2024-01-19 16:45', user: 'System', action: 'New shipment SHP-2024-004 assigned', type: 'info' },
    { date: '2024-01-18 09:30', user: 'Priya Patel', action: 'Payment processed - ₹71,000', type: 'success' },
    { date: '2024-01-17 11:20', user: 'System', action: 'Shipment SHP-2024-001 delivered successfully', type: 'success' },
    { date: '2024-01-16 14:00', user: 'Amit Singh', action: 'Service level agreement renewed', type: 'success' },
  ];

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'active':
        return { label: 'Active', color: 'bg-green-100 text-green-700', icon: <CheckCircle2 className="w-4 h-4" /> };
      case 'inactive':
        return { label: 'Inactive', color: 'bg-gray-100 text-gray-700', icon: <Clock className="w-4 h-4" /> };
      case 'suspended':
        return { label: 'Suspended', color: 'bg-red-100 text-red-700', icon: <AlertTriangle className="w-4 h-4" /> };
      default:
        return { label: status, color: 'bg-gray-100 text-gray-700', icon: null };
    }
  };

  const getShipmentStatusConfig = (status: string) => {
    switch (status) {
      case 'delivered':
        return { label: 'Delivered', color: 'bg-green-100 text-green-700' };
      case 'in_transit':
        return { label: 'In Transit', color: 'bg-blue-100 text-blue-700' };
      case 'delayed':
        return { label: 'Delayed', color: 'bg-yellow-100 text-yellow-700' };
      case 'cancelled':
        return { label: 'Cancelled', color: 'bg-red-100 text-red-700' };
      default:
        return { label: status, color: 'bg-gray-100 text-gray-700' };
    }
  };

  const statusConfig = getStatusConfig(carrier.status);

  const handleEdit = () => {
    router.push(`/logistics/carriers/edit/${params.id}`);
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this carrier? This action cannot be undone.')) {
      // API call to delete
      router.push('/logistics/carriers');
    }
  };

  const handleBack = () => {
    router.push('/logistics/carriers');
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
              }`}
          />
        ))}
      </div>
    );
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
                <h1 className="text-3xl font-bold text-gray-900">{carrier.carrierName}</h1>
                <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1.5 ${statusConfig.color}`}>
                  {statusConfig.icon}
                  {statusConfig.label}
                </span>
              </div>
              <p className="text-gray-600 mt-1">
                {carrier.carrierCode} • {carrier.carrierType}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleEdit}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 font-medium transition-all flex items-center gap-2"
            >
              <Edit2 className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 font-medium transition-all flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-5 gap-2 mb-3">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl text-white">
            <Package className="w-8 h-8 mb-3 opacity-80" />
            <div className="text-3xl font-bold mb-1">{carrier.totalShipments.toLocaleString()}</div>
            <div className="text-blue-100 text-sm">Total Shipments</div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-xl text-white">
            <CheckCircle2 className="w-8 h-8 mb-3 opacity-80" />
            <div className="text-3xl font-bold mb-1">{carrier.onTimePercentage}%</div>
            <div className="text-green-100 text-sm">On-Time Delivery</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-xl text-white">
            <Star className="w-8 h-8 mb-3 opacity-80" />
            <div className="text-3xl font-bold mb-1">{carrier.performanceRating.toFixed(1)}</div>
            <div className="text-purple-100 text-sm">Rating (out of 5)</div>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-3 rounded-xl text-white">
            <DollarSign className="w-8 h-8 mb-3 opacity-80" />
            <div className="text-3xl font-bold mb-1">₹{(carrier.totalRevenue / 1000).toFixed(0)}K</div>
            <div className="text-orange-100 text-sm">Total Revenue</div>
          </div>
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-3 rounded-xl text-white">
            <Clock className="w-8 h-8 mb-3 opacity-80" />
            <div className="text-3xl font-bold mb-1">{carrier.averageTransitTime.toFixed(1)}</div>
            <div className="text-indigo-100 text-sm">Avg Transit Days</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-3">
          <div className="border-b border-gray-200">
            <div className="flex gap-8 px-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 border-b-2 font-medium transition-colors ${activeTab === 'overview'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('shipments')}
                className={`py-4 border-b-2 font-medium transition-colors ${activeTab === 'shipments'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
              >
                Shipment History
              </button>
              <button
                onClick={() => setActiveTab('performance')}
                className={`py-4 border-b-2 font-medium transition-colors ${activeTab === 'performance'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
              >
                Performance Metrics
              </button>
              <button
                onClick={() => setActiveTab('activity')}
                className={`py-4 border-b-2 font-medium transition-colors ${activeTab === 'activity'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
              >
                Activity
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-3">
                {/* Contact Information */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3 text-gray-600 mb-2">
                        <User className="w-4 h-4" />
                        <span className="text-sm font-medium">Contact Person</span>
                      </div>
                      <div className="font-semibold text-gray-900">{carrier.contactPerson}</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3 text-gray-600 mb-2">
                        <Mail className="w-4 h-4" />
                        <span className="text-sm font-medium">Email</span>
                      </div>
                      <div className="font-semibold text-gray-900">{carrier.email}</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3 text-gray-600 mb-2">
                        <Phone className="w-4 h-4" />
                        <span className="text-sm font-medium">Phone</span>
                      </div>
                      <div className="font-semibold text-gray-900">{carrier.phone}</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3 text-gray-600 mb-2">
                        <Globe className="w-4 h-4" />
                        <span className="text-sm font-medium">Website</span>
                      </div>
                      <div className="font-semibold text-gray-900">{carrier.website}</div>
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-green-600" />
                    Address Information
                  </h3>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-gray-900 font-semibold mb-2">{carrier.address}</div>
                    <div className="text-gray-600">
                      {carrier.city}, {carrier.state} - {carrier.pincode}
                    </div>
                    <div className="text-gray-600">{carrier.country}</div>
                  </div>
                </div>

                {/* Service Information */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <Truck className="w-5 h-5 text-purple-600" />
                    Service Information
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm font-medium text-gray-600 mb-2">Service Types</div>
                      <div className="flex flex-wrap gap-2">
                        {carrier.serviceTypes.map((service) => (
                          <span key={service} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                            {service}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm font-medium text-gray-600 mb-2">Transport Modes</div>
                      <div className="flex flex-wrap gap-2">
                        {carrier.transportModes.map((mode) => (
                          <span key={mode} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                            {mode}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm font-medium text-gray-600 mb-2">Coverage Area</div>
                      <div className="font-semibold text-gray-900">{carrier.coverageArea}</div>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <Award className="w-5 h-5 text-orange-600" />
                    Features & Capabilities
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    <div className={`p-4 rounded-lg border-2 ${carrier.insuranceCoverage ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-300'}`}>
                      <div className="flex items-center gap-2">
                        {carrier.insuranceCoverage ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        ) : (
                          <X className="w-5 h-5 text-gray-400" />
                        )}
                        <span className={`font-semibold ${carrier.insuranceCoverage ? 'text-green-900' : 'text-gray-600'}`}>
                          Insurance Coverage
                        </span>
                      </div>
                    </div>
                    <div className={`p-4 rounded-lg border-2 ${carrier.trackingEnabled ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-300'}`}>
                      <div className="flex items-center gap-2">
                        {carrier.trackingEnabled ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        ) : (
                          <X className="w-5 h-5 text-gray-400" />
                        )}
                        <span className={`font-semibold ${carrier.trackingEnabled ? 'text-green-900' : 'text-gray-600'}`}>
                          Real-time Tracking
                        </span>
                      </div>
                    </div>
                    <div className={`p-4 rounded-lg border-2 ${carrier.podEnabled ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-300'}`}>
                      <div className="flex items-center gap-2">
                        {carrier.podEnabled ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        ) : (
                          <X className="w-5 h-5 text-gray-400" />
                        )}
                        <span className={`font-semibold ${carrier.podEnabled ? 'text-green-900' : 'text-gray-600'}`}>
                          Proof of Delivery
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tax & Bank Information */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-indigo-600" />
                      Tax Information
                    </h3>
                    <div className="space-y-3">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="text-sm font-medium text-gray-600 mb-1">GST Number</div>
                        <div className="font-mono font-semibold text-gray-900">{carrier.gstNumber}</div>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="text-sm font-medium text-gray-600 mb-1">PAN Number</div>
                        <div className="font-mono font-semibold text-gray-900">{carrier.panNumber}</div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-purple-600" />
                      Bank Information
                    </h3>
                    <div className="space-y-3">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="text-sm font-medium text-gray-600 mb-1">Bank Name</div>
                        <div className="font-semibold text-gray-900">{carrier.bankName}</div>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="text-sm font-medium text-gray-600 mb-1">Account Number</div>
                        <div className="font-mono font-semibold text-gray-900">{carrier.accountNumber}</div>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="text-sm font-medium text-gray-600 mb-1">IFSC Code</div>
                        <div className="font-mono font-semibold text-gray-900">{carrier.ifscCode}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Remarks */}
                {carrier.remarks && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Remarks</h3>
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-gray-700">{carrier.remarks}</p>
                    </div>
                  </div>
                )}

                {/* Metadata */}
                <div className="pt-6 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>Created: {new Date(carrier.createdDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>Last Updated: {new Date(carrier.lastUpdated).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Shipments Tab */}
            {activeTab === 'shipments' && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Shipment History</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Shipment</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Tracking Number</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Route</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Dates</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Charges</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Rating</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {shipmentHistory.map((shipment) => {
                        const shipmentStatus = getShipmentStatusConfig(shipment.status);
                        return (
                          <tr key={shipment.id} className="hover:bg-gray-50">
                            <td className="px-4 py-4">
                              <div className="font-semibold text-gray-900">{shipment.shipmentNumber}</div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="font-mono text-sm text-gray-600">{shipment.trackingNumber}</div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-2 text-sm">
                                <MapPin className="w-4 h-4 text-green-600" />
                                <span className="text-gray-900">{shipment.from}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm mt-1">
                                <Navigation className="w-4 h-4 text-red-600" />
                                <span className="text-gray-900">{shipment.to}</span>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="text-sm text-gray-600">
                                Pickup: {new Date(shipment.pickupDate).toLocaleDateString('en-IN')}
                              </div>
                              {shipment.deliveryDate && (
                                <div className="text-sm text-gray-600 mt-1">
                                  Delivery: {new Date(shipment.deliveryDate).toLocaleDateString('en-IN')}
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${shipmentStatus.color}`}>
                                {shipmentStatus.label}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <div className="font-semibold text-gray-900">₹{shipment.charges.toLocaleString()}</div>
                            </td>
                            <td className="px-4 py-4">
                              {shipment.rating > 0 ? (
                                renderStars(shipment.rating)
                              ) : (
                                <span className="text-gray-400 text-sm">Not rated</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Performance Tab */}
            {activeTab === 'performance' && (
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Performance Analytics</h3>

                {/* Delivery Performance */}
                <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                  <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    Delivery Performance
                  </h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <div className="text-sm text-gray-600 mb-2">On-Time Deliveries</div>
                      <div className="text-3xl font-bold text-green-600 mb-2">{carrier.onTimeDeliveries}</div>
                      <div className="w-full h-2 bg-gray-200 rounded-full">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: `${carrier.onTimePercentage}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-600 mt-1">{carrier.onTimePercentage}% of total</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-2">Delayed Deliveries</div>
                      <div className="text-3xl font-bold text-yellow-600 mb-2">{carrier.delayedDeliveries}</div>
                      <div className="w-full h-2 bg-gray-200 rounded-full">
                        <div
                          className="h-full bg-yellow-500 rounded-full"
                          style={{ width: `${(carrier.delayedDeliveries / carrier.totalShipments) * 100}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {((carrier.delayedDeliveries / carrier.totalShipments) * 100).toFixed(1)}% of total
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-2">Other Issues</div>
                      <div className="text-3xl font-bold text-red-600 mb-2">
                        {carrier.totalShipments - carrier.onTimeDeliveries - carrier.delayedDeliveries}
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full">
                        <div
                          className="h-full bg-red-500 rounded-full"
                          style={{
                            width: `${((carrier.totalShipments - carrier.onTimeDeliveries - carrier.delayedDeliveries) / carrier.totalShipments) * 100}%`
                          }}
                        />
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {(((carrier.totalShipments - carrier.onTimeDeliveries - carrier.delayedDeliveries) / carrier.totalShipments) * 100).toFixed(1)}% of total
                      </div>
                    </div>
                  </div>
                </div>

                {/* Performance Rating */}
                <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                  <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <Star className="w-5 h-5 text-purple-600" />
                    Overall Rating
                  </h4>
                  <div className="flex items-center gap-8">
                    <div className="text-center">
                      <div className="text-6xl font-bold text-purple-600 mb-2">{carrier.performanceRating.toFixed(1)}</div>
                      <div className="flex justify-center mb-2">
                        {renderStars(Math.round(carrier.performanceRating))}
                      </div>
                      <div className="text-sm text-gray-600">Out of 5.0</div>
                    </div>
                    <div className="flex-1">
                      <div className="space-y-3">
                        {[5, 4, 3, 2, 1].map((rating) => (
                          <div key={rating} className="flex items-center gap-3">
                            <span className="text-sm text-gray-600 w-8">{rating} star</span>
                            <div className="flex-1 h-2 bg-gray-200 rounded-full">
                              <div
                                className="h-full bg-purple-500 rounded-full"
                                style={{
                                  width: `${rating === 5 ? 60 : rating === 4 ? 25 : rating === 3 ? 10 : rating === 2 ? 3 : 2}%`
                                }}
                              />
                            </div>
                            <span className="text-sm text-gray-600 w-12 text-right">
                              {rating === 5 ? 60 : rating === 4 ? 25 : rating === 3 ? 10 : rating === 2 ? 3 : 2}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Transit Time */}
                <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                  <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-green-600" />
                    Transit Time Analysis
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-sm text-gray-600 mb-2">Average Transit Time</div>
                      <div className="text-4xl font-bold text-green-600">{carrier.averageTransitTime.toFixed(1)} days</div>
                      <div className="text-sm text-gray-600 mt-2">Based on {carrier.totalShipments} shipments</div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Express (Same Day - 1 Day)</span>
                        <span className="font-semibold text-gray-900">35%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Fast (2-3 Days)</span>
                        <span className="font-semibold text-gray-900">45%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Standard (4-5 Days)</span>
                        <span className="font-semibold text-gray-900">15%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Slow (6+ Days)</span>
                        <span className="font-semibold text-gray-900">5%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Revenue Analysis */}
                <div className="p-6 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-200">
                  <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-orange-600" />
                    Revenue Analysis
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-sm text-gray-600 mb-2">Total Revenue Generated</div>
                      <div className="text-4xl font-bold text-orange-600">
                        ₹{carrier.totalRevenue.toLocaleString('en-IN')}
                      </div>
                      <div className="text-sm text-gray-600 mt-2">From {carrier.totalShipments} shipments</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-2">Average Revenue per Shipment</div>
                      <div className="text-4xl font-bold text-orange-600">
                        ₹{Math.round(carrier.totalRevenue / carrier.totalShipments).toLocaleString('en-IN')}
                      </div>
                      <div className="text-sm text-gray-600 mt-2">Across all service types</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Activity Tab */}
            {activeTab === 'activity' && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Activity Timeline</h3>
                <div className="space-y-2">
                  {activities.map((activity, index) => (
                    <div key={index} className="flex gap-2">
                      <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activity.type === 'success' ? 'bg-green-100' :
                            activity.type === 'update' ? 'bg-blue-100' :
                              activity.type === 'warning' ? 'bg-yellow-100' :
                                'bg-gray-100'
                          }`}>
                          {activity.type === 'success' ? (
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                          ) : activity.type === 'update' ? (
                            <Edit2 className="w-5 h-5 text-blue-600" />
                          ) : (
                            <Clock className="w-5 h-5 text-gray-600" />
                          )}
                        </div>
                        {index < activities.length - 1 && (
                          <div className="w-0.5 h-12 bg-gray-200 my-1" />
                        )}
                      </div>
                      <div className="flex-1 pb-8">
                        <div className="text-sm text-gray-600 mb-1">{activity.date}</div>
                        <div className="font-semibold text-gray-900">{activity.action}</div>
                        <div className="text-sm text-gray-600">by {activity.user}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
