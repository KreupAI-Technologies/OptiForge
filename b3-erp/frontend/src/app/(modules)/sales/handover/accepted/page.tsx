'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Search,
  CheckCircle,
  Package,
  User,
  Phone,
  MapPin,
  Calendar,
  Clock,
  FileText,
  Download,
  Star,
  MessageSquare,
  Camera,
  AlertCircle
} from 'lucide-react';
import { salesPagesService } from '@/services/sales-pages.service';

interface AcceptedHandover {
  id: string;
  handoverNumber: string;
  orderNumber: string;
  customerName: string;
  customerContact: string;
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  handoverDate: string;
  handoverTime: string;
  acceptedBy: string;
  acceptedByDesignation: string;
  acceptedBySignature: boolean;
  itemsCount: number;
  totalQuantity: number;
  rating?: number;
  feedback?: string;
  documentsHandedOver: string[];
  photosAvailable: boolean;
  installationRequired: boolean;
  installationScheduled?: boolean;
}

export default function AcceptedHandoverPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [acceptedHandovers, setAcceptedHandovers] = useState<AcceptedHandover[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = await salesPagesService.getHandovers();
        const mapped: AcceptedHandover[] = raw.map((r: any) => ({
          id: String(r.id ?? ''),
          handoverNumber: r.handoverNumber ?? r.number ?? '',
          orderNumber: r.orderNumber ?? '',
          customerName: r.customerName ?? '',
          customerContact: r.customerContact ?? '',
          deliveryAddress: {
            street: r.deliveryAddress?.street ?? '',
            city: r.deliveryAddress?.city ?? '',
            state: r.deliveryAddress?.state ?? '',
            pincode: r.deliveryAddress?.pincode ?? '',
          },
          handoverDate: r.handoverDate ?? '',
          handoverTime: r.handoverTime ?? '',
          acceptedBy: r.acceptedBy ?? '',
          acceptedByDesignation: r.acceptedByDesignation ?? '',
          acceptedBySignature: r.acceptedBySignature ?? false,
          itemsCount: r.itemsCount ?? 0,
          totalQuantity: r.totalQuantity ?? 0,
          rating: r.rating,
          feedback: r.feedback,
          documentsHandedOver: r.documentsHandedOver ?? [],
          photosAvailable: r.photosAvailable ?? false,
          installationRequired: r.installationRequired ?? false,
          installationScheduled: r.installationScheduled,
        }));
        if (!cancelled) setAcceptedHandovers(mapped);
      } catch (e) {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : 'Failed to load');
          setAcceptedHandovers([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filteredHandovers = acceptedHandovers.filter(handover =>
    handover.handoverNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    handover.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    handover.customerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalAccepted = acceptedHandovers.length;
  const avgRating = acceptedHandovers.filter(h => h.rating).reduce((sum, h) => sum + (h.rating || 0), 0) / acceptedHandovers.filter(h => h.rating).length;
  const installationPending = acceptedHandovers.filter(h => h.installationRequired && !h.installationScheduled).length;

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50 px-3 py-2">
      <div className="space-y-3">
        {isLoading && (
          <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
            Loading handovers…
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
              Export Report
            </button>
            <button className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-colors">
              Download All Documents
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-3 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Accepted Handovers</p>
                <p className="text-3xl font-bold mt-2">{totalAccepted}</p>
                <p className="text-green-100 text-xs mt-1">Successfully completed</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <CheckCircle className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl p-3 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm font-medium">Average Rating</p>
                <p className="text-3xl font-bold mt-2">{avgRating.toFixed(1)}</p>
                <p className="text-yellow-100 text-xs mt-1">Customer satisfaction</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <Star className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl p-3 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Installation Pending</p>
                <p className="text-3xl font-bold mt-2">{installationPending}</p>
                <p className="text-blue-100 text-xs mt-1">Needs scheduling</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <Package className="w-8 h-8" />
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by handover number, order, or customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Handovers Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {filteredHandovers.map((handover) => (
            <div key={handover.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 hover:shadow-md transition-shadow">
              <div className="space-y-2">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-gray-900">{handover.handoverNumber}</h3>
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Order: {handover.orderNumber}</p>
                    <p className="text-gray-600 mt-1">{handover.customerName}</p>
                  </div>
                </div>

                {/* Handover Details */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-900">Handover Completed</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-green-700">Date</p>
                      <p className="font-medium text-green-900">{new Date(handover.handoverDate).toLocaleDateString('en-IN')}</p>
                    </div>
                    <div>
                      <p className="text-green-700">Time</p>
                      <p className="font-medium text-green-900">{handover.handoverTime}</p>
                    </div>
                  </div>
                </div>

                {/* Accepted By */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-blue-900 mb-2">Accepted By</p>
                  <div className="space-y-1 text-sm">
                    <p className="font-medium text-blue-900">{handover.acceptedBy}</p>
                    <p className="text-blue-700">{handover.acceptedByDesignation}</p>
                    {handover.acceptedBySignature && (
                      <div className="flex items-center gap-2 text-green-700 mt-2">
                        <CheckCircle className="w-4 h-4" />
                        <span>Signature verified</span>
                      </div>
                    )}
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

                {/* Items */}
                <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">{handover.itemsCount} items</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{handover.totalQuantity} units</span>
                </div>

                {/* Documents */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-purple-900 mb-2">Documents Handed Over</p>
                  <div className="flex flex-wrap gap-2">
                    {handover.documentsHandedOver.map((doc, idx) => (
                      <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                        {doc}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Rating */}
                {handover.rating && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-yellow-900">Customer Rating</span>
                      {renderStars(handover.rating)}
                    </div>
                    {handover.feedback && (
                      <p className="text-sm text-yellow-800 italic mt-2">"{handover.feedback}"</p>
                    )}
                  </div>
                )}

                {/* Installation Status */}
                {handover.installationRequired && (
                  <div className={`border rounded-lg p-3 ${handover.installationScheduled ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}>
                    <p className={`text-sm ${handover.installationScheduled ? 'text-green-800' : 'text-orange-800'}`}>
                      <strong>Installation:</strong> {handover.installationScheduled ? 'Scheduled' : 'Pending Schedule'}
                    </p>
                  </div>
                )}

                {/* Photos */}
                {handover.photosAvailable && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Camera className="w-4 h-4" />
                    <span>Delivery photos available</span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                  <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
                    <FileText className="w-4 h-4" />
                    View POD
                  </button>
                  <button className="inline-flex items-center gap-1.5 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm">
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </button>
                  {handover.photosAvailable && (
                    <button className="inline-flex items-center gap-1.5 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm">
                      <Camera className="w-4 h-4" />
                      <span>Photos</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredHandovers.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <CheckCircle className="w-16 h-16 text-gray-400 mb-2" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Accepted Handovers</h3>
            <p className="text-gray-600">No handovers match your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
