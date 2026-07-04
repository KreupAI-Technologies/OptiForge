'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Search,
  Clock,
  Package,
  CheckCircle,
  AlertCircle,
  User,
  Phone,
  MapPin,
  Calendar,
  Truck,
  FileText,
  Camera
} from 'lucide-react';
import { salesPagesService } from '@/services/sales-pages.service';

interface PendingHandover {
  id: string;
  handoverNumber: string;
  orderNumber: string;
  customerName: string;
  customerContact: string;
  customerPhone: string;
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  scheduledDate: string;
  scheduledTime: string;
  itemsCount: number;
  totalQuantity: number;
  priority: 'normal' | 'high' | 'urgent';
  readyForHandover: boolean;
  documentsReady: boolean;
  qualityCheckDone: boolean;
  packagingComplete: boolean;
  transportArranged: boolean;
  daysUntilHandover: number;
  specialInstructions?: string;
}

export default function PendingHandoverPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');

  const [pendingHandovers, setPendingHandovers] = useState<PendingHandover[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = await salesPagesService.getHandovers();
        const mapped: PendingHandover[] = raw.map((r: any) => ({
          id: String(r.id ?? ''),
          handoverNumber: r.handoverNumber ?? '',
          orderNumber: r.orderNumber ?? '',
          customerName: r.customerName ?? '',
          customerContact: r.customerContact ?? '',
          customerPhone: r.customerPhone ?? '',
          deliveryAddress: {
            street: r.deliveryAddress?.street ?? '',
            city: r.deliveryAddress?.city ?? '',
            state: r.deliveryAddress?.state ?? '',
            pincode: r.deliveryAddress?.pincode ?? ''
          },
          scheduledDate: r.scheduledDate ?? '',
          scheduledTime: r.scheduledTime ?? '',
          itemsCount: r.itemsCount ?? 0,
          totalQuantity: r.totalQuantity ?? 0,
          priority: (r.priority ?? 'normal') as PendingHandover['priority'],
          readyForHandover: r.readyForHandover ?? false,
          documentsReady: r.documentsReady ?? false,
          qualityCheckDone: r.qualityCheckDone ?? false,
          packagingComplete: r.packagingComplete ?? false,
          transportArranged: r.transportArranged ?? false,
          daysUntilHandover: r.daysUntilHandover ?? 0,
          specialInstructions: r.specialInstructions
        }));
        if (!cancelled) setPendingHandovers(mapped);
      } catch (e) {
        if (!cancelled) { setLoadError(e instanceof Error ? e.message : 'Failed to load'); setPendingHandovers([]); }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filteredHandovers = pendingHandovers.filter(handover => {
    const matchesSearch =
      handover.handoverNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      handover.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      handover.customerName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPriority = selectedPriority === 'all' || handover.priority === selectedPriority;

    return matchesSearch && matchesPriority;
  });

  const totalPending = pendingHandovers.length;
  const readyForHandover = pendingHandovers.filter(h => h.readyForHandover).length;
  const urgentHandovers = pendingHandovers.filter(h => h.daysUntilHandover <= 2).length;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-700';
      case 'high': return 'bg-orange-100 text-orange-700';
      default: return 'bg-blue-100 text-blue-700';
    }
  };

  const getReadinessPercentage = (handover: PendingHandover) => {
    const checks = [
      handover.documentsReady,
      handover.qualityCheckDone,
      handover.packagingComplete,
      handover.transportArranged
    ];
    const completed = checks.filter(check => check).length;
    return (completed / checks.length) * 100;
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-amber-50 px-3 py-2">
      <div className="space-y-3">
        {isLoading && (
          <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
            Loading…
          </div>
        )}
        {loadError && !isLoading && (
          <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
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
              Export Schedule
            </button>
            <button className="px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-lg hover:from-orange-700 hover:to-amber-700 transition-colors">
              Schedule Handover
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl p-3 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Pending Handovers</p>
                <p className="text-3xl font-bold mt-2">{totalPending}</p>
                <p className="text-orange-100 text-xs mt-1">Awaiting handover</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <Clock className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-3 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Ready for Handover</p>
                <p className="text-3xl font-bold mt-2">{readyForHandover}</p>
                <p className="text-green-100 text-xs mt-1">All checks complete</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <CheckCircle className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-xl p-3 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium">Urgent</p>
                <p className="text-3xl font-bold mt-2">{urgentHandovers}</p>
                <p className="text-red-100 text-xs mt-1">Within 2 days</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <AlertCircle className="w-8 h-8" />
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
                placeholder="Search by handover number, order, or customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="normal">Normal</option>
            </select>
          </div>
        </div>

        {/* Handovers Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {filteredHandovers.map((handover) => {
            const readiness = getReadinessPercentage(handover);
            const isUrgent = handover.daysUntilHandover <= 2;

            return (
              <div key={handover.id} className={`bg-white rounded-xl shadow-sm border-2 p-3 hover:shadow-md transition-shadow ${isUrgent ? 'border-red-300' : 'border-gray-200'}`}>
                <div className="space-y-2">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-900">{handover.handoverNumber}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(handover.priority)}`}>
                          {handover.priority.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">Order: {handover.orderNumber}</p>
                    </div>
                    {handover.readyForHandover && (
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    )}
                  </div>

                  {/* Customer */}
                  <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                    <div className="flex items-center gap-2 text-gray-700">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">{handover.customerName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User className="w-4 h-4 text-gray-400" />
                      <span>{handover.customerContact}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{handover.customerPhone}</span>
                    </div>
                  </div>

                  {/* Delivery Address */}
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-gray-600">
                      <p>{handover.deliveryAddress.street}</p>
                      <p>{handover.deliveryAddress.city}, {handover.deliveryAddress.state}</p>
                      <p>{handover.deliveryAddress.pincode}</p>
                    </div>
                  </div>

                  {/* Schedule */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-blue-600" />
                        <span className="font-medium text-blue-900">Scheduled Handover</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-blue-700">Date</p>
                        <p className="font-medium text-blue-900">{new Date(handover.scheduledDate).toLocaleDateString('en-IN')}</p>
                      </div>
                      <div>
                        <p className="text-blue-700">Time</p>
                        <p className="font-medium text-blue-900">{handover.scheduledTime}</p>
                      </div>
                    </div>
                    {isUrgent && (
                      <div className="mt-2 flex items-center gap-2 text-red-600">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">{handover.daysUntilHandover} {handover.daysUntilHandover === 1 ? 'day' : 'days'} remaining!</span>
                      </div>
                    )}
                  </div>

                  {/* Items */}
                  <div className="flex items-center justify-between bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <Package className="w-5 h-5 text-orange-600" />
                      <span className="text-sm font-medium text-orange-900">{handover.itemsCount} items</span>
                    </div>
                    <span className="text-sm font-medium text-orange-900">{handover.totalQuantity} units</span>
                  </div>

                  {/* Readiness Checklist */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold text-gray-900">Readiness Checklist</h4>
                      <span className="text-sm font-semibold text-gray-900">{readiness}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                      <div
                        className={`h-2 rounded-full transition-all ${readiness === 100 ? 'bg-green-500' : 'bg-orange-500'}`}
                        style={{ width: `${readiness}%` }}
                      />
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        {handover.documentsReady ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <Clock className="w-4 h-4 text-yellow-500" />
                        )}
                        <span className={handover.documentsReady ? 'text-gray-700' : 'text-gray-500'}>Documents Ready</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {handover.qualityCheckDone ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <Clock className="w-4 h-4 text-yellow-500" />
                        )}
                        <span className={handover.qualityCheckDone ? 'text-gray-700' : 'text-gray-500'}>Quality Check Done</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {handover.packagingComplete ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <Clock className="w-4 h-4 text-yellow-500" />
                        )}
                        <span className={handover.packagingComplete ? 'text-gray-700' : 'text-gray-500'}>Packaging Complete</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {handover.transportArranged ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <Clock className="w-4 h-4 text-yellow-500" />
                        )}
                        <span className={handover.transportArranged ? 'text-gray-700' : 'text-gray-500'}>Transport Arranged</span>
                      </div>
                    </div>
                  </div>

                  {/* Special Instructions */}
                  {handover.specialInstructions && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-sm text-yellow-800">
                        <strong>Instructions:</strong> {handover.specialInstructions}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                    {handover.readyForHandover ? (
                      <button className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-colors flex items-center justify-center gap-2">
                        <Truck className="w-4 h-4" />
                        Initiate Handover
                      </button>
                    ) : (
                      <button className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                        Complete Checklist
                      </button>
                    )}
                    <button className="inline-flex items-center gap-1.5 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm">
                      <FileText className="w-4 h-4" />
                      <span>View</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredHandovers.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mb-2" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Pending Handovers</h3>
            <p className="text-gray-600">No handovers match your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
