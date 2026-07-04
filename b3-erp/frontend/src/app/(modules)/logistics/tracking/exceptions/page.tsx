'use client';

import React, { useState, useEffect } from 'react';
import { LogisticsService } from '@/services/logistics.service';
import {
    AlertTriangle,
    Search,
    Filter,
    Clock,
    MapPin,
    Truck,
    Package,
    CheckCircle2,
    XCircle,
    AlertCircle,
    ChevronRight,
    MoreVertical,
    Phone,
    MessageSquare,
    RefreshCw,
    Eye,
    FileText,
    Calendar,
    User
} from 'lucide-react';

// Mock Exception Data
const exceptionStats = {
    total: 12,
    critical: 3,
    warning: 5,
    resolved: 4,
    avgResolutionTime: '2.4 hrs'
};

interface LogisticsException {
    id: string;
    shipmentId: string;
    type: string;
    severity: string;
    status: string;
    description: string;
    location: string;
    reportedAt: string;
    estimatedDelay: string;
    driver: string;
    driverPhone: string;
    customer: string;
    assignedTo: string;
    resolvedAt?: string;
}

export default function TrackingExceptionsPage() {
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedException, setSelectedException] = useState<LogisticsException | null>(null);
    const [exceptions, setExceptions] = useState<LogisticsException[]>([]);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await LogisticsService.getTrackingEvents();
                const list = Array.isArray(res) ? res : ((res as any)?.data ?? (res as any)?.items ?? []);
                if (cancelled) return;
                setExceptions((list as any[]).map((r, i) => ({
                    id: String(r.id ?? r.eventId ?? i),
                    shipmentId: r.shipmentId ?? r.shipmentNumber ?? '',
                    type: r.type ?? r.eventType ?? r.exceptionType ?? '',
                    severity: r.severity ?? 'Warning',
                    status: r.status ?? 'Open',
                    description: r.description ?? r.notes ?? '',
                    location: r.location ?? '',
                    reportedAt: r.reportedAt ?? r.eventTime ?? r.timestamp ?? r.createdAt ?? '',
                    estimatedDelay: r.estimatedDelay ?? 'N/A',
                    driver: r.driver ?? r.driverName ?? '',
                    driverPhone: r.driverPhone ?? '',
                    customer: r.customer ?? r.customerName ?? '',
                    assignedTo: r.assignedTo ?? '',
                    resolvedAt: r.resolvedAt ?? undefined,
                })));
            } catch (e) {
                if (!cancelled) setLoadError(e instanceof Error ? e.message : 'Failed to load exceptions');
            }
        })();
        return () => { cancelled = true; };
    }, []);

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'Critical': return 'bg-red-50 text-red-600 border-red-200';
            case 'Warning': return 'bg-yellow-50 text-yellow-600 border-yellow-200';
            default: return 'bg-gray-50 text-gray-600 border-gray-200';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Open': return 'bg-red-500';
            case 'In Progress': return 'bg-blue-500';
            case 'Resolved': return 'bg-green-500';
            default: return 'bg-gray-500';
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'Delay': return <Clock className="w-4 h-4" />;
            case 'Damage': return <Package className="w-4 h-4" />;
            case 'Route Deviation': return <MapPin className="w-4 h-4" />;
            case 'Documentation': return <FileText className="w-4 h-4" />;
            case 'Temperature': return <AlertTriangle className="w-4 h-4" />;
            case 'Customer': return <User className="w-4 h-4" />;
            default: return <AlertCircle className="w-4 h-4" />;
        }
    };

    const filteredExceptions = exceptions.filter(exc => {
        if (filter === 'all') return true;
        if (filter === 'critical') return exc.severity === 'Critical';
        if (filter === 'warning') return exc.severity === 'Warning';
        if (filter === 'open') return exc.status === 'Open';
        if (filter === 'resolved') return exc.status === 'Resolved';
        return true;
    });

    return (
        <div className="p-6 space-y-3 text-sm font-medium">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <AlertTriangle className="h-8 w-8 text-orange-600" />
                        Tracking Exceptions
                    </h1>
                    <p className="text-gray-500 mt-1 uppercase text-[10px] font-black tracking-widest leading-none">
                        Monitor and resolve shipment exceptions in real-time
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="px-4 py-2 border border-gray-200 bg-white text-gray-600 rounded-lg font-black uppercase text-[10px] tracking-widest hover:bg-gray-50 transition-colors flex items-center gap-2">
                        <RefreshCw className="w-4 h-4" /> Refresh
                    </button>
                    <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2 shadow-md font-black uppercase text-[10px] tracking-widest">
                        <AlertTriangle className="w-4 h-4" /> Report Exception
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Exceptions</p>
                            <p className="text-2xl font-black text-gray-900 mt-1 italic tracking-tighter">{exceptionStats.total}</p>
                        </div>
                        <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
                            <AlertCircle className="w-4 h-4" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-red-100 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">Critical</p>
                            <p className="text-2xl font-black text-red-600 mt-1 italic tracking-tighter">{exceptionStats.critical}</p>
                        </div>
                        <div className="p-2 bg-red-50 rounded-lg text-red-600">
                            <XCircle className="w-4 h-4" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-yellow-100 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-black text-yellow-600 uppercase tracking-widest">Warning</p>
                            <p className="text-2xl font-black text-yellow-600 mt-1 italic tracking-tighter">{exceptionStats.warning}</p>
                        </div>
                        <div className="p-2 bg-yellow-50 rounded-lg text-yellow-600">
                            <AlertTriangle className="w-4 h-4" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-green-100 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-black text-green-600 uppercase tracking-widest">Resolved</p>
                            <p className="text-2xl font-black text-green-600 mt-1 italic tracking-tighter">{exceptionStats.resolved}</p>
                        </div>
                        <div className="p-2 bg-green-50 rounded-lg text-green-600">
                            <CheckCircle2 className="w-4 h-4" />
                        </div>
                    </div>
                </div>

                <div className="bg-gray-900 p-3 rounded-xl text-white shadow-xl">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Avg Resolution</p>
                            <p className="text-2xl font-black text-white mt-1 italic tracking-tighter">{exceptionStats.avgResolutionTime}</p>
                        </div>
                        <div className="p-2 bg-gray-800 rounded-lg text-orange-500">
                            <Clock className="w-4 h-4" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                        {['all', 'critical', 'warning', 'open', 'resolved'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors ${filter === f
                                        ? 'bg-orange-600 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search exceptions..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-xs"
                        />
                    </div>
                </div>
            </div>

            {/* Exceptions List */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="divide-y divide-gray-50">
                    {filteredExceptions.map((exception) => (
                        <div
                            key={exception.id}
                            className="p-4 hover:bg-gray-50 transition-colors cursor-pointer group"
                            onClick={() => setSelectedException(exception)}
                        >
                            <div className="flex items-start gap-2">
                                {/* Status Indicator */}
                                <div className={`w-2 h-2 rounded-full mt-2 ${getStatusColor(exception.status)}`}></div>

                                {/* Main Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-black text-gray-900 group-hover:text-orange-600 transition-colors">
                                                    {exception.id}
                                                </span>
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-black uppercase border ${getSeverityColor(exception.severity)}`}>
                                                    {getTypeIcon(exception.type)}
                                                    {exception.type}
                                                </span>
                                                <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase ${exception.status === 'Open' ? 'bg-red-100 text-red-600' :
                                                        exception.status === 'In Progress' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                                                    }`}>
                                                    {exception.status}
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-gray-700 font-bold">{exception.description}</p>
                                            <div className="flex items-center gap-2 mt-2 text-[10px] text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <Package className="w-3 h-3" /> {exception.shipmentId}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="w-3 h-3" /> {exception.location}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" /> {exception.reportedAt}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="text-right flex-shrink-0">
                                            <p className="text-[10px] font-black text-orange-600">{exception.estimatedDelay}</p>
                                            <p className="text-[10px] text-gray-400 mt-1">{exception.customer}</p>
                                            <div className="flex items-center gap-2 mt-2 justify-end">
                                                <button className="p-1.5 bg-gray-100 rounded-lg text-gray-500 hover:bg-gray-200 transition-colors opacity-0 group-hover:opacity-100">
                                                    <Eye className="w-3 h-3" />
                                                </button>
                                                <button className="p-1.5 bg-gray-100 rounded-lg text-gray-500 hover:bg-gray-200 transition-colors opacity-0 group-hover:opacity-100">
                                                    <MessageSquare className="w-3 h-3" />
                                                </button>
                                                <button className="p-1.5 bg-green-100 rounded-lg text-green-600 hover:bg-green-200 transition-colors opacity-0 group-hover:opacity-100">
                                                    <Phone className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div className="bg-red-50 p-3 rounded-xl border border-red-100">
                    <h4 className="text-xs font-black text-red-800 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" /> Critical Actions Required
                    </h4>
                    <p className="text-[11px] text-red-700">
                        3 critical exceptions require immediate attention. Vehicle breakdown and temperature excursion are top priority.
                    </p>
                    <button className="mt-3 text-[10px] font-black text-red-800 uppercase tracking-widest flex items-center gap-1 hover:text-red-900">
                        View Critical <ChevronRight className="w-3 h-3" />
                    </button>
                </div>

                <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                    <h4 className="text-xs font-black text-blue-800 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Clock className="w-4 h-4" /> Pending Resolution
                    </h4>
                    <p className="text-[11px] text-blue-700">
                        5 exceptions are currently in progress. Average resolution time is 2.4 hours.
                    </p>
                    <button className="mt-3 text-[10px] font-black text-blue-800 uppercase tracking-widest flex items-center gap-1 hover:text-blue-900">
                        View In Progress <ChevronRight className="w-3 h-3" />
                    </button>
                </div>

                <div className="bg-green-50 p-3 rounded-xl border border-green-100">
                    <h4 className="text-xs font-black text-green-800 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> Recently Resolved
                    </h4>
                    <p className="text-[11px] text-green-700">
                        4 exceptions resolved in the last 24 hours. Customer rescheduling and traffic delays addressed.
                    </p>
                    <button className="mt-3 text-[10px] font-black text-green-800 uppercase tracking-widest flex items-center gap-1 hover:text-green-900">
                        View History <ChevronRight className="w-3 h-3" />
                    </button>
                </div>
            </div>
        </div>
    );
}
