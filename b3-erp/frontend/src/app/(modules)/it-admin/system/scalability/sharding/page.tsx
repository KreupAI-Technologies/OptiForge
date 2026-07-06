'use client';

import React, { useEffect, useState } from 'react';
import { Database, Layers, ArrowRight, Plus, Settings, Activity, AlertCircle } from 'lucide-react';
import { ItAdminService } from '@/services/it-admin.service';

interface Shard {
    id: string | number;
    name: string;
    region: string;
    range: string;
    size: string;
    status: string;
    latency: string;
}

export default function ShardingPage() {
    const [shards, setShards] = useState<Shard[]>([]);

    useEffect(() => {
        let active = true;
        (async () => {
            try {
                const rows = await ItAdminService.getMonitoring({ kind: 'health', category: 'shard' });
                if (!active) return;
                setShards(
                    (rows ?? []).map((r) => ({
                        id: r.id,
                        name: r.name,
                        region: (r.metadata?.region as string) || r.source || '—',
                        range: (r.metadata?.range as string) || '—',
                        size: (r.metadata?.size as string) || '—',
                        status: r.status || 'healthy',
                        latency: (r.metadata?.latency as string) || (r.value != null ? `${r.value}ms` : '—'),
                    })),
                );
            } catch {
                if (active) setShards([]);
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
                        <h1 className="text-2xl font-bold text-gray-900">Database Sharding</h1>
                        <p className="text-sm text-gray-500 mt-1">Manage data partitions and geographical distribution</p>
                    </div>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Add Shard
                    </button>
                </div>

                {/* Shard Map Visualization (Mock) */}
                <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-900 mb-2">Global Distribution</h2>
                    <div className="h-64 bg-blue-50 rounded-lg flex items-center justify-center border border-blue-100 relative overflow-hidden">
                        <div className="absolute inset-0 opacity-10 bg-[url('https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg')] bg-cover bg-center"></div>
                        <div className="relative z-10 flex gap-12">
                            {shards.map((shard) => (
                                <div key={shard.id} className="flex flex-col items-center gap-2">
                                    <div className={`w-4 h-4 rounded-full ${shard.status === 'healthy' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500 animate-bounce'
                                        }`}></div>
                                    <span className="text-xs font-bold text-gray-700 bg-white px-2 py-1 rounded shadow-sm">{shard.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Shards List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {shards.map((shard) => (
                        <div key={shard.id} className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-orange-50 rounded-lg">
                                        <Database className="w-6 h-6 text-orange-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">{shard.name}</h3>
                                        <p className="text-xs text-gray-500">{shard.region}</p>
                                    </div>
                                </div>
                                <div className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${shard.status === 'healthy' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                    {shard.status}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 mb-2">
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <p className="text-xs text-gray-500 mb-1">Data Range</p>
                                    <p className="font-mono font-medium text-gray-900">{shard.range}</p>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <p className="text-xs text-gray-500 mb-1">Storage Size</p>
                                    <p className="font-mono font-medium text-gray-900">{shard.size}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Activity className="w-4 h-4" />
                                    Latency: <span className={`font-medium ${parseInt(shard.latency) > 100 ? 'text-red-600' : 'text-green-600'
                                        }`}>{shard.latency}</span>
                                </div>
                                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1">
                                    Manage <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
