'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { fetchDomainList } from '@/services/reports-data.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    ArrowLeft,
    Download,
    Search,
    Filter,
    ChevronRight,
    PieChart,
    TrendingUp,
    Zap,
    Globe,
    Linkedin,
    Mail,
    Users
} from 'lucide-react';

function LeadsBySourceContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const source = searchParams.get('source') || 'All Sources';

    const [leads, setLeads] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                const raw = await fetchDomainList<any>('crm/leads');
                const mapped = raw.map((r: any) => ({
                    id: r.leadNumber ?? r.id,
                    name: r.contactName ?? r.name ?? '',
                    company: r.companyName ?? '',
                    source: r.source ?? r.leadSource ?? '',
                    status: r.status ?? '',
                    value: Number(r.estimatedValue ?? r.value ?? 0),
                    date: r.createdAt ?? r.date ?? '',
                }));
                if (!cancelled) setLeads(mapped);
            } catch (e) {
                if (!cancelled) {
                    setLoadError(e instanceof Error ? e.message : 'Failed to load');
                    setLeads([]);
                }
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    const filteredLeads = source === 'All Sources' ? leads : leads.filter(l => l.source === source);

    const getSourceIcon = (src: string) => {
        switch (src.toLowerCase()) {
            case 'linkedin': return <Linkedin className="w-4 h-4 text-blue-600" />;
            case 'website': return <Globe className="w-4 h-4 text-indigo-600" />;
            case 'referral': return <Users className="w-4 h-4 text-orange-600" />;
            case 'outbound': return <Mail className="w-4 h-4 text-purple-600" />;
            default: return <PieChart className="w-4 h-4 text-gray-600" />;
        }
    };

    return (
        <div className="h-[calc(100vh-64px)] flex flex-col overflow-hidden bg-gray-50">
            {/* Header */}
            <div className="px-3 py-2 bg-white border-b border-gray-200 flex-shrink-0 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => router.back()}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-500 group-hover:text-orange-600" />
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg text-white">
                                {getSourceIcon(source)}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 leading-none">Source Analysis: {source}</h1>
                                <p className="text-gray-500 uppercase text-[10px] font-black tracking-widest mt-1">
                                    Lead attribution and performance metrics for this channel
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" className="font-black uppercase text-[10px] tracking-widest border-gray-200">
                            Change Source
                        </Button>
                        <Button className="bg-orange-600 hover:bg-orange-700 text-white shadow-md font-black uppercase text-[10px] tracking-widest">
                            <Download className="mr-2 h-4 w-4" /> Export Leads
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {isLoading && <div className="mb-3 rounded border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">Loading…</div>}
                {loadError && !isLoading && <div className="mb-3 rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{loadError}</div>}
                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <Card className="bg-white border-gray-100 shadow-sm">
                        <CardContent className="p-6">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Leads Gathered</p>
                            <p className="text-3xl font-black text-gray-900 mt-1 italic tracking-tighter">{filteredLeads.length}</p>
                            <div className="mt-3 flex items-center gap-2 text-[10px] font-bold text-green-600">
                                <TrendingUp className="w-3 h-3" />
                                <span>Above avg for {source}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white border-gray-100 shadow-sm">
                        <CardContent className="p-6">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pipeline Value</p>
                            <p className="text-3xl font-black text-gray-900 mt-1 italic tracking-tighter">
                                ${filteredLeads.reduce((sum, l) => sum + l.value, 0).toLocaleString()}
                            </p>
                            <p className="mt-3 text-[10px] font-bold text-blue-600 uppercase">Estimated Revenue</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-white border-gray-100 shadow-sm">
                        <CardContent className="p-6">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Avg Value</p>
                            <p className="text-3xl font-black text-gray-900 mt-1 italic tracking-tighter">
                                ${Math.round(filteredLeads.reduce((sum, l) => sum + l.value, 0) / filteredLeads.length).toLocaleString()}
                            </p>
                            <p className="mt-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Per lead unit</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gray-900 text-white shadow-xl border-none">
                        <CardContent className="p-6">
                            <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest">Conv. Strategy</p>
                            <p className="text-2xl font-black italic tracking-tighter mt-1">Aggressive</p>
                            <div className="mt-3 flex items-center gap-2 text-[10px] font-bold text-orange-400">
                                <Zap className="w-3 h-3" />
                                <span>High intent channel</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Leads Table */}
                <Card className="border-gray-100 shadow-sm overflow-hidden">
                    <CardHeader className="bg-white border-b border-gray-100 py-4 flex flex-row items-center justify-between">
                        <div className="flex items-center gap-2">
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-gray-900">Pipeline Inflow</CardTitle>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Filter list..."
                                    className="pl-8 pr-4 py-1.5 border border-gray-100 rounded-lg text-[10px] focus:ring-1 focus:ring-orange-500 w-48"
                                />
                            </div>
                        </div>
                        <Button variant="ghost" size="sm" className="font-black uppercase text-[9px] tracking-widest text-gray-500">
                            <Filter className="w-3 h-3 mr-2" /> Extended Filters
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50/50">
                                    <tr>
                                        <th className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-gray-400">Principal Identity</th>
                                        <th className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-gray-400">Organization</th>
                                        <th className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-gray-400">Inbound Date</th>
                                        <th className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-gray-400">Value Opportunity</th>
                                        <th className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Lifecycle Status</th>
                                        <th className="px-3 py-2 text-right"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {filteredLeads.map((lead) => (
                                        <tr
                                            key={lead.id}
                                            className="hover:bg-gray-50/50 transition-colors cursor-pointer group"
                                            onClick={() => router.push(`/crm/leads/view/${lead.id}`)}
                                        >
                                            <td className="px-3 py-2">
                                                <p className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{lead.name}</p>
                                                <p className="text-[10px] text-gray-400 font-medium tracking-tight">{lead.id}</p>
                                            </td>
                                            <td className="px-3 py-2">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="border-gray-100 text-[10px] font-bold px-2 py-0">{lead.company}</Badge>
                                                </div>
                                            </td>
                                            <td className="px-3 py-2 text-xs font-bold text-gray-500">{lead.date}</td>
                                            <td className="px-3 py-2">
                                                <p className="text-sm font-black text-gray-900 italic tracking-tight">${lead.value.toLocaleString()}</p>
                                            </td>
                                            <td className="px-3 py-2">
                                                <div className="flex justify-center">
                                                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${lead.status === 'Qualified'
                                                            ? 'bg-green-50 text-green-700 border-green-100'
                                                            : lead.status === 'New'
                                                                ? 'bg-blue-50 text-blue-700 border-blue-100'
                                                                : 'bg-orange-50 text-orange-700 border-orange-100'
                                                        }`}>
                                                        {lead.status}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-3 py-2 text-right">
                                                <button className="p-2 opacity-0 group-hover:opacity-100 bg-white shadow-sm border border-gray-100 rounded-lg transition-all translate-x-2 group-hover:translate-x-0">
                                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default function LeadsBySourceDetail() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-gray-500 font-black uppercase tracking-widest">Loading Report Structure...</div>}>
            <LeadsBySourceContent />
        </Suspense>
    );
}

