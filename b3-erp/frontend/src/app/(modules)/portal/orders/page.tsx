'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Package, Truck, CheckCircle, Clock, MapPin, ChevronRight, Search, Filter, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { PortalService } from '@/services/portal.service';

interface OrderStep {
    label: string;
    date: string;
    completed: boolean;
    current?: boolean;
}
interface DisplayOrder {
    id: string;
    date: string;
    status: string;
    total: string;
    items: string;
    progress: number;
    steps: OrderStep[];
}

// The order lifecycle maps a backend status onto a 5-step tracker.
const STEP_LABELS = ['Order Placed', 'Confirmed', 'In Production', 'Shipped', 'Delivered'];

function statusToStepIndex(status?: string): number {
    switch ((status || '').toLowerCase()) {
        case 'draft':
        case 'pending':
        case 'submitted':
            return 0;
        case 'confirmed':
        case 'approved':
            return 1;
        case 'in_production':
        case 'in production':
        case 'processing':
            return 2;
        case 'shipped':
        case 'dispatched':
        case 'in_transit':
            return 3;
        case 'delivered':
        case 'completed':
        case 'closed':
            return 4;
        default:
            return 1;
    }
}

function buildSteps(status: string, orderDate: string): OrderStep[] {
    const active = statusToStepIndex(status);
    return STEP_LABELS.map((label, i) => ({
        label,
        date: i === 0 ? orderDate : '',
        completed: i < active || i === active,
        current: i === active,
    }));
}

export default function PortalOrdersPage() {
    const [orders, setOrders] = useState<DisplayOrder[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                const raw = await PortalService.getOrders();
                const mapped: DisplayOrder[] = (Array.isArray(raw) ? raw : []).map((o, i) => {
                    const status = o?.status ?? 'draft';
                    const orderDate = o?.orderDate
                        ? new Date(o.orderDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
                        : '';
                    const total = Number(o?.totalAmount ?? o?.subtotal ?? 0);
                    const itemNames = Array.isArray(o?.items)
                        ? o.items.map((it) => it?.itemName).filter(Boolean).join(', ')
                        : '';
                    const active = statusToStepIndex(status);
                    return {
                        id: o?.orderNumber ?? o?.id ?? `ORDER-${i}`,
                        date: orderDate,
                        status: status.replace(/_/g, ' '),
                        total: `${o?.currency ?? ''} ${total.toLocaleString()}`.trim(),
                        items: itemNames || '—',
                        progress: Math.round((active / (STEP_LABELS.length - 1)) * 100),
                        steps: buildSteps(status, orderDate),
                    };
                });
                if (!cancelled) setOrders(mapped);
            } catch (err) {
                if (!cancelled) {
                    setLoadError(err instanceof Error ? err.message : 'Failed to load orders');
                    setOrders([]);
                }
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };
        load();
        return () => { cancelled = true; };
    }, []);

    return (
        <div className="w-full min-h-screen bg-gray-50 p-3">
            <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Link href="/portal" className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                        <span className="text-gray-700">Back</span>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
                        <p className="text-gray-600 mt-1">Track and manage your purchases</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 mb-3 flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search by order ID or item name..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700">
                    <Filter className="w-4 h-4" />
                    Filter Status
                </button>
            </div>

            {isLoading && (
                <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
                    Loading orders…
                </div>
            )}
            {loadError && !isLoading && (
                <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <AlertCircle className="h-4 w-4" />
                    {loadError}
                </div>
            )}
            {!isLoading && !loadError && orders.length === 0 && (
                <div className="mb-3 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600">
                    No orders found.
                </div>
            )}

            {/* Orders List */}
            <div className="space-y-3">
                {orders.map((order) => (
                    <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex flex-wrap gap-2 justify-between items-start">
                            <div className="flex gap-2">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg h-fit">
                                    <Package className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">{order.id}</h3>
                                    <p className="text-sm text-gray-500">Placed on {order.date}</p>
                                    <p className="text-sm font-medium text-gray-900 mt-1">{order.items}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-gray-900">{order.total}</p>
                                <button className="text-sm text-blue-600 hover:underline mt-1 flex items-center justify-end gap-1">
                                    View Invoice <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="px-6 py-8 bg-gray-50">
                            <div className="relative">
                                <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 rounded-full"></div>
                                <div
                                    className="absolute top-1/2 left-0 h-1 bg-green-500 -translate-y-1/2 rounded-full transition-all duration-1000"
                                    style={{ width: `${order.progress}%` }}
                                ></div>

                                <div className="relative flex justify-between">
                                    {order.steps.map((step, i) => (
                                        <div key={i} className="flex flex-col items-center">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 z-10 bg-white ${step.completed ? 'border-green-500 text-green-500' :
                                                    step.current ? 'border-blue-500 text-blue-500' : 'border-gray-300 text-gray-300'
                                                }`}>
                                                {step.completed ? <CheckCircle className="w-5 h-5" /> :
                                                    step.current ? <Clock className="w-5 h-5" /> :
                                                        <div className="w-3 h-3 rounded-full bg-gray-300" />}
                                            </div>
                                            <p className={`text-xs font-medium mt-2 ${step.current ? 'text-blue-600' : 'text-gray-500'}`}>
                                                {step.label}
                                            </p>
                                            <p className="text-[10px] text-gray-400">{step.date}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {order.status === 'Shipped' && (
                            <div className="px-3 py-2 bg-blue-50 border-t border-blue-100 flex items-center gap-2 text-sm text-blue-700">
                                <Truck className="w-4 h-4" />
                                <span>Out for delivery - Arriving by 5:00 PM today</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
