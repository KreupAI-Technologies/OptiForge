'use client';

import React, { useState, useEffect } from 'react';
import { AfterSalesPagesService } from '@/services/after-sales-pages.service';
import {
    Search,
    Plus,
    Clock,
    CheckCircle,
    AlertCircle,
    Package,
    Wrench,
    ShieldCheck,
    BookOpen,
    MessageSquare,
    ChevronRight,
    Monitor,
    Calendar,
    CreditCard,
    FileText,
    LifeBuoy
} from 'lucide-react';
import Link from 'next/link';

interface Incident {
    id: string;
    type: string;
    subject: string;
    date: string;
    status: 'Open' | 'In Progress' | 'Resolved' | 'Waiting for Customer';
    priority: 'High' | 'Medium' | 'Low';
}

interface Asset {
    id: string;
    name: string;
    model: string;
    serial: string;
    warrantyStatus: 'Active' | 'Expired';
    expiryDate: string;
    thumbnail: string;
}

export default function CustomerSelfServicePortal() {
    const [searchQuery, setSearchQuery] = useState('');

    // Incidents loaded from the after-sales service-requests endpoint.
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                const raw = (await AfterSalesPagesService.serviceRequests()) as any[];
                const mapped: Incident[] = (Array.isArray(raw) ? raw : []).map((r: any) => ({
                    id: r?.requestNumber ?? r?.ticketNumber ?? r?.id ?? '',
                    type: r?.type ?? r?.serviceType ?? 'Support',
                    subject: r?.title ?? r?.subject ?? r?.description ?? '',
                    date: r?.date ?? r?.createdAt ?? '',
                    status: (r?.status ?? 'Open') as Incident['status'],
                    priority: (r?.priority ?? 'Medium') as Incident['priority'],
                }));
                if (!cancelled) setIncidents(mapped);
            } catch (err) {
                if (!cancelled) {
                    setLoadError(err instanceof Error ? err.message : 'Failed to load incidents');
                    setIncidents([]);
                }
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    const assets: Asset[] = [
        {
            id: 'AST-8829',
            name: 'Industrial Mixer Pro',
            model: 'MX-5000',
            serial: 'SN-99283-B',
            warrantyStatus: 'Active',
            expiryDate: '2026-12-15',
            thumbnail: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=100&h=100'
        },
        {
            id: 'AST-7712',
            name: 'Precision Cutter',
            model: 'PC-200',
            serial: 'SN-11203-A',
            warrantyStatus: 'Expired',
            expiryDate: '2024-05-20',
            thumbnail: 'https://images.unsplash.com/photo-1537462715879-360eeb61a0ad?auto=format&fit=crop&q=80&w=100&h=100'
        },
    ];

    const getStatusColor = (status: Incident['status']) => {
        switch (status) {
            case 'Open': return 'bg-blue-100 text-blue-700';
            case 'In Progress': return 'bg-yellow-100 text-yellow-700';
            case 'Resolved': return 'bg-green-100 text-green-700';
            case 'Waiting for Customer': return 'bg-purple-100 text-purple-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 py-8 px-3">
            {/* Hero Section */}
            <div className="w-full mb-10">
                <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                    <div className="relative z-10 max-w-2xl">
                        <h1 className="text-4xl font-extrabold mb-2 tracking-tight">How can we help you today?</h1>
                        <p className="text-blue-100 text-lg mb-8">Search our knowledge base for instant answers or manage your existing service requests.</p>

                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <input
                                type="text"
                                placeholder="Search troubleshooting guides, manuals, and FAQs..."
                                className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-900 focus:ring-4 focus:ring-blue-500/30 outline-none shadow-lg text-lg"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="absolute right-0 bottom-0 top-0 w-1/3 hidden lg:block opacity-20 pointer-events-none">
                        <LifeBuoy className="w-full h-full p-12 text-white" />
                    </div>
                </div>
            </div>

            <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Quick Actions Card */}
                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-2 px-1">Quick Actions</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {[
                                { title: 'New Request', icon: Plus, color: 'bg-blue-600', hover: 'hover:bg-blue-700' },
                                { title: 'Register Asset', icon: ShieldCheck, color: 'bg-green-600', hover: 'hover:bg-green-700' },
                                { title: 'Order Parts', icon: Package, color: 'bg-amber-600', hover: 'hover:bg-amber-700' },
                                { title: 'Book Service', icon: Calendar, color: 'bg-indigo-600', hover: 'hover:bg-indigo-700' },
                            ].map((action, idx) => (
                                <button
                                    key={idx}
                                    className="flex flex-col items-center justify-center p-3 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-100 transition-all group"
                                >
                                    <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform`}>
                                        <action.icon className="h-6 w-6" />
                                    </div>
                                    <span className="text-sm font-semibold text-gray-700">{action.title}</span>
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Pending Incidents & Requests */}
                    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">Active Service Requests</h2>
                            <Link href="#" className="text-blue-600 hover:underline text-sm font-medium">View all history</Link>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {incidents.map((incident) => (
                                <div key={incident.id} className="p-6 hover:bg-slate-50 transition-colors group cursor-pointer">
                                    <div className="flex items-start justify-between">
                                        <div className="flex gap-2">
                                            <div className={`mt-1 p-2 rounded-lg ${incident.priority === 'High' ? 'bg-red-50' : 'bg-gray-50'}`}>
                                                <AlertCircle className={`h-5 w-5 ${incident.priority === 'High' ? 'text-red-600' : 'text-gray-400'}`} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-xs font-bold text-gray-400 tracking-wider">#{incident.id}</span>
                                                    <span className="text-gray-300">•</span>
                                                    <span className="text-xs font-medium text-gray-500">{incident.type}</span>
                                                </div>
                                                <h3 className="text-base font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                                                    {incident.subject}
                                                </h3>
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(incident.status)}`}>
                                                        {incident.status}
                                                    </span>
                                                    <span className="flex items-center gap-1.5 text-xs text-gray-500 font-medium whitespace-nowrap">
                                                        <Clock className="h-3.5 w-3.5" />
                                                        Last updated {incident.date}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-blue-500 transition-colors" />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="bg-gray-50 p-3 text-center">
                            <button className="text-sm font-bold text-blue-600 hover:text-blue-700">Submit a new incident request</button>
                        </div>
                    </section>

                    {/* My Equipment / Assets */}
                    <section>
                        <div className="flex items-center justify-between mb-2 px-1">
                            <h2 className="text-xl font-bold text-gray-900">My Registered Equipment</h2>
                            <Link href="#" className="text-blue-600 hover:underline text-sm font-medium">Add more</Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {assets.map((asset) => (
                                <div key={asset.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-2 hover:shadow-md transition-shadow">
                                    <img
                                        src={asset.thumbnail}
                                        alt={asset.name}
                                        className="w-20 h-20 rounded-xl object-cover bg-gray-100"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-gray-900 truncate">{asset.name}</h3>
                                        <p className="text-sm text-gray-500 mb-2">{asset.model} • {asset.serial}</p>
                                        <div className="flex items-center gap-2">
                                            <span className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${asset.warrantyStatus === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                {asset.warrantyStatus === 'Active' ? <ShieldCheck className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                                                {asset.warrantyStatus}
                                            </span>
                                            <span className="text-[10px] text-gray-400 font-medium">
                                                Expires {asset.expiryDate}
                                            </span>
                                        </div>
                                    </div>
                                    <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all">
                                        <Monitor className="h-5 w-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Sidebar / KB / Featured */}
                <div className="space-y-8">
                    {/* Summary Stats */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            Your Protection Status
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <div className="flex justify-between text-sm font-bold mb-2">
                                    <span className="text-gray-600 uppercase tracking-widest text-[10px]">Warranty Coverage</span>
                                    <span className="text-green-600">85% Covered</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2">
                                    <div className="bg-green-500 h-2 rounded-full w-[85%]"></div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="p-4 bg-slate-50 rounded-xl">
                                    <p className="text-xs font-bold text-gray-400 uppercase mb-1">Active AMCs</p>
                                    <p className="text-2xl font-black text-gray-800">03</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-xl">
                                    <p className="text-xs font-bold text-gray-400 uppercase mb-1">Rewards</p>
                                    <p className="text-2xl font-black text-gray-800">1200</p>
                                </div>
                            </div>
                            <button className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition-colors flex items-center justify-center gap-2">
                                Upgrade Protection
                                <CreditCard className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {/* Featured Knowledge Base */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <BookOpen className="h-5 w-5 text-blue-600" />
                                Featured help
                            </h3>
                        </div>
                        <div className="p-6 space-y-2">
                            {[
                                'How to reset your Industrial Mixer',
                                'Troubleshooting motor overheating',
                                'Calibrating precision sensors',
                                'Standard maintenance schedule guide'
                            ].map((item, idx) => (
                                <Link key={idx} href="#" className="flex items-center justify-between group">
                                    <span className="text-sm font-medium text-gray-600 group-hover:text-blue-600 transition-colors truncate pr-4">{item}</span>
                                    <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-blue-500" />
                                </Link>
                            ))}
                        </div>
                        <div className="p-6 pt-0">
                            <button className="w-full py-3 border-2 border-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-colors">
                                Go to Knowledge Base
                            </button>
                        </div>
                    </div>

                    {/* Contact Support */}
                    <div className="bg-indigo-900 text-white p-8 rounded-2xl shadow-lg relative overflow-hidden group">
                        <div className="relative z-10">
                            <h3 className="text-xl font-bold mb-2">Need direct help?</h3>
                            <p className="text-indigo-100 text-sm mb-3">Our experts are available 24/7 to resolve your issues quickly.</p>
                            <button className="flex items-center gap-2 bg-white text-indigo-900 px-3 py-2 rounded-xl font-black shadow-lg hover:bg-indigo-50 transition-colors w-full justify-center">
                                <MessageSquare className="h-5 w-5" />
                                Live Chat with Support
                            </button>
                        </div>
                        <Wrench className="absolute -right-8 -bottom-8 h-32 w-32 text-indigo-800 opacity-50 group-hover:rotate-12 transition-transform duration-500" />
                    </div>
                </div>
            </div>

            {/* Forms Section Placeholder */}
            <div className="w-full mt-20 mb-10 text-center">
                <div className="inline-flex items-center gap-2 p-2 bg-blue-50 rounded-full px-4 mb-3">
                    <ShieldCheck className="h-4 w-4 text-blue-600" />
                    <span className="text-xs font-bold text-blue-700 tracking-wide uppercase">Unified Forms Center</span>
                </div>
                <h2 className="text-3xl font-extrabold text-gray-900 mb-12">Submit documents effortlessly</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                        { title: 'Warranty Claim', desc: 'Report issues under coverage', icon: ShieldCheck },
                        { title: 'Service Report', desc: 'Submit post-service feedback', icon: FileText },
                        { title: 'Part Return Request', desc: 'Send back unused components', icon: Package },
                        { title: 'Incident Report', desc: 'Formal safety/operation log', icon: AlertCircle },
                    ].map((form, idx) => (
                        <div key={idx} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center hover:shadow-xl hover:-translate-y-1 transition-all">
                            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-800 mb-3">
                                <form.icon className="h-8 w-8" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">{form.title}</h3>
                            <p className="text-sm text-gray-500 mb-3 leading-relaxed">{form.desc}</p>
                            <button className="mt-auto text-sm font-bold text-blue-600 flex items-center gap-1 hover:gap-2 transition-all">
                                Launch Form <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
