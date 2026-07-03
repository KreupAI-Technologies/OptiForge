'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    MapPin,
    User,
    Clock,
    Phone,
    Mail,
    Calendar,
    Truck,
    Send,
    CheckCircle,
    ArrowLeft,
    MessageSquare,
    AlertCircle,
} from 'lucide-react';
import { LogisticsService } from '@/services/logistics.service';

interface DeliveryCoordination {
    id: string;
    woNumber: string;
    customerName: string;
    siteLocation: {
        address: string;
        gps: string;
        landmark: string;
    };
    siteContact: {
        name: string;
        phone: string;
        email: string;
        role: string;
    };
    deliveryTiming: {
        preferredDate: string;
        preferredTime: string;
        timeSlot: 'Morning' | 'Afternoon' | 'Evening';
    };
    transportMethod: 'Own Vehicle' | 'Third Party' | 'Courier';
    transporter?: string;
    status: 'Pending' | 'Coordinated' | 'Transporter Notified' | 'Site Informed' | 'Ready';
    notifications: {
        transporterNotified: boolean;
        siteContactNotified: boolean;
    };
}

export default function DeliveryCoordinationPage() {
    const [coordinations, setCoordinations] = useState<DeliveryCoordination[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState<string>('all');

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                const raw = (await LogisticsService.getDeliveryCoordinations()) as any[];
                const list = Array.isArray(raw) ? raw : [];
                const mapped: DeliveryCoordination[] = list.map((c) => ({
                    id: String(c?.id ?? ''),
                    woNumber: c?.woNumber ?? '',
                    customerName: c?.customerName ?? '',
                    siteLocation: {
                        address: c?.siteAddress ?? '',
                        gps: c?.siteGps ?? '',
                        landmark: c?.siteLandmark ?? '',
                    },
                    siteContact: {
                        name: c?.contactName ?? '',
                        phone: c?.contactPhone ?? '',
                        email: c?.contactEmail ?? '',
                        role: c?.contactRole ?? '',
                    },
                    deliveryTiming: {
                        preferredDate: c?.preferredDate ?? '',
                        preferredTime: c?.preferredTime ?? '',
                        timeSlot: (c?.timeSlot ?? 'Morning') as DeliveryCoordination['deliveryTiming']['timeSlot'],
                    },
                    transportMethod: (c?.transportMethod ?? 'Own Vehicle') as DeliveryCoordination['transportMethod'],
                    transporter: c?.transporter ?? undefined,
                    status: (c?.status ?? 'Pending') as DeliveryCoordination['status'],
                    notifications: {
                        transporterNotified: !!c?.transporterNotified,
                        siteContactNotified: !!c?.siteContactNotified,
                    },
                }));
                if (!cancelled) setCoordinations(mapped);
            } catch (err) {
                if (!cancelled) {
                    setLoadError(err instanceof Error ? err.message : 'Failed to load delivery coordinations');
                    setCoordinations([]);
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

    const filteredCoordinations = coordinations.filter(
        (coord) => filterStatus === 'all' || coord.status === filterStatus
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Ready':
                return 'bg-green-100 text-green-800 border-green-300';
            case 'Site Informed':
                return 'bg-blue-100 text-blue-800 border-blue-300';
            case 'Transporter Notified':
                return 'bg-purple-100 text-purple-800 border-purple-300';
            case 'Coordinated':
                return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'Pending':
                return 'bg-gray-100 text-gray-800 border-gray-300';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    const stats = {
        total: coordinations.length,
        ready: coordinations.filter((c) => c.status === 'Ready').length,
        pending: coordinations.filter((c) => c.status === 'Pending' || c.status === 'Coordinated').length,
    };

    return (
        <div className="w-full h-screen overflow-y-auto bg-gray-50">
            <div className="px-3 py-2 space-y-3">
                {/* Header */}
                <div className="bg-white rounded-lg border p-3">
                    <div className="flex items-center gap-2">
                        <Link href="/logistics/tracking" className="p-2 hover:bg-gray-100 rounded-lg">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Delivery Coordination</h1>
                            <p className="text-sm text-gray-600 mt-1">
                                Site details, contact info, timing, and notifications (Steps 7.5-7.9)
                            </p>
                        </div>
                    </div>
                </div>

                {isLoading && (
                    <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
                        Loading delivery coordinations…
                    </div>
                )}
                {loadError && !isLoading && (
                    <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        <AlertCircle className="h-4 w-4" />
                        {loadError}
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2">
                    <div className="bg-white p-3 rounded-lg border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Deliveries</p>
                                <p className="text-2xl font-bold">{stats.total}</p>
                            </div>
                            <Truck className="w-8 h-8 text-gray-600" />
                        </div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-green-600">Ready</p>
                                <p className="text-2xl font-bold text-green-900">{stats.ready}</p>
                            </div>
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-yellow-600">Pending</p>
                                <p className="text-2xl font-bold text-yellow-900">{stats.pending}</p>
                            </div>
                            <Clock className="w-8 h-8 text-yellow-600" />
                        </div>
                    </div>
                </div>

                {/* Filter */}
                <div className="bg-white rounded-lg border p-3">
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2 border rounded-lg"
                    >
                        <option value="all">All Status</option>
                        <option value="Pending">Pending</option>
                        <option value="Coordinated">Coordinated</option>
                        <option value="Transporter Notified">Transporter Notified</option>
                        <option value="Site Informed">Site Informed</option>
                        <option value="Ready">Ready</option>
                    </select>
                </div>

                {!isLoading && !loadError && filteredCoordinations.length === 0 && (
                    <div className="rounded-lg border border-gray-200 bg-white px-4 py-8 text-center text-sm text-gray-600">
                        No delivery coordinations found.
                    </div>
                )}

                {/* Coordinations List */}
                <div className="grid gap-2">
                    {filteredCoordinations.map((coord) => (
                        <div key={coord.id} className="bg-white rounded-lg border p-3 hover:shadow-lg transition">
                            <div className="flex items-start gap-2">
                                <div className={`w-16 h-16 rounded-lg ${coord.status === 'Ready' ? 'bg-green-500' : 'bg-blue-500'} flex items-center justify-center`}>
                                    <Truck className="w-8 h-8 text-white" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <h3 className="text-xl font-bold">{coord.customerName}</h3>
                                            <p className="text-sm text-gray-600">{coord.woNumber}</p>
                                        </div>
                                        <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(coord.status)}`}>
                                            {coord.status}
                                        </span>
                                    </div>

                                    {/* Site Location */}
                                    <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-3">
                                        <div className="flex items-start gap-2 mb-2">
                                            <MapPin className="w-4 h-4 text-blue-600 mt-0.5" />
                                            <div className="flex-1">
                                                <p className="text-xs font-semibold text-blue-900">Site Location</p>
                                                <p className="text-sm text-blue-800">{coord.siteLocation.address}</p>
                                                <p className="text-xs text-blue-700">GPS: {coord.siteLocation.gps}</p>
                                                <p className="text-xs text-blue-700">Landmark: {coord.siteLocation.landmark}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Site Contact */}
                                    <div className="bg-purple-50 border border-purple-200 rounded p-3 mb-3">
                                        <div className="flex items-start gap-2 mb-2">
                                            <User className="w-4 h-4 text-purple-600 mt-0.5" />
                                            <div className="flex-1">
                                                <p className="text-xs font-semibold text-purple-900">Site Contact Person</p>
                                                <p className="text-sm font-medium text-purple-800">{coord.siteContact.name} ({coord.siteContact.role})</p>
                                                <div className="flex gap-2 mt-1 text-xs text-purple-700">
                                                    <span className="flex items-center gap-1">
                                                        <Phone className="w-3 h-3" />
                                                        {coord.siteContact.phone}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Mail className="w-3 h-3" />
                                                        {coord.siteContact.email}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Delivery Timing */}
                                    <div className="bg-amber-50 border border-amber-200 rounded p-3 mb-3">
                                        <div className="flex items-start gap-2">
                                            <Clock className="w-4 h-4 text-amber-600 mt-0.5" />
                                            <div className="flex-1">
                                                <p className="text-xs font-semibold text-amber-900">Delivery Timing</p>
                                                <div className="flex gap-2 text-sm text-amber-800">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {coord.deliveryTiming.preferredDate}
                                                    </span>
                                                    <span>{coord.deliveryTiming.preferredTime}</span>
                                                    <span>({coord.deliveryTiming.timeSlot})</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Transport & Notifications */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-gray-50 border border-gray-200 rounded p-2 text-sm">
                                            <p className="text-xs text-gray-500">Transport Method</p>
                                            <p className="font-medium">{coord.transportMethod}</p>
                                            {coord.transporter && <p className="text-xs text-gray-600">{coord.transporter}</p>}
                                        </div>
                                        <div className="bg-gray-50 border border-gray-200 rounded p-2 text-sm">
                                            <p className="text-xs text-gray-500">Notifications</p>
                                            <div className="flex gap-2 mt-1">
                                                <span className={`flex items-center gap-1 text-xs ${coord.notifications.transporterNotified ? 'text-green-600' : 'text-gray-500'}`}>
                                                    {coord.notifications.transporterNotified ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                                    Transporter
                                                </span>
                                                <span className={`flex items-center gap-1 text-xs ${coord.notifications.siteContactNotified ? 'text-green-600' : 'text-gray-500'}`}>
                                                    {coord.notifications.siteContactNotified ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                                    Site
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
