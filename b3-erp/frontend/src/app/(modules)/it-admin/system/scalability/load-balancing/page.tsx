'use client';

import React, { useEffect, useState } from 'react';
import { Network, Server, Activity, Settings, RefreshCw, Power, Plus, MoreVertical } from 'lucide-react';
import { ItAdminService } from '@/services/it-admin.service';

interface LoadBalancer {
    id: string | number;
    name: string;
    region: string;
    status: string;
    algorithm: string;
    connections: number;
    health: number;
}

export default function LoadBalancingPage() {
    const [balancers, setBalancers] = useState<LoadBalancer[]>([]);

    useEffect(() => {
        let active = true;
        (async () => {
            try {
                const rows = await ItAdminService.getMonitoring({ kind: 'health', category: 'load-balancer' });
                if (!active) return;
                setBalancers(
                    (rows ?? []).map((r) => ({
                        id: r.id,
                        name: r.name,
                        region: (r.metadata?.region as string) || r.source || '—',
                        status: r.status || 'active',
                        algorithm: (r.metadata?.algorithm as string) || 'Round Robin',
                        connections: Number(r.value ?? 0),
                        health: Number(r.metadata?.health ?? (r.status === 'healthy' ? 100 : 0)),
                    })),
                );
            } catch {
                if (active) setBalancers([]);
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
                        <h1 className="text-2xl font-bold text-gray-900">Load Balancing</h1>
                        <p className="text-sm text-gray-500 mt-1">Configure traffic distribution and server pools</p>
                    </div>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Create Load Balancer
                    </button>
                </div>

                {/* Load Balancers List */}
                <div className="grid grid-cols-1 gap-3">
                    {balancers.map((lb) => (
                        <div key={lb.id} className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-3">
                                <div className="flex items-center gap-2">
                                    <div className="p-3 bg-blue-50 rounded-lg">
                                        <Network className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-lg font-bold text-gray-900">{lb.name}</h3>
                                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase">
                                                {lb.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1">{lb.region} • {lb.algorithm}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                                        <RefreshCw className="w-5 h-5" />
                                    </button>
                                    <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                                        <Settings className="w-5 h-5" />
                                    </button>
                                    <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                                        <MoreVertical className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-6 border-t border-gray-100">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Active Connections</p>
                                    <p className="text-2xl font-bold text-gray-900">{lb.connections.toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Health Score</p>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 h-2 bg-gray-100 rounded-full w-32">
                                            <div
                                                className={`h-2 rounded-full ${lb.health >= 90 ? 'bg-green-500' : 'bg-yellow-500'}`}
                                                style={{ width: `${lb.health}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-sm font-bold text-gray-900">{lb.health}%</span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Target Groups</p>
                                    <div className="flex -space-x-2">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
                                                <Server className="w-4 h-4 text-gray-500" />
                                            </div>
                                        ))}
                                        <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600">
                                            +2
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
