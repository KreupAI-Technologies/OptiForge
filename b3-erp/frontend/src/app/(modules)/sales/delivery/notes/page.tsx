'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Search,
  FileText,
  Package,
  User,
  Calendar,
  Truck,
  Eye,
  Download,
  Printer,
  CheckCircle,
  Clock,
  MapPin,
  AlertCircle
} from 'lucide-react';
import { deliveryNoteService } from '@/services/delivery-note.service';

interface DeliveryNote {
  id: string;
  deliveryNoteNumber: string;
  orderNumber: string;
  customerName: string;
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  issueDate: string;
  deliveryDate?: string;
  status: 'issued' | 'in_transit' | 'delivered' | 'cancelled';
  itemsCount: number;
  totalQuantity: number;
  carrier: string;
  vehicleNumber?: string;
  driverName?: string;
  driverPhone?: string;
  specialInstructions?: string;
}

export default function DeliveryNotesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [deliveryNotes, setDeliveryNotes] = useState<DeliveryNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    // Map backend status enum (Draft/Issued/Acknowledged/Disputed/Cancelled)
    // to this page's status values.
    const statusMap: Record<string, DeliveryNote['status']> = {
      Draft: 'issued',
      Issued: 'issued',
      InTransit: 'in_transit',
      Acknowledged: 'delivered',
      Delivered: 'delivered',
      Disputed: 'issued',
      Cancelled: 'cancelled',
    };
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const response = (await deliveryNoteService.getAllDeliveryNotes()) as any;
        const raw: any[] = Array.isArray(response) ? response : (response?.data ?? []);
        const mapped: DeliveryNote[] = (raw ?? []).map((n) => ({
          id: String(n.id ?? ''),
          deliveryNoteNumber: n.deliveryNoteNumber ?? '',
          orderNumber: n.orderNumber ?? n.shipmentNumber ?? '',
          customerName: n.customerName ?? '',
          deliveryAddress: {
            street: n.deliveryAddress ?? '',
            city: n.city ?? '',
            state: n.state ?? '',
            pincode: n.postalCode ?? n.pincode ?? '',
          },
          issueDate: n.createdAt ?? n.issueDate ?? n.deliveryDate ?? '',
          deliveryDate: n.deliveryDate ?? undefined,
          status: statusMap[(n.status ?? '').toString()] ?? 'issued',
          itemsCount: Number(n.totalItems ?? (Array.isArray(n.items) ? n.items.length : 0)),
          totalQuantity: Number(n.totalDeliveredQuantity ?? 0),
          carrier: n.carrier ?? '—',
          vehicleNumber: n.vehicleNumber ?? undefined,
          driverName: n.driverName ?? n.receivedBy ?? undefined,
          driverPhone: n.driverPhone ?? undefined,
          specialInstructions: n.notes ?? n.specialInstructions ?? undefined,
        }));
        if (!cancelled) setDeliveryNotes(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load delivery notes');
          setDeliveryNotes([]);
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

  const filteredNotes = deliveryNotes.filter(note => {
    const matchesSearch =
      note.deliveryNoteNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.customerName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = selectedStatus === 'all' || note.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const totalNotes = deliveryNotes.length;
  const inTransit = deliveryNotes.filter(n => n.status === 'in_transit').length;
  const delivered = deliveryNotes.filter(n => n.status === 'delivered').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'issued': return 'bg-blue-100 text-blue-700';
      case 'in_transit': return 'bg-yellow-100 text-yellow-700';
      case 'delivered': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'issued': return <FileText className="w-4 h-4" />;
      case 'in_transit': return <Truck className="w-4 h-4" />;
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <Clock className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-blue-50 px-3 py-2">
      <div className="space-y-3">
        {isLoading && (
          <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
            Loading delivery notes…
          </div>
        )}
        {loadError && !isLoading && (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4" />
            {loadError}
          </div>
        )}
        {/* Inline Header */}
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={() => window.history.back()}
            className="p-2 hover:bg-white/50 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div className="flex items-center gap-3 ml-auto">
            <button className="px-4 py-2 text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors">
              Export List
            </button>
            <button className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:from-cyan-700 hover:to-blue-700 transition-colors flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Create Delivery Note
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl p-3 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cyan-100 text-sm font-medium">Total Delivery Notes</p>
                <p className="text-3xl font-bold mt-2">{totalNotes}</p>
                <p className="text-cyan-100 text-xs mt-1">Generated</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <FileText className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl p-3 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm font-medium">In Transit</p>
                <p className="text-3xl font-bold mt-2">{inTransit}</p>
                <p className="text-yellow-100 text-xs mt-1">On the way</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <Truck className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-3 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Delivered</p>
                <p className="text-3xl font-bold mt-2">{delivered}</p>
                <p className="text-green-100 text-xs mt-1">Successfully completed</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <CheckCircle className="w-8 h-8" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by delivery note, order, or customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="issued">Issued</option>
              <option value="in_transit">In Transit</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Delivery Notes Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {filteredNotes.map((note) => (
            <div key={note.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 hover:shadow-md transition-shadow">
              <div className="space-y-2">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-gray-900">{note.deliveryNoteNumber}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(note.status)}`}>
                        {getStatusIcon(note.status)}
                        {note.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Order: {note.orderNumber}</p>
                    <p className="text-gray-600 mt-1">{note.customerName}</p>
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="flex items-start gap-3 bg-gray-50 rounded-lg p-3">
                  <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-gray-600">
                    <p>{note.deliveryAddress.street}</p>
                    <p>{note.deliveryAddress.city}, {note.deliveryAddress.state}</p>
                    <p>{note.deliveryAddress.pincode}</p>
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm text-gray-600">Issue Date</p>
                    <p className="font-medium text-gray-900">{new Date(note.issueDate).toLocaleDateString('en-IN')}</p>
                  </div>
                  {note.deliveryDate && (
                    <div>
                      <p className="text-sm text-gray-600">Delivery Date</p>
                      <p className="font-medium text-green-600">{new Date(note.deliveryDate).toLocaleDateString('en-IN')}</p>
                    </div>
                  )}
                </div>

                {/* Items */}
                <div className="flex items-center justify-between bg-cyan-50 border border-cyan-200 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-cyan-600" />
                    <span className="text-sm font-medium text-cyan-900">{note.itemsCount} items</span>
                  </div>
                  <span className="text-sm font-medium text-cyan-900">{note.totalQuantity} units</span>
                </div>

                {/* Carrier & Driver */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <Truck className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-blue-900">{note.carrier}</span>
                  </div>
                  {note.vehicleNumber && (
                    <p className="text-sm text-blue-700">Vehicle: {note.vehicleNumber}</p>
                  )}
                  {note.driverName && (
                    <p className="text-sm text-blue-700">Driver: {note.driverName}</p>
                  )}
                  {note.driverPhone && (
                    <p className="text-sm text-blue-700">Contact: {note.driverPhone}</p>
                  )}
                </div>

                {/* Special Instructions */}
                {note.specialInstructions && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-sm text-yellow-800">
                      <strong>Instructions:</strong> {note.specialInstructions}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                  <button className="flex-1 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors flex items-center justify-center gap-2">
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                  <button className="inline-flex items-center gap-1.5 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm">
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </button>
                  <button className="inline-flex items-center gap-1.5 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm">
                    <Printer className="w-4 h-4" />
                    <span>Print</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredNotes.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mb-2" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Delivery Notes</h3>
            <p className="text-gray-600">No delivery notes match your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
