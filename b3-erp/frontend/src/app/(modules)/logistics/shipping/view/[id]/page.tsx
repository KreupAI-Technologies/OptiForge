'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogisticsService } from '@/services/logistics.service';
import {
  ArrowLeft, Edit, Package, Truck, MapPin, Calendar,
  User, Phone, Mail, FileText, Download, Clock,
  CheckCircle, XCircle, AlertTriangle, TrendingUp, DollarSign
} from 'lucide-react';

interface Shipment {
  id: string;
  shipmentNumber: string;
  shipmentDate: string;
  deliveryDate?: string;
  orderNumber: string;
  orderType: 'sales_order' | 'transfer_order' | 'return_order';
  carrier: string;
  carrierService: string;
  trackingNumber: string;
  vehicleNumber: string;
  driverName: string;
  driverPhone: string;
  fromLocation: Location;
  toLocation: Location;
  items: ShipmentItem[];
  totalWeight: number;
  weightUnit: string;
  totalVolume: number;
  volumeUnit: string;
  numberOfPackages: number;
  freightCharges: number;
  insuranceCharges: number;
  otherCharges: number;
  totalCharges: number;
  status: 'draft' | 'scheduled' | 'in_transit' | 'delivered' | 'cancelled' | 'delayed';
  priority: 'standard' | 'express' | 'urgent';
  specialInstructions: string;
  shipmentType: 'domestic' | 'international';
  customsCleared: boolean;
  podReceived: boolean;
  createdBy: string;
  createdDate: string;
  dispatchedDate?: string;
  deliveredDate?: string;
}

interface Location {
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  contactPerson: string;
  contactPhone: string;
}

interface ShipmentItem {
  itemCode: string;
  itemName: string;
  quantity: number;
  uom: string;
  weight: number;
  volume: number;
  packageNumber: string;
}

interface TrackingEvent {
  id: string;
  timestamp: string;
  location: string;
  status: string;
  description: string;
  updatedBy: string;
}

