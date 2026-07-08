'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Server, Database, Zap, Activity, Cpu, HardDrive, Network, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { ItAdminService, SystemMonitorDto } from '@/services/it-admin.service';

// Metrics live under companyId 'company-1' (see orphan_it-admin.sql seed).
const COMPANY_ID = 'company-1';

// Bar-chart resource metrics render for these named metrics; anything else
// (latency, cache hit rate, node counts, etc.) shows as a performance alert.
const RESOURCE_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
    'CPU Utilization': Cpu,
    'Memory Usage': Activity,
    'Storage I/O': HardDrive,
};
const RESOURCE_COLOR: Record<string, string> = {
    'CPU Utilization': 'bg-blue-600',
    'Memory Usage': 'bg-purple-600',
    'Storage I/O': 'bg-green-600',
};

export default function ScalabilityPage() {
    const [metrics, setMetrics] = useState<SystemMonitorDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;
        setLoading(true);
        setError(null);
        ItAdminService.getMonitoring({ kind: 'performance', category: 'scalability', companyId: COMPANY_ID })
            .then((data) => { if (active) setMetrics(Array.isArray(data) ? data : []); })
            .catch((e) => { if (active) setError(e?.message ?? 'Failed to load scalability metrics'); })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, []);

    const resourceMetrics = metrics.filter((m) => m.name in RESOURCE_ICON);
    const alertMetrics = metrics.filter((m) => !(m.name in RESOURCE_ICON));
    const allHealthy = metrics.length > 0 && metrics.every((m) => m.status === 'healthy');

    return (
        <div className="w-full min-h-screen bg-gray-50 px-3 py-2">
            <div className="w-full space-y-3">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Scalability & Performance</h1>
                        <p className="text-sm text-gray-500 mt-1">Manage system resources, load balancing, and optimization</p>
                    </div>
                    {loading ? (
                        <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-500 rounded-lg border border-gray-200">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="font-medium text-sm">Loading…</span>
                        </div>
                    ) : error ? (
                        <div className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg border border-red-200">
                            <AlertCircle className="w-4 h-4" />
                            <span className="font-medium text-sm">Metrics unavailable</span>
                        </div>
                    ) : (
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${allHealthy ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
                            <Activity className="w-4 h-4" />
                            <span className="font-medium text-sm">{allHealthy ? 'System Healthy' : 'Attention Needed'}</span>
                        </div>
                    )}
                </div>

                {/* Quick Links */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Link href="/it-admin/system/scalability/load-balancing" className="block group">
                        <div className="bg-white rounded-xl border border-gray-200 p-3 hover:shadow-md transition-all hover:border-blue-500">
                            <div className="flex items-center justify-between mb-2">
                                <div className="p-3 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                                    <Network className="w-6 h-6 text-blue-600" />
                                </div>
                                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">Load Balancing</h3>
                            <p className="text-sm text-gray-600">Manage traffic distribution across servers</p>
                        </div>
                    </Link>

                    <Link href="/it-admin/system/scalability/caching" className="block group">
                        <div className="bg-white rounded-xl border border-gray-200 p-3 hover:shadow-md transition-all hover:border-purple-500">
                            <div className="flex items-center justify-between mb-2">
                                <div className="p-3 bg-purple-50 rounded-lg group-hover:bg-purple-100 transition-colors">
                                    <Zap className="w-6 h-6 text-purple-600" />
                                </div>
                                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-500 transition-colors" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">Caching Strategy</h3>
                            <p className="text-sm text-gray-600">Configure Redis and memory caching</p>
                        </div>
                    </Link>

                    <Link href="/it-admin/system/scalability/sharding" className="block group">
                        <div className="bg-white rounded-xl border border-gray-200 p-3 hover:shadow-md transition-all hover:border-orange-500">
                            <div className="flex items-center justify-between mb-2">
                                <div className="p-3 bg-orange-50 rounded-lg group-hover:bg-orange-100 transition-colors">
                                    <Database className="w-6 h-6 text-orange-600" />
                                </div>
                                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-orange-500 transition-colors" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">Database Sharding</h3>
                            <p className="text-sm text-gray-600">Manage data distribution and partitions</p>
                        </div>
                    </Link>
                </div>

                {/* System Metrics */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    <div className="bg-white rounded-xl border border-gray-200 p-3">
                        <h2 className="text-lg font-bold text-gray-900 mb-3">Resource Usage</h2>
                        {loading ? (
                            <div className="flex items-center gap-2 text-sm text-gray-500 py-6">
                                <Loader2 className="w-4 h-4 animate-spin" /> Loading resource metrics…
                            </div>
                        ) : error ? (
                            <div className="flex items-center gap-2 text-sm text-red-600 py-6">
                                <AlertCircle className="w-4 h-4" /> {error}
                            </div>
                        ) : resourceMetrics.length === 0 ? (
                            <p className="text-sm text-gray-400 py-6">No resource metrics available.</p>
                        ) : (
                            <div className="space-y-3">
                                {resourceMetrics.map((m) => {
                                    const Icon = RESOURCE_ICON[m.name] ?? Activity;
                                    const color = RESOURCE_COLOR[m.name] ?? 'bg-blue-600';
                                    const pct = Math.max(0, Math.min(100, Number(m.value ?? 0)));
                                    return (
                                        <div key={m.id}>
                                            <div className="flex justify-between items-center mb-2">
                                                <div className="flex items-center gap-2">
                                                    <Icon className="w-4 h-4 text-gray-500" />
                                                    <span className="text-sm font-medium text-gray-700">{m.name}</span>
                                                </div>
                                                <span className="text-sm font-bold text-gray-900">{m.value}{m.unit === '%' ? '%' : ` ${m.unit ?? ''}`}</span>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-2">
                                                <div className={`${color} h-2 rounded-full`} style={{ width: `${pct}%` }}></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-3">
                        <h2 className="text-lg font-bold text-gray-900 mb-3">Performance Alerts</h2>
                        {loading ? (
                            <div className="flex items-center gap-2 text-sm text-gray-500 py-6">
                                <Loader2 className="w-4 h-4 animate-spin" /> Loading alerts…
                            </div>
                        ) : error ? (
                            <div className="flex items-center gap-2 text-sm text-red-600 py-6">
                                <AlertCircle className="w-4 h-4" /> {error}
                            </div>
                        ) : alertMetrics.length === 0 ? (
                            <p className="text-sm text-gray-400 py-6">No performance alerts.</p>
                        ) : (
                            <div className="space-y-2">
                                {alertMetrics.map((m) => {
                                    const warning = m.status !== 'healthy' || m.severity === 'warning' || m.severity === 'error' || m.severity === 'critical';
                                    return (
                                        <div key={m.id} className={`p-4 rounded-lg border ${warning ? 'bg-yellow-50 border-yellow-200' : 'bg-blue-50 border-blue-200'}`}>
                                            <div className="flex justify-between items-start">
                                                <h3 className={`font-semibold ${warning ? 'text-yellow-800' : 'text-blue-800'}`}>{m.name}</h3>
                                                {m.lastOccurred && (
                                                    <span className={`text-xs ${warning ? 'text-yellow-600' : 'text-blue-600'}`}>{m.lastOccurred}</span>
                                                )}
                                            </div>
                                            <p className={`text-sm mt-1 ${warning ? 'text-yellow-700' : 'text-blue-700'}`}>
                                                {m.message ?? `${m.name}: ${m.value ?? ''}${m.unit ?? ''}`}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
