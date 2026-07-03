'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Square,
    TreePine,
    HardHat,
    Package,
    User,
    Calendar,
    CheckCircle,
    Clock,
    AlertCircle,
    AlertTriangle,
    TrendingUp,
    ArrowLeft,
} from 'lucide-react';
import { ProductionOrphanService } from '@/services/production/production-orphan.service';

interface Shutter {
    id: string;
    woNumber: string;
    productName: string;
    shutterType: 'Glass' | 'Wood' | 'Steel';
    quantity: number;
    completedQuantity: number;
    status: 'Pending' | 'In Production' | 'Ready' | 'Installed';
    assignedTo: string;
    startDate: string;
    targetDate: string;
    dimensions: string;
    finish: string;
    notes?: string;
}

export default function ShutterTrackerPage() {
    // Shutter orders loaded from the NestJS backend (production/shutter-orders).
    const [shutters, setShutters] = useState<Shutter[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [filterType, setFilterType] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                // Backend returns raw ORM shape (woNumber/productName/shutterType/
                // quantity/completedQuantity/status/assignedTo/startDate/targetDate/
                // dimensions/finish/notes...).
                const raw = (await ProductionOrphanService.getShutterOrders()) as any[];
                const mapped: Shutter[] = (Array.isArray(raw) ? raw : []).map((d: any, i: number) => {
                    const type = String(d?.shutterType ?? '');
                    const st = String(d?.status ?? '');
                    return {
                        id: String(d?.id ?? i),
                        woNumber: d?.woNumber ?? '',
                        productName: d?.productName ?? '',
                        shutterType: (['Glass', 'Wood', 'Steel'].includes(type) ? type : 'Glass') as Shutter['shutterType'],
                        quantity: Number(d?.quantity ?? 0),
                        completedQuantity: Number(d?.completedQuantity ?? 0),
                        status: (['Pending', 'In Production', 'Ready', 'Installed'].includes(st) ? st : 'Pending') as Shutter['status'],
                        assignedTo: d?.assignedTo ?? '',
                        startDate: d?.startDate ?? '',
                        targetDate: d?.targetDate ?? '',
                        dimensions: d?.dimensions ?? '',
                        finish: d?.finish ?? '',
                        notes: d?.notes ?? undefined,
                    };
                });
                if (!cancelled) setShutters(mapped);
            } catch (err) {
                if (!cancelled) {
                    setLoadError(err instanceof Error ? err.message : 'Failed to load shutter orders');
                    setShutters([]);
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

    const filteredShutters = shutters.filter((shutter) => {
        const matchesType = filterType === 'all' || shutter.shutterType === filterType;
        const matchesStatus = filterStatus === 'all' || shutter.status === filterStatus;
        return matchesType && matchesStatus;
    });

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'Glass':
                return Square;
            case 'Wood':
                return TreePine;
            case 'Steel':
                return HardHat;
            default:
                return Package;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'Glass':
                return 'from-cyan-500 to-blue-600';
            case 'Wood':
                return 'from-amber-500 to-orange-600';
            case 'Steel':
                return 'from-gray-500 to-slate-600';
            default:
                return 'from-gray-500 to-gray-600';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Installed':
                return 'bg-purple-100 text-purple-800 border-purple-300';
            case 'Ready':
                return 'bg-green-100 text-green-800 border-green-300';
            case 'In Production':
                return 'bg-blue-100 text-blue-800 border-blue-300';
            case 'Pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Installed':
            case 'Ready':
                return CheckCircle;
            case 'In Production':
                return TrendingUp;
            case 'Pending':
                return Clock;
            default:
                return AlertCircle;
        }
    };

    const stats = {
        total: shutters.length,
        glass: shutters.filter((s) => s.shutterType === 'Glass').length,
        wood: shutters.filter((s) => s.shutterType === 'Wood').length,
        steel: shutters.filter((s) => s.shutterType === 'Steel').length,
        ready: shutters.filter((s) => s.status === 'Ready').length,
    };

    return (
        <div className="w-full h-screen overflow-y-auto overflow-x-hidden bg-gray-50">
            <div className="px-3 py-2 space-y-3">
                {/* Header */}
                <div className="bg-white rounded-lg border border-gray-200 p-3">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <Link
                                href="/production/work-orders"
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Shutter Processing Tracker</h1>
                                <p className="text-sm text-gray-600 mt-1">
                                    Track Glass, Wood, and Steel shutter production and installation
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                    <div className="bg-white p-3 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Shutters</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                            </div>
                            <Package className="w-8 h-8 text-gray-600" />
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-cyan-50 to-blue-100 p-3 rounded-lg border border-cyan-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-cyan-600">Glass</p>
                                <p className="text-2xl font-bold text-cyan-900">{stats.glass}</p>
                            </div>
                            <Square className="w-8 h-8 text-cyan-600" />
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-amber-50 to-orange-100 p-3 rounded-lg border border-amber-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-amber-600">Wood</p>
                                <p className="text-2xl font-bold text-amber-900">{stats.wood}</p>
                            </div>
                            <TreePine className="w-8 h-8 text-amber-600" />
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-gray-50 to-slate-100 p-3 rounded-lg border border-gray-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Steel</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.steel}</p>
                            </div>
                            <HardHat className="w-8 h-8 text-gray-600" />
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-3 rounded-lg border border-green-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-green-600">Ready</p>
                                <p className="text-2xl font-bold text-green-900">{stats.ready}</p>
                            </div>
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg border border-gray-200 p-3">
                    <div className="flex gap-2">
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Types</option>
                            <option value="Glass">🔹 Glass</option>
                            <option value="Wood">🌳 Wood</option>
                            <option value="Steel">🔧 Steel</option>
                        </select>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Status</option>
                            <option value="Pending">Pending</option>
                            <option value="In Production">In Production</option>
                            <option value="Ready">Ready</option>
                            <option value="Installed">Installed</option>
                        </select>
                    </div>
                </div>

                {/* Load states */}
                {isLoading && (
                    <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
                        Loading shutter orders…
                    </div>
                )}
                {loadError && !isLoading && (
                    <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        <AlertTriangle className="h-4 w-4" />
                        {loadError}
                    </div>
                )}
                {!isLoading && !loadError && filteredShutters.length === 0 && (
                    <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
                        No shutter orders found.
                    </div>
                )}

                {/* Shutters List */}
                <div className="grid grid-cols-1 gap-2">
                    {filteredShutters.map((shutter) => {
                        const Icon = getTypeIcon(shutter.shutterType);
                        const StatusIcon = getStatusIcon(shutter.status);
                        const progress = (shutter.completedQuantity / shutter.quantity) * 100;

                        return (
                            <div key={shutter.id} className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-lg transition-shadow">
                                <div className="flex items-start gap-2">
                                    {/* Icon */}
                                    <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${getTypeColor(shutter.shutterType)} flex items-center justify-center flex-shrink-0`}>
                                        <Icon className="w-8 h-8 text-white" />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="text-xl font-bold text-gray-900">{shutter.productName}</h3>
                                                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded font-medium">
                                                        {shutter.shutterType}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600">{shutter.woNumber}</p>
                                            </div>
                                            <span className={`px-3 py-1 text-xs font-medium rounded-full flex items-center gap-1 border ${getStatusColor(shutter.status)}`}>
                                                <StatusIcon className="w-3 h-3" />
                                                {shutter.status}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3 text-sm">
                                            <div>
                                                <p className="text-xs text-gray-500">Team</p>
                                                <p className="font-medium text-gray-900 flex items-center gap-1">
                                                    <User className="w-3 h-3" />
                                                    {shutter.assignedTo}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Dimensions</p>
                                                <p className="font-medium text-gray-900">{shutter.dimensions}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Finish</p>
                                                <p className="font-medium text-gray-900">{shutter.finish}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Target Date</p>
                                                <p className="font-medium text-gray-900 flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {shutter.targetDate}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Progress */}
                                        <div className="mb-2">
                                            <div className="flex items-center justify-between text-xs mb-1">
                                                <span className="font-semibold text-gray-700">
                                                    Progress: {shutter.completedQuantity} / {shutter.quantity} units ({progress.toFixed(0)}%)
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                <div
                                                    className={`h-2.5 rounded-full bg-gradient-to-r ${getTypeColor(shutter.shutterType)}`}
                                                    style={{ width: `${progress}%` }}
                                                ></div>
                                            </div>
                                        </div>

                                        {/* Notes */}
                                        {shutter.notes && (
                                            <div className="bg-blue-50 border border-blue-200 rounded p-2 text-sm text-blue-800">
                                                <strong>Note:</strong> {shutter.notes}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Info Box */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <div className="flex items-start gap-3">
                        <Package className="w-5 h-5 text-amber-600 mt-0.5" />
                        <div>
                            <h3 className="text-sm font-medium text-amber-900">Shutter Processing (Step 5.11)</h3>
                            <p className="text-sm text-amber-700 mt-1">
                                Track all shutter types: Glass (tempered, frosted, tinted), Wood (teak, oak, plywood), and Steel (SS304, powder coated, rolling).
                                Each shutter is tracked from production to installation with quality checks and dimensional verification.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
