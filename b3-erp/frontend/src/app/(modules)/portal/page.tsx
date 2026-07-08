'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, Package, ArrowRight, Bell, CreditCard, ShoppingCart, Loader2, AlertCircle } from 'lucide-react';
import { PortalService, PortalOrderItem, PortalDocumentItem } from '@/services/portal.service';

function fmtMoney(v?: number | string, currency = 'USD'): string {
    const n = typeof v === 'string' ? parseFloat(v) : v;
    if (n == null || Number.isNaN(n)) return '—';
    try {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n);
    } catch {
        return `$${n}`;
    }
}

function fmtDate(v?: string): string {
    if (!v) return '';
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function CustomerPortalPage() {
    const [orders, setOrders] = useState<PortalOrderItem[]>([]);
    const [docs, setDocs] = useState<PortalDocumentItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;
        (async () => {
            try {
                setLoading(true);
                setError(null);
                const [ords, documents] = await Promise.all([
                    PortalService.getOrders(),
                    PortalService.getDocuments(),
                ]);
                if (!active) return;
                setOrders(ords);
                setDocs(documents.filter((d) => d.docType !== 'folder'));
            } catch (e) {
                if (active) setError(e instanceof Error ? e.message : 'Failed to load portal data');
            } finally {
                if (active) setLoading(false);
            }
        })();
        return () => { active = false; };
    }, []);

    const recentOrders = [...orders]
        .sort((a, b) => new Date(b.orderDate || 0).getTime() - new Date(a.orderDate || 0).getTime())
        .slice(0, 5);
    const recentDocs = docs.slice(0, 5);

    const statusClass = (status?: string) => {
        const s = (status || '').toLowerCase();
        if (s.includes('deliver')) return 'bg-green-100 text-green-700';
        if (s.includes('ship')) return 'bg-blue-100 text-blue-700';
        return 'bg-yellow-100 text-yellow-700';
    };

    return (
        <div className="w-full min-h-screen bg-gray-50 p-3">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Welcome back</h1>
                    <p className="text-gray-600 mt-1">Here's what's happening with your projects</p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="p-2 bg-white rounded-full border border-gray-200 text-gray-600 hover:text-blue-600 hover:border-blue-200 transition-colors relative">
                        <Bell className="w-5 h-5" />
                        {orders.length > 0 && <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>}
                    </button>
                    <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full border border-gray-200">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                            AC
                        </div>
                        <span className="text-sm font-medium text-gray-900">Customer Portal</span>
                    </div>
                </div>
            </div>

            {error && (
                <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                    <AlertCircle className="w-4 h-4" /> {error}
                </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-8">
                {[
                    { label: 'Track Orders', icon: Package, href: '/portal/orders', color: 'bg-blue-500', badge: loading ? '' : `${orders.length}` },
                    { label: 'View Documents', icon: FileText, href: '/portal/documents', color: 'bg-purple-500', badge: loading ? '' : `${docs.length}` },
                    { label: 'Make Payment', icon: CreditCard, href: '#', color: 'bg-green-500', badge: '' },
                    { label: 'New Order', icon: ShoppingCart, href: '#', color: 'bg-orange-500', badge: '' },
                ].map((action, i) => (
                    <Link
                        key={i}
                        href={action.href}
                        className="bg-white rounded-xl p-3 shadow-sm border border-gray-200 hover:shadow-md transition-all group"
                    >
                        <div className="flex items-center justify-between">
                            <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center text-white mb-2 group-hover:scale-110 transition-transform`}>
                                <action.icon className="w-6 h-6" />
                            </div>
                            {action.badge && (
                                <span className="text-xs font-bold text-gray-500 bg-gray-100 rounded-full px-2 py-0.5">{action.badge}</span>
                            )}
                        </div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{action.label}</h3>
                    </Link>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Orders */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-3">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
                        <Link href="/portal/orders" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                            View All <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                    {loading ? (
                        <div className="flex items-center justify-center py-10 text-gray-400">
                            <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading orders…
                        </div>
                    ) : recentOrders.length === 0 ? (
                        <div className="py-10 text-center text-sm text-gray-500">No orders yet.</div>
                    ) : (
                        <div className="space-y-2">
                            {recentOrders.map((order) => (
                                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 bg-white rounded border border-gray-200">
                                            <Package className="w-5 h-5 text-gray-500" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{order.orderNumber || order.id}</p>
                                            <p className="text-xs text-gray-500">{fmtDate(order.orderDate)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-medium text-gray-900">{fmtMoney(order.totalAmount, order.currency)}</span>
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusClass(order.status)}`}>
                                            {order.status || 'Pending'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recent Documents */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-bold text-gray-900">Recent Documents</h2>
                        <Link href="/portal/documents" className="text-sm text-blue-600 hover:underline">View All</Link>
                    </div>
                    {loading ? (
                        <div className="flex items-center justify-center py-10 text-gray-400">
                            <Loader2 className="w-5 h-5 animate-spin" />
                        </div>
                    ) : recentDocs.length === 0 ? (
                        <div className="py-10 text-center text-sm text-gray-500">No documents yet.</div>
                    ) : (
                        <div className="space-y-2">
                            {recentDocs.map((doc) => (
                                <div key={doc.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
                                    <div className="p-2 bg-red-50 text-red-600 rounded border border-red-100">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">{doc.name || 'Document'}</p>
                                        <p className="text-xs text-gray-500">{fmtDate(doc.updatedAt || doc.createdAt)} · {doc.category || doc.docType || 'File'}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    <button className="w-full mt-6 py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-blue-500 hover:text-blue-600 transition-colors">
                        Upload Document
                    </button>
                </div>
            </div>
        </div>
    );
}
