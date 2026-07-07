'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Wifi, Activity, Thermometer, Droplets, Zap, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import { iotService } from '@/services/iot.service';
import { EmptyState } from '@/components/ui/EmptyState';

interface IoTDevice {
    id: string;
    name: string;
    status: string;
    temp: string;
    vibration: string;
    power: string;
    uptime: string;
    lastPing: string;
}

export default function IoTPage() {
    const [devices, setDevices] = useState<IoTDevice[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;
        setLoading(true);
        iotService
            .getDevices()
            .then((rows) => {
                if (!active) return;
                const mapped: IoTDevice[] = (Array.isArray(rows) ? rows : []).map((d: any, i: number) => ({
                    id: String(d?.code ?? d?.id ?? i + 1),
                    name: d?.name ?? 'Unknown Device',
                    status: d?.status ?? 'offline',
                    temp: d?.temperature ?? d?.temp ?? '-',
                    vibration: d?.vibration ?? '-',
                    power: d?.power ?? '0 kW',
                    uptime: d?.uptime ?? '-',
                    lastPing: d?.lastPing ?? '-',
                }));
                setDevices(mapped);
                setError(null);
            })
            .catch(() => {
                if (!active) return;
                setDevices([]);
                setError('Live device telemetry unavailable. Unable to load IoT devices.');
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => {
            active = false;
        };
    }, []);

    return (
        <div className="w-full min-h-screen bg-gray-50 p-3">
            <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Link href="/advanced-features" className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                        <span className="text-gray-700">Back</span>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">IoT Dashboard</h1>
                        <p className="text-gray-600 mt-1">Real-time device monitoring and control</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                    Live Connection
                </div>
            </div>

            {loading && (
                <div className="mb-3 bg-white border border-gray-200 rounded-lg p-3 text-sm text-gray-500">
                    Loading device telemetry…
                </div>
            )}
            {error && (
                <div className="mb-3 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    {error}
                </div>
            )}

            {/* Network Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-8">
                <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Wifi className="w-5 h-5 text-blue-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-600">Total Devices</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">42</p>
                </div>
                <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-600">Online</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">38</p>
                </div>
                <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <AlertTriangle className="w-5 h-5 text-yellow-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-600">Warnings</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">3</p>
                </div>
                <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <Activity className="w-5 h-5 text-red-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-600">Critical</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">1</p>
                </div>
            </div>

            {/* Device Grid */}
            {!loading && devices.length === 0 && !error && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                    <EmptyState
                        icon={Wifi}
                        title="No IoT devices found"
                        description="No devices are currently reporting telemetry. Connected devices will appear here once they come online."
                    />
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {devices.map((device) => (
                    <div key={device.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <div>
                                <h3 className="font-semibold text-gray-900">{device.name}</h3>
                                <p className="text-xs text-gray-500">{device.id}</p>
                            </div>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${device.status === 'online' ? 'bg-green-100 text-green-700 border-green-200' :
                                    device.status === 'warning' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                                        'bg-gray-100 text-gray-600 border-gray-200'
                                }`}>
                                {device.status.toUpperCase()}
                            </span>
                        </div>

                        <div className="p-4 grid grid-cols-2 gap-2">
                            <div className="flex items-center gap-2">
                                <Thermometer className="w-4 h-4 text-gray-400" />
                                <div>
                                    <p className="text-xs text-gray-500">Temperature</p>
                                    <p className={`font-medium ${parseInt(device.temp) > 80 ? 'text-red-600' : 'text-gray-900'
                                        }`}>{device.temp}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Activity className="w-4 h-4 text-gray-400" />
                                <div>
                                    <p className="text-xs text-gray-500">Vibration</p>
                                    <p className={`font-medium ${device.vibration === 'High' ? 'text-yellow-600' : 'text-gray-900'
                                        }`}>{device.vibration}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Zap className="w-4 h-4 text-gray-400" />
                                <div>
                                    <p className="text-xs text-gray-500">Power Usage</p>
                                    <p className="font-medium text-gray-900">{device.power}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-gray-400" />
                                <div>
                                    <p className="text-xs text-gray-500">Uptime</p>
                                    <p className="font-medium text-gray-900">{device.uptime}</p>
                                </div>
                            </div>
                        </div>

                        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                                <Wifi className="w-3 h-3" />
                                Ping: {device.lastPing}
                            </span>
                            <button className="text-xs font-medium text-blue-600 hover:text-blue-700">
                                View Analytics
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
