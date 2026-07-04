'use client';

import React, { useState, useEffect } from 'react';
import {
    FileText,
    Search,
    Plus,
    Filter,
    DollarSign,
    Clock,
    CheckCircle2,
    XCircle,
    ChevronRight,
    MoreVertical,
    Download,
    Eye,
    Edit,
    Truck,
    Package,
    MapPin,
    Calendar,
    Send,
    AlertCircle,
    TrendingUp
} from 'lucide-react';
import { exportToCsv } from '@/lib/export';
import { LogisticsService } from '@/services/logistics.service';

interface FreightQuote {
    id: string;
    customer: string;
    origin: string;
    destination: string;
    weight: string;
    mode: string;
    requestDate: string;
    validUntil: string;
    amount: number;
    status: string;
    carrier: string;
    transitTime: string;
    rejectionReason?: string;
}

// Mock Quote Data
const quoteStats = {
    total: 45,
    pending: 12,
    approved: 28,
    rejected: 5,
    totalValue: 1850000,
    avgResponseTime: '2.3 days'
};

export default function FreightQuotesPage() {
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const [quotes, setQuotes] = useState<FreightQuote[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                const raw = (await LogisticsService.getFreightCharges()) as any[];
                const list = Array.isArray(raw) ? raw : [];
                const mapped: FreightQuote[] = list.map((r, idx) => ({
                    id: r?.id ?? r?.quoteId ?? r?.chargeId ?? `QUO-${idx + 1}`,
                    customer: r?.customer ?? r?.customerName ?? '',
                    origin: r?.origin ?? '',
                    destination: r?.destination ?? '',
                    weight: r?.weight ?? '',
                    mode: r?.mode ?? '',
                    requestDate: r?.requestDate ?? '',
                    validUntil: r?.validUntil ?? '',
                    amount: Number(r?.amount ?? r?.totalAmount ?? 0),
                    status: r?.status ?? 'Pending',
                    carrier: r?.carrier ?? '',
                    transitTime: r?.transitTime ?? '',
                    rejectionReason: r?.rejectionReason ?? undefined,
                }));
                if (!cancelled) setQuotes(mapped);
            } catch (err) {
                if (!cancelled) {
                    setLoadError(err instanceof Error ? err.message : 'Failed to load freight quotes');
                    setQuotes([]);
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

    const quoteStats = {
        total: quotes.length,
        pending: quotes.filter(q => q.status === 'Pending').length,
        approved: quotes.filter(q => q.status === 'Approved').length,
        rejected: quotes.filter(q => q.status === 'Rejected').length,
        totalValue: quotes.reduce((sum, q) => sum + q.amount, 0),
        avgResponseTime: '—',
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Pending': return 'bg-yellow-50 text-yellow-600 border-yellow-200';
            case 'Approved': return 'bg-green-50 text-green-600 border-green-200';
            case 'Rejected': return 'bg-red-50 text-red-600 border-red-200';
            case 'Expired': return 'bg-gray-50 text-gray-600 border-gray-200';
            default: return 'bg-gray-50 text-gray-600 border-gray-200';
        }
    };

    const getModeIcon = (mode: string) => {
        switch (mode) {
            case 'Road': return <Truck className="w-4 h-4" />;
            case 'Air': return <Send className="w-4 h-4" />;
            case 'Sea': return <Package className="w-4 h-4" />;
            default: return <Package className="w-4 h-4" />;
        }
    };

    const filteredQuotes = quotes.filter(quote => {
        if (filter === 'all') return true;
        if (filter === 'pending') return quote.status === 'Pending';
        if (filter === 'approved') return quote.status === 'Approved';
        if (filter === 'rejected') return quote.status === 'Rejected';
        return true;
    });

    return (
        <div className="p-6 space-y-3 text-sm font-medium">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <FileText className="h-8 w-8 text-orange-600" />
                        Freight Quotes
                    </h1>
                    <p className="text-gray-500 mt-1 uppercase text-[10px] font-black tracking-widest leading-none">
                        Request and manage freight quotations
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => exportToCsv('freight-quotes', filteredQuotes)} className="px-4 py-2 border border-gray-200 bg-white text-gray-600 rounded-lg font-black uppercase text-[10px] tracking-widest hover:bg-gray-50 transition-colors flex items-center gap-2">
                        <Download className="w-4 h-4" /> Export
                    </button>
                    <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2 shadow-md font-black uppercase text-[10px] tracking-widest">
                        <Plus className="w-4 h-4" /> Request Quote
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
                <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Quotes</p>
                            <p className="text-2xl font-black text-gray-900 mt-1 italic tracking-tighter">{quoteStats.total}</p>
                        </div>
                        <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
                            <FileText className="w-4 h-4" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-yellow-100 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-black text-yellow-600 uppercase tracking-widest">Pending</p>
                            <p className="text-2xl font-black text-yellow-600 mt-1 italic tracking-tighter">{quoteStats.pending}</p>
                        </div>
                        <div className="p-2 bg-yellow-50 rounded-lg text-yellow-600">
                            <Clock className="w-4 h-4" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-green-100 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-black text-green-600 uppercase tracking-widest">Approved</p>
                            <p className="text-2xl font-black text-green-600 mt-1 italic tracking-tighter">{quoteStats.approved}</p>
                        </div>
                        <div className="p-2 bg-green-50 rounded-lg text-green-600">
                            <CheckCircle2 className="w-4 h-4" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-red-100 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">Rejected</p>
                            <p className="text-2xl font-black text-red-600 mt-1 italic tracking-tighter">{quoteStats.rejected}</p>
                        </div>
                        <div className="p-2 bg-red-50 rounded-lg text-red-600">
                            <XCircle className="w-4 h-4" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-blue-100 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Avg Response</p>
                            <p className="text-2xl font-black text-blue-600 mt-1 italic tracking-tighter">{quoteStats.avgResponseTime}</p>
                        </div>
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                            <TrendingUp className="w-4 h-4" />
                        </div>
                    </div>
                </div>

                <div className="bg-gray-900 p-3 rounded-xl text-white shadow-xl">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Total Value</p>
                            <p className="text-xl font-black text-white mt-1 italic tracking-tighter">
                                ${(quoteStats.totalValue / 1000000).toFixed(2)}M
                            </p>
                        </div>
                        <div className="p-2 bg-gray-800 rounded-lg text-green-500">
                            <DollarSign className="w-4 h-4" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                        {['all', 'pending', 'approved', 'rejected'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors ${filter === f
                                        ? 'bg-orange-600 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search quotes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-xs"
                        />
                    </div>
                </div>
            </div>

            {/* Quotes Table */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-[10px] uppercase font-black text-gray-400 border-b border-gray-100">
                            <tr>
                                <th className="px-3 py-2">Quote ID</th>
                                <th className="px-3 py-2">Customer</th>
                                <th className="px-3 py-2">Route</th>
                                <th className="px-3 py-2 text-center">Mode</th>
                                <th className="px-3 py-2 text-center">Weight</th>
                                <th className="px-3 py-2 text-center">Amount</th>
                                <th className="px-3 py-2 text-center">Valid Until</th>
                                <th className="px-3 py-2 text-center">Status</th>
                                <th className="px-3 py-2 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredQuotes.map((quote) => (
                                <tr key={quote.id} className="hover:bg-gray-50 transition-colors group cursor-pointer">
                                    <td className="px-3 py-2">
                                        <span className="font-black text-gray-900 group-hover:text-orange-600 transition-colors">
                                            {quote.id}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2">
                                        <div>
                                            <span className="font-bold text-gray-900">{quote.customer}</span>
                                            <p className="text-[10px] text-gray-400">{quote.carrier}</p>
                                        </div>
                                    </td>
                                    <td className="px-3 py-2">
                                        <div className="text-[10px]">
                                            <p className="text-gray-600 font-bold flex items-center gap-1">
                                                <MapPin className="w-3 h-3" /> {quote.origin}
                                            </p>
                                            <p className="text-gray-400 flex items-center gap-1 mt-0.5">
                                                <ChevronRight className="w-3 h-3" /> {quote.destination}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-3 py-2 text-center">
                                        <div className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-gray-600">
                                            {getModeIcon(quote.mode)}
                                            <span className="text-[10px] font-bold">{quote.mode}</span>
                                        </div>
                                    </td>
                                    <td className="px-3 py-2 text-center text-gray-600 font-bold text-[11px]">
                                        {quote.weight}
                                    </td>
                                    <td className="px-3 py-2 text-center">
                                        <span className="font-black text-gray-900">${quote.amount.toLocaleString()}</span>
                                        <p className="text-[9px] text-gray-400">{quote.transitTime}</p>
                                    </td>
                                    <td className="px-3 py-2 text-center text-[10px] text-gray-600">
                                        {quote.validUntil}
                                    </td>
                                    <td className="px-3 py-2 text-center">
                                        <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase border ${getStatusColor(quote.status)}`}>
                                            {quote.status}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2 text-right">
                                        <div className="flex items-center gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-1.5 bg-gray-100 rounded-lg text-gray-500 hover:bg-gray-200 transition-colors">
                                                <Eye className="w-3 h-3" />
                                            </button>
                                            <button className="p-1.5 bg-blue-100 rounded-lg text-blue-600 hover:bg-blue-200 transition-colors">
                                                <Edit className="w-3 h-3" />
                                            </button>
                                            {quote.status === 'Pending' && (
                                                <button className="p-1.5 bg-green-100 rounded-lg text-green-600 hover:bg-green-200 transition-colors">
                                                    <CheckCircle2 className="w-3 h-3" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="bg-yellow-50 p-3 rounded-xl border border-yellow-100 flex items-start gap-2">
                    <div className="p-2 bg-yellow-100 rounded-lg text-yellow-600">
                        <Clock className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="text-xs font-black text-yellow-800 uppercase tracking-widest mb-1">Pending Review</h4>
                        <p className="text-[11px] text-yellow-700">
                            12 quotes awaiting customer approval. Follow up on quotes older than 3 days.
                        </p>
                        <button className="mt-2 text-[10px] font-black text-yellow-800 uppercase tracking-widest flex items-center gap-1 hover:text-yellow-900">
                            Review Pending <ChevronRight className="w-3 h-3" />
                        </button>
                    </div>
                </div>

                <div className="bg-orange-50 p-3 rounded-xl border border-orange-100 flex items-start gap-2">
                    <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                        <AlertCircle className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="text-xs font-black text-orange-800 uppercase tracking-widest mb-1">Expiring Soon</h4>
                        <p className="text-[11px] text-orange-700">
                            3 quotes will expire in the next 7 days. Contact customers to confirm or extend.
                        </p>
                        <button className="mt-2 text-[10px] font-black text-orange-800 uppercase tracking-widest flex items-center gap-1 hover:text-orange-900">
                            View Expiring <ChevronRight className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
