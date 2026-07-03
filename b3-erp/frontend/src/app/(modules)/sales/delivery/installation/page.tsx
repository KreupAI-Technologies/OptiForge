'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Search,
  Wrench,
  Calendar,
  User,
  MapPin,
  CheckCircle,
  Clock,
  AlertCircle,
  Phone,
  Package,
  FileText,
  Camera,
  ClipboardCheck
} from 'lucide-react';
import { InstallationService } from '@/services/installation.service';

interface Installation {
  id: string;
  installationNumber: string;
  orderNumber: string;
  handoverNumber: string;
  customerName: string;
  customerContact: string;
  customerPhone: string;
  siteAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  scheduledDate: string;
  scheduledTime: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled';
  itemsCount: number;
  estimatedDuration: number; // hours
  technician: {
    name: string;
    phone: string;
    specialization: string;
  };
  completionDate?: string;
  completionPercentage: number;
  testingDone: boolean;
  trainingProvided: boolean;
  documentsHandedOver: boolean;
  customerSignature: boolean;
  rating?: number;
  feedback?: string;
  issues?: string;
  photosAvailable: boolean;
}

export default function InstallationPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const [installations, setInstallations] = useState<Installation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    // Map backend InstallationStatus to this page's status values.
    const statusMap: Record<string, Installation['status']> = {
      scheduled: 'scheduled',
      in_progress: 'in_progress',
      completed: 'completed',
      handed_over: 'completed',
      on_hold: 'on_hold',
      cancelled: 'cancelled',
    };
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = (await InstallationService.getAllInstallationJobs()) as any[];
        const mapped: Installation[] = (raw ?? []).map((j) => ({
          id: String(j.id ?? ''),
          installationNumber: j.jobNumber ?? j.installationNumber ?? '',
          orderNumber: j.orderNumber ?? '',
          handoverNumber: j.handoverNumber ?? '',
          customerName: j.customerName ?? '',
          customerContact: j.customerContact ?? j.teamLeaderName ?? '',
          customerPhone: j.customerPhone ?? '',
          siteAddress: {
            street: typeof j.siteAddress === 'string' ? j.siteAddress : (j.siteAddress?.street ?? ''),
            city: j.city ?? j.siteAddress?.city ?? '',
            state: j.state ?? j.siteAddress?.state ?? '',
            pincode: j.postalCode ?? j.pincode ?? j.siteAddress?.pincode ?? '',
          },
          scheduledDate: j.scheduledDate ?? '',
          scheduledTime: j.scheduledTime ?? '',
          status: statusMap[(j.status ?? '').toString()] ?? 'scheduled',
          itemsCount: Number(j.equipmentCount ?? (Array.isArray(j.equipmentList) ? j.equipmentList.length : 0)),
          estimatedDuration: Number(j.estimatedDuration ?? 0),
          technician: {
            name: j.teamLeaderName ?? j.technician?.name ?? '',
            phone: j.technician?.phone ?? '',
            specialization: j.technician?.specialization ?? '',
          },
          completionDate: j.completionDate ?? undefined,
          completionPercentage: Number(j.installationProgress ?? j.completionPercentage ?? 0),
          testingDone: Boolean(j.testingCompleted ?? j.testingDone ?? false),
          trainingProvided: Boolean(j.trainingProvided ?? false),
          documentsHandedOver: Boolean(j.documentsHandedOver ?? false),
          customerSignature: Boolean(j.customerSignature ?? false),
          rating: j.rating != null ? Number(j.rating) : undefined,
          feedback: j.feedback ?? undefined,
          issues: j.issues ?? undefined,
          photosAvailable: Boolean(j.photosAvailable ?? false),
        }));
        if (!cancelled) setInstallations(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load installations');
          setInstallations([]);
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

  const filteredInstallations = installations.filter(installation => {
    const matchesSearch =
      installation.installationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      installation.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      installation.customerName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = selectedStatus === 'all' || installation.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const totalInstallations = installations.length;
  const completed = installations.filter(i => i.status === 'completed').length;
  const inProgress = installations.filter(i => i.status === 'in_progress').length;
  const ratedInstallations = installations.filter(i => i.rating);
  const avgRating = ratedInstallations.length > 0
    ? ratedInstallations.reduce((sum, i) => sum + (i.rating || 0), 0) / ratedInstallations.length
    : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-700';
      case 'in_progress': return 'bg-yellow-100 text-yellow-700';
      case 'completed': return 'bg-green-100 text-green-700';
      case 'on_hold': return 'bg-orange-100 text-orange-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled': return <Calendar className="w-4 h-4" />;
      case 'in_progress': return <Clock className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'on_hold': return <AlertCircle className="w-4 h-4" />;
      case 'cancelled': return <AlertCircle className="w-4 h-4" />;
      default: return <Wrench className="w-4 h-4" />;
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`text-lg ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 px-3 py-2">
      <div className="space-y-3">
        {isLoading && (
          <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
            Loading installations…
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
              Export Schedule
            </button>
            <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors">
              Schedule Installation
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-3 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Total Installations</p>
                <p className="text-3xl font-bold mt-2">{totalInstallations}</p>
                <p className="text-purple-100 text-xs mt-1">Scheduled & completed</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <Wrench className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl p-3 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm font-medium">In Progress</p>
                <p className="text-3xl font-bold mt-2">{inProgress}</p>
                <p className="text-yellow-100 text-xs mt-1">Currently installing</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <Clock className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-3 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Completed</p>
                <p className="text-3xl font-bold mt-2">{completed}</p>
                <p className="text-green-100 text-xs mt-1">Successfully finished</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <CheckCircle className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl p-3 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Avg Rating</p>
                <p className="text-3xl font-bold mt-2">{avgRating.toFixed(1)}</p>
                <p className="text-blue-100 text-xs mt-1">Customer satisfaction</p>
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
                placeholder="Search by installation, order, or customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="on_hold">On Hold</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Installations Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {filteredInstallations.map((installation) => (
            <div key={installation.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 hover:shadow-md transition-shadow">
              <div className="space-y-2">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-gray-900">{installation.installationNumber}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(installation.status)}`}>
                        {getStatusIcon(installation.status)}
                        {installation.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Order: {installation.orderNumber}</p>
                    <p className="text-gray-600 mt-1">{installation.customerName}</p>
                  </div>
                </div>

                {/* Schedule */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-5 h-5 text-purple-600" />
                    <span className="font-medium text-purple-900">Installation Schedule</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-purple-700">Date</p>
                      <p className="font-medium text-purple-900">{new Date(installation.scheduledDate).toLocaleDateString('en-IN')}</p>
                    </div>
                    <div>
                      <p className="text-purple-700">Time</p>
                      <p className="font-medium text-purple-900">{installation.scheduledTime}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-purple-700">Duration</p>
                      <p className="font-medium text-purple-900">{installation.estimatedDuration} hours (estimated)</p>
                    </div>
                  </div>
                </div>

                {/* Site Address */}
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-gray-600">
                    <p>{installation.siteAddress.street}</p>
                    <p>{installation.siteAddress.city}, {installation.siteAddress.state}</p>
                    <p>{installation.siteAddress.pincode}</p>
                  </div>
                </div>

                {/* Technician */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-blue-900">Technician</span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p className="font-medium text-blue-900">{installation.technician.name}</p>
                    <p className="text-blue-700">{installation.technician.specialization}</p>
                    <div className="flex items-center gap-2 text-blue-700">
                      <Phone className="w-3 h-3" />
                      <span>{installation.technician.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Progress */}
                {installation.status === 'in_progress' || installation.status === 'completed' ? (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold text-gray-900">Progress</h4>
                      <span className="text-sm font-semibold text-gray-900">{installation.completionPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${installation.completionPercentage === 100 ? 'bg-green-500' : 'bg-purple-500'}`}
                        style={{ width: `${installation.completionPercentage}%` }}
                      />
                    </div>
                  </div>
                ) : null}

                {/* Checklist */}
                {installation.status === 'completed' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <h4 className="text-sm font-semibold text-green-900 mb-3 flex items-center gap-2">
                      <ClipboardCheck className="w-4 h-4" />
                      Completion Checklist
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-green-700">
                        <CheckCircle className="w-4 h-4" />
                        <span>Testing completed</span>
                      </div>
                      <div className="flex items-center gap-2 text-green-700">
                        <CheckCircle className="w-4 h-4" />
                        <span>Training provided</span>
                      </div>
                      <div className="flex items-center gap-2 text-green-700">
                        <CheckCircle className="w-4 h-4" />
                        <span>Documents handed over</span>
                      </div>
                      <div className="flex items-center gap-2 text-green-700">
                        <CheckCircle className="w-4 h-4" />
                        <span>Customer signature obtained</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Rating & Feedback */}
                {installation.rating && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-yellow-900">Customer Rating</span>
                      {renderStars(installation.rating)}
                    </div>
                    {installation.feedback && (
                      <p className="text-sm text-yellow-800 italic">"{installation.feedback}"</p>
                    )}
                  </div>
                )}

                {/* Issues */}
                {installation.issues && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-800">
                        <strong>Issue:</strong> {installation.issues}
                      </p>
                    </div>
                  </div>
                )}

                {/* Items */}
                <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">{installation.itemsCount} items</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                  <button className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2">
                    <FileText className="w-4 h-4" />
                    View Details
                  </button>
                  {installation.photosAvailable && (
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

        {filteredInstallations.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Wrench className="w-16 h-16 text-gray-400 mb-2" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Installations</h3>
            <p className="text-gray-600">No installations match your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
