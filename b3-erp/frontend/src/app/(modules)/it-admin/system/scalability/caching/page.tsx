'use client';

import React, { useEffect, useState } from 'react';
import { Zap, Database, RefreshCw, Trash2, Activity, Settings, Play, Pause } from 'lucide-react';
import { ItAdminService } from '@/services/it-admin.service';

interface CacheStore {
    id: string | number;
    name: string;
    type: string;
    size: string;
    used: string;
    hitRate: number;
    status: string;
}

export default function CachingPage() {
    const [caches, setCaches] = useState<CacheStore[]>([]);

    useEffect(() => {
        let active = true;
        (async () => {
            try {
                const rows = await ItAdminService.getMonitoring({ kind: 'performance', category: 'cache' });
                if (!active) return;
                setCaches(
                    (rows ?? []).map((r) => ({
                        id: r.id,
                        name: r.name,
                        type: (r.metadata?.type as string) || r.source || 'Cache',
                        size: (r.metadata?.size as string) || '—',
                        used: (r.metadata?.used as string) || '—',
                        hitRate: Number(r.value ?? 0),
                        status: r.status || 'running',
                    })),
                );
            } catch {
                if (active) setCaches([]);
            }
        })();
        return () => {
            active = false;
        };
    }, []);

    return (
        <div className="w-full min-h-screen bg-gray-50 px-3 py-2">
            <div className="w-full space-y-3">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Caching Strategy</h1>
                        <p className="text-sm text-gray-500 mt-1">Manage in-memory data stores and content delivery</p>
                    </div>
                    <div className="flex gap-3">
                        <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium flex items-center gap-2">
                            <Trash2 className="w-4 h-4" />
                            Clear All Caches
                        </button>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2">
                            <Settings className="w-4 h-4" />
                            Configure
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {caches.map((cache) => (
                        <div key={cache.id} className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-purple-50 rounded-lg">
                                        <Zap className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">{cache.name}</h3>
                                        <p className="text-xs text-gray-500">{cache.type}</p>
                                    </div>
                                </div>
                                <div className={`w-3 h-3 rounded-full ${cache.status === 'running' ? 'bg-green-500' : 'bg-red-500'
                                    }`}></div>
                            </div>

                            <div className="space-y-2">
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm text-gray-500">Memory Usage</span>
                                        <span className="text-sm font-medium text-gray-900">{cache.used} / {cache.size}</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2">
                                        <div
                                            className="bg-purple-600 h-2 rounded-full"
                                            style={{ width: cache.size === 'Unlimited' ? '20%' : '52%' }}
                                        ></div>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm text-gray-500">Hit Rate</span>
                                        <span className="text-sm font-medium text-gray-900">{cache.hitRate}%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full ${cache.hitRate >= 90 ? 'bg-green-500' : 'bg-yellow-500'}`}
                                            style={{ width: `${cache.hitRate}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2 mt-6 pt-6 border-t border-gray-100">
                                <button className="flex-1 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg flex items-center justify-center gap-2">
                                    <RefreshCw className="w-4 h-4" />
                                    Flush
                                </button>
                                <button className="flex-1 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg flex items-center justify-center gap-2">
                                    <Activity className="w-4 h-4" />
                                    Metrics
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
