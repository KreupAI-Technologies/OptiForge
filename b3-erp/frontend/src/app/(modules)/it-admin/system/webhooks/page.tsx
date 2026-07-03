'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Webhook, CheckCircle, XCircle, AlertTriangle, Trash2, Edit, Activity, Clock, RefreshCw } from 'lucide-react';
import { ItAdminService } from '@/services/it-admin.service';

interface WebhookConfig {
    id: string;
    name: string;
    url: string;
    events: string[];
    status: 'active' | 'inactive' | 'failed';
    secret: string;
    lastTriggered?: string;
    successRate: number;
    failureCount: number;
}

export default function WebhooksPage() {
    const router = useRouter();
    const [showAddModal, setShowAddModal] = useState(false);

    const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                const raw = await ItAdminService.getWebhookEndpoints();
                const mapped: WebhookConfig[] = (Array.isArray(raw) ? raw : []).map((w) => {
                    const success = Number(w.successCount ?? 0);
                    const failure = Number(w.failureCount ?? 0);
                    const total = success + failure;
                    return {
                        id: String(w.id),
                        name: w.name ?? '',
                        url: w.url ?? '',
                        events: Array.isArray(w.events) ? w.events : [],
                        status: (w.status ?? 'active') as WebhookConfig['status'],
                        secret: w.secret ?? '',
                        lastTriggered: w.lastTriggered ?? undefined,
                        successRate: total > 0 ? Math.round((success / total) * 1000) / 10 : 100,
                        failureCount: failure,
                    };
                });
                if (!cancelled) setWebhooks(mapped);
            } catch (err) {
                if (!cancelled) {
                    setLoadError(err instanceof Error ? err.message : 'Failed to load webhooks');
                    setWebhooks([]);
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

    const events = [
        'order.created', 'order.updated', 'order.cancelled',
        'inventory.low', 'inventory.updated',
        'customer.created', 'customer.updated',
        'invoice.created', 'invoice.paid',
        'user.login', 'system.error'
    ];

    const getStatusColor = (status: string) => {
        const colors = {
            active: 'bg-green-100 text-green-700 border-green-300',
            inactive: 'bg-gray-100 text-gray-700 border-gray-300',
            failed: 'bg-red-100 text-red-700 border-red-300'
        };
        return colors[status as keyof typeof colors] || colors.inactive;
    };

    const handleDelete = (id: string) => {
        setWebhooks(prev => prev.filter(w => w.id !== id));
    };

    const handleToggleStatus = (id: string) => {
        setWebhooks(prev =>
            prev.map(w =>
                w.id === id
                    ? { ...w, status: w.status === 'active' ? 'inactive' : 'active' }
                    : w
            )
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 px-3 py-2 w-full max-w-full">
            {loadError && (
                <div className="mb-3 rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-700">
                    {loadError}
                </div>
            )}
            {isLoading && (
                <div className="mb-3 rounded-lg bg-blue-50 border border-blue-200 px-4 py-2 text-sm text-blue-700">
                    Loading webhooks...
                </div>
            )}
            <div className="mb-3 flex items-center gap-2">
                <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg">
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900">Webhooks</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage outgoing webhooks and event subscriptions</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Add Webhook
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                {/* Webhooks List */}
                <div className="lg:col-span-2 space-y-2">
                    {webhooks.map((webhook) => (
                        <div key={webhook.id} className="bg-white rounded-xl border border-gray-200 p-3">
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${webhook.status === 'failed' ? 'bg-red-50' : 'bg-blue-50'}`}>
                                        <Webhook className={`w-6 h-6 ${webhook.status === 'failed' ? 'text-red-600' : 'text-blue-600'}`} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">{webhook.name}</h3>
                                        <p className="text-sm text-gray-500 font-mono truncate max-w-md">{webhook.url}</p>
                                    </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(webhook.status)}`}>
                                    {webhook.status.toUpperCase()}
                                </span>
                            </div>

                            <div className="mb-2">
                                <p className="text-xs font-semibold text-gray-600 mb-2">Subscribed Events:</p>
                                <div className="flex flex-wrap gap-2">
                                    {webhook.events.map((event) => (
                                        <span key={event} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-mono border border-gray-200">
                                            {event}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2 py-4 border-t border-gray-100">
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Success Rate</p>
                                    <div className="flex items-center gap-2">
                                        <Activity className={`w-4 h-4 ${webhook.successRate > 98 ? 'text-green-500' : 'text-yellow-500'}`} />
                                        <span className="font-bold text-gray-900">{webhook.successRate}%</span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Last Triggered</p>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm text-gray-900">{webhook.lastTriggered}</span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Failures (24h)</p>
                                    <span className={`font-bold ${webhook.failureCount > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                                        {webhook.failureCount}
                                    </span>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 mt-2">
                                <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg" title="Test Webhook">
                                    <RefreshCw className="w-4 h-4" />
                                </button>
                                <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Edit">
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(webhook.id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                    title="Delete"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Sidebar Info */}
                <div className="space-y-3">
                    <div className="bg-white rounded-xl border border-gray-200 p-3">
                        <h2 className="text-lg font-bold text-gray-900 mb-2">Webhook Security</h2>
                        <div className="space-y-2">
                            <div className="flex gap-3">
                                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                                <p className="text-sm text-gray-600">All requests are signed with a unique secret key</p>
                            </div>
                            <div className="flex gap-3">
                                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                                <p className="text-sm text-gray-600">Retries are attempted with exponential backoff</p>
                            </div>
                            <div className="flex gap-3">
                                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                                <p className="text-sm text-gray-600">TLS 1.2+ is required for all endpoints</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-2">
                            <Activity className="w-5 h-5 text-blue-600" />
                            <h3 className="font-bold text-blue-900">System Status</h3>
                        </div>
                        <p className="text-sm text-blue-700 mb-2">Webhook delivery service is operational.</p>
                        <div className="w-full bg-blue-200 rounded-full h-2 mb-1">
                            <div className="bg-blue-600 h-2 rounded-full" style={{ width: '99%' }}></div>
                        </div>
                        <p className="text-xs text-blue-600 text-right">99.9% Uptime</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