export default function ShippingViewPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'details' | 'items' | 'tracking'>('details');

  // Mock data
  const shipment: Shipment = {
    id: params.id,
    shipmentNumber: 'SHP-2025-001456',
    shipmentDate: '2025-10-16',
    deliveryDate: '2025-10-18',
    orderNumber: 'SO-2025-789',
    orderType: 'sales_order',
    carrier: 'Blue Dart Express',
    carrierService: 'Express Delivery',
    trackingNumber: 'BD78945612301',
    vehicleNumber: 'MH-12-AB-1234',
    driverName: 'Ramesh Patil',
    driverPhone: '+91 98765 43210',
    fromLocation: {
      name: 'Main Warehouse - Pune',
      address: 'Plot No. 45, Chakan Industrial Area',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '410501',
      country: 'India',
      contactPerson: 'Rajesh Kulkarni',
      contactPhone: '+91 20 2765 4321'
    },
    toLocation: {
      name: 'Customer - ABC Industries',
      address: '123, Industrial Estate, Whitefield',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560066',
      country: 'India',
      contactPerson: 'Suresh Kumar',
      contactPhone: '+91 80 4567 8901'
    },
    items: [
      { itemCode: 'FG-CP-1000', itemName: 'Control Panel CP-1000', quantity: 5, uom: 'PCS', weight: 125, volume: 2.5, packageNumber: 'PKG-001' },
      { itemCode: 'FG-SG-500', itemName: 'Switch Gear SG-500', quantity: 3, uom: 'PCS', weight: 90, volume: 1.8, packageNumber: 'PKG-002' },
      { itemCode: 'FG-MS-750', itemName: 'Motor Starter MS-750', quantity: 8, uom: 'PCS', weight: 160, volume: 3.2, packageNumber: 'PKG-003' }
    ],
    totalWeight: 375,
    weightUnit: 'KG',
    totalVolume: 7.5,
    volumeUnit: 'CBM',
    numberOfPackages: 3,
    freightCharges: 12500,
    insuranceCharges: 2500,
    otherCharges: 1000,
    totalCharges: 16000,
    status: 'in_transit',
    priority: 'express',
    specialInstructions: 'Handle with care. Fragile electronic equipment. Delivery during business hours only.',
    shipmentType: 'domestic',
    customsCleared: true,
    podReceived: false,
    createdBy: 'Priya Sharma',
    createdDate: '2025-10-15 16:30:00',
    dispatchedDate: '2025-10-16 09:00:00'
  };

  const [trackingEvents, setTrackingEvents] = useState<TrackingEvent[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await LogisticsService.getTrackingEvents();
        const list = Array.isArray(res) ? res : ((res as any)?.data ?? (res as any)?.items ?? []);
        if (cancelled) return;
        setTrackingEvents((list as any[]).map((r, i) => ({
          id: String(r.id ?? r.eventId ?? `T${i + 1}`),
          timestamp: r.timestamp ?? r.eventTime ?? r.createdAt ?? '',
          location: r.location ?? '',
          status: r.status ?? r.eventType ?? '',
          description: r.description ?? r.notes ?? '',
          updatedBy: r.updatedBy ?? r.recordedBy ?? 'System',
        })));
      } catch (e) {
        if (!cancelled) setLoadError(e instanceof Error ? e.message : 'Failed to load tracking events');
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'delivered':
        return { label: 'Delivered', color: 'bg-green-100 text-green-700', icon: <CheckCircle className="w-5 h-5" /> };
      case 'in_transit':
        return { label: 'In Transit', color: 'bg-blue-100 text-blue-700', icon: <Truck className="w-5 h-5" /> };
      case 'scheduled':
        return { label: 'Scheduled', color: 'bg-purple-100 text-purple-700', icon: <Calendar className="w-5 h-5" /> };
      case 'delayed':
        return { label: 'Delayed', color: 'bg-yellow-100 text-yellow-700', icon: <AlertTriangle className="w-5 h-5" /> };
      case 'cancelled':
        return { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: <XCircle className="w-5 h-5" /> };
      case 'draft':
        return { label: 'Draft', color: 'bg-gray-100 text-gray-700', icon: <FileText className="w-5 h-5" /> };
      default:
        return { label: status, color: 'bg-gray-100 text-gray-700', icon: <Package className="w-5 h-5" /> };
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-700';
      case 'express': return 'bg-orange-100 text-orange-700';
      case 'standard': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const statusConfig = getStatusConfig(shipment.status);

  return (
    <div className="p-6 space-y-3">
      {loadError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
          {loadError}
        </div>
      )}
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
              <h1 className="text-3xl font-bold text-gray-900">Shipment Details</h1>
              <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${statusConfig.color}`}>
                {statusConfig.icon}
                {statusConfig.label}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getPriorityColor(shipment.priority)}`}>
                {shipment.priority.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <FileText className="w-4 h-4" />
                <span className="font-mono font-semibold">{shipment.shipmentNumber}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {shipment.shipmentDate}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Truck className="w-4 h-4" />
                {shipment.carrier}
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
            onClick={() => router.push(`/logistics/shipping/edit/${params.id}`)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700"
          >
            <Edit className="w-4 h-4" />
            Edit Shipment
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-5 gap-2">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl text-white">
          <div className="flex items-center justify-between mb-2">
            <Package className="w-8 h-8 opacity-80" />
          </div>
          <div className="text-3xl font-bold mb-1">{shipment.numberOfPackages}</div>
          <div className="text-blue-100 text-sm">Packages</div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-xl text-white">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 opacity-80" />
          </div>
          <div className="text-3xl font-bold mb-1">{shipment.totalWeight}</div>
          <div className="text-green-100 text-sm">Total Weight ({shipment.weightUnit})</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-xl text-white">
          <div className="flex items-center justify-between mb-2">
            <Package className="w-8 h-8 opacity-80" />
          </div>
          <div className="text-3xl font-bold mb-1">{shipment.totalVolume}</div>
          <div className="text-purple-100 text-sm">Volume ({shipment.volumeUnit})</div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-3 rounded-xl text-white">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 opacity-80" />
          </div>
          <div className="text-3xl font-bold mb-1">₹{(shipment.totalCharges / 1000).toFixed(1)}K</div>
          <div className="text-orange-100 text-sm">Total Charges</div>
        </div>

        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-3 rounded-xl text-white">
          <div className="flex items-center justify-between mb-2">
            <Truck className="w-8 h-8 opacity-80" />
          </div>
          <div className="text-3xl font-bold mb-1">{shipment.items.length}</div>
          <div className="text-indigo-100 text-sm">Line Items</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-3">
          <button
            onClick={() => setActiveTab('details')}
            className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
              activeTab === 'details'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Shipment Details
          </button>
          <button
            onClick={() => setActiveTab('items')}
            className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
              activeTab === 'items'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Items ({shipment.items.length})
          </button>
          <button
            onClick={() => setActiveTab('tracking')}
            className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
              activeTab === 'tracking'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Tracking History
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'details' && (
        <div className="space-y-3">
          {/* Shipment Information */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-3 rounded-lg border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Shipment Information
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Shipment Number</span>
                  <span className="font-mono font-semibold text-gray-900">{shipment.shipmentNumber}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Order Reference</span>
                  <span className="font-mono font-semibold text-blue-600">{shipment.orderNumber}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Shipment Date</span>
                  <span className="font-medium text-gray-900">{shipment.shipmentDate}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Expected Delivery</span>
                  <span className="font-medium text-gray-900">{shipment.deliveryDate || 'TBD'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Shipment Type</span>
                  <span className="font-medium text-gray-900 capitalize">{shipment.shipmentType}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Status</span>
                  <span className={`px-2 py-1 rounded text-sm font-semibold ${statusConfig.color}`}>
                    {statusConfig.label}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white p-3 rounded-lg border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Truck className="w-5 h-5 text-green-600" />
                Carrier & Vehicle
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Carrier</span>
                  <span className="font-semibold text-gray-900">{shipment.carrier}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Service</span>
                  <span className="font-medium text-gray-900">{shipment.carrierService}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Tracking Number</span>
                  <span className="font-mono font-semibold text-blue-600">{shipment.trackingNumber}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Vehicle Number</span>
                  <span className="font-mono font-semibold text-gray-900">{shipment.vehicleNumber}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Driver Name</span>
                  <span className="font-medium text-gray-900">{shipment.driverName}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Driver Phone</span>
                  <span className="font-medium text-gray-900">{shipment.driverPhone}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Locations */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-3 rounded-lg border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-orange-600" />
                From Location
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-600 block mb-1">Location Name</label>
                  <p className="font-semibold text-gray-900">{shipment.fromLocation.name}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 block mb-1">Address</label>
                  <p className="text-sm text-gray-700">{shipment.fromLocation.address}</p>
                  <p className="text-sm text-gray-700">
                    {shipment.fromLocation.city}, {shipment.fromLocation.state} - {shipment.fromLocation.pincode}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 block mb-1">Contact</label>
                  <p className="font-medium text-gray-900">{shipment.fromLocation.contactPerson}</p>
                  <p className="text-sm text-gray-700">{shipment.fromLocation.contactPhone}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-3 rounded-lg border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-purple-600" />
                To Location
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-600 block mb-1">Location Name</label>
                  <p className="font-semibold text-gray-900">{shipment.toLocation.name}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 block mb-1">Address</label>
                  <p className="text-sm text-gray-700">{shipment.toLocation.address}</p>
                  <p className="text-sm text-gray-700">
                    {shipment.toLocation.city}, {shipment.toLocation.state} - {shipment.toLocation.pincode}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 block mb-1">Contact</label>
                  <p className="font-medium text-gray-900">{shipment.toLocation.contactPerson}</p>
                  <p className="text-sm text-gray-700">{shipment.toLocation.contactPhone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Charges */}
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              Charges Breakdown
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Freight Charges</span>
                <span className="font-semibold text-gray-900">₹{shipment.freightCharges.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Insurance Charges</span>
                <span className="font-semibold text-gray-900">₹{shipment.insuranceCharges.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Other Charges</span>
                <span className="font-semibold text-gray-900">₹{shipment.otherCharges.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-3 border-t-2 border-gray-200">
                <span className="text-lg font-bold text-gray-900">Total Charges</span>
                <span className="text-lg font-bold text-green-700">₹{shipment.totalCharges.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Special Instructions */}
          {shipment.specialInstructions && (
            <div className="bg-white p-3 rounded-lg border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Special Instructions</h3>
              <p className="text-gray-700 leading-relaxed">{shipment.specialInstructions}</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'items' && (
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-3">Shipment Items</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Item Code</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Item Name</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Quantity</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Weight (KG)</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Volume (CBM)</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Package #</th>
                </tr>
              </thead>
              <tbody>
                {shipment.items.map((item, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <span className="font-mono text-sm font-medium text-blue-600">{item.itemCode}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm font-medium text-gray-900">{item.itemName}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-sm font-semibold text-gray-900">{item.quantity} {item.uom}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-sm text-gray-700">{item.weight}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-sm text-gray-700">{item.volume}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-sm text-gray-700">{item.packageNumber}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-200 bg-gray-50">
                  <td colSpan={3} className="py-3 px-4 text-right font-bold text-gray-900">Totals:</td>
                  <td className="py-3 px-4 text-center font-bold text-gray-900">{shipment.totalWeight}</td>
                  <td className="py-3 px-4 text-center font-bold text-gray-900">{shipment.totalVolume}</td>
                  <td className="py-3 px-4"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'tracking' && (
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-600" />
            Tracking History
          </h3>
          <div className="space-y-2">
            {trackingEvents.map((event, index) => (
              <div key={event.id} className="flex gap-2">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    event.status === 'delivered' ? 'bg-green-100 text-green-600' :
                    event.status === 'in_transit' ? 'bg-blue-100 text-blue-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {event.status === 'delivered' ? <CheckCircle className="w-5 h-5" /> :
                     event.status === 'in_transit' ? <Truck className="w-5 h-5" /> :
                     <Package className="w-5 h-5" />}
                  </div>
                  {index < trackingEvents.length - 1 && (
                    <div className="w-0.5 h-full bg-gray-200 my-1" />
                  )}
                </div>
                <div className="flex-1 pb-6">
                  <div className="flex items-start justify-between mb-1">
                    <h4 className="font-semibold text-gray-900">{event.description}</h4>
                    <span className="text-xs text-gray-500">{event.timestamp}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{event.location}</p>
                  <p className="text-xs text-gray-500">Updated by {event.updatedBy}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
